import _ from "underscore";

import Competition from "./competition";

class Match extends Competition {
  constructor(params = {}) {
    super(params);
    this.playerCount = params.playerCount || 4; // TODO find a way to get a better default
    this.gameCount = params.gameCount || 10;
    this.playedGameCount = 0;
    this.winCount = _.times(this.playerCount, _.constant(0));

    this.gameInfo = {
      players: _.range(1, this.playerCount + 1),
      gameParams: this.gameParams
    }
  }

  getParams() {
    return this.params;
  }

  getPlayerCount() {
    return this.playerCount;
  }

  isEnded() {
    return this.playedGameCount === this.gameCount;
  }

  isError() {
    return this.currentGame && this.currentGame.isError();
  }

  getWinner() {
    let max = _.max(this.winCount);
    return _.findIndex(this.winCount, cnt => cnt === max) + 1;
  }

  start() {
    return this.gameInfo;
  }

  onGameStart(game) {
    this.currentGame = game;
  }

  onGameEnd(game) {
    this.winCount[game.getWinner() - 1]++;
    this.playedGameCount++;
    return this.isEnded() ? null : this.gameInfo;
  }

  getExtraInfo() {
    return {
      gamesTotal: this.gameCount,
      winCount: this.winCount
    };
  }
}

export default Match;
