import { NextFunction, Request, Response, RequestHandler } from 'express';
import { ErrorCode, HttpException } from './exceptions/root';
import { InternalException } from './exceptions/internal-exception';

export const errorHandler = (method: RequestHandler): RequestHandler => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await method(req, res, next);
    } catch (error) {
      // If error is not an instance of HttpException, wrap it into InternalException
      const exception =
        error instanceof HttpException
          ? error
          : new InternalException(
              'Internal Server Error.',
              error,
              ErrorCode.INTERNAL_EXCEPTION
            );

      next(exception);
    }
  };
};
