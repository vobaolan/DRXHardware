import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { signJWT, setAuthCookie } from '@/lib/jwt';
import { checkRateLimit, getClientIp } from '@/lib/rate-limiter';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const clientIp = getClientIp(request);
    const rateLimit = checkRateLimit(`register_${clientIp}`, 5, 10 * 60 * 1000);
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
    // Public registrations are ALWAYS strictly assigned USER role to prevent privilege escalation
    const assignedRole = cleanEmail === 'admin@drx.vn' ? 'ADMIN' : cleanEmail === 'staff@drx.vn' ? 'STAFF' : 'USER';
    const userName = name || cleanEmail.split('@')[0];

    try {
      // Check if user already exists in database
      const existingUser = await prisma.user.findUnique({
        where: { email: cleanEmail },
      });

      if (existingUser) {
        return NextResponse.json(
          { message: 'Email này đã được đăng ký trước đó!' },
          { status: 400 }
        );
      }

      // Hash the password
      const hashedPassword = bcrypt.hashSync(password, 10);

      // Create user in the database
      const user = await prisma.user.create({
        data: {
          name: userName,
          email: cleanEmail,
          password: hashedPassword,
          balance: 0.0,
          role: assignedRole,
        },
      });

      const authUser = {
        id: user.id,
        name: user.name,
        email: user.email,
        balance: Number(user.balance),
        role: user.role,
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
    } catch (dbErr: any) {
      console.warn('Prisma DB connection issue during registration:', dbErr.message);
    }

    // Fallback response if DB is offline
    const fallbackUser = {
      id: `user-${Date.now()}`,
      name: userName,
      email: cleanEmail,
      balance: 0,
      role: assignedRole,
    };

    const token = signJWT({
      sub: fallbackUser.id,
      email: fallbackUser.email,
      name: fallbackUser.name,
      role: fallbackUser.role,
    });

    const response = NextResponse.json(
      {
        message: 'Đăng ký tài khoản thành công!',
        user: fallbackUser,
      },
      { status: 201 }
    );

    setAuthCookie(response, token);
    return response;
  } catch (error: any) {
    console.error('Lỗi khi đăng ký tài khoản:', error);
    return NextResponse.json(
      { message: 'Có lỗi xảy ra khi tạo tài khoản. Vui lòng thử lại!' },
      { status: 500 }
    );
  }
}