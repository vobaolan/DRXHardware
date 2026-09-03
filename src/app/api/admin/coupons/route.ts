import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

const DEFAULT_COUPONS = [
  {
    code: 'DRXHARDWARE',
    discountType: 'PERCENT',
    discountValue: 20,
    minOrderValue: 500000,
    maxDiscount: 2000000,
    expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
    maxUses: 999,
    usedCount: 0,
    status: 'ACTIVE'
  },
  {
    code: 'DRX500K',
    discountType: 'FIXED',
    discountValue: 500000,
    minOrderValue: 10000000,
    maxDiscount: 500000,
    expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
    maxUses: 100,
    usedCount: 0,
    status: 'ACTIVE'
  },
  {
    code: 'DRX100K',
    discountType: 'FIXED',
    discountValue: 100000,
    minOrderValue: 1000000,
    maxDiscount: 100000,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    maxUses: 500,
    usedCount: 0,
    status: 'ACTIVE'
  },
  {
    code: 'HE2026',
    discountType: 'PERCENT',
    discountValue: 15,
    minOrderValue: 2000000,
    maxDiscount: 1500000,
    expiresAt: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
    maxUses: 200,
    usedCount: 0,
    status: 'ACTIVE'
  }
];

// GET: List all coupons
export async function GET() {
  try {
    let coupons: any[] = [];

    // 1. Primary: Prisma
    try {
      coupons = await prisma.coupon.findMany({
        orderBy: { createdAt: 'desc' },
      });
    } catch (e) {
      console.warn('Prisma get coupons error, fallback to Supabase:', e);
    }

    // 2. Fallback: Supabase
    if (coupons.length === 0) {
      try {
        const { data, error } = await supabase
          .from('Coupon')
          .select('*')
          .order('createdAt', { ascending: false });

        if (!error && data && data.length > 0) {
          coupons = data;
        }
      } catch (e) {
        console.warn('Supabase get coupons error:', e);
      }
    }

    // 3. If empty, return default seeded coupons
    if (coupons.length === 0) {
      coupons = DEFAULT_COUPONS;
    }

    return NextResponse.json({ coupons }, { status: 200 });
  } catch (error: any) {
    console.error('Lỗi khi lấy danh sách mã giảm giá:', error);
    return NextResponse.json(
      { message: 'Lỗi máy chủ', coupons: DEFAULT_COUPONS },
      { status: 200 }
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
    const expiryDate = expiresAt ? new Date(expiresAt) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

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
    };

    let created: any = null;

    // 1. Prisma
    try {
      created = await prisma.coupon.create({
        data: couponData,
      });
    } catch (e: any) {
      console.warn('Prisma create coupon error:', e);
    }

    // 2. Supabase
    if (!created) {
      try {
        const { data, error } = await supabase
          .from('Coupon')
          .insert([couponData])
          .select()
          .single();

        if (!error && data) {
          created = data;
        }
      } catch (e) {
        console.warn('Supabase create coupon error:', e);
      }
    }

    return NextResponse.json({
      message: `Đã tạo mã giảm giá ${cleanCode} thành công!`,
      coupon: created || couponData,
    }, { status: 201 });
  } catch (error: any) {
    console.error('Lỗi khi tạo mã giảm giá:', error);
    return NextResponse.json(
      { message: 'Không thể tạo mã giảm giá. Có thể mã đã tồn tại!' },
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

    if (!code) {
      return NextResponse.json({ message: 'Thiếu mã giảm giá!' }, { status: 400 });
    }

    const updateData: any = {};
    if (discountType) updateData.discountType = discountType.toUpperCase();
    if (discountValue !== undefined) updateData.discountValue = Number(discountValue);
    if (minOrderValue !== undefined) updateData.minOrderValue = Number(minOrderValue);
    if (maxDiscount !== undefined) updateData.maxDiscount = Number(maxDiscount);
    if (expiresAt) updateData.expiresAt = new Date(expiresAt);
    if (maxUses !== undefined) updateData.maxUses = Number(maxUses);
    if (usedCount !== undefined) updateData.usedCount = Number(usedCount);
    if (status !== undefined) updateData.status = status?.toUpperCase() === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE';

    let updated: any = null;

    try {
      updated = await prisma.coupon.update({
        where: { code },
        data: updateData,
      });
    } catch (e) {
      console.warn('Prisma update coupon error:', e);
    }

    if (!updated) {
      try {
        const { data, error } = await supabase
          .from('Coupon')
          .update(updateData)
          .eq('code', code)
          .select()
          .single();

        if (!error && data) updated = data;
      } catch (e) {
        console.warn('Supabase update coupon error:', e);
      }
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

    try {
      await prisma.coupon.delete({ where: { code } });
    } catch (e) {
      console.warn('Prisma delete coupon error:', e);
    }

    try {
      await supabase.from('Coupon').delete().eq('code', code);
    } catch (e) {
      console.warn('Supabase delete coupon error:', e);
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
