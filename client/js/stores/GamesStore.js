import lazy from "lazy.js";

import { EventEmitter } from "events";
import AppDispatcher from "../AppDispatcher";
import GamesEvents from "../events/GamesEvents";

class GameStore {
  constructor() {
    this.states = [];
    this.player = null;
    this.lastToken = null;
  }

  getPlayer() { return this.player; }
  getLastToken() { return this.lastToken; }

  getState(i) { return this.states[i]; }
  getCurrentState() { return this.states[this.states.length - 1]; }
  getAllStates() { return this.states; }
  getStateCount() { return this.states.length; }

  _setPlayer(player) { this.player = player; }
  _setLastToken(playerToken) { this.lastToken = playerToken; }
  _pushState(state) { this.states.push(state); }
  _setAllStates(states) { this.states = states; }
}

const GamesStore = lazy(EventEmitter.prototype).extend({
  games: {},

  getGame: function (gameHref, gameId) {
    var games = this.games[gameHref] = this.games[gameHref] || {};
    return games[gameId] = games[gameId] || new GameStore();
  }
}).value();

AppDispatcher.register(function (action) {
  const { actionType, gameHref, gameId, playerToken, data } = action;

  if (playerToken) {
    GamesStore.getGame(gameHref, gameId)._setLastToken(playerToken);
  }

  switch (actionType) {
    case GamesEvents.REGISTER_SUCCESS:
      GamesStore.emit(actionType, gameHref, gameId, data.playerToken);
      break;

    case GamesEvents.REGISTER_ERROR:
      GamesStore.emit(actionType, gameHref, gameId, data);
      break;

    case GamesEvents.INFO:
      GamesStore.getGame(gameHref, gameId)._setPlayer(data.player);
      GamesStore.emit(actionType, gameHref, gameId);
      break;

    case GamesEvents.HISTORY:
      GamesStore.getGame(gameHref, gameId)._setAllStates(
          lazy(data).filter(e => e.eventType === "state").map(e => e.state).value());
      break;

    case GamesEvents.START:
    case GamesEvents.STATE:
    case GamesEvents.END:
      GamesStore.getGame(gameHref, gameId)._pushState(data);
      GamesStore.emit(GamesEvents.NEW_STATE, gameHref, gameId);
      break;

    case GamesEvents.CONNECTION_OPENED:
      GamesStore.getGame(gameHref, gameId)._setAllStates([]);
      GamesStore.emit(actionType, gameHref, gameId);
      break;

    case GamesEvents.CONNECTION_CLOSED:
    case GamesEvents.CONNECTION_ERROR:
      GamesStore.emit(actionType, gameHref, gameId);
      break;
  }
});

export default GamesStore;
