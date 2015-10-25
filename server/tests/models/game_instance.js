import assert from "assert";

const GameInstance = require.main.require("server/models/game_instance");
const Game = require.main.require("server/models/games/game");

class DummyGame extends Game {
  constructor(params) {
    super(params);
    this.ended = false;
    this.error = false;
    this.winner = null;
    this.nextPlayer = 1;
    this.lastMove = null;
    this.didTimeout = false;
    this.state = 0;
  }
  getPlayerCount() { return 2; }
  isEnded() { return this.ended; }
  isError() { return this.error; }
  getWinner() { return this.winner; }
  getNextPlayer() { return this.nextPlayer; }
  isValidMove(player, move) { return move !== DummyGame.INVALID_MOVE; }
  move(player, move) {
    this.lastMove = move;
    if (move === DummyGame.INVALID_MOVE) this.error = true;
    else if (move === DummyGame.END_MOVE) this.ended = true;
  }
  onMoveTimeout() { this.didTimeout = true; return true; }
  getFullState() { return this.state; }
  getStateView(fullState, player) { return { n: fullState, visibleTo: player }; }
}

DummyGame.END_MOVE = "END_MOVE";
DummyGame.INVALID_MOVE = "INVALID_MOVE";

describe("GameInstance", function () {
  var gameLogic, game;

  var startNewGame = function (params = {}) {
    gameLogic = new DummyGame(params);
    game = new GameInstance("testId", gameLogic);
  };

  var registerAll = function () {
    for (let i = 0; i < gameLogic.getPlayerCount(); i++)
      game.registerNewPlayer();
  };

  var connectAll = function () {
    for (let i = 0; i < gameLogic.getPlayerCount(); i++) {
      game.connect(i + 1);
    }
  };

  beforeEach(startNewGame);

  it("should handle correctly player registations", function () {
    var p1 = game.registerNewPlayer();
    assert(p1 != null);
    var p2 = game.registerNewPlayer();
    assert(p2 != null);
    assert.equal(game.registerNewPlayer(), null);

    assert.equal(game.getPlayer(p1.playerToken), 1);
    assert.equal(game.getPlayer(p2.playerToken), 2);
    assert.equal(game.getPlayer("nonExistingPlayerToken"), null);
  });

  it("should start the game only after all players connect", function () {
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

    game.on("start", function () {
      if (!allConnected) throw new Error('"start" sent before all players connected');
      assert.deepEqual(game.getState(1), { n: 0, visibleTo: 1 });
      done();
    });

    registerAll();
    game.connect(1);

    allConnected = true;
    game.connect(2);
  });

  it('should emit a "waitingForMove" event on start', function (done) {
    var allConnected = false;

    game.on("waitingForMove", function (player) {
      if (!allConnected) throw new Error('"waitingForMove" sent before all players connected');
      assert.equal(player, 1);
      assert.deepEqual(game.getState(1), { n: 0, visibleTo: 1 });
      done();
    });

    registerAll();
    game.connect(1);

    allConnected = true;
    game.connect(2);
  });

  it("should only allow querying the state after the game is started", function () {
    registerAll();
    assert.equal(game.getNextPlayer(), null);
    assert.deepEqual(game.getState(1), null);
    assert.deepEqual(game.getState(2), null);

    game.connect(1);
    game.connect(2);
    assert.equal(game.getNextPlayer(), 1);
    assert.deepEqual(game.getState(1), { n: 0, visibleTo: 1 });
    assert.deepEqual(game.getState(2), { n: 0, visibleTo: 2 });
  });

  it("should allow moves only after the game is started", function () {
    registerAll();

    assert.equal(game.move(1, "p1Move"), null);
    assert.equal(gameLogic.lastMove, null);

    game.connect(1);
    game.connect(2);
    assert.equal(game.move(1, "p1Move"), true);
    assert.equal(gameLogic.lastMove, "p1Move");
  });

  it("should only execute valid moves", function () {
    registerAll();
    connectAll();

    assert.equal(game.move(1, "p1Move"), true);
    assert.equal(gameLogic.lastMove, "p1Move");
    assert.equal(gameLogic.isError(), false);

    assert.equal(game.move(1, DummyGame.INVALID_MOVE), false);
    assert.equal(gameLogic.lastMove, "p1Move");
    assert.equal(gameLogic.isError(), false);

    gameLogic.ended = true;
    assert.equal(game.move(1, "p1Move2"), false);
    assert.equal(gameLogic.lastMove, "p1Move");
    assert.equal(gameLogic.isError(), false);
  });

  it('should emit "move", "stateChange" and "waitingForMove" events as a move is done', done => {
    registerAll();
    connectAll();

    var received = {};

    game.on("move", function (player, move) {
      assert.equal(player, 1);
      assert.equal(move, "myMove");
      received["move"] = true;
    });

    game.on("stateChange", function () {
      assert.deepEqual(game.getState(2), { n: 0, visibleTo: 2 });
      if (!received["move"])
        throw new Error('"stateChange" event emitted before "move"');
      received["state"] = true;
    });

    game.on("waitingForMove", function (player) {
      assert.equal(player, 1);
      assert.deepEqual(game.getState(2), { n: 0, visibleTo: 2 });
      if (!received["state"])
        throw new Error('"waitingForMove" event emitted before "state"');
      done();
    });

    game.move(1, "myMove");
  });

  it("should handle correctly move timeouts", function (done) {
    this.slow(600);

    gameLogic.params.moveTimeLimit = 200;
    registerAll();
    connectAll();

    game.move(1, "p1Move");
    assert.equal(gameLogic.lastMove, "p1Move");
    assert.equal(gameLogic.didTimeout, false);

    game.on("stateChange", function () {
      assert.equal(gameLogic.didTimeout, true);
      done();
    });

    setTimeout(() => { assert.fail(null, null, "Move timeout didn't occur"); }, 400);
  });

  it('should emit an "end" event when the game is ended', function (done) {
    registerAll();
    connectAll();

    game.on("end", function () {
      assert.deepEqual(game.getState(1), { n: 0, visibleTo: 1 });
      done();
    });

    game.move(1, DummyGame.END_MOVE);
  });

  it("should provide up-to-date info about a game", function () {
    startNewGame({ a: 1 });
    assert.deepEqual(game.getInfo(), {
      gameId: "testId",
      params: { a: 1 },
      status: "not_started"
    });

    registerAll();
    connectAll();
    assert.equal(game.getInfo().status, "started");

    game.move(1, 32);
    assert.equal(game.getInfo().status, "started");

    game.move(1, DummyGame.END_MOVE);
    assert.equal(game.getInfo().status, "ended");
  });

  it("should record and provide a history of the game moves and states", function () {
    assert.deepEqual(game.getHistory(2), []);
    assert.equal(game.getState(2), null);

    registerAll();
    connectAll();

    assert.deepEqual(game.getHistory(1), []);
    assert.deepEqual(game.getState(1), { n: 0, visibleTo: 1 });

    gameLogic.state = [];
    game.move(1, 32);

    assert.deepEqual(game.getHistory(2), [
      { eventType: "state", state: { n: 0, visibleTo: 2 } },
      { eventType: "move", player: 1, move: 32 }
    ]);
    assert.deepEqual(game.getState(2), { n: [], visibleTo: 2 });

    game.nextPlayer = 2;
    gameLogic.state.push(2);
    game.move(2, DummyGame.END_MOVE);

    assert.deepEqual(game.getHistory(1), [
      { eventType: "state", state: { n: 0, visibleTo: 1 } },
      { eventType: "move", player: 1, move: 32 },
      { eventType: "state", state: { n: [], visibleTo: 1 } },
      { eventType: "move", player: 2, move: DummyGame.END_MOVE }
    ]);
    assert.deepEqual(game.getState(1), { n: [2], visibleTo: 1 });
  });
});
