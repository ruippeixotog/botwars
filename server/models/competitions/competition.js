class Competition {
  constructor(params = {}) {
    if (this.constructor === Competition) {
      throw new TypeError("Cannot construct Competition instances directly");
    }
    this.params = params;
    this.gameParams = params.gameParams || {};
  }

  getParams() {
    return this.params;
  }

  getPlayerCount() {
    throw new Error(this.constructor + ".getPlayerCount not implemented");
  }

  isEnded() {
    throw new Error(this.constructor + ".isEnded not implemented");
  }

  isError() {
    throw new Error(this.constructor + ".isError not implemented");
  }

  getWinner() {
    throw new Error(this.constructor + ".getWinner not implemented");
  }

  start() {
    throw new Error(this.constructor + ".start not implemented");
  }

  // onGameStart(game)
  onGameStart() {
  }

  // onGameEnd(game)
  onGameEnd() {
    throw new Error(this.constructor + ".onGameEnd not implemented");
  }

  getExtraInfo() {
    return {};
  }
}

export default Competition;
