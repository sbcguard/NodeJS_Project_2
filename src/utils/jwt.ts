import { User } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { JWT_SECRET, JWT_SECRET_EXPIRATION } from '../secrets';

export const generateToken = (user: User) =>
  jwt.sign({ userId: user.id }, JWT_SECRET, {
    expiresIn: JWT_SECRET_EXPIRATION,
  });
export const validateToken = (token: string) =>
  jwt.verify(token, JWT_SECRET) as { userId: number };
