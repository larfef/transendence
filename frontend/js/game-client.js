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
    this.gameLoop();
  }

  handleGameStateUpdate(gameState) {
    this.interpolationManager.updateServerState(gameState);
    this.renderer.updateScore(gameState.score);
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
