import React from 'react';

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-3xl font-extrabold text-slate-900">Privacy Policy</h1>
        <p className="text-xs text-slate-500 mt-1">Last Updated: September 2026 — Sri Sai Computers, Coimbatore</p>
      </div>

      <div className="prose prose-slate text-sm leading-relaxed space-y-6 text-slate-700">
        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900">1. Overview</h2>
          <p>
            Sri Sai Computers ("we", "our", or "us") operates the website for showcasing refurbished and used laptops located at 12, Gandhipuram, Coimbatore, Tamil Nadu 641012, India. We respect your privacy and are committed to protecting any information shared when browsing our inventory.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900">2. Information Collection & Usage</h2>
          <p>
            Our website is strictly an inventory showcase catalog. We do not require account registration, online payments, or store credit card details. When you contact us via WhatsApp or phone, any information provided (such as your name or phone number) is used solely to respond to your product availability enquiry.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900">3. WhatsApp Communication</h2>
          <p>
            When you click "Enquire on WhatsApp", the link opens the official WhatsApp application with a pre-filled product summary. Your conversation takes place entirely within WhatsApp subject to WhatsApp's standard end-to-end encryption and privacy policies.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900">4. Contact Information</h2>
          <p>
            For any questions regarding our privacy practices or store operations, please contact us:
          </p>
          <p className="font-medium text-slate-900">
            Sri Sai Computers<br />
            12, Gandhipuram, Coimbatore, Tamil Nadu 641012, India<br />
            Phone: +91 97895 58784
          </p>
        </section>
      </div>
    </div>
  );
}
