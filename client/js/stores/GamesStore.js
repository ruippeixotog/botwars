import {EventEmitter} from "events";
import AppDispatcher from "../AppDispatcher";
import GamesEvents from "../events/GamesEvents";

var GamesStore = new EventEmitter();

GamesStore.games = {};

GamesStore.getGameState = function(gameHref, gameId) {
  return (this.games[gameHref] || {})[gameId];
};

GamesStore.setGameState = function(gameHref, gameId, state) {
  this.games[gameHref] = this.games[gameHref] || {};
  this.games[gameHref][gameId] = state;
};

AppDispatcher.register(function (action) {
  switch (action.actionType) {
    case GamesEvents.START:
    case GamesEvents.STATE:
    case GamesEvents.END:
      GamesStore.setGameState(action.gameHref, action.gameId, action.data);
      GamesStore.emit(GamesEvents.STATE_CHANGE, action.gameHref, action.gameId);
      break;

    case GamesEvents.CONNECTION_OPENED:
    case GamesEvents.CONNECTION_CLOSED:
    case GamesEvents.CONNECTION_ERROR:
      GamesStore.emit(action.actionType, action.gameHref, action.gameId);
      break;
  }
});

export default GamesStore;
