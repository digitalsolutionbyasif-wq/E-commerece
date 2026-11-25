import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Trash2, User as UserIcon } from 'lucide-react';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { ProductCard } from '../components/ProductCard';
import { SeoHead } from '../components/SeoHead';
import { useApp } from '../context/AppContext';
import { formatPkr } from '../data/seedCatalog';
import type { StoreCategorySlug } from '../types';

const CATEGORY_LABELS: Record<StoreCategorySlug, string> = {
  electronics: 'Electronics',
  fashion: 'Fashion',
  'kids-toys': 'Kids & Toys',
  'home-accessories': 'Home Accessories',
};

export function WishlistPage() {
  const {
    user,
    authReady,
    signInWithGoogle,
    products,
    wishlist,
    wishlistItems,
    wishlistLoading,
    toggleWishlist,
    clearWishlist,
    addToCart,
    setCartOpen,
  } = useApp();

  const [categoryFilter, setCategoryFilter] = useState<'all' | StoreCategorySlug>('all');

  const resolvedSaved = useMemo(() => {
    const productById = new Map(products.map((p) => [p.id, p]));
    return wishlistItems.map((item) => ({
      item,
      product: productById.get(item.productId) || null,
    }));
  }, [wishlistItems, products]);

  const availableCategories = useMemo(() => {
    const cats = new Set<StoreCategorySlug>();
    for (const entry of resolvedSaved) {
      cats.add(entry.product?.category || entry.item.category);
    }
    return Array.from(cats);
  }, [resolvedSaved]);

  const filteredSaved = useMemo(() => {
    if (categoryFilter === 'all') return resolvedSaved;
    return resolvedSaved.filter(
      (entry) => (entry.product?.category || entry.item.category) === categoryFilter,
    );
  }, [resolvedSaved, categoryFilter]);

  const handleMoveAllToCart = () => {
    let addedCount = 0;
    for (const entry of filteredSaved) {
      if (entry.product && entry.product.stock > 0) {
        addToCart(entry.product);
        addedCount += 1;
      }
    }
    if (addedCount > 0) {
      setCartOpen(true);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      <SeoHead
        title="My Wishlist | Digital E-Commerce by ASIF"
        description="View and manage your saved products across Electronics, Fashion, Kids & Toys, and Home Accessories."
      />
      <Breadcrumbs items={[{ label: 'Wishlist' }]} />

      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="font-display text-3xl font-bold text-slate-900">My Wishlist</h1>
          <p className="mt-1.5 text-sm text-slate-600">
            {user
              ? `${wishlist.length} ${wishlist.length === 1 ? 'item' : 'items'} saved to your account.`
              : 'Sign in with Google to save products across sessions and devices.'}
          </p>
        </div>

        {user && resolvedSaved.length > 0 && (
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={handleMoveAllToCart}
              className="px-4 py-2.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold rounded-lg inline-flex items-center gap-1.5 transition-colors"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Add All In-Stock to Cart</span>
            </button>
            <button
              type="button"
              onClick={() => void clearWishlist()}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg inline-flex items-center gap-1.5 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Wishlist</span>
            </button>
          </div>
        )}
      </div>

      {!authReady ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-sm text-slate-500">
          Checking your account session...
        </div>
      ) : !user ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-10 sm:p-14 text-center max-w-2xl mx-auto space-y-5">
          <div className="w-12 h-12 rounded-xl bg-slate-100 text-blue-700 flex items-center justify-center mx-auto">
            <UserIcon className="w-6 h-6" />
          </div>
          <h2 className="font-display text-2xl font-bold text-slate-900">
            Sign In to View Your Saved Wishlist
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Your wishlist is stored securely in your account so you can save favorite electronics, clothing, STEM toys, and home essentials and return anytime.
          </p>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => void signInWithGoogle()}
              className="px-6 py-3 bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold rounded-lg transition-colors"
            >
              Sign In with Google
            </button>
            <Link
              to="/electronics"
              className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-900 text-sm font-semibold rounded-lg transition-colors"
            >
              Browse Store Catalog
            </Link>
          </div>
        </div>
      ) : wishlistLoading ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-sm text-slate-500">
          Loading your saved wishlist items...
        </div>
      ) : resolvedSaved.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-5">
          <Heart className="w-10 h-10 text-slate-300 mx-auto" />
          <div className="space-y-2 max-w-md mx-auto">
            <h2 className="font-display text-xl font-bold text-slate-900">
              Your Wishlist Is Empty
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Tap the heart icon on any product card or product detail page to save items here for later.
            </p>
          </div>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-2.5">
            <Link
              to="/electronics"
              className="px-4 py-2.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold rounded-lg"
            >
              Shop Electronics
            </Link>
            <Link
              to="/fashion"
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-900 text-xs font-semibold rounded-lg"
            >
              Shop Fashion
            </Link>
            <Link
              to="/kids-toys"
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-900 text-xs font-semibold rounded-lg"
            >
              Shop Kids &amp; Toys
            </Link>
            <Link
              to="/home-accessories"
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-900 text-xs font-semibold rounded-lg"
            >
              Shop Home Accessories
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {availableCategories.length > 1 && (
            <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-xl w-fit">
              <button
                type="button"
                onClick={() => setCategoryFilter('all')}
                className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors ${
                  categoryFilter === 'all'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All ({resolvedSaved.length})
              </button>
              {availableCategories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors ${
                    categoryFilter === cat
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {CATEGORY_LABELS[cat]}
                </button>
              ))}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSaved.map(({ item, product }) =>
              product ? (
                <ProductCard key={item.productId} product={product} />
              ) : (
                <article
                  key={item.productId}
                  className="bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col"
                >
                  <div className="aspect-[4/3] bg-slate-100 overflow-hidden">
                    <img
                      src={item.imageUrl}
                      alt={item.productName}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover opacity-75"
                    />
                  </div>
                  <div className="p-4 flex-1 flex flex-col">
                    <div className="text-xs text-slate-500">
                      {CATEGORY_LABELS[item.category]} · Currently Unavailable
                    </div>
                    <h3 className="mt-1.5 font-display text-base font-semibold text-slate-900">
                      {item.productName}
                    </h3>
                    <div className="mt-2 text-base font-bold text-slate-900 tabular-nums">
                      {formatPkr(item.pricePkr)}
                    </div>
                    <button
                      type="button"
                      onClick={() => void toggleWishlist(item.productId)}
                      className="mt-auto pt-4 w-full py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg"
                    >
                      Remove from Wishlist
                    </button>
                  </div>
                </article>
              ),
            )}
          </div>
        </div>
      )}
    </div>
  );
}
