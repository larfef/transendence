import { GAME_CONSTANTS } from './constants.js';
import { AI_CONSTANTS } from './constants.js';

/**
 * Handles AI behavior and decision making
 */
export class AIController {
  constructor() {
    this.aiDelay = 0;
    this.lastAIUpdate = 0;
    this.aiReactionTime = AI_CONSTANTS.INITIAL_DELAY;
    this.aiHasStarted = false;
  }

  shouldUpdateAI(ballX, gameMode) {
    if (gameMode !== GAME_CONSTANTS.GAME_MODES.AI) {
      return false;
    }

    const now = Date.now();
    const courtMidpoint = GAME_CONSTANTS.COURT_WIDTH / 2;
    const ballInAISide = ballX >= courtMidpoint;

    // If ball is in AI side and initial delay has passed, start AI movement
    if (ballInAISide && !this.aiHasStarted) {
      if (now - this.lastAIUpdate >= this.aiReactionTime) {
        this.aiHasStarted = true;
        this.lastAIUpdate = now;
        return true;
      }
      return false;
    }

    // If AI has started, move continuously without delay
    if (this.aiHasStarted) {
      return true;
    }

    // Only reset AI when ball goes back to player side AND enough time has passed
    // This prevents immediate reset after ball reset
    if (!ballInAISide && this.aiHasStarted) {
      // Add a small delay to prevent immediate reset after ball reset
      if (now - this.lastAIUpdate >= 100) {
        // 100ms delay
        this.aiHasStarted = false;
        this.lastAIUpdate = now;
        this.aiReactionTime = AI_CONSTANTS.INITIAL_DELAY;
        return false;
      }
    }

    return false;
  }

  updateAI(gameState) {
    const paddleCenter = gameState.player2.y + GAME_CONSTANTS.PADDLE_HEIGHT / 2;
    const ballY = gameState.ball.y + GAME_CONSTANTS.BALL_SIZE / 2;
    const ballX = gameState.ball.x;
    const ballVx = gameState.ball.vx;

    // Add occasional "thinking" delays
    if (Math.random() < 0.1) {
      // 10% chance to skip movement
      return;
    }

    // Less accurate prediction - add more error
    let targetY = ballY;
    if (ballVx > 0) {
      const ballToPaddleDistance =
        GAME_CONSTANTS.COURT_WIDTH - GAME_CONSTANTS.PADDLE_WIDTH - ballX;
      if (ballToPaddleDistance > 0 && Math.abs(ballVx) > 0) {
        const timeToReachPaddle = ballToPaddleDistance / ballVx;
        // Add prediction error
        const predictionError = (Math.random() - 0.5) * 50; // ±25 pixel error
        targetY =
          ballY + gameState.ball.vy * timeToReachPaddle + predictionError;
      }
    }

    // Increase randomness significantly
    const perturbation = (Math.random() - 0.5) * AI_CONSTANTS.PERTURBATION * 2; // Double the perturbation
    targetY += perturbation;

    // Add occasional "overshoot" behavior
    const overshootChance = 0.15; // 15% chance
    if (Math.random() < overshootChance) {
      targetY += (Math.random() - 0.5) * 40; // ±20 pixel overshoot
    }

    // Calculate difference from current paddle position
    const diff = targetY - paddleCenter;

    // Move towards target
    const aiSpeed = Math.min(
      Math.abs(diff) * AI_CONSTANTS.SPEED_MULTIPLIER,
      AI_CONSTANTS.MAX_SPEED
    );

    if (Math.abs(diff) > AI_CONSTANTS.MOVEMENT_THRESHOLD) {
      const newY = gameState.player2.y + (diff > 0 ? aiSpeed : -aiSpeed);
      gameState.player2.y = Math.max(
        0,
        Math.min(
          GAME_CONSTANTS.COURT_HEIGHT - GAME_CONSTANTS.PADDLE_HEIGHT,
          newY
        )
      );
    }
  }

  resetAI() {
    this.aiHasStarted = false;
    this.lastAIUpdate = Date.now();
    this.aiReactionTime = AI_CONSTANTS.INITIAL_DELAY;
  }

  resetAIWithNewReactionTime() {
    this.resetAI();
    this.aiReactionTime =
      AI_CONSTANTS.REACTION_TIME_MIN +
      Math.random() *
        (AI_CONSTANTS.REACTION_TIME_MAX - AI_CONSTANTS.REACTION_TIME_MIN);
  }

  startAI() {
    this.aiHasStarted = true;
  }

  getAIState() {
    return {
      hasStarted: this.aiHasStarted,
      reactionTime: this.aiReactionTime,
      lastUpdate: this.lastAIUpdate,
    };
  }
}
