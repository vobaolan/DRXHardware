import { Logger } from './Logger';
import { liveDatabaseKnowledge, LiveProduct } from './LiveDatabaseKnowledge';

export class DeepSeekClient {
  /**
   * Main method to generate chat completion with Live Supabase Database context
   */
  async generateChatCompletion(messages: any[], tools?: any[]) {
    try {
      const lastUserMsgObj = [...messages].reverse().find((m: any) => m.role === 'user');
      const userText = lastUserMsgObj ? String(lastUserMsgObj.content).trim() : '';

      Logger.info(`[Realtime AI Engine] Processing query with Live Supabase DB: "${userText}"`);

      // 1. Fetch live products from Supabase matching the user's inquiry
      const matchedProducts = await liveDatabaseKnowledge.searchLiveProducts(userText, 5);
      const allLiveProducts = await liveDatabaseKnowledge.getAllLiveProducts();

      // 2. Build live store context
      const liveContext = await liveDatabaseKnowledge.buildLiveStoreContext(userText);

      // 3. Try Calling External LLM API (Groq -> DeepSeek -> Gemini) with Live Database context
      const aiReply = await this.callLLMWithContext(messages, liveContext);
      if (aiReply) {
        return {
          role: 'assistant',
          content: aiReply,
          matchedProducts,
        };
      }

      // 4. Robust Real-time Fallback Engine using Live Supabase Data
      return this.generateLiveRuleBasedResponse(userText, matchedProducts, allLiveProducts);

    } catch (error: any) {
      Logger.error('Realtime Chatbot Engine Error', error);
      const allLive = await liveDatabaseKnowledge.getAllLiveProducts().catch(() => []);
      return {
        role: 'assistant',
        content: `Xin chào! DRX CyberBot AI đang kết nối với cơ sở dữ liệu Supabase (${allLive.length} sản phẩm). Bạn cần tìm linh kiện hoặc tư vấn cấu hình PC nào hãy gõ tên sản phẩm nhé!`,
        matchedProducts: allLive.slice(0, 3),
      };
    }
  }

  /**
   * Call Groq or DeepSeek or Gemini API with live context
   */
  private async callLLMWithContext(messages: any[], liveContext: string): Promise<string | null> {
    const groqKey = process.env.GROQ_API_KEY;
    const deepseekKey = process.env.DEEPSEEK_API_KEY;

    const systemPromptWithLiveDB = `Bạn là DRX CyberBot AI 🤖⚡ - Trợ lý AI chuyên nghiệp tư vấn phần cứng máy tính tại DRX Hardware.

THÔNG TIN THỜI GIAN THỰC TỪ CƠ SỞ DỮ LIỆU SUPABASE CỦA WEBSITE:
${liveContext}

QUY TẮC PHẢN HỒI:
1. Luôn sử dụng dữ liệu thực tế từ cơ sở dữ liệu Supabase được cung cấp ở trên (tên sản phẩm, giá bán, bảo hành, tình trạng còn hàng, đường link /products/[slug]).
2. Nếu admin vừa thêm sản phẩm mới vào Supabase, sản phẩm đó đã có trong danh sách trên, hãy tự tin trả lời và giới thiệu cho khách hàng.
3. Luôn trả lời hoàn toàn bằng tiếng Việt thân thiện, chuyên nghiệp, chính xác về mặt kỹ thuật (socket CPU, bus RAM, công suất nguồn PSU, tương thích linh kiện).
4. Định dạng tiền tệ đẹp dạng VND (Ví dụ: 15.500.000 đ).
5. Không bịa đặt giá cả hoặc sản phẩm không có thật trong kho.`;

    const chatHistory = messages.map(m => ({
      role: m.role === 'user' ? 'user' : m.role === 'assistant' ? 'assistant' : 'system',
      content: m.content || '',
    }));

    // Method A: Groq Cloud API (Siêu tốc < 500ms)
    if (groqKey && groqKey.startsWith('gsk_')) {
      try {
        const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${groqKey}`,
          },
          body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            messages: [
              { role: 'system', content: systemPromptWithLiveDB },
              ...chatHistory.slice(-6),
            ],
            temperature: 0.5,
            max_tokens: 800,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          const content = data.choices?.[0]?.message?.content;
          if (content) return content;
        }
      } catch (e) {
        Logger.warn('Groq API call notice, trying fallback engine:', e);
      }
    }

    // Method B: DeepSeek API
    if (deepseekKey && deepseekKey.startsWith('sk-')) {
      try {
        const res = await fetch('https://api.deepseek.com/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${deepseekKey}`,
          },
          body: JSON.stringify({
            model: 'deepseek-chat',
            messages: [
              { role: 'system', content: systemPromptWithLiveDB },
              ...chatHistory.slice(-6),
            ],
            temperature: 0.5,
            max_tokens: 800,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          const content = data.choices?.[0]?.message?.content;
          if (content) return content;
        }
      } catch (e) {
        Logger.warn('DeepSeek API call notice:', e);
      }
    }

    return null;
  }

