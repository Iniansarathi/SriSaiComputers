import React from 'react';

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-3xl font-extrabold text-slate-900">Terms & Conditions</h1>
        <p className="text-xs text-slate-500 mt-1">Effective Date: September 2026 — Sri Sai Computers, Gandhipuram, Coimbatore</p>
      </div>

      <div className="prose prose-slate text-sm leading-relaxed space-y-6 text-slate-700">
        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900">1. Nature of Website</h2>
          <p>
            This website functions as an online inventory showcase for Sri Sai Computers, located in Gandhipuram, Coimbatore. It is <strong>NOT</strong> an e-commerce platform. There is no online checkout, automatic payment processing, or shipping workflow. All purchases are conducted directly in person at our shop or through manual coordination via WhatsApp/Phone.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900">2. Refurbished & Used Condition Disclosures</h2>
          <p>
            All laptops displayed on this website are pre-owned, refurbished, or used enterprise/consumer laptops. We inspect, clean, and test each machine. Physical cosmetic condition grades (e.g., Excellent, Very Good, Good) and battery backup estimates are provided in good faith based on our store testing benchmarks.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900">3. Pricing & Availability</h2>
          <p>
            Product prices and availability status (Available, Reserved, Sold) are updated regularly. However, physical store sales take precedence. We recommend contacting the shop via WhatsApp or Phone prior to your visit to confirm immediate stock availability.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900">4. Store Testing & Warranty</h2>
          <p>
            Customers are invited and encouraged to inspect, test, and verify any laptop in person at our Gandhipuram shop prior to purchase. Any applicable testing warranty or shop guarantee terms will be explicitly specified on your physical shop invoice.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900">5. Shop Address</h2>
          <p className="font-medium text-slate-900">
            Sri Sai Computers<br />
            12, Gandhipuram, Coimbatore, Tamil Nadu 641012, India
          </p>
        </section>
      </div>
    </div>
  );
}
