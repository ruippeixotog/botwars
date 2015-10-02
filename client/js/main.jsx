import React from "react";
import {Route, Router, IndexRoute} from "react-router";
import createBrowserHistory from "history/lib/createBrowserHistory";

import App from "./components/App";
import Index from "./components/Index";
import TicTacToe from "./components/TicTacToe";
import PageNotFound from "./components/PageNotFound";

var routes = (
    <Route path="/" component={App}>
      <IndexRoute component={Index} />
      <Route path="tictactoe" component={TicTacToe} />
      <Route path="*" component={PageNotFound} />
    </Route>
);

React.render(
    <Router routes={routes} history={createBrowserHistory()} />,
    document.getElementById("main"));
