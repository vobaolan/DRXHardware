'use client';

import React from 'react';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { 
  Scale, ShieldCheck, CheckCircle2, AlertCircle, 
  FileText, HelpCircle, PhoneCall
} from 'lucide-react';

export default function TermsPolicyPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 flex flex-col antialiased transition-colors duration-300">
      <Header />

      {/* HERO BANNER */}
      <section className="relative overflow-hidden bg-white dark:bg-slate-900 py-12 sm:py-16 border-b border-slate-200 dark:border-slate-800">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-50 via-white to-sky-50/50 dark:from-slate-900 dark:via-[#071930] dark:to-slate-950 pointer-events-none" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 px-3.5 py-1 text-xs font-black text-[#0284c7] dark:text-sky-300 uppercase tracking-widest mx-auto shadow-2xs">
            <Scale className="h-4 w-4" />
            <span>QUY ĐỊNH & THỎA THUẬN THƯƠNG MẠI</span>
          </div>

          <h1
            className="font-heading text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black uppercase text-slate-900 dark:text-white"
            style={{ lineHeight: '1.25' }}
          >
            ĐIỀU KHOẢN DỊCH VỤ DRX HARDWARE
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-normal max-w-2xl mx-auto leading-relaxed">
            Các quy định và cam kết pháp lý giữa khách hàng và DRX Hardware nhằm đảm bảo quyền lợi tốt nhất khi mua sắm linh kiện máy tính và dịch vụ PC Building.
          </p>
        </div>
      </section>

      {/* BREADCRUMB */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 py-3">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center gap-2 text-xs text-slate-500">
          <Link href="/" className="hover:text-[#0284c7] transition-colors">Trang Chủ</Link>
          <span>/</span>
          <span className="text-slate-900 dark:text-white font-bold">Điều Khoản Dịch Vụ</span>
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
                  TÀI KHOẢN VÀ THÔNG TIN KHÁCH HÀNG
                </h2>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Khi tạo tài khoản hoặc đặt mua hàng tại DRX Hardware, khách hàng có trách nhiệm cung cấp thông tin liên hệ chính xác (Họ tên, SĐT, Địa chỉ nhận hàng) để thuận tiện cho việc xác thực đơn hàng và kích hoạt mã bảo hành điện tử chính hãng (E-Warranty).
              </p>
            </section>

            {/* SECTION 2 */}
            <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm">
              <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                <span className="font-heading text-xl font-black text-[#0284c7]">02.</span>
                <h2 className="font-heading text-base sm:text-lg font-black uppercase text-slate-900 dark:text-white">
                  GIÁ CẢ, HÓA ĐƠN VÀ TỒN KHO LINH KIỆN
                </h2>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Tất cả giá niêm yết trên website đã bao gồm thuế Giá trị Gia tăng (VAT 10%). DRX Hardware hỗ trợ xuất hóa đơn điện tử đầy đủ theo mã số thuế doanh nghiệp hoặc cá nhân. Giá cả và khuyến mãi có thể được cập nhật theo biến động thị trường linh kiện quốc tế mà không cần báo trước.
              </p>
            </section>

            {/* SECTION 3 */}
            <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm">
              <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                <span className="font-heading text-xl font-black text-[#0284c7]">03.</span>
                <h2 className="font-heading text-base sm:text-lg font-black uppercase text-slate-900 dark:text-white">
                  CHÍNH SÁCH BẢO HÀNH & TRÁCH NHIỆM SẢN PHẨM
                </h2>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                DRX Hardware chỉ phân phối linh kiện phần cứng chính hãng có tem phân phối chính ngạch tại Việt Nam. Chúng tôi từ chối bảo hành đối với các trường hợp: linh kiện bị rơi vỡ, cháy nổ mạch điện do chập nguồn, rỉ sét do ngập nước hoặc tự ý tháo tem niêm phong ốc của nhà sản xuất.
              </p>
            </section>

            {/* SECTION 4 */}
            <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm">
              <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                <span className="font-heading text-xl font-black text-[#0284c7]">04.</span>
                <h2 className="font-heading text-base sm:text-lg font-black uppercase text-slate-900 dark:text-white">
                  HỦY ĐƠN HÀNG VÀ HOÀN TIỀN
                </h2>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Quý khách có thể yêu cầu hủy đơn hàng trước thời điểm đơn vị vận chuyển lấy hàng. Tiền thanh toán sẽ được hoàn trả lại qua đúng phương thức thanh toán ban đầu của quý khách trong vòng 1-3 ngày làm việc.
              </p>
            </section>
          </div>

          {/* SIDEBAR */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-sky-50 dark:bg-slate-800 text-[#0284c7] rounded-2xl">
                  <FileText className="w-5 h-5" />
                </div>
                <h3 className="font-heading text-sm font-black uppercase text-slate-900 dark:text-white">
                  Cam Kết Cốt Lõi
                </h3>
              </div>

              <div className="space-y-2.5 text-xs text-slate-600 dark:text-slate-400">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>100% Linh kiện mới, đầy đủ VAT & tem hãng.</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Chính sách đổi mới 30 ngày minh bạch.</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Bảo mật dữ liệu cá nhân theo pháp luật VN.</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Đồng kiểm thoải mái khi nhận hàng.</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-3">
              <h4 className="font-heading text-xs font-black uppercase text-slate-900 dark:text-white">
                Tổng Đài Giải Quyết Khiếu Nại
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Mọi thắc mắc và yêu cầu xử lý khiếu nại chất lượng dịch vụ:
              </p>
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Hotline: <span className="text-[#0284c7]">01699.224.729</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
