import crypto from "crypto";

class PlayerRegistry {
  constructor(playerCount) {
    this.playerCount = playerCount;
    this.currentPlayerCount = 0;
    this.connectedPlayerCount = 0;
    this.playerTokenTable = {};
    this.revPlayerTokenTable = {};
    this.playerState = {};
  }

  register(player, playerToken) {
    if (player && this.playerState[player]) return null;
    if (this.currentPlayerCount === this.playerCount) return null;

    playerToken = playerToken || crypto.randomBytes(20).toString("hex");
    if (!player) {
      player = 1;
      while (this.playerState[player]) player++;
    }

    this.currentPlayerCount++;
    this.playerTokenTable[playerToken] = player;
    this.revPlayerTokenTable[player] = playerToken;
    this.playerState[player] = { connectedOnce: false };
    return { player, playerToken };
  }

  getRegisteredCount() {
    return this.currentPlayerCount;
  }

  getPlayer(playerToken) {
    return this.playerTokenTable[playerToken];
  }

  getPlayerToken(player) {
    return this.revPlayerTokenTable[player];
  }

  connect(player) {
    if (this.playerState[player].connectedOnce)
      return false;

    this.connectedPlayerCount++;
    this.playerState[player].connectedOnce = true;
    return this.connectedPlayerCount === this.playerCount;
  }

  getConnectedCount() {
    return this.connectedPlayerCount;
  }
}

export default PlayerRegistry;
