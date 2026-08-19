'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { CartDrawer } from '@/components/CartDrawer';
import { CartProvider } from '@/context/CartContext';
import { 
  Gamepad2, Monitor, ArrowRight, CheckCircle2, Download, 
  Key, ShieldCheck, ShoppingCart, Lock, Sparkles, HelpCircle
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function GuidePolicyPage() {
  const [platform, setPlatform] = useState<'steam' | 'epic' | 'ea'>('steam');

  return (
    <CartProvider>
      <div className="min-h-screen bg-white text-black flex flex-col antialiased">
        <Header />

        {/* HERO BANNER */}
        <section className="relative overflow-hidden bg-zinc-950 py-16 text-white border-b border-zinc-800">
          <div className="absolute inset-0 bg-gradient-to-r from-sky-950/40 to-transparent pointer-events-none" />
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-sky-500/10 border border-sky-500/20 px-3.5 py-1 text-xs font-bold text-sky-400 uppercase tracking-widest mx-auto">
              <Gamepad2 className="h-4 w-4" />
              <span>HÆ¯á»šNG DáºªN CHI TIáº¾T Tá»ª A - Z</span>
            </div>

            <h1
              className="font-heading text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-wider uppercase text-white"
              style={{ lineHeight: '1.55' }}
            >
              HÆ¯á»šNG DáºªN MUA HÃ€NG & KÃCH HOáº T KEY GAME
            </h1>

            <p className="text-xs sm:text-sm text-zinc-400 font-light max-w-2xl mx-auto leading-relaxed">
              CÃ¡c bÆ°á»›c Ä‘Æ¡n giáº£n Ä‘á»ƒ mua sáº¯m vÃ  kÃ­ch hoáº¡t báº£n quyá»n game chÃ­nh hÃ£ng trÃªn Steam, Epic Games, EA App chá»‰ trong vÃ i phÃºt.
            </p>
          </div>
        </section>

        {/* BREADCRUMB */}
        <div className="bg-DRX-surface border-b border-DRX-border py-3">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center gap-2 text-xs text-DRX-textMuted">
            <Link href="/" className="hover:text-black transition-colors">Trang chá»§</Link>
            <span>/</span>
            <span className="text-black font-bold">HÆ°á»›ng dáº«n kÃ­ch hoáº¡t</span>
          </div>
        </div>

        {/* MAIN CONTENT */}
        <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-12 space-y-16">
          {/* SECTION 1: PURCHASING WORKFLOW (4 STEPS) */}
          <section className="space-y-8">
            <div className="text-center space-y-2 max-w-xl mx-auto">
              <h2 className="font-heading text-xl sm:text-2xl font-extrabold uppercase text-black">
                1. QUY TRÃŒNH MUA HÃ€NG Táº I DRX Hardware (4 BÆ¯á»šC)
              </h2>
              <p className="text-xs text-DRX-textMuted">Há»‡ thá»‘ng xá»­ lÃ½ tá»± Ä‘á»™ng 24/7 giao key trong dÆ°á»›i 3 giÃ¢y sau thanh toÃ¡n</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* STEP 1 */}
              <div className="rounded-2xl border border-DRX-border bg-white p-6 space-y-4 hover:border-black transition-all relative group">
                <div className="flex items-center justify-between">
                  <span className="w-10 h-10 rounded-xl bg-black text-white font-extrabold text-sm flex items-center justify-center shadow-md">
                    01
                  </span>
                  <ShoppingCart className="h-5 w-5 text-DRX-primary" />
                </div>
                <h3 className="font-heading text-sm font-extrabold uppercase text-black">Chá»n Game YÃªu ThÃ­ch</h3>
                <p className="text-xs text-DRX-textMuted leading-relaxed">
                  TÃ¬m kiáº¿m tá»±a game báº¡n mong muá»‘n táº¡i DRX Hardware, kiá»ƒm tra cáº¥u hÃ¬nh tá»‘i thiá»ƒu vÃ  báº¥m <strong>MUA NGAY</strong>.
                </p>
              </div>

              {/* STEP 2 */}
              <div className="rounded-2xl border border-DRX-border bg-white p-6 space-y-4 hover:border-black transition-all relative group">
                <div className="flex items-center justify-between">
                  <span className="w-10 h-10 rounded-xl bg-black text-white font-extrabold text-sm flex items-center justify-center shadow-md">
                    02
                  </span>
                  <Monitor className="h-5 w-5 text-emerald-500" />
                </div>
                <h3 className="font-heading text-sm font-extrabold uppercase text-black">QuÃ©t MÃ£ QR VietQR</h3>
                <p className="text-xs text-DRX-textMuted leading-relaxed">
                  Kiá»ƒm tra giá» hÃ ng, nháº­p MÃ£ giáº£m giÃ¡ (náº¿u cÃ³) vÃ  thá»±c hiá»‡n Chuyá»ƒn khoáº£n QR Code ngÃ¢n hÃ ng 24/7 hoÃ n toÃ n 0% phÃ­.
                </p>
              </div>

              {/* STEP 3 */}
              <div className="rounded-2xl border border-DRX-border bg-white p-6 space-y-4 hover:border-black transition-all relative group">
                <div className="flex items-center justify-between">
                  <span className="w-10 h-10 rounded-xl bg-black text-white font-extrabold text-sm flex items-center justify-center shadow-md">
                    03
                  </span>
                  <Key className="h-5 w-5 text-amber-500" />
                </div>
                <h3 className="font-heading text-sm font-extrabold uppercase text-black">Nháº­n Key Báº£n Quyá»n</h3>
                <p className="text-xs text-DRX-textMuted leading-relaxed">
                  Key Game hiá»ƒn thá»‹ ngay láº­p tá»©c trÃªn mÃ n hÃ¬nh. Äá»“ng thá»i Ä‘Æ°á»£c lÆ°u trá»¯ an toÃ n trong má»¥c <strong>Lá»‹ch Sá»­ ÄÆ¡n HÃ ng</strong>.
                </p>
              </div>

              {/* STEP 4 */}
              <div className="rounded-2xl border border-DRX-border bg-white p-6 space-y-4 hover:border-black transition-all relative group">
                <div className="flex items-center justify-between">
                  <span className="w-10 h-10 rounded-xl bg-black text-white font-extrabold text-sm flex items-center justify-center shadow-md">
                    04
                  </span>
                  <Download className="h-5 w-5 text-purple-500" />
                </div>
                <h3 className="font-heading text-sm font-extrabold uppercase text-black">KÃ­ch Hoáº¡t & Táº£i Game</h3>
                <p className="text-xs text-DRX-textMuted leading-relaxed">
                  Nháº­p mÃ£ Key vÃ o ná»n táº£ng tÆ°Æ¡ng á»©ng (Steam / Epic) Ä‘á»ƒ táº£i game báº£n quyá»n vá» mÃ¡y vÃ  tráº£i nghiá»‡m ngay!
                </p>
              </div>
            </div>
          </section>

          {/* SECTION 2: PLATFORM ACTIVATION GUIDES */}
          <section className="space-y-8 border-t border-DRX-border pt-12">
            <div className="text-center space-y-2 max-w-xl mx-auto">
              <h2 className="font-heading text-xl sm:text-2xl font-extrabold uppercase text-black">
                2. HÆ¯á»šNG DáºªN KÃCH HOáº T KEY THEO Ná»€N Táº¢NG
              </h2>
              <p className="text-xs text-DRX-textMuted">Chá»n ná»n táº£ng báº¡n Ä‘ang sá»­ dá»¥ng Ä‘á»ƒ xem cÃ¡c bÆ°á»›c thao tÃ¡c chi tiáº¿t</p>
            </div>

            {/* PLATFORM TOGGLE BUTTONS */}
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setPlatform('steam')}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-extrabold uppercase transition-all ${
                  platform === 'steam'
                    ? 'bg-black text-white shadow-md'
                    : 'bg-DRX-surface text-gray-700 hover:text-black border border-DRX-border'
                }`}
              >
                <Monitor className="h-4 w-4 text-sky-400" />
                <span>Ná»n táº£ng Steam</span>
              </button>

              <button
                onClick={() => setPlatform('epic')}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-extrabold uppercase transition-all ${
                  platform === 'epic'
                    ? 'bg-black text-white shadow-md'
                    : 'bg-DRX-surface text-gray-700 hover:text-black border border-DRX-border'
                }`}
              >
                <Gamepad2 className="h-4 w-4 text-emerald-400" />
                <span>Epic Games Store</span>
              </button>

              <button
                onClick={() => setPlatform('ea')}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-extrabold uppercase transition-all ${
                  platform === 'ea'
                    ? 'bg-black text-white shadow-md'
                    : 'bg-DRX-surface text-gray-700 hover:text-black border border-DRX-border'
                }`}
              >
                <Key className="h-4 w-4 text-amber-400" />
                <span>EA App / Origin</span>
              </button>
            </div>

            {/* PLATFORM CONTENT DETAIL BOX */}
            <div className="rounded-2xl border border-DRX-border bg-DRX-surface/40 p-8 space-y-6 max-w-4xl mx-auto">
              {platform === 'steam' && (
                <div className="space-y-4 text-xs text-black leading-relaxed">
                  <h3 className="font-heading text-base font-extrabold uppercase text-DRX-primary flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-sky-500" />
                    <span>CÃC BÆ¯á»šC KÃCH HOáº T KEY TRÃŠN STEAM</span>
                  </h3>
                  <div className="space-y-3 pl-2">
                    <div className="flex items-start gap-3 bg-white p-3.5 rounded-xl border border-DRX-border">
                      <span className="font-extrabold text-sky-600 bg-sky-50 px-2 py-0.5 rounded text-[11px] shrink-0">BÆ°á»›c 1</span>
                      <p>Khá»Ÿi Ä‘á»™ng pháº§n má»m <strong>Steam Client</strong> trÃªn mÃ¡y tÃ­nh vÃ  Ä‘Äƒng nháº­p tÃ i khoáº£n Steam cá»§a báº¡n.</p>
                    </div>

                    <div className="flex items-start gap-3 bg-white p-3.5 rounded-xl border border-DRX-border">
                      <span className="font-extrabold text-sky-600 bg-sky-50 px-2 py-0.5 rounded text-[11px] shrink-0">BÆ°á»›c 2</span>
                      <p>NhÃ¬n lÃªn gÃ³c trÃªn bÃªn trÃ¡i cá»­a sá»• Steam, chá»n menu <strong>Games</strong> âž” Click chá»n <strong>Activate a Product on Steam...</strong></p>
                    </div>

                    <div className="flex items-start gap-3 bg-white p-3.5 rounded-xl border border-DRX-border">
                      <span className="font-extrabold text-sky-600 bg-sky-50 px-2 py-0.5 rounded text-[11px] shrink-0">BÆ°á»›c 3</span>
                      <p>Nháº¥n <strong>Next</strong> vÃ  <strong>I Agree</strong> vá»›i Ä‘iá»u khoáº£n dá»‹ch vá»¥ cá»§a Valve Steam.</p>
                    </div>

                    <div className="flex items-start gap-3 bg-white p-3.5 rounded-xl border border-DRX-border">
                      <span className="font-extrabold text-sky-600 bg-sky-50 px-2 py-0.5 rounded text-[11px] shrink-0">BÆ°á»›c 4</span>
                      <p>Copy mÃ£ Key Game táº¡i DRX Hardware (VD: <code className="font-mono bg-gray-100 px-1 py-0.5 rounded">XXXXX-XXXXX-XXXXX</code>) dÃ¡n vÃ o Ã´ Product Code âž” Báº¥m <strong>Confirm</strong> Ä‘á»ƒ táº£i game!</p>
                    </div>
                  </div>
                </div>
              )}

              {platform === 'epic' && (
                <div className="space-y-4 text-xs text-black leading-relaxed">
                  <h3 className="font-heading text-base font-extrabold uppercase text-emerald-600 flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                    <span>CÃC BÆ¯á»šC KÃCH HOáº T KEY TRÃŠN EPIC GAMES STORE</span>
                  </h3>
                  <div className="space-y-3 pl-2">
                    <div className="flex items-start gap-3 bg-white p-3.5 rounded-xl border border-DRX-border">
                      <span className="font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded text-[11px] shrink-0">BÆ°á»›c 1</span>
                      <p>Má»Ÿ pháº§n má»m <strong>Epic Games Launcher</strong> hoáº·c truy cáº­p trang web official cá»§a Epic Games.</p>
                    </div>

                    <div className="flex items-start gap-3 bg-white p-3.5 rounded-xl border border-DRX-border">
                      <span className="font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded text-[11px] shrink-0">BÆ°á»›c 2</span>
                      <p>Báº¥m vÃ o biá»ƒu tÆ°á»£ng Avatar tÃ i khoáº£n á»Ÿ gÃ³c trÃªn bÃªn pháº£i âž” Chá»n má»¥c <strong>Redeem Code</strong>.</p>
                    </div>

                    <div className="flex items-start gap-3 bg-white p-3.5 rounded-xl border border-DRX-border">
                      <span className="font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded text-[11px] shrink-0">BÆ°á»›c 3</span>
                      <p>DÃ¡n mÃ£ Redeem Code mua táº¡i DRX Hardware âž” Báº¥m nÃºt <strong>Redeem</strong>. Game sáº½ xuáº¥t hiá»‡n ngay trong ThÆ° viá»‡n (Library).</p>
                    </div>
                  </div>
                </div>
              )}

              {platform === 'ea' && (
                <div className="space-y-4 text-xs text-black leading-relaxed">
                  <h3 className="font-heading text-base font-extrabold uppercase text-amber-600 flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-amber-500" />
                    <span>CÃC BÆ¯á»šC KÃCH HOáº T KEY TRÃŠN EA APP (ORIGIN)</span>
                  </h3>
                  <div className="space-y-3 pl-2">
                    <div className="flex items-start gap-3 bg-white p-3.5 rounded-xl border border-DRX-border">
                      <span className="font-extrabold text-amber-600 bg-amber-50 px-2 py-0.5 rounded text-[11px] shrink-0">BÆ°á»›c 1</span>
                      <p>ÄÄƒng nháº­p vÃ o á»©ng dá»¥ng <strong>EA App</strong> trÃªn mÃ¡y tÃ­nh cá»§a báº¡n.</p>
                    </div>

                    <div className="flex items-start gap-3 bg-white p-3.5 rounded-xl border border-DRX-border">
                      <span className="font-extrabold text-amber-600 bg-amber-50 px-2 py-0.5 rounded text-[11px] shrink-0">BÆ°á»›c 2</span>
                      <p>VÃ o má»¥c <strong>My Collection</strong> âž” Nháº¥p vÃ o nÃºt <strong>Redeem Code</strong> á»Ÿ gÃ³c phÃ­a trÃªn.</p>
                    </div>

                    <div className="flex items-start gap-3 bg-white p-3.5 rounded-xl border border-DRX-border">
                      <span className="font-extrabold text-amber-600 bg-amber-50 px-2 py-0.5 rounded text-[11px] shrink-0">BÆ°á»›c 3</span>
                      <p>DÃ¡n mÃ£ Product Code mua táº¡i DRX Hardware vÃ  xÃ¡c nháº­n Ä‘á»ƒ táº£i game vá» thiáº¿t bá»‹.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* CTA EXPLORE GAMES */}
          <div className="rounded-2xl bg-zinc-950 text-white p-8 border border-zinc-800 text-center space-y-4">
            <h3 className="font-heading text-lg font-extrabold uppercase text-white tracking-wider">
              Báº N ÄÃƒ Sáº´N SÃ€NG KHÃM PHÃ THáº¾ GIá»šI GAME Báº¢N QUYá»€N?
            </h3>
            <p className="text-xs text-zinc-400 font-light max-w-lg mx-auto">
              HÃ ng trÄƒm tá»±a game hot nháº¥t tháº¿ giá»›i Ä‘ang Ä‘Æ°á»£c giáº£m giÃ¡ cá»±c sÃ¢u táº¡i DRX Hardware. Giao key tá»± Ä‘á»™ng trong 3 giÃ¢y.
            </p>
            <div className="pt-2">
              <Link
                href="/products"
                className="inline-flex items-center justify-center gap-2 rounded-DRX bg-DRX-primary hover:bg-DRX-primaryHover text-white px-8 py-3.5 text-xs font-bold uppercase tracking-wider transition-all shadow-buttonGlow active:scale-95"
              >
                <span>KhÃ¡m PhÃ¡ Cá»­a HÃ ng Ngay</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </main>

        <Footer />
        <CartDrawer />
      </div>
    </CartProvider>
  );
}

