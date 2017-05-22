import React from "react";
import PropTypes from "prop-types";

const DebugGame = ({ gameId, gameState }) => (
  <div>
    <div>Game ID: {gameId}</div>
    <div>State:</div>
    <pre>{JSON.stringify(gameState, null, 2)}</pre>
  </div>
);

DebugGame.propTypes = {
  gameId: PropTypes.string.isRequired
};

export default DebugGame;
