import PlayerRegistry from "./player_registry";

const CompStatus = Object.freeze({
  NOT_STARTED: "not_started",
  STARTED: "started",
  ENDED: "ended",
  ERROR: "error"
});

class CompetitionInstance {
  constructor(id, comp, gameEngine) {
    this.id = id;
    this.comp = comp;
    this.gameEngine = gameEngine;

    this.playerReg = new PlayerRegistry(comp.getPlayerCount());
    this.status = CompStatus.NOT_STARTED;
    this.currentGame = null;
    this.games = [];
  }

  getInfo() {
    return {
      compId: this.id,
      params: this.comp.getParams(),
      registeredPlayers: this.playerReg.getRegisteredCount(),
      players: this.comp.getPlayerCount(),
      gamesPlayed: this.games.length - (this.currentGame ? 1 : 0),
      status: this.status,
      ...(this.status === CompStatus.STARTED ? { currentGame: this.currentGame.id } : {}),
      ...(this.status === CompStatus.ENDED ? { winner: this.getWinner() } : {}),
      ...this.comp.getExtraInfo()
    }
  }

  registerNewPlayer(player, playerToken) {
    let playerRes = this.playerReg.register(player, playerToken);

    if (this.playerReg.getRegisteredCount() === this.comp.getPlayerCount()) {
      this.status = CompStatus.STARTED;
      this._createNewGame(this.comp.start());
    }

    return playerRes;
  }

  getPlayer(playerToken) {
    return this.playerReg.getPlayer(playerToken);
  }

  hasStarted() {
    return this.status !== CompStatus.NOT_STARTED;
  }

  isEnded() {
    return this.hasStarted() ? this.comp.isEnded() : null;
  }

  getGames() {
    return this.games;
  }

  getCurrentGame() {
    return this.hasStarted() ? this.currentGame : null;
  }

  getWinner() {
    return this.hasStarted() ? this.comp.getWinner() : null;
  }

  _createNewGame(gameInfo) {
    if (gameInfo) {
      let gameId = this.gameEngine.create(gameInfo.gameParams);
      let game = this.currentGame = this.gameEngine.get(gameId);
      gameInfo.players.forEach(p => game.registerNewPlayer(p, this.playerReg.getPlayerToken(p)));

      this.games.push(game);

      this.comp.onGameStart(game);
      game.on("end", () => this._createNewGame(this.comp.onGameEnd(game)));

    } else {
      this.currentGame = null;
      this.status = this.comp.isEnded() ? CompStatus.ENDED : CompStatus.ERROR;
    }
  }
}

export default CompetitionInstance;
