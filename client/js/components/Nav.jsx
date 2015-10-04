import React from "react";
import SideNav from "./SideNav";
import HeaderNav from "./HeaderNav";

var Nav = React.createClass({

  propTypes: {
    games: React.PropTypes.array.isRequired
  },

  render: function () {
    return (
        <nav className="navbar navbar-default navbar-static-top" role="navigation" style={{marginBottom: 0}}>
          <HeaderNav {...this.props} />
          <SideNav {...this.props} />
        </nav>
    );
  }
});

export default Nav;
