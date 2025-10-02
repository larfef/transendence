import { GAME_CONSTANTS } from './constants.js';

/**
 * Handles all ball physics calculations and movements
 */
export class BallPhysics {
  constructor() {
    this.resetBall();
  }

  resetBall() {
    this.ball = {
      x: GAME_CONSTANTS.COURT_WIDTH / 2, // Center the ball exactly at midpoint
      y: GAME_CONSTANTS.COURT_HEIGHT / 2 - GAME_CONSTANTS.BALL_SIZE / 2,
      vx: GAME_CONSTANTS.BALL_INITIAL_SPEED,
      vy: GAME_CONSTANTS.BALL_INITIAL_SPEED,
    };
    return this.ball;
  }

  updatePosition() {
    this.ball.x += this.ball.vx;
    this.ball.y += this.ball.vy;
  }

  checkWallCollisions() {
    // Ball collision with top/bottom walls
    if (this.ball.y <= 0) {
      this.ball.y = 0;
      this.ball.vy = Math.abs(this.ball.vy);
    } else if (
      this.ball.y >=
      GAME_CONSTANTS.COURT_HEIGHT - GAME_CONSTANTS.BALL_SIZE
    ) {
      this.ball.y = GAME_CONSTANTS.COURT_HEIGHT - GAME_CONSTANTS.BALL_SIZE;
      this.ball.vy = -Math.abs(this.ball.vy);
    }
  }

  checkGoalCollisions() {
    const leftGoal = this.ball.x < 0;
    const rightGoal = this.ball.x > GAME_CONSTANTS.COURT_WIDTH;

    if (leftGoal || rightGoal) {
      return leftGoal ? 'player2' : 'player1';
    }
    return null;
  }

  handlePaddleCollision(player, paddle) {
    const ball = this.ball;
    const paddleX =
      player === 'player1'
        ? 0
        : GAME_CONSTANTS.COURT_WIDTH - GAME_CONSTANTS.PADDLE_WIDTH;
    const paddleRight =
      player === 'player1'
        ? GAME_CONSTANTS.PADDLE_WIDTH
        : GAME_CONSTANTS.COURT_WIDTH;

    // More precise collision detection
    const ballLeft = ball.x;
    const ballRight = ball.x + GAME_CONSTANTS.BALL_SIZE;
    const ballTop = ball.y;
    const ballBottom = ball.y + GAME_CONSTANTS.BALL_SIZE;

    const paddleTop = paddle.y;
    const paddleBottom = paddle.y + GAME_CONSTANTS.PADDLE_HEIGHT;

    // Check if ball is in paddle's X range
    let isInXRange = false;
    if (player === 'player1') {
      isInXRange = ballRight >= paddleX && ballLeft <= paddleRight;
    } else {
      isInXRange = ballLeft <= paddleRight && ballRight >= paddleX;
    }

    if (isInXRange && ballBottom > paddleTop && ballTop < paddleBottom) {
      this._calculateBounce(player, paddle, paddleX, paddleRight);
      return true;
    }
    return false;
  }

  _calculateBounce(player, paddle, paddleX, paddleRight) {
    const ball = this.ball;

    // Calculate collision point relative to paddle center
    const paddleCenter = paddle.y + GAME_CONSTANTS.PADDLE_HEIGHT / 2;
    const ballCenter = ball.y + GAME_CONSTANTS.BALL_SIZE / 2;
    const collisionPoint =
      (ballCenter - paddleCenter) / (GAME_CONSTANTS.PADDLE_HEIGHT / 2);

    // Clamp collision point between -1 and 1
    const normalizedCollision = Math.max(
      GAME_CONSTANTS.COLLISION_NORMALIZATION_MIN,
      Math.min(GAME_CONSTANTS.COLLISION_NORMALIZATION_MAX, collisionPoint)
    );

    // Calculate angle based on collision point
    const angle = normalizedCollision * GAME_CONSTANTS.BALL_MAX_ANGLE;

    // Calculate new velocity with angle
    const speed = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);
    const baseSpeed = Math.max(speed, GAME_CONSTANTS.BALL_MIN_SPEED);

    // Determine collision side and bounce with precise positioning
    if (player === 'player1' && ball.vx < 0) {
      ball.vx = Math.abs(Math.cos(angle) * baseSpeed);
      ball.vy = Math.sin(angle) * baseSpeed;
      ball.x = paddleRight;
    } else if (player === 'player2' && ball.vx > 0) {
      ball.vx = -Math.abs(Math.cos(angle) * baseSpeed);
      ball.vy = Math.sin(angle) * baseSpeed;
      ball.x = paddleX - GAME_CONSTANTS.BALL_SIZE;
    }

    // Add slight speed variation for more dynamic gameplay
    const speedVariation =
      GAME_CONSTANTS.SPEED_VARIATION_MIN +
      Math.random() *
        (GAME_CONSTANTS.SPEED_VARIATION_MAX -
          GAME_CONSTANTS.SPEED_VARIATION_MIN);
    ball.vx *= speedVariation;
    ball.vy *= speedVariation;
  }

  getBall() {
    return this.ball;
  }

  setBall(ball) {
    this.ball = ball;
  }
}
