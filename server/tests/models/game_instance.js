var assert = require("assert");

var GameInstance = require.main.require("server/models/game_instance");

function DummyGame() {
  this.ended = false;
  this.error = false;
  this.winner = null;
  this.nextPlayer = 1;
  this.lastMove = null;
  this.state = 0;
  this.visibleState = 0;
}

DummyGame.END_MOVE = 'END_MOVE';
DummyGame.INVALID_MOVE = 'INVALID_MOVE';

DummyGame.prototype = {
  getPlayerCount: function() { return 2; },
  isEnded: function() { return this.ended; },
  isError: function() { return this.error; },
  getWinner: function() { return this.winner; },
  getNextPlayer: function() { return this.nextPlayer; },
  isValidMove: function(player, move) { return move != DummyGame.INVALID_MOVE; },
  move: function(player, move) {
    this.lastMove = move;
    if(move == DummyGame.INVALID_MOVE) this.error = true;
    else if(move == DummyGame.END_MOVE) this.ended = true;
  },
  getFullState: function() { return this.state; },
  getVisibleState: function() { return this.visibleState; },
  getPlayerInput: function() { return {}; }
};

describe('GameInstance', function() {
  var gameLogic, game;

  var startNewGame = function() {
    gameLogic = new DummyGame();
    game = new GameInstance('testId', gameLogic);
  };

  var registerAll = function() {
    for(var i = 0; i < gameLogic.getPlayerCount(); i++)
      game.registerNewPlayer();
  };

  var connectAll = function() {
    for(var i = 0; i < gameLogic.getPlayerCount(); i++) {
      game.connect(i + 1);
    }
  };

  beforeEach(startNewGame);

  it('should handle correctly player registations', function () {
    var p1 = game.registerNewPlayer();
    assert(p1 != null);
    var p2 = game.registerNewPlayer();
    assert(p2 != null);
    assert.equal(game.registerNewPlayer(), null);

    assert.equal(game.getPlayer(p1.playerId), 1);
    assert.equal(game.getPlayer(p2.playerId), 2);
    assert.equal(game.getPlayer('nonExistingPlayerId'), null);
  });

  it('should start the game only after all players connect', function () {
    registerAll();
    assert.equal(game.hasStarted(), false);

    game.connect(1);
    assert.equal(game.hasStarted(), false);
    game.connect(1);
    assert.equal(game.hasStarted(), false);
    game.connect(2);
    assert.equal(game.hasStarted(), true);
  });

  it('should emit a "start" event on start', function (done) {
    var allConnected = false;

    game.on('start', function() {
      if(!allConnected) throw new Error('"start" sent before all players connected');
      assert.equal(game.getFullState(), 0);
      done();
    });

    registerAll();
    game.connect(1);

    allConnected = true;
    game.connect(2);
  });

  it('should emit a "waitingForMove" event on start', function (done) {
    var allConnected = false;

    game.on('waitingForMove', function(player) {
      if(!allConnected) throw new Error('"waitingForMove" sent before all players connected');
      assert.equal(player, 1);
      assert.deepEqual(game.getFullState(), 0);
      done();
    });

    registerAll();
    game.connect(1);

    allConnected = true;
    game.connect(2);
  });

  it('should only allow querying the state after the game is started', function () {
    registerAll();
    assert.equal(game.getNextPlayer(), null);
    assert.equal(game.getFullState(), null);
    assert.equal(game.getVisibleState(1), null);
    assert.equal(game.getPlayerInput(), null);

    game.connect(1);
    game.connect(2);
    assert.equal(game.getNextPlayer(), 1);
    assert.equal(game.getFullState(), 0);
    assert.equal(game.getVisibleState(1), 0);
    assert.deepEqual(game.getPlayerInput(), {});
  });

  it('should allow moves only after the game is started', function () {
    registerAll();

    assert.equal(game.move(1, 'p1Move'), null);
    assert.equal(gameLogic.lastMove, null);

    game.connect(1);
    game.connect(2);
    assert.equal(game.move(1, 'p1Move'), true);
    assert.equal(gameLogic.lastMove, 'p1Move');
  });

  it('should only execute valid moves', function () {
    registerAll();
    connectAll();

    assert.equal(game.move(1, 'p1Move'), true);
    assert.equal(gameLogic.lastMove, 'p1Move');
    assert.equal(gameLogic.isError(), false);

    assert.equal(game.move(1, DummyGame.INVALID_MOVE), false);
    assert.equal(gameLogic.lastMove, 'p1Move');
    assert.equal(gameLogic.isError(), false);

    gameLogic.ended = true;
    assert.equal(game.move(1, 'p1Move2'), false);
    assert.equal(gameLogic.lastMove, 'p1Move');
    assert.equal(gameLogic.isError(), false);
  });

  it('should emit "move", "stateChange" and "waitingForMove" events as a move is done', function (done) {
    registerAll();
    connectAll();

    var received = {};

    game.on('move', function(player, move) {
      assert.equal(player, 1);
      assert.equal(move, 'myMove');
      received['move'] = true;
    });

    game.on('stateChange', function() {
      assert.equal(game.getFullState(), 0);
      if(!received['move']) throw new Error('"stateChange" event emitted before "move"');
      received['state'] = true;
    });

    game.on('waitingForMove', function(player) {
      assert.equal(player, 1);
      assert.deepEqual(game.getFullState(), 0);
      if(!received['state']) throw new Error('"waitingForMove" event emitted before "state"');
      done();
    });

    game.move(1, 'myMove');
  });

  it('should emit an "end" event when the game is ended', function (done) {
    registerAll();
    connectAll();

    game.on('end', function() {
      assert.equal(game.getFullState(), 0);
      done();
    });

    game.move(1, DummyGame.END_MOVE);
  });
});
