import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
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
    const resolveDeliveryMethod = (p: any) => {
      if (p.deliveryMethod && p.deliveryMethod !== 'AUTO_KEY') {
        return p.deliveryMethod;
      }
      return 'GIFT';
    };

    // Primary fetch from Supabase
    let supabaseProducts: any[] | null = null;
    try {
      const { data, error } = await supabase
        .from('Product')
        .select('*')
        .order('createdAt', { ascending: false });
        
      if (!error && data && data.length > 0) {
        supabaseProducts = data;
      }
    } catch (e) {
      console.warn('Supabase fetch notice, falling back to hardware catalog data');
    }

    // Merge database products over INITIAL_PRODUCTS catalog
    const combined = INITIAL_PRODUCTS.map(p => ({
      ...p,
      discountPrice: p.discountPrice || null,
      platform: p.brand,
      type: p.category,
      status: (p.stockQuantity ?? 1) > 0,
      screenshots: p.screenshots || [p.coverImage]
    }));

    if (supabaseProducts && Array.isArray(supabaseProducts)) {
      supabaseProducts.forEach((sp: any) => {
        const idx = combined.findIndex(
          (cp) => cp.id === sp.id || cp.slug === sp.slug || cp.name.toLowerCase() === (sp.name || '').toLowerCase()
        );
        if (idx >= 0) {
          combined[idx] = {
            ...combined[idx],
            ...sp,
            id: sp.id || combined[idx].id,
            coverImage: sp.coverImage || combined[idx].coverImage,
            screenshots: (Array.isArray(sp.screenshots) && sp.screenshots.length > 0) ? sp.screenshots : (sp.coverImage ? [sp.coverImage] : combined[idx].screenshots),
            specs: (sp.specs && Object.keys(sp.specs).length > 0) ? sp.specs : combined[idx].specs,
          };
        } else {
          combined.unshift(sp);
        }
      });
    }

    const formattedProducts = combined.map((p: any) => {
      const price = typeof p.price === 'string' ? parseFloat(p.price) : Number(p.price);
      const discountPrice = p.discountPrice
        ? (typeof p.discountPrice === 'string' ? parseFloat(p.discountPrice) : Number(p.discountPrice))
        : null;

      const category = Array.isArray(p.category) ? p.category[0] : (p.category || 'CORE_PARTS');
      const brand = p.brand || p.platform || 'DRX';
      const name = p.name || 'Linh Kiện DRX';
      const description = p.description || '';
      const coverImage = p.coverImage || '';
      const specs = (p.specs && Object.keys(p.specs).length > 0) ? p.specs : {};
      const screenshots = (Array.isArray(p.screenshots) && p.screenshots.length > 0) 
        ? p.screenshots 
        : (coverImage ? [coverImage] : []);

      return {
        id: p.id,
        name,
        slug: p.slug || name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, ''),
        description,
        price,
        discountPrice,
        coverImage,
        category: Array.isArray(p.category) ? p.category : [category],
        brand,
        platform: p.platform || brand || 'PC',
        type: category,
        deliveryMethod: resolveDeliveryMethod(p),
        mediaOrder: p.mediaOrder || 'image_first',
        status: p.status !== false,
        isFlashDeal: Boolean(p.isFlashDeal),
        flashSaleEnd: p.flashSaleEnd ? new Date(p.flashSaleEnd).toISOString() : null,
        isFeaturedDeal: Boolean(p.isFeaturedDeal || p.isFeatured),
        tags: p.tags || [],
        screenshots,
        specs,
        warrantyMonths: p.warrantyMonths || 36
      };
    });

    return NextResponse.json({ products: formattedProducts }, { status: 200, headers });

  } catch (error: any) {
    console.error('Lỗi khi tải danh sách sản phẩm:', error);
    // Even on error, return INITIAL_PRODUCTS so products ALWAYS show!
    const fallbackProducts = INITIAL_PRODUCTS.map(p => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      description: p.description,
      price: p.price,
      discountPrice: p.discountPrice || null,
      coverImage: p.coverImage,
      category: p.category,
      brand: p.brand,
      platform: p.brand,
      type: p.category,
      deliveryMethod: 'GIFT',
      status: true,
      screenshots: [p.coverImage],
      specs: p.specs,
      warrantyMonths: p.warrantyMonths
    }));
    return NextResponse.json({ products: fallbackProducts }, { status: 200, headers });
  }
}
