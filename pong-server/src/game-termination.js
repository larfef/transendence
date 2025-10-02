import { GAME_CONSTANTS } from './constants.js';

/**
 * Handles game termination conditions and win/lose logic
 */
export class GameTerminationManager {
  constructor() {
    this.winningScore = GAME_CONSTANTS.WINNING_SCORE;
    this.gameStates = GAME_CONSTANTS.GAME_STATES;
  }

  /**
   * Check if the game should end based on current scores
   * @param {Object} score - Current game score { player1: number, player2: number }
   * @returns {Object} - { isGameOver: boolean, winner: string|null, reason: string }
   */
  checkGameEnd(score) {
    if (score.player1 >= this.winningScore) {
      return {
        isGameOver: true,
        winner: 'player1',
        reason: 'score_limit_reached',
      };
    }

    if (score.player2 >= this.winningScore) {
      return {
        isGameOver: true,
        winner: 'player2',
        reason: 'score_limit_reached',
      };
    }

    return {
      isGameOver: false,
      winner: null,
      reason: null,
    };
  }

  /**
   * Get the winner name based on player ID
   * @param {string} playerId - The winning player ID
   * @param {string} gameMode - Current game mode
   * @returns {string} - Display name for the winner
   */
  getWinnerName(playerId, gameMode) {
    if (playerId === 'player1') {
      return 'Player 1';
    } else if (playerId === 'player2') {
      return gameMode === GAME_CONSTANTS.GAME_MODES.AI ? 'AI' : 'Player 2';
    }
    return 'Unknown';
  }

  /**
   * Check if scores are tied (for potential overtime rules)
   * @param {Object} score - Current game score
   * @returns {boolean} - True if scores are tied
   */
  isTied(score) {
    return score.player1 === score.player2;
  }

  /**
   * Get the current leader
   * @param {Object} score - Current game score
   * @returns {string|null} - Player ID of the leader, or null if tied
   */
  getLeader(score) {
    if (score.player1 > score.player2) {
      return 'player1';
    } else if (score.player2 > score.player1) {
      return 'player2';
    }
    return null;
  }

  /**
   * Get score difference
   * @param {Object} score - Current game score
   * @returns {number} - Absolute difference between scores
   */
  getScoreDifference(score) {
    return Math.abs(score.player1 - score.player2);
  }

  /**
   * Check if game is in a critical state (close to ending)
   * @param {Object} score - Current game score
   * @returns {boolean} - True if either player is within 2 points of winning
   */
  isCriticalState(score) {
    const maxScore = Math.max(score.player1, score.player2);
    return maxScore >= this.winningScore - 2;
  }
}
