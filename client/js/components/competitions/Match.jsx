import React from "react";
import { Link } from "react-router";
import { Row, Col, Table, ProgressBar } from "react-bootstrap";
import _ from "lodash";

import GameStatus from "../../constants/GameStatus";

import GameStatusLabel from "../GameStatusLabel";
import Paths from "../../utils/RouterPaths";

class Match extends React.Component {
  render() {
    let { gameHref, info, games } = this.props;

    let sortedWinCount = _(info.winCount.map((cnt, i) => [cnt, i + 1])).sortBy(e => -e[0]);
    let scores = sortedWinCount.map(([cnt, p], pos) =>
      <tr key={p}>
        <td>{pos + 1}.</td>
        <td>
          <span className={`win-token player${p}-bg`} />
          Player {p}
        </td>
        <td>{cnt}</td>
      </tr>
    );

    let progressBar = <ProgressBar active={info.status === GameStatus.STARTED}
                                   now={info.gamesPlayed} max={info.gamesTotal}
                                   label={`${info.gamesPlayed} / ${info.gamesTotal}`} />;

    let gameElems = games.map((gameInfo, i) => {
      let winnerElem = <span>&nbsp;</span>;
      if (gameInfo.winners) {
        let winnerLabels = gameInfo.winners.join(", ");
        let tokens = gameInfo.winners.map(w =>
            <span key={w} className={`win-token token-right player${w}-bg`} />);

        let streamUrl = Paths.gameStream(gameHref, gameInfo.gameId, { compId: info.compId });
        winnerElem = winnerLabels.length > 0 ?
            <Link to={streamUrl}>Won by {winnerLabels} {tokens}</Link> :
            <Link to={streamUrl}>Draw</Link>;
      }
      return (
          <Col xs={6} sm={4} md={3} key={gameInfo.gameId}>
            <div className="match-game panel panel-default">
              {i + 1}.&nbsp;
              <Link to={Paths.gameInfo(gameHref, gameInfo.gameId)}>
                {gameInfo.name || "#" + gameInfo.gameId.substr(0, 8)}
                <GameStatusLabel status={gameInfo.status} showLabels={false} />
              </Link>
              <br />
              {winnerElem}
            </div>
          </Col>
      );
    });

    return (
        <div id="match">
          <Row>
            <Col md={6}>
              <Row>
                <Col md={12}>
                  <h4>Score</h4>
                </Col>
              </Row>
              <Row>
                <Col md={12}>
                  <Table condensed>
                    <tbody>
                      {scores}
                    </tbody>
                  </Table>
                </Col>
              </Row>
            </Col>
            <Col md={6}>
              <Row>
                <Col md={12}>
                  <h4>Progress</h4>
                </Col>
              </Row>
              <Row>
                <Col md={12}>
                  {progressBar}
                </Col>
              </Row>
            </Col>
          </Row>
          <Row>
            <Col md={12}>
              <h4>Games</h4>
            </Col>
          </Row>
          <Row>
            {gameElems}
          </Row>
        </div>
    );
  }
}

export default Match;
