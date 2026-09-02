import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    let usersList: any[] = [];

    // 1. Query Prisma directly from PostgreSQL
    try {
      const prismaUsers = await prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: { orders: true, transactions: true }
          }
        }
      });

      if (prismaUsers && prismaUsers.length > 0) {
        usersList = prismaUsers.map((u) => ({
          id: u.id,
          name: u.name || u.email.split('@')[0],
          email: u.email,
          role: u.role,
          balance: Number(u.balance || 0),
          phone: u.phone,
          address: u.address,
          createdAt: u.createdAt.toISOString(),
          _count: u._count,
        }));
      }
    } catch (e) {
      console.warn('Prisma users fetch error:', e);
    }

    // 2. Fallback to Supabase client if Prisma had no records
    if (usersList.length === 0) {
      try {
        const { data: supaUsers } = await supabase
          .from('User')
          .select('id, name, email, role, balance, phone, address, createdAt')
          .order('createdAt', { ascending: false });

        if (supaUsers && supaUsers.length > 0) {
          usersList = supaUsers.map((u: any) => ({
            id: u.id,
            name: u.name || u.email?.split('@')[0] || 'Khách hàng DRX',
            email: u.email,
            role: u.role || 'USER',
            balance: Number(u.balance ?? 0),
            phone: u.phone,
            address: u.address,
            createdAt: u.createdAt || new Date().toISOString(),
            _count: { orders: 0, transactions: 0 },
          }));
        }
      } catch (e) {
        console.warn('Supabase users fetch error:', e);
      }
    }

    const totalUsers = usersList.length;
    const totalBalance = usersList.reduce((sum, u) => sum + Number(u.balance || 0), 0);

    return NextResponse.json({
      users: usersList,
      stats: {
        totalUsers,
        totalBalance,
      }
    }, { status: 200 });

  } catch (error: any) {
    console.error('Lỗi khi lấy danh sách người dùng:', error);
    return NextResponse.json({ message: 'Lỗi máy chủ', users: [], stats: { totalUsers: 0, totalBalance: 0 } }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { userId, email, balance, role } = body;

    if (!userId && !email) {
      return NextResponse.json({ message: 'Thiếu ID hoặc Email người dùng' }, { status: 400 });
    }

    const updateData: any = {};
    if (balance !== undefined) updateData.balance = Number(balance);
    if (role !== undefined) updateData.role = role;

    let updatedUser: any = null;

    if (userId) {
      updatedUser = await prisma.user.update({
        where: { id: userId },
        data: updateData,
      });
    } else if (email) {
      updatedUser = await prisma.user.update({
        where: { email },
        data: updateData,
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Đã cập nhật thông tin người dùng thành công!',
      user: updatedUser,
    }, { status: 200 });

  } catch (error: any) {
    console.error('Lỗi cập nhật user (Admin):', error);
    return NextResponse.json({ message: error.message || 'Lỗi cập nhật' }, { status: 500 });
  }
}
