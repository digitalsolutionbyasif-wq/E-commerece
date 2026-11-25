import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle2, MessageCircle, Star, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatPkr } from '../data/seedCatalog';
import { buildWhatsAppUrl, formatWhatsAppDisplay, WHATSAPP_TEMPLATES } from '../lib/whatsapp';

export function QuickViewModal() {
  const { quickViewProduct, setQuickViewProduct, addToCart, siteSettings } = useApp();
  const navigate = useNavigate();
  const [selectedVariant, setSelectedVariant] = useState('Standard');
  const [qty, setQty] = useState(1);

  useEffect(() => {
    if (quickViewProduct) {
      setSelectedVariant(quickViewProduct.variants?.[0] || 'Standard');
      setQty(1);
    }
  }, [quickViewProduct]);

  if (!quickViewProduct) return null;

  const hasDiscount =
    typeof quickViewProduct.discountPricePkr === 'number' &&
    quickViewProduct.discountPricePkr > 0 &&
    quickViewProduct.discountPricePkr < quickViewProduct.pricePkr;
  const activePrice = hasDiscount ? quickViewProduct.discountPricePkr! : quickViewProduct.pricePkr;
  const totalPkr = activePrice * qty;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/55 backdrop-blur-xs flex items-center justify-center p-4"
      onClick={() => setQuickViewProduct(null)}
    >
      <div
        className="bg-white rounded-2xl max-w-3xl w-full overflow-hidden border border-slate-200 shadow-2xl grid grid-cols-1 md:grid-cols-12"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="md:col-span-5 bg-slate-100 aspect-[4/3] md:aspect-auto">
          <img
            src={quickViewProduct.imageUrl}
            alt={quickViewProduct.name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="md:col-span-7 p-6 space-y-4 max-h-[85vh] overflow-y-auto">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-xs text-slate-500">
                {quickViewProduct.subcategory}
                {quickViewProduct.brand ? ` · ${quickViewProduct.brand}` : ''}
              </div>
              <h2 className="mt-1 font-display text-xl font-bold text-slate-900">
                {quickViewProduct.name}
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setQuickViewProduct(null)}
              aria-label="Close quick view"
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-600">
            <span className="inline-flex items-center gap-1 font-semibold text-slate-900">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              {(quickViewProduct.ratingAvg ?? 4.7).toFixed(1)}
            </span>
            <span>·</span>
            <span className={quickViewProduct.stock > 0 ? 'text-emerald-700 font-semibold' : 'text-red-600 font-semibold'}>
              {quickViewProduct.stock > 0 ? `${quickViewProduct.stock} in stock` : 'Out of stock'}
            </span>
          </div>

          <div className="flex items-baseline gap-2.5">
            <span className="text-2xl font-display font-bold text-slate-900 tabular-nums">
              {formatPkr(activePrice)}
            </span>
            {hasDiscount && (
              <span className="text-sm text-slate-400 line-through tabular-nums">
                {formatPkr(quickViewProduct.pricePkr)}
              </span>
            )}
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">{quickViewProduct.description}</p>

          {quickViewProduct.variants && quickViewProduct.variants.length > 0 && (
            <div>
              <div className="text-xs font-semibold text-slate-700 mb-1.5">Option / Size</div>
              <div className="flex flex-wrap gap-1.5">
                {quickViewProduct.variants.map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setSelectedVariant(v)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg border ${
                      selectedVariant === v
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center gap-3">
            <label className="text-xs font-semibold text-slate-700">Qty:</label>
            <input
              type="number"
              min={1}
              max={Math.max(1, quickViewProduct.stock)}
              value={qty}
              onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))}
              className="w-20 px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg tabular-nums"
            />
          </div>

          {quickViewProduct.specs && quickViewProduct.specs.length > 0 && (
            <ul className="space-y-1 text-xs text-slate-600 pt-1">
              {quickViewProduct.specs.slice(0, 4).map((sp) => (
                <li key={sp} className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-700 shrink-0" />
                  <span>{sp}</span>
                </li>
              ))}
            </ul>
          )}

          <div className="grid grid-cols-2 gap-2.5 pt-2">
            <button
              type="button"
              disabled={quickViewProduct.stock <= 0}
              onClick={() => {
                addToCart(quickViewProduct, selectedVariant, qty);
                setQuickViewProduct(null);
              }}
              className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-900 text-xs font-semibold rounded-lg"
            >
              Add to Cart
            </button>
            <button
              type="button"
              disabled={quickViewProduct.stock <= 0}
              onClick={() => {
                addToCart(quickViewProduct, selectedVariant, qty);
                setQuickViewProduct(null);
                navigate('/checkout');
              }}
              className="py-2.5 px-3 bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold rounded-lg"
            >
              Buy Now
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <a
              href={buildWhatsAppUrl(
                siteSettings.whatsappNumber,
                WHATSAPP_TEMPLATES.directProductOrder({
                  name: quickViewProduct.name,
                  variant: selectedVariant,
                  qty,
                  unitPricePkr: activePrice,
                  totalPkr,
                }),
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg inline-flex items-center justify-center gap-1.5"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Order on WhatsApp ({formatWhatsAppDisplay(siteSettings.whatsappNumber)})</span>
            </a>
            <Link
              to={`/product/${quickViewProduct.id}`}
              onClick={() => setQuickViewProduct(null)}
              className="py-2.5 px-3 border border-slate-200 hover:border-slate-300 text-xs font-semibold text-slate-700 rounded-lg"
            >
              Full Details
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
