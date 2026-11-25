import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  CheckCircle2,
  Clock,
  Copy,
  MapPin,
  MessageCircle,
  Package,
  Search,
  ShieldCheck,
  Truck,
  XCircle,
} from 'lucide-react';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { SeoHead } from '../components/SeoHead';
import { useApp } from '../context/AppContext';
import { formatPkr } from '../data/seedCatalog';
import { buildWhatsAppUrl, formatWhatsAppDisplay, WHATSAPP_TEMPLATES } from '../lib/whatsapp';
import type { OrderStatus, OrderTracking } from '../types';

const MILESTONE_STEPS: { key: OrderStatus; label: string; desc: string; icon: React.ComponentType<{ className?: string }> }[] = [
  {
    key: 'Pending',
    label: 'Pending',
    desc: 'Order placed and awaiting verification.',
    icon: Clock,
  },
  {
    key: 'Confirmed',
    label: 'Confirmed',
    desc: 'Verified and queued for packing.',
    icon: ShieldCheck,
  },
  {
    key: 'Shipped',
    label: 'Shipped',
    desc: 'Dispatched via courier for delivery.',
    icon: Truck,
  },
  {
    key: 'Delivered',
    label: 'Delivered',
    desc: 'Successfully delivered to customer.',
    icon: CheckCircle2,
  },
];

function getStepIndex(status: OrderStatus): number {
  if (status === 'Pending') return 0;
  if (status === 'Confirmed' || status === 'Processing') return 1;
  if (status === 'Shipped') return 2;
  if (status === 'Delivered') return 3;
  return -1;
}

