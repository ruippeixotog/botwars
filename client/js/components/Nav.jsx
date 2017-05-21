import React from "react";
import PropTypes from "prop-types";
import SideNav from "./SideNav";
import HeaderNav from "./HeaderNav";

let Nav = React.createClass({

  propTypes: {
    games: PropTypes.array.isRequired
  },

  render: function () {
    return (
        <nav className="navbar navbar-default navbar-static-top" role="navigation"
             style={{ marginBottom: 0 }}>
          <HeaderNav {...this.props} />
          <SideNav {...this.props} />
        </nav>
    );
  }
});

export default Nav;
