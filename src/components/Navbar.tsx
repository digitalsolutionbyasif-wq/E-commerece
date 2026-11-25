import React, { useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  ChevronDown,
  Heart,
  Menu,
  MessageCircle,
  Search,
  ShieldCheck,
  ShoppingBag,
  User,
  X,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatPkr } from '../data/seedCatalog';
import { buildWhatsAppUrl, WHATSAPP_TEMPLATES } from '../lib/whatsapp';

export function Navbar() {
  const {
    user,
    isStaff,
    signInWithGoogle,
    cartCount,
    setCartOpen,
    wishlist,
    products,
    courses,
    siteSettings,
  } = useApp();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [openMenu, setOpenMenu] = useState<'education' | 'store' | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return { products: [], courses: [] };
    return {
      products: products
        .filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            p.subcategory.toLowerCase().includes(q) ||
            p.category.toLowerCase().includes(q),
        )
        .slice(0, 4),
      courses: courses
        .filter(
          (c) =>
            c.title.toLowerCase().includes(q) ||
            c.track.toLowerCase().includes(q) ||
            c.overview.toLowerCase().includes(q),
        )
        .slice(0, 4),
    };
  }, [searchQuery, products, courses]);

  const closeMenus = () => {
    setMobileOpen(false);
    setOpenMenu(null);
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4 lg:gap-8">
          {/* Zone 1: Single-line Brand Wordmark */}
          <Link
            to="/"
            onClick={closeMenus}
            className="flex items-center gap-2.5 whitespace-nowrap shrink-0 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 rounded-md"
          >
            <svg
              width="30"
              height="30"
              viewBox="0 0 64 64"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
              className="shrink-0"
            >
              <rect width="64" height="64" rx="14" fill="#0B162C" />
              <path
                d="M18 46L30 18h4l12 28h-5.5l-2.7-6.8H26.2L23.5 46H18zm10.1-11.5h7.8L32 24.4l-3.9 10.1z"
                fill="#38BDF8"
              />
            </svg>
            <span className="font-display font-bold text-base sm:text-lg tracking-tight text-slate-900">
              Digital E-Commerce by ASIF
            </span>
          </Link>

          {/* Zone 2: Clean Single-Line Navigation with Mega Dropdowns */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-700">
            <Link
              to="/"
              className={`whitespace-nowrap shrink-0 hover:text-blue-700 transition-colors ${
                location.pathname === '/' ? 'text-blue-700 font-semibold' : ''
              }`}
            >
              Home
            </Link>

            <div
              className="relative"
              onMouseEnter={() => setOpenMenu('education')}
              onMouseLeave={() => setOpenMenu(null)}
            >
              <button
                type="button"
                onClick={() => setOpenMenu(openMenu === 'education' ? null : 'education')}
                className="flex items-center gap-1 whitespace-nowrap shrink-0 hover:text-blue-700 transition-colors py-2"
              >
                <span>Education</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
              {openMenu === 'education' && (
                <div className="absolute left-0 top-full w-72 bg-white border border-slate-200 rounded-xl shadow-lg p-3 z-50">
                  <Link
                    to="/courses"
                    onClick={closeMenus}
                    className="block px-3 py-2.5 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <div className="font-semibold text-slate-900 text-sm">Online Courses</div>
                    <div className="text-xs text-slate-500">Skills Development Academy</div>
                  </Link>
                  <Link
                    to="/tuition"
                    onClick={closeMenus}
                    className="block px-3 py-2.5 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <div className="font-semibold text-slate-900 text-sm">Tuition</div>
                    <div className="text-xs text-slate-500">Home & Online Tuition (Class 5–ADP)</div>
                  </Link>
                  <Link
                    to="/govt-exams"
                    onClick={closeMenus}
                    className="block px-3 py-2.5 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <div className="font-semibold text-slate-900 text-sm">Govt Exam Preparation</div>
                    <div className="text-xs text-slate-500">PPSC, FPSC, FIA, Police, CSS & More</div>
                  </Link>
                  <Link
                    to="/ability-tests"
                    onClick={closeMenus}
                    className="block px-3 py-2.5 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <div className="font-semibold text-slate-900 text-sm">Ability Tests</div>
                    <div className="text-xs text-slate-500">NTS, NAT, GAT, MDCAT, ECAT & Mock MCQ</div>
                  </Link>
                </div>
              )}
            </div>

            <div
              className="relative"
              onMouseEnter={() => setOpenMenu('store')}
              onMouseLeave={() => setOpenMenu(null)}
            >
              <button
                type="button"
                onClick={() => setOpenMenu(openMenu === 'store' ? null : 'store')}
                className="flex items-center gap-1 whitespace-nowrap shrink-0 hover:text-blue-700 transition-colors py-2"
              >
                <span>Shop</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
              {openMenu === 'store' && (
                <div className="absolute left-0 top-full w-72 bg-white border border-slate-200 rounded-xl shadow-lg p-3 z-50">
                  <Link
                    to="/electronics"
                    onClick={closeMenus}
                    className="block px-3 py-2.5 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <div className="font-semibold text-slate-900 text-sm">Electronics</div>
                    <div className="text-xs text-slate-500">Mobile Accessories, Audio & Chargers</div>
                  </Link>
                  <Link
                    to="/fashion"
                    onClick={closeMenus}
                    className="block px-3 py-2.5 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <div className="font-semibold text-slate-900 text-sm">Fashion</div>
                    <div className="text-xs text-slate-500">Ladies, Gents & Kids Clothing</div>
                  </Link>
                  <Link
                    to="/kids-toys"
                    onClick={closeMenus}
                    className="block px-3 py-2.5 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <div className="font-semibold text-slate-900 text-sm">Kids & Toys</div>
                    <div className="text-xs text-slate-500">STEM Kits, Blocks & Learning Games</div>
                  </Link>
                  <Link
                    to="/home-accessories"
                    onClick={closeMenus}
                    className="block px-3 py-2.5 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <div className="font-semibold text-slate-900 text-sm">Home Accessories</div>
                    <div className="text-xs text-slate-500">Kitchen, Decor, Bedroom & Living</div>
                  </Link>
                </div>
              )}
            </div>

            <Link
              to="/track-order"
              className={`whitespace-nowrap shrink-0 hover:text-blue-700 transition-colors ${
                location.pathname === '/track-order' ? 'text-blue-700 font-semibold' : ''
              }`}
            >
              Track Order
            </Link>

            <Link
              to="/about"
              className={`whitespace-nowrap shrink-0 hover:text-blue-700 transition-colors ${
                location.pathname === '/about' ? 'text-blue-700 font-semibold' : ''
              }`}
            >
              About Us
            </Link>

            <Link
              to="/contact"
              className={`whitespace-nowrap shrink-0 hover:text-blue-700 transition-colors ${
                location.pathname === '/contact' ? 'text-blue-700 font-semibold' : ''
              }`}
            >
              Contact Us
            </Link>
          </nav>

          {/* Zone 3: Interactive Storefront Utilities + Primary Action */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              aria-label="Search products and courses"
              className="p-2 text-slate-600 hover:text-blue-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <Search className="w-5 h-5" />
            </button>

            <Link
              to="/wishlist"
              aria-label="Wishlist"
              className="relative p-2 text-slate-600 hover:text-blue-700 hover:bg-slate-100 rounded-lg transition-colors inline-flex"
            >
              <Heart className="w-5 h-5" />
              {wishlist.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-slate-900 text-white text-[11px] font-semibold rounded-full flex items-center justify-center tabular-nums">
                  {wishlist.length}
                </span>
              )}
            </Link>

            <button
              type="button"
              onClick={() => setCartOpen(true)}
              aria-label="Open shopping cart"
              className="relative p-2 text-slate-600 hover:text-blue-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-blue-700 text-white text-[11px] font-semibold rounded-full flex items-center justify-center tabular-nums">
                  {cartCount}
                </span>
              )}
            </button>

            {isStaff && (
              <Link
                to="/admin"
                className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-blue-700" />
                <span>Admin</span>
              </Link>
            )}

            {user ? (
              <Link
                to="/account"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 border border-slate-200 hover:border-slate-300 rounded-lg transition-colors whitespace-nowrap shrink-0"
              >
                <User className="w-3.5 h-3.5" />
                <span className="max-w-[96px] truncate">{user.displayName?.split(' ')[0] || 'Account'}</span>
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => void signInWithGoogle()}
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors whitespace-nowrap shrink-0"
              >
                Sign In
              </button>
            )}

            <a
              href={buildWhatsAppUrl(siteSettings.whatsappNumber, WHATSAPP_TEMPLATES.generalContact())}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Contact on WhatsApp"
              className="hidden xl:inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </a>

            <button
              type="button"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
              className="lg:hidden p-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Drawer */}
        {mobileOpen && (
          <div className="lg:hidden border-t border-slate-200 bg-white px-4 py-4 max-h-[80vh] overflow-y-auto">
            <div className="grid grid-cols-1 gap-1 text-sm font-medium text-slate-800">
              <Link to="/" onClick={closeMenus} className="px-3 py-2 rounded-lg hover:bg-slate-50">Home</Link>
              <Link to="/courses" onClick={closeMenus} className="px-3 py-2 rounded-lg hover:bg-slate-50">Online Courses</Link>
              <Link to="/tuition" onClick={closeMenus} className="px-3 py-2 rounded-lg hover:bg-slate-50">Tuition</Link>
              <Link to="/govt-exams" onClick={closeMenus} className="px-3 py-2 rounded-lg hover:bg-slate-50">Govt Exam Preparation</Link>
              <Link to="/ability-tests" onClick={closeMenus} className="px-3 py-2 rounded-lg hover:bg-slate-50">Ability Tests</Link>
              <Link to="/electronics" onClick={closeMenus} className="px-3 py-2 rounded-lg hover:bg-slate-50">Electronics</Link>
              <Link to="/fashion" onClick={closeMenus} className="px-3 py-2 rounded-lg hover:bg-slate-50">Fashion</Link>
              <Link to="/kids-toys" onClick={closeMenus} className="px-3 py-2 rounded-lg hover:bg-slate-50">Kids & Toys</Link>
              <Link to="/home-accessories" onClick={closeMenus} className="px-3 py-2 rounded-lg hover:bg-slate-50">Home Accessories</Link>
              <Link to="/wishlist" onClick={closeMenus} className="px-3 py-2 rounded-lg hover:bg-slate-50">Wishlist ({wishlist.length})</Link>
              <Link to="/track-order" onClick={closeMenus} className="px-3 py-2 rounded-lg hover:bg-slate-50 text-blue-700 font-semibold">Track Order</Link>
              <Link to="/about" onClick={closeMenus} className="px-3 py-2 rounded-lg hover:bg-slate-50">About Us</Link>
              <Link to="/contact" onClick={closeMenus} className="px-3 py-2 rounded-lg hover:bg-slate-50">Contact Us</Link>
              <div className="pt-3 mt-2 border-t border-slate-200 flex flex-wrap gap-2">
                {user ? (
                  <Link
                    to="/account"
                    onClick={closeMenus}
                    className="px-4 py-2 text-xs font-semibold bg-slate-100 text-slate-900 rounded-lg"
                  >
                    My Account
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      closeMenus();
                      void signInWithGoogle();
                    }}
                    className="px-4 py-2 text-xs font-semibold bg-blue-700 text-white rounded-lg"
                  >
                    Sign In with Google
                  </button>
                )}
                {isStaff && (
                  <Link
                    to="/admin"
                    onClick={closeMenus}
                    className="px-4 py-2 text-xs font-semibold bg-slate-900 text-white rounded-lg"
                  >
                    Admin Dashboard
                  </Link>
                )}
                <a
                  href={buildWhatsAppUrl(siteSettings.whatsappNumber, WHATSAPP_TEMPLATES.generalContact())}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 text-xs font-semibold bg-emerald-600 text-white rounded-lg"
                >
                  WhatsApp Support
                </a>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Live Search Modal */}
      {searchOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-xs flex items-start justify-center pt-16 px-4"
          onClick={() => setSearchOpen(false)}
        >
          <div
            className="w-full max-w-2xl bg-white rounded-xl border border-slate-200 shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-200">
              <Search className="w-5 h-5 text-slate-400 shrink-0" />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search courses (React, SEO, AI) or products (Earbuds, Lawn Suit, STEM)..."
                className="w-full text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="max-h-96 overflow-y-auto p-4 space-y-5">
              {!searchQuery.trim() ? (
                <div className="text-sm text-slate-500 py-6 text-center">
                  Start typing to search across all courses, skills programs, and physical store products.
                </div>
              ) : searchResults.courses.length === 0 && searchResults.products.length === 0 ? (
                <div className="text-sm text-slate-500 py-6 text-center">
                  No matching courses or products found for &ldquo;{searchQuery}&rdquo;.
                </div>
              ) : (
                <>
                  {searchResults.courses.length > 0 && (
                    <div>
                      <div className="text-xs font-semibold text-slate-500 mb-2">Courses</div>
                      <div className="space-y-1.5">
                        {searchResults.courses.map((course) => (
                          <button
                            key={course.id}
                            type="button"
                            onClick={() => {
                              setSearchOpen(false);
                              navigate(`/courses/${course.id}`);
                            }}
                            className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-slate-50 flex items-center justify-between gap-4"
                          >
                            <div>
                              <div className="text-sm font-semibold text-slate-900">{course.title}</div>
                              <div className="text-xs text-slate-500">
                                {course.track} · {course.duration}
                              </div>
                            </div>
                            <span className="text-xs font-semibold text-blue-700 tabular-nums shrink-0">
                              {formatPkr(course.feePkr)}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  {searchResults.products.length > 0 && (
                    <div>
                      <div className="text-xs font-semibold text-slate-500 mb-2">Products</div>
                      <div className="space-y-1.5">
                        {searchResults.products.map((product) => (
                          <button
                            key={product.id}
                            type="button"
                            onClick={() => {
                              setSearchOpen(false);
                              navigate(`/product/${product.id}`);
                            }}
                            className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-slate-50 flex items-center justify-between gap-4"
                          >
                            <div>
                              <div className="text-sm font-semibold text-slate-900">{product.name}</div>
                              <div className="text-xs text-slate-500">
                                {product.subcategory} · {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                              </div>
                            </div>
                            <span className="text-xs font-semibold text-slate-900 tabular-nums shrink-0">
                              {formatPkr(product.discountPricePkr || product.pricePkr)}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
