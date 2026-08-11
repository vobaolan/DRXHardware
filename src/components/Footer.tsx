'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ChevronRight, ShieldCheck, MapPin, Phone, Mail, Clock, 
  Send, Cpu, Wrench, CreditCard, Sparkles, CheckCircle2
} from 'lucide-react';
import { motion } from 'framer-motion';

const FacebookIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const YoutubeIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"/>
    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/>
  </svg>
);

export const Footer: React.FC = () => {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;
    setIsSubscribed(true);
    setNewsletterEmail('');
    setTimeout(() => setIsSubscribed(false), 4000);
  };

  return (
    <footer className="border-t border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-400 text-xs transition-colors duration-300">
      {/* TOP NEWSLETTER & PARTNERS BANNER */}
      <div className="border-b border-slate-200 dark:border-slate-800/80 bg-slate-100/70 dark:bg-slate-900/50 py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-6 space-y-1">
              <div className="flex items-center gap-2 text-cyan-600 dark:text-cyan-400 font-heading font-extrabold text-xs uppercase tracking-widest">
                <Sparkles className="h-4 w-4" />
                <span>NHẬN ƯU ĐÃI LINH KIỆN MỚI NHẤT</span>
              </div>
              <h3 className="font-heading text-xl font-extrabold text-slate-900 dark:text-slate-100">
                Đăng ký nhận mã giảm giá & cập nhật xu hướng PC Gaming
              </h3>
            </div>

            <div className="lg:col-span-6">
              <form onSubmit={handleSubscribe} className="flex gap-2">
                <div className="relative flex-1">
                  <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    placeholder="Nhập địa chỉ email của bạn..."
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 py-2.5 pl-10 pr-4 text-xs font-semibold text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all shadow-sm"
                  />
                </div>
                <button
                  type="submit"
                  className="rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white px-5 py-2.5 font-heading font-extrabold text-xs uppercase transition-all shadow-md shadow-cyan-500/20 shrink-0 flex items-center gap-1.5"
                >
                  <span>ĐĂNG KÝ</span>
                  <Send className="h-3.5 w-3.5" />
                </button>
              </form>

              {isSubscribed && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Cảm ơn bạn! Đã đăng ký nhận bản tin thành công.</span>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* MAIN FOOTER COLUMNS */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* COLUMN 1: BRAND SHOWROOM INFO */}
          <div className="space-y-4 lg:col-span-2">
            <Link href="/" className="group inline-flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white font-black text-xs font-heading shadow-md shadow-cyan-500/20">
                ODS
              </div>
              <span className="font-heading font-black text-lg tracking-wider text-slate-900 dark:text-slate-100">
                HARDWARE STORE
              </span>
            </Link>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed font-light">
              Hệ thống showroom phân phối linh kiện máy tính, vi xử lý CPU, Card màn hình VGA và dàn PC Gaming lắp ráp chính hãng hàng đầu Việt Nam. Bảo hành 1-đổi-1 36 tháng.
            </p>

            <div className="space-y-2.5 pt-2 text-slate-700 dark:text-slate-300 font-medium">
              <div className="flex items-start gap-2.5">
                <MapPin className="h-4 w-4 text-cyan-600 dark:text-cyan-400 shrink-0 mt-0.5" />
                <span>Showroom HCM: 128 Nguyễn Trãi, Q.1, TP. Hồ Chí Minh</span>
              </div>
              <div className="flex items-start gap-2.5">
                <MapPin className="h-4 w-4 text-cyan-600 dark:text-cyan-400 shrink-0 mt-0.5" />
                <span>Showroom Hà Nội: 45 Thái Hà, Q. Đống Đa, Hà Nội</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span className="font-bold text-slate-900 dark:text-slate-100">Hotline: 1900.88.99.77</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 text-amber-500 shrink-0" />
                <span>Email: cskh@odsstore.vn</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Clock className="h-4 w-4 text-slate-400 shrink-0" />
                <span>Giờ làm việc: 08:00 - 21:30 (Cả T7, CN)</span>
              </div>
            </div>
          </div>

          {/* COLUMN 2: LINH KIỆN & BUILD PC */}
          <div className="space-y-4">
            <h3 className="font-heading text-xs font-bold uppercase tracking-widest text-slate-900 dark:text-slate-100 border-b border-slate-200 dark:border-slate-800 pb-2">
              Danh Mục Linh Kiện
            </h3>
            <ul className="space-y-2.5 font-medium">
              {[
                { label: 'CPU Vi Xử Lý', href: '/products?category=CPU' },
                { label: 'Card Màn Hình VGA', href: '/products?category=VGA' },
                { label: 'Bo Mạch Chủ Mainboard', href: '/products?category=MAINBOARD' },
                { label: 'Bộ Nhớ RAM DDR5', href: '/products?category=RAM' },
                { label: 'Ổ Cứng SSD NVMe', href: '/products?category=STORAGE' },
                { label: 'Công Cụ Build PC Tự Động', href: '/pc-builder' },
              ].map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors flex items-center gap-1.5 group">
                    <ChevronRight className="h-3 w-3 text-cyan-500 transition-transform group-hover:translate-x-0.5" />
                    <span>{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* COLUMN 3: HỖ TRỢ & BẢO HÀNH */}
          <div className="space-y-4">
            <h3 className="font-heading text-xs font-bold uppercase tracking-widest text-slate-900 dark:text-slate-100 border-b border-slate-200 dark:border-slate-800 pb-2">
              Dịch Vụ & Bảo Hành
            </h3>
            <ul className="space-y-2.5 font-medium">
              {[
                { label: 'Tra Cứu Bảo Hành E-Warranty', href: '/warranty' },
                { label: 'Chính Sách 1-Đổi-1 36 Tháng', href: '/policies/warranty' },
                { label: 'Hướng Dẫn Thanh Toán & Trả Góp', href: '/policies/guide' },
                { label: 'Chính Sách Giao Hàng Toàn Quốc', href: '/policies/privacy' },
                { label: 'Câu Hỏi Thường Gặp (FAQ)', href: '/policies/faq' },
                { label: 'Điều Khoản Dịch Vụ', href: '/policies/terms' },
              ].map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors flex items-center gap-1.5 group">
                    <ChevronRight className="h-3 w-3 text-cyan-500 transition-transform group-hover:translate-x-0.5" />
                    <span>{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* COLUMN 4: ĐỐI TÁC & PHƯƠNG THỨC THANH TOÁN */}
          <div className="space-y-4">
            <h3 className="font-heading text-xs font-bold uppercase tracking-widest text-slate-900 dark:text-slate-100 border-b border-slate-200 dark:border-slate-800 pb-2">
              Thanh Toán & Đối Tác
            </h3>
            
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Chấp nhận các hình thức thanh toán bảo mật 24/7:
            </p>

            <div className="grid grid-cols-3 gap-2">
              {[
                { name: 'VietQR', text: 'VIETQR' },
                { name: 'MoMo', text: 'MOMO' },
                { name: 'ZaloPay', text: 'ZALOPAY' },
                { name: 'Visa', text: 'VISA' },
                { name: 'Mastercard', text: 'MASTER' },
                { name: 'Trả góp', text: 'TRẢ GÓP' },
              ].map((pay) => (
                <div
                  key={pay.name}
                  className="h-9 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg flex items-center justify-center font-heading font-black text-[10px] text-slate-700 dark:text-slate-300 shadow-xs"
                >
                  {pay.text}
                </div>
              ))}
            </div>

            <div className="pt-2 space-y-2">
              <span className="font-bold text-slate-900 dark:text-slate-100 block text-[11px]">Kênh Mạng Xã Hội:</span>
              <div className="flex items-center gap-2">
                <a href="#" className="h-8 w-8 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-500 transition-all">
                  <FacebookIcon />
                </a>
                <a href="#" className="h-8 w-8 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:border-red-500 transition-all">
                  <YoutubeIcon />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM COPYRIGHT STRIP */}
        <div className="border-t border-slate-200 dark:border-slate-800/80 mt-12 pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-slate-500 dark:text-slate-400 text-[11px]">
          <div>
            © {new Date().getFullYear()} <strong className="text-slate-900 dark:text-slate-100 font-heading">ODS HARDWARE STORE</strong>. Tất cả quyền được bảo lưu.
          </div>

          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              <span>Chính Hãng Intel, NVIDIA & AMD Partner</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;