function formatFirestoreDate(ts: unknown): string {
  if (!ts) return 'Just now';
  if (typeof ts === 'object' && ts !== null && 'toDate' in ts && typeof (ts as { toDate: () => Date }).toDate === 'function') {
    return (ts as { toDate: () => Date }).toDate().toLocaleString('en-PK', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  }
  return 'Recently updated';
}

export function TrackOrderPage() {
  const { subscribeToOrderTracking, myOrders, siteSettings, showToast } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();

  const initialQuery = (searchParams.get('id') || '').trim().toUpperCase();
  const [orderInput, setOrderInput] = useState(initialQuery);
  const [activeCode, setActiveCode] = useState(initialQuery);
  const [tracking, setTracking] = useState<OrderTracking | null>(null);
  const [loading, setLoading] = useState(Boolean(initialQuery));
  const [notFound, setNotFound] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const whatsappDisplay = formatWhatsAppDisplay(siteSettings.whatsappNumber);

  useEffect(() => {
    const paramId = (searchParams.get('id') || '').trim().toUpperCase();
    if (paramId && paramId !== activeCode) {
      setOrderInput(paramId);
      setActiveCode(paramId);
    }
  }, [searchParams, activeCode]);

  useEffect(() => {
    if (!activeCode) {
      setTracking(null);
      setNotFound(false);
      setErrorMsg('');
      setLoading(false);
      return;
    }

    setLoading(true);
    setNotFound(false);
    setErrorMsg('');

    const unsub = subscribeToOrderTracking(
      activeCode,
      (data) => {
        setLoading(false);
        if (data) {
          setTracking(data);
          setNotFound(false);
        } else {
          // Fallback for signed-in user's own legacy order created prior to tracking projection
          const ownLegacy = myOrders.find((o) => o.orderCode.toUpperCase() === activeCode);
          if (ownLegacy) {
            setTracking({
              orderCode: ownLegacy.orderCode,
              orderId: ownLegacy.id,
              userId: ownLegacy.userId,
              city: ownLegacy.city,
              paymentMethod: ownLegacy.paymentMethod,
              itemCount: ownLegacy.items.reduce((s, i) => s + i.quantity, 0),
              itemSummary: ownLegacy.items.map(
                (i) => `${i.name}${i.variant ? ` (${i.variant})` : ''} × ${i.quantity}`,
              ),
              totalPkr: ownLegacy.totalPkr,
              status: ownLegacy.status,
              createdAt: ownLegacy.createdAt,
              updatedAt: ownLegacy.updatedAt,
            });
            setNotFound(false);
          } else {
            setTracking(null);
            setNotFound(true);
          }
        }
      },
      (errText) => {
        setLoading(false);
        setTracking(null);
        setNotFound(false);
        setErrorMsg(errText);
      },
    );

    return () => unsub();
  }, [activeCode, subscribeToOrderTracking, myOrders]);

  const handleLookup = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = orderInput.trim().toUpperCase();
    if (!cleaned) return;
    setOrderInput(cleaned);
    setActiveCode(cleaned);
    setSearchParams({ id: cleaned });
  };

  const handleSelectQuickOrder = (code: string) => {
    const cleaned = code.trim().toUpperCase();
    setOrderInput(cleaned);
    setActiveCode(cleaned);
    setSearchParams({ id: cleaned });
  };

  const handleCopyTrackingUrl = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      showToast('Tracking link copied to clipboard.', 'success');
    } catch {
      showToast('Copy the tracking URL from your browser address bar.', 'info');
    }
  };

  const stepIdx = tracking ? getStepIndex(tracking.status) : -1;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      <SeoHead
        title="Track Your Order | Real-Time Order Status — Digital E-Commerce by ASIF"
        description="Enter your Digital E-Commerce by ASIF Order ID (e.g. ASIF-123456) to track real-time order progress from Pending and Confirmed to Shipped and Delivered."
        keywords="track order Pakistan, Digital E-Commerce by ASIF order tracking, Bahawalpur delivery status"
      />
      <Breadcrumbs items={[{ label: 'Order Tracking' }]} />

      {/* Search Card */}
      <section className="bg-slate-950 text-white rounded-2xl p-8 sm:p-10 space-y-6">
        <div className="max-w-2xl">
          <div className="text-xs font-semibold text-sky-400">
            Real-Time Dispatch & Delivery Updates
          </div>
          <h1 className="mt-2 font-display text-3xl sm:text-4xl font-bold">
            Track Your Order Status
          </h1>
          <p className="mt-2.5 text-sm sm:text-base text-slate-300 leading-relaxed">
            Enter your Order ID (for example <span className="font-mono-tabular text-white font-semibold">ASIF-123456</span>) to view live progress across Pending, Confirmed, Shipped, and Delivered stages.
          </p>
        </div>

        <form onSubmit={handleLookup} className="flex flex-col sm:flex-row gap-3 max-w-2xl">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              required
              value={orderInput}
              onChange={(e) => setOrderInput(e.target.value)}
              placeholder="Enter Order ID (e.g. ASIF-482910)"
              className="w-full pl-10 pr-4 py-3 text-sm bg-white text-slate-900 placeholder:text-slate-400 rounded-lg font-mono-tabular uppercase focus:outline-none focus:ring-2 focus:ring-sky-400"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors whitespace-nowrap"
          >
            Track Order
          </button>
        </form>

        {myOrders.length > 0 && (
          <div className="pt-2 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-slate-400">Your recent orders:</span>
            {myOrders.slice(0, 4).map((ord) => (
              <button
                key={ord.id}
                type="button"
                onClick={() => handleSelectQuickOrder(ord.orderCode)}
                className={`px-3 py-1 rounded-md font-mono-tabular font-semibold transition-colors ${
                  activeCode === ord.orderCode.toUpperCase()
                    ? 'bg-sky-400 text-slate-950'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                }`}
              >
                {ord.orderCode} · {ord.status}
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Error State */}
      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-900 rounded-xl p-5 text-sm font-medium">
          {errorMsg}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center text-sm text-slate-600">
          Checking live order status for <span className="font-mono-tabular font-semibold">{activeCode}</span>...
        </div>
      )}

      {/* Not Found State */}
      {!loading && notFound && activeCode && (
        <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center space-y-4">
          <Package className="w-10 h-10 text-slate-300 mx-auto" />
          <h2 className="font-display text-xl font-bold text-slate-900">
            No Order Found for &ldquo;{activeCode}&rdquo;
          </h2>
          <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
            Double-check your Order ID (e.g. <span className="font-mono-tabular font-semibold">ASIF-123456</span>). If you placed your order directly via WhatsApp chat, message our team below for instant status.
          </p>
          <div className="pt-2 flex flex-wrap justify-center gap-3">
            <a
              href={buildWhatsAppUrl(
                siteSettings.whatsappNumber,
                WHATSAPP_TEMPLATES.orderInquiry(`Status check for Order ID ${activeCode}`),
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg inline-flex items-center gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Check via WhatsApp ({whatsappDisplay})</span>
            </a>
            <Link
              to="/account"
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-900 text-xs font-semibold rounded-lg"
            >
              View My Account Orders
            </Link>
          </div>
        </div>
      )}

      {/* Real-Time Tracking Result */}
      {!loading && tracking && (
        <section className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
            <div>
              <div className="text-xs font-semibold text-blue-700">Live Real-Time Tracking</div>
              <h2 className="mt-1 font-display text-2xl font-bold text-slate-900 font-mono-tabular">
                {tracking.orderCode}
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Last updated: {formatFirestoreDate(tracking.updatedAt)}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <span
                className={`px-3.5 py-1.5 text-xs font-bold rounded-lg ${
                  tracking.status === 'Delivered'
                    ? 'bg-emerald-100 text-emerald-900'
                    : tracking.status === 'Cancelled'
                      ? 'bg-red-100 text-red-900'
                      : tracking.status === 'Shipped'
                        ? 'bg-sky-100 text-sky-900'
                        : 'bg-blue-100 text-blue-900'
                }`}
              >
                Status: {tracking.status}
              </span>
              <button
                type="button"
                onClick={() => void handleCopyTrackingUrl()}
                className="px-3 py-1.5 border border-slate-200 hover:border-slate-300 text-xs font-semibold text-slate-700 rounded-lg inline-flex items-center gap-1.5"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Link</span>
              </button>
            </div>
          </div>

          {/* Cancelled Banner or 4-Step Progress Timeline */}
          {tracking.status === 'Cancelled' ? (
            <div className="p-5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-red-950">
              <XCircle className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-sm">Order Cancelled</div>
                <p className="text-xs text-red-800 mt-1">
                  {tracking.statusNote || 'This order has been cancelled. Contact us on WhatsApp if you need assistance reordering.'}
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {tracking.status === 'Processing' && (
                <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl text-xs font-medium text-blue-950">
                  Current Stage: <strong>Processing</strong> — Your order is confirmed and currently being packed for courier handover.
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {MILESTONE_STEPS.map((step, idx) => {
                  const Icon = step.icon;
                  const completed = stepIdx >= idx;
                  const isCurrent = stepIdx === idx;
                  return (
                    <div
                      key={step.key}
                      className={`p-4 rounded-xl border transition-colors ${
                        isCurrent
                          ? 'bg-blue-50/70 border-blue-600'
                          : completed
                            ? 'bg-emerald-50/50 border-emerald-200'
                            : 'bg-slate-50 border-slate-200 opacity-70'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div
                          className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                            isCurrent
                              ? 'bg-blue-700 text-white'
                              : completed
                                ? 'bg-emerald-600 text-white'
                                : 'bg-slate-200 text-slate-600'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="text-[11px] font-mono-tabular font-semibold text-slate-500">
                          Step {idx + 1}/4
                        </span>
                      </div>
                      <div className="mt-3 font-display text-sm font-bold text-slate-900">
                        {step.label}
                        {isCurrent && tracking.status === 'Processing' && step.key === 'Confirmed'
                          ? ' · Processing'
                          : ''}
                      </div>
                      <p className="mt-1 text-xs text-slate-600 leading-relaxed">{step.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {tracking.statusNote && tracking.status !== 'Cancelled' && (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-700">
              <strong className="text-slate-900">Latest Dispatch Update: </strong>
              {tracking.statusNote}
            </div>
          )}

          {/* PII-Safe Order Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-200">
            <div className="space-y-3">
              <h3 className="font-display text-base font-bold text-slate-900">
                Items in This Order ({tracking.itemCount})
              </h3>
              <ul className="space-y-2 text-sm text-slate-700">
                {tracking.itemSummary.map((line, i) => (
                  <li key={i} className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                    {line}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-3 text-sm">
              <h3 className="font-display text-base font-bold text-slate-900">Shipment &amp; Payment Summary</h3>
              <div className="flex items-center justify-between text-xs text-slate-600">
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-blue-700" />
                  <span>Destination City</span>
                </span>
                <span className="font-semibold text-slate-900">{tracking.city}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-600">
                <span>Payment Method</span>
                <span className="font-semibold text-slate-900">{tracking.paymentMethod}</span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex items-center justify-between font-bold text-slate-900">
                <span>Total Amount</span>
                <span className="tabular-nums">{formatPkr(tracking.totalPkr)}</span>
              </div>
              <a
                href={buildWhatsAppUrl(
                  siteSettings.whatsappNumber,
                  WHATSAPP_TEMPLATES.orderInquiry(
                    `Order ${tracking.orderCode} (Current status: ${tracking.status})`,
                  ),
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg inline-flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Order Help on WhatsApp ({whatsappDisplay})</span>
              </a>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
