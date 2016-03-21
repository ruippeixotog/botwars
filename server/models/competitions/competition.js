class Competition {
  constructor({ name, ...params } = {}) {
    if (this.constructor === Competition) {
      throw new TypeError("Cannot construct Competition instances directly");
    }
    this.name = name;
    this.params = params;
    this.compClass = this.constructor.name;
  }

  getName() {
    return this.name;
  }

  getType() {
    throw new Error(this.constructor.name + ".getType not implemented");
  }

  getParams() {
    return this.params;
  }

  getPlayerCount() {
    throw new Error(this.constructor.name + ".getPlayerCount not implemented");
  }

  isEnded() {
    throw new Error(this.constructor.name + ".isEnded not implemented");
  }

  isError() {
    throw new Error(this.constructor.name + ".isError not implemented");
  }

  getWinners() {
    throw new Error(this.constructor.name + ".getWinners not implemented");
  }

  start() {
    throw new Error(this.constructor.name + ".start not implemented");
  }

  // onGameStart(game)
  onGameStart() {
  }

  // onGameEnd(game)
  onGameEnd() {
    throw new Error(this.constructor.name + ".onGameEnd not implemented");
  }

  getExtraInfo() {
    return {};
  }
}

export default Competition;
