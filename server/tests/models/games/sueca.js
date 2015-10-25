import assert from "assert";
import _ from "underscore";

const Sueca = require.main.require("server/models/games/sueca");

describe("Sueca", function () {
  var game;

  var startNewGame = function () {
    game = new Sueca({});
  };

  var quickPlay = function (n) {
    for (let i = 0; i < n; i++) {
      game.move(game.getNextPlayer(), validCard());
    }
  };

  var isCard = function (card) {
    return card.suit && card.value;
  };

  var isSameCard = function (card) {
    return c => c.suit === card.suit && c.value === card.value;
  };

  var validCard = function () {
    var state = game.getState(game.getNextPlayer());
    return _(state.hand).find(c => c.suit === state.trickSuit) || state.hand[0];
  };

  var invalidCard = function () {
    var state = game.getState(game.getNextPlayer());
    var invalidCards = _(state.hand).filter(c => c.suit !== state.trickSuit);
    return invalidCards.length === state.hand.length ? null : invalidCards[0];
  };

  var prevPlayer = function (player) { return (player + 2) % 4 + 1; };
  var nextPlayer = function (player) { return player % 4 + 1; };

  beforeEach(startNewGame);

  it("should have a player count of 4", function () {
    assert.equal(game.getPlayerCount(), 4);
  });

  it("should start out with a correct initial state", function () {
    assert.equal(game.isEnded(), false);
    assert.equal(game.isError(), false);
    assert.equal(game.getWinner(), null);

    var player = game.getNextPlayer();
    assert(player >= 1 && player <= 4);

    var initialState = game.getFullState();
    assert.equal(initialState.nextPlayer, player);

    var seenCards = {};
    assert.equal(initialState.hands.length, 4);
    _.chain(initialState.hands).flatten().every(c => {
      assert(!seenCards[`${c.suit}-${c.value}`]);
      seenCards[`${c.suit}-${c.value}`] = true;
    });

    assert.equal(initialState.trumpPlayer, prevPlayer(player));
    assert(isCard(initialState.trump));
    assert(_(game.getState(initialState.trumpPlayer).hand)
        .some(isSameCard(initialState.trump)));

    assert.equal(initialState.lastTrick, null);
    assert.deepEqual(initialState.currentTrick, [null, null, null, null]);
    assert.equal(initialState.trickSuit, null);
    assert.equal(initialState.tricksDone, 0);

    assert.deepEqual(initialState.score, [0, 0]);

    for (let i = 1; i <= 4; i++) {
      assert.deepEqual(game.getState(i).hand, initialState.hands[i - 1]);
    }
  });

  it("should update correctly the state with valid moves until the end", function () {
    for (let t = 0; t < 40; t++) {
      var player = game.getNextPlayer();
      var card = validCard();

      game.move(player, card);
      assert.equal(game.isError(), false);

      if (t < 39) {
        assert.equal(game.getWinner(), null);
        assert.equal(game.isEnded(), false);
      }

      if (t % 4 !== 3) {
        assert.equal(game.getNextPlayer(), nextPlayer(player));
        assert.deepEqual(game.getFullState().currentTrick[player - 1], card);
      }

      assert.equal(game.getFullState().tricksDone, Math.floor((t + 1) / 4));
    }

    assert.equal(game.isError(), false);
    assert.equal(game.isEnded(), true);
    assert.equal(game.getNextPlayer(), null);

    var finalState = game.getFullState();
    var isDraw = finalState.score[0] === finalState.score[1];
    assert.equal(game.getWinner() == null, isDraw);
  });

  it("should set the state as error when an invalid move is made", function () {
    // card not in player's hand
    game.move(game.getNextPlayer(), game.getState(nextPlayer(game.getNextPlayer())).hand[0]);
    assert.equal(game.isError(), true);

    startNewGame();

    // not the correct player
    game.move(nextPlayer(game.getNextPlayer()), validCard());
    assert.equal(game.isError(), true);

    startNewGame();

    while (!invalidCard()) {
      game.move(game.getNextPlayer(), validCard());
      // this can happen, but requires an insanely rare card distribution
      if (game.isEnded()) return;
    }
    // card not from the trick's suit
    game.move(game.getNextPlayer(), invalidCard());
    assert.equal(game.isError(), true);
  });

  it("should evaluate correctly valid and invalid moves", function () {
    assert.equal(game.isValidMove(game.getNextPlayer(), validCard()), true);

    // card not in player's hand
    assert.equal(game.isValidMove(game.getNextPlayer(),
        game.getState(nextPlayer(game.getNextPlayer())).hand[0]), false);

    // not the correct player
    assert.equal(game.isValidMove(nextPlayer(game.getNextPlayer()), validCard()), false);

    // card not from the trick's suit
    game.move(game.getNextPlayer(), validCard());
    assert.equal(game.isValidMove(game.getNextPlayer(), invalidCard()), false);
  });

  it("should consider the opponent the winner when a move timeout occurs", function () {
    var player = game.getNextPlayer();
    assert.equal(game.onMoveTimeout(), true);
    assert.equal(game.getNextPlayer(), null);
    assert.equal(game.getWinner(), player % 2 ? 1 : 2);
  });

  it("update correctly the score after a move", function () {
    quickPlay(4);

    var trickPoints = _(game.getFullState().lastTrick).reduce((sum, c) => {
      switch (c.value) {
        case "A": return sum + 11;
        case "7": return sum + 10;
        case "K": return sum + 4;
        case "J": return sum + 3;
        case "Q": return sum + 2;
        default: return sum;
      }
    }, 0);

    var state = game.getFullState();
    assert(state.score[0] === 0 && state.score[1] === trickPoints ||
        state.score[1] === 0 && state.score[0] === trickPoints);

    quickPlay(36);
    state = game.getFullState();
    assert.equal(state.score[0] + state.score[1], 120);
  });
});
