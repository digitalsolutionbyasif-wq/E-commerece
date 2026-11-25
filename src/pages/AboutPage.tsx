import React from 'react';
import { Link } from 'react-router-dom';
import { Award, BookOpen, CheckCircle2, Compass, HeartHandshake, MapPin } from 'lucide-react';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { SeoHead } from '../components/SeoHead';

export function AboutPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-12">
      <SeoHead
        title="About Us | Digital E-Commerce by ASIF — Bahawalpur, Pakistan"
        description="Learn about Digital E-Commerce by ASIF in Bahawalpur, Punjab, Pakistan: online IT skills academy, home & online tuition, exam prep, and nationwide Cash on Delivery store."
        keywords="About Digital E-Commerce by ASIF, Asif Mehmood Bahawalpur, online marketplace and academy Pakistan"
      />
      <Breadcrumbs items={[{ label: 'About Us' }]} />

      <section className="bg-slate-950 text-white rounded-2xl p-8 sm:p-12">
        <div className="text-xs font-semibold text-sky-400">Bahawalpur, Punjab, Pakistan</div>
        <h1 className="mt-2 font-display text-3xl sm:text-4xl font-bold max-w-3xl">
          About Digital E-Commerce by ASIF
        </h1>
        <p className="mt-4 text-base text-slate-300 leading-relaxed max-w-3xl">
          Digital E-Commerce by ASIF is a multi-service digital platform dedicated to providing professional skills development programs, educational support, exam preparation resources, and quality lifestyle products. Our mission is to make learning, shopping, and digital opportunities accessible through one convenient platform.
        </p>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8">
          <div className="w-10 h-10 rounded-lg bg-slate-100 text-blue-700 flex items-center justify-center">
            <Compass className="w-5 h-5" />
          </div>
          <h2 className="mt-4 font-display text-xl font-bold text-slate-900">Our Mission</h2>
          <p className="mt-2 text-sm text-slate-600 leading-relaxed">
            Empower students, job seekers, and households across Bahawalpur and Pakistan with career-relevant digital training, structured academic mentoring, and dependable everyday shopping under one roof.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8">
          <div className="w-10 h-10 rounded-lg bg-slate-100 text-blue-700 flex items-center justify-center">
            <Award className="w-5 h-5" />
          </div>
          <h2 className="mt-4 font-display text-xl font-bold text-slate-900">Our Vision</h2>
          <p className="mt-2 text-sm text-slate-600 leading-relaxed">
            Become Southern Punjab&apos;s most trusted digital learning and e-commerce ecosystem—bridging modern freelancing skills, competitive exam readiness, and transparent nationwide commerce.
          </p>
        </div>
      </section>

      <section className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6">
        <h2 className="font-display text-2xl font-bold text-slate-900">Our Services & Commitment</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            {
              icon: BookOpen,
              title: 'Skills & Exam Readiness',
              text: 'Practical courses in coding, graphic design, digital marketing, AI, plus govt job and university entry MCQ practice.',
            },
            {
              icon: HeartHandshake,
              title: 'Commitment to Customers',
              text: 'Clear PKR pricing, honest product specifications, moderated genuine reviews, and responsive WhatsApp support.',
            },
            {
              icon: MapPin,
              title: 'Rooted in Bahawalpur',
              text: 'Serving local home tuition families in Bahawalpur alongside online learners and e-commerce shoppers nationwide.',
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="p-5 bg-slate-50 border border-slate-200 rounded-xl">
                <Icon className="w-5 h-5 text-blue-700" />
                <h3 className="mt-3 font-display text-base font-bold text-slate-900">{item.title}</h3>
                <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">{item.text}</p>
              </div>
            );
          })}
        </div>

        <div className="pt-4 border-t border-slate-200 flex flex-wrap gap-3">
          {[
            'Professional Learning Opportunities',
            'Affordable Prices',
            'Quality Products',
            'Student Support',
            'Easy WhatsApp Communication',
            'Convenient Online Shopping',
          ].map((val) => (
            <span key={val} className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-700 mr-4">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              {val}
            </span>
          ))}
        </div>

        <div className="pt-2 flex flex-wrap gap-3">
          <Link to="/courses" className="px-5 py-2.5 bg-blue-700 text-white text-xs font-semibold rounded-lg">
            Explore Courses
          </Link>
          <Link to="/contact" className="px-5 py-2.5 bg-slate-900 text-white text-xs font-semibold rounded-lg">
            Contact Us
          </Link>
        </div>
      </section>
    </div>
  );
}
