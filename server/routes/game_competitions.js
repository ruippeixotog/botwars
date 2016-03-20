import express from "express";

import CompetitionRegistry from "../models/competition_registry";

export default function (gameRegistry, compTypes) {
  let compRegistry = new CompetitionRegistry(compTypes, gameRegistry);
  let router = new express.Router();

  // TODO competition only for debugging purposes
  compRegistry.create({ name: "Test match", type: "match", gameCount: 1 }, "0");

  router.param("compId", function (req, res, next, compId) {
    let comp = compRegistry.get(compId);
    if (!comp) { res.status(404).send("The requested competition does not exist"); return; }
    req.comp = comp;

    if (req.query.playerToken) {
      let player = comp.getPlayer(req.query.playerToken);
      if (!player) { res.status(404).send("Invalid player"); return; }
      req.player = player;
    }

    next();
  });

  router.get("/", function (req, res) {
    res.json(compRegistry.getAllCompetitionsInfo());
  });

  router.post("/", function (req, res) {
    let compId = compRegistry.create(req.body);

    if (!compId) res.status(400).send("Could not create new competition");
    else res.json({ compId });
  });

  router.get("/:compId", function (req, res) {
    res.json(req.comp.getInfo());
  });

  router.post("/:compId/register", function (req, res) {
    let playerRes = req.comp.registerNewPlayer(parseInt(req.query.player) || null);

    if (!playerRes) res.status(400).send("Could not register new player");
    else res.json(playerRes);
  });

  router.get("/:compId/games", function (req, res) {
    res.json(req.comp.getGames().map(g => g.getInfo()));
  });

  return router;
}
