import bodyParser from "body-parser";
import express from "express";

import GameRegistry from "../models/game_registry";

import competitionsRoutes from "./game_competitions";
import gamesRoutes from "./game_games";

export default function (Game, compTypes) {
  let engine = new GameRegistry(Game);
  let router = new express.Router();

  router.use(bodyParser.json());
  router.use("/games", gamesRoutes(engine));
  router.use("/competitions", competitionsRoutes(engine, compTypes));

  return router;
}
