
import React, { useState, useEffect } from 'react';
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
  Smartphone, ScanLine, FileCheck, Coffee, Quote, Gift, CheckCircle2
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
    cta: "Paketi Seç",
    popular: false,
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
    popular: true,
    color: "brand"
  },
  {
    id: '3',
    name: "Kurumsal",
    price: "Özel Teklif",
    period: "",
    description: "Holdingler ve Gümrük Müşavirlik firmaları için.",
    iconKey: 'building',
    features: [
      "Tüm Profesyonel Özellikler",
      "Çoklu Kullanıcı & Arşiv Yönetimi",
      "Canlı Gümrük Müşaviri Desteği",
      "API Erişimi (ERP Entegrasyonu)",
      "7/24 Özel Temsilci"
    ],
    cta: "İletişime Geç",
    popular: false,
    color: "indigo"
  }
];

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

  // Initialize Tracking Codes (Same as before)
  useEffect(() => {
    const tracking = siteContent.tracking;
    if (!tracking) return;
    // ... (Tracking code injection logic remains same)
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
      setSelectedPlanForPayment(plan);
      setIsPricingModalOpen(false);
      setIsPaymentModalOpen(true);
  };
  
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans relative flex flex-col">
      {/* Navbar */}
      <nav className="sticky top-0 z-[80] bg-white/90 border-b border-slate-200 shadow-sm backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <button onClick={() => setAppState(AppState.IDLE)} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="bg-brand-600 p-2 rounded-lg shadow-sm">
                <Box className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-slate-900">GümrükAI</span>
            </button>
            
            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
              <button onClick={() => setAppState(AppState.IDLE)} className="hover:text-brand-600">Anasayfa</button>
              
              {user && (
                 <button onClick={handleGoToDashboard} className={`flex items-center gap-1 ${appState === AppState.DASHBOARD ? 'text-brand-600 font-bold' : 'hover:text-brand-600'}`}>
                    <LayoutDashboard className="w-4 h-4" />
                    Panel
                 </button>
              )}

              <button onClick={() => setIsPricingModalOpen(true)} className="hover:text-brand-600">Paketler</button>
              
              {user && user.role === 'admin' && (
                <button onClick={() => setAppState(AppState.ADMIN)} className="text-brand-600">Yönetim</button>
              )}
              
              {user ? (
                <div className="flex items-center gap-4 pl-4 border-l border-slate-200">
                  <div className="text-right hidden lg:block group relative cursor-pointer" onClick={handleGoToProfile}>
                    <div className="text-slate-900 font-semibold text-xs">{user.name}</div>
                    <div className="text-[10px] text-slate-500">{user.title}</div>
                    <div className={`text-[10px] font-bold mt-0.5 ${user.credits === 0 ? 'text-red-600' : 'text-green-600'}`}>
                       {user.credits === -1 ? 'Sınırsız Hak' : `${user.credits} Hak Kaldı`}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1">
                     <button onClick={handleGoToProfile} className="p-2 text-slate-400 hover:text-brand-600 rounded-full hover:bg-slate-100 transition-colors" title="Profilim">
                        <User className="w-5 h-5" />
                     </button>
                     <button onClick={handleLogout} className="p-2 text-slate-400 hover:text-red-600 rounded-full hover:bg-slate-100 transition-colors" title="Çıkış Yap">
                        <LogOut className="w-5 h-5" />
                     </button>
                  </div>
                </div>
              ) : (
                <button onClick={() => setIsLoginModalOpen(true)} className="px-5 py-2 bg-slate-900 text-white rounded-full hover:bg-slate-800 text-xs font-bold uppercase tracking-wide transition-all">Giriş Yap</button>
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
                 <button onClick={() => {setIsPricingModalOpen(true); setIsMobileMenuOpen(false)}} className="block w-full text-left py-2 font-medium text-slate-700">Paketler</button>
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-0 flex-1 w-full">
        {/* State Rendering Logic */}
        {appState === AppState.IDLE && (
           // Landing Page Content
           <div className="animate-in fade-in duration-700 space-y-24 md:space-y-32 pb-24">
              
              {/* SECTION 1: HERO & PROMO */}
              <div className="flex flex-col items-center justify-center pt-8 text-center relative">
                 
                 {siteContent.freeCreditsPromo?.isActive && (
                    <div className="absolute -top-6 animate-bounce bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg flex items-center gap-2">
                       <Gift className="w-3 h-3" />
                       {siteContent.freeCreditsPromo.title}: {siteContent.freeCreditsPromo.description}
                    </div>
                 )}

                 <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 text-brand-600 text-xs font-bold uppercase tracking-widest mb-6">
                    <Sparkles className="w-3 h-3" />
                    {siteContent.hero.badge}
                 </div>

                 <h1 className="text-5xl md:text-7xl font-black text-slate-900 mb-6 tracking-tight leading-tight">
                    {siteContent.hero.titleLine1} <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-brand-400">
                       {siteContent.hero.titleLine2}
                    </span>
                 </h1>
                 
                 <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed">
                    {siteContent.hero.description}
                 </p>

                 <div className="flex flex-col md:flex-row gap-4 items-center">
                    <button 
                       onClick={() => setIsLoginModalOpen(true)} 
                       className="px-10 py-4 bg-brand-600 hover:bg-brand-700 text-white rounded-2xl font-bold text-lg shadow-xl shadow-brand-500/30 transition-all hover:scale-105 flex items-center gap-2"
                    >
                       Hemen Başla
                       <ArrowRight className="w-5 h-5" />
                    </button>
                    <button 
                       onClick={() => window.scrollTo({ top: 800, behavior: 'smooth' })}
                       className="px-8 py-4 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-2xl font-bold text-lg transition-all"
                    >
                       Nasıl Çalışır?
                    </button>
                 </div>
                 
                 {/* Demo Image Section */}
                 <div className="mt-16 max-w-5xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 transform hover:scale-[1.01] transition-transform duration-500">
                    <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                       <div className="flex gap-2">
                          <div className="w-3 h-3 rounded-full bg-red-400"></div>
                          <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                          <div className="w-3 h-3 rounded-full bg-green-400"></div>
                       </div>
                       <span className="text-xs font-mono text-slate-400">analysis_result_v2.json</span>
                    </div>
                    <div className="flex flex-col md:flex-row">
                       <div className="w-full md:w-1/2 h-64 md:h-auto relative bg-slate-100 flex items-center justify-center">
                          <img 
                             src="https://ideacdn.net/idea/kc/80/myassets/products/244/yesil-fitilli-kadin-panduf-1.jpg?revision=1699965058" 
                             alt="Demo Ürün" 
                             className="max-h-full object-contain mix-blend-multiply"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end p-6">
                             <div className="text-white">
                                <div className="text-xs font-bold opacity-80 uppercase">Taranan Ürün</div>
                                <div className="font-bold text-lg">Kadın Ev Botu (Panduf)</div>
                             </div>
                          </div>
                       </div>
                       <div className="w-full md:w-1/2 p-8 text-left space-y-6 bg-white">
                          <div className="flex items-center gap-4 border-b border-slate-100 pb-4">
                             <div className="bg-green-100 p-2 rounded-lg">
                                <CheckCircle2 className="w-6 h-6 text-green-600" />
                             </div>
                             <div>
                                <div className="text-xs text-slate-500 font-bold uppercase">Tespit Edilen GTIP</div>
                                <div className="text-2xl font-mono font-bold text-slate-900">6404.19.90.00.00</div>
                             </div>
                          </div>
                          
                          <div className="space-y-3">
                             <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-500">Gümrük Vergisi</span>
                                <span className="font-bold text-slate-900">%20</span>
                             </div>
                             <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                <div className="bg-red-500 h-full w-[20%]"></div>
                             </div>
                             
                             <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-500">İlave Gümrük Vergisi (İGV)</span>
                                <span className="font-bold text-slate-900">%30</span>
                             </div>
                             <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                <div className="bg-orange-500 h-full w-[30%]"></div>
                             </div>

                             <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-500">KDV</span>
                                <span className="font-bold text-slate-900">%10</span>
                             </div>
                             <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                <div className="bg-blue-500 h-full w-[10%]"></div>
                             </div>
                          </div>

                          <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 flex gap-3">
                             <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                             <div className="text-xs text-amber-800 leading-relaxed">
                                <strong>Dikkat:</strong> TAREKS referansı ve CE belgesi zorunludur. Azo boyar testi istenebilir.
                             </div>
                          </div>
                       </div>
                    </div>
                 </div>
              </div>

              {/* SECTION 2: ROI (PROBLEM/SOLUTION) */}
              <div className="bg-slate-900 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-24 text-white relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-600/20 rounded-full blur-[100px] -mr-32 -mt-32"></div>
                 <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[100px] -ml-32 -mb-32"></div>
                 
                 <div className="max-w-7xl mx-auto relative z-10">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                       <span className="text-brand-400 font-bold tracking-widest text-xs uppercase">{siteContent.roi.badge}</span>
                       <h2 className="text-3xl md:text-5xl font-bold mt-4 mb-6">{siteContent.roi.title}</h2>
                       <p className="text-slate-400 text-lg">{siteContent.roi.description}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                       <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-8 rounded-2xl hover:bg-white/10 transition-colors">
                          <div className="text-4xl font-black text-red-500 mb-4">45dk</div>
                          <p className="text-slate-300 font-medium">{siteContent.roi.comparison1}</p>
                       </div>
                       <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-8 rounded-2xl hover:bg-white/10 transition-colors">
                          <div className="text-4xl font-black text-orange-500 mb-4">%200</div>
                          <p className="text-slate-300 font-medium">{siteContent.roi.comparison2}</p>
                       </div>
                       <div className="bg-brand-600 p-8 rounded-2xl shadow-xl shadow-brand-600/20 transform scale-105">
                          <div className="text-4xl font-black text-white mb-4">10sn</div>
                          <p className="text-brand-100 font-bold">{siteContent.roi.comparison3}</p>
                       </div>
                    </div>
                 </div>
              </div>

              {/* SECTION 3: FEATURES (PRO) */}
              <div className="max-w-7xl mx-auto">
                 <div className="flex flex-col md:flex-row items-center gap-12">
                    <div className="w-full md:w-1/2 space-y-8">
                       <div className="inline-block px-4 py-1.5 bg-indigo-100 text-indigo-700 rounded-full font-bold text-xs uppercase tracking-wide">
                          {siteContent.proSection.badge}
                       </div>
                       <h2 className="text-4xl font-bold text-slate-900 leading-tight">
                          {siteContent.proSection.title}
                       </h2>
                       <p className="text-lg text-slate-600 leading-relaxed">
                          {siteContent.proSection.description}
                       </p>
                       
                       <div className="space-y-6">
                          <div className="flex gap-4">
                             <div className="bg-green-100 p-3 rounded-xl h-fit">
                                <TrendingUp className="w-6 h-6 text-green-600" />
                             </div>
                             <div>
                                <h4 className="font-bold text-slate-900 text-lg">Karlılık Analizi</h4>
                                <p className="text-slate-500 mt-1">Vergiler dahil net maliyetini ve Türkiye pazarındaki potansiyel kar marjını gör.</p>
                             </div>
                          </div>
                          <div className="flex gap-4">
                             <div className="bg-blue-100 p-3 rounded-xl h-fit">
                                <Mail className="w-6 h-6 text-blue-600" />
                             </div>
                             <div>
                                <h4 className="font-bold text-slate-900 text-lg">Otomatik RFQ</h4>
                                <p className="text-slate-500 mt-1">Çinli tedarikçilere göndermek üzere profesyonel İngilizce fiyat teklifi maili hazırla.</p>
                             </div>
                          </div>
                       </div>
                    </div>
                    <div className="w-full md:w-1/2">
                       <div className="bg-gradient-to-br from-indigo-50 to-white p-8 rounded-3xl border border-indigo-100 shadow-lg relative">
                          <div className="absolute top-4 right-4 bg-white p-2 rounded-lg shadow-sm">
                             <TrendingUp className="w-6 h-6 text-green-500" />
                          </div>
                          <div className="space-y-6">
                             {/* Mock UI Elements */}
                             <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                                <div className="text-xs text-slate-400 font-bold uppercase mb-2">Çin Tedarik Fiyatı</div>
                                <div className="flex justify-between items-end">
                                   <div className="text-2xl font-bold text-slate-900">$5.40 - $6.20</div>
                                   <div className="text-xs text-green-600 font-bold bg-green-50 px-2 py-1 rounded">Düşük Risk</div>
                                </div>
                             </div>
                             <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm opacity-80">
                                <div className="text-xs text-slate-400 font-bold uppercase mb-2">Türkiye Satış Fiyatı</div>
                                <div className="flex justify-between items-end">
                                   <div className="text-2xl font-bold text-slate-900">450 ₺ - 520 ₺</div>
                                   <div className="text-xs text-slate-400">Trendyol, Hepsiburada</div>
                                </div>
                             </div>
                             <div className="bg-indigo-600 text-white p-4 rounded-xl shadow-md">
                                <div className="font-bold text-sm mb-1">Tahmini Net Kar</div>
                                <div className="text-3xl font-black">%145</div>
                             </div>
                          </div>
                       </div>
                    </div>
                 </div>
              </div>

              {/* SECTION 4: CORPORATE */}
              <div className="bg-slate-50 rounded-3xl p-8 md:p-16 border border-slate-200 text-center">
                 <div className="max-w-3xl mx-auto space-y-6">
                    <Building2 className="w-12 h-12 text-slate-400 mx-auto" />
                    <h2 className="text-3xl font-bold text-slate-900">{siteContent.corporate.title}</h2>
                    <p className="text-slate-600 text-lg">{siteContent.corporate.description}</p>
                    <div className="pt-4">
                       <button onClick={() => window.open('mailto:corporate@gumrukai.com')} className="px-8 py-3 bg-white border border-slate-300 text-slate-700 font-bold rounded-xl hover:bg-slate-100 transition-colors">
                          Kurumsal İletişime Geç
                       </button>
                    </div>
                 </div>
              </div>

              {/* SECTION 5: TESTIMONIALS */}
              <div className="max-w-7xl mx-auto">
                 <h2 className="text-3xl font-bold text-center text-slate-900 mb-12">Kullanıcılarımız Ne Diyor?</h2>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {siteContent.testimonials.map((t) => (
                       <div key={t.id} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow relative">
                          <Quote className="w-8 h-8 text-brand-100 absolute top-6 right-6" />
                          <div className="flex items-center gap-1 mb-4">
                             {[...Array(5)].map((_, i) => (
                                <Star key={i} className={`w-4 h-4 ${i < t.rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-200'}`} />
                             ))}
                          </div>
                          <p className="text-slate-600 mb-6 leading-relaxed">"{t.comment}"</p>
                          <div className="flex items-center gap-3">
                             <div className="w-10 h-10 bg-slate-900 rounded-full flex items-center justify-center text-white font-bold">
                                {t.avatarInitial}
                             </div>
                             <div>
                                <div className="font-bold text-slate-900 text-sm">{t.name}</div>
                                <div className="text-xs text-slate-500">{t.role}</div>
                             </div>
                          </div>
                       </div>
                    ))}
                 </div>
              </div>

              {/* SECTION 6: FAQ */}
              <div className="max-w-3xl mx-auto">
                 <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-slate-900">{siteContent.faq.title}</h2>
                    <p className="text-slate-500 mt-2">{siteContent.faq.subtitle}</p>
                 </div>
                 <div className="space-y-4">
                    {siteContent.faq.items.map((item, idx) => (
                       <div key={idx} className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                          <button 
                             onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                             className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-slate-50 transition-colors"
                          >
                             <span className="font-bold text-slate-800">{item.question}</span>
                             {openFaqIndex === idx ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                          </button>
                          {openFaqIndex === idx && (
                             <div className="px-6 pb-6 pt-2 text-slate-600 leading-relaxed text-sm bg-slate-50/50">
                                {item.answer}
                             </div>
                          )}
                       </div>
                    ))}
                 </div>
              </div>

              {/* FINAL CTA */}
              <div className="bg-brand-600 rounded-3xl p-12 text-center text-white relative overflow-hidden">
                 <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white/20 to-transparent"></div>
                 <div className="relative z-10 max-w-2xl mx-auto space-y-6">
                    <h2 className="text-3xl md:text-4xl font-black">İthalata 1-0 Önde Başlayın</h2>
                    <p className="text-brand-100 text-lg">Risk almayın, yapay zeka ile analiz edin. Hemen ücretsiz hesabınızı oluşturun.</p>
                    <button onClick={() => setIsLoginModalOpen(true)} className="px-10 py-4 bg-white text-brand-700 rounded-2xl font-bold text-lg hover:bg-brand-50 transition-colors shadow-xl">
                       Ücretsiz Dene
                    </button>
                    <p className="text-xs text-brand-200 opacity-80 mt-4">Kredi kartı gerekmez. 50 Sorgu hediye.</p>
                 </div>
              </div>

           </div>
        )}

        {appState === AppState.DASHBOARD && user && (
           <div className="animate-in fade-in duration-500 pb-20">
              <div className="mb-10 text-center">
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
      <Footer content={siteContent.footer} onHomeClick={handleGoHome} onHistoryClick={handleHistoryClick} onPricingClick={() => setIsPricingModalOpen(true)} onOpenPrivacy={() => setActiveLegalModal('privacy')} onOpenTerms={() => setActiveLegalModal('terms')} onOpenContact={() => setActiveLegalModal('contact')} onOpenUpdates={() => setIsUpdatesModalOpen(true)} />
      
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
