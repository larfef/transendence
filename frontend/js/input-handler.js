import { GAME_CONSTANTS, CONTROLS } from './constants.js';

export class InputHandler {
  constructor(onKeyPress, onModeToggle, onReset, onKeyRelease = null) {
    this.keys = {};
    this.onKeyPress = onKeyPress;
    this.onKeyRelease = onKeyRelease;
    this.onModeToggle = onModeToggle;
    this.onReset = onReset;
    this.lastKeyTime = 0;

    this.setupEventListeners();
  }

  setupEventListeners() {
    // Global keyboard controls with throttling
    document.addEventListener('keydown', e => {
      // Always prevent default for game keys
      const gameKeys = [
        CONTROLS.PLAYER1_UP,
        CONTROLS.PLAYER1_DOWN,
        CONTROLS.PLAYER2_UP,
        CONTROLS.PLAYER2_DOWN,
      ];

      if (gameKeys.includes(e.code)) {
        e.preventDefault();
        e.stopPropagation();

        const now = Date.now();
        if (now - this.lastKeyTime < GAME_CONSTANTS.KEY_THROTTLE) return;

        this.keys[e.code] = true;
        this.onKeyPress(e.code);
        this.lastKeyTime = now;
      }
    });

    document.addEventListener('keyup', e => {
      const gameKeys = [
        CONTROLS.PLAYER1_UP,
        CONTROLS.PLAYER1_DOWN,
        CONTROLS.PLAYER2_UP,
        CONTROLS.PLAYER2_DOWN,
      ];

      if (gameKeys.includes(e.code)) {
        e.preventDefault();
        e.stopPropagation();

        this.keys[e.code] = false;
        if (this.onKeyRelease) {
          this.onKeyRelease(e.code);
        }
      }
    });

    // Button controls
    document.getElementById('modeBtn').addEventListener('click', () => {
      this.onModeToggle();
    });

    document.getElementById('resetBtn').addEventListener('click', () => {
      this.onReset();
    });
  }
}
