import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const q = url.searchParams.get('q')?.trim() || '';

    if (!q) {
      return NextResponse.json({ message: 'Vui lòng cung cấp mã Serial SN hoặc số điện thoại' }, { status: 400 });
    }

    // 1. Supabase direct search by serialNumber
    let serialMatch: any = null;
    try {
      const { data: supaSerial } = await supabase
        .from('ProductSerial')
        .select('*, product:Product(*), order:Order(*)')
        .ilike('serialNumber', `%${q}%`)
        .limit(1)
        .maybeSingle();

      if (supaSerial) {
        serialMatch = supaSerial;
      }
    } catch (e) {}

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
          brand: product?.brand || 'DRX',
          coverImage: product?.coverImage || '',
          purchaseDate: new Date(soldDate).toLocaleDateString('vi-VN'),
          warrantyEnd: warrantyEndDate.toLocaleDateString('vi-VN'),
          status: isValid ? 'ACTIVE' : 'EXPIRED',
          totalMonths,
          elapsedMonths,
          customerName: order?.customerName || 'Khách Hàng DRX VIP',
          customerPhone: order?.customerPhone || 'Đã kích hoạt',
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

    // 2. Search by orderCode or customerPhone in Supabase Order table
    try {
      const { data: orderMatches } = await supabase
        .from('Order')
        .select('*')
        .or(`orderCode.ilike.%${q}%,customerPhone.ilike.%${q}%`)
        .order('createdAt', { ascending: false })
        .limit(1);

      if (orderMatches && orderMatches.length > 0) {
        const orderMatch = orderMatches[0];
        const soldDate = orderMatch.createdAt;
        const totalMonths = 36;
        const warrantyEndDate = new Date(new Date(soldDate).setMonth(new Date(soldDate).getMonth() + totalMonths));
        const now = new Date();
        const isValid = now <= warrantyEndDate;
        const elapsedMonths = Math.max(0, Math.round((now.getTime() - new Date(soldDate).getTime()) / (1000 * 60 * 60 * 24 * 30)));

        const items = orderMatch.paymentDetails?.items || [];
        const firstItem = items[0] || {};
        const sn = `SN-DRX-${orderMatch.orderCode || orderMatch.id.slice(0, 8)}`;

        return NextResponse.json({
          found: true,
          warranty: {
            serialNumber: sn,
            productName: firstItem.name || 'Bộ Máy Tính PC DRX Custom',
            category: 'PC',
            brand: 'DRX',
            coverImage: firstItem.coverImage || '',
            purchaseDate: new Date(soldDate).toLocaleDateString('vi-VN'),
            warrantyEnd: warrantyEndDate.toLocaleDateString('vi-VN'),
            status: isValid ? 'ACTIVE' : 'EXPIRED',
            totalMonths,
            elapsedMonths,
            customerName: orderMatch.customerName,
            customerPhone: orderMatch.customerPhone,
            orderCode: orderMatch.orderCode,
            repairLogs: [
              {
                date: new Date(soldDate).toLocaleDateString('vi-VN'),
                center: 'DRX Assembly & Service Center',
                note: `Đã hoàn tất nghiệm thu và kích hoạt bảo hành điện tử chính hãng.`
              }
            ]
          }
        }, { status: 200 });
      }
    } catch (e) {}

    return NextResponse.json({
      found: false,
      message: `Không tìm thấy thông tin bảo hành cho mã "${q}". Vui lòng kiểm tra lại mã Serial hoặc liên hệ CSKH 1900 8888.`
    }, { status: 404 });

  } catch (error: any) {
    console.error('Lỗi tra cứu bảo hành API:', error);
    return NextResponse.json({ message: 'Lỗi tra cứu bảo hành', error: error.message }, { status: 500 });
  }
}
