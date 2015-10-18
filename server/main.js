import express from "express";
import expressWs from "./models/utils/express-ws";
import fs from 'fs';
import morgan from "morgan";
import _ from "underscore";

import gameRoute from "./routes/game_route";

var app = expressWs(express());
var config = JSON.parse(fs.readFileSync('config.json'));

app.use(morgan('dev'));

_.each(config.games, (gameInfo, gameId) => {
  var Game = require(gameInfo.serverModule);
  app.use(`/api/${gameId}`, gameRoute(Game));
});

app.use(express.static('dist'));

app.get('*', function(req, res) {
  res.sendfile('dist/index.html');
});

var server = app.listen(3000, function () {
  console.log('Example app listening on port %s', server.address().port);
});
