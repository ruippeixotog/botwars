import bodyParser from "body-parser";
import express from "express";

import GameRegistry from "../models/game_registry";

import gamesRoutes from "./game_games";

export default function (Game) {
  let engine = new GameRegistry(Game);
  let router = new express.Router();

  router.use(bodyParser.json());
  router.use("/games", gamesRoutes(engine));

  return router;
}
