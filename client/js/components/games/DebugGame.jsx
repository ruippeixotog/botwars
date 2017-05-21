import React from "react";
import PropTypes from "prop-types";

let DebugGame = React.createClass({

  propTypes: {
    gameId: PropTypes.string.isRequired
  },

  render: function () {
    let gameRepr = JSON.stringify(this.props.gameState, null, 2);

    return (
        <div>
          <div>Game ID: {this.props.gameId}</div>
          <div>State:</div>
          <pre>{gameRepr}</pre>
        </div>
    );
  }
});

export default DebugGame;
