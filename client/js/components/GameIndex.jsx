import React from "react";
import { History } from "react-router";
import { Row, Col, PageHeader, Table } from "react-bootstrap";

import GamesActions from "../actions/GamesActions";
import GamesListStore from "../stores/GamesListStore";
import GamesEvents from "../events/GamesEvents";

import GameStatusLabel from "./GameStatusLabel";

var GameIndex = React.createClass({
  mixins: [History],

  propTypes: {
    children: React.PropTypes.element
  },

  getGame: function () {
    return this.props.route.game;
  },

  isThisGame: function (gameHref) {
    return gameHref === this.getGame().href;
  },

  getInitialState: function () {
    return { games: [] };
  },

  componentWillMount: function () {
    GamesListStore.on(GamesEvents.GAMES_LIST, this.onNewGamesList);
    GamesListStore.on(GamesEvents.GAMES_LIST_ERROR, this.onGamesListError);
    this.retrieveGamesList();
  },

  componentWillUnmount: function () {
    clearInterval(this._gamesPollTimeout);
    GamesListStore.removeListener(GamesEvents.GAMES_LIST, this.onNewGamesList);
    GamesListStore.removeListener(GamesEvents.GAMES_LIST_ERROR, this.onGamesListError);
  },

  onNewGamesList: function (gameHref) {
    if (this.isThisGame(gameHref)) {
      this.setState({ games: GamesListStore.getGames(gameHref) });
    }
  },

  onGamesListError: function (gameHref) {
    if (this.isThisGame(gameHref)) {
      // TODO handle error
    }
  },

  retrieveGamesList: function () {
    GamesActions.retrieveGamesList(this.getGame().href);
    this._gamesPollTimeout = setTimeout(this.retrieveGamesList, 5000);
  },

  handleGameOpen: function (e, gameId) {
    e.preventDefault();
    this.history.pushState(null, `${this.getGame().href}/${gameId}`);
  },

  render: function () {
    var game = this.getGame();

    var tableRows = this.state.games.map(info => (
        <tr key={info.gameId} onClick={e => this.handleGameOpen(e, info.gameId)}>
          <td>{info.gameId}</td>
          <td><GameStatusLabel status={info.status} /></td>
        </tr>
    ));

    return (
        <div>
          <Row>
            <Col lg={12}>
              <PageHeader>{game.name}</PageHeader>
            </Col>
          </Row>
          <Row>
            <Col lg={6}>
              <Table responsive hover>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {tableRows}
                </tbody>
              </Table>
            </Col>
          </Row>
          {this.props.children}
        </div>
    );
  }
});

export default GameIndex;
