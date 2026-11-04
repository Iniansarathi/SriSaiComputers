'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Product, BusinessSettings } from '@/lib/types';
import { generateWhatsAppLink } from '@/lib/whatsapp';
import {
  MessageSquare,
  Phone,
  Share2,
  Copy,
  Check,
  ChevronLeft,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Cpu,
  HardDrive,
  Monitor,
  Battery,
  ShieldCheck,
  MapPin,
  Sparkles,
  Info
} from 'lucide-react';

interface ProductDetailClientProps {
  product: Product;
  settings: BusinessSettings | null;
}

export default function ProductDetailClient({ product, settings }: ProductDetailClientProps) {
  const images = product.images && product.images.length > 0
    ? product.images.map(img => img.image_url)
    : [product.primary_image || 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&q=80'];

  const [selectedImage, setSelectedImage] = useState(images[0]);
  const [copied, setCopied] = useState(false);

  const whatsappNumber = settings?.whatsapp_number || '919789558784';
  const phoneNumber = settings?.phone || '+91 97895 58784';
  const whatsappUrl = generateWhatsAppLink(whatsappNumber, product);

  const isAvailable = product.status === 'AVAILABLE';
  const isReserved = product.status === 'RESERVED';
  const isSold = product.status === 'SOLD';

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.title,
          text: `Check out this used ${product.brand} laptop at Sri Sai Computers Gandhipuram for ₹${product.price.toLocaleString('en-IN')}`,
          url: window.location.href
        });
      } catch (e) {
        // Fallback copy
        copyToClipboard();
      }
    } else {
      copyToClipboard();
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const specsList = [
    { label: 'Brand', value: product.brand },
    { label: 'Model', value: product.model },
    { label: 'SKU / Internal ID', value: product.sku },
    { label: 'Processor', value: `${product.processor_brand} ${product.processor_model} ${product.processor_generation || ''}`.trim() },
    { label: 'System Memory (RAM)', value: `${product.ram} ${product.ram_type || ''}`.trim() },
    { label: 'Storage', value: `${product.storage_capacity} ${product.storage_type}` },
    { label: 'Display Size & Panel', value: `${product.screen_size} ${product.resolution || ''}`.trim() },
    { label: 'Graphics Card (GPU)', value: product.gpu || 'Integrated Graphics' },
    { label: 'Operating System', value: product.operating_system || 'Windows 10 / 11' },
    { label: 'Battery Backup Condition', value: product.battery_condition || 'Tested Operating Battery Backup' },
    { label: 'Keyboard Layout', value: product.keyboard_layout },
    { label: 'Available Ports', value: product.ports },
    { label: 'Wi-Fi & Bluetooth', value: product.connectivity },
    { label: 'Included Accessories', value: product.accessories },
    { label: 'Cosmetic Condition Grade', value: product.condition }
  ].filter(s => Boolean(s.value));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Breadcrumb & Navigation */}
      <div className="flex items-center justify-between text-xs text-slate-600">
        <Link
          href="/laptops"
          className="inline-flex items-center gap-1 font-bold text-slate-700 hover:text-blue-700 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Available Laptops</span>
        </Link>

        <span className="font-mono text-slate-400">SKU: {product.sku}</span>
      </div>

      {/* Main Product Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Image Gallery (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-100 rounded-2xl border border-slate-200 overflow-hidden relative aspect-4/3">
            <img
              src={selectedImage}
              alt={`${product.title} - Sri Sai Computers Gandhipuram`}
              className="w-full h-full object-cover"
            />

            {/* Status Overlay Badge */}
            <div className="absolute top-4 left-4 z-10">
              {isAvailable && (
                <span className="inline-flex items-center gap-1.5 bg-emerald-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-md">
                  <CheckCircle2 className="w-4 h-4" />
                  AVAILABLE STOCK
                </span>
              )}
              {isReserved && (
                <span className="inline-flex items-center gap-1.5 bg-amber-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-md">
                  <AlertCircle className="w-4 h-4" />
                  RESERVED
                </span>
              )}
              {isSold && (
                <span className="inline-flex items-center gap-1.5 bg-slate-800 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-md">
                  <XCircle className="w-4 h-4" />
                  SOLD
                </span>
              )}
            </div>

            <div className="absolute top-4 right-4 z-10">
              <span className="bg-slate-900/90 text-white text-xs font-bold px-3 py-1.5 rounded-lg backdrop-blur-xs border border-slate-700">
                {product.condition} Condition
              </span>
            </div>
          </div>

          {/* Thumbnail Selector */}
          {images.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-all shrink-0 bg-slate-100 ${
                    selectedImage === img ? 'border-blue-600 ring-2 ring-blue-500/20' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Store Assurance Notice */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-start gap-3 text-xs text-slate-700">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-slate-900 text-sm">Inspected at Gandhipuram Shop</div>
              <div className="mt-0.5">
                This laptop is available for direct hand inspection at 12, Gandhipuram, Coimbatore. Run stress tests and verify specifications in person.
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Product Info & CTAs (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="space-y-3">
            <div className="text-xs font-extrabold text-blue-600 uppercase tracking-wider">
              {product.brand} • REFURBISHED LAPTOP
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
              {product.title}
            </h1>

            {/* Price Display */}
            <div className="bg-slate-900 text-white p-5 rounded-2xl flex items-center justify-between shadow-xs">
              <div>
                <div className="text-xs text-slate-400 font-semibold uppercase">Actual Shop Price</div>
                <div className="text-3xl font-black text-white tracking-tight mt-0.5">
                  ₹{product.price.toLocaleString('en-IN')}
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs font-bold text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded-md border border-emerald-800/80">
                  {product.condition} Condition
                </span>
              </div>
            </div>
          </div>

          {/* Primary Action Buttons */}
          <div className="space-y-3">
            {isSold ? (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-900 text-white font-bold py-4 px-6 rounded-xl text-base shadow-md transition-colors text-center"
              >
                <MessageSquare className="w-5 h-5 shrink-0" />
                <span>Ask About Similar Stock on WhatsApp</span>
              </a>
            ) : (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 px-6 rounded-xl text-base shadow-md transition-colors text-center"
              >
                <MessageSquare className="w-5 h-5 fill-current shrink-0" />
                <span>Enquire on WhatsApp</span>
              </a>
            )}

            <div className="grid grid-cols-2 gap-3">
              <a
                href={`tel:${phoneNumber.replace(/\s+/g, '')}`}
                className="inline-flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-3 px-4 rounded-xl text-sm transition-colors text-center"
              >
                <Phone className="w-4 h-4" />
                <span>Call Shop</span>
              </a>

              <button
                onClick={handleShare}
                className="inline-flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-3 px-4 rounded-xl text-sm transition-colors"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
                <span>{copied ? 'Link Copied!' : 'Share Laptop'}</span>
              </button>
            </div>
          </div>

          {/* Condition Notes */}
          {product.condition_notes && (
            <div className="bg-amber-50 border border-amber-200/80 rounded-xl p-4 space-y-1">
              <div className="text-xs font-bold text-amber-900 uppercase flex items-center gap-1.5">
                <Info className="w-4 h-4 text-amber-700" />
                <span>Shop Inspection & Condition Notes</span>
              </div>
              <p className="text-xs text-amber-950 leading-relaxed font-medium">
                "{product.condition_notes}"
              </p>
            </div>
          )}

          {/* Description */}
          {product.description && (
            <div className="space-y-2">
              <h3 className="font-bold text-slate-900 text-sm">Product Overview</h3>
              <p className="text-xs text-slate-700 leading-relaxed bg-white p-4 rounded-xl border border-slate-200">
                {product.description}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* TECHNICAL SPECIFICATIONS SECTION */}
      <section className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 space-y-6">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900">
            Technical Specifications
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Complete technical audit verified by Sri Sai Computers.
          </p>
        </div>

        <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-200 text-xs">
          {specsList.map((spec, i) => (
            <div key={i} className={`grid grid-cols-1 md:grid-cols-3 p-3.5 ${i % 2 === 0 ? 'bg-slate-50/50' : 'bg-white'}`}>
              <div className="font-bold text-slate-700 md:col-span-1">{spec.label}</div>
              <div className="text-slate-900 font-medium md:col-span-2 mt-1 md:mt-0">{spec.value}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
