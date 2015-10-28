import React from "react";
import { History } from "react-router";
import { Row, Col, Input, Button, Table } from "react-bootstrap";

import GamesActions from "../actions/GamesActions";
import GamesInfoStore from "../stores/GamesInfoStore";
import GamesStore from "../stores/GamesStore";
import GamesEvents from "../events/GamesEvents";

import GameStatusLabel from "./GameStatusLabel";

const JoinModes = Object.freeze({
  WATCH: "WATCH",
  REGISTER_AND_PLAY: "REGISTER_AND_PLAY",
  PLAY: "PLAY"
});

var GameInfo = React.createClass({
  mixins: [History],

  getGameId: function () {
    return this.props.params.gameId;
  },

  getGame: function () {
    return this.props.route.game;
  },

  isThisGame: function (gameHref, gameId) {
    return gameHref === this.getGame().href && gameId === this.getGameId();
  },

  getInitialState: function () {
    return {
      gameInfo: {},
      joinMode: JoinModes.WATCH,
      registering: false
    };
  },

  componentWillMount: function () {
    GamesInfoStore.on(GamesEvents.GAME_INFO, this.onNewGameInfo);
    GamesInfoStore.on(GamesEvents.GAME_INFO_ERROR, this.onGameInfoError);
    this.retrieveGameInfo();
  },

  componentWillUnmount: function () {
    clearInterval(this._gamePollTimeout);
    GamesInfoStore.removeListener(GamesEvents.GAME_INFO, this.onNewGameInfo);
    GamesInfoStore.removeListener(GamesEvents.GAME_INFO_ERROR, this.onGameInfoError);
    this.removeRegisterListeners();
  },

  onNewGameInfo: function (gameHref, gameId) {
    if (this.isThisGame(gameHref, gameId)) {
      this.setState({ gameInfo: GamesInfoStore.getGame(gameHref, gameId) });
    }
  },

  onGameInfoError: function (gameHref, gameId) {
    if (this.isThisGame(gameHref, gameId)) {
      // TODO handle error
    }
  },

  retrieveGameInfo: function () {
    GamesActions.retrieveGameInfo(this.getGame().href, this.getGameId());
    this._gamePollTimeout = setTimeout(this.retrieveGameInfo, 5000);
  },

  onRegisterSuccess: function (gameHref, gameId, playerToken) {
    var game = this.props.route.game;
    var pageGameId = this.props.params.gameId;

    if (gameHref === game.href && gameId === pageGameId) {
      let queryStr = `playerToken=${playerToken}`;
      this.history.pushState(null, `${gameHref}/${gameId}/stream?${queryStr}`);
    }
  },

  onRegisterError: function (gameHref, gameId) {
    var game = this.props.route.game;
    var pageGameId = this.props.params.gameId;

    if (gameHref === game.href && gameId === pageGameId) {
      this.setState({ registering: false });
      this.removeRegisterListeners();
    }
  },

  removeRegisterListeners: function () {
    GamesStore.removeListener(GamesEvents.REGISTER_SUCCESS, this.onRegisterSuccess);
    GamesStore.removeListener(GamesEvents.REGISTER_ERROR, this.onRegisterError);
  },

  handleGameIdSubmit: function (e) {
    e.preventDefault();
    var game = this.props.route.game;
    var gameId = this.props.params.gameId;

    switch (this.state.joinMode) {
      case JoinModes.WATCH:
        this.history.pushState(null, `${game.href}/${gameId}/stream`);
        break;

      case JoinModes.REGISTER_AND_PLAY:
        GamesActions.register(game.href, gameId);
        GamesStore.on(GamesEvents.REGISTER_SUCCESS, this.onRegisterSuccess);
        GamesStore.on(GamesEvents.REGISTER_ERROR, this.onRegisterError);
        this.setState({ registering: true });
        break;

      case JoinModes.PLAY:
        let queryStr = `playerToken=${this.refs.playerToken.getValue()}`;
        this.history.pushState(null, `${game.href}/${gameId}/stream?${queryStr}`);
        break;
    }
  },

  render: function () {
    var { joinMode, registering, gameInfo } = this.state;
    var isGameFull = gameInfo.connectedPlayers === gameInfo.players;

    var setJoinMode = joinMode => () => { this.setState({ joinMode }); };

    return (
        <Row>
          <Col lg={6}>
            <h4>Game {gameInfo.gameId}</h4>

            <Table>
              <tbody>
                <tr>
                  <th>Players</th>
                  <td>{gameInfo.connectedPlayers}/{gameInfo.players}</td>
                </tr>
                <tr>
                  <th>Status</th>
                  <td><GameStatusLabel status={gameInfo.status} /></td>
                </tr>
                <tr>
                  <th>Parameters</th>
                  <td>
                    <pre>
                      {JSON.stringify(gameInfo.params, null, 2)}
                    </pre>
                  </td>
                </tr>
              </tbody>
            </Table>

            <form onSubmit={this.handleGameIdSubmit}>
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
                             placeholder="playerToken" />
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

export default GameInfo;
