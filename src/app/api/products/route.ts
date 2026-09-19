import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { INITIAL_PRODUCTS } from '@/lib/hardware-data';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

// High-speed In-Memory Cache with 3s TTL
let memoryCachedProducts: any[] | null = null;
let lastCacheTimestamp = 0;
const CACHE_TTL_MS = 3 * 1000;

export function invalidateProductsCache() {
  memoryCachedProducts = null;
  lastCacheTimestamp = 0;
}

export async function GET(request: Request) {
  const headers = {
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
    'Pragma': 'no-cache',
    'Expires': '0',
    'Surrogate-Control': 'no-store'
  };

  try {
    const now = Date.now();
    let dbProducts: any[] = [];
    const url = new URL(request.url);
    const categoryFilter = url.searchParams.get('category')?.toUpperCase();
    const isBypassCache = url.searchParams.has('t') || url.searchParams.has('nocache');

    // Check memory cache first (unless cache-busting query is passed)
    if (!isBypassCache && memoryCachedProducts && (now - lastCacheTimestamp < CACHE_TTL_MS)) {
      dbProducts = memoryCachedProducts;
    } else {
      // 1. Fetch from Supabase Live Database
      try {
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
          memoryCachedProducts = chunked;
          lastCacheTimestamp = now;
        } else {
          const { data, error } = await supabase
            .from('Product')
            .select('*')
            .order('createdAt', { ascending: false });

          if (!error && data && Array.isArray(data)) {
            dbProducts = data;
            memoryCachedProducts = data;
            lastCacheTimestamp = now;
          } else {
            dbProducts = memoryCachedProducts || INITIAL_PRODUCTS;
          }
        }
      } catch (e) {
        console.warn('Supabase fetch error, fallback:', e);
        dbProducts = memoryCachedProducts || INITIAL_PRODUCTS;
      }
    }

    if (!dbProducts || dbProducts.length === 0) {
      dbProducts = INITIAL_PRODUCTS;
    }

    // Sort strictly newest first (by updatedAt or createdAt)
    const sortedProducts = [...dbProducts].sort((a, b) => {
      const timeA = new Date(a.updatedAt || a.createdAt || 0).getTime();
      const timeB = new Date(b.updatedAt || b.createdAt || 0).getTime();
      return timeB - timeA;
    });

    let formattedProducts = sortedProducts.map((p: any) => {
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
        deliveryMethod: 'SHIP',
        mediaOrder: p.mediaOrder || 'image_first',
        status: p.status !== false,
        isFlashDeal: Boolean(p.isFlashDeal),
        flashSaleEnd: p.flashSaleEnd ? new Date(p.flashSaleEnd).toISOString() : null,
        stockQuantity: p.stockQuantity !== undefined ? Number(p.stockQuantity) : 15,
        warrantyMonths: p.warrantyMonths ? Number(p.warrantyMonths) : 36,
        specs,
        screenshots,
        socket: p.socket,
        ramType: p.ramType,
        wattage: p.wattage,
        formFactor: p.formFactor,
        createdAt: p.createdAt ? new Date(p.createdAt).toISOString() : new Date().toISOString(),
        updatedAt: p.updatedAt ? new Date(p.updatedAt).toISOString() : new Date().toISOString(),
      };
    });

    // Optional category filtering
    if (categoryFilter && categoryFilter !== 'ALL') {
      formattedProducts = formattedProducts.filter(p => {
        const cats = Array.isArray(p.category) ? p.category.map(c => String(c).toUpperCase()) : [String(p.category).toUpperCase()];
        if (categoryFilter === 'CORE_PARTS') {
          return cats.some(c => ['CORE_PARTS', 'CPU', 'VGA', 'MAINBOARD', 'RAM'].includes(c));
        }
        if (categoryFilter === 'CASE_COOLING') {
          return cats.some(c => ['CASE', 'PSU', 'COOLING', 'CASE_COOLING'].includes(c));
        }
        if (categoryFilter === 'GEAR') {
          return cats.some(c => ['GEAR', 'KEYBOARD', 'HEADSET', 'MOUSE'].includes(c));
        }
        return cats.includes(categoryFilter);
      });
    }

    return NextResponse.json({ products: formattedProducts }, { status: 200, headers });
  } catch (error: any) {
    console.error('Lỗi khi lấy danh sách linh kiện sản phẩm:', error);
    return NextResponse.json({ products: INITIAL_PRODUCTS }, { status: 200, headers });
  }
}
