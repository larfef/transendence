import fastify from 'fastify';

fastify.register(require('./routes'));

const start = async () => {
  try {
    await fastify.listen({ port: 3000, host: '127.0.0.1' });
    fastify.log.info(`Server listening on ${fastify.server.address().port}`);
  } catch (e) {
    fastify.log(e);
    process.exit(1);
  }
};

start();
