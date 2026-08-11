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
  Fan,
  CheckCircle2, 
  AlertTriangle, 
  Trash2, 
  Printer, 
  ShoppingCart, 
  Plus, 
  Wrench,
  ShieldAlert
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
        alerts.push(`⚠️ Không tương thích Socket: CPU (${cpu.socket}) không lắp vừa Mainboard (${mainboard.socket}).`);
      }
    }

    // Check RAM & Mainboard type match
    if (mainboard && ram) {
      if (mainboard.ramType && ram.ramType && !mainboard.ramType.includes(ram.ramType)) {
        alerts.push(`⚠️ Không tương thích RAM: Mainboard yêu cầu ${mainboard.ramType} nhưng RAM được chọn là ${ram.ramType}.`);
      }
    }

    // Check PSU Wattage sufficiency
    if (psu && psu.wattage) {
      if (psu.wattage < estimatedWattage) {
        alerts.push(`⚠️ Nguồn quá yếu: Công suất PSU (${psu.wattage}W) nhỏ hơn công suất tiêu thụ ước tính của bộ PC (${estimatedWattage}W). Chi tiết đề xuất: nên chọn PSU từ ${recommendedPsuWattage}W trở lên.`);
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Banner Title */}
        <div className="bg-gradient-to-r from-blue-900/60 via-slate-900 to-indigo-900/60 border border-blue-500/30 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-2xl">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold uppercase tracking-wider mb-2">
              <Wrench className="w-4 h-4 text-blue-400" />
              Công Cụ Dựng Cấu Hình PC Thông Minh (PC Builder)
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Tự Tay Dựng Bộ PC Gaming & Workstation
            </h1>
            <p className="text-slate-300 text-sm mt-2 max-w-2xl">
              Hệ thống tự động kiểm tra tính tương thích giữa CPU (Socket LGA1700/AM5), Mainboard, RAM DDR4/DDR5 và tính toán công suất nguồn PSU chuẩn xác!
            </p>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 w-full md:w-auto min-w-[260px] text-right space-y-1">
            <p className="text-xs text-slate-400 uppercase font-semibold">Ước tính công suất nguồn</p>
            <p className="text-xl font-black text-amber-400">{estimatedWattage} Watt</p>
            <p className="text-[11px] text-slate-400">Nguồn đề xuất: <span className="text-emerald-400 font-bold">{recommendedPsuWattage}W</span></p>
          </div>
        </div>

        {/* Compatibility Alert Banner */}
        {compatibilityAlerts.length > 0 && (
          <div className="bg-rose-950/80 border border-rose-600/60 rounded-xl p-4 space-y-2 text-rose-200 text-sm">
            <div className="flex items-center gap-2 font-bold text-rose-400">
              <ShieldAlert className="w-5 h-5" />
              <span>Cảnh báo xung đột tương thích linh kiện:</span>
            </div>
            <ul className="list-disc list-inside space-y-1 pl-2 text-xs sm:text-sm">
              {compatibilityAlerts.map((alert, idx) => (
                <li key={idx}>{alert}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Main Builder Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Component Selection Steps (2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">Danh Sách Linh Kiện Lựa Chọn</h2>
              <button 
                onClick={handleClearAll}
                className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1.5 font-semibold transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>Làm mới cấu hình</span>
              </button>
            </div>

            {BUILD_STEPS.map((step) => {
              const IconComponent = step.icon;
              const selectedItem = selectedBuild[step.key];

              return (
                <div 
                  key={step.key} 
                  className={`border rounded-xl p-4 transition-all ${
                    selectedItem 
                      ? 'bg-slate-900/90 border-blue-500/50 shadow-md shadow-blue-500/5' 
                      : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${selectedItem ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white">{step.name}</h3>
                        {selectedItem ? (
                          <div className="mt-1">
                            <p className="text-xs font-semibold text-blue-300 line-clamp-1">{selectedItem.name}</p>
                            <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-400">
                              <span>Bảo hành: {selectedItem.warrantyMonths}T</span>
                              {selectedItem.socket && <span className="bg-slate-800 px-1.5 py-0.5 rounded text-cyan-300">Socket: {selectedItem.socket}</span>}
                              {selectedItem.wattage && <span className="bg-slate-800 px-1.5 py-0.5 rounded text-amber-300">{selectedItem.wattage}W</span>}
                            </div>
                          </div>
                        ) : (
                          <p className="text-xs text-slate-500">Chưa chọn linh kiện nào</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 border-t sm:border-t-0 border-slate-800 pt-2 sm:pt-0">
                      {selectedItem ? (
                        <>
                          <span className="text-sm font-bold text-emerald-400">
                            {formatVND(selectedItem.discountPrice || selectedItem.price)}
                          </span>
                          <button
                            onClick={() => handleRemoveComponent(step.key)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                            title="Xóa linh kiện này"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => setActiveStepModal(step.key)}
                          className="w-full sm:w-auto px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md shadow-blue-600/20"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Chọn {step.name.split(' ')[2] || 'linh kiện'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Build Summary & Checkout Card */}
          <div className="lg:col-span-1">
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sticky top-28 space-y-6 shadow-2xl">
              <h2 className="text-base font-bold text-white border-b border-slate-800 pb-3 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span>Tóm Tắt Cấu Hình PC</span>
              </h2>

              <div className="space-y-3 text-xs">
                {BUILD_STEPS.map((step) => {
                  const item = selectedBuild[step.key];
                  return (
                    <div key={step.key} className="flex justify-between items-center py-1 border-b border-slate-800/40">
                      <span className="text-slate-400">{step.name.split(' ')[1]}:</span>
                      {item ? (
                        <span className="font-semibold text-slate-200 text-right line-clamp-1 max-w-[170px]" title={item.name}>
                          {item.name}
                        </span>
                      ) : (
                        <span className="text-slate-600 italic">Chưa chọn</span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Total Summary */}
              <div className="bg-slate-950 rounded-xl p-4 border border-slate-800/80 space-y-2">
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Ước tính công suất:</span>
                  <span className="font-bold text-amber-400">{estimatedWattage}W</span>
                </div>
                <div className="flex justify-between text-sm pt-1 border-t border-slate-800">
                  <span className="font-bold text-slate-300">Tổng tiền cấu hình:</span>
                  <span className="text-xl font-black text-emerald-400">{formatVND(totalCost)}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Link
                  href={totalCost > 0 ? `/checkout?buildCost=${totalCost}` : '#'}
                  className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                    totalCost > 0 
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-500/25' 
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>Mua Toàn Bộ Cấu Hình Này</span>
                </Link>

                <button
                  onClick={() => window.print()}
                  disabled={totalCost === 0}
                  className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 border border-slate-700 transition-colors"
                >
                  <Printer className="w-4 h-4 text-cyan-400" />
                  <span>In Bản Báo Giá PDF</span>
                </button>
              </div>

              <div className="text-[11px] text-slate-500 text-center space-y-1">
                <p>✅ Miễn phí lắp ráp & cài đặt Windows / Game</p>
                <p>🛡️ Bảo hành 1 đổi 1 tận nơi trong 30 ngày đầu</p>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* Modal Selection Component */}
      {activeStepModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-950">
              <div>
                <h3 className="text-base font-bold text-white">
                  Chọn Linh Kiện: {BUILD_STEPS.find(s => s.key === activeStepModal)?.name}
                </h3>
                {selectedBuild.cpu && activeStepModal === 'mainboard' && (
                  <p className="text-xs text-blue-400 mt-0.5">
                    💡 Đã lọc Mainboard có Socket {selectedBuild.cpu.socket} khớp với CPU {selectedBuild.cpu.brand}!
                  </p>
                )}
              </div>
              <button 
                onClick={() => setActiveStepModal(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <div className="p-5 overflow-y-auto flex-1 space-y-3">
              {getFilteredProductsForStep(BUILD_STEPS.find(s => s.key === activeStepModal)!.category).map((product) => (
                <div 
                  key={product.id}
                  className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-blue-500/60 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <img 
                      src={product.coverImage} 
                      alt={product.name} 
                      className="w-16 h-16 rounded-lg object-cover bg-slate-900"
                    />
                    <div>
                      <h4 className="text-sm font-bold text-white">{product.name}</h4>
                      <div className="flex flex-wrap gap-2 mt-1 text-[11px] text-slate-400">
                        <span className="bg-slate-900 px-2 py-0.5 rounded text-slate-300 font-medium">Hãng: {product.brand}</span>
                        <span className="bg-slate-900 px-2 py-0.5 rounded text-blue-300 font-medium">BH: {product.warrantyMonths} Tháng</span>
                        {product.socket && <span className="bg-cyan-950 text-cyan-300 px-2 py-0.5 rounded font-semibold">Socket: {product.socket}</span>}
                        {product.wattage && <span className="bg-amber-950 text-amber-300 px-2 py-0.5 rounded font-semibold">{product.wattage}W</span>}
                      </div>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 border-t sm:border-t-0 border-slate-900 pt-2 sm:pt-0">
                    <span className="text-base font-black text-emerald-400">
                      {formatVND(product.discountPrice || product.price)}
                    </span>
                    <button
                      onClick={() => handleSelectComponent(activeStepModal, product)}
                      className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors"
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
