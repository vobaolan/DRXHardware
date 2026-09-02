import { PrismaClient } from '@prisma/client';
import fs from 'fs';

const prisma = new PrismaClient({
  datasources: { db: { url: 'postgresql://postgres:01699224729Lan@db.fubqiwdrwgbhyxokqnuh.supabase.co:5432/postgres' } }
});

async function exportOld() {
  console.log('Đang kết nối và đọc dữ liệu từ Database cũ...');
  const users = await prisma.user.findMany().catch(() => []);
  const products = await prisma.product.findMany().catch(() => []);
  const coupons = await prisma.coupon.findMany().catch(() => []);
  const orders = await prisma.order.findMany().catch(() => []);
  const orderItems = await prisma.orderItem.findMany().catch(() => []);
  const serials = await prisma.productSerial.findMany().catch(() => []);
  const transactions = await prisma.transaction.findMany().catch(() => []);
  const reviews = await prisma.review.findMany().catch(() => []);

  const data = { users, products, coupons, orders, orderItems, serials, transactions, reviews };
  fs.writeFileSync('scripts/old-db-backup.json', JSON.stringify(data, null, 2));
  console.log('✓ Đã sao lưu thành công ra file scripts/old-db-backup.json:');
  console.log({
    users: users.length,
    products: products.length,
    coupons: coupons.length,
    orders: orders.length,
    orderItems: orderItems.length,
    serials: serials.length,
    transactions: transactions.length,
    reviews: reviews.length
  });
}

exportOld()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
  });
