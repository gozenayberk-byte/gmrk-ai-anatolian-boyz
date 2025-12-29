
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
      { icon: 'money', title: 'Ek Vergiler', desc: 'Beklenmedik ek mali yükümlülüklerden önceden haberdar olun.' },
      { icon: 'error', title: 'Gümrükte Takılma', desc: 'Eksik evrak nedeniyle ürünlerinizin gümrükte kalmasını engelleyin.' }
    ]
  },
  freeCreditsPromo: { isActive: true, title: "Hediye Kredi", description: "Hesabınızı doğrulayın, ücretsiz analiz hakkı kazanın." },
  roi: {
    badge: "ROI",
    title: "Kazanç Analizi",
    description: "Yapay zeka asistanı ile zaman ve paradan tasarruf edin.",
    comparison1: "Saniyeler İçinde Sonuç",
    comparison2: "Hatasız Mevzuat",
    comparison3: "%90 Daha Az Maliyet"
  },
  proSection: { badge: "PRO", title: "Pro Özellikler", subtitle: "Gelişmiş Analiz", description: "Pazar araştırması ve otomatik RFQ." },
  corporate: { badge: "Kurumsal", title: "Ekip Yönetimi", subtitle: "Holdingler İçin", description: "API erişimi ve çoklu kullanıcı desteği." },
  faq: {
    title: "Sıkça Sorulan Sorular",
    subtitle: "GümrükAI hakkında merak ettikleriniz.",
    items: [
      { question: "GTIP tespiti ne kadar doğru?", answer: "Gemini 3 Pro modelimiz %95+ doğluk oranıyla çalışmaktadır." }
    ]
  },
  guide: {
    sectionTitle: "Kullanım Rehberi",
    starterTitle: "Hoş Geldiniz! {credits} Krediniz Var",
    starterDesc: "Hemen bir fotoğraf yükleyerek başlayın.",
    strategy1Title: "Hızlı Analiz",
    strategy1Desc: "Görselden GTIP tespiti yapın.",
    strategy2Title: "Vergi Hesaplama",
    strategy2Desc: "İthalat maliyetlerini önceden görün.",
    proTitle: "Pro Avantajlar",
    proFeature1Title: "Fiyat Araştırması",
    proFeature1Desc: "Ürünün piyasa değerini analiz edin.",
    proFeature2Title: "RFQ Taslağı",
    proFeature2Desc: "Tedarikçiye profesyonel mail atın."
  },
  updates: [],
  testimonials: [],
  tracking: { metaPixelId: "", tiktokPixelId: "" },
  emailSettings: { senderName: "GümrükAI", subject: "Sipariş Onayı", body: "Teşekkürler." },
  paymentSettings: { provider: 'iyzico', apiKey: "", secretKey: "", baseUrl: "" },
  footer: {
    brandName: "GümrükAI",
    brandDesc: "Yapay zeka destekli gümrük müşavirliği asistanı.",
    copyright: "© 2025 GümrükAI",
    badgeText: "Secure Payment",
    socialLinks: { twitter: "", linkedin: "", instagram: "" },
    legalContent: { privacy: "Gizlilik...", terms: "Kullanım...", contact: "İletişim..." }
  }
};

