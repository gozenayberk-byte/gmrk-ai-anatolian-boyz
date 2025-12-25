
import React, { useState, useEffect, useRef } from 'react';
import { AppState, CustomsAnalysis, SubscriptionPlan, User as UserType, HistoryItem, SiteContent } from './types';
import { analyzeProductImage } from './services/geminiService';
import { storageService } from './services/storageService';
import { supabase } from './services/supabaseClient';
import FileUpload from './components/FileUpload';
import ResultsView from './components/ResultsView';
import LoginModal from './components/LoginModal';
import PricingModal from './components/PricingModal';
import PaymentModal from './components/PaymentModal';
import AdminPanel from './components/AdminPanel';
import HistoryPanel from './components/HistoryPanel';
import UserProfile from './components/UserProfile';
import VerificationModal from './components/VerificationModal';
import PurchaseSuccessModal from './components/PurchaseSuccessModal';
import OnboardingModal from './components/OnboardingModal';
import Footer from './components/Footer';
import LegalModal from './components/LegalModal';
import UpdatesModal from './components/UpdatesModal';
import { 
  Box, LogOut, User, Menu, X as XIcon, LayoutDashboard, ArrowRight, ArrowLeft, AlertCircle, RefreshCcw, ShieldCheck, Zap, Gift
} from 'lucide-react';

