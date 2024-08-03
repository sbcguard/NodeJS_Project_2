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
}

const authMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  // 1. Get token from cookies
  const token = req.cookies.token || null;

  // 2. if no token, redirect to login page
  if (!token) {
    if (req.path !== '/login' && req.path !== '/signup') {
      const fullUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
      res.cookie('redirectUrl', fullUrl, {
        httpOnly: true, // Prevents client-side JavaScript from accessing the cookie
        secure: true, // Use `secure` flag in production
        maxAge: 12 * 60 * 60 * 1000, // 12 hours in milliseconds
        sameSite: 'strict', // Controls cookie sending in cross-site requests
        path: '/', // Ensure the cookie is sent with requests to all paths
      });
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
      include: {
        roles: true, // This will include the related roles
      },
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
