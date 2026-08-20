"use client";

import React, { useState, useMemo } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { INITIAL_PRODUCTS, HardwareProduct } from '@/lib/hardware-data';
import { 
  Cpu, 
  MonitorPlay, 
  CircuitBoard, 
  MemoryStick, 
  HardDrive, 
  Zap, 
  Box, 
  CheckCircle2, 
  Trash2, 
  Printer, 
  ShoppingCart, 
  Plus, 
  Wrench,
  ShieldAlert,
  Sparkles,
  Check,
  RotateCcw,
  X,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import Link from 'next/link';

type BuildStep = {
  key: string;
  name: string;
  category: HardwareProduct['category'];
  icon: any;
};

const BUILD_STEPS: BuildStep[] = [
  { key: "cpu", name: "1. Bộ vi xử lý (CPU)", category: "CPU", icon: Cpu },
  { key: "mainboard", name: "2. Bo mạch chủ (Mainboard)", category: "MAINBOARD", icon: CircuitBoard },
  { key: "ram", name: "3. Bộ nhớ RAM", category: "RAM", icon: MemoryStick },
  { key: "vga", name: "4. Card màn hình (VGA)", category: "VGA", icon: MonitorPlay },
  { key: "storage", name: "5. Ổ cứng (SSD / HDD)", category: "STORAGE", icon: HardDrive },
  { key: "psu", name: "6. Nguồn máy tính (PSU)", category: "PSU", icon: Zap },
  { key: "case", name: "7. Vỏ máy tính (Case)", category: "CASE", icon: Box },
];

export default function PCBuilderPage() {
  const [selectedBuild, setSelectedBuild] = useState<Record<string, HardwareProduct | null>>({
    cpu: null,
    mainboard: null,
    ram: null,
    vga: null,
    storage: null,
    psu: null,
    case: null,
  });

  const [activeStepModal, setActiveStepModal] = useState<string | null>(null);

  // Auto-calculated stats
  const totalCost = useMemo(() => {
    return Object.values(selectedBuild).reduce((acc, item) => {
      if (!item) return acc;
      return acc + (item.discountPrice || item.price);
    }, 0);
  }, [selectedBuild]);

  const estimatedWattage = useMemo(() => {
    let watts = 100; // Base motherboard/fans/ssd power
    if (selectedBuild.cpu?.wattage) watts += selectedBuild.cpu.wattage;
    if (selectedBuild.vga?.wattage) watts += selectedBuild.vga.wattage;
    return watts;
  }, [selectedBuild]);

  const recommendedPsuWattage = useMemo(() => {
    return Math.ceil((estimatedWattage + 150) / 50) * 50;
  }, [estimatedWattage]);

  // Compatibility checking
  const compatibilityAlerts = useMemo(() => {
    const alerts: string[] = [];
    const { cpu, mainboard, ram, psu } = selectedBuild;

    // Check CPU & Mainboard socket match
    if (cpu && mainboard) {
      if (cpu.socket && mainboard.socket && cpu.socket !== mainboard.socket) {
        alerts.push(`Không tương thích Socket: CPU (${cpu.socket}) không lắp vừa Mainboard (${mainboard.socket}).`);
      }
    }

    // Check RAM & Mainboard type match
    if (mainboard && ram) {
      if (mainboard.ramType && ram.ramType && !mainboard.ramType.includes(ram.ramType)) {
        alerts.push(`Không tương thích RAM: Mainboard yêu cầu ${mainboard.ramType} nhưng RAM được chọn là ${ram.ramType}.`);
      }
    }

    // Check PSU Wattage sufficiency
    if (psu && psu.wattage) {
      if (psu.wattage < estimatedWattage) {
        alerts.push(`Nguồn PSU có thể quá tải: Công suất (${psu.wattage}W) nhỏ hơn mức tiêu thụ dự tính (${estimatedWattage}W). Đề xuất nâng lên tối thiểu ${recommendedPsuWattage}W.`);
      }
    }

    return alerts;
  }, [selectedBuild, estimatedWattage, recommendedPsuWattage]);

  const handleSelectComponent = (stepKey: string, product: HardwareProduct) => {
    setSelectedBuild(prev => ({ ...prev, [stepKey]: product }));
    setActiveStepModal(null);
  };

  const handleRemoveComponent = (stepKey: string) => {
    setSelectedBuild(prev => ({ ...prev, [stepKey]: null }));
  };

  const handleClearAll = () => {
    setSelectedBuild({
      cpu: null,
      mainboard: null,
      ram: null,
      vga: null,
      storage: null,
      psu: null,
      case: null,
    });
  };

  // Filter products for active step based on compatibility
  const getFilteredProductsForStep = (category: HardwareProduct['category']) => {
    let list = INITIAL_PRODUCTS.filter(p => p.category === category);

    // Socket filter for Mainboard
    if (category === "MAINBOARD" && selectedBuild.cpu?.socket) {
      list = list.filter(p => !p.socket || p.socket === selectedBuild.cpu?.socket);
    }

    // Socket filter for CPU if Mainboard is selected first
    if (category === "CPU" && selectedBuild.mainboard?.socket) {
      list = list.filter(p => !p.socket || p.socket === selectedBuild.mainboard?.socket);
    }

    // RAM filter for Mainboard
    if (category === "RAM" && selectedBuild.mainboard?.ramType) {
      list = list.filter(p => !p.ramType || selectedBuild.mainboard?.ramType?.includes(p.ramType));
    }

    return list;
  };

  const formatVND = (num: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 flex flex-col antialiased tech-grid-pattern transition-colors duration-300">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* 1. HERO BANNER TITLE (LIGHT MODE DESIGN) */}
        <div className="relative rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm">
          <div className="absolute inset-0 bg-gradient-to-r from-sky-50 via-white to-blue-50/50 dark:from-slate-900 dark:via-[#071930] dark:to-slate-950 pointer-events-none" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#0284c7]/5 dark:bg-[#0284c7]/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-100 dark:bg-sky-500/20 text-[#0284c7] dark:text-sky-300 text-xs font-black uppercase tracking-wider border border-sky-200 dark:border-sky-500/30 shadow-2xs">
                <Wrench className="w-3.5 h-3.5 text-[#0284c7] dark:text-sky-400" />
                <span>CÔNG CỤ CẤU HÌNH PC THÔNG MINH (PC BUILDER)</span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-black text-slate-900 dark:text-white tracking-tight uppercase">
                Tự Tay Dựng Bộ PC Gaming & Workstation
              </h1>
              <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm max-w-2xl font-normal leading-relaxed">
                Hệ thống tự động kiểm tra tính tương thích giữa CPU (Socket LGA1700/AM5), Bo mạch chủ Mainboard, RAM DDR4/DDR5 và tính toán công suất nguồn PSU chuẩn xác 100%!
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-950/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 w-full md:w-auto min-w-[260px] text-right space-y-1 shadow-xs">
              <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-extrabold tracking-wider">Ước Tính Công Suất Nguồn</p>
              <p className="text-2xl font-black font-heading text-amber-600 dark:text-amber-400">{estimatedWattage} Watt</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Nguồn đề xuất: <span className="text-emerald-600 dark:text-emerald-400 font-black">{recommendedPsuWattage}W+</span>
              </p>
            </div>
          </div>
        </div>

        {/* 2. COMPATIBILITY ALERT BANNER */}
        {compatibilityAlerts.length > 0 && (
          <div className="bg-rose-50 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-700/60 rounded-2xl p-4 space-y-2 text-rose-900 dark:text-rose-200 text-sm shadow-xs">
            <div className="flex items-center gap-2 font-bold text-rose-700 dark:text-rose-400">
              <ShieldAlert className="w-5 h-5 text-rose-600 dark:text-rose-400" />
              <span className="font-heading uppercase tracking-wide text-xs">Cảnh Báo Xung Đột Tương Thích Linh Kiện:</span>
            </div>
            <ul className="list-disc list-inside space-y-1 pl-2 text-xs sm:text-sm font-medium text-rose-800 dark:text-rose-300">
              {compatibilityAlerts.map((alert, idx) => (
                <li key={idx}>{alert}</li>
              ))}
            </ul>
          </div>
        )}

        {/* 3. MAIN BUILDER GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Left Column: Component Selection Steps (2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between pb-1">
              <h2 className="text-sm font-heading font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#0284c7]" />
                <span>Danh Sách Linh Kiện Lựa Chọn</span>
              </h2>
              <button 
                onClick={handleClearAll}
                className="text-xs text-rose-600 dark:text-rose-400 hover:text-rose-700 flex items-center gap-1.5 font-bold transition-colors cursor-pointer bg-rose-50 dark:bg-rose-950/40 px-3 py-1.5 rounded-xl border border-rose-200 dark:border-rose-900"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Làm Mới Cấu Hình</span>
              </button>
            </div>

            {BUILD_STEPS.map((step) => {
              const IconComponent = step.icon;
              const selectedItem = selectedBuild[step.key];

              return (
                <div 
                  key={step.key} 
                  className={`rounded-2xl p-4.5 border transition-all ${
                    selectedItem 
                      ? 'bg-white dark:bg-slate-900 border-2 border-[#0284c7] dark:border-sky-500 shadow-sm' 
                      : 'bg-white dark:bg-slate-900/70 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-xs'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    
                    {/* Left Icon & Details */}
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
                        selectedItem 
                          ? 'bg-[#0284c7] text-white shadow-md shadow-sky-500/20' 
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                      }`}>
                        <IconComponent className="w-5 h-5" />
                      </div>
                      
                      <div className="min-w-0 flex-1">
                        <h3 className="text-xs sm:text-sm font-heading font-black uppercase text-slate-900 dark:text-white">
                          {step.name}
                        </h3>
                        {selectedItem ? (
                          <div className="mt-1 space-y-1">
                            <p className="text-xs font-bold text-[#0284c7] dark:text-sky-300 line-clamp-1">
                              {selectedItem.name}
                            </p>
                            <div className="flex flex-wrap items-center gap-2 text-[10.5px]">
                              <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-md font-semibold border border-slate-200 dark:border-slate-700">
                                BH: {selectedItem.warrantyMonths} Tháng
                              </span>
                              {selectedItem.socket && (
                                <span className="bg-sky-50 dark:bg-sky-950/80 text-sky-700 dark:text-sky-300 px-2 py-0.5 rounded-md font-bold border border-sky-200 dark:border-sky-800">
                                  Socket: {selectedItem.socket}
                                </span>
                              )}
                              {selectedItem.wattage && (
                                <span className="bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-md font-bold border border-amber-200 dark:border-amber-800">
                                  {selectedItem.wattage}W
                                </span>
                              )}
                            </div>
                          </div>
                        ) : (
                          <p className="text-xs text-slate-400 dark:text-slate-500 font-light mt-0.5">
                            Chưa chọn linh kiện nào
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Right Actions & Price */}
                    <div className="flex items-center justify-between sm:justify-end gap-3 border-t sm:border-t-0 border-slate-100 dark:border-slate-800/80 pt-3 sm:pt-0 shrink-0">
                      {selectedItem ? (
                        <>
                          <span className="text-sm sm:text-base font-heading font-black text-emerald-600 dark:text-emerald-400">
                            {formatVND(selectedItem.discountPrice || selectedItem.price)}
                          </span>
                          <button
                            onClick={() => handleRemoveComponent(step.key)}
                            className="p-2 rounded-xl text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 border border-rose-200 dark:border-rose-900 transition-colors cursor-pointer"
                            title="Xóa linh kiện này"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => setActiveStepModal(step.key)}
                          className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-heading font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Chọn {step.name.split(' ')[2] || 'Linh Kiện'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Build Summary & Checkout Card (1 col) */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sticky top-28 space-y-6 shadow-sm">
              <h2 className="text-xs font-heading font-black uppercase tracking-wider text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-3 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Tóm Tắt Cấu Hình PC</span>
              </h2>

              <div className="space-y-2.5 text-xs">
                {BUILD_STEPS.map((step) => {
                  const item = selectedBuild[step.key];
                  return (
                    <div key={step.key} className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-slate-800/80">
                      <span className="text-slate-500 dark:text-slate-400 font-medium">{step.name.split(' ')[1]}:</span>
                      {item ? (
                        <span className="font-bold text-slate-900 dark:text-slate-100 text-right line-clamp-1 max-w-[170px]" title={item.name}>
                          {item.name}
                        </span>
                      ) : (
                        <span className="text-slate-400 dark:text-slate-600 italic">Chưa chọn</span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Total Summary Box */}
              <div className="bg-slate-50 dark:bg-slate-950 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span>Ước tính công suất:</span>
                  <span className="font-bold text-amber-600 dark:text-amber-400">{estimatedWattage}W</span>
                </div>
                <div className="flex justify-between items-center text-sm pt-2 border-t border-slate-200 dark:border-slate-800">
                  <span className="font-bold text-slate-700 dark:text-slate-300">Tổng tiền:</span>
                  <span className="text-lg sm:text-xl font-heading font-black text-emerald-600 dark:text-emerald-400">
                    {formatVND(totalCost)}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Link
                  href={totalCost > 0 ? `/checkout?buildCost=${totalCost}` : '#'}
                  className={`w-full py-3.5 rounded-2xl font-heading font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                    totalCost > 0 
                      ? 'uiverse-btn-shimmer text-white shadow-lg active:scale-95 cursor-pointer' 
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>Mua Toàn Bộ Cấu Hình Này</span>
                </Link>

                <button
                  onClick={() => window.print()}
                  disabled={totalCost === 0}
                  className="w-full py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 text-slate-700 dark:text-slate-200 text-xs font-heading font-bold uppercase flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                >
                  <Printer className="w-4 h-4 text-[#0284c7] dark:text-cyan-400" />
                  <span>In Bản Báo Giá PDF</span>
                </button>
              </div>

              <div className="text-[11px] text-slate-500 dark:text-slate-400 text-center space-y-1 pt-1">
                <p>✅ Miễn phí lắp ráp & cài đặt Windows / Game</p>
                <p>🛡️ Bảo hành 1 đổi 1 tận nơi trong 30 ngày đầu</p>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* 4. MODAL SELECTION COMPONENT (CLEAN LIGHT THEME) */}
      {activeStepModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950">
              <div>
                <h3 className="text-sm font-heading font-black uppercase text-slate-900 dark:text-white">
                  Chọn Linh Kiện: {BUILD_STEPS.find(s => s.key === activeStepModal)?.name}
                </h3>
                {selectedBuild.cpu && activeStepModal === 'mainboard' && (
                  <p className="text-xs text-[#0284c7] dark:text-sky-400 font-medium mt-0.5">
                    💡 Đã lọc Mainboard có Socket {selectedBuild.cpu.socket} khớp với CPU {selectedBuild.cpu.brand}!
                  </p>
                )}
              </div>
              <button 
                onClick={() => setActiveStepModal(null)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Product List */}
            <div className="p-5 overflow-y-auto flex-1 space-y-3">
              {getFilteredProductsForStep(BUILD_STEPS.find(s => s.key === activeStepModal)!.category).map((product) => (
                <div 
                  key={product.id}
                  className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-[#0284c7] dark:hover:border-sky-500 transition-all shadow-2xs"
                >
                  <div className="flex items-center gap-4">
                    <img 
                      src={product.coverImage} 
                      alt={product.name} 
                      className="w-16 h-16 rounded-xl object-cover bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
                    />
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">{product.name}</h4>
                      <div className="flex flex-wrap gap-2 mt-1.5 text-[11px]">
                        <span className="bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-md font-semibold border border-slate-200 dark:border-slate-800">Hãng: {product.brand}</span>
                        <span className="bg-white dark:bg-slate-900 text-[#0284c7] dark:text-sky-300 px-2 py-0.5 rounded-md font-semibold border border-slate-200 dark:border-slate-800">BH: {product.warrantyMonths} Tháng</span>
                        {product.socket && <span className="bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300 px-2 py-0.5 rounded-md font-bold border border-sky-200 dark:border-sky-800">Socket: {product.socket}</span>}
                        {product.wattage && <span className="bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded-md font-bold border border-amber-200 dark:border-amber-800">{product.wattage}W</span>}
                      </div>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 border-t sm:border-t-0 border-slate-200 dark:border-slate-900 pt-2 sm:pt-0 shrink-0">
                    <span className="text-sm sm:text-base font-heading font-black text-emerald-600 dark:text-emerald-400">
                      {formatVND(product.discountPrice || product.price)}
                    </span>
                    <button
                      onClick={() => handleSelectComponent(activeStepModal, product)}
                      className="px-4 py-2 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-heading font-black uppercase tracking-wider shadow-xs cursor-pointer active:scale-95 transition-all"
                    >
                      Chọn Sản Phẩm
                    </button>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
