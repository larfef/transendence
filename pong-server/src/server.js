import fastify from 'fastify';
import cors from '@fastify/cors';
import websocket from '@fastify/websocket';
import game from './game.js';
import routes from './routes.js';

const server = fastify({ logger: true });

// Register CORS plugin
server.register(cors, {
  origin: ['http://localhost:8080', 'http://127.0.0.1:8080'],
  credentials: true,
});

// Register WebSocket plugin
server.register(websocket);

server.register(routes);

// WebSocket connection handling
server.register(async function (fastify) {
  fastify.get('/ws', { websocket: true }, (connection, req) => {
    console.log('Client connected to WebSocket');

    // Send initial game state
    connection.socket.send(
      JSON.stringify({
        type: 'gameState',
        data: game.getGameState(),
      })
    );

    // Listen for client messages
    connection.socket.on('message', message => {
      try {
        const data = JSON.parse(message.toString());

        switch (data.type) {
          case 'input': // Changed from 'move'
            game.handlePlayerInput(data.player, data.input);
            break;
          case 'setMode':
            game.setGameMode(data.mode);
            break;
          case 'reset':
            game.resetGame();
            break;
          case 'start':
            game.start();
            break;
          case 'stop':
            game.stop();
            break;
          case 'pause':
            game.pause();
            break;
          case 'resume':
            game.resume();
            break;
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
      }
    });

    connection.socket.on('close', () => {
      console.log('Client disconnected from WebSocket');
    });
  });
});

// Broadcast game state to all connected clients
game.onStateChange = gameState => {
  const message = JSON.stringify({
    type: 'gameState',
    data: gameState,
  });

  // Broadcast to all WebSocket connections
  server.websocketServer.clients.forEach(client => {
    if (client.readyState === 1) {
      // WebSocket.OPEN
      client.send(message);
    }
  });
};

const start = async () => {
  try {
    await server.listen({ port: 3000, host: '0.0.0.0' });
    server.log.info(`Server listening on ${server.server.address().port}`);
  } catch (e) {
    server.log.error(e);
    process.exit(1);
  }
};

start();
