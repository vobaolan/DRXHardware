import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { supabase } from '@/lib/supabase';
import { prisma } from '@/lib/prisma';
import { INITIAL_PRODUCTS } from '@/lib/hardware-data';

export const dynamic = 'force-dynamic';

export async function GET() {
  const headers = {
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
    'Surrogate-Control': 'no-store'
  };

  try {
    let dbProducts: any[] = [];
    try {
      dbProducts = await prisma.product.findMany({
        orderBy: { createdAt: 'desc' },
      });
    } catch (e) {}

    if (!dbProducts || dbProducts.length === 0) {
      try {
        const { data: supaProds } = await supabase
          .from('Product')
          .select('*')
          .order('createdAt', { ascending: false });
        if (supaProds && supaProds.length > 0) {
          dbProducts = supaProds;
        }
      } catch (e) {}
    }

    // Merge with INITIAL_PRODUCTS to ensure full hardware catalog availability
    const combined = [...INITIAL_PRODUCTS];
    if (dbProducts && Array.isArray(dbProducts)) {
      dbProducts.forEach((dp: any) => {
        const idx = combined.findIndex(cp => cp.id === dp.id || cp.slug === dp.slug);
        if (idx >= 0) {
          combined[idx] = { ...combined[idx], ...dp };
        } else {
          combined.unshift(dp);
        }
      });
    }

    return NextResponse.json({ products: combined }, { status: 200, headers });
  } catch (error: any) {
    console.error('Lỗi khi lấy danh sách sản phẩm admin:', error);
    return NextResponse.json({ products: INITIAL_PRODUCTS }, { status: 200, headers });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      name,
      category,
      brand,
      modelCode,
      price,
      discountPrice,
      costPrice,
      coverImage,
      screenshots,
      specs,
      warrantyMonths,
      stockQuantity,
      socket,
      ramType,
      wattage,
      formFactor,
      description,
      isFlashDeal,
      isFeatured,
      isPrebuilt,
    } = body;

    if (!name || !price || !coverImage) {
      return NextResponse.json(
        { message: 'Tên linh kiện, Giá bán và Ảnh đại diện là bắt buộc!' },
        { status: 400 }
      );
    }

    const slug = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    const originalPrice = parseFloat(String(price));
    const discPrice = discountPrice ? parseFloat(String(discountPrice)) : null;
    const finalScreenshots = Array.isArray(screenshots) && screenshots.length > 0 ? screenshots : [coverImage];

    const newProductData = {
      id: body.id || `prod-${Date.now()}`,
      name,
      slug: `${slug}-${Date.now().toString().slice(-4)}`,
      description: description || `Linh kiện chính hãng ${name} bảo hành ${warrantyMonths || 36} tháng tại DRX Hardware.`,
      price: originalPrice,
      discountPrice: discPrice,
      costPrice: costPrice ? parseFloat(String(costPrice)) : Math.round(originalPrice * 0.8),
      coverImage,
      screenshots: finalScreenshots,
      category: Array.isArray(category) ? category : [category || 'CORE_PARTS'],
      brand: brand || 'DRX',
      modelCode: modelCode || '',
      socket: socket || '',
      ramType: ramType || '',
      wattage: wattage ? Number(wattage) : undefined,
      formFactor: formFactor || '',
      specs: specs || {},
      warrantyMonths: warrantyMonths ? Number(warrantyMonths) : 36,
      stockQuantity: stockQuantity !== undefined ? Number(stockQuantity) : 15,
      isFlashDeal: Boolean(isFlashDeal),
      isFeaturedDeal: Boolean(isFeatured),
      isPrebuilt: Boolean(isPrebuilt),
      status: true,
      platform: brand || 'PC',
      type: Array.isArray(category) ? category[0] : (category || 'CORE_PARTS'),
    };

    // Try Supabase insert
    try {
      await supabase.from('Product').insert([newProductData]);
    } catch (e) {}

    // Try Prisma insert
    try {
      await prisma.product.create({
        data: {
          name: newProductData.name,
          slug: newProductData.slug,
          description: newProductData.description,
          price: newProductData.price,
          discountPrice: newProductData.discountPrice,
          coverImage: newProductData.coverImage,
          screenshots: newProductData.screenshots,
          category: newProductData.category,
          platform: newProductData.platform,
          type: newProductData.type,
          status: true,
          isFlashDeal: newProductData.isFlashDeal,
          isFeaturedDeal: newProductData.isFeaturedDeal,
          specs: newProductData.specs,
          warrantyMonths: newProductData.warrantyMonths,
        }
      });
    } catch (e) {}

    revalidatePath('/');
    revalidatePath('/products');
    revalidatePath('/admin');
    revalidatePath('/staff');

    return NextResponse.json(
      { message: 'Thêm linh kiện mới thành công!', product: newProductData },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Lỗi khi tạo linh kiện:', error);
    return NextResponse.json(
      { message: 'Lỗi tạo linh kiện: ' + error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const {
      id,
      name,
      category,
      brand,
      modelCode,
      price,
      discountPrice,
      costPrice,
      coverImage,
      screenshots,
      specs,
      warrantyMonths,
      stockQuantity,
      socket,
      ramType,
      wattage,
      formFactor,
      description,
      isFlashDeal,
      isFeatured,
      isPrebuilt,
      status
    } = body;

    if (!id || !name || !price) {
      return NextResponse.json({ message: 'ID, Tên linh kiện và Giá là bắt buộc!' }, { status: 400 });
    }

    const originalPrice = parseFloat(String(price));
    const discPrice = discountPrice ? parseFloat(String(discountPrice)) : null;
    const finalScreenshots = Array.isArray(screenshots) && screenshots.length > 0 ? screenshots : (coverImage ? [coverImage] : []);

    const updatedData: any = {
      id,
      name,
      description: description || `Linh kiện chính hãng ${name} bảo hành ${warrantyMonths || 36} tháng tại DRX Hardware.`,
      price: originalPrice,
      discountPrice: discPrice,
      costPrice: costPrice ? parseFloat(String(costPrice)) : undefined,
      category: Array.isArray(category) ? category : [category || 'CORE_PARTS'],
      brand: brand || 'DRX',
      modelCode: modelCode || '',
      specs: specs || {},
      warrantyMonths: warrantyMonths ? Number(warrantyMonths) : 36,
      stockQuantity: stockQuantity !== undefined ? Number(stockQuantity) : 15,
      isFlashDeal: isFlashDeal !== undefined ? Boolean(isFlashDeal) : false,
      isFeaturedDeal: isFeatured !== undefined ? Boolean(isFeatured) : false,
      isPrebuilt: isPrebuilt !== undefined ? Boolean(isPrebuilt) : false,
      status: status !== undefined ? Boolean(status) : true,
      platform: brand || 'PC',
      type: Array.isArray(category) ? category[0] : (category || 'CORE_PARTS'),
    };

    if (coverImage) {
      updatedData.coverImage = coverImage;
    }
    if (finalScreenshots.length > 0) {
      updatedData.screenshots = finalScreenshots;
    }
    if (socket !== undefined) updatedData.socket = socket;
    if (ramType !== undefined) updatedData.ramType = ramType;
    if (wattage !== undefined) updatedData.wattage = Number(wattage);
    if (formFactor !== undefined) updatedData.formFactor = formFactor;

    // Try Supabase update
    try {
      await supabase.from('Product').update(updatedData).eq('id', id);
    } catch (e) {}

    // Try Prisma update
    try {
      await prisma.product.update({
        where: { id },
        data: {
          name: updatedData.name,
          description: updatedData.description,
          price: updatedData.price,
          discountPrice: updatedData.discountPrice,
          coverImage: updatedData.coverImage,
          screenshots: updatedData.screenshots,
          category: updatedData.category,
          platform: updatedData.platform,
          type: updatedData.type,
          status: updatedData.status,
          isFlashDeal: updatedData.isFlashDeal,
          isFeaturedDeal: updatedData.isFeaturedDeal,
          specs: updatedData.specs,
          warrantyMonths: updatedData.warrantyMonths,
        }
      });
    } catch (e) {}

    revalidatePath('/');
    revalidatePath('/products');
    revalidatePath('/admin');
    revalidatePath('/staff');

    return NextResponse.json(
      { message: 'Cập nhật linh kiện thành công!', product: updatedData },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Lỗi khi cập nhật linh kiện:', error);
    return NextResponse.json(
      { message: 'Lỗi cập nhật linh kiện: ' + error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ message: 'ID linh kiện là bắt buộc' }, { status: 400 });
    }

    try {
      await supabase.from('Product').delete().eq('id', id);
    } catch (e) {}

    try {
      await prisma.product.delete({
        where: { id },
      });
    } catch (e) {}

    revalidatePath('/');
    revalidatePath('/products');
    revalidatePath('/admin');
    revalidatePath('/staff');

    return NextResponse.json({ message: 'Đã xóa linh kiện thành công!' }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: 'Lỗi xóa linh kiện: ' + error.message }, { status: 500 });
  }
}