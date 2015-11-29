import AppDispatcher from "../AppDispatcher";
import GamesEvents from "../events/GamesEvents";
import request from "superagent";

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

  retrieveGameInfo: function (gameHref, gameId) {
    request.get(`/api${gameHref}/games/${gameId}`)
        .set("Accept", "application/json")
        .end(function (err, res) {
          AppDispatcher.dispatch({
            actionType: err ? GamesEvents.GAME_INFO_ERROR : GamesEvents.GAME_INFO,
            gameHref: gameHref,
            gameId: gameId,
            game: res.body,
            error: err
          });
        });
  },

  retrieveGamesList: function (gameHref) {
    request.get(`/api${gameHref}/games`)
        .set("Accept", "application/json")
        .end(function (err, res) {
          AppDispatcher.dispatch({
            actionType: err ? GamesEvents.GAMES_LIST_ERROR : GamesEvents.GAMES_LIST,
            gameHref: gameHref,
            games: res.body,
            error: err
          });
        });
  },

  register: function (gameHref, gameId) {
    request.post(`/api${gameHref}/games/${gameId}/register`)
        .set("Accept", "application/json")
        .end(function (err, res) {
          AppDispatcher.dispatch({
            actionType: err ? GamesEvents.REGISTER_ERROR : GamesEvents.REGISTER_SUCCESS,
            gameHref: gameHref,
            gameId: gameId,
            data: res.body,
            error: err
          });
        });
  },

  requestGameStream: function (gameHref, gameId, playerToken) {
    if ((streams[gameHref] || {})[gameId]) return;

    let query = "history=true";
    if (playerToken) query += `&playerToken=${playerToken}`;

    let wsUri = `ws://${window.location.host}\/api${gameHref}/games/${gameId}/stream?${query}`;
    let ws = new WebSocket(wsUri);
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
