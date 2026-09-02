import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const serials = await prisma.productSerial.findMany({
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
      // Upsert so duplicates don't crash
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
      createdSerials.push(item);
    }

    // Increment product stock
    await prisma.product.update({
      where: { id: productId },
      data: {
        stockQuantity: { increment: createdSerials.length }
      }
    });

    return NextResponse.json({ 
      success: true, 
      count: createdSerials.length,
      message: `Đã nhập thành công ${createdSerials.length} mã Serial vào kho!` 
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

    const updated = await prisma.productSerial.update({
      where: { id },
      data: {
        status,
        ...(warrantyEnd ? { warrantyEnd: new Date(warrantyEnd) } : {}),
        ...(soldDate ? { soldDate: new Date(soldDate) } : {}),
      }
    });

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

    await prisma.productSerial.delete({
      where: { id }
    });

    return NextResponse.json({ success: true, message: 'Đã xóa Serial' }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
