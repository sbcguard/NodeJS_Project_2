import dotenv from 'dotenv';

dotenv.config({ path: '.env' });
export const PORT = process.env.PORT;
// Parse SECURE_ROOT as a JSON array
export const SECURE_ROOT: string[] = JSON.parse(
  process.env.SECURE_ROOT! || '[]'
);
export const JWT_SECRET = process.env.JWT_SECRET!;
export const JWT_SECRET_EXPIRATION = process.env.JWT_SECRET_EXPIRATION;
