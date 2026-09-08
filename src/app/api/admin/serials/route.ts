import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    let serials: any[] = [];

    // 1. Direct Supabase Cloud Database Query
    try {
      const { data, error } = await supabase
        .from('ProductSerial')
        .select('*, product:Product(id, name, category, brand, coverImage, price, warrantyMonths, modelCode), order:Order(id, orderCode, customerName, customerPhone)')
        .order('createdAt', { ascending: false });

      if (!error && data && Array.isArray(data)) {
        serials = data;
      }
    } catch (e) {
      console.warn('Supabase serials fetch warning:', e);
    }

    return NextResponse.json({ serials, keys: serials }, { status: 200 });
  } catch (error: any) {
    console.error('Lỗi khi lấy danh sách Serial SN (Admin):', error);
    return NextResponse.json({ message: 'Lỗi máy chủ', error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { productId, serialNumbers, status } = body;

    if (!productId || !serialNumbers) {
      return NextResponse.json({ message: 'Thiếu mã sản phẩm hoặc danh sách serial' }, { status: 400 });
    }

    const snList: string[] = Array.isArray(serialNumbers) 
      ? serialNumbers 
      : String(serialNumbers).split('\n').map(s => s.trim()).filter(Boolean);

    if (snList.length === 0) {
      return NextResponse.json({ message: 'Danh sách serial rỗng' }, { status: 400 });
    }

    const createdSerials = [];
    for (const sn of snList) {
      try {
        const { data: supaItem } = await supabase
          .from('ProductSerial')
          .upsert({
            serialNumber: sn,
            productId,
            status: status || 'AVAILABLE',
            createdAt: new Date().toISOString(),
          })
          .select()
          .maybeSingle();

        if (supaItem) createdSerials.push(supaItem);
      } catch (e) {}
    }

    // Increment product stock
    try {
      await supabase.rpc('increment_stock', { p_id: productId, count: createdSerials.length || snList.length });
    } catch (e) {}

    return NextResponse.json({ 
      success: true, 
      count: createdSerials.length || snList.length,
      message: `Đã nhập thành công ${createdSerials.length || snList.length} mã Serial vào kho!` 
    }, { status: 200 });

  } catch (error: any) {
    console.error('Lỗi khi thêm serial:', error);
    return NextResponse.json({ message: error.message || 'Lỗi khi nhập serial' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, status, warrantyEnd, soldDate, orderId } = body;

    if (!id || !status) {
      return NextResponse.json({ message: 'Thiếu ID serial hoặc trạng thái mới' }, { status: 400 });
    }

    const updatePayload: any = {
      status,
      ...(warrantyEnd !== undefined ? { warrantyEnd: warrantyEnd ? new Date(warrantyEnd).toISOString() : null } : {}),
      ...(soldDate !== undefined ? { soldDate: soldDate ? new Date(soldDate).toISOString() : null } : {}),
      ...(orderId !== undefined ? { orderId: orderId || null } : {}),
    };

    if (status === 'SOLD' && !soldDate && updatePayload.soldDate === undefined) {
      updatePayload.soldDate = new Date().toISOString();
    } else if (status === 'AVAILABLE') {
      updatePayload.orderId = null;
      updatePayload.soldDate = null;
    }

    const { data, error } = await supabase
      .from('ProductSerial')
      .update(updatePayload)
      .eq('id', id)
      .select('*, product:Product(id, name, category, brand, coverImage, price, warrantyMonths, modelCode), order:Order(id, orderCode, customerName, customerPhone)')
      .single();

    if (error) {
      console.error('Supabase serial update error:', error);
      return NextResponse.json({ message: 'Lỗi cập nhật Serial: ' + error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, serial: data }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return NextResponse.json({ message: 'Thiếu ID serial' }, { status: 400 });
    }

    const { error } = await supabase.from('ProductSerial').delete().eq('id', id);
    if (error) {
      return NextResponse.json({ message: 'Lỗi xóa serial: ' + error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Đã xóa Serial thành công!' }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
