import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Award,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ClipboardCheck,
  GraduationCap,
  Home as HomeIcon,
  MessageCircle,
  Puzzle,
  ShieldCheck,
  Shirt,
  Smartphone,
  Star,
  Truck,
} from 'lucide-react';
import { CourseCard } from '../components/CourseCard';
import { ProductCard } from '../components/ProductCard';
import { SeoHead } from '../components/SeoHead';
import { useApp } from '../context/AppContext';
import { ASSETS } from '../data/seedCatalog';
import { buildWhatsAppUrl, formatWhatsAppDisplay, WHATSAPP_TEMPLATES } from '../lib/whatsapp';

const HOME_FAQS = [
  {
    q: 'How can I place an order directly on WhatsApp?',
    a: 'Click "Order on WhatsApp" on any product card, quick-view popup, cart drawer, or checkout page to send your complete itemized order directly to our official WhatsApp desk at 0300-6316551.',
  },
  {
    q: 'Do you offer Cash on Delivery (COD) across Pakistan?',
    a: 'Yes! We offer Cash on Delivery nationwide across Pakistan, plus Bank Transfer, Easypaisa, and JazzCash. Delivery is free on orders above PKR 5,000 and flat PKR 250 below PKR 5,000.',
  },
  {
    q: 'Are Home Tuition services available in Bahawalpur?',
    a: 'Yes, we provide verified male and female home tutors across Bahawalpur (Model Town, Satellite Town, Baghdad-ul-Jadid, Shadab Colony) and live one-to-one online tuition nationwide and overseas.',
  },
  {
    q: 'Are MCQ practice tests free for PPSC, FPSC, MDCAT, and ECAT?',
    a: 'Yes, our timed interactive MCQ portals for government jobs and university entry tests are free to practice online, with instant score explanations and saved progress when signed in.',
  },
  {
    q: 'What promo codes are currently active at checkout?',
    a: 'Use promo code ASIF10 for 10% instant discount on your order or BAHAWALPUR250 for PKR 250 off at checkout.',
  },
];

const FEATURED_CATEGORIES = [
  {
    title: 'Skills Development Programs',
    subtitle: 'Web Dev, Python, Graphic Design, SEO, Meta Ads & AI',
    to: '/courses',
    icon: BookOpen,
  },
  {
    title: 'Online & Home Tuition',
    subtitle: 'Class 5–8, Matric, FSc, ICS, FA, DAE & ADP',
    to: '/tuition',
    icon: GraduationCap,
  },
  {
    title: 'Government Exam Preparation',
    subtitle: 'PPSC, FPSC, NTS, Police, FIA, CSS, PMS & Educators',
    to: '/govt-exams',
    icon: ShieldCheck,
  },
  {
    title: 'Ability & Admission Tests',
    subtitle: 'NAT, GAT, LAT, HAT, MDCAT, ECAT & Timed MCQs',
    to: '/ability-tests',
    icon: ClipboardCheck,
  },
  {
    title: 'Mobile Accessories',
    subtitle: 'Earbuds, PD Chargers, Smartwatches & Creator Gear',
    to: '/electronics',
    icon: Smartphone,
  },
  {
    title: 'Fashion & Clothing',
    subtitle: 'Ladies Suits, Gents Shirts, Kids Wear & Accessories',
    to: '/fashion',
    icon: Shirt,
  },
  {
    title: 'Kids Toys',
    subtitle: 'STEM Robotics Kits, Blocks, RC Cars & Puzzles',
    to: '/kids-toys',
    icon: Puzzle,
  },
  {
    title: 'Home Accessories',
    subtitle: 'Kitchen Organizers, Study Lamps & Living Decor',
    to: '/home-accessories',
    icon: HomeIcon,
  },
];

