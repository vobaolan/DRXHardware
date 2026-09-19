import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

// GET: List all coupons with real-time usage synchronization from orders
export async function GET() {
  try {
    let coupons: any[] = [];

    // 1. Direct fetch from Supabase Cloud Database (Fast Direct REST)
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

    // Fallback to Prisma if Supabase returned empty
    if (coupons.length === 0) {
      try {
        const prismaCoupons = await prisma.coupon.findMany({
          orderBy: { createdAt: 'desc' },
        });
        if (prismaCoupons && prismaCoupons.length > 0) {
          coupons = prismaCoupons.map((c: any) => ({
            ...c,
            discountValue: Number(c.discountValue),
            minOrderValue: c.minOrderValue ? Number(c.minOrderValue) : null,
            maxDiscount: c.maxDiscount ? Number(c.maxDiscount) : null,
          }));
        }
      } catch (pErr) {
        console.warn('Prisma get coupons fallback warning:', pErr);
      }
    }

    // 2. Query all actual orders to cross-calculate exact real-time coupon usages
    const orderUsageMap: Record<string, number> = {};
    try {
      // Check Supabase orders
      const { data: supaOrders } = await supabase
        .from('Order')
        .select('couponCode, paymentDetails, discountAmount');

      if (supaOrders && Array.isArray(supaOrders)) {
        supaOrders.forEach((ord: any) => {
          let code = ord.couponCode;
          if (!code && ord.paymentDetails) {
            const details = typeof ord.paymentDetails === 'string'
              ? (() => { try { return JSON.parse(ord.paymentDetails); } catch { return null; } })()
              : ord.paymentDetails;
            code = details?.couponCode;
          }
          if (code && typeof code === 'string' && code.trim()) {
            const clean = code.trim().toUpperCase();
            orderUsageMap[clean] = (orderUsageMap[clean] || 0) + 1;
          }
        });
      }
    } catch (ordErr) {
      console.warn('Coupon real-time usage check warning:', ordErr);
    }

    // 3. Normalize coupons, compute status and update synced counts
    const normalizedCoupons = await Promise.all(
      coupons.map(async (c) => {
        const upperCode = String(c.code).trim().toUpperCase();
        const realOrderCount = orderUsageMap[upperCode] || 0;
        const currentCount = Number(c.usedCount || 0);
        const effectiveUsedCount = Math.max(currentCount, realOrderCount);

        // Auto background fix in Supabase if count was out of sync
        if (effectiveUsedCount > currentCount) {
          try {
            await supabase
              .from('Coupon')
              .update({ usedCount: effectiveUsedCount })
              .eq('code', c.code);
          } catch (syncErr) {}
        }

        const isExplicitlyDisabled = new Date(c.expiresAt).getFullYear() <= 1970;
        const isExpired = new Date(c.expiresAt).getTime() <= Date.now();
        const isDepleted = effectiveUsedCount >= Number(c.maxUses || 0);

        return {
          ...c,
          usedCount: effectiveUsedCount,
          status: isExplicitlyDisabled ? 'INACTIVE' : (isExpired || isDepleted) ? 'INACTIVE' : 'ACTIVE',
        };
      })
    );

    return NextResponse.json({ coupons: normalizedCoupons }, { status: 200 });
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
    let expiryDate = expiresAt 
      ? new Date(expiresAt).toISOString() 
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    // If marked inactive, set past timestamp (1970) to deactivate
    if (status?.toUpperCase() === 'INACTIVE') {
      expiryDate = new Date(0).toISOString();
    }

    const couponData = {
      id: cleanCode,
      code: cleanCode,
      discountType: discountType.toUpperCase(),
      discountValue: Number(discountValue),
      minOrderValue: Number(minOrderValue || 0),
      maxDiscount: maxDiscount ? Number(maxDiscount) : null,
      expiresAt: expiryDate,
      maxUses: Number(maxUses || 100),
      usedCount: 0,
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

    // Also sync to Prisma PostgreSQL
    try {
      await prisma.coupon.upsert({
        where: { code: cleanCode },
        create: {
          code: cleanCode,
          discountType: couponData.discountType,
          discountValue: couponData.discountValue,
          minOrderValue: couponData.minOrderValue,
          maxDiscount: couponData.maxDiscount,
          expiresAt: new Date(couponData.expiresAt),
          maxUses: couponData.maxUses,
          usedCount: 0,
        },
        update: {
          discountType: couponData.discountType,
          discountValue: couponData.discountValue,
          minOrderValue: couponData.minOrderValue,
          maxDiscount: couponData.maxDiscount,
          expiresAt: new Date(couponData.expiresAt),
          maxUses: couponData.maxUses,
        }
      });
    } catch (pErr) {
      console.warn('Prisma coupon create sync warning:', pErr);
    }

    return NextResponse.json({
      message: `Tạo mã giảm giá ${cleanCode} thành công!`,
      coupon: {
        ...(created || couponData),
        status: status?.toUpperCase() === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE',
      },
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

    const cleanCode = code.trim().toUpperCase();
    const updateData: any = {};
    if (discountType) updateData.discountType = discountType.toUpperCase();
    if (discountValue !== undefined) updateData.discountValue = Number(discountValue);
    if (minOrderValue !== undefined) updateData.minOrderValue = Number(minOrderValue);
    if (maxDiscount !== undefined) updateData.maxDiscount = maxDiscount ? Number(maxDiscount) : null;
    if (maxUses !== undefined) updateData.maxUses = Number(maxUses);
    if (usedCount !== undefined) updateData.usedCount = Number(usedCount);

    if (status === 'INACTIVE') {
      updateData.expiresAt = new Date(0).toISOString();
    } else if (status === 'ACTIVE' && (!expiresAt || new Date(expiresAt).getTime() <= Date.now())) {
      updateData.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    } else if (expiresAt) {
      updateData.expiresAt = new Date(expiresAt).toISOString();
    }

    const { data: updated, error } = await supabase
      .from('Coupon')
      .update(updateData)
      .eq('code', cleanCode)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ message: 'Lỗi cập nhật mã giảm giá: ' + error.message }, { status: 400 });
    }

    // Also sync to Prisma
    try {
      const prismaUpdate: any = {};
      if (updateData.discountType) prismaUpdate.discountType = updateData.discountType;
      if (updateData.discountValue !== undefined) prismaUpdate.discountValue = updateData.discountValue;
      if (updateData.minOrderValue !== undefined) prismaUpdate.minOrderValue = updateData.minOrderValue;
      if (updateData.maxDiscount !== undefined) prismaUpdate.maxDiscount = updateData.maxDiscount;
      if (updateData.maxUses !== undefined) prismaUpdate.maxUses = updateData.maxUses;
      if (updateData.usedCount !== undefined) prismaUpdate.usedCount = updateData.usedCount;
      if (updateData.expiresAt) prismaUpdate.expiresAt = new Date(updateData.expiresAt);

      await prisma.coupon.updateMany({
        where: { code: cleanCode },
        data: prismaUpdate,
      });
    } catch (pErr) {
      console.warn('Prisma coupon update sync warning:', pErr);
    }

    return NextResponse.json({
      message: `Đã cập nhật mã giảm giá ${cleanCode}!`,
      coupon: {
        ...(updated || { code: cleanCode, ...updateData }),
        status: status || 'ACTIVE',
      },
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

    const cleanCode = code.trim().toUpperCase();
    const { error } = await supabase.from('Coupon').delete().eq('code', cleanCode);
    if (error) {
      return NextResponse.json({ message: 'Lỗi khi xóa mã: ' + error.message }, { status: 400 });
    }

    // Also delete in Prisma
    try {
      await prisma.coupon.deleteMany({ where: { code: cleanCode } });
    } catch (pErr) {
      console.warn('Prisma delete coupon warning:', pErr);
    }

    return NextResponse.json({
      message: `Đã xóa mã giảm giá ${cleanCode} thành công!`,
    }, { status: 200 });
  } catch (error: any) {
    console.error('Lỗi khi xóa mã giảm giá:', error);
    return NextResponse.json(
      { message: 'Không thể xóa mã giảm giá.' },
      { status: 500 }
    );
  }
}
