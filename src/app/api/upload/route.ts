import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import fs from 'fs';
import path from 'path';

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

    // Extract extension
    const originalExt = file.name.split('.').pop()?.toLowerCase() || 'png';
    const cleanExt = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg', 'avif'].includes(originalExt) ? originalExt : 'png';
    const fileName = `drx-${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${cleanExt}`;

    let uploadedUrl: string | null = null;

    // 1. TRY SUPABASE STORAGE BUCKET ('products' or 'images')
    try {
      // Try 'products' bucket first
      const { data: uploadData, error: uploadErr } = await supabase.storage
        .from('products')
        .upload(fileName, buffer, {
          contentType: file.type || `image/${cleanExt}`,
          upsert: true,
        });

      if (!uploadErr && uploadData) {
        const { data: publicUrlData } = supabase.storage.from('products').getPublicUrl(fileName);
        if (publicUrlData?.publicUrl) {
          uploadedUrl = publicUrlData.publicUrl;
        }
      } else {
        // Try 'images' bucket fallback
        const { data: imgData, error: imgErr } = await supabase.storage
          .from('images')
          .upload(fileName, buffer, {
            contentType: file.type || `image/${cleanExt}`,
            upsert: true,
          });

        if (!imgErr && imgData) {
          const { data: publicUrlData } = supabase.storage.from('images').getPublicUrl(fileName);
          if (publicUrlData?.publicUrl) {
            uploadedUrl = publicUrlData.publicUrl;
          }
        }
      }
    } catch (supaErr) {
      console.warn('Supabase storage upload attempt error:', supaErr);
    }

    // 2. LOCAL / EMBEDDED FALLBACK IF SUPABASE BUCKET WAS NOT CONFIGURED
    if (!uploadedUrl) {
      try {
        const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
        }
        const filePath = path.join(uploadsDir, fileName);
        fs.writeFileSync(filePath, buffer);
        uploadedUrl = `/uploads/${fileName}`;
      } catch (fsErr) {
        // Fallback to optimized base64 Data URI if disk write is restricted on serverless
        const base64Data = buffer.toString('base64');
        uploadedUrl = `data:${file.type || 'image/png'};base64,${base64Data}`;
      }
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
