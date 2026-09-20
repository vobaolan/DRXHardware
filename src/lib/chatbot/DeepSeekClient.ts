import { Logger } from './Logger';
import { liveDatabaseKnowledge, LiveProduct, LiveCoupon, removeVietnameseTones } from './LiveDatabaseKnowledge';

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

      // 1. Check if query is asking for Discount Codes / Coupons / Vouchers / Promotions
      const isCouponInquiry = 
        userTextNoTone.includes('ma giam') ||
        userTextNoTone.includes('voucher') ||
        userTextNoTone.includes('coupon') ||
        userTextNoTone.includes('khuyen mai') ||
        userTextNoTone.includes('uu dai') ||
        userTextNoTone.includes('code giam') ||
        userTextNoTone.includes('ma sale') ||
        userTextNoTone.includes('chiet khau') ||
        userTextNoTone.includes('co ma giam') ||
        userTextNoTone.includes('xin ma giam') ||
        userTextNoTone.includes('xin voucher') ||
        userTextNoTone.includes('ma freeship') ||
        userTextNoTone.includes('ma van chuyen') ||
        (userTextNoTone.includes('giam gia') && !userTextNoTone.includes('vga') && !userTextNoTone.includes('ram') && !userTextNoTone.includes('cpu') && !userTextNoTone.includes('ssd'));

      if (isCouponInquiry) {
        Logger.info(`[Coupon AI] Detected coupon/voucher inquiry: "${userText}"`);
        const liveCoupons = await liveDatabaseKnowledge.getLiveCoupons();
        const liveContext = await liveDatabaseKnowledge.buildLiveStoreContext(userText);

        // Try LLM API first
        const aiReply = await this.callLLMWithContext(messages, liveContext);
        if (aiReply) {
          return {
            role: 'assistant',
            content: aiReply,
            matchedProducts: [],
          };
        }

        // Direct high-precision fallback for coupons
        return {
          role: 'assistant',
          content: this.formatCouponsResponse(liveCoupons),
          matchedProducts: [],
        };
      }

      // 2. Check if query is asking for a specific hardware component
      const isSpecificComponentInquiry = 
        userTextNoTone.includes('card man hinh') ||
        userTextNoTone.includes('card do hoa') ||
        userTextNoTone.includes('vga') ||
        userTextNoTone.includes('cpu') ||
        userTextNoTone.includes('vi xu ly') ||
        userTextNoTone.includes('chip') ||
        userTextNoTone.includes('ram') ||
        userTextNoTone.includes('o cung') ||
        userTextNoTone.includes('ssd') ||
        userTextNoTone.includes('hdd') ||
        userTextNoTone.includes('nvme') ||
        userTextNoTone.includes('mainboard') ||
        userTextNoTone.includes('bo mach chu') ||
        userTextNoTone.includes('nguon') ||
        userTextNoTone.includes('psu') ||
        userTextNoTone.includes('vo case') ||
        userTextNoTone.includes('thung case') ||
        userTextNoTone.includes('tan nhiet') ||
        userTextNoTone.includes('cooling') ||
        userTextNoTone.includes('man hinh') ||
        userTextNoTone.includes('monitor') ||
        userTextNoTone.includes('laptop') ||
        userTextNoTone.includes('ban phim') ||
        userTextNoTone.includes('chuot') ||
        userTextNoTone.includes('tai nghe');

      // Check if query is asking for Full PC Build Consultation (Dàn PC / Bộ máy tính)
      const hasFullPcBuildKeywords = 
        userTextNoTone.includes('build pc') ||
        userTextNoTone.includes('rap pc') ||
        userTextNoTone.includes('lap rap pc') ||
        userTextNoTone.includes('tu van pc') ||
        userTextNoTone.includes('tu van dan pc') ||
        userTextNoTone.includes('tu van bo pc') ||
        userTextNoTone.includes('dan pc') ||
        userTextNoTone.includes('bo pc') ||
        userTextNoTone.includes('dan may') ||
        userTextNoTone.includes('bo may tinh') ||
        userTextNoTone.includes('cau hinh pc') ||
        userTextNoTone.includes('tu van build') ||
        userTextNoTone.match(/\bpc\s*\d+\s*(trieu|tr|cu|m)\b/i) ||
        userTextNoTone.match(/\bbuild\s*\d+\s*(trieu|tr|cu|m)\b/i) ||
        userTextNoTone.match(/\brap\s*(?:pc|may)\s*\d+\s*(trieu|tr|cu|m)\b/i);

      // CRITICAL: Only trigger full PC build if user explicitly asked for a full PC and did NOT ask for a single component
      const isBuildInquiry = hasFullPcBuildKeywords && !isSpecificComponentInquiry;

      if (isBuildInquiry) {
        Logger.info(`[PC Builder AI] Detected full PC build consultation request: "${userText}"`);
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

      // 3. Fetch live products from Supabase matching the user's inquiry
      const matchedProducts = await liveDatabaseKnowledge.searchLiveProducts(userText, 5);
      const allLiveProducts = await liveDatabaseKnowledge.getAllLiveProducts();

      // 4. Build live store context
      const liveContext = await liveDatabaseKnowledge.buildLiveStoreContext(userText);

      // 5. Try Calling External LLM API (Groq -> DeepSeek) with Live Database context
      const aiReply = await this.callLLMWithContext(messages, liveContext);
      if (aiReply) {
        return {
          role: 'assistant',
          content: aiReply,
          matchedProducts,
        };
      }

      // 6. Robust Real-time Fallback Engine using Live Supabase Data
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
   * Format coupon response clearly and beautifully (Antigravity standard, no excessive dots)
   */
  private formatCouponsResponse(coupons: LiveCoupon[]): string {
    const formatVND = (num: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num);

    if (!coupons || coupons.length === 0) {
      return `### 🎁 **Chương Trình Khuyến Mãi & Ưu Đãi DRX Hardware**

Hiện tại các mã giảm giá số lượng có hạn đã được khách hàng nhận hết. Tuy nhiên, DRX Hardware đang áp dụng **giá Flash Sale chiết khấu trực tiếp** trên từng sản phẩm và **miễn phí công lắp ráp trọn gói**!

👉 Bạn có thể duyệt xem các linh kiện đang giảm giá tại [**Danh mục Sản phẩm**](/products) hoặc tự phối cấu hình tại [**DRX PC Builder**](/pc-builder) nhé!`;
    }

    const couponItems = coupons.map((c) => {
      const discountText = c.discountType === 'PERCENT'
        ? `Giảm **${c.discountValue}%**${c.maxDiscount ? ` (Tối đa **${formatVND(c.maxDiscount)}**)` : ''}`
        : `Giảm trực tiếp **${formatVND(c.discountValue)}**`;
      
      const conditionText = c.minOrderValue > 0
        ? `Đơn hàng từ **${formatVND(c.minOrderValue)}**`
        : 'Áp dụng cho mọi đơn hàng';

      return `🎫 **Mã: \`${c.code}\`**
- **Ưu đãi**: ${discountText}
- **Điều kiện**: ${conditionText}`;
    }).join('\n\n');

    return `### 🎁 **Danh Sách Mã Giảm Giá Đang Hoạt Động Tại DRX Hardware**

Hiện tại shop đang có các mã ưu đãi độc quyền sẵn sàng sử dụng:

${couponItems}

---
📌 **Cách áp dụng mã giảm giá:**
1. Chọn sản phẩm hoặc cấu hình PC bạn cần mua và tiến hành Đặt Hàng.
2. Tại màn hình Thanh Toán, nhập mã vào ô **"Mã Giảm Giá"** và bấm **Áp Dụng**.
3. Hệ thống sẽ tự động trừ trực tiếp số tiền ưu đãi vào đơn hàng của bạn.

👉 [**Khám phá sản phẩm DRX Hardware**](/products) | [**Tự Build PC chuẩn tương thích**](/pc-builder)`;
  }

  /**
   * Call Groq or DeepSeek API with live context
   */
  private async callLLMWithContext(messages: any[], liveContext: string, isBuild = false): Promise<string | null> {
    const groqKey = process.env.GROQ_API_KEY;
    const deepseekKey = process.env.DEEPSEEK_API_KEY;

    const systemPromptWithLiveDB = `Bạn là DRX CyberBot AI 🤖⚡ - Trợ lý công nghệ phần cứng thông minh tại DRX Hardware.

DỮ LIỆU KHO HÀNG & THÔNG TIN THỰC TẾ TRÊN HỆ THỐNG SUPABASE:
${liveContext}

QUY TẮC ĐÀO TẠO & PHẢN HỒI (CHUẨN CHUYÊN GIA PHẦN CỨNG DRX HARDWARE):
1. TRẢ LỜI ĐÚNG TRỌNG TÂM, NGẮN GỌN, SÚC TÍCH, TUYỆT ĐỐI KHÔNG NÓI LAN MAN:
   - Khi khách hỏi về 1 LINH KIỆN CỤ THỂ (ví dụ: "card màn hình chơi game tầm 15 triệu", "tư vấn CPU 5tr", "màn hình dưới 4 triệu"):
     + CHỈ tư vấn đúng linh kiện đó khớp với tầm giá yêu cầu.
     + TUYỆT ĐỐI KHÔNG tự động lên bảng cấu hình cả dàn PC (CPU, Main, RAM, Nguồn, Vỏ...) nếu khách KHÔNG yêu cầu build full bộ PC.
     + Phân tích ngắn gọn 1-2 sự lựa chọn xuất sắc nhất có trong kho: Nêu tên sản phẩm kèm link markdown [Tên](/products/slug), Giá ưu đãi, Điểm mạnh chính (VRAM, DLSS, FPS trong game phổ biến), và chế độ bảo hành 36T 1 đổi 1.
   - Khi khách hỏi BUILD DÀN PC (ví dụ: "build pc 15 triệu", "ráp pc chơi valorant 20tr"):
     + Lập bảng cấu hình gồm các linh kiện desktop tương thích 100% (KHÔNG dùng RAM Laptop), tổng giá khớp sát ngân sách yêu cầu.
   - Khi khách hỏi MÃ GIẢM GIÁ / VOUCHER: Liệt kê danh sách mã thực tế, mức giảm, điều kiện đơn hàng.
2. ĐỊNH DẠNG ĐẸP, MẠCH LẠC, THOÁNG ĐÃNG:
   - Định dạng tiền tệ VNĐ rõ ràng (ví dụ: 15.990.000 ₫).
   - Tối đa 2-3 đoạn ngắn gọn, súc tích, chuyên nghiệp.
3. PHONG THÁI CHUYÊN NGHIỆP, TỰ NHIÊN, AM HIỂU PHẦN CỨNG: Thân thiện, tôn trọng khách hàng, ngôn từ hiện đại, chuẩn xác 100% tiếng Việt.`;

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
            temperature: 0.3,
            max_tokens: isBuild ? 800 : 500,
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
            temperature: 0.3,
            max_tokens: isBuild ? 800 : 500,
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
    const explicitBudget = liveDatabaseKnowledge.extractExplicitBudget(userText);

    // 1. Matched specific products in Supabase
    if (matchedProducts.length > 0) {
      if (matchedProducts.length === 1) {
        const p = matchedProducts[0];
        const priceFormatted = formatVND(p.price);
        const discFormatted = p.discountPrice ? formatVND(p.discountPrice) : null;
        
        return {
          role: 'assistant',
          content: `Dạ, DRX Hardware hiện có sẵn **[${p.name}](/products/${p.slug})** chính hãng:

💰 **Giá ưu đãi**: ${discFormatted ? `**${discFormatted}** *(Giá gốc ~~${priceFormatted}~~)*` : `**${priceFormatted}**`}
🛡️ **Bảo hành**: **${p.warrantyMonths} Tháng chính hãng (1 đổi 1)**
📦 **Tình trạng kho**: ${p.inStock ? `Còn ${p.stockQuantity} sản phẩm sẵn sàng giao ngay` : 'Tạm hết hàng'}
🚚 **Giao hàng**: Miễn phí vận chuyển COD toàn quốc, đồng kiểm trước khi nhận

👉 Mời bạn xem chi tiết thông số và đặt hàng nhanh qua thẻ sản phẩm bên dưới:`,
          matchedProducts: [p],
        };
      }

      // Multiple matched items
      const topProducts = matchedProducts.slice(0, 4);

      // If user asked with a specific budget (e.g. card màn hình 15 triệu)
      if (explicitBudget !== null && topProducts.length > 0) {
        const bestPick = topProducts[0];
        const bestPrice = formatVND(bestPick.discountPrice || bestPick.price);
        const altPick = topProducts[1];
        const budgetFormatted = (explicitBudget / 1000000).toFixed(0) + ' Triệu';

        return {
          role: 'assistant',
          content: `Dạ, với ngân sách tầm **${budgetFormatted}**, DRX Hardware xin đề xuất cho bạn:

🏆 **Lựa chọn tối ưu nhất**: **[${bestPick.name}](/products/${bestPick.slug})**
- 💰 **Giá ưu đãi**: **${bestPrice}**
- 🛡️ **Bảo hành**: **${bestPick.warrantyMonths} Tháng chính hãng (1 đổi 1)**
- ⚡ **Hiệu năng nổi bật**: Xử lý mượt mà mọi tựa game eSports (Valorant, CS2, LOL) ở mức 300+ FPS và cân tốt game AAA đồ họa cao.
${altPick ? `\n💡 **Gợi ý thêm**: Bạn cũng có thể tham khảo **[${altPick.name}](/products/${altPick.slug})** với giá **${formatVND(altPick.discountPrice || altPick.price)}**.` : ''}

👉 Mời bạn xem chi tiết thông số và đặt hàng nhanh qua các thẻ sản phẩm bên dưới:`,
          matchedProducts: topProducts,
        };
      }

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
        content: `Dạ, DRX Hardware hiện có **${matchedProducts.length} ${categoryHeader}** chính hãng sẵn hàng tại kho, bảo hành 36 tháng 1 đổi 1:

👉 Mời bạn bấm trực tiếp vào từng thẻ bên dưới để xem chi tiết thông số, tình trạng tồn kho và đặt mua:`,
        matchedProducts: topProducts,
      };
    }

    // 2. Keyword Policies & Inquiries
    if (qNoTone.includes('bao hanh') || qNoTone.includes('serial') || qNoTone.includes('sn')) {
      return {
        role: 'assistant',
        content: `### 🛡️ **Chính Sách Bảo Hành Chính Hãng Tại DRX Hardware**

- **Cam kết vàng**: Bảo hành **36 Tháng chính hãng 1 đổi 1** trong 30 ngày đầu tiên nếu phát sinh lỗi từ nhà sản xuất.
- **Tra cứu điện tử**: Quản lý bảo hành thông minh theo mã Serial (SN) thiết bị, không lo rách tem hay thất lạc hóa đơn giấy.

👉 Bạn có thể tra cứu hạn bảo hành nhanh tại: [**Trang Tra Cứu Bảo Hành SN**](/warranty)`,
        matchedProducts: [],
      };
    }

    if (qNoTone.includes('giao hang') || qNoTone.includes('ship') || qNoTone.includes('van chuyen') || qNoTone.includes('dia chi') || qNoTone.includes('showroom')) {
      return {
        role: 'assistant',
        content: `### 🚚 **Giao Hàng & Showroom DRX Hardware**

- **Địa chỉ Showroom**: 128 Nguyễn Trãi, Q.1, TP. Hồ Chí Minh *(Mở cửa 08:00 - 21:30 tất cả các ngày trong tuần)*.
- **Vận chuyển hỏa tốc**: Giao hàng toàn quốc 1-3 ngày làm việc, hỗ trợ mở hộp đồng kiểm trước khi thanh toán (COD).
- **Hotline tư vấn**: **1900.88.99.77** (Miễn phí cuộc gọi).`,
        matchedProducts: [],
      };
    }

    if (qNoTone.includes('thanh toan') || qNoTone.includes('cod') || qNoTone.includes('tra tien') || qNoTone.includes('vietqr')) {
      return {
        role: 'assistant',
        content: `### 💵 **Phương Thức Thanh Toán Linh Hoạt & Bảo Mật**

- **Thanh toán khi nhận hàng (COD)**: Kiểm tra hàng an tâm trước khi thanh toán.
- **Chuyển khoản VietQR 24/7**: Tự động xác nhận giao dịch tức thì, 0% phụ phí.
- **Hóa đơn & Chứng từ**: Xuất VAT điện tử đầy đủ theo yêu cầu của doanh nghiệp & cá nhân.`,
        matchedProducts: [],
      };
    }

    if (qNoTone.includes('lap rap') || qNoTone.includes('rap may') || qNoTone.includes('cai win') || qNoTone.includes('di day')) {
      return {
        role: 'assistant',
        content: `### 🛠️ **Dịch Vụ Lắp Ráp & Cài Đặt Miễn Phí Trọn Gói**

- **Lắp ráp chuẩn chuyên nghiệp**: Miễn phí 100% công lắp đặt, đi dây nghệ thuật giấu nguồn thẩm mỹ cao.
- **Cài đặt sẵn hệ điều hành**: Tặng bản quyền Windows 11, cài full Driver và các tiện ích văn phòng/gaming.
- **Kiểm định nghiêm ngặt**: Chạy Stress Test FurMark & Cinebench kiểm tra nhiệt độ full-load 100% ổn định trước khi bàn giao!

👉 [**Tự phối cấu hình PC ngay trên DRX PC Builder**](/pc-builder)`,
        matchedProducts: [],
      };
    }

    // 3. Fallback greeting
    return {
      role: 'assistant',
      content: `Xin chào! Mình là **DRX CyberBot AI** 🤖⚡ — Trợ lý AI phần cứng tại DRX Hardware.

Bạn có thể hỏi mình bất kỳ câu hỏi nào như:
- *"Shop đang có mã giảm giá gì?"*
- *"Tư vấn cấu hình PC Gaming 20 triệu chơi Valorant, Black Myth Wukong"*
- *"Giá Card màn hình RTX 4060 bao nhiêu?"*

Hoặc bấm vào [**DRX PC Builder**](/pc-builder) để tự tay thiết kế bộ PC theo ý thích nhé!`,
      matchedProducts: allProducts.slice(0, 2),
    };
  }

  async generateSimpleResponse(messages: any[]) {
    return this.generateChatCompletion(messages);
  }
}

export const deepSeekClient = new DeepSeekClient();


