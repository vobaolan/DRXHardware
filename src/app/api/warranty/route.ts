import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const q = url.searchParams.get('q')?.trim() || '';

    if (!q) {
      return NextResponse.json(
        { message: 'Vui lòng cung cấp mã Serial Number (SN) linh kiện!' },
        { status: 400 }
      );
    }

    // Check if user accidentally entered a phone number (digits only or starts with 0/84)
    const isPhoneNumber = /^(?:\+?84|0)[3|5|7|8|9][0-9]{8}$/.test(q.replace(/\s+/g, '')) || (/^[0-9]{9,11}$/.test(q) && !q.includes('-'));
    if (isPhoneNumber) {
      return NextResponse.json({
        found: false,
        message: 'Hệ thống chỉ hỗ trợ tra cứu chính xác bằng Mã Serial Number (SN) in trên tem linh kiện hoặc vỏ hộp. Không hỗ trợ tra cứu bằng số điện thoại nhằm bảo mật thông tin khách hàng.'
      }, { status: 400 });
    }

    let serialMatch: any = null;

    // 1. Primary Authority: Direct pooled PostgreSQL query via Prisma ORM
    try {
      const dbSerial = await prisma.productSerial.findFirst({
        where: {
          serialNumber: {
            equals: q,
            mode: 'insensitive',
          },
        },
        include: {
          product: true,
          order: true,
        },
      });

      if (dbSerial) {
        serialMatch = dbSerial;
      }
    } catch (prismaErr) {
      console.warn('Prisma warranty query warning, trying Supabase:', prismaErr);
    }

    // 2. Secondary Fallback: Supabase Cloud Database REST API (ONLY by serialNumber)
    if (!serialMatch) {
      try {
        const { data: supaSerial } = await supabase
          .from('ProductSerial')
          .select('*, product:Product(*), order:Order(*)')
          .ilike('serialNumber', q)
          .limit(1)
          .maybeSingle();

        if (supaSerial) {
          serialMatch = supaSerial;
        }
      } catch (e) {
        console.warn('Supabase warranty lookup warning:', e);
      }
    }

    if (serialMatch) {
      const product = serialMatch.product;
      const order = serialMatch.order;
      const totalMonths = product?.warrantyMonths || 36;
      const soldDate = serialMatch.soldDate || serialMatch.createdAt;
      
      const warrantyEndDate = serialMatch.warrantyEnd 
        ? new Date(serialMatch.warrantyEnd)
        : new Date(new Date(soldDate).setMonth(new Date(soldDate).getMonth() + totalMonths));

      const now = new Date();
      const isValid = now <= warrantyEndDate;
      const elapsedMonths = Math.max(0, Math.round((now.getTime() - new Date(soldDate).getTime()) / (1000 * 60 * 60 * 24 * 30)));

      return NextResponse.json({
        found: true,
        warranty: {
          serialNumber: serialMatch.serialNumber,
          productName: product?.name || 'Linh Kiện Phần Cứng DRX',
          category: product?.category || 'CORE_PARTS',
          brand: product?.brand || 'DRX Certified',
          coverImage: product?.coverImage || '',
          purchaseDate: new Date(soldDate).toLocaleDateString('vi-VN'),
          warrantyEnd: warrantyEndDate.toLocaleDateString('vi-VN'),
          status: isValid ? 'ACTIVE' : 'EXPIRED',
          totalMonths,
          elapsedMonths,
          customerName: order?.customerName || 'Khách Hàng DRX VIP',
          customerPhone: order?.customerPhone ? `${order.customerPhone.slice(0, 3)}****${order.customerPhone.slice(-3)}` : 'Đã bảo mật',
          orderCode: order?.orderCode || 'DRX-RETAIL',
          repairLogs: [
            {
              date: new Date(soldDate).toLocaleDateString('vi-VN'),
              center: 'DRX Hardware Service Hub - TP. Hồ Chí Minh',
              note: `Kích hoạt gói bảo hành điện tử chính hãng ${totalMonths} tháng (1 đổi 1).`
            }
          ]
        }
      }, { status: 200 });
    }

    return NextResponse.json({
      found: false,
      message: `Không tìm thấy thông tin bảo hành cho mã Serial "${q}". Vui lòng kiểm tra lại tem Serial Number trên sản phẩm hoặc liên hệ CSKH DRX.`
    }, { status: 404 });

  } catch (error: any) {
    console.error('Lỗi tra cứu bảo hành API:', error);
    return NextResponse.json({ message: 'Lỗi tra cứu bảo hành', error: error.message }, { status: 500 });
  }
}
