import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut, type User } from 'firebase/auth';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import {
  auth,
  BOOTSTRAPPED_ADMIN_EMAIL,
  db,
  googleProvider,
  handleFirestoreError,
  OperationType,
} from '../lib/firebase';
import {
  DEFAULT_SITE_SETTINGS,
  SAMPLE_DEMO_REVIEWS,
  SEED_COURSES,
  SEED_MCQS,
  SEED_PRODUCTS,
} from '../data/seedCatalog';
import type {
  CartItem,
  CategorySeo,
  CategorySeoSlug,
  ContactMessage,
  Course,
  Enrollment,
  McqQuestion,
  NewsletterSubscriber,
  Order,
  OrderStatus,
  OrderTracking,
  Product,
  Review,
  ReviewStatus,
  SiteSettings,
  TestAttempt,
  TuitionRequest,
  TuitionStatus,
  UserPrivateInfo,
  UserProfile,
  WishlistItem,
} from '../types';

interface ToastState {
  id: number;
  message: string;
  tone: 'success' | 'error' | 'info';
}

interface AppContextValue {
  user: User | null;
  authReady: boolean;
  userProfile: UserProfile | null;
  userPrivate: UserPrivateInfo | null;
  isAdmin: boolean;
  isStaff: boolean;
  signInWithGoogle: () => Promise<User | null>;
  signOutUser: () => Promise<void>;

  products: Product[];
  courses: Course[];
  mcqs: McqQuestion[];
  siteSettings: SiteSettings;
  categorySeoMap: Partial<Record<CategorySeoSlug, CategorySeo>>;
  approvedReviews: Review[];

  myOrders: Order[];
  myEnrollments: Enrollment[];
  myTuitionRequests: TuitionRequest[];
  myTestAttempts: TestAttempt[];

  adminOrders: Order[];
  adminEnrollments: Enrollment[];
  adminTuitionRequests: TuitionRequest[];
  adminReviews: Review[];
  adminMessages: ContactMessage[];
  adminSubscribers: NewsletterSubscriber[];

  cart: CartItem[];
  cartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  addToCart: (product: Product, variant?: string, qty?: number) => void;
  removeFromCart: (productId: string, variant?: string) => void;
  updateCartQty: (productId: string, variant: string | undefined, qty: number) => void;
  clearCart: () => void;
  cartSubtotalPkr: number;
  cartDiscountPkr: number;
  cartDeliveryPkr: number;
  cartTotalPkr: number;
  cartCount: number;

  wishlist: string[];
  wishlistItems: WishlistItem[];
  wishlistLoading: boolean;
  toggleWishlist: (productId: string) => Promise<void>;
  clearWishlist: () => Promise<void>;

  compareIds: string[];
  toggleCompare: (productId: string) => void;
  clearCompare: () => void;
  compareOpen: boolean;
  setCompareOpen: (open: boolean) => void;

  recentlyViewedIds: string[];
  markProductViewed: (productId: string) => void;

  quickViewProduct: Product | null;
  setQuickViewProduct: (product: Product | null) => void;

  toast: ToastState | null;
  showToast: (message: string, tone?: 'success' | 'error' | 'info') => void;
  mapsQuotaExceeded: boolean;

