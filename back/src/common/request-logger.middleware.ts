import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { randomUUID } from 'crypto';

@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  use(req: Request, res: Response, next: NextFunction) {
    const requestId = req.header('X-Request-Id')?.slice(0, 100) || randomUUID();
    res.setHeader('X-Request-Id', requestId);
    const started = Date.now();
    res.on('finish', () => {
      this.logger.log(`${req.method} ${req.originalUrl} ${res.statusCode} ${Date.now() - started}ms requestId=${requestId}`);
    });
    next();
  }
}
