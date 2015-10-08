import React from "react";
import ReactDOM from "react-dom";
import {Route, Router, IndexRoute} from "react-router";
import createBrowserHistory from "history/lib/createBrowserHistory";

import App from "./components/App";
import Index from "./components/Index";
import GameIndex from "./components/GameIndex";
import Game from "./components/Game";
import PageNotFound from "./components/PageNotFound";

import TicTacToe from "./components/games/TicTacToe";

var games = [
  { name: "TicTacToe", href: "/tictactoe", component: TicTacToe }
];

var gameRoutes = games.map(game =>
    <Route path={game.href} key={game.href}>
      <IndexRoute component={GameIndex} game={game} />
      <Route path=":gameId" component={Game} game={game} />
    </Route>
);

var routes = (
    <Route path="/" component={App} games={games}>
      <IndexRoute component={Index} />
      {gameRoutes}
      <Route path="*" component={PageNotFound} />
    </Route>
);

ReactDOM.render(
    <Router routes={routes} history={createBrowserHistory()} />,
    document.getElementById("main"));
