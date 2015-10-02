import React from "react";

var App = React.createClass({

  propTypes: {
    children: React.PropTypes.element.isRequired
  },

  render: function () {
    return (
        <div>
          <div id="header"></div>
          <h1>Bot arena</h1>
          <div>
            {this.props.children}
          </div>
        </div>
    );
  }
});

export default App;
