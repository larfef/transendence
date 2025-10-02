import { GAME_CONSTANTS, AI_CONSTANTS } from './constants.js';
import { BallPhysics } from './physics.js';
import { PlayerMovement } from './player-movement.js';
import { AIController } from './ai-controller.js';
import { GameStateManager } from './game-state.js';

class PongGame {
  constructor() {
    // Initialize game modules
    this.gameState = new GameStateManager();
    this.physics = new BallPhysics();
    this.playerMovement = new PlayerMovement();
    this.aiController = new AIController();

    // Game loop properties
    this.gameInterval = null;
    this.onStateChange = null;
    this.lastBroadcast = 0;
    this.broadcastRate = GAME_CONSTANTS.BROADCAST_RATE;

    // Sync ball state between physics and game state
    this._syncBallState();
  }

  // Private helper method to sync ball state
  _syncBallState() {
    this.gameState.setBall(this.physics.getBall());
  }

  handlePlayerInput(player, input) {
    this.playerMovement.handlePlayerInput(player, input);
  }

  update() {
    const gameStateData = this.gameState.getGameState();
    const ball = this.physics.getBall();

    // Update ball physics
    this.physics.updatePosition();
    this.physics.checkWallCollisions();

    // Update game state with new ball position
    this._syncBallState();

    // Update player positions
    this.playerMovement.updatePlayerPositions(gameStateData);

    // Check paddle collisions
    this._checkPaddleCollisions();

    // Check for scoring
    const goalScorer = this.physics.checkGoalCollisions();
    if (goalScorer) {
      this.gameState.incrementScore(goalScorer);
      this.resetBall();
    }

    // Update AI if needed
    if (this.aiController.shouldUpdateAI(ball.x, gameStateData.mode)) {
      this.aiController.updateAI(gameStateData);
    }

    // Broadcast game state
    this._broadcastGameState();
  }

  _checkPaddleCollisions() {
    const gameStateData = this.gameState.getGameState();
    this.physics.handlePaddleCollision('player1', gameStateData.player1);
    this.physics.handlePaddleCollision('player2', gameStateData.player2);
    this._syncBallState();
  }

  _broadcastGameState() {
    const now = Date.now();
    if (now - this.lastBroadcast >= this.broadcastRate && this.onStateChange) {
      this.onStateChange(this.gameState.getGameState());
      this.lastBroadcast = now;
    }
  }

  resetBall() {
    const newBall = this.physics.resetBall();
    newBall.vx *= -1; // Reverse direction
    this._syncBallState();

    this.aiController.resetAI();

    // If in AI mode, start AI immediately after reset
    if (this.gameState.getGameMode() === GAME_CONSTANTS.GAME_MODES.AI) {
      this.aiController.startAI();
    }
  }

  getGameState() {
    return this.gameState.getGameState();
  }

  movePaddle(player, y) {
    const gameMode = this.gameState.getGameMode();
    const newY = this.playerMovement.movePaddle(player, y, gameMode);

    if (newY !== null) {
      this.gameState.updatePlayerPosition(player, newY);
    }
  }

  setGameMode(mode) {
    this.gameState.setGameMode(mode);
    this.resetBall();
    this.aiController.resetAI();
  }

  start() {
    if (this.gameInterval) {
      clearInterval(this.gameInterval);
    }
    this.gameInterval = setInterval(
      () => this.update(),
      GAME_CONSTANTS.FRAME_INTERVAL
    );
  }

  stop() {
    if (this.gameInterval) {
      clearInterval(this.gameInterval);
      this.gameInterval = null;
    }
  }
}

const game = new PongGame();
export default game;
