import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { productId, keys, rawText } = body;

    if (!productId) {
      return NextResponse.json({ error: 'Missing productId parameter' }, { status: 400 });
    }

    // 1. Kiểm tra sản phẩm tồn tại trong Supabase
    const { data: product } = await supabase
      .from('Product')
      .select('id, name')
      .eq('id', productId)
      .maybeSingle();

    if (!product) {
      return NextResponse.json({ error: 'Không tìm thấy linh kiện / sản phẩm' }, { status: 404 });
    }

    // 2. Phân tích danh sách serial/key cần import
    let keysList: string[] = [];

    if (Array.isArray(keys)) {
      keysList = keys.map((k) => String(k).trim()).filter(Boolean);
    } else if (typeof rawText === 'string') {
      keysList = rawText
        .split(/\r?\n/)
        .map((k) => k.trim())
        .filter(Boolean);
    }

    if (keysList.length === 0) {
      return NextResponse.json({ error: 'Không tìm thấy danh sách mã serial hợp lệ' }, { status: 400 });
    }

    // 3. Thực hiện insert hàng loạt vào ProductSerial
    const keysData = keysList.map((code) => ({
      productId: productId,
      serialNumber: code,
      status: 'AVAILABLE',
      createdAt: new Date().toISOString(),
    }));

    const { data: inserted, error } = await supabase
      .from('ProductSerial')
      .upsert(keysData)
      .select('id');

    const count = inserted?.length || keysList.length;

    // Increment stock
    try {
      await supabase.rpc('increment_stock', { p_id: productId, count });
    } catch (e) {}

    return NextResponse.json({
      success: true,
      message: `Đã nhập thành công ${count} mã serial vào sản phẩm "${product.name}".`,
      count,
    });
  } catch (error: any) {
    console.error('Bulk key import error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
