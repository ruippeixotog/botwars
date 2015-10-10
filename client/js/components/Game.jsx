import React from "react";
import {History} from "react-router";

import GamesActions from "../actions/GamesActions";
import GamesStore from "../stores/GamesStore";
import GamesEvents from "../events/GamesEvents";

import Alert from "./Alert";

const ConnStates = Object.freeze({
  NOT_CONNECTED: "NOT_CONNECTED",
  CONNECTED: "CONNECTED",
  CONNECTION_DOWN: "CONNECTION_DOWN",
  FINISHED: "FINISHED"
});

var Game = React.createClass({
  mixins: [History],

  getGameId: function() {
    return this.props.params.gameId;
  },

  getGame: function() {
    return this.props.route.game;
  },

  isThisGame: function(gameHref, gameId) {
    return gameHref == this.getGame().href && gameId == this.getGameId();
  },

  getInitialState: function() {
    return {
      connState: ConnStates.NOT_CONNECTED,
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
    GamesStore.on(GamesEvents.NEW_STATE, this.onNewGameState);
  },

  componentDidMount: function() {
    GamesActions.requestGameStream(this.getGame().href, this.getGameId());
  },

  componentWillReceiveProps: function(nextProps) {
    if(!this.isThisGame(nextProps.route.game.href, nextProps.params.gameId)) {
      clearInterval(this._connRetryTimeout);
      GamesActions.closeGameStream(this.getGame().href, this.getGameId());
      GamesActions.requestGameStream(nextProps.route.game.href, nextProps.params.gameId);
      this.setState(this.getInitialState());
    }
  },

  componentWillUnmount: function() {
    clearInterval(this._connRetryTimeout);
    GamesStore.removeListener(GamesEvents.CONNECTION_OPENED, this.onConnectionOpened);
    GamesStore.removeListener(GamesEvents.CONNECTION_CLOSED, this.onConnectionClosed);
    GamesStore.removeListener(GamesEvents.CONNECTION_ERROR, this.onConnectionError);
    GamesStore.removeListener(GamesEvents.NEW_STATE, this.onNewGameState);
    GamesActions.closeGameStream(this.getGame().href, this.getGameId());
  },

  onConnectionOpened: function(gameHref, gameId) {
    if(this.isThisGame(gameHref, gameId)) {
      this.setState({ connState: ConnStates.CONNECTED });
    }
  },

  onConnectionClosed: function(gameHref, gameId) {
    if(this.isThisGame(gameHref, gameId)) {
      this.setState({ connState: ConnStates.FINISHED });
    }
  },

  onConnectionError: function(gameHref, gameId) {
    if(this.isThisGame(gameHref, gameId)) {
      if(this.state.connState == ConnStates.CONNECTED) {
        this.setState({ connState: ConnStates.CONNECTION_DOWN });
      }
      this._connRetryTimeout = setTimeout(this.retryConnection, 3000);
    }
  },

  retryConnection: function() {
    GamesActions.requestGameStream(this.getGame().href, this.getGameId());
  },

  onNewGameState: function(gameHref, gameId) {
    if(this.isThisGame(gameHref, gameId)) {
      var gameStore = GamesStore.getGame(gameHref, gameId);

      var newStateCount = gameStore.getStateCount();
      this.setState({ gameStateCount: newStateCount });

      if(this.state.followCurrentState) {
        this.setState({
          gameStateIndex: newStateCount - 1,
          gameState: gameStore.getCurrentState()
        });
      }
    }
  },

  handleGameIdSubmit: function(e) {
    e.preventDefault();
    var nextGameId = this.refs.nextGameId.value;
    this.history.pushState(null, `${this.getGame().href}/${nextGameId}`);
  },

  handleStateBack: function(e) {
    e.preventDefault();
    if(this.state.gameStateIndex > 0) {
      var gameStore = GamesStore.getGame(this.getGame().href, this.getGameId());

      this.setState({
        gameState: gameStore.getState(this.state.gameStateIndex - 1),
        gameStateIndex: this.state.gameStateIndex - 1,
        followCurrentState: false
      });
    }
  },

  handleStateFwd: function(e) {
    e.preventDefault();
    if(this.state.gameStateIndex < this.state.gameStateCount - 1) {
      var gameStore = GamesStore.getGame(this.getGame().href, this.getGameId());

      this.setState({
        gameState: gameStore.getState(this.state.gameStateIndex + 1),
        gameStateIndex: this.state.gameStateIndex + 1,
        followCurrentState: this.state.gameStateIndex == this.state.gameStateCount - 2
      });
    }
  },

  render: function () {
    var gameId = this.getGameId();
    var game = this.getGame();
    var GameComponent = game.component;

    var alert = <div></div>;
    switch(this.state.connState) {
      case ConnStates.NOT_CONNECTED:
        alert = <Alert level="warn">Connecting to server...</Alert>;
        break;
      case ConnStates.CONNECTION_DOWN:
        alert = <Alert level="warn">Connection is down. Trying to reconnect...</Alert>;
        break;
    }

    return (
        <div>
          <div className="row">
            <div className="col-lg-12">
              <h1 className="page-header">{game.name}</h1>
            </div>
          </div>
          {alert}
          <div className="game-toolbar">
            <form className="form-inline game-chooser" onSubmit={this.handleGameIdSubmit}>
              <label>Watch another game:</label>
              <input className="form-control" ref="nextGameId" defaultValue={gameId} />
              <button className="btn btn-default">Go</button>
            </form>
            <ul className="pagination game-state-nav">
              <li>
                <a onClick={this.handleStateBack}>&laquo;</a>
              </li>
              <li>
                <a onClick={this.handleStateFwd}>&raquo;</a>
              </li>
            </ul>
          </div>
          <GameComponent gameId={gameId} gameState={this.state.gameState} />
        </div>
    );
  }
});

export default Game;
