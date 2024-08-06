import { NextFunction, Request, Response } from 'express';
import { UnauthorizedException } from '../exceptions/unauthorized';
import { ErrorCode } from '../exceptions/root';
import { User } from '@prisma/client';
import { setRedirectUrlCookie, validateToken, findUser } from '../utils';

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
      setRedirectUrlCookie(
        res,
        `${req.protocol}://${req.get('host')}${req.originalUrl}`
      );
      return res.redirect(`/login.html`);
    }
    return next();
  }

  try {
    // 3. if token is present, verify token and extract payload
    const payload = validateToken(token);

    // 4. Get user from payload
    const user = await findUser({ id: payload.userId });
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
