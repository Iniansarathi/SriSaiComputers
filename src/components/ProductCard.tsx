'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MessageSquare, Cpu, HardDrive, CpuIcon, CheckCircle2, AlertCircle, XCircle } from 'lucide-react';
import { Product } from '@/lib/types';
import { generateWhatsAppLink } from '@/lib/whatsapp';

interface ProductCardProps {
  product: Product;
  whatsappNumber: string;
}

export default function ProductCard({ product, whatsappNumber }: ProductCardProps) {
  const isAvailable = product.status === 'AVAILABLE';
  const isReserved = product.status === 'RESERVED';
  const isSold = product.status === 'SOLD';

  const whatsappUrl = generateWhatsAppLink(whatsappNumber, product);

  const fallbackImage = 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&q=80';
  const primaryFromImages = product.images?.find(i => i.is_primary)?.image_url;
  const firstImage = product.images?.[0]?.image_url;
  const imageSrc = primaryFromImages || product.primary_image || firstImage || fallbackImage;

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col h-full group">
      {/* Product Image & Badges */}
      <div className="relative aspect-4/3 bg-slate-100 overflow-hidden">
        <img
          src={imageSrc}
          alt={`Used ${product.brand} ${product.model} laptop in Coimbatore`}
          className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
          loading="lazy"
        />

        {/* Availability Badge */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {isAvailable && (
            <span className="inline-flex items-center gap-1 bg-emerald-600 text-white text-xs font-bold px-2.5 py-1 rounded-md shadow-xs">
              <CheckCircle2 className="w-3.5 h-3.5" />
              AVAILABLE
            </span>
          )}
          {isReserved && (
            <span className="inline-flex items-center gap-1 bg-amber-600 text-white text-xs font-bold px-2.5 py-1 rounded-md shadow-xs">
              <AlertCircle className="w-3.5 h-3.5" />
              RESERVED
            </span>
          )}
          {isSold && (
            <span className="inline-flex items-center gap-1 bg-slate-700 text-white text-xs font-bold px-2.5 py-1 rounded-md shadow-xs">
              <XCircle className="w-3.5 h-3.5" />
              SOLD
            </span>
          )}
        </div>

        {/* Condition Tag */}
        <div className="absolute top-3 right-3 z-10">
          <span className="bg-slate-900/80 backdrop-blur-xs text-white text-xs font-semibold px-2.5 py-1 rounded-md border border-slate-700">
            {product.condition} Condition
          </span>
        </div>
      </div>

      {/* Product Information Body */}
      <div className="p-5 flex flex-col flex-grow justify-between gap-4">
        <div className="space-y-3">
          <div className="flex justify-between items-center text-xs text-slate-600 font-bold uppercase tracking-wider">
            <span>{product.brand}</span>
            <span className="text-slate-500 font-normal">SKU: {product.sku}</span>
          </div>

          <h3 className="font-bold text-slate-900 text-base leading-snug line-clamp-2 group-hover:text-blue-700 transition-colors">
            <Link href={`/laptops/${product.slug}`}>
              {product.title}
            </Link>
          </h3>

          {/* Key Specifications Grid */}
          <div className="grid grid-cols-2 gap-2 text-xs text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-100 font-medium">
            <div className="flex items-center gap-1.5 truncate">
              <Cpu className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span className="truncate">{product.processor_brand} {product.processor_model}</span>
            </div>
            <div className="flex items-center gap-1.5 truncate">
              <CpuIcon className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span className="truncate">{product.ram} RAM</span>
            </div>
            <div className="flex items-center gap-1.5 truncate">
              <HardDrive className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span className="truncate">{product.storage_capacity} {product.storage_type}</span>
            </div>
            <div className="flex items-center gap-1.5 truncate">
              <span className="text-blue-600 font-bold text-xs shrink-0">LCD</span>
              <span className="truncate">{product.screen_size} Display</span>
            </div>
          </div>
        </div>

        {/* Pricing & Actions */}
        <div className="pt-2 border-t border-slate-100 space-y-3">
          <div className="flex justify-between items-baseline">
            <span className="text-xs text-slate-600 font-medium">Shop Price:</span>
            <span className="text-xl font-extrabold text-slate-900">
              ₹{product.price.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Link
              href={`/laptops/${product.slug}`}
              className="w-full inline-flex items-center justify-center px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-bold transition-colors"
            >
              View Details
            </Link>

            {isSold ? (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-1 px-3 py-2.5 bg-slate-200 text-slate-700 hover:bg-slate-300 rounded-lg text-xs font-bold transition-colors text-center"
              >
                <MessageSquare className="w-3.5 h-3.5 shrink-0" />
                <span>Ask Similar</span>
              </a>
            ) : (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors shadow-xs text-center"
              >
                <MessageSquare className="w-3.5 h-3.5 fill-current shrink-0" />
                <span>WhatsApp</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
