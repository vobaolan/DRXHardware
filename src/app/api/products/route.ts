import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { supabase } from '@/lib/supabase';
import { INITIAL_PRODUCTS } from '@/lib/hardware-data';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const headers = {
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
    'Surrogate-Control': 'no-store'
  };

  try {
    const url = new URL(request.url);
    const categoryFilter = url.searchParams.get('category')?.toUpperCase();

    // 1. Primary fetch from Prisma PostgreSQL
    let dbProducts: any[] = [];
    try {
      dbProducts = await prisma.product.findMany({
        orderBy: { createdAt: 'desc' },
      });
    } catch (e) {
      console.warn('Prisma fetch notice, trying Supabase fallback:', e);
    }

    // 2. Fallback to Supabase client if Prisma had no records
    if (!dbProducts || dbProducts.length === 0) {
      try {
        const { data } = await supabase
          .from('Product')
          .select('*')
          .order('createdAt', { ascending: false });
        if (data && data.length > 0) {
          dbProducts = data;
        }
      } catch (e) {}
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

    if (dbProducts && Array.isArray(dbProducts) && dbProducts.length > 0) {
      dbProducts.forEach((sp: any) => {
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

    let formattedProducts = combined.map((p: any) => {
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
