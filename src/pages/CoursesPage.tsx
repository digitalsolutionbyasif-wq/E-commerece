import React, { useMemo, useState } from 'react';
import { MessageCircle, Search } from 'lucide-react';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { CourseCard } from '../components/CourseCard';
import { SeoHead } from '../components/SeoHead';
import { useApp } from '../context/AppContext';
import { COURSE_TRACKS } from '../data/seedCatalog';
import { buildWhatsAppUrl, formatWhatsAppDisplay, WHATSAPP_TEMPLATES } from '../lib/whatsapp';

export function CoursesPage() {
  const { courses, siteSettings, categorySeoMap, submitEnrollment, user } = useApp();
  const customSeo = categorySeoMap.courses;
  const whatsappDisplay = formatWhatsAppDisplay(siteSettings.whatsappNumber);
  const [selectedTrack, setSelectedTrack] = useState('All Tracks');
  const [selectedLevel, setSelectedLevel] = useState('All Levels');
  const [searchTerm, setSearchTerm] = useState('');

  // Quick Enrollment Form state
  const [studentName, setStudentName] = useState(user?.displayName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [whatsapp, setWhatsapp] = useState('');
  const [courseId, setCourseId] = useState(courses[0]?.id || '');
  const [educationLevel, setEducationLevel] = useState('Intermediate / Bachelor');
  const [learningMode, setLearningMode] = useState<'Live Online' | 'Self-Paced Recorded' | 'Hybrid Mentorship'>('Live Online');
  const [submitting, setSubmitting] = useState(false);
  const [enrolledSuccess, setEnrolledSuccess] = useState('');

  const filteredCourses = useMemo(() => {
    return courses.filter((c) => {
      const trackMatch = selectedTrack === 'All Tracks' || c.track === selectedTrack;
      const levelMatch = selectedLevel === 'All Levels' || c.level === selectedLevel;
      const q = searchTerm.trim().toLowerCase();
      const queryMatch =
        !q ||
        c.title.toLowerCase().includes(q) ||
        c.track.toLowerCase().includes(q) ||
        c.overview.toLowerCase().includes(q);
      return trackMatch && levelMatch && queryMatch;
    });
  }, [courses, selectedTrack, selectedLevel, searchTerm]);

  const handleEnroll = async (e: React.FormEvent) => {
    e.preventDefault();
    const chosen = courses.find((c) => c.id === courseId) || courses[0];
    if (!chosen) return;
    setSubmitting(true);
    try {
      await submitEnrollment({
        studentName,
        email,
        whatsapp,
        courseId: chosen.id,
        courseTitle: chosen.title,
        educationLevel,
        learningMode,
      });
      setEnrolledSuccess(`Enrollment confirmed for ${chosen.title}.`);
      setWhatsapp('');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-12">
      <SeoHead
        title={customSeo?.seoTitle?.trim() || 'Online Skills Development Academy | IT, Freelancing & AI Courses — Digital E-Commerce by ASIF'}
        description={customSeo?.seoDescription?.trim() || 'Learn practical career-oriented digital skills in Web Development, Python, Graphic Design, SEO, Meta Ads, and AI Mastery in Bahawalpur and online across Pakistan.'}
        keywords={customSeo?.seoKeywords?.trim() || 'online courses Pakistan, Web Development Bahawalpur, SEO training Pakistan, Graphic Design course, AI Mastery course, WhatsApp 0300-6316551'}
        image={customSeo?.ogImageUrl?.trim() || undefined}
        jsonLd={{
          '@type': 'CollectionPage',
          name: 'Online Skills Development Academy',
          description: 'Career-oriented digital skills and IT courses in Pakistan.',
        }}
      />
      <div>
        <Breadcrumbs items={[{ label: 'Online Skills Development Academy' }]} />
        <div className="mt-4 bg-slate-950 text-white rounded-2xl p-8 sm:p-10">
          <div className="text-xs font-semibold text-sky-400">Category One · Skills Academy</div>
          <h1 className="mt-2 font-display text-3xl sm:text-4xl font-bold">
            Online Skills Development Academy
          </h1>
          <p className="mt-3 text-base text-slate-300 max-w-2xl">
            Learn Practical, Career-Oriented Digital Skills and Build Your Professional Future.
          </p>
        </div>
      </div>

      {/* All 6 Curriculum Tracks & Topics */}
      <section>
        <h2 className="font-display text-xl font-bold text-slate-900">
          6 Specialized Skill Tracks & Subjects
        </h2>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {COURSE_TRACKS.map((track) => (
            <div
              key={track.track}
              className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between"
            >
              <div>
                <h3 className="font-display text-base font-bold text-slate-900">{track.track}</h3>
                <p className="mt-1 text-xs text-slate-600 leading-relaxed">{track.summary}</p>
                <div className="mt-3 text-xs text-slate-700 leading-relaxed">
                  {track.topics.join(' · ')}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTrack(track.track)}
                className="mt-4 text-left text-xs font-semibold text-blue-700 hover:underline"
              >
                Filter courses in {track.track} →
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Filter & Course Grid */}
      <section className="space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-wrap gap-1.5 bg-slate-100 p-1 rounded-lg">
            {['All Tracks', ...COURSE_TRACKS.map((t) => t.track)].map((track) => (
              <button
                key={track}
                type="button"
                onClick={() => setSelectedTrack(track)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                  selectedTrack === track
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {track}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search courses..."
                className="pl-9 pr-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-700"
              />
            </div>
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-700"
            >
              <option value="All Levels">All Levels</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      </section>

      {/* Course Enrollment Form */}
      <section className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-5">
          <h2 className="font-display text-2xl font-bold text-slate-900">
            Student Course Enrollment Form
          </h2>
          <p className="mt-2 text-sm text-slate-600 leading-relaxed">
            Register directly for any program above. Once submitted, your enrollment status appears in your account dashboard and our coordinator contacts you via WhatsApp.
          </p>
          <a
            href={buildWhatsAppUrl(
              siteSettings.whatsappNumber,
              WHATSAPP_TEMPLATES.courseInquiry('Online Skills Development Program'),
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Inquire on WhatsApp ({whatsappDisplay})</span>
          </a>
        </div>

        <form onSubmit={(e) => void handleEnroll(e)} className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {enrolledSuccess && (
            <div className="sm:col-span-2 p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-medium rounded-lg">
              {enrolledSuccess}
            </div>
          )}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Student Name</label>
            <input
              type="text"
              required
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              placeholder="Full name"
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
              placeholder="you@example.com"
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
            <label className="block text-xs font-semibold text-slate-700 mb-1">Selected Course</label>
            <select
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg"
            >
              {courses.map((c) => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Education Level</label>
            <input
              type="text"
              required
              value={educationLevel}
              onChange={(e) => setEducationLevel(e.target.value)}
              placeholder="e.g. Matric / FSc / BS / Graduate"
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
          <div className="sm:col-span-2 pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-3 bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-60"
            >
              {submitting ? 'Submitting Enrollment...' : 'Submit Course Enrollment'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
