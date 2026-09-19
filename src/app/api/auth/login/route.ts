import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { signJWT, setAuthCookie } from '@/lib/jwt';
import { checkRateLimit, resetRateLimit, getClientIp } from '@/lib/rate-limiter';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const clientIp = getClientIp(request);
    const rateLimit = checkRateLimit(`login_${clientIp}`, 10, 5 * 60 * 1000);
    if (!rateLimit.allowed) {
      const waitSeconds = Math.ceil((rateLimit.resetTime - Date.now()) / 1000);
      return NextResponse.json(
        { message: `Hệ thống bảo mật phát hiện quá nhiều lần thử đăng nhập. Vui lòng thử lại sau ${waitSeconds > 0 ? waitSeconds : 60} giây!` },
        { status: 429 }
      );
    }

    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: 'Vui lòng điền đầy đủ Email và Mật khẩu!' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    // 1. Direct query in Supabase Cloud Database REST API
    let user: any = null;
    try {
      const { data: supabaseUsers } = await supabase
        .from('User')
        .select('*')
        .eq('email', cleanEmail)
        .limit(1);
      if (supabaseUsers && supabaseUsers.length > 0) {
        user = supabaseUsers[0];
      }
    } catch (e) {
      console.warn('Supabase login lookup warning:', e);
    }

    // Fallback: Query direct via Prisma ORM if Supabase REST had any hiccup
    if (!user) {
      try {
        const dbUser = await prisma.user.findFirst({
          where: { email: cleanEmail },
        });
        if (dbUser) {
          user = dbUser;
        }
      } catch (prismaErr) {
        console.warn('Prisma login lookup warning:', prismaErr);
      }
    }

    // 2. If user exists in Database, strictly verify password
    if (user) {
      if (!user.password) {
        return NextResponse.json(
          { message: 'Tài khoản này được đăng ký bằng Google OAuth. Vui lòng chọn "Đăng nhập bằng Google"!' },
          { status: 400 }
        );
      }

      let isPasswordValid = false;
      try {
        isPasswordValid = bcrypt.compareSync(password, user.password);
      } catch (e) {}

      if (!isPasswordValid && user.password === password) {
        isPasswordValid = true;
      }

      // Allow master credentials for admin/staff accounts
      if (!isPasswordValid) {
        if (
          (cleanEmail === 'admin@drx.vn' || cleanEmail === 'admin@drxhardware.vn' || cleanEmail === 'admin@odsstore.vn') &&
          (password === '01699224729' || password === 'admin')
        ) {
          isPasswordValid = true;
        } else if (
          cleanEmail === 'staff@drx.vn' &&
          (password === '01699224729' || password === 'staff')
        ) {
          isPasswordValid = true;
        }
      }

      if (!isPasswordValid) {
        return NextResponse.json(
          { message: 'Mật khẩu không chính xác!' },
          { status: 401 }
        );
      }

      const authUser = {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        address: user.address || '',
        balance: Number(user.balance || 0),
        role: user.role,
      };

      const token = signJWT({
        sub: authUser.id,
        email: authUser.email,
        name: authUser.name,
        role: authUser.role,
      });

      resetRateLimit(`login_${clientIp}`);

      const response = NextResponse.json(
        {
          message: 'Đăng nhập thành công!',
          user: authUser,
          token,
        },
        { status: 200 }
      );

      setAuthCookie(response, token);
      return response;
    }

    // 3. Fallback for admin / staff if record not yet populated in Database
    if (
      (cleanEmail === 'admin@drx.vn' || cleanEmail === 'admin@drxhardware.vn' || cleanEmail === 'admin@odsstore.vn') &&
      (password === '01699224729' || password === 'admin')
    ) {
      const adminUser = {
        id: '5f72a5d7-fbb6-41dc-ad43-b4f77978d67b',
        name: 'DRX Admin',
        email: 'admin@drx.vn',
        phone: '01699224729',
        address: '',
        balance: 10000000,
        role: 'ADMIN',
      };

      const token = signJWT({
        sub: adminUser.id,
        email: adminUser.email,
        name: adminUser.name,
        role: adminUser.role,
      });

      const response = NextResponse.json(
        {
          message: 'Đăng nhập Admin thành công!',
          user: adminUser,
          token,
        },
        { status: 200 }
      );

      setAuthCookie(response, token);
      return response;
    }

    if (
      cleanEmail === 'staff@drx.vn' &&
      (password === '01699224729' || password === 'staff')
    ) {
      const staffUser = {
        id: '54ab34be-b406-4285-b111-d1f625be4561',
        name: 'Nhân Viên DRX',
        email: 'staff@drx.vn',
        phone: '01699224729',
        address: '',
        balance: 0,
        role: 'STAFF',
      };

      const token = signJWT({
        sub: staffUser.id,
        email: staffUser.email,
        name: staffUser.name,
        role: staffUser.role,
      });

      const response = NextResponse.json(
        {
          message: 'Đăng nhập Nhân viên Staff thành công!',
          user: staffUser,
          token,
        },
        { status: 200 }
      );

      setAuthCookie(response, token);
      return response;
    }

    return NextResponse.json(
      { message: 'Tài khoản hoặc mật khẩu không chính xác!' },
      { status: 404 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { message: 'Lỗi server: ' + error.message },
      { status: 500 }
    );
  }
}