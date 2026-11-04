import React, { Suspense } from 'react';
import { getProducts, getBusinessSettings, syncDatabaseFromCloud } from '@/lib/db';
import InventoryClient from './InventoryClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Available Laptops Inventory | Sri Sai Computers Coimbatore',
  description: 'Browse refurbished and used computers currently in stock at our Gandhipuram shop in Coimbatore. Check pricing, condition and WhatsApp enquiry.',
};

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function InventoryPage() {
  await syncDatabaseFromCloud();
  const initialProducts = getProducts({ status: 'AVAILABLE', sortBy: 'newest' });
  const initialSettings = getBusinessSettings();

  return (
    <Suspense fallback={<div className="p-12 text-center text-slate-400">Loading inventory catalog...</div>}>
      <InventoryClient initialProducts={initialProducts} initialSettings={initialSettings} />
    </Suspense>
  );
}
