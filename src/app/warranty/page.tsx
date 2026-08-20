"use client";

import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { 
  ShieldCheck, Search, Calendar, Phone, CheckCircle2, Clock, Wrench, 
  Sparkles, Award, Cpu, AlertCircle, ArrowRight, Layers, FileText
} from 'lucide-react';

type WarrantyItem = {
  serialNumber: string;
  productName: string;
  category: string;
  brand: string;
  purchaseDate: string;
  warrantyEnd: string;
  status: 'ACTIVE' | 'EXPIRED' | 'REPAIRING';
  repairLogs?: { date: string; note: string }[];
};

const MOCK_WARRANTY_DB: Record<string, WarrantyItem[]> = {
  "0908889999": [
    {
      serialNumber: "ASUS-VGA-8839201",
      productName: "Card Màn Hình ASUS TUF Gaming GeForce RTX 4060 OC Edition 8GB GDDR6",
      category: "Card Màn Hình VGA",
      brand: "ASUS",
      purchaseDate: "2024-02-15",
      warrantyEnd: "2027-02-15",
      status: "ACTIVE",
      repairLogs: [
        { date: "2024-06-10", note: "Vệ sinh tản nhiệt định kỳ & tra keo tản nhiệt gốm miễn phí tại Showroom DRX" }
      ]
    },
    {
      serialNumber: "INTEL-CPU-4492011",
      productName: "Vi Xử Lý Intel Core i5 13400F (Up To 4.6GHz, 10 Nhân 16 Luồng, Socket LGA 1700)",
      category: "CPU Vi Xử Lý",
      brand: "Intel",
      purchaseDate: "2024-02-15",
      warrantyEnd: "2027-02-15",
      status: "ACTIVE"
    }
  ],
  "01699224729": [
    {
      serialNumber: "DRX-RTX4070S-99120",
      productName: "Card Màn Hình MSI GeForce RTX 4070 SUPER 12G Gaming X Slim White",
      category: "Card Màn Hình VGA",
      brand: "MSI",
      purchaseDate: "2024-01-10",
      warrantyEnd: "2027-01-10",
      status: "ACTIVE",
      repairLogs: [
        { date: "2024-05-18", note: "Kiểm tra nhiệt độ tải nặng Furmark & cập nhật VBIOS chính hãng" }
      ]
    },
    {
      serialNumber: "DRX-I7-14700K-0021",
      productName: "CPU Intel Core i7 14700K (Up To 5.6GHz, 20 Nhân 28 Luồng, 33MB Cache)",
      category: "CPU Vi Xử Lý",
      brand: "Intel",
      purchaseDate: "2024-01-10",
      warrantyEnd: "2027-01-10",
      status: "ACTIVE"
    }
  ],
  "ASUS-VGA-8839201": [
    {
      serialNumber: "ASUS-VGA-8839201",
      productName: "Card Màn Hình ASUS TUF Gaming GeForce RTX 4060 OC Edition 8GB GDDR6",
      category: "Card Màn Hình VGA",
      brand: "ASUS",
      purchaseDate: "2024-02-15",
      warrantyEnd: "2027-02-15",
      status: "ACTIVE",
      repairLogs: [
        { date: "2024-06-10", note: "Vệ sinh tản nhiệt định kỳ & tra keo tản nhiệt gốm miễn phí tại Showroom DRX" }
      ]
    }
  ],
  "DRX-RTX4070S-99120": [
    {
      serialNumber: "DRX-RTX4070S-99120",
      productName: "Card Màn Hình MSI GeForce RTX 4070 SUPER 12G Gaming X Slim White",
      category: "Card Màn Hình VGA",
      brand: "MSI",
      purchaseDate: "2024-01-10",
      warrantyEnd: "2027-01-10",
      status: "ACTIVE",
      repairLogs: [
        { date: "2024-05-18", note: "Kiểm tra nhiệt độ tải nặng Furmark & cập nhật VBIOS chính hãng" }
      ]
    }
  ]
};

