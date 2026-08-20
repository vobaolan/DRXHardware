'use client';

import React from 'react';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { CartProvider } from '@/context/CartContext';
import { 
  ShieldCheck, RefreshCw, Clock, CheckCircle2, AlertTriangle, 
  HelpCircle, MessageSquare, ArrowRight, Shield, Zap, FileText, PhoneCall, Cpu, Wrench
} from 'lucide-react';

export default function WarrantyPolicyPage() {
  return (
    <CartProvider>
      <div className="min-h-screen bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 flex flex-col antialiased tech-grid-pattern transition-colors duration-300">
        <Header />

        {/* HERO BANNER SECTION (CLEAN LIGHT MODE) */}
        <section className="relative overflow-hidden bg-white dark:bg-slate-900 py-12 sm:py-16 border-b border-slate-200 dark:border-slate-800">
          <div className="absolute inset-0 bg-gradient-to-r from-sky-50 via-white to-blue-50/50 dark:from-slate-900 dark:via-[#071930] dark:to-slate-950 pointer-events-none" />
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
              <div className="space-y-4 max-w-2xl">
                <div className="inline-flex items-center gap-2 rounded-full bg-sky-50 dark:bg-sky-500/10 border border-sky-200 dark:border-sky-500/20 px-3.5 py-1 text-xs font-black text-[#0284c7] dark:text-sky-300 uppercase tracking-widest shadow-2xs">
                  <ShieldCheck className="h-4 w-4" />
                  <span>CAM KẾT AN TÂM 100% TẠI DRX HARDWARE</span>
                </div>
                <h1
                  className="font-heading text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black tracking-tight uppercase text-slate-900 dark:text-white"
                  style={{ lineHeight: '1.25' }}
                >
                  CHÍNH SÁCH BẢO HÀNH & ĐỔI TRẢ
                </h1>
                <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 font-normal leading-relaxed">
                  Tại DRX Hardware, tất cả linh kiện máy tính, CPU, VGA, Mainboard, RAM, SSD và PC ráp sẵn đều được bảo hành chính hãng từ 12 đến 36 tháng. Cam kết 1 đổi 1 trong 30 ngày đầu nếu có lỗi phần cứng từ nhà sản xuất.
                </p>
              </div>

              {/* QUICK STAT BADGE */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-4 shrink-0 w-full md:w-80">
                <div className="flex items-center gap-3.5">
                  <div className="p-3 bg-sky-50 dark:bg-slate-800 rounded-2xl border border-sky-100 dark:border-slate-700 text-[#0284c7]">
                    <Clock className="h-6 w-6" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider block">Thời Gian Xử Lý Bảo Hành</span>
                    <span className="text-xl font-black text-slate-900 dark:text-white">1 Đổi 1 Tức Thì</span>
                  </div>
                </div>
                <div className="border-t border-slate-100 dark:border-slate-800 pt-3 flex justify-between items-center text-xs text-slate-600 dark:text-slate-400">
                  <span>Hỗ trợ kỹ thuật:</span>
                  <span className="font-black text-emerald-600 dark:text-emerald-400">24/7 Tất cả các ngày</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* BREADCRUMB */}
        <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 py-3">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center gap-2 text-xs text-slate-500">
            <Link href="/" className="hover:text-[#0284c7] transition-colors">Trang Chủ</Link>
            <span>/</span>
            <span className="text-slate-900 dark:text-white font-bold">Chính Sách Bảo Hành</span>
          </div>
        </div>

        {/* MAIN CONTENT */}
        <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-12 space-y-14">
          {/* 4 CORE COMMITMENT CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-3 shadow-sm hover:border-[#0284c7] transition-all">
              <div className="w-12 h-12 rounded-2xl bg-sky-50 dark:bg-slate-800 border border-sky-200 dark:border-slate-700 flex items-center justify-center text-[#0284c7]">
                <Cpu className="h-6 w-6" />
              </div>
              <h3 className="font-heading text-sm font-black uppercase text-slate-900 dark:text-white">LINH KIỆN CHÍNH HÃNG 100%</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Nhập khẩu chính ngạch từ ASUS, MSI, Gigabyte, Intel, AMD, Kingston, Corsair. Đầy đủ hóa đơn VAT & tem bảo hành.
              </p>
            </div>

            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-3 shadow-sm hover:border-emerald-500 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-slate-800 border border-emerald-200 dark:border-slate-700 flex items-center justify-center text-emerald-600">
                <RefreshCw className="h-6 w-6" />
              </div>
              <h3 className="font-heading text-sm font-black uppercase text-slate-900 dark:text-white">1 ĐỔI 1 TRONG 30 NGÀY</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Đổi mới ngay linh kiện tương đương nếu phát sinh lỗi phần cứng từ nhà sản xuất trong 30 ngày đầu sử dụng.
              </p>
            </div>

            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-3 shadow-sm hover:border-amber-500 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-slate-800 border border-amber-200 dark:border-slate-700 flex items-center justify-center text-amber-600">
                <Zap className="h-6 w-6" />
              </div>
              <h3 className="font-heading text-sm font-black uppercase text-slate-900 dark:text-white">BẢO HÀNH HÃNG 36 THÁNG</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Hỗ trợ gửi bảo hành chính hãng nhanh chóng, cho mượn linh kiện thay thế tạm thời trong thời gian chờ xử lý.
              </p>
            </div>

            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-3 shadow-sm hover:border-indigo-500 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-slate-800 border border-indigo-200 dark:border-slate-700 flex items-center justify-center text-indigo-600">
                <Wrench className="h-6 w-6" />
              </div>
              <h3 className="font-heading text-sm font-black uppercase text-slate-900 dark:text-white">VỆ SINH PC TRỌN ĐỜI</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Miễn phí vệ sinh bụi bẩn, tra keo tản nhiệt gốm cao cấp và kiểm tra nhiệt độ định kỳ cho mọi bộ PC mua tại DRX.
              </p>
            </div>
          </div>

          {/* DETAILED WARRANTY TABLE */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
            <h2 className="text-lg font-black font-heading text-slate-900 dark:text-white uppercase tracking-wider">
              BẢNG THỜI HẠN BẢO HÀNH CHI TIẾT THEO LINH KIỆN
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase font-black">
                    <th className="py-3 px-4">Nhóm Linh Kiện</th>
                    <th className="py-3 px-4">Thời Hạn Bảo Hành</th>
                    <th className="py-3 px-4">Chính Sách 1 Đổi 1</th>
                    <th className="py-3 px-4">Điều Kiện Áp Dụng</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300 font-medium">
                  <tr>
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">CPU Vi Xử Lý (Intel / AMD)</td>
                    <td className="py-3.5 px-4 text-[#0284c7] font-black">36 Tháng</td>
                    <td className="py-3.5 px-4 text-emerald-600 font-bold">30 Ngày Đầu</td>
                    <td className="py-3.5 px-4 text-slate-500">Còn nguyên vẹn chân tiếp xúc, không cong vênh chân socket</td>
                  </tr>
                  <tr>
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">Card Màn Hình VGA</td>
                    <td className="py-3.5 px-4 text-[#0284c7] font-black">36 Tháng</td>
                    <td className="py-3.5 px-4 text-emerald-600 font-bold">30 Ngày Đầu</td>
                    <td className="py-3.5 px-4 text-slate-500">Còn nguyên tem void ốc, không rỉ sét hoặc cháy nổ do nguồn</td>
                  </tr>
                  <tr>
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">Bo Mạch Chủ Mainboard</td>
                    <td className="py-3.5 px-4 text-[#0284c7] font-black">36 Tháng</td>
                    <td className="py-3.5 px-4 text-emerald-600 font-bold">30 Ngày Đầu</td>
                    <td className="py-3.5 px-4 text-slate-500">Không cong chân socket, không đứt mạch PCB</td>
                  </tr>
                  <tr>
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">Bộ Nhớ RAM DDR4 / DDR5</td>
                    <td className="py-3.5 px-4 text-[#0284c7] font-black">36 Tháng</td>
                    <td className="py-3.5 px-4 text-emerald-600 font-bold">30 Ngày Đầu</td>
                    <td className="py-3.5 px-4 text-slate-500">Tem serial còn rõ ràng, chân cắm vàng không xước đứt</td>
                  </tr>
                  <tr>
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">Ổ Cứng SSD NVMe / SATA</td>
                    <td className="py-3.5 px-4 text-[#0284c7] font-black">36 - 60 Tháng</td>
                    <td className="py-3.5 px-4 text-emerald-600 font-bold">30 Ngày Đầu</td>
                    <td className="py-3.5 px-4 text-slate-500">Dưới giới hạn TBW ghi theo chuẩn nhà sản xuất</td>
                  </tr>
                  <tr>
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">Nguồn Máy Tính PSU</td>
                    <td className="py-3.5 px-4 text-[#0284c7] font-black">36 - 60 Tháng</td>
                    <td className="py-3.5 px-4 text-emerald-600 font-bold">30 Ngày Đầu</td>
                    <td className="py-3.5 px-4 text-slate-500">Đầy đủ dây cáp module, không côn trùng chui vào</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* CTA LINK TO WARRANTY LOOKUP */}
          <div className="bg-gradient-to-r from-sky-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 border border-sky-200 dark:border-slate-700 rounded-3xl p-8 text-center space-y-4 shadow-sm">
            <h3 className="text-xl font-black font-heading text-slate-900 dark:text-white uppercase">
              BẠN MUỐN KIỂM TRA THỜI HẠN BẢO HÀNH SẢN PHẨM?
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-xl mx-auto">
              Tra cứu nhanh qua Số Điện Thoại mua hàng hoặc Mã Serial trên tem linh kiện để nhận thông tin tức thì.
            </p>
            <div className="pt-2">
              <Link
                href="/warranty"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-black font-heading uppercase tracking-wider shadow-lg shadow-sky-500/25 transition-all"
              >
                <span>Đến Cổng Tra Cứu Bảo Hành Điện Tử DRX</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </CartProvider>
  );
}