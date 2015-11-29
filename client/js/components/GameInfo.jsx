import React from "react";
import { History } from "react-router";
import { Row, Col, Input, Button, Table } from "react-bootstrap";

import GamesActions from "../actions/GamesActions";
import GamesEvents from "../events/GamesEvents";
import GamesStore from "../stores/GamesStore";

import GameStatusLabel from "./GameStatusLabel";

const JoinModes = Object.freeze({
  WATCH: "WATCH",
  REGISTER_AND_PLAY: "REGISTER_AND_PLAY",
  PLAY: "PLAY"
});

let GameInfo = React.createClass({
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
    let gameStore = GamesStore.getGame(this.getGame().href, this.getGameId());
    return {
      gameInfo: gameStore.getInfo(),
      joinMode: gameStore.getLastToken() ? JoinModes.PLAY : JoinModes.WATCH,
      registering: false,
      lastPlayerToken: gameStore.getLastToken()
    };
  },

  componentWillMount: function () {
    GamesStore.on(GamesEvents.GAME_INFO, this.onGameInfoUpdate);
    GamesStore.on(GamesEvents.GAME_INFO_ERROR, this.onGameInfoError);
    this.retrieveGameInfo();
  },

  componentWillUnmount: function () {
    clearInterval(this._gamePollTimeout);
    GamesStore.removeListener(GamesEvents.GAME_INFO, this.onGameInfoUpdate);
    GamesStore.removeListener(GamesEvents.GAME_INFO_ERROR, this.onGameInfoError);
    this.removeRegisterListeners();
  },

  onGameInfoUpdate: function (gameHref, gameId) {
    if (this.isThisGame(gameHref, gameId)) {
      this.setState({ gameInfo: GamesStore.getGame(gameHref, gameId).getInfo() });
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
    let game = this.props.route.game;
    let pageGameId = this.props.params.gameId;

    if (gameHref === game.href && gameId === pageGameId) {
      let queryStr = `playerToken=${playerToken}`;
      this.history.pushState(null, `${gameHref}/games/${gameId}/stream?${queryStr}`);
    }
  },

  onRegisterError: function (gameHref, gameId) {
    let game = this.props.route.game;
    let pageGameId = this.props.params.gameId;

    if (gameHref === game.href && gameId === pageGameId) {
      this.setState({ registering: false });
      this.removeRegisterListeners();
    }
  },

  removeRegisterListeners: function () {
    GamesStore.removeListener(GamesEvents.REGISTER_SUCCESS, this.onRegisterSuccess);
    GamesStore.removeListener(GamesEvents.REGISTER_ERROR, this.onRegisterError);
  },

  handleGameFormSubmit: function (e) {
    e.preventDefault();
    let game = this.props.route.game;
    let gameId = this.props.params.gameId;

    switch (this.state.joinMode) {
      case JoinModes.WATCH:
        this.history.pushState(null, `${game.href}/games/${gameId}/stream`);
        break;

      case JoinModes.REGISTER_AND_PLAY:
        GamesActions.register(game.href, gameId);
        GamesStore.on(GamesEvents.REGISTER_SUCCESS, this.onRegisterSuccess);
        GamesStore.on(GamesEvents.REGISTER_ERROR, this.onRegisterError);
        this.setState({ registering: true });
        break;

      case JoinModes.PLAY:
        let queryStr = `playerToken=${this.refs.playerToken.getValue()}`;
        this.history.pushState(null, `${game.href}/games/${gameId}/stream?${queryStr}`);
        break;
    }
  },

  render: function () {
    let { joinMode, registering, gameInfo } = this.state;
    let isGameFull = gameInfo.connectedPlayers === gameInfo.players;

    let setJoinMode = joinMode => () => { this.setState({ joinMode }); };

    let title = gameInfo.name || "Game #" + gameInfo.gameId;

    let winnerCell = "N/A";
    if (gameInfo.winners) {
      switch (gameInfo.winners.length) {
        case 0: winnerCell = "Draw"; break;
        case 1: winnerCell = `Player ${gameInfo.winners[0]}`; break;
        default: winnerCell = `Players ${gameInfo.winners.join(", ")}`;
      }
    }

    return (
        <Row>
          <Col lg={6}>
            <h4>{title}</h4>

            <Table>
              <tbody>
                <tr>
                  <th>Game ID</th>
                  <td>{gameInfo.gameId}</td>
                </tr>
                <tr>
                  <th>Name</th>
                  <td>{gameInfo.name || "N/A"}</td>
                </tr>
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
                <tr>
                  <th>Next player</th>
                  <td>{gameInfo.nextPlayer || "N/A"}</td>
                </tr>
                <tr>
                  <th>Winners</th>
                  <td>{winnerCell}</td>
                </tr>
              </tbody>
            </Table>

            <form onSubmit={this.handleGameFormSubmit}>
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

export default GameInfo;
