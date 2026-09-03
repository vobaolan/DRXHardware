import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { supabase } from '@/lib/supabase';
import { signJWT, setAuthCookie } from '@/lib/jwt';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    let email = body.email;
    let name = body.name;
    let avatar = body.avatar;
    let googleId = body.googleId;

    // 1. If accessToken provided, fetch Google Userinfo
    if (body.accessToken) {
      try {
        const gRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${body.accessToken}` },
        });
        if (gRes.ok) {
          const gData = await gRes.json();
          email = gData.email || email;
          name = gData.name || name;
          avatar = gData.picture || avatar;
          googleId = gData.sub || googleId;
        }
      } catch (e) {
        console.warn('Google userinfo fetch error:', e);
      }
    }

    // 2. If credential (JWT) provided, decode base64 payload
    if (body.credential && !email) {
      try {
        const parts = body.credential.split('.');
        if (parts.length === 3) {
          const payloadStr = Buffer.from(parts[1], 'base64').toString('utf8');
          const payload = JSON.parse(payloadStr);
          email = payload.email || email;
          name = payload.name || name;
          avatar = payload.picture || avatar;
          googleId = payload.sub || googleId;
        }
      } catch (e) {
        console.warn('Google credential decode error:', e);
      }
    }

    if (!email) {
      return NextResponse.json(
        { message: 'Email Google là bắt buộc!' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const userName = name || cleanEmail.split('@')[0];
    const userAvatar = avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${cleanEmail}`;
    const userRole = cleanEmail.includes('admin') || cleanEmail === 'admin@drx.vn' ? 'ADMIN' : 'USER';

    let foundUser: any = null;

    // 1. Check Supabase User table
    try {
      const { data: supaUsers } = await supabase
        .from('User')
        .select('*')
        .eq('email', cleanEmail);
      
      if (supaUsers && supaUsers.length > 0) {
        foundUser = supaUsers[0];
      }
    } catch (e) {
      console.warn('Supabase findUser error:', e);
    }

    // 2. Check Prisma if not found
    if (!foundUser) {
      try {
        foundUser = await prisma.user.findUnique({
          where: { email: cleanEmail },
        });
      } catch (e) {
        console.warn('Prisma findUser error:', e);
      }
    }

    // 3. If user doesn't exist, create a new Google user directly in Supabase Cloud DB
    if (!foundUser) {
      const newUserId = `user-google-${Date.now()}`;
      try {
        const { data: createdSupa, error: supaCreateErr } = await supabase
          .from('User')
          .insert([
            {
              id: newUserId,
              name: userName,
              email: cleanEmail,
              image: userAvatar,
              role: userRole,
              balance: 0.0,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          ])
          .select('*')
          .maybeSingle();

        if (createdSupa) {
          foundUser = createdSupa;
        }
      } catch (createSupaErr) {}

      // Also sync to Prisma
      try {
        const newUser = await prisma.user.create({
          data: {
            id: foundUser?.id || newUserId,
            name: userName,
            email: cleanEmail,
            image: userAvatar,
            role: userRole as any,
            balance: 0.0,
          },
        });
        if (!foundUser) foundUser = newUser;
      } catch (createPrismaErr) {}
    }

    // 4. Construct authenticated user object
    const authUser = {
      id: foundUser?.id || `google-${Date.now()}`,
      name: foundUser?.name || userName,
      email: cleanEmail,
      image: foundUser?.image || userAvatar,
      balance: Number(foundUser?.balance || 0),
      role: foundUser?.role || userRole,
      provider: 'google',
    };

    // 5. Issue JWT Token & Set HttpOnly Cookie
    const token = signJWT({
      sub: authUser.id,
      email: authUser.email,
      name: authUser.name,
      role: authUser.role,
      provider: 'google',
    });

    const response = NextResponse.json(
      {
        message: 'Đăng nhập bằng Google thành công!',
        user: authUser,
      },
      { status: 200 }
    );

    setAuthCookie(response, token);
    return response;
  } catch (error: any) {
    console.error('Google Auth Error:', error);
    return NextResponse.json(
      { message: 'Lỗi xác thực Google: ' + error.message },
      { status: 500 }
    );
  }
}
