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
      let query = supabase.from('Order').select('*');
      if (userId) {
        query = query.eq('userId', userId);
      } else if (email) {
        query = query.eq('customerEmail', email);
      } else if (phone) {
        query = query.eq('customerPhone', phone);
      }

      const { data: supaOrders, error: supaErr } = await query.order('createdAt', { ascending: false });

      if (!supaErr && supaOrders && Array.isArray(supaOrders)) {
        orders = supaOrders;
      }
    } catch (e) {
      console.warn('Supabase get orders warning:', e);
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

    // Generate Order Code: DRX-xxxxx (5 random digits with hyphen, VD: DRX-84920)
    const random5Digits = Math.floor(10000 + Math.random() * 90000);
    const orderCode = `DRX-${random5Digits}`;
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

    let createdOrder: any = null;

    // 1. Insert directly to Supabase Cloud Database (Fast Direct REST)
    try {
      const { data: supaNew, error: supaErr } = await supabase
        .from('Order')
        .insert([{
          id: orderId,
          orderCode: orderCode,
          userId: userId || null,
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
          paymentMethod: paymentMethod === 'QR_BANK' ? 'QR_BANK' : 'COD',
          paymentStatus: 'PENDING',
          paymentDetails: {
            shippingMethod,
            needInstallation,
            isProxyRecipient,
            proxyName: proxyName.trim(),
            proxyPhone: proxyPhone.trim(),
            technicalNotes: technicalNotes.trim(),
            bankInfo: paymentMethod === 'QR_BANK' ? {
              bankName: 'Techcombank',
              bankCode: 'TCB',
              accountNumber: 'BAOLANN',
              accountHolder: 'DRX Hardware',
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
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }])
        .select('*')
        .single();

      if (!supaErr && supaNew) {
        createdOrder = supaNew;
      }
    } catch (supaErr: any) {
      console.warn('Supabase create order notice:', supaErr);
    }

    const finalOrder = createdOrder || {
      id: orderId,
      orderCode: orderCode,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      shippingAddress: fullAddress,
      deliveryType: deliveryType,
      totalAmount: resolvedNet,
      paymentMethod: paymentMethod === 'QR_BANK' ? 'QR_BANK' : 'COD',
      paymentStatus: 'PENDING',
      paymentDetails: {
        bankInfo: paymentMethod === 'QR_BANK' ? {
          bankName: 'Techcombank',
          bankCode: 'TCB',
          accountNumber: 'BAOLANN',
          accountHolder: 'DRX Hardware',
          transferContent: orderCode,
          amount: resolvedNet,
        } : null,
      },
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    };

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
        message: `Khách hàng ${customerName} vừa đặt đơn ${orderCode} (${resolvedNet.toLocaleString('vi-VN')} đ - COD).`,
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
        shippingAddress: finalOrder.shippingAddress,
        deliveryType: finalOrder.deliveryType,
        totalAmount: resolvedNet,
        paymentMethod: 'COD',
        status: 'PENDING',
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
