import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getAdminSession } from '@/lib/auth';
import { getDashboardStats, getProducts } from '@/lib/db';
import AdminHeader from '@/components/AdminHeader';
import { PlusCircle, Package, Settings, ExternalLink, CheckCircle2, AlertCircle, XCircle, Eye } from 'lucide-react';

export const revalidate = 0;

export default async function AdminDashboardPage() {
  const session = await getAdminSession();
  if (!session) {
    redirect('/admin/login');
  }

  const stats = getDashboardStats();
  const recentProducts = getProducts({ status: 'ALL', limit: 8 });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-16">
      <AdminHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Title & Welcome */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Shop Inventory Dashboard
            </h1>
            <p className="text-slate-400 text-xs mt-1">
              Logged in as <span className="font-bold text-blue-400">admin</span> • Live SQLite database
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/admin/inventory/new"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition-colors shadow-md"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Add Laptop</span>
            </Link>
          </div>
        </div>

        {/* Real Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-2">
            <div className="flex justify-between items-center text-xs font-bold text-slate-400 uppercase">
              <span>Total Listings</span>
              <Package className="w-4 h-4 text-slate-500" />
            </div>
            <div className="text-3xl font-extrabold text-white">{stats.total}</div>
            <div className="text-[11px] text-slate-500">Recorded inventory entries</div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-2">
            <div className="flex justify-between items-center text-xs font-bold text-emerald-400 uppercase">
              <span>Available</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-3xl font-extrabold text-emerald-400">{stats.available}</div>
            <div className="text-[11px] text-slate-500">Live on public showcase</div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-2">
            <div className="flex justify-between items-center text-xs font-bold text-amber-400 uppercase">
              <span>Reserved</span>
              <AlertCircle className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-3xl font-extrabold text-amber-400">{stats.reserved}</div>
            <div className="text-[11px] text-slate-500">Customer hold / deposit</div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-2">
            <div className="flex justify-between items-center text-xs font-bold text-slate-400 uppercase">
              <span>Sold</span>
              <XCircle className="w-4 h-4 text-slate-500" />
            </div>
            <div className="text-3xl font-extrabold text-slate-300">{stats.sold}</div>
            <div className="text-[11px] text-slate-500">Completed store sales</div>
          </div>
        </div>

        {/* Quick Action Navigation Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/admin/inventory/new"
            className="bg-slate-900 hover:bg-slate-850 border border-slate-800 p-6 rounded-2xl space-y-3 transition-colors group"
          >
            <div className="w-10 h-10 bg-blue-600/20 text-blue-400 rounded-xl flex items-center justify-center font-bold group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <PlusCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Add New Laptop</h3>
              <p className="text-slate-400 text-xs mt-1">Upload photos, enter specs, price & publish listing.</p>
            </div>
          </Link>

          <Link
            href="/admin/inventory"
            className="bg-slate-900 hover:bg-slate-850 border border-slate-800 p-6 rounded-2xl space-y-3 transition-colors group"
          >
            <div className="w-10 h-10 bg-emerald-600/20 text-emerald-400 rounded-xl flex items-center justify-center font-bold group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Manage Full Inventory</h3>
              <p className="text-slate-400 text-xs mt-1">Update prices, edit specs, change status (Available/Reserved/Sold).</p>
            </div>
          </Link>

          <Link
            href="/admin/settings"
            className="bg-slate-900 hover:bg-slate-850 border border-slate-800 p-6 rounded-2xl space-y-3 transition-colors group"
          >
            <div className="w-10 h-10 bg-slate-800 text-slate-300 rounded-xl flex items-center justify-center font-bold group-hover:bg-slate-700 group-hover:text-white transition-colors">
              <Settings className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Business Settings</h3>
              <p className="text-slate-400 text-xs mt-1">Change WhatsApp number, store address, phone & weekly hours.</p>
            </div>
          </Link>
        </div>

        {/* Recent Inventory Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden space-y-4 p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-white text-lg">Recent Stock Listings</h2>
            <Link href="/admin/inventory" className="text-xs font-bold text-blue-400 hover:underline">
              View All Products &rarr;
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
                <tr>
                  <th className="p-3">Product</th>
                  <th className="p-3">Brand</th>
                  <th className="p-3">Price</th>
                  <th className="p-3">Condition</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {recentProducts.map(p => (
                  <tr key={p.id} className="hover:bg-slate-850/50">
                    <td className="p-3 font-semibold text-white">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.primary_image || 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&q=80'}
                          alt=""
                          className="w-10 h-10 object-cover rounded-lg bg-slate-800 shrink-0"
                        />
                        <div className="line-clamp-1">{p.title}</div>
                      </div>
                    </td>
                    <td className="p-3">{p.brand}</td>
                    <td className="p-3 font-extrabold text-white">₹{p.price.toLocaleString('en-IN')}</td>
                    <td className="p-3">{p.condition}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        p.status === 'AVAILABLE' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                        p.status === 'RESERVED' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                        p.status === 'SOLD' ? 'bg-slate-800 text-slate-400 border border-slate-700' :
                        'bg-slate-800 text-slate-500'
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="p-3 text-right space-x-2">
                      <Link
                        href={`/admin/inventory/${p.id}/edit`}
                        className="text-blue-400 hover:text-blue-300 font-bold hover:underline"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
