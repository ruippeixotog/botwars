import React from "react";
import PropTypes from "prop-types";
import Nav from "./Nav";

const App = ({ route, children }) => (
  <div className="fill flex">
    <Nav games={route.games} />
    <div id="page-wrapper" className="flex">
      {children}
    </div>
  </div>
);

App.propTypes = {
  children: PropTypes.element.isRequired
};

export default App;
