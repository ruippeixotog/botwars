var bodyParser = require('body-parser');
var express = require('express');
var expressWs = require('../models/utils/express-ws');

var GameRegistry = require('../models/game_registry');

module.exports = function(Game) {
  var engine = new GameRegistry(Game);

  var router = expressWs(new express.Router());
  router.use(bodyParser.json());

  router.param('gameId', function(req, res, next, gameId) {
    var game = engine.getGameInstance(gameId);

    if(!game) res.status(404).send('The requested game does not exist');
    else { req.game = game; next(); }
  });

  router.param('playerId', function(req, res, next, playerId) {
    var player = req.game.getPlayer(playerId);

    if(!player) res.status(404).send('Invalid player');
    else { req.player = player; next(); }
  });

  router.post('/create', function(req, res) {
    var gameId = engine.createNewGame(req.body);

    if(!gameId) res.status(400).send('Could not create new game');
    else res.json({ gameId: gameId });
  });

  router.post('/:gameId/register', function(req, res) {
    var playerId = req.game.registerNewPlayer();

    if(!playerId) res.status(400).send('Could not register new player');
    else res.json({ playerId: playerId });
  });

  router.get('/:gameId/connect/:playerId', function(req, res) {
    req.game.connect(req.player);
    res.send('Connected');
  });

  router.get('/:gameId/state', function(req, res) {
    if(!req.game.hasStarted()) res.status(400).send('Game has not started yet');
    else res.json(req.game.getFullState());
  });

  router.post('/:gameId/play/:playerId', function(req, res) {
    if(!req.game.hasStarted()) res.status(400).send('Game has not started yet');
    else if(req.game.move(req.player, req.body)) res.send("OK");
    else res.status(400).send('Illegal move');
  });

  router.ws('/:gameId/spectate', function(ws, req) {
    ws.sendJSON = function(obj) { ws.send(JSON.stringify(obj)); };

    req.game.on('start', function(state) {
      ws.sendJSON({ eventType: 'start', state: state });
    });

    req.game.on('state', function(state) {
      ws.sendJSON({ eventType: 'state', state: state });
    });

    req.game.on('move', function(player, move) {
      ws.sendJSON({ eventType: 'move', player: player, move: move });
    });

    req.game.on('end', function(state) {
      ws.sendJSON({ eventType: 'end', state: state });
      ws.close();
    });

    if(req.game.hasStarted()) {
      ws.sendJSON({ eventType: 'state', state: req.game.getFullState() });
    }
  });

  router.ws('/:gameId/play/:playerId', function(ws, req) {
    ws.sendJSON = function(obj) { ws.send(JSON.stringify(obj)); };

    req.game.on('waitingForMove', function(nextPlayer, input) {
      if(nextPlayer == req.player)
        ws.sendJSON({ eventType: 'requestMove', input: input });
    });

    req.game.on('end', function(state) {
      ws.sendJSON({ eventType: 'end', state: state });
      ws.close();
    });

    ws.on('message', function(msg) {
      req.game.move(req.player, JSON.parse(msg));
    });

    if (req.game.hasStarted() && req.player == req.game.getNextPlayer()) {
      ws.sendJSON({ eventType: 'requestMove', input: req.game.getPlayerInput() });
    }

    req.game.connect(req.player);
  });

  return router;
};
