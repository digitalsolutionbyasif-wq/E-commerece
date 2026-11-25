import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { LogOut, MessageCircle, Package, Printer, ShieldCheck, Truck, User as UserIcon } from 'lucide-react';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { ProductCard } from '../components/ProductCard';
import { SeoHead } from '../components/SeoHead';
import { useApp } from '../context/AppContext';
import { formatPkr } from '../data/seedCatalog';
import { buildWhatsAppUrl, WHATSAPP_TEMPLATES } from '../lib/whatsapp';

export function AccountPage() {
  const {
    user,
    userProfile,
    userPrivate,
    isStaff,
    signInWithGoogle,
    signOutUser,
    saveUserProfileInfo,
    myOrders,
    cancelMyOrder,
    myEnrollments,
    myTuitionRequests,
    myTestAttempts,
    wishlist,
    products,
    siteSettings,
  } = useApp();

  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab');
  const [tab, setTab] = useState<'orders' | 'learning' | 'wishlist' | 'profile'>(
    initialTab === 'wishlist' || initialTab === 'learning' || initialTab === 'profile'
      ? initialTab
      : 'orders',
  );
  const [displayName, setDisplayName] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Bahawalpur');
  const [postalCode, setPostalCode] = useState('');

  useEffect(() => {
    setDisplayName(userProfile?.displayName || user?.displayName || '');
    setPhone(userPrivate?.phone || '');
    setWhatsapp(userPrivate?.whatsapp || '');
    setAddress(userPrivate?.address || '');
    setCity(userPrivate?.city || 'Bahawalpur');
    setPostalCode(userPrivate?.postalCode || '');
  }, [userProfile, userPrivate, user]);

  const savedProducts = products.filter((p) => wishlist.includes(p.id));

  if (!user) {
    return (
      <div className="max-w-xl mx-auto px-4 sm:px-6 py-20 text-center space-y-5">
        <div className="w-12 h-12 rounded-xl bg-slate-100 text-blue-700 flex items-center justify-center mx-auto">
          <UserIcon className="w-6 h-6" />
        </div>
        <h1 className="font-display text-2xl font-bold text-slate-900">
          Customer & Student Account
        </h1>
        <p className="text-sm text-slate-600 leading-relaxed">
          Sign in with your Google account to track order statuses, view course enrollments, check tuition teacher assignments, and save MCQ mock test scores.
        </p>
        <button
          type="button"
          onClick={() => void signInWithGoogle()}
          className="px-6 py-3 bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold rounded-lg transition-colors"
        >
          Sign In with Google
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      <SeoHead
        title="Customer & Student Account | Digital E-Commerce by ASIF"
        description="Track orders, print receipts, check course enrollments, and manage delivery details."
      />
      <Breadcrumbs items={[{ label: 'My Account' }]} />

      <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900">
            {userProfile?.displayName || user.displayName || 'Account'}
          </h1>
          <div className="mt-1 text-xs text-slate-500 flex items-center gap-2">
            <span>{user.email}</span>
            <span aria-hidden="true">·</span>
            <span className="capitalize">{userProfile?.role || 'customer'}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {isStaff && (
            <Link
              to="/admin"
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg inline-flex items-center gap-1.5"
            >
              <ShieldCheck className="w-4 h-4 text-sky-400" />
              <span>Admin Dashboard</span>
            </Link>
          )}
          <button
            type="button"
            onClick={() => void signOutUser()}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg inline-flex items-center gap-1.5"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1.5 bg-slate-100 p-1 rounded-xl w-fit">
        {[
          { id: 'orders', label: `Orders (${myOrders.length})` },
          { id: 'learning', label: `Courses & Tuition (${myEnrollments.length + myTuitionRequests.length})` },
          { id: 'wishlist', label: `Wishlist (${savedProducts.length})` },
          { id: 'profile', label: 'Profile & Delivery' },
        ].map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id as typeof tab)}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
              tab === item.id ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {tab === 'orders' && (
        <section className="space-y-4">
          {myOrders.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl p-10 text-center text-sm text-slate-500">
              <Package className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              No orders placed yet.
            </div>
          ) : (
            myOrders.map((ord) => (
              <div key={ord.id} className="bg-white border border-slate-200 rounded-xl p-6 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <div>
                    <span className="font-mono-tabular font-bold text-slate-900">{ord.orderCode}</span>
                    <span className="mx-2 text-slate-300">·</span>
                    <span className="text-xs text-slate-500">{ord.paymentMethod}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-100 text-slate-900">
                      Status: {ord.status}
                    </span>
                    {ord.status === 'Pending' && (
                      <button
                        type="button"
                        onClick={() => void cancelMyOrder(ord.id)}
                        className="text-xs font-semibold text-red-600 hover:underline"
                      >
                        Cancel Order
                      </button>
                    )}
                  </div>
                </div>
                <div className="text-sm text-slate-700 space-y-1">
                  {ord.items.map((it, idx) => (
                    <div key={idx} className="flex justify-between">
                      <span>{it.name} ({it.variant}) × {it.quantity}</span>
                      <span className="tabular-nums font-medium">{formatPkr(it.unitPricePkr * it.quantity)}</span>
                    </div>
                  ))}
                </div>
                <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-sm font-bold text-slate-900">
                  <span>Deliver to: {ord.deliveryAddress}, {ord.city}</span>
                  <div className="flex flex-wrap items-center gap-3">
                    <Link
                      to={`/track-order?id=${encodeURIComponent(ord.orderCode)}`}
                      className="text-xs font-semibold text-blue-700 hover:underline inline-flex items-center gap-1"
                    >
                      <Truck className="w-3.5 h-3.5" />
                      <span>Track Status</span>
                    </Link>
                    <a
                      href={buildWhatsAppUrl(
                        siteSettings.whatsappNumber,
                        WHATSAPP_TEMPLATES.orderInquiry(`Order ${ord.orderCode} (${formatPkr(ord.totalPkr)})`),
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-semibold text-emerald-700 hover:underline inline-flex items-center gap-1"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>WhatsApp Help</span>
                    </a>
                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="text-xs font-semibold text-slate-600 hover:text-slate-900 inline-flex items-center gap-1"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Print Receipt</span>
                    </button>
                    <span className="tabular-nums">{formatPkr(ord.totalPkr)}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </section>
      )}

      {tab === 'learning' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <section className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
            <h2 className="font-display text-lg font-bold text-slate-900">Course Enrollments</h2>
            {myEnrollments.length === 0 ? (
              <p className="text-sm text-slate-500">No course enrollments yet.</p>
            ) : (
              myEnrollments.map((enr) => (
                <div key={enr.id} className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-sm">
                  <div className="font-semibold text-slate-900">{enr.courseTitle}</div>
                  <div className="mt-1 text-xs text-slate-600">
                    {enr.learningMode} · Status: <strong>{enr.status}</strong>
                  </div>
                </div>
              ))
            )}
          </section>

          <section className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
            <h2 className="font-display text-lg font-bold text-slate-900">Tuition & Mock Test History</h2>
            {myTuitionRequests.map((tr) => (
              <div key={tr.id} className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-sm">
                <div className="font-semibold text-slate-900">{tr.className} — {tr.subject}</div>
                <div className="mt-1 text-xs text-slate-600">
                  {tr.tuitionMode} · Status: <strong>{tr.status}</strong>
                  {tr.assignedTeacher ? ` · Teacher: ${tr.assignedTeacher}` : ''}
                </div>
              </div>
            ))}
            {myTestAttempts.map((att) => (
              <div key={att.id} className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-sm">
                <div className="font-semibold text-slate-900">{att.testTitle}</div>
                <div className="mt-1 text-xs text-slate-600 font-mono-tabular">
                  Score: {att.correctCount}/{att.totalQuestions} ({att.scorePercent}%)
                </div>
              </div>
            ))}
            {myTuitionRequests.length === 0 && myTestAttempts.length === 0 && (
              <p className="text-sm text-slate-500">No tuition requests or mock test attempts recorded yet.</p>
            )}
          </section>
        </div>
      )}

      {tab === 'wishlist' && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-slate-900">
              Saved Wishlist ({savedProducts.length})
            </h2>
            <Link
              to="/wishlist"
              className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold rounded-lg"
            >
              Open Full Wishlist Page
            </Link>
          </div>
          {savedProducts.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl p-10 text-center text-sm text-slate-500">
              No saved items in your wishlist.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </section>
      )}

      {tab === 'profile' && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void saveUserProfileInfo(displayName, {
              email: user.email || '',
              phone,
              whatsapp,
              address,
              city,
              postalCode,
            });
          }}
          className="bg-white border border-slate-200 rounded-xl p-6 max-w-2xl grid grid-cols-1 sm:grid-cols-2 gap-4"
        >
          <div className="sm:col-span-2">
            <h2 className="font-display text-lg font-bold text-slate-900">Saved Contact & Delivery Address</h2>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Display Name</label>
            <input
              type="text"
              required
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">WhatsApp Number</label>
            <input
              type="tel"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">City</label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1">Delivery Address</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
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
          <div className="sm:col-span-2 pt-2">
            <button
              type="submit"
              className="px-6 py-2.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold rounded-lg"
            >
              Save Profile
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
