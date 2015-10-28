import React from "react";

import GameStatus from "../constants/GameStatus";
import ConnStatus from "../constants/ConnStatus";

const GameStatusLabel = ({ status, connStatus }) => {
  if (connStatus === ConnStatus.NOT_CONNECTED || connStatus === ConnStatus.CONNECTION_DOWN) {
    return <div className="game-status connecting">Connecting...</div>;
  }
  switch (status) {
    case GameStatus.NOT_STARTED:
      return <div className="game-status not-started">Not started yet</div>;
    case GameStatus.STARTED:
      return <div className="game-status started">Live</div>;
    case GameStatus.ENDED:
      return <div className="game-status ended">Ended</div>;
  }
  return <div className="game-status unknown">Unknown</div>;
};

export default GameStatusLabel;
