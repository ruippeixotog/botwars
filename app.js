var express = require('express');
var expressWs = require('./models/utils/express-ws');
var morgan = require('morgan');

var gameRoute = require('./routes/game_route');
var TicTacToe = require('./models/games/tictactoe');

var app = expressWs(express());

app.use(morgan('dev'));

app.use('/tictactoe', gameRoute(TicTacToe));

var server = app.listen(3000, function () {
  console.log('Example app listening on port %s', server.address().port);
});
