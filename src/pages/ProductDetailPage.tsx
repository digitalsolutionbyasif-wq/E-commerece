import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeftRight, CheckCircle2, Heart, MessageCircle, Share2, ShieldAlert, Star } from 'lucide-react';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { ProductCard } from '../components/ProductCard';
import { SeoHead } from '../components/SeoHead';
import { useApp } from '../context/AppContext';
import { formatPkr, STORE_CATEGORY_META } from '../data/seedCatalog';
import { buildWhatsAppUrl, formatWhatsAppDisplay, WHATSAPP_TEMPLATES } from '../lib/whatsapp';

export function ProductDetailPage() {
  const { id } = useParams();
  const {
    products,
    approvedReviews,
    siteSettings,
    addToCart,
    wishlist,
    toggleWishlist,
    compareIds,
    toggleCompare,
    recentlyViewedIds,
    markProductViewed,
    submitReview,
    showToast,
    user,
  } = useApp();
  const navigate = useNavigate();

  const product = products.find((p) => p.id === id);
  const [selectedVariant, setSelectedVariant] = useState<string>(product?.variants?.[0] || 'Standard');
  const [qty, setQty] = useState(1);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  useEffect(() => {
    if (product) {
      setSelectedVariant(product.variants?.[0] || 'Standard');
      setQty(1);
      markProductViewed(product.id);
    }
  }, [product?.id]);

  if (!product) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h1 className="font-display text-2xl font-bold text-slate-900">Product Not Found</h1>
        <Link to="/electronics" className="mt-4 inline-block text-sm font-semibold text-blue-700 hover:underline">
          ← Browse Store
        </Link>
      </div>
    );
  }

  const catMeta = STORE_CATEGORY_META[product.category];
  const hasDiscount =
    typeof product.discountPricePkr === 'number' &&
    product.discountPricePkr > 0 &&
    product.discountPricePkr < product.pricePkr;
  const activePrice = hasDiscount ? product.discountPricePkr! : product.pricePkr;
  const isSaved = wishlist.includes(product.id);
  const isCompared = compareIds.includes(product.id);
  const related = products.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 3);
  const recentlyViewed = recentlyViewedIds
    .filter((rid) => rid !== product.id)
    .map((rid) => products.find((p) => p.id === rid))
    .filter(Boolean)
    .slice(0, 3);
  const productReviews = approvedReviews.filter((r) => r.targetId === product.id);
  const whatsappDisplay = formatWhatsAppDisplay(siteSettings.whatsappNumber);

  const handleCopyShareLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      showToast('Product link copied to clipboard.', 'success');
    } catch {
      showToast('Copy the page URL from your browser address bar.', 'info');
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewComment.trim()) return;
    await submitReview({
      targetType: 'product',
      targetId: product.id,
      targetName: product.name,
      authorName: user?.displayName || 'Customer',
      rating: reviewRating,
      comment: reviewComment,
    });
    setReviewComment('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-12">
      <SeoHead
        title={product.seoTitle?.trim() || `${product.name} | PKR ${activePrice.toLocaleString('en-PK')} — Digital E-Commerce by ASIF`}
        description={product.seoDescription?.trim() || product.description}
        keywords={`${product.name}, ${product.subcategory}, ${catMeta.title}, buy online Pakistan, Cash on Delivery, Digital E-Commerce by ASIF`}
        image={product.ogImageUrl?.trim() || product.imageUrl}
        type="product"
        jsonLd={[
          {
            '@type': 'Product',
            name: product.name,
            description: product.description,
            image: product.imageUrl,
            category: catMeta.title,
            ...(product.brand ? { brand: { '@type': 'Brand', name: product.brand } } : {}),
            offers: {
              '@type': 'Offer',
              priceCurrency: 'PKR',
              price: activePrice,
              availability:
                product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
            },
          },
          {
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: `${window.location.origin}/` },
              {
                '@type': 'ListItem',
                position: 2,
                name: catMeta.title,
                item: `${window.location.origin}/${product.category}`,
              },
              { '@type': 'ListItem', position: 3, name: product.name },
            ],
          },
        ]}
      />
      <Breadcrumbs
        items={[
          { label: catMeta.title, to: `/${product.category}` },
          { label: product.name },
        ]}
      />

      {/* Contiguous Purchase Module */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        <div className="lg:col-span-6 lg:sticky lg:top-24">
          <div className="aspect-[4/3] bg-white border border-slate-200 rounded-2xl overflow-hidden">
            <img
              src={product.imageUrl}
              alt={product.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6">
          <div>
            <div className="text-xs text-slate-500 flex items-center gap-2 flex-wrap">
              <span>{catMeta.title}</span>
              <span aria-hidden="true">·</span>
              <span>{product.subcategory}</span>
              {product.brand && (
                <>
                  <span aria-hidden="true">·</span>
                  <span>{product.brand}</span>
                </>
              )}
            </div>
            <h1 className="mt-2 font-display text-2xl sm:text-3xl font-bold text-slate-900">
              {product.name}
            </h1>
            <div className="mt-2 flex items-center gap-3 text-xs text-slate-600">
              <span className="inline-flex items-center gap-1 font-semibold text-slate-900">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                {(product.ratingAvg ?? 4.7).toFixed(1)}
              </span>
              <span aria-hidden="true">·</span>
              <span className={product.stock > 0 ? 'text-emerald-700 font-semibold' : 'text-red-600 font-semibold'}>
                {product.stock > 0 ? `${product.stock} Units Available` : 'Out of Stock'}
              </span>
            </div>
          </div>

          <div className="pb-5 border-b border-slate-200 flex items-baseline gap-3">
            <span className="text-3xl font-display font-bold text-slate-900 tabular-nums">
              {formatPkr(activePrice)}
            </span>
            {hasDiscount && (
              <span className="text-base text-slate-400 line-through tabular-nums">
                {formatPkr(product.pricePkr)}
              </span>
            )}
          </div>

          <p className="text-sm text-slate-700 leading-relaxed">{product.description}</p>

          {product.safetyNote && (
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2.5 text-xs text-amber-950">
              <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <strong>Age {product.ageGroup || 'Guidance'}: </strong>
                {product.safetyNote}
              </div>
            </div>
          )}

          {product.variants && product.variants.length > 0 && (
            <div>
              <div className="text-xs font-semibold text-slate-700 mb-2">Select Option / Size</div>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setSelectedVariant(v)}
                    className={`px-3.5 py-2 text-xs font-semibold rounded-lg border transition-colors ${
                      selectedVariant === v
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-slate-50 text-slate-800 border-slate-200 hover:border-slate-400'
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center gap-4">
            <label className="text-xs font-semibold text-slate-700">Quantity:</label>
            <input
              type="number"
              min={1}
              max={Math.max(1, product.stock)}
              value={qty}
              onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))}
              className="w-20 px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg tabular-nums"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              disabled={product.stock <= 0}
              onClick={() => addToCart(product, selectedVariant, qty)}
              className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-900 text-sm font-semibold rounded-lg transition-colors"
            >
              Add to Cart
            </button>
            <button
              type="button"
              disabled={product.stock <= 0}
              onClick={() => {
                addToCart(product, selectedVariant, qty);
                navigate('/checkout');
              }}
              className="py-3 px-4 bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold rounded-lg transition-colors"
            >
              Buy Now
            </button>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <a
              href={buildWhatsAppUrl(
                siteSettings.whatsappNumber,
                WHATSAPP_TEMPLATES.directProductOrder({
                  name: product.name,
                  variant: selectedVariant,
                  qty,
                  unitPricePkr: activePrice,
                  totalPkr: activePrice * qty,
                }),
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 min-w-[200px] py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg inline-flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Order on WhatsApp ({whatsappDisplay})</span>
            </a>
            <button
              type="button"
              onClick={() => toggleWishlist(product.id)}
              className="py-2.5 px-3.5 border border-slate-200 hover:border-slate-300 text-xs font-semibold text-slate-700 rounded-lg inline-flex items-center gap-1.5"
            >
              <Heart className={`w-4 h-4 ${isSaved ? 'fill-rose-600 text-rose-600' : ''}`} />
              <span>{isSaved ? 'Saved' : 'Wishlist'}</span>
            </button>
            <button
              type="button"
              onClick={() => toggleCompare(product.id)}
              className={`py-2.5 px-3.5 border text-xs font-semibold rounded-lg inline-flex items-center gap-1.5 ${
                isCompared
                  ? 'bg-blue-50 border-blue-600 text-blue-700'
                  : 'border-slate-200 hover:border-slate-300 text-slate-700'
              }`}
            >
              <ArrowLeftRight className="w-4 h-4" />
              <span>{isCompared ? 'Compared' : 'Compare'}</span>
            </button>
            <button
              type="button"
              onClick={() => void handleCopyShareLink()}
              className="py-2.5 px-3.5 border border-slate-200 hover:border-slate-300 text-xs font-semibold text-slate-700 rounded-lg inline-flex items-center gap-1.5"
              title="Copy product SEO link"
            >
              <Share2 className="w-4 h-4" />
              <span>Share</span>
            </button>
          </div>

          {product.specs && product.specs.length > 0 && (
            <div className="pt-4 border-t border-slate-200">
              <h2 className="text-sm font-bold text-slate-900 mb-3">Specifications</h2>
              <ul className="space-y-2 text-xs text-slate-700">
                {product.specs.map((sp) => (
                  <li key={sp} className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-700 shrink-0" />
                    <span>{sp}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Product Reviews */}
      <section className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-5">
        <h2 className="font-display text-xl font-bold text-slate-900">Customer Reviews</h2>
        {productReviews.length === 0 ? (
          <p className="text-sm text-slate-500">No approved reviews for this item yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {productReviews.map((r) => (
              <div key={r.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="font-semibold text-slate-900">{r.authorName}</span>
                  <span className="text-amber-600 font-semibold">{r.rating}/5 Stars</span>
                </div>
                <p className="mt-2 text-sm text-slate-700">{r.comment}</p>
              </div>
            ))}
          </div>
        )}

        <form onSubmit={(e) => void handleReviewSubmit(e)} className="pt-4 border-t border-slate-200 max-w-xl space-y-3">
          <div className="text-xs font-semibold text-slate-800">Add a Product Review (Moderated by Admin)</div>
          <select
            value={reviewRating}
            onChange={(e) => setReviewRating(Number(e.target.value))}
            className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg"
          >
            {[5, 4, 3, 2, 1].map((n) => (
              <option key={n} value={n}>{n} Stars</option>
            ))}
          </select>
          <textarea
            rows={2}
            required
            value={reviewComment}
            onChange={(e) => setReviewComment(e.target.value)}
            placeholder="Share feedback on quality, packaging, or delivery..."
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

      {/* Related Products */}
      {related.length > 0 && (
        <section>
          <h2 className="font-display text-xl font-bold text-slate-900 mb-5">Related Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* Recently Viewed Products */}
      {recentlyViewed.length > 0 && (
        <section>
          <h2 className="font-display text-xl font-bold text-slate-900 mb-5">Recently Viewed Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentlyViewed.map((p) => (
              <ProductCard key={p!.id} product={p!} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
