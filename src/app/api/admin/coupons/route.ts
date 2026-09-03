import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

// GET: List all coupons
export async function GET() {
  try {
    let coupons: any[] = [];

    // Direct fetch from Supabase Cloud Database (Fast Direct REST)
    try {
      const { data, error } = await supabase
        .from('Coupon')
        .select('*')
        .order('createdAt', { ascending: false });

      if (!error && data && Array.isArray(data)) {
        coupons = data;
      }
    } catch (e) {
      console.warn('Supabase get coupons warning:', e);
    }

    return NextResponse.json({ coupons }, { status: 200 });
  } catch (error: any) {
    console.error('Lỗi khi lấy danh sách mã giảm giá:', error);
    return NextResponse.json(
      { message: 'Lỗi máy chủ', coupons: [] },
      { status: 500 }
    );
  }
}

// POST: Create a new coupon
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      code, 
      discountType = 'PERCENT', 
      discountValue, 
      minOrderValue = 0, 
      maxDiscount, 
      expiresAt, 
      maxUses = 100,
      status = 'ACTIVE'
    } = body;

    if (!code?.trim()) {
      return NextResponse.json({ message: 'Vui lòng nhập mã giảm giá!' }, { status: 400 });
    }

    if (!discountValue || Number(discountValue) <= 0) {
      return NextResponse.json({ message: 'Giá trị giảm giá phải lớn hơn 0!' }, { status: 400 });
    }

    const cleanCode = code.trim().toUpperCase();
    const expiryDate = expiresAt ? new Date(expiresAt).toISOString() : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    const couponData = {
      code: cleanCode,
      discountType: discountType.toUpperCase(),
      discountValue: Number(discountValue),
      minOrderValue: Number(minOrderValue || 0),
      maxDiscount: maxDiscount ? Number(maxDiscount) : null,
      expiresAt: expiryDate,
      maxUses: Number(maxUses || 100),
      usedCount: 0,
      status: status?.toUpperCase() === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE',
      createdAt: new Date().toISOString(),
    };

    const { data: created, error } = await supabase
      .from('Coupon')
      .insert([couponData])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ message: 'Lỗi lưu mã giảm giá: ' + error.message }, { status: 400 });
    }

    return NextResponse.json({
      message: `Tạo mã giảm giá ${cleanCode} thành công!`,
      coupon: created || couponData,
    }, { status: 201 });
  } catch (error: any) {
    console.error('Lỗi khi tạo mã giảm giá:', error);
    return NextResponse.json(
      { message: 'Không thể tạo mã giảm giá. Vui lòng thử lại!' },
      { status: 500 }
    );
  }
}

// PUT / PATCH: Update coupon
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { 
      code, 
      discountType, 
      discountValue, 
      minOrderValue, 
      maxDiscount, 
      expiresAt, 
      maxUses,
      usedCount,
      status 
    } = body;

    if (!code?.trim()) {
      return NextResponse.json({ message: 'Thiếu mã giảm giá cần cập nhật!' }, { status: 400 });
    }

    const updateData: any = { updatedAt: new Date().toISOString() };
    if (discountType) updateData.discountType = discountType.toUpperCase();
    if (discountValue !== undefined) updateData.discountValue = Number(discountValue);
    if (minOrderValue !== undefined) updateData.minOrderValue = Number(minOrderValue);
    if (maxDiscount !== undefined) updateData.maxDiscount = maxDiscount ? Number(maxDiscount) : null;
    if (expiresAt) updateData.expiresAt = new Date(expiresAt).toISOString();
    if (maxUses !== undefined) updateData.maxUses = Number(maxUses);
    if (usedCount !== undefined) updateData.usedCount = Number(usedCount);
    if (status !== undefined) updateData.status = status?.toUpperCase() === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE';

    const { data: updated, error } = await supabase
      .from('Coupon')
      .update(updateData)
      .eq('code', code)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ message: 'Lỗi cập nhật mã giảm giá: ' + error.message }, { status: 400 });
    }

    return NextResponse.json({
      message: `Đã cập nhật mã giảm giá ${code}!`,
      coupon: updated || { code, ...updateData },
    }, { status: 200 });
  } catch (error: any) {
    console.error('Lỗi khi cập nhật mã giảm giá:', error);
    return NextResponse.json(
      { message: 'Không thể cập nhật mã giảm giá.' },
      { status: 500 }
    );
  }
}

export const PATCH = PUT;

// DELETE: Delete coupon
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    if (!code) {
      return NextResponse.json({ message: 'Thiếu mã giảm giá cần xóa!' }, { status: 400 });
    }

    const { error } = await supabase.from('Coupon').delete().eq('code', code);
    if (error) {
      return NextResponse.json({ message: 'Lỗi khi xóa mã: ' + error.message }, { status: 400 });
    }

    return NextResponse.json({
      message: `Đã xóa mã giảm giá ${code} thành công!`,
    }, { status: 200 });
  } catch (error: any) {
    console.error('Lỗi khi xóa mã giảm giá:', error);
    return NextResponse.json(
      { message: 'Không thể xóa mã giảm giá.' },
      { status: 500 }
    );
  }
}
