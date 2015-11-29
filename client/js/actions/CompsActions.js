import AppDispatcher from "../AppDispatcher";
import CompsEvents from "../events/CompsEvents";

import API from "../utils/API";

let CompsActions = {

  retrieveCompInfo: function (gameHref, compId) {
    API.gameHref(gameHref).competitions().compId(compId).info((error, comp) => {
      let actionType = error ? CompsEvents.COMP_INFO_ERROR : CompsEvents.COMP_INFO;
      AppDispatcher.dispatch({ actionType, gameHref, compId, comp, error });
    });
  },

  retrieveCompsList: function (gameHref) {
    API.gameHref(gameHref).competitions().all((error, comps) => {
      let actionType = error ? CompsEvents.COMPS_LIST_ERROR : CompsEvents.COMPS_LIST;
      AppDispatcher.dispatch({ actionType, gameHref, comps, error });
    });
  },

  register: function (gameHref, compId) {
    API.gameHref(gameHref).competitions().compId(compId).register((error, data) => {
      let actionType = error ? CompsEvents.REGISTER_ERROR : CompsEvents.REGISTER_SUCCESS;
      AppDispatcher.dispatch({ actionType, gameHref, compId, data, error });
    });
  }
};

export default CompsActions;
