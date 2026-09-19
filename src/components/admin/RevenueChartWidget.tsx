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
  RotateCcw,
  CheckCircle2,
  Clock
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

  // Find latest order date for smart initial view
  const latestOrderDateStr = useMemo(() => {
    if (!orders || orders.length === 0) return null;
    const sorted = [...orders]
      .filter(o => o.createdAt && o.status !== 'CANCELLED')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return sorted.length > 0 ? getVnDateStr(sorted[0].createdAt) : null;
  }, [orders]);

  // Default week: 7 days ending on today (or containing the latest orders if current week has 0)
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

  const isCurrentWeek = useMemo(() => {
    return startDate === defaultDates.start && endDate === defaultDates.end;
  }, [startDate, endDate, defaultDates]);

  const weekLabel = useMemo(() => {
    if (isCurrentWeek) {
      return 'Tuần Này';
    }

    try {
      const curEndTime = new Date(defaultDates.end + 'T00:00:00').getTime();
      const selEndTime = new Date(endDate + 'T00:00:00').getTime();
      const diffDays = Math.round((selEndTime - curEndTime) / (24 * 60 * 60 * 1000));

      if (diffDays === -7) {
        return 'Tuần Trước';
      }
      if (diffDays === 7) {
        return 'Tuần Sau';
      }
      if (diffDays < 0 && diffDays % 7 === 0) {
        return `${Math.abs(diffDays / 7)} tuần trước`;
      }
      if (diffDays > 0 && diffDays % 7 === 0) {
        return `${diffDays / 7} tuần sau`;
      }

      // If custom date range or non-multiple of 7
      const sParts = startDate.split('-');
      const eParts = endDate.split('-');
      if (sParts.length === 3 && eParts.length === 3) {
        return `${sParts[2]}/${sParts[1]} - ${eParts[2]}/${eParts[1]}`;
      }
    } catch (e) {}

    return 'Tuần Chọn';
  }, [isCurrentWeek, startDate, endDate, defaultDates]);

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

  // Jump to latest week with orders
  const handleJumpToLatestOrders = () => {
    if (!latestOrderDateStr) return;
    const latestDate = new Date(latestOrderDateStr + 'T00:00:00');
    const start = new Date(latestDate.getTime() - 6 * 24 * 60 * 60 * 1000);
    setStartDate(getVnDateStr(start));
    setEndDate(getVnDateStr(latestDate));
    setHoveredIndex(null);
  };

  const dayNames = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];

  // Aggregate Chart Data strictly for the selected 7-day period
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

  // Y-axis with 35% headroom so highest bar never exceeds 70% height
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

  // Format compact currency for Y-axis (Tr, Tỷ, K)
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

  // Convert YYYY-MM-DD to DD/MM/YYYY
  const formatDateDisplay = (dateStr: string) => {
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
      return dateStr;
    } catch (e) {
      return dateStr;
    }
  };

  // Format short date strictly DD/MM (Vietnamese convention: 10/09 instead of 09/10)
  const formatShortVnDate = (item: DayData) => {
    if (item.fullDate) {
      return item.fullDate.slice(0, 5); // Take DD/MM
    }
    if (item.date) {
      const parts = item.date.split('-');
      if (parts.length === 3) return `${parts[2]}/${parts[1]}`;
    }
    return item.date;
  };

  // SVG Area Path generator
  const svgPathData = useMemo(() => {
    if (chartData.length === 0) return { line: '', area: '', points: [] };
    const width = 700;
    const height = 240;
    const paddingX = 45;
    const paddingTop = 40;
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

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-4 sm:p-6 space-y-4 shadow-xs relative transition-all">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-sky-500/5 dark:bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* 1. COMPACT UNIFIED HEADER & TOOLBAR */}
      <div className="relative z-10 space-y-3 border-b border-slate-100 dark:border-slate-800/80 pb-3.5">
        {/* Top Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#0284c7] to-[#38bdf8] flex items-center justify-center text-white shadow-md shadow-sky-500/25 shrink-0">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-heading text-sm sm:text-base font-black uppercase text-slate-900 dark:text-white tracking-wide">
                  DOANH THU THEO TUẦN
                </h3>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-black bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                  </span>
                  REAL-TIME SUPABASE
                </span>
              </div>
            </div>
          </div>

          {/* Chart Style Switcher: Cột / Sóng */}
          <div className="inline-flex p-1 rounded-xl bg-slate-100 dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 text-xs self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setChartMode('bar')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
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
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
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

        {/* Toolbar Row: Navigation & Date Range Controls */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 bg-slate-50/80 dark:bg-slate-800/50 p-2 rounded-2xl border border-slate-100 dark:border-slate-800">
          <div className="flex flex-wrap items-center gap-2">
            {/* Quick Week Shift Buttons */}
            <div className="inline-flex items-center p-0.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs shadow-xs">
              <button
                type="button"
                onClick={() => handleShiftWeek(-7)}
                title="Lùi 1 tuần trước"
                className="p-1 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-sky-600 transition-all cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleResetCurrentWeek}
                title={isCurrentWeek ? 'Đang xem tuần hiện tại' : 'Click để quay về Tuần Này'}
                className={`px-2.5 py-0.5 rounded-lg font-bold text-[11px] transition-all cursor-pointer flex items-center gap-1.5 ${
                  isCurrentWeek
                    ? 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                    : 'text-[#0284c7] bg-sky-50 dark:bg-sky-950/60 hover:bg-sky-100 dark:hover:bg-sky-900/60'
                }`}
              >
                <span>{weekLabel}</span>
                {!isCurrentWeek && (
                  <RotateCcw className="w-2.5 h-2.5 opacity-70 animate-in fade-in" />
                )}
              </button>
              <button
                type="button"
                onClick={() => handleShiftWeek(7)}
                title="Tiến 1 tuần sau"
                className="p-1 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-sky-600 transition-all cursor-pointer"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Direct Date Picker */}
            <div className="flex items-center gap-1 bg-white dark:bg-slate-900 p-0.5 px-2 rounded-xl border border-slate-200 dark:border-slate-700 text-[11px] font-semibold text-slate-700 dark:text-slate-200 shadow-xs">
              <Calendar className="w-3.5 h-3.5 text-sky-500 shrink-0" />
              <span className="text-[10px] text-slate-400 font-bold uppercase">Từ:</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => handleStartDateChange(e.target.value)}
                className="bg-transparent text-[11px] font-mono font-bold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
              />
              <span className="text-slate-300 dark:text-slate-600 font-bold mx-0.5">➔</span>
              <span className="text-[10px] text-slate-400 font-bold uppercase">Đến:</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => handleEndDateChange(e.target.value)}
                className="bg-transparent text-[11px] font-mono font-bold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
              />
            </div>
          </div>

          {/* Quick Jump to Latest Orders Button */}
          {totalRevenue === 0 && latestOrderDateStr && (
            <button
              type="button"
              onClick={handleJumpToLatestOrders}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-[11px] font-extrabold shadow-sm transition-all cursor-pointer"
            >
              <Sparkles className="w-3 h-3 fill-white" />
              <span>Xem tuần có đơn gần nhất</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. EXECUTIVE METRIC KPI STRIP */}
      <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="p-3 rounded-2xl bg-slate-50/90 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 flex flex-col justify-between">
          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <DollarSign className="w-3 h-3 text-sky-500 shrink-0" /> Tổng Doanh Thu
          </span>
          <span className="text-sm sm:text-base font-black text-slate-900 dark:text-white font-heading mt-1 truncate">
            {formatVND(totalRevenue)}
          </span>
        </div>

        <div className="p-3 rounded-2xl bg-slate-50/90 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 flex flex-col justify-between">
          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <Activity className="w-3 h-3 text-emerald-500 shrink-0" /> Trung Bình / Ngày
          </span>
          <span className="text-sm sm:text-base font-black text-emerald-600 dark:text-emerald-400 font-heading mt-1 truncate">
            {formatVND(avgRevenue)}
          </span>
        </div>

        <div className="p-3 rounded-2xl bg-slate-50/90 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 flex flex-col justify-between">
          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <Award className="w-3 h-3 text-amber-500 shrink-0" /> Đỉnh Tuần
          </span>
          <span className="text-sm sm:text-base font-black text-amber-600 dark:text-amber-400 font-heading mt-1 truncate">
            {peakIndex !== -1 ? formatVND(chartData[peakIndex].revenue) : '0 đ'}
          </span>
        </div>

        <div className="p-3 rounded-2xl bg-slate-50/90 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 flex flex-col justify-between">
          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <ShoppingBag className="w-3 h-3 text-purple-500 shrink-0" /> Tổng Đơn Hàng
          </span>
          <span className="text-sm sm:text-base font-black text-purple-600 dark:text-purple-400 font-heading mt-1 truncate">
            {totalOrders} Đơn Hàng
          </span>
        </div>
      </div>

      {/* 3. PERMANENT FINANCIAL HUD STATUS BAR (Fixed 40px height to prevent vertical jitter) */}
      <div className="relative z-10 h-10 flex items-center justify-between border border-sky-200/80 dark:border-sky-900/60 px-3 rounded-xl bg-gradient-to-r from-sky-50/80 via-blue-50/50 to-indigo-50/50 dark:from-sky-950/40 dark:via-slate-900/60 dark:to-indigo-950/30 overflow-hidden">
        <div className="flex items-center gap-2 text-xs truncate min-w-0">
          <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse shrink-0" />
          {hoveredIndex !== null && chartData[hoveredIndex] ? (
            <span className="font-bold text-slate-900 dark:text-white flex items-center gap-2 truncate text-xs">
              <span className="text-[#0284c7] font-black truncate">
                {chartData[hoveredIndex].day} ({chartData[hoveredIndex].fullDate})
              </span>
              <span className="text-slate-300 dark:text-slate-600 shrink-0">•</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-black shrink-0">
                {formatVND(chartData[hoveredIndex].revenue)}
              </span>
              <span className="text-slate-300 dark:text-slate-600 shrink-0">•</span>
              <span className="text-purple-600 dark:text-purple-400 font-bold shrink-0">
                {chartData[hoveredIndex].orders} đơn
              </span>
              {hoveredIndex === peakIndex && chartData[hoveredIndex].revenue > 0 && (
                <span className="bg-amber-400/25 text-amber-600 dark:text-amber-400 px-1.5 py-0.5 rounded-md text-[10px] font-black border border-amber-300 dark:border-amber-700 shrink-0">
                  👑 Đỉnh Doanh Thu
                </span>
              )}
            </span>
          ) : (
            <span className="text-slate-600 dark:text-slate-300 text-[11px] font-medium flex items-center gap-1.5 truncate">
              <span className="shrink-0">{weekLabel}:</span>
              <strong className="text-sky-600 dark:text-sky-400 font-mono font-bold shrink-0">
                {formatDateDisplay(startDate)} ➔ {formatDateDisplay(endDate)}
              </strong>
              {peakIndex !== -1 && chartData[peakIndex].revenue > 0 && (
                <>
                  <span className="text-slate-300 dark:text-slate-600 shrink-0">•</span>
                  <span className="truncate">Đỉnh tuần: <strong className="text-amber-600 dark:text-amber-400">{chartData[peakIndex].day} ({formatVND(chartData[peakIndex].revenue)})</strong></span>
                </>
              )}
            </span>
          )}
        </div>
        {hoveredIndex !== null && chartData[hoveredIndex] && totalRevenue > 0 && (
          <span className="text-[11px] font-extrabold text-sky-600 dark:text-sky-400 shrink-0 hidden sm:inline-flex items-center bg-white/80 dark:bg-slate-900/80 px-2 py-0.5 rounded-lg border border-sky-100 dark:border-sky-900/50 ml-2">
            Chiếm {Math.round((chartData[hoveredIndex].revenue / totalRevenue) * 100)}% tổng tuần
          </span>
        )}
      </div>

      {/* 4. CHART CANVAS CONTAINER (onMouseLeave handled here to prevent dead-zone resets) */}
      <div 
        className="relative z-10 pt-2"
        onMouseLeave={() => setHoveredIndex(null)}
      >
        <div className="flex items-stretch gap-3">
          
          {/* Y-Axis Tick Labels Column */}
          <div className="w-14 sm:w-20 h-64 flex flex-col justify-between text-right shrink-0 pr-1 select-none pointer-events-none">
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

          {/* Plot Area */}
          <div className="flex-1 h-64 relative">
            
            {/* Gridlines */}
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
              <div className="absolute inset-0 flex items-end justify-between z-10">
                {chartData.map((item, idx) => {
                  const heightPercent = yAxisConfig.chartMax > 0 
                    ? Math.min(70, Math.max(0, ((item.revenue || 0) / yAxisConfig.chartMax) * 100)) 
                    : 0;
                  const isHovered = hoveredIndex === idx;
                  const isPeak = idx === peakIndex && item.revenue > 0;

                  return (
                    <div
                      key={idx}
                      onMouseEnter={() => setHoveredIndex(idx)}
                      onClick={() => setHoveredIndex(idx)}
                      className="flex-1 h-full px-1 sm:px-1.5 flex flex-col items-center justify-end group cursor-pointer relative"
                    >
                      {/* ACCURATELY ANCHORED ON-BAR FLOATING PILL */}
                      {(isHovered || (isPeak && hoveredIndex === null)) && (
                        <div 
                          className="absolute z-30 pointer-events-none select-none -translate-x-1/2 left-1/2 flex flex-col items-center"
                          style={{ 
                            bottom: `${Math.min(74, Math.max(heightPercent + 3, 7))}%` 
                          }}
                        >
                          <div className={`px-2 py-0.5 rounded-lg text-[10.5px] font-black shadow-lg whitespace-nowrap flex items-center gap-1 ${
                            isPeak && item.revenue > 0
                              ? 'bg-amber-500 text-slate-950 ring-2 ring-amber-300 shadow-amber-500/30'
                              : isHovered
                                ? 'bg-slate-900 text-white ring-1 ring-sky-400 shadow-sky-500/20'
                                : 'bg-slate-800 text-white'
                          }`}>
                            {isPeak && item.revenue > 0 && <span className="text-[10px]">👑</span>}
                            <span className="font-mono">{formatVND(item.revenue)}</span>
                          </div>
                          {/* Triangle Pointer touching center top cap */}
                          <div className={`w-1.5 h-1.5 rotate-45 -mt-0.5 ${
                            isPeak && item.revenue > 0 ? 'bg-amber-500' : 'bg-slate-900'
                          }`} />
                        </div>
                      )}

                      {/* Bar Pillar - fixed 1px border to eliminate 1px layout shift */}
                      <div className="w-full h-full flex items-end justify-center pointer-events-none">
                        <div className={`w-full max-w-[42px] sm:max-w-[54px] h-full flex items-end justify-center rounded-2xl p-1 border transition-colors duration-150 ${
                          isHovered 
                            ? 'bg-sky-100/60 dark:bg-sky-950/50 border-sky-400 dark:border-sky-500 shadow-sm shadow-sky-500/20' 
                            : item.revenue > 0 
                              ? 'bg-slate-100/50 dark:bg-slate-800/30 border-slate-200/60 dark:border-slate-800/60' 
                              : 'bg-slate-50/40 dark:bg-slate-800/10 border-dashed border-slate-200/40 dark:border-slate-800/40'
                        }`}>
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: `${item.revenue > 0 ? Math.max(heightPercent, 6) : 3}%` }}
                            transition={{ type: 'spring', damping: 20, stiffness: 120, delay: idx * 0.02 }}
                            className={`w-full rounded-xl relative flex flex-col justify-between ${
                              item.revenue > 0
                                ? isPeak
                                  ? 'bg-gradient-to-t from-[#0284c7] via-[#0ea5e9] to-[#38bdf8] shadow-lg shadow-sky-500/35 border-t-2 border-cyan-200'
                                  : 'bg-gradient-to-t from-[#0369a1] via-[#0284c7] to-[#38bdf8] shadow-sm'
                                : 'bg-slate-200/70 dark:bg-slate-700/50'
                            }`}
                          >
                            {/* Glowing Neon Top Cap */}
                            {item.revenue > 0 && (
                              <div className="w-full h-1.5 rounded-t-xl bg-cyan-100 shadow-[0_0_8px_rgba(103,232,249,0.9)]" />
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
                  className="w-full h-full overflow-visible pointer-events-none"
                  preserveAspectRatio="none"
                >
                  <defs>
                    <linearGradient id="revenue-area-gradient-v5" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0284c7" stopOpacity="0.4" />
                      <stop offset="60%" stopColor="#38bdf8" stopOpacity="0.12" />
                      <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.0" />
                    </linearGradient>
                    <linearGradient id="revenue-line-gradient-v5" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#0284c7" />
                      <stop offset="50%" stopColor="#38bdf8" />
                      <stop offset="100%" stopColor="#67e8f9" />
                    </linearGradient>
                    <filter id="glow-v5" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="3" result="blur" />
                      <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                  </defs>

                  {/* Area Fill */}
                  {svgPathData.area && (
                    <motion.path
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5 }}
                      d={svgPathData.area}
                      fill="url(#revenue-area-gradient-v5)"
                    />
                  )}

                  {/* Line Stroke */}
                  <motion.path
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.7, ease: 'easeOut' }}
                    d={svgPathData.line}
                    fill="none"
                    stroke="url(#revenue-line-gradient-v5)"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    filter="url(#glow-v5)"
                  />

                  {/* Data Points */}
                  {svgPathData.points.map((pt, idx) => {
                    const isHovered = hoveredIndex === idx;
                    const isPeak = idx === peakIndex && pt.d.revenue > 0;

                    return (
                      <g key={idx}>
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

                {/* Seamless hit-area overlay for Area chart */}
                <div className="absolute inset-0 flex items-stretch z-20">
                  {chartData.map((_, idx) => (
                    <div
                      key={idx}
                      onMouseEnter={() => setHoveredIndex(idx)}
                      onClick={() => setHoveredIndex(idx)}
                      className="flex-1 h-full cursor-pointer"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* X-Axis labels: Day of week + Date strictly in DD/MM format */}
        <div className="flex items-start gap-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80">
          <div className="w-14 sm:w-20 shrink-0 select-none pointer-events-none" />
          <div className="flex-1 flex items-start justify-between">
            {chartData.map((item, idx) => {
              const isHovered = hoveredIndex === idx;
              const isPeak = idx === peakIndex && item.revenue > 0;
              const shortDate = formatShortVnDate(item); // Strictly DD/MM !

              return (
                <div
                  key={idx}
                  onMouseEnter={() => setHoveredIndex(idx)}
                  onClick={() => setHoveredIndex(idx)}
                  className="flex-1 flex flex-col items-center justify-center text-center cursor-pointer group py-0.5"
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
                  <span className={`text-[10px] sm:text-[11px] font-mono mt-0.5 px-1.5 py-0.2 rounded-md transition-colors ${
                    isHovered
                      ? 'bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 font-black'
                      : isPeak
                        ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-black'
                        : 'text-slate-400 dark:text-slate-500 font-semibold'
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
