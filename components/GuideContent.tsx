import React from 'react';
import { SiteContent, User } from '../types';
import { 
  CheckCircle2, Zap, Search, FileText, TrendingUp, Mail, 
  Lightbulb, AlertCircle, ArrowRight, Star
} from 'lucide-react';

interface GuideContentProps {
  user: User;
  content: SiteContent['guide'];
}

const GuideContent: React.FC<GuideContentProps> = ({ user, content }) => {
  const isPro = user.planId === '2';
  const isCorporate = user.planId === '3';
  
  // 2 Kredi Senaryosu (Yeni Başlayan / Doğrulanmış Hesap)
  const isStarterScenario = user.credits > 0 && user.credits <= 5;

  return (
    <div className="space-y-8 text-left">
      
      {/* 1. SECTION: WHAT YOU HAVE */}
      <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-amber-500" />
          Mevcut Gücünüz: {user.title}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-lg border border-slate-100 shadow-sm">
            <div className="text-xs text-slate-500 font-bold uppercase mb-1">Kalan Hakkınız</div>
            <div className={`text-2xl font-bold ${user.credits === -1 ? 'text-green-600' : 'text-brand-600'}`}>
              {user.credits === -1 ? 'Sınırsız' : `${user.credits} Analiz`}
            </div>
            <p className="text-xs text-slate-400 mt-2">Her analiz = 1 GTIP + Vergi + Mevzuat Raporu</p>
          </div>

          <div className="bg-white p-4 rounded-lg border border-slate-100 shadow-sm">
             <div className="text-xs text-slate-500 font-bold uppercase mb-1">Erişilebilir Özellikler</div>
             <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-slate-700">
                   <CheckCircle2 className="w-4 h-4 text-green-500" /> GTIP Tespiti
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-700">
                   <CheckCircle2 className="w-4 h-4 text-green-500" /> Vergi Hesaplama
                </div>
                {isPro || isCorporate ? (
                   <div className="flex items-center gap-2 text-sm text-brand-700 font-medium">
                      <Star className="w-4 h-4 text-brand-500" /> Pazar Analizi & Mail
                   </div>
                ) : (
                   <div className="flex items-center gap-2 text-sm text-slate-400">
                      <AlertCircle className="w-4 h-4" /> Pazar Analizi (Kilitli)
                   </div>
                )}
             </div>
          </div>
        </div>
      </div>

      {/* 2. SECTION: WHAT TO DO (DYNAMIC SCENARIO) */}
      
      {/* SCENARIO A: STARTER (2 CREDITS) */}
      {isStarterScenario && (
        <div className="space-y-4 animate-in slide-in-from-right-2 duration-500">
           <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-yellow-500" />
              {content.starterTitle.replace('{credits}', user.credits.toString())}
           </h3>
           <p className="text-slate-600 text-sm">
              {content.starterDesc}
           </p>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Strategy 1 */}
              <div className="bg-gradient-to-br from-blue-50 to-white p-5 rounded-xl border border-blue-100 hover:border-blue-300 transition-colors group">
                 <div className="bg-blue-100 w-10 h-10 rounded-full flex items-center justify-center text-blue-600 mb-3 group-hover:scale-110 transition-transform">
                    <Search className="w-5 h-5" />
                 </div>
                 <h4 className="font-bold text-slate-900 mb-2">{content.strategy1Title}</h4>
                 <p className="text-xs text-slate-600 leading-relaxed mb-3">
                    {content.strategy1Desc}
                 </p>
                 <div className="bg-white p-2 rounded text-[10px] text-slate-500 font-mono border border-blue-100">
                    Sonuç: %30 Vergi çıkarsa, ithalattan vazgeçerek paranızı kurtarırsınız.
                 </div>
              </div>

              {/* Strategy 2 */}
              <div className="bg-gradient-to-br from-green-50 to-white p-5 rounded-xl border border-green-100 hover:border-green-300 transition-colors group">
                 <div className="bg-green-100 w-10 h-10 rounded-full flex items-center justify-center text-green-600 mb-3 group-hover:scale-110 transition-transform">
                    <FileText className="w-5 h-5" />
                 </div>
                 <h4 className="font-bold text-slate-900 mb-2">{content.strategy2Title}</h4>
                 <p className="text-xs text-slate-600 leading-relaxed mb-3">
                    {content.strategy2Desc}
                 </p>
                 <div className="bg-white p-2 rounded text-[10px] text-slate-500 font-mono border border-green-100">
                    Sonuç: Belge eksikliği yüzünden ürünün gümrükte imha edilmesini önlersiniz.
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* SCENARIO B: PRO USER */}
      {(isPro || isCorporate) && (
         <div className="space-y-4 animate-in slide-in-from-right-2 duration-500">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
               <Star className="w-5 h-5 text-brand-600" />
               {content.proTitle}
            </h3>
            <div className="grid grid-cols-1 gap-4">
               <div className="flex gap-4 bg-white p-4 rounded-xl border border-brand-100 shadow-sm">
                  <div className="bg-brand-50 p-3 rounded-lg h-fit">
                     <TrendingUp className="w-6 h-6 text-brand-600" />
                  </div>
                  <div>
                     <h4 className="font-bold text-slate-900">{content.proFeature1Title}</h4>
                     <p className="text-sm text-slate-600 mt-1">
                        {content.proFeature1Desc}
                     </p>
                  </div>
               </div>
               <div className="flex gap-4 bg-white p-4 rounded-xl border border-indigo-100 shadow-sm">
                  <div className="bg-indigo-50 p-3 rounded-lg h-fit">
                     <Mail className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div>
                     <h4 className="font-bold text-slate-900">{content.proFeature2Title}</h4>
                     <p className="text-sm text-slate-600 mt-1">
                        {content.proFeature2Desc}
                     </p>
                  </div>
               </div>
            </div>
         </div>
      )}

      {/* 3. SECTION: HOW TO START */}
      <div className="pt-6 border-t border-slate-100">
         <h3 className="text-lg font-bold text-slate-900 mb-4">Nasıl Başlanır?</h3>
         <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1 flex items-center gap-3 bg-white p-3 rounded-lg border border-slate-200">
               <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-sm">1</div>
               <div className="text-sm font-medium text-slate-700">Ürün görselini yükle</div>
            </div>
            <ArrowRight className="hidden md:block w-4 h-4 text-slate-400" />
            <div className="flex-1 flex items-center gap-3 bg-white p-3 rounded-lg border border-slate-200">
               <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-sm">2</div>
               <div className="text-sm font-medium text-slate-700">Yapay zeka analizi (10sn)</div>
            </div>
            <ArrowRight className="hidden md:block w-4 h-4 text-slate-400" />
            <div className="flex-1 flex items-center gap-3 bg-white p-3 rounded-lg border border-slate-200">
               <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-sm">3</div>
               <div className="text-sm font-medium text-slate-700">Sonuçları incele ve kaydet</div>
            </div>
         </div>
      </div>

    </div>
  );
};

export default GuideContent;