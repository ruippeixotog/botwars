import lazy from "lazy.js";
import { EventEmitter } from "events";

import AppDispatcher from "../AppDispatcher";
import CompsEvents from "../events/CompsEvents";

class CompStore {
  constructor() {
    this.lastToken = null;
  }

  getLastToken() { return this.lastToken; }

  _setLastToken(playerToken) { this.lastToken = playerToken; }
}

const CompsStore = lazy(EventEmitter.prototype).extend({
  games: {},

  getComp: function (gameHref, gameId) {
    let games = this.games[gameHref] = this.games[gameHref] || {};
    return games[gameId] = games[gameId] || new CompStore();
  }
}).value();

AppDispatcher.register(function (action) {
  const { actionType, gameHref, compId, playerToken, data } = action;
  let store = CompsStore.getComp(gameHref, compId);

  if (playerToken) {
    store._setLastToken(playerToken);
  }

  switch (actionType) {
    case CompsEvents.REGISTER_SUCCESS:
      CompsStore.emit(actionType, gameHref, compId, data.playerToken);
      break;

    case CompsEvents.REGISTER_ERROR:
      CompsStore.emit(actionType, gameHref, compId, data);
      break;
  }
});

export default CompsStore;
