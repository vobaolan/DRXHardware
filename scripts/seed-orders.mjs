import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedOrders() {
  const count = await prisma.order.count();
  if (count > 0) {
    console.log(`Đã có ${count} đơn hàng trong DB.`);
    return;
  }

  const products = await prisma.product.findMany({ take: 3 });
  const user = await prisma.user.findFirst();

  if (products.length === 0) {
    console.log('Chưa có sản phẩm để tạo đơn mẫu.');
    return;
  }

  // Order 1
  await prisma.order.create({
    data: {
      id: `ord-${Date.now()}-1`,
      orderCode: 'DRX-8819',
      userId: user?.id || null,
      customerName: 'Trần Bình Minh',
      customerPhone: '0908889999',
      customerEmail: user?.email || 'tranbinhminh100899@gmail.com',
      shippingAddress: '72 Lê Thánh Tôn, Bến Nghé, Quận 1, TP. Hồ Chí Minh',
      deliveryType: 'DELIVERY',
      notes: 'Giao giờ hành chính, lắp sẵn quạt tản nhiệt giúp mình.',
      totalAmount: 16990000,
      discountAmount: 500000,
      netAmount: 16490000,
      status: 'CONFIRMED',
      paymentMethod: 'VIETQR',
      paymentStatus: 'PAID',
      orderItems: {
        create: [
          {
            productId: products[0].id,
            quantity: 1,
            price: products[0].price,
            serialsList: ['SN-CPU-INTEL-13400F-881'],
          },
          ...(products[1] ? [{
            productId: products[1].id,
            quantity: 1,
            price: products[1].price,
            serialsList: ['SN-VGA-ASUS-4060-992'],
          }] : []),
        ]
      }
    }
  });

  // Order 2
  if (products[1]) {
    await prisma.order.create({
      data: {
        id: `ord-${Date.now()}-2`,
        orderCode: 'DRX-8820',
        userId: user?.id || null,
        customerName: 'Võ Bảo Lân',
        customerPhone: '0912345678',
        customerEmail: 'drxfizzy@gmail.com',
        shippingAddress: '120 Nguyễn Văn Linh, Hải Châu, Đà Nẵng',
        deliveryType: 'DELIVERY',
        notes: 'Hàng dễ vỡ, vui lòng đóng gói chống sốc kỹ.',
        totalAmount: Number(products[1].price),
        discountAmount: 0,
        netAmount: Number(products[1].price),
        status: 'SHIPPING',
        paymentMethod: 'VIETQR',
        paymentStatus: 'PAID',
        orderItems: {
          create: [
            {
              productId: products[1].id,
              quantity: 1,
              price: products[1].price,
              serialsList: ['SN-HARDWARE-DRX-441'],
            }
          ]
        }
      }
    });
  }

  console.log('✓ Đã tạo thành công 2 đơn hàng phần cứng thực tế vào Database!');
}

seedOrders().then(() => prisma.$disconnect()).catch(console.error);
