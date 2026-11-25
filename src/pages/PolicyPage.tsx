import React from 'react';
import { useParams } from 'react-router-dom';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { SeoHead } from '../components/SeoHead';

export function PolicyPage() {
  const { type } = useParams();

  const contentMap: Record<string, { title: string; sections: { heading: string; body: string }[] }> = {
    privacy: {
      title: 'Privacy Policy',
      sections: [
        {
          heading: '1. Data Collection & PII Isolation',
          body: 'Digital E-Commerce by ASIF collects only the contact, delivery, and academic enrollment details you explicitly submit when placing an order, registering for a course, or booking tuition. Personal details are stored securely with strict owner-only and admin access rules.',
        },
        {
          heading: '2. Communication & WhatsApp',
          body: 'Your phone and WhatsApp numbers are used strictly to confirm orders (via 0300-6316551), share course schedules, and coordinate assigned tutors.',
        },
        {
          heading: '3. Third-Party Services',
          body: 'Authentication and database persistence are powered by Firebase, and interactive location mapping uses Google Maps Platform subject to Google End User Terms.',
        },
      ],
    },
    terms: {
      title: 'Terms & Conditions',
      sections: [
        {
          heading: '1. Educational & Exam Resources',
          body: 'Online courses, tuition sessions, and MCQ banks are designed for educational preparation. For government recruitment and university admission exams, candidates must verify official eligibility, fees, and dates directly from the official recruiting authority.',
        },
        {
          heading: '2. E-Commerce Orders & Payments',
          body: 'Orders may be placed via Cash on Delivery (COD), direct WhatsApp confirmation (0300-6316551), or manual Bank Transfer / Easypaisa / JazzCash with verified Transaction Reference submission. Live inventory, pricing, and discounts are managed directly through the Admin Dashboard.',
        },
      ],
    },
    refund: {
      title: 'Return & Refund Policy',
      sections: [
        {
          heading: '1. Physical Products (7-Day Inspection)',
          body: 'Physical products received damaged, defective, or mismatched may be exchanged or refunded within 7 days of delivery when reported with unboxing details via WhatsApp (0300-6316551) or your Account dashboard.',
        },
        {
          heading: '2. Online Courses & Tuition',
          body: 'Tuition consultations are free. Course fee refunds or batch transfers are handled within the first week of classes by contacting our Bahawalpur academic desk.',
        },
      ],
    },
    'setup-guide': {
      title: 'Owner Storefront & Catalog Management Guide',
      sections: [
        {
          heading: '1. Configure Business Contact, WhatsApp & SEO',
          body: 'Sign in with the owner Google account (digital.solution.by.asif@gmail.com) and open the Admin Dashboard -> Website Settings tab. Official WhatsApp defaults to 0300-6316551 (923006316551) and you can customize your Bahawalpur address, social URLs, map coordinates, and homepage SEO title, meta description, and keywords anytime.',
        },
        {
          heading: '2. Edit Catalog Prices, Stock, Courses & Reviews',
          body: 'In Admin Dashboard -> Overview, click "Sync Catalog & Settings to Firestore" to push updates to your live Firestore database. Use the Products and Courses tabs to edit pricing, discounts, stock, specs, or add new items inline, and use the Reviews tab to publish verified customer testimonials.',
        },
        {
          heading: '3. Payment Providers & Environment Variables',
          body: 'Cash on Delivery, Direct WhatsApp ordering (0300-6316551), and manual reference tracking for Bank Transfer, Easypaisa, and JazzCash work immediately. Automated payment gateways (if added later) must store secret keys strictly in server-side environment variables, never in client source code.',
        },
      ],
    },
  };

  const docData = contentMap[type || 'privacy'] || contentMap.privacy;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      <SeoHead
        title={`${docData.title} | Digital E-Commerce by ASIF`}
        description={`${docData.title} for Digital E-Commerce by ASIF in Bahawalpur, Punjab, Pakistan.`}
      />
      <Breadcrumbs items={[{ label: docData.title }]} />
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-10 space-y-6">
        <h1 className="font-display text-3xl font-bold text-slate-900">{docData.title}</h1>
        <div className="space-y-6">
          {docData.sections.map((sec) => (
            <div key={sec.heading} className="space-y-2">
              <h2 className="font-display text-lg font-bold text-slate-900">{sec.heading}</h2>
              <p className="text-sm text-slate-700 leading-relaxed">{sec.body}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
