var express = require('express');
var expressWs = require('./models/utils/express-ws');

var gameRoute = require('./routes/game_route');
var TicTacToe = require('./models/games/tictactoe');

var app = expressWs(express());

app.use('/tictactoe', gameRoute(TicTacToe));

app.use(function(err, req, res, next) {
  console.error(err.stack);
  res.status(500).send('An internal error occurred');
});

var server = app.listen(3000, function () {
  console.log('Example app listening on port %s', server.address().port);
});
