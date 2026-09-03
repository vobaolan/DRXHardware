import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import bcrypt from 'bcryptjs';
import { signJWT, setAuthCookie } from '@/lib/jwt';
import { checkRateLimit, getClientIp } from '@/lib/rate-limiter';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const clientIp = getClientIp(request);
    const rateLimit = checkRateLimit(`register_${clientIp}`, 10, 10 * 60 * 1000);
    if (!rateLimit.allowed) {
      const waitSeconds = Math.ceil((rateLimit.resetTime - Date.now()) / 1000);
      return NextResponse.json(
        { message: `Hệ thống tạm khóa tính năng đăng ký do phát hiện quá nhiều yêu cầu từ mạng của bạn. Vui lòng thử lại sau ${Math.ceil(waitSeconds / 60)} phút!` },
        { status: 429 }
      );
    }

    const { name, email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email và Mật khẩu là bắt buộc!' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { message: 'Mật khẩu phải có tối thiểu 6 ký tự!' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const assignedRole = cleanEmail === 'admin@drx.vn' ? 'ADMIN' : cleanEmail === 'staff@drx.vn' ? 'STAFF' : 'USER';
    const userName = (name && String(name).trim()) || cleanEmail.split('@')[0];

    // 1. Check if user already exists in Supabase
    let existingUser: any = null;

    try {
      const { data: supaExisting } = await supabase
        .from('User')
        .select('id, email')
        .eq('email', cleanEmail)
        .maybeSingle();

      if (supaExisting) {
        existingUser = supaExisting;
      }
    } catch (e) {}

    if (existingUser) {
      return NextResponse.json(
        { message: 'Email này đã được đăng ký trước đó!' },
        { status: 400 }
      );
    }

    // 2. Hash the password
    const hashedPassword = bcrypt.hashSync(password, 10);
    const newUserId = 'user-' + Date.now();
    let savedUser: any = null;

    // 3. Insert into Supabase User table (Primary Cloud DB)
    try {
      const { data: supaCreated, error: supaErr } = await supabase
        .from('User')
        .insert([{
          id: newUserId,
          name: userName,
          email: cleanEmail,
          password: hashedPassword,
          balance: 0.0,
          role: assignedRole,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }])
        .select('*')
        .maybeSingle();

      if (supaErr) {
        console.warn('Supabase registration insert warning:', supaErr);
      } else if (supaCreated) {
        savedUser = supaCreated;
      }
    } catch (supaErr) {
      console.warn('Supabase registration error:', supaErr);
    }

    // 4. Construct authenticated user object
    const authUser = {
      id: savedUser?.id || newUserId,
      name: savedUser?.name || userName,
      email: cleanEmail,
      balance: Number(savedUser?.balance || 0),
      role: savedUser?.role || assignedRole,
    };

    const token = signJWT({
      sub: authUser.id,
      email: authUser.email,
      name: authUser.name,
      role: authUser.role,
    });

    const response = NextResponse.json(
      {
        message: 'Đăng ký tài khoản thành công!',
        user: authUser,
      },
      { status: 201 }
    );

    setAuthCookie(response, token);
    return response;
  } catch (error: any) {
    console.error('Lỗi khi đăng ký:', error);
    return NextResponse.json(
      { message: 'Có lỗi xảy ra: ' + error.message },
      { status: 500 }
    );
  }
}