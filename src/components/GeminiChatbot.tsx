'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Send,
  Sparkles,
  CheckCircle2,
  XCircle,
  ExternalLink,
  RotateCcw,
  Zap,
  CloudSun,
  ShieldCheck
} from 'lucide-react';
import Link from 'next/link';
import { CyberBotAvatar } from './CyberBotAvatar';

interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  productCards?: any[];
}

export const GeminiChatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'msg-welcome',
      sender: 'bot',
      text: 'Xin chào! Mình là DRX CyberBot AI 🤖⚡ — Trợ lý AI thế hệ mới được thiết kế riêng cho DRX Hardware. Bạn có thể hỏi mình bất kỳ điều gì: từ tư vấn build PC, kiểm tra socket CPU, VGA, Mainboard hay tra cứu linh kiện và Flash Sale nhé!',
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  // Fetch live catalog data directly from API (Connected to Supabase)
  const loadProductData = async () => {
    try {
      const res = await fetch('/api/products', { cache: 'no-store' });
      const data = await res.json();
      if (res.ok && data.products && Array.isArray(data.products)) {
        setProducts(data.products);
      }
    } catch (e) {
      console.warn('Chatbot product sync notice:', e);
    }
  };

  useEffect(() => {
    loadProductData();
  }, [isOpen]);

  useEffect(() => {
    // Check session storage on mount to see if user has closed the tooltip in this session
    try {
      const isTooltipClosed = sessionStorage.getItem('ods_chatbot_tooltip_closed');
      if (!isTooltipClosed) {
        // Show tooltip after a tiny delay for smooth entry animation
        setTimeout(() => setShowTooltip(true), 1500);
      }
    } catch (e) {}
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const formatPrice = (val: number) => {
    return val.toLocaleString('vi-VN') + ' đ';
  };

  // Fallback response generator if API route fails
  const generateFallbackResponse = (query: string) => {
    const q = query.toLowerCase().trim();
    let replyText = `🤖 DRX CyberBot AI: Cảm ơn bạn đã nhắn tin! CyberBot luôn sẵn sàng hỗ trợ bạn tra cứu linh kiện máy tính, tư vấn cấu hình PC, kiểm tra khuyến mãi Flash Sale và bảo hành 36T tại DRX Hardware ⚡!`;
    let matchedProducts: any[] = [];

    const directMatches = products.filter((p) =>
      q.split(' ').some((kw) => kw.length >= 2 && (p.name.toLowerCase().includes(kw) || (p.category && String(p.category).toLowerCase().includes(kw))))
    );

    if (directMatches.length > 0) {
      matchedProducts = directMatches.slice(0, 3);
      const p = directMatches[0];
      replyText = `🤖 DRX CyberBot AI:\n• Tên sản phẩm: ${p.name}\n• Tình trạng: ${
        p.status !== false && (p.stockQuantity ?? 1) > 0 ? '📦 ĐANG CÒN HÀNG' : '🚫 HẾT HÀNG'
      }\n• Giá bán: ${
        p.discountPrice ? `${formatPrice(p.discountPrice)} (Gốc ${formatPrice(p.price)})` : formatPrice(p.price)
      }\n• Dịch vụ: Bảo hành 1 đổi 1 36 tháng & Giao hàng toàn quốc!`;
    } else {
      matchedProducts = products.slice(0, 2);
    }

    return { text: replyText, productCards: matchedProducts };
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputMessage;
    if (!query.trim()) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputMessage('');
    setIsTyping(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          history: messages.slice(-5).map((m) => ({ role: m.sender === 'user' ? 'user' : 'assistant', content: m.text })),
        }),
      });

      const data = await res.json();
      const botAnswer = data.answer || data.reply;
      if (res.ok && botAnswer) {
        const rawDocs = data.documents || data.productCards || [];
        const formattedCards = Array.isArray(rawDocs) ? rawDocs.map((doc: any) => ({
          name: doc.name || doc.productName || 'Linh kiện DRX',
          price: typeof doc.price === 'number' ? doc.price : parseFloat(String(doc.price).replace(/[^\d]/g, '')) || 0,
          discountPrice: doc.discountPrice ? (typeof doc.discountPrice === 'number' ? doc.discountPrice : parseFloat(String(doc.discountPrice).replace(/[^\d]/g, ''))) : null,
          coverImage: doc.coverImage || 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=300',
          category: doc.category || 'HARDWARE',
          slug: doc.slug || (doc.link ? doc.link.replace('/products/', '') : ''),
        })) : [];

        const botMsg: Message = {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          text: botAnswer,
          timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
          productCards: formattedCards,
        };
        setMessages((prev) => [...prev, botMsg]);
        setIsTyping(false);
        return;
      }
    } catch (err) {
      console.warn('Chat API error, using fallback:', err);
    }

    // Fallback if API route is offline
    const responseData = generateFallbackResponse(query);
    const botMsg: Message = {
      id: `bot-${Date.now()}`,
      sender: 'bot',
      text: responseData.text,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      productCards: responseData.productCards,
    };
    setMessages((prev) => [...prev, botMsg]);
    setIsTyping(false);
  };

  return (
    <>
      {/* Floating Widget Row: Speech Bubble Tooltip + Clean Light Mascot Button */}
      <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3">
        {/* White Speech Bubble Tooltip (ROG Style) */}
        <AnimatePresence>
          {showTooltip && !isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, x: 20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.9, x: 20 }}
              className="relative hidden sm:flex items-center gap-2.5 bg-white text-zinc-900 px-4 py-3 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.12)] border border-zinc-200/90 text-xs font-semibold max-w-[270px] leading-snug"
            >
              <Zap className="h-4 w-4 text-amber-500 fill-amber-500 shrink-0 animate-bounce" />
              <span>Bạn đang tìm linh kiện, PC Gaming hay cần tư vấn cấu hình? CyberBot sẽ giúp bạn ngay!</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowTooltip(false);
                  try {
                    sessionStorage.setItem('ods_chatbot_tooltip_closed', 'true');
                  } catch (err) {}
                }}
                className="h-5 w-5 rounded-full bg-zinc-900 text-white hover:bg-zinc-700 transition-colors flex items-center justify-center shrink-0 ml-1"
                title="Đóng"
              >
                <X className="h-3 w-3" />
              </button>
              {/* Pointer triangle */}
              <div className="absolute right-[-6px] top-1/2 -translate-y-1/2 w-0 h-0 border-y-6 border-y-transparent border-l-6 border-l-white" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* ROG Mascot Circular Button - Crisp Light Background */}
        <motion.button
          animate={{ y: [0, -4, 0] }}
          transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          onClick={() => {
            setIsOpen(!isOpen);
            setShowTooltip(false);
            try {
              sessionStorage.setItem('ods_chatbot_tooltip_closed', 'true');
            } catch (err) {}
          }}
          className="relative group flex items-center justify-center h-16 w-16 sm:h-18 sm:w-18 rounded-full bg-zinc-200 p-0.5 shadow-[0_8px_25px_rgba(0,0,0,0.18)] border border-zinc-300 transition-all duration-300 overflow-hidden shrink-0"
          title="Trợ lý AI CyberBot"
        >
          {/* Circular CyberBot Mascot Frame */}
          <div className="relative h-full w-full rounded-full bg-zinc-200 flex items-center justify-center overflow-hidden">
            <CyberBotAvatar size="lg" isThinking={isOpen} />
          </div>
        </motion.button>
      </div>

      {/* Chat Modal / Window - SLEEK CLEAN LIGHT THEME (Giao diện trắng tinh tế) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="fixed bottom-28 right-4 sm:right-6 z-50 w-[calc(100vw-32px)] sm:w-[400px] h-[570px] max-h-[82vh] rounded-3xl bg-white/95 text-zinc-900 border border-zinc-200/90 shadow-[0_20px_60px_rgba(0,0,0,0.15)] backdrop-blur-2xl flex flex-col overflow-hidden"
          >
            {/* Header - Light Crystal Gradient */}
            <div className="p-4 bg-gradient-to-r from-zinc-50 via-cyan-50/70 to-zinc-50 border-b border-zinc-200/80 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CyberBotAvatar size="md" isThinking={isTyping} />
                <div>
                  <div className="flex items-center gap-1.5 font-bold text-sm text-zinc-900">
                    <span>DRX CyberBot AI</span>
                    <Sparkles className="h-3.5 w-3.5 text-cyan-600 animate-pulse" />
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 mt-0.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="font-semibold text-emerald-700">ONLINE • HARDWARE AI 2.0</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() =>
                    setMessages([
                      {
                        id: 'msg-reset',
                        sender: 'bot',
                        text: 'Đã reset hệ thống CyberBot! Bạn cần tư vấn linh kiện hay kiểm tra giá gì tiếp theo?',
                        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
                      },
                    ])
                  }
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-200/60 transition-colors"
                  title="Làm mới"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-200/60 transition-colors"
                  title="Đóng"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Messages Body */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs scrollbar-thin scrollbar-thumb-zinc-300">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div className="flex items-end gap-2 max-w-[88%]">
                    {msg.sender === 'bot' && (
                      <CyberBotAvatar size="sm" />
                    )}
                    <div
                      className={`p-3.5 rounded-2xl ${
                        msg.sender === 'user'
                          ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-br-none shadow-sm font-medium'
                          : 'bg-zinc-100/90 text-zinc-800 border border-zinc-200/80 rounded-bl-none shadow-sm'
                      }`}
                    >
                      <div className="whitespace-pre-line leading-relaxed">{msg.text}</div>

                      {/* Render Product Mini Cards in Light Theme */}
                      {msg.productCards && msg.productCards.length > 0 && (
                        <div className="mt-3 space-y-2 pt-2 border-t border-zinc-200/60">
                          {msg.productCards.map((p) => {
                            const isInStock = p.status !== false;
                            return (
                              <Link
                                key={p.id}
                                href={`/products/${p.slug}`}
                                onClick={() => setIsOpen(false)}
                                className="group flex items-center gap-3 p-2 rounded-xl bg-white border border-zinc-200 hover:border-sky-500 shadow-sm hover:shadow transition-all"
                              >
                                <div className="w-14 h-14 min-w-[56px] max-w-[56px] min-h-[56px] max-h-[56px] rounded-lg bg-zinc-100 p-1 border border-zinc-200 shrink-0 flex items-center justify-center overflow-hidden">
                                  <img
                                    src={p.coverImage || p.image || p.thumbnailUrl || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400&auto=format&fit=crop&q=80'}
                                    alt={p.name}
                                    onError={(e) => {
                                      (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400&auto=format&fit=crop&q=80';
                                    }}
                                    className="w-full h-full max-w-full max-h-full object-contain"
                                  />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="font-bold text-zinc-900 text-[11px] truncate group-hover:text-sky-600">
                                    {p.name}
                                  </div>
                                  <div className="flex items-center gap-2 mt-0.5 text-[10px]">
                                    <span className="font-bold text-sky-600">
                                      {formatPrice(p.discountPrice || p.price)}
                                    </span>
                                    {isInStock ? (
                                      <span className="text-emerald-600 font-semibold flex items-center gap-0.5">
                                        <CheckCircle2 className="h-3 w-3" /> Còn hàng
                                      </span>
                                    ) : (
                                      <span className="text-red-500 font-semibold flex items-center gap-0.5">
                                        <XCircle className="h-3 w-3" /> Hết hàng
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <ExternalLink className="h-3.5 w-3.5 text-zinc-400 group-hover:text-sky-600 shrink-0" />
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                  <span className="text-[9px] text-zinc-400 mt-1 px-1">{msg.timestamp}</span>
                </div>
              ))}

              {isTyping && (
                <div className="flex items-center gap-2 text-sky-600 text-[11px]">
                  <CyberBotAvatar size="sm" isThinking={true} />
                  <span className="animate-pulse font-medium">CyberBot AI đang suy nghĩ câu trả lời...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <div className="p-3 bg-white border-t border-zinc-200/80 flex items-center gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Hỏi CyberBot về linh kiện, giá cả, tư vấn build PC, bảo hành..."
                className="flex-1 bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-sky-500 focus:bg-white transition-all"
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={!inputMessage.trim()}
                className="p-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 text-white disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-md transition-all"
                title="Gửi"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
