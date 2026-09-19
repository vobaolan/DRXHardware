'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { 
  CreditCard, Truck, ShieldCheck, ShoppingCart, 
  HelpCircle, ArrowRight, CheckCircle2, QrCode, 
  Building2, Percent, Check, Laptop, Sparkles
} from 'lucide-react';

export default function GuidePolicyPage() {
  const [activeTab, setActiveTab] = useState<'order' | 'payment' | 'verification'>('order');

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 flex flex-col antialiased transition-colors duration-300">
      <Header />

      {/* HERO BANNER */}
      <section className="relative overflow-hidden bg-white dark:bg-slate-900 py-12 sm:py-16 border-b border-slate-200 dark:border-slate-800">
        <div className="absolute inset-0 bg-gradient-to-r from-sky-50 via-white to-blue-50/50 dark:from-slate-900 dark:via-[#071930] dark:to-slate-950 pointer-events-none" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-sky-50 dark:bg-sky-500/10 border border-sky-200 dark:border-sky-500/20 px-3.5 py-1 text-xs font-black text-[#0284c7] dark:text-sky-300 uppercase tracking-widest mx-auto shadow-2xs">
            <CreditCard className="h-4 w-4" />
            <span>HƯỚNG DẪN MUA SẮM & DỊCH VỤ DRX HARDWARE</span>
          </div>

          <h1
            className="font-heading text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black uppercase text-slate-900 dark:text-white"
            style={{ lineHeight: '1.25' }}
          >
            HƯỚNG DẪN MUA HÀNG & THANH TOÁN
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-normal max-w-2xl mx-auto leading-relaxed">
            Các bước đơn giản để chọn linh kiện, tự ráp PC với công cụ DRX PC Builder và thanh toán an toàn qua VietQR Techcombank hoặc COD.
          </p>
        </div>
      </section>

      {/* BREADCRUMB */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 py-3">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center gap-2 text-xs text-slate-500">
          <Link href="/" className="hover:text-[#0284c7] transition-colors">Trang Chủ</Link>
          <span>/</span>
          <span className="text-slate-900 dark:text-white font-bold">Hướng Dẫn Mua Hàng & Thanh Toán</span>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-12 space-y-14">
        
        {/* TAB BUTTONS */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => setActiveTab('order')}
            className={`px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'order'
                ? 'bg-[#0284c7] text-white shadow-md shadow-sky-500/25'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
            <span>1. Quy Trình Mua Hàng</span>
          </button>

          <button
            onClick={() => setActiveTab('payment')}
            className={`px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'payment'
                ? 'bg-[#0284c7] text-white shadow-md shadow-sky-500/25'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <QrCode className="w-4 h-4" />
            <span>2. Phương Thức Thanh Toán</span>
          </button>

          <button
            onClick={() => setActiveTab('verification')}
            className={`px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'verification'
                ? 'bg-[#0284c7] text-white shadow-md shadow-sky-500/25'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>3. Quy Trình Kiểm Tra & Giao Nhận 5 Bước</span>
          </button>
        </div>

        {/* TAB 1: MUA HÀNG (4 BƯỚC) */}
        {activeTab === 'order' && (
          <div className="space-y-8 animate-fadeIn">
            <div className="text-center space-y-2 max-w-xl mx-auto">
              <h2 className="font-heading text-xl sm:text-2xl font-black uppercase text-slate-900 dark:text-white">
                QUY TRÌNH ĐẶT MUA LINH KIỆN & PC (4 BƯỚC)
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                Đặt hàng dễ dàng trên DRX Hardware và nhận hàng tận nơi hoặc nhận tại Showroom
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  step: '01',
                  title: 'Chọn Linh Kiện / Build PC',
                  desc: 'Tìm kiếm CPU, VGA, RAM hoặc sử dụng công cụ DRX PC Builder để thiết lập cấu hình tối ưu hiệu năng và giá cả.',
                  badge: 'Đa Dạng Sản Phẩm'
                },
                {
                  step: '02',
                  title: 'Thêm Vào Giỏ Hàng',
                  desc: 'Kiểm tra kỹ thông số kỹ thuật, số lượng và áp dụng các mã voucher DRX (DRX10, WELCOMEPC, GAMING50K).',
                  badge: 'Mã Giảm Giá'
                },
                {
                  step: '03',
                  title: 'Điền Thông Tin Giao Hàng',
                  desc: 'Nhập chính xác họ tên, số điện thoại và địa chỉ nhận hàng hoặc chọn nhận tại Showroom DRX Hardware.',
                  badge: 'Bảo Mật Tuyệt Đối'
                },
                {
                  step: '04',
                  title: 'Thanh Toán & Nhận Hàng',
                  desc: 'Chọn thanh toán quét mã QR Techcombank hoặc thanh toán COD khi nhận hàng. Đóng gói 3 lớp xốp an toàn tuyệt đối.',
                  badge: 'Giao Toàn Quốc'
                }
              ].map((item, idx) => (
                <div 
                  key={idx} 
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-4 shadow-sm hover:border-[#0284c7] transition-all relative overflow-hidden"
                >
                  <span className="text-4xl font-black font-heading text-sky-100 dark:text-slate-800/80 absolute right-4 top-3 pointer-events-none">
                    {item.step}
                  </span>
                  <div className="inline-block text-[10px] font-bold text-[#0284c7] bg-sky-50 dark:bg-sky-500/10 px-2.5 py-1 rounded-full uppercase">
                    {item.badge}
                  </div>
                  <h3 className="font-heading text-base font-black text-slate-900 dark:text-white">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: PHƯƠNG THỨC THANH TOÁN */}
        {activeTab === 'payment' && (
          <div className="space-y-8 animate-fadeIn">
            <div className="text-center space-y-2 max-w-xl mx-auto">
              <h2 className="font-heading text-xl sm:text-2xl font-black uppercase text-slate-900 dark:text-white">
                CÁC PHƯƠNG THỨC THANH TOÁN AN TOÀN
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                DRX Hardware áp dụng hệ thống bảo mật SSL và thanh toán đối soát trực tiếp 24/7
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-4 shadow-sm">
                <div className="w-12 h-12 rounded-2xl bg-sky-50 dark:bg-slate-800 flex items-center justify-center text-[#0284c7]">
                  <QrCode className="w-6 h-6" />
                </div>
                <h3 className="font-heading text-base font-black text-slate-900 dark:text-white uppercase">
                  Quét Mã VietQR Techcombank
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Quét mã QR tự động điền STK: <strong>BAOLANN</strong>, Tên: <strong>DRX Hardware</strong>, số tiền và mã đơn hàng chính xác.
                </p>
                <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-3 space-y-1">
                  <div>✓ Miễn phí 100% phí chuyển khoản</div>
                  <div>✓ Hỗ trợ tất cả ứng dụng ngân hàng & ví điện tử</div>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-4 shadow-sm">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-slate-800 flex items-center justify-center text-emerald-600">
                  <Truck className="w-6 h-6" />
                </div>
                <h3 className="font-heading text-base font-black text-slate-900 dark:text-white uppercase">
                  Thanh Toán Khi Nhận Hàng (COD)
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Khách hàng kiểm tra hàng đúng mã linh kiện, nguyên vẹn tem niêm phong trước khi thanh toán tiền mặt cho bưu tá giao hàng.
                </p>
                <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-3 space-y-1">
                  <div>✓ Đồng kiểm thoải mái trước khi nhận</div>
                  <div>✓ Áp dụng đơn hàng toàn quốc</div>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-4 shadow-sm">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-slate-800 flex items-center justify-center text-amber-600">
                  <Building2 className="w-6 h-6" />
                </div>
                <h3 className="font-heading text-base font-black text-slate-900 dark:text-white uppercase">
                  Nhận Tại Showroom DRX Hardware
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Đến nhận máy trực tiếp tại Showroom DRX, được kỹ thuật viên hỗ trợ test máy, cài đặt phần mềm và bàn giao tận tay.
                </p>
                <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-3 space-y-1">
                  <div>✓ Nhận ngay sau khi lắp ráp xong</div>
                  <div>✓ Miễn phí hoàn toàn phí vận chuyển</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: QUY TRÌNH KIỂM TRA & GIAO NHẬN 5 BƯỚC */}
        {activeTab === 'verification' && (
          <div className="space-y-8 animate-fadeIn">
            <div className="text-center space-y-2 max-w-xl mx-auto">
              <h2 className="font-heading text-xl sm:text-2xl font-black uppercase text-slate-900 dark:text-white">
                QUY TRÌNH KIỂM TRA & XÁC THỰC ĐƠN HÀNG 5 BƯỚC
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                Mọi đơn hàng tại DRX Hardware đều được kiểm tra qua 5 bước nghiêm ngặt trước khi đến tay quý khách
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Bước 1-3 */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-5 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-sky-50 dark:bg-slate-800 text-[#0284c7] rounded-2xl">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-[#0284c7] uppercase tracking-wider block">Giai đoạn 1</span>
                    <h3 className="font-heading text-base font-black text-slate-900 dark:text-white">
                      Xác Nhận & Lắp Ráp Kỹ Thuật
                    </h3>
                  </div>
                </div>

                <ul className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span><strong>1. Gọi điện xác nhận đơn hàng:</strong> Nhân viên CSKH gọi điện kiểm tra chính xác họ tên, số điện thoại, địa chỉ và linh kiện đặt mua.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span><strong>2. Gán Serial & Test Full-load:</strong> Xuất kho linh kiện chính hãng, gán mã Serial Number điện tử và test nhiệt độ, hiệu năng 100%.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span><strong>3. Đóng gói 3 lớp xốp:</strong> Bọc xốp chống va đập, dán tem niêm phong bảo hành DRX Hardware và chụp ảnh kiện hàng trước khi xuất kho.</span>
                  </li>
                </ul>
              </div>

              {/* Bước 4-5 */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-5 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-emerald-50 dark:bg-slate-800 text-emerald-600 rounded-2xl">
                    <Truck className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider block">Giai đoạn 2</span>
                    <h3 className="font-heading text-base font-black text-slate-900 dark:text-white">
                      Bàn Giao & Hoàn Tất Thanh Toán
                    </h3>
                  </div>
                </div>

                <ul className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span><strong>4. Bàn giao vận chuyển / Quầy Showroom:</strong> Kiện hàng được bàn giao đơn vị vận chuyển tiêu chuẩn hoặc sẵn sàng tại quầy Showroom.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span><strong>5. Đối soát thanh toán & Kích hoạt bảo hành:</strong> Đối soát chuyển khoản VietQR Techcombank hoặc thu COD thành công, tự động kích hoạt bảo hành điện tử E-Warranty.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* CTA CONTACT SUPPORT */}
        <div className="bg-gradient-to-r from-sky-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 border border-sky-200 dark:border-slate-700 rounded-3xl p-8 text-center space-y-4 shadow-sm">
          <h3 className="text-xl font-black font-heading text-slate-900 dark:text-white uppercase">
            CẦN TƯ VẤN CẤU HÌNH PC HOẶC HỖ TRỢ ĐẶT HÀNG?
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-xl mx-auto leading-relaxed">
            Đội ngũ chuyên viên kỹ thuật DRX Hardware sẵn sàng hỗ trợ bạn lựa chọn linh kiện tương thích tối ưu và mức giá tốt nhất.
          </p>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/pc-builder"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-black font-heading uppercase tracking-wider shadow-lg shadow-sky-500/25 transition-all"
            >
              <Laptop className="h-4 w-4" />
              <span>Thử Công Cụ DRX Build PC Ngay</span>
            </Link>
            <a
              href="tel:01699224729"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:text-[#0284c7] text-xs font-black font-heading uppercase tracking-wider transition-all"
            >
              <span>Hotline Kỹ Thuật: 01699.224.729</span>
            </a>
          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
}
