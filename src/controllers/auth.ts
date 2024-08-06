import { NextFunction, Request, Response } from 'express';
import { compareSync } from 'bcrypt';
import { BadRequestsException } from '../exceptions/bad-request';
import { ErrorCode } from '../exceptions/root';
import { SignupSchema } from '../schema/users';
import { NotFoundException } from '../exceptions/notFound';
import logger from '../logger/logger';
import {
  generateToken,
  findRole,
  createRole,
  createUser,
  findUser,
  setTokenCookie,
} from '../utils';
export const signup = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  SignupSchema.parse(req.body);
  const { email, password, name } = req.body;

  // Check by email
  let user = await findUser(email);

  // Check by name
  if (!user) user = await findUser(name);

  // If user exists, throw an error
  if (user) {
    new BadRequestsException(
      'User already exists.',
      ErrorCode.USER_ALREADY_EXIST
    );
  }

  // Check if basic role exists, not necessary if tables already populated.
  // Used only for the demo/testing
  let basicRole = await findRole('BASIC');

  if (!basicRole) {
    // Create BASIC role if it doesn't exist
    basicRole = await createRole('BASIC', 'Basic user role');
  }

  // Create the user and assign the BASIC role
  user = await createUser(email, name, password, basicRole.id);

  logger.info(`Signup attempt: email=${email}, status=success`);

  res.json(user);
};
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email, name, password } = req.body;
  // Create a search object
  const searchParams = {
    email: email || undefined,
    name: name || undefined,
  };

  // Remove undefined properties from searchParams
  const searchObject = Object.fromEntries(
    Object.entries(searchParams).filter(([_, v]) => v != null)
  );

  let user = await findUser(searchObject);
  if (!user) {
    throw new NotFoundException('User not found.', ErrorCode.USER_NOT_FOUND);
  }

  if (!compareSync(password, user.password)) {
    throw new BadRequestsException(
      'Incorrect password.',
      ErrorCode.INCORRECT_PASSWORD
    );
  }

  const token = generateToken(user);

  // Set the token in the response (e.g., as a cookie)
  setTokenCookie(res, token);

  // Retrieve the redirect URL from the cookie
  const redirectUrl = req.cookies.redirectUrl || '/'; // Default to home page if not found

  // Clear the redirect URL from the cookie
  res.cookie('redirectUrl', '', { expires: new Date(0) });

  //Log the action
  logger.info(`Login attempt: email=${email}, status=success`);
  logger.info(`Redirecting: email=${email}, path=${redirectUrl}`);
  // Redirect to the original URL or home page
  res.json({ redirectUrl: redirectUrl });
};
