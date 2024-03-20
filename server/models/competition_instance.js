import db from "../models/utils/database";
import PlayerRegistry from "./player_registry";
import _ from "lodash";
import fs from "fs";
const config = JSON.parse(fs.readFileSync("config.json"));

const CompStatus = Object.freeze({
  NOT_STARTED: "not_started",
  STARTED: "started",
  ENDED: "ended",
  ERROR: "error"
});

class CompetitionInstance {
  constructor(id, comp, gameRegistry) {
    this.id = id;
    this.comp = comp;
    this.gameRegistry = gameRegistry;

    this.playerReg = new PlayerRegistry(comp.getPlayerCount());
    this.status = CompStatus.NOT_STARTED;
    this.currentGame = null;
    this.games = [];
  }

  static restore(storedObject) {
    let compClass = storedObject.comp.compClass;
    let competitionClassModule = _.find(config.competitions, { name: compClass }).serverModule;
    let CompetitionClass = require("../" + competitionClassModule).default;
    let competition = new CompetitionClass();
    let competitionInstance = new CompetitionInstance(
      storedObject.id, competition, storedObject.gameRegistry);

    competitionInstance.games = storedObject.games.map(
      game => competitionInstance.gameRegistry.instances[game.id]
    );

    return _.merge(competitionInstance, _.omit(storedObject, ["gameRegistry", "games"]));
  }

  getInfo() {
    return {
      compId: this.id,
      name: this.comp.getName(),
      type: this.comp.getType(),
      params: this.comp.getParams(),
      registeredPlayers: this.playerReg.getRegisteredCount(),
      players: this.comp.getPlayerCount(),
      gamesPlayed: this.games.length - (this.currentGame ? 1 : 0),
      status: this.status,
      ...(this.status === CompStatus.STARTED ? { currentGame: this.currentGame.id } : {}),
      ...(this.status === CompStatus.ENDED ? { winners: this.getWinners() } : {}),
      ...this.comp.getExtraInfo()
    };
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

  getWinners() {
    return this.hasStarted() ? this.comp.getWinners() : null;
  }

  _createNewGame(gameInfo, lastGame) {
    if (gameInfo) {
      let lastGameState = lastGame ? { lastGame: _.omit(lastGame.game, "params") } : {};
      let gameParams = { ...gameInfo.gameParams, ...lastGameState };
      let gameId = this.gameRegistry.create(gameParams);
      let game = this.currentGame = this.gameRegistry.get(gameId);
      gameInfo.players.forEach(p => game.registerNewPlayer(p, this.playerReg.getPlayerToken(p)));

      this.games.push(game);

      this.comp.onGameStart(game);
      game.on("end", () => this._createNewGame(this.comp.onGameEnd(game), game));

    } else {
      this.currentGame = null;
      this.status = this.comp.isEnded() ? CompStatus.ENDED : CompStatus.ERROR;
    }
    db.competitions.save(this);
  }
}

export default CompetitionInstance;
