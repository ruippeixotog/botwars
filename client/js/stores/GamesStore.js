import lazy from "lazy.js";
import { EventEmitter } from "events";
import _ from "underscore";

import AppDispatcher from "../AppDispatcher";
import GameStatus from "../constants/GameStatus";
import CompsEvents from "../events/CompsEvents";
import GamesEvents from "../events/GamesEvents";

class GameStore {
  constructor() {
    this.info = { status: GameStatus.NOT_STARTED };
    this.player = null;
    this.lastToken = null;
    this.states = [];
  }

  getInfo() { return this.info; }
  getPlayer() { return this.player; }
  getLastToken() { return this.lastToken; }
  getStatus() { return this.info.status; }

  getState(i) { return this.states[i]; }
  getCurrentState() { return this.states[this.states.length - 1]; }
  getAllStates() { return this.states; }
  getStateCount() { return this.states.length; }

  _setInfo(info) { this.info = info; }
  _setPlayer(player) { this.player = player; }
  _setLastToken(playerToken) { this.lastToken = playerToken; }
  _setStatus(status) { this.info.status = status; }

  _pushState(state) { this.states.push(state); }
  _setAllStates(states) { this.states = states; }
}

const GamesStore = lazy(EventEmitter.prototype).extend({
  games: {},

  getGame: function (gameHref, gameId) {
    let games = this.games[gameHref] = this.games[gameHref] || {};
    return games[gameId] = games[gameId] || new GameStore();
  },

  getAllGames: function (gameHref) {
    let forHref = this.games[gameHref] = this.games[gameHref] || {};
    return _.values(forHref);
  }
}).value();

AppDispatcher.register(function (action) {
  const { actionType, gameHref, gameId, data, error } = action;
  let store = gameId ? GamesStore.getGame(gameHref, gameId) : null;

  switch (actionType) {
    case GamesEvents.GAME_INFO:
      store._setInfo(action.game);
      GamesStore.emit(actionType, gameHref, gameId);
      break;

    case GamesEvents.GAME_INFO_ERROR:
      GamesStore.emit(actionType, gameHref, gameId, error);
      break;

    case GamesEvents.GAMES_LIST:
      action.games.forEach(info => {
        GamesStore.getGame(gameHref, info.gameId)._setInfo(info);
        GamesStore.emit(GamesEvents.GAME_INFO, gameHref, info.gameId);
      });
      GamesStore.emit(actionType, gameHref);
      break;

    case GamesEvents.GAMES_LIST_ERROR:
      GamesStore.emit(actionType, gameHref, error);
      break;

    case CompsEvents.COMP_GAMES:
      action.games.forEach(info => {
        GamesStore.getGame(gameHref, info.gameId)._setInfo(info);
        GamesStore.emit(GamesEvents.GAME_INFO, gameHref, info.gameId);
      });
      break;

    case GamesEvents.REGISTER_SUCCESS:
      store._setLastToken(data.playerToken);
      GamesStore.emit(actionType, gameHref, gameId, data.playerToken);
      break;

    case GamesEvents.REGISTER_ERROR:
      GamesStore.emit(actionType, gameHref, gameId, error);
      break;

    case GamesEvents.INFO:
      store._setPlayer(data.player);
      GamesStore.emit(actionType, gameHref, gameId);
      break;

    case GamesEvents.HISTORY:
      store._setAllStates(
          lazy(data).filter(e => e.eventType === "state").map(e => e.state).value());
      break;

    case GamesEvents.START:
    case GamesEvents.STATE:
      store._setStatus(GameStatus.STARTED);
      store._pushState(data);
      GamesStore.emit(GamesEvents.NEW_STATE, gameHref, gameId);
      break;

    case GamesEvents.END:
      store._setStatus(GameStatus.ENDED);
      store._pushState(data);
      GamesStore.emit(GamesEvents.NEW_STATE, gameHref, gameId);
      break;

    case GamesEvents.CONNECTION_OPENED:
      store._setLastToken(action.playerToken);
      store._setAllStates([]);
      GamesStore.emit(actionType, gameHref, gameId);
      break;

    case GamesEvents.CONNECTION_CLOSED:
    case GamesEvents.CONNECTION_ERROR:
      GamesStore.emit(actionType, gameHref, gameId);
      break;
  }
});

export default GamesStore;
