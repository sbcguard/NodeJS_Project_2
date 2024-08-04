import express, { Express, Request, Response, NextFunction } from 'express';
import cookieParser from 'cookie-parser';
import { PORT, SECURE_ROOT } from './secrets';
import rootRouter from './routes';
import { PrismaClient } from '@prisma/client';
import { errorMiddleware } from './middleware/errors';
import authMiddleware from './middleware/auth';
import roleCheckMiddleware, {
  isRoleCheckRequest,
} from './middleware/roleCheck';
import path from 'path';
import { setRedirectUrlCookie } from './utils/setCookie';

const app: Express = express();
app.use(express.json());
app.use(cookieParser());

// Middleware for authentication
app.use((req: Request, res: Response, next: NextFunction) => {
  if (req.path.startsWith(SECURE_ROOT)) {
    authMiddleware(req, res, (authenticateErr) => {
      if (authenticateErr) {
        setRedirectUrlCookie(
          res,
          `${req.protocol}://${req.get('host')}${req.originalUrl}`
        );
        res.redirect(`/login.html`);
      } else if (isRoleCheckRequest(req)) {
        roleCheckMiddleware(req, res, next);
      } else {
        // Handle the case where the request is not of type RoleCheckRequest
        res.status(400).send('Bad Request');
      }
    });
  } else {
    next();
  }
});

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, '../public')));
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
