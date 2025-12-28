
import React, { useState, useEffect } from 'react';
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
  Box, LogOut, User, Menu, X as XIcon, LayoutDashboard, ArrowRight, ShieldCheck, Zap, TrendingUp, Clock, Globe, ShieldAlert, CheckCircle, BarChart3, HelpCircle, Activity, Users, Star, Building2, ShoppingBag
} from 'lucide-react';

const INITIAL_PLANS: SubscriptionPlan[] = [
  { id: '1', name: "Girişimci", price: "399 ₺", period: "/ ay", description: "Yeni başlayanlar için.", iconKey: 'zap', features: ["Aylık 50 GTIP Sorgusu", "Temel Vergi Oranları"], cta: "Hemen Başla", popular: true, color: "slate" },
  { id: '2', name: "Profesyonel", price: "2.499 ₺", period: "/ ay", description: "Düzenli ithalatçılar için.", iconKey: 'star', features: ["Sınırsız Analiz", "Pazar Araştırması", "AI Danışman"], cta: "Planı Seç", popular: false, color: "brand" },
  { id: '3', name: "Kurumsal", price: "4.999 ₺", period: "/ ay", description: "Müşavirlik firmaları için.", iconKey: 'building', features: ["API Erişimi", "Yönetici Paneli", "7/24 Destek"], cta: "Bize Ulaşın", popular: false, color: "indigo" }
];

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [analysisResult, setAnalysisResult] = useState<CustomsAnalysis | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [user, setUser] = useState<UserType | null>(null);
  const [siteContent, setSiteContent] = useState<SiteContent>(storageService.getSiteContent());

  useEffect(() => {
    const init = async () => {
      try {
        const content = await storageService.fetchSiteContent();
        setSiteContent(content);
        const u = await storageService.getCurrentUserProfile();
        setUser(u);
      } catch (e) {}
    };
    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event) => {
      if (event === 'SIGNED_IN') {
        const u = await storageService.getCurrentUserProfile();
        setUser(u);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setAppState(AppState.IDLE);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleFileSelect = async (file: File) => {
    if (!user) { setIsLoginModalOpen(true); return; }
    if (user.credits === 0 && user.planId === 'free') {
       setErrorMsg("Krediniz doldu.");
       setAppState(AppState.ERROR);
       return;
    }
    try {
      setAppState(AppState.ANALYZING);
      const url = URL.createObjectURL(file);
      setImagePreview(url);
      const res = await analyzeProductImage(file);
      setAnalysisResult(res);
      await storageService.saveToHistory(user.email, res);
      setAppState(AppState.SUCCESS);
      const updated = await storageService.getCurrentUserProfile();
      setUser(updated);
    } catch (err: any) {
      setErrorMsg(err.message);
      setAppState(AppState.ERROR);
    }
  };

  // Fix: Added missing handleReset function
  const handleReset = () => {
    setAppState(AppState.DASHBOARD);
    setAnalysisResult(null);
    setImagePreview(null);
    setErrorMsg(null);
  };

  const handleLogout = async () => { await storageService.logoutUser(); };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <nav className="sticky top-0 z-[100] bg-white/90 border-b border-slate-100 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 h-20 flex justify-between items-center">
          <button onClick={() => setAppState(AppState.IDLE)} className="flex items-center gap-2">
            <div className="bg-brand-600 p-2 rounded-xl text-white shadow-lg"><Box className="w-6 h-6" /></div>
            <span className="text-2xl font-black">GümrükAI</span>
          </button>
          <div className="flex items-center gap-6">
            {user ? (
               <button onClick={() => setAppState(AppState.USER_PROFILE)} className="flex items-center gap-2">
                 <div className="text-right">
                   <div className="text-sm font-bold">{user.name}</div>
                   <div className="text-[10px] text-brand-600 font-bold">{user.credits} HAK</div>
                 </div>
                 <User className="w-5 h-5 text-slate-400" />
               </button>
            ) : (
               <button onClick={() => setIsLoginModalOpen(true)} className="bg-slate-900 text-white px-6 py-2 rounded-xl font-bold">Giriş Yap</button>
            )}
          </div>
        </div>
      </nav>

      <main className="flex-1">
        {appState === AppState.IDLE && (
          <div className="animate-in fade-in duration-700">
            {/* SECTION 1: HERO */}
            <section className="relative pt-20 pb-32 text-center overflow-hidden">
               <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_top,_#e0f2fe_0%,_transparent_50%)] -z-10 opacity-60"></div>
               <div className="max-w-5xl mx-auto px-4">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-50 text-brand-700 text-sm font-bold mb-8 border border-brand-100">
                     <Zap className="w-4 h-4" /> <span>{siteContent.hero?.badge || "GÜNCEL MEVZUAT"}</span>
                  </div>
                  <h1 className="text-6xl md:text-8xl font-black text-slate-900 mb-8 leading-[1.05] tracking-tight">
                    {siteContent.hero?.titleLine1} <br/>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-indigo-600">{siteContent.hero?.titleLine2}</span>
                  </h1>
                  <p className="text-xl text-slate-500 mb-12 max-w-2xl mx-auto">{siteContent.hero?.description}</p>
                  <div className="flex gap-4 justify-center">
                    <button onClick={() => setIsLoginModalOpen(true)} className="px-10 py-5 bg-slate-900 text-white rounded-2xl font-bold text-lg hover:scale-105 transition-all shadow-xl">Ücretsiz Analiz Yap</button>
                    <button onClick={() => document.getElementById('pricing')?.scrollIntoView({behavior:'smooth'})} className="px-10 py-5 bg-white border border-slate-200 text-slate-600 rounded-2xl font-bold text-lg">Paketleri Gör</button>
                  </div>
               </div>
            </section>

            {/* SECTION 2: STATS */}
            <section className="py-12 bg-white border-y border-slate-100">
              <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8">
                {[
                  { label: "Sorgu / Gün", val: "12,450+", icon: Activity },
                  { label: "Doğruluk Payı", val: "%99.2", icon: CheckCircle },
                  { label: "Analiz Süresi", val: "8 Saniye", icon: Clock },
                  { label: "Aktif Kullanıcı", val: "4,200+", icon: Users }
                ].map((s, i) => (
                  <div key={i} className="text-center group">
                    <div className="text-3xl font-black text-slate-900 group-hover:text-brand-600 transition-colors">{s.val}</div>
                    <div className="text-sm text-slate-400 font-medium">{s.label}</div>
                  </div>
                ))}
              </div>
            </section>

            {/* SECTION 3: FEATURES (PAIN POINTS) */}
            <section id="features" className="py-24 bg-slate-50">
               <div className="max-w-7xl mx-auto px-4">
                  <div className="text-center mb-16">
                     <h2 className="text-4xl font-black mb-4">Dış Ticaretin Yeni Standartı</h2>
                     <p className="text-slate-500">Geleneksel, yavaş ve hata payı yüksek yöntemleri geride bırakın.</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {siteContent.painPoints?.items.map((p, i) => (
                      <div key={i} className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl transition-all group">
                         <div className="w-14 h-14 bg-brand-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-brand-600 group-hover:text-white transition-all">
                            {i === 0 ? <Clock className="w-6 h-6" /> : i === 1 ? <TrendingUp className="w-6 h-6" /> : <ShieldCheck className="w-6 h-6" />}
                         </div>
                         <h3 className="text-xl font-bold mb-4">{p.title}</h3>
                         <p className="text-slate-500 leading-relaxed">{p.desc}</p>
                      </div>
                    ))}
                  </div>
               </div>
            </section>

            {/* SECTION 4: ROI / PROFIT */}
            <section className="py-24 bg-white overflow-hidden">
               <div className="max-w-7xl mx-auto px-4 flex flex-col lg:flex-row items-center gap-16">
                  <div className="flex-1">
                     <div className="inline-block px-4 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-bold mb-4">{siteContent.roi?.badge}</div>
                     <h2 className="text-5xl font-black mb-6 leading-tight">{siteContent.roi?.title}</h2>
                     <p className="text-slate-500 text-lg mb-8">{siteContent.roi?.description}</p>
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[siteContent.roi?.comparison1, siteContent.roi?.comparison2, siteContent.roi?.comparison3].map((c, i) => (
                           <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100 font-bold text-slate-700">
                              <CheckCircle className="w-5 h-5 text-green-500" /> {c}
                           </div>
                        ))}
                     </div>
                  </div>
                  <div className="flex-1 relative">
                     <div className="bg-slate-900 rounded-[2.5rem] p-4 shadow-2xl">
                        <img src={siteContent.productDemo?.imageUrl} alt="Demo" className="rounded-[2rem] shadow-inner" />
                     </div>
                     <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-3xl shadow-2xl border border-slate-100 animate-bounce">
                        <div className="text-brand-600 font-black text-2xl">%90</div>
                        <div className="text-xs text-slate-400 font-bold">DAHA HIZLI</div>
                     </div>
                  </div>
               </div>
            </section>

            {/* SECTION 5: HOW IT WORKS (GUIDE) */}
            <section className="py-24 bg-slate-900 text-white">
               <div className="max-w-7xl mx-auto px-4">
                  <h2 className="text-4xl font-black text-center mb-20">3 Adımda Gümrük Analizi</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
                     <div className="absolute top-1/2 left-0 w-full h-px bg-white/10 hidden md:block"></div>
                     {[
                        { step: "01", title: "Görsel Yükle", desc: "Ürünün fotoğrafını sisteme yükleyin." },
                        { step: "02", title: "AI Analizi", desc: "Saniyeler içinde GTIP ve vergileri görün." },
                        { step: "03", title: "Raporu İndir", desc: "Mevzuat ve pazar verilerini kaydedin." }
                     ].map((s, i) => (
                        <div key={i} className="relative z-10 text-center">
                           <div className="w-16 h-16 bg-brand-600 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-black border-4 border-slate-900">{s.step}</div>
                           <h3 className="text-xl font-bold mb-4">{s.title}</h3>
                           <p className="text-slate-400">{s.desc}</p>
                        </div>
                     ))}
                  </div>
               </div>
            </section>

            {/* SECTION 6: PRICING */}
            <section id="pricing" className="py-24 bg-slate-50">
               <div className="max-w-7xl mx-auto px-4 text-center">
                  <h2 className="text-4xl font-black mb-4">Şeffaf Fiyatlandırma</h2>
                  <p className="text-slate-500 mb-16">Her bütçeye ve hacme uygun paketler.</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {INITIAL_PLANS.map((plan, i) => (
                      <div key={i} className={`bg-white p-10 rounded-[2.5rem] border ${plan.popular ? 'border-brand-500 ring-4 ring-brand-50' : 'border-slate-100'} text-left flex flex-col relative`}>
                        {plan.popular && <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-brand-600 text-white px-4 py-1 rounded-full text-xs font-bold uppercase">En Popüler</div>}
                        <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                        <div className="text-4xl font-black mb-6">{plan.price}<span className="text-sm text-slate-400 font-medium">{plan.period}</span></div>
                        <ul className="space-y-4 mb-10 flex-1">
                          {plan.features.map((f, j) => (
                            <li key={j} className="flex items-center gap-2 text-sm text-slate-600 font-medium"><CheckCircle className="w-4 h-4 text-brand-500" /> {f}</li>
                          ))}
                        </ul>
                        <button onClick={() => setIsLoginModalOpen(true)} className={`w-full py-4 rounded-2xl font-bold transition-all ${plan.popular ? 'bg-brand-600 text-white shadow-xl shadow-brand-500/20' : 'bg-slate-100 text-slate-600'}`}>{plan.cta}</button>
                      </div>
                    ))}
                  </div>
               </div>
            </section>

            {/* SECTION 7: FAQ */}
            <section className="py-24 bg-white">
               <div className="max-w-4xl mx-auto px-4">
                  <h2 className="text-4xl font-black text-center mb-16">{siteContent.faq?.title}</h2>
                  <div className="space-y-4">
                     {siteContent.faq?.items.map((item, i) => (
                        <div key={i} className="border border-slate-100 rounded-2xl p-6 hover:bg-slate-50 transition-colors">
                           <h3 className="font-bold text-lg mb-2">{item.question}</h3>
                           <p className="text-slate-500 text-sm">{item.answer}</p>
                        </div>
                     ))}
                  </div>
               </div>
            </section>
          </div>
        )}

        {appState === AppState.DASHBOARD && (
           <div className="max-w-4xl mx-auto py-20 px-4 animate-in fade-in">
              <div className="text-center mb-12">
                 <h1 className="text-4xl font-black mb-4">Ürün Analizi Başlat</h1>
                 <p className="text-slate-500">Ürün görselini yükleyin, yapay zeka mevzuatı tarasın.</p>
              </div>
              <FileUpload onFileSelect={handleFileSelect} isLoading={false} />
           </div>
        )}

        {appState === AppState.ANALYZING && (
           <div className="flex flex-col items-center justify-center min-h-[60vh]">
             <FileUpload onFileSelect={()=>{}} isLoading={true} />
           </div>
        )}

        {appState === AppState.SUCCESS && analysisResult && (
           <ResultsView analysis={analysisResult} imagePreview={imagePreview} onReset={handleReset} userPlanId={user?.planId} />
        )}

        {appState === AppState.USER_PROFILE && user && (
           <UserProfile user={user} onLogout={handleLogout} onSelectHistory={(item) => { setAnalysisResult(item); setAppState(AppState.SUCCESS); }} onCancelSubscription={()=>{}} plans={INITIAL_PLANS} onUpgradeClick={() => {}} onOpenVerification={() => {}} />
        )}
      </main>

      <Footer content={siteContent.footer} onHomeClick={() => setAppState(AppState.IDLE)} onHistoryClick={() => setAppState(AppState.USER_PROFILE)} onPricingClick={() => {}} onOpenPrivacy={()=>{}} onOpenTerms={()=>{}} onOpenContact={()=>{}} onOpenUpdates={()=>{}} />
      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} onLogin={(u) => { setUser(u); setAppState(AppState.DASHBOARD); }} />
    </div>
  );
};

export default App;
