import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, MapPin, MessageCircle, Phone } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { buildWhatsAppUrl, WHATSAPP_TEMPLATES } from '../lib/whatsapp';

export function Footer() {
  const { siteSettings } = useApp();

  const socialItems = [
    { label: 'Facebook', href: siteSettings.facebookUrl || '#facebook-placeholder' },
    { label: 'Instagram', href: siteSettings.instagramUrl || '#instagram-placeholder' },
    { label: 'TikTok', href: siteSettings.tiktokUrl || '#tiktok-placeholder' },
    { label: 'YouTube', href: siteSettings.youtubeUrl || '#youtube-placeholder' },
    { label: 'LinkedIn', href: siteSettings.linkedinUrl || '#linkedin-placeholder' },
  ];

  return (
    <footer className="bg-slate-950 text-slate-300 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
        <div>
          <h3 className="font-display text-lg font-bold text-white">Digital E-Commerce by ASIF</h3>
          <p className="mt-2 text-xs font-medium text-sky-400">
            Learn Skills. Shop Smart. Build Your Future.
          </p>
          <p className="mt-3 text-sm text-slate-400 leading-relaxed">
            A multi-category digital academy, educational support center, and quality online store serving students and families across Pakistan.
          </p>
          <a
            href={buildWhatsAppUrl(siteSettings.whatsappNumber, WHATSAPP_TEMPLATES.generalContact())}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Chat on WhatsApp</span>
          </a>
        </div>

        <div>
          <h4 className="font-display text-sm font-semibold text-white mb-4">Education & Exams</h4>
          <ul className="space-y-2.5 text-sm text-slate-400">
            <li><Link to="/courses" className="hover:text-white transition-colors">Online Skills Development Academy</Link></li>
            <li><Link to="/tuition" className="hover:text-white transition-colors">Home & Online Tuition</Link></li>
            <li><Link to="/govt-exams" className="hover:text-white transition-colors">Government Exam Preparation</Link></li>
            <li><Link to="/ability-tests" className="hover:text-white transition-colors">Ability & Admission Tests (MCQ)</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-display text-sm font-semibold text-white mb-4">Marketplace Categories</h4>
          <ul className="space-y-2.5 text-sm text-slate-400">
            <li><Link to="/electronics" className="hover:text-white transition-colors">Mobile Accessories & Electronics</Link></li>
            <li><Link to="/fashion" className="hover:text-white transition-colors">Clothing & Fashion Store</Link></li>
            <li><Link to="/kids-toys" className="hover:text-white transition-colors">Kids Toys & STEM Kits</Link></li>
            <li><Link to="/home-accessories" className="hover:text-white transition-colors">Home Accessories & Living</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-display text-sm font-semibold text-white mb-4">Business & Contact</h4>
          <ul className="space-y-3 text-sm text-slate-400">
            <li className="flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
              <span>{siteSettings.businessAddress}</span>
            </li>
            <li className="flex items-center gap-2.5">
              <Phone className="w-4 h-4 text-sky-400 shrink-0" />
              <span>{siteSettings.businessPhone}</span>
            </li>
            <li className="flex items-center gap-2.5">
              <Mail className="w-4 h-4 text-sky-400 shrink-0" />
              <span>{siteSettings.businessEmail}</span>
            </li>
          </ul>
          <div className="mt-5 flex flex-wrap gap-3 text-xs">
            {socialItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                target={item.href.startsWith('http') ? '_blank' : undefined}
                rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                className="text-slate-400 hover:text-white transition-colors underline underline-offset-4"
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} Digital E-Commerce by ASIF · Bahawalpur, Punjab, Pakistan.</p>
          <div className="flex flex-wrap items-center gap-5">
            <Link to="/wishlist" className="hover:text-white transition-colors">Wishlist</Link>
            <Link to="/track-order" className="hover:text-white transition-colors">Track Order</Link>
            <Link to="/about" className="hover:text-white transition-colors">About Us</Link>
            <Link to="/contact" className="hover:text-white transition-colors">Contact Us</Link>
            <Link to="/policies/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="/policies/terms" className="hover:text-white transition-colors">Terms & Conditions</Link>
            <Link to="/policies/refund" className="hover:text-white transition-colors">Return & Refund Policy</Link>
            <Link to="/policies/setup-guide" className="hover:text-white transition-colors">Owner Setup Guide</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
