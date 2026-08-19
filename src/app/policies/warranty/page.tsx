'use client';

import React from 'react';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { CartDrawer } from '@/components/CartDrawer';
import { CartProvider } from '@/context/CartContext';
import { 
  ShieldCheck, RefreshCw, Clock, CheckCircle2, AlertTriangle, 
  HelpCircle, MessageSquare, ArrowRight, Shield, Zap, FileText, PhoneCall
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function WarrantyPolicyPage() {
  return (
    <CartProvider>
      <div className="min-h-screen bg-white text-black flex flex-col antialiased">
        <Header />

        {/* HERO BANNER SECTION */}
        <section className="relative overflow-hidden bg-zinc-950 py-16 text-white border-b border-zinc-800">
          <div className="absolute inset-0 bg-gradient-to-r from-sky-950/40 to-transparent pointer-events-none" />
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
              <div className="space-y-4 max-w-2xl">
                <div className="inline-flex items-center gap-2 rounded-full bg-sky-500/10 border border-sky-500/20 px-3.5 py-1 text-xs font-bold text-sky-400 uppercase tracking-widest">
                  <ShieldCheck className="h-4 w-4" />
                  <span>CAM Káº¾T AN TÃ‚M 100%</span>
                </div>
                <h1
                  className="font-heading text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-wider uppercase text-white"
                  style={{ lineHeight: '1.55' }}
                >
                  CHÃNH SÃCH Báº¢O HÃ€NH & HOÃ€N TIá»€N
                </h1>
                <p className="text-sm sm:text-base text-zinc-400 font-light leading-relaxed">
                  Táº¡i DRX Hardware, táº¥t cáº£ báº£n quyá»n Key Game vÃ  TÃ i Khoáº£n Dá»‹ch Vá»¥ Ä‘á»u Ä‘Æ°á»£c Ä‘áº£m báº£o chÃ­nh hÃ£ng 100%. ChÃºng tÃ´i cam káº¿t báº£o vá»‡ quyá»n lá»£i tá»‘i Ä‘a cho game thá»§ vá»›i chÃ­nh sÃ¡ch Ä‘á»•i tráº£ nhanh chÃ³ng trong 15 phÃºt.
                </p>
              </div>

              {/* QUICK STAT BADGE */}
              <div className="bg-zinc-900/90 border border-zinc-800 p-6 rounded-2xl backdrop-blur-md shadow-2xl space-y-4 shrink-0 w-full md:w-80">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-sky-500/10 rounded-xl border border-sky-500/20 text-sky-400">
                    <Clock className="h-6 w-6" />
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">Thá»i Gian Xá»­ LÃ½ Báº£o HÃ nh</span>
                    <span className="text-xl font-extrabold text-white">DÆ°á»›i 15 PhÃºt</span>
                  </div>
                </div>
                <div className="border-t border-zinc-800 pt-3 flex justify-between items-center text-xs text-zinc-400">
                  <span>Há»— trá»£ ká»¹ thuáº­t:</span>
                  <span className="font-extrabold text-emerald-400">24/7 Táº¥t cáº£ cÃ¡c ngÃ y</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* BREADCRUMB */}
        <div className="bg-DRX-surface border-b border-DRX-border py-3">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center gap-2 text-xs text-DRX-textMuted">
            <Link href="/" className="hover:text-black transition-colors">Trang chá»§</Link>
            <span>/</span>
            <span className="text-black font-bold">ChÃ­nh sÃ¡ch báº£o hÃ nh</span>
          </div>
        </div>

        {/* MAIN CONTENT */}
        <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-12 space-y-16">
          {/* 4 CORE COMMITMENT CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="rounded-DRX border border-DRX-border bg-white p-6 space-y-3 hover:border-black hover:shadow-lightShadow transition-all">
              <div className="w-12 h-12 rounded-DRX bg-sky-50 border border-sky-200 flex items-center justify-center text-DRX-primary">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="font-heading text-sm font-extrabold uppercase text-black">KEY Báº¢N QUYá»€N 100%</h3>
              <p className="text-xs text-DRX-textMuted leading-relaxed">
                Nháº­p trá»±c tiáº¿p tá»« cÃ¡c nhÃ  phÃ¡t hÃ nh Steam, Epic Games, EA, Ubisoft. KhÃ´ng bÃ¡n Key giáº£ hay rÃ¡c code.
              </p>
            </div>

            <div className="rounded-DRX border border-DRX-border bg-white p-6 space-y-3 hover:border-black hover:shadow-lightShadow transition-all">
              <div className="w-12 h-12 rounded-DRX bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                <RefreshCw className="h-6 w-6" />
              </div>
              <h3 className="font-heading text-sm font-extrabold uppercase text-black">1 Äá»”I 1 Tá»¨C THÃŒ</h3>
              <p className="text-xs text-DRX-textMuted leading-relaxed">
                Äá»•i ngay Key má»›i hoáº·c tÃ i khoáº£n tÆ°Æ¡ng Ä‘Æ°Æ¡ng náº¿u sáº£n pháº©m bá»‹ lá»—i do há»‡ thá»‘ng kÃ­ch hoáº¡t.
              </p>
            </div>

            <div className="rounded-DRX border border-DRX-border bg-white p-6 space-y-3 hover:border-black hover:shadow-lightShadow transition-all">
              <div className="w-12 h-12 rounded-DRX bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
                <Zap className="h-6 w-6" />
              </div>
              <h3 className="font-heading text-sm font-extrabold uppercase text-black">HOÃ€N TIá»€N 100%</h3>
              <p className="text-xs text-DRX-textMuted leading-relaxed">
                HoÃ n tiá»n 100% vÃ o VÃ­ DRX hoáº·c NgÃ¢n hÃ ng náº¿u háº¿t hÃ ng thay tháº¿ hoáº·c sáº£n pháº©m khÃ´ng Ä‘Ãºng mÃ´ táº£.
              </p>
            </div>

            <div className="rounded-DRX border border-DRX-border bg-white p-6 space-y-3 hover:border-black hover:shadow-lightShadow transition-all">
              <div className="w-12 h-12 rounded-DRX bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600">
                <Clock className="h-6 w-6" />
              </div>
              <h3 className="font-heading text-sm font-extrabold uppercase text-black">Báº¢O HÃ€NH TOÃ€N THá»œI GIAN</h3>
              <p className="text-xs text-DRX-textMuted leading-relaxed">
                Báº£o hÃ nh trá»n Ä‘á»i sáº£n pháº©m Ä‘á»‘i vá»›i Key Game vÄ©nh viá»…n vÃ  báº£o hÃ nh thá»i háº¡n Ä‘á»‘i vá»›i TÃ i khoáº£n gÃ³i dá»‹ch vá»¥.
              </p>
            </div>
          </div>

          {/* DETAILED POLICY SECTIONS */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
            <div className="lg:col-span-2 space-y-10">
              {/* SECTION 1 */}
              <section className="space-y-4">
                <div className="flex items-center gap-3 border-b border-DRX-border pb-3">
                  <span className="font-heading text-xl font-extrabold text-DRX-primary">01.</span>
                  <h2 className="font-heading text-lg font-extrabold uppercase tracking-wider text-black">
                    Ná»˜I DUNG VÃ€ ÄIá»€U KIá»†N Báº¢O HÃ€NH
                  </h2>
                </div>
                <div className="space-y-3 text-xs text-DRX-textMuted leading-relaxed">
                  <p>DRX Hardware thá»±c hiá»‡n báº£o hÃ nh táº¥t cáº£ sáº£n pháº©m ká»¹ thuáº­t sá»‘ Ä‘Æ°á»£c mua trá»±c tiáº¿p táº¡i website <strong>http://localhost:3000</strong>. CÃ¡c trÆ°á»ng há»£p Ä‘Æ°á»£c báº£o hÃ nh bao gá»“m:</p>
                  <ul className="space-y-2 pl-4 list-disc text-black font-medium">
                    <li>Key game nháº­n Ä‘Æ°á»£c bá»‹ bÃ¡o lá»—i <strong>Duplicate / Already Used</strong> (ÄÃ£ Ä‘Æ°á»£c kÃ­ch hoáº¡t trÆ°á»›c Ä‘Ã³).</li>
                    <li>Key game bá»‹ sai vÃ¹ng quá»‘c gia (Invalid Region) so vá»›i vÃ¹ng ghi trÃªn thÃ´ng tin sáº£n pháº©m.</li>
                    <li>MÃ£ kÃ­ch hoáº¡t bá»‹ má» hoáº·c thiáº¿u kÃ½ tá»± do lá»—i phÃ¡t sinh tá»« nhÃ  cung cáº¥p.</li>
                    <li>TÃ i khoáº£n game/dá»‹ch vá»¥ mua táº¡i DRX bá»‹ máº¥t quyá»n truy cáº­p trong thá»i háº¡n báº£o hÃ nh.</li>
                  </ul>
                </div>
              </section>

              {/* SECTION 2 */}
              <section className="space-y-4">
                <div className="flex items-center gap-3 border-b border-DRX-border pb-3">
                  <span className="font-heading text-xl font-extrabold text-DRX-primary">02.</span>
                  <h2 className="font-heading text-lg font-extrabold uppercase tracking-wider text-black">
                    CÃC TRÆ¯á»œNG Há»¢P KHÃ”NG ÄÆ¯á»¢C Báº¢O HÃ€NH
                  </h2>
                </div>
                <div className="bg-red-50/50 border border-red-200 rounded-DRX p-4 space-y-3 text-xs text-red-950">
                  <div className="flex items-center gap-2 font-bold text-red-700 uppercase">
                    <AlertTriangle className="h-4 w-4 shrink-0 text-red-600" />
                    <span>LÆ°u Ã Quan Trá»ng NÃ¢ng Cao Báº£o Máº­t</span>
                  </div>
                  <ul className="space-y-2 pl-4 list-disc leading-relaxed text-red-900">
                    <li>TÃ i khoáº£n cÃ¡ nhÃ¢n cá»§a khÃ¡ch hÃ ng bá»‹ cáº¥m (VAC Ban, Account Ban) do sá»­ dá»¥ng pháº§n má»m thá»© ba / Hack / Cheat.</li>
                    <li>KhÃ¡ch hÃ ng tá»± Ã½ tiáº¿t lá»™ Key game hoáº·c thÃ´ng tin tÃ i khoáº£n cho ngÆ°á»i khÃ¡c dáº«n Ä‘áº¿n máº¥t mÃ¡t.</li>
                    <li>KhÃ¡ch hÃ ng yÃªu cáº§u tráº£ hÃ ng vá»›i lÃ½ do "khÃ´ng thÃ­ch game" hoáº·c "mÃ¡y tÃ­nh khÃ´ng Ä‘á»§ cáº¥u hÃ¬nh chÆ¡i game".</li>
                    <li>VÆ°á»£t quÃ¡ thá»i háº¡n báº£o hÃ nh quy Ä‘á»‹nh Ä‘á»‘i vá»›i tá»«ng loáº¡i tÃ i khoáº£n dá»‹ch vá»¥.</li>
                  </ul>
                </div>
              </section>

              {/* SECTION 3: WORKFLOW STEPS */}
              <section className="space-y-4">
                <div className="flex items-center gap-3 border-b border-DRX-border pb-3">
                  <span className="font-heading text-xl font-extrabold text-DRX-primary">03.</span>
                  <h2 className="font-heading text-lg font-extrabold uppercase tracking-wider text-black">
                    QUY TRÃŒNH YÃŠU Cáº¦U Báº¢O HÃ€NH (3 BÆ¯á»šC NHAH NÃ“NG)
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                  <div className="bg-DRX-surface p-4 rounded-DRX border border-DRX-border space-y-2">
                    <span className="w-7 h-7 rounded-full bg-black text-white font-extrabold text-xs flex items-center justify-center">1</span>
                    <h4 className="font-heading text-xs font-bold text-black uppercase">Chá»¥p áº¢nh Lá»—i</h4>
                    <p className="text-[11px] text-DRX-textMuted">Chá»¥p láº¡i áº£nh mÃ n hÃ¬nh bÃ¡o lá»—i khi kÃ­ch hoáº¡t Key trÃªn Steam / Epic Games.</p>
                  </div>

                  <div className="bg-DRX-surface p-4 rounded-DRX border border-DRX-border space-y-2">
                    <span className="w-7 h-7 rounded-full bg-black text-white font-extrabold text-xs flex items-center justify-center">2</span>
                    <h4 className="font-heading text-xs font-bold text-black uppercase">Gá»­i MÃ£ ÄÆ¡n HÃ ng</h4>
                    <p className="text-[11px] text-DRX-textMuted">Gá»­i MÃ£ Ä‘Æ¡n hÃ ng (VD: DRX-8X912) vÃ  áº£nh lá»—i cho bá»™ pháº­n CSKH DRX.</p>
                  </div>

                  <div className="bg-DRX-surface p-4 rounded-DRX border border-DRX-border space-y-2">
                    <span className="w-7 h-7 rounded-full bg-black text-white font-extrabold text-xs flex items-center justify-center">3</span>
                    <h4 className="font-heading text-xs font-bold text-black uppercase">Nháº­n Key Má»›i</h4>
                    <p className="text-[11px] text-DRX-textMuted">Ká»¹ thuáº­t viÃªn xÃ¡c minh vÃ  cáº¥p Key má»›i hoáº·c hoÃ n tiá»n ngay trong 15 phÃºt.</p>
                  </div>
                </div>
              </section>
            </div>

            {/* SIDEBAR SUPPORT BOX */}
            <div className="space-y-6">
              <div className="rounded-DRX border border-DRX-border bg-DRX-surface p-6 space-y-4">
                <div className="flex items-center gap-3 text-black">
                  <MessageSquare className="h-6 w-6 text-DRX-primary" />
                  <h3 className="font-heading text-sm font-extrabold uppercase">Cáº¦N Há»– TRá»¢ Báº¢O HÃ€NH Gáº¤P?</h3>
                </div>
                <p className="text-xs text-DRX-textMuted leading-relaxed">
                  Äá»™i ngÅ© ká»¹ thuáº­t DRX Hardware luÃ´n tÃºc trá»±c 24/7 Ä‘á»ƒ giáº£i quyáº¿t má»i sá»± cá»‘ kÃ­ch hoáº¡t cho báº¡n.
                </p>

                <div className="space-y-2.5 pt-2">
                  <a
                    href="https://facebook.com"
                    target="_blank"
                    rel="noreferrer"
                    className="w-full flex items-center justify-center gap-2 rounded-DRX bg-DRX-primary hover:bg-DRX-primaryHover text-white py-3 text-xs font-bold uppercase tracking-wider transition-all shadow-buttonGlow"
                  >
                    <MessageSquare className="h-4 w-4" />
                    <span>Chat Fanpage CSKH 24/7</span>
                  </a>

                  <Link
                    href="/policies/faq"
                    className="w-full flex items-center justify-center gap-2 rounded-DRX border border-DRX-border bg-white text-black py-3 text-xs font-bold uppercase tracking-wider hover:border-black transition-all"
                  >
                    <HelpCircle className="h-4 w-4" />
                    <span>Xem CÃ¢u Há»i ThÆ°á»ng Gáº·p</span>
                  </Link>
                </div>
              </div>

              <div className="rounded-DRX border border-emerald-200 bg-emerald-50/60 p-5 space-y-2">
                <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs uppercase">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>XÃ¡c Minh ÄÆ¡n HÃ ng Tá»± Äá»™ng</span>
                </div>
                <p className="text-[11px] text-emerald-900 leading-relaxed">
                  Má»i Key Game mua táº¡i DRX Ä‘á»u lÆ°u trá»¯ mÃ£ checksum an toÃ n trong lá»‹ch sá»­ Ä‘Æ¡n hÃ ng tÃ i khoáº£n cá»§a báº¡n.
                </p>
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

