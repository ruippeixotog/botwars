import React from "react";
import { Outlet } from "react-router-dom";
import Nav from "./Nav";

const App = ({ games }): JSX.Element => (
  <div className="fill flex">
    <Nav games={games} />
    <div id="page-wrapper" className="flex">
      <Outlet />
    </div>
  </div>
);

export default App;
