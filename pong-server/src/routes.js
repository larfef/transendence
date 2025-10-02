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

  // Start the game
  fastify.post('/start', async (request, reply) => {
    try {
      game.start();
      return { success: true, message: 'Game started' };
    } catch (error) {
      fastify.log.error(error);
      reply.code(500).send({ error: 'Internal server error' });
    }
  });

  // Stop the game
  fastify.post('/stop', async (request, reply) => {
    try {
      game.stop();
      return { success: true, message: 'Game stopped' };
    } catch (error) {
      fastify.log.error(error);
      reply.code(500).send({ error: 'Internal server error' });
    }
  });

  // Pause the game
  fastify.post('/pause', async (request, reply) => {
    try {
      game.pause();
      return { success: true, message: 'Game paused' };
    } catch (error) {
      fastify.log.error(error);
      reply.code(500).send({ error: 'Internal server error' });
    }
  });

  // Resume the game
  fastify.post('/resume', async (request, reply) => {
    try {
      game.resume();
      return { success: true, message: 'Game resumed' };
    } catch (error) {
      fastify.log.error(error);
      reply.code(500).send({ error: 'Internal server error' });
    }
  });

  // Reset the game
  fastify.post('/reset', async (request, reply) => {
    try {
      game.resetGame();
      return { success: true, message: 'Game reset' };
    } catch (error) {
      fastify.log.error(error);
      reply.code(500).send({ error: 'Internal server error' });
    }
  });

  // Get game status
  fastify.get('/status', async (request, reply) => {
    try {
      return game.getGameStatus();
    } catch (error) {
      fastify.log.error(error);
      reply.code(500).send({ error: 'Internal server error' });
    }
  });

  fastify.get('/test', async (request, reply) => {
    return { message: 'Server is working' };
  });
}
