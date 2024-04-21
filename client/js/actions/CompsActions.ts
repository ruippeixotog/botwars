import AppDispatcher from "../AppDispatcher";
import CompsEvents from "../events/CompsEvents";

import API from "../utils/API";

const CompsActions = {

  retrieveCompsList: function (gameHref: string) {
    API.gameHref(gameHref).competitions().all((error, comps) => {
      const actionType = error ? CompsEvents.COMPS_LIST_ERROR : CompsEvents.COMPS_LIST;
      AppDispatcher.dispatch({ actionType, gameHref, comps, error });
    });
  },

  retrieveCompInfo: function (gameHref: string, compId: string) {
    API.gameHref(gameHref).competitions().compId(compId).info((error, comp) => {
      const actionType = error ? CompsEvents.COMP_INFO_ERROR : CompsEvents.COMP_INFO;
      AppDispatcher.dispatch({ actionType, gameHref, compId, comp, error });
    });
  },

  retrieveCompGames: function (gameHref: string, compId: string) {
    API.gameHref(gameHref).competitions().compId(compId).games((error, games) => {
      const actionType = error ? CompsEvents.COMP_GAMES_ERROR : CompsEvents.COMP_GAMES;
      AppDispatcher.dispatch({ actionType, gameHref, compId, games, error });
    });
  },

  register: function (gameHref: string, compId: string) {
    API.gameHref(gameHref).competitions().compId(compId).register((error, data) => {
      const actionType = error ? CompsEvents.REGISTER_ERROR : CompsEvents.REGISTER_SUCCESS;
      AppDispatcher.dispatch({ actionType, gameHref, compId, data, error });
    });
  },

  enter: function (gameHref: string, compId: string, playerToken: string) {
    setTimeout(() => AppDispatcher.dispatch({
      actionType: CompsEvents.COMP_ENTER, gameHref, compId, playerToken
    }));
  }
};

export default CompsActions;
