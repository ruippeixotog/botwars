import React from "react";
import {Col, Row} from "react-bootstrap";

import _ from "underscore";

const playerInfo = [
  { x: 0, y: 1, labelTop: 90, labelLeft: 32 },
  { x: 1, y: 0, labelTop: 70, labelLeft: 82 },
  { x: 0, y: -1, labelTop: 7.5, labelLeft: 68 },
  { x: -1, y: 0, labelTop: 30, labelLeft: 18 }
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
    var {card, top, left, zIndex, onClick, ...props} = this.props;
    var cardClasses = "card " + (card ? ` ${card.suit} ${this.getRankClass(card.value)}` : "");
    return (
        <div className={cardClasses} style={{ top: `${top}%`, left: `${left}%`, zIndex }}
             onClick={onClick ? () => onClick(card) : null} {...props}>
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

const PlayerLabel = ({player, top, left }) => (
    <div className="player-label" style={{ top: `${top}%`, left: `${left}%` }}>{player}</div>
);

const Hand = ({ player, cards, cardCount, deltaX = 40, deltaY = 35, deltaCx = 2, deltaCy = 3, onCardClick }) => {
  var info = playerInfo[player - 1];
  var x = 50 + info.x * deltaX - info.y * deltaCx * 4.5;
  var y = 50 + info.y * deltaY - info.x * deltaCy * 4.5;

  function cardIndex(card) {
    switch(card.value) {
      case "A": return 10;
      case "7": return 9;
      case "K": return 8;
      case "J": return 7;
      case "Q": return 6;
      default: return parseInt(card.value) - 1;
    }
  }

  function cardCompare(card1, card2) {
    if(card1.suit != card2.suit) return card1.suit < card2.suit ? -1 : 1;
    return cardIndex(card1) - cardIndex(card2);
  }

  var sortedCards = cards ? cards.sort(cardCompare) : {};

  var cardElems = [];
  for(let i = 0; i < cardCount; i++) {
    cardElems.push(<Card card={sortedCards[i]} top={y} left={x} zIndex={i} key={`card${i}`} onClick={onCardClick} />);
    x += info.y * deltaCx;
    y += info.x * deltaCy;
  }

  return (
      <div className={`hand ${onCardClick ? "playable-hand" : ""}`}>
        <PlayerLabel player={player} top={info.labelTop} left={info.labelLeft} />
        {cardElems}
      </div>
  );
};

const Hands = ({ player, handCards, tricksDone, currentTrick, onCardClick }) => {
  if(!currentTrick) return <div className="hands" />;

  var hands = [];
  for(let i = 0; i < 4; i++) {
    if(i == player - 1) {
      hands.push(<Hand player={i + 1} cards={handCards} cardCount={handCards.length} key={`hand${i}`}
                       onCardClick={onCardClick ? card => onCardClick(card, i) : null} />)
    } else {
      var cardCount = 10 - tricksDone - (currentTrick[i] ? 1 : 0);
      hands.push(<Hand player={i + 1} cardCount={cardCount} key={`hand${i}`} />);
    }
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

const Sueca = ({player, gameState, isLastState, onMove}) => {
  var {hand, currentTrick, lastTrick, tricksDone, trump, trumpPlayer, points} = gameState || {};

  return (
      <Row className="flex">
        <Col lg={12} className="flex">
          <div id="sueca" className="flex">
            <div className="deck flex">
              <CurrentTrick cards={currentTrick} lastTrickCards={lastTrick} />
              <Hands player={player} handCards={hand} tricksDone={tricksDone} currentTrick={currentTrick}
                     onCardClick={isLastState ? onMove : null} />
              <Trump card={trump} player={trumpPlayer} />
              <LastTrick cards={lastTrick} />
              <Points points={points} />
            </div>
          </div>
        </Col>
      </Row>);
};

export default Sueca;
