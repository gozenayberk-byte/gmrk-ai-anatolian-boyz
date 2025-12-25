
import { CustomsAnalysis, HistoryItem, User, SubscriptionPlan, SiteContent, DashboardStats, BillingHistory } from "../types";
import { supabase, isSupabaseConfigured } from "./supabaseClient";

const MOCK_SESSION_KEY = 'gumrukai_session';
const SITE_CONTENT_KEY = 'gumrukai_site_content';
const MOCK_HISTORY_PREFIX = 'gumrukai_history_';

const DEFAULT_CONTENT: SiteContent = {
  hero: {
    badge: "2025 GÜNCEL MEVZUAT",
    titleLine1: "Gümrük İşlemlerinizi",
    titleLine2: "Yapay Zeka ile Çözün",
    description: "Sadece bir fotoğraf ile GTIP kodunu tespit edin, vergi oranlarını hesaplayın ve dış ticaret risklerinizi minimize edin."
  },
  productDemo: {
    title: "Akıllı Analiz",
    description: "Görsel tanıma teknolojisi ile GTIP tespiti.",
    imageUrl: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=1000"
  },
  painPoints: {
    title: "Dış Ticaretin Zorluklarını Aşıyoruz",
    subtitle: "Geleneksel yöntemler yavaş ve hata payı yüksek. GümrükAI ile hızlanın.",
    items: []
  },
  freeCreditsPromo: { isActive: true, title: "Hediye Kredi", description: "Doğrula ve kazan." },
  roi: { badge: "ROI", title: "Kazanç", description: "Zaman ve para tasarrufu.", comparison1: "-", comparison2: "-", comparison3: "-" },
  proSection: { badge: "PRO", title: "Pro", subtitle: "Sürüm", description: "Detaylar" },
  corporate: { badge: "Kurumsal", title: "Yönetim", subtitle: "Ekip", description: "Özellikler" },
  faq: {
    title: "Sıkça Sorulan Sorular",
    subtitle: "Merak edilenler",
    items: []
  },
  guide: {
    sectionTitle: "Kullanım Rehberi",
    starterTitle: "Hoş Geldiniz! {credits} Krediniz Var",
    starterDesc: "Sistemi kullanmaya başlamak için bir ürün fotoğrafı yükleyin.",
    strategy1Title: "Hızlı GTIP Tespiti",
    strategy1Desc: "Görsel analizi ile en yakın GTIP kodlarını listeleyin.",
    strategy2Title: "Mevzuat Kontrolü",
    strategy2Desc: "İlgili GTIP için gerekli belgeleri görün.",
    proTitle: "Pro Özellikler",
    proFeature1Title: "Pazar Analizi",
    proFeature1Desc: "Ürünün pazar fiyatlarını karşılaştırın.",
    proFeature2Title: "Otomatik RFQ",
    proFeature2Desc: "Tedarikçiler için İngilizce e-posta taslakları hazırlayın."
  },
  updates: [],
  testimonials: [],
  tracking: { metaPixelId: "", tiktokPixelId: "" },
  emailSettings: {
    senderName: "GümrükAI Ekibi",
    subject: "Aboneliğiniz Aktif Edildi",
    body: "Sayın {ad_soyad}, {paket_adi} paketiniz başarıyla tanımlanmıştır."
  },
  paymentSettings: { 
    provider: 'iyzico', 
    apiKey: process.env.VITE_IYZICO_API_KEY || "", 
    secretKey: process.env.VITE_IYZICO_SECRET_KEY || "", 
    baseUrl: process.env.VITE_IYZICO_BASE_URL || "" 
  },
  footer: {
    brandName: "GümrükAI",
    brandDesc: "Yapay zeka destekli gümrük müşavirliği asistanı.",
    copyright: "© 2025 GümrükAI",
    badgeText: "Secure Payment",
    socialLinks: { twitter: "", linkedin: "", instagram: "" },
    legalContent: {
      privacy: "",
      terms: "",
      contact: ""
    }
  }
};

