import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { v2 as cloudinary } from 'cloudinary';
import { Product, ProductImage, BusinessSettings, DashboardStats } from './types';

const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  try {
    fs.mkdirSync(dataDir, { recursive: true });
  } catch (e) {
    // Read-only filesystem in serverless environments
  }
}

const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  try {
    fs.mkdirSync(uploadsDir, { recursive: true });
  } catch (e) {
    // Read-only filesystem in serverless environments
  }
}

let dbPath = path.join(dataDir, 'srisai.db');
// On Vercel / serverless runtimes, root filesystem is read-only.
// Copy bundled sqlite database into /tmp so SQLite can operate with write permissions.
if (process.env.VERCEL) {
  const tmpDbPath = path.join('/tmp', 'srisai.db');
  if (!fs.existsSync(tmpDbPath) && fs.existsSync(dbPath)) {
    try {
      fs.copyFileSync(dbPath, tmpDbPath);
    } catch (e) {
      console.error('Failed to copy db to /tmp:', e);
    }
  }
  if (fs.existsSync(tmpDbPath)) {
    dbPath = tmpDbPath;
  }
}

const db = new Database(dbPath);

// Enable WAL mode for better concurrency performance
try {
  db.pragma('journal_mode = WAL');
} catch (e) {
  // Ignored in restricted environments
}

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
            "num": 1,
            "id": "p1",
            "slug": "hp-elitebook-640-g11-ultra-5-16gb-512gb",
            "sku": "SSC-HP-640G11",
            "brand": "HP",
            "model": "EliteBook 640 G11",
            "title": "HP EliteBook 640 G11 — Intel Core Ultra 5 135U (16GB / 512GB SSD)",
            "processor_brand": "Intel",
            "processor_model": "Core Ultra 5 135U",
            "processor_generation": "Intel Core Ultra Series 1",
            "ram": "16 GB",
            "ram_type": "DDR5",
            "storage_capacity": "512 GB",
            "storage_type": "NVMe SSD",
            "screen_size": "14\"",
            "resolution": "1920x1080 Full HD",
            "gpu": "Intel UHD Graphics (4GB Shared) + 8GB NPU AI Engine",
            "operating_system": "Windows 11 Pro",
            "condition": "Like New",
            "condition_notes": "Premium metal body in pristine condition. Features Intel AI Boost NPU control, original battery & charger, and backlight keypad.",
            "battery_condition": "Original HP Battery with extended backup",
            "keyboard_layout": "Backlight Keypad",
            "ports": "Thunderbolt 4 / Type-C, USB 3.2, HDMI, Audio Combo Jack",
            "connectivity": "WiFi 6E, Bluetooth 5.3, HD Webcam",
            "accessories": "Original HP Charger & Power Cord included",
            "description": "High-end business ultrabook with sleek metal build, powered by the latest Intel Ultra 5 135U with integrated 8GB AI NPU. Comes with 16GB RAM, 512GB high-speed SSD, backlit keyboard, and crisp 14-inch anti-glare display.",
            "price": 59000,
            "featured": 1,
            "display_order": 1,
            "primary_image": "https://res.cloudinary.com/ndhoopoy/image/upload/v1793797141/sri-sai-computers/laptop-1/photo_1_1793797054890.jpg",
            "images": [
                  "https://res.cloudinary.com/ndhoopoy/image/upload/v1793797141/sri-sai-computers/laptop-1/photo_1_1793797054890.jpg",
                  "https://res.cloudinary.com/ndhoopoy/image/upload/v1793797143/sri-sai-computers/laptop-1/photo_2_1793797058478.jpg",
                  "https://res.cloudinary.com/ndhoopoy/image/upload/v1793797144/sri-sai-computers/laptop-1/photo_3_1793797060174.jpg",
                  "https://res.cloudinary.com/ndhoopoy/image/upload/v1793797146/sri-sai-computers/laptop-1/photo_4_1793797061946.jpg",
                  "https://res.cloudinary.com/ndhoopoy/image/upload/v1793797148/sri-sai-computers/laptop-1/photo_5_1793797063866.jpg"
            ],
            "status": "AVAILABLE"
      },
      {
            "num": 2,
            "id": "p2",
            "slug": "dell-g15-5520-gaming-i5-12th-8gb-512gb-rtx3050",
            "sku": "SSC-DELL-G15-5520",
            "brand": "Dell",
            "model": "G15 5520 Gaming",
            "title": "Dell G15 5520 Gaming — Intel Core i5 12th Gen (8GB / 512GB SSD / RTX 3050 4GB)",
            "processor_brand": "Intel",
            "processor_model": "Core i5-12500H",
            "processor_generation": "12th Gen",
            "ram": "8 GB",
            "ram_type": "DDR5",
            "storage_capacity": "512 GB",
            "storage_type": "NVMe SSD",
            "screen_size": "15.6\"",
            "resolution": "1920x1080 Full HD 120Hz",
            "gpu": "NVIDIA GeForce RTX 3050 4GB Dedicated GDDR6 + Intel UHD",
            "operating_system": "Windows 11 Home",
            "condition": "Like New",
            "condition_notes": "New condition gaming powerhouse with 4GB RTX 3050 dedicated graphics, backlight keyboard, and original charger.",
            "battery_condition": "Original Dell Battery with healthy backup",
            "keyboard_layout": "Backlight Gaming Keypad with orange accents",
            "ports": "USB Type-C, 3x USB 3.2, HDMI 2.1, RJ-45 Gigabit LAN, Headphone jack",
            "connectivity": "WiFi 6, Bluetooth, HD Webcam with microphone",
            "accessories": "Original Dell Gaming Charger included",
            "description": "Heavy-duty Dell G15 gaming laptop powered by 12th Gen Intel Core i5-12500H and NVIDIA GeForce RTX 3050 4GB. Perfect for AAA gaming, 3D rendering, video editing, and engineering software.",
            "price": 56000,
            "featured": 1,
            "display_order": 2,
            "primary_image": "https://res.cloudinary.com/ndhoopoy/image/upload/v1793797150/sri-sai-computers/laptop-2/photo_1_1793797065130.jpg",
            "images": [
                  "https://res.cloudinary.com/ndhoopoy/image/upload/v1793797150/sri-sai-computers/laptop-2/photo_1_1793797065130.jpg",
                  "https://res.cloudinary.com/ndhoopoy/image/upload/v1793797151/sri-sai-computers/laptop-2/photo_2_1793797066474.jpg",
                  "https://res.cloudinary.com/ndhoopoy/image/upload/v1793797152/sri-sai-computers/laptop-2/photo_3_1793797067643.jpg",
                  "https://res.cloudinary.com/ndhoopoy/image/upload/v1793797153/sri-sai-computers/laptop-2/photo_4_1793797068978.jpg",
                  "https://res.cloudinary.com/ndhoopoy/image/upload/v1793797154/sri-sai-computers/laptop-2/photo_5_1793797070136.jpg"
            ],
            "status": "AVAILABLE"
      },
      {
            "num": 3,
            "id": "p3",
            "slug": "hp-victus-15-gaming-i5-13th-16gb-512gb-rtx3050",
            "sku": "SSC-HP-VICTUS-15",
            "brand": "HP",
            "model": "Victus Gaming 15-fa2192TX",
            "title": "HP Victus 15 Gaming — Intel Core i5 13th Gen (16GB / 512GB SSD / RTX 3050 4GB)",
            "processor_brand": "Intel",
            "processor_model": "Core i5-13420H",
            "processor_generation": "13th Gen",
            "ram": "16 GB",
            "ram_type": "DDR4",
            "storage_capacity": "512 GB",
            "storage_type": "Gen4 NVMe SSD",
            "screen_size": "15.6\"",
            "resolution": "1920x1080 Full HD 144Hz IPS",
            "gpu": "NVIDIA GeForce RTX 3050 4GB Dedicated Graphics + Intel UHD",
            "operating_system": "Windows 11 Home",
            "condition": "Like New",
            "condition_notes": "New condition, 144Hz IPS display, 16GB dual channel RAM, backlit keypad, original battery and charger.",
            "battery_condition": "Original HP Battery with extended runtime",
            "keyboard_layout": "Backlight Gaming Keypad with numpad",
            "ports": "USB Type-C, 2x USB Type-A, HDMI 2.1, RJ-45 LAN, SD Card Reader",
            "connectivity": "WiFi 6, Bluetooth 5.3, HP Wide Vision 720p HD Webcam",
            "accessories": "Original HP Smart AC Adapter included",
            "description": "Modern 13th Gen HP Victus gaming laptop equipped with Intel Core i5-13420H, 16GB RAM, RTX 3050 dedicated graphics, and a fast 144Hz IPS screen for esports gaming, video editing, and heavy multitasking.",
            "price": 66000,
            "featured": 1,
            "display_order": 3,
            "primary_image": "https://res.cloudinary.com/ndhoopoy/image/upload/v1793797156/sri-sai-computers/laptop-3/photo_1_1793797071476.jpg",
            "images": [
                  "https://res.cloudinary.com/ndhoopoy/image/upload/v1793797156/sri-sai-computers/laptop-3/photo_1_1793797071476.jpg",
                  "https://res.cloudinary.com/ndhoopoy/image/upload/v1793797157/sri-sai-computers/laptop-3/photo_2_1793797072649.jpg",
                  "https://res.cloudinary.com/ndhoopoy/image/upload/v1793797158/sri-sai-computers/laptop-3/photo_3_1793797073881.jpg",
                  "https://res.cloudinary.com/ndhoopoy/image/upload/v1793797160/sri-sai-computers/laptop-3/photo_4_1793797075440.jpg",
                  "https://res.cloudinary.com/ndhoopoy/image/upload/v1793797161/sri-sai-computers/laptop-3/photo_5_1793797076619.jpg"
            ],
            "status": "AVAILABLE"
      },
      {
            "num": 4,
            "id": "p4",
            "slug": "hp-15-notebook-i5-11th-8gb-512gb",
            "sku": "SSC-HP-NB15-I5",
            "brand": "HP",
            "model": "Notebook 15",
            "title": "HP 15 Notebook — Intel Core i5 11th Gen (8GB / 512GB SSD)",
            "processor_brand": "Intel",
            "processor_model": "Core i5-1135G7",
            "processor_generation": "11th Gen",
            "ram": "8 GB",
            "ram_type": "DDR4",
            "storage_capacity": "512 GB",
            "storage_type": "NVMe SSD",
            "screen_size": "15.6\"",
            "resolution": "1920x1080 Full HD Micro-Edge",
            "gpu": "Intel Iris Xe Graphics (4GB Shared)",
            "operating_system": "Windows 11 Home",
            "condition": "Like New",
            "condition_notes": "New condition, fast boot with 512GB NVMe SSD, original battery & charger, WiFi & HD Webcam.",
            "battery_condition": "Original HP Battery with 4+ hours backup",
            "keyboard_layout": "Full-size Ergonomic Keyboard with numeric pad",
            "ports": "USB Type-C, 2x USB Type-A, HDMI 1.4b, Headphone/mic combo",
            "connectivity": "Realtek WiFi, Bluetooth 5.0, HP True Vision HD camera",
            "accessories": "Original HP Charger included",
            "description": "Clean and reliable daily driver laptop for office work, students, accounts, programming, and web browsing. Features 11th Gen Core i5 with fast 512GB SSD.",
            "price": 32000,
            "featured": 0,
            "display_order": 4,
            "primary_image": "https://res.cloudinary.com/ndhoopoy/image/upload/v1793797162/sri-sai-computers/laptop-4/photo_1_1793797077990.jpg",
            "images": [
                  "https://res.cloudinary.com/ndhoopoy/image/upload/v1793797162/sri-sai-computers/laptop-4/photo_1_1793797077990.jpg",
                  "https://res.cloudinary.com/ndhoopoy/image/upload/v1793797164/sri-sai-computers/laptop-4/photo_2_1793797079270.jpg",
                  "https://res.cloudinary.com/ndhoopoy/image/upload/v1793797165/sri-sai-computers/laptop-4/photo_3_1793797080535.jpg",
                  "https://res.cloudinary.com/ndhoopoy/image/upload/v1793797166/sri-sai-computers/laptop-4/photo_4_1793797081767.jpg",
                  "https://res.cloudinary.com/ndhoopoy/image/upload/v1793797167/sri-sai-computers/laptop-4/photo_5_1793797082952.jpg"
            ],
            "status": "AVAILABLE"
      },
      {
            "num": 5,
            "id": "p5",
            "slug": "lenovo-ideapad-gaming-3-i5-10th-dual-storage-gtx1650ti",
            "sku": "SSC-LNV-IPG3-DUAL",
            "brand": "Lenovo",
            "model": "IdeaPad Gaming 3",
            "title": "Lenovo IdeaPad Gaming 3 — Core i5 10th Gen (8GB / 256GB SSD + 1TB HDD / GTX 1650Ti 4GB)",
            "processor_brand": "Intel",
            "processor_model": "Core i5-10300H",
            "processor_generation": "10th Gen",
            "ram": "8 GB",
            "ram_type": "DDR4",
            "storage_capacity": "256GB SSD + 1TB HDD",
            "storage_type": "Dual Storage (Fast SSD + Massive HDD)",
            "screen_size": "15.6\"",
            "resolution": "1920x1080 Full HD 120Hz IPS",
            "gpu": "NVIDIA GeForce GTX 1650Ti 4GB GDDR6 + Intel UHD",
            "operating_system": "Windows 11 Home",
            "condition": "Very Good",
            "condition_notes": "Dual storage setup (fast 256GB SSD for OS + 1TB Hard Disk for bulk storage), GTX 1650Ti 4GB graphics, backlight keyboard.",
            "battery_condition": "Original Lenovo Battery with good backup",
            "keyboard_layout": "Blue Backlight Gaming Keyboard",
            "ports": "USB-C 3.2, 2x USB 3.2, HDMI 2.0, Ethernet (RJ45), Audio Jack",
            "connectivity": "WiFi 6, Bluetooth 5.0, 720p HD Camera with privacy shutter",
            "accessories": "Original Lenovo Gaming Charger included",
            "description": "Budget gaming and editing laptop with dual storage convenience, dedicated NVIDIA GTX 1650Ti graphics, and smooth 120Hz display.",
            "price": 36000,
            "featured": 1,
            "display_order": 5,
            "primary_image": "https://res.cloudinary.com/ndhoopoy/image/upload/v1793797168/sri-sai-computers/laptop-5/photo_1_1793797084174.jpg",
            "images": [
                  "https://res.cloudinary.com/ndhoopoy/image/upload/v1793797168/sri-sai-computers/laptop-5/photo_1_1793797084174.jpg",
                  "https://res.cloudinary.com/ndhoopoy/image/upload/v1793797170/sri-sai-computers/laptop-5/photo_2_1793797085356.jpg",
                  "https://res.cloudinary.com/ndhoopoy/image/upload/v1793797171/sri-sai-computers/laptop-5/photo_3_1793797086529.jpg",
                  "https://res.cloudinary.com/ndhoopoy/image/upload/v1793797172/sri-sai-computers/laptop-5/photo_4_1793797087771.jpg",
                  "https://res.cloudinary.com/ndhoopoy/image/upload/v1793797174/sri-sai-computers/laptop-5/photo_5_1793797089419.jpg"
            ],
            "status": "AVAILABLE"
      },
      {
            "num": 6,
            "id": "p6",
            "slug": "hp-pavilion-15-i5-12th-16gb-512gb",
            "sku": "SSC-HP-PAV15-I5",
            "brand": "HP",
            "model": "Pavilion 15",
            "title": "HP Pavilion 15 — Intel Core i5 12th Gen (16GB / 512GB SSD)",
            "processor_brand": "Intel",
            "processor_model": "Core i5-1235U",
            "processor_generation": "12th Gen",
            "ram": "16 GB",
            "ram_type": "DDR4",
            "storage_capacity": "512 GB",
            "storage_type": "NVMe SSD",
            "screen_size": "15.6\"",
            "resolution": "1920x1080 Full HD IPS",
            "gpu": "Intel Iris Xe Graphics (4GB Shared)",
            "operating_system": "Windows 11 Home",
            "condition": "Like New",
            "condition_notes": "New condition, premium Pavilion finish with 16GB RAM, backlit keypad, original battery & charger.",
            "battery_condition": "Original HP Battery with 4+ hours backup",
            "keyboard_layout": "Backlight Keyboard with numeric keypad",
            "ports": "SuperSpeed USB Type-C, 2x SuperSpeed USB Type-A, HDMI 2.1, Audio Jack",
            "connectivity": "WiFi 6, Bluetooth, HD Webcam",
            "accessories": "Original HP Smart Charger included",
            "description": "Stylish and responsive HP Pavilion 15 laptop with 10-core 12th Gen Intel Core i5, upgraded 16GB RAM, high-speed 512GB SSD, and premium audio.",
            "price": 36000,
            "featured": 0,
            "display_order": 6,
            "primary_image": "https://res.cloudinary.com/ndhoopoy/image/upload/v1793797175/sri-sai-computers/laptop-6/photo_1_1793797090795.jpg",
            "images": [
                  "https://res.cloudinary.com/ndhoopoy/image/upload/v1793797175/sri-sai-computers/laptop-6/photo_1_1793797090795.jpg",
                  "https://res.cloudinary.com/ndhoopoy/image/upload/v1793797176/sri-sai-computers/laptop-6/photo_2_1793797091996.jpg",
                  "https://res.cloudinary.com/ndhoopoy/image/upload/v1793797177/sri-sai-computers/laptop-6/photo_3_1793797093244.jpg",
                  "https://res.cloudinary.com/ndhoopoy/image/upload/v1793797179/sri-sai-computers/laptop-6/photo_4_1793797094485.jpg",
                  "https://res.cloudinary.com/ndhoopoy/image/upload/v1793797180/sri-sai-computers/laptop-6/photo_5_1793797095758.jpg"
            ],
            "status": "AVAILABLE"
      },
      {
            "num": 7,
            "id": "p7",
            "slug": "asus-vivobook-15-i5-12th-8gb-512gb",
            "sku": "SSC-ASUS-VB15-I5",
            "brand": "ASUS",
            "model": "VivoBook 15",
            "title": "ASUS VivoBook 15 — Intel Core i5 12th Gen (8GB / 512GB SSD)",
            "processor_brand": "Intel",
            "processor_model": "Core i5-1235U",
            "processor_generation": "12th Gen",
            "ram": "8 GB",
            "ram_type": "DDR4",
            "storage_capacity": "512 GB",
            "storage_type": "NVMe SSD",
            "screen_size": "15.6\"",
            "resolution": "1920x1080 Full HD NanoEdge",
            "gpu": "Intel Iris Xe Graphics (4GB Shared)",
            "operating_system": "Windows 11 Home",
            "condition": "Like New",
            "condition_notes": "New condition slim profile with backlit keyboard, original battery & charger.",
            "battery_condition": "Original ASUS Battery with 4+ hours backup",
            "keyboard_layout": "Backlight Chiclet Keyboard",
            "ports": "USB-C 3.2, 2x USB 3.2, USB 2.0, HDMI 1.4, Combo Audio Jack",
            "connectivity": "WiFi 6, Bluetooth 5.3, 720p HD Webcam with privacy shield",
            "accessories": "Original ASUS Adapter included",
            "description": "Sleek ASUS VivoBook 15 with 12th Gen Intel Core i5-1235U, vivid anti-glare display, comfortable backlit keyboard, and lightweight portable design.",
            "price": 34000,
            "featured": 0,
            "display_order": 7,
            "primary_image": "https://res.cloudinary.com/ndhoopoy/image/upload/v1793797182/sri-sai-computers/laptop-7/photo_1_1793797097103.jpg",
            "images": [
                  "https://res.cloudinary.com/ndhoopoy/image/upload/v1793797182/sri-sai-computers/laptop-7/photo_1_1793797097103.jpg",
                  "https://res.cloudinary.com/ndhoopoy/image/upload/v1793797183/sri-sai-computers/laptop-7/photo_2_1793797098893.jpg",
                  "https://res.cloudinary.com/ndhoopoy/image/upload/v1793797184/sri-sai-computers/laptop-7/photo_3_1793797100052.jpg",
                  "https://res.cloudinary.com/ndhoopoy/image/upload/v1793797186/sri-sai-computers/laptop-7/photo_4_1793797101317.jpg"
            ],
            "status": "AVAILABLE"
      },
      {
            "num": 8,
            "id": "p8",
            "slug": "asus-tuf-dash-f15-i7-11th-16gb-1tb-rtx3050",
            "sku": "SSC-ASUS-TUFDASH-I7",
            "brand": "ASUS",
            "model": "TUF Dash F15",
            "title": "ASUS TUF Dash F15 Gaming — Intel Core i7 11th Gen (16GB / 1TB SSD / RTX 3050 4GB)",
            "processor_brand": "Intel",
            "processor_model": "Core i7-11370H",
            "processor_generation": "11th Gen",
            "ram": "16 GB",
            "ram_type": "DDR4",
            "storage_capacity": "1 TB",
            "storage_type": "PCIe NVMe SSD",
            "screen_size": "15.6\"",
            "resolution": "1920x1080 Full HD 144Hz vIPS",
            "gpu": "NVIDIA GeForce RTX 3050 4GB Dedicated GDDR6 + Intel UHD",
            "operating_system": "Windows 11 Home",
            "condition": "Like New",
            "condition_notes": "New condition, huge 1TB SSD storage, Core i7 processor, RTX 3050 GPU, backlight keypad, original battery and charger.",
            "battery_condition": "Original ASUS Battery with healthy backup",
            "keyboard_layout": "Teal Backlit Precision Gaming Keyboard",
            "ports": "Thunderbolt 4, 3x USB 3.2 Gen 1, HDMI 2.0b, RJ45 LAN, Audio combo",
            "connectivity": "WiFi 6, Bluetooth 5.2, HD Webcam",
            "accessories": "Original ASUS Gaming Charger included",
            "description": "Ultra-slim TUF Dash F15 gaming rig packed with Intel Core i7, 16GB RAM, an enormous 1TB NVMe SSD, and NVIDIA RTX 3050 graphics. Ideal for competitive gamers and power creators.",
            "price": 62000,
            "featured": 1,
            "display_order": 8,
            "primary_image": "https://res.cloudinary.com/ndhoopoy/image/upload/v1793797187/sri-sai-computers/laptop-8/photo_1_1793797102575.jpg",
            "images": [
                  "https://res.cloudinary.com/ndhoopoy/image/upload/v1793797187/sri-sai-computers/laptop-8/photo_1_1793797102575.jpg",
                  "https://res.cloudinary.com/ndhoopoy/image/upload/v1793797188/sri-sai-computers/laptop-8/photo_2_1793797103782.jpg",
                  "https://res.cloudinary.com/ndhoopoy/image/upload/v1793797189/sri-sai-computers/laptop-8/photo_3_1793797104970.jpg",
                  "https://res.cloudinary.com/ndhoopoy/image/upload/v1793797190/sri-sai-computers/laptop-8/photo_4_1793797106169.jpg",
                  "https://res.cloudinary.com/ndhoopoy/image/upload/v1793797192/sri-sai-computers/laptop-8/photo_5_1793797107396.jpg"
            ],
            "status": "AVAILABLE"
      },
      {
            "num": 9,
            "id": "p9",
            "slug": "asus-tuf-gaming-a17-ryzen-7-8gb-512gb-rtx3050",
            "sku": "SSC-ASUS-TUFA17-R7",
            "brand": "ASUS",
            "model": "TUF Gaming A17",
            "title": "ASUS TUF Gaming A17 (17.3\") — AMD Ryzen 7 4800H (8GB / 512GB SSD / RTX 3050 4GB)",
            "processor_brand": "AMD",
            "processor_model": "Ryzen 7 4800H",
            "processor_generation": "Ryzen 4000 Series (8-Core 16-Thread)",
            "ram": "8 GB",
            "ram_type": "DDR4",
            "storage_capacity": "512 GB",
            "storage_type": "NVMe SSD",
            "screen_size": "17.3\"",
            "resolution": "1920x1080 Full HD 144Hz Immersive Display",
            "gpu": "NVIDIA GeForce RTX 3050 4GB Dedicated + AMD Radeon Graphics",
            "operating_system": "Windows 11 Home",
            "condition": "Like New",
            "condition_notes": "New condition with massive 17.3-inch screen, 8-core Ryzen 7 CPU, RTX 3050, backlight keypad, original battery & charger.",
            "battery_condition": "Original ASUS Battery with strong backup",
            "keyboard_layout": "RGB Backlight Gaming Keyboard with highlighted WASD keys",
            "ports": "USB-C 3.2 with DisplayPort, 3x USB 3.2, HDMI 2.0b, Gigabit Ethernet, Audio Jack",
            "connectivity": "WiFi 6, Bluetooth 5.2, 720p HD Webcam with array microphone",
            "accessories": "Original ASUS Gaming Charger included",
            "description": "Giant 17.3-inch display gaming laptop built for desktop replacement. Powered by AMD Ryzen 7 4800H 8-core processor and NVIDIA RTX 3050 graphics.",
            "price": 52000,
            "featured": 1,
            "display_order": 9,
            "primary_image": "https://res.cloudinary.com/ndhoopoy/image/upload/v1793797193/sri-sai-computers/laptop-9/photo_1_1793797108626.jpg",
            "images": [
                  "https://res.cloudinary.com/ndhoopoy/image/upload/v1793797193/sri-sai-computers/laptop-9/photo_1_1793797108626.jpg",
                  "https://res.cloudinary.com/ndhoopoy/image/upload/v1793797194/sri-sai-computers/laptop-9/photo_2_1793797109788.jpg",
                  "https://res.cloudinary.com/ndhoopoy/image/upload/v1793797195/sri-sai-computers/laptop-9/photo_3_1793797111025.jpg",
                  "https://res.cloudinary.com/ndhoopoy/image/upload/v1793797197/sri-sai-computers/laptop-9/photo_4_1793797112612.jpg",
                  "https://res.cloudinary.com/ndhoopoy/image/upload/v1793797198/sri-sai-computers/laptop-9/photo_5_1793797113850.jpg"
            ],
            "status": "AVAILABLE"
      },
      {
            "num": 10,
            "id": "p10",
            "slug": "acer-nitro-5-gaming-16-i5-11th-8gb-512gb-rtx3050",
            "sku": "SSC-ACER-NITRO5-16",
            "brand": "Acer",
            "model": "Nitro 5",
            "title": "Acer Nitro 5 Gaming 16\" — Intel Core i5 11th Gen (8GB / 512GB SSD / RTX 3050 4GB)",
            "processor_brand": "Intel",
            "processor_model": "Core i5-11400H",
            "processor_generation": "11th Gen",
            "ram": "8 GB",
            "ram_type": "DDR4",
            "storage_capacity": "512 GB",
            "storage_type": "NVMe SSD",
            "screen_size": "16\"",
            "resolution": "1920x1080 Full HD 144Hz IPS",
            "gpu": "NVIDIA GeForce RTX 3050 4GB GDDR6 + Intel UHD",
            "operating_system": "Windows 11 Home",
            "condition": "Like New",
            "condition_notes": "New condition, large 16-inch gaming screen, dual fan cooling, red backlit keyboard, original charger.",
            "battery_condition": "Original Acer Battery with solid backup",
            "keyboard_layout": "Red Backlight Gaming Keyboard with NitroSense key",
            "ports": "USB Type-C, 3x USB 3.2, HDMI 2.1, RJ-45 Killer Ethernet, Audio Combo",
            "connectivity": "WiFi 6, Bluetooth 5.1, HD Webcam with stereo mics",
            "accessories": "Original Acer Nitro Power Adapter included",
            "description": "High-performance Acer Nitro 5 with 11th Gen Intel 6-core i5-11400H, dedicated RTX 3050 4GB GPU, CoolBoost thermal technology, and expansive 16-inch display.",
            "price": 48000,
            "featured": 1,
            "display_order": 10,
            "primary_image": "https://res.cloudinary.com/ndhoopoy/image/upload/v1793797199/sri-sai-computers/laptop-10/photo_1_1793797115012.jpg",
            "images": [
                  "https://res.cloudinary.com/ndhoopoy/image/upload/v1793797199/sri-sai-computers/laptop-10/photo_1_1793797115012.jpg",
                  "https://res.cloudinary.com/ndhoopoy/image/upload/v1793797200/sri-sai-computers/laptop-10/photo_2_1793797116167.jpg",
                  "https://res.cloudinary.com/ndhoopoy/image/upload/v1793797202/sri-sai-computers/laptop-10/photo_3_1793797117438.jpg",
                  "https://res.cloudinary.com/ndhoopoy/image/upload/v1793797203/sri-sai-computers/laptop-10/photo_4_1793797118822.jpg",
                  "https://res.cloudinary.com/ndhoopoy/image/upload/v1793797204/sri-sai-computers/laptop-10/photo_5_1793797120107.jpg"
            ],
            "status": "AVAILABLE"
      },
      {
            "num": 11,
            "id": "p11",
            "slug": "acer-aspire-14-ai-ultra-5-16gb-ddr5-512gb-metal",
            "sku": "SSC-ACER-ASP14-AI",
            "brand": "Acer",
            "model": "Aspire 14 AI",
            "title": "Acer Aspire 14 AI — Intel Core Ultra 5 135U (16GB DDR5 / 512GB SSD / Metal Body)",
            "processor_brand": "Intel",
            "processor_model": "Core Ultra 5 135U",
            "processor_generation": "Intel Core Ultra Series 1",
            "ram": "16 GB",
            "ram_type": "DDR5",
            "storage_capacity": "512 GB",
            "storage_type": "NVMe SSD",
            "screen_size": "14\"",
            "resolution": "1920x1080 Full HD IPS",
            "gpu": "Intel UHD Graphics (4GB Shared) + 8GB NPU AI Engine",
            "operating_system": "Windows 11 Home",
            "condition": "Like New",
            "condition_notes": "Full metal premium body, latest AI PC processor, ultra-fast 16GB DDR5 RAM, backlit keypad, original battery and charger.",
            "battery_condition": "Original Acer Battery with all-day battery life",
            "keyboard_layout": "White Backlit Keyboard",
            "ports": "Thunderbolt 4 / Type-C, 2x USB 3.2, HDMI 2.1, Audio Jack",
            "connectivity": "WiFi 6E, Bluetooth 5.3, FHD AI Webcam with noise reduction",
            "accessories": "Original Acer Charger included",
            "description": "Next-generation AI Ultrabook featuring Intel Core Ultra 5 with integrated 8GB NPU. Built with all-metal chassis, 16GB fast DDR5 memory, and high-clarity 14-inch screen.",
            "price": 59000,
            "featured": 1,
            "display_order": 11,
            "primary_image": "https://res.cloudinary.com/ndhoopoy/image/upload/v1793797206/sri-sai-computers/laptop-11/photo_1_1793797121325.jpg",
            "images": [
                  "https://res.cloudinary.com/ndhoopoy/image/upload/v1793797206/sri-sai-computers/laptop-11/photo_1_1793797121325.jpg",
                  "https://res.cloudinary.com/ndhoopoy/image/upload/v1793797207/sri-sai-computers/laptop-11/photo_2_1793797122981.jpg",
                  "https://res.cloudinary.com/ndhoopoy/image/upload/v1793797209/sri-sai-computers/laptop-11/photo_3_1793797124371.jpg",
                  "https://res.cloudinary.com/ndhoopoy/image/upload/v1793797210/sri-sai-computers/laptop-11/photo_4_1793797125634.jpg"
            ],
            "status": "AVAILABLE"
      },
      {
            "num": 12,
            "id": "p12",
            "slug": "lenovo-loq-15-ryzen-5-24gb-ddr5-512gb-rtx3050-6gb",
            "sku": "SSC-LNV-LOQ15-24GB",
            "brand": "Lenovo",
            "model": "LOQ 15",
            "title": "Lenovo LOQ 15 Gaming — AMD Ryzen 5 7235HS (24GB DDR5 / 512GB SSD / RTX 3050 6GB)",
            "processor_brand": "AMD",
            "processor_model": "Ryzen 5 7235HS",
            "processor_generation": "Ryzen 7000 Series (High Performance)",
            "ram": "24 GB",
            "ram_type": "DDR5",
            "storage_capacity": "512 GB",
            "storage_type": "Gen4 NVMe SSD",
            "screen_size": "15.6\"",
            "resolution": "1920x1080 Full HD 144Hz G-SYNC IPS",
            "gpu": "NVIDIA GeForce RTX 3050 6GB GDDR6 (Upgraded 6GB VRAM) + AMD Radeon",
            "operating_system": "Windows 11 Home",
            "condition": "Like New",
            "condition_notes": "Massive 24GB DDR5 RAM, upgraded 6GB RTX 3050 GPU, 144Hz screen, backlight keypad, original battery & charger.",
            "battery_condition": "Original Lenovo Battery with Rapid Charge",
            "keyboard_layout": "White Backlit Gaming Keyboard with 1.5mm key travel",
            "ports": "USB-C 3.2 (DP + PD), 3x USB-A 3.2, HDMI 2.1, RJ-45, E-shutter switch",
            "connectivity": "WiFi 6, Bluetooth 5.2, FHD 1080p Webcam",
            "accessories": "Original Lenovo Gaming Charger included",
            "description": "Beast gaming & production laptop with AMD Ryzen 5 7235HS, staggering 24GB DDR5 RAM, upgraded 6GB VRAM RTX 3050, and 144Hz G-SYNC display for ultimate performance.",
            "price": 74000,
            "featured": 1,
            "display_order": 12,
            "primary_image": "https://res.cloudinary.com/ndhoopoy/image/upload/v1793797211/sri-sai-computers/laptop-12/photo_1_1793797127058.jpg",
            "images": [
                  "https://res.cloudinary.com/ndhoopoy/image/upload/v1793797211/sri-sai-computers/laptop-12/photo_1_1793797127058.jpg",
                  "https://res.cloudinary.com/ndhoopoy/image/upload/v1793797213/sri-sai-computers/laptop-12/photo_2_1793797129149.jpg",
                  "https://res.cloudinary.com/ndhoopoy/image/upload/v1793797215/sri-sai-computers/laptop-12/photo_3_1793797130429.jpg",
                  "https://res.cloudinary.com/ndhoopoy/image/upload/v1793797216/sri-sai-computers/laptop-12/photo_4_1793797131855.jpg",
                  "https://res.cloudinary.com/ndhoopoy/image/upload/v1793797217/sri-sai-computers/laptop-12/photo_5_1793797132945.jpg"
            ],
            "status": "AVAILABLE"
      },
      {
            "num": 13,
            "id": "p13",
            "slug": "hp-elitebook-840-g5-i5-8th-8gb-256gb-metal",
            "sku": "SSC-HP-840G5",
            "brand": "HP",
            "model": "EliteBook 840 G5",
            "title": "HP EliteBook 840 G5 — Intel Core i5 8th Gen (8GB / 256GB SSD / Metal Body)",
            "processor_brand": "Intel",
            "processor_model": "Core i5-8350U",
            "processor_generation": "8th Gen",
            "ram": "8 GB",
            "ram_type": "DDR4",
            "storage_capacity": "256 GB",
            "storage_type": "NVMe SSD",
            "screen_size": "14\"",
            "resolution": "1920x1080 Full HD IPS",
            "gpu": "Intel UHD Graphics 620",
            "operating_system": "Windows 11 Pro",
            "condition": "Very Good",
            "condition_notes": "Full aluminum metal body, enterprise durability, backlight keypad, original battery & charger.",
            "battery_condition": "Original HP Battery with 3-4 hours backup",
            "keyboard_layout": "Spill-resistant Backlit Keyboard with Pointing Stick",
            "ports": "Thunderbolt / Type-C, 2x USB 3.1, HDMI 1.4b, RJ-45, Audio combo",
            "connectivity": "Intel Dual Band Wireless, Bluetooth 4.2, HD Webcam",
            "accessories": "Original HP Smart AC Adapter included",
            "description": "Legendary HP EliteBook corporate laptop crafted from machined aluminum. Lightweight, durable, super fast with NVMe SSD, perfect for students, offices, and billing.",
            "price": 21000,
            "featured": 0,
            "display_order": 13,
            "primary_image": "https://res.cloudinary.com/ndhoopoy/image/upload/v1793797218/sri-sai-computers/laptop-13/photo_1_1793797134198.jpg",
            "images": [
                  "https://res.cloudinary.com/ndhoopoy/image/upload/v1793797218/sri-sai-computers/laptop-13/photo_1_1793797134198.jpg",
                  "https://res.cloudinary.com/ndhoopoy/image/upload/v1793797220/sri-sai-computers/laptop-13/photo_2_1793797136091.jpg",
                  "https://res.cloudinary.com/ndhoopoy/image/upload/v1793797221/sri-sai-computers/laptop-13/photo_3_1793797137202.jpg",
                  "https://res.cloudinary.com/ndhoopoy/image/upload/v1793797223/sri-sai-computers/laptop-13/photo_4_1793797138553.jpg",
                  "https://res.cloudinary.com/ndhoopoy/image/upload/v1793797224/sri-sai-computers/laptop-13/photo_5_1793797139807.jpg"
            ],
            "status": "AVAILABLE"
      },
      {
            "num": 14,
            "id": "p14",
            "slug": "lenovo-ideapad-slim-14-i5-11th-8gb-512gb-metal",
            "sku": "SSC-LNV-IPS14-I5",
            "brand": "Lenovo",
            "model": "IdeaPad Slim 14",
            "title": "Lenovo IdeaPad Slim 14 — Intel Core i5 11th Gen (8GB / 512GB SSD / Metal Body)",
            "processor_brand": "Intel",
            "processor_model": "Core i5-1135G7",
            "processor_generation": "11th Gen",
            "ram": "8 GB",
            "ram_type": "DDR4",
            "storage_capacity": "512 GB",
            "storage_type": "NVMe SSD",
            "screen_size": "14\"",
            "resolution": "1920x1080 Full HD Anti-Glare",
            "gpu": "Intel Iris Xe Graphics (4GB Shared)",
            "operating_system": "Windows 11 Home",
            "condition": "Like New",
            "condition_notes": "Metal body, compact and lightweight 14-inch form factor, backlight keypad, original battery & charger.",
            "battery_condition": "Original Lenovo Battery with 4+ hours backup",
            "keyboard_layout": "Backlight Ergonomic Keyboard",
            "ports": "USB Type-C, 2x USB Type-A, HDMI, SD Card Reader, Audio Combo",
            "connectivity": "WiFi 6, Bluetooth 5.1, 720p HD Camera with privacy shutter",
            "accessories": "Original Lenovo Charger included",
            "description": "Slim, metallic 14-inch Lenovo laptop featuring 11th Gen Core i5 processor, 512GB SSD, backlit keyboard, and lightweight chassis for work on the go.",
            "price": 29000,
            "featured": 0,
            "display_order": 14,
            "primary_image": "https://res.cloudinary.com/ndhoopoy/image/upload/v1793797225/sri-sai-computers/laptop-14/photo_1_1793797141116.jpg",
            "images": [
                  "https://res.cloudinary.com/ndhoopoy/image/upload/v1793797225/sri-sai-computers/laptop-14/photo_1_1793797141116.jpg",
                  "https://res.cloudinary.com/ndhoopoy/image/upload/v1793797227/sri-sai-computers/laptop-14/photo_2_1793797142322.jpg",
                  "https://res.cloudinary.com/ndhoopoy/image/upload/v1793797228/sri-sai-computers/laptop-14/photo_3_1793797143713.jpg"
            ],
            "status": "AVAILABLE"
      },
      {
            "num": 15,
            "id": "p15",
            "slug": "lenovo-ideapad-15-ryzen-5-5500u-8gb-512gb-metal",
            "sku": "SSC-LNV-IP15-R5",
            "brand": "Lenovo",
            "model": "IdeaPad 3 15",
            "title": "Lenovo IdeaPad 15 — AMD Ryzen 5 5500U (8GB / 512GB SSD / Metal Body)",
            "processor_brand": "AMD",
            "processor_model": "Ryzen 5 5500U",
            "processor_generation": "Ryzen 5000 Series (6-Core 12-Thread)",
            "ram": "8 GB",
            "ram_type": "DDR4",
            "storage_capacity": "512 GB",
            "storage_type": "NVMe SSD",
            "screen_size": "15.6\"",
            "resolution": "1920x1080 Full HD Narrow Bezel",
            "gpu": "AMD Radeon Graphics (7 Core)",
            "operating_system": "Windows 11 Home",
            "condition": "Like New",
            "condition_notes": "Metal body, 6-core 12-thread Ryzen 5 processor, backlight keypad, original battery & charger.",
            "battery_condition": "Original Lenovo Battery with 4+ hours backup",
            "keyboard_layout": "Backlight Keyboard with numeric keypad",
            "ports": "USB-C, 2x USB-A, HDMI, 4-in-1 Card Reader, Audio combo",
            "connectivity": "WiFi 6, Bluetooth 5.1, HD Webcam with privacy shutter",
            "accessories": "Original Lenovo Charger included",
            "description": "High-value 6-core Ryzen 5 5500U Lenovo IdeaPad with full metal styling, 512GB SSD, backlit keyboard, and full numeric pad for smooth productivity.",
            "price": 32000,
            "featured": 0,
            "display_order": 15,
            "primary_image": "https://res.cloudinary.com/ndhoopoy/image/upload/v1793797229/sri-sai-computers/laptop-15/photo_1_1793797145100.jpg",
            "images": [
                  "https://res.cloudinary.com/ndhoopoy/image/upload/v1793797229/sri-sai-computers/laptop-15/photo_1_1793797145100.jpg",
                  "https://res.cloudinary.com/ndhoopoy/image/upload/v1793797231/sri-sai-computers/laptop-15/photo_2_1793797146365.jpg",
                  "https://res.cloudinary.com/ndhoopoy/image/upload/v1793797232/sri-sai-computers/laptop-15/photo_3_1793797147661.jpg",
                  "https://res.cloudinary.com/ndhoopoy/image/upload/v1793797233/sri-sai-computers/laptop-15/photo_4_1793797148790.jpg",
                  "https://res.cloudinary.com/ndhoopoy/image/upload/v1793797234/sri-sai-computers/laptop-15/photo_5_1793797150157.jpg"
            ],
            "status": "AVAILABLE"
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

  const targetPrimary = (imagesList && imagesList.length > 0)
    ? imagesList[0]
    : (productData.primary_image || existing.primary_image);

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
      primary_image = ?,
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
    targetPrimary,
    id
  );

  if (imagesList && imagesList.length > 0) {
    db.prepare('DELETE FROM product_images WHERE product_id = ?').run(id);
    const insertImg = db.prepare(`
      INSERT INTO product_images (id, product_id, image_url, is_primary, display_order)
      VALUES (?, ?, ?, ?, ?)
    `);

    imagesList.forEach((url, idx) => {
      insertImg.run(`img_${id}_${Date.now()}_${idx}`, id, url, idx === 0 ? 1 : 0, idx);
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

// ----------------------------------------------------
// Cloudinary Persistent Sync Layer for Serverless Host
// ----------------------------------------------------

let lastSyncedRemoteTimestamp: number = 0;
let lastLocalModifiedTimestamp: number = Date.now();
let lastCloudCheckTime: number = 0;

export async function syncDatabaseToCloud(): Promise<boolean> {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    return false;
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });

  try {
    const products = db.prepare('SELECT * FROM products').all();
    const images = db.prepare('SELECT * FROM product_images').all();
    const settings = db.prepare('SELECT * FROM business_settings').all();

    lastLocalModifiedTimestamp = Date.now();
    const snapshot = {
      version: 1,
      updatedAt: new Date(lastLocalModifiedTimestamp).toISOString(),
      timestamp: lastLocalModifiedTimestamp,
      products,
      images,
      settings
    };

    const b64 = Buffer.from(JSON.stringify(snapshot)).toString('base64');
    await cloudinary.uploader.upload('data:application/json;base64,' + b64, {
      resource_type: 'raw',
      public_id: 'sri_sai_database_state.json',
      overwrite: true,
      invalidate: true
    });

    lastSyncedRemoteTimestamp = lastLocalModifiedTimestamp;
    return true;
  } catch (error) {
    console.error('Failed to sync database snapshot to Cloudinary:', error);
    return false;
  }
}

export async function syncDatabaseFromCloud(): Promise<boolean> {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  if (!cloudName) return false;

  const now = Date.now();
  // Throttle check to at most once every 3 seconds for peak performance
  if (now - lastCloudCheckTime < 3000) {
    return true;
  }
  lastCloudCheckTime = now;

  try {
    const url = `https://res.cloudinary.com/${cloudName}/raw/upload/sri_sai_database_state.json?t=${now}`;
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) return false;

    const data = await res.json();
    if (!data || !Array.isArray(data.products) || !data.products.length) return false;

    const remoteTimestamp = data.timestamp || new Date(data.updatedAt || 0).getTime();
    if (remoteTimestamp <= lastSyncedRemoteTimestamp && remoteTimestamp <= lastLocalModifiedTimestamp) {
      return true;
    }

    db.transaction(() => {
      // 1. Sync Products
      db.prepare('DELETE FROM product_images').run();
      db.prepare('DELETE FROM products').run();

      const insertProduct = db.prepare(`
        INSERT INTO products (
          id, slug, sku, brand, model, title, processor_brand, processor_model, processor_generation,
          ram, ram_type, storage_capacity, storage_type, screen_size, resolution, gpu, operating_system,
          condition, condition_notes, battery_condition, keyboard_layout, ports, connectivity, accessories,
          description, price, status, featured, display_order, primary_image, created_at, updated_at
        ) VALUES (
          ?, ?, ?, ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?, ?, ?, ?
        )
      `);

      for (const p of data.products) {
        insertProduct.run(
          p.id, p.slug, p.sku, p.brand, p.model, p.title, p.processor_brand, p.processor_model, p.processor_generation || '',
          p.ram, p.ram_type || '', p.storage_capacity, p.storage_type, p.screen_size, p.resolution || '', p.gpu || '', p.operating_system || '',
          p.condition, p.condition_notes || '', p.battery_condition || '', p.keyboard_layout || '', p.ports || '', p.connectivity || '',
          p.accessories || '', p.description || '', p.price, p.status, p.featured ? 1 : 0, p.display_order || 0, p.primary_image || '',
          p.created_at || new Date().toISOString(), p.updated_at || new Date().toISOString()
        );
      }

      // 2. Sync Images
      if (Array.isArray(data.images)) {
        const insertImg = db.prepare(`
          INSERT INTO product_images (id, product_id, image_url, is_primary, display_order)
          VALUES (?, ?, ?, ?, ?)
        `);
        for (const img of data.images) {
          insertImg.run(img.id, img.product_id, img.image_url, img.is_primary ? 1 : 0, img.display_order || 0);
        }
      }

      // 3. Sync Settings
      if (Array.isArray(data.settings) && data.settings[0]) {
        const s = data.settings[0];
        db.prepare('DELETE FROM business_settings').run();
        db.prepare(`
          INSERT INTO business_settings (
            id, business_name, address, phone, whatsapp_number, email, google_maps_url,
            instagram_url, facebook_url, about_text, hours_json, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          s.id || 'settings-1', s.business_name, s.address, s.phone, s.whatsapp_number, s.email,
          s.google_maps_url, s.instagram_url, s.facebook_url, s.about_text, s.hours_json,
          s.updated_at || new Date().toISOString()
        );
      }
    })();

    lastSyncedRemoteTimestamp = remoteTimestamp;
    lastLocalModifiedTimestamp = remoteTimestamp;
    return true;
  } catch (err) {
    console.error('Error syncing database from Cloudinary:', err);
    return false;
  }
}
