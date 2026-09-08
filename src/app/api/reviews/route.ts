import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const headers = {
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
    'Surrogate-Control': 'no-store'
  };

  try {
    const url = new URL(request.url);
    const productId = url.searchParams.get('productId');

    if (!productId) {
      return NextResponse.json({ reviews: [], averageRating: 5.0, totalReviews: 0 }, { status: 200, headers });
    }

    // Query real reviews from Supabase Review table
    const { data: dbReviews, error } = await supabase
      .from('Review')
      .select('id, productId, userId, rating, comment, createdAt, user:User(id, name, email, avatar)')
      .eq('productId', productId)
      .order('createdAt', { ascending: false });

    if (error) {
      console.warn('Error fetching reviews from Supabase:', error);
      return NextResponse.json({ reviews: [], averageRating: 5.0, totalReviews: 0 }, { status: 200, headers });
    }

    const reviews = (dbReviews || []).map((r: any) => {
      const user = r.user || {};
      const authorName = user.name || user.email?.split('@')[0] || 'Khách Hàng DRX';
      const dateStr = r.createdAt 
        ? new Date(r.createdAt).toLocaleDateString('vi-VN') 
        : new Date().toLocaleDateString('vi-VN');

      return {
        id: r.id,
        productId: r.productId,
        userId: r.userId,
        author: authorName,
        rating: Number(r.rating) || 5,
        comment: r.comment || '',
        date: dateStr,
        createdAt: r.createdAt,
        isVerified: true
      };
    });

    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0
      ? (reviews.reduce((acc: number, item: any) => acc + item.rating, 0) / totalReviews).toFixed(1)
      : '5.0';

    return NextResponse.json({
      reviews,
      averageRating: parseFloat(averageRating),
      totalReviews
    }, { status: 200, headers });
  } catch (error: any) {
    console.error('Lỗi khi lấy đánh giá từ Supabase:', error);
    return NextResponse.json({ reviews: [], averageRating: 5.0, totalReviews: 0 }, { status: 200, headers });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { productId, rating = 5, comment, userId, authorName } = body;

    if (!productId) {
      return NextResponse.json({ error: 'Thiếu productId' }, { status: 400 });
    }

    if (!comment || !comment.trim()) {
      return NextResponse.json({ error: 'Nội dung đánh giá không được để trống' }, { status: 400 });
    }

    // Determine valid userId from Supabase
    let finalUserId = userId;
    if (!finalUserId) {
      // Find a default or available user from User table
      const { data: users } = await supabase.from('User').select('id').limit(1);
      if (users && users.length > 0) {
        finalUserId = users[0].id;
      }
    }

    if (!finalUserId) {
      return NextResponse.json({ error: 'Không tìm thấy tài khoản người dùng hợp lệ' }, { status: 400 });
    }

    const newReviewId = `rev-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const nowIso = new Date().toISOString();

    const newReviewData = {
      id: newReviewId,
      productId,
      userId: finalUserId,
      rating: Math.max(1, Math.min(5, Number(rating) || 5)),
      comment: comment.trim(),
      createdAt: nowIso
    };

    const { data, error } = await supabase.from('Review').insert(newReviewData).select('id, productId, userId, rating, comment, createdAt, user:User(id, name, email, avatar)').single();

    if (error) {
      console.error('Supabase review insert error:', error);
      return NextResponse.json({ error: 'Không thể lưu đánh giá vào database' }, { status: 500 });
    }

    const user = data.user || {};
    const formattedAuthor = authorName || user.name || user.email?.split('@')[0] || 'Khách Hàng DRX';

    const formattedReview = {
      id: data.id,
      productId: data.productId,
      userId: data.userId,
      author: formattedAuthor,
      rating: data.rating,
      comment: data.comment,
      date: new Date(data.createdAt).toLocaleDateString('vi-VN'),
      createdAt: data.createdAt,
      isVerified: true
    };

    return NextResponse.json({
      success: true,
      review: formattedReview,
      message: 'Gửi đánh giá thành công!'
    }, { status: 201 });
  } catch (error: any) {
    console.error('Lỗi khi thêm đánh giá vào Supabase:', error);
    return NextResponse.json({ error: error.message || 'Lỗi hệ thống' }, { status: 500 });
  }
}
