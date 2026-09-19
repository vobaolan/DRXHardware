'use client';

import React from 'react';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { 
  Truck, ShieldCheck, Clock, MapPin, PackageCheck, 
  AlertCircle, CheckCircle2, Box, ArrowRight, ShieldAlert, PhoneCall
} from 'lucide-react';

export default function ShippingPolicyPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 flex flex-col antialiased transition-colors duration-300">
      <Header />

      {/* HERO BANNER */}
      <section className="relative overflow-hidden bg-white dark:bg-slate-900 py-12 sm:py-16 border-b border-slate-200 dark:border-slate-800">
        <div className="absolute inset-0 bg-gradient-to-r from-sky-50 via-white to-blue-50/50 dark:from-slate-900 dark:via-[#071930] dark:to-slate-950 pointer-events-none" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-sky-50 dark:bg-sky-500/10 border border-sky-200 dark:border-sky-500/20 px-3.5 py-1 text-xs font-black text-[#0284c7] dark:text-sky-300 uppercase tracking-widest mx-auto shadow-2xs">
            <Truck className="h-4 w-4" />
            <span>VẬN CHUYỂN AN TOÀN & ĐỒNG KIỂM TOÀN QUỐC</span>
          </div>

          <h1
            className="font-heading text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black uppercase text-slate-900 dark:text-white"
            style={{ lineHeight: '1.25' }}
          >
            CHÍNH SÁCH GIAO HÀNG & ĐỒNG KIỂM
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-normal max-w-2xl mx-auto leading-relaxed">
            DRX Hardware hợp tác với các đơn vị vận chuyển hàng đầu, cam kết đóng gói chuẩn an toàn linh kiện công nghệ cao và bảo hiểm 100% đơn hàng.
          </p>
        </div>
      </section>

      {/* BREADCRUMB */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 py-3">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center gap-2 text-xs text-slate-500">
          <Link href="/" className="hover:text-[#0284c7] transition-colors">Trang Chủ</Link>
          <span>/</span>
          <span className="text-slate-900 dark:text-white font-bold">Chính Sách Giao Hàng</span>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-12 space-y-14">
        
        {/* 3 SHIPPING MODES */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm hover:border-[#0284c7] transition-all">
            <div className="w-12 h-12 rounded-2xl bg-sky-50 dark:bg-slate-800 text-[#0284c7] flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-bold text-[#0284c7] uppercase tracking-wider bg-sky-50 dark:bg-sky-500/10 px-2.5 py-1 rounded-full">
              Hỏa Tốc Nội Thành
            </span>
            <h3 className="font-heading text-lg font-black text-slate-900 dark:text-white uppercase">
              Giao Nhanh Trong 2 Giờ
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Áp dụng cho các khu vực nội thành TP. Hồ Chí Minh. Kỹ thuật viên giao máy tận nơi, hỗ trợ lắp đặt, cắm dây và test máy trực tiếp cho khách hàng.
            </p>
            <div className="text-[11px] font-medium text-slate-500 border-t border-slate-100 dark:border-slate-800 pt-3">
              ⚡ Miễn phí giao hỏa tốc cho đơn PC từ 15 triệu
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm hover:border-emerald-500 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-slate-800 text-emerald-600 flex items-center justify-center">
              <Truck className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-1 rounded-full">
              Chuyển Phát Nhanh Toàn Quốc
            </span>
            <h3 className="font-heading text-lg font-black text-slate-900 dark:text-white uppercase">
              Giao Hàng 1 - 3 Ngày
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Vận chuyển qua các đối tác lớn: Viettel Post, GHTK, EMS. Đầy đủ mã theo dõi bưu phẩm trực tiếp theo thời gian thực (realtime tracking).
            </p>
            <div className="text-[11px] font-medium text-slate-500 border-t border-slate-100 dark:border-slate-800 pt-3">
              📦 Hỗ trợ giao tận xã, huyện trên toàn quốc
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm hover:border-amber-500 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-slate-800 text-amber-600 flex items-center justify-center">
              <PackageCheck className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider bg-amber-50 dark:bg-amber-500/10 px-2.5 py-1 rounded-full">
              Quyền Lợi Khách Hàng
            </span>
            <h3 className="font-heading text-lg font-black text-slate-900 dark:text-white uppercase">
              Đồng Kiểm Trước Khi Nhận
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Khách hàng được quyền mở hộp kiểm tra đúng mẫu mã linh kiện, tem bảo hành nguyên vẹn trước khi ký nhận và thanh toán tiền cho nhân viên giao hàng.
            </p>
            <div className="text-[11px] font-medium text-slate-500 border-t border-slate-100 dark:border-slate-800 pt-3">
              🛡️ An tâm tuyệt đối 100% không rủi ro
            </div>
          </div>
        </div>

        {/* PACKAGING SAFETY DETAILS */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
            <Box className="w-6 h-6 text-[#0284c7]" />
            <div>
              <h2 className="font-heading text-base sm:text-lg font-black uppercase text-slate-900 dark:text-white">
                QUY CHUẨN ĐÓNG GÓI CHUYÊN DỤNG CHO LINH KIỆN MÁY TÍNH
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Linh kiện điện tử rất nhạy cảm với va đập, DRX áp dụng tiêu chuẩn đóng thùng 4 lớp nghiêm ngặt
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
              <span className="font-black text-[#0284c7] uppercase text-[11px] block">Lớp 1: Túi Tĩnh Điện & Hộp Hãng</span>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Giữ nguyên hộp gốc (Fullbox) cùng túi chống tĩnh điện ESD nguyên seal của nhà sản xuất.
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
              <span className="font-black text-[#0284c7] uppercase text-[11px] block">Lớp 2: Màng Xốp Khí Chống Sốc</span>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Quấn từ 3 đến 5 lớp bóng khí chống va đập dày dặn, triệt tiêu hoàn toàn lực tác động ngoại lực.
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
              <span className="font-black text-[#0284c7] uppercase text-[11px] block">Lớp 3: Thùng Carton 5 Lớp</span>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Đóng trong thùng carton 5 lớp cứng cáp chuyên dụng có chèn xốp định hình bảo vệ các góc máy.
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
              <span className="font-black text-[#0284c7] uppercase text-[11px] block">Lớp 4: Tem Niêm Phong DRX</span>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Dán băng keo cảnh báo hàng dễ vỡ và tem niêm phong độc quyền chống tráo đổi hàng hóa.
              </p>
            </div>
          </div>
        </div>

        {/* POLICY GUARANTEE */}
        <div className="bg-gradient-to-r from-sky-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 border border-sky-200 dark:border-slate-700 rounded-3xl p-8 text-center space-y-4 shadow-sm">
          <h3 className="text-xl font-black font-heading text-slate-900 dark:text-white uppercase">
            CAM KẾT ĐỔI MỚI NGAY LẬP TỨC NẾU CÓ SỰ CỐ VẬN CHUYỂN
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Nếu trong quá trình giao hàng linh kiện bị cấn móp vỏ hộp, gãy quạt, xước xát hoặc hỏng hóc, quý khách chỉ cần từ chối nhận hàng hoặc chụp ảnh gửi hotline. DRX Hardware cam kết gửi sản phẩm mới thay thế ngay trong 24h.
          </p>
          <div className="pt-2 flex items-center justify-center gap-4">
            <a
              href="tel:01699224729"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-black font-heading uppercase tracking-wider shadow-lg shadow-sky-500/25 transition-all"
            >
              <PhoneCall className="w-4 h-4" />
              <span>Hotline Tiếp Nhận Sự Cố: 01699.224.729</span>
            </a>
          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
}
