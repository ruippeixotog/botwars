import React from "react";
import PropTypes from "prop-types";
import { Link } from "react-router";
import { Row, Col, Button, Table } from "react-bootstrap";
import { FormGroup, InputGroup, ControlLabel, Radio, FormControl } from "react-bootstrap";

import CompsActions from "../actions/CompsActions";
import CompsEvents from "../events/CompsEvents";
import CompsStore from "../stores/CompsStore";
import GamesStore from "../stores/GamesStore";

import GameStatusLabel from "./GameStatusLabel";
import Paths from "../utils/RouterPaths";

const JoinModes = Object.freeze({
  WATCH: "WATCH",
  REGISTER_AND_PLAY: "REGISTER_AND_PLAY",
  PLAY: "PLAY"
});

let CompInfo = React.createClass({
  contextTypes: {
    router: PropTypes.object.isRequired
  },

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
    return {
      compInfo: compStore.getInfo(),
      compGames: [],
      joinMode: compStore.getLastToken() ? JoinModes.PLAY : JoinModes.WATCH,
      registering: false,
      lastPlayerToken: compStore.getLastToken()
    };
  },

  componentWillMount: function () {
    CompsStore.on(CompsEvents.COMP_INFO, this.onCompInfoUpdate);
    CompsStore.on(CompsEvents.COMP_INFO_ERROR, this.onCompInfoError);
    CompsStore.on(CompsEvents.COMP_GAMES, this.onCompGamesUpdate);
    CompsStore.on(CompsEvents.COMP_GAMES_ERROR, this.onCompGamesError);
    this.retrieveCompInfo();
  },

  componentWillUnmount: function () {
    clearInterval(this._compPollTimeout);
    CompsStore.removeListener(CompsEvents.COMP_INFO, this.onCompInfoUpdate);
    CompsStore.removeListener(CompsEvents.COMP_INFO_ERROR, this.onCompInfoError);
    CompsStore.removeListener(CompsEvents.COMP_GAMES, this.onCompGamesUpdate);
    CompsStore.removeListener(CompsEvents.COMP_GAMES_ERROR, this.onCompGamesError);
    this.removeRegisterListeners();
  },

  onCompInfoUpdate: function (gameHref, compId) {
    if (this.isThisGame(gameHref, compId)) {
      this.setState({ compInfo: CompsStore.getComp(gameHref, compId).getInfo() });
    }
  },

  onCompInfoError: function (gameHref, gameId) {
    if (this.isThisGame(gameHref, gameId)) {
      // TODO handle error
    }
  },

  onCompGamesUpdate: function (gameHref, compId) {
    if (this.isThisGame(gameHref, compId)) {
      let compGameIds = CompsStore.getComp(gameHref, compId).getGames();
      let compGames = compGameIds.map(gameId => {
        let gameStore = GamesStore.getGame(this.getGame().href, gameId);
        return gameStore.getInfo();
      });

      this.setState({ compGames });
    }
  },

  onCompGamesError: function (gameHref, gameId) {
    if (this.isThisGame(gameHref, gameId)) {
      // TODO handle error
    }
  },

  retrieveCompInfo: function () {
    CompsActions.retrieveCompInfo(this.getGame().href, this.getCompId());
    CompsActions.retrieveCompGames(this.getGame().href, this.getCompId());
    this._compPollTimeout = setTimeout(this.retrieveCompInfo, 5000);
  },

  onRegisterSuccess: function (gameHref, compId, playerToken) {
    let game = this.props.route.game;
    let pageCompId = this.props.params.compId;

    if (gameHref === game.href && compId === pageCompId) {
      let { compInfo, compGames } = this.state;
      // TODO a game may not exist yet and it must be handled properly
      let gameId = compInfo.currentGame || compGames[compGames.length - 1];

      this.context.router.push(Paths.gameStream(gameHref, gameId, { compId, playerToken }));
      this.removeRegisterListeners();
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
    let { compInfo, compGames } = this.state;
    let gameId = compInfo.currentGame || compGames[compGames.length - 1];

    switch (this.state.joinMode) {
      case JoinModes.WATCH: {
        this.context.router.push(Paths.gameStream(game.href, gameId, { compId }));
        break;
      }
      case JoinModes.REGISTER_AND_PLAY: {
        CompsActions.register(game.href, compId);
        CompsStore.on(CompsEvents.REGISTER_SUCCESS, this.onRegisterSuccess);
        CompsStore.on(CompsEvents.REGISTER_ERROR, this.onRegisterError);
        this.setState({ registering: true });
        break;
      }
      case JoinModes.PLAY: {
        let playerToken = this.refs.playerToken.getValue();
        this.context.router.push(Paths.gameStream(game.href, gameId, { compId, playerToken }));
        break;
      }
    }
  },

  render: function () {
    let { game, compTypes } = this.props.route;
    let { joinMode, registering, compInfo, compGames } = this.state;
    let isGameFull = compInfo.registeredPlayers === compInfo.players;

    let setJoinMode = joinMode => () => { this.setState({ joinMode }); };

    let title = compInfo.name || "Competition #" + compInfo.compId;

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
          <Link to={Paths.gameInfo(game.href, compInfo.currentGame)}>{compInfo.currentGame}</Link>;
    }

    let CompComponent = compTypes[compInfo.type];
    let compCol = CompComponent ?
        <Col lg={9}><CompComponent gameHref={game.href} info={compInfo} games={compGames} /></Col> :
        <Col lg={0} />;

    return (
        <div>
          <Row>
            <Col lg={12}>
              <h3>{title}</h3>
            </Col>
          </Row>
          <Row>
            {compCol}
            <Col lg={CompComponent ? 3 : 12}>
              <Table>
                <tbody>
                <tr>
                  <th>Competition ID</th>
                  <td>{compInfo.compId}</td>
                </tr>
                <tr>
                  <th>Name</th>
                  <td>{compInfo.name || "N/A"}</td>
                </tr>
                <tr>
                  <th>Type</th>
                  <td>{compInfo.type}</td>
                </tr>
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
            </Col>
          </Row>
          <Row>
            <Col lg={12}>
              <form onSubmit={this.handleCompFormSubmit}>
                <FormGroup>
                  <InputGroup>
                    <ControlLabel>I want to:</ControlLabel>
                    <Radio disabled={registering}
                           checked={joinMode === JoinModes.WATCH}
                           onChange={setJoinMode(JoinModes.WATCH)}>
                      watch the game as a spectator
                    </Radio>

                    <Radio disabled={registering || isGameFull}
                           checked={joinMode === JoinModes.REGISTER_AND_PLAY}
                           onChange={setJoinMode(JoinModes.REGISTER_AND_PLAY)}>
                      enter the competition as a new player
                    </Radio>

                    <Radio disabled={registering}
                           checked={joinMode === JoinModes.PLAY}
                           onChange={setJoinMode(JoinModes.PLAY)}>
                      play the competition as the player with token
                      <FormControl type="text"
                                   ref="playerToken"
                                   bsSize="small"
                                   className="player-token-form-group"
                                   disabled={registering || joinMode !== JoinModes.PLAY}
                                   placeholder="playerToken"
                                   defaultValue={this.state.lastPlayerToken} />
                    </Radio>
                  </InputGroup>
                </FormGroup>

                <Button type="submit">Start!</Button>
              </form>
            </Col>
          </Row>
        </div>
    );
  }
});

export default CompInfo;
