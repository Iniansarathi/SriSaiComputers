'use client';

import React, { useState, useEffect } from 'react';
import AdminHeader from '@/components/AdminHeader';
import { BusinessSettings, BusinessHoursDay } from '@/lib/types';
import { Save, CheckCircle2, AlertCircle, Clock, MapPin, Phone, MessageSquare, Globe } from 'lucide-react';

export default function BusinessSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const [businessName, setBusinessName] = useState('Sri Sai Computers');
  const [address, setAddress] = useState('12, Gandhipuram, Coimbatore, Tamil Nadu 641012, India');
  const [phone, setPhone] = useState('+91 97895 58784');
  const [whatsappNumber, setWhatsappNumber] = useState('919789558784');
  const [email, setEmail] = useState('srisaicomputerscbe@gmail.com');
  const [googleMapsUrl, setGoogleMapsUrl] = useState('https://maps.google.com/?q=12+Gandhipuram+Coimbatore+Tamil+Nadu+641012');
  const [instagramUrl, setInstagramUrl] = useState('https://instagram.com/srisaicomputers_cbe');
  const [facebookUrl, setFacebookUrl] = useState('https://facebook.com/srisaicomputerscbe');
  const [aboutText, setAboutText] = useState('Sri Sai Computers is Coimbatore\'s trusted destination for quality tested used and refurbished laptops.');

  const [hours, setHours] = useState<BusinessHoursDay[]>([
    { day: 'Monday', isOpen: true, openTime: '09:30 AM', closeTime: '08:30 PM' },
    { day: 'Tuesday', isOpen: true, openTime: '09:30 AM', closeTime: '08:30 PM' },
    { day: 'Wednesday', isOpen: true, openTime: '09:30 AM', closeTime: '08:30 PM' },
    { day: 'Thursday', isOpen: true, openTime: '09:30 AM', closeTime: '08:30 PM' },
    { day: 'Friday', isOpen: true, openTime: '09:30 AM', closeTime: '08:30 PM' },
    { day: 'Saturday', isOpen: true, openTime: '09:30 AM', closeTime: '08:30 PM' },
    { day: 'Sunday', isOpen: true, openTime: '10:00 AM', closeTime: '02:00 PM' }
  ]);

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.settings) {
          const s: BusinessSettings = data.settings;
          setBusinessName(s.business_name || 'Sri Sai Computers');
          setAddress(s.address || '');
          setPhone(s.phone || '');
          setWhatsappNumber(s.whatsapp_number || '');
          setEmail(s.email || '');
          setGoogleMapsUrl(s.google_maps_url || '');
          setInstagramUrl(s.instagram_url || '');
          setFacebookUrl(s.facebook_url || '');
          setAboutText(s.about_text || '');
          try {
            if (s.hours_json) setHours(JSON.parse(s.hours_json));
          } catch (e) {
            console.error(e);
          }
        }
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleHoursChange = (index: number, key: keyof BusinessHoursDay, value: any) => {
    setHours(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [key]: value };
      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');

    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          business_name: businessName,
          address,
          phone,
          whatsapp_number: whatsappNumber,
          email,
          google_maps_url: googleMapsUrl,
          instagram_url: instagramUrl,
          facebook_url: facebookUrl,
          about_text: aboutText,
          hours_json: JSON.stringify(hours)
        })
      });

      const data = await res.json();
      if (data.success) {
        setMessage('Business settings & WhatsApp number saved successfully!');
        setTimeout(() => setMessage(''), 4000);
      } else {
        setError(data.error || 'Failed to save settings');
      }
    } catch (err: any) {
      setError('Network error saving business settings.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-16">
      <AdminHeader />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Business Settings
            </h1>
            <p className="text-slate-400 text-xs mt-1">
              Configure store contact numbers, WhatsApp target, location & operating hours.
            </p>
          </div>

          <button
            onClick={handleSubmit}
            disabled={saving}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-xl text-xs transition-colors shadow-md disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving Settings...' : 'Save Settings'}</span>
          </button>
        </div>

        {message && (
          <div className="bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs p-4 rounded-xl flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{message}</span>
          </div>
        )}

        {error && (
          <div className="bg-rose-950/80 border border-rose-800 text-rose-300 text-xs p-4 rounded-xl flex items-center gap-2 font-medium">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Shop Contact & WhatsApp */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h2 className="font-extrabold text-white text-base flex items-center gap-2 border-b border-slate-800 pb-3">
              <Phone className="w-4 h-4 text-blue-400" />
              <span>Store Identity & Contact Details</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300 uppercase">Business Name</label>
                <input
                  type="text"
                  required
                  value={businessName}
                  onChange={e => setBusinessName(e.target.value)}
                  className="w-full bg-slate-950 text-white text-xs px-3.5 py-2.5 rounded-xl border border-slate-800 font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-emerald-400 uppercase flex items-center gap-1">
                  <MessageSquare className="w-3.5 h-3.5 fill-current" />
                  <span>WhatsApp Number (For Direct Leads) *</span>
                </label>
                <input
                  type="text"
                  required
                  value={whatsappNumber}
                  onChange={e => setWhatsappNumber(e.target.value)}
                  placeholder="e.g. 919842212345"
                  className="w-full bg-slate-950 text-white text-xs px-3.5 py-2.5 rounded-xl border border-emerald-800 font-bold font-mono focus:ring-2 focus:ring-emerald-500"
                />
                <span className="text-[10px] text-slate-500 block mt-0.5">Enter country code + 10-digit mobile (e.g. 919842212345)</span>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300 uppercase">Display Phone Number</label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="+91 98422 12345"
                  className="w-full bg-slate-950 text-white text-xs px-3.5 py-2.5 rounded-xl border border-slate-800"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300 uppercase">Shop Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="srisaicomputerscbe@gmail.com"
                  className="w-full bg-slate-950 text-white text-xs px-3.5 py-2.5 rounded-xl border border-slate-800"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs font-bold text-slate-300 uppercase">Full Physical Address</label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  className="w-full bg-slate-950 text-white text-xs px-3.5 py-2.5 rounded-xl border border-slate-800 font-medium"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs font-bold text-slate-300 uppercase">Google Maps Directions URL</label>
                <input
                  type="url"
                  value={googleMapsUrl}
                  onChange={e => setGoogleMapsUrl(e.target.value)}
                  className="w-full bg-slate-950 text-white text-xs px-3.5 py-2.5 rounded-xl border border-slate-800 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Store Description */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h2 className="font-extrabold text-white text-base border-b border-slate-800 pb-3">About Store Text</h2>
            <textarea
              rows={4}
              value={aboutText}
              onChange={e => setAboutText(e.target.value)}
              className="w-full bg-slate-950 text-white text-xs p-3.5 rounded-xl border border-slate-800 leading-relaxed"
            />
          </div>

          {/* Section 3: Business Hours */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h2 className="font-extrabold text-white text-base flex items-center gap-2 border-b border-slate-800 pb-3">
              <Clock className="w-4 h-4 text-blue-400" />
              <span>Weekly Business Hours</span>
            </h2>

            <div className="space-y-3">
              {hours.map((h, idx) => (
                <div key={idx} className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-center bg-slate-950 p-3 rounded-xl border border-slate-850">
                  <div className="font-bold text-xs text-white sm:col-span-1">{h.day}</div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id={`open-${idx}`}
                      checked={h.isOpen}
                      onChange={e => handleHoursChange(idx, 'isOpen', e.target.checked)}
                      className="w-4 h-4 accent-blue-600 rounded"
                    />
                    <label htmlFor={`open-${idx}`} className="text-xs text-slate-300 font-medium">
                      {h.isOpen ? 'Open' : 'Closed'}
                    </label>
                  </div>

                  {h.isOpen && (
                    <>
                      <div className="space-y-0.5">
                        <span className="text-[10px] text-slate-500 block uppercase font-bold">Opens</span>
                        <input
                          type="text"
                          value={h.openTime}
                          onChange={e => handleHoursChange(idx, 'openTime', e.target.value)}
                          className="w-full bg-slate-900 text-white text-xs px-2.5 py-1.5 rounded-lg border border-slate-800 font-mono"
                        />
                      </div>

                      <div className="space-y-0.5">
                        <span className="text-[10px] text-slate-500 block uppercase font-bold">Closes</span>
                        <input
                          type="text"
                          value={h.closeTime}
                          onChange={e => handleHoursChange(idx, 'closeTime', e.target.value)}
                          className="w-full bg-slate-900 text-white text-xs px-2.5 py-1.5 rounded-lg border border-slate-800 font-mono"
                        />
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
