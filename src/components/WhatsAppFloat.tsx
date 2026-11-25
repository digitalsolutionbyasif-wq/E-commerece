import React from 'react';
import { MessageCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { buildWhatsAppUrl, formatWhatsAppDisplay, WHATSAPP_TEMPLATES } from '../lib/whatsapp';

export function WhatsAppFloat() {
  const { siteSettings } = useApp();

  return (
    <a
      href={buildWhatsAppUrl(siteSettings.whatsappNumber, WHATSAPP_TEMPLATES.generalContact())}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Contact Digital E-Commerce by ASIF on WhatsApp"
      className="fixed bottom-5 right-5 z-40 inline-flex items-center gap-2 px-4 py-3 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg transition-transform duration-150 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
    >
      <MessageCircle className="w-5 h-5" />
      <span className="text-xs font-semibold hidden sm:inline whitespace-nowrap">
        WhatsApp · {formatWhatsAppDisplay(siteSettings.whatsappNumber)}
      </span>
    </a>
  );
}