  /**
   * Real-time Semantic Pattern Matching using Live Supabase Records
   */
  private generateLiveRuleBasedResponse(userText: string, matchedProducts: LiveProduct[], allProducts: LiveProduct[]) {
    const q = userText.toLowerCase();

    // 1. Matched specific products in Supabase
    if (matchedProducts.length > 0) {
      const productListStr = matchedProducts.map(p => {
        const priceFormatted = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p.price);
        const discFormatted = p.discountPrice ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p.discountPrice) : null;
        return `• **[${p.category}] ${p.name}**\n  💵 Giá bán: **${discFormatted ? `${discFormatted} (Gốc ${priceFormatted})` : priceFormatted}**\n  📦 Tình trạng: ${p.inStock ? `Còn ${p.stockQuantity} món` : 'Hết hàng'} | 🛡️ Bảo hành: ${p.warrantyMonths} Tháng\n  🔗 Xem ngay: [/products/${p.slug}]`;
      }).join('\n\n');

      return {
        role: 'assistant',
        content: `Chào bạn! DRX CyberBot AI đã truy vấn cơ sở dữ liệu Supabase và tìm thấy các linh kiện phù hợp với yêu cầu của bạn:\n\n${productListStr}\n\n👉 Bạn có thể bấm trực tiếp vào sản phẩm để xem thông số chi tiết hoặc thêm vào giỏ hàng nhé!`,
        matchedProducts,
      };
    }

    // 2. Keyword Intents
    if (q.includes('bảo hành') || q.includes('bao hanh') || q.includes('serial')) {
      return {
        role: 'assistant',
        content: '🛡️ **Chính Sách Bảo Hành Điện Tử DRX Hardware**:\n• Toàn bộ linh kiện (VGA, CPU, Mainboard, RAM, SSD, Màn hình) và PC Prebuilt bán ra đều được bảo hành chính hãng **36 Tháng**.\n• Đổi mới 1-đổi-1 trong 30 ngày đầu tiên nếu phát sinh lỗi từ nhà sản xuất.\n• Bạn có thể vào mục **"Tra Cứu Bảo Hành"** trên website, nhập mã Serial (SN) hoặc Số điện thoại để xuất phiếu bảo hành chính hãng tức thì!',
        matchedProducts: allProducts.slice(0, 2),
      };
    }

    if (q.includes('giao hàng') || q.includes('ship') || q.includes('vận chuyển') || q.includes('địa chỉ') || q.includes('showroom')) {
      return {
        role: 'assistant',
        content: '🚚 **Hình Thức Giao Nhận DRX Hardware**:\n1. **Giao hàng tận nơi toàn quốc:** Đóng gói 3 lớp xốp chống va đập, miễn phí vận chuyển tiêu chuẩn 1 - 3 ngày làm việc.\n2. **Nhận tại Showroom DRX:** Nhận trực tiếp tại Showroom DRX Hardware (TP. Hồ Chí Minh), hỗ trợ kiểm tra linh kiện và ráp PC tại chỗ!\n\n📍 Giờ mở cửa Showroom: 08:00 - 21:30 (Mở cửa tất cả các ngày trong tuần).',
        matchedProducts: allProducts.slice(0, 2),
      };
    }

    if (q.includes('thanh toán') || q.includes('cod') || q.includes('trả tiền')) {
      return {
        role: 'assistant',
        content: '💵 **Phương Thức Thanh Toán Tại DRX Hardware**:\n• **COD (Thu tiền khi nhận hàng):** Khách hàng được kiểm tra ngoại quan linh kiện, thùng xốp niêm phong trước khi thanh toán tiền mặt hoặc chuyển khoản cho shipper.\n• An toàn 100%, không lo rủi ro thanh toán trước!',
        matchedProducts: allProducts.slice(0, 2),
      };
    }

    if (q.includes('lắp ráp') || q.includes('ráp máy') || q.includes('build pc') || q.includes('cài win')) {
      return {
        role: 'assistant',
        content: '🛠️ **Dịch Vụ Lắp Ráp & Cài Đặt PC Miễn Phí**:\n• Khi đặt linh kiện tại trang Checkout, bạn chỉ cần tick chọn: *"Tôi cần hỗ trợ lắp đặt / cài đặt"*.\n• Kỹ thuật viên DRX sẽ hỗ trợ đi dây thẩm mỹ, dán keo tản nhiệt cao cấp, cài sẵn Windows/Driver và chạy test FurMark/Cinebench kiểm tra nhiệt độ Full-load trước khi bàn giao!',
        matchedProducts: allProducts.slice(0, 3),
      };
    }

    // 3. Newest products summary
    const newestList = allProducts.slice(0, 4).map(p => {
      const priceFormatted = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p.price);
      return `• **${p.name}** - ${priceFormatted} [/products/${p.slug}]`;
    }).join('\n');

    return {
      role: 'assistant',
      content: `Xin chào! DRX CyberBot AI đang đồng bộ trực tiếp với cơ sở dữ liệu Supabase (${allProducts.length} linh kiện phần cứng có sẵn trong kho).\n\n🔥 **Một số linh kiện mới nhất vừa cập nhật:**\n${newestList}\n\nBạn cần tư vấn cấu hình PC hay tìm linh kiện theo ngân sách nào? Hãy nhắn cho mình nhé!`,
      matchedProducts: allProducts.slice(0, 4),
    };
  }

  async generateSimpleResponse(messages: any[]) {
    return this.generateChatCompletion(messages);
  }
}

export const deepSeekClient = new DeepSeekClient();
