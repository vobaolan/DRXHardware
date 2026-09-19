import { NextResponse } from 'next/server';
import { getAuthUserFromRequest, signJWT, setAuthCookie } from '@/lib/jwt';
import { supabase } from '@/lib/supabase';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const authUser = getAuthUserFromRequest(request);
    if (!authUser) {
      return NextResponse.json({ message: 'Chưa đăng nhập' }, { status: 401 });
    }

    let userBalance = 0;
    let userName = authUser.name;
    let userRole = authUser.role || 'USER';
    let userPhone: string | null = null;
    let userAddress: string | null = null;
    let userId = authUser.sub;
    const cleanEmail = authUser.email ? authUser.email.toLowerCase().trim() : '';

    let foundInDb = false;

    // 1. Direct fetch fresh user data & balance from Supabase Cloud PostgreSQL REST API
    try {
      let supaQuery = supabase.from('User').select('id, name, email, role, balance, phone, address').limit(1);
      if (cleanEmail) {
        supaQuery = supaQuery.eq('email', cleanEmail);
      } else if (authUser.sub && authUser.sub !== 'admin-id-master') {
        supaQuery = supaQuery.eq('id', authUser.sub);
      }

      const { data, error } = await supaQuery;
      if (!error && data && data.length > 0) {
        const row = data[0];
        userBalance = Number(row.balance || 0);
        if (row.id) userId = row.id;
        if (row.name) userName = row.name;
        userRole = row.role || authUser.role || 'USER';
        userPhone = row.phone || null;
        userAddress = row.address || null;
        foundInDb = true;
      }
    } catch (supaErr) {
      console.warn('Supabase GET /api/auth/me query warning:', supaErr);
    }

    // 2. Guaranteed Dual-Layer Fallback via Prisma Direct DB Connection
    if (!foundInDb) {
      try {
        const dbUser = await prisma.user.findFirst({
          where: {
            OR: [
              ...(cleanEmail ? [{ email: cleanEmail }] : []),
              ...(authUser.sub && authUser.sub !== 'admin-id-master' ? [{ id: authUser.sub }] : []),
            ]
          }
        });
        if (dbUser) {
          userBalance = Number(dbUser.balance || 0);
          userId = dbUser.id;
          userName = dbUser.name || userName;
          userRole = dbUser.role || userRole;
          userPhone = dbUser.phone || null;
          userAddress = dbUser.address || null;
          foundInDb = true;
        }
      } catch (prismaErr) {
        console.warn('Prisma GET /api/auth/me fallback warning:', prismaErr);
      }
    }

    // 3. Auto-heal: If user is authenticated via OAuth or session but not yet in DB, persist them
    if (!foundInDb && cleanEmail && cleanEmail !== 'admin@drx.vn') {
      try {
        const autoId = (authUser.sub && authUser.sub.startsWith('user-')) ? authUser.sub : ('user-' + Date.now());
        const created = await prisma.user.create({
          data: {
            id: autoId,
            name: authUser.name || cleanEmail.split('@')[0],
            email: cleanEmail,
            role: authUser.role || 'USER',
            balance: 0.0,
          }
        });
        if (created) {
          userId = created.id;
          userName = created.name;
          userRole = created.role;
        }
      } catch (healErr) {}
    }

    const finalUser = {
      id: userId || authUser.sub,
      name: userName,
      email: authUser.email,
      role: userRole,
      balance: userBalance,
      phone: userPhone || '',
      address: userAddress || '',
      provider: authUser.provider,
    };

    const token = signJWT({
      sub: finalUser.id,
      email: finalUser.email,
      name: finalUser.name,
      role: finalUser.role,
      provider: finalUser.provider,
    });

    const response = NextResponse.json(
      {
        user: finalUser,
        token,
      },
      { status: 200 }
    );

    setAuthCookie(response, token);
    return response;
  } catch (error: any) {
    console.error('Lỗi xác thực GET /api/auth/me:', error);
    return NextResponse.json({ message: 'Lỗi xác thực: ' + error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const authUser = getAuthUserFromRequest(request);
    if (!authUser) {
      return NextResponse.json({ message: 'Chưa đăng nhập hoặc phiên hết hạn' }, { status: 401 });
    }

    const body = await request.json();
    const { name, phone, address } = body;

    const trimmedName = typeof name === 'string' && name.trim() ? name.trim() : authUser.name;
    const trimmedPhone = typeof phone === 'string' ? phone.trim() : null;
    const trimmedAddress = typeof address === 'string' ? address.trim() : null;
    const cleanEmail = authUser.email ? authUser.email.toLowerCase().trim() : '';

    let updatedUserRecord: any = null;

    // 1. Update in Supabase Cloud Database REST API
    try {
      const updateData = {
        name: trimmedName,
        phone: trimmedPhone,
        address: trimmedAddress,
        updatedAt: new Date().toISOString(),
      };

      if (cleanEmail) {
        const { data, error } = await supabase
          .from('User')
          .update(updateData)
          .eq('email', cleanEmail)
          .select('*')
          .maybeSingle();

        if (!error && data) {
          updatedUserRecord = data;
        }
      }

      if (!updatedUserRecord && authUser.sub && authUser.sub !== 'admin-id-master') {
        const { data, error } = await supabase
          .from('User')
          .update(updateData)
          .eq('id', authUser.sub)
          .select('*')
          .maybeSingle();

        if (!error && data) {
          updatedUserRecord = data;
        }
      }
    } catch (supaErr) {
      console.warn('Supabase PUT /api/auth/me warning:', supaErr);
    }

    // 2. Guaranteed Dual-Layer Update via Prisma ORM direct database connection
    try {
      await prisma.user.updateMany({
        where: {
          OR: [
            ...(cleanEmail ? [{ email: cleanEmail }] : []),
            ...(authUser.sub && authUser.sub !== 'admin-id-master' ? [{ id: authUser.sub }] : []),
          ],
        },
        data: {
          name: trimmedName,
          phone: trimmedPhone,
          address: trimmedAddress,
          updatedAt: new Date(),
        },
      });

      // Always retrieve the authoritative updated record from DB
      const freshUser = await prisma.user.findFirst({
        where: {
          OR: [
            ...(cleanEmail ? [{ email: cleanEmail }] : []),
            ...(authUser.sub && authUser.sub !== 'admin-id-master' ? [{ id: authUser.sub }] : []),
          ],
        },
      });

      if (freshUser) {
        updatedUserRecord = freshUser;
      }
    } catch (prismaErr) {
      console.error('Prisma PUT /api/auth/me error:', prismaErr);
    }

    const resolvedName = updatedUserRecord?.name || trimmedName;
    const resolvedRole = updatedUserRecord?.role || authUser.role || 'USER';
    const resolvedBalance = updatedUserRecord ? Number(updatedUserRecord.balance || 0) : 0;
    const resolvedPhone = updatedUserRecord?.phone || trimmedPhone || '';
    const resolvedAddress = updatedUserRecord?.address || trimmedAddress || '';
    const resolvedId = updatedUserRecord?.id || authUser.sub;

    // Refreshed JWT with updated name and info
    const newToken = signJWT({
      sub: resolvedId,
      email: authUser.email,
      name: resolvedName,
      role: resolvedRole,
      provider: authUser.provider,
    });

    const response = NextResponse.json(
      {
        success: true,
        message: 'Cập nhật thông tin cá nhân thành công!',
        user: {
          id: resolvedId,
          name: resolvedName,
          email: authUser.email,
          role: resolvedRole,
          balance: resolvedBalance,
          phone: resolvedPhone,
          address: resolvedAddress,
          provider: authUser.provider,
        },
        token: newToken,
      },
      { status: 200 }
    );

    setAuthCookie(response, newToken);
    return response;
  } catch (error: any) {
    console.error('Lỗi khi cập nhật profile lên Supabase & Prisma:', error);
    return NextResponse.json({ message: 'Lỗi cập nhật: ' + error.message }, { status: 500 });
  }
}