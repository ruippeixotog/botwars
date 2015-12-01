import React from "react";

import GameStatus from "../constants/GameStatus";
import ConnStatus from "../constants/ConnStatus";

const GameStatusLabel = ({ status, connStatus, showLabels = true }) => {
  if (connStatus === ConnStatus.NOT_CONNECTED || connStatus === ConnStatus.CONNECTION_DOWN) {
    return <div className="game-status connecting">Connecting...</div>;
  }
  switch (status) {
    case GameStatus.NOT_STARTED:
      return <div className="game-status not-started">{showLabels ? "Not started yet" : ""}</div>;
    case GameStatus.STARTED:
      return <div className="game-status started">{showLabels ? "Live" : ""}</div>;
    case GameStatus.ENDED:
      return <div className="game-status ended">{showLabels ? "Ended" : ""}</div>;
  }
  return <div className="game-status unknown">{showLabels ? "Unknown" : ""}</div>;
};

export default GameStatusLabel;
