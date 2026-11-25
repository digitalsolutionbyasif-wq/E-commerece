import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CheckCircle2, MessageCircle, Star, UserCheck } from 'lucide-react';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { SeoHead } from '../components/SeoHead';
import { useApp } from '../context/AppContext';
import { formatPkr } from '../data/seedCatalog';
import { buildWhatsAppUrl, formatWhatsAppDisplay, WHATSAPP_TEMPLATES } from '../lib/whatsapp';

export function CourseDetailPage() {
  const { id } = useParams();
  const { courses, approvedReviews, siteSettings, submitEnrollment, submitReview, user } = useApp();

  const course = courses.find((c) => c.id === id);

  const [studentName, setStudentName] = useState(user?.displayName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [whatsapp, setWhatsapp] = useState('');
  const [educationLevel, setEducationLevel] = useState('Intermediate / Bachelor');
  const [learningMode, setLearningMode] = useState<'Live Online' | 'Self-Paced Recorded' | 'Hybrid Mentorship'>('Live Online');
  const [submitting, setSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  if (!course) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h1 className="font-display text-2xl font-bold text-slate-900">Course Not Found</h1>
        <Link to="/courses" className="mt-4 inline-block text-sm font-semibold text-blue-700 hover:underline">
          ← Back to Online Skills Academy
        </Link>
      </div>
    );
  }

  const courseReviews = approvedReviews.filter((r) => r.targetId === course.id);
  const whatsappDisplay = formatWhatsAppDisplay(siteSettings.whatsappNumber);

  const handleEnroll = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await submitEnrollment({
        studentName,
        email,
        whatsapp,
        courseId: course.id,
        courseTitle: course.title,
        educationLevel,
        learningMode,
      });
      setConfirmed(true);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewComment.trim()) return;
    await submitReview({
      targetType: 'course',
      targetId: course.id,
      targetName: course.title,
      authorName: user?.displayName || 'Verified Student',
      rating: reviewRating,
      comment: reviewComment,
    });
    setReviewComment('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-10">
      <SeoHead
        title={course.seoTitle?.trim() || `${course.title} | Online Course — Digital E-Commerce by ASIF`}
        description={course.seoDescription?.trim() || course.overview}
        keywords={`${course.title}, ${course.track}, online course Pakistan, Bahawalpur IT training, Digital E-Commerce by ASIF`}
        image={course.ogImageUrl?.trim() || course.imageUrl}
        jsonLd={[
          {
            '@type': 'Course',
            name: course.title,
            description: course.overview,
            provider: {
              '@type': 'Organization',
              name: 'Digital E-Commerce by ASIF',
            },
            offers: {
              '@type': 'Offer',
              priceCurrency: 'PKR',
              price: course.feePkr,
            },
          },
          {
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: `${window.location.origin}/` },
              { '@type': 'ListItem', position: 2, name: 'Online Courses', item: `${window.location.origin}/courses` },
              { '@type': 'ListItem', position: 3, name: course.title },
            ],
          },
        ]}
      />
      <Breadcrumbs
        items={[
          { label: 'Online Courses', to: '/courses' },
          { label: course.title },
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Main Content */}
        <div className="lg:col-span-7 space-y-8">
          <div className="aspect-[16/9] rounded-2xl overflow-hidden border border-slate-200 bg-slate-900">
            <img
              src={course.imageUrl}
              alt={course.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>

          <div>
            <div className="text-xs text-slate-500 flex items-center gap-2 flex-wrap">
              <span>{course.track}</span>
              <span aria-hidden="true">·</span>
              <span>{course.level}</span>
              <span aria-hidden="true">·</span>
              <span>{course.duration}</span>
            </div>
            <h1 className="mt-2 font-display text-2xl sm:text-3xl font-bold text-slate-900">
              {course.title}
            </h1>
            <p className="mt-3 text-base text-slate-700 leading-relaxed">{course.overview}</p>
          </div>

          <section className="bg-white border border-slate-200 rounded-xl p-6">
            <h2 className="font-display text-lg font-bold text-slate-900">Learning Outcomes</h2>
            <ul className="mt-4 space-y-2.5 text-sm text-slate-700">
              {course.outcomes.map((out) => (
                <li key={out} className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
                  <span>{out}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="bg-white border border-slate-200 rounded-xl p-6">
            <h2 className="font-display text-lg font-bold text-slate-900">Course Curriculum</h2>
            <ol className="mt-4 space-y-3 text-sm text-slate-800">
              {course.curriculum.map((mod, idx) => (
                <li key={mod} className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex gap-3">
                  <span className="font-mono-tabular text-xs font-semibold text-blue-700 mt-0.5">
                    {String(idx + 1).padStart(2, '0')}.
                  </span>
                  <span>{mod}</span>
                </li>
              ))}
            </ol>
          </section>

          <section className="bg-white border border-slate-200 rounded-xl p-6">
            <h2 className="font-display text-lg font-bold text-slate-900">Instructor</h2>
            <div className="mt-3 flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-slate-100 text-blue-700 flex items-center justify-center shrink-0">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-900">{course.instructorName}</div>
                <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                  {course.instructorBio || 'Senior instructor at Digital E-Commerce by ASIF.'}
                </p>
              </div>
            </div>
          </section>

          {/* Student Reviews */}
          <section className="bg-white border border-slate-200 rounded-xl p-6 space-y-5">
            <h2 className="font-display text-lg font-bold text-slate-900">Student Reviews</h2>
            {courseReviews.length === 0 ? (
              <p className="text-sm text-slate-500">
                No approved reviews for this course yet. Submit a review below after enrolling.
              </p>
            ) : (
              <div className="space-y-3">
                {courseReviews.map((r) => (
                  <div key={r.id} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span className="font-semibold text-slate-900">{r.authorName}</span>
                      <span className="inline-flex items-center gap-1 text-amber-600 font-semibold">
                        <Star className="w-3.5 h-3.5 fill-amber-400" /> {r.rating}/5
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-slate-700">{r.comment}</p>
                  </div>
                ))}
              </div>
            )}

            <form onSubmit={(e) => void handleReviewSubmit(e)} className="pt-4 border-t border-slate-200 space-y-3">
              <div className="text-xs font-semibold text-slate-800">Write a Student Review (Moderated)</div>
              <div className="flex items-center gap-2">
                <label className="text-xs text-slate-600">Rating:</label>
                <select
                  value={reviewRating}
                  onChange={(e) => setReviewRating(Number(e.target.value))}
                  className="px-2.5 py-1 text-xs border border-slate-200 rounded-md bg-slate-50"
                >
                  {[5, 4, 3, 2, 1].map((n) => (
                    <option key={n} value={n}>{n} Stars</option>
                  ))}
                </select>
              </div>
              <textarea
                rows={2}
                required
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="Share your learning experience..."
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg"
              >
                Submit Review
              </button>
            </form>
          </section>
        </div>

        {/* Right Sticky Enrollment Module */}
        <aside className="lg:col-span-5 lg:sticky lg:top-24 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5">
          <div className="flex items-baseline justify-between pb-4 border-b border-slate-200">
            <div>
              <div className="text-xs text-slate-500">Course Fee</div>
              <div className="text-2xl font-display font-bold text-slate-900 tabular-nums">
                {formatPkr(course.feePkr)}
              </div>
            </div>
            <div className="text-right text-xs text-slate-600">
              <div>{course.duration}</div>
              <div>{course.level}</div>
            </div>
          </div>

          {confirmed ? (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-950 space-y-2">
              <div className="font-bold">Enrollment Registered!</div>
              <p className="text-xs leading-relaxed">
                Your registration for <strong>{course.title}</strong> is saved. Check your Account Dashboard for live status or message us on WhatsApp.
              </p>
            </div>
          ) : (
            <form onSubmit={(e) => void handleEnroll(e)} className="space-y-3.5">
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
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                <label className="block text-xs font-semibold text-slate-700 mb-1">Education Level</label>
                <input
                  type="text"
                  required
                  value={educationLevel}
                  onChange={(e) => setEducationLevel(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Preferred Learning Mode</label>
                <select
                  value={learningMode}
                  onChange={(e) =>
                    setLearningMode(e.target.value as 'Live Online' | 'Self-Paced Recorded' | 'Hybrid Mentorship')
                  }
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg"
                >
                  <option value="Live Online">Live Online</option>
                  <option value="Self-Paced Recorded">Self-Paced Recorded</option>
                  <option value="Hybrid Mentorship">Hybrid Mentorship</option>
                </select>
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold rounded-lg transition-colors"
              >
                {submitting ? 'Confirming...' : 'Enroll Now'}
              </button>
            </form>
          )}

          <a
            href={buildWhatsAppUrl(
              siteSettings.whatsappNumber,
              WHATSAPP_TEMPLATES.courseInquiry(course.title, course.feePkr, learningMode),
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Enroll via WhatsApp ({whatsappDisplay})</span>
          </a>
        </aside>
      </div>
    </div>
  );
}
