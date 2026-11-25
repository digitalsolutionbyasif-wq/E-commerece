import React, { useEffect } from 'react';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import { CartDrawer } from './components/CartDrawer';
import { CompareBarModal } from './components/CompareBarModal';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Footer } from './components/Footer';
import { Navbar } from './components/Navbar';
import { QuickViewModal } from './components/QuickViewModal';
import { WhatsAppFloat } from './components/WhatsAppFloat';
import { AppProvider, useApp } from './context/AppContext';
import { AbilityTestsPage } from './pages/AbilityTestsPage';
import { AboutPage } from './pages/AboutPage';
import { AccountPage } from './pages/AccountPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { ContactPage } from './pages/ContactPage';
import { CourseDetailPage } from './pages/CourseDetailPage';
import { CoursesPage } from './pages/CoursesPage';
import { GovtExamsPage } from './pages/GovtExamsPage';
import { HomePage } from './pages/HomePage';
import { PolicyPage } from './pages/PolicyPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { StoreCategoryPage } from './pages/StoreCategoryPage';
import { TrackOrderPage } from './pages/TrackOrderPage';
import { TuitionPage } from './pages/TuitionPage';
import { WishlistPage } from './pages/WishlistPage';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function AppShell() {
  const { toast, mapsQuotaExceeded } = useApp();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <ScrollToTop />

      {mapsQuotaExceeded && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2.5 text-xs md:text-sm text-center sticky top-0 z-50 shadow-sm">
          <span>
            Google Maps Platform quota reached. If you are the app owner, visit{' '}
            <a
              href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-semibold text-amber-950 hover:text-amber-800"
            >
              maps developer site
            </a>{' '}
            for instructions to update your account.
          </span>
        </div>
      )}

      <Navbar />

      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/courses" element={<CoursesPage />} />
          <Route path="/courses/:id" element={<CourseDetailPage />} />
          <Route path="/tuition" element={<TuitionPage />} />
          <Route path="/govt-exams" element={<GovtExamsPage />} />
          <Route path="/ability-tests" element={<AbilityTestsPage />} />

          <Route path="/electronics" element={<StoreCategoryPage category="electronics" />} />
          <Route path="/fashion" element={<StoreCategoryPage category="fashion" />} />
          <Route path="/kids-toys" element={<StoreCategoryPage category="kids-toys" />} />
          <Route path="/home-accessories" element={<StoreCategoryPage category="home-accessories" />} />
          <Route path="/product/:id" element={<ProductDetailPage />} />

          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="/track-order" element={<TrackOrderPage />} />
          <Route path="/account" element={<AccountPage />} />
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/policies/:type" element={<PolicyPage />} />
          <Route path="*" element={<HomePage />} />
        </Routes>
      </main>

      <Footer />
      <CartDrawer />
      <QuickViewModal />
      <CompareBarModal />
      <WhatsAppFloat />

      {toast && (
        <div
          role="status"
          className={`fixed bottom-5 left-5 z-50 max-w-sm px-4 py-3 rounded-xl shadow-lg text-xs font-semibold border ${
            toast.tone === 'success'
              ? 'bg-emerald-950 text-white border-emerald-800'
              : toast.tone === 'error'
                ? 'bg-red-950 text-white border-red-800'
                : 'bg-slate-900 text-white border-slate-700'
          }`}
        >
          {toast.message}
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AppProvider>
          <AppShell />
        </AppProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
