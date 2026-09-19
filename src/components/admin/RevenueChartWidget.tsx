'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, 
  BarChart3, 
  LineChart, 
  Sparkles, 
  Calendar, 
  ShoppingBag, 
  DollarSign, 
  Award, 
  Activity,
  ChevronLeft,
  ChevronRight,
  RotateCcw
} from 'lucide-react';

export interface DayData {
  day: string;
  date: string;
  fullDate?: string;
  revenue: number;
  orders: number;
}

interface RevenueChartWidgetProps {
  orders?: any[];
  data?: DayData[];
  formatVND: (val: number | string | null | undefined) => string;
}

export const RevenueChartWidget: React.FC<RevenueChartWidgetProps> = ({ 
  orders = [],
  data = [], 
  formatVND 
}) => {
  const [chartMode, setChartMode] = useState<'bar' | 'area'>('bar');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const getVnDateStr = (date: Date | string) => {
    try {
      const d = typeof date === 'string' ? new Date(date) : date;
      return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' }).format(d);
    } catch (e) {
      return new Date(date).toISOString().split('T')[0];
    }
  };

  const getTodayVn = () => getVnDateStr(new Date());

  // Default week: 7 days ending today (or ending on latest order if orders exist)
  const defaultDates = useMemo(() => {
    const today = new Date();
    const end = today;
    const start = new Date(end.getTime() - 6 * 24 * 60 * 60 * 1000);
    return {
      start: getVnDateStr(start),
      end: getVnDateStr(end),
    };
  }, []);

  const [startDate, setStartDate] = useState<string>(defaultDates.start);
  const [endDate, setEndDate] = useState<string>(defaultDates.end);

  // Quick navigation: Previous week, Next week, Current week
  const handleShiftWeek = (daysOffset: number) => {
    try {
      const curStart = new Date(startDate + 'T00:00:00');
      const newStart = new Date(curStart.getTime() + daysOffset * 24 * 60 * 60 * 1000);
      const newEnd = new Date(newStart.getTime() + 6 * 24 * 60 * 60 * 1000);
      setStartDate(getVnDateStr(newStart));
      setEndDate(getVnDateStr(newEnd));
      setHoveredIndex(null);
    } catch (e) {}
  };

  const handleResetCurrentWeek = () => {
    setStartDate(defaultDates.start);
    setEndDate(defaultDates.end);
    setHoveredIndex(null);
  };

  const handleStartDateChange = (newStartStr: string) => {
    if (!newStartStr) return;
    setStartDate(newStartStr);
    try {
      const s = new Date(newStartStr + 'T00:00:00');
      const e = new Date(s.getTime() + 6 * 24 * 60 * 60 * 1000);
      setEndDate(getVnDateStr(e));
      setHoveredIndex(null);
    } catch (err) {}
  };

  const handleEndDateChange = (newEndStr: string) => {
    if (!newEndStr) return;
    setEndDate(newEndStr);
    try {
      const e = new Date(newEndStr + 'T00:00:00');
      const s = new Date(e.getTime() - 6 * 24 * 60 * 60 * 1000);
      setStartDate(getVnDateStr(s));
      setHoveredIndex(null);
    } catch (err) {}
  };

  // Jump to latest week with orders if current week has 0 orders
  const handleJumpToLatestOrders = () => {
    if (!orders || orders.length === 0) return;
    const sorted = [...orders].filter(o => o.createdAt).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    if (sorted.length > 0) {
      const latestDate = new Date(sorted[0].createdAt);
      const start = new Date(latestDate.getTime() - 6 * 24 * 60 * 60 * 1000);
      setStartDate(getVnDateStr(start));
      setEndDate(getVnDateStr(latestDate));
      setHoveredIndex(null);
    }
  };

  const dayNames = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];

  // Aggregate Chart Data strictly for the selected 7-day week
  const chartData: DayData[] = useMemo(() => {
    if (orders && Array.isArray(orders)) {
      try {
        const start = new Date(startDate + 'T00:00:00');
        const end = new Date(endDate + 'T00:00:00');
        const daysDiff = Math.round((end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000)) + 1;
        const totalDays = Math.max(1, Math.min(daysDiff, 14));

        const list: DayData[] = [];
        for (let i = 0; i < totalDays; i++) {
          const d = new Date(start.getTime() + i * 24 * 60 * 60 * 1000);
          const dateStr = getVnDateStr(d);
          const dayName = dayNames[d.getDay()];
          const fullDate = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;

          let rev = 0;
          let count = 0;

          orders.forEach((o) => {
            if (!o.createdAt) return;
            const orderDateStr = getVnDateStr(o.createdAt);
            if (orderDateStr === dateStr && o.status !== 'CANCELLED') {
              count++;
              if (o.status === 'COMPLETED' || o.paymentStatus === 'PAID') {
                rev += Number(o.netAmount || o.totalAmount || 0);
              }
            }
          });

          list.push({
            day: dayName,
            date: dateStr,
            fullDate: fullDate,
            revenue: rev,
            orders: count,
          });
        }
        if (list.length > 0) return list;
      } catch (e) {
        console.error('Lỗi tổng hợp dữ liệu tuần:', e);
      }
    }

    if (data && data.length > 0) return data;

    const days = ['Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy', 'Chủ Nhật'];
    return days.map((d, i) => ({
      day: d,
      date: `2026-09-0${i + 1}`,
      fullDate: `0${i + 1}/09/2026`,
      revenue: 0,
      orders: 0,
    }));
  }, [orders, data, startDate, endDate]);

  // Aggregate Calculations
  const totalRevenue = useMemo(() => {
    return chartData.reduce((sum, d) => sum + (d.revenue || 0), 0);
  }, [chartData]);

  const totalOrders = useMemo(() => {
    return chartData.reduce((sum, d) => sum + (d.orders || 0), 0);
  }, [chartData]);

  const rawMaxRevenue = useMemo(() => {
    return Math.max(...chartData.map(d => d.revenue || 0), 0);
  }, [chartData]);

  // Y-axis with 35% headroom to guarantee the highest bar never crowds the top tooltip
  const yAxisConfig = useMemo(() => {
    if (rawMaxRevenue <= 0) {
      return {
        chartMax: 10000000,
        ticks: [10000000, 6000000, 3000000, 0],
      };
    }

    const targetMax = rawMaxRevenue * 1.35;
    const intervals = 3;
    const rawStep = targetMax / intervals;
    const mag = Math.pow(10, Math.floor(Math.log10(rawStep)));
    const ratio = rawStep / mag;

    let niceStep = mag;
    if (ratio <= 1.2) niceStep = 1 * mag;
    else if (ratio <= 2.5) niceStep = 2 * mag;
    else if (ratio <= 6) niceStep = 5 * mag;
    else niceStep = 10 * mag;

    if (niceStep >= 1000000) {
      niceStep = Math.ceil(niceStep / 1000000) * 1000000;
    } else if (niceStep >= 100000) {
      niceStep = Math.ceil(niceStep / 100000) * 100000;
    }

    const ceiling = niceStep * intervals;
    const ticks: number[] = [];
    for (let i = intervals; i >= 0; i--) {
      ticks.push(i * niceStep);
    }

    return { chartMax: ceiling, ticks };
  }, [rawMaxRevenue]);

  const avgRevenue = useMemo(() => {
    return Math.round(totalRevenue / Math.max(chartData.length, 1));
  }, [totalRevenue, chartData.length]);

  const peakIndex = useMemo(() => {
    let peakIdx = -1;
    let maxVal = 0;
    chartData.forEach((d, idx) => {
      if ((d.revenue || 0) > maxVal) {
        maxVal = d.revenue || 0;
        peakIdx = idx;
      }
    });
    return peakIdx;
  }, [chartData]);

  // Compact currency formatter for Y-axis (Tr, Tỷ, K)
  const formatCompactVND = (num: number) => {
    if (num >= 1000000000) {
      return (num / 1000000000).toFixed(1).replace('.0', '') + ' Tỷ';
    }
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1).replace('.0', '') + ' Tr';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(0) + ' K';
    }
    return num === 0 ? '0 đ' : `${num} đ`;
  };

  // SVG Area Path generator
  const svgPathData = useMemo(() => {
    if (chartData.length === 0) return { line: '', area: '', points: [] };
    const width = 700;
    const height = 240;
    const paddingX = 45;
    const paddingTop = 50; // Top clearance for peak badge and lines
    const paddingBottom = 20;
    const usableW = width - paddingX * 2;
    const usableH = height - paddingTop - paddingBottom;
    const stepX = chartData.length > 1 ? usableW / (chartData.length - 1) : usableW;

    const points = chartData.map((d, i) => {
      const x = paddingX + i * stepX;
      const ratio = yAxisConfig.chartMax > 0 ? (d.revenue || 0) / yAxisConfig.chartMax : 0;
      const y = height - paddingBottom - ratio * usableH;
      return { x, y, d, index: i };
    });

    if (points.length === 1) {
      return { line: `M ${points[0].x} ${points[0].y}`, area: '', points };
    }

    let lineD = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = i > 0 ? points[i - 1] : points[i];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = i !== points.length - 2 ? points[i + 2] : p2;

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      lineD += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }

    const areaD = `${lineD} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`;

    return { line: lineD, area: areaD, points };
  }, [chartData, yAxisConfig.chartMax]);

  const formatDateDisplay = (dateStr: string) => {
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
      return dateStr;
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-4 sm:p-7 space-y-6 shadow-xs relative transition-all">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-sky-500/5 dark:bg-sky-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

      {/* 1. HEADER SECTION & WEEK DATE RANGE CONTROLS */}
      <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800/80 pb-5">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#0284c7] to-[#38bdf8] flex items-center justify-center text-white shadow-md shadow-sky-500/25 shrink-0">
              <TrendingUp className="w-4 h-4" />
            </div>
            <h3 className="font-heading text-sm sm:text-base font-black uppercase text-slate-900 dark:text-white tracking-wide">
              DOANH THU THEO TUẦN
            </h3>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 shadow-xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              REAL-TIME SUPABASE
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-normal flex flex-wrap items-center gap-1.5">
            <span>Khoảng ngày đang xem:</span>
            <span className="font-bold text-[#0284c7] dark:text-sky-400 bg-sky-50 dark:bg-sky-950/60 px-2 py-0.5 rounded-md border border-sky-200 dark:border-sky-800/60">
              {formatDateDisplay(startDate)} ➔ {formatDateDisplay(endDate)}
            </span>
          </p>
        </div>

        {/* Date Selector & Chart Mode Switcher */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Quick Week Shift Buttons */}
          <div className="inline-flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 text-xs">
            <button
              type="button"
              onClick={() => handleShiftWeek(-7)}
              title="Lùi 1 tuần trước"
              className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 hover:text-sky-600 transition-all cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleResetCurrentWeek}
              className="px-2.5 py-1 rounded-lg font-bold text-[11px] text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-700 transition-all cursor-pointer"
            >
              Tuần Này
            </button>
            <button
              type="button"
              onClick={() => handleShiftWeek(7)}
              title="Tiến 1 tuần sau"
              className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 hover:text-sky-600 transition-all cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Direct Date Picker: Từ ngày -> Đến ngày */}
          <div className="flex items-center gap-1.5 p-1 px-2 rounded-xl bg-slate-100 dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 text-xs">
            <div className="flex items-center gap-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Từ:</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => handleStartDateChange(e.target.value)}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-[11px] font-mono text-slate-800 dark:text-slate-200 font-semibold focus:outline-none focus:border-sky-500 cursor-pointer"
              />
            </div>
            <span className="text-slate-400 font-bold">-</span>
            <div className="flex items-center gap-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Đến:</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => handleEndDateChange(e.target.value)}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-[11px] font-mono text-slate-800 dark:text-slate-200 font-semibold focus:outline-none focus:border-sky-500 cursor-pointer"
              />
            </div>
          </div>

          {/* Quick Jump to Latest Orders Button if current range is empty */}
          {totalRevenue === 0 && orders && orders.length > 0 && (
            <button
              type="button"
              onClick={handleJumpToLatestOrders}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 text-[11px] font-bold hover:bg-amber-100 transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Xem tuần có đơn gần nhất</span>
            </button>
          )}

          {/* Chart Style Switcher: Cột / Sóng */}
          <div className="inline-flex p-1 rounded-xl bg-slate-100 dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 text-xs">
            <button
              type="button"
              onClick={() => setChartMode('bar')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                chartMode === 'bar'
                  ? 'bg-white dark:bg-slate-700 text-sky-600 dark:text-sky-300 shadow-xs font-black'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Cột Neon</span>
            </button>
            <button
              type="button"
              onClick={() => setChartMode('area')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                chartMode === 'area'
                  ? 'bg-white dark:bg-slate-700 text-sky-600 dark:text-sky-300 shadow-xs font-black'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <LineChart className="w-3.5 h-3.5" />
              <span>Sóng Area</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. EXECUTIVE METRIC KPI STRIP */}
      <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
        <div className="p-3.5 rounded-2xl bg-slate-50/90 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 flex flex-col justify-between">
          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <DollarSign className="w-3 h-3 text-sky-500 shrink-0" /> Tổng Doanh Thu Tuần
          </span>
          <span className="text-sm sm:text-lg font-black text-slate-900 dark:text-white font-heading mt-1 truncate">
            {formatVND(totalRevenue)}
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-50/90 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 flex flex-col justify-between">
          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <Activity className="w-3 h-3 text-emerald-500 shrink-0" /> Trung Bình / Ngày
          </span>
          <span className="text-sm sm:text-lg font-black text-emerald-600 dark:text-emerald-400 font-heading mt-1 truncate">
            {formatVND(avgRevenue)}
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-50/90 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 flex flex-col justify-between">
          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <Award className="w-3 h-3 text-amber-500 shrink-0" /> Đỉnh Tuần
          </span>
          <span className="text-sm sm:text-lg font-black text-amber-600 dark:text-amber-400 font-heading mt-1 truncate">
            {peakIndex !== -1 ? formatVND(chartData[peakIndex].revenue) : '0 đ'}
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-50/90 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 flex flex-col justify-between">
          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <ShoppingBag className="w-3 h-3 text-purple-500 shrink-0" /> Tổng Đơn Hàng
          </span>
          <span className="text-sm sm:text-lg font-black text-purple-600 dark:text-purple-400 font-heading mt-1 truncate">
            {totalOrders} Đơn Hàng
          </span>
        </div>
      </div>

      {/* 3. INTERACTIVE HUD STATUS BAR (When hovering any column) */}
      <div className="relative z-10 min-h-[32px] flex items-center justify-between border-y border-slate-100 dark:border-slate-800/70 py-1.5 px-3 rounded-xl bg-slate-50/50 dark:bg-slate-850/50">
        <div className="flex items-center gap-2 text-xs">
          <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse" />
          <span className="text-slate-500 dark:text-slate-400 font-medium">Chi tiết ngày đang chọn:</span>
          {hoveredIndex !== null && chartData[hoveredIndex] ? (
            <span className="font-black text-slate-900 dark:text-white flex items-center gap-2">
              <span className="text-[#0284c7]">{chartData[hoveredIndex].day} ({chartData[hoveredIndex].fullDate})</span>
              <span className="text-slate-300">•</span>
              <span className="text-emerald-600 dark:text-emerald-400">{formatVND(chartData[hoveredIndex].revenue)}</span>
              <span className="text-slate-300">•</span>
              <span className="text-purple-600 dark:text-purple-400">{chartData[hoveredIndex].orders} đơn</span>
              {hoveredIndex === peakIndex && chartData[hoveredIndex].revenue > 0 && (
                <span className="bg-amber-400/20 text-amber-600 dark:text-amber-400 px-1.5 py-0.5 rounded-md text-[10px] font-extrabold border border-amber-300 dark:border-amber-700">
                  👑 Đỉnh Doanh Thu
                </span>
              )}
            </span>
          ) : (
            <span className="text-slate-400 italic text-[11px]">Rê chuột hoặc chạm vào cột để xem chi tiết từng ngày</span>
          )}
        </div>
        {hoveredIndex !== null && chartData[hoveredIndex] && totalRevenue > 0 && (
          <span className="text-[11px] font-bold text-sky-600 dark:text-sky-400 hidden sm:inline">
            Chiếm {Math.round((chartData[hoveredIndex].revenue / totalRevenue) * 100)}% tổng doanh thu tuần
          </span>
        )}
      </div>

      {/* 4. CHART CANVAS CONTAINER (NO OVERFLOW-X CUTTING OFF TOOLTIP) */}
      <div className="relative z-10 pt-2">
        {/* Main Chart Row: Y-Axis Labels (Left) + Plot Area with Gridlines & Bars (Right) */}
        <div className="flex items-stretch gap-3">
          
          {/* Y-Axis Tick Labels Column (Exact Match to Plot Area Height) */}
          <div className="w-16 sm:w-24 h-64 flex flex-col justify-between text-right shrink-0 pr-1 select-none pointer-events-none">
            {yAxisConfig.ticks.map((tickVal, idx) => {
              const isBase = idx === yAxisConfig.ticks.length - 1;
              return (
                <div key={idx} className="flex items-center justify-end h-0">
                  <span className={`font-mono transition-colors -translate-y-1/2 ${
                    isBase 
                      ? 'text-slate-600 dark:text-slate-300 font-black text-[10px] sm:text-[11px]' 
                      : 'text-slate-400 dark:text-slate-500 font-semibold text-[9px] sm:text-[10px]'
                  }`}>
                    {formatCompactVND(tickVal)}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Plot Visualization Area (Height 256px, Shared Baseline) */}
          <div className="flex-1 h-64 relative">
            
            {/* Horizontal Gridlines (Exact Alignment to Y-Axis Ticks) */}
            <div className="absolute inset-0 pointer-events-none flex flex-col justify-between">
              {yAxisConfig.ticks.map((_, idx) => {
                const isBase = idx === yAxisConfig.ticks.length - 1;
                return (
                  <div key={idx} className="w-full flex items-center h-0">
                    <div className={`w-full ${
                      isBase 
                        ? 'border-b-2 border-slate-300 dark:border-slate-700' 
                        : 'border-b border-dashed border-slate-200 dark:border-slate-800'
                    }`} />
                  </div>
                );
              })}
            </div>

            {/* MODE 1: BAR CHART */}
            {chartMode === 'bar' && (
              <div className="absolute inset-0 flex items-end justify-between gap-2 sm:gap-4 z-10">
                {chartData.map((item, idx) => {
                  const heightPercent = yAxisConfig.chartMax > 0 
                    ? Math.min(100, Math.max(0, ((item.revenue || 0) / yAxisConfig.chartMax) * 100)) 
                    : 0;
                  const isHovered = hoveredIndex === idx;
                  const isPeak = idx === peakIndex && item.revenue > 0;
                  const percentOfTotal = totalRevenue > 0 ? Math.round(((item.revenue || 0) / totalRevenue) * 100) : 0;

                  return (
                    <div
                      key={idx}
                      onMouseEnter={() => setHoveredIndex(idx)}
                      onMouseLeave={() => setHoveredIndex(null)}
                      className="flex-1 h-full flex flex-col items-center justify-end group cursor-pointer relative"
                    >
                      {/* Floating Rich Tooltip (Anchored inside the safe 35% headroom at top: 8px so it NEVER gets clipped) */}
                      <AnimatePresence>
                        {isHovered && (
                          <motion.div
                            initial={{ opacity: 0, y: 4, scale: 0.96 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 2, scale: 0.96 }}
                            transition={{ duration: 0.12 }}
                            className={`absolute top-2 z-40 bg-slate-900/95 dark:bg-slate-950/95 text-white p-3 rounded-2xl border border-slate-700/80 shadow-2xl backdrop-blur-md pointer-events-none whitespace-nowrap text-left min-w-[160px] ${
                              idx >= chartData.length - 2 
                                ? 'right-0' 
                                : idx <= 1 
                                  ? 'left-0' 
                                  : 'left-1/2 -translate-x-1/2'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2 text-[10.5px] text-slate-400 border-b border-slate-800 pb-1.5 mb-1.5">
                              <span className="font-bold flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5 text-sky-400" />
                                {item.day} ({item.fullDate})
                              </span>
                              {isPeak && item.revenue > 0 && (
                                <span className="text-amber-300 font-black text-[9px] bg-amber-400/25 px-1.5 py-0.2 rounded-full border border-amber-400/30">
                                  👑 ĐỈNH
                                </span>
                              )}
                            </div>
                            <p className="text-sm font-black text-sky-300 font-heading">
                              {formatVND(item.revenue)}
                            </p>
                            <div className="flex items-center justify-between text-[10px] text-slate-300 mt-1">
                              <span className="font-semibold">{item.orders} đơn hàng</span>
                              <span className="text-emerald-400 font-bold">
                                {item.revenue > 0 ? `${percentOfTotal}% tổng tuần` : '0% tổng'}
                              </span>
                            </div>
                            {/* Downward pointing triangle caret */}
                            <div className={`absolute -bottom-1.5 w-3 h-3 bg-slate-900 rotate-45 border-r border-b border-slate-700/80 ${
                              idx >= chartData.length - 2 ? 'right-6' : idx <= 1 ? 'left-6' : 'left-1/2 -translate-x-1/2'
                            }`} />
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Bar Pillar Sizing */}
                      <div className="w-full h-full flex items-end justify-center">
                        <div className={`w-full max-w-[46px] sm:max-w-[58px] h-full flex items-end justify-center rounded-2xl p-1 transition-all ${
                          item.revenue > 0 
                            ? 'bg-slate-100/60 dark:bg-slate-800/30 border border-slate-200/60 dark:border-slate-800/60 group-hover:border-sky-400/70 group-hover:bg-sky-50/40 dark:group-hover:bg-sky-950/20' 
                            : 'bg-slate-50/50 dark:bg-slate-800/20 border border-dashed border-slate-200/60 dark:border-slate-800/60'
                        }`}>
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: `${item.revenue > 0 ? Math.max(heightPercent, 5) : 3}%` }}
                            transition={{ type: 'spring', damping: 20, stiffness: 120, delay: idx * 0.03 }}
                            className={`w-full rounded-xl transition-all relative flex flex-col justify-between ${
                              item.revenue > 0
                                ? isPeak
                                  ? 'bg-gradient-to-t from-[#0284c7] via-[#0ea5e9] to-[#38bdf8] shadow-lg shadow-sky-500/35 border-t border-cyan-200'
                                  : 'bg-gradient-to-t from-[#0369a1] via-[#0284c7] to-[#38bdf8] group-hover:from-[#0284c7] group-hover:to-[#67e8f9] shadow-sm'
                                : 'bg-slate-200/70 dark:bg-slate-700/50'
                            }`}
                          >
                            {/* Glowing Neon Top Cap */}
                            {item.revenue > 0 && (
                              <div className="w-full h-1.5 rounded-t-xl bg-cyan-100 shadow-[0_0_10px_rgba(103,232,249,0.9)]" />
                            )}

                            {/* Crown Sparkle Icon on Peak Day (stays below the 35% headroom, never clipped) */}
                            {isPeak && item.revenue > 0 && (
                              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 w-5.5 h-5.5 rounded-full bg-gradient-to-br from-amber-300 to-amber-500 text-slate-950 flex items-center justify-center shadow-md shadow-amber-400/50 border border-amber-200 z-20">
                                <Sparkles className="w-3 h-3 fill-slate-950" />
                              </div>
                            )}
                          </motion.div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* MODE 2: AREA SPLINE WAVE CHART */}
            {chartMode === 'area' && (
              <div className="absolute inset-0 z-10">
                <svg
                  viewBox="0 0 700 240"
                  className="w-full h-full overflow-visible"
                  preserveAspectRatio="none"
                >
                  <defs>
                    <linearGradient id="revenue-area-gradient-v4" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0284c7" stopOpacity="0.45" />
                      <stop offset="60%" stopColor="#38bdf8" stopOpacity="0.15" />
                      <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.0" />
                    </linearGradient>
                    <linearGradient id="revenue-line-gradient-v4" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#0284c7" />
                      <stop offset="50%" stopColor="#38bdf8" />
                      <stop offset="100%" stopColor="#67e8f9" />
                    </linearGradient>
                    <filter id="glow-v4" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="3" result="blur" />
                      <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                  </defs>

                  {/* Area Fill */}
                  {svgPathData.area && (
                    <motion.path
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.6 }}
                      d={svgPathData.area}
                      fill="url(#revenue-area-gradient-v4)"
                    />
                  )}

                  {/* Line Stroke */}
                  <motion.path
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    d={svgPathData.line}
                    fill="none"
                    stroke="url(#revenue-line-gradient-v4)"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    filter="url(#glow-v4)"
                  />

                  {/* Data Points */}
                  {svgPathData.points.map((pt, idx) => {
                    const isHovered = hoveredIndex === idx;
                    const isPeak = idx === peakIndex && pt.d.revenue > 0;

                    return (
                      <g
                        key={idx}
                        className="cursor-pointer"
                        onMouseEnter={() => setHoveredIndex(idx)}
                        onMouseLeave={() => setHoveredIndex(null)}
                      >
                        {/* Hover vertical dash guide */}
                        {isHovered && (
                          <line
                            x1={pt.x}
                            y1={0}
                            x2={pt.x}
                            y2={240}
                            stroke="#38bdf8"
                            strokeWidth="1.5"
                            strokeDasharray="3 3"
                            opacity="0.6"
                          />
                        )}
                        <circle
                          cx={pt.x}
                          cy={pt.y}
                          r={isHovered ? 7.5 : isPeak ? 6.5 : 5}
                          className={`${
                            isPeak 
                              ? 'fill-amber-400 stroke-white dark:stroke-slate-900' 
                              : 'fill-cyan-400 stroke-white dark:stroke-slate-900'
                          } transition-all drop-shadow-md`}
                          strokeWidth="2.5"
                        />
                      </g>
                    );
                  })}
                </svg>

                {/* Floating Tooltip in Area Mode */}
                <AnimatePresence>
                  {hoveredIndex !== null && chartData[hoveredIndex] && (
                    <motion.div
                      initial={{ opacity: 0, y: 4, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 2, scale: 0.96 }}
                      transition={{ duration: 0.12 }}
                      className={`absolute top-2 z-40 bg-slate-900/95 dark:bg-slate-950/95 text-white p-3 rounded-2xl border border-slate-700/80 shadow-2xl backdrop-blur-md pointer-events-none whitespace-nowrap text-left min-w-[160px] ${
                        hoveredIndex >= chartData.length - 2 
                          ? 'right-4' 
                          : hoveredIndex <= 1 
                            ? 'left-4' 
                            : 'left-1/2 -translate-x-1/2'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 text-[10.5px] text-slate-400 border-b border-slate-800 pb-1.5 mb-1.5">
                        <span className="font-bold flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-sky-400" />
                          {chartData[hoveredIndex].day} ({chartData[hoveredIndex].fullDate})
                        </span>
                        {hoveredIndex === peakIndex && chartData[hoveredIndex].revenue > 0 && (
                          <span className="text-amber-300 font-black text-[9px] bg-amber-400/25 px-1.5 py-0.2 rounded-full border border-amber-400/30">
                            👑 ĐỈNH
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-black text-sky-300 font-heading">
                        {formatVND(chartData[hoveredIndex].revenue)}
                      </p>
                      <div className="flex items-center justify-between text-[10px] text-slate-300 mt-1">
                        <span className="font-semibold">{chartData[hoveredIndex].orders} đơn hàng</span>
                        <span className="text-emerald-400 font-bold">
                          {chartData[hoveredIndex].revenue > 0 ? `${totalRevenue > 0 ? Math.round((chartData[hoveredIndex].revenue / totalRevenue) * 100) : 0}% tổng tuần` : '0% tổng'}
                        </span>
                      </div>
                      <div className={`absolute -bottom-1.5 w-3 h-3 bg-slate-900 rotate-45 border-r border-b border-slate-700/80 ${
                        hoveredIndex >= chartData.length - 2 ? 'right-6' : hoveredIndex <= 1 ? 'left-6' : 'left-1/2 -translate-x-1/2'
                      }`} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>

        {/* X-Axis labels: Day of week + Date in two crisp lines (NO OVERLAPPING) */}
        <div className="flex items-start gap-3 pt-3">
          <div className="w-16 sm:w-24 shrink-0 select-none pointer-events-none" />
          <div className="flex-1 flex items-start justify-between">
            {chartData.map((item, idx) => {
              const isHovered = hoveredIndex === idx;
              const isPeak = idx === peakIndex && item.revenue > 0;
              const shortDate = item.date ? item.date.slice(5).replace('-', '/') : '';

              return (
                <div
                  key={idx}
                  onMouseEnter={() => setHoveredIndex(idx)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  className="flex-1 flex flex-col items-center justify-center text-center cursor-pointer group"
                >
                  <span className={`text-[11px] sm:text-xs transition-colors font-heading block ${
                    isHovered 
                      ? 'text-sky-600 dark:text-sky-400 font-black' 
                      : isPeak
                        ? 'text-amber-600 dark:text-amber-400 font-black'
                        : 'text-slate-700 dark:text-slate-200 font-bold'
                  }`}>
                    {item.day}
                  </span>
                  <span className={`text-[10px] sm:text-[11px] font-mono mt-0.5 px-1.5 py-0.2 rounded-md transition-all ${
                    isHovered
                      ? 'bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 font-bold'
                      : 'text-slate-400 dark:text-slate-500'
                  }`}>
                    {shortDate}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
