'use client';

import React from 'react';
import Link from 'next/link';
import { 
  ChevronRight, ShieldCheck, MapPin, Phone, Mail, Clock
} from 'lucide-react';

const FacebookIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" {...props}>
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

const YoutubeIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" {...props}>
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

const TiktokIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" {...props}>
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-1.01v8.44c0 1.95-.53 3.93-1.69 5.48-1.57 2.11-4.14 3.32-6.77 3.19-2.61-.13-5.02-1.58-6.38-3.79-1.37-2.22-1.48-5.07-.3-7.39 1.18-2.31 3.54-3.87 6.13-4.04.53-.03 1.07.01 1.59.13v4.11c-.48-.15-.99-.2-1.49-.16-1.12.08-2.18.73-2.73 1.7-.56.98-.53 2.24.07 3.2.6 1 1.69 1.6 2.82 1.55 1.11-.05 2.11-.77 2.53-1.8.18-.44.25-.92.25-1.4V.02h-.75z"/>
  </svg>
);

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-400 text-xs transition-colors duration-300">

      {/* MAIN FOOTER COLUMNS */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* COLUMN 1: BRAND SHOWROOM INFO */}
          <div className="space-y-4 lg:col-span-2">
            <Link href="/" className="group inline-flex items-center gap-2" title="Trang chủ DRX HARDWARE">
              <img 
                src="/logo/logo-footer.png" 
                alt="DRX HARDWARE Logo" 
                className="h-9 w-auto object-contain dark:brightness-0 dark:invert group-hover:scale-105 transition-transform" 
              />
            </Link>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed font-light">
              Hệ thống showroom phân phối linh kiện máy tính, vi xử lý CPU, Card màn hình VGA và dàn PC Gaming lắp ráp chính hãng hàng đầu Việt Nam. Bảo hành 1-đổi-1 36 tháng.
            </p>

            <div className="space-y-2.5 pt-2 text-slate-700 dark:text-slate-300 font-medium">
              <div className="flex items-start gap-2.5">
                <MapPin className="h-4 w-4 text-cyan-600 dark:text-cyan-400 shrink-0 mt-0.5" />
                <span>Showroom: 128 Nguyễn Trãi, Q.1, TP. Hồ Chí Minh</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span className="font-bold text-slate-900 dark:text-slate-100">Hotline: 1900.88.99.77</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 text-amber-500 shrink-0" />
                <span>Email: cskh@drxhardware.vn</span>
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
                { label: 'Công Cụ DRX Build PC', href: '/pc-builder' },
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
                { label: 'Hướng Dẫn Mua Hàng & Thanh Toán', href: '/policies/guide' },
                { label: 'Chính Sách Giao Hàng Toàn Quốc', href: '/policies/shipping' },
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

            {/* 3 PAYMENT PARTNERS (VIETQR, NAPAS 24/7, TECHCOMBANK) */}
            <div className="flex flex-col gap-2.5">
              
              {/* 1. VietQR */}
              <div className="h-11 px-3.5 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl flex items-center justify-between shadow-2xs hover:border-sky-400/60 dark:hover:border-slate-700 transition-all group">
                <div className="flex items-center gap-2">
                  <img 
                    src="/logos/payments/vietqr.png" 
                    alt="VietQR Logo" 
                    className="h-6 w-auto object-contain transition-transform group-hover:scale-105" 
                  />
                </div>
                <span className="text-[9.5px] font-black text-[#0284c7] dark:text-sky-300 bg-sky-50 dark:bg-sky-950/70 px-2 py-0.5 rounded-md border border-sky-200/60 dark:border-sky-800/80 uppercase">
                  Quét QR 24/7
                </span>
              </div>

              {/* 2. NAPAS 24/7 */}
              <div className="h-11 px-3.5 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl flex items-center justify-between shadow-2xs hover:border-sky-400/60 dark:hover:border-slate-700 transition-all group">
                <div className="flex items-center gap-2">
                  <img 
                    src="/logos/payments/napas.png" 
                    alt="NAPAS 24/7 Logo" 
                    className="h-5 w-auto object-contain transition-transform group-hover:scale-105" 
                  />
                </div>
                <span className="text-[9.5px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/70 px-2 py-0.5 rounded-md border border-emerald-200/60 dark:border-emerald-800/80 uppercase">
                  Chuyển Nhanh
                </span>
              </div>

              {/* 3. Techcombank */}
              <div className="h-11 px-3.5 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl flex items-center justify-between shadow-2xs hover:border-sky-400/60 dark:hover:border-slate-700 transition-all group">
                <div className="flex items-center gap-2">
                  <img 
                    src="/logos/payments/techcombank.png" 
                    alt="Techcombank Logo" 
                    className="h-4.5 w-auto object-contain transition-transform group-hover:scale-105" 
                  />
                </div>
                <span className="text-[9.5px] font-black text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/70 px-2 py-0.5 rounded-md border border-rose-200/60 dark:border-rose-800/80 font-mono">
                  TCB
                </span>
              </div>

            </div>

            {/* SOCIAL CHANNELS */}
            <div className="pt-2 space-y-2">
              <span className="font-bold text-slate-900 dark:text-slate-100 block text-[11px]">Kênh Mạng Xã Hội:</span>
              <div className="flex items-center gap-2">
                <a 
                  href="https://www.facebook.com/DRXGlobal/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="h-8 w-8 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-all shadow-2xs"
                  title="Facebook DRX Global"
                >
                  <FacebookIcon />
                </a>
                <a 
                  href="https://youtube.com/drxglobal" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="h-8 w-8 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:border-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-all shadow-2xs"
                  title="YouTube DRX Global"
                >
                  <YoutubeIcon />
                </a>
                <a 
                  href="https://www.tiktok.com/@drxglobal" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="h-8 w-8 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:text-black dark:hover:text-white hover:border-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-all shadow-2xs"
                  title="TikTok @drxglobal"
                >
                  <TiktokIcon />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM COPYRIGHT STRIP */}
        <div className="border-t border-slate-200 dark:border-slate-800/80 mt-12 pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-slate-500 dark:text-slate-400 text-[11px]">
          <div>
            © {new Date().getFullYear()} <strong className="text-slate-900 dark:text-slate-100 font-heading">DRX HARDWARE STORE</strong>. Tất cả quyền được bảo lưu.
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
