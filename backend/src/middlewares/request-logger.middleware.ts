import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  use(request: Request, response: Response, next: NextFunction): void {
    const { method, originalUrl: url } = request;
    const startTime = Date.now();

    response.on('close', () => {
      const { statusCode } = response;
      const duration = Date.now() - startTime;

      this.logger.log(`(${duration}ms) ${method} ${statusCode}: ${url}`);
    });

    next();
  }
}
