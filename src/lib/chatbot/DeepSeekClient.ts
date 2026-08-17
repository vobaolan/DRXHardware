import OpenAI from 'openai';
import { Logger } from './Logger';

export class DeepSeekClient {
  private getClient(): OpenAI {
    const apiKey = process.env.GROQ_API_KEY || process.env.OPENAI_API_KEY || 'dummy_credentials_for_build';
    return new OpenAI({
      baseURL: 'https://api.groq.com/openai/v1',
      apiKey: apiKey,
    });
  }

  async generateChatCompletion(messages: any[], tools?: any[]) {
    try {
      const apiKey = process.env.GROQ_API_KEY || process.env.OPENAI_API_KEY;
      if (!apiKey) {
        Logger.warn('GROQ_API_KEY / OPENAI_API_KEY is not configured in Vercel environment variables.');
        return {
          role: 'assistant',
          content: 'Xin chào! ODS Store AI Assistant đã sẵn sàng phục vụ bạn. Vui lòng cấu hình biến môi trường GROQ_API_KEY trên Vercel để kích hoạt tính năng trả lời tự động bằng AI siêu tốc.'
        };
      }

      const client = this.getClient();
      const response = await client.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages,
        tools,
        tool_choice: tools ? 'auto' : 'none',
      });
      return response.choices[0].message;
    } catch (error: any) {
      Logger.error('DeepSeek/Groq API Error', error);
      return {
        role: 'assistant',
        content: 'Xin chào! Hiện tại hệ thống tư vấn AI ODS Store đang phản hồi với dữ liệu cửa hàng. Bạn có thể tra cứu nhanh danh mục sản phẩm hoặc bấm nút Chat Zalo/Facebook để được nhân viên hỗ trợ trực tiếp nhé!'
      };
    }
  }

  async generateSimpleResponse(messages: any[]) {
    return this.generateChatCompletion(messages);
  }
}

export const deepSeekClient = new DeepSeekClient();
