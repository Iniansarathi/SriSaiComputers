import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { Product, ProductImage, BusinessSettings, DashboardStats } from './types';

const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'srisai.db');
const db = new Database(dbPath);

// Enable WAL mode for better concurrency performance
db.pragma('journal_mode = WAL');

// Initialize Database Tables
export function initDB() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS admin_users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS business_settings (
      id TEXT PRIMARY KEY,
      business_name TEXT NOT NULL,
      address TEXT NOT NULL,
      phone TEXT NOT NULL,
      whatsapp_number TEXT NOT NULL,
      email TEXT NOT NULL,
      google_maps_url TEXT NOT NULL,
      instagram_url TEXT,
      facebook_url TEXT,
      about_text TEXT NOT NULL,
      hours_json TEXT NOT NULL,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      slug TEXT UNIQUE NOT NULL,
      sku TEXT NOT NULL,
      brand TEXT NOT NULL,
      model TEXT NOT NULL,
      title TEXT NOT NULL,
      processor_brand TEXT NOT NULL,
      processor_model TEXT NOT NULL,
      processor_generation TEXT,
      ram TEXT NOT NULL,
      ram_type TEXT,
      storage_capacity TEXT NOT NULL,
      storage_type TEXT NOT NULL,
      screen_size TEXT NOT NULL,
      resolution TEXT,
      gpu TEXT,
      operating_system TEXT,
      condition TEXT NOT NULL,
      condition_notes TEXT,
      battery_condition TEXT,
      keyboard_layout TEXT,
      ports TEXT,
      connectivity TEXT,
      accessories TEXT,
      description TEXT,
      price REAL NOT NULL,
      status TEXT CHECK(status IN ('AVAILABLE', 'RESERVED', 'SOLD', 'HIDDEN')) DEFAULT 'AVAILABLE',
      featured INTEGER DEFAULT 0,
      display_order INTEGER DEFAULT 0,
      primary_image TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS product_images (
      id TEXT PRIMARY KEY,
      product_id TEXT NOT NULL,
      image_url TEXT NOT NULL,
      is_primary INTEGER DEFAULT 0,
      display_order INTEGER DEFAULT 0,
      FOREIGN KEY(product_id) REFERENCES products(id) ON DELETE CASCADE
    );
  `);

  seedInitialData();
}

function seedInitialData() {
  // 1. Seed Admin User if none exists (Default credentials: admin / admin123)
  const adminCount = (db.prepare('SELECT COUNT(*) as count FROM admin_users').get() as { count: number }).count;
  if (adminCount === 0) {
    // Standard hash for 'admin123'
    db.prepare(`
      INSERT INTO admin_users (id, username, password_hash)
      VALUES (?, ?, ?)
    `).run('admin-1', 'admin', 'admin123');
  }

  // 2. Seed Business Settings if none exists
  const settingsCount = (db.prepare('SELECT COUNT(*) as count FROM business_settings').get() as { count: number }).count;
  if (settingsCount === 0) {
    const defaultHours = JSON.stringify([
      { day: 'Monday', isOpen: true, openTime: '09:30 AM', closeTime: '08:30 PM' },
      { day: 'Tuesday', isOpen: true, openTime: '09:30 AM', closeTime: '08:30 PM' },
      { day: 'Wednesday', isOpen: true, openTime: '09:30 AM', closeTime: '08:30 PM' },
      { day: 'Thursday', isOpen: true, openTime: '09:30 AM', closeTime: '08:30 PM' },
      { day: 'Friday', isOpen: true, openTime: '09:30 AM', closeTime: '08:30 PM' },
      { day: 'Saturday', isOpen: true, openTime: '09:30 AM', closeTime: '08:30 PM' },
      { day: 'Sunday', isOpen: true, openTime: '10:00 AM', closeTime: '02:00 PM' }
    ]);

    db.prepare(`
      INSERT INTO business_settings (
        id, business_name, address, phone, whatsapp_number, email, google_maps_url, instagram_url, facebook_url, about_text, hours_json
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      'settings-1',
      'Sri Sai Computers',
      '12, Gandhipuram, Coimbatore, Tamil Nadu 641012, India',
      '+91 97895 58784',
      '919789558784',
      'srisaicomputerscbe@gmail.com',
      'https://maps.google.com/?q=12+Gandhipuram+Coimbatore+Tamil+Nadu+641012',
      'https://instagram.com/srisaicomputers_cbe',
      'https://facebook.com/srisaicomputerscbe',
      'Sri Sai Computers is Coimbatore\'s trusted destination for quality tested used and refurbished laptops. Located in the heart of Gandhipuram, we inspect, clean, upgrade, and benchmark every laptop to ensure genuine performance and complete transparency for students, working professionals, and business owners.',
      defaultHours
    );
  } else {
    // Ensure existing database also uses the updated number
    db.prepare(`
      UPDATE business_settings SET phone = ?, whatsapp_number = ? WHERE id = 'settings-1'
    `).run('+91 97895 58784', '919789558784');
  }

  // 3. Seed Products if empty
  const productCount = (db.prepare('SELECT COUNT(*) as count FROM products').get() as { count: number }).count;
  if (productCount === 0) {
    const seedProducts = [
      {
        id: 'p1',
        slug: 'lenovo-thinkpad-t480-i5-8th-16gb-512gb',
        sku: 'SSC-LNV-T480',
        brand: 'Lenovo',
        model: 'ThinkPad T480',
        title: 'Lenovo ThinkPad T480 — Intel Core i5 8th Gen (16GB RAM / 512GB SSD)',
        processor_brand: 'Intel',
        processor_model: 'Core i5-8350U',
        processor_generation: '8th Gen',
        ram: '16 GB',
        ram_type: 'DDR4',
        storage_capacity: '512 GB',
        storage_type: 'NVMe SSD',
        screen_size: '14"',
        resolution: '1920x1080 Full HD IPS',
        gpu: 'Intel UHD Graphics 620',
        operating_system: 'Windows 11 Pro 64-bit',
        condition: 'Very Good',
        condition_notes: 'Fully tested enterprise laptop. Pristine display and keyboard. Minor cosmetic scuffs on outer top lid.',
        battery_condition: 'Dual Battery Setup — 3.5+ Hours Backup',
        keyboard_layout: 'English US Backlit',
        ports: '2x USB 3.1, 1x USB-C Thunderbolt 3, HDMI, RJ45 Ethernet, SD Card Reader, Audio Jack',
        connectivity: 'Dual Band Wi-Fi 5, Bluetooth 4.2',
        accessories: 'Original Lenovo Type-C 65W Charger included',
        description: 'Legendary ThinkPad durability with dual battery support, spill-resistant keyboard, and fast NVMe storage. Ideal for coding, accounting, administrative work, and heavy multitasking.',
        price: 24500,
        status: 'AVAILABLE',
        featured: 1,
        display_order: 1,
        primary_image: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&q=80',
        images: [
          'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&q=80',
          'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800&q=80'
        ]
      },
      {
        id: 'p2',
        slug: 'dell-latitude-5400-i5-8th-16gb-256gb',
        sku: 'SSC-DLL-5400',
        brand: 'Dell',
        model: 'Latitude 5400',
        title: 'Dell Latitude 5400 — Intel Core i5 8th Gen (16GB RAM / 256GB SSD)',
        processor_brand: 'Intel',
        processor_model: 'Core i5-8265U',
        processor_generation: '8th Gen',
        ram: '16 GB',
        ram_type: 'DDR4',
        storage_capacity: '256 GB',
        storage_type: 'M.2 NVMe SSD',
        screen_size: '14"',
        resolution: '1920x1080 Full HD Anti-Glare',
        gpu: 'Intel UHD Graphics 620',
        operating_system: 'Windows 11 Pro',
        condition: 'Excellent',
        condition_notes: 'Clean condition inside out. Zero scratches on screen or palmrest.',
        battery_condition: 'Excellent Health — 3+ Hours Backup',
        keyboard_layout: 'English US',
        ports: '3x USB 3.1, 1x USB-C DisplayPort, HDMI, RJ45, MicroSD Reader',
        connectivity: 'Intel Wi-Fi 6, Bluetooth 5.0',
        accessories: 'Original Dell 65W Power Adapter',
        description: 'Sleek professional laptop built for everyday reliability. Fast boot-up with NVMe SSD and crisp 1080p display.',
        price: 22800,
        status: 'AVAILABLE',
        featured: 1,
        display_order: 2,
        primary_image: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800&q=80',
        images: [
          'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800&q=80'
        ]
      },
      {
        id: 'p3',
        slug: 'hp-elitebook-840-g5-i7-8th-16gb-512gb',
        sku: 'SSC-HP-840G5',
        brand: 'HP',
        model: 'EliteBook 840 G5',
        title: 'HP EliteBook 840 G5 — Intel Core i7 8th Gen (16GB RAM / 512GB SSD)',
        processor_brand: 'Intel',
        processor_model: 'Core i7-8550U',
        processor_generation: '8th Gen',
        ram: '16 GB',
        ram_type: 'DDR4',
        storage_capacity: '512 GB',
        storage_type: 'NVMe SSD',
        screen_size: '14"',
        resolution: '1920x1080 Full HD IPS',
        gpu: 'Intel UHD Graphics 620',
        operating_system: 'Windows 11 Pro',
        condition: 'Excellent',
        condition_notes: 'Premium aluminum body in pristine condition. Bang & Olufsen audio setup.',
        battery_condition: 'Good Health — 3 to 4 Hours Backup',
        keyboard_layout: 'Backlit Keyboard',
        ports: '2x USB 3.1, 1x Thunderbolt 3 (USB-C), HDMI, RJ-45, Docking connector',
        connectivity: 'Intel Dual Band Wireless-AC, Bluetooth 4.2',
        accessories: 'Original HP Smart AC Adapter included',
        description: 'Ultra-thin premium business ultrabook crafted from precision CNC aluminum. Incredible build quality and top-notch Core i7 performance.',
        price: 28900,
        status: 'AVAILABLE',
        featured: 1,
        display_order: 3,
        primary_image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&q=80',
        images: [
          'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&q=80'
        ]
      },
      {
        id: 'p4',
        slug: 'apple-macbook-air-m1-8gb-256gb-space-gray',
        sku: 'SSC-APL-M1AIR',
        brand: 'Apple',
        model: 'MacBook Air M1',
        title: 'Apple MacBook Air M1 (8GB Unified RAM / 256GB SSD) — Space Gray',
        processor_brand: 'Apple',
        processor_model: 'M1 8-Core CPU',
        processor_generation: 'Apple Silicon M1',
        ram: '8 GB',
        ram_type: 'Unified Memory',
        storage_capacity: '256 GB',
        storage_type: 'Fast NVMe Storage',
        screen_size: '13.3"',
        resolution: '2560x1600 Retina Display with True Tone',
        gpu: 'Apple 7-Core GPU',
        operating_system: 'macOS Sequoia / Sonoma',
        condition: 'Excellent',
        condition_notes: 'Flawless condition. Low battery cycle count (under 120 cycles). No dent or scratches.',
        battery_condition: 'Original Battery Health 92% — 9+ Hours Backup',
        keyboard_layout: 'Magic Keyboard with Touch ID',
        ports: '2x Thunderbolt / USB 4 ports, 3.5mm Headphone jack',
        connectivity: 'Wi-Fi 6, Bluetooth 5.0',
        accessories: 'Original Apple 30W USB-C Charger & Cable',
        description: 'Revolutionary Apple M1 chip performance with silent fanless design and all-day battery life. Ideal for video editing, design, photography, and general use.',
        price: 52000,
        status: 'AVAILABLE',
        featured: 1,
        display_order: 4,
        primary_image: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800&q=80',
        images: [
          'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800&q=80'
        ]
      },
      {
        id: 'p5',
        slug: 'lenovo-thinkpad-l14-ryzen-5-16gb-512gb',
        sku: 'SSC-LNV-L14R5',
        brand: 'Lenovo',
        model: 'ThinkPad L14 Gen 1',
        title: 'Lenovo ThinkPad L14 Gen 1 — AMD Ryzen 5 PRO 4650U (6 Cores / 16GB RAM / 512GB SSD)',
        processor_brand: 'AMD',
        processor_model: 'Ryzen 5 PRO 4650U',
        processor_generation: '4000 Series',
        ram: '16 GB',
        ram_type: 'DDR4 3200MHz',
        storage_capacity: '512 GB',
        storage_type: 'NVMe M.2 SSD',
        screen_size: '14"',
        resolution: '1920x1080 Full HD Anti-Glare',
        gpu: 'AMD Radeon RX Vega 6 Graphics',
        operating_system: 'Windows 11 Pro',
        condition: 'Very Good',
        condition_notes: 'Fully functional. Minor wear on trackpad.',
        battery_condition: '3+ Hours Tested Backup',
        keyboard_layout: 'English US',
        ports: '2x USB 3.2, 2x USB-C 3.2, HDMI 1.4, MicroSD card reader, RJ-45',
        connectivity: 'Wi-Fi 6 AX200, Bluetooth 5.1',
        accessories: 'Original Type-C Charger',
        description: 'Powerful 6-core 12-thread AMD processor with integrated Radeon graphics. Excellent multi-threaded performance for software development and heavy data workloads.',
        price: 26000,
        status: 'AVAILABLE',
        featured: 0,
        display_order: 5,
        primary_image: 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=800&q=80',
        images: [
          'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=800&q=80'
        ]
      },
      {
        id: 'p6',
        slug: 'dell-precision-3541-workstation-i7-9th-32gb-512gb-quadro',
        sku: 'SSC-DLL-P3541',
        brand: 'Dell',
        model: 'Precision 3541',
        title: 'Dell Precision 3541 Mobile Workstation — Intel Core i7 9th Gen (32GB RAM / 512GB SSD + 1TB / Quadro 4GB)',
        processor_brand: 'Intel',
        processor_model: 'Core i7-9750H',
        processor_generation: '9th Gen Hexa-Core',
        ram: '32 GB',
        ram_type: 'DDR4',
        storage_capacity: '512 GB SSD + 1 TB HDD',
        storage_type: 'Dual Storage (NVMe SSD + SATA HDD)',
        screen_size: '15.6"',
        resolution: '1920x1080 Full HD',
        gpu: 'NVIDIA Quadro P620 4GB Dedicated GDDR5',
        operating_system: 'Windows 11 Pro',
        condition: 'Excellent',
        condition_notes: 'High performance Mobile Workstation. Checked under heavy render loads.',
        battery_condition: '2.5 to 3 Hours Backup',
        keyboard_layout: 'Full size with Numpad',
        ports: '3x USB 3.1, 1x USB-C Thunderbolt 3, HDMI 2.0, RJ-45, SD Reader',
        connectivity: 'Intel Wi-Fi 5, Bluetooth 5.0',
        accessories: 'Original Dell 130W High Power Adapter',
        description: 'Dedicated ISV certified CAD/3D workstation laptop. Powered by 6-core Intel i7 CPU, 32GB RAM and dedicated NVIDIA Quadro GPU for AutoCAD, Revit, SolidWorks, and video editing.',
        price: 38500,
        status: 'AVAILABLE',
        featured: 0,
        display_order: 6,
        primary_image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&q=80',
        images: [
          'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&q=80'
        ]
      },
      {
        id: 'p7',
        slug: 'hp-pavilion-gaming-15-ryzen-5-5600h-8gb-gtx1650',
        sku: 'SSC-HP-PVG15',
        brand: 'HP',
        model: 'Pavilion Gaming 15',
        title: 'HP Pavilion Gaming 15 — AMD Ryzen 5 5600H (8GB RAM / 512GB SSD / GTX 1650 4GB)',
        processor_brand: 'AMD',
        processor_model: 'Ryzen 5 5600H',
        processor_generation: '5000 Series Hexa-Core',
        ram: '8 GB',
        ram_type: 'DDR4 3200MHz',
        storage_capacity: '512 GB',
        storage_type: 'NVMe SSD',
        screen_size: '15.6"',
        resolution: '1920x1080 Full HD 144Hz Refresh Rate',
        gpu: 'NVIDIA GeForce GTX 1650 4GB GDDR6',
        operating_system: 'Windows 11 Home',
        condition: 'Good',
        condition_notes: 'Clean body. Tested with 3D Mark benchmarks.',
        battery_condition: '2+ Hours Backup',
        keyboard_layout: 'Green Backlit Gaming Keyboard',
        ports: 'USB-C, USB 3.1, USB 2.0, HDMI 2.0, RJ-45 Ethernet, Audio Combo',
        connectivity: 'Realtek Wi-Fi 5, Bluetooth 5.0',
        accessories: 'Original HP 150W Gaming Charger',
        description: 'Budget gaming laptop with high 144Hz refresh rate display and dedicated GTX graphics card for gaming, 3D rendering, and graphic design.',
        price: 36000,
        status: 'RESERVED',
        featured: 0,
        display_order: 7,
        primary_image: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800&q=80',
        images: [
          'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800&q=80'
        ]
      },
      {
        id: 'p8',
        slug: 'acer-aspire-5-i3-11th-8gb-512gb',
        sku: 'SSC-ACR-ASP5',
        brand: 'Acer',
        model: 'Aspire 5',
        title: 'Acer Aspire 5 — Intel Core i3 11th Gen (8GB RAM / 512GB SSD)',
        processor_brand: 'Intel',
        processor_model: 'Core i3-1115G4',
        processor_generation: '11th Gen',
        ram: '8 GB',
        ram_type: 'DDR4',
        storage_capacity: '512 GB',
        storage_type: 'NVMe SSD',
        screen_size: '15.6"',
        resolution: '1920x1080 Full HD Slim Bezel',
        gpu: 'Intel UHD Graphics',
        operating_system: 'Windows 11 Home',
        condition: 'Good',
        condition_notes: 'Sold out item retained for reference.',
        battery_condition: '3 Hours Backup',
        keyboard_layout: 'Full size with numeric keypad',
        ports: 'USB 3.2, USB-C, USB 2.0, HDMI, Ethernet port',
        connectivity: 'Wi-Fi 6, Bluetooth 5.1',
        accessories: 'Original Acer Charger included',
        description: 'Everyday budget laptop ideal for students, web browsing, online classes, and office documents.',
        price: 19500,
        status: 'SOLD',
        featured: 0,
        display_order: 8,
        primary_image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80',
        images: [
          'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80'
        ]
      }
    ];

    const insertProd = db.prepare(`
      INSERT INTO products (
        id, slug, sku, brand, model, title, processor_brand, processor_model, processor_generation,
        ram, ram_type, storage_capacity, storage_type, screen_size, resolution, gpu, operating_system,
        condition, condition_notes, battery_condition, keyboard_layout, ports, connectivity, accessories,
        description, price, status, featured, display_order, primary_image
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?
      )
    `);

    const insertImg = db.prepare(`
      INSERT INTO product_images (id, product_id, image_url, is_primary, display_order)
      VALUES (?, ?, ?, ?, ?)
    `);

    db.transaction(() => {
      for (const p of seedProducts) {
        insertProd.run(
          p.id, p.slug, p.sku, p.brand, p.model, p.title, p.processor_brand, p.processor_model, p.processor_generation,
          p.ram, p.ram_type, p.storage_capacity, p.storage_type, p.screen_size, p.resolution, p.gpu, p.operating_system,
          p.condition, p.condition_notes, p.battery_condition, p.keyboard_layout, p.ports, p.connectivity, p.accessories,
          p.description, p.price, p.status, p.featured, p.display_order, p.primary_image
        );

        p.images.forEach((imgUrl, idx) => {
          insertImg.run(`${p.id}-img-${idx}`, p.id, imgUrl, idx === 0 ? 1 : 0, idx);
        });
      }
    })();
  }
}

