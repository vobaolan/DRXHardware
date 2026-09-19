'use client';

import React, { useRef, useState, useEffect } from 'react';
import { 
  X, 
  Download, 
  ShieldCheck, 
  PhoneCall, 
  Globe, 
  Sparkles,
  ShoppingCart,
  CheckCircle2,
  Wrench,
  Truck
} from 'lucide-react';
import { showToast } from '@/components/Toast';
import { HardwareProduct } from '@/lib/hardware-data';

interface BuildQuotationModalProps {
  build: Record<string, HardwareProduct | null>;
  totalCost: number;
  buildName?: string;
  onClose: () => void;
  onBuyAll: () => void;
}

const formatVND = (num: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num);
};

export function BuildQuotationModal({
  build,
  totalCost,
  buildName = 'Cấu Hình DRX Build Gaming / Workstation',
  onClose,
  onBuyAll
}: BuildQuotationModalProps) {
  const [isGeneratingImg, setIsGeneratingImg] = useState(false);
  const invoiceRef = useRef<HTMLDivElement>(null);

  // Close on Escape key & Lock background scrolling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [onClose]);

  const selectedItems = Object.entries(build)
    .filter(([_, item]) => item !== null)
    .map(([key, item]) => ({
      key,
      product: item as HardwareProduct
    }));

  const quoteCode = `DRX-PC-${Math.floor(10000 + Math.random() * 90000)}`;
  const currentDateStr = new Date().toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  // Export as Canvas PNG with Official Logo & Ultra Sharp Output
  const handleDownloadImage = async () => {
    setIsGeneratingImg(true);
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        showToast('Không thể tạo canvas hình ảnh', 'error');
        setIsGeneratingImg(false);
        return;
      }

      // 2x HD Resolution for Ultra Sharp Output
      const width = 900;
      const rowHeight = 44;
      const baseHeight = 420;
      const height = baseHeight + (selectedItems.length * rowHeight);

      canvas.width = width * 2;
      canvas.height = height * 2;
      ctx.scale(2, 2);

      // 1. Background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);

      // 2. Header Top Banner (Cyber Gradient)
      const gradient = ctx.createLinearGradient(0, 0, width, 0);
      gradient.addColorStop(0, '#0284c7');
      gradient.addColorStop(0.4, '#0ea5e9');
      gradient.addColorStop(1, '#0369a1');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, 105);

      // Load & Draw Logo Image
      try {
        const logoImg = new Image();
        logoImg.crossOrigin = 'anonymous';
        await new Promise((resolve) => {
          logoImg.onload = resolve;
          logoImg.onerror = () => resolve(null);
          logoImg.src = '/logo/logo-header.png';
        });
        if (logoImg.naturalWidth > 0) {
          const logoHeight = 38;
          const logoWidth = (logoImg.naturalWidth / logoImg.naturalHeight) * logoHeight;
          ctx.drawImage(logoImg, 36, 20, logoWidth, logoHeight);
        } else {
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 24px sans-serif';
          ctx.fillText('DRX HARDWARE', 36, 48);
        }
      } catch (err) {
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 24px sans-serif';
        ctx.fillText('DRX HARDWARE', 36, 48);
      }

      // Header Tagline & Info
      ctx.font = 'bold 10.5px sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.fillText('HỆ THỐNG LINH KIỆN MÁY TÍNH & PC GAMING CHÍNH HÃNG', 36, 72);

      ctx.font = '10.5px sans-serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.fillText('Hotline: 1900.8888 • Website: drxvn.vercel.app', 36, 88);

      // Header Right: Quotation Badge
      ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.fillRect(width - 230, 16, 194, 74);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 1;
      ctx.strokeRect(width - 230, 16, 194, 74);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('BÁO GIÁ CẤU HÌNH PC', width - 133, 38);

      ctx.font = 'bold 15px monospace';
      ctx.fillStyle = '#fef08a';
      ctx.fillText(`#${quoteCode}`, width - 133, 58);

      ctx.font = '10.5px sans-serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.fillText(`Ngày: ${currentDateStr}`, width - 133, 76);
      ctx.textAlign = 'left';

      // 3. Table Header (Directly after header banner)
      const tableTop = 122;
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(36, tableTop, width - 72, 34);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText('STT', 50, tableTop + 22);
      ctx.fillText('DANH MỤC', 90, tableTop + 22);
      ctx.fillText('TÊN LINH KIỆN CHI TIẾT', 210, tableTop + 22);
      ctx.fillText('BẢO HÀNH', 600, tableTop + 22);
      ctx.fillText('SL', 680, tableTop + 22);
      ctx.textAlign = 'right';
      ctx.fillText('ĐƠN GIÁ (VND)', width - 50, tableTop + 22);
      ctx.textAlign = 'left';

      // 5. Table Rows
      let currentY = tableTop + 34;
      selectedItems.forEach((item, idx) => {
        ctx.fillStyle = idx % 2 === 0 ? '#ffffff' : '#f8fafc';
        ctx.fillRect(36, currentY, width - 72, rowHeight);
        ctx.strokeStyle = '#e2e8f0';
        ctx.strokeRect(36, currentY, width - 72, rowHeight);

        // STT
        ctx.fillStyle = '#64748b';
        ctx.font = 'bold 11px monospace';
        ctx.fillText(String(idx + 1).padStart(2, '0'), 50, currentY + 26);

        // Category Tag
        ctx.fillStyle = '#e0f2fe';
        ctx.fillRect(86, currentY + 10, 96, 23);
        ctx.strokeStyle = '#bae6fd';
        ctx.strokeRect(86, currentY + 10, 96, 23);

        ctx.font = 'bold 10px sans-serif';
        ctx.fillStyle = '#0284c7';
        ctx.textAlign = 'center';
        ctx.fillText(item.product.category, 134, currentY + 25);
        ctx.textAlign = 'left';

        // Product Name
        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 11px sans-serif';
        const truncatedName = item.product.name.length > 55 
          ? item.product.name.slice(0, 53) + '...' 
          : item.product.name;
        ctx.fillText(truncatedName, 210, currentY + 26);

        // Warranty
        ctx.fillStyle = '#475569';
        ctx.font = '10.5px sans-serif';
        ctx.fillText(`${item.product.warrantyMonths}T`, 612, currentY + 26);

        // Qty
        ctx.fillText('01', 685, currentY + 26);

        // Price
        ctx.textAlign = 'right';
        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 12px sans-serif';
        ctx.fillText(formatVND(item.product.discountPrice || item.product.price), width - 50, currentY + 26);
        ctx.textAlign = 'left';

        currentY += rowHeight;
      });

      // 6. Total Summary Box
      currentY += 14;
      ctx.fillStyle = '#f0fdf4';
      ctx.strokeStyle = '#86efac';
      ctx.lineWidth = 1.5;
      ctx.fillRect(36, currentY, width - 72, 56);
      ctx.strokeRect(36, currentY, width - 72, 56);

      ctx.fillStyle = '#166534';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText('TỔNG TIỀN BÁO GIÁ (ĐÃ GỒM VAT 10%):', 50, currentY + 34);

      ctx.textAlign = 'right';
      ctx.fillStyle = '#dc2626';
      ctx.font = 'bold 22px sans-serif';
      ctx.fillText(formatVND(totalCost), width - 50, currentY + 37);
      ctx.textAlign = 'left';

      // 7. Minimal Footer Commitment
      currentY += 70;
      ctx.fillStyle = '#f8fafc';
      ctx.strokeStyle = '#e2e8f0';
      ctx.fillRect(36, currentY, width - 72, 40);
      ctx.strokeRect(36, currentY, width - 72, 40);

      ctx.fillStyle = '#475569';
      ctx.font = '10.5px sans-serif';
      ctx.fillText('✓ Bảo hành chính hãng 1 đổi 1   •   ✓ Miễn phí lắp ráp & cài Win   •   ✓ Giao hàng COD toàn quốc', 50, currentY + 24);

      ctx.textAlign = 'right';
      ctx.fillStyle = '#0284c7';
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText('DRX HARDWARE OFFICIAL', width - 50, currentY + 24);
      ctx.textAlign = 'left';

      // 8. Download File
      const link = document.createElement('a');
      link.download = `DRX_BaoGia_PC_${quoteCode}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();

      showToast('Đã tải ảnh Báo giá PC (.PNG) sắc nét thành công!', 'success');
    } catch (e) {
      console.error(e);
      showToast('Lỗi khi xuất ảnh báo giá', 'error');
    } finally {
      setIsGeneratingImg(false);
    }
  };

  return (
    <div 
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto animate-in fade-in duration-200"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 sm:p-6 max-w-3xl w-full space-y-4 shadow-2xl text-slate-900 dark:text-slate-100 my-auto relative max-h-[92vh] flex flex-col"
      >
        
        {/* HEADER MODAL */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-br from-[#0284c7] to-sky-500 text-white shadow-sm">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-heading text-sm sm:text-base font-black uppercase text-slate-900 dark:text-white">
                BÁO GIÁ CẤU HÌNH DRX BUILD PC
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/50 dark:hover:text-rose-400 text-slate-500 transition-all cursor-pointer border border-transparent hover:border-rose-200 dark:hover:border-rose-800"
            title="Đóng (Esc)"
            aria-label="Đóng"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            INVOICE PREVIEW CARD (MINIMALIST, CLEAN, BEAUTIFUL)
           ───────────────────────────────────────────────────────────── */}
        <div className="overflow-y-auto flex-1 pr-1 -mr-1 space-y-3.5">
          <div 
            ref={invoiceRef}
            className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4 shadow-xs text-xs"
          >
            {/* Top Company Brand with Logo */}
            <div className="flex items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-3.5">
              <div className="space-y-1">
                <div className="flex items-center gap-2.5">
                  <img 
                    src="/logo/logo-header.png" 
                    alt="DRX HARDWARE Logo" 
                    className="h-8 w-auto object-contain dark:hidden" 
                  />
                  <img 
                    src="/logo/logo-white.png" 
                    alt="DRX HARDWARE Logo" 
                    className="h-8 w-auto object-contain hidden dark:block" 
                  />
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800/80">
                    CHÍNH HÃNG
                  </span>
                </div>
                
                <div className="flex items-center gap-3 text-[10.5px] text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                    <PhoneCall className="w-3 h-3 text-[#0284c7]" /> 1900.8888
                  </span>
                  <span className="flex items-center gap-1 text-[#0284c7] font-semibold">
                    <Globe className="w-3 h-3 text-[#0284c7]" /> drxvn.vercel.app
                  </span>
                </div>
              </div>

              {/* Quotation Info Box */}
              <div className="text-right bg-slate-50 dark:bg-slate-900/80 px-3 py-2 rounded-xl border border-slate-100 dark:border-slate-800 shrink-0">
                <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block">MÃ BÁO GIÁ</span>
                <span className="font-mono font-black text-xs sm:text-sm text-[#0284c7] block">#{quoteCode}</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block">{currentDateStr}</span>
              </div>
            </div>

            {/* Items Table */}
            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100/80 dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-heading text-[10px] uppercase border-b border-slate-200 dark:border-slate-800">
                    <th className="py-2.5 px-3 text-center w-10">STT</th>
                    <th className="py-2.5 px-3 w-24">Danh Mục</th>
                    <th className="py-2.5 px-3">Tên Linh Kiện</th>
                    <th className="py-2.5 px-2 text-center w-14">BH</th>
                    <th className="py-2.5 px-2 text-center w-12">SL</th>
                    <th className="py-2.5 px-3 text-right w-32">Đơn Giá</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
                  {selectedItems.map((item, idx) => (
                    <tr key={item.key} className="hover:bg-sky-50/20 dark:hover:bg-slate-900/40">
                      <td className="py-2 px-3 text-center font-mono text-slate-400 font-bold text-[11px]">
                        {idx + 1}
                      </td>
                      <td className="py-2 px-3">
                        <span className="inline-block px-1.5 py-0.5 rounded font-black text-[9.5px] bg-sky-50 dark:bg-sky-950/60 text-[#0284c7] dark:text-sky-400 border border-sky-200/70 dark:border-sky-800/60 uppercase">
                          {item.product.category}
                        </span>
                      </td>
                      <td className="py-2 px-3 font-medium text-slate-900 dark:text-slate-100 text-[11.5px] leading-snug">
                        {item.product.name}
                      </td>
                      <td className="py-2 px-2 text-center font-mono text-slate-500 text-[11px]">
                        {item.product.warrantyMonths}T
                      </td>
                      <td className="py-2 px-2 text-center font-mono text-slate-500 text-[11px]">
                        01
                      </td>
                      <td className="py-2 px-3 font-mono font-black text-right text-slate-900 dark:text-white text-xs">
                        {formatVND(item.product.discountPrice || item.product.price)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Total Box */}
            <div className="p-3.5 bg-gradient-to-r from-emerald-50/80 via-sky-50/40 to-emerald-50/80 dark:from-emerald-950/30 dark:via-slate-900 dark:to-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span className="font-heading text-xs uppercase font-black text-slate-900 dark:text-white">
                  TỔNG TIỀN (ĐÃ GỒM VAT):
                </span>
              </div>
              <span className="font-heading font-black text-base sm:text-xl text-rose-600 dark:text-rose-400 font-mono">
                {formatVND(totalCost)}
              </span>
            </div>

            {/* Minimalist Commitments Footer */}
            <div className="flex items-center justify-between text-[10.5px] text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-2.5">
              <span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Bảo hành 1 đổi 1</span>
              <span className="flex items-center gap-1"><Wrench className="w-3.5 h-3.5 text-[#0284c7]" /> Miễn phí lắp ráp &amp; Win</span>
              <span className="flex items-center gap-1"><Truck className="w-3.5 h-3.5 text-amber-500" /> Giao hàng COD toàn quốc</span>
            </div>
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            ACTION BUTTONS (DOWNLOAD PNG, BUY ALL, CLOSE ONLY)
           ───────────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 shrink-0 border-t border-slate-100 dark:border-slate-800">
          {/* Action 1: Download Image */}
          <button
            type="button"
            onClick={handleDownloadImage}
            disabled={isGeneratingImg}
            className="px-4 py-3 rounded-2xl bg-gradient-to-r from-[#0284c7] to-[#0ea5e9] hover:from-[#0369a1] hover:to-[#0284c7] text-white text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-md flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>{isGeneratingImg ? 'Đang Tạo Ảnh...' : 'Tải Ảnh Báo Giá (.PNG)'}</span>
          </button>

          {/* Action 2: Buy All */}
          <button
            type="button"
            onClick={() => {
              onClose();
              onBuyAll();
            }}
            className="px-4 py-3 rounded-2xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-700 hover:to-amber-700 text-white text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-md flex items-center justify-center gap-2 active:scale-95"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Mua Toàn Bộ</span>
          </button>

          {/* Action 3: Close Modal */}
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold uppercase transition-all cursor-pointer flex items-center justify-center gap-2 border border-slate-200/80 dark:border-slate-700"
          >
            <X className="w-4 h-4" />
            <span>Đóng</span>
          </button>
        </div>

      </div>
    </div>
  );
}


