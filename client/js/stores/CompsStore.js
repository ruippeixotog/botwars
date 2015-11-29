import lazy from "lazy.js";
import { EventEmitter } from "events";
import _ from "underscore";

import AppDispatcher from "../AppDispatcher";
import CompsEvents from "../events/CompsEvents";

class CompStore {
  constructor() {
    this.info = {};
    this.lastToken = null;
  }

  getInfo() { return this.info; }
  getLastToken() { return this.lastToken; }

  _setInfo(info) { this.info = info; }
  _setLastToken(playerToken) { this.lastToken = playerToken; }
}

const CompsStore = lazy(EventEmitter.prototype).extend({
  comps: {},

  getComp: function (gameHref, compId) {
    let forHref = this.comps[gameHref] = this.comps[gameHref] || {};
    return forHref[compId] = forHref[compId] || new CompStore();
  },

  getAllComps: function (gameHref) {
    let forHref = this.comps[gameHref] = this.comps[gameHref] || {};
    return _.values(forHref);
  }
}).value();

AppDispatcher.register(function (action) {
  let { actionType, gameHref, compId, data, error } = action;
  let store = compId ? CompsStore.getComp(gameHref, compId) : null;

  switch (actionType) {
    case CompsEvents.COMP_INFO:
      store._setInfo(action.comp);
      CompsStore.emit(actionType, gameHref, compId);
      break;

    case CompsEvents.COMP_INFO_ERROR:
      CompsStore.emit(actionType, gameHref, compId, error);
      break;

    case CompsEvents.COMPS_LIST:
      action.comps.forEach(info => {
        CompsStore.getComp(gameHref, info.compId)._setInfo(info);
        CompsStore.emit(CompsEvents.COMP_INFO, gameHref, info.compId);
      });
      CompsStore.emit(actionType, gameHref);
      break;

    case CompsEvents.COMPS_LIST_ERROR:
      CompsStore.emit(actionType, gameHref, error);
      break;

    case CompsEvents.REGISTER_SUCCESS:
      store._setLastToken(data.playerToken);
      CompsStore.emit(actionType, gameHref, compId, data.playerToken);
      break;

    case CompsEvents.REGISTER_ERROR:
      CompsStore.emit(actionType, gameHref, compId, error);
      break;
  }
});

export default CompsStore;
