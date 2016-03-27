import _ from "lodash";

import GameInstance from "./game_instance";
import Registry from "./registry";
import db from "../models/utils/database";

class GameRegistry extends Registry {
  constructor(Game) {
    super((id, params) => new GameInstance(id, new Game(params)));
  }

  restoreAllStoredGames(Game) {
    let gameRegistry = this;
    return db.games.getAll(Game.name)
        .then(games => games.forEach(game => gameRegistry.restore(game, GameInstance)));
  }

  getAllGamesInfo() {
    return _.map(this.instances, game => game.getInfo());
  }
}

export default GameRegistry;
