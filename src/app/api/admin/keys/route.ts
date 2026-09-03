import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    let serials: any[] = [];

    // 1. Primary: Supabase
    try {
      const { data, error } = await supabase
        .from('ProductSerial')
        .select('*, product:Product(id, name, category, brand, coverImage, price, warrantyMonths), order:Order(id, orderCode, customerName, customerPhone)')
        .order('createdAt', { ascending: false });

      if (!error && data) {
        serials = data;
      }
    } catch (e) {}

    // 2. Fallback to Prisma
    if (serials.length === 0) {
      try {
        serials = await prisma.productSerial.findMany({
          orderBy: { createdAt: 'desc' },
          include: {
            product: {
              select: {
                id: true,
                name: true,
                category: true,
                brand: true,
                coverImage: true,
                price: true,
                warrantyMonths: true,
              }
            },
            order: {
              select: {
                id: true,
                orderCode: true,
                customerName: true,
                customerPhone: true,
              }
            }
          }
        });
      } catch (e) {}
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
      // 1. Upsert to Supabase
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

      // 2. Sync to Prisma
      try {
        const item = await prisma.productSerial.upsert({
          where: { serialNumber: sn },
          update: {
            productId,
            status: status || 'AVAILABLE',
          },
          create: {
            productId,
            serialNumber: sn,
            status: status || 'AVAILABLE',
          }
        });
        if (createdSerials.length === 0) createdSerials.push(item);
      } catch (e) {}
    }

    // Increment product stock
    try {
      await supabase.rpc('increment_stock', { p_id: productId, count: createdSerials.length || snList.length });
    } catch (e) {}
    try {
      await prisma.product.update({
        where: { id: productId },
        data: { stockQuantity: { increment: createdSerials.length || snList.length } }
      });
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
    const { id, status, warrantyEnd, soldDate } = body;

    if (!id || !status) {
      return NextResponse.json({ message: 'Thiếu ID serial hoặc trạng thái mới' }, { status: 400 });
    }

    const updatePayload: any = {
      status,
      ...(warrantyEnd ? { warrantyEnd: new Date(warrantyEnd).toISOString() } : {}),
      ...(soldDate ? { soldDate: new Date(soldDate).toISOString() } : {}),
    };

    let updated: any = null;

    try {
      const { data } = await supabase
        .from('ProductSerial')
        .update(updatePayload)
        .eq('id', id)
        .select()
        .single();
      if (data) updated = data;
    } catch (e) {}

    try {
      const pUpdated = await prisma.productSerial.update({
        where: { id },
        data: {
          status,
          ...(warrantyEnd ? { warrantyEnd: new Date(warrantyEnd) } : {}),
          ...(soldDate ? { soldDate: new Date(soldDate) } : {}),
        }
      });
      if (!updated) updated = pUpdated;
    } catch (e) {}

    return NextResponse.json({ success: true, serial: updated }, { status: 200 });
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

    try {
      await supabase.from('ProductSerial').delete().eq('id', id);
    } catch (e) {}

    try {
      await prisma.productSerial.delete({
        where: { id }
      });
    } catch (e) {}

    return NextResponse.json({ success: true, message: 'Đã xóa Serial' }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
