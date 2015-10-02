import React from "react";
import {Link} from "react-router";

var Index = React.createClass({

  render: function () {
    return (
        <div>
          <div>Games:</div>
          <ul>
            <li>
              <Link to="/tictactoe">TicTacToe</Link>
            </li>
          </ul>
        </div>
    );
  }
});

export default Index;
