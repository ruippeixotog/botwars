import React from "react";
import PropTypes from "prop-types";
import { Row, Col, Button, Table } from "react-bootstrap";
import { FormGroup, InputGroup, ControlLabel, Radio, FormControl } from "react-bootstrap";

import GamesActions from "../actions/GamesActions";
import GamesEvents from "../events/GamesEvents";
import GamesStore from "../stores/GamesStore";

import GameStatusLabel from "./GameStatusLabel";
import Paths from "../utils/RouterPaths";

const JoinModes = Object.freeze({
  WATCH: "WATCH",
  REGISTER_AND_PLAY: "REGISTER_AND_PLAY",
  PLAY: "PLAY"
});

class GameInfo extends React.Component {
  static contextTypes = {
    router: PropTypes.object.isRequired
  };

  constructor(props, context) {
    super(props, context);
    let gameStore = GamesStore.getGame(this.getGame().href, this.getGameId());

    this.state = {
      gameInfo: gameStore.getInfo(),
      joinMode: gameStore.getLastToken() ? JoinModes.PLAY : JoinModes.WATCH,
      registering: false,
      lastPlayerToken: gameStore.getLastToken()
    };
  }

  getGameId = () => {
    return this.props.params.gameId;
  };

  getGame = () => {
    return this.props.route.game;
  };

  isThisGame = (gameHref, gameId) => {
    return gameHref === this.getGame().href && gameId === this.getGameId();
  };

  componentWillMount() {
    GamesStore.on(GamesEvents.GAME_INFO, this.onGameInfoUpdate);
    GamesStore.on(GamesEvents.GAME_INFO_ERROR, this.onGameInfoError);
    this.retrieveGameInfo();
  }

  componentWillUnmount() {
    clearInterval(this._gamePollTimeout);
    GamesStore.removeListener(GamesEvents.GAME_INFO, this.onGameInfoUpdate);
    GamesStore.removeListener(GamesEvents.GAME_INFO_ERROR, this.onGameInfoError);
    this.removeRegisterListeners();
  }

  onGameInfoUpdate = (gameHref, gameId) => {
    if (this.isThisGame(gameHref, gameId)) {
      this.setState({ gameInfo: GamesStore.getGame(gameHref, gameId).getInfo() });
    }
  };

  onGameInfoError = (gameHref, gameId) => {
    if (this.isThisGame(gameHref, gameId)) {
      // TODO handle error
    }
  };

  retrieveGameInfo = () => {
    GamesActions.retrieveGameInfo(this.getGame().href, this.getGameId());
    this._gamePollTimeout = setTimeout(this.retrieveGameInfo, 5000);
  };

  onRegisterSuccess = (gameHref, gameId, playerToken) => {
    let game = this.props.route.game;
    let pageGameId = this.props.params.gameId;

    if (gameHref === game.href && gameId === pageGameId) {
      this.context.router.push(Paths.gameStream(gameHref, gameId, { playerToken }));
      this.removeRegisterListeners();
    }
  };

  onRegisterError = (gameHref, gameId) => {
    let game = this.props.route.game;
    let pageGameId = this.props.params.gameId;

    if (gameHref === game.href && gameId === pageGameId) {
      this.setState({ registering: false });
      this.removeRegisterListeners();
    }
  };

  removeRegisterListeners = () => {
    GamesStore.removeListener(GamesEvents.REGISTER_SUCCESS, this.onRegisterSuccess);
    GamesStore.removeListener(GamesEvents.REGISTER_ERROR, this.onRegisterError);
  };

  handleGameFormSubmit = (e) => {
    e.preventDefault();
    let game = this.props.route.game;
    let gameId = this.props.params.gameId;

    switch (this.state.joinMode) {
      case JoinModes.WATCH: {
        this.context.router.push(Paths.gameStream(game.href, gameId));
        break;
      }
      case JoinModes.REGISTER_AND_PLAY: {
        GamesActions.register(game.href, gameId);
        GamesStore.on(GamesEvents.REGISTER_SUCCESS, this.onRegisterSuccess);
        GamesStore.on(GamesEvents.REGISTER_ERROR, this.onRegisterError);
        this.setState({ registering: true });
        break;
      }
      case JoinModes.PLAY: {
        let playerToken = this.playerTokenInput.getValue();
        this.context.router.push(Paths.gameStream(game.href, gameId, { playerToken }));
        break;
      }
    }
  };

  render() {
    let { joinMode, registering, gameInfo } = this.state;
    let isGameFull = gameInfo.registeredPlayers === gameInfo.players;

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
        <div>
          <Row>
            <Col lg={12}>
              <h3>{title}</h3>
            </Col>
          </Row>
          <Row>
            <Col lg={6}>
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
                    <td>{gameInfo.registeredPlayers}/{gameInfo.players}</td>
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
                      enter the game as a new player
                    </Radio>

                    <Radio disabled={registering}
                           checked={joinMode === JoinModes.PLAY}
                           onChange={setJoinMode(JoinModes.PLAY)}>
                      play the game as the player with token
                      <FormControl type="text"
                                   ref={elem => { this.playerTokenInput = elem; }}
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
}

export default GameInfo;
