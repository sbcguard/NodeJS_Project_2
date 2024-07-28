import { NextFunction, Request, Response } from 'express';
import { UnauthorizedException } from '../exceptions/unauthorized';
import { ErrorCode } from '../exceptions/root';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../secrets';
import { prismaClient } from '..';
import { User } from '@prisma/client';

// Define a custom type extending the Request interface
interface AuthenticatedRequest extends Request {
  user?: User;
  redirectUrl?: string;
}

const authMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  // 1. Get token from header
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ')
    ? authHeader.split(' ')[1]
    : null;

  // 2. if no token, throw unauthorized error
  if (!token) {
    if (req.path !== '/login' && req.path !== '/signup') {
      req.body.redirectUrl = req.originalUrl; // Store redirect URL in body
      return res.redirect(`/login.html`);
    }
    return next();
  }

  try {
    // 3. if token is present, verify token and extract payload
    const payload = jwt.verify(token, JWT_SECRET) as { userId: number };

    // 4. Get user from payload
    const user = await prismaClient.user.findUnique({
      where: { id: payload.userId },
    });

    if (!user) {
      return next(
        new UnauthorizedException('Unauthorized', ErrorCode.UNAUTHORIZED)
      );
    }

    // 5. Attach the user to the current request object
    req.user = user;
    next(); // Continue to the next middleware or route handler
  } catch (error) {
    next(new UnauthorizedException('Unauthorized', ErrorCode.UNAUTHORIZED));
  }
};

export default authMiddleware;
