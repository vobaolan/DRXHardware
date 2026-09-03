"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  MessageCircle, 
  X, 
  Send, 
  Loader2, 
  ArrowRight, 
  Sparkles, 
  ExternalLink, 
  ShoppingBag, 
  RotateCcw,
  Zap,
  Wrench,
  ShieldCheck
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'framer-motion';
import { CyberBotAvatar } from '../CyberBotAvatar';

type Message = {
  role: 'user' | 'assistant';
  content: string;
  source?: string;
  products?: any[];
};

export default function ChatbotWidget() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: 'assistant', 
      content: 'Xin chào! Mình là **DRX CyberBot AI** 🤖⚡ — Trợ lý tư vấn phần cứng & DRX Build PC. Bạn cần tìm linh kiện hoặc xem giá sản phẩm nào cứ gõ cho mình nhé!' 
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const formatVND = (num: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  useEffect(() => {
    try {
      if (!sessionStorage.getItem('drx_cyberbot_tooltip_closed')) {
        setTimeout(() => setShowTooltip(true), 2000);
      }
    } catch (e) {}
  }, []);

  const sendQuery = async (queryText: string) => {
    if (!queryText.trim() || isLoading) return;
    
    const userMessage = queryText.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const history = messages.map(m => ({ role: m.role, content: m.content }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage, history })
      });

      if (!res.ok) throw new Error('API Error');

      const data = await res.json();
      
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: data.answer,
        source: data.source,
        products: data.products || data.documents || []
      }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Rất tiếc, máy chủ AI đang bận xử lý. Bạn vui lòng thử lại hoặc xem trực tiếp tại trang danh mục sản phẩm nhé!' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = () => {
    sendQuery(input);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      <motion.div 
        drag 
        dragMomentum={false} 
        className="fixed bottom-6 right-6 z-[9999] flex items-end gap-3"
      >
        {/* Tooltip Notification */}
        <AnimatePresence>
          {showTooltip && !isOpen && (
            <motion.div
              initial={{ opacity: 0, x: 20, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.9 }}
              className="relative hidden sm:flex items-center gap-3 bg-white dark:bg-slate-900 px-3.5 py-2.5 mb-2 rounded-2xl shadow-[0_10px_30px_rgba(2,132,199,0.2)] border border-sky-100 dark:border-slate-800 text-[11.5px] font-medium text-slate-700 dark:text-slate-200 max-w-[260px] leading-relaxed"
            >
              <span>Bạn cần tìm linh kiện hoặc hỏi giá sản phẩm? CyberBot sẵn sàng hỗ trợ ngay!</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowTooltip(false);
                  try { sessionStorage.setItem('drx_cyberbot_tooltip_closed', 'true'); } catch (err) {}
                }}
                className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition-colors shrink-0 cursor-pointer"
              >
                <X size={13} />
              </button>
              {/* Pointer triangle */}
              <div className="absolute -right-[6px] top-1/2 -translate-y-1/2 w-0 h-0 border-y-[5px] border-y-transparent border-l-[6px] border-l-white dark:border-l-slate-900 drop-shadow-sm" />
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute bottom-16 right-0 w-[calc(100vw-32px)] sm:w-[380px] max-h-[560px] h-[calc(100vh-120px)] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-200/90 dark:border-slate-800 z-50 backdrop-blur-md"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-sky-600 via-[#0284c7] to-blue-600 p-3.5 flex justify-between items-center text-white border-b border-sky-400/30 shadow-xs">
                <div className="flex items-center gap-2.5">
                  <div className="relative">
                    <div className="absolute inset-0 bg-white/40 rounded-full blur-xs opacity-70 animate-pulse" />
                    <CyberBotAvatar size="sm" isThinking={isLoading} state="active" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-heading font-black text-sm tracking-wide text-white">DRX CyberBot AI</h3>
                      <span className="text-[9px] font-black uppercase px-1.5 py-0.2 bg-white/20 text-white rounded">2.0</span>
                    </div>
                    <div className="text-[9.5px] text-sky-100 uppercase tracking-wider font-semibold flex items-center gap-1 mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Trực Tuyến • Supabase DB
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      setMessages([
                        { 
                          role: 'assistant', 
                          content: 'Xin chào! Mình là **DRX CyberBot AI** 🤖⚡ — Trợ lý tư vấn phần cứng & DRX Build PC. Bạn cần tìm linh kiện hoặc xem giá sản phẩm nào cứ gõ cho mình nhé!' 
                        }
                      ]);
                    }}
                    title="Làm mới đoạn chat"
                    className="hover:bg-white/20 p-1.5 rounded-xl transition-colors text-sky-100 hover:text-white cursor-pointer"
                  >
                    <RotateCcw size={15} />
                  </button>
                  <button 
                    onClick={() => setIsOpen(false)}
                    className="hover:bg-white/20 p-1.5 rounded-xl transition-colors text-sky-100 hover:text-white cursor-pointer"
                  >
                    <X size={17} />
                  </button>
                </div>
              </div>

              {/* Chat Area */}
              <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5 bg-slate-50/50 dark:bg-slate-950/50">
                {messages.map((msg, idx) => (
                  <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} space-y-2`}>
                    
                    {/* Message Bubble */}
                    <div 
                      className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-[12.5px] leading-relaxed ${
                        msg.role === 'user' 
                          ? 'bg-gradient-to-r from-sky-500 to-[#0284c7] text-white rounded-br-xs shadow-sm shadow-sky-500/20 font-medium' 
                          : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 rounded-bl-xs border border-slate-200/90 dark:border-slate-800 shadow-2xs'
                      }`}
                    >
                      <div className="prose dark:prose-invert prose-sm max-w-none text-[12.5px] leading-relaxed">
                        <ReactMarkdown
                          components={{
                            a: ({ href, children }) => {
                              if (href && (href.startsWith('/products/') || href.startsWith('/pc-builder') || href.startsWith('/warranty'))) {
                                return (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      router.push(href);
                                    }}
                                    className="text-sky-600 dark:text-sky-400 font-bold hover:underline inline-flex items-center gap-0.5 cursor-pointer ml-1"
                                  >
                                    <span>{children}</span>
                                    <ExternalLink size={10} className="inline" />
                                  </button>
                                );
                              }
                              return (
                                <a href={href} target="_blank" rel="noopener noreferrer" className="text-sky-600 dark:text-sky-400 font-bold hover:underline">
                                  {children}
                                </a>
                              );
                            }
                          }}
                        >
                          {msg.content}
                        </ReactMarkdown>
                      </div>
                    </div>

                    {/* Interactive Product Mini-Cards */}
                    {msg.products && msg.products.length > 0 && (
                      <div className="w-full space-y-2 mt-1">
                        {msg.products.map((prod: any, pIdx: number) => {
                          const hasDiscount = prod.discountPrice && prod.discountPrice < prod.price;
                          const currentPrice = prod.discountPrice || prod.price;
                          const discountPct = hasDiscount ? Math.round(((prod.price - prod.discountPrice) / prod.price) * 100) : 0;

                          return (
                            <div
                              key={prod.id || pIdx}
                              onClick={() => {
                                router.push(`/products/${prod.slug}`);
                              }}
                              className="group bg-white dark:bg-slate-900 hover:bg-sky-50/70 dark:hover:bg-slate-800/80 border border-slate-200 dark:border-slate-800 hover:border-sky-400 dark:hover:border-sky-500 rounded-2xl p-2.5 flex items-center gap-3 shadow-xs hover:shadow-md transition-all cursor-pointer text-left"
                            >
                              {/* Thumbnail */}
                              <div className="w-13 h-13 rounded-xl bg-slate-50 dark:bg-slate-950 p-1 border border-slate-100 dark:border-slate-800 shrink-0 flex items-center justify-center overflow-hidden">
                                <img
                                  src={prod.coverImage || '/placeholder-hardware.png'}
                                  alt={prod.name}
                                  className="w-full h-full object-contain group-hover:scale-108 transition-transform"
                                />
                              </div>

                              {/* Info */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5 mb-0.5">
                                  <span className="text-[9px] font-black uppercase tracking-wider text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/80 border border-sky-200 dark:border-sky-800/60 px-1.5 py-0.2 rounded-md">
                                    {prod.category}
                                  </span>
                                  {prod.warrantyMonths && (
                                    <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400">
                                      • BH {prod.warrantyMonths}T
                                    </span>
                                  )}
                                  <span className={`text-[9px] font-bold ${prod.inStock ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                                    • {prod.inStock ? 'Còn hàng' : 'Hết hàng'}
                                  </span>
                                </div>

                                <h4 className="text-[12px] font-bold text-slate-900 dark:text-white line-clamp-1 group-hover:text-[#0284c7] dark:group-hover:text-sky-400 transition-colors">
                                  {prod.name}
                                </h4>

                                <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                                  <span className="font-heading text-[12.5px] font-black text-rose-600 dark:text-rose-400">
                                    {formatVND(currentPrice)}
                                  </span>
                                  {hasDiscount && (
                                    <>
                                      <span className="text-[10px] text-slate-400 line-through">
                                        {formatVND(prod.price)}
                                      </span>
                                      <span className="text-[9px] font-black text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-800 px-1 rounded">
                                        -{discountPct}%
                                      </span>
                                    </>
                                  )}
                                </div>
                              </div>

                              {/* Action Button */}
                              <div className="p-1.5 rounded-xl bg-sky-500 group-hover:bg-[#0284c7] text-white shrink-0 shadow-2xs group-hover:translate-x-0.5 transition-all">
                                <ArrowRight size={13} className="stroke-[2.5]" />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                  </div>
                ))}

                {isLoading && (
                  <div className="flex justify-start">
                    <div className="flex items-center gap-2 text-[#0284c7] text-[11.5px] p-2 bg-sky-50 dark:bg-slate-900 rounded-xl border border-sky-100 dark:border-slate-800">
                      <CyberBotAvatar size="sm" isThinking={true} state="thinking" />
                      <span className="animate-pulse font-medium">CyberBot đang tra cứu dữ liệu...</span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-3 border-t border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90">
                <div className="flex items-center gap-2 bg-white dark:bg-slate-950 rounded-2xl p-1.5 border border-slate-200 dark:border-slate-700 focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-500/20 transition-all shadow-2xs">
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Hỏi về linh kiện, giá bán, DRX Build..."
                    className="flex-1 max-h-24 min-h-[36px] bg-transparent resize-none p-1.5 focus:outline-none text-xs text-slate-900 dark:text-slate-100 font-medium"
                    rows={1}
                  />
                  <button
                    onClick={handleSend}
                    disabled={!input.trim() || isLoading}
                    className="p-2 rounded-xl bg-gradient-to-r from-sky-500 to-[#0284c7] hover:from-sky-600 hover:to-blue-700 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-xs shrink-0 cursor-pointer"
                  >
                    <Send size={15} />
                  </button>
                </div>
                <div className="text-center mt-2 text-[9px] text-slate-400 font-bold tracking-wider uppercase">
                  DRX CYBERBOT AI • SUPABASE REALTIME
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          animate={isOpen ? {} : { y: [0, -5, 0] }}
          transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.94 }}
          onClick={() => {
            setIsOpen(!isOpen);
            setShowTooltip(false);
            try { sessionStorage.setItem('drx_cyberbot_tooltip_closed', 'true'); } catch (err) {}
          }}
          className="relative group flex items-center justify-center h-14 w-14 sm:h-15 sm:w-15 rounded-full p-0.5 shadow-[0_4px_25px_rgba(2,132,199,0.4)] transition-all duration-300 shrink-0 cursor-pointer"
        >
          {/* Glowing Aura */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-sky-400 via-[#0284c7] to-blue-600 opacity-75 blur-sm group-hover:opacity-100 animate-pulse transition-opacity" />
          
          {/* Inner Content */}
          <div className="relative h-full w-full rounded-full bg-white dark:bg-slate-900 flex items-center justify-center overflow-hidden border-2 border-sky-200 dark:border-sky-500/40 group-hover:border-sky-400 transition-colors z-10">
            <CyberBotAvatar size="lg" isThinking={isLoading && isOpen} state={isOpen ? 'active' : 'idle'} />
          </div>
        </motion.button>
      </motion.div>
    </>
  );
}

