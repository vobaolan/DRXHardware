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
  Activity
} from 'lucide-react';

export type TimePeriod = 'week' | 'month' | 'year';

export interface DayData {
  day: string;
  date: string;
  fullDate?: string;
  revenue: number;
  orders: number;
}

interface RevenueChartWidgetProps {
  data?: DayData[];
  weekData?: DayData[];
  monthData?: DayData[];
  yearData?: DayData[];
  formatVND: (val: number) => string;
}

export const RevenueChartWidget: React.FC<RevenueChartWidgetProps> = ({ 
  data = [], 
  weekData, 
  monthData, 
  yearData, 
  formatVND 
}) => {
  const [period, setPeriod] = useState<TimePeriod>('week');
  const [chartMode, setChartMode] = useState<'bar' | 'area'>('bar');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Determine active dataset based on selected period
  const chartData = useMemo(() => {
    let activeList: DayData[] | undefined;
    if (period === 'week') {
      activeList = weekData && weekData.length > 0 ? weekData : data;
    } else if (period === 'month') {
      activeList = monthData && monthData.length > 0 ? monthData : undefined;
    } else if (period === 'year') {
      activeList = yearData && yearData.length > 0 ? yearData : undefined;
    }

    if (activeList && activeList.length > 0) return activeList;

    // Fallback safety generator
    if (period === 'year') {
      return Array.from({ length: 12 }, (_, i) => ({
        day: `T${i + 1}`,
        date: `2026-${String(i + 1).padStart(2, '0')}-01`,
        fullDate: `Tháng ${i + 1}/2026`,
        revenue: 0,
        orders: 0,
      }));
    }

    if (period === 'month') {
      return Array.from({ length: 30 }, (_, i) => ({
        day: `${i + 1}`,
        date: `2026-09-${String(i + 1).padStart(2, '0')}`,
        fullDate: `Ngày ${i + 1}/09`,
        revenue: 0,
        orders: 0,
      }));
    }

    const days = ['Thứ 6', 'Thứ 7', 'Chủ Nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5'];
    return days.map((d, i) => ({
      day: d,
      date: `2026-09-0${i + 1}`,
      fullDate: `0${i + 1}/09`,
      revenue: 0,
      orders: 0,
    }));
  }, [period, weekData, monthData, yearData, data]);

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

  // Nice Numbers / Round Intervals algorithm for Y-axis with 25% headroom
  const yAxisConfig = useMemo(() => {
    if (rawMaxRevenue <= 0) {
      return {
        chartMax: 10000000,
        ticks: [10000000, 6000000, 3000000, 0],
      };
    }

    const targetMax = rawMaxRevenue * 1.25;
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

  // Short currency formatter for Y-axis (clean and concise)
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
    const height = 224;
    const paddingX = chartData.length > 20 ? 16 : 32;
    const paddingY = 24;
    const usableW = width - paddingX * 2;
    const usableH = height - paddingY * 2;
    const stepX = chartData.length > 1 ? usableW / (chartData.length - 1) : usableW;

    const points = chartData.map((d, i) => {
      const x = paddingX + i * stepX;
      const ratio = yAxisConfig.chartMax > 0 ? (d.revenue || 0) / yAxisConfig.chartMax : 0;
      const y = height - paddingY - ratio * usableH;
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

  // Dynamic titles and labels depending on period
  const periodTitles = {
    week: 'DOANH THU 7 NGÀY GẦN NHẤT',
    month: 'DOANH THU 30 NGÀY GẦN NHẤT',
    year: 'DOANH THU THEO 12 THÁNG TRONG NĂM',
  };

  const kpiLabels = {
    week: { total: 'Tổng 7 Ngày', avg: 'Trung Bình / Ngày', peak: 'Đỉnh Tuần' },
    month: { total: 'Tổng 30 Ngày', avg: 'Trung Bình / Ngày', peak: 'Đỉnh Tháng' },
    year: { total: 'Tổng Cả Năm', avg: 'Trung Bình / Tháng', peak: 'Tháng Đỉnh' },
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-4 sm:p-7 space-y-6 shadow-xs relative overflow-hidden transition-all">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-sky-500/5 dark:bg-sky-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

      {/* 1. HEADER SECTION */}
      <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800/80 pb-5">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#0284c7] to-[#38bdf8] flex items-center justify-center text-white shadow-md shadow-sky-500/25 shrink-0">
              <TrendingUp className="w-4 h-4" />
            </div>
            <h3 className="font-heading text-sm sm:text-base font-black uppercase text-slate-900 dark:text-white tracking-wide">
              {periodTitles[period]}
            </h3>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 shadow-xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              REAL-TIME SUPABASE
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 pl-0 sm:pl-10 font-normal">
            Thống kê tổng doanh thu thực tế từ các đơn hàng linh kiện đã hoàn tất / thanh toán theo {period === 'year' ? 'từng tháng' : 'từng ngày'}.
          </p>
        </div>

        {/* View & Period Switcher Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Period Selector Tabs: Tuần / Tháng / Năm */}
          <div className="inline-flex p-1 rounded-xl bg-slate-100 dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 text-xs">
            <button
              type="button"
              onClick={() => { setPeriod('week'); setHoveredIndex(null); }}
              className={`px-3 py-1.5 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                period === 'week'
                  ? 'bg-white dark:bg-slate-700 text-[#0284c7] dark:text-sky-300 shadow-xs font-black'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Tuần
            </button>
            <button
              type="button"
              onClick={() => { setPeriod('month'); setHoveredIndex(null); }}
              className={`px-3 py-1.5 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                period === 'month'
                  ? 'bg-white dark:bg-slate-700 text-[#0284c7] dark:text-sky-300 shadow-xs font-black'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Tháng
            </button>
            <button
              type="button"
              onClick={() => { setPeriod('year'); setHoveredIndex(null); }}
              className={`px-3 py-1.5 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                period === 'year'
                  ? 'bg-white dark:bg-slate-700 text-[#0284c7] dark:text-sky-300 shadow-xs font-black'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Năm
            </button>
          </div>

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
              <span className="hidden sm:inline">Cột Neon</span>
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
              <span className="hidden sm:inline">Sóng Area</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. EXECUTIVE METRIC KPI STRIP */}
      <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
        <div className="p-3.5 rounded-2xl bg-slate-50/90 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 flex flex-col justify-between">
          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <DollarSign className="w-3 h-3 text-sky-500 shrink-0" /> {kpiLabels[period].total}
          </span>
          <span className="text-sm sm:text-lg font-black text-slate-900 dark:text-white font-heading mt-1 truncate">
            {formatVND(totalRevenue)}
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-50/90 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 flex flex-col justify-between">
          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <Activity className="w-3 h-3 text-emerald-500 shrink-0" /> {kpiLabels[period].avg}
          </span>
          <span className="text-sm sm:text-lg font-black text-emerald-600 dark:text-emerald-400 font-heading mt-1 truncate">
            {formatVND(avgRevenue)}
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-50/90 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 flex flex-col justify-between">
          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <Award className="w-3 h-3 text-amber-500 shrink-0" /> {kpiLabels[period].peak}
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

      {/* 3. CHART CANVAS CONTAINER */}
      <div className="relative z-10 pt-4 overflow-x-auto">
        <div className="min-w-[500px]">
          {/* Main Chart Row: Y-Axis Labels (Left) + Plot Area with Gridlines & Bars (Right) */}
          <div className="flex items-stretch gap-3">
            
            {/* Y-Axis Tick Labels Column (Exact Match to Plot Area Height) */}
            <div className="w-20 sm:w-28 h-56 flex flex-col justify-between text-right shrink-0 pr-1 select-none pointer-events-none">
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

            {/* Plot Visualization Area (Height 224px, Shared Baseline) */}
            <div className="flex-1 h-56 relative">
              
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
                <div className={`absolute inset-0 flex items-end justify-between z-10 ${
                  period === 'month' ? 'gap-1 sm:gap-1.5' : period === 'year' ? 'gap-1.5 sm:gap-3' : 'gap-2 sm:gap-4'
                }`}>
                  {chartData.map((item, idx) => {
                    const heightPercent = yAxisConfig.chartMax > 0 
                      ? Math.min(100, Math.max(0, ((item.revenue || 0) / yAxisConfig.chartMax) * 100)) 
                      : 0;
                    const isHovered = hoveredIndex === idx;
                    const isPeak = idx === peakIndex && item.revenue > 0;
                    const percentOfTotal = totalRevenue > 0 ? Math.round(((item.revenue || 0) / totalRevenue) * 100) : 0;

                    const maxBarWidth = period === 'month' 
                      ? 'max-w-[14px] sm:max-w-[20px]' 
                      : period === 'year' 
                        ? 'max-w-[34px] sm:max-w-[44px]' 
                        : 'max-w-[44px] sm:max-w-[52px]';

                    return (
                      <div
                        key={idx}
                        onMouseEnter={() => setHoveredIndex(idx)}
                        onMouseLeave={() => setHoveredIndex(null)}
                        className="flex-1 h-full flex flex-col items-center justify-end group cursor-pointer relative"
                      >
                        {/* Floating Rich Tooltip */}
                        <AnimatePresence>
                          {isHovered && (
                            <motion.div
                              initial={{ opacity: 0, y: 4, scale: 0.96 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: 2, scale: 0.96 }}
                              transition={{ duration: 0.12 }}
                              className={`absolute -top-16 z-50 bg-slate-900/95 dark:bg-slate-950/95 text-white p-3 rounded-2xl border border-slate-700/80 shadow-2xl backdrop-blur-md pointer-events-none whitespace-nowrap text-left min-w-[150px] ${
                                idx >= chartData.length - (period === 'month' ? 6 : 2)
                                  ? 'right-0' 
                                  : idx <= (period === 'month' ? 5 : 1)
                                    ? 'left-0' 
                                    : 'left-1/2 -translate-x-1/2'
                              }`}
                            >
                              <div className="flex items-center justify-between gap-2 text-[10.5px] text-slate-400 border-b border-slate-800 pb-1.5 mb-1.5">
                                <span className="font-bold flex items-center gap-1.5">
                                  <Calendar className="w-3.5 h-3.5 text-sky-400" />
                                  {item.fullDate || item.day}
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
                                  {item.revenue > 0 ? `${percentOfTotal}% tổng kỳ` : '0% tổng'}
                                </span>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {/* Bar Pillar Sizing */}
                        <div className="w-full h-full flex items-end justify-center">
                          <div className={`w-full ${maxBarWidth} h-full flex items-end justify-center rounded-2xl p-0.5 sm:p-1 transition-all ${
                            item.revenue > 0 
                              ? 'bg-slate-100/60 dark:bg-slate-800/30 border border-slate-200/60 dark:border-slate-800/60 group-hover:border-sky-400/70 group-hover:bg-sky-50/40 dark:group-hover:bg-sky-950/20' 
                              : 'bg-slate-50/50 dark:bg-slate-800/20 border border-dashed border-slate-200/60 dark:border-slate-800/60'
                          }`}>
                            <motion.div
                              initial={{ height: 0 }}
                              animate={{ height: `${item.revenue > 0 ? Math.max(heightPercent, 4) : 2}%` }}
                              transition={{ type: 'spring', damping: 20, stiffness: 120, delay: Math.min(idx * 0.02, 0.3) }}
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
                                <div className="w-full h-1 rounded-t-xl bg-cyan-100 shadow-[0_0_8px_rgba(103,232,249,0.9)]" />
                              )}

                              {/* Star Icon Badge for Peak Day */}
                              {isPeak && item.revenue > 0 && (
                                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-gradient-to-br from-amber-300 to-amber-500 text-slate-950 flex items-center justify-center shadow-md shadow-amber-400/50 border border-amber-200 z-10">
                                  <Sparkles className="w-2.5 h-2.5 fill-slate-950" />
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
                    viewBox="0 0 700 224"
                    className="w-full h-full overflow-visible"
                    preserveAspectRatio="none"
                  >
                    <defs>
                      <linearGradient id="revenue-area-gradient-v3" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#0284c7" stopOpacity="0.45" />
                        <stop offset="60%" stopColor="#38bdf8" stopOpacity="0.15" />
                        <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.0" />
                      </linearGradient>
                      <linearGradient id="revenue-line-gradient-v3" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#0284c7" />
                        <stop offset="50%" stopColor="#38bdf8" />
                        <stop offset="100%" stopColor="#67e8f9" />
                      </linearGradient>
                      <filter id="glow-v3" x="-20%" y="-20%" width="140%" height="140%">
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
                        fill="url(#revenue-area-gradient-v3)"
                      />
                    )}

                    {/* Line Stroke */}
                    <motion.path
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                      d={svgPathData.line}
                      fill="none"
                      stroke="url(#revenue-line-gradient-v3)"
                      strokeWidth={period === 'month' ? '2.5' : '3.5'}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      filter="url(#glow-v3)"
                    />

                    {/* Data Points */}
                    {svgPathData.points.map((pt, idx) => {
                      const isHovered = hoveredIndex === idx;
                      const isPeak = idx === peakIndex && pt.d.revenue > 0;
                      // In month mode with 30 points, only show circles on hover or peak to avoid clutter
                      const showCircle = period !== 'month' || isHovered || isPeak || idx % 5 === 0;

                      if (!showCircle) return null;

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
                              y2={224}
                              stroke="#38bdf8"
                              strokeWidth="1.5"
                              strokeDasharray="3 3"
                              opacity="0.6"
                            />
                          )}
                          <circle
                            cx={pt.x}
                            cy={pt.y}
                            r={isHovered ? 7 : isPeak ? 6 : 4.5}
                            className={`${
                              isPeak 
                                ? 'fill-amber-400 stroke-white dark:stroke-slate-900' 
                                : 'fill-cyan-400 stroke-white dark:stroke-slate-900'
                            } transition-all drop-shadow-md`}
                            strokeWidth="2"
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
                        className={`absolute -top-16 z-50 bg-slate-900/95 dark:bg-slate-950/95 text-white p-3 rounded-2xl border border-slate-700/80 shadow-2xl backdrop-blur-md pointer-events-none whitespace-nowrap text-left min-w-[150px] ${
                          hoveredIndex >= chartData.length - (period === 'month' ? 6 : 2)
                            ? 'right-4' 
                            : hoveredIndex <= (period === 'month' ? 5 : 1)
                              ? 'left-4' 
                              : 'left-1/2 -translate-x-1/2'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 text-[10.5px] text-slate-400 border-b border-slate-800 pb-1.5 mb-1.5">
                          <span className="font-bold flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-sky-400" />
                            {chartData[hoveredIndex].fullDate || chartData[hoveredIndex].day}
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
                            {chartData[hoveredIndex].revenue > 0 ? `${totalRevenue > 0 ? Math.round((chartData[hoveredIndex].revenue / totalRevenue) * 100) : 0}% tổng kỳ` : '0% tổng'}
                          </span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </div>

          {/* X-Axis labels */}
          <div className="flex items-center gap-3 pt-2.5">
            <div className="w-20 sm:w-28 shrink-0 select-none pointer-events-none" />
            <div className="flex-1 flex items-center justify-between">
              {chartData.map((item, idx) => {
                const isHovered = hoveredIndex === idx;
                const isCurrent = idx === chartData.length - 1;

                // On month view, display label every 4-5 items to avoid overlapping
                const showMonthLabel = period !== 'month' || idx === 0 || idx === chartData.length - 1 || idx % 4 === 0;

                return (
                  <div
                    key={idx}
                    onMouseEnter={() => setHoveredIndex(idx)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    className="flex-1 text-center cursor-pointer"
                  >
                    {showMonthLabel ? (
                      <span className={`text-[10px] sm:text-[11px] transition-colors font-heading truncate block ${
                        isHovered 
                          ? 'text-sky-600 dark:text-sky-400 font-black' 
                          : isCurrent
                            ? 'text-[#0284c7] dark:text-sky-400 font-black'
                            : 'text-slate-600 dark:text-slate-300 font-bold'
                      }`}>
                        {item.day}
                      </span>
                    ) : (
                      <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700 mx-auto block my-1.5" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
