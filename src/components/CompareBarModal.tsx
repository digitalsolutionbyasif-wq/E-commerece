import React from 'react';
import { Link } from 'react-router-dom';
import { GitCompareArrows, MessageCircle, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatPkr } from '../data/seedCatalog';
import { buildWhatsAppUrl, WHATSAPP_TEMPLATES } from '../lib/whatsapp';

export function CompareBarModal() {
  const {
    products,
    compareIds,
    toggleCompare,
    clearCompare,
    compareOpen,
    setCompareOpen,
    addToCart,
    siteSettings,
  } = useApp();

  const comparedProducts = products.filter((p) => compareIds.includes(p.id));

  if (comparedProducts.length === 0) return null;

  return (
    <>
      {!compareOpen && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 bg-slate-950 text-white px-4 py-2.5 rounded-xl shadow-xl border border-slate-800 flex items-center gap-3 text-xs">
          <GitCompareArrows className="w-4 h-4 text-sky-400 shrink-0" />
          <span className="font-semibold whitespace-nowrap">
            Compare ({comparedProducts.length}/3)
          </span>
          <button
            type="button"
            onClick={() => setCompareOpen(true)}
            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md whitespace-nowrap"
          >
            Compare Side-by-Side
          </button>
          <button
            type="button"
            onClick={clearCompare}
            className="text-slate-400 hover:text-white p-1"
            aria-label="Clear comparison"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {compareOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/55 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setCompareOpen(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-4xl w-full p-6 border border-slate-200 shadow-2xl max-h-[88vh] overflow-auto space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <GitCompareArrows className="w-5 h-5 text-blue-700" />
                <h2 className="font-display text-lg font-bold text-slate-900">
                  Product Comparison ({comparedProducts.length})
                </h2>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={clearCompare}
                  className="text-xs font-semibold text-red-600 hover:underline"
                >
                  Clear All
                </button>
                <button
                  type="button"
                  onClick={() => setCompareOpen(false)}
                  className="p-1 text-slate-500 hover:text-slate-900"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="py-3 pr-4 text-slate-500 w-36">Feature</th>
                    {comparedProducts.map((p) => (
                      <th key={p.id} className="py-3 px-3 min-w-[200px] align-top">
                        <div className="flex items-start justify-between gap-2">
                          <Link
                            to={`/product/${p.id}`}
                            onClick={() => setCompareOpen(false)}
                            className="font-display text-sm font-bold text-slate-900 hover:text-blue-700"
                          >
                            {p.name}
                          </Link>
                          <button
                            type="button"
                            onClick={() => toggleCompare(p.id)}
                            className="text-slate-400 hover:text-red-600"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="py-3 pr-4 font-semibold text-slate-600">Image</td>
                    {comparedProducts.map((p) => (
                      <td key={p.id} className="py-3 px-3">
                        <img
                          src={p.imageUrl}
                          alt={p.name}
                          referrerPolicy="no-referrer"
                          className="w-28 h-20 object-cover rounded-lg border border-slate-200"
                        />
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-3 pr-4 font-semibold text-slate-600">Price</td>
                    {comparedProducts.map((p) => (
                      <td key={p.id} className="py-3 px-3 font-bold text-slate-900 tabular-nums">
                        {formatPkr(p.discountPricePkr && p.discountPricePkr < p.pricePkr ? p.discountPricePkr : p.pricePkr)}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-3 pr-4 font-semibold text-slate-600">Brand / Category</td>
                    {comparedProducts.map((p) => (
                      <td key={p.id} className="py-3 px-3 text-slate-700">
                        {p.brand || 'ASIF Store'} · {p.subcategory}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-3 pr-4 font-semibold text-slate-600">Stock</td>
                    {comparedProducts.map((p) => (
                      <td key={p.id} className="py-3 px-3">
                        <span className={p.stock > 0 ? 'text-emerald-700 font-semibold' : 'text-red-600 font-semibold'}>
                          {p.stock > 0 ? `${p.stock} available` : 'Out of stock'}
                        </span>
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-3 pr-4 font-semibold text-slate-600">Specifications</td>
                    {comparedProducts.map((p) => (
                      <td key={p.id} className="py-3 px-3 text-slate-600">
                        {(p.specs || []).join(' · ') || 'Standard specification'}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-3 pr-4 font-semibold text-slate-600">Actions</td>
                    {comparedProducts.map((p) => {
                      const activePrice =
                        p.discountPricePkr && p.discountPricePkr < p.pricePkr ? p.discountPricePkr : p.pricePkr;
                      return (
                        <td key={p.id} className="py-3 px-3 space-y-2">
                          <button
                            type="button"
                            disabled={p.stock <= 0}
                            onClick={() => addToCart(p)}
                            className="w-full py-2 px-3 bg-blue-700 hover:bg-blue-800 text-white font-semibold rounded-lg"
                          >
                            Add to Cart
                          </button>
                          <a
                            href={buildWhatsAppUrl(
                              siteSettings.whatsappNumber,
                              WHATSAPP_TEMPLATES.directProductOrder({
                                name: p.name,
                                variant: p.variants?.[0],
                                qty: 1,
                                unitPricePkr: activePrice,
                                totalPkr: activePrice,
                              }),
                            )}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg inline-flex items-center justify-center gap-1.5"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>WhatsApp Order</span>
                          </a>
                        </td>
                      );
                    })}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
