'use client';

import React, { useRef, useState } from 'react';
import { 
  X, 
  Download, 
  Printer, 
  Copy, 
  Check, 
  Send, 
  ShieldCheck, 
  PhoneCall, 
  MapPin, 
  Globe, 
  Sparkles,
  ShoppingCart,
  QrCode
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
  buildName = 'Cấu Hình PC Gaming / Workstation DRX',
  onClose,
  onBuyAll
}: BuildQuotationModalProps) {
  const [isGeneratingImg, setIsGeneratingImg] = useState(false);
  const [copiedText, setCopiedText] = useState(false);
  const invoiceRef = useRef<HTMLDivElement>(null);

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

  // Export as Canvas PNG
  const handleDownloadImage = () => {
    setIsGeneratingImg(true);
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        showToast('Không thể tạo canvas hình ảnh', 'error');
        setIsGeneratingImg(false);
        return;
      }

      // 2x HD resolution
      const width = 900;
      const rowHeight = 44;
      const baseHeight = 560;
      const height = baseHeight + (selectedItems.length * rowHeight);

      canvas.width = width * 2;
      canvas.height = height * 2;
      ctx.scale(2, 2);

      // Background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);

      // Header Top Bar
      const gradient = ctx.createLinearGradient(0, 0, width, 0);
      gradient.addColorStop(0, '#0284c7');
      gradient.addColorStop(0.5, '#0ea5e9');
      gradient.addColorStop(1, '#2563eb');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, 110);

      // Header Logo & Text
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 26px sans-serif';
      ctx.fillText('DRX HARDWARE', 36, 45);

      ctx.font = '11px sans-serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.fillText('HỆ THỐNG LINH KIỆN MÁY TÍNH & PC GAMING CHÍNH HÃNG', 36, 68);
      ctx.fillText('Hotline: 1900.8888 | 0908.888.999 • Website: websitedrx.vercel.app', 36, 88);

      // Quote Title on Right
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 18px sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText('BẢN BÁO GIÁ CẤU HÌNH PC', width - 36, 45);

      ctx.font = '12px monospace';
      ctx.fillText(`MÃ: #${quoteCode}`, width - 36, 68);
      ctx.font = '11px sans-serif';
      ctx.fillText(`Ngày tạo: ${currentDateStr}`, width - 36, 88);
      ctx.textAlign = 'left';

      // Build Name Box
      ctx.fillStyle = '#f8fafc';
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 1;
      ctx.fillRect(36, 130, width - 72, 45);
      ctx.strokeRect(36, 130, width - 72, 45);

      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 14px sans-serif';
      ctx.fillText(`Tên cấu hình: ${buildName}`, 50, 158);

      // Table Header
      const tableTop = 195;
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(36, tableTop, width - 72, 34);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText('STT', 50, tableTop + 22);
      ctx.fillText('DANH MỤC', 90, tableTop + 22);
      ctx.fillText('TÊN LINH KIỆN CHI TIẾT', 210, tableTop + 22);
      ctx.fillText('BẢO HÀNH', 590, tableTop + 22);
      ctx.fillText('SL', 680, tableTop + 22);
      ctx.textAlign = 'right';
      ctx.fillText('THÀNH TIỀN', width - 50, tableTop + 22);
      ctx.textAlign = 'left';

      // Table Rows
      let currentY = tableTop + 34;
      selectedItems.forEach((item, idx) => {
        // Alternating background
        ctx.fillStyle = idx % 2 === 0 ? '#ffffff' : '#f8fafc';
        ctx.fillRect(36, currentY, width - 72, rowHeight);
        ctx.strokeStyle = '#f1f5f9';
        ctx.strokeRect(36, currentY, width - 72, rowHeight);

        ctx.fillStyle = '#334155';
        ctx.font = '11px sans-serif';
        ctx.fillText(String(idx + 1), 52, currentY + 26);

        ctx.font = 'bold 11px sans-serif';
        ctx.fillStyle = '#0284c7';
        ctx.fillText(item.product.category, 90, currentY + 26);

        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 11px sans-serif';
        const truncatedName = item.product.name.length > 50 
          ? item.product.name.slice(0, 48) + '...' 
          : item.product.name;
        ctx.fillText(truncatedName, 210, currentY + 26);

        ctx.fillStyle = '#64748b';
        ctx.font = '11px sans-serif';
        ctx.fillText(`${item.product.warrantyMonths} Tháng`, 590, currentY + 26);
        ctx.fillText('01', 685, currentY + 26);

        ctx.textAlign = 'right';
        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 12px sans-serif';
        ctx.fillText(formatVND(item.product.discountPrice || item.product.price), width - 50, currentY + 26);
        ctx.textAlign = 'left';

        currentY += rowHeight;
      });

      // Total Section
      currentY += 15;
      ctx.fillStyle = '#f0fdf4';
      ctx.strokeStyle = '#86efac';
      ctx.lineWidth = 1.5;
      ctx.fillRect(36, currentY, width - 72, 60);
      ctx.strokeRect(36, currentY, width - 72, 60);

      ctx.fillStyle = '#166534';
      ctx.font = 'bold 13px sans-serif';
      ctx.fillText('TỔNG THANH TOÁN TOÀN BỘ CẤU HÌNH (ĐÃ GỒM VAT):', 54, currentY + 36);

      ctx.textAlign = 'right';
      ctx.fillStyle = '#dc2626';
      ctx.font = 'bold 22px sans-serif';
      ctx.fillText(formatVND(totalCost), width - 54, currentY + 39);
      ctx.textAlign = 'left';

      // Footer Guarantee Box
      currentY += 80;
      ctx.fillStyle = '#f8fafc';
      ctx.strokeStyle = '#e2e8f0';
      ctx.fillRect(36, currentY, width - 72, 85);
      ctx.strokeRect(36, currentY, width - 72, 85);

      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText('CAM KẾT CHẤT LƯỢNG TỪ DRX HARDWARE:', 50, currentY + 25);

      ctx.fillStyle = '#475569';
      ctx.font = '10.5px sans-serif';
      ctx.fillText('✓ 100% Linh kiện mới nguyên seal chính hãng, đầy đủ tem bảo hành nhà phân phối.', 50, currentY + 45);
      ctx.fillText('✓ Miễn phí công lắp ráp, đi dây giấu nguồn thẩm mỹ, cài đặt Windows 11 & Test nhiệt độ Full-load.', 50, currentY + 62);
      ctx.fillText('✓ Hỗ trợ giao hàng COD tận nơi toàn quốc - Kiểm tra hàng trước khi thanh toán.', 50, currentY + 79);

      // Signature on right
      ctx.textAlign = 'right';
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText('DRX HARDWARE OFFICIAL', width - 60, currentY + 40);
      ctx.font = 'italic 10.5px sans-serif';
      ctx.fillStyle = '#64748b';
      ctx.fillText('(Ký tên & Đóng dấu điện tử)', width - 60, currentY + 60);
      ctx.textAlign = 'left';

      // Trigger Download
      const link = document.createElement('a');
      link.download = `DRX_BaoGia_PC_${quoteCode}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();

      showToast('Đã xuất và tải ảnh Báo giá PC (.PNG) thành công!', 'success');
    } catch (e) {
      console.error(e);
      showToast('Lỗi khi xuất ảnh báo giá', 'error');
    } finally {
      setIsGeneratingImg(false);
    }
  };

  // Copy structured message for Zalo / Messenger
  const handleCopyMessageForSales = () => {
    const lines = [
      `🖥️ **BÁO GIÁ CẤU HÌNH PC - DRX HARDWARE**`,
      `📋 Tên cấu hình: ${buildName}`,
      `🔖 Mã báo giá: #${quoteCode}`,
      `📅 Ngày lập: ${currentDateStr}`,
      `---------------------------------`,
      ...selectedItems.map((item, i) => `${i + 1}. [${item.product.category}] ${item.product.name} - ${formatVND(item.product.discountPrice || item.product.price)} (BH ${item.product.warrantyMonths}T)`),
      `---------------------------------`,
      `💰 **TỔNG TIỀN: ${formatVND(totalCost)}**`,
      `✨ Đã bao gồm lắp ráp, cài win và test nhiệt độ`,
      `📞 Hotline tư vấn: 1900.8888 | 0908.888.999`,
      `🌐 Xem trực tiếp tại: https://websitedrx.vercel.app/pc-builder`,
    ];

    navigator.clipboard.writeText(lines.join('\n'));
    setCopiedText(true);
    showToast('Đã sao chép nội dung báo giá! Bạn có thể dán (Ctrl+V) gửi ngay cho người bán qua Zalo/Messenger.', 'success');
    setTimeout(() => setCopiedText(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-7 max-w-3xl w-full space-y-6 shadow-2xl text-slate-900 dark:text-slate-100 my-8 relative overflow-hidden">
        
        {/* HEADER MODAL */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-[#0284c7] text-white">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading text-sm sm:text-base font-black uppercase text-slate-900 dark:text-white">
                BẢN BÁO GIÁ &amp; HÓA ĐƠN CẤU HÌNH PC
              </h3>
              <p className="text-xs text-slate-500">
                Xuất file ảnh chất lượng cao gửi cho người bán hàng hoặc đặt hàng ngay
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-500 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            INVOICE PREVIEW CARD (PRINTABLE / SHAREABLE)
           ───────────────────────────────────────────────────────────── */}
        <div 
          ref={invoiceRef}
          className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 space-y-5 shadow-xs text-xs"
        >
          {/* Top Company Brand */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-heading text-lg font-black text-[#0284c7]">DRX HARDWARE</span>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-emerald-100 text-emerald-700 border border-emerald-300">
                  CHÍNH HÃNG
                </span>
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                Hệ Thống Linh Kiện Máy Tính &amp; PC Gaming Chuyên Nghiệp
              </p>
              <div className="flex items-center gap-3 text-[10.5px] text-slate-500 flex-wrap">
                <span className="flex items-center gap-1"><PhoneCall className="w-3 h-3 text-[#0284c7]" /> 1900.8888</span>
                <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-[#0284c7]" /> Showroom TP. Hồ Chí Minh</span>
                <span className="flex items-center gap-1"><Globe className="w-3 h-3 text-[#0284c7]" /> websitedrx.vercel.app</span>
              </div>
            </div>

            <div className="text-left sm:text-right space-y-1 bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800 shrink-0">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">MÃ BÁO GIÁ</span>
              <span className="font-mono font-black text-sm text-[#0284c7] block">#{quoteCode}</span>
              <span className="text-[10.5px] text-slate-500 block">Ngày lập: {currentDateStr}</span>
            </div>
          </div>

          {/* Build Title Banner */}
          <div className="p-3 bg-sky-50/60 dark:bg-sky-950/40 rounded-xl border border-sky-200/80 dark:border-sky-800/60 flex items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-bold text-sky-700 dark:text-sky-300 uppercase">Cấu hình:</span>
              <h4 className="font-heading font-black text-xs sm:text-sm text-slate-900 dark:text-white">{buildName}</h4>
            </div>
            <span className="font-mono font-bold text-slate-500 text-[11px]">
              {selectedItems.length} Linh Kiện
            </span>
          </div>

          {/* Items Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-heading text-[10px] uppercase border-b border-slate-200 dark:border-slate-800">
                  <th className="py-2.5 px-3">STT</th>
                  <th className="py-2.5 px-3">Danh Mục</th>
                  <th className="py-2.5 px-3">Tên Linh Kiện</th>
                  <th className="py-2.5 px-3">BH</th>
                  <th className="py-2.5 px-3 text-right">Đơn Giá</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
                {selectedItems.map((item, idx) => (
                  <tr key={item.key} className="hover:bg-slate-50/80 dark:hover:bg-slate-900/40">
                    <td className="py-2.5 px-3 font-mono text-slate-400">{idx + 1}</td>
                    <td className="py-2.5 px-3 font-bold text-[#0284c7]">{item.product.category}</td>
                    <td className="py-2.5 px-3 font-medium line-clamp-1 max-w-[280px]" title={item.product.name}>
                      {item.product.name}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-500">{item.product.warrantyMonths}T</td>
                    <td className="py-2.5 px-3 font-mono font-black text-right text-slate-900 dark:text-white">
                      {formatVND(item.product.discountPrice || item.product.price)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Total Box */}
          <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <span className="font-heading text-xs uppercase font-black text-slate-900 dark:text-white">
              TỔNG TIỀN BÁO GIÁ (ĐÃ GỒM VAT):
            </span>
            <span className="font-heading font-black text-base sm:text-lg text-rose-600 dark:text-rose-400">
              {formatVND(totalCost)}
            </span>
          </div>

          {/* Policy notes */}
          <div className="flex items-center justify-between text-[10.5px] text-slate-500 border-t border-slate-100 dark:border-slate-800 pt-3">
            <span>🛡️ Bảo hành 36 tháng chính hãng 1 đổi 1</span>
            <span>🛠️ Miễn phí lắp ráp &amp; cài Win</span>
            <span>🚚 Giao hàng COD tận nơi</span>
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            ACTION BUTTONS FOR USERS & SALESPERSON
           ───────────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-1">
          {/* Action 1: Download Image */}
          <button
            type="button"
            onClick={handleDownloadImage}
            disabled={isGeneratingImg}
            className="px-4 py-3 rounded-2xl bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-md flex items-center justify-center gap-2 active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>{isGeneratingImg ? 'Đang Xuất Ảnh...' : 'Tải Ảnh Báo Giá (.PNG)'}</span>
          </button>

          {/* Action 2: Copy Text for Zalo */}
          <button
            type="button"
            onClick={handleCopyMessageForSales}
            className="px-4 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-md flex items-center justify-center gap-2 active:scale-95"
          >
            {copiedText ? <Check className="w-4 h-4 text-emerald-200" /> : <Send className="w-4 h-4" />}
            <span>{copiedText ? 'Đã Copy Báo Giá!' : 'Gửi Người Bán (Zalo)'}</span>
          </button>

          {/* Action 3: Print / PDF */}
          <button
            type="button"
            onClick={() => window.print()}
            className="px-4 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-bold uppercase transition-all cursor-pointer flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-700"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>In Bản Báo Giá</span>
          </button>

          {/* Action 4: Buy All */}
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
        </div>

      </div>
    </div>
  );
}
