import lazy from "lazy.js";
import { EventEmitter } from "events";

import AppDispatcher from "../AppDispatcher";
import GamesEvents from "../events/GamesEvents";

const GamesInfoStore = lazy(EventEmitter.prototype).extend({
  gamesList: {},
  games: {},

  getGame: function (gameHref, gameId) {
    this.games[gameHref] = this.games[gameHref] || {};
    return this.games[gameHref][gameId];
  },

  getGames: function (gameHref) {
    return this.gamesList[gameHref];
  },

  _setGame: function (gameHref, gameInfo) {
    this.games[gameHref] = this.games[gameHref] || {};
    this.games[gameHref][gameInfo.gameId] = gameInfo;
  },

  _setGames: function (gameHref, gamesList) {
    this.gamesList[gameHref] = gamesList;

    this.games[gameHref] = this.games[gameHref] || {};
    gamesList.forEach(info => { this.games[gameHref][info.gameId] = info; });
  }
}).value();

AppDispatcher.register(function (action) {
  let { gameHref } = action;

  switch (action.actionType) {
    case GamesEvents.GAME_INFO:
      GamesInfoStore._setGame(gameHref, action.game);
      GamesInfoStore.emit(GamesEvents.GAME_INFO, gameHref, action.game.gameId);
      break;

    case GamesEvents.GAME_INFO_ERROR:
      GamesInfoStore.emit(GamesEvents.GAME_INFO_ERROR, gameHref);
      break;

    case GamesEvents.GAMES_LIST:
      GamesInfoStore._setGames(gameHref, action.games);
      GamesInfoStore.emit(GamesEvents.GAMES_LIST, gameHref);
      action.games.forEach(info => {
        GamesInfoStore.emit(GamesEvents.GAME_INFO, gameHref, info.gameId);
      });
      break;

    case GamesEvents.GAMES_LIST_ERROR:
      GamesInfoStore.emit(GamesEvents.GAMES_LIST_ERROR, gameHref);
      break;
  }
});

export default GamesInfoStore;
