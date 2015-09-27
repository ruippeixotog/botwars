var inherits = require('util').inherits;

var EventEmitter = require('events').EventEmitter;

function GameInstance(id, game) {
  GameInstance.super_.call(this);
  this.id = id;
  this.game = game;
  this.started = false;
}

inherits(GameInstance, EventEmitter);

GameInstance.prototype.move = function (player, move) {
  this.ensureStarted();
  if (this.game.isEnded() && !this.game.isValidMove(player, move))
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
  this.ensureStarted();
  return this.game.getNextPlayer();
};

GameInstance.prototype.getFullState = function() {
  this.ensureStarted();
  return this.game.getFullState();
};

GameInstance.prototype.getVisibleState = function(player) {
  this.ensureStarted();
  return this.game.getVisibleState(player);
};

GameInstance.prototype.getPlayerInput = function() {
  this.ensureStarted();
  return this.game.getPlayerInput();
};

GameInstance.prototype.ensureStarted = function() {
  if(!this.started) {
    this.emit('start', this.game.getFullState());
    this.started = true;
  }
};

module.exports = GameInstance;
