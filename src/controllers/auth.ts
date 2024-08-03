import { NextFunction, Request, Response } from 'express';
import { prismaClient } from '..';
import { hashSync, compareSync } from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { JWT_SECRET, JWT_SECRET_EXPIRATION } from '../secrets';
import { BadRequestsException } from '../exceptions/bad-request';
import { ErrorCode } from '../exceptions/root';
import { SignupSchema } from '../schema/users';
import { NotFoundException } from '../exceptions/notFound';
import logger from '../logger/logger';
export const signup = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  SignupSchema.parse(req.body);
  const { email, password, name } = req.body;

  let user = await prismaClient.user.findFirst({
    where: { email },
  });
  if (user) {
    new BadRequestsException(
      'User already exists.',
      ErrorCode.USER_ALREADY_EXIST
    );
  }
  let basicRole = await prismaClient.role.findUnique({
    where: { name: 'BASIC' },
  });
  if (!basicRole) {
    basicRole = await prismaClient.role.create({
      data: {
        name: 'BASIC',
        description: 'Basic user role',
      },
    });
  }
  // Create the user and assign the BASIC role
  user = await prismaClient.user.create({
    data: {
      email,
      name,
      password: hashSync(password, 10),
      roles: {
        connect: { id: basicRole.id }, // Connect the role by its ID
      },
    },
    include: { roles: true }, // Include roles to verify assignment
  });
  logger.info(`Signup attempt: email=${email}, status=success`);
  res.json(user);
};
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email, password } = req.body;
  let user = await prismaClient.user.findFirst({
    where: { email },
    include: {
      roles: true, // This will include the related roles
    },
  });
  if (!user) {
    throw new NotFoundException('User not found.', ErrorCode.USER_NOT_FOUND);
  }
  if (!compareSync(password, user.password)) {
    throw new BadRequestsException(
      'Incorrect password.',
      ErrorCode.INCORRECT_PASSWORD
    );
  }
  const token = jwt.sign(
    {
      userId: user.id,
    },
    JWT_SECRET,
    { expiresIn: JWT_SECRET_EXPIRATION }
  );
  // Set the token in the response (e.g., as a cookie)
  res.cookie('token', token, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    path: '/',
    maxAge: 12 * 60 * 60 * 1000, // 12 hours
  });
  // Retrieve the redirect URL from the cookie
  const redirectUrl = req.cookies.redirectUrl || '/'; // Default to home page if not found
  // Clear the redirect URL from the cookie
  res.cookie('redirectUrl', '', { expires: new Date(0) });
  //Log the action
  logger.info(`Login attempt: email=${email}, status=success`);
  logger.info(`Redirecting: email=${email}, path=${redirectUrl}`);
  // Redirect to the original URL or home page
  console.log(`API redirect to ${redirectUrl}`);
  res.redirect(redirectUrl);
};
