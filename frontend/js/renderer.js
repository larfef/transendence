import { GAME_CONSTANTS, COLORS } from './constants.js';

export class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
  }

  draw(gameState) {
    if (!gameState) return;

    // Clear canvas efficiently
    this.ctx.clearRect(
      0,
      0,
      GAME_CONSTANTS.COURT_WIDTH,
      GAME_CONSTANTS.COURT_HEIGHT
    );
    this.ctx.fillStyle = COLORS.BACKGROUND;
    this.ctx.fillRect(
      0,
      0,
      GAME_CONSTANTS.COURT_WIDTH,
      GAME_CONSTANTS.COURT_HEIGHT
    );

    // Draw center line
    this.drawCenterLine();

    // Draw paddles
    this.drawPaddles(gameState);

    // Draw ball with trail effect
    this.drawBall(gameState.ball);
  }

  drawCenterLine() {
    this.ctx.setLineDash([10, 10]);
    this.ctx.strokeStyle = COLORS.CENTER_LINE;
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.moveTo(GAME_CONSTANTS.COURT_WIDTH / 2, 0);
    this.ctx.lineTo(
      GAME_CONSTANTS.COURT_WIDTH / 2,
      GAME_CONSTANTS.COURT_HEIGHT
    );
    this.ctx.stroke();
    this.ctx.setLineDash([]);
  }

  drawPaddles(gameState) {
    this.ctx.fillStyle = COLORS.PADDLE;

    // Player 1 paddle
    this.ctx.fillRect(
      0,
      gameState.player1.y,
      GAME_CONSTANTS.PADDLE_WIDTH,
      GAME_CONSTANTS.PADDLE_HEIGHT
    );

    // Player 2 paddle
    this.ctx.fillRect(
      GAME_CONSTANTS.COURT_WIDTH - GAME_CONSTANTS.PADDLE_WIDTH,
      gameState.player2.y,
      GAME_CONSTANTS.PADDLE_WIDTH,
      GAME_CONSTANTS.PADDLE_HEIGHT
    );
  }

  drawBall(ball) {
    // Ball trail effect (multiple layers for smooth trail)
    for (let i = 3; i >= 1; i--) {
      this.ctx.fillStyle = `rgba(255, 215, 0, ${0.1 * i})`;
      this.ctx.fillRect(
        ball.x - i * 2,
        ball.y - i * 2,
        GAME_CONSTANTS.BALL_SIZE + i * 4,
        GAME_CONSTANTS.BALL_SIZE + i * 4
      );
    }

    // Main ball
    this.ctx.fillStyle = COLORS.BALL;
    this.ctx.fillRect(
      ball.x,
      ball.y,
      GAME_CONSTANTS.BALL_SIZE,
      GAME_CONSTANTS.BALL_SIZE
    );

    // Ball highlight for extra smoothness
    this.ctx.fillStyle = COLORS.BALL_HIGHLIGHT;
    this.ctx.fillRect(
      ball.x + 2,
      ball.y + 2,
      GAME_CONSTANTS.BALL_SIZE - 4,
      GAME_CONSTANTS.BALL_SIZE - 4
    );
  }

  updateScore(score) {
    document.getElementById('player1Score').textContent = score.player1;
    document.getElementById('player2Score').textContent = score.player2;
  }

  updateModeButton(isAIMode) {
    const modeBtn = document.getElementById('modeBtn');
    modeBtn.textContent = isAIMode ? 'Switch to PvP Mode' : 'Switch to AI Mode';
  }
}
