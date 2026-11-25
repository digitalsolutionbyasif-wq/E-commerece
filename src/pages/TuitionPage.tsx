import React, { useState } from 'react';
import { BookOpenCheck, CheckCircle2, GraduationCap, MessageCircle, Users } from 'lucide-react';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { SeoHead } from '../components/SeoHead';
import { useApp } from '../context/AppContext';
import { TUITION_CLASSES } from '../data/seedCatalog';
import { buildWhatsAppUrl, formatWhatsAppDisplay, WHATSAPP_TEMPLATES } from '../lib/whatsapp';

const TUITION_SERVICES = [
  'Home Tuition (Bahawalpur)',
  'Online Tuition (Nationwide & Overseas)',
  'One-to-One Classes',
  'Small Group Classes',
  'Subject-Wise Tuition',
  'Board Exam Preparation',
  'Daily Homework Assistance',
  'Concept-Based Learning',
];

export function TuitionPage() {
  const { siteSettings, categorySeoMap, submitTuitionRequest, user } = useApp();
  const customSeo = categorySeoMap.tuition;
  const whatsappDisplay = formatWhatsAppDisplay(siteSettings.whatsappNumber);

  const [studentName, setStudentName] = useState(user?.displayName || '');
  const [guardianName, setGuardianName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [className, setClassName] = useState('FSc Pre-Medical');
  const [subject, setSubject] = useState('Physics, Chemistry & Biology');
  const [board, setBoard] = useState('BISE Bahawalpur');
  const [cityArea, setCityArea] = useState('Model Town A, Bahawalpur');
  const [tuitionMode, setTuitionMode] = useState<'Home Tuition' | 'Online Tuition'>('Home Tuition');
  const [preferredTiming, setPreferredTiming] = useState('Evening (4:00 PM – 6:00 PM)');
  const [submitting, setSubmitting] = useState(false);
  const [submittedOk, setSubmittedOk] = useState(false);

  const allClasses = [
    ...TUITION_CLASSES.school,
    ...TUITION_CLASSES.matric,
    ...TUITION_CLASSES.intermediate,
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await submitTuitionRequest({
        studentName,
        guardianName,
        contactNumber,
        whatsapp,
        className,
        subject,
        board,
        cityArea,
        tuitionMode,
        preferredTiming,
      });
      setSubmittedOk(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-12">
      <SeoHead
        title={customSeo?.seoTitle?.trim() || 'Home & Online Tuition Academy Bahawalpur | Matric, FSc, ICS, O-Levels — ASIF'}
        description={customSeo?.seoDescription?.trim() || 'Verified home tutors in Bahawalpur and live 1-to-1 online tuition for Class 5-8, Matric, FSc Pre-Medical/Pre-Engineering, ICS, FA, and ADP.'}
        keywords={customSeo?.seoKeywords?.trim() || 'home tuition Bahawalpur, online tuition Pakistan, FSc tutor Bahawalpur, Matric Science tuition, WhatsApp 0300-6316551'}
        image={customSeo?.ogImageUrl?.trim() || undefined}
        jsonLd={{
          '@type': 'Service',
          name: 'Home & Online Tuition Academy',
          areaServed: 'Bahawalpur, Punjab, Pakistan',
          provider: { '@type': 'Organization', name: 'Digital E-Commerce by ASIF' },
        }}
      />
      <div>
        <Breadcrumbs items={[{ label: 'Home & Online Tuition Academy' }]} />
        <div className="mt-4 bg-slate-950 text-white rounded-2xl p-8 sm:p-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="text-xs font-semibold text-sky-400">Category Two · Academic Support</div>
            <h1 className="mt-2 font-display text-3xl sm:text-4xl font-bold">
              Home & Online Tuition Academy
            </h1>
            <p className="mt-3 text-base text-slate-300">
              Concept-based one-to-one and small-group tuition for School, Matriculation, and Intermediate students in Bahawalpur and online across Pakistan.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 shrink-0">
            <a
              href="#tuition-form"
              className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors whitespace-nowrap"
            >
              Book a Free Consultation
            </a>
            <a
              href={buildWhatsAppUrl(
                siteSettings.whatsappNumber,
                WHATSAPP_TEMPLATES.tuitionInquiry(`${className} - ${subject}`),
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg transition-colors inline-flex items-center gap-2 whitespace-nowrap"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp Tuition ({whatsappDisplay})</span>
            </a>
          </div>
        </div>
      </div>

      {/* Academic Tiers */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <div className="w-10 h-10 rounded-lg bg-slate-100 text-blue-700 flex items-center justify-center">
            <BookOpenCheck className="w-5 h-5" />
          </div>
          <h2 className="mt-4 font-display text-lg font-bold text-slate-900">School Education</h2>
          <p className="mt-1 text-xs text-slate-600">Strong conceptual foundations & homework guidance.</p>
          <ul className="mt-4 space-y-2 text-sm text-slate-700">
            {TUITION_CLASSES.school.map((c) => (
              <li key={c} className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-700 shrink-0" />
                <span>{c}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <div className="w-10 h-10 rounded-lg bg-slate-100 text-blue-700 flex items-center justify-center">
            <GraduationCap className="w-5 h-5" />
          </div>
          <h2 className="mt-4 font-display text-lg font-bold text-slate-900">Matriculation (9th & 10th)</h2>
          <p className="mt-1 text-xs text-slate-600">BISE board past-paper drills & weekly testing.</p>
          <ul className="mt-4 space-y-2 text-sm text-slate-700">
            {TUITION_CLASSES.matric.map((c) => (
              <li key={c} className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-700 shrink-0" />
                <span>{c}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <div className="w-10 h-10 rounded-lg bg-slate-100 text-blue-700 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
          <h2 className="mt-4 font-display text-lg font-bold text-slate-900">Intermediate & Higher</h2>
          <p className="mt-1 text-xs text-slate-600">Specialized subject tutors for board & entry prep.</p>
          <ul className="mt-4 space-y-2 text-sm text-slate-700">
            {TUITION_CLASSES.intermediate.map((c) => (
              <li key={c} className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-700 shrink-0" />
                <span>{c}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Tuition Services */}
      <section className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8">
        <h2 className="font-display text-xl font-bold text-slate-900">Tuition Formats & Support</h2>
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {TUITION_SERVICES.map((srv) => (
            <div key={srv} className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{srv}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Tuition Enrollment Form */}
      <section id="tuition-form" className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 space-y-4">
          <h2 className="font-display text-2xl font-bold text-slate-900">
            Tuition Enrollment & Free Consultation
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Submit your class, subjects, and preferred mode. Our coordinator assigns a verified subject specialist and tracks your request in the Admin & Student Dashboard.
          </p>
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 space-y-1.5">
            <div className="font-semibold text-slate-900">How Teacher Assignment Works</div>
            <p>1. Submit this registration form (or message on WhatsApp).</p>
            <p>2. Free 15-minute academic consultation call.</p>
            <p>3. Matched home tutor (Bahawalpur) or live online tutor starts demo class.</p>
          </div>
        </div>

        <form onSubmit={(e) => void handleSubmit(e)} className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {submittedOk && (
            <div className="sm:col-span-2 p-4 bg-emerald-50 border border-emerald-200 text-emerald-950 rounded-xl text-sm font-medium">
              Tuition request submitted! View teacher assignment status in your Account page.
            </div>
          )}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Student Name</label>
            <input
              type="text"
              required
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Parent / Guardian Name</label>
            <input
              type="text"
              required
              value={guardianName}
              onChange={(e) => setGuardianName(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Number</label>
            <input
              type="tel"
              required
              value={contactNumber}
              onChange={(e) => setContactNumber(e.target.value)}
              placeholder="03XX-XXXXXXX"
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">WhatsApp Number</label>
            <input
              type="tel"
              required
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              placeholder="03XX-XXXXXXX"
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Class / Program</label>
            <select
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg"
            >
              {allClasses.map((cls) => (
                <option key={cls} value={cls}>{cls}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Subject(s)</label>
            <input
              type="text"
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Mathematics, Physics, English"
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Education Board</label>
            <input
              type="text"
              required
              value={board}
              onChange={(e) => setBoard(e.target.value)}
              placeholder="e.g. BISE Bahawalpur / Federal Board / Cambridge"
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">City / Area</label>
            <input
              type="text"
              required
              value={cityArea}
              onChange={(e) => setCityArea(e.target.value)}
              placeholder="e.g. Satellite Town, Bahawalpur"
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Online or Home Tuition</label>
            <select
              value={tuitionMode}
              onChange={(e) => setTuitionMode(e.target.value as 'Home Tuition' | 'Online Tuition')}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg"
            >
              <option value="Home Tuition">Home Tuition</option>
              <option value="Online Tuition">Online Tuition</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Preferred Timing</label>
            <input
              type="text"
              required
              value={preferredTiming}
              onChange={(e) => setPreferredTiming(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg"
            />
          </div>
          <div className="sm:col-span-2 pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-3 bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold rounded-lg transition-colors"
            >
              {submitting ? 'Submitting Request...' : 'Submit Tuition Request'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
