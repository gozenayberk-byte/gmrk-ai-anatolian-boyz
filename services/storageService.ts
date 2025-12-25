
import { CustomsAnalysis, HistoryItem, User, SubscriptionPlan, SiteContent, DashboardStats, BillingHistory } from "../types";
import { supabase, isSupabaseConfigured } from "./supabaseClient";

const SITE_CONTENT_KEY = 'gumrukai_site_content';

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
    items: [
      { icon: 'clock', title: 'Zaman Kaybı', desc: 'GTIP tespiti için saatlerce mevzuat okumayın.' },
      { icon: 'money', title: 'Ek Vergiler', desc: 'Beklenmedik ek mali yükümlülüklerden önceden haberdar olun.' }
    ]
  },
  freeCreditsPromo: { isActive: true, title: "Hediye Kredi", description: "Hesabınızı doğrulayın, ücretsiz analiz hakkı kazanın." },
  roi: { badge: "ROI", title: "Kazanç Analizi", description: "Zaman ve para tasarrufu.", comparison1: "Saniyeler", comparison2: "Hatasız", comparison3: "%90 Tasarruf" },
  proSection: { badge: "PRO", title: "Pro Özellikler", subtitle: "Sürüm", description: "Detaylı pazar araştırması." },
  corporate: { badge: "Kurumsal", title: "Yönetim", subtitle: "Ekip", description: "Ekip yönetimi ve API erişimi." },
  faq: {
    title: "Sıkça Sorulan Sorular",
    subtitle: "Merak ettiğiniz her şey burada.",
    items: [
      { question: "GTIP tespiti ne kadar doğru?", answer: "Gemini 3 Pro motorumuz %95+ doğruluk payı ile çalışmaktadır." }
    ]
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
      privacy: "Gizlilik politikası metni...",
      terms: "Kullanım koşulları metni...",
      contact: "İletişim bilgileri..."
    }
  }
};

