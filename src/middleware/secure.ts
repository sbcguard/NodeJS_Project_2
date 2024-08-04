import { Request, Response, NextFunction } from 'express';
import { SECURE_ROOT } from '@/secrets';
import authMiddleware from '@/middleware/auth';
import roleCheckMiddleware, {
  isRoleCheckRequest,
} from '@/middleware/roleCheck';
import { setRedirectUrlCookie } from '@/utils/setCookie';

// Middleware function to handle authentication and role checking
const secureMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (SECURE_ROOT.some((root) => req.path.startsWith(root))) {
    authMiddleware(req, res, (authenticateErr) => {
      if (authenticateErr) {
        setRedirectUrlCookie(
          res,
          `${req.protocol}://${req.get('host')}${req.originalUrl}`
        );
        return res.redirect('/login.html');
      }
      if (isRoleCheckRequest(req)) {
        return roleCheckMiddleware(req, res, next);
      }
      // Handle the case where the request is not of type RoleCheckRequest
      return res.status(400).send('Bad Request');
    });
  } else {
    next();
  }
};
export default secureMiddleware;
