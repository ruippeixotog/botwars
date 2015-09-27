function Game() {
  if (this.constructor === Game) {
    throw new Error("Can't create a Game!");
  }
}

Game.prototype = {
  isEnded: function() {
    throw new Error(this.constructor + ".isEnded not implemented");
  },

  isError: function() {
    throw new Error(this.constructor + ".isError not implemented");
  },

  getWinner: function() {
    throw new Error(this.constructor + ".getWinner not implemented");
  },

  getNextPlayer: function() {
    throw new Error(this.constructor + ".getCurrentPlayer not implemented");
  },

  // isValidMove: function(player, move)
  isValidMove: function() {
    throw new Error(this.constructor + ".isValidMove not implemented");
  },

  // move: function(player, move)
  move: function() {
    throw new Error(this.constructor + ".move not implemented");
  },

  getFullState: function() {
    throw new Error(this.constructor + ".getFullState not implemented");
  },

  // getVisibleState: function(player)
  getVisibleState: function() {
    throw new Error(this.constructor + ".getVisibleState not implemented");
  },

  getPlayerInput: function() {
    throw new Error(this.constructor + ".getPlayerInput not implemented");
  }
};

module.exports = Game;
