var crypto = require('crypto');
var GameInstance = require('./game_instance');

function GameRegistry(Game) {
  this.Game = Game;
  this.instances = {
    '0': new GameInstance('0', new Game({}))
  };
}

GameRegistry.prototype.createNewGame = function(params) {
  var id = crypto.randomBytes(8).toString('hex');
  this.instances[id] = new GameInstance(id, new this.Game(params));
  return id;
};

GameRegistry.prototype.getGameInstance = function(id) {
  return this.instances[id];
};

module.exports = GameRegistry;
