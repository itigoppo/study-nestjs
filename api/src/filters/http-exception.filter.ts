import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import Dayjs from '../util/dayjs';

export interface ErrorResponse {
  success: boolean;
  timestamp: string;
  method: string;
  path: string;
  error: {
    name: string;
    message: Object | string;
  };
}

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    const exceptionResponse = exception.getResponse();
    const errorResponse: ErrorResponse = {
      success: false,
      timestamp: Dayjs().tz().format(),
      method: request.method,
      path: request.url,
      error: {
        name: exceptionResponse['error']
          ? exceptionResponse['error']
          : exceptionResponse,
        message: exceptionResponse['message']
          ? exceptionResponse['message']
          : exception.message,
      },
    };

    response.status(status).json(errorResponse);
  }
}
