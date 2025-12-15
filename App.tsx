
import React, { useState, useEffect, useRef } from 'react';
import { AppState, CustomsAnalysis, SubscriptionPlan, User as UserType, HistoryItem, SiteContent } from './types';
import { analyzeProductImage } from './services/geminiService';
import { storageService } from './services/storageService';
import { supabase } from './services/supabaseClient'; // Import Supabase Client
import FileUpload from './components/FileUpload';
import ResultsView from './components/ResultsView';
import LoginModal from './components/LoginModal';
import PricingModal from './components/PricingModal';
import PaymentModal from './components/PaymentModal';
import AdminPanel from './components/AdminPanel';
import HistoryPanel from './components/HistoryPanel';
import CancelSubscriptionModal from './components/CancelSubscriptionModal';
import UserProfile from './components/UserProfile';
import VerificationModal from './components/VerificationModal';
import PurchaseSuccessModal from './components/PurchaseSuccessModal';
import OnboardingModal from './components/OnboardingModal';
import Footer from './components/Footer';
import LegalModal from './components/LegalModal';
import UpdatesModal from './components/UpdatesModal';
import { 
  Box, Anchor, BookOpen, AlertTriangle, Home, LogOut, User, CreditCard, Settings, Clock, Lock,
  TrendingUp, ShieldCheck, Zap, Award, Check, X as XIcon, Globe, ArrowRight, Globe2, Store,
  Search, FileText, Hash, DollarSign, Mail, Package, ChevronDown, ChevronUp, HelpCircle, AlertCircle,
  BarChart3, Send, History, Briefcase, Star, Building2, Handshake, Server, Users, Menu, Sparkles, LayoutDashboard,
  Smartphone, ScanLine, FileCheck, Coffee, Quote, Gift, CheckCircle2, ThumbsUp, XCircle, MousePointer2
} from 'lucide-react';

// Varsayılan Paket Verileri
const INITIAL_PLANS: SubscriptionPlan[] = [
  {
    id: '1',
    name: "Girişimci",
    price: "399 ₺",
    period: "/ ay",
    description: "Yeni başlayanlar ve e-ticaret girişimcileri için.",
    iconKey: 'zap',
    features: [
      "Aylık 50 GTIP Sorgusu",
      "Temel Vergi Oranları",
      "Basit Ürün Tanımlama",
      "Standart Destek"
    ],
    cta: "Hemen Başla",
    popular: true,
    color: "slate"
  },
  {
    id: '2',
    name: "Profesyonel İthalatçı",
    price: "2.499 ₺",
    period: "/ ay",
    description: "Çin'den düzenli ürün getiren KOBİ'ler için ideal.",
    iconKey: 'star',
    features: [
      "Sınırsız GTIP Analizi",
      "Sınırsız Geçmiş & Arşiv",
      "Çin & TR Pazar Fiyat Araştırması",
      "Detaylı Mevzuat & Evrak Listesi",
      "Otomatik Tedarikçi Mail Taslağı",
      "Yapay Zeka Danışmanı",
    ],
    cta: "Planı Seç",
    popular: false,
    color: "brand"
  },
  {
    id: '3',
    name: "Kurumsal",
    price: "4.999 ₺", // Fiyat eklendi
    period: "/ ay",
    description: "Holdingler ve Gümrük Müşavirlik firmaları için.",
    iconKey: 'building',
    features: [
      "Tüm Profesyonel Özellikler",
      "Yönetici Paneli Erişimi", // Yeni özellik
      "Kullanıcı ve Rol Yönetimi", // Yeni özellik
      "Site İçerik Düzenleme", // Yeni özellik
      "API Erişimi (ERP Entegrasyonu)",
      "7/24 Özel Temsilci"
    ],
    cta: "Satın Al & Yönet",
    popular: false,
    color: "indigo"
  }
];

