import React, { useState } from 'react';
import { AlertTriangle, BookOpen, FileText, MessageCircle } from 'lucide-react';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { McqPracticeEngine } from '../components/McqPracticeEngine';
import { SeoHead } from '../components/SeoHead';
import { useApp } from '../context/AppContext';
import { GOVT_EXAM_DEPARTMENTS } from '../data/seedCatalog';
import { buildWhatsAppUrl, formatWhatsAppDisplay, WHATSAPP_TEMPLATES } from '../lib/whatsapp';

export function GovtExamsPage() {
  const { siteSettings, categorySeoMap } = useApp();
  const customSeo = categorySeoMap['govt-exams'];
  const [selectedDeptIndex, setSelectedDeptIndex] = useState(0);
  const whatsappDisplay = formatWhatsAppDisplay(siteSettings.whatsappNumber);

  const activeDept = GOVT_EXAM_DEPARTMENTS[selectedDeptIndex];

  const downloadSyllabusOutline = (groupTitle: string, exams: string[], topics: string[]) => {
    const content = [
      `DIGITAL E-COMMERCE BY ASIF - GOVERNMENT EXAM STUDY OUTLINE`,
      `Category: ${groupTitle}`,
      `Included Tests: ${exams.join(', ')}`,
      ``,
      `Core Preparation Topics:`,
      ...topics.map((t, i) => `${i + 1}. ${t}`),
      ``,
      `Notice: Always verify official eligibility criteria, age limits, and syllabus updates from the relevant recruitment authority (PPSC, FPSC, NTS, FIA, Police, etc.).`,
    ].join('\n');

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${groupTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-notes.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-10">
      <SeoHead
        title={customSeo?.seoTitle?.trim() || 'PPSC, FPSC, NTS, Police, FIA & CSS Exam Prep | Free MCQs — Digital E-Commerce by ASIF'}
        description={customSeo?.seoDescription?.trim() || 'Structured syllabus guides, downloadable study notes, and free timed MCQ mock tests for PPSC, FPSC, NTS, Police, FIA, ASF, and Educators exams.'}
        keywords={customSeo?.seoKeywords?.trim() || 'PPSC MCQs, FPSC preparation, NTS past papers, Punjab Police written test, FIA preparation Bahawalpur'}
        image={customSeo?.ogImageUrl?.trim() || undefined}
      />
      <div>
        <Breadcrumbs items={[{ label: 'Government Jobs & Competitive Exams Preparation' }]} />
        <div className="mt-4 bg-slate-950 text-white rounded-2xl p-8 sm:p-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="text-xs font-semibold text-sky-400">Category Three · Competitive Exams</div>
            <h1 className="mt-2 font-display text-3xl sm:text-4xl font-bold">
              Government Jobs & Competitive Exams Preparation
            </h1>
            <p className="mt-3 text-base text-slate-300">
              Structured syllabus preparation, study notes, past-paper practice MCQs, and timed mock evaluations for federal and provincial recruitment tests across Pakistan.
            </p>
          </div>
          <a
            href={buildWhatsAppUrl(
              siteSettings.whatsappNumber,
              WHATSAPP_TEMPLATES.courseInquiry('Government Exam Preparation Program'),
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg inline-flex items-center gap-2 whitespace-nowrap shrink-0"
          >
            <MessageCircle className="w-4 h-4" />
            <span>WhatsApp Counselor ({whatsappDisplay})</span>
          </a>
        </div>
      </div>

      {/* Official Eligibility Verification Notice */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 sm:p-5 flex items-start gap-3 text-amber-950">
        <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div className="text-xs sm:text-sm leading-relaxed">
          <strong>Important Verification Notice:</strong> Official eligibility rules, age relaxations, domicile quotas, fee challans, and exam dates change per advertisement and{' '}
          <strong>must always be verified directly from the relevant official recruitment authority</strong>{' '}
          (such as PPSC, FPSC, NTS, OTS, FIA, ASF, Provincial Police, WAPDA, FBR, or NADRA).
        </div>
      </div>

      {/* Department Tabs */}
      <section className="space-y-6">
        <div className="flex flex-wrap gap-2 bg-slate-100 p-1.5 rounded-xl">
          {GOVT_EXAM_DEPARTMENTS.map((dept, idx) => (
            <button
              key={dept.group}
              type="button"
              onClick={() => setSelectedDeptIndex(idx)}
              className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-colors whitespace-nowrap ${
                selectedDeptIndex === idx
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {dept.group}
            </button>
          ))}
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 space-y-5">
            <h2 className="font-display text-2xl font-bold text-slate-900">{activeDept.group}</h2>
            <p className="text-sm text-slate-700 leading-relaxed">{activeDept.overview}</p>

            <div>
              <div className="text-xs font-semibold text-slate-500 mb-2">Covered Examinations & Posts</div>
              <div className="text-sm font-medium text-slate-900 leading-relaxed">
                {activeDept.exams.join(' · ')}
              </div>
            </div>

            <div>
              <div className="text-xs font-semibold text-slate-500 mb-2">Important Preparation Topics</div>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-slate-700">
                {activeDept.topics.map((topic) => (
                  <li key={topic} className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-blue-700 shrink-0" />
                    <span>{topic}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="lg:col-span-5 bg-slate-50 border border-slate-200 rounded-xl p-6 space-y-4">
            <h3 className="font-display text-base font-bold text-slate-900">
              Preparation Resources & Study Notes
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Access previous paper topic outlines, downloadable revision checklists, and live mock exams below.
            </p>
            <button
              type="button"
              onClick={() =>
                downloadSyllabusOutline(activeDept.group, activeDept.exams, activeDept.topics)
              }
              className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg inline-flex items-center justify-center gap-2"
            >
              <FileText className="w-4 h-4" />
              <span>Download Study Notes Outline (.txt)</span>
            </button>
            <a
              href={buildWhatsAppUrl(
                siteSettings.whatsappNumber,
                WHATSAPP_TEMPLATES.courseInquiry(`${activeDept.group} Exam Preparation`),
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg inline-flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Join Prep Batch on WhatsApp</span>
            </a>
          </div>
        </div>
      </section>

      {/* Interactive Govt Exam MCQ Practice */}
      <McqPracticeEngine
        examGroup="govt"
        title="Government Jobs Practice MCQs & Mock Test"
      />
    </div>
  );
}
