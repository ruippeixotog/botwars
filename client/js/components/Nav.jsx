import React from "react";
import PropTypes from "prop-types";
import SideNav from "./SideNav";
import HeaderNav from "./HeaderNav";

class Nav extends React.Component {
  static propTypes = {
    games: PropTypes.array.isRequired
  };

  render() {
    return (
        <nav className="navbar navbar-default navbar-static-top" role="navigation"
             style={{ marginBottom: 0 }}>
          <HeaderNav {...this.props} />
          <SideNav {...this.props} />
        </nav>
    );
  }
}

export default Nav;
