import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function ensureAdmin() {
  const email = 'admin@drx.vn';
  const rawPassword = 'admin';
  const hashedPassword = bcrypt.hashSync(rawPassword, 10);

  const admin = await prisma.user.upsert({
    where: { email },
    update: {
      role: 'ADMIN',
      name: 'DRX Hardware Master Admin',
    },
    create: {
      name: 'DRX Hardware Master Admin',
      email,
      password: hashedPassword,
      role: 'ADMIN',
      balance: 10000000.0,
    },
  });

  console.log('✓ Tài khoản Admin quản trị viên đã sẵn sàng:', admin.email, admin.role);
}

ensureAdmin().then(() => prisma.$disconnect()).catch(console.error);
