import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  to?: string;
}

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center flex-wrap gap-1.5 text-xs text-slate-500">
      <Link to="/" className="hover:text-blue-700 transition-colors">
        Home
      </Link>
      {items.map((item, idx) => (
        <React.Fragment key={`${item.label}-${idx}`}>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          {item.to ? (
            <Link to={item.to} className="hover:text-blue-700 transition-colors">
              {item.label}
            </Link>
          ) : (
            <span className="text-slate-900 font-medium">{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}
