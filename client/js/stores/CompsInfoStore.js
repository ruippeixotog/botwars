import lazy from "lazy.js";
import { EventEmitter } from "events";

import AppDispatcher from "../AppDispatcher";
import CompsEvents from "../events/CompsEvents";

const CompsInfoStore = lazy(EventEmitter.prototype).extend({
  compsList: {},
  comps: {},

  getComp: function (gameHref, compId) {
    this.comps[gameHref] = this.comps[gameHref] || {};
    return this.comps[gameHref][compId];
  },

  getComps: function (gameHref) {
    return this.compsList[gameHref];
  },

  _setComp: function (gameHref, compInfo) {
    this.comps[gameHref] = this.comps[gameHref] || {};
    this.comps[gameHref][compInfo.compId] = compInfo;
  },

  _setComps: function (gameHref, compsList) {
    this.compsList[gameHref] = compsList;

    this.comps[gameHref] = this.comps[gameHref] || {};
    compsList.forEach(info => { this.comps[gameHref][info.compId] = info; });
  }
}).value();

AppDispatcher.register(function (action) {
  let { gameHref } = action;

  switch (action.actionType) {
    case CompsEvents.COMP_INFO:
      CompsInfoStore._setComp(gameHref, action.competition);
      CompsInfoStore.emit(CompsEvents.COMP_INFO, gameHref, action.competition.compId);
      break;

    case CompsEvents.COMP_INFO_ERROR:
      CompsInfoStore.emit(CompsEvents.COMP_INFO_ERROR, gameHref);
      break;

    case CompsEvents.COMPS_LIST:
      CompsInfoStore._setComps(gameHref, action.competitions);
      CompsInfoStore.emit(CompsEvents.COMPS_LIST, gameHref);
      action.competitions.forEach(info => {
        CompsInfoStore.emit(CompsEvents.COMP_INFO, gameHref, info.compId);
      });
      break;

    case CompsEvents.COMPS_LIST_ERROR:
      CompsInfoStore.emit(CompsEvents.COMPS_LIST_ERROR, gameHref);
      break;
  }
});

export default CompsInfoStore;
