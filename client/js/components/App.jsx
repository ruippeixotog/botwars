import React from "react";
import Nav from "./Nav";

var App = React.createClass({

  propTypes: {
    children: React.PropTypes.element.isRequired
  },

  render: function () {
    var games = this.props.route.games;

    return (
        <div className="fill flex">
          <Nav games={games} />
          <div id="page-wrapper" className="flex">
            {this.props.children}
          </div>
        </div>
    );
  }
});

export default App;