export function HomePage() {
  const { courses, products, approvedReviews, siteSettings, subscribeNewsletter } = useApp();
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [submittingNews, setSubmittingNews] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [newsletterFeedback, setNewsletterFeedback] = useState<{
    tone: 'success' | 'error';
    text: string;
  } | null>(null);

  const featuredCourses = courses.filter((c) => c.featured).slice(0, 4);
  const bestProducts = products.filter((p) => p.featured).slice(0, 6);
  const whatsappDisplay = formatWhatsAppDisplay(siteSettings.whatsappNumber);

  const handleNewsletter = async (e: React.FormEvent) => {
    e.preventDefault();
    setNewsletterFeedback(null);
    if (!newsletterEmail.trim()) return;
    setSubmittingNews(true);
    try {
      const result = await subscribeNewsletter(newsletterEmail, 'homepage-newsletter');
      setNewsletterFeedback({ tone: 'success', text: result.message });
      setNewsletterEmail('');
    } catch (err) {
      setNewsletterFeedback({
        tone: 'error',
        text: err instanceof Error ? err.message : 'Unable to subscribe right now.',
      });
    } finally {
      setSubmittingNews(false);
    }
  };

  return (
    <div>
      <SeoHead
        title={siteSettings.seoTitle || 'Digital E-Commerce by ASIF | Online Courses, Tuition & Store in Pakistan'}
        description={
          siteSettings.seoDescription ||
          'Digital E-Commerce by ASIF in Bahawalpur, Pakistan. Enroll in online IT & digital skills courses, home & online tuition, PPSC/FPSC/MDCAT exam prep, and shop quality electronics, fashion, kids toys, and home accessories.'
        }
        keywords={
          siteSettings.seoKeywords ||
          'Digital E-Commerce by ASIF, Bahawalpur online store, online courses Pakistan, home tuition Bahawalpur, PPSC FPSC preparation, MDCAT ECAT mock tests, Cash on Delivery Pakistan, WhatsApp 03006316551'
        }
        jsonLd={[
          {
            '@type': 'WebSite',
            name: 'Digital E-Commerce by ASIF',
            url: typeof window !== 'undefined' ? window.location.origin : '',
          },
          {
            '@type': 'Store',
            name: 'Digital E-Commerce by ASIF',
            telephone: whatsappDisplay,
            email: siteSettings.businessEmail,
            address: {
              '@type': 'PostalAddress',
              streetAddress: siteSettings.businessAddress,
              addressLocality: 'Bahawalpur',
              addressRegion: 'Punjab',
              addressCountry: 'PK',
            },
          },
          {
            '@type': 'FAQPage',
            mainEntity: HOME_FAQS.map((item) => ({
              '@type': 'Question',
              name: item.q,
              acceptedAnswer: {
                '@type': 'Answer',
                text: item.a,
              },
            })),
          },
        ]}
      />

      {/* Slim Promotional Bar */}
      {siteSettings.promoBannerText && (
        <div className="bg-slate-950 text-slate-100 text-xs py-2 px-4 text-center border-b border-slate-800">
          <span>{siteSettings.promoBannerText}</span>
        </div>
      )}

      {/* Hero Split Showcase */}
      <section className="bg-slate-950 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 lg:py-20 grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
          <div className="lg:col-span-7 flex flex-col justify-center">
            <div className="text-xs font-semibold text-sky-400 tracking-wide">
              Digital E-Commerce by ASIF · Bahawalpur, Punjab, Pakistan
            </div>
            <h1 className="mt-3 font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-[1.12] text-balance max-w-2xl">
              {siteSettings.heroHeadline}
            </h1>
            <p className="mt-4 text-base sm:text-lg text-slate-300 leading-relaxed max-w-xl">
              {siteSettings.heroSubheadline}
            </p>
            <p className="mt-2 text-xs text-slate-400">
              Tagline: &ldquo;Learn Skills. Shop Smart. Build Your Future.&rdquo;
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                to="/courses"
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors inline-flex items-center gap-2 whitespace-nowrap"
              >
                <span>Explore Courses</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/electronics"
                className="px-6 py-3 bg-white text-slate-950 hover:bg-slate-100 text-sm font-semibold rounded-lg transition-colors whitespace-nowrap"
              >
                Shop Now
              </Link>
              <a
                href={buildWhatsAppUrl(siteSettings.whatsappNumber, WHATSAPP_TEMPLATES.generalContact())}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg transition-colors inline-flex items-center gap-2 whitespace-nowrap"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Order on WhatsApp ({whatsappDisplay})</span>
              </a>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="h-full min-h-[260px] lg:min-h-[380px] rounded-xl overflow-hidden border border-slate-800 bg-slate-900">
              <img
                src={ASSETS.hero}
                alt="Digital E-Commerce by ASIF workspace and products"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Featured Categories (All 8 Business Verticals) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900">
              Explore All 8 Services & Store Categories
            </h2>
            <p className="mt-1.5 text-sm text-slate-600">
              Dedicated portals for career courses, tuition, competitive exams, and curated physical shopping.
            </p>
          </div>
          <Link to="/ability-tests" className="text-sm font-semibold text-blue-700 hover:underline whitespace-nowrap">
            Try Free MCQ Mock Tests →
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {FEATURED_CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link
                key={cat.title}
                to={cat.to}
                className="group bg-white border border-slate-200 hover:border-blue-600 rounded-xl p-5 transition-all duration-150 hover:-translate-y-0.5 hover:shadow-sm flex flex-col"
              >
                <div className="w-10 h-10 rounded-lg bg-slate-100 text-blue-700 flex items-center justify-center group-hover:bg-blue-700 group-hover:text-white transition-colors">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="mt-4 font-display text-base font-semibold text-slate-900">
                  {cat.title}
                </h3>
                <p className="mt-1 text-xs text-slate-600 leading-relaxed flex-1">
                  {cat.subtitle}
                </p>
                <span className="mt-4 text-xs font-semibold text-blue-700 inline-flex items-center gap-1">
                  Open Section <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Popular Courses */}
      <section className="bg-white border-y border-slate-200 py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="text-xs font-semibold text-blue-700">
                Online Skills Development Academy · Career & Freelancing Tracks
              </div>
              <h2 className="mt-1 font-display text-2xl sm:text-3xl font-bold text-slate-900">
                Popular Career-Oriented Courses
              </h2>
            </div>
            <Link
              to="/courses"
              className="text-sm font-semibold text-blue-700 hover:underline whitespace-nowrap"
            >
              View All Programs →
            </Link>
          </div>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        </div>
      </section>

      {/* Best-Selling Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="text-xs font-semibold text-blue-700">
              Marketplace Storefront · Cash on Delivery & WhatsApp Order ({whatsappDisplay})
            </div>
            <h2 className="mt-1 font-display text-2xl sm:text-3xl font-bold text-slate-900">
              Best-Selling Products
            </h2>
          </div>
          <div className="flex flex-wrap gap-4 text-xs font-semibold text-blue-700">
            <Link to="/electronics" className="hover:underline">Electronics</Link>
            <Link to="/fashion" className="hover:underline">Fashion</Link>
            <Link to="/kids-toys" className="hover:underline">Kids Toys</Link>
            <Link to="/home-accessories" className="hover:underline">Home Living</Link>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {bestProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Why Choose Us & Latest Offers */}
      <section className="bg-slate-900 text-white py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-7">
            <h2 className="font-display text-2xl sm:text-3xl font-bold">
              Why Choose Digital E-Commerce by ASIF?
            </h2>
            <p className="mt-2 text-sm text-slate-300">
              Built for students, parents, and online shoppers across Bahawalpur and all of Pakistan.
            </p>
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { title: 'Professional Learning Opportunities', desc: 'Practical tracks in coding, design, marketing, and AI.' },
                { title: 'Affordable Tuition & Course Fees', desc: 'Transparent PKR pricing for students and families.' },
                { title: 'Quality Checked Products', desc: 'Curated electronics, fashion, STEM toys, and home essentials.' },
                { title: 'Dedicated Student Support', desc: 'Guided home & online tuition plus MCQ mock exams.' },
                { title: 'Direct WhatsApp Communication', desc: 'Instant human assistance for orders, courses, and tuition.' },
                { title: 'Flexible Pakistani Payments', desc: 'Cash on Delivery, Bank Transfer, Easypaisa & JazzCash.' },
              ].map((item) => (
                <div key={item.title} className="p-4 rounded-xl bg-slate-800/70 border border-slate-700/80">
                  <div className="flex items-center gap-2 text-sm font-semibold text-white">
                    <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" />
                    <span>{item.title}</span>
                  </div>
                  <p className="mt-1.5 text-xs text-slate-300 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-5 bg-slate-800 border border-slate-700 rounded-xl p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <div className="text-xs font-semibold text-sky-400">Latest Offers & Announcements</div>
              <h3 className="mt-2 font-display text-xl font-bold">
                Current Promotions & Academic Batches
              </h3>
              <ul className="mt-5 space-y-4 text-sm text-slate-200">
                <li className="pb-4 border-b border-slate-700 flex items-start gap-3">
                  <Award className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold">New Skills Academy Admissions Open</div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      Enroll in Web Development, Graphic Design, or AI Mastery with live mentorship.
                    </div>
                  </div>
                </li>
                <li className="pb-4 border-b border-slate-700 flex items-start gap-3">
                  <Truck className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold">Free Delivery Over PKR 5,000</div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      Flat PKR 250 nationwide shipping under PKR 5,000 with Cash on Delivery.
                    </div>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <GraduationCap className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold">Free Home & Online Tuition Consultation</div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      Book a free assessment for Class 5 to ADP students in Bahawalpur & online.
                    </div>
                  </div>
                </li>
              </ul>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/tuition"
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors"
              >
                Book Free Consultation
              </Link>
              <Link
                to="/govt-exams"
                className="px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold rounded-lg transition-colors"
              >
                Govt Exam Prep
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Customer Reviews & Testimonials */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900">
              Verified Customer & Student Reviews
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Genuine feedback submitted by students and shoppers and approved by Digital E-Commerce by ASIF.
            </p>
          </div>
          <Link to="/courses" className="text-sm font-semibold text-blue-700 hover:underline whitespace-nowrap">
            Explore Courses & Leave Feedback →
          </Link>
        </div>

        {approvedReviews.length === 0 ? (
          <div className="mt-8 bg-white border border-slate-200 rounded-xl p-8 text-center space-y-3">
            <p className="text-sm font-medium text-slate-700">
              Verified customer and student testimonials will appear here once submitted and approved in the Admin Dashboard.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link
                to="/electronics"
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg"
              >
                Browse Products & Review
              </Link>
              <a
                href={buildWhatsAppUrl(siteSettings.whatsappNumber, WHATSAPP_TEMPLATES.generalContact())}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg inline-flex items-center gap-1.5"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>WhatsApp Support ({whatsappDisplay})</span>
              </a>
            </div>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            {approvedReviews.slice(0, 3).map((rev) => (
              <article key={rev.id} className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-0.5 text-amber-500">
                    {Array.from({ length: rev.rating }).map((_, idx) => (
                      <Star key={idx} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <span>{rev.verifiedPurchase ? 'Verified Purchase' : 'Verified Review'}</span>
                </div>
                <p className="mt-4 text-sm text-slate-700 leading-relaxed flex-1">
                  &ldquo;{rev.comment}&rdquo;
                </p>
                <div className="mt-5 pt-4 border-t border-slate-100">
                  <div className="text-sm font-semibold text-slate-900">{rev.authorName}</div>
                  <div className="text-xs text-slate-500">{rev.targetName}</div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* SEO Frequently Asked Questions Accordion */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-14">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
            <div>
              <h2 className="font-display text-2xl font-bold text-slate-900">
                Frequently Asked Questions
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Quick answers on WhatsApp ordering ({whatsappDisplay}), Cash on Delivery, promo codes, and tuition batches.
              </p>
            </div>
            <a
              href={buildWhatsAppUrl(siteSettings.whatsappNumber, WHATSAPP_TEMPLATES.generalContact())}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-semibold text-emerald-700 hover:underline inline-flex items-center gap-1.5"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Ask Directly on WhatsApp ({whatsappDisplay})</span>
            </a>
          </div>
          <div className="divide-y divide-slate-200">
            {HOME_FAQS.map((item, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div key={item.q} className="py-3.5">
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full flex items-center justify-between text-left gap-4 text-sm font-semibold text-slate-900"
                  >
                    <span>{item.q}</span>
                    <ChevronDown className={`w-4 h-4 text-slate-500 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isOpen && (
                    <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {item.a}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Newsletter & Social Follow */}
      <section className="bg-white border-t border-slate-200 py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-6">
            <h2 className="font-display text-2xl font-bold text-slate-900">
              Stay Updated on New Courses, Tests & Product Deals
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Subscribe for batch announcements, exam preparation notes, and seasonal store discounts.
            </p>
          </div>
          <div className="lg:col-span-6">
            <form onSubmit={(e) => void handleNewsletter(e)} className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                required
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                placeholder="Enter your email address"
                className="flex-1 px-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-700"
              />
              <button
                type="submit"
                disabled={submittingNews}
                className="px-6 py-3 bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold rounded-lg transition-colors whitespace-nowrap disabled:opacity-60"
              >
                {submittingNews ? 'Subscribing...' : 'Subscribe'}
              </button>
            </form>
            {newsletterFeedback && (
              <p
                className={`mt-2.5 text-xs font-medium ${
                  newsletterFeedback.tone === 'success' ? 'text-emerald-700' : 'text-red-600'
                }`}
              >
                {newsletterFeedback.text}
              </p>
            )}
            <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-slate-500">
              <span>Follow us:</span>
              <a href={siteSettings.facebookUrl || '#facebook'} className="hover:text-blue-700">Facebook</a>
              <a href={siteSettings.instagramUrl || '#instagram'} className="hover:text-blue-700">Instagram</a>
              <a href={siteSettings.tiktokUrl || '#tiktok'} className="hover:text-blue-700">TikTok</a>
              <a href={siteSettings.youtubeUrl || '#youtube'} className="hover:text-blue-700">YouTube</a>
              <a href={siteSettings.linkedinUrl || '#linkedin'} className="hover:text-blue-700">LinkedIn</a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
