import React from "react";
import { History } from "react-router";
import { Row, Col, Table } from "react-bootstrap";

import CompsActions from "../actions/CompsActions";
import CompsInfoStore from "../stores/CompsInfoStore";
import CompsEvents from "../events/CompsEvents";

import GameStatusLabel from "./GameStatusLabel";
import GameTabsNav from "./GameTabsNav";

let CompsIndex = React.createClass({
  mixins: [History],

  getGame: function () {
    return this.props.route.game;
  },

  isThisGame: function (gameHref) {
    return gameHref === this.getGame().href;
  },

  getInitialState: function () {
    return { competitions: CompsInfoStore.getComps(this.getGame().href) || [] };
  },

  componentWillMount: function () {
    CompsInfoStore.on(CompsEvents.COMPS_LIST, this.onNewCompsList);
    CompsInfoStore.on(CompsEvents.COMPS_LIST_ERROR, this.onCompsListError);
    this.retrieveCompsList();
  },

  componentWillReceiveProps: function (nextProps) {
    if (!this.isThisGame(nextProps.route.game.href)) {
      this.setState({ competitions: CompsInfoStore.getComps(nextProps.route.game.href) || [] });
      clearInterval(this._compsPollTimeout);
      this.retrieveGamesList(nextProps.route.game.href);
    }
  },

  componentWillUnmount: function () {
    clearInterval(this._compsPollTimeout);
    CompsInfoStore.removeListener(CompsEvents.COMPS_LIST, this.onNewCompsList);
    CompsInfoStore.removeListener(CompsEvents.COMPS_LIST_ERROR, this.onCompsListError);
  },

  onNewCompsList: function (gameHref) {
    if (this.isThisGame(gameHref)) {
      this.setState({ competitions: CompsInfoStore.getComps(gameHref) });
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
    this.history.pushState(null, `${this.getGame().href}/competitions/${compId}`);
  },

  render: function () {
    let tableRows = this.state.competitions.map(info => {
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
            <td>{info.compId}</td>
            <td>{info.registeredPlayers}/{info.players}</td>
            <td><GameStatusLabel status={info.status}/></td>
            <td>{winnerCell}</td>
          </tr>);
    });

    return (
        <div>
          <GameTabsNav gameHref={this.getGame().href} activeKey="competitions" />
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
        </div>
    );
  }
});

export default CompsIndex;
