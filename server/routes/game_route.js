import bodyParser from "body-parser";
import express from "express";
import expressWs from "../models/utils/express-ws";

import GameRegistry from "../models/game_registry";

export default function (Game) {
  let engine = new GameRegistry(Game);

  let router = expressWs(new express.Router());
  router.use(bodyParser.json());

  router.param("gameId", function (req, res, next, gameId) {
    let game = engine.getGameInstance(gameId);
    if (!game) { res.status(404).send("The requested game does not exist"); return; }
    req.game = game;

    if (req.query.playerToken) {
      let player = game.getPlayer(req.query.playerToken);
      if (!player) { res.status(404).send("Invalid player"); return; }
      req.player = player;
    }

    next();
  });

  router.get("/games", function (req, res) {
    res.json(engine.getAllGamesInfo());
  });

  router.post("/games", function (req, res) {
    let gameId = engine.createNewGame(req.body);

    if (!gameId) res.status(400).send("Could not create new game");
    else res.json({ gameId });
  });

  router.get("/games/:gameId", function (req, res) {
    res.json(req.game.getInfo());
  });

  router.post("/games/:gameId/register", function (req, res) {
    let playerRes = req.game.registerNewPlayer(parseInt(req.query.player) || null);

    if (!playerRes) res.status(400).send("Could not register new player");
    else res.json(playerRes);
  });

  router.get("/games/:gameId/connect", function (req, res) {
    req.game.connect(req.player);
    res.send("Connected");
  });

  router.get("/games/:gameId/state", function (req, res) {
    if (!req.game.hasStarted()) res.status(400).send("Game has not started yet");
    else res.json(req.game.getState(req.player));
  });

  router.post("/games/:gameId/move", function (req, res) {
    if (!req.game.hasStarted()) res.status(400).send("Game has not started yet");
    else if (req.game.move(req.player, req.body)) res.send("OK");
    else res.status(400).send("Illegal move");
  });

  router.get("/games/:gameId/history", function (req, res) {
    res.json(req.game.getHistory(req.player));
  });

  router.ws("/games/:gameId/stream", function (ws, req) {
    let { game, player } = req;

    ws.sendJSON = function (obj) { ws.send(JSON.stringify(obj)); };
    function onGameEvent(event, callback) {
      game.on(event, callback);
      ws.on("close", () => { game.removeListener(event, callback); });
    }

    onGameEvent("start", function () {
      ws.sendJSON({ eventType: "start", state: game.getState(player) });
    });

    onGameEvent("stateChange", function () {
      ws.sendJSON({ eventType: "state", state: game.getState(player) });
    });

    onGameEvent("move", function (player, move) {
      ws.sendJSON({ eventType: "move", player, move });
    });

    onGameEvent("end", function () {
      ws.sendJSON({ eventType: "end", state: game.getState(player) });
      ws.close();
    });

    ws.sendJSON({ eventType: "info", player });

    if (req.query.history === "true") {
      ws.sendJSON({ eventType: "history", history: game.getHistory(player) });
    }

    if (game.hasStarted()) {
      let isEnded = game.isEnded();
      ws.sendJSON({ eventType: isEnded ? "end" : "state", state: game.getState(player) });
      if (isEnded) ws.close();
    }

    if (player) {
      onGameEvent("waitingForMove", function (nextPlayer) {
        if (nextPlayer === player)
          ws.sendJSON({ eventType: "requestMove", state: game.getState(player) });
      });

      ws.on("message", function (msg) {
        game.move(player, JSON.parse(msg));
      });

      if (game.hasStarted() && player === game.getNextPlayer()) {
        ws.sendJSON({ eventType: "requestMove", state: game.getState(player) });
      }

      game.connect(player);
    }
  });

  return router;
}
