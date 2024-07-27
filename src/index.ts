import express, { Express, Request, Response } from 'express';
import { PORT } from './secrets';
import rootRouter from './routes';
import { PrismaClient } from '@prisma/client';
import { errorMiddleware } from './middleware/errors';
import { SignupSchema } from './schema/users';

const app: Express = express();
app.use(express.json);
app.use(errorMiddleware);
//Middleware
app.use('/api', rootRouter);

export const prismaClient = new PrismaClient({
  log: ['query'],
});

app.listen(PORT, () => {
  console.log('Server is running on port 3000');
});
