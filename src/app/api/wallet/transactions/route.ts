import { NextResponse } from 'next/server';
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

    // Direct fetch from Supabase Cloud Database (Fast Direct REST)
    try {
      const { data, error } = await supabase
        .from('Transaction')
        .select('*')
        .eq('userId', userId)
        .order('createdAt', { ascending: false });

      if (!error && data && Array.isArray(data)) {
        transactions = data;
      }
    } catch (e) {
      console.warn('Supabase transactions warning:', e);
    }

    return NextResponse.json({ transactions }, { status: 200 });
  } catch (error: any) {
    console.error('Lỗi khi tải lịch sử giao dịch:', error.message);
    return NextResponse.json({ message: 'Lỗi máy chủ nội bộ' }, { status: 500 });
  }
}
