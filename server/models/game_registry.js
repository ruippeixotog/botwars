import _ from "underscore";

import GameInstance from "./game_instance";
import Registry from "./registry";

class GameRegistry extends Registry {
  constructor(Game) {
    super((id, params) => new GameInstance(id, new Game(params)));
  }

  getAllGamesInfo() {
    return _(this.instances).map(game => game.getInfo());
  }
}

export default GameRegistry;
