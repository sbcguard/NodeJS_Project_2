import { NextFunction, Request, Response } from 'express';
import { UnauthorizedException } from '../exceptions/unauthorized';
import { ErrorCode } from '../exceptions/root';
import * as jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../secrets';
import { prismaClient } from '..';
import { User } from '@prisma/client';
// Define a custom type extending the Request interface
const authMiddleware = async (
  req: Request & { user?: User },
  res: Response,
  next: NextFunction
) => {
  // 1. Get token from header
  const token = req.headers.authorization!;
  // 2. if no token, throw unauthorized error
  if (!token) {
    next(new UnauthorizedException('Unauthorized', ErrorCode.UNAUTHORIZED));
  }
  try {
    // 3. if token is present, verify token and extract payload
    const payload = jwt.verify(token, JWT_SECRET) as any;
    // 4. Get user from payload
    const user = await prismaClient.user.findFirst({
      where: { id: payload.userId },
    });
    if (!user) {
      next(new UnauthorizedException('Unauthorized', ErrorCode.UNAUTHORIZED));
    }
    // 5. attach the user to the current request object
    req.user = user!;
    next(); // continue to the next middleware or route handler
  } catch (error) {
    next(new UnauthorizedException('Unauthorized', ErrorCode.UNAUTHORIZED));
  }
};
export default authMiddleware;