  placeOrder: (payload: Omit<Order, 'id' | 'orderCode' | 'userId' | 'status' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  cancelMyOrder: (orderId: string) => Promise<void>;
  subscribeToOrderTracking: (
    orderCode: string,
    onData: (tracking: OrderTracking | null) => void,
    onError: (msg: string) => void,
  ) => () => void;
  submitEnrollment: (payload: Omit<Enrollment, 'id' | 'userId' | 'status' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  submitTuitionRequest: (payload: Omit<TuitionRequest, 'id' | 'userId' | 'status' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  saveTestAttempt: (payload: Omit<TestAttempt, 'id' | 'userId' | 'createdAt'>) => Promise<void>;
  submitReview: (payload: Omit<Review, 'id' | 'userId' | 'status' | 'verifiedPurchase' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  publishAdminReview: (payload: Omit<Review, 'id' | 'userId' | 'status' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  submitContactMessage: (payload: Omit<ContactMessage, 'id' | 'userId' | 'status' | 'createdAt'>) => Promise<void>;
  subscribeNewsletter: (email: string, source?: string) => Promise<{ alreadySubscribed: boolean; message: string }>;
  saveUserProfileInfo: (displayName: string, privateInfo: Partial<UserPrivateInfo>) => Promise<void>;

  // Admin actions
  seedDemoCatalogToFirestore: () => Promise<void>;
  upsertProduct: (product: Omit<Product, 'createdAt' | 'updatedAt'>) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
  upsertCourse: (course: Omit<Course, 'createdAt' | 'updatedAt'>) => Promise<void>;
  deleteCourse: (courseId: string) => Promise<void>;
  addMcqQuestion: (mcq: Omit<McqQuestion, 'id' | 'createdAt'>) => Promise<void>;
  deleteMcqQuestion: (questionId: string) => Promise<void>;
  updateOrderStatus: (orderId: string, status: OrderStatus, statusNote?: string) => Promise<void>;
  updateTuitionRequest: (requestId: string, status: TuitionStatus, assignedTeacher?: string) => Promise<void>;
  updateEnrollmentStatus: (enrollmentId: string, status: Enrollment['status']) => Promise<void>;
  moderateReview: (reviewId: string, status: ReviewStatus) => Promise<void>;
  updateSiteSettings: (settings: SiteSettings) => Promise<void>;
  upsertCategorySeo: (seo: Omit<CategorySeo, 'updatedAt'>) => Promise<void>;
  deleteSubscriber: (subId: string) => Promise<void>;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

const CART_STORAGE_KEY = 'asif_ecommerce_cart_v1';
const RECENT_STORAGE_KEY = 'asif_ecommerce_recent_v1';

function sanitizeId(raw: string): string {
  return raw.replace(/[^a-zA-Z0-9_-]/g, '-').slice(0, 120) || `id-${Date.now()}`;
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userPrivate, setUserPrivate] = useState<UserPrivateInfo | null>(null);
  const [isAdminDoc, setIsAdminDoc] = useState(false);

  const [fsProducts, setFsProducts] = useState<Product[] | null>(null);
  const [fsCourses, setFsCourses] = useState<Course[] | null>(null);
  const [fsMcqs, setFsMcqs] = useState<McqQuestion[] | null>(null);
  const [fsSettings, setFsSettings] = useState<SiteSettings | null>(null);
  const [categorySeoMap, setCategorySeoMap] = useState<Partial<Record<CategorySeoSlug, CategorySeo>>>({});
  const [fsApprovedReviews, setFsApprovedReviews] = useState<Review[] | null>(null);

  const [myOrders, setMyOrders] = useState<Order[]>([]);
  const [myEnrollments, setMyEnrollments] = useState<Enrollment[]>([]);
  const [myTuitionRequests, setMyTuitionRequests] = useState<TuitionRequest[]>([]);
  const [myTestAttempts, setMyTestAttempts] = useState<TestAttempt[]>([]);

  const [adminOrders, setAdminOrders] = useState<Order[]>([]);
  const [adminEnrollments, setAdminEnrollments] = useState<Enrollment[]>([]);
  const [adminTuitionRequests, setAdminTuitionRequests] = useState<TuitionRequest[]>([]);
  const [adminReviews, setAdminReviews] = useState<Review[]>([]);
  const [adminMessages, setAdminMessages] = useState<ContactMessage[]>([]);
  const [adminSubscribers, setAdminSubscribers] = useState<NewsletterSubscriber[]>([]);

  const [cartOpen, setCartOpen] = useState(false);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [compareOpen, setCompareOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [mapsQuotaExceeded, setMapsQuotaExceeded] = useState(false);

  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  const [recentlyViewedIds, setRecentlyViewedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(RECENT_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch {
      // ignore storage errors
    }
  }, [cart]);

  useEffect(() => {
    try {
      localStorage.setItem(RECENT_STORAGE_KEY, JSON.stringify(recentlyViewedIds));
    } catch {
      // ignore storage errors
    }
  }, [recentlyViewedIds]);

  useEffect(() => {
    const handler = () => setMapsQuotaExceeded(true);
    window.addEventListener('gmp-quota-exceeded', handler);
    return () => window.removeEventListener('gmp-quota-exceeded', handler);
  }, []);

  const showToast = useCallback((message: string, tone: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now();
    setToast({ id, message, tone });
    setTimeout(() => {
      setToast((prev) => (prev?.id === id ? null : prev));
    }, 4000);
  }, []);

  // Auth listener & user bootstrapping
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      setAuthReady(true);

      if (!firebaseUser) {
        setUserProfile(null);
        setUserPrivate(null);
        setIsAdminDoc(false);
        setMyOrders([]);
        setMyEnrollments([]);
        setMyTuitionRequests([]);
        setMyTestAttempts([]);
        setWishlistItems([]);
        setWishlistLoading(false);
        return;
      }

      try {
        const adminSnap = await getDoc(doc(db, 'admins', firebaseUser.uid));
        setIsAdminDoc(adminSnap.exists());

        const profileRef = doc(db, 'users', firebaseUser.uid);
        const profileSnap = await getDoc(profileRef);

        if (!profileSnap.exists()) {
          const newProfile: UserProfile = {
            uid: firebaseUser.uid,
            displayName: (firebaseUser.displayName || 'Customer').slice(0, 120),
            role: 'customer',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          };
          await setDoc(profileRef, newProfile);
          setUserProfile({ ...newProfile, createdAt: new Date().toISOString() });
        } else {
          setUserProfile(profileSnap.data() as UserProfile);
        }

        const privateRef = doc(db, 'users', firebaseUser.uid, 'private', 'info');
        const privateSnap = await getDoc(privateRef);
        if (!privateSnap.exists() && firebaseUser.email) {
          const privData: UserPrivateInfo = {
            uid: firebaseUser.uid,
            email: firebaseUser.email.slice(0, 200),
            updatedAt: serverTimestamp(),
          };
          await setDoc(privateRef, privData);
          setUserPrivate(privData);
        } else if (privateSnap.exists()) {
          setUserPrivate(privateSnap.data() as UserPrivateInfo);
        }
      } catch (err) {
        console.warn('User profile sync warning:', err);
      }
    });

    return () => unsub();
  }, []);

  const isAdmin = useMemo(() => {
    if (!user) return false;
    if (user.email === BOOTSTRAPPED_ADMIN_EMAIL && user.emailVerified) return true;
    return isAdminDoc;
  }, [user, isAdminDoc]);

  const isStaff = useMemo(() => {
    if (isAdmin) return true;
    return userProfile?.role === 'staff' || userProfile?.role === 'admin';
  }, [isAdmin, userProfile]);

  // Public catalog listeners
  useEffect(() => {
    const unsubProducts = onSnapshot(
      collection(db, 'products'),
      (snap) => {
        const items = snap.docs.map((d) => ({ ...(d.data() as Product), id: d.id }));
        setFsProducts(items.length > 0 ? items : null);
      },
      (err) => {
        console.warn('Products snapshot fallback:', err.message);
      },
    );

    const unsubCourses = onSnapshot(
      collection(db, 'courses'),
      (snap) => {
        const items = snap.docs.map((d) => ({ ...(d.data() as Course), id: d.id }));
        setFsCourses(items.length > 0 ? items : null);
      },
      (err) => {
        console.warn('Courses snapshot fallback:', err.message);
      },
    );

    const unsubMcqs = onSnapshot(
      collection(db, 'mcqQuestions'),
      (snap) => {
        const items = snap.docs.map((d) => ({ ...(d.data() as McqQuestion), id: d.id }));
        setFsMcqs(items.length > 0 ? items : null);
      },
      (err) => {
        console.warn('MCQs snapshot fallback:', err.message);
      },
    );

    const unsubSettings = onSnapshot(
      doc(db, 'siteSettings', 'public'),
      (snap) => {
        if (snap.exists()) {
          setFsSettings(snap.data() as SiteSettings);
        } else {
          setFsSettings(null);
        }
      },
      (err) => {
        console.warn('SiteSettings snapshot fallback:', err.message);
      },
    );

    const unsubReviews = onSnapshot(
      query(collection(db, 'reviews'), where('status', '==', 'approved')),
      (snap) => {
        const items = snap.docs.map((d) => ({ ...(d.data() as Review), id: d.id }));
        setFsApprovedReviews(items.length > 0 ? items : null);
      },
      (err) => {
        console.warn('Reviews snapshot fallback:', err.message);
      },
    );

    const unsubCategorySeo = onSnapshot(
      collection(db, 'categorySeo'),
      (snap) => {
        const next: Partial<Record<CategorySeoSlug, CategorySeo>> = {};
        for (const d of snap.docs) {
          const data = d.data() as CategorySeo;
          next[data.slug] = data;
        }
        setCategorySeoMap(next);
      },
      (err) => {
        console.warn('CategorySeo snapshot fallback:', err.message);
      },
    );

    return () => {
      unsubProducts();
      unsubCourses();
      unsubMcqs();
      unsubSettings();
      unsubReviews();
      unsubCategorySeo();
    };
  }, []);

  // User-scoped listeners (only when signed in)
  useEffect(() => {
    if (!authReady || !user) return;

    const uid = user.uid;
    const unsubOrders = onSnapshot(
      query(collection(db, 'orders'), where('userId', '==', uid)),
      (snap) => {
        setMyOrders(snap.docs.map((d) => ({ ...(d.data() as Order), id: d.id })));
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'orders'),
    );

    const unsubEnroll = onSnapshot(
      query(collection(db, 'enrollments'), where('userId', '==', uid)),
      (snap) => {
        setMyEnrollments(snap.docs.map((d) => ({ ...(d.data() as Enrollment), id: d.id })));
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'enrollments'),
    );

    const unsubTuition = onSnapshot(
      query(collection(db, 'tuitionRequests'), where('userId', '==', uid)),
      (snap) => {
        setMyTuitionRequests(snap.docs.map((d) => ({ ...(d.data() as TuitionRequest), id: d.id })));
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'tuitionRequests'),
    );

    const unsubAttempts = onSnapshot(
      query(collection(db, 'testAttempts'), where('userId', '==', uid)),
      (snap) => {
        setMyTestAttempts(snap.docs.map((d) => ({ ...(d.data() as TestAttempt), id: d.id })));
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'testAttempts'),
    );

    setWishlistLoading(true);
    const unsubWishlist = onSnapshot(
      collection(db, 'users', uid, 'wishlist'),
      (snap) => {
        setWishlistItems(snap.docs.map((d) => d.data() as WishlistItem));
        setWishlistLoading(false);
      },
      (err) => {
        setWishlistLoading(false);
        handleFirestoreError(err, OperationType.LIST, `users/${uid}/wishlist`);
      },
    );

    return () => {
      unsubOrders();
      unsubEnroll();
      unsubTuition();
      unsubAttempts();
      unsubWishlist();
    };
  }, [authReady, user]);

  // Admin / Staff full listeners
  useEffect(() => {
    if (!authReady || !user || !isStaff) {
      setAdminOrders([]);
      setAdminEnrollments([]);
      setAdminTuitionRequests([]);
      setAdminReviews([]);
      setAdminMessages([]);
      return;
    }

    const u1 = onSnapshot(
      collection(db, 'orders'),
      (snap) => setAdminOrders(snap.docs.map((d) => ({ ...(d.data() as Order), id: d.id }))),
      (err) => console.warn('Admin orders listener:', err.message),
    );
    const u2 = onSnapshot(
      collection(db, 'enrollments'),
      (snap) => setAdminEnrollments(snap.docs.map((d) => ({ ...(d.data() as Enrollment), id: d.id }))),
      (err) => console.warn('Admin enrollments listener:', err.message),
    );
    const u3 = onSnapshot(
      collection(db, 'tuitionRequests'),
      (snap) => setAdminTuitionRequests(snap.docs.map((d) => ({ ...(d.data() as TuitionRequest), id: d.id }))),
      (err) => console.warn('Admin tuition listener:', err.message),
    );
    const u4 = onSnapshot(
      collection(db, 'reviews'),
      (snap) => setAdminReviews(snap.docs.map((d) => ({ ...(d.data() as Review), id: d.id }))),
      (err) => console.warn('Admin reviews listener:', err.message),
    );
    const u5 = onSnapshot(
      collection(db, 'contactMessages'),
      (snap) => setAdminMessages(snap.docs.map((d) => ({ ...(d.data() as ContactMessage), id: d.id }))),
      (err) => console.warn('Admin messages listener:', err.message),
    );

    return () => {
      u1();
      u2();
      u3();
      u4();
      u5();
    };
  }, [authReady, user, isStaff]);

  // Admin-only newsletter subscriber listener
  useEffect(() => {
    if (!authReady || !user || !isAdmin) {
      setAdminSubscribers([]);
      return;
    }

    const unsubSubs = onSnapshot(
      collection(db, 'newsletterSubscribers'),
      (snap) => setAdminSubscribers(snap.docs.map((d) => ({ ...(d.data() as NewsletterSubscriber), id: d.id }))),
      (err) => console.warn('Admin newsletter listener:', err.message),
    );
    return () => unsubSubs();
  }, [authReady, user, isAdmin]);

  const signInWithGoogle = useCallback(async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      showToast(`Signed in as ${result.user.displayName || result.user.email}`, 'success');
      return result.user;
    } catch (err) {
      console.error('Sign in failed:', err);
      showToast('Google Sign-In was cancelled or failed.', 'error');
      return null;
    }
  }, [showToast]);

