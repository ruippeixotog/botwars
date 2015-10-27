import lazy from "lazy.js";
import { EventEmitter } from "events";

import AppDispatcher from "../AppDispatcher";
import GamesEvents from "../events/GamesEvents";

const GamesListStore = lazy(EventEmitter.prototype).extend({
  games: {},

  getGames: function (gameHref) {
    return this.games[gameHref];
  },

  _setGames: function (gameHref, gamesList) {
    this.games[gameHref] = gamesList;
  }

}).value();

AppDispatcher.register(function (action) {
  let { gameHref } = action;

  switch (action.actionType) {
    case GamesEvents.GAMES_LIST:
      GamesListStore._setGames(gameHref, action.games);
      GamesListStore.emit(GamesEvents.GAMES_LIST, gameHref);
      break;

    case GamesEvents.GAMES_LIST_ERROR:
      GamesListStore.emit(GamesEvents.GAMES_LIST_ERROR, gameHref);
      break;
  }
});

export default GamesListStore;
