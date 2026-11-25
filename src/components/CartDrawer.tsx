import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatPkr } from '../data/seedCatalog';
import { buildWhatsAppUrl, formatWhatsAppDisplay, WHATSAPP_TEMPLATES } from '../lib/whatsapp';

export function CartDrawer() {
  const {
    cart,
    cartOpen,
    setCartOpen,
    updateCartQty,
    removeFromCart,
    cartSubtotalPkr,
    cartDiscountPkr,
    cartDeliveryPkr,
    cartTotalPkr,
    siteSettings,
  } = useApp();
  const navigate = useNavigate();

  if (!cartOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/45 backdrop-blur-xs flex justify-end"
      onClick={() => setCartOpen(false)}
    >
      <aside
        className="w-full max-w-md bg-white h-full flex flex-col shadow-2xl border-l border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="w-5 h-5 text-blue-700" />
            <h2 className="font-display font-bold text-base text-slate-900">Shopping Cart</h2>
          </div>
          <button
            type="button"
            onClick={() => setCartOpen(false)}
            aria-label="Close cart"
            className="p-2 text-slate-400 hover:text-slate-700 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {cart.length === 0 ? (
            <div className="text-center py-16">
              <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="mt-3 text-sm font-medium text-slate-700">Your cart is empty</p>
              <p className="mt-1 text-xs text-slate-500">
                Explore electronics, fashion, kids toys, and home accessories.
              </p>
              <button
                type="button"
                onClick={() => {
                  setCartOpen(false);
                  navigate('/electronics');
                }}
                className="mt-5 px-4 py-2 bg-blue-700 text-white text-xs font-semibold rounded-lg hover:bg-blue-800"
              >
                Browse Store
              </button>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={`${item.productId}-${item.variant}`}
                className="flex gap-4 pb-4 border-b border-slate-100"
              >
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  referrerPolicy="no-referrer"
                  className="w-20 h-20 object-cover rounded-lg border border-slate-200 bg-slate-100 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-semibold text-slate-900 line-clamp-2">{item.name}</h3>
                    <button
                      type="button"
                      onClick={() => removeFromCart(item.productId, item.variant)}
                      aria-label="Remove item"
                      className="text-slate-400 hover:text-red-600 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  {item.variant && (
                    <div className="text-xs text-slate-500 mt-0.5">{item.variant}</div>
                  )}
                  <div className="mt-3 flex items-center justify-between">
                    <div className="inline-flex items-center border border-slate-200 rounded-lg">
                      <button
                        type="button"
                        onClick={() => updateCartQty(item.productId, item.variant, item.quantity - 1)}
                        className="p-1.5 text-slate-600 hover:text-slate-900"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-2.5 text-xs font-semibold tabular-nums">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => updateCartQty(item.productId, item.variant, item.quantity + 1)}
                        className="p-1.5 text-slate-600 hover:text-slate-900"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="text-sm font-bold text-slate-900 tabular-nums">
                      {formatPkr(item.pricePkr * item.quantity)}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div className="p-6 border-t border-slate-200 bg-slate-50 space-y-3">
            <div className="flex justify-between text-xs text-slate-600">
              <span>Subtotal</span>
              <span className="tabular-nums font-medium">{formatPkr(cartSubtotalPkr)}</span>
            </div>
            {cartDiscountPkr > 0 && (
              <div className="flex justify-between text-xs text-emerald-700">
                <span>Discount Savings</span>
                <span className="tabular-nums font-medium">-{formatPkr(cartDiscountPkr)}</span>
              </div>
            )}
            <div className="flex justify-between text-xs text-slate-600">
              <span>Delivery (Free over PKR 5,000)</span>
              <span className="tabular-nums font-medium">
                {cartDeliveryPkr === 0 ? 'Free' : formatPkr(cartDeliveryPkr)}
              </span>
            </div>
            <div className="pt-2 border-t border-slate-200 flex justify-between text-sm font-bold text-slate-900">
              <span>Total</span>
              <span className="tabular-nums">{formatPkr(cartTotalPkr)}</span>
            </div>
            <button
              type="button"
              onClick={() => {
                setCartOpen(false);
                navigate('/checkout');
              }}
              className="w-full py-3 bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold rounded-lg transition-colors"
            >
              Proceed to Checkout
            </button>
            <a
              href={buildWhatsAppUrl(
                siteSettings.whatsappNumber,
                WHATSAPP_TEMPLATES.directCartOrder({
                  items: cart,
                  subtotalPkr: cartSubtotalPkr,
                  discountPkr: cartDiscountPkr,
                  deliveryPkr: cartDeliveryPkr,
                  totalPkr: cartTotalPkr,
                }),
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-colors inline-flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Order Cart on WhatsApp ({formatWhatsAppDisplay(siteSettings.whatsappNumber)})</span>
            </a>
          </div>
        )}
      </aside>
    </div>
  );
}
