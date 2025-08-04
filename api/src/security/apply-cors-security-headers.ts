import { FastifyReply } from 'fastify';

export const applyCorsSecurityHeaders = (reply: FastifyReply): void => {
  reply.header('X-Content-Type-Options', 'nosniff');
  reply.removeHeader('Server');
  reply.removeHeader('X-Powered-By');
};
