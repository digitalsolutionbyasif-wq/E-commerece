import React from 'react';
import { ClipboardCheck, Download, MessageCircle } from 'lucide-react';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { McqPracticeEngine } from '../components/McqPracticeEngine';
import { SeoHead } from '../components/SeoHead';
import { useApp } from '../context/AppContext';
import { ABILITY_TEST_PROGRAMS } from '../data/seedCatalog';
import { buildWhatsAppUrl, formatWhatsAppDisplay, WHATSAPP_TEMPLATES } from '../lib/whatsapp';

export function AbilityTestsPage() {
  const { siteSettings, categorySeoMap, myTestAttempts, user } = useApp();
  const customSeo = categorySeoMap['ability-tests'];
  const whatsappDisplay = formatWhatsAppDisplay(siteSettings.whatsappNumber);

  const downloadNotes = (title: string, subjects: string[]) => {
    const content = [
      `DIGITAL E-COMMERCE BY ASIF - ABILITY & ADMISSION TEST GUIDE`,
      `Program: ${title}`,
      `Subjects Covered: ${subjects.join(', ')}`,
      ``,
      `Recommended Preparation Routine:`,
      `1. Practice Quantitative & Analytical reasoning daily for 45 minutes.`,
      `2. Review Verbal analogies, reading comprehension, and grammar rules.`,
      `3. Complete timed mock exams in the portal to monitor speed and accuracy.`,
    ].join('\n');
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-10">
      <SeoHead
        title={customSeo?.seoTitle?.trim() || 'NAT, GAT, LAT, MDCAT & ECAT Entry Test Prep | Timed MCQs — Digital E-Commerce by ASIF'}
        description={customSeo?.seoDescription?.trim() || 'Free interactive MCQ mock portal and study notes for NTS NAT, GAT General & Subject, HEC LAT, MDCAT, ECAT, and university admissions across Pakistan.'}
        keywords={customSeo?.seoKeywords?.trim() || 'MDCAT mock test, ECAT practice MCQs, NTS NAT preparation, HEC LAT test, university admission prep Pakistan'}
        image={customSeo?.ogImageUrl?.trim() || undefined}
      />
      <div>
        <Breadcrumbs items={[{ label: 'Ability Tests & University Admission Preparation' }]} />
        <div className="mt-4 bg-slate-950 text-white rounded-2xl p-8 sm:p-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="text-xs font-semibold text-sky-400">Category Four · Aptitude & Entry Tests</div>
            <h1 className="mt-2 font-display text-3xl sm:text-4xl font-bold">
              Ability Tests & University Admission Preparation
            </h1>
            <p className="mt-3 text-base text-slate-300">
              Prepare for NTS, NAT, GAT General & Subject, LAT, HAT, MDCAT, ECAT, and university entry tests with timed mock examinations, instant scoring, and progress tracking.
            </p>
          </div>
          <a
            href={buildWhatsAppUrl(
              siteSettings.whatsappNumber,
              WHATSAPP_TEMPLATES.courseInquiry('University Admission / Aptitude Test Prep'),
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg inline-flex items-center gap-2 whitespace-nowrap shrink-0"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Inquire on WhatsApp ({whatsappDisplay})</span>
          </a>
        </div>
      </div>

      {/* Program Cards */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {ABILITY_TEST_PROGRAMS.map((prog) => (
          <article key={prog.title} className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2.5">
                <ClipboardCheck className="w-5 h-5 text-blue-700 shrink-0" />
                <h2 className="font-display text-lg font-bold text-slate-900">{prog.title}</h2>
              </div>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">{prog.summary}</p>
              <div className="mt-3 text-xs text-slate-500">
                Subjects: {prog.subjects.join(' · ')}
              </div>
            </div>
            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => downloadNotes(prog.title, prog.subjects)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-blue-700"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Notes Outline</span>
              </button>
              <a href="#mcq-portal" className="text-xs font-semibold text-blue-700 hover:underline">
                Start Mock Exam ↓
              </a>
            </div>
          </article>
        ))}
      </section>

      {/* Interactive MCQ Test System */}
      <div id="mcq-portal">
        <McqPracticeEngine
          examGroup="ability"
          title="Ability & Entry Test Interactive MCQ System"
        />
      </div>

      {/* Student Progress Tracking */}
      {user && myTestAttempts.length > 0 && (
        <section className="bg-white border border-slate-200 rounded-xl p-6">
          <h2 className="font-display text-lg font-bold text-slate-900">Your Recent Mock Test Progress</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 text-xs text-slate-500">
                <tr>
                  <th className="py-2 pr-4">Test</th>
                  <th className="py-2 pr-4">Category</th>
                  <th className="py-2 pr-4">Score</th>
                  <th className="py-2">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {myTestAttempts.slice(0, 8).map((att) => (
                  <tr key={att.id}>
                    <td className="py-2.5 pr-4 font-medium text-slate-900">{att.testTitle}</td>
                    <td className="py-2.5 pr-4 text-slate-600">{att.examCategory}</td>
                    <td className="py-2.5 pr-4 font-mono-tabular font-semibold text-blue-700">
                      {att.correctCount}/{att.totalQuestions} ({att.scorePercent}%)
                    </td>
                    <td className="py-2.5 font-mono-tabular text-slate-600">{att.durationSeconds}s</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
