'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { 
  HelpCircle, Search, ChevronDown, Wrench, CreditCard, ShieldCheck, 
  Cpu, Truck, CheckCircle2, PhoneCall, Laptop
} from 'lucide-react';

interface FAQItem {
  id: string;
  category: 'warranty' | 'shipping' | 'buildpc' | 'payment';
  question: string;
  answer: string | React.ReactNode;
}

export default function FAQPolicyPage() {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [openId, setOpenId] = useState<string | null>('faq-1');

  const FAQ_LIST: FAQItem[] = [
    {
      id: 'faq-1',
      category: 'warranty',
      question: 'Chính sách bảo hành 1 đổi 1 trong 30 ngày đầu tiên áp dụng thế nào?',
      answer: 'Tất cả linh kiện máy tính (CPU, VGA, Mainboard, RAM, SSD, Nguồn PSU...) nếu phát sinh lỗi phần cứng do nhà sản xuất trong vòng 30 ngày kể từ ngày mua sẽ được DRX Hardware đổi mới ngay lập tức một sản phẩm cùng loại mới 100%, không cần chờ bảo hành hãng.'
    },
    {
      id: 'faq-2',
      category: 'warranty',
      question: 'Làm thế nào để tra cứu thời hạn bảo hành điện tử của linh kiện?',
      answer: (
        <div className="space-y-2">
          <p>Quý khách có thể tra cứu bảo hành bất cứ lúc nào qua 2 cách:</p>
          <ol className="list-decimal pl-5 space-y-1 font-medium text-slate-700 dark:text-slate-300">
            <li>Truy cập trực tiếp vào cổng <strong>Tra Cứu E-Warranty</strong> tại <Link href="/warranty" className="text-[#0284c7] underline">drxvn.vercel.app/warranty</Link>.</li>
            <li>Nhập mã <strong>Serial Number (SN)</strong> in trên tem linh kiện hoặc vỏ hộp để xem chi tiết thời hạn, ngày kích hoạt và lịch sử sửa chữa.</li>
          </ol>
        </div>
      )
    },
    {
      id: 'faq-3',
      category: 'buildpc',
      question: 'Tôi có được miễn phí công lắp ráp và cài đặt Windows khi build PC không?',
      answer: 'Có! 100% các bộ máy tính PC được build tại DRX Hardware đều được miễn phí hoàn toàn công lắp ráp chuyên nghiệp, đi dây giấu nguồn thẩm mỹ, cài đặt hệ điều hành, driver mới nhất và stress-test kiểm tra nhiệt độ trong 2 tiếng trước khi bàn giao.'
    },
    {
      id: 'faq-4',
      category: 'shipping',
      question: 'Thời gian giao hàng mất bao lâu và tôi có được kiểm tra hàng trước khi nhận không?',
      answer: 'Khách hàng tại nội thành TP.HCM được hỗ trợ giao hỏa tốc trong 2 giờ. Khách hàng các tỉnh thành khác nhận hàng sau 1-3 ngày làm việc qua chuyển phát nhanh. Quý khách hoàn toàn ĐƯỢC QUYỀN MỞ HỘP ĐỒNG KIỂM đúng mã linh kiện, tem niêm phong nguyên vẹn trước khi ký nhận và thanh toán.'
    },
    {
      id: 'faq-5',
      category: 'payment',
      question: 'DRX Hardware hỗ trợ những hình thức thanh toán và trả góp nào?',
      answer: 'DRX hỗ trợ chuyển khoản ngân hàng tự động qua mã VietQR 24/7 (miễn phí), thanh toán tiền mặt khi nhận hàng (COD), quẹt thẻ POS tại showroom và đặc biệt là chương trình TRẢ GÓP 0% LÃI SUẤT qua thẻ tín dụng của hơn 25 ngân hàng hoặc trả góp qua CCCD duyệt hồ sơ online 15 phút.'
    },
    {
      id: 'faq-6',
      category: 'buildpc',
      question: 'Nếu các linh kiện tôi chọn bị nghẽn cổ chai hoặc không tương thích thì sao?',
      answer: 'Công cụ DRX Build PC được tích hợp thuật toán tự động kiểm tra tương thích giữa CPU, Mainboard, RAM và công suất nguồn PSU. Ngoài ra, khi đơn hàng gửi về hệ thống, đội ngũ kỹ thuật viên DRX sẽ gọi điện tư vấn và tối ưu lại cấu hình nếu phát hiện điểm nghẽn hiệu năng hoàn toàn miễn phí.'
    },
    {
      id: 'faq-7',
      category: 'warranty',
      question: 'Linh kiện của tôi bị hư sau thời gian 30 ngày đầu thì xử lý như thế nào?',
      answer: 'Sau 30 ngày đầu, sản phẩm vẫn được bảo hành chính hãng từ 12 đến 36 tháng theo tiêu chuẩn của hãng (ASUS, MSI, Gigabyte, Intel...). DRX sẽ đứng ra tiếp nhận, gửi về trung tâm bảo hành hãng và hỗ trợ cho quý khách mượn linh kiện tương đương để sử dụng tạm thời.'
    }
  ];

  const filteredFaqs = FAQ_LIST.filter((faq) => {
    const matchCategory = activeCategory === 'all' || faq.category === activeCategory;
    const matchSearch = typeof faq.answer === 'string' 
      ? faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
      : faq.question.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 flex flex-col antialiased transition-colors duration-300">
      <Header />

      {/* HERO BANNER */}
      <section className="relative overflow-hidden bg-white dark:bg-slate-900 py-12 sm:py-16 border-b border-slate-200 dark:border-slate-800">
        <div className="absolute inset-0 bg-gradient-to-r from-sky-50 via-white to-blue-50/50 dark:from-slate-900 dark:via-[#071930] dark:to-slate-950 pointer-events-none" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-sky-50 dark:bg-sky-500/10 border border-sky-200 dark:border-sky-500/20 px-3.5 py-1 text-xs font-black text-[#0284c7] dark:text-sky-300 uppercase tracking-widest mx-auto shadow-2xs">
            <HelpCircle className="h-4 w-4" />
            <span>TRUNG TÂM GIẢI ĐÁP KHÁCH HÀNG DRX</span>
          </div>

          <h1
            className="font-heading text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black uppercase text-slate-900 dark:text-white"
            style={{ lineHeight: '1.25' }}
          >
            CÂU HỎI THƯỜNG GẶP (FAQ)
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-normal max-w-2xl mx-auto leading-relaxed">
            Tổng hợp các thắc mắc phổ biến về chính sách bảo hành 1 đổi 1, quy trình giao hàng, tương thích linh kiện PC và trả góp.
          </p>

          {/* SEARCH INPUT */}
          <div className="max-w-xl mx-auto pt-2">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm câu hỏi bạn đang quan tâm (Ví dụ: 1 đổi 1, trả góp, giao hàng...)"
                className="w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs sm:text-sm font-semibold placeholder-slate-400 rounded-2xl pl-11 pr-4 py-3.5 border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-[#0284c7] focus:ring-4 focus:ring-sky-500/10 transition-all"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-4" />
            </div>
          </div>
        </div>
      </section>

      {/* BREADCRUMB */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 py-3">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center gap-2 text-xs text-slate-500">
          <Link href="/" className="hover:text-[#0284c7] transition-colors">Trang Chủ</Link>
          <span>/</span>
          <span className="text-slate-900 dark:text-white font-bold">Câu Hỏi Thường Gặp</span>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <main className="flex-1 mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8 py-12 space-y-10">
        
        {/* CATEGORY FILTER BUTTONS */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {[
            { key: 'all', label: 'Tất Cả Câu Hỏi', icon: HelpCircle },
            { key: 'warranty', label: 'Bảo Hành & Đổi Trả', icon: ShieldCheck },
            { key: 'shipping', label: 'Giao Hàng & Đồng Kiểm', icon: Truck },
            { key: 'buildpc', label: 'Linh Kiện & Ráp PC', icon: Cpu },
            { key: 'payment', label: 'Thanh Toán & Trả Góp', icon: CreditCard },
          ].map((cat) => {
            const Icon = cat.icon;
            const isSelected = activeCategory === cat.key;
            return (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? 'bg-[#0284c7] text-white shadow-md shadow-sky-500/20'
                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* ACCORDION FAQ LIST */}
        <div className="space-y-4">
          {filteredFaqs.length > 0 ? (
            filteredFaqs.map((faq) => {
              const isOpen = openId === faq.id;
              return (
                <div
                  key={faq.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden transition-all shadow-2xs hover:border-sky-300 dark:hover:border-slate-700"
                >
                  <button
                    onClick={() => setOpenId(isOpen ? null : faq.id)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 cursor-pointer"
                  >
                    <span className="font-heading font-black text-sm text-slate-900 dark:text-white">
                      {faq.question}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-[#0284c7]' : ''
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-xs text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800/80">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-10 text-center space-y-3">
              <p className="text-xs sm:text-sm text-slate-500">
                Không tìm thấy câu hỏi phù hợp với từ khóa &ldquo;{searchQuery}&rdquo;.
              </p>
              <button
                onClick={() => { setSearchQuery(''); setActiveCategory('all'); }}
                className="text-xs text-[#0284c7] font-bold hover:underline"
              >
                Xem lại tất cả câu hỏi
              </button>
            </div>
          )}
        </div>

        {/* BOTTOM CONTACT BOX */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 text-center space-y-4 shadow-sm">
          <h3 className="font-heading text-base sm:text-lg font-black uppercase text-slate-900 dark:text-white">
            Bạn Vẫn Chưa Tìm Được Câu Trả Lời Thỏa Đáng?
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-lg mx-auto">
            Đừng ngần ngại liên hệ trực tiếp với kỹ thuật viên DRX Hardware để được giải đáp 24/7.
          </p>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <a
              href="tel:01699224729"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-black font-heading uppercase tracking-wider shadow-lg shadow-sky-500/25 transition-all"
            >
              <PhoneCall className="w-4 h-4" />
              <span>Gọi Hotline Kỹ Thuật: 01699.224.729</span>
            </a>
            <Link
              href="/warranty"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-black font-heading uppercase tracking-wider transition-all"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Tra Cứu Bảo Hành SN</span>
            </Link>
          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
}
