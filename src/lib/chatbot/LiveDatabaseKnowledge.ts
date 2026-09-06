import { supabase } from '@/lib/supabase';

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
   * Fetch all live products directly from Supabase Cloud Database
   * with strict newest-first sorting.
   */
  async getAllLiveProducts(): Promise<LiveProduct[]> {
    let dbProducts: any[] = [];

    // Query Supabase REST API directly
    try {
      const { data, error } = await supabase
        .from('Product')
        .select('*')
        .order('createdAt', { ascending: false });

      if (!error && data && Array.isArray(data)) {
        dbProducts = data;
      }
    } catch (e) {}

    const validDb = Array.isArray(dbProducts) ? [...dbProducts] : [];
    validDb.sort((a, b) => {
      const timeA = new Date(a.updatedAt || a.createdAt || 0).getTime();
      const timeB = new Date(b.updatedAt || b.createdAt || 0).getTime();
      return timeB - timeA;
    });

    return validDb.map((p: any) => {
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
   * Search matching products in Supabase real-time with smart NLP keyword matching
   */
  async searchLiveProducts(query: string, limit = 3): Promise<LiveProduct[]> {
    const all = await this.getAllLiveProducts();
    const cleanQ = query.toLowerCase().trim();
    if (!cleanQ) return all.slice(0, limit);

    // Vietnamese common stop words to prevent noise in keyword scoring
    const STOP_WORDS = new Set([
      'đang', 'bán', 'giá', 'nhiêu', 'bao', 'nhiêu', 'mua', 'có', 'không', 'cho', 'hỏi',
      'là', 'gì', 'ở', 'đâu', 'này', 'được', 'nào', 'với', 'và', 'của', 'mình', 'bạn',
      'shop', 'ad', 'ạ', 'ơi', 'nha', 'nhé', 'tìm', 'kiếm', 'xem', 'hàng', 'còn', 'hết',
      'tư', 'vấn', 'cần', 'muốn', 'giúp', 'em', 'anh', 'chị', 'mẫu', 'loại', 'cái', 'thế'
    ]);

    const rawKeywords = cleanQ.split(/[\s,.\-_\/]+/).filter(w => w.length > 1);
    const keywords = rawKeywords.filter(w => !STOP_WORDS.has(w));
    const effectiveKeywords = keywords.length > 0 ? keywords : rawKeywords;

    const scored = all.map(p => {
      let score = 0;
      const nameLower = p.name.toLowerCase();
      const catLower = p.category.toLowerCase();
      const brandLower = p.brand.toLowerCase();
      const descLower = p.description.toLowerCase();
      const specsStr = JSON.stringify(p.specs).toLowerCase();

      // Exact phrase match in Name
      if (nameLower.includes(cleanQ)) score += 80;
      if (cleanQ.includes(nameLower)) score += 60;
      if (brandLower && cleanQ.includes(brandLower)) score += 25;

      // Keyword matches
      let matchedKwCount = 0;
      for (const kw of effectiveKeywords) {
        if (nameLower.includes(kw)) {
          score += 20;
          matchedKwCount++;
        } else if (brandLower.includes(kw)) {
          score += 15;
          matchedKwCount++;
        } else if (catLower.includes(kw)) {
          score += 10;
          matchedKwCount++;
        } else if (specsStr.includes(kw)) {
          score += 8;
        } else if (descLower.includes(kw)) {
          score += 4;
        }
      }

      // Bonus if all query keywords match the product
      if (effectiveKeywords.length > 1 && matchedKwCount >= effectiveKeywords.length) {
        score += 40;
      }

      return { product: p, score };
    });

    const validMatches = scored.filter(item => item.score > 0).sort((a, b) => b.score - a.score);
    if (validMatches.length === 0) return [];

    const topScore = validMatches[0].score;
    // Only keep results with at least 50% of the top score to avoid irrelevant product pollution
    const filtered = validMatches
      .filter(item => item.score >= Math.max(20, topScore * 0.45))
      .map(item => item.product);

    return filtered.slice(0, limit);
  }

  /**
   * Generate a comprehensive live context string to feed to LLM
   */
  async buildLiveStoreContext(userQuery: string): Promise<string> {
    const allProducts = await this.getAllLiveProducts();
    const matched = await this.searchLiveProducts(userQuery, 3);

    // Format top matching products
    const matchedStr = matched.length > 0 
      ? matched.map(p => {
          const priceFormatted = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p.price);
          const discFormatted = p.discountPrice ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p.discountPrice) : null;
          const specsEntries = Object.entries(p.specs).slice(0, 4).map(([k, v]) => `${k}: ${v}`).join(' | ');

          return `- [${p.category}] **${p.name}** (Hãng: ${p.brand})\n  * Giá bán: ${discFormatted ? `${discFormatted} (Giá gốc ${priceFormatted})` : priceFormatted}\n  * Tồn kho: ${p.inStock ? `Còn ${p.stockQuantity} món` : 'Tạm hết hàng'}\n  * Bảo hành: ${p.warrantyMonths} Tháng chính hãng\n  * Đường dẫn: /products/${p.slug}\n  * Thông số: ${specsEntries || 'Chính hãng 100%'}`;
        }).join('\n\n')
      : 'Không có sản phẩm nào trùng khớp trực tiếp với từ khóa này.';

    return `=== DỮ LIỆU THỜI GIAN THỰC TỪ CƠ SỞ DỮ LIỆU STORE DRX HARDWARE ===
Tổng số sản phẩm trong kho: ${allProducts.length} sản phẩm.

[SẢN PHẨM PHÙ HỢP VỚI CÂU HỎI KHÁCH HÀNG]:
${matchedStr}

[CHÍNH SÁCH BÁN HÀNG & DỊCH VỤ]:
• Showroom: 128 Nguyễn Trãi, Q.1, TP. Hồ Chí Minh.
• Hotline: 1900.88.99.77.
• Giao hàng toàn quốc, thanh toán COD khi nhận hàng.
• Bảo hành 36 tháng chính hãng (1 đổi 1 trong 30 ngày).
• Lắp ráp PC & cài đặt Windows/Driver miễn phí.`;
  }
}

export const liveDatabaseKnowledge = new LiveDatabaseKnowledge();
