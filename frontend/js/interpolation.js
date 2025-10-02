import { GAME_CONSTANTS } from './constants.js';

export class InterpolationManager {
  constructor() {
    this.interpolatedState = null;
    this.lastServerState = null;
    this.serverStateTime = 0;
    this.predictedPaddlePositions = {
      player1: null,
      player2: null,
    };
  }

  updateServerState(serverState) {
    this.lastServerState = JSON.parse(JSON.stringify(serverState)); // Deep copy
    this.serverStateTime = Date.now();

    // Reset predictions when we get server state
    this.predictedPaddlePositions.player1 = null;
    this.predictedPaddlePositions.player2 = null;
  }
  interpolateState() {
    if (!this.lastServerState) {
      this.interpolatedState = null;
      return;
    }

    const now = Date.now();
    const timeSinceServerUpdate = now - this.serverStateTime;

    // If we have a previous state, interpolate
    if (
      this.interpolatedState &&
      timeSinceServerUpdate < GAME_CONSTANTS.INTERPOLATION_DELAY
    ) {
      const interpolationFactor = Math.min(
        timeSinceServerUpdate / GAME_CONSTANTS.INTERPOLATION_DELAY,
        1
      );

      this.interpolatedState = {
        player1: {
          y: this.lerp(
            this.interpolatedState.player1.y,
            this.lastServerState.player1.y,
            interpolationFactor
          ),
        },
        player2: {
          y: this.lerp(
            this.interpolatedState.player2.y,
            this.lastServerState.player2.y,
            interpolationFactor
          ),
        },
        ball: {
          x: this.lerp(
            this.interpolatedState.ball.x,
            this.lastServerState.ball.x,
            interpolationFactor
          ),
          y: this.lerp(
            this.interpolatedState.ball.y,
            this.lastServerState.ball.y,
            interpolationFactor
          ),
          vx: this.lastServerState.ball.vx,
          vy: this.lastServerState.ball.vy,
        },
        score: this.lastServerState.score,
        mode: this.lastServerState.mode,
      };

      // Apply ball movement prediction for smoother collisions
      this.predictBallMovement();
    } else {
      // Use server state directly if interpolation delay has passed
      this.interpolatedState = JSON.parse(JSON.stringify(this.lastServerState));
    }
  }
  // Linear interpolation helper
  lerp(start, end, factor) {
    return start + (end - start) * factor;
  }

  // Client-side ball prediction for ultra-smooth movement
  predictBallMovement() {
    if (!this.interpolatedState || !this.lastServerState) return;

    const ball = this.interpolatedState.ball;
    const serverBall = this.lastServerState.ball;

    // Calculate time difference
    const now = Date.now();
    const timeDiff = (now - this.serverStateTime) / 1000; // Convert to seconds

    // Predict ball position based on velocity
    let predictedX = serverBall.x + serverBall.vx * timeDiff;
    let predictedY = serverBall.y + serverBall.vy * timeDiff;

    // Apply wall bounces
    let predictedVx = serverBall.vx;
    let predictedVy = serverBall.vy;

    // Wall collision prediction
    if (predictedY <= 0) {
      predictedY = 0;
      predictedVy = Math.abs(predictedVy);
    } else if (
      predictedY >=
      GAME_CONSTANTS.COURT_HEIGHT - GAME_CONSTANTS.BALL_SIZE
    ) {
      predictedY = GAME_CONSTANTS.COURT_HEIGHT - GAME_CONSTANTS.BALL_SIZE;
      predictedVy = -Math.abs(predictedVy);
    }

    // Paddle collision prediction for smoother visual feedback
    this.predictPaddleCollisions(
      predictedX,
      predictedY,
      predictedVx,
      predictedVy
    );

    // Update interpolated ball with prediction
    ball.x = predictedX;
    ball.y = predictedY;
    ball.vx = predictedVx;
    ball.vy = predictedVy;
  }

  // Predict paddle collisions for smoother visual feedback
  predictPaddleCollisions(predictedX, predictedY, predictedVx, predictedVy) {
    if (!this.interpolatedState) return;

    const ballLeft = predictedX;
    const ballRight = predictedX + GAME_CONSTANTS.BALL_SIZE;
    const ballTop = predictedY;
    const ballBottom = predictedY + GAME_CONSTANTS.BALL_SIZE;

    // Check player1 paddle collision
    const paddle1X = 0;
    const paddle1Right = GAME_CONSTANTS.PADDLE_WIDTH;
    const paddle1Top = this.interpolatedState.player1.y;
    const paddle1Bottom =
      this.interpolatedState.player1.y + GAME_CONSTANTS.PADDLE_HEIGHT;

    if (predictedVx < 0 && ballRight >= paddle1X && ballLeft <= paddle1Right) {
      if (ballBottom > paddle1Top && ballTop < paddle1Bottom) {
        // Collision detected - position ball at paddle edge
        predictedX = paddle1Right;
        predictedVx = Math.abs(predictedVx);
      }
    }

    // Check player2 paddle collision
    const paddle2X = GAME_CONSTANTS.COURT_WIDTH - GAME_CONSTANTS.PADDLE_WIDTH;
    const paddle2Right = GAME_CONSTANTS.COURT_WIDTH;
    const paddle2Top = this.interpolatedState.player2.y;
    const paddle2Bottom =
      this.interpolatedState.player2.y + GAME_CONSTANTS.PADDLE_HEIGHT;

    if (predictedVx > 0 && ballLeft <= paddle2Right && ballRight >= paddle2X) {
      if (ballBottom > paddle2Top && ballTop < paddle2Bottom) {
        // Collision detected - position ball at paddle edge
        predictedX = paddle2X - GAME_CONSTANTS.BALL_SIZE;
        predictedVx = -Math.abs(predictedVx);
      }
    }
  }
  // Apply client-side paddle predictions for immediate response
  applyPaddlePredictions() {
    if (!this.interpolatedState) return;

    // Apply player 1 prediction
    if (this.predictedPaddlePositions.player1 !== null) {
      this.interpolatedState.player1.y = this.predictedPaddlePositions.player1;
    }

    // Apply player 2 prediction (only in PvP mode)
    if (this.predictedPaddlePositions.player2 !== null) {
      this.interpolatedState.player2.y = this.predictedPaddlePositions.player2;
    }
  }

  setPaddlePrediction(player, y) {
    this.predictedPaddlePositions[player] = y;
  }

  getInterpolatedState() {
    return this.interpolatedState;
  }

  getLastServerState() {
    return this.lastServerState;
  }
}
