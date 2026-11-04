import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getProductBySlugOrId, updateProduct, updateProductStatus, deleteProduct, syncDatabaseToCloud, syncDatabaseFromCloud } from '@/lib/db';
import { getAdminSession } from '@/lib/auth';
import { deleteImageFile } from '@/lib/storage';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await syncDatabaseFromCloud();
    const { id } = await params;
    const product = getProductBySlugOrId(id);

    if (!product) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, product });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized admin access' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    // Quick status toggle
    if (body.action === 'UPDATE_STATUS' && body.status) {
      const updated = updateProductStatus(id, body.status);
      await syncDatabaseToCloud();
      revalidatePath('/laptops');
      revalidatePath('/');
      revalidatePath('/admin/inventory');
      return NextResponse.json({ success: true, product: updated });
    }

    const updatedProduct = updateProduct(id, body, body.images);
    if (!updatedProduct) {
      return NextResponse.json({ success: false, error: 'Product not found for update' }, { status: 404 });
    }

    // Persist to Cloudinary and purge Next.js server component caches
    await syncDatabaseToCloud();
    revalidatePath('/laptops');
    revalidatePath(`/laptops/${updatedProduct.slug}`);
    revalidatePath('/');
    revalidatePath('/admin/inventory');
    revalidatePath(`/admin/inventory/${id}/edit`);

    return NextResponse.json({ success: true, product: updatedProduct });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized admin access' }, { status: 401 });
    }

    const { id } = await params;

    // Fetch existing product to delete its images from Cloudinary & storage
    const product = getProductBySlugOrId(id);
    if (product) {
      const urlsToDelete = new Set<string>();
      if (product.primary_image) {
        urlsToDelete.add(product.primary_image);
      }
      if (product.images && Array.isArray(product.images)) {
        product.images.forEach(img => {
          if (img.image_url) urlsToDelete.add(img.image_url);
        });
      }

      // Clean up all images from Cloudinary & local storage
      for (const imgUrl of urlsToDelete) {
        await deleteImageFile(imgUrl);
      }
    }

    const deleted = deleteProduct(id);

    if (!deleted) {
      return NextResponse.json({ success: false, error: 'Product not found or delete failed' }, { status: 404 });
    }

    await syncDatabaseToCloud();
    revalidatePath('/laptops');
    revalidatePath('/');
    revalidatePath('/admin/inventory');

    return NextResponse.json({ success: true, message: 'Product and images deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
