import crypto from "crypto";
import _ from "underscore";

import GameInstance from "./game_instance";

class GameRegistry {
  constructor(Game) {
    this.Game = Game;
    this.instances = {
      "0": new GameInstance("0", new Game({ moveTimeLimit: 1000 }))
    };
  }

  createNewGame(params) {
    var id = crypto.randomBytes(8).toString("hex");
    this.instances[id] = new GameInstance(id, new this.Game(params || {}));
    return id;
  }

  getGameInstance(id) {
    return this.instances[id];
  }

  getAllGamesInfo() {
    return _(this.instances).map(game => game.getInfo());
  }
}

export default GameRegistry;
