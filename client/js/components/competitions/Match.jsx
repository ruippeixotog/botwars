import React from "react";
import { Link } from "react-router";
import { Row, Col, ProgressBar } from "react-bootstrap";
import _ from "underscore";

import GameStatusLabel from "../GameStatusLabel";
import Paths from "../../utils/RouterPaths";

let Match = React.createClass({

  render: function () {
    let { gameHref, info, games } = this.props;

    let weightedWinCount = _.times(info.players, () => 0);
    games.filter(g => g.winners).forEach(g => {
      g.winners.forEach(w => { weightedWinCount[w - 1] += 1 / g.winners.length })
    });

    let playerProgressBars = weightedWinCount.map((cnt, i) =>
      <ProgressBar key={i} now={cnt} max={info.gamesTotal}
                   className={`player${i + 1}-bg`} label={`%(now)s / %(max)s`} />
    );

    let progressBar = <ProgressBar>{playerProgressBars}</ProgressBar>;

    let gameElems = games.map((gameInfo, i) => {
      let winnerElem = <span />;
      if (gameInfo.winners) {
        let winnerLabels = gameInfo.winners
            .map(w => [<span key={w} className={`player player${w}`}>{w}</span>])
            .reduce((acc, span) => [...acc, ", ", ...span]);

        let streamUrl = Paths.gameStream(gameHref, gameInfo.gameId, { compId: info.compId });
        winnerElem = winnerLabels.length > 0 ?
            <Link to={streamUrl}>Won by {winnerLabels}</Link> :
            <Link to={streamUrl}>Draw</Link>;
      }
      return (
          <Col xs={6} sm={4} md={3} key={gameInfo.gameId}>
            <div className="match-game panel panel-default">
              {i + 1}.
              <Link to={Paths.gameInfo(gameHref, gameInfo.gameId)}>
                <GameStatusLabel status={gameInfo.status} showLabels={false}/>
                {gameInfo.name || "#" + gameInfo.gameId.substr(0, 8)}
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
            <Col md={12}>
              <h4>Progress</h4>
            </Col>
          </Row>
          <Row>
            <Col md={6}>
              {progressBar}
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
});

export default Match;
