import { FastifyReply } from 'fastify';

export const applyRelaxedSecurityHeaders = (reply: FastifyReply): void => {
  reply.header('X-Content-Type-Options', 'nosniff');
  reply.header('X-Frame-Options', 'DENY');
  reply.header('Referrer-Policy', 'strict-origin-when-cross-origin');
  reply.header('Cache-Control', 'public, max-age=300');
  reply.removeHeader('Server');
  reply.removeHeader('X-Powered-By');
};
