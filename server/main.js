import express from "express";
import expressWs from "./models/utils/express-ws";
import fs from "fs";
import morgan from "morgan";
import _ from "underscore";

import gameRoute from "./routes/game";

const app = expressWs(express());
const config = JSON.parse(fs.readFileSync("config.json"));

app.use(morgan("dev"));

let compTypes = _.mapObject(config.competitions, compInfo => require(compInfo.serverModule));

_.each(config.games, (gameInfo, gameId) => {
  let Game = require(gameInfo.serverModule);
  app.use(`/api/${gameId}`, gameRoute(Game, compTypes));
});

app.use(express.static("dist"));

app.get(/^(?!\/api)/, function (req, res) {
  res.sendFile("dist/index.html", { root: __dirname + "/.." });
});

let server = app.listen(3000, function () {
  console.log("Example app listening on port %s", server.address().port);
});
