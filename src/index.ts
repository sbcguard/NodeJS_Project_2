import express, { Express } from 'express';
import cookieParser from 'cookie-parser';
import path from 'path';
import { PORT } from './secrets';
import rootRouter from './routes';
import { PrismaClient } from '@prisma/client';
import { errorMiddleware } from './middleware/errors';
import secureMiddleware from './middleware/secure';

const app: Express = express();
app.use(express.json());

app.use(cookieParser());

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, '../public')));

// Apply secure middleware
app.use(secureMiddleware);

// API routes
app.use('/api', rootRouter);

// Prisma client setup
export const prismaClient = new PrismaClient({
  log: ['query'],
});

// Error handling middleware
app.use(errorMiddleware);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