// Extend window for pixels
declare global {
  interface Window {
    fbq: any;
    _fbq: any;
    ttq: any;
    TiktokAnalyticsObject: any;
  }
}

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [analysisResult, setAnalysisResult] = useState<CustomsAnalysis | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // Auth & Pricing State
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
  const [isPurchaseSuccessModalOpen, setIsPurchaseSuccessModalOpen] = useState(false);
  const [isOnboardingModalOpen, setIsOnboardingModalOpen] = useState(false);
  const [isUpdatesModalOpen, setIsUpdatesModalOpen] = useState(false); 
  const [selectedPlanForPayment, setSelectedPlanForPayment] = useState<SubscriptionPlan | null>(null);
  const [user, setUser] = useState<UserType | null>(null);
  
  // Legal Modal State
  const [activeLegalModal, setActiveLegalModal] = useState<'privacy' | 'terms' | 'contact' | null>(null);
  
  // History State
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showUpgradeAlert, setShowUpgradeAlert] = useState(false);

  // Admin Data State
  const [plans, setPlans] = useState<SubscriptionPlan[]>(INITIAL_PLANS);
  
  // DYNAMIC SITE CONTENT STATE
  const [siteContent, setSiteContent] = useState<SiteContent>(storageService.getSiteContent());

  // FAQ State
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  // Mobile Menu State
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Pixel Tracker Refs (Performance Fix)
  const pixelInitialized = useRef(false);

  // SUPABASE SESSION CHECK ON MOUNT
  useEffect(() => {
    const checkSession = async () => {
      try {
        const currentUser = await storageService.getCurrentUserProfile();
        setUser(currentUser);
      } catch (e) {
        // Oturum yok, sorun değil.
      }
    };
    
    checkSession();

    // Site içeriğini DB'den çek
    storageService.fetchSiteContent().then(content => setSiteContent(content));

    // Auth durumunu dinle
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN') {
        const currentUser = await storageService.getCurrentUserProfile();
        setUser(currentUser);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setAppState(AppState.IDLE);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Initialize Tracking Codes (Production Ready & Optimized)
  useEffect(() => {
    if (pixelInitialized.current) return;
    
    const tracking = siteContent.tracking;
    if (!tracking) return;

    // Meta (Facebook) Pixel - Safe Implementation
    if (tracking.metaPixelId) {
      const w = window as any;
      if (!w.fbq) {
         w.fbq = function() {
           w.fbq.callMethod ? w.fbq.callMethod.apply(w.fbq, arguments) : w.fbq.queue.push(arguments);
         };
         if (!w._fbq) w._fbq = w.fbq;
         w.fbq.push = w.fbq;
         w.fbq.loaded = true;
         w.fbq.version = '2.0';
         w.fbq.queue = [];
         
         const s = document.createElement('script');
         s.async = true;
         s.src = 'https://connect.facebook.net/en_US/fbevents.js';
         
         const firstScript = document.getElementsByTagName('script')[0];
         if (firstScript && firstScript.parentNode) {
            firstScript.parentNode.insertBefore(s, firstScript);
         }
      }
      
      try {
        window.fbq('init', tracking.metaPixelId);
        window.fbq('track', 'PageView');
        console.log('Meta Pixel Initialized');
        pixelInitialized.current = true;
      } catch (e) { console.error('Meta Pixel Error', e); }
    }

    // TikTok Pixel - Safe Implementation
    if (tracking.tiktokPixelId) {
      const w = window as any;
      const d = document;
      const id = tracking.tiktokPixelId;
      
      w.TiktokAnalyticsObject = 'ttq';
      const ttq = w.ttq = w.ttq || [];
      ttq.methods = ["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"];
      
      ttq.setAndDefer = function(t: any, e: any) {
        t[e] = function() {
          t.push([e].concat(Array.prototype.slice.call(arguments, 0)));
        };
      };
      
      for (let i = 0; i < ttq.methods.length; i++) {
        ttq.setAndDefer(ttq, ttq.methods[i]);
      }
      
      ttq.instance = function(t: any) {
        const i = ttq._i[t] || [];
        for (let n = 0; n < ttq.methods.length; n++) {
            ttq.setAndDefer(i, ttq.methods[n]);
        }
        return i;
      };
      
      ttq.load = function(e: any, n: any) {
        const i = "https://analytics.tiktok.com/i18n/pixel/events.js";
        ttq._i = ttq._i || {};
        ttq._i[e] = [];
        ttq._i[e]._u = i;
        ttq._t = ttq._t || {};
        ttq._t[e] = +new Date();
        ttq._o = ttq._o || {};
        ttq._o[e] = n || {};
        
        const o = document.createElement("script");
        o.type = "text/javascript";
        o.async = true;
        o.src = i + "?sdkid=" + e + "&lib=ttq";
        
        const a = document.getElementsByTagName("script")[0];
        if (a && a.parentNode) {
            a.parentNode.insertBefore(o, a);
        }
      };

      try {
        w.ttq.load(id);
        w.ttq.page();
        console.log('TikTok Pixel Initialized');
        pixelInitialized.current = true;
      } catch(e) { console.error('TikTok Pixel Error', e); }
    }

  }, [siteContent.tracking]);

  // Load history async when user changes
  useEffect(() => {
    if (user) {
      storageService.getUserHistory(user.email).then(data => setHistory(data));
    } else {
      setHistory([]);
    }
  }, [user]);

  const handleFileSelect = async (file: File) => {
    if (!user) {
      setIsLoginModalOpen(true);
      return;
    }

    if (user.subscriptionStatus === 'cancelled') {
      setErrorMsg("Aboneliğiniz iptal edilmiştir.");
      setAppState(AppState.ERROR);
      return;
    }
    
    if (user.credits === 0) {
       setErrorMsg("Sorgu hakkınız dolmuştur.");
       setAppState(AppState.ERROR);
       return;
    }

    try {
      setAppState(AppState.ANALYZING);
      setErrorMsg(null);
      
      const objectUrl = URL.createObjectURL(file);
      setImagePreview(objectUrl);

      const result = await analyzeProductImage(file);
      setAnalysisResult(result);
      setAppState(AppState.SUCCESS);

      // Krediyi düşür (Client-side optimistic update)
      if (user.credits > 0) {
        setUser(prev => prev ? ({ ...prev, credits: prev.credits - 1 }) : null);
      }
      
      // Async kaydet
      const savedItem = await storageService.saveToHistory(user.email, result);
      setHistory(prev => [savedItem, ...prev]);

    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Bilinmeyen bir hata oluştu.");
      setAppState(AppState.ERROR);
    }
  };

  const handleLogout = async () => {
    await storageService.logoutUser();
    setUser(null);
    setAppState(AppState.IDLE);
    setIsMobileMenuOpen(false);
  };

  const handleLoginSubmitInModal = async (u: UserType) => {
      // Bu fonksiyon LoginModal'dan çağırılır
      setUser(u);
      setAppState(AppState.DASHBOARD);
      setIsLoginModalOpen(false);
  };

  const handlePaymentSuccess = async () => {
      setIsPaymentModalOpen(false);
      
      if(user && selectedPlanForPayment) {
          try {
              // Backend'de aboneliği güncelle ve faturayı kaydet
              const updatedUser = await storageService.updateUserSubscription(selectedPlanForPayment);
              setUser(updatedUser);
              setIsPurchaseSuccessModalOpen(true);
          } catch (e) {
              console.error("Payment sync error:", e);
              alert("Ödeme alındı ancak profil güncellenirken hata oluştu. Lütfen destekle iletişime geçin.");
          }
      }
  };

  // Missing Handlers Implementation
  const handleGoToDashboard = () => setAppState(AppState.DASHBOARD);
  const handleGoToProfile = () => setAppState(AppState.USER_PROFILE);
  const handleGoHome = () => setAppState(AppState.IDLE);
  
  const handleReset = () => {
    setAnalysisResult(null);
    setImagePreview(null);
    setAppState(AppState.DASHBOARD);
  };

  const handleSelectHistory = (item: HistoryItem) => {
    setAnalysisResult(item);
    setAppState(AppState.SUCCESS);
  };

  const handleOpenPricing = () => setIsPricingModalOpen(true);

  const handleHistoryClick = () => {
      if(user) {
          setAppState(AppState.HISTORY);
      } else {
          setIsLoginModalOpen(true);
      }
  };

  const handleSelectPlan = (plan: SubscriptionPlan) => {
      let planToPay = { ...plan };

      // Apply Retention Discount if active
      if (user?.discount?.isActive) {
         // Fiyatı string'den sayıya çevir (Örn: "399 ₺" -> 399)
         const numericPrice = parseFloat(plan.price.replace(/\./g, '').replace(/[^0-9]/g, ''));
         if (!isNaN(numericPrice)) {
             const discountedPrice = Math.floor(numericPrice * (1 - user.discount.rate));
             // Yeniden formatla (Örn: "199 ₺")
             planToPay.price = `${discountedPrice.toLocaleString('tr-TR')} ₺`;
             planToPay.originalPrice = plan.price;
         }
      }

      setSelectedPlanForPayment(planToPay);
      setIsPricingModalOpen(false);
      setIsPaymentModalOpen(true);
  };

  // Helper for scrolling to pricing
  const scrollToPricing = () => {
      const element = document.getElementById('pricing-section');
      if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
      } else {
          setIsPricingModalOpen(true);
      }
  };
  
  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans relative flex flex-col selection:bg-brand-100 selection:text-brand-900">
      {/* Navbar */}
      <nav className="sticky top-0 z-[80] bg-white/90 border-b border-slate-100 shadow-sm backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <button onClick={() => setAppState(AppState.IDLE)} className="flex items-center gap-2 hover:opacity-80 transition-opacity group">
              <div className="bg-gradient-to-br from-brand-600 to-brand-800 p-2.5 rounded-xl shadow-lg shadow-brand-500/20 group-hover:shadow-brand-500/40 transition-shadow">
                <Box className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-black text-slate-900 tracking-tight">GümrükAI</span>
            </button>
            
            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
              <button onClick={() => setAppState(AppState.IDLE)} className="hover:text-brand-600 transition-colors">Anasayfa</button>
              
              {user && (
                 <button onClick={handleGoToDashboard} className={`flex items-center gap-1.5 transition-colors ${appState === AppState.DASHBOARD ? 'text-brand-600 font-bold' : 'hover:text-brand-600'}`}>
                    <LayoutDashboard className="w-4 h-4" />
                    Panel
                 </button>
              )}

              <button onClick={scrollToPricing} className="hover:text-brand-600 transition-colors">Paketler</button>
              
              {user && user.role === 'admin' && (
                <button onClick={() => setAppState(AppState.ADMIN)} className="text-brand-600">Yönetim</button>
              )}
              
              {user ? (
                <div className="flex items-center gap-4 pl-6 border-l border-slate-200">
                  <div className="text-right hidden lg:block group relative cursor-pointer" onClick={handleGoToProfile}>
                    <div className="text-slate-900 font-bold text-xs">{user.name}</div>
                    <div className={`text-[10px] font-bold mt-0.5 ${user.credits === 0 ? 'text-red-600' : 'text-green-600'}`}>
                       {user.credits === -1 ? 'Sınırsız Hak' : `${user.credits} Hak Kaldı`}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1">
                     <button onClick={handleGoToProfile} className="p-2 text-slate-400 hover:text-brand-600 rounded-full hover:bg-slate-50 transition-colors" title="Profilim">
                        <User className="w-5 h-5" />
                     </button>
                     <button onClick={handleLogout} className="p-2 text-slate-400 hover:text-red-600 rounded-full hover:bg-red-50 transition-colors" title="Çıkış Yap">
                        <LogOut className="w-5 h-5" />
                     </button>
                  </div>
                </div>
              ) : (
                <button onClick={() => setIsLoginModalOpen(true)} className="px-6 py-3 bg-slate-900 text-white rounded-xl hover:bg-slate-800 text-sm font-bold shadow-lg shadow-slate-900/20 transition-all hover:scale-105">
                   Giriş Yap
                </button>
              )}
            </div>
            
            {/* Mobile Menu Button */}
             <div className="flex items-center gap-4 md:hidden">
               <button 
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
               >
                  {isMobileMenuOpen ? <XIcon className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
               </button>
            </div>
          </div>
        </div>
        
        {/* Mobile Menu Content */}
        {isMobileMenuOpen && (
           <div className="md:hidden bg-white border-b border-slate-200 animate-in slide-in-from-top-4">
              <div className="px-4 py-4 space-y-4">
                 <button onClick={() => {setAppState(AppState.IDLE); setIsMobileMenuOpen(false)}} className="block w-full text-left py-2 font-medium text-slate-700">Anasayfa</button>
                 {user && (
                    <button onClick={() => {handleGoToDashboard(); setIsMobileMenuOpen(false)}} className="block w-full text-left py-2 font-medium text-slate-700">Panel</button>
                 )}
                 <button onClick={() => {scrollToPricing(); setIsMobileMenuOpen(false)}} className="block w-full text-left py-2 font-medium text-slate-700">Paketler</button>
                 {user ? (
                    <>
                       <button onClick={() => {handleGoToProfile(); setIsMobileMenuOpen(false)}} className="block w-full text-left py-2 font-medium text-brand-600">Profilim</button>
                       <button onClick={handleLogout} className="block w-full text-left py-2 font-medium text-red-600">Çıkış Yap</button>
                    </>
                 ) : (
                    <button onClick={() => {setIsLoginModalOpen(true); setIsMobileMenuOpen(false)}} className="block w-full text-center py-3 bg-slate-900 text-white rounded-lg font-bold">Giriş Yap</button>
                 )}
              </div>
           </div>
        )}
      </nav>

      <main className="flex-1 w-full">
        {/* State Rendering Logic */}
        {appState === AppState.IDLE && (
           // MICRO-SAAS LANDING PAGE (SALES FUNNEL MODE)
           <div className="animate-in fade-in duration-700">
              
              {/* MODÜL 1: HERO SECTION - The Hook */}
              <section className="relative overflow-hidden pt-20 pb-32 lg:pt-32 lg:pb-40">
                 <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand-50 via-white to-white opacity-70"></div>
                 
                 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 text-blue-700 text-sm font-bold mb-8 border border-blue-100 cursor-default">
                        <Coffee className="w-4 h-4" />
                        <span>{siteContent.hero?.badge || "İthalatın Yeni Yolu"}</span>
                    </div>
                    
                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-slate-900 mb-8 tracking-tight leading-[1.1] max-w-5xl mx-auto">
                        {siteContent.hero?.titleLine1 || "Gümrük Müşaviriniz"} <br/>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-indigo-600 relative inline-block">
                          {siteContent.hero?.titleLine2 || "Artık Cebinizde"}
                          <svg className="absolute w-full h-3 -bottom-2 left-0 text-brand-200/50 -z-10" viewBox="0 0 100 10" preserveAspectRatio="none">
                              <path d="M0 5 Q 50 15 100 5" stroke="currentColor" strokeWidth="12" fill="none" />
                          </svg>
                        </span>
                    </h1>
                    
                    <p className="text-xl md:text-2xl text-slate-500 mb-12 max-w-2xl mx-auto leading-relaxed font-light">
                        {siteContent.hero?.description}
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <button 
                          onClick={() => setIsLoginModalOpen(true)} 
                          className="w-full sm:w-auto px-10 py-5 bg-slate-900 text-white rounded-2xl font-bold text-lg hover:bg-slate-800 transition-all hover:scale-105 shadow-2xl shadow-slate-900/30 flex items-center justify-center gap-3 group"
                        >
                          Ücretsiz Dene
                          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                        <button 
                          onClick={scrollToPricing}
                          className="w-full sm:w-auto px-10 py-5 bg-white text-slate-700 border border-slate-200 rounded-2xl font-bold text-lg hover:bg-slate-50 transition-all hover:border-slate-300 flex items-center justify-center gap-2"
                        >
                          Paketleri İncele
                        </button>
                    </div>
                    
                    <div className="mt-8 flex items-center justify-center gap-6 text-sm font-medium text-slate-400">
                        <span className="flex items-center gap-1"><CheckCircle2 className="w-4 h-4 text-green-500" /> Kredi Kartı Gerekmez</span>
                        <span className="flex items-center gap-1"><CheckCircle2 className="w-4 h-4 text-green-500" /> Anında İptal</span>
                    </div>
                 </div>
              </section>

              {/* MODÜL 2: PRODUCT SCREENSHOT / DEMO (Pro Mode Visualization) */}
              <section className="pb-32 -mt-20 relative z-20 px-4">
                  <div className="max-w-6xl mx-auto">
                      <div className="relative group">
                          {/* Glow Effect - Optimized: Removed animation for performance */}
                          <div className="absolute -inset-1 bg-gradient-to-r from-brand-500 to-indigo-500 rounded-3xl blur opacity-25"></div>
                          
                          {/* Browser Window Mockup */}
                          <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
                              <div className="bg-slate-100 px-4 py-3 border-b border-slate-200 flex items-center gap-4">
                                  <div className="flex gap-1.5">
                                      <div className="w-3 h-3 rounded-full bg-red-400"></div>
                                      <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                                      <div className="w-3 h-3 rounded-full bg-green-400"></div>
                                  </div>
                                  <div className="flex-1 text-center">
                                      <div className="bg-white px-4 py-1 rounded-md text-xs font-mono text-slate-400 border border-slate-200 shadow-sm inline-block w-64 truncate">
                                          app.gumrukai.com/dashboard/results
                                      </div>
                                  </div>
                              </div>
                              
                              {/* Fake UI Content - Represents Pro Plan Results */}
                              <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-8 bg-slate-50/50">
                                  {/* Left: Product Image & Basic Info */}
                                  <div className="lg:col-span-1 space-y-6">
                                      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                          <img src={siteContent.productDemo?.imageUrl || "https://via.placeholder.com/400"} alt="Demo Product" className="w-full h-48 object-cover rounded-lg mb-4" />
                                          <h3 className="font-bold text-slate-900">Akıllı Robot Süpürge</h3>
                                          <p className="text-xs text-slate-500 mt-1">Ev tipi temizlik robotu, lityum bataryalı.</p>
                                      </div>
                                      <div className="bg-blue-600 text-white p-4 rounded-xl shadow-lg shadow-blue-600/20">
                                          <div className="text-xs font-bold opacity-80 mb-1">TESPİT EDİLEN GTIP</div>
                                          <div className="text-2xl font-mono font-bold tracking-wider">8508.11.00.00.19</div>
                                          <div className="flex items-center gap-1 mt-2 text-xs font-medium bg-blue-700/50 w-fit px-2 py-1 rounded">
                                              <CheckCircle2 className="w-3 h-3" /> %99.8 Güven Skoru
                                          </div>
                                      </div>
                                  </div>

                                  {/* Right: Detailed Analysis (Pro Features) */}
                                  <div className="lg:col-span-2 space-y-6">
                                      <div className="grid grid-cols-2 gap-4">
                                          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                                              <div className="flex items-center gap-2 mb-2 text-red-600 font-bold text-sm">
                                                  <DollarSign className="w-4 h-4" /> Toplam Vergi Yükü
                                              </div>
                                              <div className="text-3xl font-bold text-slate-900">%48.2</div>
                                              <div className="text-xs text-slate-500 mt-1">KDV (%20) + Gümrük (%1.7) + ÖTV (%20)</div>
                                          </div>
                                          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                                              <div className="flex items-center gap-2 mb-2 text-amber-600 font-bold text-sm">
                                                  <FileText className="w-4 h-4" /> Zorunlu Belge
                                              </div>
                                              <div className="text-xl font-bold text-slate-900">TAREKS + CE</div>
                                              <div className="text-xs text-slate-500 mt-1">İthalat denetimine tabidir.</div>
                                          </div>
                                      </div>

                                      {/* Pro Feature Highlight */}
                                      <div className="bg-white p-6 rounded-xl border border-brand-200 shadow-sm relative overflow-hidden">
                                          <div className="absolute top-0 right-0 bg-brand-600 text-white text-xs font-bold px-3 py-1 rounded-bl-xl">PRO</div>
                                          <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                                              <TrendingUp className="w-5 h-5 text-brand-600" /> Pazar Analizi
                                          </h4>
                                          <div className="flex items-center justify-between gap-8">
                                              <div>
                                                  <div className="text-xs text-slate-500 uppercase font-bold">Çin Alış (FOB)</div>
                                                  <div className="text-2xl font-bold text-slate-900">$85 - $110</div>
                                              </div>
                                              <div className="h-10 w-px bg-slate-200"></div>
                                              <div>
                                                  <div className="text-xs text-slate-500 uppercase font-bold">Türkiye Satış</div>
                                                  <div className="text-2xl font-bold text-slate-900">8.500 TL</div>
                                              </div>
                                              <div className="flex-1 text-right">
                                                  <div className="inline-block bg-green-100 text-green-700 px-3 py-1 rounded-lg font-bold text-sm">
                                                      Yüksek Kar Marjı
                                                  </div>
                                              </div>
                                          </div>
                                      </div>

                                      <div className="bg-slate-800 text-slate-300 p-4 rounded-xl font-mono text-xs overflow-hidden opacity-80">
                                          <div className="text-green-400 mb-2">// Yapay Zeka Mail Taslağı</div>
                                          <p>Dear Supplier, I am interested in importing your Robot Vacuum Model X...</p>
                                      </div>
                                  </div>
                              </div>
                          </div>
                      </div>
                  </div>
              </section>

              {/* MODÜL 3: PAIN vs SOLUTION */}
              {siteContent.painPoints && (
                <section className="py-24 bg-slate-50 border-t border-slate-200">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center max-w-3xl mx-auto mb-16">
                            <h2 className="text-3xl font-bold text-slate-900 mb-4">{siteContent.painPoints.title}</h2>
                            <p className="text-lg text-slate-500">{siteContent.painPoints.subtitle}</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {siteContent.painPoints.items.map((item, idx) => (
                                <div key={idx} className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="w-14 h-14 bg-red-50 rounded-xl flex items-center justify-center mb-6">
                                        {item.icon === 'clock' && <Clock className="w-8 h-8 text-red-500" />}
                                        {item.icon === 'money' && <DollarSign className="w-8 h-8 text-red-500" />}
                                        {item.icon === 'error' && <AlertTriangle className="w-8 h-8 text-red-500" />}
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 mb-3">{item.title}</h3>
                                    <p className="text-slate-600 leading-relaxed">
                                        {item.desc}
                                    </p>
                                </div>
                            ))}
                        </div>

                        {/* The Solution Connector */}
                        <div className="flex justify-center my-12">
                            <div className="bg-white border border-slate-200 rounded-full p-2 shadow-sm animate-bounce">
                                <ArrowRight className="w-6 h-6 text-slate-400 rotate-90" />
                            </div>
                        </div>

                        <div className="bg-brand-600 rounded-3xl p-8 md:p-12 text-white shadow-2xl shadow-brand-600/30 text-center relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
                            <h3 className="text-3xl font-bold mb-6 relative z-10">Çözüm: GümrükAI ile 10 Saniyede Sonuç</h3>
                            <p className="text-brand-100 text-lg max-w-2xl mx-auto mb-8 relative z-10">
                                Yapay zeka teknolojimiz mevzuatı saniyesinde tarar, hatasız GTIP tespiti yapar ve tüm maliyetleri önüne serer. Beklemek yok, sürpriz maliyet yok.
                            </p>
                            <button onClick={() => setIsLoginModalOpen(true)} className="bg-white text-brand-700 px-8 py-3 rounded-xl font-bold hover:bg-brand-50 transition-colors relative z-10">
                                Hemen Çözüme Ulaş
                            </button>
                        </div>
                    </div>
                </section>
              )}

              {/* MODÜL 4: COST COMPARISON (2 Coffees) */}
              <section className="py-24 bg-white">
                  <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                          <div>
                              <div className="inline-block bg-brand-100 text-brand-700 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide mb-6">
                                  {siteContent.roi?.badge}
                              </div>
                              <h2 className="text-4xl font-black text-slate-900 mb-6 leading-tight">
                                  {siteContent.roi?.title}
                              </h2>
                              <p className="text-lg text-slate-500 mb-8">
                                  {siteContent.roi?.description}
                              </p>
                              <ul className="space-y-4">
                                  <li className="flex items-center gap-3">
                                      <XCircle className="w-6 h-6 text-red-500 flex-shrink-0" />
                                      <span className="text-slate-600 font-medium line-through decoration-red-500/50">{siteContent.roi?.comparison1}</span>
                                  </li>
                                  <li className="flex items-center gap-3">
                                      <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0" />
                                      <span className="text-slate-900 font-bold">{siteContent.roi?.comparison2}</span>
                                  </li>
                                  <li className="flex items-center gap-3">
                                      <TrendingUp className="w-6 h-6 text-brand-500 flex-shrink-0" />
                                      <span className="text-brand-700 font-bold">{siteContent.roi?.comparison3}</span>
                                  </li>
                              </ul>
                          </div>
                          <div className="relative">
                               <div className="absolute inset-0 bg-gradient-to-tr from-brand-100 to-indigo-50 rounded-full blur-3xl opacity-60"></div>
                               <div className="relative bg-white border border-slate-200 rounded-3xl p-8 shadow-xl text-center">
                                   <div className="text-slate-400 text-sm font-bold uppercase mb-4">AYLIK MALİYET</div>
                                   <div className="flex justify-center items-end gap-8 mb-8">
                                       <div className="text-center opacity-40 grayscale">
                                           <div className="text-5xl mb-2">🧑‍💼</div>
                                           <div className="text-xl font-bold line-through">5.000₺</div>
                                           <div className="text-xs">Müşavir</div>
                                       </div>
                                       <div className="text-center transform scale-125">
                                           <div className="text-6xl mb-2">☕️☕️</div>
                                           <div className="text-3xl font-black text-brand-600">399₺</div>
                                           <div className="text-sm font-bold text-brand-700">GümrükAI</div>
                                       </div>
                                   </div>
                                   <button onClick={scrollToPricing} className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors">
                                       Tasarrufa Başla
                                   </button>
                               </div>
                          </div>
                      </div>
                  </div>
              </section>

              {/* MODÜL 5: VERIFICATION PROMO (The Hook) */}
              <section className="py-20 bg-slate-900 text-white relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                  <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
                      <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-yellow-400/50 animate-pulse">
                          <Gift className="w-8 h-8 text-slate-900" />
                      </div>
                      <h2 className="text-3xl md:text-5xl font-black mb-6 text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-yellow-500">
                          {siteContent.freeCreditsPromo?.title || "Hediye Kredi"}
                      </h2>
                      <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
                          {siteContent.freeCreditsPromo?.description || "Kayıt ol ve kazan."}
                      </p>
                      <button 
                          onClick={() => setIsLoginModalOpen(true)}
                          className="px-12 py-4 bg-yellow-400 text-slate-900 rounded-full font-black text-lg hover:bg-yellow-300 transition-all hover:scale-105 shadow-xl"
                      >
                          Doğrula & 2 Kredi Kazan
                      </button>
                      <p className="mt-6 text-sm text-slate-500">
                          *Kredi kartı gerekmez. Sadece telefon ve mail doğrulaması.
                      </p>
                  </div>
              </section>

              {/* MODÜL 6 & 7: PLANS (Detailed) */}
              <section id="pricing-section" className="py-24 bg-slate-50">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                      <div className="text-center mb-16">
                          <h2 className="text-3xl font-bold text-slate-900">İhtiyacına Uygun Paketi Seç</h2>
                          <p className="text-slate-500 mt-2">İster yeni başlıyor ol, ister profesyonel.</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                          {/* Entrepreneur Plan */}
                          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm hover:border-brand-300 transition-all relative overflow-hidden group">
                              <div className="absolute top-0 right-0 bg-slate-100 text-slate-600 text-xs font-bold px-3 py-1 rounded-bl-xl">BAŞLANGIÇ</div>
                              <div className="flex items-center gap-4 mb-6">
                                  <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-600">
                                      <Zap className="w-6 h-6" />
                                  </div>
                                  <div>
                                      <h3 className="text-xl font-bold text-slate-900">Girişimci Paketi</h3>
                                      <p className="text-sm text-slate-500">Yeni başlayanlar için ideal.</p>
                                  </div>
                              </div>
                              <div className="flex items-baseline gap-1 mb-8">
                                  <span className="text-4xl font-black text-slate-900">399 ₺</span>
                                  <span className="text-slate-500">/ ay</span>
                              </div>
                              <p className="text-slate-600 mb-8 min-h-[3rem]">
                                  Ayda 50 ürüne kadar GTIP ve vergi tespiti yapın. Basit ve hızlı.
                              </p>
                              <button onClick={() => handleSelectPlan(plans[0])} className="w-full py-3 bg-slate-100 text-slate-900 font-bold rounded-xl hover:bg-slate-200 transition-colors mb-8">
                                  Paketi Seç
                              </button>
                              <ul className="space-y-3">
                                  <li className="flex items-center gap-3 text-sm text-slate-700"><Check className="w-5 h-5 text-green-500" /> 50 Sorgu Hakkı</li>
                                  <li className="flex items-center gap-3 text-sm text-slate-700"><Check className="w-5 h-5 text-green-500" /> GTIP Tespiti</li>
                                  <li className="flex items-center gap-3 text-sm text-slate-700"><Check className="w-5 h-5 text-green-500" /> Vergi Hesaplama</li>
                              </ul>
                          </div>

                          {/* Professional Plan */}
                          <div className="bg-white rounded-3xl p-8 border-2 border-brand-500 shadow-xl shadow-brand-500/10 relative overflow-hidden transform md:-translate-y-4 z-10">
                              <div className="absolute top-0 left-0 w-full h-1 bg-brand-500"></div>
                              <div className="absolute top-0 right-0 bg-brand-500 text-white text-xs font-bold px-3 py-1 rounded-bl-xl">POPÜLER</div>
                              <div className="flex items-center gap-4 mb-6">
                                  <div className="w-12 h-12 bg-brand-100 rounded-2xl flex items-center justify-center text-brand-600">
                                      <Star className="w-6 h-6" />
                                  </div>
                                  <div>
                                      <h3 className="text-xl font-bold text-slate-900">Profesyonel Paket</h3>
                                      <p className="text-sm text-slate-500">Ticaret yapanlar için tam güç.</p>
                                  </div>
                              </div>
                              <div className="flex items-baseline gap-1 mb-8">
                                  <span className="text-4xl font-black text-brand-600">2.499 ₺</span>
                                  <span className="text-slate-500">/ ay</span>
                              </div>
                              <p className="text-slate-600 mb-8 min-h-[3rem]">
                                  Sınırsız sorgu, Çin fiyat analizi ve tedarikçi mail taslaklarıyla işinizi büyütün.
                              </p>
                              <button onClick={() => handleSelectPlan(plans[1])} className="w-full py-3 bg-brand-600 text-white font-bold rounded-xl hover:bg-brand-700 transition-colors shadow-lg shadow-brand-500/20 mb-8">
                                  Hemen Başla
                              </button>
                              <ul className="space-y-3">
                                  <li className="flex items-center gap-3 text-sm text-slate-900 font-bold"><Check className="w-5 h-5 text-brand-500" /> Sınırsız Sorgu</li>
                                  <li className="flex items-center gap-3 text-sm text-slate-700"><Check className="w-5 h-5 text-brand-500" /> Çin & TR Fiyat Analizi</li>
                                  <li className="flex items-center gap-3 text-sm text-slate-700"><Check className="w-5 h-5 text-brand-500" /> Tedarikçi Mail Taslakları</li>
                                  <li className="flex items-center gap-3 text-sm text-slate-700"><Check className="w-5 h-5 text-brand-500" /> Geçmiş Arşivi</li>
                              </ul>
                          </div>

                           {/* Corporate Plan */}
                           <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm hover:border-indigo-300 transition-all relative overflow-hidden group">
                              <div className="absolute top-0 right-0 bg-slate-100 text-slate-600 text-xs font-bold px-3 py-1 rounded-bl-xl">YÖNETİM</div>
                              <div className="flex items-center gap-4 mb-6">
                                  <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                                      <Building2 className="w-6 h-6" />
                                  </div>
                                  <div>
                                      <h3 className="text-xl font-bold text-slate-900">Kurumsal Paket</h3>
                                      <p className="text-sm text-slate-500">Tam yetkili yönetim.</p>
                                  </div>
                              </div>
                              <div className="flex items-baseline gap-1 mb-8">
                                  <span className="text-4xl font-black text-slate-900">4.999 ₺</span>
                                  <span className="text-slate-500">/ ay</span>
                              </div>
                              <p className="text-slate-600 mb-8 min-h-[3rem]">
                                  Admin paneli, kullanıcı yönetimi ve site içeriğini düzenleme yetkisi.
                              </p>
                              <button onClick={() => handleSelectPlan(plans[2])} className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors mb-8 shadow-lg shadow-indigo-500/20">
                                  Paketi Seç
                              </button>
                              <ul className="space-y-3">
                                  <li className="flex items-center gap-3 text-sm text-slate-700"><Check className="w-5 h-5 text-green-500" /> Yönetici Paneli</li>
                                  <li className="flex items-center gap-3 text-sm text-slate-700"><Check className="w-5 h-5 text-green-500" /> Rol Yönetimi</li>
                                  <li className="flex items-center gap-3 text-sm text-slate-700"><Check className="w-5 h-5 text-green-500" /> İçerik Düzenleme</li>
                                  <li className="flex items-center gap-3 text-sm text-slate-700"><Check className="w-5 h-5 text-green-500" /> Sınırsız Erişim</li>
                              </ul>
                          </div>
                      </div>
                  </div>
              </section>

              {/* MODÜL 8: SOCIAL PROOF (Testimonials) */}
              <section className="py-24 bg-white border-t border-slate-100">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                      <div className="text-center mb-16">
                          <h2 className="text-3xl font-bold text-slate-900">Binlerce Mutlu İthalatçı</h2>
                          <p className="text-slate-500 mt-2">GümrükAI kullananlar zamandan ve paradan nasıl tasarruf etti?</p>
                      </div>
                      
                      {/* Grid Layout for Testimonials - SAFE RENDER CHECK */}
                      {siteContent.testimonials && siteContent.testimonials.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 auto-rows-fr">
                            {siteContent.testimonials.map((t) => (
                                <div key={t.id} className="bg-slate-50 p-6 rounded-2xl border border-slate-100 hover:border-brand-200 hover:shadow-md transition-all flex flex-col">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 bg-gradient-to-br from-slate-700 to-slate-900 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md">
                                            {t.avatarInitial}
                                        </div>
                                        <div>
                                            <div className="font-bold text-slate-900 text-sm">{t.name}</div>
                                            <div className="text-xs text-slate-500">{t.role}</div>
                                        </div>
                                    </div>
                                    <div className="flex mb-3">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} className={`w-3 h-3 ${i < t.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-300'}`} />
                                        ))}
                                    </div>
                                    <p className="text-slate-600 text-xs leading-relaxed flex-1 italic relative">
                                        <Quote className="w-4 h-4 text-slate-300 absolute -top-1 -left-1 transform -scale-x-100 opacity-50" />
                                        <span className="ml-4">{t.comment}</span>
                                    </p>
                                </div>
                            ))}
                        </div>
                      ) : (
                        <div className="text-center text-slate-400">Yorumlar yükleniyor...</div>
                      )}
                  </div>
              </section>

              {/* MODÜL 9: FAQ - SAFE RENDER CHECK */}
              <section className="py-24 bg-slate-50">
                  <div className="max-w-3xl mx-auto px-4">
                      <div className="text-center mb-12">
                          <h2 className="text-3xl font-bold text-slate-900">{siteContent.faq?.title || "Sıkça Sorulan Sorular"}</h2>
                          <p className="text-slate-500">{siteContent.faq?.subtitle || "Merak ettikleriniz"}</p>
                      </div>
                      <div className="space-y-4">
                          {siteContent.faq?.items && siteContent.faq.items.length > 0 ? (
                            siteContent.faq.items.map((item, idx) => (
                                <div key={idx} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                                    <button 
                                        onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                                        className="w-full px-6 py-4 text-left flex justify-between items-center font-bold text-slate-800 hover:bg-slate-50 transition-colors"
                                    >
                                        {item.question}
                                        {openFaqIndex === idx ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                                    </button>
                                    {openFaqIndex === idx && (
                                        <div className="px-6 pb-6 pt-2 text-slate-600 text-sm leading-relaxed border-t border-slate-100">
                                            {item.answer}
                                        </div>
                                    )}
                                </div>
                            ))
                          ) : (
                            <div className="text-center text-slate-400">Sıkça sorulan sorular hazırlanıyor...</div>
                          )}
                      </div>
                  </div>
              </section>

              {/* MODÜL 10: FINAL CTA */}
              <section className="py-24 bg-white border-t border-slate-100">
                  <div className="max-w-5xl mx-auto px-4 text-center">
                      <div className="bg-gradient-to-br from-brand-600 to-indigo-700 rounded-3xl p-12 md:p-20 text-white shadow-2xl relative overflow-hidden">
                          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
                          <div className="relative z-10">
                              <h2 className="text-3xl md:text-5xl font-black mb-6">İthalat Yapmak Hiç Bu Kadar Kolay Olmamıştı</h2>
                              <p className="text-xl text-brand-100 mb-10 max-w-2xl mx-auto">
                                  Risk alma, para kaybetme. GümrükAI ile işini sağlama al.
                              </p>
                              <button 
                                  onClick={() => setIsLoginModalOpen(true)}
                                  className="px-12 py-5 bg-white text-brand-700 rounded-2xl font-black text-lg hover:bg-brand-50 transition-all hover:scale-105 shadow-xl"
                              >
                                  Şimdi Ücretsiz Başla
                              </button>
                          </div>
                      </div>
                  </div>
              </section>
           </div>
        )}

        {appState === AppState.DASHBOARD && user && (
           <div className="animate-in fade-in duration-500 pb-20">
              <div className="mb-10 text-center pt-8">
                 <h1 className="text-3xl font-bold text-slate-900 mb-2">Yeni Gümrük Analizi</h1>
                 <p className="text-slate-500">Ürün görselini yükleyin, yapay zeka GTIP ve vergileri hesaplasın.</p>
              </div>
              <div className="max-w-4xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                 <FileUpload onFileSelect={handleFileSelect} isLoading={false} />
              </div>
           </div>
        )}

        {appState === AppState.ANALYZING && (
           <div className="flex flex-col items-center justify-center min-h-[50vh]">
             <FileUpload onFileSelect={() => {}} isLoading={true} />
           </div>
        )}

        {appState === AppState.SUCCESS && analysisResult && (
          <ResultsView 
            analysis={analysisResult} 
            imagePreview={imagePreview}
            onReset={handleReset}
            userPlanId={user?.planId}
            onOpenPricing={() => setIsPricingModalOpen(true)}
            onOpenLogin={() => setIsLoginModalOpen(true)}
          />
        )}

        {/* ... Other App States (Profile, History, Admin) ... */}
        {appState === AppState.USER_PROFILE && user && (
           <UserProfile 
              user={user}
              onLogout={handleLogout}
              onSelectHistory={handleSelectHistory}
              onCancelSubscription={() => setIsCancelModalOpen(true)}
              plans={plans}
              onUpgradeClick={handleOpenPricing}
              onOpenVerification={() => setIsVerificationModalOpen(true)}
           />
        )}

        {appState === AppState.HISTORY && user && (
           <HistoryPanel 
              history={history}
              onSelectHistory={handleSelectHistory}
              onDeleteHistory={(id) => {
                  storageService.deleteHistoryItem(user.email, id).then(() => {
                      setHistory(prev => prev.filter(i => i.id !== id));
                  });
              }}
              onBack={() => setAppState(AppState.DASHBOARD)}
           />
        )}
        
        {appState === AppState.ADMIN && (
          <AdminPanel 
             plans={plans}
             siteContent={siteContent}
             onUpdatePlan={(updatedPlan) => setPlans(plans.map(p => p.id === updatedPlan.id ? updatedPlan : p))}
             onAddPlan={(newPlan) => setPlans([...plans, newPlan])}
             onDeletePlan={(id) => setPlans(plans.filter(p => p.id !== id))}
             onUpdateContent={(content) => {
                setSiteContent(content);
                storageService.saveSiteContent(content);
             }}
             onClose={() => setAppState(AppState.IDLE)}
          />
        )}
      </main>

      {/* Footer, Modals ... */}
      <Footer content={siteContent.footer} onHomeClick={handleGoHome} onHistoryClick={handleHistoryClick} onPricingClick={scrollToPricing} onOpenPrivacy={() => setActiveLegalModal('privacy')} onOpenTerms={() => setActiveLegalModal('terms')} onOpenContact={() => setActiveLegalModal('contact')} onOpenUpdates={() => setIsUpdatesModalOpen(true)} />
      
      {/* Login Modal */}
      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} onLogin={handleLoginSubmitInModal} />
      
      <PricingModal isOpen={isPricingModalOpen} onClose={() => setIsPricingModalOpen(false)} plans={plans} onSelectPlan={handleSelectPlan} />
      
      <PaymentModal 
        isOpen={isPaymentModalOpen} 
        onClose={() => setIsPaymentModalOpen(false)} 
        plan={selectedPlanForPayment} 
        onPaymentSuccess={handlePaymentSuccess} 
      />
      
      <PurchaseSuccessModal isOpen={isPurchaseSuccessModalOpen} onClose={() => setIsPurchaseSuccessModalOpen(false)} plan={selectedPlanForPayment} user={user} />
      
      {isVerificationModalOpen && user && (
          <VerificationModal 
            isOpen={isVerificationModalOpen} 
            onClose={() => setIsVerificationModalOpen(false)} 
            user={user} 
            onUpdateUser={setUser} 
          />
      )}

      {isOnboardingModalOpen && user && (
         <OnboardingModal isOpen={isOnboardingModalOpen} onClose={() => setIsOnboardingModalOpen(false)} user={user} />
      )}
      
      {isUpdatesModalOpen && (
         <UpdatesModal isOpen={isUpdatesModalOpen} onClose={() => setIsUpdatesModalOpen(false)} />
      )}
      
      <LegalModal 
         isOpen={!!activeLegalModal}
         onClose={() => setActiveLegalModal(null)}
         title={activeLegalModal === 'privacy' ? 'Gizlilik Politikası' : activeLegalModal === 'terms' ? 'Kullanım Koşulları' : 'İletişim'}
         content={activeLegalModal ? siteContent.footer.legalContent[activeLegalModal] : ''}
         type={activeLegalModal || 'privacy'}
      />
    </div>
  );
};

export default App;
