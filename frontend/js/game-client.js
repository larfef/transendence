import { GAME_CONSTANTS, CONTROLS } from './constants.js';
import { WebSocketManager } from './websocket-manager.js';
import { InputHandler } from './input-handler.js';
import { InterpolationManager } from './interpolation.js';
import { Renderer } from './renderer.js';

export class PongClient {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.renderer = new Renderer(this.canvas);
    this.interpolationManager = new InterpolationManager();
    this.isAIMode = false;
    this.lastFrameTime = 0;
    this.currentGameState = GAME_CONSTANTS.GAME_STATES.WAITING;

    // Track current input states
    this.currentInputs = {
      player1: { up: false, down: false },
      player2: { up: false, down: false },
    };

    // Initialize managers
    this.websocketManager = new WebSocketManager(
      gameState => this.handleGameStateUpdate(gameState),
      connected => this.handleConnectionChange(connected)
    );

    this.inputHandler = new InputHandler(
      keyCode => this.handleKeyPress(keyCode),
      () => this.toggleMode(),
      () => this.resetGame(),
      keyCode => this.handleKeyRelease(keyCode)
    );

    this.init();
  }

  init() {
    this.websocketManager.connect();
    this.setupEventListeners();
    this.gameLoop();
  }

  setupEventListeners() {
    // Start game button
    const startBtn = document.getElementById('startBtn');
    if (startBtn) {
      startBtn.addEventListener('click', () => this.startGame());
    }

    // Play again button
    const playAgainBtn = document.getElementById('playAgainBtn');
    if (playAgainBtn) {
      playAgainBtn.addEventListener('click', () => this.playAgain());
    }
  }

  handleGameStateUpdate(gameState) {
    this.interpolationManager.updateServerState(gameState);
    this.renderer.updateScore(gameState.score);

    // Handle game state changes
    if (gameState.gameState !== this.currentGameState) {
      this.currentGameState = gameState.gameState;
      this.handleGameStateChange(gameState);
    }
  }

  handleGameStateChange(gameState) {
    const startBtn = document.getElementById('startBtn');
    const gameOverDisplay = document.getElementById('gameOverDisplay');

    switch (gameState.gameState) {
      case GAME_CONSTANTS.GAME_STATES.WAITING:
        if (startBtn) startBtn.textContent = 'Start Game';
        if (gameOverDisplay) gameOverDisplay.style.display = 'none';
        break;

      case GAME_CONSTANTS.GAME_STATES.PLAYING:
        if (startBtn) startBtn.textContent = 'Stop Game';
        if (gameOverDisplay) gameOverDisplay.style.display = 'none';
        break;

      case GAME_CONSTANTS.GAME_STATES.FINISHED:
        if (startBtn) startBtn.textContent = 'Start Game';
        this.showGameOver(gameState);
        break;

      case GAME_CONSTANTS.GAME_STATES.PAUSED:
        if (startBtn) startBtn.textContent = 'Resume Game';
        break;
    }
  }

  showGameOver(gameState) {
    const gameOverDisplay = document.getElementById('gameOverDisplay');
    const gameOverMessage = document.getElementById('gameOverMessage');

    if (gameOverDisplay && gameOverMessage) {
      const winner = gameState.winner;
      const winnerName =
        winner === 'player1'
          ? 'Player 1'
          : winner === 'player2'
            ? this.isAIMode
              ? 'AI'
              : 'Player 2'
            : 'Unknown';

      gameOverMessage.textContent = `${winnerName} wins! Final score: ${gameState.score.player1} - ${gameState.score.player2}`;
      gameOverDisplay.style.display = 'block';
    }
  }

  handleConnectionChange(connected) {
    console.log('Connection status:', connected ? 'Connected' : 'Disconnected');
  }

  // Send input state to server instead of position
  sendPlayerInput(player, input) {
    if (
      this.websocketManager.ws &&
      this.websocketManager.ws.readyState === WebSocket.OPEN
    ) {
      this.websocketManager.sendMessage('input', {
        player: player,
        input: input, // { up: true, down: false }
      });
    }
  }

  handleKeyPress(keyCode) {
    switch (keyCode) {
      case CONTROLS.PLAYER1_UP:
        this.currentInputs.player1.up = true;
        this.currentInputs.player1.down = false;
        this.sendPlayerInput('player1', this.currentInputs.player1);
        break;

      case CONTROLS.PLAYER1_DOWN:
        this.currentInputs.player1.up = false;
        this.currentInputs.player1.down = true;
        this.sendPlayerInput('player1', this.currentInputs.player1);
        break;

      case CONTROLS.PLAYER2_UP:
        if (!this.isAIMode) {
          this.currentInputs.player2.up = true;
          this.currentInputs.player2.down = false;
          this.sendPlayerInput('player2', this.currentInputs.player2);
        }
        break;

      case CONTROLS.PLAYER2_DOWN:
        if (!this.isAIMode) {
          this.currentInputs.player2.up = false;
          this.currentInputs.player2.down = true;
          this.sendPlayerInput('player2', this.currentInputs.player2);
        }
        break;
    }
  }

  // Handle key release to stop movement
  handleKeyRelease(keyCode) {
    switch (keyCode) {
      case CONTROLS.PLAYER1_UP:
        if (this.currentInputs.player1.up) {
          this.currentInputs.player1.up = false;
          this.sendPlayerInput('player1', this.currentInputs.player1);
        }
        break;

      case CONTROLS.PLAYER1_DOWN:
        if (this.currentInputs.player1.down) {
          this.currentInputs.player1.down = false;
          this.sendPlayerInput('player1', this.currentInputs.player1);
        }
        break;

      case CONTROLS.PLAYER2_UP:
        if (!this.isAIMode && this.currentInputs.player2.up) {
          this.currentInputs.player2.up = false;
          this.sendPlayerInput('player2', this.currentInputs.player2);
        }
        break;

      case CONTROLS.PLAYER2_DOWN:
        if (!this.isAIMode && this.currentInputs.player2.down) {
          this.currentInputs.player2.down = false;
          this.sendPlayerInput('player2', this.currentInputs.player2);
        }
        break;
    }
  }

  toggleMode() {
    const newMode = this.isAIMode ? 'pvp' : 'ai';
    this.websocketManager.sendMessage('setMode', { mode: newMode });
    this.isAIMode = !this.isAIMode;
    this.renderer.updateModeButton(this.isAIMode);
  }

  startGame() {
    if (this.currentGameState === GAME_CONSTANTS.GAME_STATES.WAITING) {
      this.websocketManager.sendMessage('start');
    } else if (this.currentGameState === GAME_CONSTANTS.GAME_STATES.PLAYING) {
      this.websocketManager.sendMessage('stop');
    } else if (this.currentGameState === GAME_CONSTANTS.GAME_STATES.PAUSED) {
      this.websocketManager.sendMessage('resume');
    }
  }

  playAgain() {
    this.websocketManager.sendMessage('reset');
    const gameOverDisplay = document.getElementById('gameOverDisplay');
    if (gameOverDisplay) {
      gameOverDisplay.style.display = 'none';
    }
  }

  resetGame() {
    this.websocketManager.sendMessage('reset');
  }

  gameLoop(currentTime = 0) {
    // Frame rate limiting
    if (currentTime - this.lastFrameTime >= GAME_CONSTANTS.FRAME_INTERVAL) {
      // Update interpolated state
      this.interpolationManager.interpolateState();

      // Draw the game
      const gameState = this.interpolationManager.getInterpolatedState();
      this.renderer.draw(gameState);

      this.lastFrameTime = currentTime;
    }

    requestAnimationFrame(time => this.gameLoop(time));
  }
}
