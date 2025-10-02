import { PongClient } from './game-client.js';

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
  new PongClient();
});
