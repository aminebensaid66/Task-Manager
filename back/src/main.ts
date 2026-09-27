import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import type { Request, Response } from 'express';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/http-exception.filter';
import { env } from './config/env';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: false });
  app.setGlobalPrefix('api/v1');
  app.useGlobalFilters(new HttpExceptionFilter());
  app.enableShutdownHooks();

  app.use((req: Request, res: Response, next: () => void) => {
    if (!['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
      const origin = req.headers.origin;
      if (origin && !env.corsOrigins.includes(origin)) {
        res.status(403).json({ statusCode: 403, message: 'Origin is not allowed' });
        return;
      }
    }

    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Referrer-Policy', 'no-referrer');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    res.setHeader('Cache-Control', 'no-store');
    next();
  });

  app.enableCors({
    credentials: true,
    origin(origin: string | undefined, callback: (error: Error | null, allow?: boolean) => void) {
      if (!origin || env.corsOrigins.includes(origin)) return callback(null, true);
      return callback(new Error('Origin is not allowed by CORS'), false);
    },
    methods: ['GET', 'HEAD', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id'],
    exposedHeaders: ['X-Request-Id'],
  });

  await app.listen(env.port, '0.0.0.0');
}

void bootstrap();
