import { Router } from 'express';
import authRoutes from './auth';
import { errorMiddleware } from '../middleware/errors';

const rootRouter: Router = Router();

rootRouter.use('/auth', errorMiddleware, authRoutes);

export default rootRouter;
