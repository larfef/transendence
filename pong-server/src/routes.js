import game from './game';

async function routes(fastify, options) {
  // Get the current game state
  fastify.get('/gamestate', async (request, reply) => {
    return game.getGameState();
  });

  // Move a player's paddle
  fastify.post('/move', async (request, reply) => {
    const { player, y } = request.body;
    if (player && y !== undefined) {
      game.movePaddle(player, y);
      return { success: true };
    }
    return { success: false, message: 'Invalid payload' };
  });

  // Set the game mode
  fastify.post('/mode', async (request, reply) => {
    const { mode } = request.body; // 'pvp' or 'ai'
    if (mode === 'pvp' || mode === 'ai') {
      game.setGameMode(mode);
      return { success: true, mode: mode };
    }
    return { success: false, message: 'Invalid mode' };
  });
}

export default routes;
