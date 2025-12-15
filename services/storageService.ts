
import { CustomsAnalysis, HistoryItem, SiteContent, BillingHistory, User, DashboardStats, SubscriptionPlan } from "../types";
import { supabase } from "./supabaseClient";

// Mock Session Key for LocalStorage
const MOCK_SESSION_KEY = 'gumrukai_mock_session';
const MOCK_HISTORY_PREFIX = 'gumrukai_mock_history_';

// Zenginleştirilmiş Fallback İçerik (Micro-SaaS & Pazarlama Odaklı)
const FALLBACK_CONTENT: SiteContent = {
  hero: { 
    badge: "🚀 İthalatın En Hızlı Yolu", 
    titleLine1: "Gümrük Müşaviriniz", 
    titleLine2: "Artık Cebinizde", 
    description: "Karmaşık mevzuatları, GTIP kodlarını ve vergi hesaplarını unutun. Yapay zeka, ürününüzün fotoğrafından saniyeler içinde tüm gümrük analizini yapsın." 
  },
  productDemo: {
    title: "Siz Sadece Fotoğrafı Yükleyin",
    description: "Karmaşık mevzuat kitapları arasında kaybolmayın. GümrükAI görseli tanır, mevzuatı tarar ve size net bir rapor sunar.",
    imageUrl: "https://images.unsplash.com/photo-1586769852044-692d6e3703f0?ixlib=rb-4.0.3&auto=format&fit=crop&w=2400&q=80"
  },
  painPoints: {
    title: "Bu Sorunlar Size Tanıdık Geliyor Mu?",
    subtitle: "Geleneksel ithalat süreçleri hem cebinizi hem vaktinizi yakar.",
    items: [
      { icon: "clock", title: "Günlerce Beklemek", desc: "Müşavirinize mail atıp dönüş beklemek işinizi yavaşlatır." },
      { icon: "money", title: "Yüksek Maliyetler", desc: "Basit bir GTIP sorgusu için bile danışmanlık ücreti ödersiniz." },
      { icon: "error", title: "Hatalı Beyan Riski", desc: "Yanlış GTIP tespiti, gümrükte malın takılmasına ve ağır cezalara yol açar." }
    ]
  },
  freeCreditsPromo: { 
    isActive: true, 
    title: "RİSKSİZ DENE: 2 KREDİ HEDİYE!", 
    description: "Sistemimize o kadar güveniyoruz ki, para ödemeden test etmenizi istiyoruz. Sadece telefon ve mailini doğrula, anında 2 gerçek analiz hakkı kazan." 
  },
  roi: { 
    badge: "NEDEN GÜMRÜKAI?", 
    title: "2 Kahve Parasına Profesyonel Hizmet", 
    description: "Geleneksel yöntemlerle günlerce süren ve binlerce liraya mal olan işlemleri, aylık sadece 399 TL'ye sınırsızca yapın.", 
    comparison1: "Müşavir ücretlerinden %95 tasarruf", 
    comparison2: "Hatalı GTIP cezalarından kurtulun", 
    comparison3: "Saniyeler içinde sonuç alın" 
  },
  proSection: { 
    badge: "E-TİCARETÇİLER İÇİN", 
    title: "Çin'den Al, Türkiye'de Sat", 
    subtitle: "Karlılık Hesaplama Aracı", 
    description: "Sadece vergileri değil; ürünün Çin'deki alış fiyatını ve Türkiye'deki satış fiyatını kıyaslayarak size net kar marjını gösteriyoruz." 
  },
  corporate: { 
    badge: "EKİPLER İÇİN", 
    title: "Büyüyen İşletmeler", 
    subtitle: "Çoklu Yönetim", 
    description: "Tüm ithalat operasyonunuzu tek ekrandan yönetin. Geçmiş sorgularınızı arşivleyin ve ekibinizle paylaşın." 
  },
  faq: { 
    title: "Merak Edilenler", 
    subtitle: "Kafanızdaki soru işaretlerini giderelim", 
    items: [
      { question: "Sistem nasıl çalışıyor?", answer: "Çok basit! Ürünün fotoğrafını yüklüyorsunuz, yapay zeka (Gemini 3.0) görseli tarıyor ve güncel gümrük mevzuatına göre raporluyor." },
      { question: "Telefondan kullanabilir miyim?", answer: "Evet, uygulamamız tam mobil uyumludur. Çin'de fuardayken bile fotoğraf çekip anında maliyet hesabı yapabilirsiniz." },
      { question: "Ücretsiz deneme var mı?", answer: "Kesinlikle! Yeni üyelere sistemimizi test etmeleri için ücretsiz haklar tanımlıyoruz." },
      { question: "Fatura alabilir miyim?", answer: "Tabii ki, ödemenizden hemen sonra kurumsal e-Faturanız mail adresinize gönderilir." },
      { question: "GTIP kodları ne kadar güvenilir?", answer: "Modelimiz %99.9 doğruluk oranıyla çalışır ancak resmi beyanlarda gümrük müşavirinizle son teyidi yapmanızı öneririz." },
      { question: "İstediğim zaman iptal edebilir miyim?", answer: "Evet, taahhüt yok. Memnun kalmazsanız panelden tek tıkla iptal edebilirsiniz." }
    ]
  },
  guide: { 
    sectionTitle: "Nasıl Kullanılır?", 
    starterTitle: "Hoşgeldin! {credits} Kredin Var.", 
    starterDesc: "Hemen bir ürün fotoğrafı yükle ve siheri gör. İşte ipuçları:", 
    strategy1Title: "Hızlı Tarama", 
    strategy1Desc: "Ürünün fotoğrafını net çekmeye özen göster.", 
    strategy2Title: "Belge Kontrolü", 
    strategy2Desc: "Gümrükte takılmamak için 'Gerekli Evraklar' listesine mutlaka göz at.", 
    proTitle: "Pro Özellikler", 
    proFeature1Title: "Fiyat Analizi", 
    proFeature1Desc: "Ürünün piyasa değerini öğren.", 
    proFeature2Title: "Tedarikçi İletişimi", 
    proFeature2Desc: "Hazır İngilizce mail taslaklarını kullan." 
  },
  testimonials: [
    { id: '1', name: "Selin Y.", role: "Amazon Satıcısı", comment: "İnanılmaz pratik. Fuar gezerken ürünün maliyetini hesaplamak için kullanıyorum. Hayat kurtarıcı!", rating: 5, avatarInitial: "S" },
    { id: '2', name: "Burak K.", role: "İthalatçı", comment: "Eskiden müşavire sorup 1 gün beklediğim bilgiyi artık 10 saniyede öğreniyorum. Fiyatı bedava sayılır.", rating: 5, avatarInitial: "B" },
    { id: '3', name: "Merve T.", role: "Girişimci", comment: "Arayüzü çok temiz, kullanımı çok kolay. Hiçbir teknik bilgiye gerek kalmadan gümrük işlerimi hallediyorum.", rating: 5, avatarInitial: "M" },
    { id: '4', name: "Kaan D.", role: "Lojistik Uzmanı", comment: "Müşterilerime anlık fiyat vermek için kullanıyorum. GTIP tespitleri şaşırtıcı derecede doğru.", rating: 5, avatarInitial: "K" }
  ],
  updates: [],
  tracking: { metaPixelId: "", tiktokPixelId: "" },
  emailSettings: { senderName: "GümrükAI", subject: "Siparişiniz Onaylandı", body: "Sayın {ad_soyad}, {paket_adi} aboneliğiniz başarıyla başlatılmıştır." },
  paymentSettings: { provider: 'iyzico', apiKey: '', secretKey: '', baseUrl: '' },
  footer: { 
    brandName: "GümrükAI", 
    brandDesc: "İthalatçılar için geliştirilmiş en pratik yapay zeka asistanı.", 
    copyright: "© 2024 GümrükAI", 
    badgeText: "İstanbul'da Geliştirildi ❤️", 
    socialLinks: { twitter: "#", linkedin: "#", instagram: "#" }, 
    legalContent: { privacy: "Gizlilik politikası...", terms: "Kullanım koşulları...", contact: "info@gumrukai.com" } 
  }
};

