import React, { useEffect, useMemo, useState } from 'react';
import { Globe, Image as ImageIcon, RotateCcw, Search, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { DEFAULT_CATEGORY_SEO } from '../data/seedCatalog';
import type { CategorySeoSlug, Course, Product } from '../types';

const CATEGORY_SLUGS: CategorySeoSlug[] = [
  'electronics',
  'fashion',
  'kids-toys',
  'home-accessories',
  'courses',
  'tuition',
  'govt-exams',
  'ability-tests',
];

export function AdminSeoManager() {
  const {
    products,
    courses,
    categorySeoMap,
    upsertCategorySeo,
    upsertProduct,
    upsertCourse,
  } = useApp();

  const [scope, setScope] = useState<'categories' | 'products' | 'courses'>('categories');

  // Selected IDs
  const [selectedCategory, setSelectedCategory] = useState<CategorySeoSlug>('electronics');
  const [selectedProductId, setSelectedProductId] = useState<string>(products[0]?.id || '');
  const [selectedCourseId, setSelectedCourseId] = useState<string>(courses[0]?.id || '');
  const [itemSearch, setItemSearch] = useState('');

  // Active editor fields
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const [ogImageUrl, setOgImageUrl] = useState('');
  const [seoKeywords, setSeoKeywords] = useState('');
  const [saving, setSaving] = useState(false);

  const selectedProduct: Product | undefined = useMemo(
    () => products.find((p) => p.id === selectedProductId) || products[0],
    [products, selectedProductId],
  );
  const selectedCourse: Course | undefined = useMemo(
    () => courses.find((c) => c.id === selectedCourseId) || courses[0],
    [courses, selectedCourseId],
  );

  const filteredProducts = useMemo(() => {
    const q = itemSearch.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.subcategory.toLowerCase().includes(q),
    );
  }, [products, itemSearch]);

  const filteredCourses = useMemo(() => {
    const q = itemSearch.trim().toLowerCase();
    if (!q) return courses;
    return courses.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.track.toLowerCase().includes(q),
    );
  }, [courses, itemSearch]);

  // Populate editor fields when selection changes
  useEffect(() => {
    if (scope === 'categories') {
      const defaults = DEFAULT_CATEGORY_SEO[selectedCategory];
      const saved = categorySeoMap[selectedCategory];
      setSeoTitle(saved?.seoTitle || defaults.seoTitle);
      setSeoDescription(saved?.seoDescription || defaults.seoDescription);
      setOgImageUrl(saved?.ogImageUrl || defaults.ogImageUrl);
      setSeoKeywords(saved?.seoKeywords ?? defaults.seoKeywords);
    } else if (scope === 'products' && selectedProduct) {
      const activePrice =
        selectedProduct.discountPricePkr &&
        selectedProduct.discountPricePkr > 0 &&
        selectedProduct.discountPricePkr < selectedProduct.pricePkr
          ? selectedProduct.discountPricePkr
          : selectedProduct.pricePkr;
      setSeoTitle(
        selectedProduct.seoTitle ||
          `${selectedProduct.name} | PKR ${activePrice.toLocaleString('en-PK')} — Digital E-Commerce by ASIF`,
      );
      setSeoDescription(selectedProduct.seoDescription || selectedProduct.description);
      setOgImageUrl(selectedProduct.ogImageUrl || selectedProduct.imageUrl);
      setSeoKeywords('');
    } else if (scope === 'courses' && selectedCourse) {
      setSeoTitle(
        selectedCourse.seoTitle ||
          `${selectedCourse.title} | Online Course — Digital E-Commerce by ASIF`,
      );
      setSeoDescription(selectedCourse.seoDescription || selectedCourse.overview);
      setOgImageUrl(selectedCourse.ogImageUrl || selectedCourse.imageUrl);
      setSeoKeywords('');
    }
  }, [scope, selectedCategory, categorySeoMap, selectedProduct, selectedCourse]);

  const previewUrl = useMemo(() => {
    if (scope === 'categories') {
      return `${window.location.origin}${DEFAULT_CATEGORY_SEO[selectedCategory].path}`;
    }
    if (scope === 'products' && selectedProduct) {
      return `${window.location.origin}/product/${selectedProduct.id}`;
    }
    if (scope === 'courses' && selectedCourse) {
      return `${window.location.origin}/courses/${selectedCourse.id}`;
    }
    return window.location.origin;
  }, [scope, selectedCategory, selectedProduct, selectedCourse]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (scope === 'categories') {
        const defaults = DEFAULT_CATEGORY_SEO[selectedCategory];
        await upsertCategorySeo({
          slug: selectedCategory,
          seoTitle: seoTitle.trim() || defaults.seoTitle,
          seoDescription: seoDescription.trim() || defaults.seoDescription,
          ogImageUrl: ogImageUrl.trim() || defaults.ogImageUrl,
          seoKeywords: seoKeywords.trim(),
        });
      } else if (scope === 'products' && selectedProduct) {
        await upsertProduct({
          id: selectedProduct.id,
          name: selectedProduct.name,
          category: selectedProduct.category,
          subcategory: selectedProduct.subcategory,
          description: selectedProduct.description,
          pricePkr: selectedProduct.pricePkr,
          ...(typeof selectedProduct.discountPricePkr === 'number'
            ? { discountPricePkr: selectedProduct.discountPricePkr }
            : {}),
          stock: selectedProduct.stock,
          imageUrl: selectedProduct.imageUrl,
          variants: selectedProduct.variants || [],
          specs: selectedProduct.specs || [],
          ...(selectedProduct.brand ? { brand: selectedProduct.brand } : {}),
          ...(selectedProduct.gender ? { gender: selectedProduct.gender } : {}),
          ...(selectedProduct.ageGroup ? { ageGroup: selectedProduct.ageGroup } : {}),
          ...(selectedProduct.safetyNote ? { safetyNote: selectedProduct.safetyNote } : {}),
          ...(typeof selectedProduct.ratingAvg === 'number'
            ? { ratingAvg: selectedProduct.ratingAvg }
            : {}),
          ...(typeof selectedProduct.reviewCount === 'number'
            ? { reviewCount: selectedProduct.reviewCount }
            : {}),
          featured: Boolean(selectedProduct.featured),
          isDemo: false,
          seoTitle: seoTitle.trim().slice(0, 160),
          seoDescription: seoDescription.trim().slice(0, 320),
          ogImageUrl: ogImageUrl.trim().slice(0, 500),
        });
      } else if (scope === 'courses' && selectedCourse) {
        await upsertCourse({
          id: selectedCourse.id,
          title: selectedCourse.title,
          track: selectedCourse.track,
          overview: selectedCourse.overview,
          outcomes: selectedCourse.outcomes,
          curriculum: selectedCourse.curriculum,
          duration: selectedCourse.duration,
          level: selectedCourse.level,
          feePkr: selectedCourse.feePkr,
          instructorName: selectedCourse.instructorName,
          ...(selectedCourse.instructorBio ? { instructorBio: selectedCourse.instructorBio } : {}),
          imageUrl: selectedCourse.imageUrl,
          featured: Boolean(selectedCourse.featured),
          isDemo: false,
          seoTitle: seoTitle.trim().slice(0, 160),
          seoDescription: seoDescription.trim().slice(0, 320),
          ogImageUrl: ogImageUrl.trim().slice(0, 500),
        });
      }
    } finally {
      setSaving(false);
    }
  };

  const handleResetDefaults = async () => {
    if (scope === 'categories') {
      const defaults = DEFAULT_CATEGORY_SEO[selectedCategory];
      setSeoTitle(defaults.seoTitle);
      setSeoDescription(defaults.seoDescription);
      setOgImageUrl(defaults.ogImageUrl);
      setSeoKeywords(defaults.seoKeywords);
    } else if (scope === 'products' && selectedProduct) {
      setSaving(true);
      try {
        await upsertProduct({
          id: selectedProduct.id,
          name: selectedProduct.name,
          category: selectedProduct.category,
          subcategory: selectedProduct.subcategory,
          description: selectedProduct.description,
          pricePkr: selectedProduct.pricePkr,
          ...(typeof selectedProduct.discountPricePkr === 'number'
            ? { discountPricePkr: selectedProduct.discountPricePkr }
            : {}),
          stock: selectedProduct.stock,
          imageUrl: selectedProduct.imageUrl,
          variants: selectedProduct.variants || [],
          specs: selectedProduct.specs || [],
          ...(selectedProduct.brand ? { brand: selectedProduct.brand } : {}),
          ...(selectedProduct.gender ? { gender: selectedProduct.gender } : {}),
          ...(selectedProduct.ageGroup ? { ageGroup: selectedProduct.ageGroup } : {}),
          ...(selectedProduct.safetyNote ? { safetyNote: selectedProduct.safetyNote } : {}),
          ...(typeof selectedProduct.ratingAvg === 'number'
            ? { ratingAvg: selectedProduct.ratingAvg }
            : {}),
          ...(typeof selectedProduct.reviewCount === 'number'
            ? { reviewCount: selectedProduct.reviewCount }
            : {}),
          featured: Boolean(selectedProduct.featured),
          isDemo: false,
          seoTitle: '',
          seoDescription: '',
          ogImageUrl: '',
        });
      } finally {
        setSaving(false);
      }
    } else if (scope === 'courses' && selectedCourse) {
      setSaving(true);
      try {
        await upsertCourse({
          id: selectedCourse.id,
          title: selectedCourse.title,
          track: selectedCourse.track,
          overview: selectedCourse.overview,
          outcomes: selectedCourse.outcomes,
          curriculum: selectedCourse.curriculum,
          duration: selectedCourse.duration,
          level: selectedCourse.level,
          feePkr: selectedCourse.feePkr,
          instructorName: selectedCourse.instructorName,
          ...(selectedCourse.instructorBio ? { instructorBio: selectedCourse.instructorBio } : {}),
          imageUrl: selectedCourse.imageUrl,
          featured: Boolean(selectedCourse.featured),
          isDemo: false,
          seoTitle: '',
          seoDescription: '',
          ogImageUrl: '',
        });
      } finally {
        setSaving(false);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-lg font-bold text-slate-900">
            SEO &amp; OpenGraph Metadata Manager
          </h2>
          <p className="text-xs text-slate-600 mt-1">
            Customize Meta Titles, Meta Descriptions, and OpenGraph social share images for every category, product, and course page.
          </p>
        </div>

        <div className="flex flex-wrap gap-1.5 bg-slate-100 p-1 rounded-xl w-fit">
          {[
            { id: 'categories', label: `Categories (${CATEGORY_SLUGS.length})` },
            { id: 'products', label: `Products (${products.length})` },
            { id: 'courses', label: `Courses (${courses.length})` },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setScope(item.id as typeof scope);
                setItemSearch('');
              }}
              className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors ${
                scope === item.id
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Sidebar Selector */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-4 space-y-3">
          {scope !== 'categories' && (
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={itemSearch}
                onChange={(e) => setItemSearch(e.target.value)}
                placeholder={scope === 'products' ? 'Search product...' : 'Search course...'}
                className="w-full pl-8 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>
          )}

          <div className="max-h-[460px] overflow-y-auto space-y-1.5 pr-1">
            {scope === 'categories' &&
              CATEGORY_SLUGS.map((slug) => {
                const def = DEFAULT_CATEGORY_SEO[slug];
                const isCustom = Boolean(categorySeoMap[slug]);
                const active = selectedCategory === slug;
                return (
                  <button
                    key={slug}
                    type="button"
                    onClick={() => setSelectedCategory(slug)}
                    className={`w-full text-left px-3 py-2.5 rounded-lg border transition-colors ${
                      active
                        ? 'bg-blue-50 border-blue-600 text-slate-900'
                        : 'bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <div className="text-xs font-semibold text-slate-900">{def.label}</div>
                    <div className="mt-0.5 text-[11px] text-slate-500 flex items-center justify-between">
                      <span>{def.path}</span>
                      <span className={isCustom ? 'text-emerald-700 font-semibold' : ''}>
                        {isCustom ? 'Custom SEO' : 'Default'}
                      </span>
                    </div>
                  </button>
                );
              })}

            {scope === 'products' &&
              filteredProducts.map((p) => {
                const active = selectedProduct?.id === p.id;
                const hasCustom = Boolean(p.seoTitle || p.seoDescription || p.ogImageUrl);
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSelectedProductId(p.id)}
                    className={`w-full text-left px-3 py-2.5 rounded-lg border transition-colors ${
                      active
                        ? 'bg-blue-50 border-blue-600 text-slate-900'
                        : 'bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <div className="text-xs font-semibold text-slate-900 line-clamp-1">{p.name}</div>
                    <div className="mt-0.5 text-[11px] text-slate-500 flex items-center justify-between">
                      <span>{p.category}</span>
                      <span className={hasCustom ? 'text-emerald-700 font-semibold' : ''}>
                        {hasCustom ? 'Custom SEO' : 'Default'}
                      </span>
                    </div>
                  </button>
                );
              })}

            {scope === 'courses' &&
              filteredCourses.map((c) => {
                const active = selectedCourse?.id === c.id;
                const hasCustom = Boolean(c.seoTitle || c.seoDescription || c.ogImageUrl);
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setSelectedCourseId(c.id)}
                    className={`w-full text-left px-3 py-2.5 rounded-lg border transition-colors ${
                      active
                        ? 'bg-blue-50 border-blue-600 text-slate-900'
                        : 'bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <div className="text-xs font-semibold text-slate-900 line-clamp-1">{c.title}</div>
                    <div className="mt-0.5 text-[11px] text-slate-500 flex items-center justify-between">
                      <span>{c.track}</span>
                      <span className={hasCustom ? 'text-emerald-700 font-semibold' : ''}>
                        {hasCustom ? 'Custom SEO' : 'Default'}
                      </span>
                    </div>
                  </button>
                );
              })}
          </div>
        </div>

        {/* Right Editor & Live Previews */}
        <div className="lg:col-span-8 space-y-6">
          <form onSubmit={(e) => void handleSave(e)} className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-200">
              <div>
                <div className="text-xs text-slate-500">Editing Search &amp; Social Metadata</div>
                <div className="font-display text-base font-bold text-slate-900">
                  {scope === 'categories'
                    ? DEFAULT_CATEGORY_SEO[selectedCategory].label
                    : scope === 'products'
                      ? selectedProduct?.name
                      : selectedCourse?.title}
                </div>
              </div>
              <button
                type="button"
                onClick={() => void handleResetDefaults()}
                disabled={saving}
                className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg inline-flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Defaults</span>
              </button>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700">
                  Meta Title (&lt;title&gt; &amp; og:title)
                </label>
                <span className="text-[11px] font-mono-tabular text-slate-500">
                  {seoTitle.length}/160 (Ideal: 30–60)
                </span>
              </div>
              <input
                type="text"
                required
                maxLength={160}
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
                placeholder="Enter search engine title..."
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700">
                  Meta Description (&lt;meta name=&quot;description&quot;&gt; &amp; og:description)
                </label>
                <span className="text-[11px] font-mono-tabular text-slate-500">
                  {seoDescription.length}/320 (Ideal: 120–160)
                </span>
              </div>
              <textarea
                rows={3}
                required
                maxLength={320}
                value={seoDescription}
                onChange={(e) => setSeoDescription(e.target.value)}
                placeholder="Write a compelling 1-2 sentence summary for Google search snippets..."
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                OpenGraph Image URL (og:image &amp; twitter:image)
              </label>
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-slate-400 shrink-0" />
                <input
                  type="text"
                  required
                  maxLength={500}
                  value={ogImageUrl}
                  onChange={(e) => setOgImageUrl(e.target.value)}
                  placeholder="/src/assets/images/... or https://..."
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>
            </div>

            {scope === 'categories' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  SEO Keywords (comma separated)
                </label>
                <input
                  type="text"
                  maxLength={500}
                  value={seoKeywords}
                  onChange={(e) => setSeoKeywords(e.target.value)}
                  placeholder="keyword 1, keyword 2, Bahawalpur..."
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 bg-blue-700 hover:bg-blue-800 disabled:opacity-60 text-white text-xs font-semibold rounded-lg inline-flex items-center gap-2"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{saving ? 'Saving Metadata...' : 'Save SEO & OpenGraph Metadata'}</span>
            </button>
          </form>

          {/* Live SERP & Social Card Preview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                <Globe className="w-3.5 h-3.5 text-blue-700" />
                <span>Google Search Snippet Preview</span>
              </div>
              <div className="pt-2 space-y-1">
                <div className="text-[11px] text-emerald-800 truncate">{previewUrl}</div>
                <div className="text-base font-medium text-blue-700 line-clamp-2 leading-snug">
                  {seoTitle || 'Page Title Preview'}
                </div>
                <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                  {seoDescription || 'Meta description summary appears here.'}
                </p>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              <div className="px-4 py-2.5 border-b border-slate-200 text-xs font-semibold text-slate-500">
                OpenGraph Social Card Preview
              </div>
              <div className="aspect-[16/9] bg-slate-100 overflow-hidden">
                {ogImageUrl ? (
                  <img
                    src={ogImageUrl}
                    alt="OpenGraph preview"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs text-slate-400">
                    No OpenGraph image URL
                  </div>
                )}
              </div>
              <div className="p-3.5 space-y-1 bg-slate-50">
                <div className="text-[11px] text-slate-500 uppercase truncate">
                  {window.location.host}
                </div>
                <div className="text-xs font-bold text-slate-900 line-clamp-1">
                  {seoTitle || 'OpenGraph Title'}
                </div>
                <div className="text-[11px] text-slate-600 line-clamp-2">
                  {seoDescription || 'OpenGraph summary description.'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
