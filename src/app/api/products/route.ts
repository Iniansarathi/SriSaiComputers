import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getProducts, createProduct, syncDatabaseToCloud, syncDatabaseFromCloud } from '@/lib/db';
import { getAdminSession } from '@/lib/auth';
import slugify from 'slugify';

export async function GET(request: NextRequest) {
  try {
    await syncDatabaseFromCloud();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || undefined;
    const brand = searchParams.get('brand') || undefined;
    const processor = searchParams.get('processor') || undefined;
    const ram = searchParams.get('ram') || undefined;
    const storage = searchParams.get('storage') || undefined;
    const storage_type = searchParams.get('storage_type') || undefined;
    const condition = searchParams.get('condition') || undefined;
    const screen_size = searchParams.get('screen_size') || undefined;
    const status = searchParams.get('status') || undefined;
    const minPrice = searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined;
    const maxPrice = searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined;
    const featuredOnly = searchParams.get('featured') === 'true';
    const sortBy = searchParams.get('sortBy') || undefined;
    const limit = searchParams.get('limit') ? Number(searchParams.get('limit')) : undefined;

    const products = getProducts({
      search,
      brand,
      processor,
      ram,
      storage,
      storage_type,
      condition,
      screen_size,
      status,
      minPrice,
      maxPrice,
      featuredOnly,
      sortBy,
      limit
    });

    return NextResponse.json({ success: true, products });
  } catch (error: any) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized admin access' }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      brand,
      model,
      sku,
      processor_brand,
      processor_model,
      processor_generation,
      ram,
      ram_type,
      storage_capacity,
      storage_type,
      screen_size,
      resolution,
      gpu,
      operating_system,
      condition,
      condition_notes,
      battery_condition,
      keyboard_layout,
      ports,
      connectivity,
      accessories,
      description,
      price,
      status,
      featured,
      images
    } = body;

    if (!title || !brand || !model || !processor_brand || !processor_model || !ram || !storage_capacity || !price) {
      return NextResponse.json({ success: false, error: 'Missing required product fields' }, { status: 400 });
    }

    // Auto generate clean slug
    const generatedSlug = slugify(`${brand}-${model}-${processor_brand}-${ram}-${storage_capacity}-${Date.now().toString().slice(-4)}`, { lower: true, strict: true });
    const productSku = sku || `SSC-${brand.substring(0, 3).toUpperCase()}-${Date.now().toString().slice(-6)}`;

    const newProduct = createProduct(
      {
        title,
        brand,
        model,
        slug: body.slug || generatedSlug,
        sku: productSku,
        processor_brand,
        processor_model,
        processor_generation: processor_generation || '',
        ram,
        ram_type: ram_type || '',
        storage_capacity,
        storage_type: storage_type || 'SSD',
        screen_size,
        resolution: resolution || '',
        gpu: gpu || '',
        operating_system: operating_system || '',
        condition: condition || 'Good',
        condition_notes: condition_notes || '',
        battery_condition: battery_condition || '',
        keyboard_layout: keyboard_layout || '',
        ports: ports || '',
        connectivity: connectivity || '',
        accessories: accessories || '',
        description: description || '',
        price: Number(price),
        status: status || 'AVAILABLE',
        featured: !!featured,
        display_order: 0,
        primary_image: images?.[0] || ''
      },
      Array.isArray(images) ? images : []
    );

    // Sync to Cloudinary and purge Next.js server component caches
    await syncDatabaseToCloud();
    revalidatePath('/laptops');
    revalidatePath(`/laptops/${newProduct.slug}`);
    revalidatePath('/');
    revalidatePath('/admin/inventory');

    return NextResponse.json({ success: true, product: newProduct }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating product:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
