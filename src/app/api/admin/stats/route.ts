import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    let orders: any[] = [];
    let products: any[] = [];
    let serials: any[] = [];
    let users: any[] = [];

    // 1. Primary: Supabase Cloud Database (Fast Direct REST in Parallel)
    try {
      const [supaOrdersRes, supaProdsRes, supaSerialsRes, supaUsersRes] = await Promise.all([
        supabase.from('Order').select('*').order('createdAt', { ascending: false }),
        supabase.from('Product').select('id, name, price, costPrice, category, stockQuantity, status'),
        supabase.from('ProductSerial').select('id, status, productId'),
        supabase.from('User').select('id, role, createdAt')
      ]);

      if (supaOrdersRes.data) orders = supaOrdersRes.data;
      if (supaProdsRes.data) products = supaProdsRes.data;
      if (supaSerialsRes.data) serials = supaSerialsRes.data;
      if (supaUsersRes.data) users = supaUsersRes.data;
    } catch (supaErr) {
      console.warn('Supabase stats warning:', supaErr);
    }

    // 2. Fallback to Prisma if Supabase had missing counts
    if (orders.length === 0 || products.length === 0 || users.length === 0) {
      try {
        const [pOrders, pProducts, pSerials, pUsers] = await Promise.all([
          orders.length === 0 ? prisma.order.findMany({ orderBy: { createdAt: 'desc' } }) : Promise.resolve([]),
          products.length === 0 ? prisma.product.findMany({ select: { id: true, name: true, price: true, costPrice: true, category: true, stockQuantity: true, status: true } }) : Promise.resolve([]),
          serials.length === 0 ? prisma.productSerial.findMany({ select: { id: true, status: true, productId: true } }) : Promise.resolve([]),
          users.length === 0 ? prisma.user.findMany({ select: { id: true, role: true, createdAt: true } }) : Promise.resolve([])
        ]);

        if (orders.length === 0 && pOrders.length > 0) orders = pOrders;
        if (products.length === 0 && pProducts.length > 0) products = pProducts;
        if (serials.length === 0 && pSerials.length > 0) serials = pSerials;
        if (users.length === 0 && pUsers.length > 0) users = pUsers;
      } catch (pErr) {
        console.warn('Prisma stats notice:', pErr);
      }
    }

    // Calculate revenue & profits from real orders
    let totalRevenue = 0;
    let totalProfit = 0;
    let pendingOrders = 0;
    let completedOrders = 0;
    let shippingOrders = 0;
    let cancelledOrders = 0;

    orders.forEach((o) => {
      const amount = Number(o.netAmount || o.totalAmount || 0);
      if (o.status === 'COMPLETED' || o.paymentStatus === 'PAID') {
        totalRevenue += amount;
        totalProfit += Math.round(amount * 0.15);
      }
      if (o.status === 'PENDING') pendingOrders++;
      if (o.status === 'SHIPPING' || o.status === 'CONFIRMED') shippingOrders++;
      if (o.status === 'COMPLETED') completedOrders++;
      if (o.status === 'CANCELLED') cancelledOrders++;
    });

    // 7-day revenue array from real data
    const days = ['Chủ Nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
    const now = new Date();
    const last7Days: { day: string; date: string; revenue: number; orders: number }[] = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayName = days[d.getDay()];

      let dayRevenue = 0;
      let dayOrderCount = 0;

      orders.forEach((o) => {
        const orderDateStr = new Date(o.createdAt).toISOString().split('T')[0];
        if (orderDateStr === dateStr && o.status !== 'CANCELLED') {
          dayRevenue += Number(o.netAmount || o.totalAmount || 0);
          dayOrderCount++;
        }
      });

      last7Days.push({
        day: dayName,
        date: dateStr,
        revenue: dayRevenue,
        orders: dayOrderCount,
      });
    }

    // Category breakdown
    const categoryCount: Record<string, number> = {};
    products.forEach((p) => {
      categoryCount[p.category] = (categoryCount[p.category] || 0) + 1;
    });

    // Serial inventory counts
    let serialsAvailable = 0;
    let serialsSold = 0;
    let serialsWarranty = 0;
    serials.forEach((s) => {
      if (s.status === 'AVAILABLE') serialsAvailable++;
      if (s.status === 'SOLD') serialsSold++;
      if (s.status === 'WARRANTY') serialsWarranty++;
    });

    return NextResponse.json({
      stats: {
        totalRevenue,
        totalProfit,
        totalOrders: orders.length,
        pendingOrders,
        shippingOrders,
        completedOrders,
        cancelledOrders,
        totalProducts: products.length,
        totalUsers: users.length,
        totalSerials: serials.length,
        serialsAvailable,
        serialsSold,
        serialsWarranty,
      },
      last7Days,
      categoryCount,
      recentOrders: orders.slice(0, 5),
    }, { status: 200 });

  } catch (error: any) {
    console.error('Lỗi khi tính toán thống kê Admin:', error);
    return NextResponse.json({ message: 'Lỗi khi lấy dữ liệu thống kê', error: error.message }, { status: 500 });
  }
}
