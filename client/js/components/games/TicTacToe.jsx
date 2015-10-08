import React from "react";

var CellX = React.createClass({
  render: function() {
    var dx = this.props.col * 200;
    var dy = this.props.row * 200;
    return (
        <g transform={`translate(${dx},${dy})`}>
          <line x1="20" x2="180" y1="20" y2="180" style={{ strokeWidth: 8, stroke: 'red', strokeLinecap: 'round' }} />
          <line x1="20" x2="180" y1="180" y2="20" style={{ strokeWidth: 8, stroke: 'red', strokeLinecap: 'round' }} />
        </g>
    );
  }
});

var CellO = React.createClass({
  render: function() {
    var dx = this.props.col * 200 + 100;
    var dy = this.props.row * 200 + 100;
    return (
        <circle cx={dx} cy={dy} r="80" style={{ strokeWidth: 7, stroke: 'green', fill: 'none' }} />
    );
  }
});

var cellComponents = [CellO, CellX];

var Grid = React.createClass({
  render: function () {
    var grid = this.props.grid;
    var cells = [];

    for(let row = 0; row < 3; row++) {
      for(let col = 0; col < 3; col++) {
        if(grid[row][col] > 0) {
          var Cell = cellComponents[grid[row][col] - 1];
          cells.push(<Cell row={row} col={col} key={[row, col]} />);
        }
      }
    }

    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" id="tictactoe">
          <line x1="0" x2="600" y1="200" y2="200" style={{ strokeWidth: 5, stroke: 'black' }} />
          <line x1="0" x2="600" y1="400" y2="400" style={{ strokeWidth: 5, stroke: 'black' }} />
          <line x1="200" x2="200" y1="0" y2="600" style={{ strokeWidth: 5, stroke: 'black' }} />
          <line x1="400" x2="400" y1="0" y2="600" style={{ strokeWidth: 5, stroke: 'black' }} />
          {cells}
        </svg>
    );
  }
});

var TicTacToe = React.createClass({

  render: function () {
    var gameState = this.props.gameState;
    if(!gameState) return (<div>Waiting for the game to start...</div>);

    return (
        <div>
          <Grid grid={gameState.grid} />
        </div>
    );
  }
});

export default TicTacToe;
