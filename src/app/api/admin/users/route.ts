import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { supabase } from '@/lib/supabase';
import bcrypt from 'bcryptjs';

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
          },
          orders: {
            select: {
              id: true,
              totalAmount: true,
              status: true,
              createdAt: true,
            }
          }
        }
      });

      if (prismaUsers && prismaUsers.length > 0) {
        usersList = prismaUsers.map((u) => {
          const totalSpent = u.orders
            ? u.orders.filter(o => o.status === 'COMPLETED').reduce((sum, o) => sum + Number(o.totalAmount || 0), 0)
            : 0;

          return {
            id: u.id,
            name: u.name || u.email.split('@')[0],
            email: u.email,
            role: u.role,
            balance: Number(u.balance || 0),
            phone: u.phone,
            address: u.address,
            createdAt: u.createdAt.toISOString(),
            _count: u._count,
            totalSpent,
          };
        });
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
            totalSpent: 0,
          }));
        }
      } catch (e) {
        console.warn('Supabase users fetch error:', e);
      }
    }

    const totalUsers = usersList.length;
    const adminCount = usersList.filter(u => u.role === 'ADMIN').length;
    const staffCount = usersList.filter(u => u.role === 'STAFF').length;
    const customerCount = usersList.filter(u => u.role === 'USER' || !u.role).length;
    const totalBalance = usersList.reduce((sum, u) => sum + Number(u.balance || 0), 0);

    return NextResponse.json({
      users: usersList,
      stats: {
        totalUsers,
        adminCount,
        staffCount,
        customerCount,
        totalBalance,
      }
    }, { status: 200 });

  } catch (error: any) {
    console.error('Lỗi khi lấy danh sách người dùng:', error);
    return NextResponse.json({ message: 'Lỗi máy chủ', users: [], stats: { totalUsers: 0, adminCount: 0, staffCount: 0, customerCount: 0, totalBalance: 0 } }, { status: 500 });
  }
}

// CREATE NEW USER (By Admin)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password, role, phone, address } = body;

    if (!email || !password) {
      return NextResponse.json({ message: 'Email và Mật khẩu là bắt buộc!' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check if user already exists
    const existing = await prisma.user.findUnique({ where: { email: cleanEmail } });
    if (existing) {
      return NextResponse.json({ message: 'Email này đã tồn tại trong hệ thống!' }, { status: 400 });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    const validRole = role === 'ADMIN' ? 'ADMIN' : role === 'STAFF' ? 'STAFF' : 'USER';

    const newUser = await prisma.user.create({
      data: {
        email: cleanEmail,
        name: name || cleanEmail.split('@')[0],
        password: hashedPassword,
        role: validRole,
        phone: phone || null,
        address: address || null,
        balance: 0,
      }
    });

    return NextResponse.json({
      success: true,
      message: `Đã tạo tài khoản ${validRole} (${cleanEmail}) thành công!`,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        phone: newUser.phone,
        address: newUser.address,
        createdAt: newUser.createdAt.toISOString(),
      }
    }, { status: 201 });

  } catch (error: any) {
    console.error('Lỗi tạo tài khoản (Admin):', error);
    return NextResponse.json({ message: error.message || 'Lỗi khi tạo tài khoản' }, { status: 500 });
  }
}

// UPDATE USER DETAILS & PERMISSIONS & PASSWORD (By Admin)
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { userId, email, name, phone, address, balance, role, newPassword } = body;

    if (!userId && !email) {
      return NextResponse.json({ message: 'Thiếu ID hoặc Email người dùng' }, { status: 400 });
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;
    if (address !== undefined) updateData.address = address;
    if (balance !== undefined) updateData.balance = Number(balance);
    if (role !== undefined) updateData.role = role;
    if (newPassword && typeof newPassword === 'string' && newPassword.length >= 6) {
      updateData.password = bcrypt.hashSync(newPassword, 10);
    }

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
      message: 'Đã cập nhật thông tin tài khoản người dùng thành công!',
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        phone: updatedUser.phone,
        address: updatedUser.address,
      },
    }, { status: 200 });

  } catch (error: any) {
    console.error('Lỗi cập nhật user (Admin):', error);
    return NextResponse.json({ message: error.message || 'Lỗi cập nhật' }, { status: 500 });
  }
}

// DELETE USER ACCOUNT (By Admin)
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ message: 'Thiếu ID người dùng cần xóa' }, { status: 400 });
    }

    // Safety check: protect master admin
    const targetUser = await prisma.user.findUnique({ where: { id: userId } });
    if (targetUser && targetUser.email === 'admin@drx.vn') {
      return NextResponse.json({ message: 'Không thể xóa tài khoản Quản trị viên Master (admin@drx.vn)!' }, { status: 403 });
    }

    await prisma.user.delete({
      where: { id: userId },
    });

    return NextResponse.json({
      success: true,
      message: 'Đã xóa tài khoản thành công khỏi hệ thống!',
    }, { status: 200 });

  } catch (error: any) {
    console.error('Lỗi xóa user (Admin):', error);
    return NextResponse.json({ message: error.message || 'Lỗi khi xóa người dùng' }, { status: 500 });
  }
}
