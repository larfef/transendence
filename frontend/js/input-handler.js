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
    // Keyboard controls with throttling
    document.addEventListener('keydown', e => {
      const now = Date.now();
      if (now - this.lastKeyTime < GAME_CONSTANTS.KEY_THROTTLE) return;

      this.keys[e.code] = true;
      this.handleKeyPress(e.code);
      this.lastKeyTime = now;
    });

    document.addEventListener('keyup', e => {
      this.keys[e.code] = false;
      this.handleKeyRelease(e.code);
    });

    // Button controls
    document.getElementById('modeBtn').addEventListener('click', () => {
      this.onModeToggle();
    });

    document.getElementById('resetBtn').addEventListener('click', () => {
      this.onReset();
    });
  }

  handleKeyPress(keyCode) {
    this.onKeyPress(keyCode);
  }

  handleKeyRelease(keyCode) {
    if (this.onKeyRelease) {
      this.onKeyRelease(keyCode);
    }
  }

  isKeyPressed(keyCode) {
    return !!this.keys[keyCode];
  }
}
