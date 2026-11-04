export type ProductStatus = 'AVAILABLE' | 'RESERVED' | 'SOLD' | 'HIDDEN';

export interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  is_primary: boolean;
  display_order: number;
}

export interface Product {
  id: string;
  slug: string;
  sku: string;
  brand: string;
  model: string;
  title: string;
  processor_brand: string;
  processor_model: string;
  processor_generation?: string;
  ram: string; // e.g. "16 GB"
  ram_type?: string; // e.g. "DDR4"
  storage_capacity: string; // e.g. "512 GB"
  storage_type: string; // e.g. "NVMe SSD"
  screen_size: string; // e.g. "14\""
  resolution?: string; // e.g. "1920x1080 Full HD"
  gpu?: string; // e.g. "Intel UHD Graphics 620"
  operating_system?: string; // e.g. "Windows 11 Pro"
  condition: string; // e.g. "Excellent", "Very Good", "Good", "Fair"
  condition_notes?: string; // e.g. "Minor scratches on lid, screen & keyboard pristine"
  battery_condition?: string; // e.g. "3+ Hours Backup", "New Battery Installed"
  keyboard_layout?: string;
  ports?: string;
  connectivity?: string;
  accessories?: string;
  description?: string;
  price: number; // In INR (₹)
  status: ProductStatus;
  featured: boolean;
  display_order: number;
  primary_image?: string;
  images?: ProductImage[];
  created_at: string;
  updated_at: string;
}

export interface BusinessSettings {
  id: string;
  business_name: string;
  address: string;
  phone: string;
  whatsapp_number: string;
  email: string;
  google_maps_url: string;
  instagram_url?: string;
  facebook_url?: string;
  about_text: string;
  hours_json: string; // JSON string of day-by-day hours
  created_at?: string;
  updated_at?: string;
}

export interface BusinessHoursDay {
  day: string; // "Monday", "Tuesday", etc.
  isOpen: boolean;
  openTime: string; // "09:30 AM"
  closeTime: string; // "08:30 PM"
}

export interface DashboardStats {
  total: number;
  available: number;
  reserved: number;
  sold: number;
}
