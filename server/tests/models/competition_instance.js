import assert from "assert";

import { EventEmitter } from "events";

const Competition = require.main.require("server/models/competitions/competition");
const CompetitionInstance = require.main.require("server/models/competition_instance");
const Registry = require.main.require("server/models/registry");

class DummyCompetition extends Competition {
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

  start() { return { players: [1, 2], gameParams: {} }; }
  onGameEnd() { return null; }
  getExtraInfo() { return { extra: 42 } }
}

class DummyGameInstance extends EventEmitter {
  constructor() {
    super();
    this.id = "testGameId";
  }

  registerNewPlayer() {}
  isEnded() { return false; }
}

class DummyGameRegistry extends Registry {
  constructor() {
    super(() => new DummyGameInstance());
  }
}

describe("CompetitionInstance", function () {
  let compLogic, comp;

  let startNewComp = function (params = {}) {
    compLogic = new DummyCompetition(params);
    comp = new CompetitionInstance("testId", compLogic, new DummyGameRegistry());
  };

  let registerAll = function () {
    for (let i = 0; i < compLogic.getPlayerCount(); i++)
      comp.registerNewPlayer();
  };

  beforeEach(startNewComp);

  it("should handle correctly player registations", function () {
    let p1 = comp.registerNewPlayer();
    assert(p1 != null);
    let p2 = comp.registerNewPlayer();
    assert(p2 != null);
    assert.equal(comp.registerNewPlayer(), null);

    assert.equal(comp.getPlayer(p1.playerToken), 1);
    assert.equal(comp.getPlayer(p2.playerToken), 2);
    assert.equal(comp.getPlayer("nonExistingPlayerToken"), null);
  });

  it("should start the competition only after all players register", function () {
    assert.equal(comp.hasStarted(), false);

    comp.registerNewPlayer(1);
    assert.equal(comp.hasStarted(), false);
    comp.registerNewPlayer(1);
    assert.equal(comp.hasStarted(), false);
    comp.registerNewPlayer(2);
    assert.equal(comp.hasStarted(), true);
  });

  it("should show the current game after the competition is started", function () {
    assert.equal(comp.getCurrentGame(), null);
    registerAll();
    assert(comp.getCurrentGame() !== null);
  });

  it("should provide up-to-date info about a competition", function () {
    startNewComp({ a: 1 });
    assert.deepEqual(comp.getInfo(), {
      compId: "testId",
      params: { a: 1 },
      registeredPlayers: 0,
      players: 2,
      gamesPlayed: 0,
      status: "not_started",
      extra: 42
    });

    registerAll();
    assert.deepEqual(comp.getInfo(), {
      compId: "testId",
      params: { a: 1 },
      registeredPlayers: 2,
      players: 2,
      gamesPlayed: 0,
      status: "started",
      currentGame: "testGameId",
      extra: 42
    });

    // TODO test info when a competition ends
  });

  // TODO add tests for the start/onGameStart/onGameEnd competition hooks
});
