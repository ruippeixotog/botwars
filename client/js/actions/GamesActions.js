import AppDispatcher from "../AppDispatcher";
import GamesEvents from "../events/GamesEvents";

var gameEvents = {
  history: [GamesEvents.HISTORY, e => e.history],
  start: [GamesEvents.START, e => e.state],
  state: [GamesEvents.STATE, e => e.state],
  move: [GamesEvents.MOVE, e => ({ player: e.player, move: e.move })],
  end: [GamesEvents.END, e => e.state]
};

var streams = {};

var GamesActions = {

  requestGameStream: function (gameHref, gameId) {
    if((streams[gameHref] || {})[gameId]) return;

    var ws = new WebSocket(`ws://${window.location.host}\/api${gameHref}\/${gameId}/stream?history=true`);
    streams[gameHref] = streams[gameHref] || {};
    streams[gameHref][gameId] = ws;

    var hasEnded = false;

    function dispatchEvent(actionType, data) {
      AppDispatcher.dispatch({
        actionType: actionType,
        gameHref: gameHref,
        gameId: gameId,
        data: data
      });
    }

    ws.onopen = function() {
      dispatchEvent(GamesEvents.CONNECTION_OPENED);
    };

    ws.onmessage = function(ev) {
      var event = JSON.parse(ev.data);
      if(event.eventType == "end") {
        hasEnded = true;
      }
      var [actionType, getData] = gameEvents[event.eventType];
      dispatchEvent(actionType, getData(event));
    };

    ws.onclose = function() {
      dispatchEvent(hasEnded || ws.closeRequested ?
          GamesEvents.CONNECTION_CLOSED : GamesEvents.CONNECTION_ERROR);
      delete streams[gameHref][gameId];
    };

    ws.onerror = ws.onclose;
  },

  closeGameStream: function (gameHref, gameId) {
    if(!(streams[gameHref] || {})[gameId]) return;
    streams[gameHref][gameId].closeRequested = true;
    streams[gameHref][gameId].close();
  }
};

export default GamesActions;
