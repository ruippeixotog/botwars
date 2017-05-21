import React from "react";
import PropTypes from "prop-types";
import { Row, Col, Table } from "react-bootstrap";

import GamesActions from "../actions/GamesActions";
import GamesEvents from "../events/GamesEvents";
import GamesStore from "../stores/GamesStore";

import GameStatusLabel from "./GameStatusLabel";
import GameTabsNav from "./GameTabsNav";
import Paths from "../utils/RouterPaths";

class GamesIndex extends React.Component {
  static contextTypes = {
    router: PropTypes.object.isRequired
  };

  constructor(props, context) {
    super(props, context);
    let gameStores = GamesStore.getAllGames(this.getGame().href);
    this.state = { games: gameStores.map(g => g.info) };
  }

  getGame = () => {
    return this.props.route.game;
  };

  isThisGame = (gameHref) => {
    return gameHref === this.getGame().href;
  };

  componentWillMount() {
    GamesStore.on(GamesEvents.GAMES_LIST, this.onGamesListUpdate);
    GamesStore.on(GamesEvents.GAMES_LIST_ERROR, this.onGamesListError);
    this.retrieveGamesList();
  }

  componentWillReceiveProps(nextProps) {
    if (!this.isThisGame(nextProps.route.game.href)) {
      let gameStores = GamesStore.getAllGames(this.getGame().href);

      this.setState({ games: gameStores.map(g => g.info) });
      clearInterval(this._gamesPollTimeout);
      this.retrieveGamesList(nextProps.route.game.href);
    }
  }

  componentWillUnmount() {
    clearInterval(this._gamesPollTimeout);
    GamesStore.removeListener(GamesEvents.GAMES_LIST, this.onGamesListUpdate);
    GamesStore.removeListener(GamesEvents.GAMES_LIST_ERROR, this.onGamesListError);
  }

  onGamesListUpdate = (gameHref) => {
    if (this.isThisGame(gameHref)) {
      let gameStores = GamesStore.getAllGames(this.getGame().href);
      this.setState({ games: gameStores.map(g => g.info) });
    }
  };

  onGamesListError = (gameHref) => {
    if (this.isThisGame(gameHref)) {
      // TODO handle error
    }
  };

  retrieveGamesList = (nextGameHref) => {
    GamesActions.retrieveGamesList(nextGameHref || this.getGame().href);
    this._gamesPollTimeout = setTimeout(this.retrieveGamesList, 5000);
  };

  handleGameOpen = (e, gameId) => {
    e.preventDefault();
    this.context.router.push(Paths.gameInfo(this.getGame().href, gameId));
  };

  render() {
    let tableRows = this.state.games.map(info => {
      let nameCell = info.name || <span className="no-name">{"#" + info.gameId}</span>;

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
            <td>{nameCell}</td>
            <td>{info.connectedPlayers}/{info.players}</td>
            <td><GameStatusLabel status={info.status}/></td>
            <td>{winnerCell}</td>
          </tr>);
    });

    return (
        <div>
          <GameTabsNav gameHref={this.getGame().href} activeKey="games" />
          <Row>
            <Col lg={9}>
              <Table className="games-list" responsive hover>
                <thead>
                  <tr>
                    <th>Name</th>
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
        </div>
    );
  }
}

export default GamesIndex;
