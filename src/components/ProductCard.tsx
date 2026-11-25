import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, GitCompareArrows, Heart, MessageCircle, ShoppingBag, Star } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatPkr } from '../data/seedCatalog';
import { buildWhatsAppUrl, WHATSAPP_TEMPLATES } from '../lib/whatsapp';
import type { Product } from '../types';

export function ProductCard({ product }: { product: Product }) {
  const {
    addToCart,
    wishlist,
    toggleWishlist,
    compareIds,
    toggleCompare,
    setQuickViewProduct,
    siteSettings,
  } = useApp();
  const [imgError, setImgError] = useState(false);
  const navigate = useNavigate();

  const isSaved = wishlist.includes(product.id);
  const isCompared = compareIds.includes(product.id);
  const hasDiscount =
    typeof product.discountPricePkr === 'number' &&
    product.discountPricePkr > 0 &&
    product.discountPricePkr < product.pricePkr;
  const activePrice = hasDiscount ? product.discountPricePkr! : product.pricePkr;
  const discountPct = hasDiscount
    ? Math.round(((product.pricePkr - product.discountPricePkr!) / product.pricePkr) * 100)
    : 0;

  return (
    <article className="group bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md">
      <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
        <Link to={`/product/${product.id}`} className="block w-full h-full">
          {!imgError ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              loading="lazy"
              referrerPolicy="no-referrer"
              onError={() => setImgError(true)}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-gradient-to-br from-slate-100 to-slate-200 text-slate-500 text-center">
              <ShoppingBag className="w-8 h-8 mb-2 text-slate-400" />
              <span className="text-xs font-medium">{product.name}</span>
            </div>
          )}
        </Link>
        <div className="absolute top-3 right-3 flex flex-col gap-1.5">
          <button
            type="button"
            onClick={() => toggleWishlist(product.id)}
            aria-label={isSaved ? 'Remove from wishlist' : 'Save to wishlist'}
            className="p-2 rounded-lg bg-white/90 backdrop-blur border border-slate-200 text-slate-600 hover:text-rose-600 transition-colors"
          >
            <Heart className={`w-4 h-4 ${isSaved ? 'fill-rose-600 text-rose-600' : ''}`} />
          </button>
          <button
            type="button"
            onClick={() => setQuickViewProduct(product)}
            aria-label="Quick view product"
            title="Quick View"
            className="p-2 rounded-lg bg-white/90 backdrop-blur border border-slate-200 text-slate-600 hover:text-blue-700 transition-colors"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => toggleCompare(product.id)}
            aria-label="Compare product"
            title="Compare"
            className={`p-2 rounded-lg bg-white/90 backdrop-blur border transition-colors ${
              isCompared
                ? 'border-blue-700 text-blue-700'
                : 'border-slate-200 text-slate-600 hover:text-blue-700'
            }`}
          >
            <GitCompareArrows className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="p-4 flex-1 flex flex-col">
        <div className="text-xs text-slate-500 flex items-center gap-1.5 flex-wrap">
          <span>{product.subcategory}</span>
          {product.brand && (
            <>
              <span aria-hidden="true">·</span>
              <span>{product.brand}</span>
            </>
          )}
          {hasDiscount && (
            <>
              <span aria-hidden="true">·</span>
              <span className="text-amber-700 font-semibold">{discountPct}% Off</span>
            </>
          )}
        </div>

        <Link
          to={`/product/${product.id}`}
          className="mt-1.5 font-display text-base font-semibold text-slate-900 hover:text-blue-700 transition-colors line-clamp-2"
        >
          {product.name}
        </Link>

        <div className="mt-2 flex items-center gap-2 text-xs text-slate-600">
          <span className="inline-flex items-center gap-1 font-medium text-slate-800">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            {(product.ratingAvg ?? 4.7).toFixed(1)}
          </span>
          <span aria-hidden="true">·</span>
          <span className={product.stock > 0 ? 'text-emerald-700 font-medium' : 'text-red-600 font-medium'}>
            {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
          </span>
        </div>

        <div className="mt-auto pt-4 space-y-2">
          <div className="flex items-baseline gap-2">
            <span className="text-base font-bold text-slate-900 tabular-nums">
              {formatPkr(activePrice)}
            </span>
            {hasDiscount && (
              <span className="text-xs text-slate-400 line-through tabular-nums">
                {formatPkr(product.pricePkr)}
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              disabled={product.stock <= 0}
              onClick={() => addToCart(product)}
              className="px-3 py-2 text-xs font-semibold text-slate-900 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 rounded-lg transition-colors whitespace-nowrap"
            >
              Add to Cart
            </button>
            <button
              type="button"
              disabled={product.stock <= 0}
              onClick={() => {
                addToCart(product);
                navigate('/checkout');
              }}
              className="px-3 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 disabled:opacity-50 rounded-lg transition-colors whitespace-nowrap"
            >
              Buy Now
            </button>
          </div>

          <a
            href={buildWhatsAppUrl(
              siteSettings.whatsappNumber,
              WHATSAPP_TEMPLATES.directProductOrder({
                name: product.name,
                variant: product.variants?.[0],
                qty: 1,
                unitPricePkr: activePrice,
                totalPkr: activePrice,
              }),
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-colors inline-flex items-center justify-center gap-1.5"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>Order on WhatsApp</span>
          </a>
        </div>
      </div>
    </article>
  );
}
