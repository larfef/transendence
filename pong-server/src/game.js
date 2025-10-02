import { GAME_CONSTANTS, AI_CONSTANTS } from './constants.js';

class PongGame {
  constructor() {
    this.gameState = {
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

    this.playerInputs = {
      player1: { up: false, down: false },
      player2: { up: false, down: false },
    };

    // Player speeds (server-controlled)
    this.player1Speed = GAME_CONSTANTS.PLAYER1_SPEED;
    this.player2Speed = GAME_CONSTANTS.PLAYER2_SPEED;

    this.gameInterval = null;
    this.onStateChange = null;
    this.lastBroadcast = 0;
    this.broadcastRate = GAME_CONSTANTS.BROADCAST_RATE;

    // AI delay properties
    this.aiDelay = 0; // Delay in milliseconds
    this.lastAIUpdate = 0;
    this.aiReactionTime = AI_CONSTANTS.INITIAL_DELAY;
    this.aiHasStarted = false;
  }

  handlePlayerInput(player, input) {
    if (player === 'player1') {
      this.playerInputs.player1 = input;
    } else if (player === 'player2') {
      this.playerInputs.player2 = input;
    }
  }

  // Update player positions based on input
  updatePlayerMovement() {
    // Player 1 movement
    if (this.playerInputs.player1.up) {
      this.gameState.player1.y = Math.max(
        0,
        this.gameState.player1.y - this.player1Speed
      );
    }
    if (this.playerInputs.player1.down) {
      this.gameState.player1.y = Math.min(
        GAME_CONSTANTS.COURT_HEIGHT - GAME_CONSTANTS.PADDLE_HEIGHT,
        this.gameState.player1.y + this.player1Speed
      );
    }

    // Player 2 movement (only in PVP mode)
    if (this.gameState.mode === GAME_CONSTANTS.GAME_MODES.PVP) {
      if (this.playerInputs.player2.up) {
        this.gameState.player2.y = Math.max(
          0,
          this.gameState.player2.y - this.player2Speed
        );
      }
      if (this.playerInputs.player2.down) {
        this.gameState.player2.y = Math.min(
          GAME_CONSTANTS.COURT_HEIGHT - GAME_CONSTANTS.PADDLE_HEIGHT,
          this.gameState.player2.y + this.player2Speed
        );
      }
    }
  }

  update() {
    // Ball movement (simplified - no delta time for now)
    this.gameState.ball.x += this.gameState.ball.vx;
    this.gameState.ball.y += this.gameState.ball.vy;

    // Ball collision with top/bottom walls
    if (this.gameState.ball.y <= 0) {
      this.gameState.ball.y = 0;
      this.gameState.ball.vy = Math.abs(this.gameState.ball.vy);
    } else if (
      this.gameState.ball.y >=
      GAME_CONSTANTS.COURT_HEIGHT - GAME_CONSTANTS.BALL_SIZE
    ) {
      this.gameState.ball.y =
        GAME_CONSTANTS.COURT_HEIGHT - GAME_CONSTANTS.BALL_SIZE;
      this.gameState.ball.vy = -Math.abs(this.gameState.ball.vy);
    }

    this.updatePlayerMovement();

    // Optimized paddle collision detection
    this.checkPaddleCollision('player1', 0, GAME_CONSTANTS.PADDLE_WIDTH);
    this.checkPaddleCollision(
      'player2',
      GAME_CONSTANTS.COURT_WIDTH - GAME_CONSTANTS.PADDLE_WIDTH,
      GAME_CONSTANTS.COURT_WIDTH
    );

    // Scoring
    if (this.gameState.ball.x < 0) {
      this.gameState.score.player2++;
      this.resetBall();
      // Reset AI delay when ball resets
      this.aiReactionTime =
        AI_CONSTANTS.REACTION_TIME_MIN +
        Math.random() *
          (AI_CONSTANTS.REACTION_TIME_MAX - AI_CONSTANTS.REACTION_TIME_MIN);
    } else if (this.gameState.ball.x > GAME_CONSTANTS.COURT_WIDTH) {
      this.gameState.score.player1++;
      this.resetBall();
      // Reset AI delay when ball resets
      this.aiReactionTime =
        AI_CONSTANTS.REACTION_TIME_MIN +
        Math.random() *
          (AI_CONSTANTS.REACTION_TIME_MAX - AI_CONSTANTS.REACTION_TIME_MIN);
    }

    // AI logic with initial delay and continuous movement
    if (this.gameState.mode === GAME_CONSTANTS.GAME_MODES.AI) {
      const now = Date.now();

      // Check if ball is in AI's side of the court or at center
      const ballX = this.gameState.ball.x;
      const courtMidpoint = GAME_CONSTANTS.COURT_WIDTH / 2;
      const ballInAISide = ballX >= courtMidpoint; // Changed from > to >=

      // Debug logging
      console.log('AI Debug:', {
        ballX,
        courtMidpoint,
        ballInAISide,
        aiHasStarted: this.aiHasStarted,
        timeSinceLastUpdate: now - this.lastAIUpdate,
        aiReactionTime: this.aiReactionTime,
      });

      // If ball is in AI side and initial delay has passed, start AI movement
      if (ballInAISide && !this.aiHasStarted) {
        if (now - this.lastAIUpdate >= this.aiReactionTime) {
          this.aiHasStarted = true;
          this.lastAIUpdate = now;
          console.log('AI started moving');
        }
      }

      // If AI has started, move continuously without delay
      if (this.aiHasStarted) {
        this.updateAI();
      }

      // Reset AI when ball goes back to player side
      if (!ballInAISide && this.aiHasStarted) {
        this.aiHasStarted = false;
        this.lastAIUpdate = now;
        this.aiReactionTime = AI_CONSTANTS.INITIAL_DELAY;
        console.log('AI reset - ball back to player side');
      }
    }

    // Throttled broadcasting
    const now = Date.now();
    if (now - this.lastBroadcast >= this.broadcastRate && this.onStateChange) {
      this.onStateChange(this.gameState);
      this.lastBroadcast = now;
    }
  }

  checkPaddleCollision(player, paddleX, paddleRight) {
    const ball = this.gameState.ball;
    const paddle = this.gameState[player];

    // More precise collision detection - check if ball is actually touching the paddle
    const ballLeft = ball.x;
    const ballRight = ball.x + GAME_CONSTANTS.BALL_SIZE;
    const ballTop = ball.y;
    const ballBottom = ball.y + GAME_CONSTANTS.BALL_SIZE;

    const paddleTop = paddle.y;
    const paddleBottom = paddle.y + GAME_CONSTANTS.PADDLE_HEIGHT;

    // Check if ball is in paddle's X range with more precise bounds
    let isInXRange = false;
    if (player === 'player1') {
      // For player1 (left paddle), ball should be touching the right edge
      isInXRange = ballRight >= paddleX && ballLeft <= paddleRight;
    } else {
      // For player2 (right paddle), ball should be touching the left edge
      isInXRange = ballLeft <= paddleRight && ballRight >= paddleX;
    }

    if (isInXRange) {
      // Check if ball is in paddle's Y range with overlap
      if (ballBottom > paddleTop && ballTop < paddleBottom) {
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

        // Calculate angle based on collision point (more angle for edge hits)
        const angle = normalizedCollision * GAME_CONSTANTS.BALL_MAX_ANGLE;

        // Calculate new velocity with angle
        const speed = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);
        const baseSpeed = Math.max(speed, GAME_CONSTANTS.BALL_MIN_SPEED);

        // Determine collision side and bounce with precise positioning
        if (player === 'player1' && ball.vx < 0) {
          ball.vx = Math.abs(Math.cos(angle) * baseSpeed);
          ball.vy = Math.sin(angle) * baseSpeed;
          // Position ball exactly at the paddle edge
          ball.x = paddleRight;
        } else if (player === 'player2' && ball.vx > 0) {
          ball.vx = -Math.abs(Math.cos(angle) * baseSpeed);
          ball.vy = Math.sin(angle) * baseSpeed;
          // Position ball exactly at the paddle edge
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
    }
  }

  updateAI() {
    const paddleCenter =
      this.gameState.player2.y + GAME_CONSTANTS.PADDLE_HEIGHT / 2;
    const ballY = this.gameState.ball.y + GAME_CONSTANTS.BALL_SIZE / 2;

    // Simple AI: move towards ball with some prediction
    const ballX = this.gameState.ball.x;
    const ballVx = this.gameState.ball.vx;

    // Only predict if ball is moving towards AI
    let targetY = ballY;
    if (ballVx > 0) {
      // Ball moving towards AI
      const ballToPaddleDistance =
        GAME_CONSTANTS.COURT_WIDTH - GAME_CONSTANTS.PADDLE_WIDTH - ballX;
      if (ballToPaddleDistance > 0 && Math.abs(ballVx) > 0) {
        const timeToReachPaddle = ballToPaddleDistance / ballVx;
        targetY = ballY + this.gameState.ball.vy * timeToReachPaddle;
      }
    }

    // Add some randomness to make AI less perfect
    const perturbation = (Math.random() - 0.5) * AI_CONSTANTS.PERTURBATION;
    targetY += perturbation;

    // Calculate difference from current paddle position
    const diff = targetY - paddleCenter;

    // Move towards target
    const aiSpeed = Math.min(
      Math.abs(diff) * AI_CONSTANTS.SPEED_MULTIPLIER,
      AI_CONSTANTS.MAX_SPEED
    );

    if (Math.abs(diff) > AI_CONSTANTS.MOVEMENT_THRESHOLD) {
      this.gameState.player2.y += diff > 0 ? aiSpeed : -aiSpeed;
      this.gameState.player2.y = Math.max(
        0,
        Math.min(
          GAME_CONSTANTS.COURT_HEIGHT - GAME_CONSTANTS.PADDLE_HEIGHT,
          this.gameState.player2.y
        )
      );

      console.log('AI moving:', {
        targetY,
        paddleCenter,
        diff,
        aiSpeed,
        newY: this.gameState.player2.y,
      });
    }
  }

  resetBall() {
    this.gameState.ball.x =
      GAME_CONSTANTS.COURT_WIDTH / 2 - GAME_CONSTANTS.BALL_SIZE / 2;
    this.gameState.ball.y =
      GAME_CONSTANTS.COURT_HEIGHT / 2 - GAME_CONSTANTS.BALL_SIZE / 2;
    this.gameState.ball.vx *= -1;

    // Reset AI state when ball resets
    this.aiHasStarted = false;
    this.lastAIUpdate = Date.now();
    this.aiReactionTime = AI_CONSTANTS.INITIAL_DELAY;

    // If in AI mode, start AI immediately after reset
    if (this.gameState.mode === GAME_CONSTANTS.GAME_MODES.AI) {
      this.aiHasStarted = true;
    }
  }

  getGameState() {
    return this.gameState;
  }

  movePaddle(player, y) {
    if (player === 'player1') {
      this.gameState.player1.y = Math.max(
        0,
        Math.min(GAME_CONSTANTS.COURT_HEIGHT - GAME_CONSTANTS.PADDLE_HEIGHT, y)
      );
    }
    if (
      player === 'player2' &&
      this.gameState.mode === GAME_CONSTANTS.GAME_MODES.PVP
    ) {
      this.gameState.player2.y = Math.max(
        0,
        Math.min(GAME_CONSTANTS.COURT_HEIGHT - GAME_CONSTANTS.PADDLE_HEIGHT, y)
      );
    }
  }

  setGameMode(mode) {
    this.gameState.mode = mode;
    this.gameState.score = {
      player1: GAME_CONSTANTS.INITIAL_SCORE,
      player2: GAME_CONSTANTS.INITIAL_SCORE,
    };
    this.resetBall();

    // Reset AI state when changing modes
    this.aiHasStarted = false;
    this.lastAIUpdate = Date.now();
    this.aiReactionTime = AI_CONSTANTS.INITIAL_DELAY;
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
