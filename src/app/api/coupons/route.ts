import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

const DEFAULT_COUPONS: Record<string, any> = {
  DRXHARDWARE: {
    code: 'DRXHARDWARE',
    discountType: 'PERCENT',
    discountValue: 20,
    minOrderValue: 500000,
    maxDiscount: 2000000,
    expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
    maxUses: 999,
    usedCount: 14,
  },
  DRX500K: {
    code: 'DRX500K',
    discountType: 'FIXED',
    discountValue: 500000,
    minOrderValue: 10000000,
    maxDiscount: 500000,
    expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
    maxUses: 100,
    usedCount: 28,
  },
  DRX100K: {
    code: 'DRX100K',
    discountType: 'FIXED',
    discountValue: 100000,
    minOrderValue: 1000000,
    maxDiscount: 100000,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    maxUses: 500,
    usedCount: 42,
  },
  HE2026: {
    code: 'HE2026',
    discountType: 'PERCENT',
    discountValue: 15,
    minOrderValue: 2000000,
    maxDiscount: 1500000,
    expiresAt: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
    maxUses: 200,
    usedCount: 35,
  }
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { code, orderTotal = 0 } = body;

    if (!code?.trim()) {
      return NextResponse.json({ message: 'Vui lòng nhập mã giảm giá!' }, { status: 400 });
    }

    const cleanCode = code.trim().toUpperCase();
    let coupon: any = null;

    // 1. Prisma Check
    try {
      coupon = await prisma.coupon.findUnique({
        where: { code: cleanCode }
      });
    } catch (e) {
      console.warn('Prisma coupon validate warning:', e);
    }

    // 2. Supabase Check
    if (!coupon) {
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
    }

    // 3. Fallback to default seeded codes
    if (!coupon && DEFAULT_COUPONS[cleanCode]) {
      coupon = DEFAULT_COUPONS[cleanCode];
    }

    if (!coupon) {
      return NextResponse.json({ message: `Mã giảm giá "${cleanCode}" không tồn tại!` }, { status: 404 });
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
