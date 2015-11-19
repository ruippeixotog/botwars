import React from "react";
import { History, Link } from "react-router";
import { Row, Col, Input, Button, Table } from "react-bootstrap";

import CompsActions from "../actions/CompsActions";
import CompsInfoStore from "../stores/CompsInfoStore";
import CompsStore from "../stores/CompsStore";
import CompsEvents from "../events/CompsEvents";

import GameStatusLabel from "./GameStatusLabel";

const JoinModes = Object.freeze({
  WATCH: "WATCH",
  REGISTER_AND_PLAY: "REGISTER_AND_PLAY",
  PLAY: "PLAY"
});

let CompInfo = React.createClass({
  mixins: [History],

  getCompId: function () {
    return this.props.params.compId;
  },

  getGame: function () {
    return this.props.route.game;
  },

  isThisGame: function (gameHref, compId) {
    return gameHref === this.getGame().href && compId === this.getCompId();
  },

  getInitialState: function () {
    let compStore = CompsStore.getComp(this.getGame().href, this.getCompId());
    let lastPlayerToken = compStore.getLastToken();

    return {
      compInfo: {},
      joinMode: lastPlayerToken ? JoinModes.PLAY : JoinModes.WATCH,
      registering: false,
      lastPlayerToken: lastPlayerToken
    };
  },

  componentWillMount: function () {
    CompsInfoStore.on(CompsEvents.COMP_INFO, this.onNewCompInfo);
    CompsInfoStore.on(CompsEvents.COMP_INFO_ERROR, this.onCompInfoError);
    this.retrieveCompInfo();
  },

  componentWillUnmount: function () {
    clearInterval(this._compPollTimeout);
    CompsInfoStore.removeListener(CompsEvents.COMP_INFO, this.onNewCompInfo);
    CompsInfoStore.removeListener(CompsEvents.COMP_INFO_ERROR, this.onCompInfoError);
    this.removeRegisterListeners();
  },

  onNewCompInfo: function (gameHref, compId) {
    if (this.isThisGame(gameHref, compId)) {
      this.setState({ compInfo: CompsInfoStore.getComp(gameHref, compId) });
    }
  },

  onCompInfoError: function (gameHref, gameId) {
    if (this.isThisGame(gameHref, gameId)) {
      // TODO handle error
    }
  },

  retrieveCompInfo: function () {
    CompsActions.retrieveCompInfo(this.getGame().href, this.getCompId());
    this._compPollTimeout = setTimeout(this.retrieveCompInfo, 5000);
  },

  onRegisterSuccess: function (gameHref, compId, playerToken) {
    let game = this.props.route.game;
    let pageCompId = this.props.params.compId;

    if (gameHref === game.href && compId === pageCompId) {
      let queryStr = `playerToken=${playerToken}`;
      this.history.pushState(null, `${gameHref}/games/${compId}/stream?${queryStr}`);
    }
  },

  onRegisterError: function (gameHref, compId) {
    let game = this.props.route.game;
    let pageCompId = this.props.params.compId;

    if (gameHref === game.href && compId === pageCompId) {
      this.setState({ registering: false });
      this.removeRegisterListeners();
    }
  },

  removeRegisterListeners: function () {
    CompsStore.removeListener(CompsEvents.REGISTER_SUCCESS, this.onRegisterSuccess);
    CompsStore.removeListener(CompsEvents.REGISTER_ERROR, this.onRegisterError);
  },

  handleCompFormSubmit: function (e) {
    e.preventDefault();
    let game = this.props.route.game;
    let compId = this.props.params.compId;

    switch (this.state.joinMode) {
      case JoinModes.WATCH:
        this.history.pushState(null, `${game.href}/competitions/${compId}/stream`);
        break;

      case JoinModes.REGISTER_AND_PLAY:
        CompsActions.register(game.href, compId);
        CompsStore.on(CompsEvents.REGISTER_SUCCESS, this.onRegisterSuccess);
        CompsStore.on(CompsEvents.REGISTER_ERROR, this.onRegisterError);
        this.setState({ registering: true });
        break;

      case JoinModes.PLAY:
        let queryStr = `playerToken=${this.refs.playerToken.getValue()}`;
        this.history.pushState(null, `${game.href}/competitions/${compId}/stream?${queryStr}`);
        break;
    }
  },

  render: function () {
    let game = this.props.route.game;
    let { joinMode, registering, compInfo } = this.state;
    let isGameFull = compInfo.connectedPlayers === compInfo.players;

    let setJoinMode = joinMode => () => { this.setState({ joinMode }); };

    let winnerCell = "N/A";
    if (compInfo.winners) {
      switch (compInfo.winners.length) {
        case 0: winnerCell = "Draw"; break;
        case 1: winnerCell = `Player ${compInfo.winners[0]}`; break;
        default: winnerCell = `Players ${compInfo.winners.join(", ")}`;
      }
    }

    let currentGameCell = "N/A";
    if (compInfo.currentGame) {
      currentGameCell =
          <Link to={`${game.href}/games/${compInfo.currentGame}`}>{compInfo.currentGame}</Link>;
    }

    return (
        <Row>
          <Col lg={6}>
            <h4>Comp {compInfo.compId}</h4>

            <Table>
              <tbody>
                <tr>
                  <th>Players</th>
                  <td>{compInfo.registeredPlayers}/{compInfo.players}</td>
                </tr>
                <tr>
                  <th>Status</th>
                  <td><GameStatusLabel status={compInfo.status} /></td>
                </tr>
                <tr>
                  <th>Parameters</th>
                  <td>
                    <pre>
                      {JSON.stringify(compInfo.params, null, 2)}
                    </pre>
                  </td>
                </tr>
                <tr>
                  <th>Current game</th>
                  <td>{currentGameCell}</td>
                </tr>
                <tr>
                  <th>Winners</th>
                  <td>{winnerCell}</td>
                </tr>
              </tbody>
            </Table>

            <form onSubmit={this.handleCompFormSubmit}>
              <Input label="I want to:">
                <Input name="action" type="radio" label="watch the game as a spectator"
                       disabled={registering}
                       checked={joinMode === JoinModes.WATCH}
                       onChange={setJoinMode(JoinModes.WATCH)} />

                <Input name="action" type="radio" label="enter the game as a new player"
                       disabled={registering || isGameFull}
                       checked={joinMode === JoinModes.REGISTER_AND_PLAY}
                       onChange={setJoinMode(JoinModes.REGISTER_AND_PLAY)} />

                <Input>
                  <div className="radio">
                    <label>
                      <input name="action" type="radio"
                             label="play the game as the player with token"
                             disabled={registering}
                             checked={joinMode === JoinModes.PLAY}
                             onChange={setJoinMode(JoinModes.PLAY)} />
                      <span>play the game as the player with token</span>
                      <Input type="text" ref="playerToken" bsSize="small"
                             groupClassName="player-token-form-group"
                             disabled={registering || joinMode !== JoinModes.PLAY}
                             placeholder="playerToken"
                             defaultValue={this.state.lastPlayerToken} />
                    </label>
                  </div>
                </Input>
              </Input>

              <Button type="submit">Start!</Button>
            </form>
          </Col>
        </Row>
    );
  }
});

export default CompInfo;
