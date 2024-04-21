import { EventEmitter } from "events";
import _ from "lodash";

import AppDispatcher from "../AppDispatcher";
import CompsEvents from "../events/CompsEvents";
import { CompInfo } from "../types";

class CompStore {
  private info: CompInfo | Record<string, never>;
  private games: string[];
  private lastToken: string | null;

  constructor() {
    this.info = {};
    this.games = [];
    this.lastToken = null;
  }

  getInfo(): CompInfo | Record<string, never> { return this.info; }
  getGames(): string[] { return this.games; }
  getLastToken(): string | null { return this.lastToken; }

  _setInfo(info: CompInfo): void { this.info = info; }
  _setGames(games: string[]): void { this.games = games; }
  _setLastToken(playerToken: string): void { this.lastToken = playerToken; }
}

class CompsStore extends EventEmitter {
  private comps: { [gameHref: string]: { [compId: string]: CompStore} } = {};

  static instance = new CompsStore();

  getComp(gameHref: string, compId: string): CompStore {
    const forHref = this.comps[gameHref] = this.comps[gameHref] || {};
    return forHref[compId] = forHref[compId] || new CompStore();
  }

  getAllComps(gameHref: string): CompStore[] {
    const forHref = this.comps[gameHref] = this.comps[gameHref] || {};
    return _.values(forHref);
  }
}

AppDispatcher.register(function (action) {
  const { actionType, gameHref, compId, data, error } = action;
  const store = compId ? CompsStore.instance.getComp(gameHref, compId) : null;

  switch (actionType) {
    case CompsEvents.COMP_INFO:
      store!._setInfo(action.comp);
      CompsStore.instance.emit(actionType, gameHref, compId);
      break;

    case CompsEvents.COMP_INFO_ERROR:
      CompsStore.instance.emit(actionType, gameHref, compId, error);
      break;

    case CompsEvents.COMP_GAMES:
      store!._setGames(action.games.map(g => g.gameId));
      CompsStore.instance.emit(actionType, gameHref, compId);
      break;

    case CompsEvents.COMP_GAMES_ERROR:
      CompsStore.instance.emit(actionType, gameHref, compId, error);
      break;

    case CompsEvents.COMPS_LIST:
      action.comps.forEach(info => {
        CompsStore.instance.getComp(gameHref, info.compId)._setInfo(info);
        CompsStore.instance.emit(CompsEvents.COMP_INFO, gameHref, info.compId);
      });
      CompsStore.instance.emit(actionType, gameHref);
      break;

    case CompsEvents.COMPS_LIST_ERROR:
      CompsStore.instance.emit(actionType, gameHref, error);
      break;

    case CompsEvents.REGISTER_SUCCESS:
      store!._setLastToken(data.playerToken);
      CompsStore.instance.emit(actionType, gameHref, compId, data.playerToken);
      break;

    case CompsEvents.REGISTER_ERROR:
      CompsStore.instance.emit(actionType, gameHref, compId, error);
      break;

    case CompsEvents.COMP_ENTER:
      store!._setLastToken(action.playerToken);
      break;
  }
});

export default CompsStore.instance;
