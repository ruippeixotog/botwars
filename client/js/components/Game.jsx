import React from "react";
import {History} from "react-router";
import {Row, Col, Pagination, Input, Button, Alert, PageHeader} from "react-bootstrap";
import classNames from "classnames";

import GamesActions from "../actions/GamesActions";
import GamesStore from "../stores/GamesStore";
import GamesEvents from "../events/GamesEvents";

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

      if(this.state.followCurrentState) {
        this.setState({
          gameState: gameStore.getCurrentState(),
          gameStateCount: newStateCount,
          gameStateIndex: newStateCount - 1
        });
      } else {
        this.setState({ gameStateCount: newStateCount });
      }
    }
  },

  handleGameIdSubmit: function(e) {
    e.preventDefault();
    var nextGameId = this.refs.nextGameId.getValue();
    this.history.pushState(null, `${this.getGame().href}/${nextGameId}`);
  },

  handleGameStateSelect: function(e, {eventKey}) {
    e.preventDefault();
    if(eventKey != this.state.gameStateIndex + 1) {
      var gameStore = GamesStore.getGame(this.getGame().href, this.getGameId());

      this.setState({
        gameState: gameStore.getState(eventKey - 1),
        gameStateIndex: eventKey - 1,
        followCurrentState: eventKey == this.state.gameStateCount - 1
      });
    }
  },

  render: function () {
    var gameId = this.getGameId();
    var game = this.getGame();
    var GameComponent = game.component;

    var alertText = "";
    switch(this.state.connState) {
      case ConnStates.NOT_CONNECTED:
        alertText = "Connecting to server...";
        break;
      case ConnStates.CONNECTION_DOWN:
        alertText = "Connection is down. Trying to reconnect...";
        break;
    }

    var alertClassNames = classNames({
      "hidden": alertText == ""
    });

    return (
        <div>
          <Row>
            <Col lg={12}>
              <PageHeader>{game.name}</PageHeader>
            </Col>
          </Row>
          <Alert className={alertClassNames} bsStyle="warning">
            <i className="fa fa-exclamation-circle fa-fw" />{alertText}
          </Alert>
          <Row>
            <Col lg={6}>
              <Pagination className="game-state-nav" maxButtons={5} next={true} prev={true}
                          items={this.state.gameStateCount} activePage={this.state.gameStateIndex + 1}
                          onSelect={this.handleGameStateSelect} />
            </Col>
            <Col lg={6}>
              <form className="form-inline game-chooser pull-right" onSubmit={this.handleGameIdSubmit}>
                <Input type="text" label="Watch another game:" defaultValue={gameId} ref="nextGameId" />
                <Button>Go</Button>
              </form>
            </Col>
          </Row>
          <GameComponent gameId={gameId} gameState={this.state.gameState} />
        </div>
    );
  }
});

export default Game;
