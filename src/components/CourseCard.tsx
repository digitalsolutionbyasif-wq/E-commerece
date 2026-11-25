import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen } from 'lucide-react';
import { formatPkr } from '../data/seedCatalog';
import type { Course } from '../types';

export function CourseCard({ course }: { course: Course }) {
  const [imgError, setImgError] = useState(false);

  return (
    <article className="group bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md">
      <div className="aspect-[4/3] bg-slate-900 overflow-hidden">
        <Link to={`/courses/${course.id}`} className="block w-full h-full">
          {!imgError ? (
            <img
              src={course.imageUrl}
              alt={course.title}
              referrerPolicy="no-referrer"
              onError={() => setImgError(true)}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-gradient-to-br from-slate-800 to-slate-950 text-slate-200 text-center">
              <BookOpen className="w-8 h-8 mb-2 text-sky-400" />
              <span className="text-xs font-medium">{course.title}</span>
            </div>
          )}
        </Link>
      </div>

      <div className="p-5 flex-1 flex flex-col">
        <div className="text-xs text-slate-500 flex items-center gap-1.5 flex-wrap">
          <span>{course.track}</span>
          <span aria-hidden="true">·</span>
          <span>{course.level}</span>
          <span aria-hidden="true">·</span>
          <span>{course.duration}</span>
        </div>

        <Link
          to={`/courses/${course.id}`}
          className="mt-1.5 font-display text-base font-semibold text-slate-900 hover:text-blue-700 transition-colors line-clamp-2"
        >
          {course.title}
        </Link>

        <p className="mt-2 text-sm text-slate-600 line-clamp-2 leading-relaxed">
          {course.overview}
        </p>

        <div className="mt-auto pt-4 flex items-center justify-between gap-3 border-t border-slate-100">
          <div>
            <div className="text-xs text-slate-500">Course Fee</div>
            <div className="text-base font-bold text-slate-900 tabular-nums">
              {formatPkr(course.feePkr)}
            </div>
          </div>
          <Link
            to={`/courses/${course.id}`}
            className="px-4 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors whitespace-nowrap shrink-0"
          >
            Enroll Now
          </Link>
        </div>
      </div>
    </article>
  );
}
