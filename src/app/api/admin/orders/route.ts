import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export async function GET(request: Request) {
  try {
    let orders: any[] = [];
    let foundInDb = false;

    // 1. Primary Authority: Direct pooled PostgreSQL connection via Prisma ORM (Ultra-Fast)
    try {
      orders = await prisma.order.findMany({
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
      console.warn('Prisma get all orders warning, trying Supabase fallback:', prismaErr);
    }

    // 2. Secondary Fallback: Supabase Cloud Database REST API
    if (!foundInDb) {
      try {
        const { data: supaOrders, error: supaErr } = await supabase
          .from('Order')
          .select('*, orderItems:OrderItem(*, product:Product(*))')
          .order('createdAt', { ascending: false });

        if (!supaErr && supaOrders && Array.isArray(supaOrders)) {
          orders = supaOrders;
        } else {
          const { data: simpleOrders, error: simpleErr } = await supabase
            .from('Order')
            .select('*')
            .order('createdAt', { ascending: false });
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
    const { orderId, status, paymentStatus, paymentDetails, paymentMethod } = body;

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

    // Parse paymentDetails if passed as JSON string
    let parsedPaymentDetails = paymentDetails;
    if (typeof paymentDetails === 'string') {
      try {
        parsedPaymentDetails = JSON.parse(paymentDetails);
      } catch {
        parsedPaymentDetails = paymentDetails;
      }
    }

    const updatePayload: any = {
      ...(status ? { status } : {}),
      ...(sanitizedPaymentStatus ? { paymentStatus: sanitizedPaymentStatus } : {}),
      ...(paymentMethod ? { paymentMethod } : {}),
      ...(parsedPaymentDetails !== undefined ? { paymentDetails: parsedPaymentDetails } : {}),
      updatedAt: new Date(),
    };

    let updatedOrder: any = null;

    // 1. Primary Authority: Direct update via Prisma ORM
    try {
      const cleanCode = String(orderId).replace(/^[#]/, '').trim();
      const existing = await prisma.order.findFirst({
        where: {
          OR: [
            { id: orderId },
            { orderCode: cleanCode },
            { orderCode: { contains: cleanCode, mode: 'insensitive' } },
            { id: { contains: cleanCode, mode: 'insensitive' } },
          ],
        },
      });

      if (existing) {
        updatedOrder = await prisma.order.update({
          where: { id: existing.id },
          data: updatePayload,
          include: {
            orderItems: {
              include: {
                product: true,
              },
            },
          },
        });
      }
    } catch (prismaErr) {
      console.warn('Prisma update order warning, trying Supabase:', prismaErr);
    }

    // 2. Secondary Fallback / Background Sync to Supabase
    if (!updatedOrder) {
      try {
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
          const { data: altMatch } = await supabase
            .from('Order')
            .select('id')
            .or(`orderCode.eq.${cleanCode},id.ilike.%${cleanCode}%`)
            .limit(1)
            .maybeSingle();

          if (altMatch) {
            targetOrderId = altMatch.id;
          }
        }

        const { data: supaUpdated, error: supaErr } = await supabase
          .from('Order')
          .update({
            ...updatePayload,
            updatedAt: new Date().toISOString(),
          })
          .eq('id', targetOrderId)
          .select('*')
          .single();

        if (!supaErr && supaUpdated) {
          updatedOrder = supaUpdated;
        }
      } catch (supaErr) {
        console.error('Supabase update order error:', supaErr);
      }
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

    // 1. Primary Authority: Direct delete via Prisma ORM
    let deleted = false;
    try {
      await prisma.orderItem.deleteMany({ where: { orderId } });
      await prisma.order.delete({ where: { id: orderId } });
      deleted = true;
    } catch (prismaErr) {
      console.warn('Prisma delete order warning, trying Supabase:', prismaErr);
    }

    // 2. Secondary fallback via Supabase
    if (!deleted) {
      try {
        await supabase.from('OrderItem').delete().eq('orderId', orderId);
        const { error } = await supabase.from('Order').delete().eq('id', orderId);
        if (error) {
          return NextResponse.json({ message: 'Lỗi khi xóa đơn hàng: ' + error.message }, { status: 500 });
        }
      } catch (e: any) {
        return NextResponse.json({ message: 'Lỗi khi xóa đơn hàng: ' + e.message }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true, message: 'Đã xóa đơn hàng thành công' }, { status: 200 });
  } catch (error: any) {
    console.error('Lỗi xóa đơn hàng (Admin):', error);
    return NextResponse.json({ message: 'Lỗi xử lý xóa đơn', error: error.message }, { status: 500 });
  }
}
