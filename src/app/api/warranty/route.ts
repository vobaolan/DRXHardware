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

    // 1. Primary Authority: Direct query in ProductSerial table via Prisma ORM
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

    // 2. Secondary Fallback: Supabase Cloud Database REST API for ProductSerial
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

    // Return if matched from ProductSerial table
    if (serialMatch) {
      const product = serialMatch.product;
      const order = serialMatch.order;
      const totalMonths = product?.warrantyMonths || 36;
      const soldDate = serialMatch.soldDate || serialMatch.createdAt || order?.createdAt || new Date();
      
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

    // 3. Resolve by Customer Order Linkage (for orders with serials or paymentDetails)
    const upperQ = q.toUpperCase();
    const orderCodeMatch = upperQ.match(/DRX-?(\d{4,6})/i) || upperQ.match(/(\d{5})/);
    const possibleCode = orderCodeMatch ? `DRX-${orderCodeMatch[1]}` : null;
    const rawNum = orderCodeMatch ? orderCodeMatch[1] : null;

    let matchedOrder: any = null;
    try {
      matchedOrder = await prisma.order.findFirst({
        where: {
          OR: [
            ...(possibleCode ? [{ orderCode: possibleCode }] : []),
            ...(rawNum ? [{ orderCode: { contains: rawNum } }] : []),
            { id: { contains: rawNum || upperQ } }
          ]
        },
        include: {
          orderItems: { include: { product: true } },
          serials: { include: { product: true } }
        }
      });
    } catch (e) {
      console.warn('Prisma order warranty search warning:', e);
    }

    if (!matchedOrder && (possibleCode || rawNum)) {
      try {
        const { data: supaOrder } = await supabase
          .from('Order')
          .select('*, orderItems:OrderItem(*, product:Product(*)), serials:ProductSerial(*, product:Product(*))')
          .or(`orderCode.eq.${possibleCode || ''},orderCode.ilike.%${rawNum || ''}%`)
          .limit(1)
          .maybeSingle();

        if (supaOrder) {
          matchedOrder = supaOrder;
        }
      } catch (e) {
        console.warn('Supabase order warranty search warning:', e);
      }
    }

    if (matchedOrder) {
      // Determine item index from serial query (e.g. SN-ASUS-77855-2 -> index 1)
      const idxMatch = upperQ.match(/-(\d+)$/);
      const itemIndex = idxMatch ? Math.max(0, parseInt(idxMatch[1], 10) - 1) : 0;

      let targetItem: any = null;
      let targetProduct: any = null;

      if (matchedOrder.orderItems && matchedOrder.orderItems.length > 0) {
        targetItem = matchedOrder.orderItems[itemIndex] || matchedOrder.orderItems[0];
        targetProduct = targetItem.product;
      }

      const pDetails = typeof matchedOrder.paymentDetails === 'object' && matchedOrder.paymentDetails !== null
        ? matchedOrder.paymentDetails
        : typeof matchedOrder.paymentDetails === 'string'
          ? (() => { try { return JSON.parse(matchedOrder.paymentDetails); } catch(e) { return {}; } })()
          : {};

      if (!targetProduct && pDetails.items && Array.isArray(pDetails.items) && pDetails.items.length > 0) {
        targetItem = pDetails.items[itemIndex] || pDetails.items[0];
        targetProduct = {
          name: targetItem.name,
          category: targetItem.category || 'HARDWARE',
          brand: targetItem.brand || 'DRX Certified',
          coverImage: targetItem.coverImage,
          warrantyMonths: 36,
        };
      }

      if (targetProduct || targetItem) {
        const totalMonths = Number(targetProduct?.warrantyMonths) || 36;
        const soldDate = new Date(matchedOrder.createdAt || Date.now());
        const warrantyEndDate = new Date(soldDate);
        warrantyEndDate.setMonth(warrantyEndDate.getMonth() + totalMonths);

        const now = new Date();
        const isValid = now <= warrantyEndDate;
        const elapsedMonths = Math.max(0, Math.round((now.getTime() - soldDate.getTime()) / (1000 * 60 * 60 * 24 * 30)));

        const orderDisplayCode = matchedOrder.orderCode || `DRX-${matchedOrder.id.slice(-5)}`;

        return NextResponse.json({
          found: true,
          warranty: {
            serialNumber: q.toUpperCase(),
            productName: targetProduct?.name || targetItem?.name || 'Linh Kiện Máy Tính DRX',
            category: targetProduct?.category || 'HARDWARE',
            brand: targetProduct?.brand || 'DRX Certified',
            coverImage: targetProduct?.coverImage || targetItem?.coverImage || 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=800&q=80',
            purchaseDate: soldDate.toLocaleDateString('vi-VN'),
            warrantyEnd: warrantyEndDate.toLocaleDateString('vi-VN'),
            status: isValid ? 'ACTIVE' : 'EXPIRED',
            totalMonths,
            elapsedMonths,
            customerName: matchedOrder.customerName || 'Khách Hàng DRX VIP',
            customerPhone: matchedOrder.customerPhone ? `${matchedOrder.customerPhone.slice(0, 3)}****${matchedOrder.customerPhone.slice(-3)}` : 'Đã bảo mật',
            orderCode: orderDisplayCode,
            repairLogs: [
              {
                date: soldDate.toLocaleDateString('vi-VN'),
                center: 'DRX Hardware Service Hub - TP. Hồ Chí Minh',
                note: `Kích hoạt gói bảo hành điện tử chính hãng ${totalMonths} tháng (1 đổi 1) theo đơn hàng #${orderDisplayCode}.`
              }
            ]
          }
        }, { status: 200 });
      }
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