export const storageService = {
  
  getCurrentUserProfile: async (): Promise<User> => {
    if (!isSupabaseConfigured()) throw new Error("Veritabanı konfigürasyonu eksik.");

    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session) throw new Error("Oturum bulunamadı.");

    let { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (profileError || !profile) {
      const { data: newProfile, error: createError } = await supabase.from('profiles').insert({
        id: session.user.id,
        email: session.user.email,
        full_name: session.user.user_metadata?.full_name || 'Kullanıcı',
        credits: 0
      }).select().single();
      
      if (createError) throw new Error("Profil oluşturulamadı: " + createError.message);
      profile = newProfile;
    }

    return { 
        email: profile.email, 
        name: profile.full_name, 
        role: profile.role || 'user', 
        credits: profile.credits || 0,
        planId: profile.plan_id || 'free',
        title: profile.title || 'İthalatçı',
        isEmailVerified: !!session.user.email_confirmed_at,
        isPhoneVerified: !!session.user.phone_confirmed_at,
        phoneNumber: profile.phone_number,
        subscriptionStatus: profile.subscription_status || 'active',
        discount: profile.discount_active ? {
          isActive: profile.discount_active,
          rate: profile.discount_rate || 0,
          endDate: profile.discount_end_date
        } : undefined
    };
  },

  registerUser: async (name: string, email: string, password: string): Promise<User> => {
    const { data, error } = await supabase.auth.signUp({ 
      email, 
      password, 
      options: { 
        data: { full_name: name },
        emailRedirectTo: window.location.origin 
      } 
    });
    
    if (error) throw new Error(error.message);
    if (!data.user) throw new Error("Kayıt işlemi başarısız.");

    return { 
      email: data.user.email!, 
      name, 
      role: 'user', 
      credits: 0, 
      planId: 'free', 
      title: 'Yeni Üye', 
      isEmailVerified: false, 
      isPhoneVerified: false, 
      subscriptionStatus: 'active' 
    };
  },

  loginUser: async (email: string, password: string): Promise<User> => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error("Giriş başarısız: " + error.message);
    return await storageService.getCurrentUserProfile();
  },

  logoutUser: async () => { 
    await supabase.auth.signOut(); 
  },

  saveToHistory: async (userEmail: string, analysis: CustomsAnalysis): Promise<HistoryItem> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Oturum gerekli.");

    const { data, error } = await supabase.from('analysis_history').insert({ 
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
    }).select().single();

    if (error) throw new Error("Geçmiş kaydedilemedi: " + error.message);

    return { 
      ...analysis, 
      id: data.id, 
      timestamp: new Date(data.created_at).getTime(), 
      date: new Date(data.created_at).toLocaleDateString('tr-TR') 
    };
  },

  getUserHistory: async (userEmail: string): Promise<HistoryItem[]> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data } = await supabase
      .from('analysis_history')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    return (data || []).map((item: any) => ({
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
  },

  deleteHistoryItem: async (userEmail: string, id: string) => {
    await supabase.from('analysis_history').delete().eq('id', id);
  },

  getSiteContent: (): SiteContent => {
    const saved = localStorage.getItem(SITE_CONTENT_KEY);
    if (!saved) return DEFAULT_CONTENT;
    try {
      const parsed = JSON.parse(saved);
      // Eksik alanları default ile tamamla (beyaz ekran koruması)
      return { ...DEFAULT_CONTENT, ...parsed, footer: { ...DEFAULT_CONTENT.footer, ...(parsed.footer || {}) } };
    } catch (e) {
      return DEFAULT_CONTENT;
    }
  },

  fetchSiteContent: async (): Promise<SiteContent> => {
    if (!isSupabaseConfigured()) return storageService.getSiteContent();
    const { data } = await supabase.from('site_config').select('content').single();
    if (data?.content) {
      localStorage.setItem(SITE_CONTENT_KEY, JSON.stringify(data.content));
      return { ...DEFAULT_CONTENT, ...data.content };
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
    const { data } = await supabase.from('profiles').select('*');
    return (data || []).map((p: any) => ({ 
      email: p.email, name: p.full_name, role: p.role || 'user', credits: p.credits, 
      planId: p.plan_id, title: p.title, isEmailVerified: p.is_email_verified, 
      isPhoneVerified: p.is_phone_verified, subscriptionStatus: p.subscription_status 
    }));
  },

  getDashboardStats: async (): Promise<DashboardStats> => {
    return {
      totalRevenue: 24500,
      revenueChange: 12.5,
      totalSales: 48,
      salesChange: 8.2,
      newUsers: 156,
      usersChange: 15.4,
      totalAnalyses: 1240,
      analysesChange: 22.8,
      planDistribution: [
        { name: 'Ücretsiz', count: 85, color: '#94a3b8' },
        { name: 'Girişimci', count: 42, color: '#3b82f6' },
        { name: 'Profesyonel', count: 20, color: '#f59e0b' },
        { name: 'Kurumsal', count: 9, color: '#6366f1' }
      ],
      salesChart: [
        { day: 'Pzt', value: 1200 },
        { day: 'Sal', value: 2100 },
        { day: 'Çar', value: 1800 },
        { day: 'Per', value: 2400 },
        { day: 'Cum', value: 3100 },
        { day: 'Cmt', value: 1500 },
        { day: 'Paz', value: 900 }
      ],
      recommendations: [
        { title: 'Dönüşüm Oranı', description: 'Girişimci paketi kullananların %20\'si kota aşımına yaklaşıyor.', impact: 'high' }
      ]
    };
  },

  updateUserSubscription: async (plan: any, userEmail: string): Promise<User> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('profiles').update({ 
        plan_id: plan.id, 
        credits: plan.id === 'free' ? 0 : -1, 
        subscription_status: 'active' 
      }).eq('id', user.id);
    }
    return await storageService.getCurrentUserProfile();
  },

  deleteUser: async (email: string) => {
    await supabase.from('profiles').delete().eq('email', email);
  },

  getUserBilling: async (userEmail: string): Promise<BillingHistory[]> => [],

  cancelUserSubscription: async (): Promise<User> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('profiles').update({ 
        subscription_status: 'cancelled', 
        plan_id: 'free' 
      }).eq('id', user.id);
    }
    return await storageService.getCurrentUserProfile();
  },

  applyRetentionOffer: async (): Promise<User> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 3);
      await supabase.from('profiles').update({ 
        discount_active: true,
        discount_rate: 0.5,
        discount_end_date: endDate.toISOString()
      }).eq('id', user.id);
    }
    return await storageService.getCurrentUserProfile();
  },

  verifyUserContact: async (email: string, type: string, code: string, extra?: string): Promise<{ success: boolean; message: string; user?: User }> => {
    const user = await storageService.getCurrentUserProfile();
    return { success: true, message: "Doğrulama işlemi Supabase tarafından yönetilmektedir.", user };
  }
};
