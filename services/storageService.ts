
import { CustomsAnalysis, HistoryItem, SiteContent, BillingHistory, User, DashboardStats, SubscriptionPlan } from "../types";
import { supabase } from "./supabaseClient";

// Zenginleştirilmiş Fallback İçerik (Satış Hunisi İçin)
const FALLBACK_CONTENT: SiteContent = {
  hero: { 
    badge: "Yapay Zeka Destekli Gümrük Asistanı", 
    titleLine1: "Gümrük İşlemlerinde", 
    titleLine2: "Hata Yapma Lüksünüz Yok", 
    description: "Saniyeler içinde ürün görselinden GTIP tespiti yapın, vergi oranlarını hesaplayın ve mevzuat risklerini sıfıra indirin. İthalat sürecinizi %90 hızlandırın." 
  },
  freeCreditsPromo: { 
    isActive: true, 
    title: "YENİ ÜYELERE ÖZEL", 
    description: "Hesabınızı doğrulayın, anında Ücretsiz Analiz Hakkı kazanın! Kredi kartı gerekmez." 
  },
  roi: { 
    badge: "NEDEN GÜMRÜKAI?", 
    title: "Maliyetlerinizi Düşürün, Hızınızı Artırın", 
    description: "Geleneksel gümrük süreçleri yavaş ve pahalıdır. GümrükAI ile müşavirlik masraflarını azaltırken operasyonel hızınızı katlayın.", 
    comparison1: "Manuel GTIP tespiti ortalama 45 dakika sürer.", 
    comparison2: "Hatalı beyanlar %200'e varan cezalar doğurur.", 
    comparison3: "GümrükAI ile analiz süresi sadece 10 saniyedir." 
  },
  proSection: { 
    badge: "PROFESYONEL İTHALATÇILAR İÇİN", 
    title: "Çin'den Ürün Getirmek Artık Çocuk Oyuncağı", 
    subtitle: "Pazar Analizi & Maliyet Hesabı", 
    description: "Sadece gümrük vergilerini değil; Çin'deki tahmini alış fiyatını ve Türkiye'deki pazar satış fiyatını da analiz ediyoruz. Karlılığınızı önceden görün." 
  },
  corporate: { 
    badge: "KURUMSAL ÇÖZÜMLER", 
    title: "Gümrük Müşavirleri ve Lojistik Firmaları", 
    subtitle: "API Entegrasyonu & Çoklu Kullanıcı", 
    description: "Ekibinizin verimliliğini artırın. ERP sistemlerinize entegre olabilen API yapımız ve kurumsal yönetim panelimiz ile tüm operasyonu tek merkezden yönetin." 
  },
  faq: { 
    title: "Aklınıza Takılanlar", 
    subtitle: "Sıkça Sorulan Sorular", 
    items: [
      { question: "GTIP tespitleri ne kadar doğru?", answer: "Gemini 3.0 Pro modelimiz, güncel 2024 Türk Gümrük Tarife Cetveli üzerinde eğitilmiştir ve %98 üzerinde doğruluk oranına sahiptir." },
      { question: "Hangi dosya formatlarını destekliyorsunuz?", answer: "JPG, PNG, WEBP formatlarındaki tüm ürün görsellerini yükleyebilirsiniz." },
      { question: "Ücretsiz deneme hakkım var mı?", answer: "Evet, yeni üye olduktan sonra SMS ve E-posta doğrulamasını yaparak ücretsiz sorgu hakkı kazanabilirsiniz." },
      { question: "Fatura kesiyor musunuz?", answer: "Evet, tüm ödemeleriniz için kurumsal e-Fatura düzenlenmekte ve mail adresinize gönderilmektedir." }
    ]
  },
  guide: { 
    sectionTitle: "Kullanım Rehberi", 
    starterTitle: "Hoşgeldin! {credits} Kredin Var.", 
    starterDesc: "İthalat serüvenine başlamak için harika bir zaman. İşte kredilerini en verimli nasıl kullanacağına dair tüyolar:", 
    strategy1Title: "Risk Analizi Yap", 
    strategy1Desc: "Aklındaki ürünü yükle ve vergi oranlarını gör. Eğer vergiler %40'ın üzerindeyse, kar marjını tekrar hesapla.", 
    strategy2Title: "Belge Kontrolü", 
    strategy2Desc: "Ürünün TAREKS veya CE belgesi gerektirip gerektirmediğini öğren. Gümrükte malın takılmasını önle.", 
    proTitle: "Profesyonel Özellikler", 
    proFeature1Title: "Pazar Araştırması", 
    proFeature1Desc: "Ürünün Çin'deki alış fiyatı ile Türkiye'deki satış fiyatını karşılaştır.", 
    proFeature2Title: "Tedarikçi Maili", 
    proFeature2Desc: "Tek tıkla profesyonel İngilizce fiyat teklifi (RFQ) maili oluştur." 
  },
  testimonials: [
    { id: '1', name: "Ahmet Yılmaz", role: "E-Ticaret Girişimcisi", comment: "Amazon FBA işimde ürün araştırırken en büyük yardımcım. GTIP kodunu saniyeler içinde bulması inanılmaz.", rating: 5, avatarInitial: "A" },
    { id: '2', name: "Ayşe Kaya", role: "İthalat Müdürü", comment: "Ekibimin üzerindeki iş yükünü yarı yarıya azalttı. Özellikle vergi hesaplamalarındaki tutarlılığı çok başarılı.", rating: 5, avatarInitial: "A" },
    { id: '3', name: "Mehmet Demir", role: "Gümrük Müşaviri", comment: "Müşterilerime hızlı ön bilgi vermek için kullanıyorum. Mevzuat değişikliklerini takip etmesi harika.", rating: 4, avatarInitial: "M" }
  ],
  updates: [],
  tracking: { metaPixelId: "", tiktokPixelId: "" },
  emailSettings: { senderName: "GümrükAI", subject: "Siparişiniz Onaylandı", body: "Sayın {ad_soyad}, {paket_adi} aboneliğiniz başarıyla başlatılmıştır." },
  paymentSettings: { provider: 'iyzico', apiKey: '', secretKey: '', baseUrl: '' },
  footer: { 
    brandName: "GümrükAI", 
    brandDesc: "Yapay zeka tabanlı gümrük mevzuat ve GTIP analiz asistanı. İthalat süreçlerinizi dijitalleştirin.", 
    copyright: "© 2024 GümrükAI Teknoloji A.Ş. Tüm hakları saklıdır.", 
    badgeText: "Türkiye'nin İlk AI Gümrük Asistanı", 
    socialLinks: { twitter: "#", linkedin: "#", instagram: "#" }, 
    legalContent: { privacy: "Gizlilik politikası içeriği...", terms: "Kullanım koşulları içeriği...", contact: "İletişim bilgileri..." } 
  }
};

