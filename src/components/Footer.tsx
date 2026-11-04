'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { MapPin, Phone, Mail, Clock, ShieldCheck, Laptop } from 'lucide-react';
import { BusinessSettings, BusinessHoursDay } from '@/lib/types';

export default function Footer() {
  const [settings, setSettings] = useState<BusinessSettings | null>(null);

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data.success) setSettings(data.settings);
      })
      .catch(err => console.error(err));
  }, []);

  const storeAddress = settings?.address || '12, Gandhipuram, Coimbatore, Tamil Nadu 641012, India';
  const phoneNumber = settings?.phone || '+91 97895 58784';
  const emailAddress = settings?.email || 'srisaicomputerscbe@gmail.com';
  const mapsUrl = settings?.google_maps_url || 'https://maps.google.com/?q=12+Gandhipuram+Coimbatore+Tamil+Nadu+641012';

  let hours: BusinessHoursDay[] = [];
  try {
    if (settings?.hours_json) hours = JSON.parse(settings.hours_json);
  } catch (e) {
    hours = [];
  }

  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Col 1: Shop Information */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 text-white rounded-lg flex items-center justify-center font-bold">
                <Laptop className="w-5 h-5 text-white" />
              </div>
              <span className="font-extrabold text-lg text-white tracking-tight">SRI SAI COMPUTERS</span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">
              Your local trusted shop for quality tested used and refurbished laptops in Gandhipuram, Coimbatore. Every laptop is benchmarked and verified with transparent specifications.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-800/80 p-3 rounded-lg border border-slate-800">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Direct shop pickup & inspection available.</span>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div className="space-y-3">
            <h3 className="font-bold text-white text-base">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="hover:text-blue-400 transition-colors">
                  Home Page
                </Link>
              </li>
              <li>
                <Link href="/laptops" className="hover:text-blue-400 transition-colors">
                  Available Laptops Inventory
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-blue-400 transition-colors">
                  About Us & Store Assurance
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-blue-400 transition-colors">
                  Contact & Shop Location
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-blue-400 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-blue-400 transition-colors">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link href="/admin/login" className="text-slate-500 hover:text-slate-400 transition-colors text-xs">
                  Admin Login Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Contact Details */}
          <div className="space-y-3">
            <h3 className="font-bold text-white text-base">Shop Contact</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-blue-400 mt-1 shrink-0" />
                <span>{storeAddress}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-blue-400 shrink-0" />
                <a href={`tel:${phoneNumber.replace(/\s+/g, '')}`} className="hover:text-white transition-colors">
                  {phoneNumber}
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-blue-400 shrink-0" />
                <a href={`mailto:${emailAddress}`} className="hover:text-white transition-colors">
                  {emailAddress}
                </a>
              </li>
            </ul>
            <div className="pt-2">
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-400 hover:text-blue-300 underline"
              >
                Open Shop Location in Google Maps &rarr;
              </a>
            </div>
          </div>

          {/* Col 4: Business Hours */}
          <div className="space-y-3">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-400" />
              <span>Store Hours</span>
            </h3>
            {hours.length > 0 ? (
              <ul className="space-y-1.5 text-xs text-slate-400">
                {hours.map((h, i) => (
                  <li key={i} className="flex justify-between items-center border-b border-slate-800 pb-1">
                    <span className="font-medium text-slate-300">{h.day}:</span>
                    <span>{h.isOpen ? `${h.openTime} - ${h.closeTime}` : 'Closed'}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-slate-400">Monday – Saturday: 9:30 AM – 8:30 PM<br />Sunday: 10:00 AM – 2:00 PM</p>
            )}
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} Sri Sai Computers. Gandhipuram, Coimbatore. All rights reserved.</p>
          <p>Inventory Showcase & Direct WhatsApp Lead Portal — No Online E-Commerce Checkout.</p>
        </div>
      </div>
    </footer>
  );
}
