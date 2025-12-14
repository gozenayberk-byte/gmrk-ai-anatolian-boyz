
export interface CustomsAnalysis {
  productName: string;
  description: string;
  hsCode: string;
  hsCodeDescription: string; // GTIP Kodunun resmi açıklaması
  taxes: string[];
  documents: string[];
  emailDraft: string;
  confidenceScore: number;
  importPrice: string; // Çin FOB Fiyatı
  retailPrice: string; // Türkiye Pazar Fiyatı
}

export interface HistoryItem extends CustomsAnalysis {
  id: string;
  date: string;
  timestamp: number;
}

export interface BillingHistory {
  id: string;
  date: string;
  planName: string;
  amount: string;
  status: 'paid' | 'refunded';
  invoiceUrl: string;
}

export enum AppState {
  IDLE = 'IDLE',         // Anasayfa (Landing Page)
  DASHBOARD = 'DASHBOARD', // Uygulama Paneli (Dosya Yükleme)
  USER_PROFILE = 'USER_PROFILE', // Yeni Kullanıcı Profili Sayfası
  ANALYZING = 'ANALYZING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
  ADMIN = 'ADMIN',
  HISTORY = 'HISTORY'
}

export interface AnalysisError {
  message: string;
  details?: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: string;
  period: string;
  description: string;
  iconKey: 'zap' | 'star' | 'building';
  features: string[];
  cta: string;
  popular: boolean;
  color: 'slate' | 'brand' | 'indigo';
}

export interface User {
  email: string; // Veritabanı anahtarı için gerekli
  name: string;
  title: string;
  role: 'user' | 'admin';
  planId: string; // 'free': Başlangıç, '1': Girişimci, '2': Pro, '3': Kurumsal
  credits: number; // Kalan sorgu hakkı (-1 ise sınırsız)
  subscriptionStatus: 'active' | 'cancelled';
  // Yeni Doğrulama Alanları
  phoneNumber?: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string; // E-ticaret Uzmanı, İthalatçı vb.
  comment: string;
  rating: number; // 1-5
  avatarInitial: string;
}

export interface EmailSettings {
  senderName: string;
  subject: string;
  body: string; // HTML veya Markdown destekli metin
}

export interface PaymentSettings {
  provider: 'iyzico';
  apiKey: string;
  secretKey: string;
  baseUrl: string;
}

export interface SystemUpdate {
  id: string;
  version: string;
  date: string;
  title: string;
  type: 'major' | 'feature' | 'improvement' | 'init';
  description: string;
  changes: string[];
}

export interface SiteContent {
  hero: {
    badge: string;
    titleLine1: string;
    titleLine2: string;
    description: string;
  };
  freeCreditsPromo: {
    isActive: boolean;
    title: string;
    description: string;
  };
  roi: {
    badge: string;
    title: string;
    description: string;
    comparison1: string;
    comparison2: string;
    comparison3: string;
  };
  proSection: {
    badge: string;
    title: string;
    subtitle: string;
    description: string;
  };
  corporate: {
    badge: string;
    title: string;
    subtitle: string;
    description: string;
  };
  faq: {
    title: string;
    subtitle: string;
    items: { question: string; answer: string }[];
  };
  guide: {
    sectionTitle: string;
    starterTitle: string;
    starterDesc: string;
    strategy1Title: string;
    strategy1Desc: string;
    strategy2Title: string;
    strategy2Desc: string;
    proTitle: string;
    proFeature1Title: string;
    proFeature1Desc: string;
    proFeature2Title: string;
    proFeature2Desc: string;
  };
  updates: SystemUpdate[]; // YENİ: Dinamik güncellemeler
  testimonials: Testimonial[];
  tracking: {
    metaPixelId: string;
    tiktokPixelId: string;
  };
  emailSettings: EmailSettings;
  paymentSettings: PaymentSettings; // YENİ: Iyzico ayarları
  footer: {
    brandName: string;
    brandDesc: string;
    copyright: string;
    badgeText: string;
    socialLinks: { twitter: string; linkedin: string; instagram: string };
    legalContent: {
      privacy: string;
      terms: string;
      contact: string;
    }
  };
}

// Dashboard İstatistik Tipi
export interface DashboardStats {
  totalRevenue: number;
  revenueChange: number; 
  totalSales: number;
  salesChange: number;
  newUsers: number;
  usersChange: number;
  totalAnalyses: number;
  analysesChange: number;
  planDistribution: { name: string; count: number; color: string }[]; // YENİ
  salesChart: { day: string; value: number }[];
  recommendations: {
    title: string;
    description: string;
    impact: 'high' | 'medium' | 'low';
  }[];
}