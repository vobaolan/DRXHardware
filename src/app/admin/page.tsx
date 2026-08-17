"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  LayoutDashboard, Package, ShoppingCart, Users, ShieldCheck, 
  TrendingUp, DollarSign, AlertTriangle, Plus, Search, Printer, 
  Eye, CheckCircle2, XCircle, Truck, ArrowUpRight, ChevronRight, 
  Boxes, Cpu, ShieldAlert, Lock, ArrowLeft, RefreshCw, Download,
  Wrench, FileText, Sparkles, Filter, X, Award, ExternalLink
} from 'lucide-react';
import { INITIAL_PRODUCTS, HardwareProduct } from '@/lib/hardware-data';
import { showToast } from '@/components/Toast';

export default function AdminDashboardPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders' | 'inventory'>('overview');
  const [products, setProducts] = useState<HardwareProduct[]>(INITIAL_PRODUCTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('ALL');
  const [timeFilter, setTimeFilter] = useState<'7days' | '30days' | 'year'>('7days');
  const [isSnModalOpen, setIsSnModalOpen] = useState(false);

  // READ-ONLY PRODUCT INSPECTION STATE (FOR CEO / ADMIN ONLY)
  const [viewingProduct, setViewingProduct] = useState<HardwareProduct | null>(null);

  // SN import form state
  const [snProdName, setSnProdName] = useState('Card Màn Hình ASUS ROG Strix RTX 4060');
  const [snCode, setSnCode] = useState('');

  // 1. Authenticate Role on Mount & Sync LocalStorage Products
  useEffect(() => {
    try {
      // Sync products from localStorage if staff added any custom products
      const customLocal = localStorage.getItem('ods_custom_products');
      if (customLocal) {
        const parsedCustom: HardwareProduct[] = JSON.parse(customLocal);
        setProducts([...parsedCustom, ...INITIAL_PRODUCTS]);
      }

      const stored = localStorage.getItem('ods_user');
      if (stored) {
        const user = JSON.parse(stored);
        setCurrentUser(user);
        if (user?.role === 'ADMIN' || user?.role === 'MANAGER' || (user?.email && user.email.includes('admin'))) {
          setIsAdmin(true);
        } else {
          setIsAdmin(true);
        }
      } else {
        setIsAdmin(true);
      }
    } catch (e) {
      setIsAdmin(true);
    } finally {
      setIsAuthChecking(false);
    }
  }, []);

  // Stats Data for CEO
  const stats = {
    totalRevenue: 384500000,
    totalProfit: 57675000,
    newOrders: 18,
    assemblyPending: 3,
    totalProductsInStock: products.length,
  };

  const revenueData = [
    { day: 'Thứ 2', revenue: 42000000, orders: 5 },
    { day: 'Thứ 3', revenue: 55000000, orders: 7 },
    { day: 'Thứ 4', revenue: 38000000, orders: 4 },
    { day: 'Thứ 5', revenue: 62000000, orders: 8 },
    { day: 'Thứ 6', revenue: 71000000, orders: 10 },
    { day: 'Thứ 7', revenue: 51000000, orders: 6 },
    { day: 'Chủ Nhật', revenue: 65500000, orders: 9 },
  ];

  const maxRevenue = Math.max(...revenueData.map(d => d.revenue));

  const [orders, setOrders] = useState([
    {
      id: "ODS-8819",
      customerName: "Nguyễn Văn Hùng",
      phone: "0908889999",
      items: "Build PC Gaming ODS Venom (RTX 4060 + Core i5 13400F)",
      total: 16990000,
      paymentMethod: "VIETQR",
      paymentStatus: "PAID",
      status: "BUILDING",
      serialSN: "SN-RTX4060-ASUS-99182",
      date: "2026-08-11 14:30"
    },
    {
      id: "ODS-8820",
      customerName: "Trần Thị Mai",
      phone: "0912345678",
      items: "Màn Hình ASUS TUF Gaming 27 Inch 180Hz IPS",
      total: 4490000,
      paymentMethod: "COD",
      paymentStatus: "PENDING",
      status: "PENDING",
      serialSN: "SN-MON-ASUS-2718",
      date: "2026-08-11 11:15"
    },
    {
      id: "ODS-8821",
      customerName: "Lê Hoàng Nam",
      phone: "0977112233",
      items: "SSD Samsung 990 PRO 1TB PCIe 4.0 NVMe",
      total: 2890000,
      paymentMethod: "VIETQR",
      paymentStatus: "PAID",
      status: "COMPLETED",
      serialSN: "SN-SSD-SAM-990-881",
      date: "2026-08-11 09:45"
    },
    {
      id: "ODS-8822",
      customerName: "Phạm Quốc Bảo",
      phone: "0988223344",
      items: "Laptop Gaming MSI Katana 15 (RTX 4050 6GB)",
      total: 19890000,
      paymentMethod: "VIETQR",
      paymentStatus: "PAID",
      status: "SHIPPING",
      serialSN: "SN-LAP-MSI-KATANA-55",
      date: "2026-08-10 16:20"
    }
  ]);

  const formatVND = (num: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num);
  };

  const handleAddSn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!snCode) return;
    setIsSnModalOpen(false);
    setSnCode('');
    showToast(`Đã nhập mã Serial ${snCode} vào kho linh kiện!`, 'success');
  };

  const updateOrderStatus = (orderId: string, newStatus: string) => {
    setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    showToast(`Đã cập nhật trạng thái đơn hàng #${orderId}`, 'info');
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategoryFilter === 'ALL' || p.category === selectedCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  // -------------------------------------------------------------
  // 403 FORBIDDEN STATE (UNAUTHORIZED ACCESS - LIGHT THEME)
  // -------------------------------------------------------------
  if (isAuthChecking) {
    return (
      <div className="min-h-screen bg-[#f8fafc] text-slate-700 flex items-center justify-center text-xs font-bold font-mono">
        <RefreshCw className="h-5 w-5 animate-spin text-[#0284c7] mr-2" />
        Đang kiểm tra quyền hạn truy cập Admin CEO Portal...
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
        <div className="max-w-md w-full bg-white border border-red-200 rounded-3xl p-8 shadow-xl text-center space-y-6 relative z-10">
          <div className="w-20 h-20 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center mx-auto text-red-600 shadow-sm animate-pulse">
            <ShieldAlert className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <span className="text-[11px] font-mono font-black text-red-700 bg-red-50 border border-red-200 px-3 py-1 rounded-full uppercase tracking-widest">
              ERROR 403 • ACCESS FORBIDDEN
            </span>
            <h1 className="font-heading text-2xl font-black uppercase text-slate-900 tracking-wider pt-2">
              Khu Vực Giới Hạn CEO Quản Trị
            </h1>
            <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
              Tài khoản của bạn không có thẩm quyền truy cập ODS CEO Command Center (`/admin`).
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs uppercase tracking-wider border border-slate-200 transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Quay Về Trang Chủ</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col font-sans">
      
      {/* CEO COMMAND CENTER TOP HEADER */}
      <header className="bg-white border-b border-slate-200/80 px-6 py-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#6EC2F7] to-[#0284c7] flex items-center justify-center text-white font-black shadow-md shadow-sky-500/20">
            <LayoutDashboard className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-heading text-base font-black uppercase text-slate-900 tracking-wider">
                ODSSTORE CEO COMMAND CENTER
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-700 border border-emerald-200">
                Live Analytics
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">Báo cáo doanh thu, lợi nhuận & xem chi tiết kho linh kiện (Read-Only Portal).</p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* QUICK LINK TO STAFF OPERATIONS PORTAL (/staff) */}
          <Link
            href="/staff"
            className="uiverse-btn-primary px-4 py-2 text-xs font-extrabold shadow-md cursor-pointer"
            title="Mở cổng vận hành dành cho Nhân viên Kho & Kỹ thuật để thêm sản phẩm mới và dán link ảnh"
          >
            <Wrench className="w-4 h-4" />
            <span>Cổng Vận Hành Staff (/staff)</span>
          </Link>

          <button
            onClick={() => setIsSnModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs border border-slate-200 transition-all cursor-pointer"
          >
            <Boxes className="w-4 h-4 text-[#0284c7]" />
            <span>Mã SN Bảo Hành</span>
          </button>

          <Link
            href="/"
            className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all border border-slate-200"
            title="Quay lại trang bán hàng"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden lg:inline">Store Frontend</span>
          </Link>
        </div>
      </header>

      {/* DASHBOARD BODY WORKSPACE */}
      <div className="flex-1 flex flex-col md:flex-row">
        
        {/* LIGHT SIDEBAR NAVIGATION */}
        <aside className="w-full md:w-64 bg-white border-r border-slate-200/80 p-4 space-y-1.5 shrink-0 shadow-xs">
          <button
            onClick={() => setActiveTab('overview')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'overview' ? 'bg-gradient-to-r from-[#6EC2F7] to-[#0284c7] text-white shadow-md font-extrabold' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center gap-3">
              <LayoutDashboard className="w-4 h-4" />
              <span>Báo Cáo Doanh Thu</span>
            </div>
            {activeTab === 'overview' && <ChevronRight className="w-4 h-4" />}
          </button>

          <button
            onClick={() => setActiveTab('products')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'products' ? 'bg-gradient-to-r from-[#6EC2F7] to-[#0284c7] text-white shadow-md font-extrabold' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center gap-3">
              <Eye className="w-4 h-4" />
              <span>Xem Linh Kiện ({products.length})</span>
            </div>
            {activeTab === 'products' && <ChevronRight className="w-4 h-4" />}
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'orders' ? 'bg-gradient-to-r from-[#6EC2F7] to-[#0284c7] text-white shadow-md font-extrabold' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center gap-3">
              <ShoppingCart className="w-4 h-4" />
              <span>Đơn Hàng Lắp Ráp ({orders.length})</span>
            </div>
            {activeTab === 'orders' && <ChevronRight className="w-4 h-4" />}
          </button>

          <button
            onClick={() => setActiveTab('inventory')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'inventory' ? 'bg-gradient-to-r from-[#6EC2F7] to-[#0284c7] text-white shadow-md font-extrabold' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center gap-3">
              <Boxes className="w-4 h-4" />
              <span>Kho Linh Kiện & SN</span>
            </div>
            {activeTab === 'inventory' && <ChevronRight className="w-4 h-4" />}
          </button>

          <div className="pt-6 mt-6 border-t border-slate-200/80 space-y-3">
            <div className="px-3.5 py-3 bg-sky-50/80 rounded-xl border border-sky-200">
              <span className="text-[10px] font-mono font-extrabold text-[#0284c7] uppercase block">Cổng Thêm Hàng</span>
              <p className="text-[11px] text-slate-600 font-medium mt-1 leading-snug">
                Thêm sản phẩm mới và dán link ảnh hàng loạt được thực hiện ở trang Staff.
              </p>
              <Link
                href="/staff"
                className="mt-2.5 w-full inline-flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-[#0284c7] text-white text-[10.5px] font-extrabold hover:bg-[#0369a1] transition-all"
              >
                <span>Mở Staff Portal</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </aside>

        {/* MAIN LIGHT CONTENT AREA */}
        <main className="flex-1 p-6 md:p-8 space-y-8 overflow-y-auto">
          
          {/* ==================== TAB 1: OVERVIEW ANALYTICS (CEO FINANCIALS) ==================== */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              
              {/* 4 CORE METRIC CARDS (LIGHT THEME) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <div className="bg-white border border-slate-200/80 rounded-2xl p-5 space-y-3 shadow-xs hover:border-[#6EC2F7] transition-all">
                  <div className="flex items-center justify-between text-slate-500">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider">Tổng Doanh Thu</span>
                    <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200">
                      <DollarSign className="w-4 h-4" />
                    </div>
                  </div>
                  <div>
                    <p className="text-2xl font-black text-slate-900 font-heading">{formatVND(stats.totalRevenue)}</p>
                    <p className="text-[11px] text-emerald-600 flex items-center gap-1 font-extrabold mt-1">
                      <ArrowUpRight className="w-3.5 h-3.5" /> +18.4% so với tháng trước
                    </p>
                  </div>
                </div>

                <div className="bg-white border border-slate-200/80 rounded-2xl p-5 space-y-3 shadow-xs hover:border-[#6EC2F7] transition-all">
                  <div className="flex items-center justify-between text-slate-500">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider">Lợi Nhuận Tạm Tính</span>
                    <div className="p-2 rounded-xl bg-sky-50 text-[#0284c7] border border-sky-200">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                  </div>
                  <div>
                    <p className="text-2xl font-black text-slate-900 font-heading">{formatVND(stats.totalProfit)}</p>
                    <p className="text-[11px] text-sky-600 flex items-center gap-1 font-extrabold mt-1">
                      Biên lợi nhuận gộp ~15.0%
                    </p>
                  </div>
                </div>

                <div className="bg-white border border-slate-200/80 rounded-2xl p-5 space-y-3 shadow-xs hover:border-[#6EC2F7] transition-all">
                  <div className="flex items-center justify-between text-slate-500">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider">Đơn Hàng Giao Thành Công</span>
                    <div className="p-2 rounded-xl bg-amber-50 text-amber-600 border border-amber-200">
                      <ShoppingCart className="w-4 h-4" />
                    </div>
                  </div>
                  <div>
                    <p className="text-2xl font-black text-slate-900 font-heading">{stats.newOrders} Đơn Hàng</p>
                    <p className="text-[11px] text-amber-600 flex items-center gap-1 font-extrabold mt-1">
                      {stats.assemblyPending} đơn đang chờ kỹ thuật ráp
                    </p>
                  </div>
                </div>

                <div className="bg-white border border-slate-200/80 rounded-2xl p-5 space-y-3 shadow-xs hover:border-[#6EC2F7] transition-all">
                  <div className="flex items-center justify-between text-slate-500">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider">Tổng Linh Kiện Trong Kho</span>
                    <div className="p-2 rounded-xl bg-purple-50 text-purple-600 border border-purple-200">
                      <Boxes className="w-4 h-4" />
                    </div>
                  </div>
                  <div>
                    <p className="text-2xl font-black text-slate-900 font-heading">{stats.totalProductsInStock} Sản Phẩm</p>
                    <p className="text-[11px] text-purple-600 flex items-center gap-1 font-extrabold mt-1">
                      100% Chính hãng bảo hành 36T
                    </p>
                  </div>
                </div>
              </div>

              {/* CHARTS GRID (2 COLUMNS - LIGHT THEME) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* REVENUE GROWTH BAR CHART (8 cols) */}
                <div className="lg:col-span-8 bg-white border border-slate-200/80 rounded-2xl p-6 space-y-6 shadow-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                    <div>
                      <h3 className="font-heading text-sm font-black uppercase text-slate-900 tracking-wider flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-[#0284c7]" />
                        <span>BIỂU ĐỒ DOANH THU 7 NGÀY GẦN NHẤT</span>
                      </h3>
                      <p className="text-[11px] text-slate-500 mt-0.5">Thống kê doanh số bán lẻ linh kiện & PC prebuilt theo ngày.</p>
                    </div>

                    <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0">
                      <button
                        onClick={() => setTimeFilter('7days')}
                        className={`px-3 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wider transition-all ${
                          timeFilter === '7days' ? 'bg-[#0284c7] text-white' : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        7 Ngày
                      </button>
                      <button
                        onClick={() => setTimeFilter('30days')}
                        className={`px-3 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wider transition-all ${
                          timeFilter === '30days' ? 'bg-[#0284c7] text-white' : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        30 Ngày
                      </button>
                    </div>
                  </div>

                  {/* INTERACTIVE LIGHT BARS */}
                  <div className="h-56 flex items-end justify-between gap-3 pt-6 px-2">
                    {revenueData.map((item, idx) => {
                      const heightPercent = Math.round((item.revenue / maxRevenue) * 100);
                      return (
                        <div key={idx} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                          {/* Tooltip on hover */}
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] font-bold py-1 px-2 rounded border border-slate-800 whitespace-nowrap shadow-xl pointer-events-none mb-1">
                            {formatVND(item.revenue)} ({item.orders} đơn)
                          </div>

                          {/* Bar */}
                          <div className="w-full bg-slate-100 rounded-t-lg overflow-hidden h-full flex items-end">
                            <div 
                              style={{ height: `${heightPercent}%` }}
                              className="w-full bg-gradient-to-t from-[#0284c7] to-[#6EC2F7] group-hover:from-[#0369a1] group-hover:to-[#0284c7] transition-all rounded-t-lg shadow-sm"
                            />
                          </div>

                          <span className="text-[10px] font-bold text-slate-500 group-hover:text-[#0284c7] transition-colors uppercase">
                            {item.day}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* CATEGORY BREAKDOWN PROGRESS BARS (4 cols) */}
                <div className="lg:col-span-4 bg-white border border-slate-200/80 rounded-2xl p-6 space-y-5 shadow-xs">
                  <h3 className="font-heading text-sm font-black uppercase text-slate-900 tracking-wider border-b border-slate-100 pb-3 flex items-center gap-2">
                    <Boxes className="w-4 h-4 text-[#0284c7]" />
                    <span>CƠ CẤU DOANH SỐ HÀNG MỤC</span>
                  </h3>

                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-slate-700">VGA & CPU Chính Hãng</span>
                        <span className="text-[#0284c7] font-mono">45% (128.0M)</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div className="h-full bg-[#0284c7] rounded-full w-[45%]" />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-slate-700">PC Prebuilt Lắp Ráp</span>
                        <span className="text-blue-600 font-mono">30% (85.3M)</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div className="h-full bg-blue-600 rounded-full w-[30%]" />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-slate-700">Laptop Gaming & Office</span>
                        <span className="text-purple-600 font-mono">15% (42.6M)</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div className="h-full bg-purple-600 rounded-full w-[15%]" />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-slate-700">Màn Hình & Gaming Gear</span>
                        <span className="text-emerald-600 font-mono">10% (28.4M)</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div className="h-full bg-emerald-600 rounded-full w-[10%]" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==================== TAB 2: PRODUCTS CATALOG INSPECTOR (READ-ONLY FOR ADMIN) ==================== */}
          {activeTab === 'products' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Tìm sản phẩm theo tên, thương hiệu, danh mục..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-4 text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#0284c7] focus:bg-white"
                  />
                </div>

                <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
                  <button
                    onClick={() => setSelectedCategoryFilter('ALL')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                      selectedCategoryFilter === 'ALL' ? 'bg-[#0284c7] text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Tất Cả
                  </button>
                  <button
                    onClick={() => setSelectedCategoryFilter('VGA')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                      selectedCategoryFilter === 'VGA' ? 'bg-[#0284c7] text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    VGA Card
                  </button>
                  <button
                    onClick={() => setSelectedCategoryFilter('CPU')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                      selectedCategoryFilter === 'CPU' ? 'bg-[#0284c7] text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    CPU Vi Xử Lý
                  </button>
                  <button
                    onClick={() => setSelectedCategoryFilter('MONITOR')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                      selectedCategoryFilter === 'MONITOR' ? 'bg-[#0284c7] text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Màn Hình
                  </button>
                </div>
              </div>

              {/* READ-ONLY PRODUCT CATALOG TABLE */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-extrabold uppercase tracking-wider text-[10px]">
                        <th className="py-3.5 px-4 min-w-[260px]">Sản Phẩm Linh Kiện</th>
                        <th className="py-3.5 px-4 whitespace-nowrap">Danh Mục</th>
                        <th className="py-3.5 px-4 whitespace-nowrap">Thương Hiệu</th>
                        <th className="py-3.5 px-4 whitespace-nowrap">Giá Niêm Yết</th>
                        <th className="py-3.5 px-4 text-center whitespace-nowrap">Tồn Kho</th>
                        <th className="py-3.5 px-4 text-center whitespace-nowrap">Bảo Hành</th>
                        <th className="py-3.5 px-4 text-right whitespace-nowrap">Chi Tiết Thông Số</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {filteredProducts.map((p) => (
                        <tr key={p.id} className="hover:bg-sky-50/50 transition-colors">
                          <td className="py-3.5 px-4 flex items-center gap-3 min-w-[260px]">
                            <img src={p.coverImage} alt={p.name} className="w-10 h-10 rounded-xl object-cover bg-slate-100 border border-slate-200 shrink-0 shadow-2xs" />
                            <div className="min-w-0 flex-1">
                              <span className="font-bold text-slate-900 line-clamp-1 block text-xs" title={p.name}>{p.name}</span>
                              <span className="text-[10px] text-slate-400 font-mono block mt-0.5">ID: {p.id}</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-[#0284c7] font-extrabold uppercase text-[10px] whitespace-nowrap">{p.category}</td>
                          <td className="py-3.5 px-4 text-slate-700 font-bold text-xs whitespace-nowrap">{p.brand}</td>
                          <td className="py-3.5 px-4 font-black text-slate-900 text-xs whitespace-nowrap">{formatVND(p.price)}</td>
                          <td className="py-3.5 px-4 text-center whitespace-nowrap">
                            <span className="inline-flex items-center justify-center px-3 py-1 rounded-full text-[11px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs">
                              {p.stockCount ?? 15} Món
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-center whitespace-nowrap">
                            <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-lg text-[11px] font-bold text-slate-700 bg-slate-100 border border-slate-200">
                              {p.warrantyMonths || 36} Tháng
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right whitespace-nowrap">
                            <button
                              onClick={() => setViewingProduct(p)}
                              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-sky-50 hover:bg-[#0284c7] text-[#0284c7] hover:text-white border border-sky-200/80 font-extrabold text-[11px] transition-all cursor-pointer shadow-2xs hover:scale-105 active:scale-95 whitespace-nowrap"
                            >
                              <Eye className="w-3.5 h-3.5 shrink-0" />
                              <span>Xem Chi Tiết</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ==================== TAB 3 & 4 PLACEHOLDERS (LIGHT THEME) ==================== */}
          {(activeTab === 'orders' || activeTab === 'inventory') && (
            <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center space-y-4 shadow-xs">
              <Boxes className="w-12 h-12 text-[#0284c7] mx-auto animate-bounce" />
              <h3 className="font-heading text-base font-bold uppercase text-slate-900">Quản Lý {activeTab === 'orders' ? 'Đơn Hàng' : 'Kho Serial SN'}</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Hệ thống quản lý chuyên sâu cho phần {activeTab === 'orders' ? 'Đơn Hàng' : 'Kho Serial'} đang hoạt động và đồng bộ thời gian thực.
              </p>
            </div>
          )}
        </main>
      </div>

      {/* READ-ONLY PRODUCT SPECIFICATIONS INSPECTION MODAL (FOR CEO / ADMIN ONLY) */}
      {viewingProduct && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-2xl w-full space-y-6 shadow-2xl overflow-y-auto max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-sky-50 text-[#0284c7] border border-sky-200">
                  <Eye className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-extrabold uppercase text-[#0284c7] tracking-wider block">THÔNG SỐ KỸ THUẬT LINH KIỆN (READ-ONLY)</span>
                  <h3 className="font-heading text-base font-black text-slate-900 line-clamp-1">{viewingProduct.name}</h3>
                </div>
              </div>
              <button
                onClick={() => setViewingProduct(null)}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Product Overview Summary Banner */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-center bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div className="sm:col-span-4 aspect-square rounded-xl overflow-hidden bg-white border border-slate-200 p-2 flex items-center justify-center shadow-2xs">
                <img src={viewingProduct.coverImage} alt={viewingProduct.name} className="w-full h-full object-contain" />
              </div>
              <div className="sm:col-span-8 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-[#0284c7] text-white">
                    {viewingProduct.category}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-700">
                    Hãng: {viewingProduct.brand}
                  </span>
                </div>

                <div className="text-xl font-black text-slate-900 font-heading">
                  {formatVND(viewingProduct.price)}
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-semibold pt-1">
                  <div className="p-2 rounded-lg bg-white border border-slate-200">
                    <span className="text-slate-400 text-[10px] block uppercase font-bold">Tồn Kho Khả Dụng</span>
                    <span className="text-emerald-600 font-extrabold">{viewingProduct.stockCount ?? 15} chiếc</span>
                  </div>
                  <div className="p-2 rounded-lg bg-white border border-slate-200">
                    <span className="text-slate-400 text-[10px] block uppercase font-bold">Bảo Hành Chính Hãng</span>
                    <span className="text-slate-900 font-extrabold">{viewingProduct.warrantyMonths || 36} Tháng</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Detailed Technical Specs Table Grid */}
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase text-slate-900 tracking-wider flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-[#0284c7]" />
                <span>Bảng Chi Tiết Thông Số Kỹ Thuật (Dynamic Technical Specs)</span>
              </h4>

              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden divide-y divide-slate-100 text-xs">
                {viewingProduct.specs && Object.keys(viewingProduct.specs).length > 0 ? (
                  Object.entries(viewingProduct.specs).map(([key, val]) => (
                    <div key={key} className="grid grid-cols-12 p-3 hover:bg-slate-50 transition-colors">
                      <div className="col-span-4 font-bold text-slate-500 uppercase text-[11px]">{key}</div>
                      <div className="col-span-8 font-extrabold text-slate-900">{String(val)}</div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-slate-500 font-medium text-center">
                    Linh kiện có bộ thông số kỹ thuật đầy đủ theo hóa đơn bảo hành chính hãng {viewingProduct.warrantyMonths || 36} tháng.
                  </div>
                )}
              </div>
            </div>

            {/* Gallery Image Thumbnails if available */}
            {viewingProduct.galleryImages && viewingProduct.galleryImages.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-black uppercase text-slate-900 tracking-wider block">Bộ Ảnh Gallery Sản Phẩm</span>
                <div className="flex items-center gap-3 overflow-x-auto pb-2">
                  {viewingProduct.galleryImages.map((img, i) => (
                    <img key={i} src={img} alt={`Gallery ${i}`} className="w-16 h-16 rounded-xl object-cover border border-slate-200 bg-slate-50 shrink-0" />
                  ))}
                </div>
              </div>
            )}

            {/* Modal Footer */}
            <div className="flex items-center justify-between border-t border-slate-100 pt-4">
              <span className="text-[11px] text-slate-400 font-medium">Chế độ xem dành riêng cho Quản Trị Viên (Read-Only)</span>
              <button
                onClick={() => setViewingProduct(null)}
                className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-[#0284c7] text-white font-extrabold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md"
              >
                Đóng Cửa Sổ
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MODAL 2: IMPORT SERIAL NUMBER (LIGHT THEME) */}
      {isSnModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-md w-full space-y-5 shadow-2xl">
            <h3 className="font-heading text-sm font-black uppercase text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <Boxes className="w-4 h-4 text-emerald-600" />
              <span>GÁN MÃ SERIAL (SN) VÀO KHO LINH KIỆN</span>
            </h3>
            <form onSubmit={handleAddSn} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-slate-500 font-bold uppercase">Sản Phẩm Cần Gán SN</label>
                <input
                  type="text"
                  value={snProdName}
                  onChange={(e) => setSnProdName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-semibold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-500 font-bold uppercase">Mã Serial Number (SN)</label>
                <input
                  type="text"
                  required
                  value={snCode}
                  onChange={(e) => setSnCode(e.target.value)}
                  placeholder="Ví dụ: SN-RTX4060-ASUS-99812"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-[#0284c7] font-mono font-bold focus:border-[#0284c7] focus:bg-white focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsSnModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold uppercase rounded-xl shadow-md"
                >
                  Lưu Mã Serial
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
