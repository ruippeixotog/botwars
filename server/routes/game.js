import bodyParser from "body-parser";
import express from "express";

import GameRegistry from "../models/game_registry";
import CompetitionRegistry from "../models/competition_registry";

import competitionsRoutes from "./game_competitions";
import gamesRoutes from "./game_games";

export default function (Game, compTypes) {
  let gameRegistry = new GameRegistry(Game);
  let compRegistry = new CompetitionRegistry(gameRegistry, compTypes);

  gameRegistry.restoreAllStoredGames(Game).then(
      () => compRegistry.restoreAllStoredCompetitions(Game, gameRegistry)
  );

  let router = new express.Router();

  router.use(bodyParser.json());
  router.use("/games", gamesRoutes(gameRegistry));
  router.use("/competitions", competitionsRoutes(gameRegistry, compRegistry));

  return router;
}