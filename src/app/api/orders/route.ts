import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const email = searchParams.get('email');
    const phone = searchParams.get('phone');

    if (!userId && !email && !phone) {
      return NextResponse.json(
        { message: 'UserId hoặc Email/Phone là bắt buộc!' },
        { status: 400 }
      );
    }

    let orders: any[] = [];

    // Direct fetch from Supabase Cloud Database (Fast Direct REST)
    try {
      const orClauses: string[] = [];
      if (userId) orClauses.push(`userId.eq.${userId}`);
      if (email) orClauses.push(`customerEmail.eq.${email}`);
      if (phone) orClauses.push(`customerPhone.eq.${phone}`);

      let query = supabase.from('Order').select('*, orderItems:OrderItem(*, product:Product(*)), serials:ProductSerial(*, product:Product(*))');
      if (orClauses.length > 0) {
        query = query.or(orClauses.join(','));
      }

      const { data: supaOrders, error: supaErr } = await query.order('createdAt', { ascending: false });

      if (!supaErr && supaOrders && Array.isArray(supaOrders)) {
        orders = supaOrders;
      } else {
        // Fallback without serials join
        let simpleQuery = supabase.from('Order').select('*, orderItems:OrderItem(*, product:Product(*))');
        if (orClauses.length > 0) {
          simpleQuery = simpleQuery.or(orClauses.join(','));
        }
        const { data: simpleOrders, error: simpleErr } = await simpleQuery.order('createdAt', { ascending: false });
        if (!simpleErr && simpleOrders && Array.isArray(simpleOrders)) {
          orders = simpleOrders;
        } else {
          if (supaErr) console.warn('Supabase get orders warning, trying Prisma fallback:', supaErr);
          const { PrismaClient } = await import('@prisma/client');
          const prisma = new PrismaClient();
          try {
            const conditions: any[] = [];
            if (userId) conditions.push({ userId });
            if (email) conditions.push({ customerEmail: email });
            if (phone) conditions.push({ customerPhone: phone });

            orders = await prisma.order.findMany({
              where: conditions.length > 0 ? { OR: conditions } : {},
              include: {
                orderItems: {
                  include: {
                    product: true,
                  },
                },
                serials: {
                  include: {
                    product: true,
                  },
                },
              },
              orderBy: { createdAt: 'desc' },
            });
          } finally {
            await prisma.$disconnect();
          }
        }
      }
    } catch (e) {
      console.warn('Supabase get orders warning, trying Prisma fallback:', e);
      try {
        const { PrismaClient } = await import('@prisma/client');
        const prisma = new PrismaClient();
        try {
          const conditions: any[] = [];
          if (userId) conditions.push({ userId });
          if (email) conditions.push({ customerEmail: email });
          if (phone) conditions.push({ customerPhone: phone });

          orders = await prisma.order.findMany({
            where: conditions.length > 0 ? { OR: conditions } : {},
            include: {
              orderItems: {
                include: {
                  product: true,
                },
              },
              serials: {
                include: {
                  product: true,
                },
              },
            },
            orderBy: { createdAt: 'desc' },
          });
        } finally {
          await prisma.$disconnect();
        }
      } catch (pe) {
        console.error('Prisma fallback get orders error:', pe);
      }
    }

    return NextResponse.json({ orders }, { status: 200 });
  } catch (error: any) {
    console.error('Lỗi khi lấy lịch sử đơn hàng:', error);
    return NextResponse.json(
      { message: 'Lỗi máy chủ nội bộ. Vui lòng thử lại sau!', error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      userId, 
      customerName, 
      customerPhone, 
      customerEmail, 
      shippingAddress, 
      deliveryType = 'DELIVERY', 
      shippingMethod = 'STANDARD',
      needInstallation = false,
      isProxyRecipient = false,
      proxyName = '',
      proxyPhone = '',
      technicalNotes = '',
      cartItems, 
      couponCode = null,
      totalAmount,
      discountAmount = 0,
      netAmount, 
      paymentMethod = 'COD' 
    } = body;

    if (!cartItems || cartItems.length === 0) {
      return NextResponse.json({ message: 'Giỏ hàng đang trống!' }, { status: 400 });
    }

    if (!customerName?.trim() || !customerPhone?.trim()) {
      return NextResponse.json({ message: 'Vui lòng cung cấp Họ tên và Số điện thoại nhận hàng!' }, { status: 400 });
    }

    if (deliveryType === 'DELIVERY' && !shippingAddress?.trim()) {
      return NextResponse.json({ message: 'Vui lòng cung cấp Địa chỉ nhận hàng!' }, { status: 400 });
    }

    // Generate or use client-provided draft Order Code: DRX-xxxxx
    const providedCode = body.orderCode && typeof body.orderCode === 'string' && body.orderCode.trim().startsWith('DRX-')
      ? body.orderCode.trim().toUpperCase()
      : null;
    const random5Digits = Math.floor(10000 + Math.random() * 90000);
    const orderCode = providedCode || `DRX-${random5Digits}`;
    const orderId = `ord-${Date.now()}-${random5Digits}`;

    const resolvedTotal = Number(totalAmount || netAmount || 0);
    const resolvedNet = Number(netAmount || totalAmount || 0);
    const resolvedDiscount = Number(discountAmount || 0);

    const fullAddress = deliveryType === 'STORE_PICKUP' 
      ? 'Nhận trực tiếp tại Showroom DRX Hardware (TP. Hồ Chí Minh)'
      : shippingAddress.trim();

    // Compile Special Request Notes
    const specialRequests: string[] = [];
    if (needInstallation) {
      specialRequests.push('🛠️ Yêu cầu hỗ trợ lắp đặt / cài ráp linh kiện & kiểm tra nhiệt độ');
    }
    if (isProxyRecipient && proxyName.trim()) {
      specialRequests.push(`👥 Nhờ người khác nhận hàng: ${proxyName.trim()} - SĐT: ${proxyPhone.trim()}`);
    }
    if (technicalNotes.trim()) {
      specialRequests.push(`💡 Ghi chú kỹ thuật: ${technicalNotes.trim()}`);
    }

    const combinedNotes = specialRequests.join('\n');

    const resolvedMethod = (paymentMethod === 'QR_BANK' || paymentMethod === 'VIETQR') ? 'QR_BANK' : 'COD';

    // Verify userId to satisfy Foreign Key constraint with User table
    let validUserId: string | null = null;
    if (userId) {
      try {
        const { data: userRow } = await supabase
          .from('User')
          .select('id')
          .eq('id', userId)
          .maybeSingle();
        if (userRow?.id) {
          validUserId = userRow.id;
        } else if (customerEmail) {
          const { data: userByEmail } = await supabase
            .from('User')
            .select('id')
            .eq('email', customerEmail.trim().toLowerCase())
            .maybeSingle();
          if (userByEmail?.id) {
            validUserId = userByEmail.id;
          }
        }
      } catch (e) {}
    } else if (customerEmail) {
      try {
        const { data: userByEmail } = await supabase
          .from('User')
          .select('id')
          .eq('email', customerEmail.trim().toLowerCase())
          .maybeSingle();
        if (userByEmail?.id) {
          validUserId = userByEmail.id;
        }
      } catch (e) {}
    }

    const orderPayloadData = {
      id: orderId,
      orderCode: orderCode,
      userId: validUserId,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerEmail: customerEmail?.trim() || null,
      shippingAddress: fullAddress,
      deliveryType: deliveryType,
      notes: combinedNotes || null,
      totalAmount: resolvedTotal,
      discountAmount: resolvedDiscount,
      netAmount: resolvedNet,
      status: 'PENDING' as const,
      paymentMethod: resolvedMethod as any,
      paymentStatus: 'PENDING' as const,
      paymentDetails: {
        shippingMethod,
        needInstallation,
        isProxyRecipient,
        proxyName: proxyName.trim(),
        proxyPhone: proxyPhone.trim(),
        technicalNotes: technicalNotes.trim(),
        bankInfo: resolvedMethod === 'QR_BANK' ? {
          bankName: 'Techcombank',
          bankCode: 'TCB',
          accountNumber: 'BAOLANN',
          accountHolder: 'VO BAO LAN',
          transferContent: orderCode,
          amount: resolvedNet,
        } : null,
        items: cartItems.map((i: any) => ({
          id: i.productId || i.id,
          name: i.name,
          price: i.discountPrice ?? i.price,
          quantity: i.quantity || 1,
          coverImage: i.coverImage,
        }))
      },
    };

    // 1. Insert directly to Supabase Cloud Database (Fast Direct REST)
    let createdOrder: any = null;
    try {
      const { data: supaNew, error: supaErr } = await supabase
        .from('Order')
        .insert([{
          ...orderPayloadData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }])
        .select('*')
        .single();

      if (!supaErr && supaNew) {
        createdOrder = supaNew;
      } else {
        if (supaErr) console.warn('Supabase create order error, trying Prisma fallback:', supaErr);
        const { PrismaClient } = await import('@prisma/client');
        const prisma = new PrismaClient();
        try {
          let prismaUserId = validUserId;
          if (prismaUserId) {
            const u = await prisma.user.findUnique({ where: { id: prismaUserId } });
            if (!u) prismaUserId = null;
          }
          const prismaCreated = await prisma.order.create({
            data: {
              ...orderPayloadData,
              userId: prismaUserId,
            },
          });
          if (prismaCreated) {
            createdOrder = prismaCreated;
          }
        } finally {
          await prisma.$disconnect();
        }
      }
    } catch (supaErr: any) {
      console.warn('Supabase insert exception, trying Prisma fallback:', supaErr);
      try {
        const { PrismaClient } = await import('@prisma/client');
        const prisma = new PrismaClient();
        try {
          let prismaUserId = validUserId;
          if (prismaUserId) {
            const u = await prisma.user.findUnique({ where: { id: prismaUserId } });
            if (!u) prismaUserId = null;
          }
          const prismaCreated = await prisma.order.create({
            data: {
              ...orderPayloadData,
              userId: prismaUserId,
            },
          });
          if (prismaCreated) {
            createdOrder = prismaCreated;
          }
        } finally {
          await prisma.$disconnect();
        }
      } catch (pe) {
        console.error('Prisma order create error:', pe);
      }
    }

    const finalOrder = createdOrder || {
      ...orderPayloadData,
      createdAt: new Date().toISOString(),
    };

    // Insert individual OrderItem records if items present
    const targetOrderId = finalOrder.id || orderId;
    if (cartItems && cartItems.length > 0) {
      try {
        const orderItemRows = cartItems.map((i: any) => ({
          id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          orderId: targetOrderId,
          productId: i.productId || i.id,
          quantity: Number(i.quantity) || 1,
          price: Number(i.discountPrice ?? i.price ?? 0),
          serialsList: [],
        }));
        await supabase.from('OrderItem').insert(orderItemRows);

        // Deduct Product.stockQuantity and allocate AVAILABLE serials for purchased items
        for (const item of cartItems) {
          const pid = item.productId || item.id;
          const qty = Number(item.quantity) || 1;
          if (pid) {
            try {
              // 1. Check and mark available serials as SOLD with orderId
              const { data: availSerials } = await supabase
                .from('ProductSerial')
                .select('id')
                .eq('productId', pid)
                .eq('status', 'AVAILABLE')
                .limit(qty);

              if (availSerials && availSerials.length > 0) {
                const sIds = availSerials.map((s: any) => s.id);
                await supabase
                  .from('ProductSerial')
                  .update({
                    status: 'SOLD',
                    orderId: targetOrderId,
                    soldDate: new Date().toISOString(),
                  })
                  .in('id', sIds);
              }

              // 2. Sync remaining AVAILABLE serial count to Product.stockQuantity
              const { count: remainingCount } = await supabase
                .from('ProductSerial')
                .select('*', { count: 'exact', head: true })
                .eq('productId', pid)
                .eq('status', 'AVAILABLE');

              if (remainingCount !== null && remainingCount !== undefined && availSerials && availSerials.length > 0) {
                await supabase
                  .from('Product')
                  .update({
                    stockQuantity: remainingCount,
                    inStock: remainingCount > 0,
                    updatedAt: new Date().toISOString(),
                  })
                  .eq('id', pid);
              } else {
                // Direct decrement Product.stockQuantity if no serials track
                const { data: curProd } = await supabase
                  .from('Product')
                  .select('stockQuantity')
                  .eq('id', pid)
                  .maybeSingle();

                if (curProd) {
                  const currentStock = curProd.stockQuantity !== null && curProd.stockQuantity !== undefined ? Number(curProd.stockQuantity) : 10;
                  const newStock = Math.max(0, currentStock - qty);
                  await supabase
                    .from('Product')
                    .update({
                      stockQuantity: newStock,
                      inStock: newStock > 0,
                      updatedAt: new Date().toISOString(),
                    })
                    .eq('id', pid);
                }
              }
            } catch (stockErr) {
              console.warn('Lỗi tự động trừ tồn kho đơn hàng:', stockErr);
            }
          }
        }
      } catch (itemErr) {
        console.warn('OrderItem insert warning:', itemErr);
      }
    }

    // Increment coupon usedCount in real database if couponCode applied
    if (couponCode && typeof couponCode === 'string') {
      const cleanCoupon = couponCode.trim().toUpperCase();
      try {
        const { data: supaC } = await supabase
          .from('Coupon')
          .select('usedCount')
          .eq('code', cleanCoupon)
          .single();
        if (supaC) {
          await supabase
            .from('Coupon')
            .update({ usedCount: (Number(supaC.usedCount) || 0) + 1 })
            .eq('code', cleanCoupon);
        }
      } catch (e) {}
    }

    // Create Admin Notification
    try {
      await supabase.from('Notification').insert([{
        id: 'notif-' + Date.now(),
        type: 'NEW_ORDER',
        title: `Đơn Hàng Mới ${orderCode}`,
        message: `Khách hàng ${customerName} vừa đặt đơn ${orderCode} (${resolvedNet.toLocaleString('vi-VN')} đ - ${resolvedMethod === 'QR_BANK' ? 'Quét QR Techcombank' : 'COD'}).`,
        data: { orderId: finalOrder.id, orderCode },
        isRead: false,
        createdAt: new Date().toISOString(),
      }]);
    } catch (e) {}

    return NextResponse.json({ 
      success: true,
      message: 'Đặt hàng thành công! Đội ngũ DRX Hardware sẽ liên hệ xác nhận sớm nhất.',
      order: {
        id: finalOrder.id,
        orderCode: finalOrder.orderCode || orderCode,
        customerName: finalOrder.customerName,
        customerPhone: finalOrder.customerPhone,
        customerEmail: finalOrder.customerEmail,
        shippingAddress: finalOrder.shippingAddress,
        deliveryType: finalOrder.deliveryType,
        totalAmount: resolvedNet,
        discountAmount: resolvedDiscount,
        netAmount: resolvedNet,
        paymentMethod: finalOrder.paymentMethod || resolvedMethod,
        paymentStatus: finalOrder.paymentStatus || 'PENDING',
        paymentDetails: finalOrder.paymentDetails,
        status: finalOrder.status || 'PENDING',
        createdAt: finalOrder.createdAt || new Date().toISOString(),
      },
    }, { status: 201 });

  } catch (error: any) {
    console.error('Lỗi khi xử lý đơn hàng:', error);
    return NextResponse.json(
      { message: error.message || 'Lỗi xử lý đơn hàng' },
      { status: 500 }
    );
  }
}
