var _ = require('underscore');
var deepcopy = require('../utils/deepcopy');
var inherits = require("util").inherits;

var Game = require("./game");

var checkCells = function(cells) {
  var winner = cells[0];
  return winner > 0 && _(cells).every(function(e) { return e == winner; }) ? winner : null;
};

var checkRow = function(grid, row) {
  return checkCells(grid[row]);
};

var checkColumn = function(grid, col) {
  return checkCells(_(grid).pluck(col));
};

var checkDiag = function(grid, row, col) {
  var colCount = grid[0].length;

  return row == col &&
      checkCells(_(grid).map(function(r, i) { return r[i]; })) ||
    row == colCount - col - 1 &&
      checkCells(_(grid).map(function(r, i) { return r[colCount - i - 1]; }));
};

function TicTacToe(params) {
  TicTacToe.super_.call(this, params);

  this.rowCount = params.rowCount || 3;
  this.colCount = params.colCount || 3;

  this.nextPlayer = 1;
  this.grid = _.times(this.rowCount, function() {
    return _.times(this.colCount, _.constant(0));
  }.bind(this));
  this.error = false;
  this.winner = null;
  this.gridFull = false;

  this.moveCount = 0;
}

inherits(TicTacToe, Game);

TicTacToe.prototype.isEnded = function() {
  return this.error || this.winner || this.gridFull;
};

TicTacToe.prototype.isError = function() { return this.error; };
TicTacToe.prototype.getWinner = function() { return this.winner; };
TicTacToe.prototype.getNextPlayer = function() { return this.nextPlayer; };

TicTacToe.prototype.isValidMove = function(player, move) {
  return player == this.nextPlayer && this.isValidPlacement(move);
};

TicTacToe.prototype.move = function(player, move) {
  if(!this.isValidMove(player, move)) {
    this.error = true;
  } else {
    this.nextPlayer = 3 - player; // newState.nextPlayer == 1 ? 2 - 1;
    this.grid[move.row][move.col] = player;

    if(checkRow(this.grid, move.row) ||
        checkColumn(this.grid, move.col) ||
        checkDiag(this.grid, move.row, move.col)) {
      this.winner = player;
    }

    if(++this.moveCount == this.rowCount * this.colCount)
      this.gridFull = true;
  }
};

TicTacToe.prototype.getFullState = function() {
  return {
    nextPlayer: this.isEnded() ? null : this.nextPlayer,
    grid: deepcopy(this.grid),
    winner: this.winner,
    isError: this.error
  };
};

TicTacToe.prototype.getVisibleState = function() {
  return this.getFullState();
};

TicTacToe.prototype.getPlayerInput = function() {
  return deepcopy(this.grid);
};

TicTacToe.prototype.isValidPlacement = function(move) {
  return move.row >= 0 && move.row < this.rowCount &&
      move.col >= 0 && move.col < this.colCount &&
      this.grid[move.row][move.col] == 0;
};

module.exports = TicTacToe;
