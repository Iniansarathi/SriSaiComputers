import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import path from 'path';
import fs from 'fs';

// Check if Cloudinary credentials are provided via environment variables
export const hasCloudinary = Boolean(
  (process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET) ||
    process.env.CLOUDINARY_URL
);

if (hasCloudinary) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

/**
 * Uploads an image buffer to Cloudinary with automatic WebP/AVIF compression.
 */
export function uploadToCloudinary(buffer: Buffer): Promise<UploadApiResponse> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'sri-sai-computers',
        resource_type: 'image',
        transformation: [
          { quality: 'auto', fetch_format: 'auto' } // automatic WebP/AVIF compression
        ]
      },
      (error, result) => {
        if (error || !result) return reject(error);
        resolve(result);
      }
    );
    uploadStream.end(buffer);
  });
}

/**
 * Extracts the Cloudinary public_id (including folder path) from a Cloudinary image URL.
 */
export function extractCloudinaryPublicId(url: string): string | null {
  if (!url || typeof url !== 'string' || !url.includes('res.cloudinary.com')) return null;
  try {
    const uploadIdx = url.indexOf('/upload/');
    if (uploadIdx === -1) return null;

    let pathPart = url.substring(uploadIdx + '/upload/'.length);
    pathPart = pathPart.split('?')[0].split('#')[0];

    const parts = pathPart.split('/');
    const vIdx = parts.findIndex(p => /^v\d+$/.test(p));
    let publicIdWithExt = '';

    if (vIdx !== -1) {
      publicIdWithExt = parts.slice(vIdx + 1).join('/');
    } else {
      const folderIdx = parts.findIndex(p => p === 'sri-sai-computers');
      if (folderIdx !== -1) {
        publicIdWithExt = parts.slice(folderIdx).join('/');
      } else {
        publicIdWithExt = parts[parts.length - 1];
      }
    }

    const lastDot = publicIdWithExt.lastIndexOf('.');
    return lastDot !== -1 ? publicIdWithExt.substring(0, lastDot) : publicIdWithExt;
  } catch {
    return null;
  }
}

/**
 * Deletes an image from Cloudinary (or local public/uploads directory) to prevent storage quota buildup.
 */
export async function deleteImageFile(url: string): Promise<{ success: boolean; result?: any; error?: string }> {
  if (!url || typeof url !== 'string') {
    return { success: false, error: 'Invalid URL provided' };
  }

  // 1. Cloudinary image cleanup
  if (url.includes('res.cloudinary.com')) {
    const publicId = extractCloudinaryPublicId(url);
    if (!publicId) {
      return { success: false, error: 'Could not extract Cloudinary public ID from URL' };
    }

    if (!hasCloudinary) {
      console.warn('Cloudinary not configured on this environment; skipping remote deletion for', publicId);
      return { success: true, result: 'Cloudinary not configured on server' };
    }

    try {
      const result = await cloudinary.uploader.destroy(publicId, {
        resource_type: 'image',
        invalidate: true
      });
      return { success: true, result };
    } catch (err: any) {
      console.error('Error deleting from Cloudinary:', err);
      return { success: false, error: err?.message || 'Failed to destroy Cloudinary asset' };
    }
  }

  // 2. Local uploads cleanup (local development)
  if (url.startsWith('/uploads/') || url.includes('/uploads/')) {
    try {
      const cleanUrl = url.split('?')[0];
      const filename = path.basename(cleanUrl);
      const filePath = path.join(process.cwd(), 'public', 'uploads', filename);

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        return { success: true, result: 'Local file deleted' };
      }
      return { success: true, result: 'Local file not found on disk' };
    } catch (err: any) {
      console.error('Error deleting local file:', err);
      return { success: false, error: err?.message || 'Failed to delete local file' };
    }
  }

  // External stock / placeholder URLs (e.g. Unsplash) - nothing to delete
  return { success: true, result: 'External URL, no deletion needed' };
}
