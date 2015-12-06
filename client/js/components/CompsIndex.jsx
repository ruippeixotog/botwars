import React from "react";
import { History } from "react-router";
import { Row, Col, Table } from "react-bootstrap";

import CompsActions from "../actions/CompsActions";
import CompsEvents from "../events/CompsEvents";
import CompsStore from "../stores/CompsStore";

import GameStatusLabel from "./GameStatusLabel";
import GameTabsNav from "./GameTabsNav";
import Paths from "../utils/RouterPaths";

let CompsIndex = React.createClass({
  mixins: [History],

  getGame: function () {
    return this.props.route.game;
  },

  isThisGame: function (gameHref) {
    return gameHref === this.getGame().href;
  },

  getInitialState: function () {
    let compStores = CompsStore.getAllComps(this.getGame().href);
    return { comps: compStores.map(c => c.getInfo()) };
  },

  componentWillMount: function () {
    CompsStore.on(CompsEvents.COMPS_LIST, this.onCompsListUpdate);
    CompsStore.on(CompsEvents.COMPS_LIST_ERROR, this.onCompsListError);
    this.retrieveCompsList();
  },

  componentWillReceiveProps: function (nextProps) {
    if (!this.isThisGame(nextProps.route.game.href)) {
      let compStores = CompsStore.getAllComps(nextProps.route.game.href);

      this.setState({ comps: compStores.map(c => c.getInfo()) });
      clearInterval(this._compsPollTimeout);
      this.retrieveGamesList(nextProps.route.game.href);
    }
  },

  componentWillUnmount: function () {
    clearInterval(this._compsPollTimeout);
    CompsStore.removeListener(CompsEvents.COMPS_LIST, this.onCompsListUpdate);
    CompsStore.removeListener(CompsEvents.COMPS_LIST_ERROR, this.onCompsListError);
  },

  onCompsListUpdate: function (gameHref) {
    if (this.isThisGame(gameHref)) {
      let compStores = CompsStore.getAllComps(gameHref);
      this.setState({ comps: compStores.map(c => c.info) });
    }
  },

  onCompsListError: function (gameHref) {
    if (this.isThisGame(gameHref)) {
      // TODO handle error
    }
  },

  retrieveCompsList: function (nextGameHref) {
    CompsActions.retrieveCompsList(nextGameHref || this.getGame().href);
    this._compsPollTimeout = setTimeout(this.retrieveCompsList, 5000);
  },

  handleCompOpen: function (e, compId) {
    e.preventDefault();
    this.history.pushState(null, Paths.compInfo(this.getGame().href, compId));
  },

  render: function () {
    let tableRows = this.state.comps.map(info => {
      let nameCell = info.name || <span className="no-name">{"#" + info.compId}</span>;

      let winnerCell = "";
      if (info.winners) {
        switch (info.winners.length) {
          case 0: winnerCell = "Draw"; break;
          case 1: winnerCell = `Player ${info.winners[0]}`; break;
          default: winnerCell = `Players ${info.winners.join(", ")}`;
        }
      }

      return (
          <tr key={info.compId} onClick={e => this.handleCompOpen(e, info.compId)}>
            <td>{nameCell}</td>
            <td>{info.type}</td>
            <td>{info.registeredPlayers}/{info.players}</td>
            <td><GameStatusLabel status={info.status}/></td>
            <td>{winnerCell}</td>
          </tr>);
    });

    return (
        <div>
          <GameTabsNav gameHref={this.getGame().href} activeKey="competitions" />
          <Row>
            <Col lg={9}>
              <Table className="games-list" responsive hover>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Type</th>
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
});

export default CompsIndex;
