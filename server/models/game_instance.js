var crypto = require('crypto');
var inherits = require('util').inherits;

var EventEmitter = require('events').EventEmitter;

function GameInstance(id, game) {
  GameInstance.super_.call(this);
  this.id = id;
  this.game = game;
  this.started = false;

  this.currentPlayerCount = 0;
  this.connectedPlayerCount = 0;
  this.playerIdTable = {};
  this.playerState = {};
}

inherits(GameInstance, EventEmitter);

GameInstance.prototype.registerNewPlayer = function () {
  if(this.currentPlayerCount < this.game.getPlayerCount()) {
    var playerId = crypto.randomBytes(20).toString('hex');
    var player = ++this.currentPlayerCount;

    this.playerIdTable[playerId] = player;
    this.playerState[player] = { connectedOnce: false };
    return playerId;
  }
  return null;
};

GameInstance.prototype.getPlayer = function (playerId) {
  return this.playerIdTable[playerId];
};

GameInstance.prototype.connect = function(player) {
  if(this.playerState[player].connectedOnce) return;

  this.connectedPlayerCount++;
  this.playerState[player].connectedOnce = true;

  if(!this.started && this.connectedPlayerCount == this.game.getPlayerCount()) {
    this.started = true;
    this.emit('start', this.game.getFullState());

    if (!this.game.isEnded()) {
      this.emit('waitingForMove', this.game.getNextPlayer(), this.game.getPlayerInput());
    } else {
      this.emit('end', this.game.getFullState());
    }
  }
};

GameInstance.prototype.hasStarted = function() {
  return this.started;
};

GameInstance.prototype.move = function (player, move) {
  if(!this.started) return null;

  if (this.game.isEnded() || !this.game.isValidMove(player, move))
    return false;

  this.game.move(player, move);
  this.emit('move', player, move);

  var currentState = this.game.getFullState();
  if (!this.game.isEnded()) {
    this.emit('state', currentState);
    this.emit('waitingForMove', this.game.getNextPlayer(), this.game.getPlayerInput());
  } else {
    this.emit('end', currentState);
  }
  return true;
};

GameInstance.prototype.getNextPlayer = function() {
  return this.started ? this.game.getNextPlayer() : null;
};

GameInstance.prototype.getFullState = function() {
  return this.started ? this.game.getFullState() : null;
};

GameInstance.prototype.getVisibleState = function(player) {
  return this.started ? this.game.getVisibleState(player) : null;
};

GameInstance.prototype.getPlayerInput = function() {
  return this.started ? this.game.getPlayerInput() : null;
};

module.exports = GameInstance;
