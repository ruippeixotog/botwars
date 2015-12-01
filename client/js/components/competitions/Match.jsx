import React from "react";
import { Link } from "react-router";
import { Row, Col, ProgressBar } from "react-bootstrap";
import _ from "underscore";

import GameStatusLabel from "../GameStatusLabel";

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

    let gameElems = games.map((info, i) => {
      let winnerElem = <span />;
      if (info.winners) {
        let winnerLabels = info.winners
            .map(w => [<span className={`player player${w}`}>{w}</span>])
            .reduce((acc, span) => [...acc, ", ", ...span]);

        winnerElem = winnerLabels.length > 0 ?
            <span>Won by {winnerLabels}</span> :
            <span>Draw</span>;
      }
      return (
          <Col xs={6} sm={4} md={3} key={info.gameId}>
            <div className="match-game panel panel-default">
              {i + 1}.
              <Link to={`${gameHref}/games/${info.gameId}`}>
                <GameStatusLabel status={info.status} showLabels={false}/>
                {info.name || "#" + info.gameId}
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
