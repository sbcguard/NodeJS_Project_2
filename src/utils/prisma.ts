import { prismaClient } from '..';
import { UserSearchParams } from '@/@types/express/types';
import { hashSync } from 'bcrypt';
const buildWhereClause = (search: UserSearchParams) => {
  if (search.email) {
    return { email: search.email };
  } else if (search.name) {
    return { name: search.name };
  } else if (search.id) {
    return { id: search.id };
  } else {
    throw new Error('No valid search parameter provided');
  }
};
export const findUser = async (search: UserSearchParams) =>
  await prismaClient.user.findUnique({
    where: buildWhereClause(search),
    include: {
      roles: true, // This will include the related roles
    },
  });
export const createUser = async (
  email: string,
  name: string,
  pass: string,
  roleId: number
) =>
  await prismaClient.user.create({
    data: {
      email,
      name,
      password: hashSync(pass, 10),
      roles: {
        connect: { id: roleId }, // Connect the role by its ID
      },
    },
    include: { roles: true }, // Include roles to verify assignment
  });
export const findRole = async (role: string) =>
  await prismaClient.role.findUnique({
    where: { name: role },
  });
export const createRole = async (name: string, desc: string) =>
  await prismaClient.role.create({
    data: {
      name: name,
      description: desc,
    },
  });
export const checkAppSecByUrl = async (path: string) =>
  await prismaClient.appSec.findFirst({
    where: { url: path },
    include: { roles: true }, // include roles for the app
  });