export default function WarrantyPage() {
  const [searchInput, setSearchInput] = useState('');
  const [searchResults, setSearchResults] = useState<WarrantyItem[] | null>(null);
  const [searched, setSearched] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearched(true);
    const key = searchInput.trim();
    if (MOCK_WARRANTY_DB[key]) {
      setSearchResults(MOCK_WARRANTY_DB[key]);
    } else {
      // Fallback search by partial serial or phone
      const matched: WarrantyItem[] = [];
      Object.keys(MOCK_WARRANTY_DB).forEach(k => {
        if (k.toLowerCase().includes(key.toLowerCase())) {
          MOCK_WARRANTY_DB[k].forEach(item => {
            if (!matched.some(m => m.serialNumber === item.serialNumber)) {
              matched.push(item);
            }
          });
        }
      });
      setSearchResults(matched);
    }
  };

  const handleQuickSearch = (phone: string) => {
    setSearchInput(phone);
    setSearched(true);
    if (MOCK_WARRANTY_DB[phone]) {
      setSearchResults(MOCK_WARRANTY_DB[phone]);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 flex flex-col antialiased tech-grid-pattern transition-colors duration-300">
      <Header />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-10">
        
        {/* HERO TITLE & INTRO */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sky-50 dark:bg-sky-500/10 border border-sky-200 dark:border-sky-500/20 text-xs font-black text-[#0284c7] dark:text-sky-300 uppercase tracking-widest shadow-2xs">
            <ShieldCheck className="w-4 h-4 text-[#0284c7] dark:text-sky-400" />
            <span>CỔNG TRA CỨU BẢO HÀNH ĐIỆN TỬ DRX</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black font-heading text-slate-900 dark:text-white tracking-tight leading-tight uppercase">
            Tra Cứu Hạn Bảo Hành & Lịch Sử Sửa Chữa
          </h1>

          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 font-normal max-w-2xl mx-auto leading-relaxed">
            Nhập Số Điện Thoại mua hàng hoặc Mã Serial Number trên linh kiện để kiểm tra chính xác thời hạn bảo hành 1 đổi 1 và lịch sử bảo trì tại DRX Hardware.
          </p>
        </div>

        {/* SEARCH BOX CARD */}
        <div className="max-w-3xl mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/50 dark:shadow-none">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Nhập SĐT (VD: 0908889999) hoặc Serial (ASUS-VGA...)"
                required
                className="w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-sm font-semibold placeholder-slate-400 rounded-2xl pl-12 pr-4 py-3.5 border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-[#0284c7] focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-sky-500/10 transition-all"
              />
              <Search className="w-5 h-5 text-slate-400 absolute left-4 top-4" />
            </div>

            <button
              type="submit"
              className="px-7 py-3.5 rounded-2xl bg-gradient-to-r from-[#0284c7] to-blue-600 hover:from-sky-500 hover:to-blue-700 text-white font-heading font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-sky-500/25 flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.02] active:scale-95 shrink-0"
            >
              <Search className="w-4 h-4" />
              <span>Tra Cứu Ngay</span>
            </button>
          </form>

          {/* Quick Demo Search Tags */}
          <div className="mt-4 flex flex-wrap items-center gap-2 pt-3 border-t border-slate-100 dark:border-slate-800/80 text-xs">
            <span className="text-slate-400 font-bold">Gợi ý thử nhanh:</span>
            <button
              type="button"
              onClick={() => handleQuickSearch('0908889999')}
              className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-sky-50 hover:text-[#0284c7] dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-semibold transition-colors cursor-pointer"
            >
              SĐT: 0908889999
            </button>
            <button
              type="button"
              onClick={() => handleQuickSearch('01699224729')}
              className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-sky-50 hover:text-[#0284c7] dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-semibold transition-colors cursor-pointer"
            >
              SĐT: 01699224729
            </button>
            <button
              type="button"
              onClick={() => handleQuickSearch('ASUS-VGA-8839201')}
              className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-sky-50 hover:text-[#0284c7] dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-semibold transition-colors cursor-pointer"
            >
              Serial: ASUS-VGA-8839201
            </button>
          </div>
        </div>

        {/* SEARCH RESULTS SECTION */}
        {searched && (
          <div className="space-y-6 pt-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black font-heading text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2.5">
                <span>Kết Quả Tra Cứu Bảo Hành</span>
                <span className="text-xs bg-sky-100 dark:bg-sky-500/20 text-[#0284c7] dark:text-sky-300 px-3 py-1 rounded-full font-black">
                  {searchResults?.length || 0} Linh Kiện
                </span>
              </h2>
            </div>

            {searchResults && searchResults.length > 0 ? (
              <div className="space-y-5">
                {searchResults.map((item, idx) => (
                  <div 
                    key={idx}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-5 shadow-sm hover:shadow-md hover:border-sky-300 dark:hover:border-slate-700 transition-all"
                  >
                    {/* Item Top Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
                      <div className="space-y-1">
                        <div className="inline-flex items-center gap-2 text-xs font-black text-[#0284c7] uppercase tracking-wider">
                          <Cpu className="h-4 w-4" />
                          <span>{item.category} • HÃNG {item.brand}</span>
                        </div>
                        <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
                          {item.productName}
                        </h3>
                      </div>
                      
                      <div className="flex items-center gap-2 shrink-0">
                        {item.status === 'ACTIVE' && (
                          <span className="bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/80 text-xs font-black px-4 py-1.5 rounded-full flex items-center gap-1.5 shadow-2xs">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                            CÒN BẢO HÀNH CHÍNH HÃNG
                          </span>
                        )}
                        {item.status === 'EXPIRED' && (
                          <span className="bg-rose-50 text-rose-700 border border-rose-200 text-xs font-black px-4 py-1.5 rounded-full flex items-center gap-1.5">
                            HẾT HẠN BẢO HÀNH
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Metadata 3-Col Box */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                      <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                        <span className="text-slate-500 dark:text-slate-400 block font-bold mb-1 uppercase tracking-wider">MÃ SERIAL NUMBER:</span>
                        <span className="font-mono font-black text-slate-900 dark:text-slate-100 text-sm">{item.serialNumber}</span>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                        <span className="text-slate-500 dark:text-slate-400 block font-bold mb-1 uppercase tracking-wider">NGÀY MUA HÀNG:</span>
                        <span className="font-extrabold text-slate-900 dark:text-slate-100 text-sm">{item.purchaseDate}</span>
                      </div>
                      <div className="bg-sky-50/50 dark:bg-slate-950 p-4 rounded-2xl border border-sky-100 dark:border-slate-800">
                        <span className="text-sky-700 dark:text-sky-400 block font-bold mb-1 uppercase tracking-wider">THỜI HẠN BẢO HÀNH ĐẾN:</span>
                        <span className="font-black text-[#0284c7] dark:text-sky-300 text-sm">{item.warrantyEnd}</span>
                      </div>
                    </div>

                    {/* Repair & Maintenance Logs */}
                    {item.repairLogs && item.repairLogs.length > 0 && (
                      <div className="bg-slate-50/80 dark:bg-slate-950/80 rounded-2xl p-5 border border-slate-200 dark:border-slate-800/80 space-y-2.5">
                        <h4 className="text-xs font-black text-slate-700 dark:text-slate-300 flex items-center gap-2 uppercase tracking-wider">
                          <Wrench className="w-4 h-4 text-amber-500" />
                          <span>Lịch Sử Bảo Trì & Hỗ Trợ Kỹ Thuật Tại DRX:</span>
                        </h4>
                        <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                          {item.repairLogs.map((log, lIdx) => (
                            <li key={lIdx} className="flex items-start gap-2.5 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                              <span className="text-[#0284c7] font-mono font-bold shrink-0">[{log.date}]</span>
                              <span className="font-medium">{log.note}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center space-y-4 shadow-sm">
                <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                  <Clock className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">Không tìm thấy thông tin bảo hành!</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                  Vui lòng kiểm tra lại Số Điện Thoại hoặc Mã Serial Number trên vỏ hộp linh kiện. Nếu bạn vừa mua hàng hôm nay, hệ thống có thể cần 24h để đồng bộ dữ liệu.
                </p>
                <div className="pt-2 text-xs text-slate-700 dark:text-slate-300 font-medium">
                  📞 Tổng đài bảo hành & kỹ thuật DRX: <span className="font-black text-[#0284c7]">01699224729 / admin@drx.vn</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 3 VALUE PILLARS OF DRX WARRANTY */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-sky-50 dark:bg-slate-800 text-[#0284c7] flex items-center justify-center">
              <Award className="h-6 w-6" />
            </div>
            <h4 className="font-heading font-black text-sm text-slate-900 dark:text-white uppercase">
              Bảo Hành 1 Đổi 1 Trong 30 Ngày
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Lỗi phần cứng do nhà sản xuất (CPU, VGA, Mainboard, RAM, SSD...) được đổi mới 100% trong 30 ngày đầu tiên.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-slate-800 text-emerald-600 flex items-center justify-center">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h4 className="font-heading font-black text-sm text-slate-900 dark:text-white uppercase">
              Chính Hãng 12 - 36 Tháng
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Mọi sản phẩm đều có tem bảo hành chính hãng từ ASUS, MSI, Gigabyte, Intel, AMD, Kingston, Corsair.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-slate-800 text-amber-600 flex items-center justify-center">
              <Wrench className="h-6 w-6" />
            </div>
            <h4 className="font-heading font-black text-sm text-slate-900 dark:text-white uppercase">
              Vệ Sinh & Tra Keo Trọn Đời
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Khách hàng build PC hoặc mua linh kiện tại DRX Hardware được miễn phí vệ sinh máy & tra keo tản nhiệt định kỳ.
            </p>
          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
}