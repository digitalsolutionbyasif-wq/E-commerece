import React, { useEffect, useState } from 'react';
import { Check, Copy, Download, Plus, RefreshCw, ShieldCheck, Trash2 } from 'lucide-react';
import { AdminSeoManager } from '../components/AdminSeoManager';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { SeoHead } from '../components/SeoHead';
import { useApp } from '../context/AppContext';
import { ASSETS, COURSE_TRACKS, formatPkr } from '../data/seedCatalog';
import type {
  Course,
  CourseLevel,
  OrderStatus,
  Product,
  StoreCategorySlug,
  TuitionStatus,
} from '../types';

export function AdminDashboardPage() {
  const {
    user,
    isStaff,
    signInWithGoogle,
    products,
    courses,
    mcqs,
    siteSettings,
    adminOrders,
    adminEnrollments,
    adminTuitionRequests,
    adminReviews,
    adminMessages,
    adminSubscribers,
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
    publishAdminReview,
    updateSiteSettings,
    deleteSubscriber,
    showToast,
  } = useApp();

  const [tab, setTab] = useState<'overview' | 'products' | 'courses' | 'education' | 'orders' | 'reviews' | 'newsletter' | 'seo' | 'settings'>('overview');

  // Product Form & Filter
  const [prodSearch, setProdSearch] = useState('');
  const [prodFilterCat, setProdFilterCat] = useState<'all' | StoreCategorySlug>('all');
  const [inlineProdEdits, setInlineProdEdits] = useState<
    Record<string, { pricePkr: number; discountPricePkr: number; stock: number; featured: boolean }>
  >({});

  const [editingProdId, setEditingProdId] = useState('');
  const [pName, setPName] = useState('');
  const [pCat, setPCat] = useState<StoreCategorySlug>('electronics');
  const [pSub, setPSub] = useState('Audio Accessories');
  const [pBrand, setPBrand] = useState('');
  const [pDesc, setPDesc] = useState('');
  const [pPrice, setPPrice] = useState(2500);
  const [pDisc, setPDisc] = useState(0);
  const [pStock, setPStock] = useState(20);
  const [pImage, setPImage] = useState(ASSETS.electronics);
  const [pVariants, setPVariants] = useState('Standard');
  const [pSpecs, setPSpecs] = useState('');
  const [pGender, setPGender] = useState('');
  const [pAgeGroup, setPAgeGroup] = useState('');
  const [pSafetyNote, setPSafetyNote] = useState('');
  const [pFeatured, setPFeatured] = useState(true);

  // Course Form & Inline Fee
  const [inlineCourseFee, setInlineCourseFee] = useState<Record<string, number>>({});
  const [editingCourseId, setEditingCourseId] = useState('');
  const [cTitle, setCTitle] = useState('');
  const [cTrack, setCTrack] = useState(COURSE_TRACKS[0].track);
  const [cOverview, setCOverview] = useState('');
  const [cOutcomes, setCOutcomes] = useState('Hands-on project mastery\nCareer & freelance readiness');
  const [cDuration, setCDuration] = useState('8 Weeks');
  const [cLevel, setCLevel] = useState<CourseLevel>('Beginner');
  const [cFee, setCFee] = useState(12000);
  const [cInstructor, setCInstructor] = useState('Asif Mehmood');
  const [cInstructorBio, setCInstructorBio] = useState('');
  const [cImage, setCImage] = useState(ASSETS.courses);
  const [cFeatured, setCFeatured] = useState(true);
  const [cCurriculum, setCCurriculum] = useState('Module 1: Foundations\nModule 2: Practical Project');

  // MCQ Form
  const [mGroup, setMGroup] = useState<'govt' | 'ability'>('govt');
  const [mCat, setMCat] = useState('PPSC / FPSC General Knowledge');
  const [mSub, setMSub] = useState('General Knowledge');
  const [mQ, setMQ] = useState('');
  const [mOpts, setMOpts] = useState('Option A|Option B|Option C|Option D');
  const [mCorrect, setMCorrect] = useState(0);
  const [mExp, setMExp] = useState('');

  // Publish Genuine Customer Review Form
  const [revAuthor, setRevAuthor] = useState('');
  const [revTargetType, setRevTargetType] = useState<'product' | 'course' | 'platform'>('platform');
  const [revTargetName, setRevTargetName] = useState('Digital E-Commerce by ASIF');
  const [revRating, setRevRating] = useState(5);
  const [revComment, setRevComment] = useState('');
  const [revVerified, setRevVerified] = useState(true);

  // Teacher assignment local map
  const [teacherMap, setTeacherMap] = useState<Record<string, string>>({});
  // Order dispatch/tracking notes local map
  const [orderNoteMap, setOrderNoteMap] = useState<Record<string, string>>({});

  // Settings Form
  const [settingsForm, setSettingsForm] = useState(siteSettings);
  useEffect(() => {
    setSettingsForm(siteSettings);
  }, [siteSettings]);

  if (!user || !isStaff) {
    return (
      <div className="max-w-xl mx-auto px-4 sm:px-6 py-20 text-center space-y-5">
        <div className="w-12 h-12 rounded-xl bg-slate-100 text-blue-700 flex items-center justify-center mx-auto">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <h1 className="font-display text-2xl font-bold text-slate-900">Admin & Staff Portal</h1>
        <p className="text-sm text-slate-600 leading-relaxed">
          Access is restricted to authorized Digital E-Commerce by ASIF administrators and staff accounts.
        </p>
        {!user && (
          <button
            type="button"
            onClick={() => void signInWithGoogle()}
            className="px-6 py-3 bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold rounded-lg"
          >
            Sign In as Admin
          </button>
        )}
      </div>
    );
  }

  const totalRevenue = adminOrders
    .filter((o) => o.status !== 'Cancelled')
    .reduce((sum, o) => sum + (o.totalPkr || 0), 0);
  const pendingOrders = adminOrders.filter((o) => o.status === 'Pending').length;

  const exportOrdersCsv = () => {
    const header = ['OrderCode', 'Customer', 'Phone', 'City', 'Payment', 'TotalPKR', 'Status'];
    const rows = adminOrders.map((o) => [
      o.orderCode,
      `"${o.customerName.replace(/"/g, '""')}"`,
      o.phone,
      `"${o.city.replace(/"/g, '""')}"`,
      o.paymentMethod,
      String(o.totalPkr),
      o.status,
    ]);
    const csv = [header.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `asif-orders-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportSubscribersCsv = () => {
    const header = ['Email', 'Status', 'Source', 'UserId'];
    const rows = adminSubscribers.map((s) => [
      `"${s.email.replace(/"/g, '""')}"`,
      s.status || 'subscribed',
      `"${(s.source || 'newsletter-form').replace(/"/g, '""')}"`,
      s.userId,
    ]);
    const csv = [header.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `asif-newsletter-subscribers-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const resetProductForm = () => {
    setEditingProdId('');
    setPName('');
    setPCat('electronics');
    setPSub('Audio Accessories');
    setPBrand('');
    setPDesc('');
    setPPrice(2500);
    setPDisc(0);
    setPStock(20);
    setPImage(ASSETS.electronics);
    setPVariants('Standard');
    setPSpecs('');
    setPGender('');
    setPAgeGroup('');
    setPSafetyNote('');
    setPFeatured(true);
  };

  const resetCourseForm = () => {
    setEditingCourseId('');
    setCTitle('');
    setCTrack(COURSE_TRACKS[0].track);
    setCOverview('');
    setCOutcomes('Hands-on project mastery\nCareer & freelance readiness');
    setCDuration('8 Weeks');
    setCLevel('Beginner');
    setCFee(12000);
    setCInstructor('Asif Mehmood');
    setCInstructorBio('');
    setCImage(ASSETS.courses);
    setCFeatured(true);
    setCCurriculum('Module 1: Foundations\nModule 2: Practical Project');
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const specsList = pSpecs.split('\n').map((s) => s.trim()).filter(Boolean);
    const existingProd = editingProdId ? products.find((p) => p.id === editingProdId) : undefined;
    const payload: Omit<Product, 'createdAt' | 'updatedAt'> = {
      id: editingProdId || `prod-${Date.now()}`,
      name: pName,
      category: pCat,
      subcategory: pSub,
      description: pDesc,
      pricePkr: Math.max(0, Number(pPrice) || 0),
      ...(pDisc > 0 ? { discountPricePkr: Number(pDisc) } : {}),
      stock: Math.max(0, Number(pStock) || 0),
      imageUrl: pImage,
      variants: pVariants.split(',').map((s) => s.trim()).filter(Boolean),
      specs: specsList,
      ...(pBrand.trim() ? { brand: pBrand.trim() } : {}),
      ...(pGender.trim() ? { gender: pGender.trim() } : {}),
      ...(pAgeGroup.trim() ? { ageGroup: pAgeGroup.trim() } : {}),
      ...(pSafetyNote.trim() ? { safetyNote: pSafetyNote.trim() } : {}),
      ...(existingProd?.seoTitle ? { seoTitle: existingProd.seoTitle } : {}),
      ...(existingProd?.seoDescription ? { seoDescription: existingProd.seoDescription } : {}),
      ...(existingProd?.ogImageUrl ? { ogImageUrl: existingProd.ogImageUrl } : {}),
      featured: pFeatured,
      isDemo: false,
    };
    await upsertProduct(payload);
    resetProductForm();
  };

  const handleEditProduct = (p: Product, asClone = false) => {
    setEditingProdId(asClone ? '' : p.id);
    setPName(asClone ? `${p.name} (Copy)` : p.name);
    setPCat(p.category);
    setPSub(p.subcategory);
    setPBrand(p.brand || '');
    setPDesc(p.description);
    setPPrice(p.pricePkr);
    setPDisc(p.discountPricePkr || 0);
    setPStock(p.stock);
    setPImage(p.imageUrl);
    setPVariants((p.variants || []).join(', '));
    setPSpecs((p.specs || []).join('\n'));
    setPGender(p.gender || '');
    setPAgeGroup(p.ageGroup || '');
    setPSafetyNote(p.safetyNote || '');
    setPFeatured(Boolean(p.featured));
  };

  const handleQuickSaveProduct = async (p: Product) => {
    const edits = inlineProdEdits[p.id];
    if (!edits) return;
    await upsertProduct({
      id: p.id,
      name: p.name,
      category: p.category,
      subcategory: p.subcategory,
      description: p.description,
      pricePkr: Math.max(0, Number(edits.pricePkr) || 0),
      ...(edits.discountPricePkr > 0 ? { discountPricePkr: Number(edits.discountPricePkr) } : {}),
      stock: Math.max(0, Number(edits.stock) || 0),
      imageUrl: p.imageUrl,
      variants: p.variants || [],
      specs: p.specs || [],
      ...(p.brand ? { brand: p.brand } : {}),
      ...(p.gender ? { gender: p.gender } : {}),
      ...(p.ageGroup ? { ageGroup: p.ageGroup } : {}),
      ...(p.safetyNote ? { safetyNote: p.safetyNote } : {}),
      ...(typeof p.ratingAvg === 'number' ? { ratingAvg: p.ratingAvg } : {}),
      ...(typeof p.reviewCount === 'number' ? { reviewCount: p.reviewCount } : {}),
      ...(p.seoTitle ? { seoTitle: p.seoTitle } : {}),
      ...(p.seoDescription ? { seoDescription: p.seoDescription } : {}),
      ...(p.ogImageUrl ? { ogImageUrl: p.ogImageUrl } : {}),
      featured: edits.featured,
      isDemo: false,
    });
    setInlineProdEdits((prev) => {
      const next = { ...prev };
      delete next[p.id];
      return next;
    });
  };

  const handleSaveCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    const outcomesList = cOutcomes.split('\n').map((l) => l.trim()).filter(Boolean);
    const curriculumList = cCurriculum.split('\n').map((l) => l.trim()).filter(Boolean);
    const existingCourse = editingCourseId ? courses.find((c) => c.id === editingCourseId) : undefined;
    const payload: Omit<Course, 'createdAt' | 'updatedAt'> = {
      id: editingCourseId || `course-${Date.now()}`,
      title: cTitle,
      track: cTrack,
      overview: cOverview,
      outcomes: outcomesList.length > 0 ? outcomesList : ['Hands-on project mastery'],
      curriculum: curriculumList.length > 0 ? curriculumList : ['Module 1: Core Foundations'],
      duration: cDuration,
      level: cLevel,
      feePkr: Math.max(0, Number(cFee) || 0),
      instructorName: cInstructor,
      ...(cInstructorBio.trim() ? { instructorBio: cInstructorBio.trim() } : {}),
      imageUrl: cImage || ASSETS.courses,
      ...(existingCourse?.seoTitle ? { seoTitle: existingCourse.seoTitle } : {}),
      ...(existingCourse?.seoDescription ? { seoDescription: existingCourse.seoDescription } : {}),
      ...(existingCourse?.ogImageUrl ? { ogImageUrl: existingCourse.ogImageUrl } : {}),
      featured: cFeatured,
      isDemo: false,
    };
    await upsertCourse(payload);
    resetCourseForm();
  };

  const handleEditCourse = (c: Course, asClone = false) => {
    setEditingCourseId(asClone ? '' : c.id);
    setCTitle(asClone ? `${c.title} (Copy)` : c.title);
    setCTrack(c.track);
    setCOverview(c.overview);
    setCOutcomes((c.outcomes || []).join('\n'));
    setCDuration(c.duration);
    setCLevel(c.level);
    setCFee(c.feePkr);
    setCInstructor(c.instructorName);
    setCInstructorBio(c.instructorBio || '');
    setCImage(c.imageUrl || ASSETS.courses);
    setCFeatured(Boolean(c.featured));
    setCCurriculum((c.curriculum || []).join('\n'));
  };

  const handleQuickSaveCourseFee = async (c: Course) => {
    const newFee = inlineCourseFee[c.id];
    if (typeof newFee !== 'number') return;
    await upsertCourse({
      id: c.id,
      title: c.title,
      track: c.track,
      overview: c.overview,
      outcomes: c.outcomes,
      curriculum: c.curriculum,
      duration: c.duration,
      level: c.level,
      feePkr: Math.max(0, newFee),
      instructorName: c.instructorName,
      ...(c.instructorBio ? { instructorBio: c.instructorBio } : {}),
      ...(c.seoTitle ? { seoTitle: c.seoTitle } : {}),
      ...(c.seoDescription ? { seoDescription: c.seoDescription } : {}),
      ...(c.ogImageUrl ? { ogImageUrl: c.ogImageUrl } : {}),
      imageUrl: c.imageUrl,
      featured: c.featured,
      isDemo: false,
    });
    setInlineCourseFee((prev) => {
      const next = { ...prev };
      delete next[c.id];
      return next;
    });
  };

  const handlePublishReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!revAuthor.trim() || !revComment.trim()) {
      showToast('Enter real customer name and review comment.', 'error');
      return;
    }
    await publishAdminReview({
      targetType: revTargetType,
      targetId: revTargetType === 'platform' ? 'store-general' : revTargetName.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 60) || 'general',
      targetName: revTargetName.trim() || 'Digital E-Commerce by ASIF',
      authorName: revAuthor.trim(),
      rating: revRating,
      comment: revComment.trim(),
      verifiedPurchase: revVerified,
    });
    setRevAuthor('');
    setRevComment('');
  };

  const handleAddMcq = async (e: React.FormEvent) => {
    e.preventDefault();
    const opts = mOpts.split('|').map((s) => s.trim()).filter(Boolean);
    if (opts.length < 2) return;
    await addMcqQuestion({
      examGroup: mGroup,
      examCategory: mCat,
      subject: mSub,
      question: mQ,
      options: opts,
      correctIndex: Math.min(mCorrect, opts.length - 1),
      explanation: mExp,
    });
    setMQ('');
    setMExp('');
  };

  const filteredAdminProducts = products.filter((p) => {
    if (prodFilterCat !== 'all' && p.category !== prodFilterCat) return false;
    const q = prodSearch.trim().toLowerCase();
    if (q && !p.name.toLowerCase().includes(q) && !p.subcategory.toLowerCase().includes(q)) return false;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      <SeoHead
        title="Admin Dashboard | Digital E-Commerce by ASIF"
        description="Catalog, pricing, inventory, courses, reviews, newsletter, and SEO settings management."
      />
      <Breadcrumbs items={[{ label: 'Admin Dashboard' }]} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-slate-900">Admin Dashboard</h1>
          <p className="text-sm text-slate-600">
            Edit catalog products, prices, discounts, stock, courses, customer reviews, orders, and SEO settings.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void seedDemoCatalogToFirestore()}
          className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg inline-flex items-center gap-2 whitespace-nowrap self-start"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Sync Catalog &amp; Settings to Firestore</span>
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-1.5 bg-slate-100 p-1 rounded-xl">
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'products', label: `Products (${products.length})` },
          { id: 'courses', label: `Courses (${courses.length})` },
          { id: 'education', label: `Tuition & MCQs` },
          { id: 'orders', label: `Orders (${adminOrders.length})` },
          { id: 'reviews', label: `Reviews & Inbox` },
          { id: 'newsletter', label: `Newsletter (${adminSubscribers.length})` },
          { id: 'seo', label: 'SEO Manager' },
          { id: 'settings', label: 'Website Settings' },
        ].map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id as typeof tab)}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              tab === item.id ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {tab === 'overview' && (
        <div className="space-y-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Orders', value: String(adminOrders.length) },
              { label: 'Total Revenue', value: formatPkr(totalRevenue) },
              { label: 'Pending Orders', value: String(pendingOrders) },
              { label: 'Catalog Products', value: String(products.length) },
              { label: 'Active Courses', value: String(courses.length) },
              { label: 'Course Enrollments', value: String(adminEnrollments.length) },
              { label: 'Tuition Requests', value: String(adminTuitionRequests.length) },
              { label: 'MCQ Question Bank', value: String(mcqs.length) },
            ].map((kpi) => (
              <div key={kpi.label} className="bg-white border border-slate-200 rounded-xl p-5">
                <div className="text-xs text-slate-500">{kpi.label}</div>
                <div className="mt-1.5 font-display text-2xl font-bold text-slate-900 tabular-nums">
                  {kpi.value}
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <h2 className="font-display text-lg font-bold text-slate-900">Recent Activities</h2>
            <div className="mt-4 space-y-2 text-sm text-slate-700">
              {adminOrders.slice(0, 4).map((o) => (
                <div key={o.id} className="py-2 border-b border-slate-100 flex justify-between">
                  <span>Order {o.orderCode} by {o.customerName} ({o.city})</span>
                  <span className="font-mono-tabular font-semibold">{formatPkr(o.totalPkr)} · {o.status}</span>
                </div>
              ))}
              {adminEnrollments.slice(0, 3).map((e) => (
                <div key={e.id} className="py-2 border-b border-slate-100 flex justify-between">
                  <span>Enrollment: {e.studentName} → {e.courseTitle}</span>
                  <span className="text-xs font-semibold text-blue-700">{e.status}</span>
                </div>
              ))}
              {adminOrders.length === 0 && adminEnrollments.length === 0 && (
                <p className="text-slate-500 text-sm">No live orders or enrollments yet.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Products Management */}
      {tab === 'products' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <form onSubmit={(e) => void handleSaveProduct(e)} className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-6 space-y-3.5">
            <h2 className="font-display text-lg font-bold text-slate-900">
              {editingProdId ? 'Edit Product Details' : 'Add New Product'}
            </h2>
            <input
              type="text"
              required
              value={pName}
              onChange={(e) => setPName(e.target.value)}
              placeholder="Product Name"
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg"
            />
            <div className="grid grid-cols-2 gap-3">
              <select
                value={pCat}
                onChange={(e) => setPCat(e.target.value as StoreCategorySlug)}
                className="px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg"
              >
                <option value="electronics">Electronics</option>
                <option value="fashion">Fashion</option>
                <option value="kids-toys">Kids &amp; Toys</option>
                <option value="home-accessories">Home Accessories</option>
              </select>
              <input
                type="text"
                required
                value={pSub}
                onChange={(e) => setPSub(e.target.value)}
                placeholder="Subcategory"
                className="px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                value={pBrand}
                onChange={(e) => setPBrand(e.target.value)}
                placeholder="Brand (optional)"
                className="px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg"
              />
              {pCat === 'fashion' ? (
                <select
                  value={pGender}
                  onChange={(e) => setPGender(e.target.value)}
                  className="px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg"
                >
                  <option value="">Collection (Optional)</option>
                  <option value="Ladies">Ladies</option>
                  <option value="Gents">Gents</option>
                  <option value="Kids">Kids</option>
                </select>
              ) : pCat === 'kids-toys' ? (
                <input
                  type="text"
                  value={pAgeGroup}
                  onChange={(e) => setPAgeGroup(e.target.value)}
                  placeholder="Age Group (e.g. 6–8 Years)"
                  className="px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg"
                />
              ) : (
                <div className="flex items-center gap-2 px-3 py-2 text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-lg">
                  <input
                    id="prod-featured"
                    type="checkbox"
                    checked={pFeatured}
                    onChange={(e) => setPFeatured(e.target.checked)}
                    className="rounded border-slate-300 text-blue-700"
                  />
                  <label htmlFor="prod-featured" className="cursor-pointer font-medium">Featured on Home</label>
                </div>
              )}
            </div>
            {(pCat === 'fashion' || pCat === 'kids-toys') && (
              <div className="flex items-center gap-2 text-xs text-slate-700">
                <input
                  id="prod-featured-alt"
                  type="checkbox"
                  checked={pFeatured}
                  onChange={(e) => setPFeatured(e.target.checked)}
                  className="rounded border-slate-300 text-blue-700"
                />
                <label htmlFor="prod-featured-alt" className="cursor-pointer font-medium">Featured on Homepage</label>
              </div>
            )}
            <textarea
              rows={3}
              required
              value={pDesc}
              onChange={(e) => setPDesc(e.target.value)}
              placeholder="Product Description"
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg"
            />
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] text-slate-500">Price PKR</label>
                <input
                  type="number"
                  required
                  min={0}
                  value={pPrice}
                  onChange={(e) => setPPrice(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-500">Discount PKR</label>
                <input
                  type="number"
                  min={0}
                  value={pDisc}
                  onChange={(e) => setPDisc(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-500">Stock</label>
                <input
                  type="number"
                  required
                  min={0}
                  value={pStock}
                  onChange={(e) => setPStock(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>
            </div>
            <input
              type="text"
              required
              value={pImage}
              onChange={(e) => setPImage(e.target.value)}
              placeholder="Image URL"
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg"
            />
            <input
              type="text"
              value={pVariants}
              onChange={(e) => setPVariants(e.target.value)}
              placeholder="Variants / Sizes (comma separated)"
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg"
            />
            <textarea
              rows={2}
              value={pSpecs}
              onChange={(e) => setPSpecs(e.target.value)}
              placeholder="Key Specifications (one per line)"
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg"
            />
            {pCat === 'kids-toys' && (
              <input
                type="text"
                value={pSafetyNote}
                onChange={(e) => setPSafetyNote(e.target.value)}
                placeholder="Child Safety Note (optional)"
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg"
              />
            )}
            <div className="flex gap-2 pt-2">
              <button type="submit" className="px-4 py-2.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold rounded-lg inline-flex items-center gap-1.5">
                <Plus className="w-4 h-4" />
                <span>{editingProdId ? 'Update Product' : 'Save Product'}</span>
              </button>
              {editingProdId && (
                <button
                  type="button"
                  onClick={resetProductForm}
                  className="px-4 py-2.5 bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>

          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6 space-y-4 overflow-x-auto">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <input
                type="text"
                value={prodSearch}
                onChange={(e) => setProdSearch(e.target.value)}
                placeholder="Search products to edit price or stock..."
                className="flex-1 min-w-[200px] px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg"
              />
              <select
                value={prodFilterCat}
                onChange={(e) => setProdFilterCat(e.target.value as 'all' | StoreCategorySlug)}
                className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg"
              >
                <option value="all">All Categories</option>
                <option value="electronics">Electronics</option>
                <option value="fashion">Fashion</option>
                <option value="kids-toys">Kids &amp; Toys</option>
                <option value="home-accessories">Home Accessories</option>
              </select>
            </div>

            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 text-slate-500">
                <tr>
                  <th className="py-2 pr-2">Product</th>
                  <th className="py-2 pr-2">Price PKR</th>
                  <th className="py-2 pr-2">Disc PKR</th>
                  <th className="py-2 pr-2">Stock</th>
                  <th className="py-2">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAdminProducts.map((p) => {
                  const rowEdit = inlineProdEdits[p.id];
                  const curPrice = rowEdit ? rowEdit.pricePkr : p.pricePkr;
                  const curDisc = rowEdit ? rowEdit.discountPricePkr : p.discountPricePkr || 0;
                  const curStock = rowEdit ? rowEdit.stock : p.stock;
                  const curFeatured = rowEdit ? rowEdit.featured : p.featured;
                  const setRowField = (patch: Partial<{ pricePkr: number; discountPricePkr: number; stock: number; featured: boolean }>) =>
                    setInlineProdEdits((prev) => ({
                      ...prev,
                      [p.id]: {
                        pricePkr: curPrice,
                        discountPricePkr: curDisc,
                        stock: curStock,
                        featured: curFeatured,
                        ...patch,
                      },
                    }));

                  return (
                    <tr key={p.id}>
                      <td className="py-2 pr-2">
                        <div className="font-medium text-slate-900 line-clamp-1">{p.name}</div>
                        <div className="text-[11px] text-slate-500">{p.category} · {p.subcategory}</div>
                      </td>
                      <td className="py-2 pr-2">
                        <input
                          type="number"
                          min={0}
                          value={curPrice}
                          onChange={(e) => setRowField({ pricePkr: Number(e.target.value) })}
                          className="w-20 px-2 py-1 bg-slate-50 border border-slate-200 rounded font-mono-tabular"
                        />
                      </td>
                      <td className="py-2 pr-2">
                        <input
                          type="number"
                          min={0}
                          value={curDisc}
                          onChange={(e) => setRowField({ discountPricePkr: Number(e.target.value) })}
                          className="w-20 px-2 py-1 bg-slate-50 border border-slate-200 rounded font-mono-tabular"
                        />
                      </td>
                      <td className="py-2 pr-2">
                        <input
                          type="number"
                          min={0}
                          value={curStock}
                          onChange={(e) => setRowField({ stock: Number(e.target.value) })}
                          className="w-14 px-2 py-1 bg-slate-50 border border-slate-200 rounded font-mono-tabular"
                        />
                      </td>
                      <td className="py-2 flex items-center gap-2">
                        {rowEdit && (
                          <button
                            type="button"
                            onClick={() => void handleQuickSaveProduct(p)}
                            className="p-1 bg-emerald-600 text-white rounded hover:bg-emerald-700"
                            title="Save price & stock"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button type="button" onClick={() => handleEditProduct(p, false)} className="text-blue-700 font-semibold hover:underline">
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleEditProduct(p, true)}
                          className="text-slate-600 hover:text-slate-900"
                          title="Clone as new product"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button type="button" onClick={() => void deleteProduct(p.id)} className="text-red-600 hover:text-red-800" title="Delete product">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Courses Management */}
      {tab === 'courses' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <form onSubmit={(e) => void handleSaveCourse(e)} className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-6 space-y-3.5">
            <h2 className="font-display text-lg font-bold text-slate-900">
              {editingCourseId ? 'Edit Course Details' : 'Add New Course'}
            </h2>
            <input
              type="text"
              required
              value={cTitle}
              onChange={(e) => setCTitle(e.target.value)}
              placeholder="Course Title"
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg"
            />
            <select
              value={cTrack}
              onChange={(e) => setCTrack(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg"
            >
              {COURSE_TRACKS.map((t) => (
                <option key={t.track} value={t.track}>{t.track}</option>
              ))}
            </select>
            <textarea
              rows={3}
              required
              value={cOverview}
              onChange={(e) => setCOverview(e.target.value)}
              placeholder="Course Overview"
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg"
            />
            <div className="grid grid-cols-3 gap-3">
              <input
                type="text"
                required
                value={cDuration}
                onChange={(e) => setCDuration(e.target.value)}
                placeholder="8 Weeks"
                className="px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg"
              />
              <select
                value={cLevel}
                onChange={(e) => setCLevel(e.target.value as CourseLevel)}
                className="px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
              <input
                type="number"
                required
                min={0}
                value={cFee}
                onChange={(e) => setCFee(Number(e.target.value))}
                placeholder="Fee PKR"
                className="px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>
            <input
              type="text"
              required
              value={cInstructor}
              onChange={(e) => setCInstructor(e.target.value)}
              placeholder="Instructor Name"
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg"
            />
            <input
              type="text"
              value={cInstructorBio}
              onChange={(e) => setCInstructorBio(e.target.value)}
              placeholder="Instructor Bio (optional)"
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg"
            />
            <input
              type="text"
              value={cImage}
              onChange={(e) => setCImage(e.target.value)}
              placeholder="Course Banner Image URL"
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg"
            />
            <textarea
              rows={2}
              value={cOutcomes}
              onChange={(e) => setCOutcomes(e.target.value)}
              placeholder="Learning outcomes (one per line)"
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg"
            />
            <textarea
              rows={3}
              value={cCurriculum}
              onChange={(e) => setCCurriculum(e.target.value)}
              placeholder="Curriculum modules (one per line)"
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg"
            />
            <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={cFeatured}
                onChange={(e) => setCFeatured(e.target.checked)}
                className="rounded border-slate-300 text-blue-700"
              />
              <span>Featured on Homepage</span>
            </label>
            <div className="flex gap-2">
              <button type="submit" className="px-4 py-2.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold rounded-lg">
                {editingCourseId ? 'Update Course' : 'Save Course'}
              </button>
              {editingCourseId && (
                <button
                  type="button"
                  onClick={resetCourseForm}
                  className="px-4 py-2.5 bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>

          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6 space-y-3">
            {courses.map((c) => {
              const editedFee = inlineCourseFee[c.id];
              return (
                <div key={c.id} className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg flex flex-wrap items-center justify-between gap-4">
                  <div className="min-w-[200px] flex-1">
                    <div className="text-sm font-semibold text-slate-900">{c.title}</div>
                    <div className="text-xs text-slate-500">
                      {c.track} · {c.duration} · {c.level}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-slate-500">PKR</span>
                    <input
                      type="number"
                      min={0}
                      value={typeof editedFee === 'number' ? editedFee : c.feePkr}
                      onChange={(e) =>
                        setInlineCourseFee((prev) => ({ ...prev, [c.id]: Number(e.target.value) }))
                      }
                      className="w-24 px-2 py-1 bg-white border border-slate-200 rounded font-mono-tabular"
                    />
                    {typeof editedFee === 'number' && (
                      <button
                        type="button"
                        onClick={() => void handleQuickSaveCourseFee(c)}
                        className="p-1 bg-emerald-600 text-white rounded hover:bg-emerald-700"
                        title="Save course fee"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleEditCourse(c, false)}
                      className="text-blue-700 font-semibold hover:underline ml-1"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleEditCourse(c, true)}
                      className="text-slate-600 hover:text-slate-900"
                      title="Clone course"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button type="button" onClick={() => void deleteCourse(c.id)} className="text-red-600">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Education & MCQs Management */}
      {tab === 'education' && (
        <div className="space-y-8">
          {/* Tuition Teacher Assignment */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
            <h2 className="font-display text-lg font-bold text-slate-900">
              Tuition Requests & Teacher Assignment ({adminTuitionRequests.length})
            </h2>
            {adminTuitionRequests.length === 0 ? (
              <p className="text-sm text-slate-500">No tuition requests submitted yet.</p>
            ) : (
              <div className="space-y-3">
                {adminTuitionRequests.map((tr) => (
                  <div key={tr.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="text-sm">
                      <div className="font-bold text-slate-900">
                        {tr.studentName} (Guardian: {tr.guardianName})
                      </div>
                      <div className="text-xs text-slate-600 mt-0.5">
                        {tr.className} · {tr.subject} · {tr.tuitionMode} · {tr.cityArea} · WhatsApp: {tr.whatsapp}
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <input
                        type="text"
                        placeholder="Assign Teacher Name"
                        value={teacherMap[tr.id] ?? tr.assignedTeacher ?? ''}
                        onChange={(e) => setTeacherMap((prev) => ({ ...prev, [tr.id]: e.target.value }))}
                        className="px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg"
                      />
                      <select
                        value={tr.status}
                        onChange={(e) =>
                          void updateTuitionRequest(
                            tr.id,
                            e.target.value as TuitionStatus,
                            teacherMap[tr.id] ?? tr.assignedTeacher ?? '',
                          )
                        }
                        className="px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Teacher Assigned">Teacher Assigned</option>
                        <option value="Active">Active</option>
                        <option value="Closed">Closed</option>
                      </select>
                      <button
                        type="button"
                        onClick={() =>
                          void updateTuitionRequest(
                            tr.id,
                            'Teacher Assigned',
                            teacherMap[tr.id] ?? tr.assignedTeacher ?? '',
                          )
                        }
                        className="px-3 py-1.5 bg-blue-700 text-white text-xs font-semibold rounded-lg"
                      >
                        Assign
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Course Enrollments */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
            <h2 className="font-display text-lg font-bold text-slate-900">
              Course Enrollments ({adminEnrollments.length})
            </h2>
            {adminEnrollments.length === 0 ? (
              <p className="text-sm text-slate-500">No enrollments yet.</p>
            ) : (
              <div className="space-y-2">
                {adminEnrollments.map((enr) => (
                  <div key={enr.id} className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div>
                      <span className="font-bold text-slate-900">{enr.studentName}</span> — {enr.courseTitle} ({enr.learningMode}) · {enr.whatsapp}
                    </div>
                    <select
                      value={enr.status}
                      onChange={(e) => void updateEnrollmentStatus(enr.id, e.target.value as typeof enr.status)}
                      className="px-2.5 py-1 bg-white border border-slate-200 rounded-md"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Confirmed">Confirmed</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add MCQ */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <form onSubmit={(e) => void handleAddMcq(e)} className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-6 space-y-3">
              <h2 className="font-display text-lg font-bold text-slate-900">Upload Practice MCQ</h2>
              <div className="grid grid-cols-2 gap-3">
                <select
                  value={mGroup}
                  onChange={(e) => setMGroup(e.target.value as 'govt' | 'ability')}
                  className="px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg"
                >
                  <option value="govt">Govt Exam</option>
                  <option value="ability">Ability / Admission</option>
                </select>
                <input
                  type="text"
                  required
                  value={mSub}
                  onChange={(e) => setMSub(e.target.value)}
                  placeholder="Subject"
                  className="px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>
              <input
                type="text"
                required
                value={mCat}
                onChange={(e) => setMCat(e.target.value)}
                placeholder="Exam Category (e.g. PPSC / MDCAT)"
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg"
              />
              <textarea
                rows={2}
                required
                value={mQ}
                onChange={(e) => setMQ(e.target.value)}
                placeholder="Question prompt"
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg"
              />
              <input
                type="text"
                required
                value={mOpts}
                onChange={(e) => setMOpts(e.target.value)}
                placeholder="Options separated by |"
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg"
              />
              <input
                type="number"
                min={0}
                max={5}
                value={mCorrect}
                onChange={(e) => setMCorrect(Number(e.target.value))}
                placeholder="Correct option index (0-based)"
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg"
              />
              <textarea
                rows={2}
                required
                value={mExp}
                onChange={(e) => setMExp(e.target.value)}
                placeholder="Answer explanation"
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg"
              />
              <button type="submit" className="px-4 py-2.5 bg-blue-700 text-white text-xs font-semibold rounded-lg">
                Add MCQ to Bank
              </button>
            </form>

            <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6 space-y-2.5 max-h-[460px] overflow-y-auto">
              <h3 className="font-display text-base font-bold text-slate-900">MCQ Question Bank ({mcqs.length})</h3>
              {mcqs.map((q) => (
                <div key={q.id} className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-start justify-between gap-3 text-xs">
                  <div>
                    <div className="text-slate-500">{q.examGroup.toUpperCase()} · {q.examCategory} · {q.subject}</div>
                    <div className="font-medium text-slate-900 mt-1">{q.question}</div>
                  </div>
                  <button type="button" onClick={() => void deleteMcqQuestion(q.id)} className="text-red-600 shrink-0">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Orders Tab */}
      {tab === 'orders' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-slate-900">Order Management</h2>
            <button
              type="button"
              onClick={exportOrdersCsv}
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg inline-flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Orders CSV</span>
            </button>
          </div>
          {adminOrders.length === 0 ? (
            <p className="text-sm text-slate-500">No customer orders recorded yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-200 text-slate-500">
                  <tr>
                    <th className="py-2 pr-3">Order ID</th>
                    <th className="py-2 pr-3">Customer & City</th>
                    <th className="py-2 pr-3">Payment</th>
                    <th className="py-2 pr-3">Total</th>
                    <th className="py-2 pr-3">Status</th>
                    <th className="py-2">Live Tracking Note</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {adminOrders.map((ord) => {
                    const noteDraft = orderNoteMap[ord.id] ?? '';
                    return (
                      <tr key={ord.id}>
                        <td className="py-3 pr-3 font-mono-tabular font-bold text-slate-900">{ord.orderCode}</td>
                        <td className="py-3 pr-3">
                          <div className="font-semibold text-slate-900">{ord.customerName}</div>
                          <div className="text-slate-500">{ord.phone} · {ord.city}</div>
                        </td>
                        <td className="py-3 pr-3 text-slate-700">
                          <div>{ord.paymentMethod}</div>
                          {ord.paymentReference && <div className="text-slate-500 font-mono-tabular">TID: {ord.paymentReference}</div>}
                        </td>
                        <td className="py-3 pr-3 font-mono-tabular font-bold">{formatPkr(ord.totalPkr)}</td>
                        <td className="py-3 pr-3">
                          <select
                            value={ord.status}
                            onChange={(e) =>
                              void updateOrderStatus(
                                ord.id,
                                e.target.value as OrderStatus,
                                noteDraft.trim() || undefined,
                              )
                            }
                            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-md font-semibold"
                          >
                            {(['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'] as OrderStatus[]).map((st) => (
                              <option key={st} value={st}>{st}</option>
                            ))}
                          </select>
                        </td>
                        <td className="py-3">
                          <div className="flex items-center gap-1.5">
                            <input
                              type="text"
                              value={noteDraft}
                              onChange={(e) =>
                                setOrderNoteMap((prev) => ({ ...prev, [ord.id]: e.target.value }))
                              }
                              placeholder="e.g. TCS #12345 dispatched"
                              className="w-44 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-xs"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                void updateOrderStatus(
                                  ord.id,
                                  ord.status,
                                  noteDraft.trim() || undefined,
                                )
                              }
                              className="px-2.5 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-md font-semibold"
                            >
                              Update
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Reviews & Contact Messages */}
      {tab === 'reviews' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <div className="space-y-6">
            <form onSubmit={(e) => void handlePublishReview(e)} className="bg-white border border-slate-200 rounded-xl p-6 space-y-3.5">
              <h2 className="font-display text-lg font-bold text-slate-900">
                Publish Verified Customer Review
              </h2>
              <p className="text-xs text-slate-500">
                Enter real verified feedback from a customer or student to showcase on the homepage and product/course pages.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  required
                  value={revAuthor}
                  onChange={(e) => setRevAuthor(e.target.value)}
                  placeholder="Real Customer / Student Name"
                  className="px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg"
                />
                <select
                  value={revTargetType}
                  onChange={(e) => setRevTargetType(e.target.value as typeof revTargetType)}
                  className="px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg"
                >
                  <option value="platform">General Store / Platform</option>
                  <option value="product">Specific Product</option>
                  <option value="course">Specific Course</option>
                </select>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  required
                  value={revTargetName}
                  onChange={(e) => setRevTargetName(e.target.value)}
                  placeholder="Product, Course, or Service Name"
                  className="px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg"
                />
                <select
                  value={revRating}
                  onChange={(e) => setRevRating(Number(e.target.value))}
                  className="px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg"
                >
                  {[5, 4, 3, 2, 1].map((n) => (
                    <option key={n} value={n}>{n} Stars</option>
                  ))}
                </select>
              </div>
              <textarea
                rows={3}
                required
                value={revComment}
                onChange={(e) => setRevComment(e.target.value)}
                placeholder="Customer testimonial comment..."
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg"
              />
              <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={revVerified}
                  onChange={(e) => setRevVerified(e.target.checked)}
                  className="rounded border-slate-300 text-blue-700"
                />
                <span>Mark as Verified Purchase / Student</span>
              </label>
              <button
                type="submit"
                className="px-4 py-2.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold rounded-lg"
              >
                Publish Review Live
              </button>
            </form>

            <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
              <h2 className="font-display text-lg font-bold text-slate-900">
                Customer Review Moderation ({adminReviews.length})
              </h2>
              {adminReviews.length === 0 ? (
                <p className="text-sm text-slate-500">No reviews recorded yet.</p>
              ) : (
                adminReviews.map((rev) => (
                  <div key={rev.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
                    <div className="flex justify-between font-semibold text-slate-900">
                      <span>{rev.authorName} · {rev.rating}/5</span>
                      <span className="uppercase">{rev.status}</span>
                    </div>
                    <div className="text-slate-500">{rev.targetName}</div>
                    <p className="text-slate-700 text-sm">{rev.comment}</p>
                    <div className="flex gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => void moderateReview(rev.id, 'approved')}
                        className="px-3 py-1 bg-emerald-600 text-white rounded-md font-semibold"
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        onClick={() => void moderateReview(rev.id, 'hidden')}
                        className="px-3 py-1 bg-slate-600 text-white rounded-md font-semibold"
                      >
                        Hide
                      </button>
                      <button
                        type="button"
                        onClick={() => void moderateReview(rev.id, 'rejected')}
                        className="px-3 py-1 bg-red-600 text-white rounded-md font-semibold"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
            <h2 className="font-display text-lg font-bold text-slate-900">
              Contact Us Inbox ({adminMessages.length})
            </h2>
            {adminMessages.length === 0 ? (
              <p className="text-sm text-slate-500">No contact inquiries yet.</p>
            ) : (
              adminMessages.map((msg) => (
                <div key={msg.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1 text-xs">
                  <div className="font-bold text-slate-900">{msg.subject}</div>
                  <div className="text-slate-500">{msg.name} · {msg.email} · {msg.whatsapp}</div>
                  <p className="text-slate-700 text-sm pt-1">{msg.message}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Newsletter Subscribers */}
      {tab === 'newsletter' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-display text-lg font-bold text-slate-900">
                Newsletter Subscribers ({adminSubscribers.length})
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Verified subscriber emails stored in Firestore for marketing campaigns and course/exam updates.
              </p>
            </div>
            <button
              type="button"
              onClick={exportSubscribersCsv}
              disabled={adminSubscribers.length === 0}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-semibold rounded-lg inline-flex items-center gap-2 self-start"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Subscribers CSV</span>
            </button>
          </div>

          {adminSubscribers.length === 0 ? (
            <p className="text-sm text-slate-500">No newsletter subscribers recorded yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500">
                    <th className="py-2.5 pr-4 font-semibold">Email Address</th>
                    <th className="py-2.5 pr-4 font-semibold">Status</th>
                    <th className="py-2.5 pr-4 font-semibold">Source</th>
                    <th className="py-2.5 pr-4 font-semibold">Subscriber ID</th>
                    <th className="py-2.5 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {adminSubscribers.map((sub) => (
                    <tr key={sub.id} className="hover:bg-slate-50">
                      <td className="py-3 pr-4 font-medium text-slate-900">{sub.email}</td>
                      <td className="py-3 pr-4 text-emerald-700 font-semibold">
                        {sub.status || 'subscribed'}
                      </td>
                      <td className="py-3 pr-4 text-slate-600">{sub.source || 'newsletter-form'}</td>
                      <td className="py-3 pr-4 font-mono text-slate-500">{sub.id}</td>
                      <td className="py-3 text-right">
                        <button
                          type="button"
                          onClick={() => void deleteSubscriber(sub.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600"
                          title="Remove subscriber"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* SEO & OpenGraph Manager */}
      {tab === 'seo' && <AdminSeoManager />}

      {/* Website & Contact Settings */}
      {tab === 'settings' && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void updateSiteSettings(settingsForm);
          }}
          className="bg-white border border-slate-200 rounded-xl p-6 max-w-3xl grid grid-cols-1 sm:grid-cols-2 gap-4"
        >
          <div className="sm:col-span-2">
            <h2 className="font-display text-lg font-bold text-slate-900">
              Website, WhatsApp & Location Configuration
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Replace placeholders with your official WhatsApp number, Bahawalpur shop address, and social links.
            </p>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">WhatsApp Number</label>
            <input
              type="text"
              required
              value={settingsForm.whatsappNumber}
              onChange={(e) => setSettingsForm({ ...settingsForm, whatsappNumber: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Business Phone</label>
            <input
              type="text"
              required
              value={settingsForm.businessPhone}
              onChange={(e) => setSettingsForm({ ...settingsForm, businessPhone: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Business Email</label>
            <input
              type="text"
              required
              value={settingsForm.businessEmail}
              onChange={(e) => setSettingsForm({ ...settingsForm, businessEmail: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Business Address</label>
            <input
              type="text"
              required
              value={settingsForm.businessAddress}
              onChange={(e) => setSettingsForm({ ...settingsForm, businessAddress: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Google Map Latitude</label>
            <input
              type="number"
              step="0.0001"
              required
              value={settingsForm.mapLat}
              onChange={(e) => setSettingsForm({ ...settingsForm, mapLat: Number(e.target.value) })}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Google Map Longitude</label>
            <input
              type="number"
              step="0.0001"
              required
              value={settingsForm.mapLng}
              onChange={(e) => setSettingsForm({ ...settingsForm, mapLng: Number(e.target.value) })}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1">Hero Headline</label>
            <input
              type="text"
              required
              value={settingsForm.heroHeadline}
              onChange={(e) => setSettingsForm({ ...settingsForm, heroHeadline: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1">Hero Subheadline</label>
            <input
              type="text"
              required
              value={settingsForm.heroSubheadline}
              onChange={(e) => setSettingsForm({ ...settingsForm, heroSubheadline: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1">Top Promotional Strip</label>
            <input
              type="text"
              value={settingsForm.promoBannerText || ''}
              onChange={(e) => setSettingsForm({ ...settingsForm, promoBannerText: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Facebook URL</label>
            <input
              type="text"
              value={settingsForm.facebookUrl || ''}
              onChange={(e) => setSettingsForm({ ...settingsForm, facebookUrl: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Instagram URL</label>
            <input
              type="text"
              value={settingsForm.instagramUrl || ''}
              onChange={(e) => setSettingsForm({ ...settingsForm, instagramUrl: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">YouTube URL</label>
            <input
              type="text"
              value={settingsForm.youtubeUrl || ''}
              onChange={(e) => setSettingsForm({ ...settingsForm, youtubeUrl: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">TikTok URL</label>
            <input
              type="text"
              value={settingsForm.tiktokUrl || ''}
              onChange={(e) => setSettingsForm({ ...settingsForm, tiktokUrl: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg"
            />
          </div>
          <div className="sm:col-span-2 pt-3 border-t border-slate-200">
            <h3 className="font-display text-base font-bold text-slate-900">
              Search Engine Optimization (SEO) Metadata
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Customize Google search title, description, and keywords for the homepage.
            </p>
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1">SEO Title</label>
            <input
              type="text"
              maxLength={160}
              value={settingsForm.seoTitle || ''}
              onChange={(e) => setSettingsForm({ ...settingsForm, seoTitle: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1">SEO Meta Description</label>
            <textarea
              rows={2}
              maxLength={320}
              value={settingsForm.seoDescription || ''}
              onChange={(e) => setSettingsForm({ ...settingsForm, seoDescription: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1">SEO Keywords (comma separated)</label>
            <input
              type="text"
              maxLength={500}
              value={settingsForm.seoKeywords || ''}
              onChange={(e) => setSettingsForm({ ...settingsForm, seoKeywords: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg"
            />
          </div>
          <div className="sm:col-span-2 pt-2">
            <button
              type="submit"
              className="px-6 py-2.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold rounded-lg"
            >
              Save Website Settings
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
