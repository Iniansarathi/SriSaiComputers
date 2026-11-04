# Sri Sai Computers — Used & Refurbished Laptop Showcase & Lead Portal

A production-ready web application and inventory management portal built for **Sri Sai Computers**, a trusted local computer store located in Gandhipuram, Coimbatore, Tamil Nadu, India.

---

## 📌 Business Overview

- **Business Name:** Sri Sai Computers
- **Location:** 12, Gandhipuram, Coimbatore, Tamil Nadu 641012, India
- **WhatsApp Enquiry:** `+91 97895 58784`
- **Purpose:** An online digital showroom and lead-generation catalog that showcases verified, physical laptop inventory in Coimbatore.
- **Important Note:** This is **not an e-commerce website**. There is no online shopping cart, payment gateway, or shipping checkout. Customers browse live inventory, view transparent hardware specifications and condition notes, and click **"Enquire on WhatsApp"** to directly message the shop with a pre-filled enquiry for that specific laptop.

---

## 🚀 Key Features

### 💻 Public Showcase
- **Home Page (`/`)**: Factual hero section, quick search bar, featured inventory grid, 5-point quality inspection assurance, and physical store location in Gandhipuram with Google Maps integration.
- **Inventory Browser (`/laptops`)**: Multi-field filtering (Brand, Processor, RAM, Storage, Storage Type, Condition, Screen Size, Price Range, Stock Status) with mobile drawer and sorting (Newest, Price Low-High, Price High-Low, Brand A-Z).
- **Product Details (`/laptops/[slug]`)**: Photo gallery with thumbnail selector, comprehensive technical specifications table, cosmetic condition notes, battery backup audit, share buttons (Web Share API + Copy Link), and direct **"Enquire on WhatsApp"** button.
- **WhatsApp Integration**: Automatically pre-fills a formatted WhatsApp message with:
  - Product Name & Model
  - Processor, RAM & Storage
  - Cosmetic Condition
  - Listed Price (₹)
  - Direct Product Link
- **Store Contact & Hours (`/contact`)**: Store address, phone numbers, Google Maps navigation, and weekly business hours schedule.
- **Informational & Legal Pages**: About Us (`/about`), Privacy Policy (`/privacy`), Terms & Conditions (`/terms`).

### 🔐 Admin Inventory Portal (`/admin`)
- **Secure Authentication**: Protected via HTTP-only JWT session cookies (`ssc_admin_session`).
- **Dashboard (`/admin/dashboard`)**: Real-time stock counts (Total, Available, Reserved, Sold), quick actions, and recent inventory table.
- **Inventory CRUD (`/admin/inventory`)**: Table view with quick status toggles (`AVAILABLE`, `RESERVED`, `SOLD`, `HIDDEN`), edit actions, live preview links, and deletion confirmation.
- **Add & Edit Laptop Form (`/admin/inventory/new` & `[id]/edit`)**: Auto-generates product titles from specs, detailed specification inputs, photo upload manager (`public/uploads/`), primary image selector, and a live public preview modal.
- **Business Settings (`/admin/settings`)**: Centralized management of shop name, address, display phone, WhatsApp enquiry number, Google Maps link, and weekly opening/closing hours per day.

---

## 🛠️ Tech Stack

- **Framework:** Next.js 16 (App Router, Turbopack)
- **UI & Components:** React 19, Lucide React Icons
- **Styling:** Tailwind CSS v4
- **Typography:** Plus Jakarta Sans
- **Database:** SQLite via `better-sqlite3` (WAL mode enabled)
- **Authentication:** JWT sessions via `jose` stored in HTTP-only cookies
- **Language:** TypeScript 5

---

## 🏃 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Production Build
```bash
npm run build
npm run start
```

---

## 🔑 Admin Access

- **Login URL:** `/admin/login` or `/admin`
- **Default Username:** `admin`
- **Default Password:** `admin123`

*(Password can be updated in the database or via environment configuration).*

---

## 📁 Project Structure

```text
├── data/
│   └── srisai.db               # SQLite database file (auto-seeds on first run)
├── public/
│   ├── uploads/                # Admin uploaded product photos
│   └── *.svg                   # Static assets
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root layout with Header and Footer
│   │   ├── page.tsx            # Home page (SSR)
│   │   ├── laptops/            # Inventory catalog and dynamic detail pages
│   │   ├── admin/              # Private admin portal (Dashboard, Inventory, Settings)
│   │   └── api/                # REST endpoints (products, auth, settings, upload)
│   ├── components/             # Reusable UI components (ProductCard, ProductForm, Header, etc.)
│   └── lib/
│       ├── db.ts               # SQLite schema, seeder & CRUD operations
│       ├── auth.ts             # JWT authentication helpers
│       ├── types.ts            # TypeScript interfaces
│       └── whatsapp.ts         # WhatsApp click-to-chat URL generator
└── next.config.ts              # Next.js configuration
```

---

## 📄 License

Proprietary — Built for Sri Sai Computers, Gandhipuram, Coimbatore.
