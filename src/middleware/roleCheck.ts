import { NextFunction, Request, Response } from 'express';
import { UnauthorizedException } from '../exceptions/unauthorized';
import { ErrorCode } from '../exceptions/root';
import { prismaClient } from '..';
import { User, Role, AppSec } from '@prisma/client';
import { JWT_SECRET } from '../secrets';
import * as jwt from 'jsonwebtoken';

// Define a custom type extending the Request interface
interface RoleCheckRequest extends Request {
  user?: User & { roles: Role[] };
}
export function isRoleCheckRequest(req: Request): req is RoleCheckRequest {
  return (
    (req as RoleCheckRequest).user !== undefined &&
    Array.isArray((req as RoleCheckRequest).user?.roles)
  );
}

const roleCheckMiddleware = async (
  req: RoleCheckRequest,
  res: Response,
  next: NextFunction
) => {
  // 1. Get token from cookies
  const token = req.cookies.token || null;

  // 2. if no token, throw redirect to login to obtain token
  if (!token) {
    const fullUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
    res.cookie('redirectUrl', fullUrl, {
      httpOnly: true, // Prevents client-side JavaScript from accessing the cookie
      secure: true, // Use `secure` flag in production
      maxAge: 12 * 60 * 60 * 1000, // 12 hours in milliseconds
      sameSite: 'strict', // Controls cookie sending in cross-site requests
      path: '/', // Ensure the cookie is sent with requests to all paths
    });
    return res.redirect('/unauthorized.html');
  }

  try {
    // 3. if token is present, verify token and extract payload
    const payload = jwt.verify(token, JWT_SECRET) as { userId: number };

    // 4. Get user from payload, include roles in the query
    const user = await prismaClient.user.findUnique({
      where: { id: payload.userId },
      include: { roles: true }, // include roles
    });

    if (!user) {
      return next(
        new UnauthorizedException('Unauthorized', ErrorCode.UNAUTHORIZED)
      );
    }
    // 5. Get the appSec based on the request URL
    const appSec = await prismaClient.appSec.findFirst({
      where: { url: req.path },
      include: { roles: true }, // include roles for the app
    });
    if (!appSec) {
      return res.redirect('/unauthorized.html');
    }

    // 6. Extract role names from user roles
    const userRoles = user.roles.map((role) => role.name);
    const appRoles = appSec.roles.map((role) => role.name);

    // 7. Check if the user's roles match any of the appSec roles
    const hasAccess = userRoles.some((role) => appRoles.includes(role));
    if (!hasAccess) {
      return res.redirect('/unauthorized.html');
    }
    // 8. Attach the user to the current request object
    req.user = user;
    next(); // Continue to the next middleware or route handler
  } catch (error) {
    next(new UnauthorizedException('Unauthorized', ErrorCode.UNAUTHORIZED));
  }
};

export default roleCheckMiddleware;
