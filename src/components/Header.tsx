'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MapPin, Phone, MessageSquare, Menu, X, Laptop } from 'lucide-react';
import { generateGeneralWhatsAppLink } from '@/lib/whatsapp';
import { BusinessSettings } from '@/lib/types';

export default function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [settings, setSettings] = useState<BusinessSettings | null>(null);

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data.success) setSettings(data.settings);
      })
      .catch(err => console.error(err));
  }, []);

  const isLinkActive = (path: string) => {
    if (path === '/' && pathname === '/') return true;
    if (path !== '/' && pathname.startsWith(path)) return true;
    return false;
  };

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Available Laptops', href: '/laptops' },
    { name: 'About Us', href: '/about' },
    { name: 'Contact & Location', href: '/contact' }
  ];

  const whatsappNumber = settings?.whatsapp_number || '919789558784';
  const phoneNumber = settings?.phone || '+91 97895 58784';
  const whatsappUrl = generateGeneralWhatsAppLink(whatsappNumber);

  // Hide main header on admin pages if desired, but keep accessible link
  const isAdmin = pathname.startsWith('/admin');

  return (
    <header className="w-full bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      {/* Top Announcement / Store Location Bar */}
      <div className="bg-slate-900 text-slate-200 text-xs py-2 px-4 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-2">
          <div className="flex items-center gap-4 text-slate-300">
            <span className="inline-flex items-center gap-1 font-medium">
              <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <span>12, Gandhipuram, Coimbatore, TN 641012</span>
            </span>
            <span className="hidden md:inline text-slate-600">|</span>
            <span className="hidden md:inline-flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <a href={`tel:${phoneNumber.replace(/\s+/g, '')}`} className="hover:text-white transition-colors">
                {phoneNumber}
              </a>
            </span>
          </div>

          <div className="flex items-center gap-3 ml-auto text-slate-300">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 font-semibold transition-colors"
            >
              <MessageSquare className="w-3.5 h-3.5 fill-current" />
              <span>WhatsApp Shop Enquiry</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo & Shop Identity */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 bg-slate-900 text-white rounded-lg flex items-center justify-center font-bold text-xl shadow-xs group-hover:bg-blue-700 transition-colors">
              <Laptop className="w-6 h-6 text-blue-400 group-hover:text-white transition-colors" />
            </div>
            <div>
              <div className="font-extrabold text-xl text-slate-900 tracking-tight leading-none group-hover:text-blue-700 transition-colors">
                SRI SAI COMPUTERS
              </div>
              <div className="text-xs text-slate-600 font-medium mt-1">
                Quality Used Laptops • Gandhipuram, Coimbatore
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(link => {
              const active = isLinkActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-2 rounded-md font-semibold text-sm transition-colors ${
                    active
                      ? 'bg-slate-100 text-blue-700 font-bold'
                      : 'text-slate-700 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}

            {!isAdmin && (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-3 inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-lg text-sm font-bold shadow-xs transition-colors"
              >
                <MessageSquare className="w-4 h-4 fill-current" />
                <span>WhatsApp Us</span>
              </a>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
              aria-label="WhatsApp Us"
            >
              <MessageSquare className="w-5 h-5 fill-current" />
            </a>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-6 space-y-2">
          {navLinks.map(link => {
            const active = isLinkActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-4 py-3 rounded-lg text-base font-semibold ${
                  active ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                {link.name}
              </Link>
            );
          })}
          <div className="pt-2">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-lg font-bold text-center shadow-xs"
            >
              <MessageSquare className="w-5 h-5 fill-current" />
              <span>Contact on WhatsApp</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
