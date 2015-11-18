/*global require */

import React from "react";
import ReactDOM from "react-dom";
import { Route, Router, IndexRoute } from "react-router";
import createBrowserHistory from "history/lib/createBrowserHistory";
import _ from "underscore";

import App from "./components/App";
import Index from "./components/Index";
import GameLayout from "./components/GameLayout";
import GameIndex from "./components/GameIndex";
import GameInfo from "./components/GameInfo";
import GameStream from "./components/GameStream";
import PageNotFound from "./components/PageNotFound";

import config from "../../config.json";

let games = _.map(config.games, (gameInfo, gameId) => {
  let GameComponent = require(gameInfo.clientComponent);
  return { name: gameInfo.name, href: `/${gameId}`, component: GameComponent };
});

let gameRoutes = games.map(game =>
    <Route path={game.href} component={GameLayout} game={game} key={game.href}>
      <IndexRoute component={GameIndex} game={game} />
      <Route path="games/:gameId" component={GameInfo} game={game} />
      <Route path="games/:gameId/stream" component={GameStream} game={game} />
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
