import React from 'react';
import { redirect, notFound } from 'next/navigation';
import { getAdminSession } from '@/lib/auth';
import { getProductBySlugOrId } from '@/lib/db';
import AdminHeader from '@/components/AdminHeader';
import ProductForm from '@/components/ProductForm';

export default async function EditLaptopPage(
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession();
  if (!session) {
    redirect('/admin/login');
  }

  const { id } = await params;
  const product = getProductBySlugOrId(id);
  if (!product) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-16">
      <AdminHeader />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ProductForm initialData={product} isEdit={true} />
      </main>
    </div>
  );
}
