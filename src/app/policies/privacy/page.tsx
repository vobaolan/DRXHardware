'use client';

import React from 'react';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { CartDrawer } from '@/components/CartDrawer';
import { CartProvider } from '@/context/CartContext';
import { 
  ShieldCheck, Lock, CheckCircle2, Eye, Server, 
  HelpCircle, MessageSquare, ArrowRight, ShieldAlert, Key
} from 'lucide-react';

export default function PrivacyPolicyPage() {
  return (
    <CartProvider>
      <div className="min-h-screen bg-white text-black flex flex-col antialiased">
        <Header />

        {/* HERO BANNER */}
        <section className="relative overflow-hidden bg-zinc-950 py-16 text-white border-b border-zinc-800">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/40 to-transparent pointer-events-none" />
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-1 text-xs font-bold text-emerald-400 uppercase tracking-widest mx-auto">
              <Lock className="h-4 w-4" />
              <span>Báº¢O Máº¬T Dá»® LIá»†U Tá»I ÄA</span>
            </div>

            <h1
              className="font-heading text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-wider uppercase text-white"
              style={{ lineHeight: '1.55' }}
            >
              CHÃNH SÃCH Báº¢O Máº¬T THÃ”NG TIN
            </h1>

            <p className="text-xs sm:text-sm text-zinc-400 font-light max-w-2xl mx-auto leading-relaxed">
              DRX Hardware cam káº¿t báº£o vá»‡ tuyá»‡t Ä‘á»‘i thÃ´ng tin cÃ¡ nhÃ¢n vÃ  dá»¯ liá»‡u thanh toÃ¡n cá»§a khÃ¡ch hÃ ng theo cÃ¡c tiÃªu chuáº©n mÃ£ hÃ³a quá»‘c táº¿ cao nháº¥t.
            </p>
          </div>
        </section>

        {/* BREADCRUMB */}
        <div className="bg-DRX-surface border-b border-DRX-border py-3">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center gap-2 text-xs text-DRX-textMuted">
            <Link href="/" className="hover:text-black transition-colors">Trang chá»§</Link>
            <span>/</span>
            <span className="text-black font-bold">ChÃ­nh sÃ¡ch báº£o máº­t</span>
          </div>
        </div>

        {/* MAIN CONTENT */}
        <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-12 space-y-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
            <div className="lg:col-span-2 space-y-10">
              {/* SECTION 1 */}
              <section className="space-y-3">
                <div className="flex items-center gap-3 border-b border-DRX-border pb-3">
                  <span className="font-heading text-xl font-extrabold text-emerald-600">01.</span>
                  <h2 className="font-heading text-lg font-extrabold uppercase text-black">
                    Má»¤C ÄÃCH THU THáº¬P THÃ”NG TIN CÃ NHÃ‚N
                  </h2>
                </div>
                <div className="space-y-3 text-xs text-DRX-textMuted leading-relaxed">
                  <p>ChÃºng tÃ´i chá»‰ thu tháº­p cÃ¡c thÃ´ng tin tá»‘i thiá»ƒu cáº§n thiáº¿t Ä‘á»ƒ phá»¥c vá»¥ quÃ¡ trÃ¬nh xá»­ lÃ½ Ä‘Æ¡n hÃ ng cá»§a báº¡n bao gá»“m:</p>
                  <ul className="space-y-2 pl-4 list-disc text-black font-medium">
                    <li><strong>Äá»‹a chá»‰ Email:</strong> Äá»ƒ gá»­i thÃ´ng tin Key Game, hÃ³a Ä‘Æ¡n vÃ  khÃ´i phá»¥c máº­t kháº©u tÃ i khoáº£n.</li>
                    <li><strong>Há» vÃ  tÃªn hiá»ƒn thá»‹:</strong> Äá»ƒ há»— trá»£ CSKH xÆ°ng hÃ´ lá»‹ch sá»± vÃ  xÃ¡c minh tÃ i khoáº£n khi báº£o hÃ nh.</li>
                    <li><strong>Lá»‹ch sá»­ giao dá»‹ch:</strong> LÆ°u giá»¯ mÃ£ Key Game trong má»¥c Vault cÃ¡ nhÃ¢n Ä‘á»ƒ báº¡n cÃ³ thá»ƒ xem láº¡i báº¥t ká»³ lÃºc nÃ o.</li>
                  </ul>
                </div>
              </section>

              {/* SECTION 2 */}
              <section className="space-y-3">
                <div className="flex items-center gap-3 border-b border-DRX-border pb-3">
                  <span className="font-heading text-xl font-extrabold text-emerald-600">02.</span>
                  <h2 className="font-heading text-lg font-extrabold uppercase text-black">
                    CAM Káº¾T KHÃ”NG TIáº¾T Lá»˜ CHO BÃŠN THá»¨ BA
                  </h2>
                </div>
                <div className="space-y-3 text-xs text-DRX-textMuted leading-relaxed">
                  <p>DRX Hardware <strong>tuyá»‡t Ä‘á»‘i khÃ´ng trao Ä‘á»•i, bÃ¡n hoáº·c chia sáº»</strong> thÃ´ng tin cÃ¡ nhÃ¢n cá»§a khÃ¡ch hÃ ng cho báº¥t ká»³ bÃªn thá»© ba nÃ o vÃ¬ má»¥c Ä‘Ã­ch thÆ°Æ¡ng máº¡i hay quáº£ng cÃ¡o rÃ¡c.</p>
                  <p>ThÃ´ng tin thanh toÃ¡n ngÃ¢n hÃ ng qua mÃ£ VietQR Ä‘Æ°á»£c xá»­ lÃ½ trá»±c tiáº¿p thÃ´ng qua cá»•ng thanh toÃ¡n báº£o máº­t cá»§a ngÃ¢n hÃ ng, DRX Hardware hoÃ n toÃ n khÃ´ng lÆ°u trá»¯ mÃ£ PIN hay máº­t kháº©u ngÃ¢n hÃ ng cá»§a báº¡n.</p>
                </div>
              </section>

              {/* SECTION 3 */}
              <section className="space-y-3">
                <div className="flex items-center gap-3 border-b border-DRX-border pb-3">
                  <span className="font-heading text-xl font-extrabold text-emerald-600">03.</span>
                  <h2 className="font-heading text-lg font-extrabold uppercase text-black">
                    CÃ”NG NGHá»† MÃƒ HÃ“A Báº¢O Vá»† Dá»® LIá»†U
                  </h2>
                </div>
                <div className="bg-emerald-50 border border-emerald-200 rounded-DRX p-4 space-y-2 text-xs text-emerald-950">
                  <div className="flex items-center gap-2 font-bold text-emerald-800 uppercase">
                    <ShieldCheck className="h-4 w-4 text-emerald-600" />
                    <span>MÃ£ HÃ³a Chuáº©n SSL 256-Bit</span>
                  </div>
                  <p className="leading-relaxed text-emerald-900">
                    ToÃ n bá»™ káº¿t ná»‘i giá»¯a trÃ¬nh duyá»‡t cá»§a báº¡n vÃ  há»‡ thá»‘ng mÃ¡y chá»§ DRX Hardware Ä‘á»u Ä‘Æ°á»£c mÃ£ hÃ³a báº±ng chá»©ng chá»‰ SSL (HTTPS) tiÃªu chuáº©n cao cáº¥p, ngÄƒn cháº·n tuyá»‡t Ä‘á»‘i cÃ¡c hÃ nh vi Ä‘Ã¡nh cáº¯p dá»¯ liá»‡u trÃªn Ä‘Æ°á»ng truyá»n.
                  </p>
                </div>
              </section>
            </div>

            {/* SIDEBAR */}
            <div className="space-y-6">
              <div className="rounded-DRX border border-DRX-border bg-DRX-surface p-6 space-y-4">
                <div className="flex items-center gap-3 text-black">
                  <Lock className="h-6 w-6 text-emerald-600" />
                  <h3 className="font-heading text-sm font-extrabold uppercase">AN TÃ‚M TUYá»†T Äá»I</h3>
                </div>
                <p className="text-xs text-DRX-textMuted leading-relaxed">
                  Báº¡n cÃ³ quyá»n yÃªu cáº§u xÃ³a vÄ©nh viá»…n dá»¯ liá»‡u tÃ i khoáº£n cÃ¡ nhÃ¢n báº¥t ká»³ lÃºc nÃ o báº±ng cÃ¡ch gá»­i yÃªu cáº§u tá»›i bá»™ pháº­n há»— trá»£.
                </p>

                <div className="pt-2">
                  <Link
                    href="/policies/terms"
                    className="w-full flex items-center justify-center gap-2 rounded-DRX bg-black text-white py-3 text-xs font-bold uppercase tracking-wider hover:bg-zinc-800 transition-all"
                  >
                    <Eye className="h-4 w-4" />
                    <span>Xem Äiá»u Khoáº£n Dá»‹ch Vá»¥</span>
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

