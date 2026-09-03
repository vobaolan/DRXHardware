import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ message: 'Missing userId parameter' }, { status: 400 });
    }

    let transactions: any[] = [];

    // 1. Primary: Supabase Cloud Database (Fast Direct REST)
    try {
      const { data, error } = await supabase
        .from('Transaction')
        .select('*')
        .eq('userId', userId)
        .order('createdAt', { ascending: false });

      if (!error && data) {
        transactions = data;
      }
    } catch (e) {}

    // 2. Fallback to Prisma
    if (transactions.length === 0) {
      try {
        transactions = await prisma.transaction.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' },
        });
      } catch (e) {}
    }

    return NextResponse.json({ transactions }, { status: 200 });
  } catch (error: any) {
    console.error('Lỗi khi tải lịch sử giao dịch:', error.message);
    return NextResponse.json({ message: 'Lỗi máy chủ nội bộ' }, { status: 500 });
  }
}
