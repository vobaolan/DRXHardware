import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    let orders: any[] = [];

    // 1. Direct fetch from Supabase Cloud Database (Fast Direct REST)
    try {
      const { data: supaOrders, error: supaErr } = await supabase
        .from('Order')
        .select('*')
        .order('createdAt', { ascending: false });

      if (!supaErr && supaOrders && Array.isArray(supaOrders)) {
        orders = supaOrders;
      }
    } catch (e) {
      console.warn('Supabase get all orders warning:', e);
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

    const updatePayload: any = {
      ...(status ? { status } : {}),
      ...(paymentStatus ? { paymentStatus } : {}),
      ...(paymentDetails ? { paymentDetails } : {}),
      updatedAt: new Date().toISOString(),
    };

    const { data: updatedOrder, error: supaErr } = await supabase
      .from('Order')
      .update(updatePayload)
      .eq('id', orderId)
      .select('*')
      .single();

    if (supaErr || !updatedOrder) {
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

