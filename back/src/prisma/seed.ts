import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    const hashedPassword = await bcrypt.hash('test', 10);

    await prisma.user.create({
        data: {
            email: 'test3@test.com',
            password: hashedPassword,
            role: 'employee',
        },
    });

    console.log('✅ Test user added successfully!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(() => {
        prisma.$disconnect();
    });