import React from "react";
import { History } from "react-router";
import { Row, Col, Table } from "react-bootstrap";

import GamesActions from "../actions/GamesActions";
import GamesInfoStore from "../stores/GamesInfoStore";
import GamesEvents from "../events/GamesEvents";

import GameStatusLabel from "./GameStatusLabel";

let GameIndex = React.createClass({
  mixins: [History],

  getGame: function () {
    return this.props.route.game;
  },

  isThisGame: function (gameHref) {
    return gameHref === this.getGame().href;
  },

  getInitialState: function () {
    return { games: GamesInfoStore.getGames(this.getGame().href) || [] };
  },

  componentWillMount: function () {
    GamesInfoStore.on(GamesEvents.GAMES_LIST, this.onNewGamesList);
    GamesInfoStore.on(GamesEvents.GAMES_LIST_ERROR, this.onGamesListError);
    this.retrieveGamesList();
  },

  componentWillReceiveProps: function (nextProps) {
    if (!this.isThisGame(nextProps.route.game.href)) {
      this.setState({ games: GamesInfoStore.getGames(nextProps.route.game.href) || [] });
      clearInterval(this._gamesPollTimeout);
      this.retrieveGamesList(nextProps.route.game.href);
    }
  },

  componentWillUnmount: function () {
    clearInterval(this._gamesPollTimeout);
    GamesInfoStore.removeListener(GamesEvents.GAMES_LIST, this.onNewGamesList);
    GamesInfoStore.removeListener(GamesEvents.GAMES_LIST_ERROR, this.onGamesListError);
  },

  onNewGamesList: function (gameHref) {
    if (this.isThisGame(gameHref)) {
      this.setState({ games: GamesInfoStore.getGames(gameHref) });
    }
  },

  onGamesListError: function (gameHref) {
    if (this.isThisGame(gameHref)) {
      // TODO handle error
    }
  },

  retrieveGamesList: function (nextGameHref) {
    GamesActions.retrieveGamesList(nextGameHref || this.getGame().href);
    this._gamesPollTimeout = setTimeout(this.retrieveGamesList, 5000);
  },

  handleGameOpen: function (e, gameId) {
    e.preventDefault();
    this.history.pushState(null, `${this.getGame().href}/${gameId}`);
  },

  render: function () {
    let tableRows = this.state.games.map(info => {
      let winnerCell = "";
      if (info.winners) {
        switch (info.winners.length) {
          case 0: winnerCell = "Draw"; break;
          case 1: winnerCell = `Player ${info.winners[0]}`; break;
          default: winnerCell = `Players ${info.winners.join(", ")}`;
        }
      }
      return (
          <tr key={info.gameId} onClick={e => this.handleGameOpen(e, info.gameId)}>
            <td>{info.gameId}</td>
            <td>{info.connectedPlayers}/{info.players}</td>
            <td><GameStatusLabel status={info.status}/></td>
            <td>{winnerCell}</td>
          </tr>);
    });

    return (
        <Row>
          <Col lg={6}>
            <Table className="games-list" responsive hover>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Players</th>
                  <th>Status</th>
                  <th>Winners</th>
                </tr>
              </thead>
              <tbody>
                {tableRows}
              </tbody>
            </Table>
          </Col>
        </Row>
    );
  }
});

export default GameIndex;
