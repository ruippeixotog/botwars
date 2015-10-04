import React from "react";

var TicTacToe = React.createClass({

  propTypes: {
    gameId: React.PropTypes.string.isRequired
  },

  render: function () {
    var gameRepr = JSON.stringify(this.props.gameState, null, 2);

    return (
        <div>
          <div>Game ID: {this.props.gameId}</div>
          <div>State:</div>
          <pre>{gameRepr}</pre>
        </div>
    );
  }
});

export default TicTacToe;
