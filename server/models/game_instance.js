import crypto from "crypto";
import deepcopy from "./utils/deepcopy";
import Timer from "./utils/timer";

import { EventEmitter } from "events";

const GameStatus = Object.freeze({
  NOT_STARTED: "not_started",
  STARTED: "started",
  ENDED: "ended"
});

class GameInstance extends EventEmitter {
  constructor(id, game) {
    super();
    this.id = id;
    this.game = game;
    this.status = GameStatus.NOT_STARTED;
    this.moveTimer = new Timer();
    this.history = { events: [], next: null };

    this.currentPlayerCount = 0;
    this.connectedPlayerCount = 0;
    this.playerTokenTable = {};
    this.playerState = {};

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

  getInfo() {
    return {
      gameId: this.id,
      status: this.status,
      params: this.game.getParams()
    }
  }

  registerNewPlayer() {
    if (this.currentPlayerCount < this.game.getPlayerCount()) {
      var playerToken = crypto.randomBytes(20).toString("hex");
      var player = ++this.currentPlayerCount;

      this.playerTokenTable[playerToken] = player;
      this.playerState[player] = { connectedOnce: false };
      return { player, playerToken };
    }
    return null;
  }

  getPlayer(playerToken) {
    return this.playerTokenTable[playerToken];
  }

  connect(player) {
    if (this.playerState[player].connectedOnce) return;

    this.connectedPlayerCount++;
    this.playerState[player].connectedOnce = true;

    if (!this.hasStarted() && this.connectedPlayerCount === this.game.getPlayerCount()) {
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

    var moveTime = this.moveTimer.stop();
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
      this.status = GameStatus.ENDED;
      this.emit("end");
    }
  }

  _onMoveTimeout() {
    var oldNextPlayer = this.game.getNextPlayer();
    if (this.game.onMoveTimeout()) {
      this._onStateChange({ announceMove: this.game.getNextPlayer() !== oldNextPlayer });
    }
  }
}

export default GameInstance;
