import React, { useMemo, useState } from 'react';
import { Ruler, Search, ShieldAlert, X } from 'lucide-react';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { ProductCard } from '../components/ProductCard';
import { SeoHead } from '../components/SeoHead';
import { useApp } from '../context/AppContext';
import { STORE_CATEGORY_META } from '../data/seedCatalog';
import type { StoreCategorySlug } from '../types';

const AGE_FILTERS = ['All Ages', '0–2 Years', '3–5 Years', '6–8 Years', '9–12 Years', '13+ Years'];

export function StoreCategoryPage({ category }: { category: StoreCategorySlug }) {
  const { products, recentlyViewedIds, categorySeoMap } = useApp();
  const meta = STORE_CATEGORY_META[category];
  const customSeo = categorySeoMap[category];

  const [subcategory, setSubcategory] = useState('All');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'discount' | 'rating'>('featured');
  const [maxPrice, setMaxPrice] = useState<number>(0);
  const [inStockOnly, setInStockOnly] = useState(false);

  // Fashion filters
  const [genderFilter, setGenderFilter] = useState('All');
  const [brandFilter, setBrandFilter] = useState('All');
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);

  // Kids toys filters
  const [ageFilter, setAgeFilter] = useState('All Ages');

  const categoryProducts = useMemo(
    () => products.filter((p) => p.category === category),
    [products, category],
  );

  const availableBrands = useMemo(
    () => ['All', ...Array.from(new Set(categoryProducts.map((p) => p.brand).filter(Boolean) as string[]))],
    [categoryProducts],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = categoryProducts.filter((p) => {
      const effectivePrice = p.discountPricePkr && p.discountPricePkr > 0 ? p.discountPricePkr : p.pricePkr;
      if (subcategory !== 'All' && p.subcategory !== subcategory) return false;
      if (inStockOnly && p.stock <= 0) return false;
      if (maxPrice > 0 && effectivePrice > maxPrice) return false;
      if (category === 'fashion') {
        if (genderFilter !== 'All' && p.gender !== genderFilter) return false;
        if (brandFilter !== 'All' && p.brand !== brandFilter) return false;
      }
      if (category === 'kids-toys' && ageFilter !== 'All Ages') {
        if (p.ageGroup !== ageFilter) return false;
      }
      if (q && !p.name.toLowerCase().includes(q) && !p.description.toLowerCase().includes(q) && !p.subcategory.toLowerCase().includes(q)) {
        return false;
      }
      return true;
    });

    if (sortBy === 'price-asc') {
      return [...list].sort(
        (a, b) => (a.discountPricePkr || a.pricePkr) - (b.discountPricePkr || b.pricePkr),
      );
    }
    if (sortBy === 'price-desc') {
      return [...list].sort(
        (a, b) => (b.discountPricePkr || b.pricePkr) - (a.discountPricePkr || a.pricePkr),
      );
    }
    if (sortBy === 'discount') {
      return [...list].sort((a, b) => {
        const discA = a.discountPricePkr && a.discountPricePkr < a.pricePkr ? (a.pricePkr - a.discountPricePkr) / a.pricePkr : 0;
        const discB = b.discountPricePkr && b.discountPricePkr < b.pricePkr ? (b.pricePkr - b.discountPricePkr) / b.pricePkr : 0;
        return discB - discA;
      });
    }
    if (sortBy === 'rating') {
      return [...list].sort((a, b) => (b.ratingAvg ?? 4.7) - (a.ratingAvg ?? 4.7));
    }
    return list;
  }, [categoryProducts, subcategory, inStockOnly, maxPrice, category, genderFilter, brandFilter, ageFilter, search, sortBy]);

  const recentlyViewed = useMemo(
    () =>
      recentlyViewedIds
        .map((rid) => products.find((p) => p.id === rid))
        .filter(Boolean)
        .slice(0, 3),
    [recentlyViewedIds, products],
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      <SeoHead
        title={customSeo?.seoTitle?.trim() || `${meta.title} | Shop Online in Pakistan — Digital E-Commerce by ASIF`}
        description={customSeo?.seoDescription?.trim() || meta.subtitle}
        keywords={customSeo?.seoKeywords?.trim() || `${meta.title}, ${meta.subcategories.join(', ')}, Cash on Delivery Pakistan, WhatsApp 0300-6316551`}
        image={customSeo?.ogImageUrl?.trim() || meta.heroImage}
        jsonLd={[
          {
            '@type': 'CollectionPage',
            name: meta.title,
            description: meta.subtitle,
          },
          {
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: `${window.location.origin}/` },
              { '@type': 'ListItem', position: 2, name: meta.title },
            ],
          },
        ]}
      />
      <Breadcrumbs items={[{ label: meta.title }]} />

      {/* Category Hero Banner */}
      <div className="bg-slate-950 text-white rounded-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 items-stretch">
        <div className="lg:col-span-7 p-8 sm:p-10 flex flex-col justify-center">
          <div className="text-xs font-semibold text-sky-400">
            Digital E-Commerce by ASIF · Cash on Delivery & WhatsApp Orders
          </div>
          <h1 className="mt-2 font-display text-3xl sm:text-4xl font-bold">{meta.title}</h1>
          <p className="mt-3 text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl">
            {meta.subtitle}
          </p>
          {category === 'fashion' && (
            <button
              type="button"
              onClick={() => setSizeGuideOpen(true)}
              className="mt-5 self-start inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-lg"
            >
              <Ruler className="w-4 h-4 text-sky-400" />
              <span>View Clothing Size Guide</span>
            </button>
          )}
        </div>
        <div className="lg:col-span-5 min-h-[220px] bg-slate-900">
          <img
            src={meta.heroImage}
            alt={meta.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Kids Toys Safety Banner */}
      {category === 'kids-toys' && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3 text-xs sm:text-sm text-blue-950">
          <ShieldAlert className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
          <div>
            <strong>Child Safety Information:</strong> Always check the recommended age group on each product page before purchasing. Toys with small modular parts are recommended for ages 3+ or 6+ under adult supervision.
          </div>
        </div>
      )}

      {/* Subcategory Tabs & Filters */}
      <div className="space-y-4">
        <div className="flex flex-wrap gap-1.5 bg-slate-100 p-1 rounded-lg">
          {meta.subcategories.map((sub) => (
            <button
              key={sub}
              type="button"
              onClick={() => setSubcategory(sub)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                subcategory === sub ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {sub}
            </button>
          ))}
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-wrap items-center gap-3 justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={`Search ${meta.title.toLowerCase()}...`}
                className="pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-700"
              />
            </div>

            {category === 'fashion' && (
              <>
                <select
                  value={genderFilter}
                  onChange={(e) => setGenderFilter(e.target.value)}
                  className="px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg"
                >
                  <option value="All">All Collections</option>
                  <option value="Ladies">Ladies</option>
                  <option value="Gents">Gents</option>
                  <option value="Kids">Kids</option>
                </select>
                <select
                  value={brandFilter}
                  onChange={(e) => setBrandFilter(e.target.value)}
                  className="px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg"
                >
                  {availableBrands.map((b) => (
                    <option key={b} value={b}>{b === 'All' ? 'All Brands' : b}</option>
                  ))}
                </select>
              </>
            )}

            {category === 'kids-toys' && (
              <select
                value={ageFilter}
                onChange={(e) => setAgeFilter(e.target.value)}
                className="px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg"
              >
                {AGE_FILTERS.map((age) => (
                  <option key={age} value={age}>{age}</option>
                ))}
              </select>
            )}

            <label className="inline-flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="rounded border-slate-300 text-blue-700"
              />
              <span>In Stock Only</span>
            </label>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <select
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg"
            >
              <option value={0}>All Price Ranges</option>
              <option value={2000}>Under PKR 2,000</option>
              <option value={5000}>Under PKR 5,000</option>
              <option value={10000}>Under PKR 10,000</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg"
            >
              <option value="featured">Sort: Featured</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="discount">Biggest Discount</option>
              <option value="rating">Top Rated</option>
            </select>
          </div>
        </div>
      </div>

      {/* Product Grid */}
      {filtered.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
          <p className="text-sm font-medium text-slate-700">No products match your current filter.</p>
          <button
            type="button"
            onClick={() => {
              setSubcategory('All');
              setSearch('');
              setGenderFilter('All');
              setBrandFilter('All');
              setAgeFilter('All Ages');
              setMaxPrice(0);
              setInStockOnly(false);
            }}
            className="mt-4 px-4 py-2 bg-blue-700 text-white text-xs font-semibold rounded-lg"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {recentlyViewed.length > 0 && (
        <section className="pt-4">
          <h2 className="font-display text-xl font-bold text-slate-900 mb-4">Recently Viewed</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentlyViewed.map((p) => (
              <ProductCard key={p!.id} product={p!} />
            ))}
          </div>
        </section>
      )}

      {/* Fashion Size Guide Modal */}
      {sizeGuideOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/50 flex items-center justify-center p-4"
          onClick={() => setSizeGuideOpen(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-lg w-full p-6 border border-slate-200 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h2 className="font-display text-lg font-bold text-slate-900">Clothing Size Guide (Inches)</h2>
              <button type="button" onClick={() => setSizeGuideOpen(false)} className="p-1 text-slate-500">
                <X className="w-5 h-5" />
              </button>
            </div>
            <table className="w-full mt-4 text-sm text-left">
              <thead className="text-xs text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="py-2">Size</th>
                  <th className="py-2">Chest</th>
                  <th className="py-2">Length</th>
                  <th className="py-2">Shoulder</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono-tabular text-xs">
                <tr><td className="py-2 font-semibold">Small (S)</td><td>38&quot;</td><td>28&quot;</td><td>17&quot;</td></tr>
                <tr><td className="py-2 font-semibold">Medium (M)</td><td>40&quot;</td><td>29&quot;</td><td>18&quot;</td></tr>
                <tr><td className="py-2 font-semibold">Large (L)</td><td>42&quot;</td><td>30&quot;</td><td>19&quot;</td></tr>
                <tr><td className="py-2 font-semibold">Extra Large (XL)</td><td>45&quot;</td><td>31&quot;</td><td>20&quot;</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
