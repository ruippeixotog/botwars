import React from "react";
import {Col, Row} from "react-bootstrap";

import _ from "underscore";

const playerInfo = [
  { x: 0, y: 1 },
  { x: 1, y: 0 },
  { x: 0, y: -1 },
  { x: -1, y: 0 }
];

class Card extends React.Component {
  getRankClass(value) {
    switch(value) {
      case "A": return "rank1";
      case "K": return "rank13";
      case "Q": return "rank12";
      case "J": return "rank11";
      default: return `rank${value}`;
    }
  }

  render() {
    var {card, top, left, zIndex, ...props} = this.props;
    var cardClasses = "card " + (card ? ` ${card.suit} ${this.getRankClass(card.value)}` : "");
    return (
        <div className={cardClasses} style={{ top: `${top}%`, left: `${left}%`, zIndex }} {...props}>
          <div className={ card ? "face" : "back" }></div>
        </div>
    );
  }
}

const CurrentTrick = ({cards, lastTrickCards, delta = 10}) => {
  if(!cards) return <div className="curr-trick" />;

  if(_(cards).every(c => c == null) && lastTrickCards)
    cards = lastTrickCards;

  var cardElems = [];
  for(let i = 0; i < 4; i++) {
    if(!cards[i]) continue;
    cardElems.push(<Card card={cards[i]} key={`trick${i}`} zIndex={10 + i}
                         top={50 + playerInfo[i].y * delta} left={50 + playerInfo[i].x * delta} />);
  }

  return (
      <div className="curr-trick">
        {cardElems}
      </div>
  );
};

const Hand = ({ player, cardCount, deltaX = 40, deltaY = 35, deltaCx = 2, deltaCy = 2 }) => {
  var info = playerInfo[player - 1];
  var x = 50 + info.x * deltaX - info.y * deltaCx * 4.5;
  var y = 50 + info.y * deltaY - info.x * deltaCy * 4.5;

  var cards = [];
  for(let i = 0; i < cardCount; i++) {
    cards.push(<Card top={y} left={x} zIndex={i} key={`card${i}`} />);
    x += info.y * deltaCx;
    y += info.x * deltaCy;
  }

  return (
      <div className="hand">
        {cards}
      </div>
  );
};

const Hands = ({tricksDone, currentTrick}) => {
  if(!currentTrick) return <div className="hands" />;

  var hands = [];
  for(let i = 0; i < 4; i++) {
    var cardCount = 10 - tricksDone - (currentTrick[i] ? 1 : 0);
    hands.push(<Hand player={i + 1} cardCount={cardCount} key={`hand${i}`} />);
  }

  return (
      <div className="hands">
        {hands}
      </div>
  );
};

const Trump = ({card, player}) => {
  if(!card) return <div className="trump" />;

  return (
      <div className="trump">
        <span>Trump (player {player || "-"})</span><br />
        <Card card={card} top={250} left={50} zIndex={10} />
      </div>
  );
};

const LastTrick = ({cards, x = 10, y = 85, delta = 5}) => {
  if(!cards) cards = [];

  var cardElems = cards.map((c, i) =>
      <Card card={c} key={`trick${i}`} zIndex={10 + i}
            top={y + playerInfo[i].y * delta} left={x + playerInfo[i].x * delta} />);

  return (
      <div className="last-trick">
        {cardElems}
      </div>
  );
};

const Points = ({points}) => (
    <div className="points">
      <span>Points</span><br />
      <span>Team 1: {points ? points[0] : '-'}</span><br />
      <span>Team 2: {points ? points[1] : '-'}</span>
    </div>
);

const Sueca = ({gameState = {}}) => {
  var {currentTrick, lastTrick, tricksDone, trump, trumpPlayer, points} = gameState || {};

  return (
      <Row className="flex">
        <Col lg={12} className="flex">
          <div id="sueca" className="flex">
            <div className="deck flex">
              <CurrentTrick cards={currentTrick} lastTrickCards={lastTrick} />
              <Hands tricksDone={tricksDone} currentTrick={currentTrick} />
              <Trump card={trump} player={trumpPlayer} />
              <LastTrick cards={lastTrick} />
              <Points points={points} />
            </div>
          </div>
        </Col>
      </Row>);
};

export default Sueca;
