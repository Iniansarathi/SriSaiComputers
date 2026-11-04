import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import path from 'path';
import fs from 'fs';
import { uploadToCloudinary, deleteImageFile, hasCloudinary } from '@/lib/storage';

export async function POST(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized admin access' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const urlInput = formData.get('url') as string | null;

    // Handle direct URL input
    if (urlInput && urlInput.trim()) {
      return NextResponse.json({ success: true, url: urlInput.trim() });
    }

    if (!file) {
      return NextResponse.json({ success: false, error: 'No image file uploaded' }, { status: 400 });
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid file type. Please upload JPEG, PNG, WEBP, or AVIF image.' },
        { status: 400 }
      );
    }

    // Limit size to 10MB
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ success: false, error: 'File size exceeds 10MB limit' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 1. If Cloudinary is configured (Production / Cloud), upload to Cloudinary
    if (hasCloudinary) {
      try {
        const uploadResult = await uploadToCloudinary(buffer);
        return NextResponse.json({ success: true, url: uploadResult.secure_url });
      } catch (cloudErr: any) {
        console.error('Cloudinary upload error:', cloudErr);
        return NextResponse.json(
          { success: false, error: 'Cloudinary upload failed: ' + (cloudErr?.message || 'Check credentials') },
          { status: 500 }
        );
      }
    }

    // 2. If running on Vercel without Cloudinary credentials, alert the admin
    if (process.env.VERCEL) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Cloud storage not configured yet. Please add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET to your Vercel Environment Variables, or paste an image URL directly.'
        },
        { status: 400 }
      );
    }

    // 3. Local development fallback: store file on local disk
    const ext = path.extname(file.name) || '.jpg';
    const filename = `img_${Date.now()}_${Math.random().toString(36).substring(2, 8)}${ext}`;
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');

    if (!fs.existsSync(uploadDir)) {
      try {
        fs.mkdirSync(uploadDir, { recursive: true });
      } catch (e) {
        // Read-only environment catch
      }
    }

    const filepath = path.join(uploadDir, filename);
    fs.writeFileSync(filepath, buffer);

    const publicUrl = `/uploads/${filename}`;
    return NextResponse.json({ success: true, url: publicUrl });
  } catch (error: any) {
    console.error('Image upload error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized admin access' }, { status: 401 });
    }

    const body = await request.json();
    const url = body?.url;

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ success: false, error: 'Image URL is required' }, { status: 400 });
    }

    const deleteResult = await deleteImageFile(url);
    if (!deleteResult.success) {
      return NextResponse.json({ success: false, error: deleteResult.error }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Image deleted successfully',
      result: deleteResult.result
    });
  } catch (error: any) {
    console.error('Image delete error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
