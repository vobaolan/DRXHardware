'use client';

import React from 'react';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { CartDrawer } from '@/components/CartDrawer';
import { CartProvider } from '@/context/CartContext';
import { 
  FileText, ShieldCheck, CheckCircle2, AlertCircle, Scale, 
  HelpCircle, MessageSquare, ArrowRight, Lock, UserCheck
} from 'lucide-react';

export default function TermsPolicyPage() {
  return (
    <CartProvider>
      <div className="min-h-screen bg-white text-black flex flex-col antialiased">
        <Header />

        {/* HERO BANNER */}
        <section className="relative overflow-hidden bg-zinc-950 py-16 text-white border-b border-zinc-800">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-950/40 to-transparent pointer-events-none" />
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/10 border border-blue-500/20 px-3.5 py-1 text-xs font-bold text-blue-400 uppercase tracking-widest mx-auto">
              <Scale className="h-4 w-4" />
              <span>QUY Äá»ŠNH & THá»ŽA THUáº¬N NGÆ¯á»œI DÃ™NG</span>
            </div>

            <h1
              className="font-heading text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-wider uppercase text-white"
              style={{ lineHeight: '1.55' }}
            >
              ÄIá»€U KHOáº¢N Dá»ŠCH Vá»¤ DRX Hardware
            </h1>

            <p className="text-xs sm:text-sm text-zinc-400 font-light max-w-2xl mx-auto leading-relaxed">
              Vui lÃ²ng Ä‘á»c ká»¹ cÃ¡c quy Ä‘á»‹nh vÃ  Ä‘iá»u khoáº£n sá»­ dá»¥ng dÆ°á»›i Ä‘Ã¢y trÆ°á»›c khi thá»±c hiá»‡n giao dá»‹ch mua bÃ¡n báº£n quyá»n game vÃ  tÃ i khoáº£n dá»‹ch vá»¥ táº¡i DRX Hardware.
            </p>
          </div>
        </section>

        {/* BREADCRUMB */}
        <div className="bg-DRX-surface border-b border-DRX-border py-3">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center gap-2 text-xs text-DRX-textMuted">
            <Link href="/" className="hover:text-black transition-colors">Trang chá»§</Link>
            <span>/</span>
            <span className="text-black font-bold">Äiá»u khoáº£n dá»‹ch vá»¥</span>
          </div>
        </div>

        {/* MAIN CONTENT */}
        <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-12 space-y-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
            <div className="lg:col-span-2 space-y-10">
              {/* SECTION 1 */}
              <section className="space-y-3">
                <div className="flex items-center gap-3 border-b border-DRX-border pb-3">
                  <span className="font-heading text-xl font-extrabold text-DRX-primary">01.</span>
                  <h2 className="font-heading text-lg font-extrabold uppercase text-black">
                    QUY Äá»ŠNH Vá»€ TÃ€I KHOáº¢N NGÆ¯á»œI DÃ™NG
                  </h2>
                </div>
                <div className="space-y-3 text-xs text-DRX-textMuted leading-relaxed">
                  <p>Khi Ä‘Äƒng kÃ½ tÃ i khoáº£n táº¡i DRX Hardware, ngÆ°á»i dÃ¹ng cáº§n tuÃ¢n thá»§ cÃ¡c nghÄ©a vá»¥ sau:</p>
                  <ul className="space-y-2 pl-4 list-disc text-black font-medium">
                    <li>Cung cáº¥p thÃ´ng tin Ä‘á»‹a chá»‰ Email chÃ­nh xÃ¡c Ä‘á»ƒ nháº­n mÃ£ Key Game vÃ  thÃ´ng bÃ¡o giao dá»‹ch.</li>
                    <li>CÃ³ trÃ¡ch nhiá»‡m tá»± báº£o máº­t máº­t kháº©u tÃ i khoáº£n cÃ¡ nhÃ¢n. DRX khÃ´ng chá»‹u trÃ¡ch nhiá»‡m vá»›i cÃ¡c trÆ°á»ng há»£p lá»™ máº­t kháº©u tá»« phÃ­a ngÆ°á»i dÃ¹ng.</li>
                    <li>Má»—i cÃ¡ nhÃ¢n chá»‰ nÃªn Ä‘Äƒng kÃ½ vÃ  sá»­ dá»¥ng má»™t tÃ i khoáº£n chÃ­nh chá»§ trÃªn há»‡ thá»‘ng.</li>
                  </ul>
                </div>
              </section>

              {/* SECTION 2 */}
              <section className="space-y-3">
                <div className="flex items-center gap-3 border-b border-DRX-border pb-3">
                  <span className="font-heading text-xl font-extrabold text-DRX-primary">02.</span>
                  <h2 className="font-heading text-lg font-extrabold uppercase text-black">
                    GIAO Dá»ŠCH VÃ€ GIAO NHáº¬N Sáº¢N PHáº¨M Tá»° Äá»˜NG
                  </h2>
                </div>
                <div className="space-y-3 text-xs text-DRX-textMuted leading-relaxed">
                  <p>Há»‡ thá»‘ng DRX Hardware váº­n hÃ nh quy trÃ¬nh xuáº¥t Key hoÃ n toÃ n tá»± Ä‘á»™ng 24/7:</p>
                  <ul className="space-y-2 pl-4 list-disc text-black font-medium">
                    <li>Sau khi há»‡ thá»‘ng ngÃ¢n hÃ ng xÃ¡c nháº­n giao dá»‹ch thÃ nh cÃ´ng, Key Game sáº½ hiá»ƒn thá»‹ tá»©c thÃ¬ táº¡i giao diá»‡n vÃ  lÆ°u trá»¯ trong má»¥c <strong>Lá»‹ch Sá»­ ÄÆ¡n HÃ ng</strong>.</li>
                    <li>Má»©c giÃ¡ hiá»ƒn thá»‹ trÃªn website lÃ  giÃ¡ thanh toÃ¡n cuá»‘i cÃ¹ng Ä‘Ã£ bao gá»“m cÃ¡c chÆ°Æ¡ng trÃ¬nh khuyáº¿n mÃ£i.</li>
                    <li>TrÆ°á»ng há»£p chuyá»ƒn khoáº£n sai cÃº phÃ¡p hoáº·c sai sá»‘ tiá»n, há»‡ thá»‘ng sáº½ treo Ä‘Æ¡n chá» bá»™ pháº­n ká»¹ thuáº­t viÃªn xÃ¡c minh há»— trá»£ cá»™ng sá»‘ dÆ° thá»§ cÃ´ng trong tá»‘i Ä‘a 15 phÃºt.</li>
                  </ul>
                </div>
              </section>

              {/* SECTION 3 */}
              <section className="space-y-3">
                <div className="flex items-center gap-3 border-b border-DRX-border pb-3">
                  <span className="font-heading text-xl font-extrabold text-DRX-primary">03.</span>
                  <h2 className="font-heading text-lg font-extrabold uppercase text-black">
                    CÃC HÃ€NH VI Bá»Š Cáº¤M TRÃŠN Há»† THá»NG
                  </h2>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-DRX p-4 space-y-2 text-xs text-red-950">
                  <div className="flex items-center gap-2 font-bold text-red-700 uppercase">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <span>NghiÃªm Cáº¥m Tuyá»‡t Äá»‘i</span>
                  </div>
                  <ul className="space-y-1.5 pl-4 list-disc leading-relaxed text-red-900">
                    <li>Sá»­ dá»¥ng cÃ¡c tháº» ngÃ¢n hÃ ng giáº£ máº¡o, tháº» chui (CC chÃ¹a) hoáº·c can thiá»‡p báº¥t há»£p phÃ¡p vÃ o cá»•ng thanh toÃ¡n.</li>
                    <li>Lá»£i dá»¥ng lá»—i há»‡ thá»‘ng (Exploit Bug) Ä‘á»ƒ trá»¥c lá»£i mÃ£ giáº£m giÃ¡ hoáº·c rÃºt tiá»n khÃ´ng há»£p lá»‡.</li>
                    <li>Spam giao dá»‹ch rÃ¡c hoáº·c cÃ³ hÃ nh vi gian láº­n lÃ m giÃ¡n Ä‘oáº¡n háº¡ táº§ng mÃ¡y chá»§ DRX Hardware.</li>
                  </ul>
                </div>
              </section>
            </div>

            {/* SIDEBAR */}
            <div className="space-y-6">
              <div className="rounded-DRX border border-DRX-border bg-DRX-surface p-6 space-y-4">
                <div className="flex items-center gap-3 text-black">
                  <FileText className="h-6 w-6 text-DRX-primary" />
                  <h3 className="font-heading text-sm font-extrabold uppercase">Tá»”NG QUAN CAM Káº¾T</h3>
                </div>
                <p className="text-xs text-DRX-textMuted leading-relaxed">
                  DRX Hardware cam káº¿t mang láº¡i mÃ´i trÆ°á»ng mua sáº¯m game báº£n quyá»n minh báº¡ch, an toÃ n vÃ  báº£o vá»‡ tá»‘i Ä‘a quyá»n lá»£i cho game thá»§ Viá»‡t Nam.
                </p>

                <div className="pt-2">
                  <Link
                    href="/policies/privacy"
                    className="w-full flex items-center justify-center gap-2 rounded-DRX bg-black text-white py-3 text-xs font-bold uppercase tracking-wider hover:bg-zinc-800 transition-all"
                  >
                    <Lock className="h-4 w-4" />
                    <span>Xem ChÃ­nh SÃ¡ch Báº£o Máº­t</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </main>

        <Footer />
        <CartDrawer />
      </div>
    </CartProvider>
  );
}

