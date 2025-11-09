import { FastifyReply } from 'fastify';

import config from '@config';

export const applyCorsSecurityHeaders = (reply: FastifyReply): void => {
  const allowedOrigin = config.webappUrl;

  // Set CORS headers
  if (allowedOrigin) {
    reply.header('Access-Control-Allow-Origin', allowedOrigin);
  }

  reply.header(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, DELETE, PATCH, OPTIONS',
  );
  reply.header(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, X-Requested-With',
  );
  reply.header('Access-Control-Allow-Credentials', 'true');
  reply.header('Access-Control-Max-Age', '86400'); // 24 hours

  // Security headers
  reply.header('X-Content-Type-Options', 'nosniff');
  reply.removeHeader('Server');
  reply.removeHeader('X-Powered-By');
};
