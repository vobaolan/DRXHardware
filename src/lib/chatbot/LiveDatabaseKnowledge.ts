import { prisma } from '@/lib/prisma';
import { supabase } from '@/lib/supabase';
import { INITIAL_PRODUCTS } from '@/lib/hardware-data';

export interface LiveProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  discountPrice: number | null;
  brand: string;
  category: string;
  warrantyMonths: number;
  stockQuantity: number;
  inStock: boolean;
  coverImage: string;
  description: string;
  specs: Record<string, any>;
  createdAt: string;
}

export class LiveDatabaseKnowledge {
  /**
   * Fetch all live products directly from PostgreSQL (Prisma) and Supabase Client
   * with strict newest-first sorting and deduplication.
   */
  async getAllLiveProducts(): Promise<LiveProduct[]> {
    let dbProducts: any[] = [];

    // 1. Primary query: Prisma
    try {
      dbProducts = await prisma.product.findMany({
        orderBy: { createdAt: 'desc' },
      });
    } catch (e) {
      // Ignore & fallback to Supabase
    }

    // 2. Fallback query: Supabase REST API
    if (!dbProducts || dbProducts.length === 0) {
      try {
        const { data, error } = await supabase
          .from('Product')
          .select('*')
          .order('createdAt', { ascending: false });

        if (!error && data && data.length > 0) {
          dbProducts = data;
        }
      } catch (e) {}
    }

    // 3. Merge Supabase DB items with Initial hardware seed
    const validDb = Array.isArray(dbProducts) ? [...dbProducts] : [];
    validDb.sort((a, b) => {
      const timeA = new Date(a.updatedAt || a.createdAt || 0).getTime();
      const timeB = new Date(b.updatedAt || b.createdAt || 0).getTime();
      return timeB - timeA;
    });

    const dbIds = new Set(validDb.map((p: any) => p.id));
    const dbSlugs = new Set(validDb.map((p: any) => p.slug));
    const dbNames = new Set(validDb.map((p: any) => (p.name || '').toLowerCase().trim()));

    const remainingSeeds = INITIAL_PRODUCTS.filter((ip: any) =>
      !dbIds.has(ip.id) &&
      !dbSlugs.has(ip.slug) &&
      !dbNames.has((ip.name || '').toLowerCase().trim())
    );

    const merged = [...validDb, ...remainingSeeds];

    return merged.map((p: any) => {
      const price = typeof p.price === 'string' ? parseFloat(p.price) : Number(p.price || 0);
      const discountPrice = p.discountPrice
        ? (typeof p.discountPrice === 'string' ? parseFloat(p.discountPrice) : Number(p.discountPrice))
        : null;
      const category = Array.isArray(p.category) ? p.category[0] : (p.category || 'CORE_PARTS');
      const brand = p.brand || p.platform || 'DRX';
      const stock = p.stockQuantity ?? p.stockCount ?? 10;
      const name = p.name || 'Linh kiện DRX';
      const slug = p.slug || name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');

      return {
        id: p.id || slug,
        name,
        slug,
        price,
        discountPrice,
        brand,
        category,
        warrantyMonths: Number(p.warrantyMonths || 36),
        stockQuantity: stock,
        inStock: stock > 0,
        coverImage: p.coverImage || '',
        description: p.description || '',
        specs: (p.specs && typeof p.specs === 'object') ? p.specs : {},
        createdAt: p.createdAt || new Date().toISOString(),
      };
    });
  }

