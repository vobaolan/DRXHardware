import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

function cleanSlug(str: string) {
  return decodeURIComponent(str || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '');
}

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  const headers = {
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
    'Surrogate-Control': 'no-store'
  };

  try {
    const rawSlug = params?.slug;

    if (!rawSlug) {
      return NextResponse.json({ message: 'Slug là bắt buộc' }, { status: 400, headers });
    }

    const decodedSlug = decodeURIComponent(rawSlug).trim().toLowerCase();
    const normalizedTarget = cleanSlug(decodedSlug);

    let matchedProduct: any = null;

    // 1. Direct query from Supabase Live Database
    try {
      const { data: supabaseProducts, error: supaErr } = await supabase
        .from('Product')
        .select('*');

      if (!supaErr && supabaseProducts && supabaseProducts.length > 0) {
        // Exact match slug or id
        matchedProduct = supabaseProducts.find((p: any) => 
          (p.slug && p.slug.toLowerCase() === decodedSlug) || 
          p.id === decodedSlug || 
          p.id === rawSlug
        );

        // Normalized slug match
        if (!matchedProduct) {
          matchedProduct = supabaseProducts.find((p: any) => {
            const normSlug = cleanSlug(p.slug);
            const normName = cleanSlug(p.name);
            const normId = cleanSlug(p.id);
            return normSlug === normalizedTarget || 
                   normId === normalizedTarget ||
                   (normSlug && (normalizedTarget.includes(normSlug) || normSlug.includes(normalizedTarget))) ||
                   (normName && (normalizedTarget.includes(normName) || normName.includes(normalizedTarget)));
          });
        }
      }
    } catch (e) {
      console.warn('Supabase product slug query warning:', e);
    }

    if (!matchedProduct) {
      return NextResponse.json(
        { message: 'Không tìm thấy linh kiện hoặc sản phẩm đã bị xóa khỏi hệ thống!' },
        { status: 404, headers }
      );
    }

    if (matchedProduct) {
      const price = typeof matchedProduct.price === 'string' ? parseFloat(matchedProduct.price) : Number(matchedProduct.price);
      const discountPrice = matchedProduct.discountPrice
        ? (typeof matchedProduct.discountPrice === 'string' ? parseFloat(matchedProduct.discountPrice) : Number(matchedProduct.discountPrice))
        : null;

      const coverImage = matchedProduct.coverImage || matchedProduct.image || 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=800&q=80';
      const screenshots = matchedProduct.screenshots && Array.isArray(matchedProduct.screenshots) && matchedProduct.screenshots.length > 0 
        ? matchedProduct.screenshots 
        : [coverImage];

      let effectiveStock = matchedProduct.stockQuantity !== undefined ? Number(matchedProduct.stockQuantity) : (matchedProduct.stockCount !== undefined ? Number(matchedProduct.stockCount) : 0);

      // Check live available serial numbers if product has serials tracking
      try {
        const { data: serialsData } = await supabase
          .from('ProductSerial')
          .select('id, status')
          .eq('productId', matchedProduct.id);

        if (serialsData && Array.isArray(serialsData) && serialsData.length > 0) {
          const availCount = serialsData.filter((s: any) => s.status === 'AVAILABLE').length;
          effectiveStock = availCount;
        }
      } catch (snErr) {
        console.warn('ProductSerial check warning:', snErr);
      }

      const isActuallyInStock = matchedProduct.status !== false && matchedProduct.inStock !== false && effectiveStock > 0;

      return NextResponse.json(
        {
          product: {
            id: matchedProduct.id,
            name: matchedProduct.name,
            slug: matchedProduct.slug || decodedSlug,
            description: matchedProduct.description || 'Linh kiện phần cứng máy tính chính hãng DRX Hardware, bảo hành 36 tháng 1 đổi 1.',
            price: price || 0,
            discountPrice: discountPrice,
            coverImage: coverImage,
            screenshots: screenshots,
            category: Array.isArray(matchedProduct.category) ? matchedProduct.category : [matchedProduct.category || 'VGA'],
            brand: matchedProduct.brand || 'DRX',
            platform: matchedProduct.platform || matchedProduct.brand || 'PC',
            type: matchedProduct.type || matchedProduct.category || 'HARDWARE',
            modelCode: matchedProduct.modelCode || '',
            warrantyMonths: matchedProduct.warrantyMonths || 36,
            stockQuantity: effectiveStock,
            status: isActuallyInStock,
            isFlashDeal: Boolean(matchedProduct.isFlashDeal),
            flashSaleEnd: matchedProduct.flashSaleEnd ? new Date(matchedProduct.flashSaleEnd).toISOString() : null,
            isFeaturedDeal: Boolean(matchedProduct.isFeaturedDeal || matchedProduct.isFeatured),
            tags: matchedProduct.tags || [matchedProduct.brand, matchedProduct.category].filter(Boolean),
            specs: typeof matchedProduct.specs === 'object' && matchedProduct.specs !== null ? matchedProduct.specs : {},
            socket: matchedProduct.socket || '',
            ramType: matchedProduct.ramType || '',
            wattage: matchedProduct.wattage || 0,
          },
        },
        { status: 200, headers }
      );
    }

    return NextResponse.json({ message: 'Không tìm thấy sản phẩm' }, { status: 404, headers });
  } catch (error: any) {
    console.error('Lỗi khi tải chi tiết sản phẩm:', error);
    return NextResponse.json(
      { message: 'Lỗi lấy dữ liệu chi tiết' },
      { status: 500, headers }
    );
  }
}
