import game from './game.js';

export default async function routes(fastify, options) {
  // Get the current game state
  fastify.get('/gamestate', async (request, reply) => {
    try {
      return game.getGameState();
    } catch (error) {
      fastify.log.error(error);
      reply.code(500).send({ error: 'Internal server error' });
    }
  });

  // Move a player's paddle
  fastify.post('/move', async (request, reply) => {
    try {
      const { player, y } = request.body;
      if (player && y !== undefined) {
        game.movePaddle(player, y);
        return { success: true };
      }
      return { success: false, message: 'Invalid payload' };
    } catch (error) {
      fastify.log.error(error);
      reply.code(500).send({ error: 'Internal server error' });
    }
  });

  // Set the game mode
  fastify.post('/mode', async (request, reply) => {
    try {
      const { mode } = request.body; // 'pvp' or 'ai'
      if (mode === 'pvp' || mode === 'ai') {
        game.setGameMode(mode);
        return { success: true, mode: mode };
      }
      return { success: false, message: 'Invalid mode' };
    } catch (error) {
      fastify.log.error(error);
      reply.code(500).send({ error: 'Internal server error' });
    }
  });

  fastify.get('/test', async (request, reply) => {
    return { message: 'Server is working' };
  });
}
