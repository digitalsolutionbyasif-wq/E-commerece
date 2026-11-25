import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Info, MessageCircle, Tag } from 'lucide-react';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { SeoHead } from '../components/SeoHead';
import { useApp } from '../context/AppContext';
import { formatPkr } from '../data/seedCatalog';
import { buildWhatsAppUrl, formatWhatsAppDisplay, WHATSAPP_TEMPLATES } from '../lib/whatsapp';
import type { PaymentMethod } from '../types';

export function CheckoutPage() {
  const {
    cart,
    cartSubtotalPkr,
    cartDiscountPkr,
    cartDeliveryPkr,
    user,
    userPrivate,
    siteSettings,
    placeOrder,
    showToast,
  } = useApp();

  const [customerName, setCustomerName] = useState(user?.displayName || '');
  const [phone, setPhone] = useState(userPrivate?.phone || '');
  const [whatsapp, setWhatsapp] = useState(userPrivate?.whatsapp || '');
  const [email, setEmail] = useState(user?.email || userPrivate?.email || '');
  const [deliveryAddress, setDeliveryAddress] = useState(userPrivate?.address || '');
  const [city, setCity] = useState(userPrivate?.city || 'Bahawalpur');
  const [postalCode, setPostalCode] = useState(userPrivate?.postalCode || '63100');
  const [orderNotes, setOrderNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Cash on Delivery');
  const [paymentReference, setPaymentReference] = useState('');
  const [promoInput, setPromoInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [confirmedOrderCode, setConfirmedOrderCode] = useState('');

  const netSubtotal = Math.max(0, cartSubtotalPkr - cartDiscountPkr);
  const promoDiscountPkr =
    appliedPromo === 'ASIF10'
      ? Math.round(netSubtotal * 0.1)
      : appliedPromo === 'BAHAWALPUR250'
        ? Math.min(250, netSubtotal)
        : 0;
  const totalDiscountPkr = cartDiscountPkr + promoDiscountPkr;
  const finalTotalPkr = Math.max(0, netSubtotal - promoDiscountPkr) + cartDeliveryPkr;
  const whatsappDisplay = formatWhatsAppDisplay(siteSettings.whatsappNumber);

  const handleApplyPromo = () => {
    const code = promoInput.trim().toUpperCase();
    if (!code) return;
    if (code === 'ASIF10' || code === 'BAHAWALPUR250') {
      setAppliedPromo(code);
      showToast(`Promo code ${code} applied!`, 'success');
    } else {
      showToast('Invalid promo code. Try ASIF10 or BAHAWALPUR250.', 'error');
    }
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;
    setSubmitting(true);
    try {
      const code = await placeOrder({
        customerName,
        phone,
        whatsapp,
        email,
        deliveryAddress,
        city,
        postalCode,
        orderNotes: appliedPromo ? `${orderNotes ? `${orderNotes} | ` : ''}Promo: ${appliedPromo}` : orderNotes,
        paymentMethod,
        paymentReference: paymentMethod === 'Cash on Delivery' ? '' : paymentReference,
        items: cart.map((i) => ({
          productId: i.productId,
          name: i.name,
          variant: i.variant,
          quantity: i.quantity,
          unitPricePkr: i.pricePkr,
        })),
        subtotalPkr: cartSubtotalPkr,
        discountPkr: totalDiscountPkr,
        deliveryFeePkr: cartDeliveryPkr,
        totalPkr: finalTotalPkr,
      });
      setConfirmedOrderCode(code);
    } finally {
      setSubmitting(false);
    }
  };

  if (confirmedOrderCode) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16">
        <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center space-y-4">
          <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
          <h1 className="font-display text-2xl font-bold text-slate-900">
            Order Confirmed — {confirmedOrderCode}
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            Thank you for shopping with Digital E-Commerce by ASIF. Your order is now <strong>Pending</strong> verification. Use your Order ID above to view real-time dispatch updates anytime.
          </p>
          <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
            <Link
              to={`/track-order?id=${encodeURIComponent(confirmedOrderCode)}`}
              className="px-5 py-2.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold rounded-lg"
            >
              Track Order Live
            </Link>
            <Link
              to="/account"
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-900 text-xs font-semibold rounded-lg"
            >
              View in Account
            </Link>
            <a
              href={buildWhatsAppUrl(
                siteSettings.whatsappNumber,
                WHATSAPP_TEMPLATES.orderInquiry(`Order ${confirmedOrderCode}`),
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg inline-flex items-center gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Share Order on WhatsApp</span>
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      <SeoHead
        title="Checkout | Digital E-Commerce by ASIF"
        description="Complete your order with Cash on Delivery, Bank Transfer, Easypaisa, JazzCash, or order directly on WhatsApp 0300-6316551."
      />
      <Breadcrumbs items={[{ label: 'Checkout' }]} />

      <h1 className="font-display text-3xl font-bold text-slate-900">Checkout</h1>

      {cart.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
          <p className="text-sm text-slate-600">Your shopping cart is currently empty.</p>
          <Link
            to="/electronics"
            className="mt-4 inline-block px-5 py-2.5 bg-blue-700 text-white text-xs font-semibold rounded-lg"
          >
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <form
            onSubmit={(e) => void handleCheckout(e)}
            className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6"
          >
            <h2 className="font-display text-lg font-bold text-slate-900">
              Customer & Delivery Details
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Customer Name</label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="03XX-XXXXXXX"
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">WhatsApp Number</label>
                <input
                  type="tel"
                  required
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="03XX-XXXXXXX"
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Complete Delivery Address</label>
                <input
                  type="text"
                  required
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  placeholder="House / Street / Sector / Mohalla"
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">City</label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Postal Code</label>
                <input
                  type="text"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Order Notes (Optional)</label>
                <textarea
                  rows={2}
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  placeholder="Delivery timing instructions or landmarks..."
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 space-y-4">
              <h2 className="font-display text-lg font-bold text-slate-900">Payment Method</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {(['Cash on Delivery', 'Bank Transfer', 'Easypaisa', 'JazzCash'] as PaymentMethod[]).map((method) => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setPaymentMethod(method)}
                    className={`px-3 py-2.5 text-xs font-semibold rounded-lg border text-center transition-colors ${
                      paymentMethod === method
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-slate-50 text-slate-800 border-slate-200 hover:border-slate-400'
                    }`}
                  >
                    {method}
                  </button>
                ))}
              </div>

              {paymentMethod !== 'Cash on Delivery' && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl space-y-3 text-xs text-blue-950">
                  <div className="flex items-start gap-2">
                    <Info className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
                    <div>
                      <strong>Manual {paymentMethod} Transfer Instructions:</strong> Direct automated gateway credentials are not yet configured. Confirm the official account title/IBAN or mobile wallet number via WhatsApp before sending funds, then enter your Transaction Reference ID (TID) below.
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-800 mb-1">
                      Transaction Reference / TID
                    </label>
                    <input
                      type="text"
                      required
                      value={paymentReference}
                      onChange={(e) => setPaymentReference(e.target.value)}
                      placeholder="Enter bank or wallet TID"
                      className="w-full px-3 py-2 text-sm bg-white border border-blue-200 rounded-lg"
                    />
                  </div>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-60"
            >
              {submitting ? 'Placing Order...' : `Place Order (${formatPkr(finalTotalPkr)})`}
            </button>
          </form>

          <aside className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
            <h2 className="font-display text-lg font-bold text-slate-900">Order Summary</h2>
            <div className="divide-y divide-slate-100">
              {cart.map((item) => (
                <div key={`${item.productId}-${item.variant}`} className="py-3 flex justify-between gap-3 text-sm">
                  <div>
                    <div className="font-semibold text-slate-900">{item.name}</div>
                    <div className="text-xs text-slate-500">
                      {item.variant} × {item.quantity}
                    </div>
                  </div>
                  <div className="font-semibold text-slate-900 tabular-nums shrink-0">
                    {formatPkr(item.pricePkr * item.quantity)}
                  </div>
                </div>
              ))}
            </div>

            {/* Promo Code Box */}
            <div className="pt-3 border-t border-slate-200 space-y-2">
              <label className="text-xs font-semibold text-slate-700 inline-flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-blue-700" />
                <span>Promo Code (Try ASIF10 or BAHAWALPUR250)</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={promoInput}
                  onChange={(e) => setPromoInput(e.target.value)}
                  placeholder="Enter promo code"
                  className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg uppercase"
                />
                <button
                  type="button"
                  onClick={handleApplyPromo}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg"
                >
                  Apply
                </button>
              </div>
              {appliedPromo && (
                <div className="text-xs text-emerald-700 font-medium flex items-center justify-between">
                  <span>Applied: {appliedPromo}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setAppliedPromo('');
                      setPromoInput('');
                    }}
                    className="underline text-slate-500"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-200 space-y-2 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="tabular-nums font-medium">{formatPkr(cartSubtotalPkr)}</span>
              </div>
              {totalDiscountPkr > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Total Savings {appliedPromo ? `(${appliedPromo})` : ''}</span>
                  <span className="tabular-nums font-medium">-{formatPkr(totalDiscountPkr)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Delivery Charges</span>
                <span className="tabular-nums font-medium">
                  {cartDeliveryPkr === 0 ? 'Free' : formatPkr(cartDeliveryPkr)}
                </span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between text-base font-bold text-slate-900">
                <span>Total Payable</span>
                <span className="tabular-nums">{formatPkr(finalTotalPkr)}</span>
              </div>
            </div>

            <a
              href={buildWhatsAppUrl(
                siteSettings.whatsappNumber,
                WHATSAPP_TEMPLATES.directCartOrder({
                  items: cart,
                  subtotalPkr: cartSubtotalPkr,
                  discountPkr: totalDiscountPkr,
                  deliveryPkr: cartDeliveryPkr,
                  totalPkr: finalTotalPkr,
                  customerName: customerName || undefined,
                  phone: phone || whatsapp || undefined,
                  address: deliveryAddress || undefined,
                  city: city || undefined,
                  paymentMethod,
                }),
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg inline-flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Order Directly on WhatsApp ({whatsappDisplay})</span>
            </a>
          </aside>
        </div>
      )}
    </div>
  );
}
