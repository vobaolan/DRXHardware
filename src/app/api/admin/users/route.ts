import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { supabase } from '@/lib/supabase';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

export async function GET() {
  const headers = {
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
    'Surrogate-Control': 'no-store'
  };

  try {
    const userMap = new Map<string, any>();

    // 1. Fetch from Supabase User table (Real-time Cloud Database)
    try {
      const { data: supaUsers, error: supaErr } = await supabase
        .from('User')
        .select('id, name, email, role, image, balance, phone, address, createdAt')
        .order('createdAt', { ascending: false });

      if (supaUsers && supaUsers.length > 0) {
        for (const u of supaUsers) {
          if (!u.email) continue;
          const cleanEmail = u.email.trim().toLowerCase();
          const isGoogleUser = Boolean(
            (u.image && String(u.image).includes('googleusercontent')) ||
            (!u.password && u.image)
          );

          userMap.set(cleanEmail, {
            id: u.id,
            name: u.name || u.email?.split('@')[0] || 'Khách hàng DRX',
            email: cleanEmail,
            role: u.role || 'USER',
            image: u.image || null,
            provider: isGoogleUser ? 'GOOGLE' : 'CREDENTIALS',
            balance: Number(u.balance ?? 0),
            phone: u.phone || '',
            address: u.address || '',
            createdAt: u.createdAt || new Date().toISOString(),
            _count: { orders: 0, transactions: 0 },
            totalSpent: 0,
          });
        }
      }
    } catch (supaErr) {
      console.warn('Supabase users fetch error:', supaErr);
    }

    // 2. Query Prisma PostgreSQL and merge/enrich with order statistics
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
        for (const u of prismaUsers) {
          if (!u.email) continue;
          const cleanEmail = u.email.trim().toLowerCase();
          const totalSpent = u.orders
            ? u.orders.filter(o => o.status === 'COMPLETED').reduce((sum, o) => sum + Number(o.totalAmount || 0), 0)
            : 0;

          const isGoogleUser = Boolean(
            (u.image && u.image.includes('googleusercontent')) ||
            (!u.password && u.image)
          );

          const existing = userMap.get(cleanEmail);
          userMap.set(cleanEmail, {
            id: existing?.id || u.id,
            name: existing?.name || u.name || cleanEmail.split('@')[0],
            email: cleanEmail,
            role: existing?.role || u.role || 'USER',
            image: existing?.image || u.image || null,
            provider: isGoogleUser ? 'GOOGLE' : 'CREDENTIALS',
            balance: Number(existing?.balance ?? u.balance ?? 0),
            phone: existing?.phone || u.phone || '',
            address: existing?.address || u.address || '',
            createdAt: existing?.createdAt || u.createdAt?.toISOString() || new Date().toISOString(),
            _count: u._count || existing?._count || { orders: 0, transactions: 0 },
            totalSpent: totalSpent || existing?.totalSpent || 0,
          });
        }
      }
    } catch (prismaErr) {
      console.warn('Prisma users fetch warning:', prismaErr);
    }

    const usersList: any[] = Array.from(userMap.values()).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    const totalUsers = usersList.length;
    const adminCount = usersList.filter(u => u.role === 'ADMIN').length;
    const staffCount = usersList.filter(u => u.role === 'STAFF').length;
    const customerCount = usersList.filter(u => u.role === 'USER' || !u.role).length;
    const googleCount = usersList.filter(u => u.provider === 'GOOGLE').length;
    const totalBalance = usersList.reduce((sum, u) => sum + Number(u.balance || 0), 0);

    return NextResponse.json({
      users: usersList,
      stats: {
        totalUsers,
        adminCount,
        staffCount,
        customerCount,
        googleCount,
        totalBalance,
      }
    }, { status: 200, headers });

  } catch (error: any) {
    console.error('Lỗi khi lấy danh sách người dùng:', error);
    return NextResponse.json({ 
      message: 'Lỗi máy chủ', 
      users: [], 
      stats: { totalUsers: 0, adminCount: 0, staffCount: 0, customerCount: 0, googleCount: 0, totalBalance: 0 } 
    }, { status: 500, headers });
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
    const hashedPassword = bcrypt.hashSync(password, 10);
    const validRole = role === 'ADMIN' ? 'ADMIN' : role === 'STAFF' ? 'STAFF' : 'USER';
    const userName = name || cleanEmail.split('@')[0];

    let createdUser: any = null;

    // 1. Try Prisma
    try {
      const existing = await prisma.user.findUnique({ where: { email: cleanEmail } });
      if (existing) {
        return NextResponse.json({ message: 'Email này đã tồn tại trong hệ thống!' }, { status: 400 });
      }

      createdUser = await prisma.user.create({
        data: {
          email: cleanEmail,
          name: userName,
          password: hashedPassword,
          role: validRole as any,
          phone: phone || null,
          address: address || null,
          balance: 0,
        }
      });
    } catch (prismaErr) {
      console.warn('Prisma create user warning, falling back to Supabase:', prismaErr);
    }

    // 2. Fallback to Supabase
    if (!createdUser) {
      try {
        const { data: existingSupa } = await supabase
          .from('User')
          .select('id')
          .eq('email', cleanEmail)
          .maybeSingle();

        if (existingSupa) {
          return NextResponse.json({ message: 'Email này đã tồn tại trong hệ thống!' }, { status: 400 });
        }

        const { data: supaNew, error: insertErr } = await supabase
          .from('User')
          .insert([{
            id: 'user-' + Date.now(),
            email: cleanEmail,
            name: userName,
            password: hashedPassword,
            role: validRole,
            phone: phone || null,
            address: address || null,
            balance: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }])
          .select('*')
          .single();

        if (insertErr) {
          throw insertErr;
        }
        createdUser = supaNew;
      } catch (supaErr: any) {
        console.error('Supabase create user error:', supaErr);
        throw supaErr;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Đã tạo tài khoản ${validRole} (${cleanEmail}) thành công!`,
      user: {
        id: createdUser.id,
        name: createdUser.name,
        email: createdUser.email,
        role: createdUser.role,
        phone: createdUser.phone,
        address: createdUser.address,
        createdAt: createdUser.createdAt ? new Date(createdUser.createdAt).toISOString() : new Date().toISOString(),
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
    updateData.updatedAt = new Date().toISOString();

    let updatedUser: any = null;

    // 1. Update in Supabase User table (Primary Cloud DB)
    try {
      const query = supabase.from('User');
      let supaBuilder;
      if (userId) {
        supaBuilder = query.update(updateData).eq('id', userId);
      } else {
        supaBuilder = query.update(updateData).eq('email', email);
      }

      const { data: supaUpdated, error: supaErr } = await supaBuilder.select('*').maybeSingle();
      if (!supaErr && supaUpdated) {
        updatedUser = supaUpdated;
      }
    } catch (supaErr: any) {
      console.warn('Supabase update execution error:', supaErr);
    }

    // 2. Also update in Prisma PostgreSQL if available
    try {
      if (userId) {
        const pUpdated = await prisma.user.update({
          where: { id: userId },
          data: updateData,
        });
        if (!updatedUser) updatedUser = pUpdated;
      } else if (email) {
        const pUpdated = await prisma.user.update({
          where: { email },
          data: updateData,
        });
        if (!updatedUser) updatedUser = pUpdated;
      }
    } catch (prismaErr) {
      console.warn('Prisma user update error notice:', prismaErr);
    }

    return NextResponse.json({
      success: true,
      message: 'Đã cập nhật thông tin tài khoản người dùng thành công!',
      user: {
        id: updatedUser?.id || userId,
        name: updatedUser?.name || name,
        email: updatedUser?.email || email,
        role: updatedUser?.role || role,
        phone: updatedUser?.phone || phone,
        address: updatedUser?.address || address,
      },
    }, { status: 200 });

  } catch (error: any) {
    console.error('Lỗi cập nhật user (Admin):', error);
    return NextResponse.json({ message: error.message || 'Lỗi cập nhật tài khoản' }, { status: 500 });
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
    if (userId.includes('admin@drx.vn')) {
      return NextResponse.json({ message: 'Không thể xóa tài khoản Quản trị viên Master (admin@drx.vn)!' }, { status: 403 });
    }

    let deleted = false;

    // 1. Delete from Supabase User table
    try {
      const { data: targetSupa } = await supabase
        .from('User')
        .select('email')
        .eq('id', userId)
        .maybeSingle();

      if (targetSupa && targetSupa.email === 'admin@drx.vn') {
        return NextResponse.json({ message: 'Không thể xóa tài khoản Quản trị viên Master (admin@drx.vn)!' }, { status: 403 });
      }

      const { error: supaDelErr } = await supabase
        .from('User')
        .delete()
        .eq('id', userId);

      if (!supaDelErr) deleted = true;
    } catch (supaErr: any) {
      console.warn('Supabase delete user error:', supaErr);
    }

    // 2. Also delete from Prisma
    try {
      const targetUser = await prisma.user.findUnique({ where: { id: userId } });
      if (targetUser && targetUser.email === 'admin@drx.vn') {
        return NextResponse.json({ message: 'Không thể xóa tài khoản Quản trị viên Master (admin@drx.vn)!' }, { status: 403 });
      }

      await prisma.user.delete({
        where: { id: userId },
      });
      deleted = true;
    } catch (prismaErr) {
      console.warn('Prisma delete user notice:', prismaErr);
    }

    return NextResponse.json({
      success: true,
      message: 'Đã xóa tài khoản thành công khỏi hệ thống Database!',
    }, { status: 200 });

  } catch (error: any) {
    console.error('Lỗi xóa user (Admin):', error);
    return NextResponse.json({ message: error.message || 'Lỗi khi xóa người dùng' }, { status: 500 });
  }
}
