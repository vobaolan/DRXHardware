import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
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

    // 1. Locate user in Supabase database
    let targetUser: any = null;
    try {
      let query = supabase.from('User').select('*');
      if (authUser?.sub && !authUser.sub.startsWith('google-')) {
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

    if (!targetUser && userEmail) {
      // Fallback find by email
      const { data } = await supabase.from('User').select('*').eq('email', userEmail).limit(1).maybeSingle();
      if (data) targetUser = data;
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

      if (!isMatch) {
        return NextResponse.json(
          { message: 'Mật khẩu hiện tại không chính xác! Vui lòng kiểm tra lại.' },
          { status: 400 }
        );
      }
    }

    // 3. Hash new password and save to Supabase
    const hashedPassword = bcrypt.hashSync(newPassword.trim(), 10);
    const { data: updatedUser, error: updateErr } = await supabase
      .from('User')
      .update({
        password: hashedPassword,
        updatedAt: new Date().toISOString(),
      })
      .eq('id', targetUser.id)
      .select('id, name, email, role, balance, phone, address')
      .single();

    if (updateErr || !updatedUser) {
      console.error('Supabase update password error:', updateErr);
      return NextResponse.json(
        { message: 'Lỗi khi cập nhật mật khẩu mới vào cơ sở dữ liệu: ' + (updateErr?.message || 'Lỗi không xác định') },
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
