'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Laptop, LayoutDashboard, Package, PlusCircle, Settings, ExternalLink, LogOut } from 'lucide-react';

export default function AdminHeader() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/admin/login');
      router.refresh();
    } catch (e) {
      console.error(e);
    }
  };

  const navs = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Inventory', href: '/admin/inventory', icon: Package },
    { name: 'Add Laptop', href: '/admin/inventory/new', icon: PlusCircle },
    { name: 'Business Settings', href: '/admin/settings', icon: Settings }
  ];

  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-6">
            <Link href="/admin/dashboard" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center font-bold">
                <Laptop className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="font-extrabold text-base tracking-tight">SRI SAI ADMIN</span>
                <span className="text-[10px] text-blue-400 block -mt-1 font-mono">INVENTORY PORTAL</span>
              </div>
            </Link>

            <nav className="hidden md:flex items-center gap-1 ml-4">
              {navs.map(nav => {
                const Icon = nav.icon;
                const active = pathname === nav.href || (nav.href !== '/admin/dashboard' && pathname.startsWith(nav.href));
                return (
                  <Link
                    key={nav.href}
                    href={nav.href}
                    className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-colors ${
                      active ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{nav.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              target="_blank"
              className="inline-flex items-center gap-1.5 text-xs text-slate-300 hover:text-white font-medium bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700 transition-colors"
            >
              <span>Public Website</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>

            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 font-bold bg-slate-800 hover:bg-slate-750 px-3 py-1.5 rounded-lg border border-slate-700 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
