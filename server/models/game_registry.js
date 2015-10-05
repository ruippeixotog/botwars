import crypto from "crypto";

import GameInstance from "./game_instance";

class GameRegistry {
  constructor(Game) {
    this.Game = Game;
    this.instances = {
      "0": new GameInstance('0', new Game({}))
    };
  }

  createNewGame(params) {
    var id = crypto.randomBytes(8).toString('hex');
    this.instances[id] = new GameInstance(id, new this.Game(params));
    return id;
  }

  getGameInstance(id) {
    return this.instances[id];
  }
}

export default GameRegistry;
