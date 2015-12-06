import React from "react";
import { History } from "react-router";
import { Row, Col, Pagination, Pager, PageItem } from "react-bootstrap";

import GameStatus from "../constants/GameStatus";
import ConnStatus from "../constants/ConnStatus";
import GamesActions from "../actions/GamesActions";
import CompsActions from "../actions/CompsActions";
import GamesStore from "../stores/GamesStore";
import CompsStore from "../stores/CompsStore";
import GamesEvents from "../events/GamesEvents";
import CompsEvents from "../events/CompsEvents";

import GameStatusLabel from "./GameStatusLabel";
import Paths from "../utils/RouterPaths";

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

  getCompId: function () {
    return this.props.location.query.compId;
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
      followCurrentState: true,
      prevGameId: null,
      nextGameId: null
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
    this.retrieveCompGames();
  },

  componentWillReceiveProps: function (nextProps) {
    if (!this.isThisGame(nextProps.route.game.href, nextProps.params.gameId)) {
      clearInterval(this._connRetryTimeout);
      GamesActions.closeGameStream(this.getGame().href, this.getGameId());
      GamesActions.requestGameStream(
          nextProps.route.game.href,
          nextProps.params.gameId,
          nextProps.location.query.playerToken);
      this.retrieveCompGames();
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

      if (gameStore.getStatus() === GameStatus.ENDED)
        this.retrieveCompGames();
    }
  },

  retrieveCompGames: function () {
    if (this.getCompId()) {
      if (this.getPlayerToken()) {
        CompsActions.enter(this.getGame().href, this.getCompId(), this.getPlayerToken());
      }
      CompsActions.retrieveCompGames(this.getGame().href, this.getCompId());
      CompsStore.on(CompsEvents.COMP_GAMES, this.onCompGamesReceived);
      CompsStore.on(CompsEvents.COMP_GAMES_ERROR, this.onCompGamesError);
    }
  },

  onCompGamesReceived: function (gameHref, compId) {
    if (gameHref === this.getGame().href && compId === this.getCompId()) {
      let compGames = CompsStore.getComp(gameHref, compId).getGames();
      let gameIdx = compGames.indexOf(this.getGameId());
      this.setState({
        prevGameId: gameIdx === 0 ? null : compGames[gameIdx - 1],
        nextGameId: gameIdx === compGames.length - 1 ? null : compGames[gameIdx + 1]
      });
      this.removeCompGamesListeners();
    }
  },

  onCompGamesError: function (gameHref, compId) {
    if (gameHref === this.getGame().href && compId === this.getCompId()) {
      // TODO handle error
      this.removeCompGamesListeners();
    }
  },

  removeCompGamesListeners: function () {
    CompsStore.removeListener(CompsEvents.COMP_GAMES, this.onCompGamesReceived);
    CompsStore.removeListener(CompsEvents.COMP_GAMES_ERROR, this.onCompGamesError);
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

    let { connStatus, gameStatus, prevGameId, nextGameId } = this.state;
    let isLastState = this.state.gameStateIndex === this.state.gameStateCount - 1;

    let compControls = [];

    if (this.getCompId()) {
      let goTo = href => () => { this.history.pushState(null, href); };

      let pathOpts = { playerToken: this.getPlayerToken(), compId: this.getCompId() };
      let prevGamePath = Paths.gameStream(game.href, prevGameId, pathOpts);
      let compInfoPath = Paths.compInfo(game.href, this.getCompId());
      let nextGamePath = Paths.gameStream(game.href, nextGameId, pathOpts);

      compControls.push(
          <Pager key="comp-nav">
            <PageItem disabled={!prevGameId} onSelect={goTo(prevGamePath)}
                      href={prevGameId ? prevGamePath : null}>
              &lt; Previous
            </PageItem>
            <PageItem onSelect={goTo(compInfoPath)} href={compInfoPath}>
              Back
            </PageItem>
            <PageItem disabled={!nextGameId} onSelect={goTo(nextGamePath)}
                      href={nextGameId ? nextGamePath : null}>
              Next &gt;
            </PageItem>
          </Pager>
      );
    }

    return (
        <div className="flex">
          <Row className="game-stream">
            <Col md={6}>
              <Pagination className="game-state-nav" maxButtons={5} next={true} prev={true}
                          ellipsis={false} items={this.state.gameStateCount}
                          activePage={this.state.gameStateIndex + 1}
                          onSelect={this.handleGameStateSelect} />
            </Col>
            <Col md={3} className="game-comp-nav">
              {compControls}
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
