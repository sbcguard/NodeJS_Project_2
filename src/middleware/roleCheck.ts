import { NextFunction, Request, Response } from 'express';
import { UnauthorizedException } from '../exceptions/unauthorized';
import { ErrorCode } from '../exceptions/root';
import { User, Role } from '@prisma/client';
import {
  setRedirectUrlCookie,
  checkAppSecByUrl,
  findUser,
  validateToken,
} from '../utils';

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
    setRedirectUrlCookie(
      res,
      `${req.protocol}://${req.get('host')}${req.originalUrl}`
    );
    return res.redirect('/unauthorized.html');
  }

  try {
    // 3. if token is present, verify token and extract payload
    const payload = validateToken(token);

    // 4. Get user from payload, include roles in the query
    const user = await findUser({ id: payload.userId });

    if (!user) {
      return next(
        new UnauthorizedException('Unauthorized', ErrorCode.UNAUTHORIZED)
      );
    }
    // 5. Get the appSec based on the request URL
    const appSec = await checkAppSecByUrl(req.path);
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
