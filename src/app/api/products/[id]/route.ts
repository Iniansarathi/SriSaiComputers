import { NextRequest, NextResponse } from 'next/server';
import { getProductBySlugOrId, updateProduct, updateProductStatus, deleteProduct } from '@/lib/db';
import { getAdminSession } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
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
      return NextResponse.json({ success: true, product: updated });
    }

    const updatedProduct = updateProduct(id, body, body.images);
    if (!updatedProduct) {
      return NextResponse.json({ success: false, error: 'Product not found for update' }, { status: 404 });
    }

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
    const deleted = deleteProduct(id);

    if (!deleted) {
      return NextResponse.json({ success: false, error: 'Product not found or delete failed' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Product deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
