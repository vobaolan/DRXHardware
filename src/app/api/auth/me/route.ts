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

    // 1. Primary Authority: Direct PostgreSQL connection via Prisma ORM
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
      console.warn('Prisma GET /api/auth/me warning:', prismaErr);
    }

    // 2. Secondary fallback: Supabase REST API
    if (!foundInDb) {
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
    }

    // 3. Auto-heal: If user is authenticated via OAuth or session but not yet in DB, persist them
    if (!foundInDb && cleanEmail) {
      try {
        const autoId = (authUser.sub && authUser.sub.startsWith('user-')) ? authUser.sub : ('user-' + Date.now());
        const created = await prisma.user.create({
          data: {
            id: autoId,
            name: authUser.name || cleanEmail.split('@')[0],
            email: cleanEmail,
            role: (authUser.role as any) || 'USER',
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
    const body = await request.json().catch(() => ({}));
    const authUser = getAuthUserFromRequest(request);

    const { name, phone, address } = body;
    const cleanEmail = (body.email || authUser?.email || '').toLowerCase().trim();
    const targetUserId = body.id || body.userId || authUser?.sub;

    if (!authUser && !cleanEmail && !targetUserId) {
      return NextResponse.json({ message: 'Chưa đăng nhập hoặc phiên hết hạn' }, { status: 401 });
    }

    const trimmedName = typeof name === 'string' && name.trim() ? name.trim() : (authUser?.name || '');
    const trimmedPhone = typeof phone === 'string' ? phone.trim() : '';
    const trimmedAddress = typeof address === 'string' ? address.trim() : '';

    let updatedUserRecord: any = null;

    // 1. Primary Authority: Guaranteed Direct Update via Prisma ORM
    try {
      if (cleanEmail || (targetUserId && targetUserId !== 'admin-id-master')) {
        const updateWhere = {
          OR: [
            ...(cleanEmail ? [{ email: cleanEmail }] : []),
            ...(targetUserId && targetUserId !== 'admin-id-master' ? [{ id: targetUserId }] : []),
          ],
        };

        const updateResult = await prisma.user.updateMany({
          where: updateWhere,
          data: {
            name: trimmedName,
            phone: trimmedPhone,
            address: trimmedAddress,
            updatedAt: new Date(),
          },
        });

        if (updateResult.count > 0) {
          const freshUser = await prisma.user.findFirst({ where: updateWhere });
          if (freshUser) {
            updatedUserRecord = freshUser;
          }
        }
      }
    } catch (prismaErr) {
      console.error('Prisma PUT /api/auth/me error:', prismaErr);
    }

    // 2. Secondary Sync: Attempt Supabase REST API update as background mirror
    try {
      const updateData = {
        name: trimmedName,
        phone: trimmedPhone,
        address: trimmedAddress,
        updatedAt: new Date().toISOString(),
      };

      if (cleanEmail) {
        const { data } = await supabase
          .from('User')
          .update(updateData)
          .eq('email', cleanEmail)
          .select('*')
          .maybeSingle();

        if (data && !updatedUserRecord) {
          updatedUserRecord = data;
        }
      }

      if (targetUserId && targetUserId !== 'admin-id-master' && !updatedUserRecord) {
        const { data } = await supabase
          .from('User')
          .update(updateData)
          .eq('id', targetUserId)
          .select('*')
          .maybeSingle();

        if (data && !updatedUserRecord) {
          updatedUserRecord = data;
        }
      }
    } catch (supaErr) {
      console.warn('Supabase PUT /api/auth/me warning:', supaErr);
    }

    // 3. Auto-heal: If record does not exist yet in DB, create it
    if (!updatedUserRecord && cleanEmail) {
      try {
        const autoId = targetUserId || ('user-' + Date.now());
        const created = await prisma.user.create({
          data: {
            id: autoId,
            name: trimmedName,
            email: cleanEmail,
            role: (authUser?.role as any) || 'USER',
            phone: trimmedPhone,
            address: trimmedAddress,
            balance: 0.0,
          }
        });
        if (created) {
          updatedUserRecord = created;
        }
      } catch (createErr) {
        console.warn('Prisma auto-create user warning:', createErr);
      }
    }

    // If still not updated in DB, fail explicitly
    if (!updatedUserRecord) {
      return NextResponse.json(
        { message: 'Không tìm thấy tài khoản để cập nhật trong cơ sở dữ liệu!' },
        { status: 404 }
      );
    }

    const resolvedName = updatedUserRecord.name || trimmedName;
    const resolvedEmail = updatedUserRecord.email || cleanEmail || authUser?.email || '';
    const resolvedRole = updatedUserRecord.role || authUser?.role || 'USER';
    const resolvedBalance = Number(updatedUserRecord.balance || 0);
    const resolvedPhone = updatedUserRecord.phone || trimmedPhone || '';
    const resolvedAddress = updatedUserRecord.address || trimmedAddress || '';
    const resolvedId = updatedUserRecord.id || targetUserId;
    const resolvedProvider = authUser?.provider || (body.provider as string) || undefined;

    // Refreshed JWT with updated name and info
    const newToken = signJWT({
      sub: resolvedId,
      email: resolvedEmail,
      name: resolvedName,
      role: resolvedRole,
      provider: resolvedProvider,
    });

    const response = NextResponse.json(
      {
        success: true,
        message: 'Cập nhật thông tin cá nhân thành công!',
        user: {
          id: resolvedId,
          name: resolvedName,
          email: resolvedEmail,
          role: resolvedRole,
          balance: resolvedBalance,
          phone: resolvedPhone,
          address: resolvedAddress,
          provider: resolvedProvider,
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