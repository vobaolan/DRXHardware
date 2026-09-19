import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { supabase } from '@/lib/supabase';
import { INITIAL_PRODUCTS } from '@/lib/hardware-data';
import { invalidateProductsCache } from '@/app/api/products/route';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

/**
 * Tự động phát sinh mã Serial Number theo đúng chuẩn: HÃNG-DANH MỤC-MÃ NGẪU NHIÊN
 * Ví dụ: ASUS-VGA-8K92FN, MSI-MAINBOARD-3M7X2P, INTEL-CPU-9V4C7D
 */
function generateSerialCode(brand?: string, category?: any): string {
  const cleanBrand = (brand || 'DRX')
    .trim()
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Z0-9]/g, '') || 'DRX';

  const catStr = Array.isArray(category) ? category[0] : (category || 'PART');
  const cleanCategory = String(catStr)
    .trim()
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Z0-9]/g, '') || 'PART';

  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let randomCode = '';
  for (let i = 0; i < 6; i++) {
    randomCode += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return `${cleanBrand}-${cleanCategory}-${randomCode}`;
}

export async function GET(request: Request) {
  const headers = {
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
    'Pragma': 'no-cache',
    'Expires': '0',
    'Surrogate-Control': 'no-store'
  };

  try {
    let dbProducts: any[] = [];
    try {
      // 1. Direct query: Fast and returns all products
      const { data: supaProds, error: supaErr } = await supabase
        .from('Product')
        .select('*')
        .order('createdAt', { ascending: false });

      if (!supaErr && supaProds && Array.isArray(supaProds) && supaProds.length > 0) {
        dbProducts = supaProds;
      } else {
        // Fallback to parallel range chunks
        const [r1, r2, r3, r4] = await Promise.all([
          supabase.from('Product').select('*').order('createdAt', { ascending: false }).range(0, 49),
          supabase.from('Product').select('*').order('createdAt', { ascending: false }).range(50, 99),
          supabase.from('Product').select('*').order('createdAt', { ascending: false }).range(100, 149),
          supabase.from('Product').select('*').order('createdAt', { ascending: false }).range(150, 249),
        ]);

        const chunked = [
          ...(r1.data && Array.isArray(r1.data) ? r1.data : []),
          ...(r2.data && Array.isArray(r2.data) ? r2.data : []),
          ...(r3.data && Array.isArray(r3.data) ? r3.data : []),
          ...(r4.data && Array.isArray(r4.data) ? r4.data : []),
        ];

        if (chunked.length > 0) {
          dbProducts = chunked;
        }
      }
    } catch (e) {
      console.warn('Supabase products fetch warning in admin:', e);
    }

    // Sort strictly newest first (by updatedAt or createdAt)
    const sortedProducts = [...dbProducts].sort((a, b) => {
      const timeA = new Date(a.updatedAt || a.createdAt || 0).getTime();
      const timeB = new Date(b.updatedAt || b.createdAt || 0).getTime();
      return timeB - timeA;
    });

    return NextResponse.json({ products: sortedProducts }, { status: 200, headers });
  } catch (error: any) {
    console.error('Lỗi khi lấy danh sách sản phẩm admin:', error);
    return NextResponse.json({ products: [] }, { status: 200, headers });
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

    // Tự động sinh mã SN (Serial Number) theo format: HÃNG-DANH MỤC-MÃ NGẪU NHIÊN
    try {
      const qty = Math.max(0, Number(finalProduct.stockQuantity || 0));
      if (qty > 0) {
        const serialsToInsert: any[] = [];
        const usedCodes = new Set<string>();
        
        while (serialsToInsert.length < qty) {
          const sn = generateSerialCode(finalProduct.brand, finalProduct.category);
          if (!usedCodes.has(sn)) {
            usedCodes.add(sn);
            serialsToInsert.push({
              id: crypto.randomUUID(),
              productId: finalProduct.id,
              serialNumber: sn,
              status: 'AVAILABLE',
              createdAt: new Date().toISOString(),
            });
          }
        }

        if (serialsToInsert.length > 0) {
          const { error: snErr } = await supabase
            .from('ProductSerial')
            .insert(serialsToInsert);
          if (snErr) {
            console.warn('Lỗi tự động sinh mã serial khi tạo sản phẩm:', snErr);
          }
        }
      }
    } catch (snErr) {
      console.warn('Tự động sinh serial khi tạo sản phẩm warning:', snErr);
    }

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

    if (costPrice !== undefined) updatedData.costPrice = (costPrice && !isNaN(Number(costPrice))) ? parseFloat(String(costPrice)) : null;
    if (status !== undefined) updatedData.status = Boolean(status);
    if (socket !== undefined) updatedData.socket = socket ? String(socket).trim() : null;
    if (ramType !== undefined) updatedData.ramType = ramType ? String(ramType).trim() : null;
    if (wattage !== undefined) updatedData.wattage = (wattage && !isNaN(Number(wattage))) ? Number(wattage) : null;
    if (formFactor !== undefined) updatedData.formFactor = formFactor ? String(formFactor).trim() : null;

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

    // Tự động đồng bộ số lượng mã Serial (SN) theo tồn kho thực tế
    try {
      const targetStock = Math.max(0, Number(stockQuantity !== undefined ? stockQuantity : (updatedProduct?.stockQuantity || 0)));
      const { data: availSerials } = await supabase
        .from('ProductSerial')
        .select('id, serialNumber')
        .eq('productId', id)
        .eq('status', 'AVAILABLE')
        .order('createdAt', { ascending: false });

      const currentAvailable = availSerials?.length || 0;
      if (targetStock > currentAvailable) {
        const diff = targetStock - currentAvailable;
        const serialsToInsert: any[] = [];
        const usedCodes = new Set<string>();

        while (serialsToInsert.length < diff) {
          const sn = generateSerialCode(
            updatedProduct?.brand || updatedData.brand || brand,
            updatedProduct?.category || updatedData.category || category
          );
          if (!usedCodes.has(sn)) {
            usedCodes.add(sn);
            serialsToInsert.push({
              id: crypto.randomUUID(),
              productId: id,
              serialNumber: sn,
              status: 'AVAILABLE',
              createdAt: new Date().toISOString(),
            });
          }
        }

        if (serialsToInsert.length > 0) {
          const { error: snErr } = await supabase
            .from('ProductSerial')
            .insert(serialsToInsert);
          if (snErr) {
            console.warn('Lỗi tự động phát sinh serial khi tăng tồn kho:', snErr);
          }
        }
      } else if (targetStock < currentAvailable && availSerials && availSerials.length > 0) {
        // Tồn kho giảm: tự động thu hồi/xóa các mã SN thừa chưa bán để số lượng đồng nhất 100%
        const excessCount = currentAvailable - targetStock;
        const idsToDelete = availSerials.slice(0, excessCount).map((s: any) => s.id);
        if (idsToDelete.length > 0) {
          const { error: delSnErr } = await supabase
            .from('ProductSerial')
            .delete()
            .in('id', idsToDelete);
          if (delSnErr) {
            console.warn('Lỗi thu hồi serial thừa khi giảm tồn kho:', delSnErr);
          }
        }
      }
    } catch (snErr) {
      console.warn('Tự động đồng bộ serial khi sửa sản phẩm warning:', snErr);
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