export const storageService = {
  
  // --- AUTHENTICATION ---

  registerUser: async (name: string, email: string, password: string): Promise<User> => {
    // MOCK REGISTER: Test e-postaları için sahte kayıt
    if (email.endsWith('@test.com') || email === 'demo@gumrukai.com') {
      const mockUser: User = {
        email,
        name: name || 'Test Kullanıcısı',
        title: 'Misafir Üye',
        role: 'user',
        planId: 'free',
        credits: 5,
        subscriptionStatus: 'active',
        isEmailVerified: true,
        isPhoneVerified: true
      };
      localStorage.setItem(MOCK_SESSION_KEY, JSON.stringify(mockUser));
      return mockUser;
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
        }
      }
    });

    if (error) throw new Error(error.message);
    if (!data.user) throw new Error("Kullanıcı oluşturulamadı.");

    // Gerçek Supabase kaydı başarılı ise
    if (email === 'admin@admin.com') {
      return {
        email: data.user.email!,
        name: name || 'Süper Admin',
        title: 'Sistem Yöneticisi',
        role: 'admin',
        planId: '3',
        credits: -1,
        subscriptionStatus: 'active',
        isEmailVerified: true,
        isPhoneVerified: true
      };
    }

    return {
      email: data.user.email!,
      name: name,
      title: 'Misafir Üye',
      role: 'user',
      planId: 'free',
      credits: 0,
      subscriptionStatus: 'active',
      isEmailVerified: false,
      isPhoneVerified: false
    };
  },

  loginUser: async (email: string, password: string, rememberMe: boolean = false): Promise<User> => {
    // MOCK LOGIN: Admin ve Demo hesapları için Supabase'i bypass et (Test ortamı için)
    if (email === 'admin@admin.com' && password === 'admin') {
        const mockAdmin: User = {
            email: 'admin@admin.com',
            name: 'Süper Admin',
            title: 'Sistem Yöneticisi',
            role: 'admin',
            planId: '3',
            credits: -1,
            subscriptionStatus: 'active',
            isEmailVerified: true,
            isPhoneVerified: true
        };
        localStorage.setItem(MOCK_SESSION_KEY, JSON.stringify(mockAdmin));
        await new Promise(r => setTimeout(r, 600)); // Simüle edilmiş ağ gecikmesi
        return mockAdmin;
    }

    if (email === 'demo@gumrukai.com' && password === 'demo') {
        const mockUser: User = {
            email: 'demo@gumrukai.com',
            name: 'Demo Kullanıcı',
            title: 'Profesyonel İthalatçı',
            role: 'user',
            planId: '2',
            credits: 100,
            subscriptionStatus: 'active',
            isEmailVerified: true,
            isPhoneVerified: true
        };
        localStorage.setItem(MOCK_SESSION_KEY, JSON.stringify(mockUser));
        await new Promise(r => setTimeout(r, 600)); // Simüle edilmiş ağ gecikmesi
        return mockUser;
    }

    // REAL LOGIN: Supabase
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (error) {
            console.error("Supabase Login Error:", error);
            throw new Error(error.message);
        }
        
        if (!data.user) {
            throw new Error("Giriş yapılamadı. Kullanıcı bulunamadı.");
        }

        return await storageService.getCurrentUserProfile();
    } catch (e: any) {
        // Hatanın UI'a gitmesi için fırlatıyoruz
        throw e;
    }
  },

  logoutUser: async () => {
    // Mock session temizle
    localStorage.removeItem(MOCK_SESSION_KEY);
    // Real session temizle
    await supabase.auth.signOut();
  },

  getCurrentUserProfile: async (): Promise<User> => {
    // 1. Önce Mock Session Kontrolü (Test kullanıcıları için)
    const mockSessionStr = localStorage.getItem(MOCK_SESSION_KEY);
    if (mockSessionStr) {
        return JSON.parse(mockSessionStr);
    }

    // 2. Gerçek Supabase Session Kontrolü
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Oturum açılmamış.");

    if (user.email === 'admin@admin.com') {
      return {
        email: user.email!,
        name: user.user_metadata.full_name || 'Süper Admin',
        title: 'Sistem Yöneticisi',
        role: 'admin',
        planId: '3', 
        credits: -1, 
        subscriptionStatus: 'active',
        isEmailVerified: true,
        isPhoneVerified: true
      };
    }

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error || !profile) {
      return {
        email: user.email!,
        name: user.user_metadata.full_name || 'Kullanıcı',
        title: 'Misafir Üye',
        role: 'user',
        planId: 'free',
        credits: 0,
        subscriptionStatus: 'active',
        isEmailVerified: !!user.email_confirmed_at,
        isPhoneVerified: !!user.phone_confirmed_at
      };
    }

    // İndirim bilgilerini kontrol et
    let discount = undefined;
    if (profile.discount_active) {
        discount = {
            isActive: profile.discount_active,
            rate: profile.discount_rate || 0,
            endDate: profile.discount_end_date || ''
        };
    }

    return {
      email: profile.email,
      name: profile.full_name,
      title: profile.title,
      role: profile.role || 'user', 
      planId: profile.plan_id || 'free',
      credits: profile.credits,
      subscriptionStatus: profile.subscription_status,
      isEmailVerified: profile.is_email_verified,
      isPhoneVerified: profile.is_phone_verified,
      phoneNumber: profile.phone_number,
      discount: discount
    };
  },

  // ... (Geri kalan kod aynı) ...
  
  // --- DATA OPERATIONS ---

  saveToHistory: async (userEmail: string, analysis: CustomsAnalysis): Promise<HistoryItem> => {
    // 1. MOCK MODE: LocalStorage'a kaydet (Test kullanıcıları için)
    const mockSessionStr = localStorage.getItem(MOCK_SESSION_KEY);
    if (mockSessionStr) {
       const newItem: HistoryItem = {
          ...analysis,
          id: `mock-${Date.now()}`,
          date: new Date().toLocaleDateString('tr-TR'),
          timestamp: Date.now()
       };
       
       // Mevcut geçmişi al ve yenisini ekle
       const mockHistoryKey = `${MOCK_HISTORY_PREFIX}${userEmail}`;
       const currentHistory = JSON.parse(localStorage.getItem(mockHistoryKey) || '[]');
       const updatedHistory = [newItem, ...currentHistory];
       localStorage.setItem(mockHistoryKey, JSON.stringify(updatedHistory));
       
       return newItem;
    }

    // 2. REAL MODE: Supabase'e kaydet
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Kullanıcı oturumu yok.");

    if (userEmail !== 'admin@admin.com') {
        const currentProfile = await storageService.getCurrentUserProfile();
        if (currentProfile.credits > 0) {
            await supabase.from('profiles').update({ credits: currentProfile.credits - 1 }).eq('id', user.id);
        }
    }

    // Insert payload
    const newItem = {
      user_id: user.id,
      product_name: analysis.productName,
      description: analysis.description,
      hs_code: analysis.hsCode,
      hs_code_description: analysis.hsCodeDescription,
      taxes: analysis.taxes, // Array olarak gönder (DB'de JSONB olmalı)
      documents: analysis.documents, // Array olarak gönder
      import_price: analysis.importPrice,
      retail_price: analysis.retailPrice,
      email_draft: analysis.emailDraft,
      confidence_score: analysis.confidenceScore
    };

    const { data, error } = await supabase
      .from('analysis_history')
      .insert(newItem)
      .select()
      .single();

    if (error) {
        console.error("Save error:", error);
        throw new Error("Geçmişe kaydedilemedi. (Veritabanı tablosu 'analysis_history' mevcut mu?)");
    }

    return {
      ...analysis,
      id: data.id,
      timestamp: new Date(data.created_at).getTime(),
      date: new Date(data.created_at).toLocaleDateString('tr-TR')
    };
  },

  getUserHistory: async (userEmail: string): Promise<HistoryItem[]> => {
    // 1. MOCK MODE: LocalStorage'dan çek
    const mockSessionStr = localStorage.getItem(MOCK_SESSION_KEY);
    if (mockSessionStr) {
       const mockHistoryKey = `${MOCK_HISTORY_PREFIX}${userEmail}`;
       return JSON.parse(localStorage.getItem(mockHistoryKey) || '[]');
    }

    // 2. REAL MODE: Supabase'den çek
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('analysis_history')
      .select('*')
      .eq('user_id', user.id) // Sadece bu kullanıcının verilerini getir
      .order('created_at', { ascending: false });

    if (error) {
        console.error("History fetch error:", error);
        return [];
    }

    return data.map((item: any) => ({
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
    // Mock deletion
    if (id.startsWith('mock-')) {
        const mockHistoryKey = `${MOCK_HISTORY_PREFIX}${userEmail}`;
        const currentHistory = JSON.parse(localStorage.getItem(mockHistoryKey) || '[]');
        const updatedHistory = currentHistory.filter((i: any) => i.id !== id);
        localStorage.setItem(mockHistoryKey, JSON.stringify(updatedHistory));
        return;
    }

    // Real deletion
    await supabase.from('analysis_history').delete().eq('id', id);
  },

  // --- CONTENT & SETTINGS ---

  getSiteContent: (): SiteContent => {
    return FALLBACK_CONTENT;
  },
  
  fetchSiteContent: async (): Promise<SiteContent> => {
    try {
      const { data, error } = await supabase.from('site_config').select('content').single();
      
      if (error || !data || !data.content) return FALLBACK_CONTENT;
      
      const dbContent = data.content;
      
      return {
        ...FALLBACK_CONTENT,
        ...dbContent,
        faq: {
            ...FALLBACK_CONTENT.faq,
            ...dbContent.faq,
            items: (dbContent.faq?.items && dbContent.faq.items.length > 0) ? dbContent.faq.items : FALLBACK_CONTENT.faq.items
        },
        testimonials: (dbContent.testimonials && dbContent.testimonials.length > 0) ? dbContent.testimonials : FALLBACK_CONTENT.testimonials,
        painPoints: {
            ...FALLBACK_CONTENT.painPoints,
            ...dbContent.painPoints,
            items: (dbContent.painPoints?.items && dbContent.painPoints.items.length > 0) ? dbContent.painPoints.items : FALLBACK_CONTENT.painPoints.items
        }
      };
    } catch (e) {
      return FALLBACK_CONTENT;
    }
  },

  saveSiteContent: async (content: SiteContent) => {
    // Mock mode guard
    if (localStorage.getItem(MOCK_SESSION_KEY)) {
        console.log("Mock mode: Content saved locally (simulated)");
        return;
    }
    const { error } = await supabase.from('site_config').upsert({ id: 1, content });
    if (error) console.error("Content save error:", error);
  },

  // --- USER & BILLING UPDATES ---

  updateUserSubscription: async (plan: SubscriptionPlan, targetUserEmail?: string): Promise<User> => {
      // 1. Yetki ve Plan Ayarları
      let newCredits = 0;
      let newTitle = 'Üye';
      let newRole: 'user' | 'admin' = 'user';
      
      if (plan.id === '1') { 
          newTitle = 'Girişimci Üye'; 
          newCredits = 50; 
          newRole = 'user';
      } else if (plan.id === '2') { 
          newTitle = 'Profesyonel İthalatçı'; 
          newCredits = -1; // Sınırsız
          newRole = 'user';
      } else if (plan.id === '3') { 
          newTitle = 'Kurumsal Yönetici'; 
          newCredits = -1; 
          newRole = 'admin'; // Kurumsal Paket = Admin Yetkisi
      } else if (plan.id === 'free') {
          newTitle = 'Misafir Üye';
          newCredits = 0;
          newRole = 'user';
      }

      // --- MOCK MODE HANDLING ---
      const mockSessionStr = localStorage.getItem(MOCK_SESSION_KEY);
      if (mockSessionStr) {
          // Eğer targetUserEmail varsa (Admin panelinden başka kullanıcıyı güncelliyorsak)
          // Mock modunda array tutmadığımız için sadece current user'ı güncelliyoruz gibi davranacağız.
          const user = JSON.parse(mockSessionStr);
          
          const updatedUser = { 
              ...user, 
              planId: plan.id, 
              title: newTitle, 
              credits: newCredits, 
              role: newRole,
              subscriptionStatus: 'active' 
          };
          
          // Eğer kendi kendimizi güncelliyorsak storage'a yaz
          if (!targetUserEmail || targetUserEmail === user.email) {
              localStorage.setItem(MOCK_SESSION_KEY, JSON.stringify(updatedUser));
          }
          return updatedUser;
      }
      
      // --- REAL SUPABASE MODE ---

      // Eğer targetUserEmail varsa (Admin işlem yapıyorsa), o kullanıcının ID'sini bulmamız lazım.
      // Ancak Auth tablosuna doğrudan erişimimiz yoksa profiles tablosundan email ile buluruz.
      let userIdToUpdate = '';
      let currentUser = null;

      if (targetUserEmail) {
          const { data: targetProfile } = await supabase.from('profiles').select('id').eq('email', targetUserEmail).single();
          if (targetProfile) userIdToUpdate = targetProfile.id;
      } else {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) userIdToUpdate = user.id;
          currentUser = user;
      }

      if (!userIdToUpdate) throw new Error("Kullanıcı bulunamadı");

      // Profili güncelle
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
            plan_id: plan.id, 
            credits: newCredits, 
            title: newTitle,
            role: newRole, // Rolü de güncelle
            subscription_status: 'active' 
        })
        .eq('id', userIdToUpdate);
      
      if (profileError) throw new Error("Profil güncellenemedi.");

      // Ödemeyi kaydet (Sadece kendisi satın alıyorsa)
      if (!targetUserEmail && currentUser) {
          const billingRecord = {
              user_id: currentUser.id,
              date: new Date().toLocaleDateString('tr-TR'),
              plan_name: plan.name,
              amount: plan.price,
              status: 'paid',
              invoice_url: '#'
          };
          await supabase.from('billing_history').insert(billingRecord);
      }

      // Güncel veriyi dön (Eğer kendisiyse)
      if (!targetUserEmail) {
          return await storageService.getCurrentUserProfile();
      } else {
          // Başkasını güncellediysek dummy user dön (UI'da kullanılmayacak)
          return { email: targetUserEmail } as any; 
      }
  },

  cancelUserSubscription: async (): Promise<User> => {
      // Mock Bypass
      const mockSessionStr = localStorage.getItem(MOCK_SESSION_KEY);
      if (mockSessionStr) {
          const user = JSON.parse(mockSessionStr);
          const updatedUser = { 
              ...user, 
              planId: 'free', 
              credits: 0, 
              title: 'Misafir Üye', 
              subscriptionStatus: 'cancelled',
              discount: undefined,
              role: 'user' // Reset role to user
          };
          localStorage.setItem(MOCK_SESSION_KEY, JSON.stringify(updatedUser));
          return updatedUser;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Kullanıcı bulunamadı");

      if (user.email === 'admin@admin.com') {
          return await storageService.getCurrentUserProfile();
      }

      const { error } = await supabase
        .from('profiles')
        .update({
            plan_id: 'free',
            credits: 0,
            title: 'Misafir Üye',
            role: 'user', // Rolü sıfırla
            subscription_status: 'cancelled',
            discount_active: false,
            discount_rate: 0,
            discount_end_date: null
        })
        .eq('id', user.id);

      if (error) throw new Error("Abonelik iptal edilirken hata oluştu.");

      return await storageService.getCurrentUserProfile();
  },

  applyRetentionOffer: async (): Promise<User> => {
      // Mock Bypass
      const mockSessionStr = localStorage.getItem(MOCK_SESSION_KEY);
      if (mockSessionStr) {
          const user = JSON.parse(mockSessionStr);
          const endDate = new Date();
          endDate.setMonth(endDate.getMonth() + 3);
          const updatedUser = { 
              ...user, 
              discount: { isActive: true, rate: 0.5, endDate: endDate.toISOString() }
          };
          localStorage.setItem(MOCK_SESSION_KEY, JSON.stringify(updatedUser));
          return updatedUser;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Kullanıcı bulunamadı");

      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 3);

      const { error } = await supabase
        .from('profiles')
        .update({
            discount_active: true,
            discount_rate: 0.5,
            discount_end_date: endDate.toISOString()
        })
        .eq('id', user.id);

      if (error) throw new Error("İndirim tanımlanamadı.");

      return await storageService.getCurrentUserProfile();
  },

  getUserBilling: async (userEmail: string): Promise<BillingHistory[]> => {
      if (localStorage.getItem(MOCK_SESSION_KEY)) return [];

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('billing_history')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) return [];

      return data.map((item: any) => ({
          id: item.id,
          date: item.date,
          planName: item.plan_name,
          amount: item.amount,
          status: item.status,
          invoiceUrl: item.invoice_url
      }));
  },

  // --- ADMIN FUNCTIONS ---
  
  getAllUsers: async (): Promise<User[]> => {
      if (localStorage.getItem(MOCK_SESSION_KEY)) return [];

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) return [];

      return data.map((p: any) => ({
          email: p.email,
          name: p.full_name,
          title: p.title,
          role: p.role || 'user', // DB'den gelen rolü kullan
          planId: p.plan_id || 'free',
          credits: p.credits,
          subscriptionStatus: p.subscription_status,
          isEmailVerified: p.is_email_verified,
          isPhoneVerified: p.is_phone_verified,
          phoneNumber: p.phone_number
      })); 
  },

  deleteUser: async (email: string) => {
      if (localStorage.getItem(MOCK_SESSION_KEY)) return;
      await supabase.from('profiles').delete().eq('email', email);
  },

  getDashboardStats: async (): Promise<DashboardStats> => {
      // Mock stats for demo
      if (localStorage.getItem(MOCK_SESSION_KEY)) {
        return {
            totalRevenue: 124500,
            revenueChange: 12,
            totalSales: 85,
            salesChange: 5,
            newUsers: 142,
            usersChange: 8,
            totalAnalyses: 1250,
            analysesChange: 24,
            planDistribution: [
                { name: 'Girişimci', count: 45, color: '#0ea5e9' },
                { name: 'Profesyonel', count: 30, color: '#f59e0b' },
                { name: 'Kurumsal', count: 10, color: '#6366f1' }
            ],
            salesChart: [
                { day: 'Pzt', value: 12 },
                { day: 'Sal', value: 19 },
                { day: 'Çar', value: 15 },
                { day: 'Per', value: 22 },
                { day: 'Cum', value: 30 },
                { day: 'Cmt', value: 45 },
                { day: 'Paz', value: 50 }
            ],
            recommendations: [
                { title: 'Fiyatlandırma Stratejisi', description: 'Girişimci paketine talebi artırmak için kampanya yapın.', impact: 'high' }
            ]
        };
      }

      const { data: billingData } = await supabase.from('billing_history').select('amount');
      let totalRevenue = 0;
      let totalSales = 0;
      
      if (billingData) {
          totalSales = billingData.length;
          billingData.forEach((row: any) => {
              const amount = parseFloat(row.amount.replace(/[^0-9,.]/g, '').replace(',', '.'));
              if (!isNaN(amount)) totalRevenue += amount;
          });
      }

      const { count: userCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
      const { count: analysisCount } = await supabase.from('analysis_history').select('*', { count: 'exact', head: true });
      const { data: profiles } = await supabase.from('profiles').select('plan_id');
      
      let plan1 = 0, plan2 = 0, plan3 = 0;
      profiles?.forEach((p: any) => {
          if (p.plan_id === '1') plan1++;
          else if (p.plan_id === '2') plan2++;
          else if (p.plan_id === '3') plan3++;
      });

      return {
          totalRevenue: totalRevenue,
          revenueChange: 10,
          totalSales: totalSales,
          salesChange: 5,
          newUsers: userCount || 0,
          usersChange: 12,
          totalAnalyses: analysisCount || 0,
          analysesChange: 20,
          planDistribution: [
              { name: 'Girişimci', count: plan1, color: '#0ea5e9' },
              { name: 'Profesyonel', count: plan2, color: '#f59e0b' },
              { name: 'Kurumsal', count: plan3, color: '#6366f1' }
          ],
          salesChart: [
              { day: 'Pzt', value: 5 },
              { day: 'Sal', value: 8 },
              { day: 'Çar', value: 12 },
              { day: 'Per', value: 15 },
              { day: 'Cum', value: 20 },
              { day: 'Cmt', value: 25 },
              { day: 'Paz', value: 30 }
          ],
          recommendations: [
              { title: 'Fiyatlandırma Stratejisi', description: 'Girişimci paketine talebi artırmak için kampanya yapın.', impact: 'high' }
          ]
      };
  },

  // --- HELPERS ---

  verifyUser: (email: string, pass: string) => null,
  
  generateVerificationCode: (type?: string, identifier?: string) => {
      return Math.floor(100000 + Math.random() * 900000).toString();
  },
  
  verifyUserContact: async (email: string, type: 'email' | 'phone', code: string, phoneNumber?: string): Promise<{ success: boolean, message: string, user?: User }> => {
      // Mock Bypass
      const mockSessionStr = localStorage.getItem(MOCK_SESSION_KEY);
      if (mockSessionStr) {
          if (code.length === 6) {
             const user = JSON.parse(mockSessionStr);
             const updates: any = type === 'email' ? { isEmailVerified: true } : { isPhoneVerified: true };
              if (phoneNumber && type === 'phone') {
                  updates.phoneNumber = phoneNumber;
              }
             const updatedUser = { ...user, ...updates, credits: user.credits + 1 };
             localStorage.setItem(MOCK_SESSION_KEY, JSON.stringify(updatedUser));
             return { success: true, message: "Doğrulandı! +1 Analiz Kredisi hesabınıza eklendi. (Test Modu)", user: updatedUser };
          }
          return { success: false, message: "Kod hatalı." };
      }

      if (code.length === 6) {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
              const updates: any = type === 'email' ? { is_email_verified: true } : { is_phone_verified: true };
              if (phoneNumber && type === 'phone') {
                  updates.phone_number = phoneNumber;
              }
              
              const current = await storageService.getCurrentUserProfile();
              await supabase.from('profiles').update({ ...updates, credits: current.credits + 1 }).eq('id', user.id);
              
              const updatedUser = await storageService.getCurrentUserProfile();
              return { success: true, message: "Doğrulandı! +1 Analiz Kredisi hesabınıza eklendi.", user: updatedUser };
          }
      }
      return { success: false, message: "Kod hatalı veya süresi dolmuş." };
  },

  saveBilling: async (userEmail: string, item: any) => {
      return { ...item, id: '123' };
  }
};
