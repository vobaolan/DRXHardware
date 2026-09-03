import { BaseTool } from './BaseTool';
import { liveDatabaseKnowledge, LiveProduct } from '../LiveDatabaseKnowledge';

export class ProductSearchTool implements BaseTool {
  name = 'product_search';
  description = 'Tìm kiếm thông tin sản phẩm (giá bán, tồn kho, bảo hành, thông số kỹ thuật) trong cửa hàng DRX Hardware từ cơ sở dữ liệu Supabase theo thời gian thực. Luôn luôn gọi công cụ này khi khách hỏi về linh kiện cụ thể, giá cả, hoặc hỏi cửa hàng có bán sản phẩm nào đó không.';
  
  parameters = {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description: 'Tên linh kiện, thiết bị phần cứng hoặc từ khóa sản phẩm cần tìm kiếm (ví dụ: "RTX 4060", "Core i5 13400F", "RAM DDR5", "Bàn phím cơ")',
      },
    },
    required: ['query'],
  };

  async execute(args: any) {
    const { query } = args;

    try {
      const products = await liveDatabaseKnowledge.searchLiveProducts(query, 6);

      if (products.length === 0) {
        return { 
          message: `Không tìm thấy sản phẩm nào khớp với từ khóa "${query}" trong cơ sở dữ liệu. Bạn có thể gợi ý khách hàng xem các danh mục khác hoặc liên hệ hotline 1900.88.99.77.` 
        };
      }

      return products.map(p => this.formatProduct(p));
    } catch (error) {
      console.error('Error in ProductSearchTool:', error);
      return { error: 'Không thể truy vấn cơ sở dữ liệu sản phẩm lúc này.' };
    }
  }

  private formatProduct(p: LiveProduct) {
    const priceFormatted = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p.price);
    const discFormatted = p.discountPrice 
      ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p.discountPrice)
      : null;

    return {
      name: p.name,
      price: priceFormatted,
      discountPrice: discFormatted,
      status: p.inStock ? `Còn hàng (${p.stockQuantity} món)` : 'Hết hàng',
      category: p.category,
      brand: p.brand,
      warranty: `${p.warrantyMonths} Tháng chính hãng`,
      specs: p.specs,
      link: `/products/${p.slug}`,
    };
  }
}

