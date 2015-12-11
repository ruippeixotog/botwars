/*global require */

import React from "react";
import ReactDOM from "react-dom";
import { Route, Router, IndexRoute, IndexRedirect } from "react-router";
import createBrowserHistory from "history/lib/createBrowserHistory";
import _ from "underscore";

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

let games = _.map(config.games, (gameInfo, gameId) => {
  let GameComponent = require(gameInfo.clientComponent).default;
  return { name: gameInfo.name, href: `/${gameId}`, component: GameComponent };
});

let compTypes = _.mapObject(config.competitions, compInfo =>
    require(compInfo.clientComponent).default);

let gameRoutes = games.map(game =>
    <Route path={game.href} component={GameLayout} game={game} key={game.href}>
      <IndexRedirect to="games" />
      <Route path="games">
        <IndexRoute component={GamesIndex} game={game} />
        <Route path=":gameId" component={GameInfo} game={game} />
        <Route path=":gameId/stream" component={GameStream} game={game} />
      </Route>
      <Route path="competitions">
        <IndexRoute component={CompsIndex} game={game} />
        <Route path=":compId" component={CompInfo} game={game} compTypes={compTypes} />
      </Route>
    </Route>
);

let routes = (
    <Route path="/" component={App} games={games}>
      <IndexRoute component={Index} />
      {gameRoutes}
      <Route path="*" component={PageNotFound} />
    </Route>
);

ReactDOM.render(
    <Router routes={routes} history={createBrowserHistory()} />,
    document.getElementById("main"));
