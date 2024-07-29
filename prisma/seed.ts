import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.role.createMany({
    data: [
      { name: 'BASIC', description: 'Basic user role' },
      { name: 'ADMIN', description: 'Administrator role' },
    ],
  });

  await prisma.user.create({
    data: {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password', // Ideally, hash the password
      roles: {
        connect: { name: 'BASIC' }, // Connect to the BASIC role
      },
    },
  });

  // Add more dummy data as needed
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
