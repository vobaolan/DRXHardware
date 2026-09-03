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
    let supaUsers: any[] = [];
    try {
      const { data, error } = await supabase
        .from('User')
        .select('id, name, email, role, image, balance, phone, address, createdAt')
        .order('createdAt', { ascending: false });
      if (data && Array.isArray(data)) supaUsers = data;
    } catch (e) {
      console.warn('Supabase user fetch warning:', e);
    }

    // 2. Fetch all Orders from Supabase Order table
    let supaOrders: any[] = [];
    try {
      const { data, error } = await supabase
        .from('Order')
        .select('*')
        .order('createdAt', { ascending: false });
      if (data && Array.isArray(data)) supaOrders = data;
    } catch (e) {
      console.warn('Supabase orders fetch warning:', e);
    }

    // 3. Fetch all Transactions from Supabase
    let supaTransactions: any[] = [];
    try {
      const { data } = await supabase
        .from('Transaction')
        .select('*')
        .order('createdAt', { ascending: false });
      if (data && Array.isArray(data)) supaTransactions = data;
    } catch (e) {}

    // Populate userMap with Supabase Users
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
        orders: [],
      });
    }

    // Enrich from Prisma if available
    try {
      const prismaUsers = await prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
      });
      for (const pu of prismaUsers) {
        if (!pu.email) continue;
        const cleanEmail = pu.email.trim().toLowerCase();
        if (!userMap.has(cleanEmail)) {
          userMap.set(cleanEmail, {
            id: pu.id,
            name: pu.name || cleanEmail.split('@')[0],
            email: cleanEmail,
            role: pu.role || 'USER',
            image: pu.image || null,
            provider: 'CREDENTIALS',
            balance: Number(pu.balance || 0),
            phone: pu.phone || '',
            address: pu.address || '',
            createdAt: pu.createdAt ? new Date(pu.createdAt).toISOString() : new Date().toISOString(),
            _count: { orders: 0, transactions: 0 },
            totalSpent: 0,
            orders: [],
          });
        }
      }
    } catch (e) {}

    // 4. Link Orders & Statistics to Users (matching by userId, email, phone, or name)
    for (const [cleanEmail, userObj] of userMap.entries()) {
      const uName = (userObj.name || '').trim().toLowerCase();
      const uPhone = (userObj.phone || '').trim();
      const uId = userObj.id;

      const userOrders = supaOrders.filter(o => {
        const oUserId = o.userId;
        const oEmail = (o.customerEmail || '').trim().toLowerCase();
        const oPhone = (o.customerPhone || '').trim();
        const oName = (o.customerName || '').trim().toLowerCase();

        if (oUserId && (oUserId === uId || oUserId === cleanEmail)) return true;
        if (oEmail && oEmail === cleanEmail) return true;
        if (uPhone && oPhone && (oPhone === uPhone || oPhone.endsWith(uPhone.slice(-7)))) return true;
        if (uName && oName && (oName === uName || oName.includes(uName) || uName.includes(oName))) return true;
        return false;
      });

      const userTx = supaTransactions.filter(t => t.userId === uId || t.userEmail === cleanEmail);

      const totalSpent = userOrders.reduce((sum, o) => {
        const st = String(o.status || '').toUpperCase();
        if (st !== 'CANCELLED' && st !== 'REJECTED') {
          return sum + Number(o.netAmount || o.totalAmount || 0);
        }
        return sum;
      }, 0);

      const latestOrder = userOrders[0];
      userObj._count = { orders: userOrders.length, transactions: userTx.length };
      userObj.totalSpent = totalSpent;
      userObj.orders = userOrders;
      if (!userObj.phone && latestOrder?.customerPhone) {
        userObj.phone = latestOrder.customerPhone;
      }
      if (!userObj.address && latestOrder?.shippingAddress) {
        userObj.address = latestOrder.shippingAddress;
      }
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