export const storageService = {
  
  // --- AUTHENTICATION ---

  registerUser: async (name: string, email: string, password: string): Promise<User> => {
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

    // ADMIN OVERRIDE: Belirtilen email ise direkt admin yap
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

    // YENİ KURAL: İlk kayıtta 0 kredi, 'free' plan, 'Misafir Üye' statüsü.
    // Kullanıcı doğrulama yaptıkça kredi kazanacak.
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

  loginUser: async (email: string, password: string): Promise<User> => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw new Error("E-posta veya şifre hatalı.");
    if (!data.user) throw new Error("Giriş yapılamadı.");

    return await storageService.getCurrentUserProfile();
  },

  logoutUser: async () => {
    await supabase.auth.signOut();
  },

  getCurrentUserProfile: async (): Promise<User> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Oturum açılmamış.");

    // ADMIN OVERRIDE: Veritabanı ne derse desin bu email Admin'dir.
    if (user.email === 'admin@admin.com') {
      return {
        email: user.email!,
        name: user.user_metadata.full_name || 'Süper Admin',
        title: 'Sistem Yöneticisi',
        role: 'admin',
        planId: '3', // Kurumsal Paket
        credits: -1, // Sınırsız
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
      // Profil veritabanında henüz oluşmadıysa veya hata varsa fallback
      // YENİ KURAL: Fallback de 0 kredi ve 'free' plan olmalı.
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

    return {
      email: profile.email,
      name: profile.full_name,
      title: profile.title,
      role: profile.role || 'user', 
      planId: profile.plan_id || 'free', // Veritabanında null ise free
      credits: profile.credits,
      subscriptionStatus: profile.subscription_status,
      isEmailVerified: profile.is_email_verified,
      isPhoneVerified: profile.is_phone_verified,
      phoneNumber: profile.phone_number
    };
  },

  // --- DATA OPERATIONS ---

  saveToHistory: async (userEmail: string, analysis: CustomsAnalysis): Promise<HistoryItem> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Kullanıcı oturumu yok.");

    // Admin ise kredi düşme
    if (userEmail === 'admin@admin.com') {
        // Adminler için kredi düşülmez, sadece kayıt atılır.
    } else {
        // Kredi düşme işlemi (Sınırsız ise -1 kalır)
        const currentProfile = await storageService.getCurrentUserProfile();
        if (currentProfile.credits > 0) {
            await supabase.from('profiles').update({ credits: currentProfile.credits - 1 }).eq('id', user.id);
        }
    }

    const newItem = {
      user_id: user.id,
      product_name: analysis.productName,
      description: analysis.description,
      hs_code: analysis.hsCode,
      taxes: analysis.taxes,
      documents: analysis.documents,
      import_price: analysis.importPrice,
      retail_price: analysis.retailPrice,
      hs_code_description: analysis.hsCodeDescription
    };

    const { data, error } = await supabase
      .from('analysis_history')
      .insert(newItem)
      .select()
      .single();

    if (error) {
        console.error("Save error:", error);
        throw new Error("Geçmişe kaydedilemedi.");
    }

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

    const { data, error } = await supabase
      .from('analysis_history')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) return [];

    return data.map((item: any) => ({
      productName: item.product_name,
      description: item.description,
      hsCode: item.hs_code,
      hsCodeDescription: item.hs_code_description || '',
      taxes: item.taxes,
      documents: item.documents,
      importPrice: item.import_price,
      retailPrice: item.retail_price,
      emailDraft: "",
      confidenceScore: 90,
      id: item.id,
      date: new Date(item.created_at).toLocaleDateString('tr-TR'),
      timestamp: new Date(item.created_at).getTime()
    }));
  },

  deleteHistoryItem: async (userEmail: string, id: string) => {
    await supabase.from('analysis_history').delete().eq('id', id);
  },

  // --- CONTENT & SETTINGS ---

  getSiteContent: (): SiteContent => {
    // Bu metot senkron çalışmak zorunda olduğu yerler için fallback döner.
    // Gerçek veri App.tsx içinde fetchSiteContent ile asenkron çekilir.
    return FALLBACK_CONTENT;
  },
  
  fetchSiteContent: async (): Promise<SiteContent> => {
    try {
      const { data, error } = await supabase.from('site_config').select('content').single();
      if (error || !data) return FALLBACK_CONTENT;
      
      // Fallback ile merge et (Eksik alanları tamamla)
      return { ...FALLBACK_CONTENT, ...data.content };
    } catch (e) {
      return FALLBACK_CONTENT;
    }
  },

  saveSiteContent: async (content: SiteContent) => {
    const { error } = await supabase.from('site_config').upsert({ id: 1, content });
    if (error) console.error("Content save error:", error);
  },

  // --- USER & BILLING UPDATES ---

  updateUserSubscription: async (plan: SubscriptionPlan): Promise<User> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Kullanıcı bulunamadı");

      // Admin paket değiştiremez/satın alamaz (koruma)
      if (user.email === 'admin@admin.com') {
          return await storageService.getCurrentUserProfile();
      }

      let newCredits = 0;
      let newTitle = 'Üye';

      // YENİ KURAL: Plan mantığı
      // 1: Girişimci -> 50 Kredi
      // 2: Profesyonel -> Sınırsız (-1)
      // 3: Kurumsal -> Sınırsız (-1)
      
      if (plan.id === '1') { 
          newTitle = 'Girişimci Üye'; 
          newCredits = 50; 
      } else if (plan.id === '2') { 
          newTitle = 'Profesyonel İthalatçı'; 
          newCredits = -1; // Sınırsız
      } else if (plan.id === '3') { 
          newTitle = 'Kurumsal Üye'; 
          newCredits = -1; // Sınırsız
      } else {
          // Fallback (Bilinmeyen paket)
          newTitle = 'Üye';
          newCredits = 0;
      }

      // 1. Profili Güncelle
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
            plan_id: plan.id, 
            credits: newCredits, 
            title: newTitle,
            subscription_status: 'active' 
        })
        .eq('id', user.id);
      
      if (profileError) throw new Error("Profil güncellenemedi.");

      // 2. Fatura Kaydı Oluştur
      const billingRecord = {
          user_id: user.id,
          date: new Date().toLocaleDateString('tr-TR'),
          plan_name: plan.name,
          amount: plan.price,
          status: 'paid',
          invoice_url: '#'
      };

      await supabase.from('billing_history').insert(billingRecord);

      return await storageService.getCurrentUserProfile();
  },

  getUserBilling: async (userEmail: string): Promise<BillingHistory[]> => {
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

  // --- ADMIN FUNCTIONS (CANLI VERİLER) ---
  
  getAllUsers: async (): Promise<User[]> => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
          console.error("Admin user fetch error:", error);
          return [];
      }

      return data.map((p: any) => ({
          email: p.email,
          name: p.full_name,
          title: p.title,
          role: 'user', 
          planId: p.plan_id || 'free',
          credits: p.credits,
          subscriptionStatus: p.subscription_status,
          isEmailVerified: p.is_email_verified,
          isPhoneVerified: p.is_phone_verified,
          phoneNumber: p.phone_number
      })); 
  },

  deleteUser: async (email: string) => {
      await supabase.from('profiles').delete().eq('email', email);
  },

  getDashboardStats: async (): Promise<DashboardStats> => {
      // 1. Toplam Ciro Hesapla
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

      // 2. Kullanıcı Sayısı
      const { count: userCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });

      // 3. Analiz Sayısı
      const { count: analysisCount } = await supabase.from('analysis_history').select('*', { count: 'exact', head: true });

      // 4. Plan Dağılımı
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
      // Simüle edilmiş doğrulama
      if (code.length === 6) {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
              const updates: any = type === 'email' ? { is_email_verified: true } : { is_phone_verified: true };
              if (phoneNumber && type === 'phone') {
                  updates.phone_number = phoneNumber;
              }
              
              // YENİ KURAL: Doğrulama başına +1 kredi
              // Bu fonksiyon mevcut krediyi okuyup üstüne eklediği için 0'dan 1'e, 1'den 2'ye çıkarır.
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
