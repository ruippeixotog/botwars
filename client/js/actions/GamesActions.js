import AppDispatcher from "../AppDispatcher";
import GamesEvents from "../events/GamesEvents";

import API from "../utils/API";

let gameEvents = {
  info: [GamesEvents.INFO, e => ({ player: e.player })],
  history: [GamesEvents.HISTORY, e => e.history],
  start: [GamesEvents.START, e => e.state],
  state: [GamesEvents.STATE, e => e.state],
  move: [GamesEvents.MOVE, e => ({ player: e.player, move: e.move })],
  requestMove: [GamesEvents.REQUEST_MOVE, e => e.state],
  end: [GamesEvents.END, e => e.state]
};

let streams = {};

let GamesActions = {

  retrieveGamesList: function (gameHref) {
    API.gameHref(gameHref).games().all((error, games) => {
      let actionType = error ? GamesEvents.GAMES_LIST_ERROR : GamesEvents.GAMES_LIST;
      AppDispatcher.dispatch({ actionType, gameHref, games, error });
    });
  },

  retrieveGameInfo: function (gameHref, gameId) {
    API.gameHref(gameHref).games().gameId(gameId).info((error, game) => {
      let actionType = error ? GamesEvents.GAME_INFO_ERROR : GamesEvents.GAME_INFO;
      AppDispatcher.dispatch({ actionType, gameHref, gameId, game, error });
    });
  },

  register: function (gameHref, gameId) {
    API.gameHref(gameHref).games().gameId(gameId).register((error, data) => {
      let actionType = error ? GamesEvents.REGISTER_ERROR : GamesEvents.REGISTER_SUCCESS;
      AppDispatcher.dispatch({ actionType, gameHref, gameId, data, error });
    });
  },

  requestGameStream: function (gameHref, gameId, playerToken) {
    if ((streams[gameHref] || {})[gameId]) return;

    let params = { history: true, playerToken: playerToken };
    API.gameHref(gameHref).games().gameId(gameId).stream(params, (error, ws) => {
      streams[gameHref] = streams[gameHref] || {};
      streams[gameHref][gameId] = ws;

      let hasEnded = false;

      function dispatchEvent(actionType, data) {
        AppDispatcher.dispatch({ actionType, gameHref, gameId, playerToken, data });
      }

      ws.onopen = function () {
        dispatchEvent(GamesEvents.CONNECTION_OPENED);
      };

      ws.onmessage = function (ev) {
        let event = JSON.parse(ev.data);
        if (event.eventType === "end") {
          hasEnded = true;
        }
        let [actionType, getData] = gameEvents[event.eventType];
        dispatchEvent(actionType, getData(event));
      };

      ws.onclose = function () {
        dispatchEvent(hasEnded || ws.closeRequested ?
          GamesEvents.CONNECTION_CLOSED : GamesEvents.CONNECTION_ERROR);
        delete streams[gameHref][gameId];
      };

      ws.onerror = ws.onclose;
    });
  },

  sendMove: function (gameHref, gameId, move) {
    if (!(streams[gameHref] || {})[gameId]) return;
    streams[gameHref][gameId].send(JSON.stringify(move));
  },

  closeGameStream: function (gameHref, gameId) {
    if (!(streams[gameHref] || {})[gameId]) return;
    streams[gameHref][gameId].closeRequested = true;
    streams[gameHref][gameId].close();
  }
};

export default GamesActions;
