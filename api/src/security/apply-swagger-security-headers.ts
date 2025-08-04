import { FastifyReply } from 'fastify';

import { applySecurityHeaders } from './apply-security-headers';

const SWAGGER_CSP =
  "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'";

export const applySwaggerSecurityHeaders = (reply: FastifyReply): void => {
  applySecurityHeaders(reply, SWAGGER_CSP);

  // Allow caching for documentation
  reply.header('Cache-Control', 'public, max-age=300');
};
