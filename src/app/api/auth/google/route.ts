import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { supabase } from '@/lib/supabase';
import { signJWT, setAuthCookie } from '@/lib/jwt';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { email, name, avatar, googleId } = await request.json();

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

    // 3. If user doesn't exist, create a new Google user
    if (!foundUser) {
      try {
        const newUser = await prisma.user.create({
          data: {
            name: userName,
            email: cleanEmail,
            image: userAvatar,
            role: userRole as any,
            balance: 0.0,
          },
        });
        foundUser = newUser;
      } catch (createPrismaErr) {
        // Fallback create in Supabase
        try {
          const { data: createdSupa } = await supabase
            .from('User')
            .insert([
              {
                name: userName,
                email: cleanEmail,
                image: userAvatar,
                role: userRole,
                balance: 0,
              },
            ])
            .select('*');
          if (createdSupa && createdSupa.length > 0) {
            foundUser = createdSupa[0];
          }
        } catch (createSupaErr) {}
      }
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
