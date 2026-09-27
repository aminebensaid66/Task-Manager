import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const isHttp = exception instanceof HttpException;
    const status = isHttp ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const raw = isHttp ? exception.getResponse() : null;

    let message: string | string[] = 'Internal server error';
    let error = HttpStatus[status] ?? 'Error';
    if (typeof raw === 'string') {
      message = raw;
    } else if (raw && typeof raw === 'object') {
      const object = raw as Record<string, unknown>;
      if (typeof object.error === 'string') error = object.error;
      if (typeof object.message === 'string' || Array.isArray(object.message)) {
        message = object.message as string | string[];
      }
    }

    if (!isHttp || status >= 500) {
      this.logger.error(`${request.method} ${request.url}`, exception instanceof Error ? exception.stack : String(exception));
    }

    response.status(status).json({
      statusCode: status,
      error,
      message,
      path: request.url,
      timestamp: new Date().toISOString(),
      requestId: response.getHeader('X-Request-Id') ?? undefined,
    });
  }
}
