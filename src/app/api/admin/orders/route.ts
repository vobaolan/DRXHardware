import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    let orders: any[] = [];

    // 1. Primary: Supabase Cloud Database (Fast Direct REST)
    try {
      const { data: supaOrders, error: supaErr } = await supabase
        .from('Order')
        .select('*')
        .order('createdAt', { ascending: false });

      if (!supaErr && supaOrders && supaOrders.length > 0) {
        orders = supaOrders;
      }
    } catch (e) {
      console.warn('Supabase get all orders warning:', e);
    }

    // 2. Enrich/Merge with Prisma if available
    try {
      const prismaOrders = await prisma.order.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            }
          },
          orderItems: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  price: true,
                  coverImage: true,
                  category: true,
                  brand: true,
                  warrantyMonths: true,
                }
              }
            }
          },
          serials: true,
        },
      });

      if (prismaOrders && prismaOrders.length > 0) {
        if (orders.length === 0) {
          orders = prismaOrders;
        } else {
          const existingIds = new Set(orders.map(o => o.id));
          for (const po of prismaOrders) {
            if (!existingIds.has(po.id)) {
              orders.push(po);
            }
          }
        }
      }
    } catch (e) {
      console.warn('Prisma get all orders notice:', e);
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

    const dataToUpdate: any = {};
    if (status) dataToUpdate.status = status;
    if (paymentStatus) dataToUpdate.paymentStatus = paymentStatus;
    if (paymentDetails) dataToUpdate.paymentDetails = paymentDetails;

    let updatedOrder: any = null;

    // 1. Try Prisma
    try {
      updatedOrder = await prisma.order.update({
        where: { id: orderId },
        data: dataToUpdate,
        include: {
          orderItems: {
            include: { product: true }
          },
          serials: true,
          user: true,
        }
      });
    } catch (e) {
      console.warn('Prisma update order warning:', e);
    }

    // 2. Update Supabase
    try {
      const { data: supaUpdated, error: supaErr } = await supabase
        .from('Order')
        .update({
          ...(status ? { status } : {}),
          ...(paymentStatus ? { paymentStatus } : {}),
          ...(paymentDetails ? { paymentDetails } : {}),
          updatedAt: new Date().toISOString(),
        })
        .eq('id', orderId)
        .select('*')
        .single();

      if (!supaErr && supaUpdated) {
        if (!updatedOrder) {
          updatedOrder = supaUpdated;
        }
      }
    } catch (e) {
      console.warn('Supabase update order warning:', e);
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

    try {
      await prisma.order.delete({
        where: { id: orderId }
      });
    } catch (e) {}

    try {
      await supabase.from('Order').delete().eq('id', orderId);
    } catch (e) {}

    return NextResponse.json({ success: true, message: 'Đã xóa đơn hàng thành công' }, { status: 200 });
  } catch (error: any) {
    console.error('Lỗi xóa đơn hàng (Admin):', error);
    return NextResponse.json({ message: 'Lỗi xử lý xóa đơn', error: error.message }, { status: 500 });
  }
}

