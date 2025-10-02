// Game constants and configuration
export const GAME_CONSTANTS = {
  COURT_WIDTH: 800,
  COURT_HEIGHT: 600,
  PADDLE_WIDTH: 20,
  PADDLE_HEIGHT: 100,
  BALL_SIZE: 20,
  TARGET_FPS: 60,
  FRAME_INTERVAL: 1000 / 60,
  INTERPOLATION_DELAY: 50, // 50ms interpolation delay for smoothness
  PADDLE_SPEED: 10,
  KEY_THROTTLE: 8, // Reduced for more responsive controls
  WEBSOCKET_URL: 'ws://localhost:3000/ws',
  WINNING_SCORE: 11,
  GAME_STATES: {
    WAITING: 'waiting',
    PLAYING: 'playing',
    FINISHED: 'finished',
    PAUSED: 'paused',
  },
};

export const COLORS = {
  BACKGROUND: '#000',
  PADDLE: '#fff',
  BALL: '#FFD700',
  BALL_HIGHLIGHT: 'rgba(255, 255, 255, 0.3)',
  CENTER_LINE: '#fff',
  BALL_TRAIL: 'rgba(255, 215, 0, 0.1)',
};

export const CONTROLS = {
  PLAYER1_UP: 'KeyW',
  PLAYER1_DOWN: 'KeyS',
  PLAYER2_UP: 'KeyL',
  PLAYER2_DOWN: 'KeyP',
};
