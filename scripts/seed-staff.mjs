import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hashPassword = bcrypt.hashSync('01699224729', 10);

  // 1. Staff account
  const staff = await prisma.user.upsert({
    where: { email: 'staff@drx.vn' },
    update: {
      password: hashPassword,
      role: 'STAFF',
      name: 'Nhân Viên DRX',
      phone: '01699224729',
    },
    create: {
      email: 'staff@drx.vn',
      name: 'Nhân Viên DRX',
      password: hashPassword,
      role: 'STAFF',
      phone: '01699224729',
      balance: 0,
    }
  });
  console.log('Staff account ready in PostgreSQL:', staff.email, 'Role:', staff.role);

  // 2. Admin account
  const admin = await prisma.user.upsert({
    where: { email: 'admin@drx.vn' },
    update: {
      password: hashPassword,
      role: 'ADMIN',
      name: 'DRX CEO Admin',
      phone: '01699224729',
    },
    create: {
      email: 'admin@drx.vn',
      name: 'DRX CEO Admin',
      password: hashPassword,
      role: 'ADMIN',
      phone: '01699224729',
      balance: 999999999,
    }
  });
  console.log('Admin account ready in PostgreSQL:', admin.email, 'Role:', admin.role);
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
