import React from "react";
import { Row, Col, Table } from "react-bootstrap";
import { NavigateFunction, useNavigate } from "react-router-dom";

import CompsActions from "../actions/CompsActions";
import CompsEvents from "../events/CompsEvents";
import CompsStore from "../stores/CompsStore";

import GameStatusLabel from "./GameStatusLabel";
import GameTabsNav from "./GameTabsNav";
import Paths from "../utils/RouterPaths";
import { CompInfo, Game } from "../types";

type CompsIndexProps = {
  game: Game
};

type CompsIndexLegacyProps = CompsIndexProps & {
  navigate: NavigateFunction
};

type CompsIndexLegacyState = {
  comps: (CompInfo | Record<string, never>)[]
};

const CompsIndex = (props: CompsIndexProps): JSX.Element => {
  const navigate = useNavigate();
  return <CompsIndexLegacy navigate={navigate} {...props} />;
};

class CompsIndexLegacy extends React.Component<CompsIndexLegacyProps, CompsIndexLegacyState> {
  private _compsPollTimeout: NodeJS.Timeout;

  constructor(props: CompsIndexLegacyProps) {
    super(props);
    const compStores = CompsStore.getAllComps(this.getGame().href);
    this.state = { comps: compStores.map(c => c.getInfo()) };
  }

  getGame = (): Game => {
    return this.props.game;
  };

  isThisGame = (gameHref: string): boolean => {
    return gameHref === this.getGame().href;
  };

  componentWillMount(): void {
    CompsStore.on(CompsEvents.COMPS_LIST, this.onCompsListUpdate);
    CompsStore.on(CompsEvents.COMPS_LIST_ERROR, this.onCompsListError);
    this.retrieveCompsList();
  }

  componentWillReceiveProps(nextProps: CompsIndexLegacyProps): void {
    if (!this.isThisGame(nextProps.game.href)) {
      const compStores = CompsStore.getAllComps(nextProps.game.href);

      this.setState({ comps: compStores.map(c => c.getInfo()) });
      clearInterval(this._compsPollTimeout);
      this.retrieveCompsList(nextProps.game.href);
    }
  }

  componentWillUnmount(): void {
    clearInterval(this._compsPollTimeout);
    CompsStore.removeListener(CompsEvents.COMPS_LIST, this.onCompsListUpdate);
    CompsStore.removeListener(CompsEvents.COMPS_LIST_ERROR, this.onCompsListError);
  }

  onCompsListUpdate = (gameHref: string): void => {
    if (this.isThisGame(gameHref)) {
      const compStores = CompsStore.getAllComps(gameHref);
      this.setState({ comps: compStores.map(c => c.getInfo()) });
    }
  };

  onCompsListError = (gameHref): void => {
    if (this.isThisGame(gameHref)) {
      // TODO handle error
    }
  };

  retrieveCompsList = (nextGameHref?: string): void => {
    CompsActions.retrieveCompsList(nextGameHref || this.getGame().href);
    this._compsPollTimeout = setTimeout(this.retrieveCompsList, 5000);
  };

  handleCompOpen = (e, compId: string): void => {
    e.preventDefault();
    this.props.navigate(Paths.compInfo(this.getGame().href, compId));
  };

  render(): JSX.Element {
    const tableRows = this.state.comps.map(info => {
      const nameCell = info.name || <span className="no-name">{"#" + info.compId}</span>;

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
        </tr>
      );
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
}

export default CompsIndex;