  /**
   * Search matching products in Supabase real-time
   */
  async searchLiveProducts(query: string, limit = 6): Promise<LiveProduct[]> {
    const all = await this.getAllLiveProducts();
    const cleanQ = query.toLowerCase().trim();
    if (!cleanQ) return all.slice(0, limit);

    const keywords = cleanQ.split(/\s+/).filter(w => w.length > 1);

    const scored = all.map(p => {
      let score = 0;
      const nameLower = p.name.toLowerCase();
      const catLower = p.category.toLowerCase();
      const brandLower = p.brand.toLowerCase();
      const descLower = p.description.toLowerCase();
      const specsStr = JSON.stringify(p.specs).toLowerCase();

      // Exact phrase match
      if (nameLower.includes(cleanQ)) score += 50;
      if (catLower.includes(cleanQ)) score += 30;
      if (brandLower.includes(cleanQ)) score += 20;

      // Keyword matches
      for (const kw of keywords) {
        if (nameLower.includes(kw)) score += 15;
        if (catLower.includes(kw)) score += 10;
        if (brandLower.includes(kw)) score += 8;
        if (specsStr.includes(kw)) score += 6;
        if (descLower.includes(kw)) score += 3;
      }

      return { product: p, score };
    });

    return scored
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(item => item.product)
      .slice(0, limit);
  }

  /**
   * Generate a comprehensive live context string to feed to LLM
   */
  async buildLiveStoreContext(userQuery: string): Promise<string> {
    const allProducts = await this.getAllLiveProducts();
    const matched = await this.searchLiveProducts(userQuery, 5);

    // Format top matching products
    const matchedStr = matched.length > 0 
      ? matched.map(p => {
          const priceFormatted = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p.price);
          const discFormatted = p.discountPrice ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p.discountPrice) : null;
          const specsEntries = Object.entries(p.specs).slice(0, 5).map(([k, v]) => `${k}: ${v}`).join(' | ');

          return `- [${p.category}] **${p.name}** (Hãng: ${p.brand})\n  * Giá: ${discFormatted ? `${discFormatted} (Giá gốc ${priceFormatted})` : priceFormatted}\n  * Tồn kho: ${p.inStock ? `${p.stockQuantity} sản phẩm (Có sẵn)` : 'Hết hàng'}\n  * Bảo hành: ${p.warrantyMonths} Tháng chính hãng\n  * Link xem: /products/${p.slug}\n  * Thông số: ${specsEntries || 'Chính hãng 100%'}`;
        }).join('\n\n')
      : 'Không có sản phẩm nào trùng khớp trực tiếp với từ khóa này.';

    // Top 5 newest arrivals
    const newestStr = allProducts.slice(0, 5).map(p => 
      `• ${p.name} (${p.brand}) - ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p.price)} [/products/${p.slug}]`
    ).join('\n');

    return `=== DỮ LIỆU THỜI GIAN THỰC TỪ CƠ SỞ DỮ LIỆU SUPABASE (DRX HARDWARE STORE) ===
Tổng số sản phẩm hiện có trong kho: ${allProducts.length} sản phẩm.

[SẢN PHẨM KHỚP VỚI CÂU HỎI CỦA KHÁCH HÀNG]:
${matchedStr}

[DANH SÁCH SẢN PHẨM MỚI NHẤT TRONG KHO]:
${newestStr}

[CHÍNH SÁCH BÁN HÀNG & DỊCH VỤ DRX HARDWARE]:
1. Địa chỉ Showroom: Showroom DRX Hardware, TP. Hồ Chí Minh (Giờ mở cửa: 08:00 - 21:30).
2. Hình thức giao hàng: Giao hàng tận nơi toàn quốc (Vận chuyển tiêu chuẩn đóng xốp chống sốc) hoặc Nhận trực tiếp tại Showroom.
3. Thanh toán: Duy nhất COD - Thu tiền mặt hoặc chuyển khoản khi nhận và kiểm tra hàng tận tay.
4. Dịch vụ kỹ thuật: Hỗ trợ lắp ráp trọn bộ PC, cài sẵn Windows/Driver & test nhiệt độ Full-load trước khi giao.
5. Bảo hành: 36 Tháng chính hãng (1 đổi 1 trong 30 ngày đầu nếu có lỗi), tra cứu bảo hành điện tử theo Serial SN trên website.
6. Hotline tư vấn: 1900.88.99.77 | Email: cskh@drx.vn | Website: https://websitedrx.vercel.app`;
  }
}

export const liveDatabaseKnowledge = new LiveDatabaseKnowledge();
