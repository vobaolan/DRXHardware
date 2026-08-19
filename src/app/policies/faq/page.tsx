'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { CartDrawer } from '@/components/CartDrawer';
import { CartProvider } from '@/context/CartContext';
import { 
  HelpCircle, Search, ChevronDown, Gamepad2, CreditCard, Shield, 
  UserCheck, MessageSquare, ArrowRight, Sparkles, CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FAQItem {
  id: string;
  category: 'activation' | 'payment' | 'account' | 'security';
  question: string;
  answer: string | React.ReactNode;
}

export default function FAQPolicyPage() {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [openId, setOpenId] = useState<string | null>('faq-1');

  const FAQ_LIST: FAQItem[] = [
    {
      id: 'faq-1',
      category: 'activation',
      question: 'Sau khi mua hÃ ng, tÃ´i sáº½ nháº­n Key Game báº±ng cÃ¡ch nÃ o vÃ  máº¥t bao lÃ¢u?',
      answer: 'Há»‡ thá»‘ng DRX Hardware giao Key hoÃ n toÃ n tá»± Ä‘á»™ng 24/7. Ngay sau khi báº¡n hoÃ n táº¥t thanh toÃ¡n thÃ nh cÃ´ng, Key Game sáº½ xuáº¥t hiá»‡n trá»±c tiáº¿p trÃªn mÃ n hÃ¬nh vÃ  Ä‘á»“ng thá»i lÆ°u trá»¯ vÄ©nh viá»…n trong má»¥c "Lá»‹ch Sá»­ ÄÆ¡n HÃ ng" táº¡i trang CÃ¡ NhÃ¢n cá»§a báº¡n (Thá»i gian giao key chÆ°a tá»›i 3 giÃ¢y).'
    },
    {
      id: 'faq-2',
      category: 'activation',
      question: 'LÃ m tháº¿ nÃ o Ä‘á»ƒ kÃ­ch hoáº¡t Key Game trÃªn á»©ng dá»¥ng Steam?',
      answer: (
        <div className="space-y-2">
          <p>Äá»ƒ kÃ­ch hoáº¡t Key trÃªn Steam, báº¡n thá»±c hiá»‡n theo cÃ¡c bÆ°á»›c Ä‘Æ¡n giáº£n sau:</p>
          <ol className="list-decimal pl-5 space-y-1 font-medium text-black">
            <li>Má»Ÿ pháº§n má»m <strong>Steam</strong> trÃªn mÃ¡y tÃ­nh vÃ  Ä‘Äƒng nháº­p tÃ i khoáº£n cá»§a báº¡n.</li>
            <li>Báº¥m vÃ o menu <strong>Games</strong> á»Ÿ gÃ³c trÃªn bÃªn trÃ¡i âž” Chá»n <strong>Activate a Product on Steam...</strong></li>
            <li>DÃ¡n mÃ£ Key mua táº¡i DRX Hardware vÃ  nháº¥n <strong>Next</strong> Ä‘á»ƒ hoÃ n táº¥t thÃªm game vÃ o Library.</li>
          </ol>
        </div>
      )
    },
    {
      id: 'faq-3',
      category: 'payment',
      question: 'DRX Hardware há»— trá»£ nhá»¯ng phÆ°Æ¡ng thá»©c thanh toÃ¡n nÃ o?',
      answer: 'ChÃºng tÃ´i há»— trá»£ Ä‘a dáº¡ng phÆ°Æ¡ng thá»©c thanh toÃ¡n an toÃ n bao gá»“m: Chuyá»ƒn khoáº£n NgÃ¢n hÃ ng tá»± Ä‘á»™ng qua QR Code (VietQR 24/7 miá»…n phÃ­ chuyá»ƒn tiá»n), VÃ­ Äiá»‡n Tá»­ MoMo, VNPay, ZaloPay vÃ  Thanh toÃ¡n trá»±c tiáº¿p báº±ng VÃ­ sá»‘ dÆ° DRX Hardware.'
    },
    {
      id: 'faq-4',
      category: 'payment',
      question: 'Náº¡p tiá»n vÃ o VÃ­ DRX Hardware cÃ³ máº¥t phÃ­ khÃ´ng vÃ  sá»‘ dÆ° dÃ¹ng Ä‘á»ƒ lÃ m gÃ¬?',
      answer: 'Náº¡p tiá»n vÃ o VÃ­ DRX hoÃ n toÃ n 0% phÃ­ giao dá»‹ch. Sá»‘ dÆ° trong VÃ­ DRX giÃºp báº¡n thanh toÃ¡n Ä‘Æ¡n hÃ ng tá»©c thÃ¬ trong 1 giÃ¢y mÃ  khÃ´ng cáº§n thao tÃ¡c quÃ©t QR ngÃ¢n hÃ ng láº¡i nhiá»u láº§n, vÃ´ cÃ¹ng tiá»‡n lá»£i khi sÄƒn Flash Sale.'
    },
    {
      id: 'faq-5',
      category: 'account',
      question: 'Sáº£n pháº©m dáº¡ng "TÃ i Khoáº£n Game / Dá»‹ch Vá»¥ Premium" hoáº¡t Ä‘á»™ng nhÆ° tháº¿ nÃ o?',
      answer: 'Äá»‘i vá»›i sáº£n pháº©m dáº¡ng TÃ i khoáº£n hoáº·c NÃ¢ng cáº¥p tÃ i khoáº£n, DRX sáº½ bÃ n giao thÃ´ng tin Ä‘Äƒng nháº­p riÃªng biá»‡t (Username/Password) hoáº·c thá»±c hiá»‡n nÃ¢ng cáº¥p chÃ­nh chá»§ trá»±c tiáº¿p trÃªn tÃ i khoáº£n cá»§a báº¡n theo Ä‘Ãºng mÃ´ táº£ sáº£n pháº©m.'
    },
    {
      id: 'faq-6',
      category: 'security',
      question: 'Key Game mua táº¡i DRX Hardware cÃ³ bá»‹ khÃ³a tÃ i khoáº£n Steam (VAC Ban) khÃ´ng?',
      answer: 'Táº¥t cáº£ Key Game bÃ¡n ra táº¡i DRX Hardware lÃ  100% báº£n quyá»n chÃ­nh hÃ£ng láº¥y tá»« cÃ¡c nhÃ  phÃ¡t hÃ nh game tháº¿ giá»›i. Game kÃ­ch hoáº¡t vÄ©nh viá»…n trÃªn Steam cá»§a báº¡n vÃ  tuyá»‡t Ä‘á»‘i khÃ´ng bao giá» bá»‹ khÃ³a tÃ i khoáº£n.'
    },
    {
      id: 'faq-7',
      category: 'security',
      question: 'Náº¿u Key mua bá»‹ lá»—i "Already Product Activated" thÃ¬ pháº£i xá»­ lÃ½ tháº¿ nÃ o?',
      answer: 'Náº¿u gáº·p trÆ°á»ng há»£p hiáº¿m hoi nÃ y, báº¡n chá»‰ cáº§n chá»¥p mÃ n hÃ¬nh lá»—i vÃ  gá»­i MÃ£ Ä‘Æ¡n hÃ ng cho CSKH DRX qua Fanpage. Äá»™i ngÅ© ká»¹ thuáº­t viÃªn DRX sáº½ kiá»ƒm tra vÃ  Ä‘á»•i ngay Key má»›i 100% cho báº¡n trong dÆ°á»›i 15 phÃºt.'
    }
  ];

  const filteredFAQs = FAQ_LIST.filter((item) => {
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
    const matchesSearch = typeof item.answer === 'string'
      ? item.question.toLowerCase().includes(searchQuery.toLowerCase()) || item.answer.toLowerCase().includes(searchQuery.toLowerCase())
      : item.question.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <CartProvider>
      <div className="min-h-screen bg-white text-black flex flex-col antialiased">
        <Header />

        {/* HERO BANNER */}
        <section className="relative overflow-hidden bg-zinc-950 py-16 text-white border-b border-zinc-800">
          <div className="absolute inset-0 bg-gradient-to-r from-amber-950/30 to-transparent pointer-events-none" />
          <div className="mx-auto max-w-4xl px-4 text-center space-y-6 relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/10 border border-amber-500/20 px-3.5 py-1 text-xs font-bold text-amber-400 uppercase tracking-widest mx-auto">
              <HelpCircle className="h-4 w-4" />
              <span>TRUNG TÃ‚M Há»¢ TRá»¢ KHÃCH HÃ€NG</span>
            </div>

            <h1
              className="font-heading text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-wider uppercase text-white"
              style={{ lineHeight: '1.55' }}
            >
              CÃ‚U Há»ŽI THÆ¯á»œNG Gáº¶P (FAQ)
            </h1>

            <p className="text-xs sm:text-sm text-zinc-400 font-light max-w-xl mx-auto leading-relaxed">
              Giáº£i Ä‘Ã¡p nhanh chÃ³ng táº¥t cáº£ tháº¯c máº¯c vá» cÃ¡ch kÃ­ch hoáº¡t Key Steam, quy trÃ¬nh thanh toÃ¡n, náº¡p vÃ­ vÃ  chÃ­nh sÃ¡ch báº£o máº­t táº¡i DRX Hardware.
            </p>

            {/* SEARCH INPUT BAR */}
            <div className="relative max-w-xl mx-auto pt-2">
              <Search className="absolute left-4 top-5 h-5 w-5 text-zinc-400" />
              <input
                type="text"
                placeholder="Nháº­p tá»« khÃ³a tÃ¬m kiáº¿m (VD: kÃ­ch hoáº¡t key, thanh toÃ¡n, vÃ­ DRX...)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-2xl border border-zinc-800 bg-zinc-900/90 py-3.5 pl-12 pr-4 text-xs font-semibold text-white placeholder-zinc-500 focus:border-DRX-primary focus:outline-none focus:ring-1 focus:ring-DRX-primary shadow-xl transition-all"
              />
            </div>
          </div>
        </section>

        {/* BREADCRUMB */}
        <div className="bg-DRX-surface border-b border-DRX-border py-3">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center gap-2 text-xs text-DRX-textMuted">
            <Link href="/" className="hover:text-black transition-colors">Trang chá»§</Link>
            <span>/</span>
            <span className="text-black font-bold">CÃ¢u há»i thÆ°á»ng gáº·p</span>
          </div>
        </div>

        {/* MAIN FAQ CONTENT */}
        <main className="flex-1 mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8 py-12 space-y-10">
          {/* CATEGORY TABS FILTER */}
          <div className="flex flex-wrap items-center justify-center gap-2 border-b border-DRX-border pb-4">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-4 py-2 rounded-full text-xs font-bold uppercase transition-all ${
                activeCategory === 'all'
                  ? 'bg-black text-white shadow-sm'
                  : 'bg-DRX-surface text-gray-600 hover:text-black border border-DRX-border'
              }`}
            >
              Táº¥t Cáº£ CÃ¢u Há»i ({FAQ_LIST.length})
            </button>

            <button
              onClick={() => setActiveCategory('activation')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold uppercase transition-all ${
                activeCategory === 'activation'
                  ? 'bg-black text-white shadow-sm'
                  : 'bg-DRX-surface text-gray-600 hover:text-black border border-DRX-border'
              }`}
            >
              <Gamepad2 className="h-3.5 w-3.5 text-sky-400" />
              <span>KÃ­ch Hoáº¡t Key Game</span>
            </button>

            <button
              onClick={() => setActiveCategory('payment')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold uppercase transition-all ${
                activeCategory === 'payment'
                  ? 'bg-black text-white shadow-sm'
                  : 'bg-DRX-surface text-gray-600 hover:text-black border border-DRX-border'
              }`}
            >
              <CreditCard className="h-3.5 w-3.5 text-emerald-400" />
              <span>Thanh ToÃ¡n & Náº¡p VÃ­</span>
            </button>

            <button
              onClick={() => setActiveCategory('security')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold uppercase transition-all ${
                activeCategory === 'security'
                  ? 'bg-black text-white shadow-sm'
                  : 'bg-DRX-surface text-gray-600 hover:text-black border border-DRX-border'
              }`}
            >
              <Shield className="h-3.5 w-3.5 text-amber-400" />
              <span>Báº£o HÃ nh & An ToÃ n</span>
            </button>
          </div>

          {/* ACCORDION ITEMS LIST */}
          <div className="space-y-4">
            {filteredFAQs.length === 0 ? (
              <div className="py-16 text-center text-xs text-DRX-textMuted space-y-2">
                <HelpCircle className="h-10 w-10 text-gray-300 mx-auto" />
                <p>KhÃ´ng tÃ¬m tháº¥y cÃ¢u há»i nÃ o phÃ¹ há»£p vá»›i tá»« khÃ³a "{searchQuery}".</p>
                <button
                  onClick={() => { setSearchQuery(''); setActiveCategory('all'); }}
                  className="text-xs font-bold text-DRX-primary uppercase hover:underline"
                >
                  XÃ³a bá»™ lá»c tÃ¬m kiáº¿m
                </button>
              </div>
            ) : (
              filteredFAQs.map((item) => {
                const isOpen = openId === item.id;
                return (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-DRX-border bg-white overflow-hidden transition-all duration-200 hover:border-black"
                  >
                    <button
                      onClick={() => setOpenId(isOpen ? null : item.id)}
                      className="w-full px-6 py-5 flex items-center justify-between text-left gap-4 bg-white hover:bg-DRX-surface/50 transition-colors cursor-pointer"
                    >
                      <span className="font-heading text-sm font-extrabold text-black pr-2">
                        {item.question}
                      </span>
                      <div className={`p-1.5 rounded-full border border-DRX-border text-gray-500 shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180 bg-black text-white border-black' : ''}`}>
                        <ChevronDown className="h-4 w-4" />
                      </div>
                    </button>

                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2, ease: 'easeInOut' }}
                          className="overflow-hidden"
                        >
                          <div className="px-6 pb-6 pt-2 text-xs text-DRX-textMuted leading-relaxed border-t border-DRX-border/50 bg-DRX-surface/30">
                            {item.answer}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })
            )}
          </div>

          {/* NEED STILL HELP CALLOUT BOX */}
          <div className="rounded-2xl bg-zinc-950 text-white p-8 border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="space-y-1">
              <h3 className="font-heading text-base font-extrabold uppercase text-white flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-amber-400" />
                <span>VáºªN Cáº¦N GIáº¢I ÄÃP THáº®C Máº®C?</span>
              </h3>
              <p className="text-xs text-zinc-400 font-light">
                Äá»™i ngÅ© chÄƒm sÃ³c khÃ¡ch hÃ ng DRX Hardware luÃ´n cÃ³ máº·t 24/7 Ä‘á»ƒ tÆ° váº¥n vÃ  há»— trá»£ báº¡n tá»©c thÃ¬.
              </p>
            </div>

            <a
              href="https://facebook.com"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-DRX bg-DRX-primary hover:bg-DRX-primaryHover text-white px-6 py-3 text-xs font-bold uppercase tracking-wider transition-all shadow-buttonGlow shrink-0"
            >
              <MessageSquare className="h-4 w-4" />
              <span>LiÃªn Há»‡ CSKH 24/7</span>
            </a>
          </div>
        </main>

        <Footer />
        <CartDrawer />
      </div>
    </CartProvider>
  );
}

