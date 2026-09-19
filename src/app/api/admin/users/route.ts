import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

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
        (u.id && (String(u.id).startsWith('user-google-') || String(u.id).startsWith('google-'))) ||
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

    // 4. Link Orders & Statistics to Users strictly and accurately
    for (const [cleanEmail, userObj] of userMap.entries()) {
      const uPhone = (userObj.phone || '').trim().replace(/\D/g, '');
      const uId = userObj.id;

      const userOrders = supaOrders.filter(o => {
        const oUserId = o.userId;
        const oEmail = (o.customerEmail || '').trim().toLowerCase();
        const oPhone = (o.customerPhone || '').trim().replace(/\D/g, '');

        if (oUserId && (oUserId === uId || oUserId === cleanEmail)) return true;
        if (oEmail && oEmail === cleanEmail) return true;
        if (uPhone.length >= 9 && oPhone.length >= 9 && uPhone === oPhone) return true;
        return false;
      });

      const userTx = supaTransactions.filter(t => t.userId === uId || (t.userEmail && t.userEmail.toLowerCase() === cleanEmail));

      const totalSpent = userOrders.reduce((sum, o) => {
        const st = String(o.status || '').toUpperCase();
        if (st !== 'CANCELLED' && st !== 'REJECTED') {
          return sum + Number(o.netAmount || o.totalAmount || 0);
        }
        return sum;
      }, 0);

      userObj._count = { orders: userOrders.length, transactions: userTx.length };
      userObj.totalSpent = totalSpent;
      userObj.orders = userOrders;
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

    const { data: existingSupa } = await supabase
      .from('User')
      .select('id')
      .eq('email', cleanEmail)
      .maybeSingle();

    if (existingSupa) {
      return NextResponse.json({ message: 'Email này đã tồn tại trong hệ thống!' }, { status: 400 });
    }

    const { data: createdUser, error: insertErr } = await supabase
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

    if (insertErr || !createdUser) {
      throw insertErr || new Error('Lỗi thêm người dùng');
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

    const cleanEmail = email ? email.trim().toLowerCase() : undefined;

    // 1. Locate existing user in Supabase by Email or ID
    let targetUser: any = null;
    if (cleanEmail) {
      const { data } = await supabase.from('User').select('*').eq('email', cleanEmail).maybeSingle();
      if (data) targetUser = data;
    }
    if (!targetUser && userId) {
      const { data } = await supabase.from('User').select('*').eq('id', userId).maybeSingle();
      if (data) targetUser = data;
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = (typeof name === 'string' && name.trim()) ? name.trim() : targetUser?.name || 'Khách hàng DRX';
    if (phone !== undefined) updateData.phone = (typeof phone === 'string' && phone.trim()) ? phone.trim() : '';
    if (address !== undefined) updateData.address = (typeof address === 'string' && address.trim()) ? address.trim() : '';
    if (balance !== undefined) updateData.balance = Number(balance);
    if (role !== undefined) {
      const r = String(role).toUpperCase();
      updateData.role = (r === 'ADMIN' || r === 'STAFF' || r === 'USER') ? r : 'USER';
    }
    if (newPassword && typeof newPassword === 'string' && newPassword.length >= 6) {
      updateData.password = bcrypt.hashSync(newPassword, 10);
    }
    updateData.updatedAt = new Date().toISOString();

    let updatedUser: any = null;

    if (targetUser) {
      const { data, error: supaErr } = await supabase
        .from('User')
        .update(updateData)
        .eq('id', targetUser.id)
        .select('*')
        .maybeSingle();

      if (supaErr) throw new Error(supaErr.message);
      updatedUser = data || { ...targetUser, ...updateData };
    } else {
      // If user record doesn't exist yet in Supabase User table, create it with the requested info
      const newUserId = userId || `user-${Date.now()}`;
      const validRole = updateData.role || 'USER';
      const userToInsert = {
        id: newUserId,
        email: cleanEmail || `user-${Date.now()}@drx.vn`,
        name: name || (cleanEmail ? cleanEmail.split('@')[0] : 'User'),
        role: validRole,
        phone: phone || null,
        address: address || null,
        balance: balance !== undefined ? Number(balance) : 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...(newPassword ? { password: bcrypt.hashSync(newPassword, 10) } : { password: '' }),
      };

      const { data: inserted, error: insertErr } = await supabase
        .from('User')
        .insert([userToInsert])
        .select('*')
        .maybeSingle();

      if (insertErr) throw new Error(insertErr.message);
      updatedUser = inserted || userToInsert;
    }

    return NextResponse.json({
      success: true,
      message: 'Đã cập nhật thông tin tài khoản người dùng thành công!',
      user: {
        id: updatedUser?.id || userId,
        name: updatedUser?.name || name,
        email: updatedUser?.email || cleanEmail,
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

    if (supaDelErr) {
      return NextResponse.json({ message: 'Lỗi xóa người dùng: ' + supaDelErr.message }, { status: 500 });
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
