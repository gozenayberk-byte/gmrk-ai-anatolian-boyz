import React from 'react';
import { CustomsAnalysis } from '../types';
import { 
  FileText, 
  Hash, 
  DollarSign, 
  ShieldCheck, 
  Mail, 
  Copy, 
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  TrendingUp,
  Globe2,
  Store,
  Lock,
  Sparkles,
  LogIn
} from 'lucide-react';

interface ResultsViewProps {
  analysis: CustomsAnalysis;
  imagePreview: string | null;
  onReset: () => void;
  userPlanId?: string; // Kullanıcı planını kontrol etmek için
  onOpenPricing?: () => void;
  onOpenLogin?: () => void;
}

const ResultsView: React.FC<ResultsViewProps> = ({ 
  analysis, 
  imagePreview, 
  onReset, 
  userPlanId,
  onOpenPricing,
  onOpenLogin
}) => {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Metin kopyalandı!");
  };

  // Kullanıcı giriş yapmamışsa (userPlanId undefined ise) Guest modundadır
  const isGuest = !userPlanId;
  // Girişimci Paketi (ID: '1')
  const isBasicPlan = userPlanId === '1';

  // Fiyat ve Mail bölümleri hem Misafir hem de Girişimci için kilitli
  const isPriceAndMailLocked = isGuest || isBasicPlan;

  // Kilitli İçerik Bileşeni (Pro Upgrade)
  const LockedFeature = ({ title, description, type }: { title: string, description: string, type: 'login' | 'upgrade' }) => (
    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/60 backdrop-blur-md rounded-xl text-center p-6 border border-slate-200">
      <div className="bg-amber-100 p-3 rounded-full mb-3">
        <Lock className="w-6 h-6 text-amber-600" />
      </div>
      <h3 className="text-lg font-bold text-slate-900 mb-1">{title}</h3>
      <p className="text-sm text-slate-600 mb-4 max-w-xs">{description}</p>
      
      {type === 'login' && onOpenLogin && (
        <button 
          onClick={onOpenLogin}
          className="px-6 py-2 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors flex items-center gap-2 shadow-sm"
        >
          <LogIn className="w-4 h-4" />
          Giriş Yap
        </button>
      )}

      {type === 'upgrade' && onOpenPricing && (
        <button 
          onClick={onOpenPricing}
          className="px-4 py-2 bg-brand-600 text-white rounded-lg font-medium hover:bg-brand-700 transition-colors flex items-center gap-2 shadow-sm"
        >
          <Sparkles className="w-4 h-4" />
          Pro Pakete Geç
        </button>
      )}
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      
      {/* Back Button */}
      <div>
        <button 
          onClick={onReset}
          className="flex items-center gap-2 text-slate-500 hover:text-brand-600 transition-colors font-medium hover:bg-white px-3 py-2 rounded-lg inline-flex"
        >
           <ArrowLeft className="w-5 h-5" />
           <span>Geri Dön</span>
        </button>
      </div>

      {/* Header Section */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex flex-col md:flex-row gap-6 items-start">
        {imagePreview && (
          <div className="w-full md:w-48 h-48 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
            <img src={imagePreview} alt="Uploaded product" className="w-full h-full object-cover" />
          </div>
        )}
        <div className="flex-1 w-full min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded uppercase tracking-wide">
              Analiz Tamamlandı
            </span>
            <span className="text-gray-400 text-xs">Güven Skoru: %{analysis.confidenceScore}</span>
            {isPriceAndMailLocked && (
              <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2 py-1 rounded uppercase tracking-wide flex items-center gap-1">
                <Lock className="w-3 h-3" /> Kısıtlı Görünüm
              </span>
            )}
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 break-words">{analysis.productName}</h2>
          <p className="text-gray-600 leading-relaxed break-words">{analysis.description}</p>
          
          <div className="mt-4 flex gap-3">
            <button 
              onClick={onReset}
              className="text-sm font-medium text-gray-500 hover:text-gray-800 underline decoration-gray-300 underline-offset-4"
            >
              Yeni Analiz Yap
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* HS Code Card - HERKES GÖREBİLİR */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-l-4 border-l-blue-500 border-gray-100 flex flex-col">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Hash className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-800">GTIP Kodu</h3>
          </div>
          <div className="text-3xl font-mono font-bold text-blue-900 tracking-tight mb-2 break-all">
            {analysis.hsCode}
          </div>
          <p className="text-sm font-medium text-slate-600 break-words mb-4">
             {analysis.hsCodeDescription}
          </p>
          <div className="mt-auto pt-3 border-t border-blue-50">
             <p className="text-xs text-gray-400 mt-1">
               Resmi Tarife Cetveli
             </p>
          </div>
        </div>

        {/* Taxes Card - MİSAFİR İÇİN KİLİTLİ */}
        <div className="relative bg-white p-6 rounded-xl shadow-sm border border-l-4 border-l-red-500 border-gray-100 overflow-hidden">
          {isGuest && (
             <LockedFeature 
               title="Vergi Oranları Kilitli" 
               description="Detaylı vergi analizini görmek için ücretsiz üye olun veya giriş yapın."
               type="login"
             />
          )}
          <div className={isGuest ? 'blur-sm select-none' : ''}>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-50 rounded-lg">
                <DollarSign className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-800">Olası Vergiler</h3>
            </div>
            <ul className="space-y-2">
              {analysis.taxes?.map((tax, idx) => (
                <li key={idx} className="flex items-start gap-2 text-gray-700">
                  <AlertCircle className="w-4 h-4 text-red-400 mt-1 flex-shrink-0" />
                  <span className="break-words">{tax}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Documents Card - MİSAFİR İÇİN KİLİTLİ */}
        <div className="relative bg-white p-6 rounded-xl shadow-sm border border-l-4 border-l-amber-500 border-gray-100 overflow-hidden">
          {isGuest && (
             <LockedFeature 
               title="Evrak Listesi Kilitli" 
               description="Gümrük için gerekli evrakları görüntülemek için giriş yapmalısınız."
               type="login"
             />
          )}
          <div className={isGuest ? 'blur-sm select-none' : ''}>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-amber-50 rounded-lg">
                <ShieldCheck className="w-6 h-6 text-amber-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-800">Gerekli Evraklar</h3>
            </div>
            <ul className="space-y-2">
              {analysis.documents?.map((doc, idx) => (
                <li key={idx} className="flex items-start gap-2 text-gray-700">
                  <CheckCircle2 className="w-4 h-4 text-amber-500 mt-1 flex-shrink-0" />
                  <span className="break-words">{doc}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

      </div>

      {/* Price Analysis Section - LOCKED FOR PLAN 1 & GUEST */}
      <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2 mt-4">
        <TrendingUp className="w-6 h-6 text-brand-600" />
        Pazar ve Fiyat Analizi (Tahmini)
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
         
         {isPriceAndMailLocked && (
           <LockedFeature 
             title="Fiyat Analizi Kilitli" 
             description={isGuest ? "Giriş yaparak pazar analizlerini görebilirsiniz." : "Çin FOB ve Türkiye Perakende fiyat analizini görmek için Profesyonel pakete geçin."}
             type={isGuest ? "login" : "upgrade"}
           />
         )}

         {/* China Import Price */}
         <div className={`bg-gradient-to-br from-white to-slate-50 p-6 rounded-xl shadow-sm border border-gray-200 relative overflow-hidden ${isPriceAndMailLocked ? 'blur-sm' : ''}`}>
            <div className="absolute top-0 right-0 w-20 h-20 bg-blue-100 rounded-bl-full opacity-50 -mr-10 -mt-10"></div>
            <div className="flex items-start gap-4 relative z-10">
               <div className="p-3 bg-white border border-gray-200 rounded-lg shadow-sm">
                 <Globe2 className="w-8 h-8 text-blue-600" />
               </div>
               <div>
                 <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Çin Tedarik Fiyatı (FOB)</h3>
                 <div className="text-2xl font-bold text-gray-900">{analysis.importPrice}</div>
                 <p className="text-xs text-gray-500 mt-2">Alibaba, Made-in-China vb. platformlardan tahmini ortalama.</p>
               </div>
            </div>
         </div>

         {/* Turkey Retail Price */}
         <div className={`bg-gradient-to-br from-white to-slate-50 p-6 rounded-xl shadow-sm border border-gray-200 relative overflow-hidden ${isPriceAndMailLocked ? 'blur-sm' : ''}`}>
            <div className="absolute top-0 right-0 w-20 h-20 bg-green-100 rounded-bl-full opacity-50 -mr-10 -mt-10"></div>
             <div className="flex items-start gap-4 relative z-10">
               <div className="p-3 bg-white border border-gray-200 rounded-lg shadow-sm">
                 <Store className="w-8 h-8 text-green-600" />
               </div>
               <div>
                 <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Türkiye Pazar Fiyatı</h3>
                 <div className="text-2xl font-bold text-gray-900">{analysis.retailPrice}</div>
                 <p className="text-xs text-gray-500 mt-2">Trendyol, Hepsiburada vb. platformlardan tahmini perakende.</p>
               </div>
            </div>
         </div>
      </div>

      {/* Email Draft Section - LOCKED FOR PLAN 1 & GUEST */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden relative">
        
        {isPriceAndMailLocked && (
           <LockedFeature 
             title="Tedarikçi Mail Taslağı" 
             description={isGuest ? "Mail taslağını görmek için giriş yapmalısınız." : "Yapay zeka tarafından hazırlanan İngilizce RFQ taslağına erişmek için paketinizi yükseltin."}
             type={isGuest ? "login" : "upgrade"}
           />
        )}

        <div className={`bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center ${isPriceAndMailLocked ? 'blur-sm' : ''}`}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white rounded-md border border-gray-200 shadow-sm">
              <Mail className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-800">Tedarikçi Talep Metni</h3>
              <p className="text-xs text-gray-500">Otomatik oluşturulmuş İngilizce RFQ taslağı</p>
            </div>
          </div>
          <button 
            onClick={() => !isPriceAndMailLocked && copyToClipboard(analysis.emailDraft)}
            className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
          >
            <Copy className="w-4 h-4" />
            Kopyala
          </button>
        </div>
        <div className={`p-6 ${isPriceAndMailLocked ? 'blur-sm' : ''}`}>
          <pre className="whitespace-pre-wrap font-sans text-gray-700 bg-gray-50 p-4 rounded-lg border border-gray-100 text-sm leading-relaxed overflow-x-auto">
            {analysis.emailDraft}
          </pre>
        </div>
      </div>

    </div>
  );
};

export default ResultsView;