import React from "react";
import { History } from "react-router";
import { Row, Col, Pagination } from "react-bootstrap";

import GameStatus from "../constants/GameStatus";
import ConnStatus from "../constants/ConnStatus";
import GamesActions from "../actions/GamesActions";
import GamesStore from "../stores/GamesStore";
import GamesEvents from "../events/GamesEvents";

import GameStatusLabel from "./GameStatusLabel";

let GameStream = React.createClass({
  mixins: [History],

  getGameId: function () {
    return this.props.params.gameId;
  },

  getGame: function () {
    return this.props.route.game;
  },

  getPlayerToken: function () {
    return this.props.location.query.playerToken;
  },

  isThisGame: function (gameHref, gameId) {
    return gameHref === this.getGame().href && gameId === this.getGameId();
  },

  getInitialState: function () {
    return {
      connStatus: ConnStatus.NOT_CONNECTED,
      gameStatus: GameStatus.NOT_STARTED,
      player: null,
      gameState: null,
      gameStateCount: 0,
      gameStateIndex: null,
      followCurrentState: true
    };
  },

  componentWillMount: function () {
    GamesStore.on(GamesEvents.CONNECTION_OPENED, this.onConnectionOpened);
    GamesStore.on(GamesEvents.CONNECTION_CLOSED, this.onConnectionClosed);
    GamesStore.on(GamesEvents.CONNECTION_ERROR, this.onConnectionError);
    GamesStore.on(GamesEvents.INFO, this.onGameInfoReceived);
    GamesStore.on(GamesEvents.NEW_STATE, this.onNewGameState);
  },

  componentDidMount: function () {
    GamesActions.requestGameStream(this.getGame().href, this.getGameId(), this.getPlayerToken());
  },

  componentWillReceiveProps: function (nextProps) {
    if (!this.isThisGame(nextProps.route.game.href, nextProps.params.gameId)) {
      clearInterval(this._connRetryTimeout);
      GamesActions.closeGameStream(this.getGame().href, this.getGameId());
      GamesActions.requestGameStream(nextProps.route.game.href, nextProps.params.gameId);
      this.setState(this.getInitialState());
    }
  },

  componentWillUnmount: function () {
    clearInterval(this._connRetryTimeout);
    GamesStore.removeListener(GamesEvents.CONNECTION_OPENED, this.onConnectionOpened);
    GamesStore.removeListener(GamesEvents.CONNECTION_CLOSED, this.onConnectionClosed);
    GamesStore.removeListener(GamesEvents.CONNECTION_ERROR, this.onConnectionError);
    GamesStore.removeListener(GamesEvents.INFO, this.onGameInfoReceived);
    GamesStore.removeListener(GamesEvents.NEW_STATE, this.onNewGameState);
    GamesActions.closeGameStream(this.getGame().href, this.getGameId());
  },

  onConnectionOpened: function (gameHref, gameId) {
    if (this.isThisGame(gameHref, gameId)) {
      this.setState({ connStatus: ConnStatus.CONNECTED });
    }
  },

  onConnectionClosed: function (gameHref, gameId) {
    if (this.isThisGame(gameHref, gameId)) {
      this.setState({ connStatus: ConnStatus.FINISHED });
    }
  },

  onConnectionError: function (gameHref, gameId) {
    if (this.isThisGame(gameHref, gameId)) {
      if (this.state.connStatus === ConnStatus.CONNECTED) {
        this.setState({ connStatus: ConnStatus.CONNECTION_DOWN });
      }
      this._connRetryTimeout = setTimeout(this.retryConnection, 3000);
    }
  },

  retryConnection: function () {
    GamesActions.requestGameStream(this.getGame().href, this.getGameId(), this.getPlayerToken());
  },

  onGameInfoReceived: function (gameHref, gameId) {
    if (this.isThisGame(gameHref, gameId)) {
      let gameStore = GamesStore.getGame(gameHref, gameId);
      this.setState({ player: gameStore.getPlayer() });
    }
  },

  onNewGameState: function (gameHref, gameId) {
    if (this.isThisGame(gameHref, gameId)) {
      let gameStore = GamesStore.getGame(gameHref, gameId);
      let newStateCount = gameStore.getStateCount();

      if (this.state.followCurrentState) {
        this.setState({
          gameStatus: gameStore.getStatus(),
          gameState: gameStore.getCurrentState(),
          gameStateCount: newStateCount,
          gameStateIndex: newStateCount - 1
        });
      } else {
        this.setState({ gameStateCount: newStateCount });
      }
    }
  },

  handleMove: function (move) {
    GamesActions.sendMove(this.getGame().href, this.getGameId(), move);
  },

  handleGameStateSelect: function (e, { eventKey }) {
    e.preventDefault();
    if (eventKey !== this.state.gameStateIndex + 1) {
      let gameStore = GamesStore.getGame(this.getGame().href, this.getGameId());

      this.setState({
        gameState: gameStore.getState(eventKey - 1),
        gameStateIndex: eventKey - 1,
        followCurrentState: eventKey === this.state.gameStateCount
      });
    }
  },

  render: function () {
    let gameId = this.getGameId();
    let game = this.getGame();
    let GameComponent = game.component;

    let { connStatus, gameStatus } = this.state;
    let isLastState = this.state.gameStateIndex === this.state.gameStateCount - 1;

    return (
        <div className="flex">
          <Row className="game-stream">
            <Col md={9}>
              <Pagination className="game-state-nav" maxButtons={5} next={true} prev={true}
                          ellipsis={false} items={this.state.gameStateCount}
                          activePage={this.state.gameStateIndex + 1}
                          onSelect={this.handleGameStateSelect} />
            </Col>
            <Col md={3} className="game-status-col">
              <GameStatusLabel status={gameStatus} connStatus={connStatus} />
            </Col>
          </Row>
          <GameComponent gameId={gameId} player={this.state.player} onMove={this.handleMove}
                         gameState={this.state.gameState} isLastState={isLastState} />
        </div>
    );
  }
});

export default GameStream;
