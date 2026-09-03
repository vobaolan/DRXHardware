import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { code, orderTotal = 0 } = body;

    if (!code?.trim()) {
      return NextResponse.json({ message: 'Vui lòng nhập mã giảm giá!' }, { status: 400 });
    }

    const cleanCode = code.trim().toUpperCase();
    let coupon: any = null;

    // Supabase Check (Fast Direct REST)
    try {
      const { data, error } = await supabase
        .from('Coupon')
        .select('*')
        .eq('code', cleanCode)
        .single();

      if (!error && data) coupon = data;
    } catch (e) {
      console.warn('Supabase coupon validate warning:', e);
    }

    if (!coupon) {
      return NextResponse.json({ message: `Mã giảm giá "${cleanCode}" không tồn tại.` }, { status: 404 });
    }

    // Validate Status (Active vs Inactive)
    if (coupon.status === 'INACTIVE' || coupon.status === 'DISABLED' || coupon.status === false) {
      return NextResponse.json({ message: `Mã giảm giá "${cleanCode}" hiện đang tạm ngưng hoạt động!` }, { status: 400 });
    }

    // Validate Expiry Date
    const now = new Date();
    const expiry = new Date(coupon.expiresAt);
    if (now > expiry) {
      return NextResponse.json({ message: `Mã giảm giá "${cleanCode}" đã hết hạn sử dụng!` }, { status: 400 });
    }

    // Validate Max Uses
    if (coupon.maxUses && Number(coupon.usedCount || 0) >= Number(coupon.maxUses)) {
      return NextResponse.json({ message: `Mã giảm giá "${cleanCode}" đã hết số lượt sử dụng!` }, { status: 400 });
    }

    // Validate Min Order Value
    const numTotal = Number(orderTotal || 0);
    const minVal = Number(coupon.minOrderValue || 0);
    if (minVal > 0 && numTotal > 0 && numTotal < minVal) {
      return NextResponse.json({ 
        message: `Mã "${cleanCode}" chỉ áp dụng cho đơn hàng từ ${minVal.toLocaleString('vi-VN')} đ trở lên!` 
      }, { status: 400 });
    }

    // Calculate Discount Amount
    let discountAmount = 0;
    const val = Number(coupon.discountValue || 0);
    if (coupon.discountType === 'PERCENT') {
      discountAmount = (numTotal * val) / 100;
      if (coupon.maxDiscount && discountAmount > Number(coupon.maxDiscount)) {
        discountAmount = Number(coupon.maxDiscount);
      }
    } else {
      discountAmount = Math.min(val, numTotal || val);
    }

    return NextResponse.json({
      valid: true,
      message: `Áp dụng mã giảm giá ${cleanCode} thành công!`,
      coupon: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: Number(coupon.discountValue),
        minOrderValue: Number(coupon.minOrderValue || 0),
        maxDiscount: coupon.maxDiscount ? Number(coupon.maxDiscount) : null,
        calculatedDiscount: discountAmount,
      }
    }, { status: 200 });
  } catch (error: any) {
    console.error('Lỗi khi kiểm tra mã giảm giá:', error);
    return NextResponse.json({ message: 'Lỗi khi xác thực mã giảm giá.' }, { status: 500 });
  }
}
