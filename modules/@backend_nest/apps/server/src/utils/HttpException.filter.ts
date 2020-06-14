import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';
import { Request, Response } from 'express';
import { StatusNames } from '@lib/common/utils/codes.value';

/**
 * Utility to catch HttpExceptions and respond properly to Http Requests
 */
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
    /**
     * Catch throw HttpException, intercept request and inject codes
     *
     * @param exception
     * @param host
     */
    catch(exception: HttpException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();
        const status = exception.getStatus();

        console.error('HTTP Error: ', (exception.getResponse() as any).message);

        response.status(status).json({
            statusCode: status,
            name: StatusNames[status],
            message: (exception.getResponse() as any).message,
            timestamp: new Date().toISOString(),
            path: request.url,
        });
    }
}
