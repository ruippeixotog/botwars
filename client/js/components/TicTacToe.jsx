import React from "react";
import {Link} from "react-router";

var TicTacToe = React.createClass({

  render: function () {
    return (
        <div>
          <Link to="/">Back to index</Link>
          <img src="https://upload.wikimedia.org/wikipedia/commons/3/32/Tic_tac_toe.svg" />
        </div>
    );
  }
});

export default TicTacToe;
