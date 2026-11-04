import React from 'react';
import Link from 'next/link';
import { getProducts, getBusinessSettings } from '@/lib/db';
import { generateGeneralWhatsAppLink } from '@/lib/whatsapp';
import ProductCard from '@/components/ProductCard';
import { Search, MapPin, Phone, Clock, MessageSquare, ShieldCheck, CheckCircle2, Laptop, ArrowRight } from 'lucide-react';

export const revalidate = 0; // Dynamic server rendering for live stock updates

export default function HomePage() {
  const settings = getBusinessSettings();
  const availableProducts = getProducts({ status: 'AVAILABLE', limit: 6 });

  const whatsappNumber = settings?.whatsapp_number || '919789558784';
  const phoneNumber = settings?.phone || '+91 97895 58784';
  const whatsappUrl = generateGeneralWhatsAppLink(whatsappNumber);
  const mapsUrl = settings?.google_maps_url || 'https://maps.google.com/?q=12+Gandhipuram+Coimbatore+Tamil+Nadu+641012';

  return (
    <div className="space-y-16 pb-16">
      {/* HERO SECTION */}
      <section className="bg-slate-900 text-white relative overflow-hidden border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 relative z-10">
          <div className="max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 bg-slate-800 border border-slate-700 px-3.5 py-1.5 rounded-full text-xs text-blue-300 font-semibold">
              <MapPin className="w-3.5 h-3.5 text-blue-400" />
              <span>Gandhipuram, Coimbatore Shop</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Quality Used & Refurbished Laptops in Coimbatore
            </h1>

            <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
              Browse our verified stock of used laptops from Dell, HP, Lenovo, and Apple. Every system is tested, cleaned, and listed with transparent specifications and actual shop pricing.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <Link
                href="/laptops"
                className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3.5 rounded-xl font-bold text-base transition-colors shadow-md text-center"
              >
                <span>View Available Laptops</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3.5 rounded-xl font-bold text-base transition-colors shadow-md text-center"
              >
                <MessageSquare className="w-5 h-5 fill-current" />
                <span>WhatsApp Us Direct</span>
              </a>
            </div>

            {/* Quick Hero Search Box */}
            <form action="/laptops" method="GET" className="pt-4 max-w-xl">
              <div className="relative">
                <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  name="search"
                  placeholder="Search by brand, model, or processor (e.g., ThinkPad, i5, Dell)..."
                  className="w-full bg-slate-800/90 text-white placeholder-slate-400 pl-11 pr-24 py-3.5 rounded-xl border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3.5 py-2 rounded-lg transition-colors"
                >
                  Search
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* FEATURED / RECENT STOCK SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="text-xs font-extrabold uppercase tracking-wider text-blue-600 mb-1">
              INVENTORY SHOWCASE
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Currently Available Laptops
            </h2>
            <p className="text-slate-600 text-sm mt-1">
              Tested systems available for instant local pickup or WhatsApp inquiry.
            </p>
          </div>

          <Link
            href="/laptops"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-blue-700 hover:text-blue-800 transition-colors"
          >
            <span>Browse Full Stock ({availableProducts.length}+ Laptops)</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {availableProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableProducts.map(product => (
              <ProductCard key={product.id} product={product} whatsappNumber={whatsappNumber} />
            ))}
          </div>
        ) : (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-8 text-center space-y-3">
            <Laptop className="w-10 h-10 text-slate-400 mx-auto" />
            <h3 className="font-bold text-slate-900 text-lg">New stock is being added regularly</h3>
            <p className="text-slate-600 text-sm max-w-md mx-auto">
              We update our physical inventory daily in our Gandhipuram store. Contact us on WhatsApp for the latest stock updates.
            </p>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-emerald-600 text-white font-bold px-5 py-2.5 rounded-lg text-sm"
            >
              <MessageSquare className="w-4 h-4 fill-current" />
              <span>Contact Shop on WhatsApp</span>
            </a>
          </div>
        )}
      </section>

      {/* WHY SRI SAI COMPUTERS */}
      <section className="bg-slate-50 border-y border-slate-200 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-12">
            <div className="text-xs font-extrabold uppercase tracking-wider text-blue-600 mb-1">
              TRANSPARENT RETAIL
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Why Buy From Sri Sai Computers?
            </h2>
            <p className="text-slate-600 text-sm mt-1">
              Factual standards we uphold for every refurbished laptop in our Gandhipuram store.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-3 shadow-xs">
              <div className="w-10 h-10 bg-blue-50 text-blue-700 rounded-lg flex items-center justify-center font-bold">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Tested Hardware</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Every laptop undergoes thorough stress testing for display pixels, keyboard keys, battery backup, thermals, and port functionality.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-3 shadow-xs">
              <div className="w-10 h-10 bg-blue-50 text-blue-700 rounded-lg flex items-center justify-center font-bold">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Transparent Specs</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                We clearly disclose exact processor generation, RAM capacity, SSD health, battery backup hours, and cosmetic condition.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-3 shadow-xs">
              <div className="w-10 h-10 bg-blue-50 text-blue-700 rounded-lg flex items-center justify-center font-bold">
                <MapPin className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Gandhipuram Shop</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Visit our physical shop in Gandhipuram, Coimbatore to inspect the laptop in hand, run your tests, and buy with confidence.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-3 shadow-xs">
              <div className="w-10 h-10 bg-emerald-50 text-emerald-700 rounded-lg flex items-center justify-center font-bold">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">WhatsApp Enquiries</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                No checkout forms or complex accounts. Simply click WhatsApp on any laptop to chat directly with our shop team.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* LOCATION & CONTACT SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 text-white rounded-2xl p-8 lg:p-12 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 bg-blue-600/30 text-blue-300 px-3 py-1 rounded-full text-xs font-bold border border-blue-500/30">
              PHYSICAL STORE LOCATION
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Visit Sri Sai Computers in Gandhipuram
            </h2>

            <div className="space-y-4 text-slate-300 text-sm">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-white text-base">Sri Sai Computers</div>
                  <div>12, Gandhipuram, Coimbatore, Tamil Nadu 641012, India</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-blue-400 shrink-0" />
                <div>
                  <span className="font-medium text-slate-400">Phone: </span>
                  <a href={`tel:${phoneNumber.replace(/\s+/g, '')}`} className="text-white hover:underline font-bold">
                    {phoneNumber}
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-blue-400 shrink-0" />
                <div>
                  <span className="font-medium text-slate-400">Working Hours: </span>
                  <span className="text-white font-medium">Mon - Sat: 9:30 AM - 8:30 PM | Sun: 10:00 AM - 2:00 PM</span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex flex-wrap gap-3">
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-3 rounded-xl text-sm transition-colors"
              >
                <MapPin className="w-4 h-4" />
                <span>Get Directions on Google Maps</span>
              </a>

              <a
                href={`tel:${phoneNumber.replace(/\s+/g, '')}`}
                className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white font-bold px-5 py-3 rounded-xl text-sm transition-colors border border-slate-700"
              >
                <Phone className="w-4 h-4" />
                <span>Call Shop</span>
              </a>
            </div>
          </div>

          <div className="bg-slate-800/80 p-6 rounded-xl border border-slate-700 space-y-4">
            <h3 className="font-bold text-white text-lg border-b border-slate-700 pb-3">
              Quick Contact Checklist
            </h3>
            <ul className="space-y-3 text-sm text-slate-300">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Looking for a specific model or specification?</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Want to check current stock availability before visiting?</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Need guidance on choosing between ThinkPad, Latitude, or EliteBook?</span>
              </li>
            </ul>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-lg text-sm transition-colors text-center"
            >
              <MessageSquare className="w-4 h-4 fill-current" />
              <span>Enquire on WhatsApp Now</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
