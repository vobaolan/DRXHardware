import { PrismaClient } from '@prisma/client';
import fs from 'fs';

const prisma = new PrismaClient();

async function importData() {
  console.log('Đang đọc file sao lưu scripts/old-db-backup.json...');
  const raw = fs.readFileSync('scripts/old-db-backup.json', 'utf8');
  const data = JSON.parse(raw);

  // 1. Users
  console.log(`Đang đồng bộ ${data.users.length} tài khoản người dùng...`);
  for (const u of data.users) {
    const { createdAt, updatedAt, emailVerified, ...rest } = u;
    await prisma.user.upsert({
      where: { email: u.email },
      update: {
        ...rest,
        createdAt: new Date(createdAt),
        updatedAt: new Date(updatedAt),
        emailVerified: emailVerified ? new Date(emailVerified) : null,
      },
      create: {
        ...rest,
        createdAt: new Date(createdAt),
        updatedAt: new Date(updatedAt),
        emailVerified: emailVerified ? new Date(emailVerified) : null,
      }
    });
  }
  console.log('✓ Users đồng bộ xong.');

  // 2. Coupons
  console.log(`Đang đồng bộ ${data.coupons.length} coupon...`);
  for (const c of data.coupons) {
    const { createdAt, expiresAt, ...rest } = c;
    await prisma.coupon.upsert({
      where: { code: c.code },
      update: {
        ...rest,
        createdAt: new Date(createdAt),
        expiresAt: new Date(expiresAt),
      },
      create: {
        ...rest,
        createdAt: new Date(createdAt),
        expiresAt: new Date(expiresAt),
      }
    });
  }

  // 3. Products
  console.log(`Đang đồng bộ ${data.products.length} sản phẩm phần cứng...`);
  for (const p of data.products) {
    const { createdAt, updatedAt, ...rest } = p;
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: {
        ...rest,
        createdAt: new Date(createdAt),
        updatedAt: new Date(updatedAt),
      },
      create: {
        ...rest,
        createdAt: new Date(createdAt),
        updatedAt: new Date(updatedAt),
      }
    });
  }
  console.log('✓ Products đồng bộ xong.');

  // 4. Orders
  console.log(`Đang đồng bộ ${data.orders.length} đơn hàng...`);
  for (const o of data.orders) {
    const { createdAt, updatedAt, ...rest } = o;
    await prisma.order.upsert({
      where: { orderCode: o.orderCode },
      update: {
        ...rest,
        createdAt: new Date(createdAt),
        updatedAt: new Date(updatedAt),
      },
      create: {
        ...rest,
        createdAt: new Date(createdAt),
        updatedAt: new Date(updatedAt),
      }
    });
  }

  // 5. OrderItems
  console.log(`Đang đồng bộ ${data.orderItems.length} chi tiết đơn hàng...`);
  for (const oi of data.orderItems) {
    await prisma.orderItem.upsert({
      where: { id: oi.id },
      update: oi,
      create: oi
    });
  }

  // 6. Serials
  console.log(`Đang đồng bộ ${data.serials.length} serial bảo hành...`);
  for (const s of data.serials) {
    const { createdAt, soldDate, warrantyEnd, ...rest } = s;
    await prisma.productSerial.upsert({
      where: { serialNumber: s.serialNumber },
      update: {
        ...rest,
        createdAt: new Date(createdAt),
        soldDate: soldDate ? new Date(soldDate) : null,
        warrantyEnd: warrantyEnd ? new Date(warrantyEnd) : null,
      },
      create: {
        ...rest,
        createdAt: new Date(createdAt),
        soldDate: soldDate ? new Date(soldDate) : null,
        warrantyEnd: warrantyEnd ? new Date(warrantyEnd) : null,
      }
    });
  }
  console.log('✓ Serials đồng bộ xong.');

  // 7. Transactions
  console.log(`Đang đồng bộ ${data.transactions.length} giao dịch...`);
  for (const t of data.transactions) {
    const { createdAt, ...rest } = t;
    await prisma.transaction.upsert({
      where: { id: t.id },
      update: { ...rest, createdAt: new Date(createdAt) },
      create: { ...rest, createdAt: new Date(createdAt) }
    });
  }

  // 8. Reviews
  console.log(`Đang đồng bộ ${data.reviews.length} đánh giá...`);
  for (const r of data.reviews) {
    const { createdAt, ...rest } = r;
    await prisma.review.upsert({
      where: { id: r.id },
      update: { ...rest, createdAt: new Date(createdAt) },
      create: { ...rest, createdAt: new Date(createdAt) }
    });
  }

  console.log('\n🎉 HOÀN TẤT ĐỒNG BỘ 100% SANG DATABASE MỚI!');
}

importData()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
  });
