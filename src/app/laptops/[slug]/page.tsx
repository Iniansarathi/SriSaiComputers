import React from 'react';
import { notFound } from 'next/navigation';
import { getProductBySlugOrId, getBusinessSettings, syncDatabaseFromCloud } from '@/lib/db';
import ProductDetailClient from './ProductDetailClient';
import { Metadata } from 'next';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlugOrId(slug);
  if (!product) {
    return {
      title: 'Product Not Found | Sri Sai Computers'
    };
  }

  const title = `${product.title} — Used Laptop | Sri Sai Computers Coimbatore`;
  const description = `${product.brand} ${product.model} featuring ${product.processor_brand} ${product.processor_model}, ${product.ram} RAM, ${product.storage_capacity} ${product.storage_type}. Price: ₹${product.price.toLocaleString('en-IN')}. Available at Sri Sai Computers, Gandhipuram.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: product.primary_image ? [{ url: product.primary_image }] : [],
      url: `https://srisaicomputers.com/laptops/${product.slug}`,
      type: 'website'
    }
  };
}

export default async function ProductDetailPage(
  { params }: { params: Promise<{ slug: string }> }
) {
  await syncDatabaseFromCloud();
  const { slug } = await params;
  const product = getProductBySlugOrId(slug);

  if (!product || product.status === 'HIDDEN') {
    notFound();
  }

  const settings = getBusinessSettings();

  return <ProductDetailClient product={product} settings={settings} />;
}
