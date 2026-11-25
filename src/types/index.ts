export type StoreCategorySlug = 'electronics' | 'fashion' | 'kids-toys' | 'home-accessories';
export type CategorySeoSlug =
  | StoreCategorySlug
  | 'courses'
  | 'tuition'
  | 'govt-exams'
  | 'ability-tests';

export type OrderStatus = 'Pending' | 'Confirmed' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
export type PaymentMethod = 'Cash on Delivery' | 'Bank Transfer' | 'Easypaisa' | 'JazzCash';
export type LearningMode = 'Live Online' | 'Self-Paced Recorded' | 'Hybrid Mentorship';
export type CourseLevel = 'Beginner' | 'Intermediate' | 'Advanced';
export type ReviewStatus = 'pending' | 'approved' | 'rejected' | 'hidden';
export type TuitionMode = 'Home Tuition' | 'Online Tuition';
export type TuitionStatus = 'Pending' | 'Teacher Assigned' | 'Active' | 'Closed';
export type EnrollmentStatus = 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled';

export const FIELD_LIMITS = {
  NAME_MAX: 120,
  TITLE_MAX: 180,
  DESCRIPTION_MAX: 2000,
  ADDRESS_MAX: 400,
  PHONE_MAX: 40,
  EMAIL_MAX: 200,
  NOTES_MAX: 500,
  COMMENT_MAX: 1000,
} as const;

export interface UserProfile {
  uid: string;
  displayName: string;
  role: 'customer' | 'staff' | 'admin';
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface UserPrivateInfo {
  uid: string;
  email: string;
  phone?: string;
  whatsapp?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  updatedAt?: unknown;
}

export interface WishlistItem {
  productId: string;
  userId: string;
  productName: string;
  category: StoreCategorySlug;
  pricePkr: number;
  imageUrl: string;
  createdAt?: unknown;
}

export interface Product {
  id: string;
  name: string;
  category: StoreCategorySlug;
  subcategory: string;
  description: string;
  pricePkr: number;
  discountPricePkr?: number;
  stock: number;
  imageUrl: string;
  variants?: string[];
  specs?: string[];
  featured: boolean;
  isDemo?: boolean;
  brand?: string;
  gender?: string;
  ageGroup?: string;
  safetyNote?: string;
  ratingAvg?: number;
  reviewCount?: number;
  seoTitle?: string;
  seoDescription?: string;
  ogImageUrl?: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface Course {
  id: string;
  title: string;
  track: string;
  overview: string;
  outcomes: string[];
  curriculum: string[];
  duration: string;
  level: CourseLevel;
  feePkr: number;
  instructorName: string;
  instructorBio?: string;
  imageUrl: string;
  featured: boolean;
  isDemo?: boolean;
  seoTitle?: string;
  seoDescription?: string;
  ogImageUrl?: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface CategorySeo {
  slug: CategorySeoSlug;
  seoTitle: string;
  seoDescription: string;
  ogImageUrl: string;
  seoKeywords?: string;
  updatedAt?: unknown;
}

export interface McqQuestion {
  id: string;
  examGroup: 'govt' | 'ability';
  examCategory: string;
  subject: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  createdAt?: unknown;
}

export interface CartItem {
  productId: string;
  name: string;
  category: StoreCategorySlug;
  pricePkr: number;
  originalPricePkr: number;
  imageUrl: string;
  variant?: string;
  quantity: number;
}

export interface OrderItem {
  productId: string;
  name: string;
  variant?: string;
  quantity: number;
  unitPricePkr: number;
}

export interface Order {
  id: string;
  orderCode: string;
  userId: string;
  customerName: string;
  phone: string;
  whatsapp: string;
  email: string;
  deliveryAddress: string;
  city: string;
  postalCode?: string;
  orderNotes?: string;
  paymentMethod: PaymentMethod;
  paymentReference?: string;
  items: OrderItem[];
  subtotalPkr: number;
  discountPkr: number;
  deliveryFeePkr: number;
  totalPkr: number;
  status: OrderStatus;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface OrderTracking {
  orderCode: string;
  orderId: string;
  userId: string;
  city: string;
  paymentMethod: PaymentMethod;
  itemCount: number;
  itemSummary: string[];
  totalPkr: number;
  status: OrderStatus;
  statusNote?: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface Enrollment {
  id: string;
  userId: string;
  studentName: string;
  email: string;
  whatsapp: string;
  courseId: string;
  courseTitle: string;
  educationLevel: string;
  learningMode: LearningMode;
  status: EnrollmentStatus;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface TuitionRequest {
  id: string;
  userId: string;
  studentName: string;
  guardianName: string;
  contactNumber: string;
  whatsapp: string;
  className: string;
  subject: string;
  board: string;
  cityArea: string;
  tuitionMode: TuitionMode;
  preferredTiming: string;
  assignedTeacher?: string;
  status: TuitionStatus;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface TestAttempt {
  id: string;
  userId: string;
  examCategory: string;
  testTitle: string;
  totalQuestions: number;
  correctCount: number;
  scorePercent: number;
  durationSeconds: number;
  createdAt?: unknown;
}

export interface Review {
  id: string;
  userId: string;
  targetType: 'product' | 'course' | 'platform';
  targetId: string;
  targetName: string;
  authorName: string;
  rating: number;
  comment: string;
  verifiedPurchase: boolean;
  status: ReviewStatus;
  isDemo?: boolean;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface ContactMessage {
  id: string;
  userId: string;
  name: string;
  email: string;
  whatsapp: string;
  subject: string;
  message: string;
  status: 'New' | 'Replied' | 'Resolved';
  createdAt?: unknown;
}

export interface SiteSettings {
  whatsappNumber: string;
  businessAddress: string;
  businessEmail: string;
  businessPhone: string;
  heroHeadline: string;
  heroSubheadline: string;
  promoBannerText?: string;
  mapLat: number;
  mapLng: number;
  facebookUrl?: string;
  instagramUrl?: string;
  tiktokUrl?: string;
  youtubeUrl?: string;
  linkedinUrl?: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  updatedAt?: unknown;
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  userId: string;
  status?: 'subscribed' | 'unsubscribed';
  source?: string;
  subscribedAt?: unknown;
  updatedAt?: unknown;
}

