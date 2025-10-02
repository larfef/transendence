import { GAME_CONSTANTS } from './constants.js';

/**
 * Handles player movement logic and input processing
 */
export class PlayerMovement {
  constructor() {
    this.playerInputs = {
      player1: { up: false, down: false },
      player2: { up: false, down: false },
    };

    this.player1Speed = GAME_CONSTANTS.PLAYER1_SPEED;
    this.player2Speed = GAME_CONSTANTS.PLAYER2_SPEED;
  }

  handlePlayerInput(player, input) {
    if (player === 'player1' || player === 'player2') {
      this.playerInputs[player] = input;
    }
  }

  updatePlayerPositions(gameState) {
    this._updatePlayer1(gameState);
    this._updatePlayer2(gameState);
  }

  _updatePlayer1(gameState) {
    const player = gameState.player1;

    if (this.playerInputs.player1.up) {
      player.y = Math.max(0, player.y - this.player1Speed);
    }
    if (this.playerInputs.player1.down) {
      player.y = Math.min(
        GAME_CONSTANTS.COURT_HEIGHT - GAME_CONSTANTS.PADDLE_HEIGHT,
        player.y + this.player1Speed
      );
    }
  }

  _updatePlayer2(gameState) {
    // Only move player2 in PVP mode
    if (gameState.mode !== GAME_CONSTANTS.GAME_MODES.PVP) {
      return;
    }

    const player = gameState.player2;

    if (this.playerInputs.player2.up) {
      player.y = Math.max(0, player.y - this.player2Speed);
    }
    if (this.playerInputs.player2.down) {
      player.y = Math.min(
        GAME_CONSTANTS.COURT_HEIGHT - GAME_CONSTANTS.PADDLE_HEIGHT,
        player.y + this.player2Speed
      );
    }
  }

  movePaddle(player, y, gameMode) {
    const clampedY = Math.max(
      0,
      Math.min(GAME_CONSTANTS.COURT_HEIGHT - GAME_CONSTANTS.PADDLE_HEIGHT, y)
    );

    if (player === 'player1') {
      return clampedY;
    }
    if (player === 'player2' && gameMode === GAME_CONSTANTS.GAME_MODES.PVP) {
      return clampedY;
    }

    return null; // Invalid move
  }

  getPlayerInputs() {
    return this.playerInputs;
  }
}