// Call initDB immediately when db module loads
initDB();

// Helper Database Operations

export function getBusinessSettings(): BusinessSettings {
  const row = db.prepare('SELECT * FROM business_settings LIMIT 1').get() as BusinessSettings;
  return row;
}

export function updateBusinessSettings(settings: Partial<BusinessSettings>) {
  db.prepare(`
    UPDATE business_settings SET
      business_name = COALESCE(?, business_name),
      address = COALESCE(?, address),
      phone = COALESCE(?, phone),
      whatsapp_number = COALESCE(?, whatsapp_number),
      email = COALESCE(?, email),
      google_maps_url = COALESCE(?, google_maps_url),
      instagram_url = COALESCE(?, instagram_url),
      facebook_url = COALESCE(?, facebook_url),
      about_text = COALESCE(?, about_text),
      hours_json = COALESCE(?, hours_json),
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(
    settings.business_name,
    settings.address,
    settings.phone,
    settings.whatsapp_number,
    settings.email,
    settings.google_maps_url,
    settings.instagram_url,
    settings.facebook_url,
    settings.about_text,
    settings.hours_json,
    'settings-1'
  );

  return getBusinessSettings();
}

export function getProducts(options?: {
  search?: string;
  brand?: string;
  processor?: string;
  ram?: string;
  storage?: string;
  storage_type?: string;
  condition?: string;
  screen_size?: string;
  status?: string; // Default 'AVAILABLE' for public, or 'ALL' for admin
  minPrice?: number;
  maxPrice?: number;
  featuredOnly?: boolean;
  sortBy?: string; // 'newest' | 'price_asc' | 'price_desc' | 'brand'
  limit?: number;
}): Product[] {
  let query = 'SELECT * FROM products WHERE 1=1';
  const params: any[] = [];

  if (options?.status && options.status !== 'ALL') {
    query += ' AND status = ?';
    params.push(options.status);
  } else if (!options?.status) {
    // Default public behavior: show AVAILABLE, RESERVED, SOLD (excluding HIDDEN)
    query += " AND status IN ('AVAILABLE', 'RESERVED', 'SOLD')";
  }

  if (options?.featuredOnly) {
    query += ' AND featured = 1';
  }

  if (options?.brand) {
    query += ' AND LOWER(brand) = LOWER(?)';
    params.push(options.brand);
  }

  if (options?.processor) {
    query += ' AND (LOWER(processor_brand) LIKE ? OR LOWER(processor_model) LIKE ?)';
    params.push(`%${options.processor.toLowerCase()}%`, `%${options.processor.toLowerCase()}%`);
  }

  if (options?.ram) {
    query += ' AND LOWER(ram) LIKE ?';
    params.push(`%${options.ram.toLowerCase()}%`);
  }

  if (options?.storage) {
    query += ' AND LOWER(storage_capacity) LIKE ?';
    params.push(`%${options.storage.toLowerCase()}%`);
  }

  if (options?.storage_type) {
    query += ' AND LOWER(storage_type) LIKE ?';
    params.push(`%${options.storage_type.toLowerCase()}%`);
  }

  if (options?.condition) {
    query += ' AND LOWER(condition) = LOWER(?)';
    params.push(options.condition);
  }

  if (options?.screen_size) {
    query += ' AND LOWER(screen_size) LIKE ?';
    params.push(`%${options.screen_size.toLowerCase()}%`);
  }

  if (options?.minPrice !== undefined && !isNaN(options.minPrice)) {
    query += ' AND price >= ?';
    params.push(options.minPrice);
  }

  if (options?.maxPrice !== undefined && !isNaN(options.maxPrice)) {
    query += ' AND price <= ?';
    params.push(options.maxPrice);
  }

  if (options?.search) {
    const s = `%${options.search.toLowerCase()}%`;
    query += ' AND (LOWER(title) LIKE ? OR LOWER(brand) LIKE ? OR LOWER(model) LIKE ? OR LOWER(sku) LIKE ? OR LOWER(processor_model) LIKE ?)';
    params.push(s, s, s, s, s);
  }

  // Sorting
  if (options?.sortBy === 'price_asc') {
    query += ' ORDER BY price ASC';
  } else if (options?.sortBy === 'price_desc') {
    query += ' ORDER BY price DESC';
  } else if (options?.sortBy === 'brand') {
    query += ' ORDER BY brand ASC, title ASC';
  } else {
    // Default newest / display_order
    query += ' ORDER BY display_order ASC, created_at DESC';
  }

  if (options?.limit) {
    query += ' LIMIT ?';
    params.push(options.limit);
  }

  const products = db.prepare(query).all(...params) as Product[];

  // Attach images
  const getImagesStmt = db.prepare('SELECT * FROM product_images WHERE product_id = ? ORDER BY is_primary DESC, display_order ASC');
  for (const prod of products) {
    prod.images = getImagesStmt.all(prod.id) as ProductImage[];
  }

  return products;
}

export function getProductBySlugOrId(identifier: string): Product | null {
  const prod = db.prepare('SELECT * FROM products WHERE slug = ? OR id = ?').get(identifier, identifier) as Product | undefined;
  if (!prod) return null;

  prod.images = db.prepare('SELECT * FROM product_images WHERE product_id = ? ORDER BY is_primary DESC, display_order ASC').all(prod.id) as ProductImage[];
  return prod;
}

export function getDashboardStats(): DashboardStats {
  const total = (db.prepare("SELECT COUNT(*) as count FROM products WHERE status != 'HIDDEN'").get() as any).count;
  const available = (db.prepare("SELECT COUNT(*) as count FROM products WHERE status = 'AVAILABLE'").get() as any).count;
  const reserved = (db.prepare("SELECT COUNT(*) as count FROM products WHERE status = 'RESERVED'").get() as any).count;
  const sold = (db.prepare("SELECT COUNT(*) as count FROM products WHERE status = 'SOLD'").get() as any).count;

  return { total, available, reserved, sold };
}

export function createProduct(productData: Omit<Product, 'id' | 'created_at' | 'updated_at'>, imagesList: string[]): Product {
  const id = 'prod_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
  const primaryImg = imagesList[0] || productData.primary_image || '';

  db.prepare(`
    INSERT INTO products (
      id, slug, sku, brand, model, title, processor_brand, processor_model, processor_generation,
      ram, ram_type, storage_capacity, storage_type, screen_size, resolution, gpu, operating_system,
      condition, condition_notes, battery_condition, keyboard_layout, ports, connectivity, accessories,
      description, price, status, featured, display_order, primary_image
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?, ?
    )
  `).run(
    id, productData.slug, productData.sku, productData.brand, productData.model, productData.title,
    productData.processor_brand, productData.processor_model, productData.processor_generation || '',
    productData.ram, productData.ram_type || '', productData.storage_capacity, productData.storage_type,
    productData.screen_size, productData.resolution || '', productData.gpu || '', productData.operating_system || '',
    productData.condition, productData.condition_notes || '', productData.battery_condition || '',
    productData.keyboard_layout || '', productData.ports || '', productData.connectivity || '',
    productData.accessories || '', productData.description || '', productData.price, productData.status,
    productData.featured ? 1 : 0, productData.display_order || 0, primaryImg
  );

  const insertImg = db.prepare(`
    INSERT INTO product_images (id, product_id, image_url, is_primary, display_order)
    VALUES (?, ?, ?, ?, ?)
  `);

  imagesList.forEach((url, idx) => {
    insertImg.run(`img_${id}_${idx}`, id, url, idx === 0 ? 1 : 0, idx);
  });

  return getProductBySlugOrId(id)!;
}

export function updateProduct(id: string, productData: Partial<Product>, imagesList?: string[]): Product | null {
  const existing = getProductBySlugOrId(id);
  if (!existing) return null;

  db.prepare(`
    UPDATE products SET
      title = COALESCE(?, title),
      slug = COALESCE(?, slug),
      sku = COALESCE(?, sku),
      brand = COALESCE(?, brand),
      model = COALESCE(?, model),
      processor_brand = COALESCE(?, processor_brand),
      processor_model = COALESCE(?, processor_model),
      processor_generation = COALESCE(?, processor_generation),
      ram = COALESCE(?, ram),
      ram_type = COALESCE(?, ram_type),
      storage_capacity = COALESCE(?, storage_capacity),
      storage_type = COALESCE(?, storage_type),
      screen_size = COALESCE(?, screen_size),
      resolution = COALESCE(?, resolution),
      gpu = COALESCE(?, gpu),
      operating_system = COALESCE(?, operating_system),
      condition = COALESCE(?, condition),
      condition_notes = COALESCE(?, condition_notes),
      battery_condition = COALESCE(?, battery_condition),
      keyboard_layout = COALESCE(?, keyboard_layout),
      ports = COALESCE(?, ports),
      connectivity = COALESCE(?, connectivity),
      accessories = COALESCE(?, accessories),
      description = COALESCE(?, description),
      price = COALESCE(?, price),
      status = COALESCE(?, status),
      featured = COALESCE(?, featured),
      primary_image = COALESCE(?, primary_image),
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(
    productData.title,
    productData.slug,
    productData.sku,
    productData.brand,
    productData.model,
    productData.processor_brand,
    productData.processor_model,
    productData.processor_generation,
    productData.ram,
    productData.ram_type,
    productData.storage_capacity,
    productData.storage_type,
    productData.screen_size,
    productData.resolution,
    productData.gpu,
    productData.operating_system,
    productData.condition,
    productData.condition_notes,
    productData.battery_condition,
    productData.keyboard_layout,
    productData.ports,
    productData.connectivity,
    productData.accessories,
    productData.description,
    productData.price,
    productData.status,
    productData.featured !== undefined ? (productData.featured ? 1 : 0) : undefined,
    productData.primary_image,
    id
  );

  if (imagesList && imagesList.length > 0) {
    db.prepare('DELETE FROM product_images WHERE product_id = ?').run(id);
    const insertImg = db.prepare(`
      INSERT INTO product_images (id, product_id, image_url, is_primary, display_order)
      VALUES (?, ?, ?, ?, ?)
    `);

    imagesList.forEach((url, idx) => {
      insertImg.run(`img_${id}_${idx}`, id, url, idx === 0 ? 1 : 0, idx);
    });

    db.prepare('UPDATE products SET primary_image = ? WHERE id = ?').run(imagesList[0], id);
  }

  return getProductBySlugOrId(id);
}

export function updateProductStatus(id: string, status: 'AVAILABLE' | 'RESERVED' | 'SOLD' | 'HIDDEN') {
  db.prepare('UPDATE products SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(status, id);
  return getProductBySlugOrId(id);
}

export function deleteProduct(id: string) {
  db.prepare('DELETE FROM product_images WHERE product_id = ?').run(id);
  const info = db.prepare('DELETE FROM products WHERE id = ?').run(id);
  return info.changes > 0;
}

export function getAdminUser(username: string) {
  return db.prepare('SELECT * FROM admin_users WHERE username = ?').get(username) as any;
}
