import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import './globals.css';

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
  display: 'swap'
});

export const metadata: Metadata = {
  title: 'Sri Sai Computers | Quality Used Laptops in Gandhipuram, Coimbatore',
  description: 'Browse tested used and refurbished laptops in Gandhipuram, Coimbatore. Check specifications, condition and pricing for Dell, HP, Lenovo, Apple & Acer laptops, then contact us directly on WhatsApp.',
  keywords: 'Used laptops Coimbatore, Refurbished laptops Gandhipuram, Second hand laptops Coimbatore, Sri Sai Computers, Used ThinkPad Coimbatore, Refurbished Dell laptop Coimbatore',
  metadataBase: new URL('https://srisaicomputers.com'),
  openGraph: {
    title: 'Sri Sai Computers — Refurbished & Used Laptops in Coimbatore',
    description: 'Quality tested used laptops in Gandhipuram, Coimbatore. Direct WhatsApp lead portal with transparent specifications and actual shop pricing.',
    type: 'website',
    locale: 'en_IN',
    siteName: 'Sri Sai Computers'
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${jakarta.variable} scroll-smooth`}>
      <body className="bg-slate-50 text-slate-900 font-sans antialiased flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
