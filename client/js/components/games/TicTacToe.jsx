import React from "react";
import { Col, Row } from "react-bootstrap";

const CellX = React.createClass({
  render: function () {
    let dx = this.props.col * 200;
    let dy = this.props.row * 200;
    return (
        <g transform={`translate(${dx},${dy})`}>
          <line x1="30" x2="170" y1="30" y2="170"
                style={{ strokeWidth: 10, stroke: "red", strokeLinecap: "round" }} />
          <line x1="30" x2="170" y1="170" y2="30"
                style={{ strokeWidth: 10, stroke: "red", strokeLinecap: "round" }} />
        </g>
    );
  }
});

const CellO = React.createClass({
  render: function () {
    let dx = this.props.col * 200 + 100;
    let dy = this.props.row * 200 + 100;
    return (
        <circle cx={dx} cy={dy} r="72" style={{ strokeWidth: 10, stroke: "green", fill: "none" }} />
    );
  }
});

const Grid = React.createClass({

  handleClick: function (evt) {
    let uupos = evt.target.createSVGPoint();
    uupos.x = evt.clientX;
    uupos.y = evt.clientY;
    let ctm = evt.target.getScreenCTM().inverse();
    if (ctm) uupos = uupos.matrixTransform(ctm);

    this.props.onMove({ row: Math.floor(uupos.y / 200), col: Math.floor(uupos.x / 200) });
  },

  render: function () {
    let grid = this.props.grid;
    let cells = [];

    if (grid) {
      for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 3; col++) {
          if (grid[row][col] > 0) {
            let Cell = grid[row][col] === 1 ? CellO : CellX;
            cells.push(<Cell row={row} col={col} key={[row, col]} />);
          }
        }
      }
    }

    return (
        <svg id="tictactoe" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600"
             onClick={this.handleClick}>
          <line x1="0" x2="600" y1="200" y2="200" style={{ strokeWidth: 5, stroke: "black" }} />
          <line x1="0" x2="600" y1="400" y2="400" style={{ strokeWidth: 5, stroke: "black" }} />
          <line x1="200" x2="200" y1="0" y2="600" style={{ strokeWidth: 5, stroke: "black" }} />
          <line x1="400" x2="400" y1="0" y2="600" style={{ strokeWidth: 5, stroke: "black" }} />
          {cells}
        </svg>
    );
  }
});

const PlayerTextRepr = ({ player }) => (
    player === 1 ?
        <span style={{ color: "green", fontWeight: "bold" }}>O</span> :
        <span style={{ color: "red", fontWeight: "bold" }}>X</span>
);

const GameStatusMessage = ({ gameState }) => {
  if (!gameState) return <span>Waiting for the game to start...</span>;

  let { nextPlayer, winner, isError } = gameState;
  if (nextPlayer !== null)
    return <span>Player {nextPlayer} (<PlayerTextRepr player={nextPlayer} />) to play</span>;
  if (winner !== null)
    return <span>Player {winner} (<PlayerTextRepr player={winner} />) wins!</span>;
  if (isError)
    return <span>An error occurred</span>;
  return <span>It's a draw!</span>;
};

let TicTacToe = React.createClass({

  render: function () {
    let gameState = this.props.gameState;
    let onMove = this.props.isLastState ? this.props.onMove : () => {};

    return (
        <Row>
          <Col lg={6}>
            <Grid grid={gameState ? gameState.grid : null} onMove={onMove} />
          </Col>
          <Col lg={6}>
            <h3>
              <GameStatusMessage gameState={gameState} />
            </h3>
          </Col>
        </Row>
    );
  }
});

export default TicTacToe;
