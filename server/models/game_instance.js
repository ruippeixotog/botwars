import crypto from "crypto";

import {EventEmitter} from "events";

class GameInstance extends EventEmitter {
  constructor(id, game) {
    super();
    this.id = id;
    this.game = game;
    this.started = false;

    this.currentPlayerCount = 0;
    this.connectedPlayerCount = 0;
    this.playerIdTable = {};
    this.playerState = {};
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

  getFullState() {
    return this.started ? this.game.getFullState() : null;
  }

  getVisibleState(player) {
    return this.started ? this.game.getVisibleState(player) : null;
  }

  getPlayerInput() {
    return this.started ? this.game.getPlayerInput() : null;
  }
}

export default GameInstance;
