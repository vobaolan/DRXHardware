import { Logger } from './Logger';
import { liveDatabaseKnowledge, LiveProduct, removeVietnameseTones } from './LiveDatabaseKnowledge';

export class DeepSeekClient {
  /**
   * Main method to generate chat completion with Live Supabase Database context
   */
  async generateChatCompletion(messages: any[], tools?: any[]) {
    try {
      const lastUserMsgObj = [...messages].reverse().find((m: any) => m.role === 'user');
      const userText = lastUserMsgObj ? String(lastUserMsgObj.content).trim() : '';
      const userTextNoTone = removeVietnameseTones(userText);

      Logger.info(`[Realtime AI Engine] Processing query with Live Supabase DB: "${userText}"`);

      // 1. Check if query is asking for PC Build Consultation (Tư vấn Build PC / Cấu hình máy tính)
      const isBuildInquiry = 
        userTextNoTone.includes('build pc') ||
        userTextNoTone.includes('rap pc') ||
        userTextNoTone.includes('rap may') ||
        userTextNoTone.includes('cau hinh') ||
        userTextNoTone.includes('tu van pc') ||
        userTextNoTone.includes('tu van may') ||
        userTextNoTone.includes('dan may') ||
        userTextNoTone.includes('case pc') ||
        userTextNoTone.includes('tu van build') ||
        userTextNoTone.match(/pc\s*\d+\s*(trieu|tr|cu|m)/i) ||
        userTextNoTone.match(/may\s*\d+\s*(trieu|tr|cu|m)/i) ||
        userTextNoTone.match(/build\s*\d+\s*(trieu|tr|cu|m)/i) ||
        userTextNoTone.match(/tam\s*\d+\s*(trieu|tr|cu|m)/i);

      if (isBuildInquiry) {
        Logger.info(`[PC Builder AI] Detected build consultation request: "${userText}"`);
        const buildResult = await liveDatabaseKnowledge.recommendPCBuild(userText);
        
        // Check if LLM API is available to enrich the consultation tone
        const liveContext = await liveDatabaseKnowledge.buildLiveStoreContext(userText);
        const enrichedContext = `${liveContext}\n\n[ĐỀ XUẤT CẤU HÌNH PC CHUẨN ĐÃ TÍNH TOÁN]:\n${buildResult.summaryMarkdown}`;
        
        const aiReply = await this.callLLMWithContext(messages, enrichedContext, true);
        if (aiReply) {
          return {
            role: 'assistant',
            content: aiReply,
            matchedProducts: buildResult.matchedProducts,
          };
        }

        // Direct high-precision fallback
        return {
          role: 'assistant',
          content: buildResult.summaryMarkdown,
          matchedProducts: buildResult.matchedProducts,
        };
      }

      // 2. Fetch live products from Supabase matching the user's inquiry
      const matchedProducts = await liveDatabaseKnowledge.searchLiveProducts(userText, 5);
      const allLiveProducts = await liveDatabaseKnowledge.getAllLiveProducts();

      // 3. Build live store context
      const liveContext = await liveDatabaseKnowledge.buildLiveStoreContext(userText);

      // 4. Try Calling External LLM API (Groq -> DeepSeek) with Live Database context
      const aiReply = await this.callLLMWithContext(messages, liveContext);
      if (aiReply) {
        return {
          role: 'assistant',
          content: aiReply,
          matchedProducts,
        };
      }

      // 5. Robust Real-time Fallback Engine using Live Supabase Data
      return this.generateLiveRuleBasedResponse(userText, matchedProducts, allLiveProducts);

    } catch (error: any) {
      Logger.error('Realtime Chatbot Engine Error', error);
      const allLive = await liveDatabaseKnowledge.getAllLiveProducts().catch(() => []);
      return {
        role: 'assistant',
        content: `Xin chào! DRX CyberBot AI sẵn sàng hỗ trợ bạn (${allLive.length} sản phẩm chính hãng sẵn hàng). Bạn cần tìm linh kiện hoặc tư vấn cấu hình PC nào hãy gõ tên sản phẩm nhé!`,
        matchedProducts: allLive.slice(0, 3),
      };
    }
  }

