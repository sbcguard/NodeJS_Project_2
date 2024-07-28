import { NextFunction, Request, Response } from 'express';
import { UnauthorizedException } from '../exceptions/unauthorized';
import { ErrorCode } from '../exceptions/root';
import { prismaClient } from '..';
import { User, Role } from '@prisma/client';
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
  // 1. Get token from header
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ')
    ? authHeader.split(' ')[1]
    : null;

  // 2. if no token, throw unauthorized error
  if (!token) {
    return next(
      new UnauthorizedException('Unauthorized', ErrorCode.UNAUTHORIZED)
    );
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

    // 5. Attach the user to the current request object
    req.user = user;
    next(); // Continue to the next middleware or route handler
  } catch (error) {
    next(new UnauthorizedException('Unauthorized', ErrorCode.UNAUTHORIZED));
  }
};

export default roleCheckMiddleware;
