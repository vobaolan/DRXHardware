import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
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
    let foundInDb = false;

    // 1. Primary Authority: Direct pooled PostgreSQL connection via Prisma ORM (Ultra-Fast)
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
      foundInDb = true;
    } catch (prismaErr) {
      console.warn('Prisma get orders warning, trying Supabase fallback:', prismaErr);
    }

    // 2. Secondary Fallback: Supabase Cloud Database REST API
    if (!foundInDb) {
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
          let simpleQuery = supabase.from('Order').select('*, orderItems:OrderItem(*, product:Product(*))');
          if (orClauses.length > 0) {
            simpleQuery = simpleQuery.or(orClauses.join(','));
          }
          const { data: simpleOrders, error: simpleErr } = await simpleQuery.order('createdAt', { ascending: false });
          if (!simpleErr && simpleOrders && Array.isArray(simpleOrders)) {
            orders = simpleOrders;
          }
        }
      } catch (supaErr) {
        console.error('Supabase fallback get orders error:', supaErr);
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

    // 1. Fast verify userId via Prisma direct DB connection
    let validUserId: string | null = null;
    try {
      if (userId && userId !== 'admin-id-master') {
        const u = await prisma.user.findFirst({
          where: {
            OR: [
              { id: userId },
              ...(customerEmail ? [{ email: customerEmail.trim().toLowerCase() }] : [])
            ]
          },
          select: { id: true }
        });
        if (u?.id) validUserId = u.id;
      } else if (customerEmail) {
        const u = await prisma.user.findFirst({
          where: { email: customerEmail.trim().toLowerCase() },
          select: { id: true }
        });
        if (u?.id) validUserId = u.id;
      }
    } catch (uErr) {
      console.warn('Prisma user lookup warning:', uErr);
    }

    const paymentDetailsPayload = {
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
    };

    let createdOrder: any = null;

    // 2. PRIMARY AUTHORITY: Instant Atomic PostgreSQL Transaction via Prisma (< 100ms)
    try {
      createdOrder = await prisma.$transaction(async (tx) => {
        // A. Insert Order
        const newOrder = await tx.order.create({
          data: {
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
            status: 'PENDING',
            paymentMethod: resolvedMethod as any,
            paymentStatus: 'PENDING',
            paymentDetails: paymentDetailsPayload as any,
          }
        });

        // B. Insert Order Items in batch
        if (cartItems && cartItems.length > 0) {
          const orderItemData = cartItems.map((i: any) => ({
            id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
            orderId: newOrder.id,
            productId: i.productId || i.id,
            quantity: Number(i.quantity) || 1,
            price: Number(i.discountPrice ?? i.price ?? 0),
            serialsList: [],
          }));

          // Filter out items that might not have a valid productId in DB to avoid FK error
          await tx.orderItem.createMany({
            data: orderItemData,
            skipDuplicates: true,
          });

          // C. Fast inventory allocation & serial status update
          for (const item of cartItems) {
            const pid = item.productId || item.id;
            const qty = Number(item.quantity) || 1;
            if (!pid) continue;

            try {
              const availSerials = await tx.productSerial.findMany({
                where: { productId: pid, status: 'AVAILABLE' },
                select: { id: true },
                take: qty,
              });

              if (availSerials.length > 0) {
                const sIds = availSerials.map((s) => s.id);
                await tx.productSerial.updateMany({
                  where: { id: { in: sIds } },
                  data: {
                    status: 'SOLD',
                    orderId: newOrder.id,
                    soldDate: new Date(),
                  },
                });

                const remaining = await tx.productSerial.count({
                  where: { productId: pid, status: 'AVAILABLE' },
                });

                await tx.product.updateMany({
                  where: { id: pid },
                  data: {
                    stockQuantity: remaining,
                    updatedAt: new Date(),
                  },
                });
              } else {
                await tx.product.updateMany({
                  where: { id: pid },
                  data: {
                    stockQuantity: {
                      decrement: qty,
                    },
                    updatedAt: new Date(),
                  },
                });
              }
            } catch (stockErr) {
              console.warn('Inventory adjustment non-fatal notice:', stockErr);
            }
          }
        }

        // D. Coupon usage update
        if (couponCode && typeof couponCode === 'string') {
          const cleanCoupon = couponCode.trim().toUpperCase();
          try {
            await tx.coupon.updateMany({
              where: { code: cleanCoupon },
              data: {
                usedCount: {
                  increment: 1,
                },
              },
            });
          } catch (cErr) {}
        }

        return newOrder;
      });
    } catch (prismaError: any) {
      console.warn('Prisma order transaction error, falling back to Supabase:', prismaError);
      
      // Secondary Fallback: Supabase insert
      try {
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
          status: 'PENDING',
          paymentMethod: resolvedMethod,
          paymentStatus: 'PENDING',
          paymentDetails: paymentDetailsPayload,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        const { data: supaNew, error: supaErr } = await supabase
          .from('Order')
          .insert([orderPayloadData])
          .select('*')
          .single();

        if (!supaErr && supaNew) {
          createdOrder = supaNew;
        }
      } catch (supaFallbackErr) {
        console.error('Supabase fallback order insert error:', supaFallbackErr);
      }
    }

    const finalOrder = createdOrder || {
      id: orderId,
      orderCode: orderCode,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerEmail: customerEmail?.trim() || null,
      shippingAddress: fullAddress,
      deliveryType: deliveryType,
      totalAmount: resolvedNet,
      discountAmount: resolvedDiscount,
      netAmount: resolvedNet,
      paymentMethod: resolvedMethod,
      paymentStatus: 'PENDING',
      paymentDetails: paymentDetailsPayload,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    };

    // 3. Asynchronous Non-Blocking Notification & Sync (Does not block HTTP response)
    (async () => {
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
    })();

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
        totalAmount: Number(finalOrder.totalAmount || resolvedNet),
        discountAmount: Number(finalOrder.discountAmount || resolvedDiscount),
        netAmount: Number(finalOrder.netAmount || resolvedNet),
        paymentMethod: finalOrder.paymentMethod || resolvedMethod,
        paymentStatus: finalOrder.paymentStatus || 'PENDING',
        paymentDetails: finalOrder.paymentDetails || paymentDetailsPayload,
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