const INITIAL_PLANS: SubscriptionPlan[] = [
  {
    id: '1',
    name: "Girişimci",
    price: "399 ₺",
    period: "/ ay",
    description: "Yeni başlayanlar ve e-ticaret girişimcileri için.",
    iconKey: 'zap',
    features: ["Aylık 50 GTIP Sorgusu", "Temel Vergi Oranları", "Basit Ürün Tanımlama", "Standard Destek"],
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
    features: ["Sınırsız GTIP Analizi", "Sınırsız Geçmiş & Arşiv", "Çin & TR Pazar Fiyat Araştırması", "Detaylı Mevzuat & Evrak Listesi", "Otomatik Tedarikçi Mail Taslağı", "Yapay Zeka Danışmanı"],
    cta: "Planı Seç",
    popular: false,
    color: "brand"
  },
  {
    id: '3',
    name: "Kurumsal",
    price: "4.999 ₺",
    period: "/ ay",
    description: "Holdingler ve Gümrük Müşavirlik firmaları için.",
    iconKey: 'building',
    features: ["Tüm Profesyonel Özellikler", "Yönetici Paneli Erişimi", "Kullanıcı ve Rol Yönetimi", "Site İçerik Düzenleme", "API Erişimi (ERP Entegrasyonu)", "7/24 Özel Temsilci"],
    cta: "Satın Al & Yönet",
    popular: false,
    color: "indigo"
  }
];

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [analysisResult, setAnalysisResult] = useState<CustomsAnalysis | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
  const [isPurchaseSuccessModalOpen, setIsPurchaseSuccessModalOpen] = useState(false);
  const [isUpdatesModalOpen, setIsUpdatesModalOpen] = useState(false); 
  const [selectedPlanForPayment, setSelectedPlanForPayment] = useState<SubscriptionPlan | null>(null);
  const [user, setUser] = useState<UserType | null>(null);
  const [activeLegalModal, setActiveLegalModal] = useState<'privacy' | 'terms' | 'contact' | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [plans, setPlans] = useState<SubscriptionPlan[]>(INITIAL_PLANS);
  const [siteContent, setSiteContent] = useState<SiteContent>(storageService.getSiteContent());
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const currentUser = await storageService.getCurrentUserProfile();
        setUser(currentUser);
      } catch (e) {}
    };
    checkSession();
    storageService.fetchSiteContent().then(content => setSiteContent(content));

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event) => {
      if (event === 'SIGNED_IN') {
        try {
          const currentUser = await storageService.getCurrentUserProfile();
          setUser(currentUser);
        } catch (e) { console.error("Session update error:", e); }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setAppState(AppState.IDLE);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

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
    if (user.credits === 0 && user.planId === 'free') {
       setErrorMsg("Sorgu hakkınız dolmuştur. Bir paket satın alarak devam edebilirsiniz.");
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
      if (user.credits > 0) {
        setUser(prev => prev ? ({ ...prev, credits: prev.credits - 1 }) : null);
      }
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
      setUser(u);
      setAppState(AppState.DASHBOARD);
      setIsLoginModalOpen(false);
  };

  const handlePaymentSuccess = async () => {
      setIsPaymentModalOpen(false);
      if(user && selectedPlanForPayment) {
          try {
              const updatedUser = await storageService.updateUserSubscription(selectedPlanForPayment, user.email);
              setUser(updatedUser);
              setIsPurchaseSuccessModalOpen(true);
          } catch (e) {
              console.error("Payment sync error:", e);
              alert("Ödeme alındı ancak profil güncellenirken hata oluştu.");
          }
      }
  };

  const handleGoToDashboard = () => setAppState(AppState.DASHBOARD);
  const handleGoToProfile = () => setAppState(AppState.USER_PROFILE);
  const handleGoHome = () => setAppState(AppState.IDLE);
  const handleReset = () => { setAnalysisResult(null); setImagePreview(null); setAppState(AppState.DASHBOARD); };
  const handleOpenPricing = () => setIsPricingModalOpen(true);
  const handleHistoryClick = () => { if(user) setAppState(AppState.HISTORY); else setIsLoginModalOpen(true); };

  const handleSelectHistory = (item: HistoryItem) => {
    setAnalysisResult(item);
    setImagePreview(null);
    setAppState(AppState.SUCCESS);
  };

  const onOpenVerification = () => setIsVerificationModalOpen(true);

  const handleSelectPlan = (plan: SubscriptionPlan) => {
      let planToPay = { ...plan };
      if (user?.discount?.isActive) {
         const numericPrice = parseFloat(plan.price.replace(/\./g, '').replace(/[^0-9]/g, ''));
         if (!isNaN(numericPrice)) {
             const discountedPrice = Math.floor(numericPrice * (1 - user.discount.rate));
             planToPay.price = `${discountedPrice.toLocaleString('tr-TR')} ₺`;
             planToPay.originalPrice = plan.price;
         }
      }
      setSelectedPlanForPayment(planToPay);
      setIsPricingModalOpen(false);
      setIsPaymentModalOpen(true);
  };

  const scrollToPricing = () => {
      const element = document.getElementById('pricing-section');
      if (element) element.scrollIntoView({ behavior: 'smooth' });
      else setIsPricingModalOpen(true);
  };
  
  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans relative flex flex-col selection:bg-brand-100 selection:text-brand-900">
      <nav className="sticky top-0 z-[80] bg-white/90 border-b border-slate-100 shadow-sm backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <button onClick={handleGoHome} className="flex items-center gap-2 hover:opacity-80 transition-opacity group">
              <div className="bg-gradient-to-br from-brand-600 to-brand-800 p-2.5 rounded-xl shadow-lg shadow-brand-500/20 group-hover:shadow-brand-500/40 transition-shadow">
                <Box className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-black text-slate-900 tracking-tight">GümrükAI</span>
            </button>
            
            <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
              <button onClick={handleGoHome} className="hover:text-brand-600 transition-colors">Anasayfa</button>
              {user && (
                 <button onClick={handleGoToDashboard} className={`flex items-center gap-1.5 transition-colors ${appState === AppState.DASHBOARD ? 'text-brand-600 font-bold' : 'hover:text-brand-600'}`}>
                    <LayoutDashboard className="w-4 h-4" /> Panel
                 </button>
              )}
              <button onClick={scrollToPricing} className="hover:text-brand-600 transition-colors">Paketler</button>
              {user ? (
                <div className="flex items-center gap-4 pl-6 border-l border-slate-200">
                  <div className="text-right hidden lg:block cursor-pointer" onClick={handleGoToProfile}>
                    <div className="text-slate-900 font-bold text-xs">{user.name}</div>
                    <div className={`text-[10px] font-bold mt-0.5 ${user.credits === 0 ? 'text-red-600' : 'text-green-600'}`}>
                       {user.credits === -1 ? 'Sınırsız Hak' : `${user.credits} Hak Kaldı`}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                     <button onClick={handleGoToProfile} className="p-2 text-slate-400 hover:text-brand-600 rounded-full transition-colors"><User className="w-5 h-5" /></button>
                     <button onClick={handleLogout} className="p-2 text-slate-400 hover:text-red-600 rounded-full transition-colors"><LogOut className="w-5 h-5" /></button>
                  </div>
                </div>
              ) : (
                <button onClick={() => setIsLoginModalOpen(true)} className="px-6 py-3 bg-slate-900 text-white rounded-xl hover:bg-slate-800 text-sm font-bold transition-all hover:scale-105">Giriş Yap</button>
              )}
            </div>
            <div className="md:hidden">
               <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg">
                  {isMobileMenuOpen ? <XIcon className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
               </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-1 w-full">
        {appState === AppState.IDLE && (
           <div className="animate-in fade-in duration-700">
              <section className="relative overflow-hidden pt-20 pb-32 lg:pt-32 lg:pb-40">
                 <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand-50 via-white to-white opacity-70"></div>
                 <div className="max-w-7xl mx-auto px-4 text-center relative z-10">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 text-blue-700 text-sm font-bold mb-8 border border-blue-100">
                        <span>{siteContent.hero?.badge}</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black text-slate-900 mb-8 tracking-tight leading-[1.1]">{siteContent.hero?.titleLine1} <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-indigo-600">{siteContent.hero?.titleLine2}</span></h1>
                    <p className="text-xl text-slate-500 mb-12 max-w-2xl mx-auto leading-relaxed">{siteContent.hero?.description}</p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <button onClick={() => setIsLoginModalOpen(true)} className="w-full sm:w-auto px-10 py-5 bg-slate-900 text-white rounded-2xl font-bold text-lg hover:bg-slate-800 transition-all hover:scale-105 shadow-2xl">Ücretsiz Dene</button>
                        <button onClick={scrollToPricing} className="w-full sm:w-auto px-10 py-5 bg-white text-slate-700 border border-slate-200 rounded-2xl font-bold text-lg hover:bg-slate-50 transition-all">Paketleri İncele</button>
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
           <div className="flex flex-col items-center justify-center min-h-[50vh] pt-20">
             <FileUpload onFileSelect={() => {}} isLoading={true} />
           </div>
        )}

        {appState === AppState.ERROR && (
           <div className="max-w-2xl mx-auto px-4 py-20 text-center animate-in fade-in">
              <div className="bg-red-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-100">
                <AlertCircle className="w-10 h-10 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Analiz Tamamlanamadı</h2>
              <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm mb-8 text-slate-600">
                {errorMsg}
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button onClick={handleReset} className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors">
                  <RefreshCcw className="w-5 h-5" /> Tekrar Dene
                </button>
                <button onClick={scrollToPricing} className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-colors">
                  <Zap className="w-5 h-5" /> Paket Satın Al
                </button>
              </div>
           </div>
        )}

        {appState === AppState.SUCCESS && analysisResult && (
          <ResultsView analysis={analysisResult} imagePreview={imagePreview} onReset={handleReset} userPlanId={user?.planId} onOpenPricing={handleOpenPricing} onOpenLogin={() => setIsLoginModalOpen(true)} />
        )}

        {appState === AppState.USER_PROFILE && user && (
           <UserProfile user={user} onLogout={handleLogout} onSelectHistory={handleSelectHistory} onCancelSubscription={() => {}} plans={plans} onUpgradeClick={handleOpenPricing} onOpenVerification={() => setIsVerificationModalOpen(true)} />
        )}

        {appState === AppState.HISTORY && user && (
           <HistoryPanel history={history} onSelectHistory={handleSelectHistory} onDeleteHistory={(id) => storageService.deleteHistoryItem(user.email, id).then(() => setHistory(prev => prev.filter(i => i.id !== id)))} onBack={handleGoToDashboard} />
        )}
      </main>

      {siteContent && siteContent.footer && (
        <Footer content={siteContent.footer} onHomeClick={handleGoHome} onHistoryClick={handleHistoryClick} onPricingClick={scrollToPricing} onOpenPrivacy={() => setActiveLegalModal('privacy')} onOpenTerms={() => setActiveLegalModal('terms')} onOpenContact={() => setActiveLegalModal('contact')} onOpenUpdates={() => setIsUpdatesModalOpen(true)} />
      )}
      
      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} onLogin={handleLoginSubmitInModal} />
      <PricingModal isOpen={isPricingModalOpen} onClose={() => setIsPricingModalOpen(false)} plans={plans} onSelectPlan={handleSelectPlan} />
      <PaymentModal isOpen={isPaymentModalOpen} onClose={() => setIsPaymentModalOpen(false)} plan={selectedPlanForPayment} onPaymentSuccess={handlePaymentSuccess} />
      <PurchaseSuccessModal isOpen={isPurchaseSuccessModalOpen} onClose={() => setIsPurchaseSuccessModalOpen(false)} plan={selectedPlanForPayment} user={user} />
      {isVerificationModalOpen && user && <VerificationModal isOpen={isVerificationModalOpen} onClose={() => setIsVerificationModalOpen(false)} user={user} onUpdateUser={setUser} />}
      {isUpdatesModalOpen && <UpdatesModal isOpen={isUpdatesModalOpen} onClose={() => setIsUpdatesModalOpen(false)} />}
      <LegalModal isOpen={!!activeLegalModal} onClose={() => setActiveLegalModal(null)} title={activeLegalModal === 'privacy' ? 'Gizlilik Politikası' : activeLegalModal === 'terms' ? 'Kullanım Koşulları' : 'İletişim'} content={activeLegalModal ? siteContent.footer.legalContent[activeLegalModal] : ''} type={activeLegalModal || 'privacy'} />
    </div>
  );
};

export default App;
