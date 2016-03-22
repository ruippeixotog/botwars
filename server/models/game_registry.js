import _ from "underscore";

import GameInstance from "./game_instance";
import Registry from "./registry";
import db from "../models/utils/database"

class GameRegistry extends Registry {
  constructor(Game) {
    super((id, params) => new GameInstance(id, new Game(params)));
  }

  restoreAllStoredGames(Game) {
    let gameRegistry = this;
    return db.games.getAll(Game.name)
        .then(games => games.forEach(gameRegistry.restore, gameRegistry));
  }

  getAllGamesInfo() {
    return _(this.instances).map(game => game.getInfo());
  }

  static getInstanceClass() {
    return GameInstance;
  }
}

export default GameRegistry;
