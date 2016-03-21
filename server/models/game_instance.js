import deepcopy from "./utils/deepcopy";

import { EventEmitter } from "events";
import PlayerRegistry from "./player_registry";
import Timer from "./utils/timer";
import _ from "underscore";
import lodash from "lodash";
import db from "./utils/database";
import fs from "fs";
const config = JSON.parse(fs.readFileSync("config.json"));

const GameStatus = Object.freeze({
  NOT_STARTED: "not_started",
  STARTED: "started",
  ENDED: "ended",
  ERROR: "error"
});

class GameInstance extends EventEmitter {
  constructor(id, game) {
    super();
    this.id = id;
    this.game = game;
    this.status = GameStatus.NOT_STARTED;
    this.moveTimer = new Timer();
    this.history = { events: [], next: null };

    this.playerReg = new PlayerRegistry(game.getPlayerCount());

    for (let event of ["start", "stateChange"]) {
      this.on(event, function () {
        if (this.history.next) {
          this.history.events.push({ eventType: "state", fullState: this.history.next });
        }
        this.history.next = deepcopy(this.game.getFullState());
      });
    }

    this.on("move", function (player, move) {
      if (this.history.next !== null) {
        this.history.events.push({ eventType: "state", fullState: this.history.next });
        this.history.next = null;
      }
      this.history.events.push({ eventType: "move", player, move });
    });
  }

  static restore(storedObject) {
    let gameClassModule = _.find(config.games, { name: storedObject.game.gameClass }).serverModule;
    let GameClass = require('../' + gameClassModule).default;
    let game = new GameClass();
    let newGameInstance = new GameInstance(storedObject.id, game);
    return lodash.merge(newGameInstance, storedObject);
  }

  getInfo() {
    return {
      gameId: this.id,
      name: this.game.getName(),
      params: this.game.getParams(),
      registeredPlayers: this.playerReg.getRegisteredCount(),
      connectedPlayers: this.playerReg.getConnectedCount(),
      players: this.game.getPlayerCount(),
      status: this.status,
      ...(this.status === GameStatus.STARTED ? { nextPlayer: this.getNextPlayer() } : {}),
      ...(this.status === GameStatus.ENDED ? { winners: this.getWinners() } : {})
    }
  }

  registerNewPlayer(player, playerToken) {
    return this.playerReg.register(player, playerToken);
  }

  getPlayer(playerToken) {
    return this.playerReg.getPlayer(playerToken);
  }

  connect(player) {
    if (this.playerReg.connect(player)) {
      this.status = GameStatus.STARTED;
      this.emit("start");
      this._onStateChange({ announceState: false });
    }
  }

  hasStarted() {
    return this.status !== GameStatus.NOT_STARTED;
  }

  isEnded() {
    return this.hasStarted() ? this.game.isEnded() : null;
  }

  move(player, move) {
    if (!this.hasStarted()) return null;

    if (this.game.isEnded() || !this.game.isValidMove(player, move))
      return false;

    let moveTime = this.moveTimer.stop();
    this.game.move(player, move, moveTime);
    this.emit("move", player, move);

    this._onStateChange();
    return true;
  }

  getNextPlayer() {
    return this.hasStarted() ? this.game.getNextPlayer() : null;
  }

  getState(player) {
    return this.hasStarted() ? this.game.getState(player) : null;
  }

  getWinners() {
    return this.hasStarted() ? this.game.getWinners() : null;
  }

  getHistory(player) {
    return this.history.events.map(histEvent =>
      histEvent.eventType === "move" ? histEvent :
        { eventType: "state", state: this.game.getStateView(histEvent.fullState, player) }
    );
  }

  _onStateChange({ announceState = true, announceMove = true } = {}) {
    if (!this.game.isEnded()) {
      if (announceState) this.emit("stateChange");
      if (announceMove) this.emit("waitingForMove", this.game.getNextPlayer());

      this.moveTimer.start(this._onMoveTimeout.bind(this), this.game.getMoveTimeLimit());
    } else {
      this.status = this.game.isError() ? GameStatus.ERROR : GameStatus.ENDED;
      this.emit("end");
    }
    db.games.save(this);
  }

  _onMoveTimeout() {
    let oldNextPlayer = this.game.getNextPlayer();
    if (this.game.onMoveTimeout()) {
      this._onStateChange({ announceMove: this.game.getNextPlayer() !== oldNextPlayer });
    }
  }
}

export default GameInstance;
