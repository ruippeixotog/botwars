import _ from "underscore";

import Game from "./game";

const cardData = {
  "2": { index: 0, points: 0 },
  "3": { index: 1, points: 0 },
  "4": { index: 2, points: 0 },
  "5": { index: 3, points: 0 },
  "6": { index: 4, points: 0 },
  "Q": { index: 5, points: 2 },
  "J": { index: 6, points: 3 },
  "K": { index: 7, points: 4 },
  "7": { index: 8, points: 10 },
  "A": { index: 9, points: 11 }
};

class Sueca extends Game {
  constructor(params = {}) {
    super(params);

    let deck = Sueca.generateDeck();

    this.hands = new Array(4);
    for (let i = 0; i < 4; i++) {
      this.hands[i] = deck.slice(10 * i, 10 * (i + 1));
    }
    if (params.lastGame && params.lastGame.trumpPlayer) {
      this.trumpPlayer = Sueca.getPlayerAfter(params.lastGame.trumpPlayer);
    } else {
      this.trumpPlayer = Math.floor(Math.random() * 4 + 1);
    }
    this.trump = this.hands[this.trumpPlayer - 1][0];

    this.nextPlayer = Sueca.getPlayerAfter(this.trumpPlayer);
    this.score = [0, 0];
    this.winners = null;
    this.error = false;

    this.trickSuit = null;
    this.lastTrick = null;
    this.currentTrick = [null, null, null, null];
    this.tricksDone = 0;
  }

  getPlayerCount() { return 4; }
  isEnded() { return this.error || this.winners !== null || this.tricksDone === 10; }
  isError() { return this.error; }
  getWinners() { return this.winners; }
  getNextPlayer() { return this.nextPlayer; }

  isValidMove(player, card) {
    return player === this.nextPlayer && this._canPlay(player, card);
  }

  move(player, card) {
    if (!this.isValidMove(player, card)) {
      this.error = true;
    } else {
      this.trickSuit = this.trickSuit || card.suit;
      this.currentTrick[player - 1] = card;
      this.hands[player - 1] = _(this.hands[player - 1]).reject(Sueca.cardEquals(card));

      this.nextPlayer = Sueca.getPlayerAfter(player);
      if (this.currentTrick[this.nextPlayer - 1])
        this._endTrick();
    }
  }

  getFullState() {
    return {
      nextPlayer: this.isEnded() ? null : this.nextPlayer,
      hands: this.hands,
      trumpPlayer: this.trumpPlayer,
      trump: this.trump,
      lastTrick: this.lastTrick,
      currentTrick: this.currentTrick,
      trickSuit: this.trickSuit,
      tricksDone: this.tricksDone,
      score: this.score,
      winners: this.winners,
      isError: this.error
    };
  }

  getStateView(fullState, player) {
    return {
      ...fullState,
      hands: undefined,
      hand: fullState.hands[player - 1]
    };
  }

  onMoveTimeout() {
    this.winners = Sueca.getTeam(this.nextPlayer) === 1 ? [1, 3] : [2, 4];
    this.nextPlayer = null;
    return true;
  }

  _canPlay(player, card) {
    if (!_(this.hands[player - 1]).some(Sueca.cardEquals(card))) return false;
    if (!this.trickSuit) return true;
    return card.suit === this.trickSuit
        || _(this.hands[player - 1]).every(c => c.suit !== this.trickSuit);
  }

  _endTrick() {
    const trickCardsWhere = props =>
        _.chain(this.currentTrick).where(props).sortBy(c => -cardData[c.value].index).value();

    let winnerCard;
    let trumpCards = trickCardsWhere({ suit: this.trump.suit });
    if (trumpCards.length > 0) {
      winnerCard = trumpCards[0];
    } else {
      let trickSuitCards = trickCardsWhere({ suit: this.trickSuit });
      winnerCard = trickSuitCards[0];
    }

    let winnerPlayer = this.currentTrick.findIndex(Sueca.cardEquals(winnerCard)) + 1;
    this.score[Sueca.getTeam(winnerPlayer) - 1] +=
        _(this.currentTrick).reduce((acc, c) => acc + cardData[c.value].points, 0);

    this.trickSuit = null;
    this.lastTrick = this.currentTrick;
    this.currentTrick = [null, null, null, null];

    if (++this.tricksDone === 10) {
      this.nextPlayer = null;
      if (this.score[0] !== this.score[1]) {
        this.winners = this.score[0] > this.score[1] ? [1, 3] : [2, 4];
      } else {
        this.winners = [];
      }
    } else {
      this.nextPlayer = winnerPlayer;
    }
  }

  static generateDeck() {
    return _.chain(["clubs", "diamonds", "hearts", "spades"]).map(suit =>
        _(cardData).keys().map(value => ({ suit, value }))
    ).flatten().shuffle().value();
  }

  static getPlayerAfter(player) {
    return player % 4 + 1;
  }

  static getTeam(player) { return (player - 1) % 2 + 1; }

  static cardEquals(card) {
    if (!card) return () => false;
    return c => c && c.suit === card.suit && c.value === card.value;
  }
}

export default Sueca;
