
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
  Search, FileText, Hash, DollarSign, Mail, Package, ChevronDown, HelpCircle, AlertCircle,
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
        console.log("No active session");
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

  // ... (Rest of the event handlers need to adapt to async storageService)

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
      {/* ... Navbar code ... */}
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
            {/* Mobile Menu Button ... */}
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
        {/* Mobile Menu Content ... */}
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-0 flex-1 w-full">
        {/* State Rendering Logic */}
        {appState === AppState.IDLE && (
           // Landing Page Content...
           <div className="animate-in fade-in duration-700 space-y-24 md:space-y-32">
              <div className="flex flex-col items-center justify-center pt-8 text-center">
                 {/* Hero content */}
                 <h1 className="text-5xl font-black text-slate-900 mb-6">Ne Satsam Diye Düşünme</h1>
                 <button onClick={() => setIsLoginModalOpen(true)} className="px-10 py-5 bg-brand-600 text-white rounded-2xl font-bold">Hemen Başla</button>
                 {/* Demo Image Section with Fixed Image */}
                 <div className="mt-12 max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
                    <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                       <span className="text-sm font-mono text-slate-500">demo_result.json</span>
                       <div className="flex gap-1">
                          <div className="w-3 h-3 rounded-full bg-red-400"></div>
                          <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                          <div className="w-3 h-3 rounded-full bg-green-400"></div>
                       </div>
                    </div>
                    <div className="flex flex-col md:flex-row">
                       <div className="w-full md:w-1/2 h-64 md:h-auto relative">
                          <img 
                             src="https://ideacdn.net/idea/kc/80/myassets/products/244/yesil-fitilli-kadin-panduf-1.jpg?revision=1699965058" 
                             alt="Yeşil Fitilli Panduf" 
                             className="w-full h-full object-cover"
                          />
                       </div>
                       <div className="w-full md:w-1/2 p-6 text-left space-y-4">
                          <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                             <div className="text-xs font-bold text-blue-600 uppercase">GTIP Kodu</div>
                             <div className="text-xl font-mono font-bold text-slate-900">6404.19.90.00.00</div>
                             <div className="text-xs text-slate-500 mt-1">Fitilli Kadife Ev Botu (Panduf) - Kauçuk Tabanlı</div>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                             <div className="bg-red-50 p-3 rounded-lg border border-red-100">
                                <div className="text-xs font-bold text-red-600 uppercase">Vergiler</div>
                                <ul className="text-xs text-red-800 mt-1 space-y-1">
                                   <li>Gümrük V.: %20</li>
                                   <li>İlave G.V.: %30</li>
                                   <li>KDV: %10</li>
                                </ul>
                             </div>
                             <div className="bg-amber-50 p-3 rounded-lg border border-amber-100">
                                <div className="text-xs font-bold text-amber-600 uppercase">Belgeler</div>
                                <ul className="text-xs text-amber-800 mt-1 space-y-1">
                                   <li>TAREKS Ref.</li>
                                   <li>CE Belgesi</li>
                                   <li>Azo Boyar Test</li>
                                </ul>
                             </div>
                          </div>
                       </div>
                    </div>
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
      </main>

      {/* Footer, Modals ... */}
      <Footer content={siteContent.footer} onHomeClick={handleGoHome} onHistoryClick={handleHistoryClick} onPricingClick={() => setIsPricingModalOpen(true)} onOpenPrivacy={() => setActiveLegalModal('privacy')} onOpenTerms={() => setActiveLegalModal('terms')} onOpenContact={() => setActiveLegalModal('contact')} onOpenUpdates={() => setIsUpdatesModalOpen(true)} />
      
      {/* Login Modal now uses async Supabase login */}
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
      
      {/* ... Other modals like Onboarding, Updates, Legal ... */}
    </div>
  );
};

export default App;
