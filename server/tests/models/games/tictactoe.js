import assert from "assert";

const TicTacToe = require.main.require("server/models/games/tictactoe");

describe('TicTacToe', function() {
  var game;

  var startNewGame = function() {
    game = new TicTacToe({});
  };

  var quickPlay = function(moves) {
    for(let i = 0; i < moves.length; i++) {
      game.move(game.getNextPlayer(), { row: moves[i][0], col: moves[i][1] });
    }
  };

  beforeEach(startNewGame);

  it('should have a player count of 2', function () {
    assert.equal(game.getPlayerCount(), 2);
  });

  it('should start out with a correct initial state', function () {
    assert.equal(game.isEnded(), false);
    assert.equal(game.isError(), false);
    assert.equal(game.getWinner(), null);
    assert.equal(game.getNextPlayer(), 1);
    assert.deepEqual(game.getState(), {
      nextPlayer: 1,
      grid: [[0, 0, 0], [0, 0, 0], [0, 0, 0]],
      winner: null,
      isError: false
    });
  });

  it('should update correctly the state with valid moves', function () {
    game.move(1, { row: 0, col: 0 });
    assert.equal(game.isError(), false);
    assert.deepEqual(game.getState().grid, [[1, 0, 0], [0, 0, 0], [0, 0, 0]]);

    game.move(2, { row: 0, col: 1 });
    assert.equal(game.isError(), false);
    assert.deepEqual(game.getState().grid, [[1, 2, 0], [0, 0, 0], [0, 0, 0]]);
  });

  it('should set the state as error when an invalid move is made', function () {
    game.move(1, { row: 0, col: 0 });
    game.move(2, { row: 0, col: 3 }); // illegal position
    assert.equal(game.isError(), true);

    startNewGame();
    game.move(1, { row: 0, col: 0 });
    game.move(1, { row: 0, col: 1 }); // not the correct player
    assert.equal(game.isError(), true);

    startNewGame();
    game.move(1, { row: 0, col: 0 });
    game.move(2, { row: 0, col: 0 }); // position already taken
    assert.equal(game.isError(), true);
  });

  it('should evaluate correctly valid and invalid moves', function () {
    assert.equal(game.isValidMove(1, { row: 0, col: 0 }), true);
    assert.equal(game.isValidMove(1, { row: 0, col: 3 }), false); // illegal position
    assert.equal(game.isValidMove(1, { row: -1, col: 0 }), false); // illegal position
    assert.equal(game.isValidMove(2, { row: 0, col: 0 }), false); // not the correct player

    game.move(1, { row: 0, col: 0 });
    assert.equal(game.isValidMove(2, { row: 0, col: 0 }), false); // position already taken
  });

  it('should consider the opponent the winner when a move timeout occurs', function () {
    assert.equal(game.onMoveTimeout(), true);
    assert.equal(game.getNextPlayer(), null);
    assert.equal(game.getWinner(), 2);

    startNewGame();
    game.move(1, { row: 0, col: 0 });
    assert.equal(game.onMoveTimeout(), true);
    assert.equal(game.getNextPlayer(), null);
    assert.equal(game.getWinner(), 1);
  });

  it('should signal correctly the ending of a game and its winner', function () {
    quickPlay([[0, 0], [0, 1], [1, 0], [1, 1]]);

    assert.equal(game.isEnded(), false);
    game.move(1, { row: 2, col: 0 });
    assert.equal(game.isEnded(), true); // vertical line
    assert.equal(game.getWinner(), 1);

    startNewGame();
    quickPlay([[0, 0], [1, 0], [0, 1], [1, 1], [2, 0]]);

    assert.equal(game.isEnded(), false);
    game.move(2, { row: 1, col: 2 });
    assert.equal(game.isEnded(), true); // horizontal line
    assert.equal(game.getWinner(), 2);

    startNewGame();
    quickPlay([[0, 0], [1, 0], [1, 1], [1, 2]]);

    assert.equal(game.isEnded(), false);
    game.move(1, { row: 2, col: 2 });
    assert.equal(game.isEnded(), true); // diagonal line
    assert.equal(game.getWinner(), 1);

    startNewGame();
    quickPlay([[0, 0], [0, 1], [1, 1], [2, 2], [1, 2], [1, 0], [0, 2], [2, 0]]);

    assert.equal(game.isEnded(), false);
    game.move(1, { row: 2, col: 1 });
    assert.equal(game.isEnded(), true); // draw
    assert.equal(game.getWinner(), null);
  });
});
