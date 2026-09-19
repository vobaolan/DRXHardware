import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { supabase } from '@/lib/supabase';
import { invalidateProductsCache } from '@/app/api/products/route';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export async function GET() {
  const headers = {
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
    'Pragma': 'no-cache',
    'Expires': '0',
    'Surrogate-Control': 'no-store'
  };

  try {
    // 1. Direct query strictly from Supabase Cloud Database (Live REST - No Stale Fallback)
    const { data: supaProds, error: supaErr } = await supabase
      .from('Product')
      .select('*')
      .order('createdAt', { ascending: false });

    if (supaErr) {
      console.error('Supabase products query error:', supaErr);
      return NextResponse.json(
        { message: 'Lỗi tải danh sách sản phẩm từ CSDL: ' + supaErr.message },
        { status: 500, headers }
      );
    }

    const dbProducts = supaProds || [];

    // Sort strictly newest first (by updatedAt or createdAt)
    const sortedProducts = [...dbProducts].sort((a, b) => {
      const timeA = new Date(a.updatedAt || a.createdAt || 0).getTime();
      const timeB = new Date(b.updatedAt || b.createdAt || 0).getTime();
      return timeB - timeA;
    });

    return NextResponse.json({ products: sortedProducts }, { status: 200, headers });
  } catch (error: any) {
    console.error('Lỗi khi lấy danh sách sản phẩm admin:', error);
    return NextResponse.json(
      { message: 'Lỗi máy chủ khi lấy danh sách sản phẩm: ' + error.message },
      { status: 500, headers }
    );
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
    const singleCategory = Array.isArray(category) ? (category[0] || 'CORE_PARTS') : (category || 'CORE_PARTS');
    const productId = (body.id && body.id.length > 20 && !body.id.startsWith('prod-')) ? body.id : crypto.randomUUID();

    const productData: any = {
      id: productId,
      name: name.trim(),
      slug,
      description: description || `Linh kiện chính hãng ${name} bảo hành ${warrantyMonths || 36} tháng tại DRX Hardware.`,
      price: originalPrice,
      discountPrice: discPrice,
      costPrice: costPrice ? parseFloat(String(costPrice)) : null,
      coverImage: coverImage.trim(),
      screenshots: finalScreenshots,
      category: singleCategory,
      brand: (brand || 'DRX').trim(),
      modelCode: (modelCode || '').trim(),
      specs: specs || {},
      warrantyMonths: warrantyMonths ? Number(warrantyMonths) : 36,
      stockQuantity: stockQuantity !== undefined ? Number(stockQuantity) : 15,
      isFlashDeal: Boolean(isFlashDeal),
      isFeatured: Boolean(isFeatured),
      isPrebuilt: Boolean(isPrebuilt),
      status: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (socket) productData.socket = socket;
    if (ramType) productData.ramType = ramType;
    if (wattage) productData.wattage = Number(wattage);
    if (formFactor) productData.formFactor = formFactor;

    // Save directly to Supabase Cloud Database (Fast Direct REST)
    const { data: savedProduct, error: insertErr } = await supabase
      .from('Product')
      .insert([productData])
      .select()
      .single();

    if (insertErr) {
      console.error('Supabase insert product error:', insertErr);
      return NextResponse.json(
        { message: 'Lỗi khi lưu sản phẩm vào cơ sở dữ liệu: ' + insertErr.message },
        { status: 500 }
      );
    }

    const finalProduct = savedProduct || productData;

    invalidateProductsCache();
    revalidatePath('/', 'layout');
    revalidatePath('/products', 'layout');
    revalidatePath('/admin', 'layout');
    revalidatePath('/staff', 'layout');

    return NextResponse.json(
      { message: 'Thêm linh kiện mới thành công!', product: finalProduct },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Lỗi khi thêm linh kiện:', error);
    return NextResponse.json(
      { message: 'Có lỗi xảy ra: ' + error.message },
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

    const prodSlug = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    const originalPrice = parseFloat(String(price));
    const discPrice = discountPrice ? parseFloat(String(discountPrice)) : null;
    const finalScreenshots = Array.isArray(screenshots) && screenshots.length > 0 ? screenshots : (coverImage ? [coverImage] : []);
    const singleCategory = Array.isArray(category) ? (category[0] || 'CORE_PARTS') : (category || 'CORE_PARTS');

    const updatedData: any = {
      name: name.trim(),
      slug: prodSlug,
      description: description || `Linh kiện chính hãng ${name} bảo hành ${warrantyMonths || 36} tháng tại DRX Hardware.`,
      price: originalPrice,
      discountPrice: discPrice,
      coverImage: coverImage?.trim(),
      screenshots: finalScreenshots,
      category: singleCategory,
      brand: (brand || 'DRX').trim(),
      modelCode: (modelCode || '').trim(),
      specs: specs || {},
      warrantyMonths: warrantyMonths ? Number(warrantyMonths) : 36,
      stockQuantity: stockQuantity !== undefined ? Number(stockQuantity) : 15,
      isFlashDeal: Boolean(isFlashDeal),
      isFeatured: Boolean(isFeatured),
      isPrebuilt: Boolean(isPrebuilt),
      updatedAt: new Date().toISOString(),
    };

    if (costPrice !== undefined) updatedData.costPrice = parseFloat(String(costPrice));
    if (status !== undefined) updatedData.status = Boolean(status);
    if (socket !== undefined) updatedData.socket = socket;
    if (ramType !== undefined) updatedData.ramType = ramType;
    if (wattage !== undefined) updatedData.wattage = wattage ? Number(wattage) : null;
    if (formFactor !== undefined) updatedData.formFactor = formFactor;

    // Update in Supabase Cloud Database
    let updatedProduct: any = null;
    const { data: updateRes, error: updateErr } = await supabase
      .from('Product')
      .update(updatedData)
      .eq('id', id)
      .select()
      .maybeSingle();

    if (updateErr) {
      console.error('Supabase update product error:', updateErr);
      return NextResponse.json({ message: 'Lỗi cập nhật CSDL: ' + updateErr.message }, { status: 500 });
    }

    if (updateRes) {
      updatedProduct = updateRes;
    } else {
      // If record not found, upsert it
      const { data: upsertRes, error: upsertErr } = await supabase
        .from('Product')
        .upsert({
          id,
          ...updatedData,
          status: status !== undefined ? Boolean(status) : true,
          createdAt: new Date().toISOString(),
        })
        .select()
        .single();

      if (upsertErr) {
        console.error('Supabase upsert product error:', upsertErr);
        return NextResponse.json({ message: 'Lỗi lưu sản phẩm vào CSDL: ' + upsertErr.message }, { status: 500 });
      }
      updatedProduct = upsertRes;
    }

    invalidateProductsCache();
    revalidatePath('/', 'layout');
    revalidatePath('/products', 'layout');
    revalidatePath('/admin', 'layout');
    revalidatePath('/staff', 'layout');

    return NextResponse.json({
      message: 'Cập nhật linh kiện thành công!',
      product: updatedProduct
    }, { status: 200 });

  } catch (error: any) {
    console.error('Lỗi khi cập nhật linh kiện:', error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return NextResponse.json({ message: 'Thiếu ID sản phẩm' }, { status: 400 });
    }

    // 1. Delete associated product serials first
    try {
      await supabase.from('ProductSerial').delete().eq('productId', id);
    } catch (e) {
      console.warn('Product serial cleanup notice:', e);
    }

    // 2. Delete from Supabase Cloud Database
    const { error } = await supabase.from('Product').delete().eq('id', id);
    if (error) {
      console.error('Supabase delete product error:', error);
      return NextResponse.json({ message: 'Lỗi khi xóa từ cơ sở dữ liệu: ' + error.message }, { status: 500 });
    }

    invalidateProductsCache();
    revalidatePath('/', 'layout');
    revalidatePath('/products', 'layout');
    revalidatePath('/admin', 'layout');
    revalidatePath('/staff', 'layout');

    return NextResponse.json({ success: true, message: 'Đã xóa sản phẩm thành công!' }, { status: 200 });
  } catch (error: any) {
    console.error('Lỗi xóa sản phẩm:', error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
