import { Logger } from './Logger';
import { INITIAL_PRODUCTS } from '@/lib/hardware-data';

export class DeepSeekClient {
  async generateChatCompletion(messages: any[], tools?: any[]) {
    try {
      const lastUserMsgObj = [...messages].reverse().find((m: any) => m.role === 'user');
      const userText = lastUserMsgObj ? String(lastUserMsgObj.content).toLowerCase() : '';

      Logger.info(`[Local Chatbot Engine] Processing query: "${userText}"`);

      // 1. Search matching hardware products locally
      const queryWords = userText.split(/\s+/).filter(w => w.length > 1);
      const matchedProducts = INITIAL_PRODUCTS.filter(p => {
        return queryWords.some(w => 
          p.name.toLowerCase().includes(w) || 
          p.category.toLowerCase().includes(w) || 
          p.brand.toLowerCase().includes(w)
        );
      }).slice(0, 4);

      if (matchedProducts.length > 0) {
        const productListStr = matchedProducts.map(p => 
          `• **${p.name}**\n  💰 Giá bán: ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p.price)}\n  🛡️ Bảo hành: ${p.warrantyMonths || 36}T | Hãng: ${p.brand}`
        ).join('\n\n');

        return {
          role: 'assistant',
          content: `Chào bạn! ODS Store tìm thấy danh sách linh kiện / PC phù hợp với yêu cầu của bạn:\n\n${productListStr}\n\n👉 Bạn có thể bấm vào sản phẩm trên trang store để xem chi tiết thông số hoặc thêm vào giỏ hàng nhé!`
        };
      }

      // 2. Keyword Intents
      if (userText.includes('bảo hành') || userText.includes('bao hanh')) {
        return {
          role: 'assistant',
          content: '🛡️ **Chính Sách Bảo Hành ODS Store**:\n• Tất cả linh kiện (VGA, CPU, Mainboard, RAM, SSD, Màn hình) và PC Prebuilt bán ra đều được bảo hành chính hãng **36 Tháng**.\n• Đổi mới 1-đổi-1 trong 30 ngày đầu tiên nếu có lỗi từ nhà sản xuất.\n• Tra cứu mã Serial SN trực tiếp tại hệ thống cửa hàng!'
        };
      }

      if (userText.includes('giao hàng') || userText.includes('ship') || userText.includes('vận chuyển')) {
        return {
          role: 'assistant',
          content: '🚚 **Chính Sách Vận Chuyển ODS Store**:\n• Giao hàng hỏa tốc trong 2h tại TP.HCM & Hà Nội.\n• Miễn phí vận chuyển toàn quốc cho đơn hàng từ 10.000.000đ.\n• Đóng gói xốp bọc đệm khí 3 lớp an toàn tuyệt đối!'
        };
      }

      if (userText.includes('thanh toán') || userText.includes('trả góp') || userText.includes('vietqr') || userText.includes('hd saison')) {
        return {
          role: 'assistant',
          content: '💳 **Phương Thức Thanh Toán Hỗ Trợ**:\n1. **VietQR Tự Động 24/7**: Quét mã ngân hàng chuyển khoản 1-Click.\n2. **Số Dư Ví ODS Store**: Thanh toán tức thì bằng ví cá nhân.\n3. **Trả Góp HD SAISON (Lãi 0% - 1.49%)**: Duyệt hồ sơ online siêu tốc 15 phút tại trang Checkout!'
        };
      }

      if (userText.includes('liên hệ') || userText.includes('địa chỉ') || userText.includes('sđt') || userText.includes('hotline')) {
        return {
          role: 'assistant',
          content: '📞 **Thông Tin Liên Hệ ODS Store**:\n• Hotline kỹ thuật & tư vấn: **0908 888 999**\n• Email: `support@odsstore.com`\n• Showroom: **Tòa nhà ODS Technology Tower, TP. Hồ Chí Minh**\n• Giờ mở cửa: 08:00 - 21:00 (Tất cả các ngày trong tuần).'
        };
      }

      // 3. Default friendly fallback response
      return {
        role: 'assistant',
        content: `Cảm ơn bạn đã nhắn tin cho ODS Store! 👋\nChúng tôi chuyên cung cấp Laptop Gaming, linh kiện PC (VGA, CPU, Mainboard, RAM, SSD, Màn Hình) chính hãng 100% bảo hành 36 tháng.\n\nBạn cần tìm loại linh kiện hay cấu hình máy tính nào? Hãy nhập từ khóa như "RTX 4060", "i5 13400F", "Màn hình 180Hz" hoặc "Trả góp" để mình hỗ trợ ngay nhé!`
      };
    } catch (error) {
      Logger.error('Local Chatbot Engine Error', error);
      return {
        role: 'assistant',
        content: 'Xin chào! Bạn có thể xem danh mục linh kiện chính hãng tại thanh menu hoặc liên hệ hotline 0908 888 999 để được nhân viên tư vấn trực tiếp nhé!'
      };
    }
  }

  async generateSimpleResponse(messages: any[]) {
    return this.generateChatCompletion(messages);
  }
}

export const deepSeekClient = new DeepSeekClient();
