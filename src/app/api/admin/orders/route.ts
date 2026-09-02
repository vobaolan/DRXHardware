import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const orders = await prisma.order.findMany({
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
              }
            }
          }
        },
        serials: true,
      },
    });

    return NextResponse.json({ orders }, { status: 200 });
  } catch (error: any) {
    console.error('Lỗi khi lấy lịch sử toàn bộ đơn hàng (Admin):', error);
    return NextResponse.json(
      { message: 'Lỗi máy chủ nội bộ. Vui lòng thử lại sau!', error: error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { orderId, status, paymentStatus } = body;

    if (!orderId) {
      return NextResponse.json({ message: 'Thiếu mã đơn hàng' }, { status: 400 });
    }

    const dataToUpdate: any = {};
    if (status) dataToUpdate.status = status;
    if (paymentStatus) dataToUpdate.paymentStatus = paymentStatus;

    const updatedOrder = await prisma.order.update({
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

    return NextResponse.json({ 
      success: true, 
      message: `Đã cập nhật đơn hàng sang trạng thái ${status || paymentStatus}`,
      order: updatedOrder 
    }, { status: 200 });
  } catch (error: any) {
    console.error('Lỗi update đơn hàng (Admin):', error);
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

    await prisma.order.delete({
      where: { id: orderId }
    });

    return NextResponse.json({ success: true, message: 'Đã xóa đơn hàng thành công' }, { status: 200 });
  } catch (error: any) {
    console.error('Lỗi xóa đơn hàng (Admin):', error);
    return NextResponse.json({ message: 'Lỗi xử lý xóa đơn', error: error.message }, { status: 500 });
  }
}