  const signOutUser = useCallback(async () => {
    await signOut(auth);
    showToast('Signed out successfully.', 'info');
  }, [showToast]);

  const products = useMemo(() => fsProducts ?? SEED_PRODUCTS, [fsProducts]);
  const courses = useMemo(() => fsCourses ?? SEED_COURSES, [fsCourses]);
  const mcqs = useMemo(() => fsMcqs ?? SEED_MCQS, [fsMcqs]);
  const siteSettings = useMemo(() => fsSettings ?? DEFAULT_SITE_SETTINGS, [fsSettings]);
  const approvedReviews = useMemo(() => fsApprovedReviews ?? SAMPLE_DEMO_REVIEWS, [fsApprovedReviews]);

  const addToCart = useCallback(
    (product: Product, variant?: string, qty = 1) => {
      const activeVariant = variant || product.variants?.[0] || 'Standard';
      const unitPrice = product.discountPricePkr && product.discountPricePkr < product.pricePkr
        ? product.discountPricePkr
        : product.pricePkr;

      setCart((prev) => {
        const existingIndex = prev.findIndex(
          (i) => i.productId === product.id && i.variant === activeVariant,
        );
        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = {
            ...updated[existingIndex],
            quantity: updated[existingIndex].quantity + qty,
          };
          return updated;
        }
        return [
          ...prev,
          {
            productId: product.id,
            name: product.name,
            category: product.category,
            pricePkr: unitPrice,
            originalPricePkr: product.pricePkr,
            imageUrl: product.imageUrl,
            variant: activeVariant,
            quantity: qty,
          },
        ];
      });
      showToast(`Added "${product.name}" to cart`, 'success');
    },
    [showToast],
  );

  const removeFromCart = useCallback((productId: string, variant?: string) => {
    setCart((prev) => prev.filter((i) => !(i.productId === productId && i.variant === variant)));
  }, []);

  const updateCartQty = useCallback((productId: string, variant: string | undefined, qty: number) => {
    if (qty <= 0) {
      setCart((prev) => prev.filter((i) => !(i.productId === productId && i.variant === variant)));
      return;
    }
    setCart((prev) =>
      prev.map((i) =>
        i.productId === productId && i.variant === variant ? { ...i, quantity: qty } : i,
      ),
    );
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const cartSubtotalPkr = useMemo(
    () => cart.reduce((sum, item) => sum + item.originalPricePkr * item.quantity, 0),
    [cart],
  );
  const cartDiscountPkr = useMemo(
    () =>
      cart.reduce(
        (sum, item) => sum + Math.max(0, item.originalPricePkr - item.pricePkr) * item.quantity,
        0,
      ),
    [cart],
  );
  const netSubtotal = cartSubtotalPkr - cartDiscountPkr;
  const cartDeliveryPkr = cart.length === 0 ? 0 : netSubtotal >= 5000 ? 0 : 250;
  const cartTotalPkr = netSubtotal + cartDeliveryPkr;
  const cartCount = useMemo(() => cart.reduce((sum, item) => sum + item.quantity, 0), [cart]);

  const wishlist = useMemo(() => wishlistItems.map((item) => item.productId), [wishlistItems]);

  const toggleWishlist = useCallback(
    async (productId: string) => {
      let currentUser = auth.currentUser;
      if (!currentUser) {
        currentUser = await signInWithGoogle();
        if (!currentUser) {
          showToast('Sign in with Google to save items to your wishlist.', 'info');
          return;
        }
      }

      const cleanProdId = sanitizeId(productId);
      const docRef = doc(db, 'users', currentUser.uid, 'wishlist', cleanProdId);
      const exists = wishlistItems.some((item) => item.productId === cleanProdId);

      try {
        if (exists) {
          await deleteDoc(docRef);
          showToast('Removed from wishlist', 'info');
        } else {
          const prod = products.find((p) => sanitizeId(p.id) === cleanProdId || p.id === productId);
          const activePrice = prod
            ? prod.discountPricePkr && prod.discountPricePkr < prod.pricePkr
              ? prod.discountPricePkr
              : prod.pricePkr
            : 0;
          await setDoc(docRef, {
            productId: cleanProdId,
            userId: currentUser.uid,
            productName: (prod?.name || 'Saved Product').slice(0, 180),
            category: prod?.category || 'electronics',
            pricePkr: Math.max(0, Number(activePrice) || 0),
            imageUrl: (prod?.imageUrl || '/favicon.svg').slice(0, 500),
            createdAt: serverTimestamp(),
          });
          showToast('Saved to wishlist', 'success');
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `users/${currentUser.uid}/wishlist/${cleanProdId}`);
      }
    },
    [wishlistItems, products, signInWithGoogle, showToast],
  );

  const clearWishlist = useCallback(async () => {
    const currentUser = auth.currentUser;
    if (!currentUser || wishlistItems.length === 0) return;
    try {
      const batch = writeBatch(db);
      for (const item of wishlistItems) {
        batch.delete(doc(db, 'users', currentUser.uid, 'wishlist', sanitizeId(item.productId)));
      }
      await batch.commit();
      showToast('Wishlist cleared.', 'info');
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `users/${currentUser.uid}/wishlist`);
    }
  }, [wishlistItems, showToast]);

  const toggleCompare = useCallback(
    (productId: string) => {
      setCompareIds((prev) => {
        if (prev.includes(productId)) {
          showToast('Removed from comparison', 'info');
          return prev.filter((id) => id !== productId);
        }
        if (prev.length >= 3) {
          showToast('You can compare up to 3 products at once.', 'info');
          return prev;
        }
        showToast('Added to product comparison', 'success');
        return [...prev, productId];
      });
    },
    [showToast],
  );

  const clearCompare = useCallback(() => {
    setCompareIds([]);
    setCompareOpen(false);
  }, []);

  const markProductViewed = useCallback((productId: string) => {
    setRecentlyViewedIds((prev) => [productId, ...prev.filter((id) => id !== productId)].slice(0, 6));
  }, []);

  const requireSignedInUser = useCallback(async (): Promise<User> => {
    if (auth.currentUser) return auth.currentUser;
    const signedIn = await signInWithGoogle();
    if (!signedIn) {
      throw new Error('Sign in is required to complete this request.');
    }
    return signedIn;
  }, [signInWithGoogle]);

  const placeOrder: AppContextValue['placeOrder'] = useCallback(
    async (payload) => {
      const currentUser = await requireSignedInUser();
      const orderCode = `ASIF-${Date.now().toString().slice(-6)}`;
      const orderId = sanitizeId(`ord-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`);
      const cityClean = payload.city.trim().slice(0, 100);
      const boundedItems = payload.items.slice(0, 50);
      const docData = {
        ...payload,
        orderCode,
        userId: currentUser.uid,
        customerName: payload.customerName.trim().slice(0, 120),
        phone: payload.phone.trim().slice(0, 40),
        whatsapp: payload.whatsapp.trim().slice(0, 40),
        email: payload.email.trim().slice(0, 200),
        deliveryAddress: payload.deliveryAddress.trim().slice(0, 400),
        city: cityClean,
        postalCode: (payload.postalCode || '').trim().slice(0, 20),
        orderNotes: (payload.orderNotes || '').trim().slice(0, 500),
        paymentReference: (payload.paymentReference || '').trim().slice(0, 120),
        items: boundedItems,
        status: 'Pending' as const,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      const trackingData = {
        orderCode,
        orderId,
        userId: currentUser.uid,
        city: cityClean,
        paymentMethod: payload.paymentMethod,
        itemCount: Math.max(1, boundedItems.reduce((sum, it) => sum + Math.max(1, it.quantity), 0)),
        itemSummary: boundedItems.map(
          (it) => `${it.name}${it.variant ? ` (${it.variant})` : ''} × ${it.quantity}`.slice(0, 160),
        ),
        totalPkr: Math.max(0, Number(payload.totalPkr) || 0),
        status: 'Pending' as const,
        statusNote: 'Order received and awaiting verification.',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      try {
        const batch = writeBatch(db);
        batch.set(doc(db, 'orders', orderId), docData);
        batch.set(doc(db, 'orderTracking', orderCode), trackingData);
        await batch.commit();
        clearCart();
        showToast(`Order ${orderCode} placed successfully!`, 'success');
        return orderCode;
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `orders/${orderId}`);
      }
    },
    [requireSignedInUser, clearCart, showToast],
  );

  const cancelMyOrder = useCallback(
    async (orderId: string) => {
      try {
        const ordSnap = await getDoc(doc(db, 'orders', orderId));
        const orderCode = ordSnap.exists() ? (ordSnap.data().orderCode as string | undefined) : undefined;
        const batch = writeBatch(db);
        batch.update(doc(db, 'orders', orderId), {
          status: 'Cancelled',
          updatedAt: serverTimestamp(),
        });
        if (orderCode) {
          const trackRef = doc(db, 'orderTracking', sanitizeId(orderCode));
          const trackSnap = await getDoc(trackRef);
          if (trackSnap.exists()) {
            batch.update(trackRef, {
              status: 'Cancelled',
              statusNote: 'Cancelled by customer.',
              updatedAt: serverTimestamp(),
            });
          }
        }
        await batch.commit();
        showToast('Order cancelled.', 'info');
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `orders/${orderId}`);
      }
    },
    [showToast],
  );

  const subscribeToOrderTracking: AppContextValue['subscribeToOrderTracking'] = useCallback(
    (rawCode, onData, onError) => {
      const normalized = rawCode.trim().toUpperCase();
      if (!/^[A-Z0-9_-]{4,40}$/.test(normalized)) {
        onError('Please enter a valid Order ID (e.g. ASIF-123456).');
        return () => {};
      }
      const ref = doc(db, 'orderTracking', normalized);
      return onSnapshot(
        ref,
        (snap) => {
          if (!snap.exists()) {
            onData(null);
            return;
          }
          onData(snap.data() as OrderTracking);
        },
        (err) => {
          onError(err instanceof Error ? err.message : 'Unable to fetch order tracking status.');
        },
      );
    },
    [],
  );

  const submitEnrollment: AppContextValue['submitEnrollment'] = useCallback(
    async (payload) => {
      const currentUser = await requireSignedInUser();
      const enrollId = sanitizeId(`enr-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`);
      try {
        await setDoc(doc(db, 'enrollments', enrollId), {
          ...payload,
          userId: currentUser.uid,
          studentName: payload.studentName.trim().slice(0, 120),
          email: payload.email.trim().slice(0, 200),
          whatsapp: payload.whatsapp.trim().slice(0, 40),
          courseId: payload.courseId.slice(0, 128),
          courseTitle: payload.courseTitle.slice(0, 180),
          educationLevel: payload.educationLevel.trim().slice(0, 100),
          status: 'Pending',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        showToast('Course enrollment submitted! Confirmation recorded in your account.', 'success');
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `enrollments/${enrollId}`);
      }
    },
    [requireSignedInUser, showToast],
  );

  const submitTuitionRequest: AppContextValue['submitTuitionRequest'] = useCallback(
    async (payload) => {
      const currentUser = await requireSignedInUser();
      const reqId = sanitizeId(`tui-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`);
      try {
        await setDoc(doc(db, 'tuitionRequests', reqId), {
          ...payload,
          userId: currentUser.uid,
          studentName: payload.studentName.trim().slice(0, 120),
          guardianName: payload.guardianName.trim().slice(0, 120),
          contactNumber: payload.contactNumber.trim().slice(0, 40),
          whatsapp: payload.whatsapp.trim().slice(0, 40),
          className: payload.className.trim().slice(0, 100),
          subject: payload.subject.trim().slice(0, 120),
          board: payload.board.trim().slice(0, 100),
          cityArea: payload.cityArea.trim().slice(0, 150),
          preferredTiming: payload.preferredTiming.trim().slice(0, 100),
          assignedTeacher: '',
          status: 'Pending',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        showToast('Tuition consultation booked! Our academic coordinator will assign a tutor.', 'success');
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `tuitionRequests/${reqId}`);
      }
    },
    [requireSignedInUser, showToast],
  );

  const saveTestAttempt: AppContextValue['saveTestAttempt'] = useCallback(
    async (payload) => {
      if (!auth.currentUser) return;
      const attemptId = sanitizeId(`att-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`);
      try {
        await setDoc(doc(db, 'testAttempts', attemptId), {
          ...payload,
          userId: auth.currentUser.uid,
          createdAt: serverTimestamp(),
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `testAttempts/${attemptId}`);
      }
    },
    [],
  );

  const submitReview: AppContextValue['submitReview'] = useCallback(
    async (payload) => {
      const currentUser = await requireSignedInUser();
      const revId = sanitizeId(`rev-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`);
      try {
        await setDoc(doc(db, 'reviews', revId), {
          ...payload,
          userId: currentUser.uid,
          authorName: payload.authorName.trim().slice(0, 120),
          targetName: payload.targetName.trim().slice(0, 180),
          comment: payload.comment.trim().slice(0, 1000),
          verifiedPurchase: false,
          status: 'pending',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        showToast('Review submitted for admin approval. Thank you!', 'success');
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `reviews/${revId}`);
      }
    },
    [requireSignedInUser, showToast],
  );

  const publishAdminReview: AppContextValue['publishAdminReview'] = useCallback(
    async (payload) => {
      const currentUser = await requireSignedInUser();
      const revId = sanitizeId(`rev-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`);
      try {
        await setDoc(doc(db, 'reviews', revId), {
          ...payload,
          userId: currentUser.uid,
          authorName: payload.authorName.trim().slice(0, 120),
          targetName: payload.targetName.trim().slice(0, 180),
          comment: payload.comment.trim().slice(0, 1000),
          verifiedPurchase: Boolean(payload.verifiedPurchase),
          status: 'approved',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        showToast('Customer review published!', 'success');
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `reviews/${revId}`);
      }
    },
    [requireSignedInUser, showToast],
  );

  const submitContactMessage: AppContextValue['submitContactMessage'] = useCallback(
    async (payload) => {
      const currentUser = await requireSignedInUser();
      const msgId = sanitizeId(`msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`);
      try {
        await setDoc(doc(db, 'contactMessages', msgId), {
          ...payload,
          userId: currentUser.uid,
          name: payload.name.trim().slice(0, 120),
          email: payload.email.trim().slice(0, 200),
          whatsapp: payload.whatsapp.trim().slice(0, 40),
          subject: payload.subject.trim().slice(0, 180),
          message: payload.message.trim().slice(0, 2000),
          status: 'New',
          createdAt: serverTimestamp(),
        });
        showToast('Inquiry received! We will respond shortly.', 'success');
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `contactMessages/${msgId}`);
      }
    },
    [requireSignedInUser, showToast],
  );

  const subscribeNewsletter = useCallback(
    async (email: string, source = 'homepage-newsletter') => {
      const normalized = email.trim().toLowerCase();
      const emailRegex =
        /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+$/;
      if (
        normalized.length < 3 ||
        normalized.length > 200 ||
        normalized.includes('..') ||
        !emailRegex.test(normalized)
      ) {
        const errMsg = 'Please enter a valid email address.';
        showToast(errMsg, 'error');
        throw new Error(errMsg);
      }

      const fnUrl = (import.meta.env.VITE_NEWSLETTER_FUNCTION_URL as string | undefined)?.trim();
      if (fnUrl && (fnUrl.startsWith('https://') || fnUrl.startsWith('http://'))) {
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (auth.currentUser) {
          try {
            const token = await auth.currentUser.getIdToken();
            headers.Authorization = `Bearer ${token}`;
          } catch {
            // proceed as guest subscriber if token fetch fails
          }
        }
        const res = await fetch(fnUrl, {
          method: 'POST',
          headers,
          body: JSON.stringify({ email: normalized, source }),
        });
        const data = (await res.json().catch(() => ({}))) as {
          ok?: boolean;
          alreadySubscribed?: boolean;
          message?: string;
          error?: string;
        };
        if (!res.ok || !data.ok) {
          const errMsg = data.error || 'Subscription failed. Please try again.';
          showToast(errMsg, 'error');
          throw new Error(errMsg);
        }
        const message = data.message || 'Subscribed to Digital E-Commerce by ASIF updates!';
        showToast(message, data.alreadySubscribed ? 'info' : 'success');
        return { alreadySubscribed: Boolean(data.alreadySubscribed), message };
      }

      // Fallback when Cloud Function endpoint URL is not yet configured in environment
      const currentUser = await requireSignedInUser();
      let hash = 2166136261;
      for (let i = 0; i < normalized.length; i += 1) {
        hash ^= normalized.charCodeAt(i);
        hash = Math.imul(hash, 16777619);
      }
      const emailTag = (hash >>> 0).toString(36);
      const subId = sanitizeId(`sub-${currentUser.uid.slice(0, 16)}-${emailTag}`);
      try {
        const ref = doc(db, 'newsletterSubscribers', subId);
        const existingSnap = await getDoc(ref);
        if (existingSnap.exists()) {
          const message = 'This email is already subscribed to Digital E-Commerce by ASIF updates.';
          showToast(message, 'info');
          return { alreadySubscribed: true, message };
        }
        await setDoc(ref, {
          email: normalized.slice(0, 200),
          userId: currentUser.uid,
          status: 'subscribed',
          source: source.replace(/[^a-zA-Z0-9_-]/g, '-').slice(0, 60) || 'homepage-newsletter',
          subscribedAt: serverTimestamp(),
        });
        const message = 'Subscribed to Digital E-Commerce by ASIF updates!';
        showToast(message, 'success');
        return { alreadySubscribed: false, message };
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `newsletterSubscribers/${subId}`);
      }
    },
    [requireSignedInUser, showToast],
  );

  const saveUserProfileInfo = useCallback(
    async (displayName: string, privateInfo: Partial<UserPrivateInfo>) => {
      const currentUser = await requireSignedInUser();
      try {
        await updateDoc(doc(db, 'users', currentUser.uid), {
          displayName: displayName.trim().slice(0, 120),
          updatedAt: serverTimestamp(),
        });
        const privPayload: UserPrivateInfo = {
          uid: currentUser.uid,
          email: (privateInfo.email || currentUser.email || '').slice(0, 200),
          phone: (privateInfo.phone || '').slice(0, 40),
          whatsapp: (privateInfo.whatsapp || '').slice(0, 40),
          address: (privateInfo.address || '').slice(0, 400),
          city: (privateInfo.city || '').slice(0, 100),
          postalCode: (privateInfo.postalCode || '').slice(0, 20),
          updatedAt: serverTimestamp(),
        };
        await setDoc(doc(db, 'users', currentUser.uid, 'private', 'info'), privPayload);
        setUserPrivate(privPayload);
        showToast('Account details saved.', 'success');
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `users/${currentUser.uid}`);
      }
    },
    [requireSignedInUser, showToast],
  );

  // Admin Actions
  const seedDemoCatalogToFirestore = useCallback(async () => {
    try {
      const batch = writeBatch(db);
      for (const p of SEED_PRODUCTS) {
        batch.set(doc(db, 'products', sanitizeId(p.id)), {
          ...p,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
      for (const c of SEED_COURSES) {
        batch.set(doc(db, 'courses', sanitizeId(c.id)), {
          ...c,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
      for (const q of SEED_MCQS) {
        const { id, ...rest } = q;
        batch.set(doc(db, 'mcqQuestions', sanitizeId(id)), {
          ...rest,
          createdAt: serverTimestamp(),
        });
      }
      batch.set(doc(db, 'siteSettings', 'public'), {
        ...DEFAULT_SITE_SETTINGS,
        updatedAt: serverTimestamp(),
      });
      await batch.commit();
      showToast('Products, courses, MCQs, and settings synced to Firestore!', 'success');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'batch-seed');
    }
  }, [showToast]);

  const upsertProduct = useCallback(
    async (product: Omit<Product, 'createdAt' | 'updatedAt'>) => {
      const docId = sanitizeId(product.id || `prod-${Date.now()}`);
      try {
        const existingSnap = await getDoc(doc(db, 'products', docId));
        const payload = {
          ...product,
          id: docId,
          createdAt: existingSnap.exists() ? existingSnap.data().createdAt : serverTimestamp(),
          updatedAt: serverTimestamp(),
        };
        await setDoc(doc(db, 'products', docId), payload);
        showToast(`Product "${product.name}" saved.`, 'success');
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `products/${docId}`);
      }
    },
    [showToast],
  );

  const deleteProduct = useCallback(
    async (productId: string) => {
      try {
        await deleteDoc(doc(db, 'products', productId));
        showToast('Product deleted.', 'info');
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `products/${productId}`);
      }
    },
    [showToast],
  );

  const upsertCourse = useCallback(
    async (course: Omit<Course, 'createdAt' | 'updatedAt'>) => {
      const docId = sanitizeId(course.id || `course-${Date.now()}`);
      try {
        const existingSnap = await getDoc(doc(db, 'courses', docId));
        await setDoc(doc(db, 'courses', docId), {
          ...course,
          id: docId,
          createdAt: existingSnap.exists() ? existingSnap.data().createdAt : serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        showToast(`Course "${course.title}" saved.`, 'success');
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `courses/${docId}`);
      }
    },
    [showToast],
  );

  const deleteCourse = useCallback(
    async (courseId: string) => {
      try {
        await deleteDoc(doc(db, 'courses', courseId));
        showToast('Course deleted.', 'info');
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `courses/${courseId}`);
      }
    },
    [showToast],
  );

  const addMcqQuestion = useCallback(
    async (mcq: Omit<McqQuestion, 'id' | 'createdAt'>) => {
      const docId = sanitizeId(`mcq-${Date.now()}`);
      try {
        await setDoc(doc(db, 'mcqQuestions', docId), {
          ...mcq,
          createdAt: serverTimestamp(),
        });
        showToast('MCQ added to bank.', 'success');
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `mcqQuestions/${docId}`);
      }
    },
    [showToast],
  );

  const deleteMcqQuestion = useCallback(
    async (questionId: string) => {
      try {
        await deleteDoc(doc(db, 'mcqQuestions', questionId));
        showToast('MCQ removed.', 'info');
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `mcqQuestions/${questionId}`);
      }
    },
    [showToast],
  );

  const updateOrderStatus = useCallback(
    async (orderId: string, status: OrderStatus, statusNote?: string) => {
      try {
        const ordRef = doc(db, 'orders', orderId);
        const ordSnap = await getDoc(ordRef);
        const batch = writeBatch(db);
        batch.update(ordRef, {
          status,
          updatedAt: serverTimestamp(),
        });
        if (ordSnap.exists()) {
          const ordData = ordSnap.data() as Order;
          const cleanCode = sanitizeId(ordData.orderCode).toUpperCase();
          const trackRef = doc(db, 'orderTracking', cleanCode);
          const trackSnap = await getDoc(trackRef);
          const defaultNoteMap: Record<OrderStatus, string> = {
            Pending: 'Order received and awaiting verification.',
            Confirmed: 'Order confirmed by Digital E-Commerce by ASIF.',
            Processing: 'Your items are being packed for dispatch.',
            Shipped: `Dispatched for delivery to ${ordData.city}.`,
            Delivered: 'Order delivered successfully. Thank you for shopping with ASIF!',
            Cancelled: 'Order has been cancelled.',
          };
          const cleanNote = (statusNote ?? defaultNoteMap[status]).trim().slice(0, 240);
          if (trackSnap.exists()) {
            batch.update(trackRef, {
              status,
              statusNote: cleanNote,
              updatedAt: serverTimestamp(),
            });
          } else {
            const boundedItems = (ordData.items || []).slice(0, 50);
            batch.set(trackRef, {
              orderCode: cleanCode,
              orderId,
              userId: ordData.userId,
              city: (ordData.city || 'Pakistan').slice(0, 100),
              paymentMethod: ordData.paymentMethod,
              itemCount: Math.max(1, boundedItems.reduce((sum, it) => sum + Math.max(1, it.quantity), 0)),
              itemSummary: boundedItems.map(
                (it) => `${it.name}${it.variant ? ` (${it.variant})` : ''} × ${it.quantity}`.slice(0, 160),
              ),
              totalPkr: Math.max(0, Number(ordData.totalPkr) || 0),
              status,
              statusNote: cleanNote,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            });
          }
        }
        await batch.commit();
        showToast(`Order status updated to ${status}.`, 'success');
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `orders/${orderId}`);
      }
    },
    [showToast],
  );

  const updateTuitionRequest = useCallback(
    async (requestId: string, status: TuitionStatus, assignedTeacher?: string) => {
      try {
        await updateDoc(doc(db, 'tuitionRequests', requestId), {
          status,
          ...(assignedTeacher !== undefined ? { assignedTeacher } : {}),
          updatedAt: serverTimestamp(),
        });
        showToast('Tuition request updated.', 'success');
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `tuitionRequests/${requestId}`);
      }
    },
    [showToast],
  );

  const updateEnrollmentStatus = useCallback(
    async (enrollmentId: string, status: Enrollment['status']) => {
      try {
        await updateDoc(doc(db, 'enrollments', enrollmentId), {
          status,
          updatedAt: serverTimestamp(),
        });
        showToast(`Enrollment marked as ${status}.`, 'success');
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `enrollments/${enrollmentId}`);
      }
    },
    [showToast],
  );

  const moderateReview = useCallback(
    async (reviewId: string, status: ReviewStatus) => {
      try {
        await updateDoc(doc(db, 'reviews', reviewId), {
          status,
          updatedAt: serverTimestamp(),
        });
        showToast(`Review set to ${status}.`, 'success');
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `reviews/${reviewId}`);
      }
    },
    [showToast],
  );

  const updateSiteSettings = useCallback(
    async (settings: SiteSettings) => {
      try {
        await setDoc(doc(db, 'siteSettings', 'public'), {
          ...settings,
          updatedAt: serverTimestamp(),
        });
        showToast('Website settings updated.', 'success');
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, 'siteSettings/public');
      }
    },
    [showToast],
  );

  const upsertCategorySeo = useCallback(
    async (seo: Omit<CategorySeo, 'updatedAt'>) => {
      const slugId = sanitizeId(seo.slug);
      try {
        await setDoc(doc(db, 'categorySeo', slugId), {
          slug: seo.slug,
          seoTitle: seo.seoTitle.trim().slice(0, 160),
          seoDescription: seo.seoDescription.trim().slice(0, 320),
          ogImageUrl: seo.ogImageUrl.trim().slice(0, 500),
          ...(seo.seoKeywords?.trim() ? { seoKeywords: seo.seoKeywords.trim().slice(0, 500) } : {}),
          updatedAt: serverTimestamp(),
        });
        showToast(`SEO metadata updated for "${seo.slug}".`, 'success');
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `categorySeo/${slugId}`);
      }
    },
    [showToast],
  );

  const deleteSubscriber = useCallback(
    async (subId: string) => {
      try {
        await deleteDoc(doc(db, 'newsletterSubscribers', subId));
        showToast('Subscriber removed.', 'info');
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `newsletterSubscribers/${subId}`);
      }
    },
    [showToast],
  );

  // Unused addDoc imported? keep clean or remove if unused
  void addDoc;

  const value: AppContextValue = {
    user,
    authReady,
    userProfile,
    userPrivate,
    isAdmin,
    isStaff,
    signInWithGoogle,
    signOutUser,
    products,
    courses,
    mcqs,
    siteSettings,
    categorySeoMap,
    approvedReviews,
    myOrders,
    myEnrollments,
    myTuitionRequests,
    myTestAttempts,
    adminOrders,
    adminEnrollments,
    adminTuitionRequests,
    adminReviews,
    adminMessages,
    adminSubscribers,
    cart,
    cartOpen,
    setCartOpen,
    addToCart,
    removeFromCart,
    updateCartQty,
    clearCart,
    cartSubtotalPkr,
    cartDiscountPkr,
    cartDeliveryPkr,
    cartTotalPkr,
    cartCount,
    wishlist,
    wishlistItems,
    wishlistLoading,
    toggleWishlist,
    clearWishlist,
    compareIds,
    toggleCompare,
    clearCompare,
    compareOpen,
    setCompareOpen,
    recentlyViewedIds,
    markProductViewed,
    quickViewProduct,
    setQuickViewProduct,
    toast,
    showToast,
    mapsQuotaExceeded,
    placeOrder,
    cancelMyOrder,
    subscribeToOrderTracking,
    submitEnrollment,
    submitTuitionRequest,
    saveTestAttempt,
    submitReview,
    publishAdminReview,
    submitContactMessage,
    subscribeNewsletter,
    saveUserProfileInfo,
    seedDemoCatalogToFirestore,
    upsertProduct,
    deleteProduct,
    upsertCourse,
    deleteCourse,
    addMcqQuestion,
    deleteMcqQuestion,
    updateOrderStatus,
    updateTuitionRequest,
    updateEnrollmentStatus,
    moderateReview,
    updateSiteSettings,
    upsertCategorySeo,
    deleteSubscriber,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
