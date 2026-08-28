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

    // Fallback to INITIAL_PRODUCTS if Supabase has 0 products
    const rawProducts = (supabaseProducts && supabaseProducts.length > 0) 
      ? supabaseProducts 
      : INITIAL_PRODUCTS.map(p => ({
          ...p,
          discountPrice: p.discountPrice || null,
          platform: p.brand,
          type: p.category,
          status: p.inStock,
          screenshots: p.screenshots || [p.coverImage]
        }));

    const formattedProducts = rawProducts.map((p: any) => {
      const price = typeof p.price === 'string' ? parseFloat(p.price) : Number(p.price);
      const discountPrice = p.discountPrice
        ? (typeof p.discountPrice === 'string' ? parseFloat(p.discountPrice) : Number(p.discountPrice))
        : null;

      const matchInit = INITIAL_PRODUCTS.find(
        (ip) => ip.id === p.id || ip.slug === p.slug || ip.name.toLowerCase() === (p.name || '').toLowerCase()
      );

      // Prioritize DB/edited attributes over static catalog
      const coverImage = p.coverImage || (matchInit ? matchInit.coverImage : '');
      const category = Array.isArray(p.category) ? p.category[0] : (p.category || matchInit?.category || 'CORE_PARTS');
      const brand = p.brand || matchInit?.brand || p.platform || 'DRX';
      const name = p.name || matchInit?.name || 'Linh Kiện DRX';
      const description = p.description || matchInit?.description || '';
      const specs = (p.specs && Object.keys(p.specs).length > 0) ? p.specs : (matchInit?.specs || {});
      const screenshots = (Array.isArray(p.screenshots) && p.screenshots.length > 0) 
        ? p.screenshots 
        : (matchInit?.screenshots || [coverImage]);

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
        isFlashDeal: p.isFlashDeal !== undefined ? Boolean(p.isFlashDeal) : (matchInit?.isFlashDeal || false),
        flashSaleEnd: p.flashSaleEnd ? new Date(p.flashSaleEnd).toISOString() : null,
        isFeaturedDeal: p.isFeaturedDeal !== undefined ? Boolean(p.isFeaturedDeal) : (matchInit?.isFeatured || false),
        tags: p.tags || [],
        screenshots,
        specs,
        warrantyMonths: p.warrantyMonths || matchInit?.warrantyMonths || 36
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
