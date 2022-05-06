import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { TypeORMError } from 'typeorm';
import Dayjs from '../util/dayjs';

export interface ErrorResponse {
  success: boolean;
  timestamp: string;
  method: string;
  path: string;
  error: {
    code: string;
    name: string;
    message: Object | string;
  };
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    const errorResponse: ErrorResponse = {
      success: false,
      timestamp: Dayjs().tz().format(),
      method: request.method,
      path: request.url,
      error: {
        code: 'UnknownException',
        name: 'error',
        message: 'Something Went Wrong',
      },
    };

    if (exception instanceof HttpException) {
      status = (exception as HttpException).getStatus();
      const exceptionResponse = (exception as HttpException).getResponse();

      errorResponse.error.code = 'HttpException';
      errorResponse.error.name = exceptionResponse['error']
        ? exceptionResponse['error']
        : exceptionResponse;
      errorResponse.error.message = exceptionResponse['message']
        ? exceptionResponse['message']
        : exception.message;
    } else if (exception instanceof TypeORMError) {
      status = HttpStatus.UNPROCESSABLE_ENTITY;
      errorResponse.error.code = (exception as any).code;
      errorResponse.error.name = (exception as any).message;
      errorResponse.error.message = (exception as any).sql;
    }

    response.status(status).json(errorResponse);
  }
}
