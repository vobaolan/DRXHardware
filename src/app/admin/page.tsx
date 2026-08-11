"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  ShieldCheck, 
  TrendingUp, 
  DollarSign, 
  AlertTriangle, 
  Plus, 
  Search, 
  Printer, 
  Eye, 
  CheckCircle2, 
  XCircle,
  Truck,
  ArrowUpRight,
  ChevronRight,
  Boxes,
  Cpu
} from 'lucide-react';
import { INITIAL_PRODUCTS, HardwareProduct } from '@/lib/hardware-data';

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders' | 'inventory'>('overview');
  const [products, setProducts] = useState<HardwareProduct[]>(INITIAL_PRODUCTS);
  const [searchQuery, setSearchQuery] = useState('');

  // Admin Mock Stats
  const stats = {
    totalRevenue: 284500000,
    totalProfit: 42100000,
    newOrders: 14,
    lowStockAlerts: 3,
  };

  const [mockOrders, setMockOrders] = useState([
    {
      id: "ODS1001",
      customerName: "Nguyễn Văn Hùng",
      phone: "0908889999",
      items: "Card RTX 4060 8GB + Core i5 13400F",
      total: 13480000,
      paymentMethod: "VIETQR",
      paymentStatus: "PAID",
      status: "CONFIRMED",
      date: "2026-08-11 09:15"
    },
    {
      id: "ODS1002",
      customerName: "Trần Thị Mai",
      phone: "0912345678",
      items: "PC Gaming ODS Venom RTX 4060",
      total: 16990000,
      paymentMethod: "COD",
      paymentStatus: "PENDING",
      status: "PENDING",
      date: "2026-08-11 08:30"
    },
    {
      id: "ODS1003",
      customerName: "Lê Hoàng Nam",
      phone: "0977112233",
      items: "SSD Samsung 990 PRO 1TB",
      total: 2890000,
      paymentMethod: "VIETQR",
      paymentStatus: "PAID",
      status: "COMPLETED",
      date: "2026-08-10 16:45"
    }
  ]);

  const formatVND = (num: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num);
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      
      {/* Admin Top Header */}
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center justify-between sticky top-0 z-40 shadow-xl">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black">
              <Cpu className="w-5 h-5" />
            </div>
            <span className="text-lg font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-300">
              ODS ADMIN PORTAL
            </span>
          </Link>
          <span className="text-xs bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2.5 py-0.5 rounded-full font-bold uppercase">
            Quản Lý Bán Hàng & Kho
          </span>
        </div>

        <div className="flex items-center gap-4 text-xs font-semibold">
          <Link href="/" className="text-slate-400 hover:text-white flex items-center gap-1">
            <span>← Quay về Website Bán Hàng</span>
          </Link>
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
            AD
          </div>
        </div>
      </header>

      {/* Main Admin Body */}
      <div className="flex-1 flex flex-col md:flex-row">
        
        {/* Sidebar Navigation */}
        <aside className="w-full md:w-64 bg-slate-900/60 border-r border-slate-800/80 p-4 space-y-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'overview' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-400 hover:bg-slate-800/80 hover:text-white'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Tổng Quan Doanh Thu</span>
          </button>

          <button
            onClick={() => setActiveTab('products')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'products' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-400 hover:bg-slate-800/80 hover:text-white'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Quản Lý Linh Kiện & SKU</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'orders' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-400 hover:bg-slate-800/80 hover:text-white'
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Quản Lý Đơn Hàng</span>
          </button>

          <button
            onClick={() => setActiveTab('inventory')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'inventory' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-400 hover:bg-slate-800/80 hover:text-white'
            }`}
          >
            <Boxes className="w-4 h-4" />
            <span>Kho Linh Kiện & Serial BH</span>
          </button>
        </aside>

        {/* Main Content Dashboard */}
        <main className="flex-1 p-6 md:p-8 space-y-8 overflow-y-auto">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              
              {/* Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-2">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-xs font-bold uppercase">Tổng Doanh Thu</span>
                    <DollarSign className="w-5 h-5 text-emerald-400" />
                  </div>
                  <p className="text-2xl font-black text-white">{formatVND(stats.totalRevenue)}</p>
                  <p className="text-[11px] text-emerald-400 flex items-center gap-1 font-semibold">
                    <ArrowUpRight className="w-3.5 h-3.5" /> +18.4% so với tháng trước
                  </p>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-2">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-xs font-bold uppercase">Lợi Nhuận Ròng Ước Tính</span>
                    <TrendingUp className="w-5 h-5 text-blue-400" />
                  </div>
                  <p className="text-2xl font-black text-blue-400">{formatVND(stats.totalProfit)}</p>
                  <p className="text-[11px] text-slate-400">Tỷ suất lợi nhuận ~14.8%</p>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-2">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-xs font-bold uppercase">Đơn Hàng Mới</span>
                    <ShoppingCart className="w-5 h-5 text-amber-400" />
                  </div>
                  <p className="text-2xl font-black text-amber-400">{stats.newOrders} Đơn</p>
                  <p className="text-[11px] text-amber-400 font-semibold">2 đơn chờ xác nhận</p>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-2">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-xs font-bold uppercase">Cảnh Báo Hết Kho</span>
                    <AlertTriangle className="w-5 h-5 text-rose-400" />
                  </div>
                  <p className="text-2xl font-black text-rose-400">{stats.lowStockAlerts} Mặt hàng</p>
                  <p className="text-[11px] text-rose-400 font-semibold">Cần nhập thêm kho ngay</p>
                </div>
              </div>

              {/* Recent Orders Overview */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-white">Đơn Hàng Gần Đây</h3>
                  <button onClick={() => setActiveTab('orders')} className="text-xs text-blue-400 hover:text-blue-300 font-semibold">Xem tất cả →</button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-950 text-slate-400 uppercase font-bold text-[10px]">
                      <tr>
                        <th className="p-3">Mã Đơn</th>
                        <th className="p-3">Khách Hàng</th>
                        <th className="p-3">Linh Kiện Mua</th>
                        <th className="p-3">Tổng Tiền</th>
                        <th className="p-3">Thanh Toán</th>
                        <th className="p-3">Trạng Thái</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {mockOrders.map((ord) => (
                        <tr key={ord.id} className="hover:bg-slate-800/50 transition-colors">
                          <td className="p-3 font-mono font-bold text-blue-400">{ord.id}</td>
                          <td className="p-3 font-medium text-white">{ord.customerName} <span className="block text-[10px] text-slate-500">{ord.phone}</span></td>
                          <td className="p-3">{ord.items}</td>
                          <td className="p-3 font-bold text-emerald-400">{formatVND(ord.total)}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${ord.paymentStatus === 'PAID' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'}`}>
                              {ord.paymentMethod} ({ord.paymentStatus})
                            </span>
                          </td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-bold text-[10px]">
                              {ord.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: PRODUCTS */}
          {activeTab === 'products' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-white">Quản Lý Danh Mục Linh Kiện Máy Tính</h2>
                  <p className="text-xs text-slate-400 mt-1">Tổng số: {products.length} mã linh kiện trong hệ thống</p>
                </div>

                <button className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-2 transition-colors shadow-lg shadow-blue-600/20">
                  <Plus className="w-4 h-4" />
                  <span>Thêm Linh Kiện Mới</span>
                </button>
              </div>

              {/* Filter / Search Bar */}
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm kiếm theo tên linh kiện, hãng (ASUS, Intel, MSI...), loại (CPU, VGA...)"
                  className="w-full bg-slate-900 border border-slate-800 text-sm text-slate-100 rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:border-blue-500"
                />
                <Search className="w-5 h-5 text-slate-500 absolute left-3.5 top-3.5" />
              </div>

              {/* Product Table */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-950 text-slate-400 uppercase font-bold text-[10px]">
                      <tr>
                        <th className="p-4">Hình ảnh</th>
                        <th className="p-4">Tên Linh Kiện & SKU</th>
                        <th className="p-4">Loại & Hãng</th>
                        <th className="p-4">Giá Nhập / Bán</th>
                        <th className="p-4">Tồn Kho</th>
                        <th className="p-4">Bảo Hành</th>
                        <th className="p-4 text-right">Thao Tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {filteredProducts.map((p) => (
                        <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="p-4">
                            <img src={p.coverImage} alt={p.name} className="w-12 h-12 rounded-lg object-cover bg-slate-950" />
                          </td>
                          <td className="p-4 font-semibold text-white max-w-xs">
                            <p className="line-clamp-2">{p.name}</p>
                            <span className="text-[10px] text-slate-500 font-mono">SKU: {p.modelCode || p.id}</span>
                          </td>
                          <td className="p-4">
                            <span className="px-2 py-0.5 rounded bg-slate-800 text-blue-300 font-bold text-[10px] block w-fit mb-1">{p.category}</span>
                            <span className="text-slate-400">{p.brand}</span>
                          </td>
                          <td className="p-4">
                            <span className="font-bold text-emerald-400 block">{formatVND(p.discountPrice || p.price)}</span>
                            {p.costPrice && <span className="text-[10px] text-slate-500">Vốn: {formatVND(p.costPrice)}</span>}
                          </td>
                          <td className="p-4 font-bold text-slate-200">
                            <span className={`px-2 py-0.5 rounded ${p.stockQuantity < 10 ? 'bg-rose-500/20 text-rose-300' : 'bg-slate-800 text-slate-200'}`}>
                              {p.stockQuantity} chiếc
                            </span>
                          </td>
                          <td className="p-4 font-semibold text-cyan-400">{p.warrantyMonths} Tháng</td>
                          <td className="p-4 text-right space-x-2">
                            <button className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300" title="Chỉnh sửa">
                              ✏️
                            </button>
                            <button className="p-1.5 rounded bg-rose-500/20 hover:bg-rose-500/30 text-rose-400" title="Xóa">
                              🗑️
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

          {/* TAB 3: ORDERS */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-white">Quản Lý Đơn Hàng & Xuất Hóa Đơn</h2>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl p-6 space-y-4">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-950 text-slate-400 uppercase font-bold text-[10px]">
                      <tr>
                        <th className="p-3">Mã Đơn</th>
                        <th className="p-3">Thời Gian</th>
                        <th className="p-3">Khách Hàng</th>
                        <th className="p-3">Sản Phẩm</th>
                        <th className="p-3">Tổng Tiền</th>
                        <th className="p-3">Cổng Thanh Toán</th>
                        <th className="p-3">Trạng Thái</th>
                        <th className="p-3 text-right">In Hóa Đơn</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {mockOrders.map((ord) => (
                        <tr key={ord.id} className="hover:bg-slate-800/40">
                          <td className="p-3 font-mono font-bold text-blue-400">{ord.id}</td>
                          <td className="p-3 text-slate-400">{ord.date}</td>
                          <td className="p-3 font-medium text-white">{ord.customerName} <span className="block text-[10px] text-slate-500">{ord.phone}</span></td>
                          <td className="p-3">{ord.items}</td>
                          <td className="p-3 font-bold text-emerald-400">{formatVND(ord.total)}</td>
                          <td className="p-3 font-semibold text-cyan-300">{ord.paymentMethod}</td>
                          <td className="p-3">
                            <span className="px-2.5 py-1 rounded bg-blue-500/20 text-blue-300 font-bold text-[10px]">
                              {ord.status}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            <button 
                              onClick={() => window.print()} 
                              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 ml-auto border border-slate-700"
                            >
                              <Printer className="w-3.5 h-3.5 text-cyan-400" />
                              <span>In Hóa Đơn</span>
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

          {/* TAB 4: INVENTORY */}
          {activeTab === 'inventory' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-white">Quản Lý Mã Serial Number & Tem Bảo Hành</h2>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
                <p className="text-xs text-slate-400">
                  Hệ thống tự động theo dõi mã Serial duy nhất của từng linh kiện vật lý để quản lý thời hạn bảo hành chính xác khi xuất kho bán cho khách hàng.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block">Tổng số Serial sẵn trong kho:</span>
                    <span className="text-2xl font-black text-emerald-400">142 Serial</span>
                  </div>
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block">Serial đã xuất theo đơn:</span>
                    <span className="text-2xl font-black text-blue-400">89 Serial</span>
                  </div>
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block">Đang nhận bảo hành sửa chữa:</span>
                    <span className="text-2xl font-black text-amber-400">2 Serial</span>
                  </div>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

    </div>
  );
}
