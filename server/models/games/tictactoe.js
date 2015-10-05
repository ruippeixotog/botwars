import _ from "underscore";
import deepcopy from "../utils/deepcopy";

import Game from "./game";

class TicTacToe extends Game {
  constructor(params) {
    params = params || {};
    super(params);

    this.rowCount = params.rowCount || 3;
    this.colCount = params.colCount || 3;

    this.nextPlayer = 1;
    this.grid = _.times(this.rowCount, () =>
        _.times(this.colCount, _.constant(0))
    );
    this.error = false;
    this.winner = null;
    this.gridFull = false;

    this.moveCount = 0;
  }

  getPlayerCount() { return 2; }
  isEnded() { return this.error || this.winner != null || this.gridFull; }
  isError() { return this.error; }
  getWinner() { return this.winner; }
  getNextPlayer() { return this.nextPlayer; }

  isValidMove(player, move) {
    return player == this.nextPlayer && this._isValidPlacement(move);
  }

  move(player, move) {
    if(!this.isValidMove(player, move)) {
      this.error = true;
    } else {
      this.nextPlayer = 3 - player; // newState.nextPlayer == 1 ? 2 - 1;
      this.grid[move.row][move.col] = player;

      if(this._checkRow(move.row) ||
          this._checkColumn(move.col) ||
          this._checkDiag(move.row, move.col)) {
        this.winner = player;
      }

      if(++this.moveCount == this.rowCount * this.colCount)
        this.gridFull = true;
    }
  }

  getFullState() {
    return {
      nextPlayer: this.isEnded() ? null : this.nextPlayer,
      grid: deepcopy(this.grid),
      winner: this.winner,
      isError: this.error
    };
  }

  getVisibleState() {
    return this.getFullState();
  }

  getPlayerInput() {
    return deepcopy(this.grid);
  }

  _isValidPlacement(move) {
    return move.row >= 0 && move.row < this.rowCount &&
        move.col >= 0 && move.col < this.colCount &&
        this.grid[move.row][move.col] == 0;
  }

  _checkRow(row) {
    return this._checkCells(this.grid[row]);
  }

  _checkColumn(col) {
    return this._checkCells(_(this.grid).pluck(col));
  }

  _checkDiag(row, col) {
    var colCount = this.grid[0].length;

    return row == col &&
        this._checkCells(_(this.grid).map((r, i) => r[i])) ||
        row == colCount - col - 1 &&
        this._checkCells(_(this.grid).map((r, i) => r[colCount - i - 1]));
  }

  _checkCells(cells) {
    var winner = cells[0];
    return winner > 0 && _(cells).every(e => e == winner) ? winner : null;
  }
}

export default TicTacToe;
