'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import AdminHeader from '@/components/AdminHeader';
import { Product } from '@/lib/types';
import { PlusCircle, Search, Edit3, Trash2, ExternalLink, CheckCircle2, AlertCircle, XCircle, Eye, RefreshCw } from 'lucide-react';

export default function InventoryManagementPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (statusFilter && statusFilter !== 'ALL') params.append('status', statusFilter);
      params.append('status', statusFilter === 'ALL' ? 'ALL' : statusFilter);

      const res = await fetch(`/api/products?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setProducts(data.products);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [search, statusFilter]);

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'UPDATE_STATUS', status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        fetchProducts();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await fetch(`/api/products/${deleteId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setDeleteId(null);
        fetchProducts();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-16">
      <AdminHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Page Title & Add Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Manage Laptop Inventory
            </h1>
            <p className="text-slate-400 text-xs mt-1">
              Add, update prices, change availability states, or hide products.
            </p>
          </div>

          <Link
            href="/admin/inventory/new"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition-colors shadow-md"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Add Laptop</span>
          </Link>
        </div>

        {/* Filter Controls Bar */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Filter by title, brand, CPU, SKU..."
              className="w-full bg-slate-950 text-white text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs text-slate-400 font-bold whitespace-nowrap">Filter Status:</span>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="bg-slate-950 text-white border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto"
            >
              <option value="ALL">All Statuses ({products.length})</option>
              <option value="AVAILABLE">Available Only</option>
              <option value="RESERVED">Reserved</option>
              <option value="SOLD">Sold</option>
              <option value="HIDDEN">Hidden</option>
            </select>
          </div>
        </div>

        {/* Inventory Data Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          {loading ? (
            <div className="p-12 text-center text-slate-400 text-sm">Loading inventory database...</div>
          ) : products.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
                  <tr>
                    <th className="p-4">Product Listing</th>
                    <th className="p-4">Brand / CPU</th>
                    <th className="p-4">RAM / Storage</th>
                    <th className="p-4">Price (₹)</th>
                    <th className="p-4">Condition</th>
                    <th className="p-4">Status State</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {products.map(p => (
                    <tr key={p.id} className="hover:bg-slate-850/50">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={p.images?.find(i => i.is_primary)?.image_url || p.primary_image || p.images?.[0]?.image_url || 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&q=80'}
                            alt=""
                            className="w-12 h-12 object-cover rounded-lg bg-slate-800 shrink-0 border border-slate-700"
                          />
                          <div>
                            <div className="font-bold text-white text-sm line-clamp-1">{p.title}</div>
                            <div className="text-[11px] text-slate-500 font-mono mt-0.5">SKU: {p.sku}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="font-semibold text-slate-200">{p.brand}</div>
                        <div className="text-[11px] text-slate-400">{p.processor_brand} {p.processor_model}</div>
                      </td>
                      <td className="p-4">
                        <div className="text-slate-200">{p.ram} RAM</div>
                        <div className="text-[11px] text-slate-400">{p.storage_capacity} {p.storage_type}</div>
                      </td>
                      <td className="p-4 font-extrabold text-white text-sm">
                        ₹{p.price.toLocaleString('en-IN')}
                      </td>
                      <td className="p-4">
                        <span className="bg-slate-800 text-slate-300 px-2 py-1 rounded text-[10px] font-bold border border-slate-700">
                          {p.condition}
                        </span>
                      </td>
                      <td className="p-4">
                        <select
                          value={p.status}
                          onChange={e => handleStatusChange(p.id, e.target.value)}
                          className={`text-xs font-bold rounded-lg px-2.5 py-1 border focus:outline-none ${
                            p.status === 'AVAILABLE' ? 'bg-emerald-950 text-emerald-300 border-emerald-800' :
                            p.status === 'RESERVED' ? 'bg-amber-950 text-amber-300 border-amber-800' :
                            p.status === 'SOLD' ? 'bg-slate-800 text-slate-400 border-slate-700' :
                            'bg-slate-950 text-slate-500 border-slate-800'
                          }`}
                        >
                          <option value="AVAILABLE">AVAILABLE</option>
                          <option value="RESERVED">RESERVED</option>
                          <option value="SOLD">SOLD</option>
                          <option value="HIDDEN">HIDDEN</option>
                        </select>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/laptops/${p.slug}`}
                            target="_blank"
                            className="p-2 text-slate-400 hover:text-blue-400 bg-slate-800 hover:bg-slate-750 rounded-lg transition-colors"
                            title="Preview Public Listing"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>

                          <Link
                            href={`/admin/inventory/${p.id}/edit`}
                            className="p-2 text-blue-400 hover:text-blue-300 bg-slate-800 hover:bg-slate-750 rounded-lg transition-colors font-bold"
                            title="Edit Laptop Details"
                          >
                            <Edit3 className="w-4 h-4" />
                          </Link>

                          <button
                            onClick={() => setDeleteId(p.id)}
                            className="p-2 text-rose-400 hover:text-rose-300 bg-slate-800 hover:bg-slate-750 rounded-lg transition-colors"
                            title="Delete Product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center text-slate-400 space-y-3">
              <div className="text-base font-bold text-white">No products found</div>
              <p className="text-xs text-slate-500">Add a new laptop listing or adjust search filters.</p>
            </div>
          )}
        </div>
      </main>

      {/* Delete Confirmation Dialog */}
      {deleteId && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex justify-center items-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-2xl">
            <h3 className="font-extrabold text-white text-lg">Confirm Delete</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to delete this laptop listing? This action cannot be undone.
            </p>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setDeleteId(null)}
                className="w-1/2 py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-300 font-bold text-xs rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="w-1/2 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
