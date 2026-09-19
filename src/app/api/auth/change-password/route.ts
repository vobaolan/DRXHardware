import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { getAuthUserFromRequest, signJWT, setAuthCookie } from '@/lib/jwt';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const authUser = getAuthUserFromRequest(request);
    const body = await request.json().catch(() => ({}));
    const { currentPassword, newPassword, confirmNewPassword, email } = body;

    const userEmail = (authUser?.email || email || '').trim().toLowerCase();
    const targetUserId = authUser?.sub || body.id || body.userId;

    if (!userEmail && !targetUserId) {
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

    // 1. Locate user in Prisma / Supabase database
    let targetUser: any = null;

    // Prisma Direct DB lookup (authoritative)
    try {
      const dbUser = await prisma.user.findFirst({
        where: {
          OR: [
            ...(userEmail ? [{ email: userEmail }] : []),
            ...(targetUserId && targetUserId !== 'admin-id-master' ? [{ id: targetUserId }] : []),
          ],
        },
      });
      if (dbUser) {
        targetUser = dbUser;
      }
    } catch (prismaErr) {
      console.warn('Prisma find user warning in change-password:', prismaErr);
    }

    // Supabase REST fallback lookup
    if (!targetUser) {
      try {
        let query = supabase.from('User').select('*');
        if (userEmail) {
          query = query.eq('email', userEmail);
        } else if (targetUserId && targetUserId !== 'admin-id-master') {
          query = query.eq('id', targetUserId);
        }
        const { data, error } = await query.limit(1).maybeSingle();
        if (!error && data) {
          targetUser = data;
        }
      } catch (e) {
        console.warn('Supabase find user warning in change-password:', e);
      }
    }

    if (!targetUser) {
      return NextResponse.json(
        { message: 'Không tìm thấy thông tin tài khoản người dùng trong hệ thống cơ sở dữ liệu!' },
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

      // Allow master credentials fallback for admin / staff accounts
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

    // 3. Hash new password and save synchronously to BOTH Prisma and Supabase
    const hashedPassword = bcrypt.hashSync(newPassword.trim(), 10);
    let isPersistedInDb = false;

    // Prisma direct DB update
    try {
      const pResult = await prisma.user.updateMany({
        where: {
          OR: [
            { id: targetUser.id },
            ...(targetUser.email ? [{ email: targetUser.email }] : []),
          ],
        },
        data: {
          password: hashedPassword,
          updatedAt: new Date(),
        },
      });
      if (pResult.count > 0) {
        isPersistedInDb = true;
      }
    } catch (prismaErr) {
      console.error('Prisma password update error:', prismaErr);
    }

    // Supabase REST update
    try {
      const supaUpdatePayload = {
        password: hashedPassword,
        updatedAt: new Date().toISOString(),
      };

      if (targetUser.id) {
        const { data, error } = await supabase
          .from('User')
          .update(supaUpdatePayload)
          .eq('id', targetUser.id)
          .select('id, name, email, role, balance, phone, address')
          .maybeSingle();

        if (!error && data) {
          isPersistedInDb = true;
        }
      } else if (targetUser.email) {
        const { data, error } = await supabase
          .from('User')
          .update(supaUpdatePayload)
          .eq('email', targetUser.email)
          .select('id, name, email, role, balance, phone, address')
          .maybeSingle();

        if (!error && data) {
          isPersistedInDb = true;
        }
      }
    } catch (supaErr) {
      console.warn('Supabase password update error:', supaErr);
    }

    if (!isPersistedInDb) {
      return NextResponse.json(
        { message: 'Lỗi khi cập nhật mật khẩu mới vào cơ sở dữ liệu. Vui lòng thử lại!' },
        { status: 500 }
      );
    }

    // 4. Double check the updated record to ensure new password hash is stored
    let freshRecord: any = null;
    try {
      freshRecord = await prisma.user.findFirst({
        where: {
          OR: [
            { id: targetUser.id },
            ...(targetUser.email ? [{ email: targetUser.email }] : []),
          ],
        },
      });
    } catch (e) {}

    const authUserPayload = {
      id: freshRecord?.id || targetUser.id,
      name: freshRecord?.name || targetUser.name,
      email: freshRecord?.email || targetUser.email,
      role: freshRecord?.role || targetUser.role,
      balance: Number(freshRecord?.balance ?? targetUser.balance ?? 0),
      phone: freshRecord?.phone || targetUser.phone || '',
      address: freshRecord?.address || targetUser.address || '',
    };

    // 5. Issue updated JWT token
    const token = signJWT({
      sub: authUserPayload.id,
      email: authUserPayload.email,
      name: authUserPayload.name,
      role: authUserPayload.role,
      provider: authUser?.provider || 'CREDENTIALS',
    });

    const response = NextResponse.json(
      {
        success: true,
        message: 'Đổi mật khẩu tài khoản thành công! Bạn có thể sử dụng mật khẩu mới này cho các lần đăng nhập tiếp theo.',
        user: authUserPayload,
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
