'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import ProductCard from '@/components/ProductCard';
import { Product, BusinessSettings } from '@/lib/types';
import { Search, Filter, SlidersHorizontal, RefreshCw, X, Laptop } from 'lucide-react';

interface InventoryClientProps {
  initialProducts: Product[];
  initialSettings: BusinessSettings | null;
}

export default function InventoryClient({ initialProducts, initialSettings }: InventoryClientProps) {
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get('search') || '';

  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [loading, setLoading] = useState(false);
  const [settings] = useState<BusinessSettings | null>(initialSettings);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [hasUserFiltered, setHasUserFiltered] = useState(Boolean(initialSearch));

  // Filter States
  const [search, setSearch] = useState(initialSearch);
  const [brand, setBrand] = useState('');
  const [processor, setProcessor] = useState('');
  const [ram, setRam] = useState('');
  const [storage, setStorage] = useState('');
  const [storageType, setStorageType] = useState('');
  const [condition, setCondition] = useState('');
  const [screenSize, setScreenSize] = useState('');
  const [statusFilter, setStatusFilter] = useState('AVAILABLE');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  // Fetch Products when filters change
  const fetchProducts = async () => {
    // If no custom filters applied and we already have initial products, don't re-fetch
    const isDefaultFilter =
      !search &&
      !brand &&
      !processor &&
      !ram &&
      !storage &&
      !storageType &&
      !condition &&
      !screenSize &&
      statusFilter === 'AVAILABLE' &&
      !maxPrice &&
      sortBy === 'newest';

    if (isDefaultFilter && !hasUserFiltered) {
      setProducts(initialProducts);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (brand) params.append('brand', brand);
      if (processor) params.append('processor', processor);
      if (ram) params.append('ram', ram);
      if (storage) params.append('storage', storage);
      if (storageType) params.append('storage_type', storageType);
      if (condition) params.append('condition', condition);
      if (screenSize) params.append('screen_size', screenSize);
      if (statusFilter) params.append('status', statusFilter);
      if (maxPrice) params.append('maxPrice', maxPrice);
      if (sortBy) params.append('sortBy', sortBy);

      const res = await fetch(`/api/products?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setProducts(data.products);
      }
    } catch (err) {
      console.error('Error loading inventory:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (hasUserFiltered) {
      fetchProducts();
    }
  }, [search, brand, processor, ram, storage, storageType, condition, screenSize, statusFilter, maxPrice, sortBy]);

  const handleFilterChange = (setter: (val: any) => void, val: any) => {
    setHasUserFiltered(true);
    setter(val);
  };

  const clearAllFilters = () => {
    setSearch('');
    setBrand('');
    setProcessor('');
    setRam('');
    setStorage('');
    setStorageType('');
    setCondition('');
    setScreenSize('');
    setStatusFilter('AVAILABLE');
    setMaxPrice('');
    setSortBy('newest');
    setProducts(initialProducts);
    setHasUserFiltered(false);
  };

  const whatsappNumber = settings?.whatsapp_number || '919789558784';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="border-b border-slate-200 pb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Available Laptop Inventory
            </h1>
            <p className="text-slate-600 text-sm mt-1">
              Browse refurbished and used computers currently in stock at our Gandhipuram shop.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileFiltersOpen(true)}
              className="lg:hidden inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold px-4 py-2.5 rounded-lg text-sm transition-colors"
            >
              <SlidersHorizontal className="w-4 h-4 text-blue-600" />
              <span>Filters & Search</span>
            </button>

            <div className="flex items-center gap-2 text-xs text-slate-600">
              <span className="font-semibold">Sort by:</span>
              <select
                value={sortBy}
                onChange={e => handleFilterChange(setSortBy, e.target.value)}
                className="bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="newest">Newest Stock</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="brand">Brand (A-Z)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* DESKTOP FILTERS SIDEBAR */}
        <aside className="hidden lg:block space-y-6 bg-slate-50 p-6 rounded-xl border border-slate-200 h-fit sticky top-24">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200">
            <h2 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
              <Filter className="w-4 h-4 text-blue-600" />
              <span>Filter Stock</span>
            </h2>
            <button
              onClick={clearAllFilters}
              className="text-xs text-blue-700 hover:text-blue-900 font-bold flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>

          {/* Search Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-extrabold text-slate-700 uppercase">Search</label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={e => handleFilterChange(setSearch, e.target.value)}
                placeholder="Model, CPU, SKU..."
                className="w-full bg-white text-slate-900 text-xs pl-9 pr-3 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="space-y-1.5">
            <label className="text-xs font-extrabold text-slate-700 uppercase">Stock Status</label>
            <select
              value={statusFilter}
              onChange={e => handleFilterChange(setStatusFilter, e.target.value)}
              className="w-full bg-white text-slate-900 text-xs px-3 py-2.5 rounded-lg border border-slate-300 font-medium"
            >
              <option value="AVAILABLE">Available Only</option>
              <option value="RESERVED">Reserved</option>
              <option value="SOLD">Sold Stock</option>
              <option value="ALL">Show All Statuses</option>
            </select>
          </div>

          {/* Brand */}
          <div className="space-y-1.5">
            <label className="text-xs font-extrabold text-slate-700 uppercase">Brand</label>
            <select
              value={brand}
              onChange={e => handleFilterChange(setBrand, e.target.value)}
              className="w-full bg-white text-slate-900 text-xs px-3 py-2.5 rounded-lg border border-slate-300"
            >
              <option value="">All Brands</option>
              <option value="Dell">Dell</option>
              <option value="HP">HP</option>
              <option value="Lenovo">Lenovo</option>
              <option value="Apple">Apple</option>
              <option value="Acer">Acer</option>
              <option value="Asus">Asus</option>
            </select>
          </div>

          {/* Processor */}
          <div className="space-y-1.5">
            <label className="text-xs font-extrabold text-slate-700 uppercase">Processor</label>
            <select
              value={processor}
              onChange={e => handleFilterChange(setProcessor, e.target.value)}
              className="w-full bg-white text-slate-900 text-xs px-3 py-2.5 rounded-lg border border-slate-300"
            >
              <option value="">All Processors</option>
              <option value="i3">Intel Core i3</option>
              <option value="i5">Intel Core i5</option>
              <option value="i7">Intel Core i7</option>
              <option value="Ryzen">AMD Ryzen</option>
              <option value="M1">Apple Silicon (M1/M2)</option>
            </select>
          </div>

          {/* RAM */}
          <div className="space-y-1.5">
            <label className="text-xs font-extrabold text-slate-700 uppercase">RAM</label>
            <select
              value={ram}
              onChange={e => handleFilterChange(setRam, e.target.value)}
              className="w-full bg-white text-slate-900 text-xs px-3 py-2.5 rounded-lg border border-slate-300"
            >
              <option value="">Any RAM</option>
              <option value="8">8 GB</option>
              <option value="16">16 GB</option>
              <option value="32">32 GB</option>
            </select>
          </div>

          {/* Storage */}
          <div className="space-y-1.5">
            <label className="text-xs font-extrabold text-slate-700 uppercase">Storage Capacity</label>
            <select
              value={storage}
              onChange={e => handleFilterChange(setStorage, e.target.value)}
              className="w-full bg-white text-slate-900 text-xs px-3 py-2.5 rounded-lg border border-slate-300"
            >
              <option value="">Any Storage</option>
              <option value="256">256 GB</option>
              <option value="512">512 GB</option>
              <option value="1 TB">1 TB</option>
            </select>
          </div>

          {/* Condition */}
          <div className="space-y-1.5">
            <label className="text-xs font-extrabold text-slate-700 uppercase">Condition</label>
            <select
              value={condition}
              onChange={e => handleFilterChange(setCondition, e.target.value)}
              className="w-full bg-white text-slate-900 text-xs px-3 py-2.5 rounded-lg border border-slate-300"
            >
              <option value="">All Conditions</option>
              <option value="Excellent">Excellent</option>
              <option value="Very Good">Very Good</option>
              <option value="Good">Good</option>
            </select>
          </div>

          {/* Screen Size */}
          <div className="space-y-1.5">
            <label className="text-xs font-extrabold text-slate-700 uppercase">Screen Size</label>
            <select
              value={screenSize}
              onChange={e => handleFilterChange(setScreenSize, e.target.value)}
              className="w-full bg-white text-slate-900 text-xs px-3 py-2.5 rounded-lg border border-slate-300"
            >
              <option value="">All Sizes</option>
              <option value="13">13" Display</option>
              <option value="14">14" Display</option>
              <option value="15.6">15.6" Display</option>
            </select>
          </div>

          {/* Max Price Filter */}
          <div className="space-y-1.5">
            <label className="text-xs font-extrabold text-slate-700 uppercase">Max Budget (₹)</label>
            <input
              type="number"
              value={maxPrice}
              onChange={e => handleFilterChange(setMaxPrice, e.target.value)}
              placeholder="e.g. 30000"
              className="w-full bg-white text-slate-900 text-xs px-3 py-2.5 rounded-lg border border-slate-300"
            />
          </div>
        </aside>

        {/* MAIN PRODUCT GRID */}
        <main className="lg:col-span-3 space-y-6">
          {/* Active Filter Chips */}
          {(brand || processor || ram || storage || condition || screenSize || search || maxPrice) && (
            <div className="flex flex-wrap items-center gap-2 bg-blue-50 p-3 rounded-lg border border-blue-100 text-xs">
              <span className="font-bold text-blue-900">Active Filters:</span>
              {search && <span className="bg-white px-2.5 py-1 rounded-md border text-slate-800">"{search}"</span>}
              {brand && <span className="bg-white px-2.5 py-1 rounded-md border text-slate-800">Brand: {brand}</span>}
              {processor && <span className="bg-white px-2.5 py-1 rounded-md border text-slate-800">CPU: {processor}</span>}
              {ram && <span className="bg-white px-2.5 py-1 rounded-md border text-slate-800">RAM: {ram}GB</span>}
              {storage && <span className="bg-white px-2.5 py-1 rounded-md border text-slate-800">SSD: {storage}GB</span>}
              {maxPrice && <span className="bg-white px-2.5 py-1 rounded-md border text-slate-800">Max ₹{maxPrice}</span>}

              <button
                onClick={clearAllFilters}
                className="ml-auto text-blue-700 font-bold hover:underline"
              >
                Clear All
              </button>
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="bg-white rounded-xl border border-slate-200 h-96 animate-pulse p-4 space-y-4">
                  <div className="w-full h-48 bg-slate-200 rounded-lg" />
                  <div className="h-4 bg-slate-200 rounded-xs w-3/4" />
                  <div className="h-4 bg-slate-200 rounded-xs w-1/2" />
                </div>
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map(product => (
                <ProductCard key={product.id} product={product} whatsappNumber={whatsappNumber} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center space-y-4">
              <Laptop className="w-12 h-12 text-slate-400 mx-auto" />
              <h3 className="font-bold text-slate-900 text-xl">No matching laptops found</h3>
              <p className="text-slate-600 text-sm max-w-md mx-auto">
                We couldn't find any products matching your exact filter criteria. Try clearing some filters or searching for another model.
              </p>
              <button
                onClick={clearAllFilters}
                className="inline-flex items-center gap-2 bg-blue-600 text-white font-bold px-5 py-2.5 rounded-lg text-sm hover:bg-blue-700 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reset All Filters</span>
              </button>
            </div>
          )}
        </main>
      </div>

      {/* MOBILE FILTERS DRAWER */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex justify-end lg:hidden">
          <div className="w-full max-w-xs bg-white h-full overflow-y-auto p-6 space-y-6 shadow-xl flex flex-col justify-between">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                <h2 className="font-extrabold text-slate-900 text-base">Filter Stock</h2>
                <button onClick={() => setMobileFiltersOpen(false)} className="p-1 rounded-lg text-slate-500 hover:bg-slate-100">
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Search */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase">Search</label>
                <input
                  type="text"
                  value={search}
                  onChange={e => handleFilterChange(setSearch, e.target.value)}
                  placeholder="ThinkPad, i5, Dell..."
                  className="w-full bg-slate-50 text-slate-900 text-xs p-2.5 rounded-lg border border-slate-300"
                />
              </div>

              {/* Status */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase">Stock Status</label>
                <select
                  value={statusFilter}
                  onChange={e => handleFilterChange(setStatusFilter, e.target.value)}
                  className="w-full bg-slate-50 text-slate-900 text-xs p-2.5 rounded-lg border border-slate-300"
                >
                  <option value="AVAILABLE">Available Only</option>
                  <option value="RESERVED">Reserved</option>
                  <option value="SOLD">Sold Stock</option>
                  <option value="ALL">Show All Statuses</option>
                </select>
              </div>

              {/* Brand */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase">Brand</label>
                <select
                  value={brand}
                  onChange={e => handleFilterChange(setBrand, e.target.value)}
                  className="w-full bg-slate-50 text-slate-900 text-xs p-2.5 rounded-lg border border-slate-300"
                >
                  <option value="">All Brands</option>
                  <option value="Dell">Dell</option>
                  <option value="HP">HP</option>
                  <option value="Lenovo">Lenovo</option>
                  <option value="Apple">Apple</option>
                  <option value="Acer">Acer</option>
                  <option value="Asus">Asus</option>
                </select>
              </div>

              {/* Processor */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase">Processor</label>
                <select
                  value={processor}
                  onChange={e => handleFilterChange(setProcessor, e.target.value)}
                  className="w-full bg-slate-50 text-slate-900 text-xs p-2.5 rounded-lg border border-slate-300"
                >
                  <option value="">All Processors</option>
                  <option value="i3">Intel Core i3</option>
                  <option value="i5">Intel Core i5</option>
                  <option value="i7">Intel Core i7</option>
                  <option value="Ryzen">AMD Ryzen</option>
                  <option value="M1">Apple Silicon</option>
                </select>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 flex gap-2">
              <button
                onClick={clearAllFilters}
                className="w-1/2 py-3 bg-slate-100 font-bold text-slate-700 rounded-lg text-xs"
              >
                Reset
              </button>
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="w-1/2 py-3 bg-blue-600 font-bold text-white rounded-lg text-xs"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
