import 'dotenv/config';
import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const required = (name: string) => {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is required to seed the initial administrator`);
  return value;
};

async function main() {
  const email = required('ADMIN_EMAIL').toLowerCase();
  const password = required('ADMIN_PASSWORD');
  if (password.length < 10 || !/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/\d/.test(password)) {
    throw new Error('ADMIN_PASSWORD must be at least 10 characters and include upper/lowercase letters and a number');
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.user.upsert({
    where: { email },
    update: { password: passwordHash, role: Role.ADMIN, isActive: true },
    create: {
      email,
      password: passwordHash,
      role: Role.ADMIN,
      isActive: true,
    },
  });

  console.log(`Initial administrator is ready: ${email}`);
}

async function run() {
  try {
    await main();
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

void run();