export const storageService = {
  
  getCurrentUserProfile: async (): Promise<User> => {
    if (isSupabaseConfigured()) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
          if (profile) {
            return { 
                email: profile.email, 
                name: profile.full_name, 
                role: profile.role || 'user', 
                credits: profile.credits || 0,
                planId: profile.plan_id || 'free',
                title: profile.title || 'İthalatçı',
                isEmailVerified: profile.is_email_verified || false,
                isPhoneVerified: profile.is_phone_verified || false,
                phoneNumber: profile.phone_number,
                subscriptionStatus: profile.subscription_status || 'active'
            };
          }
        }
      } catch (e) {
        console.error("Supabase Profile Fetch Error:", e);
      }
    }
    const mockSessionStr = localStorage.getItem(MOCK_SESSION_KEY);
    if (mockSessionStr) return JSON.parse(mockSessionStr);
    throw new Error("Oturum bulunamadı.");
  },

  registerUser: async (name: string, email: string, password: string): Promise<User> => {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: name } } });
      if (error) throw new Error(error.message);
      if (data.user) {
        // Yeni kullanıcılar 0 kredi ile başlar.
        return { email: data.user.email!, name, role: 'user', credits: 0, planId: 'free', title: 'Yeni Üye', isEmailVerified: false, isPhoneVerified: false, subscriptionStatus: 'active' };
      }
    }
    const mockUser: User = { email, name, role: 'user', credits: 0, planId: 'free', title: 'Yeni Üye', isEmailVerified: false, isPhoneVerified: false, subscriptionStatus: 'active' };
    localStorage.setItem(MOCK_SESSION_KEY, JSON.stringify(mockUser));
    return mockUser;
  },

  loginUser: async (email: string, password: string): Promise<User> => {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw new Error(error.message);
      return await storageService.getCurrentUserProfile();
    }
    const mockSessionStr = localStorage.getItem(MOCK_SESSION_KEY);
    if (mockSessionStr) {
      const user = JSON.parse(mockSessionStr) as User;
      if (user.email === email) return user;
    }
    throw new Error("Geçersiz e-posta veya şifre.");
  },

  logoutUser: async () => { 
      localStorage.removeItem(MOCK_SESSION_KEY); 
      if (isSupabaseConfigured()) await supabase.auth.signOut(); 
  },

  saveToHistory: async (userEmail: string, analysis: CustomsAnalysis): Promise<HistoryItem> => {
    if (isSupabaseConfigured()) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const newItem = { 
            user_id: user.id, 
            product_name: analysis.productName, 
            description: analysis.description, 
            hs_code: analysis.hsCode, 
            hs_code_description: analysis.hsCodeDescription, 
            taxes: analysis.taxes, 
            documents: analysis.documents, 
            import_price: analysis.importPrice, 
            retail_price: analysis.retailPrice, 
            email_draft: analysis.emailDraft, 
            confidence_score: analysis.confidenceScore 
          };
          const { data, error } = await supabase.from('analysis_history').insert(newItem).select().single();
          if (!error && data) {
            return { 
              ...analysis, 
              id: data.id, 
              timestamp: new Date(data.created_at).getTime(), 
              date: new Date(data.created_at).toLocaleDateString('tr-TR') 
            };
          }
        }
      } catch (e) { console.warn("Database save failed, using fallback."); }
    }
    const mockItem: HistoryItem = { ...analysis, id: `h-${Date.now()}`, date: new Date().toLocaleDateString('tr-TR'), timestamp: Date.now() };
    const key = `${MOCK_HISTORY_PREFIX}${userEmail}`;
    const history = JSON.parse(localStorage.getItem(key) || '[]');
    localStorage.setItem(key, JSON.stringify([mockItem, ...history]));
    return mockItem;
  },

  getUserHistory: async (userEmail: string): Promise<HistoryItem[]> => {
    if (isSupabaseConfigured()) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data } = await supabase.from('analysis_history').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
          if (data) return data.map((item: any) => ({
              productName: item.product_name,
              description: item.description,
              hsCode: item.hs_code,
              hsCodeDescription: item.hs_code_description || '',
              taxes: item.taxes || [],
              documents: item.documents || [],
              importPrice: item.import_price,
              retailPrice: item.retail_price,
              emailDraft: item.email_draft || "",
              confidenceScore: item.confidence_score || 90,
              id: item.id,
              date: new Date(item.created_at).toLocaleDateString('tr-TR'),
              timestamp: new Date(item.created_at).getTime()
            }));
        }
      } catch (e) {}
    }
    const key = `${MOCK_HISTORY_PREFIX}${userEmail}`;
    return JSON.parse(localStorage.getItem(key) || '[]');
  },

  deleteHistoryItem: async (userEmail: string, id: string) => {
    if (id.startsWith('h-')) {
      const key = `${MOCK_HISTORY_PREFIX}${userEmail}`;
      const history = JSON.parse(localStorage.getItem(key) || '[]');
      localStorage.setItem(key, JSON.stringify(history.filter((i: any) => i.id !== id)));
    } else if (isSupabaseConfigured()) {
      await supabase.from('analysis_history').delete().eq('id', id);
    }
  },

  getSiteContent: (): SiteContent => {
    const saved = localStorage.getItem(SITE_CONTENT_KEY);
    return saved ? JSON.parse(saved) : DEFAULT_CONTENT;
  },

  fetchSiteContent: async (): Promise<SiteContent> => {
    if (isSupabaseConfigured()) {
      try {
        const { data } = await supabase.from('site_config').select('content').single();
        if (data && data.content) return { ...DEFAULT_CONTENT, ...data.content };
      } catch (e) {}
    }
    return storageService.getSiteContent();
  },

  saveSiteContent: async (content: SiteContent) => {
    localStorage.setItem(SITE_CONTENT_KEY, JSON.stringify(content));
    if (isSupabaseConfigured()) {
      await supabase.from('site_config').upsert({ id: 1, content });
    }
  },

  getAllUsers: async (): Promise<User[]> => {
    if (isSupabaseConfigured()) {
      const { data } = await supabase.from('profiles').select('*');
      if (data) return data.map((p: any) => ({ 
        email: p.email, name: p.full_name, role: p.role || 'user', credits: p.credits, 
        planId: p.plan_id, title: p.title, isEmailVerified: p.is_email_verified, 
        isPhoneVerified: p.is_phone_verified, subscriptionStatus: p.subscription_status 
      }));
    }
    return [];
  },

  getDashboardStats: async (): Promise<DashboardStats> => {
    return {
      totalRevenue: 0, revenueChange: 0, totalSales: 0, salesChange: 0, 
      newUsers: 0, usersChange: 0, totalAnalyses: 0, analysesChange: 0,
      planDistribution: [], salesChart: [], recommendations: []
    };
  },

  updateUserSubscription: async (plan: any, userEmail: string): Promise<User> => {
    if (isSupabaseConfigured()) {
       const { data: profile } = await supabase.from('profiles').select('id').eq('email', userEmail).single();
       if (profile) await supabase.from('profiles').update({ plan_id: plan.id, credits: -1, subscription_status: 'active' }).eq('id', profile.id);
    } else {
      const mockSessionStr = localStorage.getItem(MOCK_SESSION_KEY);
      if (mockSessionStr) {
        const u = JSON.parse(mockSessionStr) as User;
        if (u.email === userEmail) {
          u.planId = plan.id;
          u.credits = -1;
          u.subscriptionStatus = 'active';
          localStorage.setItem(MOCK_SESSION_KEY, JSON.stringify(u));
        }
      }
    }
    return await storageService.getCurrentUserProfile();
  },

  deleteUser: async (email: string) => {
    if (isSupabaseConfigured()) await supabase.from('profiles').delete().eq('email', email);
  },

  getUserBilling: async (userEmail: string): Promise<BillingHistory[]> => {
    return [];
  },

  cancelUserSubscription: async (): Promise<User> => {
    const user = await storageService.getCurrentUserProfile();
    const updated = { ...user, subscriptionStatus: 'cancelled' as const, planId: 'free' };
    localStorage.setItem(MOCK_SESSION_KEY, JSON.stringify(updated));
    if (isSupabaseConfigured()) {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (authUser) await supabase.from('profiles').update({ subscription_status: 'cancelled', plan_id: 'free' }).eq('id', authUser.id);
    }
    return updated;
  },

  applyRetentionOffer: async (): Promise<User> => {
    const user = await storageService.getCurrentUserProfile();
    const endDate = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString();
    const updated: User = { ...user, discount: { isActive: true, rate: 0.5, endDate } };
    localStorage.setItem(MOCK_SESSION_KEY, JSON.stringify(updated));
    return updated;
  },

  generateVerificationCode: (type: string, identifier: string) => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  },

  verifyUserContact: async (email: string, type: string, code: string, extra?: string): Promise<{ success: boolean; message: string; user?: User }> => {
    const user = await storageService.getCurrentUserProfile();
    const updated = { ...user };
    
    // Doğrulamaya göre krediyi artır
    if (type === 'email' && !updated.isEmailVerified) {
        updated.isEmailVerified = true;
        updated.credits += 1;
    }
    if (type === 'phone' && !updated.isPhoneVerified) {
        updated.isPhoneVerified = true;
        updated.phoneNumber = extra;
        updated.credits += 1;
    }

    localStorage.setItem(MOCK_SESSION_KEY, JSON.stringify(updated));
    
    if (isSupabaseConfigured()) {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (authUser) {
            await supabase.from('profiles').update({ 
                is_email_verified: updated.isEmailVerified, 
                is_phone_verified: updated.isPhoneVerified,
                phone_number: updated.phoneNumber,
                credits: updated.credits
            }).eq('id', authUser.id);
        }
    }
    
    return { success: true, message: "Doğrulama başarılı! +1 Kredi eklendi.", user: updated };
  }
};
