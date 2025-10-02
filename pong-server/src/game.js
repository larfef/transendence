const PADDLE_HEIGHT = 100;
const PADDLE_WIDTH = 20;
const BALL_SIZE = 20;
const COURT_WIDTH = 800;
const COURT_HEIGHT = 600;

class PongGame {
  constructor() {
    this.gameState = {
      player1: { y: COURT_HEIGHT / 2 - PADDLE_HEIGHT / 2 },
      player2: { y: COURT_HEIGHT / 2 - PADDLE_HEIGHT / 2 },
      ball: {
        x: COURT_WIDTH / 2 - BALL_SIZE / 2,
        y: COURT_HEIGHT / 2 - BALL_SIZE / 2,
        vx: 5,
        vy: 5,
      },
      score: { player1: 0, player2: 0 },
      mode: 'pvp',
    };
    this.gameInterval = null;
  }

  update() {
    // Ball movement
    this.gameState.ball.x += this.gameState.ball.vx;
    this.gameState.ball.y += this.gameState.ball.vy;

    // Ball collision with top/bottom walls
    if (
      this.gameState.ball.y <= 0 ||
      this.gameState.ball.y >= COURT_HEIGHT - BALL_SIZE
    ) {
      this.gameState.ball.vy *= -1;
    }

    // Ball collision with paddles (simplified)
    // Player 1
    if (
      this.gameState.ball.x <= PADDLE_WIDTH &&
      this.gameState.ball.y > this.gameState.player1.y &&
      this.gameState.ball.y < this.gameState.player1.y + PADDLE_HEIGHT
    ) {
      this.gameState.ball.vx *= -1;
    }
    // Player 2
    if (
      this.gameState.ball.x >= COURT_WIDTH - PADDLE_WIDTH - BALL_SIZE &&
      this.gameState.ball.y > this.gameState.player2.y &&
      this.gameState.ball.y < this.gameState.player2.y + PADDLE_HEIGHT
    ) {
      this.gameState.ball.vx *= -1;
    }

    // Scoring
    if (this.gameState.ball.x < 0) {
      this.gameState.score.player2++;
      this.resetBall();
    } else if (this.gameState.ball.x > COURT_WIDTH) {
      this.gameState.score.player1++;
      this.resetBall();
    }

    // AI logic
    if (this.gameState.mode === 'ai') {
      const paddleCenter = this.gameState.player2.y + PADDLE_HEIGHT / 2;
      if (paddleCenter < this.gameState.ball.y - 35) {
        this.gameState.player2.y += 5;
      } else if (paddleCenter > this.gameState.ball.y + 35) {
        this.gameState.player2.y -= 5;
      }
    }
  }

  resetBall() {
    this.gameState.ball.x = COURT_WIDTH / 2 - BALL_SIZE / 2;
    this.gameState.ball.y = COURT_HEIGHT / 2 - BALL_SIZE / 2;
    this.gameState.ball.vx *= -1;
  }

  getGameState() {
    return this.gameState;
  }

  movePaddle(player, y) {
    if (player === 'player1') this.gameState.player1.y = y;
    if (player === 'player2' && this.gameState.mode === 'pvp') {
      this.gameState.player2.y = y;
    }
  }

  setGameMode(mode) {
    this.gameState.mode = mode;
    this.gameState.score = { player1: 0, player2: 0 };
    this.resetBall();
  }

  start() {
    if (this.gameInterval) {
      clearInterval(this.gameInterval);
    }
    this.gameInterval = setInterval(() => this.update(), 1000 / 60); // 60 FPS
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
