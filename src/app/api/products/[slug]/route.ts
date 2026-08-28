import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { prisma } from '@/lib/prisma';
import { INITIAL_PRODUCTS } from '@/lib/hardware-data';

export const dynamic = 'force-dynamic';

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
    const { slug } = params;

    if (!slug) {
      return NextResponse.json({ message: 'Slug là bắt buộc' }, { status: 400, headers });
    }

    const baseSlug = slug.split('-')[0].toLowerCase();

    // 1. Primary: Supabase
    let supaProduct: any = null;
    try {
      const { data: supabaseProducts } = await supabase
        .from('Product')
        .select('*');
      if (supabaseProducts && supabaseProducts.length > 0) {
        supaProduct = supabaseProducts.find((p: any) => 
          p.slug === slug || 
          p.id === slug || 
          slug.startsWith(p.slug) || 
          p.slug.startsWith(baseSlug) ||
          p.name.toLowerCase().includes(baseSlug)
        );
      }
    } catch (e) {}

    // 2. Prisma fallback
    let prismaProduct: any = null;
    if (!supaProduct) {
      try {
        prismaProduct = await prisma.product.findUnique({
          where: { slug },
        });
        if (!prismaProduct) {
          const allPrisma = await prisma.product.findMany();
          prismaProduct = allPrisma.find((p) => 
            p.slug === slug || 
            slug.startsWith(p.slug) || 
            p.slug.startsWith(baseSlug) ||
            p.name.toLowerCase().includes(baseSlug)
          ) || null;
        }
      } catch (e) {}
    }

    // 3. INITIAL_PRODUCTS hardware catalog fallback
    const initMatch = INITIAL_PRODUCTS.find(
      (p) => p.slug === slug || p.id === slug || slug.startsWith(p.slug) || p.slug.startsWith(baseSlug)
    );

    const product = supaProduct || prismaProduct || (initMatch ? {
      ...initMatch,
      platform: initMatch.brand,
      type: initMatch.category,
      status: true,
    } : null);

    if (product) {
      const price = typeof product.price === 'string' ? parseFloat(product.price) : Number(product.price);
      const discountPrice = product.discountPrice
        ? (typeof product.discountPrice === 'string' ? parseFloat(product.discountPrice) : Number(product.discountPrice))
        : null;

      let trailerUrls: string[] = [];
      if (product.trailerUrl) {
        trailerUrls = product.trailerUrl.split(' | ').filter((u: any) => u.trim().length > 0).map((u: any) => u.trim());
      }

      const screenshots = product.screenshots && Array.isArray(product.screenshots) && product.screenshots.length > 0 
        ? product.screenshots 
        : (product.coverImage ? [product.coverImage] : []);

      return NextResponse.json(
        {
          product: {
            id: product.id,
            name: product.name,
            slug: product.slug,
            description: product.description,
            price,
            discountPrice,
            coverImage: product.coverImage,
            screenshots,
            category: Array.isArray(product.category) ? product.category : [product.category],
            platform: product.platform || product.brand || 'PC',
            type: product.type || product.category,
            deliveryMethod: product.deliveryMethod || 'GIFT',
            mediaOrder: product.mediaOrder || 'image_first',
            status: product.status !== false,
            isFlashDeal: Boolean(product.isFlashDeal),
            flashSaleEnd: product.flashSaleEnd ? new Date(product.flashSaleEnd).toISOString() : null,
            isFeaturedDeal: Boolean(product.isFeaturedDeal || product.isFeatured),
            tags: product.tags || [],
            specs: product.specs || {},
            warrantyMonths: product.warrantyMonths || 36,
            trailerUrl: product.trailerUrl,
            trailerUrls,
            minimumReq: product.minimumReq,
            recommendedReq: product.recommendedReq,
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
