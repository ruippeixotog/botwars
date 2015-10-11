import crypto from "crypto";
import deepcopy from "./utils/deepcopy";

import {EventEmitter} from "events";

class GameInstance extends EventEmitter {
  constructor(id, game) {
    super();
    this.id = id;
    this.game = game;
    this.started = false;
    this.history = { events: [], next: null };

    this.currentPlayerCount = 0;
    this.connectedPlayerCount = 0;
    this.playerIdTable = {};
    this.playerState = {};

    for(let event of ["start", "stateChange"]) {
      this.on(event, function() {
        if(this.history.next) {
          this.history.events.push({ eventType: "state", fullState: this.history.next });
        }
        this.history.next = deepcopy(this.game.getFullState());
      });
    }

    this.on("move", function(player, move) {
      if(this.history.next) {
        this.history.events.push({ eventType: "state", fullState: this.history.next });
        this.history.next = null;
      }
      this.history.events.push({ eventType: "move", player, move });
    });
  }

  registerNewPlayer() {
    if(this.currentPlayerCount < this.game.getPlayerCount()) {
      var playerId = crypto.randomBytes(20).toString("hex");
      var player = ++this.currentPlayerCount;

      this.playerIdTable[playerId] = player;
      this.playerState[player] = { connectedOnce: false };
      return { player: player, playerId: playerId };
    }
    return null;
  }

  getPlayer(playerId) {
    return this.playerIdTable[playerId];
  }

  connect(player) {
    if(this.playerState[player].connectedOnce) return;

    this.connectedPlayerCount++;
    this.playerState[player].connectedOnce = true;

    if(!this.started && this.connectedPlayerCount == this.game.getPlayerCount()) {
      this.started = true;
      this.emit("start");

      if (!this.game.isEnded()) {
        this.emit("waitingForMove", this.game.getNextPlayer());
      } else {
        this.emit("end");
      }
    }
  }

  hasStarted() {
    return this.started;
  }

  isEnded() {
    return this.started ? this.game.isEnded() : null;
  }

  move(player, move) {
    if(!this.started) return null;

    if (this.game.isEnded() || !this.game.isValidMove(player, move))
      return false;

    this.game.move(player, move);
    this.emit("move", player, move);

    if (!this.game.isEnded()) {
      this.emit("stateChange");
      this.emit("waitingForMove", this.game.getNextPlayer());
    } else {
      this.emit("end");
    }
    return true;
  }

  getNextPlayer() {
    return this.started ? this.game.getNextPlayer() : null;
  }

  getState(player) {
    return this.started ? this.game.getState(player) : null;
  }

  getHistory(player) {
    return this.history.events.map(histEvent =>
      histEvent.eventType == "move" ? histEvent :
        { eventType: "state", state: this.game.getStateView(histEvent.fullState, player) }
    );
  }
}

export default GameInstance;
