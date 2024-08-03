import dotenv from 'dotenv';

dotenv.config({ path: '.env' });
export const PORT = process.env.PORT;
export const SECURE_ROOT = process.env.SECURE_ROOT!;
export const JWT_SECRET = process.env.JWT_SECRET!;
export const JWT_SECRET_EXPIRATION = process.env.JWT_SECRET_EXPIRATION;
