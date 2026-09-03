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

    const systemPromptWithLiveDB = `Bạn là DRX CyberBot AI 🤖⚡ - Trợ lý AI tư vấn linh kiện PC & Gaming Gear tại DRX Hardware.

DỮ LIỆU SẢN PHẨM & KHO HÀNG THỰC TẾ:
${liveContext}

QUY TẮC PHẢN HỒI (RẤT QUAN TRỌNG):
1. TRẢ LỜI NGẮN GỌN, TRỌNG TÂM (Tối đa 1 - 2 câu ngắn).
2. Khi khách hỏi giá hoặc sản phẩm, nêu rõ giá bán VND (ví dụ: 1.590.000 đ), bảo hành và tình trạng còn hàng.
3. TUYỆT ĐỐI KHÔNG liệt kê danh sách dài dòng, không gạch đầu dòng lặp đi lặp lại vì giao diện sẽ tự động hiển thị thẻ sản phẩm tương tác bên dưới câu trả lời.
4. Giọng điệu thân thiện, tự nhiên, chuẩn kỹ thuật phần cứng.`;

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
            temperature: 0.4,
            max_tokens: 300,
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
            temperature: 0.4,
            max_tokens: 300,
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
      if (matchedProducts.length === 1) {
        const p = matchedProducts[0];
        const priceFormatted = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p.price);
        const discFormatted = p.discountPrice ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p.discountPrice) : null;
        
        return {
          role: 'assistant',
          content: `Dạ, **${p.name}** hiện có giá ${discFormatted ? `ưu đãi **${discFormatted}** (giảm từ ${priceFormatted})` : `**${priceFormatted}**`}, bảo hành chính hãng **${p.warrantyMonths} tháng** (${p.inStock ? `còn ${p.stockQuantity} món` : 'tạm hết hàng'}).`,
          matchedProducts: [p],
        };
      }

      // 2 or 3 matched items
      const topProducts = matchedProducts.slice(0, 3);
      return {
        role: 'assistant',
        content: `DRX Hardware hiện có các sản phẩm phù hợp với tìm kiếm của bạn:`,
        matchedProducts: topProducts,
      };
    }

    // 2. Keyword Intents
    if (q.includes('bảo hành') || q.includes('bao hanh') || q.includes('serial')) {
      return {
        role: 'assistant',
        content: '🛡️ **Bảo Hành 36 Tháng Chính Hãng**: 1 đổi 1 trong 30 ngày đầu nếu phát sinh lỗi. Bạn có thể tra cứu nhanh bằng mã Serial (SN) trên website!',
        matchedProducts: allProducts.slice(0, 2),
      };
    }

    if (q.includes('giao hàng') || q.includes('ship') || q.includes('vận chuyển') || q.includes('địa chỉ') || q.includes('showroom')) {
      return {
        role: 'assistant',
        content: '🚚 **Giao Hàng & Showroom**:\n• Giao hàng COD toàn quốc (1-3 ngày).\n• Showroom: 128 Nguyễn Trãi, Q.1, HCM & 45 Thái Hà, Đống Đa, HN (08:00 - 21:30 hàng ngày).',
        matchedProducts: allProducts.slice(0, 2),
      };
    }

    if (q.includes('thanh toán') || q.includes('cod') || q.includes('trả tiền')) {
      return {
        role: 'assistant',
        content: '💵 **Thanh Toán COD An Toàn**: Bạn được kiểm tra kiện hàng niêm phong trước khi thanh toán tiền mặt hoặc chuyển khoản cho shipper!',
        matchedProducts: allProducts.slice(0, 2),
      };
    }

    if (q.includes('lắp ráp') || q.includes('ráp máy') || q.includes('build pc') || q.includes('cài win')) {
      return {
        role: 'assistant',
        content: '🛠️ **Lắp Ráp & Cài Đặt PC Miễn Phí**: Kỹ thuật viên DRX sẽ hỗ trợ ráp máy, đi dây gọn đẹp, cài sẵn Win/Driver và test nhiệt độ Full-load trước khi giao!',
        matchedProducts: allProducts.slice(0, 2),
      };
    }

    // 3. Fallback greeting
    return {
      role: 'assistant',
      content: `Xin chào! Mình là DRX CyberBot AI 🤖. Bạn cần tìm linh kiện, kiểm tra giá bán hay tư vấn cấu hình PC nào hãy gõ tên sản phẩm nhé!`,
      matchedProducts: allProducts.slice(0, 2),
    };
  }

  async generateSimpleResponse(messages: any[]) {
    return this.generateChatCompletion(messages);
  }
}

export const deepSeekClient = new DeepSeekClient();