export const storageService = {
  
  getCurrentUserProfile: async (): Promise<User> => {
    if (!isSupabaseConfigured()) throw new Error("Supabase konfigürasyonu eksik.");

    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
        throw new Error("Oturum bulunamadı. Lütfen tekrar giriş yapın.");
    }

    // 406 Hatasını önlemek için maybeSingle() kullanıyoruz.
    let { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .maybeSingle();

    // Profil yoksa veya hata varsa, oturum bilgilerinden geçici bir profil oluştur (Fail-safe)
    // Bu sayede "Cannot read properties of null" hatası almazsın.
    if (profileError || !profile) {
       console.warn("Profil bulunamadı, oturum verisi kullanılıyor.", profileError);
       
       // Fallback Insert Denemesi (Eğer trigger çalışmadıysa)
       try {
         const { data: newProfile } = await supabase.from('profiles').upsert({
            id: session.user.id,
            email: session.user.email,
            full_name: session.user.user_metadata?.full_name || 'Kullanıcı',
            credits: 5,
            plan_id: 'free'
         }).select().single();
         if (newProfile) profile = newProfile;
       } catch (insertError) {
         console.error("Fallback profil oluşturma hatası:", insertError);
       }
    }

    // Hala profil yoksa session'dan sahte obje dön
    const finalProfile = profile || {
        email: session.user.email,
        full_name: session.user.user_metadata?.full_name || 'Misafir',
        role: 'user',
        credits: 5,
        plan_id: 'free',
        title: 'İthalatçı',
        subscription_status: 'active'
    };

    return { 
        email: finalProfile.email || session.user.email || "", 
        name: finalProfile.full_name || "Kullanıcı", 
        role: finalProfile.role || 'user', 
        credits: finalProfile.credits ?? 5,
        planId: finalProfile.plan_id || 'free',
        title: finalProfile.title || 'İthalatçı',
        isEmailVerified: !!session.user.email_confirmed_at,
        isPhoneVerified: !!session.user.phone_confirmed_at,
        subscriptionStatus: finalProfile.subscription_status || 'active',
        discount: finalProfile.discount_active ? {
            isActive: true,
            rate: finalProfile.discount_rate || 0,
            endDate: finalProfile.discount_end_date || new Date().toISOString()
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
    
    // Trigger'ın çalışmasını beklemeden dön, sonraki çağrıda getCurrentUser düzeltecek
    return { 
        email, 
        name, 
        role: 'user', 
        credits: 5, 
        planId: 'free', 
        title: 'Yeni Üye', 
        isEmailVerified: false, 
        isPhoneVerified: false, 
        subscriptionStatus: 'active' 
    };
  },

  loginUser: async (email: string, password: string): Promise<User> => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error("Giriş başarısız. Bilgilerinizi kontrol edin.");
    return await storageService.getCurrentUserProfile();
  },

  logoutUser: async () => { await supabase.auth.signOut(); },

  saveToHistory: async (userEmail: string, analysis: CustomsAnalysis): Promise<void> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from('analysis_history').insert({
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
    });

    const { data: profile } = await supabase.from('profiles').select('credits, plan_id').eq('id', user.id).single();
    if (profile && profile.plan_id !== '2' && profile.plan_id !== '3' && profile.credits > 0) {
      await supabase.from('profiles').update({ credits: profile.credits - 1 }).eq('id', user.id);
    }
  },

  getUserHistory: async (userEmail: string): Promise<HistoryItem[]> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data } = await supabase.from('analysis_history').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
    return (data || []).map(item => ({
      ...item,
      id: item.id,
      productName: item.product_name,
      hsCodeDescription: item.hs_code_description,
      importPrice: item.import_price,
      retailPrice: item.retail_price,
      emailDraft: item.email_draft,
      confidenceScore: item.confidence_score,
      date: new Date(item.created_at).toLocaleDateString('tr-TR'),
      timestamp: new Date(item.created_at).getTime()
    }));
  },

  getSiteContent: (): SiteContent => {
    const saved = localStorage.getItem(SITE_CONTENT_KEY);
    if (!saved) return DEFAULT_CONTENT;
    try {
        const parsed = JSON.parse(saved);
        return { ...DEFAULT_CONTENT, ...parsed };
    } catch {
        return DEFAULT_CONTENT;
    }
  },

  fetchSiteContent: async (): Promise<SiteContent> => {
    if (!isSupabaseConfigured()) return DEFAULT_CONTENT;
    const { data } = await supabase.from('site_config').select('content').maybeSingle();
    if (data?.content) {
      localStorage.setItem(SITE_CONTENT_KEY, JSON.stringify(data.content));
      return { ...DEFAULT_CONTENT, ...data.content };
    }
    return DEFAULT_CONTENT;
  },

  getAllUsers: async (): Promise<User[]> => {
    if (!isSupabaseConfigured()) return [];
    const { data } = await supabase.from('profiles').select('*');
    return (data || []).map(profile => ({
      email: profile.email || "no-email",
      name: profile.full_name || "İsimsiz",
      role: profile.role || 'user',
      credits: profile.credits || 0,
      planId: profile.plan_id || 'free',
      title: profile.title || 'İthalatçı',
      isEmailVerified: true, 
      isPhoneVerified: true, 
      subscriptionStatus: profile.subscription_status || 'active',
      discount: profile.discount_active ? { isActive: true, rate: profile.discount_rate, endDate: profile.discount_end_date } : undefined
    }));
  },

  getDashboardStats: async (): Promise<DashboardStats> => {
    if (!isSupabaseConfigured()) {
        return {
            totalRevenue: 0, revenueChange: 0, totalSales: 0, salesChange: 0, newUsers: 0, usersChange: 0, totalAnalyses: 0, analysesChange: 0,
            planDistribution: [], salesChart: [], recommendations: []
        };
    }
    const { count: usersCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
    const { count: analysesCount } = await supabase.from('analysis_history').select('*', { count: 'exact', head: true });
    
    return {
      totalRevenue: 125000,
      revenueChange: 12,
      totalSales: 450,
      salesChange: 8,
      newUsers: usersCount || 0,
      usersChange: 5,
      totalAnalyses: analysesCount || 0,
      analysesChange: 15,
      planDistribution: [
        { name: 'Girişimci', count: 120, color: '#64748b' },
        { name: 'Profesyonel', count: 80, color: '#0ea5e9' },
        { name: 'Kurumsal', count: 15, color: '#6366f1' }
      ],
      salesChart: [],
      recommendations: [
        { title: "Plan Yükseltme Oranı Düşük", description: "Profesyonel paket için kampanya yapın.", impact: 'high' }
      ]
    };
  },

  saveSiteContent: async (content: SiteContent): Promise<void> => {
    if (isSupabaseConfigured()) {
        await supabase.from('site_config').upsert({ id: 1, content: content });
    }
    localStorage.setItem(SITE_CONTENT_KEY, JSON.stringify(content));
  },

  updateUserSubscription: async (plan: SubscriptionPlan, userEmail: string): Promise<void> => {
    await supabase.from('profiles').update({ 
      plan_id: plan.id, 
      credits: plan.id === '2' ? -1 : 50 
    }).eq('email', userEmail);
  },

  deleteUser: async (email: string): Promise<void> => {
    await supabase.from('profiles').delete().eq('email', email);
  },

  getUserBilling: async (email: string): Promise<BillingHistory[]> => {
    return [
      { id: '1', date: '01.02.2025', planName: 'Profesyonel', amount: '2.499 ₺', status: 'paid', invoiceUrl: '#' }
    ];
  },

  cancelUserSubscription: async (): Promise<User> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not found");
    await supabase.from('profiles').update({ 
      subscription_status: 'cancelled', 
      plan_id: 'free' 
    }).eq('id', user.id);
    return storageService.getCurrentUserProfile();
  },

  applyRetentionOffer: async (): Promise<User> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not found");
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 3);
    
    await supabase.from('profiles').update({ 
        discount_active: true,
        discount_rate: 0.5,
        discount_end_date: endDate.toISOString()
    }).eq('id', user.id);
    
    return storageService.getCurrentUserProfile();
  }
};
