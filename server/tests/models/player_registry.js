import assert from "assert";

const PlayerRegistry = require.main.require("server/models/player_registry");

describe("PlayerRegistry", function () {
  let registry;

  let newRegistry = function (playerCount = 2) {
    registry = new PlayerRegistry(playerCount);
  };

  beforeEach(newRegistry);

  it("should handle correctly player registations", function () {
    assert.equal(registry.getRegisteredCount(), 0);

    let p1 = registry.register();
    assert.equal(p1.player, 1);
    assert(p1.playerToken !== null);
    assert.equal(registry.getRegisteredCount(), 1);

    let p2 = registry.register();
    assert.equal(p2.player, 2);
    assert(p2.playerToken !== null);
    assert.equal(registry.getRegisteredCount(), 2);

    assert.equal(registry.register(), null);
    assert.equal(registry.getRegisteredCount(), 2);
  });

  it("should handle correctly player connections", function () {
    assert.equal(registry.getConnectedCount(), 0);

    registry.register();
    registry.register();
    assert.equal(registry.getConnectedCount(), 0);

    assert.equal(registry.connect(1), false);
    assert.equal(registry.getConnectedCount(), 1);

    assert.equal(registry.connect(1), false);
    assert.equal(registry.getConnectedCount(), 1);

    assert.equal(registry.connect(2), true);
    assert.equal(registry.getConnectedCount(), 2);

    assert.equal(registry.connect(2), false);
    assert.equal(registry.getConnectedCount(), 2);
  });

  it("should have correct getters", function () {
    let p1 = registry.register();
    let p2 = registry.register();

    assert.equal(registry.getPlayer(p1.playerToken), p1.player);
    assert.equal(registry.getPlayer(p2.playerToken), p2.player);
    assert.equal(registry.getPlayer("nonExistingPlayerToken"), null);

    assert.equal(registry.getPlayerToken(p1.player), p1.playerToken);
    assert.equal(registry.getPlayerToken(p2.player), p2.playerToken);
    assert.equal(registry.getPlayerToken(3), null);
  });
});
