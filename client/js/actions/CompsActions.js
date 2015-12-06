import AppDispatcher from "../AppDispatcher";
import CompsEvents from "../events/CompsEvents";

import API from "../utils/API";

let CompsActions = {

  retrieveCompsList: function (gameHref) {
    API.gameHref(gameHref).competitions().all((error, comps) => {
      let actionType = error ? CompsEvents.COMPS_LIST_ERROR : CompsEvents.COMPS_LIST;
      AppDispatcher.dispatch({ actionType, gameHref, comps, error });
    });
  },

  retrieveCompInfo: function (gameHref, compId) {
    API.gameHref(gameHref).competitions().compId(compId).info((error, comp) => {
      let actionType = error ? CompsEvents.COMP_INFO_ERROR : CompsEvents.COMP_INFO;
      AppDispatcher.dispatch({ actionType, gameHref, compId, comp, error });
    });
  },

  retrieveCompGames: function (gameHref, compId) {
    API.gameHref(gameHref).competitions().compId(compId).games((error, games) => {
      let actionType = error ? CompsEvents.COMP_GAMES_ERROR : CompsEvents.COMP_GAMES;
      AppDispatcher.dispatch({ actionType, gameHref, compId, games, error });
    });
  },

  register: function (gameHref, compId) {
    API.gameHref(gameHref).competitions().compId(compId).register((error, data) => {
      let actionType = error ? CompsEvents.REGISTER_ERROR : CompsEvents.REGISTER_SUCCESS;
      AppDispatcher.dispatch({ actionType, gameHref, compId, data, error });
    });
  },

  enter: function (gameHref, compId, playerToken) {
    setTimeout(() => AppDispatcher.dispatch({
      actionType: CompsEvents.COMP_ENTER, gameHref, compId, playerToken
    }));
  }
};

export default CompsActions;
