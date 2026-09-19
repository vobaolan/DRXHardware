import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export async function GET(request: Request) {
  try {
    let orders: any[] = [];

    // 1. Direct fetch from Supabase Cloud Database (Fast Direct REST)
    try {
      const { data: supaOrders, error: supaErr } = await supabase
        .from('Order')
        .select('*, orderItems:OrderItem(*, product:Product(*))')
        .order('createdAt', { ascending: false });

      if (!supaErr && supaOrders && Array.isArray(supaOrders)) {
        orders = supaOrders;
      } else {
        // Fallback without relation if relation failed
        const { data: simpleOrders, error: simpleErr } = await supabase
          .from('Order')
          .select('*')
          .order('createdAt', { ascending: false });
        if (!simpleErr && simpleOrders && Array.isArray(simpleOrders)) {
          orders = simpleOrders;
        } else {
          if (supaErr) console.warn('Supabase get all orders warning, trying Prisma fallback:', supaErr);
          const { PrismaClient } = await import('@prisma/client');
          const prisma = new PrismaClient();
          try {
            orders = await prisma.order.findMany({
              include: {
                orderItems: {
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
      console.warn('Supabase get all orders warning, trying Prisma fallback:', e);
      try {
        const { PrismaClient } = await import('@prisma/client');
        const prisma = new PrismaClient();
        try {
          orders = await prisma.order.findMany({
            include: {
              orderItems: {
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
    console.error('Lỗi khi lấy lịch sử toàn bộ đơn hàng (Admin/Staff):', error);
    return NextResponse.json(
      { message: 'Lỗi máy chủ nội bộ. Vui lòng thử lại sau!', error: error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { orderId, status, paymentStatus, paymentDetails } = body;

    if (!orderId) {
      return NextResponse.json({ message: 'Thiếu mã đơn hàng' }, { status: 400 });
    }

    // Validate & sanitize paymentStatus for PostgreSQL enum (PENDING | PAID | FAILED | REFUNDED)
    let sanitizedPaymentStatus = paymentStatus;
    if (sanitizedPaymentStatus) {
      const upperPay = String(sanitizedPaymentStatus).toUpperCase();
      if (upperPay === 'CANCELLED') {
        sanitizedPaymentStatus = 'FAILED';
      } else if (!['PENDING', 'PAID', 'FAILED', 'REFUNDED'].includes(upperPay)) {
        sanitizedPaymentStatus = undefined;
      }
    } else if (status === 'COMPLETED') {
      sanitizedPaymentStatus = 'PAID';
    }

    const { paymentMethod } = body;
    const updatePayload: any = {
      ...(status ? { status } : {}),
      ...(sanitizedPaymentStatus ? { paymentStatus: sanitizedPaymentStatus } : {}),
      ...(paymentMethod ? { paymentMethod } : {}),
      ...(paymentDetails ? { paymentDetails } : {}),
      updatedAt: new Date().toISOString(),
    };

    // 1. Locate target order by ID or orderCode
    let targetOrderId = orderId;
    const { data: directMatch } = await supabase
      .from('Order')
      .select('id')
      .eq('id', orderId)
      .maybeSingle();

    if (directMatch) {
      targetOrderId = directMatch.id;
    } else {
      const cleanCode = String(orderId).replace(/^#/, '').trim();
      const strippedCode = cleanCode.replace(/-/g, '');
      const digitsOnly = cleanCode.replace(/\D/g, '');

      let query = supabase.from('Order').select('id');
      if (cleanCode) {
        query = query.or(`orderCode.eq.${cleanCode},orderCode.eq.${strippedCode}${digitsOnly ? `,orderCode.ilike.%${digitsOnly}%` : ''},id.ilike.%${cleanCode}%`);
      }

      const { data: altMatch } = await query.limit(1).maybeSingle();

      if (altMatch) {
        targetOrderId = altMatch.id;
      } else {
        return NextResponse.json({ message: 'Không tìm thấy đơn hàng để cập nhật' }, { status: 404 });
      }
    }

    const { data: updatedOrder, error: supaErr } = await supabase
      .from('Order')
      .update(updatePayload)
      .eq('id', targetOrderId)
      .select('*')
      .single();

    if (supaErr) {
      console.error('Lỗi Supabase khi cập nhật đơn hàng:', supaErr);
      return NextResponse.json({ message: 'Lỗi cập nhật đơn hàng: ' + (supaErr.message || 'Lỗi dữ liệu') }, { status: 500 });
    }

    if (!updatedOrder) {
      return NextResponse.json({ message: 'Không tìm thấy đơn hàng để cập nhật' }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      message: `Đã cập nhật đơn hàng #${updatedOrder.orderCode || updatedOrder.id} thành công`,
      order: updatedOrder 
    }, { status: 200 });
  } catch (error: any) {
    console.error('Lỗi update đơn hàng (Admin/Staff):', error);
    return NextResponse.json(
      { message: error.message || 'Lỗi xử lý cập nhật đơn hàng' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url);
    const orderId = url.searchParams.get('id');

    if (!orderId) {
      return NextResponse.json({ message: 'Thiếu ID đơn hàng' }, { status: 400 });
    }

    // Clean up order items and delete order
    try {
      await supabase.from('OrderItem').delete().eq('orderId', orderId);
    } catch (e) {}

    const { error } = await supabase.from('Order').delete().eq('id', orderId);
    if (error) {
      return NextResponse.json({ message: 'Lỗi khi xóa đơn hàng: ' + error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Đã xóa đơn hàng thành công' }, { status: 200 });
  } catch (error: any) {
    console.error('Lỗi xóa đơn hàng (Admin):', error);
    return NextResponse.json({ message: 'Lỗi xử lý xóa đơn', error: error.message }, { status: 500 });
  }
}