  /**
   * Call Groq or DeepSeek API with live context
   */
  private async callLLMWithContext(messages: any[], liveContext: string, isBuild = false): Promise<string | null> {
    const groqKey = process.env.GROQ_API_KEY;
    const deepseekKey = process.env.DEEPSEEK_API_KEY;

    const systemPromptWithLiveDB = `Bạn là DRX CyberBot AI 🤖⚡ - Chuyên gia công nghệ phần cứng & tư vấn DRX Build PC tại DRX Hardware (chuẩn thông minh như Google Antigravity).

DỮ LIỆU KHO HÀNG & THÔNG TIN THỰC TẾ TRÊN HỆ THỐNG SUPABASE:
${liveContext}

QUY TẮC TRẢ LỜI:
1. TRẢ LỜI CHÍNH XÁC, CHUẨN KỸ THUẬT: Sử dụng dữ liệu giá bán, khuyến mãi, tình trạng kho và bảo hành từ hệ thống.
2. DẪN LINK NHANH TỚI SẢN PHẨM: Khi nhắc đến sản phẩm, luôn gắn link markdown dạng [Tên sản phẩm](/products/slug-san-pham). Nếu tư vấn build PC, luôn dẫn link [DRX PC Builder](/pc-builder) để khách tùy biến.
3. NẾU KHÁCH HỎI TƯ VẤN BUILD PC: Trình bày bảng chi tiết linh kiện (CPU, Mainboard, RAM, VGA, SSD, Nguồn, Case, Tản nhiệt), tổng chi phí, bảo hành, đánh giá hiệu năng FPS thực tế và độ tương thích linh kiện.
4. NẾU KHÁCH HỎI GIÁ SẢN PHẨM: Báo giá niêm yết và giá khuyến mãi (VND), bảo hành bao nhiêu tháng và tình trạng còn hàng.
5. Giọng điệu chuyên nghiệp, am hiểu sâu sắc phần cứng, lịch sự và hỗ trợ tận tâm.`;

    const chatHistory = messages.map(m => ({
      role: m.role === 'user' ? 'user' : m.role === 'assistant' ? 'assistant' : 'system',
      content: m.content || '',
    }));

    // Method A: Groq Cloud API
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
            max_tokens: isBuild ? 800 : 400,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          const content = data.choices?.[0]?.message?.content;
          if (content) return content;
        }
      } catch (e) {
        Logger.warn('Groq API call notice:', e);
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
            max_tokens: isBuild ? 800 : 400,
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
    const qNoTone = removeVietnameseTones(userText);
    const formatVND = (num: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num);

    // 1. Matched specific products in Supabase
    if (matchedProducts.length > 0) {
      if (matchedProducts.length === 1) {
        const p = matchedProducts[0];
        const priceFormatted = formatVND(p.price);
        const discFormatted = p.discountPrice ? formatVND(p.discountPrice) : null;
        
        return {
          role: 'assistant',
          content: `Dạ, DRX Hardware hiện có sẵn sản phẩm **${p.name}** chính hãng:
• **Giá ưu đãi**: ${discFormatted ? `**${discFormatted}** (giá gốc ~~${priceFormatted}~~)` : `**${priceFormatted}**`}
• **Bảo hành**: **${p.warrantyMonths} Tháng chính hãng (1 đổi 1)**
• **Tình trạng kho**: ${p.inStock ? `📦 **Còn hàng** (${p.stockQuantity} sản phẩm sẵn có)` : '🚫 **Tạm hết hàng**'}
• **Giao hàng**: Miễn phí vận chuyển COD toàn quốc, đồng kiểm trước khi nhận.

👉 Mời bạn xem chi tiết thông số và đặt hàng nhanh qua thẻ sản phẩm bên dưới:`,
          matchedProducts: [p],
        };
      }

      // Multiple matched items
      const topProducts = matchedProducts.slice(0, 4);
      let categoryHeader = 'sản phẩm';
      if (qNoTone.includes('ram') && (qNoTone.includes('laptop') || qNoTone.includes('sodimm'))) {
        categoryHeader = `mẫu **RAM Laptop (SODIMM) ${qNoTone.includes('ddr5') ? 'DDR5' : qNoTone.includes('ddr4') ? 'DDR4' : ''}**`;
      } else if (qNoTone.includes('ram')) {
        categoryHeader = `mẫu **RAM ${qNoTone.includes('ddr5') ? 'DDR5' : qNoTone.includes('ddr4') ? 'DDR4' : ''}**`;
      } else if (qNoTone.includes('vga') || qNoTone.includes('card')) {
        categoryHeader = 'mẫu **Card màn hình VGA**';
      } else if (qNoTone.includes('cpu') || qNoTone.includes('chip')) {
        categoryHeader = 'mã **CPU / Vi xử lý**';
      } else if (qNoTone.includes('ssd') || qNoTone.includes('o cung')) {
        categoryHeader = 'mẫu **Ổ cứng SSD / NVMe**';
      } else if (qNoTone.includes('laptop')) {
        categoryHeader = 'mẫu **Laptop Gaming & Đồ họa**';
      }

      return {
        role: 'assistant',
        content: `Dạ, DRX Hardware hiện có **${matchedProducts.length} ${categoryHeader}** chính hãng sẵn hàng tại kho, bảo hành 36 tháng 1 đổi 1.\n\n👉 Bạn có thể bấm trực tiếp vào từng thẻ bên dưới để xem thông số chi tiết, kiểm tra tồn kho và đặt mua nhanh nhé:`,
        matchedProducts: topProducts,
      };
    }

    // 2. Keyword Policies & Inquiries
    if (qNoTone.includes('bao hanh') || qNoTone.includes('serial') || qNoTone.includes('sn')) {
      return {
        role: 'assistant',
        content: '🛡️ **Chính Sách Bảo Hành 36 Tháng Chính Hãng Tại DRX Hardware**:\n• 1 đổi 1 trong 30 ngày đầu tiên nếu phát sinh lỗi phần cứng.\n• Bảo hành theo mã Serial (SN) điện tử chính xác, không lo mất hóa đơn.\n• Bạn có thể tra cứu nhanh tại: [**Trang Tra Cứu Bảo Hành SN**](/warranty).',
        matchedProducts: allProducts.slice(0, 2),
      };
    }

    if (qNoTone.includes('giao hang') || qNoTone.includes('ship') || qNoTone.includes('van chuyen') || qNoTone.includes('dia chi') || qNoTone.includes('showroom')) {
      return {
        role: 'assistant',
        content: '🚚 **Giao Hàng & Showroom DRX Hardware**:\n• **Showroom**: 128 Nguyễn Trãi, Q.1, TP. Hồ Chí Minh (Mở cửa 08:00 - 21:30 hàng ngày).\n• **Giao hàng**: Toàn quốc qua bưu cục hỏa tốc (1-3 ngày), hỗ trợ kiểm tra hàng trước khi thanh toán COD.\n• **Hotline hỗ trợ**: 1900.88.99.77.',
        matchedProducts: allProducts.slice(0, 2),
      };
    }

    if (qNoTone.includes('thanh toan') || qNoTone.includes('cod') || qNoTone.includes('tra tien') || qNoTone.includes('vietqr')) {
      return {
        role: 'assistant',
        content: '💵 **Phương Thức Thanh Toán Linh Hoạt & An Toàn**:\n• Thanh toán khi nhận hàng (COD) tận nhà.\n• Chuyển khoản VietQR / NAPAS 24/7 tức thì.\n• Miễn phí hoàn toàn phí giao dịch.',
        matchedProducts: allProducts.slice(0, 2),
      };
    }

    if (qNoTone.includes('lap rap') || qNoTone.includes('rap may') || qNoTone.includes('cai win') || qNoTone.includes('di day')) {
      return {
        role: 'assistant',
        content: '🛠️ **Dịch Vụ Lắp Ráp & Kỹ Thuật Miễn Phí**:\n• Miễn phí 100% công lắp ráp máy, đi dây giấu nguồn thẩm mỹ cao.\n• Cài đặt sẵn Windows 11 bản quyền, Driver phần cứng và các phần mềm văn phòng/gaming cơ bản.\n• Chạy Stress Test FurMark & Cinebench kiểm tra nhiệt độ full-load ổn định trước khi đóng gói giao hàng!',
        matchedProducts: allProducts.slice(0, 2),
      };
    }

    // 3. Fallback greeting
    return {
      role: 'assistant',
      content: `Xin chào! Mình là **DRX CyberBot AI** 🤖⚡ — Trợ lý AI phần cứng tại DRX Hardware.\n\nBạn có thể hỏi mình bất kỳ câu hỏi nào như:\n• *"Giá VGA RTX 4060 bao nhiêu?"*\n• *"Tư vấn cấu hình PC Gaming 20 triệu chơi Valorant, Black Myth Wukong"*\n• *"Cấu hình 15 triệu làm đồ họa Premiere"* hoặc mở trực tiếp [**DRX PC Builder**](/pc-builder) nhé!`,
      matchedProducts: allProducts.slice(0, 2),
    };
  }

  async generateSimpleResponse(messages: any[]) {
    return this.generateChatCompletion(messages);
  }
}

export const deepSeekClient = new DeepSeekClient();

