import { NextFunction, Request, Response } from 'express';
import { prismaClient } from '..';
import { hashSync, compareSync } from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../secrets';
import { BadRequestsException } from '../exceptions/bad-request';
import { ErrorCode } from '../exceptions/root';
import { UnprcessableEntity } from '../exceptions/validation';
import { SignupSchema } from '../schema/users';
export const signup = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    SignupSchema.parse(req.body);
    const { email, password, name } = req.body;

    let user = await prismaClient.user.findFirst({
      where: { email: email },
    });
    if (user) {
      next(
        new BadRequestsException(
          'User already exists.',
          ErrorCode.USER_ALREADY_EXIST
        )
      );
    }
    user = await prismaClient.user.create({
      data: { email: email, name: name, password: hashSync(password, 10) },
    });
    res.json(user);
  } catch (err: any) {
    next(
      new UnprcessableEntity(
        err?.issues,
        'Unprocessable entity.',
        ErrorCode.UNPROCESSABLE_ENTITY
      )
    );
  }
};
export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  let user = await prismaClient.user.findFirst({
    where: { email: email },
  });
  if (!user) {
    throw Error('User does not exists.');
  }
  if (!compareSync(password, user.password)) {
    throw Error('Invalid password.');
  }
  const token = jwt.sign(
    {
      usedId: user.id,
    },
    JWT_SECRET
  );

  res.json({ user, token });
};
