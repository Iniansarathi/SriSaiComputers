import { Product } from './types';

/**
 * Clean phone number to ensure digits only with country code
 * e.g., "+91 98422 12345" or "9842212345" -> "919842212345"
 */
export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `91${cleaned}`;
  }
  return cleaned;
}

/**
 * Generate a direct WhatsApp click-to-chat link containing product specifications, price, and URL.
 */
export function generateWhatsAppLink(
  whatsappNumber: string,
  product: Product,
  baseUrl?: string
): string {
  const cleanNumber = formatPhoneNumber(whatsappNumber || '919789558784');
  const siteUrl = baseUrl || (typeof window !== 'undefined' ? window.location.origin : 'https://srisaicomputers.com');
  const productUrl = `${siteUrl}/laptops/${product.slug}`;

  const message = `Hi Sri Sai Computers,

I am interested in this laptop listing on your website:

📌 *Product:* ${product.title}
💻 *Processor:* ${product.processor_brand} ${product.processor_model} ${product.processor_generation || ''}
⚡ *RAM:* ${product.ram} ${product.ram_type || ''}
💾 *Storage:* ${product.storage_capacity} ${product.storage_type}
✨ *Condition:* ${product.condition}
🏷️ *Listed Price:* ₹${product.price.toLocaleString('en-IN')}

Product link:
${productUrl}

Is this laptop currently available at your Gandhipuram shop?`;

  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${cleanNumber}?text=${encodedMessage}`;
}

/**
 * Generic WhatsApp link for general shop enquiries.
 */
export function generateGeneralWhatsAppLink(whatsappNumber: string, messageText?: string): string {
  const cleanNumber = formatPhoneNumber(whatsappNumber || '919842212345');
  const msg = messageText || 'Hi Sri Sai Computers, I would like to inquire about your available used laptops and computers in Gandhipuram, Coimbatore.';
  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(msg)}`;
}
