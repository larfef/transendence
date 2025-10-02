// Game constants and configuration
export const GAME_CONSTANTS = {
  // Court dimensions
  COURT_WIDTH: 800,
  COURT_HEIGHT: 600,

  // Paddle dimensions
  PADDLE_WIDTH: 20,
  PADDLE_HEIGHT: 100,

  // Ball dimensions
  BALL_SIZE: 20,

  // Game physics
  BALL_INITIAL_SPEED: 6,
  BALL_MIN_SPEED: 6,
  BALL_MAX_ANGLE: Math.PI / 4, // 45 degrees max

  // Player movement speeds
  PLAYER1_SPEED: 10, // pixels per frame
  PLAYER2_SPEED: 10, // pixels per frame
  PLAYER_SPEED_MULTIPLIER: 0.1, // multiplier for smooth movement

  // Game timing
  TARGET_FPS: 60,
  FRAME_INTERVAL: 1000 / 60,
  BROADCAST_RATE: 1000 / 60, // 60 FPS for smoother updates

  // AI behavior
  AI_MIN_REACTION_TIME: 16, // milliseconds
  AI_MAX_REACTION_TIME: 48, // milliseconds
  AI_PERTURBATION: 30, // ±15 pixel perturbation
  AI_SPEED_MULTIPLIER: 0.1,
  AI_MAX_SPEED: 5,
  AI_MOVEMENT_THRESHOLD: 5,

  // Collision detection
  COLLISION_NORMALIZATION_MIN: -1,
  COLLISION_NORMALIZATION_MAX: 1,

  // Speed variations
  SPEED_VARIATION_MIN: 0.8,
  SPEED_VARIATION_MAX: 1.2,

  // Game modes
  GAME_MODES: {
    PVP: 'pvp',
    AI: 'ai',
  },

  // Initial scores
  INITIAL_SCORE: 0,

  // Game termination
  WINNING_SCORE: 11, // First to 11 points wins
  GAME_STATES: {
    WAITING: 'waiting', // Game not started yet
    PLAYING: 'playing', // Game in progress
    FINISHED: 'finished', // Game ended
    PAUSED: 'paused', // Game paused
  },
};

export const AI_CONSTANTS = {
  INITIAL_DELAY: 500,
  PERTURBATION: 30,
  SPEED_MULTIPLIER: 0.1,
  MAX_SPEED: 10,
  MOVEMENT_THRESHOLD: 5,
  REACTION_TIME_MIN: 50, // Increased from 16ms
  REACTION_TIME_MAX: 150, // Increased from 48ms
};
// Player speed presets for easy configuration
export const PLAYER_SPEED_PRESETS = {
  SLOW: 5,
  NORMAL: 10,
  FAST: 15,
  VERY_FAST: 20,
};
