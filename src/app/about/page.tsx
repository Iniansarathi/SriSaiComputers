import React from 'react';
import { getBusinessSettings } from '@/lib/db';
import { generateGeneralWhatsAppLink } from '@/lib/whatsapp';
import { ShieldCheck, MapPin, CheckCircle2, MessageSquare, Laptop } from 'lucide-react';

export const revalidate = 0;

export default function AboutPage() {
  const settings = getBusinessSettings();
  const whatsappNumber = settings?.whatsapp_number || '919842212345';
  const whatsappUrl = generateGeneralWhatsAppLink(whatsappNumber);
  const aboutText = settings?.about_text || 'Sri Sai Computers is Coimbatore\'s trusted destination for quality tested used and refurbished laptops.';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Header */}
      <div className="max-w-3xl space-y-4">
        <div className="text-xs font-extrabold text-blue-600 uppercase tracking-wider">
          ABOUT SRI SAI COMPUTERS
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Your Trusted Used Laptop Shop in Gandhipuram, Coimbatore
        </h1>
        <p className="text-slate-600 text-base leading-relaxed">
          Providing reliable, benchmarked refurbished laptops with full hardware transparency for students, professionals, and small businesses across Coimbatore.
        </p>
      </div>

      {/* Main Story & Testing Standards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        <div className="bg-slate-900 text-white rounded-2xl p-8 space-y-6">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
            <Laptop className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white">Our Local Commitment</h2>
          <p className="text-slate-300 text-sm leading-relaxed">
            {aboutText}
          </p>
          <div className="pt-4 border-t border-slate-800 flex items-center gap-3">
            <MapPin className="w-5 h-5 text-blue-400 shrink-0" />
            <span className="text-xs text-slate-300 font-medium">
              12, Gandhipuram, Coimbatore, Tamil Nadu 641012
            </span>
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 space-y-6">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-blue-600" />
            <span>Our 5-Point Quality Inspection</span>
          </h2>

          <ul className="space-y-4 text-sm text-slate-700">
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-900">Processor & Motherboard Benchmark:</span> Tested under heavy CPU load to ensure thermal stability and fan operation.
              </div>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-900">RAM & NVMe Health:</span> Memory diagnostic run and SSD health SMART status verified for zero bad blocks.
              </div>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-900">Display & Keyboard Audit:</span> Check for dead pixels, keyboard backlighting, touchpad response, and hinge tension.
              </div>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-900">Battery Discharge Test:</span> Tested under continuous playback to accurately state realistic backup hours.
              </div>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-900">Sanitized & Cleaned:</span> Deep cleaning of interior heat sinks and exterior surfaces before listing.
              </div>
            </li>
          </ul>
        </div>
      </div>

      {/* CTA Box */}
      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-8 text-center space-y-4 max-w-3xl mx-auto">
        <h3 className="text-xl font-extrabold text-slate-900">Ready to find your laptop?</h3>
        <p className="text-slate-600 text-sm">
          Visit our Gandhipuram shop or message us on WhatsApp to check currently available stock.
        </p>
        <div className="pt-2 flex flex-wrap justify-center gap-3">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-3 rounded-xl text-sm transition-colors"
          >
            <MessageSquare className="w-4 h-4 fill-current" />
            <span>Chat on WhatsApp</span>
          </a>
        </div>
      </div>
    </div>
  );
}
