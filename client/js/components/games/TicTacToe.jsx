import React from "react";

var TicTacToe = React.createClass({

  propTypes: {
    gameId: React.PropTypes.string.required
  },

  render: function () {
    return (
        <div>
          <img src="https://upload.wikimedia.org/wikipedia/commons/3/32/Tic_tac_toe.svg" />
          <div>(game: {this.props.gameId})</div>
        </div>
    );
  }
});

export default TicTacToe;
