import { GAME_CONSTANTS } from './constants.js';

/**
 * Manages game state and provides clean interface for state operations
 */
export class GameStateManager {
  constructor() {
    this.gameState = this._createInitialState();
  }

  _createInitialState() {
    return {
      player1: {
        y: GAME_CONSTANTS.COURT_HEIGHT / 2 - GAME_CONSTANTS.PADDLE_HEIGHT / 2,
      },
      player2: {
        y: GAME_CONSTANTS.COURT_HEIGHT / 2 - GAME_CONSTANTS.PADDLE_HEIGHT / 2,
      },
      ball: {
        x: GAME_CONSTANTS.COURT_WIDTH / 2 - GAME_CONSTANTS.BALL_SIZE / 2,
        y: GAME_CONSTANTS.COURT_HEIGHT / 2 - GAME_CONSTANTS.BALL_SIZE / 2,
        vx: GAME_CONSTANTS.BALL_INITIAL_SPEED,
        vy: GAME_CONSTANTS.BALL_INITIAL_SPEED,
      },
      score: {
        player1: GAME_CONSTANTS.INITIAL_SCORE,
        player2: GAME_CONSTANTS.INITIAL_SCORE,
      },
      mode: GAME_CONSTANTS.GAME_MODES.PVP,
    };
  }

  getGameState() {
    return this.gameState;
  }

  getPlayer(playerId) {
    return this.gameState[playerId];
  }

  getBall() {
    return this.gameState.ball;
  }

  setBall(ball) {
    this.gameState.ball = ball;
  }

  getScore() {
    return this.gameState.score;
  }

  incrementScore(playerId) {
    if (playerId === 'player1' || playerId === 'player2') {
      this.gameState.score[playerId]++;
    }
  }

  resetScore() {
    this.gameState.score = {
      player1: GAME_CONSTANTS.INITIAL_SCORE,
      player2: GAME_CONSTANTS.INITIAL_SCORE,
    };
  }

  getGameMode() {
    return this.gameState.mode;
  }

  setGameMode(mode) {
    this.gameState.mode = mode;
    this.resetScore();
  }

  updatePlayerPosition(playerId, y) {
    if (playerId === 'player1' || playerId === 'player2') {
      this.gameState[playerId].y = y;
    }
  }

  reset() {
    this.gameState = this._createInitialState();
  }
}
