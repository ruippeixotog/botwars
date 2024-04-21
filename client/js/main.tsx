/*global require */

import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import _ from "lodash";

import App from "./components/App";
import Index from "./components/Index";
import GameLayout from "./components/GameLayout";
import GamesIndex from "./components/GamesIndex";
import GameInfo from "./components/GameInfo";
import GameStream from "./components/GameStream";
import CompsIndex from "./components/CompsIndex";
import CompInfo from "./components/CompInfo";
import PageNotFound from "./components/PageNotFound";

import config from "../../config.json";

const games = _.map(config.games, (gameInfo, gameId) => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const GameComponent = require("./components/games/" + gameInfo.clientComponent).default;
  return { name: gameInfo.name, href: `/${gameId}`, component: GameComponent };
});

const compTypes = _.mapValues(config.competitions, compInfo =>
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require("./components/competitions/" + compInfo.clientComponent).default);

const gameRoutes = games.map(game =>
  <Route path={game.href} element={<GameLayout game={game} />} key={game.href}>
    <Route index element={<Navigate to="games" replace />} />
    <Route path="games">
      <Route index element={<GamesIndex game={game} />} />
      <Route path=":gameId" element={<GameInfo game={game} />} />
      <Route path=":gameId/stream" element={<GameStream game={game} />} />
    </Route>
    <Route path="competitions">
      <Route index element={<CompsIndex game={game} />} />
      <Route path=":compId" element={<CompInfo game={game} compTypes={compTypes} />} />
    </Route>
  </Route>
);

const router = (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<App games={games} />}>
        <Route index element={<Index />} />
        {gameRoutes}
        <Route path="*" element={<PageNotFound />} />
      </Route>
    </Routes>
  </BrowserRouter>
);

ReactDOM.render(
  router,
  document.getElementById("main")
);
