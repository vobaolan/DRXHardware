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
  ArrowUpRight
} from 'lucide-react';

export interface DayData {
  day: string;
  date: string;
  fullDate?: string;
  revenue: number;
  orders: number;
}

interface RevenueChartWidgetProps {
  data: DayData[];
  formatVND: (val: number) => string;
}

export const RevenueChartWidget: React.FC<RevenueChartWidgetProps> = ({ data = [], formatVND }) => {
  const [chartMode, setChartMode] = useState<'bar' | 'area'>('bar');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Safety fallback if data is empty
  const chartData = useMemo(() => {
    if (data && data.length > 0) return data;
    const days = ['Thứ 6', 'Thứ 7', 'Chủ Nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5'];
    return days.map((d, i) => ({
      day: d,
      date: `2026-09-0${i + 1}`,
      fullDate: `0${i + 1}/09`,
      revenue: 0,
      orders: 0,
    }));
  }, [data]);

  // Aggregate Calculations
  const totalRevenue = useMemo(() => {
    return chartData.reduce((sum, d) => sum + (d.revenue || 0), 0);
  }, [chartData]);

  const totalOrders = useMemo(() => {
    return chartData.reduce((sum, d) => sum + (d.orders || 0), 0);
  }, [chartData]);

  const maxRevenue = useMemo(() => {
    const max = Math.max(...chartData.map(d => d.revenue || 0));
    return max > 0 ? max : 10000000;
  }, [chartData]);

  const avgRevenue = useMemo(() => {
    return Math.round(totalRevenue / Math.max(chartData.length, 1));
  }, [totalRevenue, chartData.length]);

  const peakDayIndex = useMemo(() => {
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
    const height = 200;
    const paddingX = 40;
    const paddingY = 24;
    const usableW = width - paddingX * 2;
    const usableH = height - paddingY * 2;
    const stepX = usableW / (chartData.length - 1);

    const points = chartData.map((d, i) => {
      const x = paddingX + i * stepX;
      const ratio = maxRevenue > 0 ? (d.revenue || 0) / maxRevenue : 0;
      const y = height - paddingY - ratio * usableH;
      return { x, y, d, index: i };
    });

    // Build smooth cubic Bezier path
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
  }, [chartData, maxRevenue]);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 sm:p-7 space-y-6 shadow-xs relative overflow-hidden transition-all">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-sky-500/5 dark:bg-sky-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

      {/* 1. HEADER SECTION */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800/80 pb-5">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#0284c7] to-[#38bdf8] flex items-center justify-center text-white shadow-md shadow-sky-500/25">
              <TrendingUp className="w-4 h-4" />
            </div>
            <h3 className="font-heading text-sm sm:text-base font-black uppercase text-slate-900 dark:text-white tracking-wide">
              DOANH THU 7 NGÀY GẦN NHẤT
            </h3>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 shadow-xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              REAL-TIME SUPABASE
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 pl-10 font-normal">
            Thống kê tổng doanh thu thực tế từ các đơn hàng linh kiện đã hoàn tất / thanh toán theo từng ngày.
          </p>
        </div>

        {/* View Switcher Buttons */}
        <div className="flex items-center gap-2.5 self-start md:self-auto">
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
            <DollarSign className="w-3 h-3 text-sky-500" /> Tổng 7 Ngày
          </span>
          <span className="text-base sm:text-lg font-black text-slate-900 dark:text-white font-heading mt-1">
            {formatVND(totalRevenue)}
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-50/90 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 flex flex-col justify-between">
          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <Activity className="w-3 h-3 text-emerald-500" /> Trung Bình / Ngày
          </span>
          <span className="text-base sm:text-lg font-black text-emerald-600 dark:text-emerald-400 font-heading mt-1">
            {formatVND(avgRevenue)}
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-50/90 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 flex flex-col justify-between">
          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <Award className="w-3 h-3 text-amber-500" /> Đỉnh Doanh Thu
          </span>
          <span className="text-base sm:text-lg font-black text-amber-600 dark:text-amber-400 font-heading mt-1">
            {peakDayIndex !== -1 ? formatVND(chartData[peakDayIndex].revenue) : '0 đ'}
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-50/90 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 flex flex-col justify-between">
          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <ShoppingBag className="w-3 h-3 text-purple-500" /> Tổng Đơn Hàng
          </span>
          <span className="text-base sm:text-lg font-black text-purple-600 dark:text-purple-400 font-heading mt-1">
            {totalOrders} Đơn
          </span>
        </div>
      </div>

      {/* 3. CHART CANVAS CONTAINER */}
      <div className="relative z-10 pt-6">
        
        {/* Y-Axis Gutter & Full Width Gridlines */}
        <div className="absolute inset-0 pointer-events-none flex flex-col justify-between text-[10px] font-bold text-slate-400 dark:text-slate-500 pb-11">
          {/* Max Level Line */}
          <div className="w-full flex items-center gap-2">
            <span className="w-24 sm:w-28 text-right shrink-0 pr-2 text-slate-500 dark:text-slate-400 font-mono font-semibold truncate">
              {formatVND(maxRevenue)}
            </span>
            <div className="flex-1 border-b border-dashed border-slate-200/90 dark:border-slate-800" />
          </div>

          {/* 66% Level Line */}
          <div className="w-full flex items-center gap-2">
            <span className="w-24 sm:w-28 text-right shrink-0 pr-2 text-slate-400 dark:text-slate-500 font-mono truncate">
              {formatVND(Math.round(maxRevenue * 0.66))}
            </span>
            <div className="flex-1 border-b border-dashed border-slate-200/70 dark:border-slate-800/70" />
          </div>

          {/* 33% Level Line */}
          <div className="w-full flex items-center gap-2">
            <span className="w-24 sm:w-28 text-right shrink-0 pr-2 text-slate-400 dark:text-slate-500 font-mono truncate">
              {formatVND(Math.round(maxRevenue * 0.33))}
            </span>
            <div className="flex-1 border-b border-dashed border-slate-200/50 dark:border-slate-800/50" />
          </div>

          {/* 0 VND Baseline */}
          <div className="w-full flex items-center gap-2">
            <span className="w-24 sm:w-28 text-right shrink-0 pr-2 text-slate-500 dark:text-slate-400 font-mono font-bold">
              0 đ
            </span>
            <div className="flex-1 border-b-2 border-slate-200 dark:border-slate-800" />
          </div>
        </div>

        {/* Dynamic Average Line Marker - Positioned cleanly on the RIGHT side to avoid overlapping chart bars/tooltips */}
        {avgRevenue > 0 && maxRevenue > 0 && (
          <div 
            style={{ bottom: `calc(44px + ${(avgRevenue / maxRevenue) * 165}px)` }}
            className="absolute left-28 sm:left-32 right-2 flex items-center pointer-events-none z-20"
          >
            <div className="w-full border-b border-dashed border-emerald-500/60 dark:border-emerald-400/50 relative">
              <span className="absolute right-0 -top-3 text-[9.5px] font-bold text-emerald-700 dark:text-emerald-300 bg-white/95 dark:bg-slate-900/95 px-2.5 py-0.5 rounded-full border border-emerald-300/80 dark:border-emerald-700/80 shadow-xs backdrop-blur-xs flex items-center gap-1.5 select-none">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Mức TB: <span className="font-black font-mono">{formatVND(avgRevenue)}</span>
              </span>
            </div>
          </div>
        )}

        {/* CHART VISUALIZATION AREA (Padding-left gives full breathing space so Y-axis labels never touch bars) */}
        <div className="pl-28 sm:pl-32 h-64 relative flex items-end">
          
          {/* MODE 1: BAR CHART */}
          {chartMode === 'bar' && (
            <div className="w-full h-full flex items-end justify-between gap-2 sm:gap-3 relative z-10">
              {chartData.map((item, idx) => {
                const heightPercent = maxRevenue > 0 ? ((item.revenue || 0) / maxRevenue) * 100 : 0;
                const isHovered = hoveredIndex === idx;
                const isPeak = idx === peakDayIndex && item.revenue > 0;
                const isToday = idx === chartData.length - 1;
                const percentOfTotal = totalRevenue > 0 ? Math.round(((item.revenue || 0) / totalRevenue) * 100) : 0;

                return (
                  <div
                    key={idx}
                    onMouseEnter={() => setHoveredIndex(idx)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    className="flex-1 h-full flex flex-col items-center justify-end group cursor-pointer relative"
                  >
                    {/* Floating Rich Tooltip with high z-index and safe positioning */}
                    <AnimatePresence>
                      {isHovered && (
                        <motion.div
                          initial={{ opacity: 0, y: 6, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 4, scale: 0.95 }}
                          transition={{ duration: 0.12 }}
                          className="absolute -top-20 z-50 bg-slate-900/95 dark:bg-slate-950/95 text-white p-3 rounded-2xl border border-slate-700/80 shadow-2xl backdrop-blur-md pointer-events-none whitespace-nowrap text-left min-w-[155px]"
                        >
                          <div className="flex items-center justify-between gap-2 text-[10.5px] text-slate-400 border-b border-slate-800 pb-1.5 mb-1.5">
                            <span className="font-bold flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-sky-400" />
                              {item.day} {item.fullDate ? `(${item.fullDate})` : ''}
                            </span>
                            {isPeak && (
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
                            <span className="text-emerald-400 font-bold">{percentOfTotal}% tổng tuần</span>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Bar Pillar Container */}
                    <div className="w-full h-48 flex items-end justify-center">
                      <div className="w-full max-w-[48px] h-full flex items-end justify-center rounded-2xl p-1 bg-slate-100/60 dark:bg-slate-800/30 border border-slate-200/60 dark:border-slate-800/60 group-hover:border-sky-400/70 group-hover:bg-sky-50/40 dark:group-hover:bg-sky-950/20 transition-all">
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: `${Math.max(heightPercent, 5)}%` }}
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

                          {/* Star Icon Badge for Peak Day */}
                          {isPeak && (
                            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 w-5.5 h-5.5 rounded-full bg-gradient-to-br from-amber-300 to-amber-500 text-slate-950 flex items-center justify-center shadow-md shadow-amber-400/50 border border-amber-200 z-10">
                              <Sparkles className="w-3 h-3 fill-slate-950" />
                            </div>
                          )}
                        </motion.div>
                      </div>
                    </div>

                    {/* X-Axis Day Label & Today Badge */}
                    <div className="mt-2.5 flex flex-col items-center gap-0.5">
                      <span className={`text-[11.5px] transition-colors font-heading text-center ${
                        isHovered 
                          ? 'text-sky-600 dark:text-sky-400 font-black' 
                          : isToday
                            ? 'text-[#0284c7] dark:text-sky-400 font-black'
                            : 'text-slate-600 dark:text-slate-300 font-bold'
                      }`}>
                        {item.day}
                      </span>
                      {isToday && (
                        <span className="text-[8.5px] font-black uppercase text-white bg-sky-500 dark:bg-sky-600 px-1.5 py-0.2 rounded-full tracking-wider shadow-2xs">
                          HÔM NAY
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* MODE 2: AREA SPLINE WAVE CHART */}
          {chartMode === 'area' && (
            <div className="w-full h-full relative z-10 flex flex-col justify-end">
              <div className="w-full h-48 relative">
                <svg
                  viewBox="0 0 700 200"
                  className="w-full h-full overflow-visible"
                  preserveAspectRatio="none"
                >
                  <defs>
                    <linearGradient id="revenue-area-gradient-v2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0284c7" stopOpacity="0.45" />
                      <stop offset="60%" stopColor="#38bdf8" stopOpacity="0.15" />
                      <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.0" />
                    </linearGradient>
                    <linearGradient id="revenue-line-gradient-v2" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#0284c7" />
                      <stop offset="50%" stopColor="#38bdf8" />
                      <stop offset="100%" stopColor="#67e8f9" />
                    </linearGradient>
                    <filter id="glow-v2" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="3" result="blur" />
                      <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                  </defs>

                  {/* Area Fill */}
                  <motion.path
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6 }}
                    d={svgPathData.area}
                    fill="url(#revenue-area-gradient-v2)"
                  />

                  {/* Main Spline Line */}
                  <motion.path
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    d={svgPathData.line}
                    fill="none"
                    stroke="url(#revenue-line-gradient-v2)"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    filter="url(#glow-v2)"
                  />

                  {/* Interactive Points */}
                  {svgPathData.points.map((pt, i) => {
                    const isHovered = hoveredIndex === i;
                    const isPeak = i === peakDayIndex && pt.d.revenue > 0;
                    return (
                      <g key={i} className="cursor-pointer">
                        {isHovered && (
                          <line
                            x1={pt.x}
                            y1={0}
                            x2={pt.x}
                            y2={200}
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
              </div>

              {/* X-Axis labels for Area Mode */}
              <div className="w-full flex items-center justify-between pt-2.5">
                {chartData.map((item, idx) => {
                  const isHovered = hoveredIndex === idx;
                  const isToday = idx === chartData.length - 1;
                  return (
                    <div
                      key={idx}
                      onMouseEnter={() => setHoveredIndex(idx)}
                      onMouseLeave={() => setHoveredIndex(null)}
                      className="flex-1 text-center cursor-pointer"
                    >
                      <span className={`text-[11.5px] transition-colors font-heading ${
                        isHovered 
                          ? 'text-sky-600 dark:text-sky-400 font-black' 
                          : isToday
                            ? 'text-[#0284c7] dark:text-sky-400 font-black'
                            : 'text-slate-600 dark:text-slate-300 font-bold'
                      }`}>
                        {item.day}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
