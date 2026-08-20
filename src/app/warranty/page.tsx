"use client";

import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { ShieldCheck, Search, Calendar, Phone, CheckCircle2, Clock, Wrench } from 'lucide-react';

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
      category: "VGA",
      brand: "ASUS",
      purchaseDate: "2024-02-15",
      warrantyEnd: "2027-02-15",
      status: "ACTIVE",
      repairLogs: [
        { date: "2024-06-10", note: "Vệ sinh tản nhiệt định kỳ & tra keo tản nhiệt miễn phí" }
      ]
    },
    {
      serialNumber: "INTEL-CPU-4492011",
      productName: "Intel Core i5 13400F (Up To 4.6GHz, 10 Nhân 16 Luồng, LGA 1700)",
      category: "CPU",
      brand: "Intel",
      purchaseDate: "2024-02-15",
      warrantyEnd: "2027-02-15",
      status: "ACTIVE"
    }
  ],
  "ASUS-VGA-8839201": [
    {
      serialNumber: "ASUS-VGA-8839201",
      productName: "Card Màn Hình ASUS TUF Gaming GeForce RTX 4060 OC Edition 8GB GDDR6",
      category: "VGA",
      brand: "ASUS",
      purchaseDate: "2024-02-15",
      warrantyEnd: "2027-02-15",
      status: "ACTIVE",
      repairLogs: [
        { date: "2024-06-10", note: "Vệ sinh tản nhiệt định kỳ & tra keo tản nhiệt miễn phí" }
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
      setSearchResults([]);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Header />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        
        {/* Banner Title */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            Cổng Tra Cứu Bảo Hành Điện Tử DRX
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Tra Cứu Hạn Bảo Hành & Lịch Sử Sửa Chữa
          </h1>
          <p className="text-slate-400 text-sm max-w-xl mx-auto">
            Nhập Số Điện Thoại mua hàng hoặc Mã Serial Number trên vỏ hộp/tem linh kiện để tra cứu thời hạn bảo hành 1 đổi 1 tức thì.
          </p>
        </div>

        {/* Search Input Box */}
        <div className="max-w-2xl mx-auto bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-2xl">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Nhập SĐT (VD: 0908889999) hoặc Serial (ASUS-VGA...)"
                required
                className="w-full bg-slate-950 text-slate-100 text-sm placeholder-slate-500 rounded-xl pl-11 pr-4 py-3 border border-slate-700/80 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/30 transition-all"
              />
              <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
            </div>

            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-sm transition-all shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2"
            >
              <Search className="w-4 h-4" />
              <span>Tra Cứu Ngay</span>
            </button>
          </form>
        </div>

        {/* Search Results */}
        {searched && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span>Kết quả tra cứu</span>
              <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full font-mono">
                {searchResults?.length || 0} sản phẩm
              </span>
            </h2>

            {searchResults && searchResults.length > 0 ? (
              <div className="space-y-4">
                {searchResults.map((item, idx) => (
                  <div 
                    key={idx}
                    className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl hover:border-cyan-500/50 transition-all"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                      <div>
                        <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">{item.category} • {item.brand}</span>
                        <h3 className="text-base font-bold text-white mt-0.5">{item.productName}</h3>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {item.status === 'ACTIVE' && (
                          <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Còn Bảo Hành
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                      <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                        <span className="text-slate-500 block">Mã Serial Number:</span>
                        <span className="font-mono font-bold text-slate-200">{item.serialNumber}</span>
                      </div>
                      <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                        <span className="text-slate-500 block">Ngày mua hàng:</span>
                        <span className="font-semibold text-slate-200">{item.purchaseDate}</span>
                      </div>
                      <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                        <span className="text-slate-500 block">Hạn bảo hành đến:</span>
                        <span className="font-bold text-cyan-300">{item.warrantyEnd}</span>
                      </div>
                    </div>

                    {item.repairLogs && item.repairLogs.length > 0 && (
                      <div className="bg-slate-950/80 rounded-xl p-4 border border-slate-800/80 space-y-2">
                        <h4 className="text-xs font-bold text-slate-400 flex items-center gap-1.5 uppercase">
                          <Wrench className="w-3.5 h-3.5 text-amber-400" />
                          <span>Lịch sử bảo trì / bảo hành tại DRX:</span>
                        </h4>
                        <ul className="space-y-1.5 text-xs text-slate-300">
                          {item.repairLogs.map((log, lIdx) => (
                            <li key={lIdx} className="flex items-center gap-2">
                              <span className="text-slate-500 font-mono">[{log.date}]</span>
                              <span>{log.note}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center space-y-3">
                <Clock className="w-12 h-12 text-slate-600 mx-auto" />
                <h3 className="text-lg font-bold text-white">Không tìm thấy thông tin bảo hành!</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Vui lòng kiểm tra lại Số Điện Thoại hoặc Mã Serial Number. Nếu bạn mới mua hàng, thông tin bảo hành có thể mất 24h để đồng bộ lên hệ thống.
                </p>
                <div className="pt-2 text-xs text-cyan-400">
                  📞 Tổng đài kỹ thuật hỗ trợ: <span className="font-bold text-white">1900 888 999</span>
                </div>
              </div>
            )}
          </div>
        )}

      </main>

      <Footer />
    </div>
  );
}
