export const DEFAULT_WHATSAPP_NUMBER = '923006316551';
export const DISPLAY_WHATSAPP_NUMBER = '0300-6316551';

export function normalizeWhatsAppNumber(whatsappNumber?: string): string {
  const raw = (whatsappNumber || DEFAULT_WHATSAPP_NUMBER).trim();
  const cleaned = raw.replace(/[^0-9]/g, '');

  if (!cleaned || raw === 'YOUR_WHATSAPP_NUMBER') {
    return DEFAULT_WHATSAPP_NUMBER;
  }
  // Convert Pakistani local mobile format (e.g. 03006316551) to international format (923006316551)
  if (cleaned.length === 11 && cleaned.startsWith('0')) {
    return `92${cleaned.slice(1)}`;
  }
  return cleaned;
}

export function formatWhatsAppDisplay(whatsappNumber?: string): string {
  const intl = normalizeWhatsAppNumber(whatsappNumber);
  if (intl.startsWith('92') && intl.length === 12) {
    const local = `0${intl.slice(2)}`;
    return `${local.slice(0, 4)}-${local.slice(4)}`;
  }
  return whatsappNumber || DISPLAY_WHATSAPP_NUMBER;
}

export function buildWhatsAppUrl(whatsappNumber: string | undefined, message: string): string {
  const normalized = normalizeWhatsAppNumber(whatsappNumber);
  return `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`;
}

export const WHATSAPP_TEMPLATES = {
  productInquiry: (productName: string) =>
    `Assalam-o-Alaikum Digital E-Commerce by ASIF, I want to inquire about: ${productName}. Please share availability and delivery details.`,
  directProductOrder: (params: {
    name: string;
    variant?: string;
    qty: number;
    unitPricePkr: number;
    totalPkr: number;
  }) =>
    [
      'Assalam-o-Alaikum Digital E-Commerce by ASIF!',
      'I want to order directly on WhatsApp:',
      `Product: ${params.name}`,
      params.variant ? `Option/Size: ${params.variant}` : '',
      `Quantity: ${params.qty}`,
      `Price: PKR ${Math.round(params.unitPricePkr).toLocaleString('en-PK')}`,
      `Total: PKR ${Math.round(params.totalPkr).toLocaleString('en-PK')}`,
      'Please confirm my order and Cash on Delivery / payment details.',
    ]
      .filter(Boolean)
      .join('\n'),
  directCartOrder: (params: {
    items: { name: string; variant?: string; quantity: number; pricePkr: number }[];
    subtotalPkr: number;
    discountPkr: number;
    deliveryPkr: number;
    totalPkr: number;
    customerName?: string;
    phone?: string;
    address?: string;
    city?: string;
    paymentMethod?: string;
  }) => {
    const itemLines = params.items.map(
      (it, i) =>
        `${i + 1}. ${it.name}${it.variant ? ` (${it.variant})` : ''} × ${it.quantity} = PKR ${Math.round(
          it.pricePkr * it.quantity,
        ).toLocaleString('en-PK')}`,
    );
    return [
      'Assalam-o-Alaikum Digital E-Commerce by ASIF!',
      'Direct WhatsApp Cart Order:',
      ...itemLines,
      `Subtotal: PKR ${Math.round(params.subtotalPkr).toLocaleString('en-PK')}`,
      params.discountPkr > 0
        ? `Discount: -PKR ${Math.round(params.discountPkr).toLocaleString('en-PK')}`
        : '',
      `Delivery: ${params.deliveryPkr === 0 ? 'Free' : `PKR ${Math.round(params.deliveryPkr).toLocaleString('en-PK')}`}`,
      `Total Payable: PKR ${Math.round(params.totalPkr).toLocaleString('en-PK')}`,
      params.customerName ? `Name: ${params.customerName}` : '',
      params.phone ? `Phone: ${params.phone}` : '',
      params.address ? `Address: ${params.address}${params.city ? `, ${params.city}` : ''}` : '',
      params.paymentMethod ? `Payment Method: ${params.paymentMethod}` : '',
    ]
      .filter(Boolean)
      .join('\n');
  },
  courseInquiry: (courseName: string, feePkr?: number, mode?: string) =>
    [
      'Assalam-o-Alaikum Digital E-Commerce by ASIF!',
      `I want to enroll in course: ${courseName}.`,
      typeof feePkr === 'number' ? `Course Fee: PKR ${Math.round(feePkr).toLocaleString('en-PK')}` : '',
      mode ? `Preferred Mode: ${mode}` : '',
      'Please share upcoming batch schedule and registration steps.',
    ]
      .filter(Boolean)
      .join('\n'),
  tuitionInquiry: (classOrSubject: string) =>
    `Assalam-o-Alaikum Digital E-Commerce by ASIF, I need Home/Online Tuition details for ${classOrSubject}.`,
  orderInquiry: (productOrOrder: string) =>
    `Assalam-o-Alaikum Digital E-Commerce by ASIF, I want to place/confirm an order for: ${productOrOrder}.`,
  generalContact: () =>
    `Assalam-o-Alaikum Digital E-Commerce by ASIF, I need assistance with your store or courses.`,
};
