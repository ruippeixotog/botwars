import React from "react";
import PropTypes from "prop-types";
import SideNav from "./SideNav";
import HeaderNav from "./HeaderNav";

const Nav = props => (
  <nav className="navbar navbar-default navbar-static-top" role="navigation"
       style={{ marginBottom: 0 }}>
    <HeaderNav {...props} />
    <SideNav {...props} />
  </nav>
);

Nav.propTypes = {
  games: PropTypes.array.isRequired
};

export default Nav;
