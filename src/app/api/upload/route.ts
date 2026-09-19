import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ message: 'Không tìm thấy tệp tin ảnh tải lên!' }, { status: 400 });
    }

    // Check file type
    const validMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml', 'image/avif'];
    if (!validMimes.includes(file.type) && !file.name.match(/\.(jpg|jpeg|png|webp|gif|svg|avif)$/i)) {
      return NextResponse.json({ message: 'Chỉ chấp nhận các định dạng ảnh: JPG, PNG, WEBP, GIF, SVG, AVIF' }, { status: 400 });
    }

    // Max file size: 10MB
    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ message: 'Dung lượng ảnh tối đa là 10MB!' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Extract extension & MIME type
    const originalExt = file.name.split('.').pop()?.toLowerCase() || 'png';
    const cleanExt = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg', 'avif'].includes(originalExt) ? originalExt : 'png';
    const fileName = `drx-${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${cleanExt === 'jpg' ? 'jpg' : cleanExt}`;

    const mimeMap: Record<string, string> = {
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      webp: 'image/webp',
      gif: 'image/gif',
      svg: 'image/svg+xml',
      avif: 'image/avif',
    };
    const validContentType = (file.type && file.type !== 'image/jpg' && validMimes.includes(file.type))
      ? file.type
      : (mimeMap[cleanExt] || 'image/jpeg');

    let uploadedUrl: string | null = null;

    // 1. DIRECT SUPABASE CLOUD STORAGE UPLOAD ('products' or 'images')
    try {
      // Try 'products' bucket
      const { data: uploadData, error: uploadErr } = await supabase.storage
        .from('products')
        .upload(fileName, buffer, {
          contentType: validContentType,
          upsert: true,
          cacheControl: '31536000',
        });

      if (!uploadErr && uploadData) {
        const { data: publicUrlData } = supabase.storage.from('products').getPublicUrl(fileName);
        if (publicUrlData?.publicUrl) {
          uploadedUrl = publicUrlData.publicUrl;
        }
      } else {
        if (uploadErr) console.warn('Upload to products bucket warning:', uploadErr.message);
        // Try 'images' bucket fallback
        const { data: imgData, error: imgErr } = await supabase.storage
          .from('images')
          .upload(fileName, buffer, {
            contentType: validContentType,
            upsert: true,
          });

        if (!imgErr && imgData) {
          const { data: publicUrlData } = supabase.storage.from('images').getPublicUrl(fileName);
          if (publicUrlData?.publicUrl) {
            uploadedUrl = publicUrlData.publicUrl;
          }
        } else if (imgErr) {
          console.error('Upload to images bucket error:', imgErr.message);
        }
      }
    } catch (supaErr: any) {
      console.error('Supabase storage upload exception:', supaErr);
    }

    if (!uploadedUrl) {
      return NextResponse.json(
        { message: 'Không thể tải ảnh lên Supabase Cloud Storage. Vui lòng kiểm tra quyền bucket "products" trên Supabase!' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      url: uploadedUrl,
      fileName,
      message: 'Tải ảnh lên thành công!',
    }, { status: 200 });

  } catch (error: any) {
    console.error('Lỗi khi tải ảnh lên:', error);
    return NextResponse.json({ message: error.message || 'Lỗi xử lý tệp tin tải lên' }, { status: 500 });
  }
}
