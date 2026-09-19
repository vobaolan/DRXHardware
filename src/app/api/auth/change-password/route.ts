import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { getAuthUserFromRequest, signJWT, setAuthCookie } from '@/lib/jwt';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const authUser = getAuthUserFromRequest(request);
    const body = await request.json();
    const { currentPassword, newPassword, confirmNewPassword, email } = body;

    const userEmail = (authUser?.email || email || '').trim().toLowerCase();

    if (!userEmail) {
      return NextResponse.json(
        { message: 'Chưa đăng nhập hoặc phiên làm việc đã hết hạn. Vui lòng đăng nhập lại!' },
        { status: 401 }
      );
    }

    if (!newPassword || typeof newPassword !== 'string' || newPassword.trim().length < 6) {
      return NextResponse.json(
        { message: 'Mật khẩu mới phải có tối thiểu 6 ký tự!' },
        { status: 400 }
      );
    }

    if (confirmNewPassword && newPassword !== confirmNewPassword) {
      return NextResponse.json(
        { message: 'Xác nhận mật khẩu mới không trùng khớp!' },
        { status: 400 }
      );
    }

    // 1. Locate user in Supabase / Prisma database
    let targetUser: any = null;
    try {
      let query = supabase.from('User').select('*');
      if (authUser?.sub && !authUser.sub.startsWith('google-') && authUser.sub !== 'admin-id-master') {
        query = query.eq('id', authUser.sub);
      } else {
        query = query.eq('email', userEmail);
      }
      const { data, error } = await query.limit(1).maybeSingle();
      if (!error && data) {
        targetUser = data;
      }
    } catch (e) {
      console.warn('Supabase find user warning:', e);
    }

    if (!targetUser) {
      try {
        const dbUser = await prisma.user.findFirst({
          where: {
            OR: [
              ...(userEmail ? [{ email: userEmail }] : []),
              ...(authUser?.sub && authUser.sub !== 'admin-id-master' ? [{ id: authUser.sub }] : []),
            ],
          },
        });
        if (dbUser) {
          targetUser = dbUser;
        }
      } catch (prismaErr) {
        console.warn('Prisma find user warning:', prismaErr);
      }
    }

    if (!targetUser) {
      return NextResponse.json(
        { message: 'Không tìm thấy thông tin tài khoản người dùng trong hệ thống!' },
        { status: 404 }
      );
    }

    // 2. Validate current password (if user already had a password set)
    if (targetUser.password) {
      if (!currentPassword) {
        return NextResponse.json(
          { message: 'Vui lòng nhập mật khẩu hiện tại để xác thực!' },
          { status: 400 }
        );
      }

      let isMatch = false;
      try {
        isMatch = bcrypt.compareSync(currentPassword, targetUser.password);
      } catch (e) {}

      if (!isMatch && targetUser.password === currentPassword) {
        isMatch = true;
      }

      // Allow master credentials for admin / staff
      if (!isMatch) {
        if (
          (userEmail === 'admin@drx.vn' || userEmail === 'admin@drxhardware.vn' || userEmail === 'admin@odsstore.vn') &&
          (currentPassword === '01699224729' || currentPassword === 'admin')
        ) {
          isMatch = true;
        } else if (
          userEmail === 'staff@drx.vn' &&
          (currentPassword === '01699224729' || currentPassword === 'staff')
        ) {
          isMatch = true;
        }
      }

      if (!isMatch) {
        return NextResponse.json(
          { message: 'Mật khẩu hiện tại không chính xác! Vui lòng kiểm tra lại.' },
          { status: 400 }
        );
      }
    }

    // 3. Hash new password and save via dual-layer (Supabase REST + Prisma ORM)
    const hashedPassword = bcrypt.hashSync(newPassword.trim(), 10);
    let updatedUser: any = null;

    // Supabase REST update
    try {
      const { data, error } = await supabase
        .from('User')
        .update({
          password: hashedPassword,
          updatedAt: new Date().toISOString(),
        })
        .eq('id', targetUser.id)
        .select('id, name, email, role, balance, phone, address')
        .maybeSingle();

      if (!error && data) {
        updatedUser = data;
      }
    } catch (supaErr) {
      console.warn('Supabase password update error:', supaErr);
    }

    // Prisma direct DB update
    try {
      await prisma.user.updateMany({
        where: { id: targetUser.id },
        data: {
          password: hashedPassword,
          updatedAt: new Date(),
        },
      });

      if (!updatedUser) {
        const fresh = await prisma.user.findUnique({
          where: { id: targetUser.id },
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            balance: true,
            phone: true,
            address: true,
          },
        });
        if (fresh) updatedUser = fresh;
      }
    } catch (prismaErr) {
      console.error('Prisma password update error:', prismaErr);
    }

    if (!updatedUser) {
      return NextResponse.json(
        { message: 'Lỗi khi cập nhật mật khẩu mới vào cơ sở dữ liệu. Vui lòng thử lại!' },
        { status: 500 }
      );
    }

    // 4. Issue updated JWT token
    const token = signJWT({
      sub: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name,
      role: updatedUser.role,
      provider: authUser?.provider || 'CREDENTIALS',
    });

    const response = NextResponse.json(
      {
        success: true,
        message: 'Đổi mật khẩu tài khoản thành công! Bạn có thể sử dụng mật khẩu mới này cho các lần đăng nhập tiếp theo.',
        user: updatedUser,
        token,
      },
      { status: 200 }
    );

    setAuthCookie(response, token);
    return response;
  } catch (error: any) {
    console.error('Lỗi API đổi mật khẩu:', error);
    return NextResponse.json(
      { message: 'Đã xảy ra lỗi máy chủ: ' + error.message },
      { status: 500 }
    );
  }
}
