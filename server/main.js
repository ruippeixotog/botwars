import express from "express";
import expressWs from "./models/utils/express-ws";
import morgan from "morgan";

import gameRoute from "./routes/game_route";
import TicTacToe from "./models/games/tictactoe";
import Sueca from "./models/games/sueca";

var app = expressWs(express());

app.use(morgan('dev'));

app.use('/api/tictactoe', gameRoute(TicTacToe));
app.use('/api/sueca', gameRoute(Sueca));

app.use(express.static('dist'));

app.get('*', function(req, res) {
  res.sendfile('dist/index.html');
});

var server = app.listen(3000, function () {
  console.log('Example app listening on port %s', server.address().port);
});
