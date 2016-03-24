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
      gameParams: params.gameParams
    };
  }

  getType() {
    return "match";
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

  getWinners() {
    let max = 0, maxPlayers = [];
    for (let i = 0; i < this.playerCount; i++) {
      if (this.winCount[i] > max) { max = this.winCount[i]; maxPlayers = [i + 1]; }
      else if (this.winCount[i] === max) { maxPlayers.push(i + 1); }
    }
    return maxPlayers;
  }

  start() {
    return this.gameInfo;
  }

  onGameStart(game) {
    this.currentGame = game;
  }

  onGameEnd(game) {
    game.getWinners().forEach(p => { this.winCount[p - 1]++; });
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
