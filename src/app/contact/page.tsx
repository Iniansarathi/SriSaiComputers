import React from 'react';
import { getBusinessSettings } from '@/lib/db';
import { generateGeneralWhatsAppLink } from '@/lib/whatsapp';
import { BusinessHoursDay } from '@/lib/types';
import { MapPin, Phone, MessageSquare, Mail, Clock, Navigation } from 'lucide-react';

export const revalidate = 0;

export default function ContactPage() {
  const settings = getBusinessSettings();

  const storeAddress = settings?.address || '12, Gandhipuram, Coimbatore, Tamil Nadu 641012, India';
  const phoneNumber = settings?.phone || '+91 97895 58784';
  const whatsappNumber = settings?.whatsapp_number || '919789558784';
  const emailAddress = settings?.email || 'srisaicomputerscbe@gmail.com';
  const mapsUrl = settings?.google_maps_url || 'https://maps.google.com/?q=12+Gandhipuram+Coimbatore+Tamil+Nadu+641012';
  const whatsappUrl = generateGeneralWhatsAppLink(whatsappNumber);

  let hours: BusinessHoursDay[] = [];
  try {
    if (settings?.hours_json) hours = JSON.parse(settings.hours_json);
  } catch (e) {
    hours = [];
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Page Title */}
      <div className="max-w-3xl space-y-3">
        <div className="text-xs font-extrabold text-blue-600 uppercase tracking-wider">
          STORE CONTACT & LOCATION
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Visit or Contact Sri Sai Computers
        </h1>
        <p className="text-slate-600 text-base">
          Our retail store is conveniently located in Gandhipuram, Coimbatore. Reach out to us directly via WhatsApp or Phone for inventory queries.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Direct Contact Info (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs">
            <h2 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-4">
              Store Details
            </h2>

            <div className="space-y-6 text-sm text-slate-700">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-blue-50 text-blue-700 rounded-xl flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-extrabold text-slate-900 text-base">Sri Sai Computers</div>
                  <div className="text-slate-600 mt-1">{storeAddress}</div>
                  <div className="mt-2">
                    <a
                      href={mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 hover:text-blue-900 underline"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      <span>Get Directions on Google Maps</span>
                    </a>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-emerald-50 text-emerald-700 rounded-xl flex items-center justify-center shrink-0">
                  <MessageSquare className="w-5 h-5 fill-current" />
                </div>
                <div>
                  <div className="font-extrabold text-slate-900 text-base">WhatsApp Support</div>
                  <div className="text-slate-600 mt-1">Direct chat for quick inventory availability check</div>
                  <div className="mt-2">
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-lg text-xs transition-colors"
                    >
                      <MessageSquare className="w-4 h-4 fill-current" />
                      <span>Message on WhatsApp</span>
                    </a>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-slate-100 text-slate-700 rounded-xl flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-extrabold text-slate-900 text-base">Phone Call</div>
                  <div className="text-slate-600 mt-1">
                    <a href={`tel:${phoneNumber.replace(/\s+/g, '')}`} className="font-bold text-slate-900 hover:underline">
                      {phoneNumber}
                    </a>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-slate-100 text-slate-700 rounded-xl flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-extrabold text-slate-900 text-base">Email Enquiries</div>
                  <div className="text-slate-600 mt-1">
                    <a href={`mailto:${emailAddress}`} className="hover:underline">
                      {emailAddress}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Operating Hours Table (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 space-y-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-4">
              <Clock className="w-5 h-5 text-blue-400" />
              <span>Weekly Shop Hours</span>
            </h2>

            {hours.length > 0 ? (
              <div className="space-y-3 text-sm">
                {hours.map((h, idx) => (
                  <div key={idx} className="flex justify-between items-center border-b border-slate-800/80 pb-2">
                    <span className="font-semibold text-slate-300">{h.day}</span>
                    <span className={h.isOpen ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                      {h.isOpen ? `${h.openTime} – ${h.closeTime}` : 'Closed'}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-2 text-sm text-slate-300">
                <p><strong>Monday – Saturday:</strong> 9:30 AM – 8:30 PM</p>
                <p><strong>Sunday:</strong> 10:00 AM – 2:00 PM</p>
              </div>
            )}

            <div className="pt-2 text-xs text-slate-400 bg-slate-800 p-3.5 rounded-xl border border-slate-700">
              💡 <strong>Store Visit Tip:</strong> Feel free to call or WhatsApp us beforehand to confirm specific laptop availability before traveling to Gandhipuram!
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
