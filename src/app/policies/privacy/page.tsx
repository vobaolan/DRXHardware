'use client';

import React from 'react';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { 
  ShieldCheck, Lock, CheckCircle2, Eye, Server, 
  HelpCircle, ShieldAlert, Key, Database, UserCheck
} from 'lucide-react';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 flex flex-col antialiased transition-colors duration-300">
      <Header />

      {/* HERO BANNER */}
      <section className="relative overflow-hidden bg-white dark:bg-slate-900 py-12 sm:py-16 border-b border-slate-200 dark:border-slate-800">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-50 via-white to-sky-50/50 dark:from-slate-900 dark:via-[#072418] dark:to-slate-950 pointer-events-none" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 px-3.5 py-1 text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mx-auto shadow-2xs">
            <Lock className="h-4 w-4" />
            <span>BẢO MẬT DỮ LIỆU TỐI ĐA CHUẨN SSL 256-BIT</span>
          </div>

          <h1
            className="font-heading text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black uppercase text-slate-900 dark:text-white"
            style={{ lineHeight: '1.25' }}
          >
            CHÍNH SÁCH BẢO MẬT THÔNG TIN
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-normal max-w-2xl mx-auto leading-relaxed">
            DRX Hardware cam kết bảo vệ tuyệt đối thông tin cá nhân và dữ liệu thanh toán của khách hàng theo các tiêu chuẩn an toàn bảo mật cao nhất.
          </p>
        </div>
      </section>

      {/* BREADCRUMB */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 py-3">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center gap-2 text-xs text-slate-500">
          <Link href="/" className="hover:text-[#0284c7] transition-colors">Trang Chủ</Link>
          <span>/</span>
          <span className="text-slate-900 dark:text-white font-bold">Chính Sách Bảo Mật</span>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
          <div className="lg:col-span-2 space-y-8">
            {/* SECTION 1 */}
            <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm">
              <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                <span className="font-heading text-xl font-black text-[#0284c7]">01.</span>
                <h2 className="font-heading text-base sm:text-lg font-black uppercase text-slate-900 dark:text-white">
                  MỤC ĐÍCH THU THẬP THÔNG TIN CÁ NHÂN
                </h2>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                DRX Hardware thu thập thông tin của quý khách khi đăng ký tài khoản, đặt mua linh kiện hoặc liên hệ hỗ trợ kỹ thuật bảo hành. Thông tin thu thập bao gồm:
              </p>
              <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Họ và tên, số điện thoại liên hệ, email để gửi hóa đơn điện tử và mã tra cứu bảo hành SN.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Địa chỉ nhận hàng chính xác phục vụ việc giao hàng hỏa tốc hoặc chuyển phát nhanh.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Lịch sử đơn hàng và linh kiện PC để phục vụ kích hoạt bảo hành điện tử 1 đổi 1 trong 36 tháng.</span>
                </li>
              </ul>
            </section>

            {/* SECTION 2 */}
            <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm">
              <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                <span className="font-heading text-xl font-black text-[#0284c7]">02.</span>
                <h2 className="font-heading text-base sm:text-lg font-black uppercase text-slate-900 dark:text-white">
                  CAM KẾT AN TOÀN THANH TOÁN
                </h2>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Mọi giao dịch thanh toán chuyển khoản QR, thẻ tín dụng Visa/Mastercard hoặc ví điện tử trên website đều được chuyển tiếp qua cổng thanh toán bảo mật đối tác có chứng nhận quốc tế PCI-DSS Level 1.
              </p>
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
                <strong className="text-slate-900 dark:text-white font-bold block mb-1">Lưu ý quan trọng:</strong>
                DRX Hardware <strong>KHÔNG</strong> bao giờ lưu trữ số thẻ tín dụng, mã CVV/CVC của khách hàng trên hệ thống máy chủ.
              </div>
            </section>

            {/* SECTION 3 */}
            <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm">
              <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                <span className="font-heading text-xl font-black text-[#0284c7]">03.</span>
                <h2 className="font-heading text-base sm:text-lg font-black uppercase text-slate-900 dark:text-white">
                  KHÔNG CHIA SẺ THÔNG TIN CHO BÊN THỨ BA
                </h2>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                DRX Hardware cam kết không bán, không cho thuê, không chia sẻ thông tin cá nhân của quý khách cho bất kỳ bên thứ ba nào vì mục đích quảng cáo thương mại ngoài phạm vi dịch vụ giao vận đơn hàng.
              </p>
            </section>
          </div>

          {/* SIDEBAR SUMMARY */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-50 dark:bg-slate-800 text-emerald-600 rounded-2xl">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="font-heading text-sm font-black uppercase text-slate-900 dark:text-white">
                  3 Trụ Cột Bảo Mật
                </h3>
              </div>

              <div className="space-y-3 text-xs text-slate-600 dark:text-slate-400">
                <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800">
                  <span className="font-bold text-slate-900 dark:text-white block mb-1">Mã Hóa 256-bit SSL</span>
                  Dữ liệu truyền tải giữa trình duyệt và máy chủ luôn được mã hóa end-to-end.
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800">
                  <span className="font-bold text-slate-900 dark:text-white block mb-1">Quyền Kiểm Soát Dữ Liệu</span>
                  Quý khách có thể yêu cầu xóa hoặc cập nhật thông tin cá nhân bất cứ lúc nào.
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800">
                  <span className="font-bold text-slate-900 dark:text-white block mb-1">Bảo Hành Minh Bạch</span>
                  Mã serial linh kiện lưu trữ điện tử trọn đời, dễ dàng tra cứu 24/7.
                </div>
              </div>
            </div>

            <div className="bg-sky-50 dark:bg-slate-900 border border-sky-200 dark:border-slate-800 rounded-3xl p-6 space-y-3">
              <h4 className="font-heading text-xs font-black uppercase text-[#0284c7]">
                Hỗ Trợ Quyền Riêng Tư
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Mọi thắc mắc về dữ liệu cá nhân, vui lòng liên hệ bộ phận an toàn thông tin DRX:
              </p>
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Email: <span className="text-[#0284c7]">privacy@drxhardware.vn</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
