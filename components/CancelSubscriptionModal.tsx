
import React, { useState } from 'react';
import { X, AlertTriangle, ShieldAlert, HeartCrack, Gift, CheckCircle2, ArrowRight, StopCircle, ArrowLeft, Trash2, FileWarning } from 'lucide-react';
import { User } from '../types';

interface CancelSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmCancel: () => void;
  onAcceptDiscount: () => void;
  user: User;
}

const CancelSubscriptionModal: React.FC<CancelSubscriptionModalProps> = ({ 
  isOpen, 
  onClose, 
  onConfirmCancel, 
  onAcceptDiscount,
  user
}) => {
  const [step, setStep] = useState(1);

  if (!isOpen) return null;

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  // STEP 1: Kayıp Vurgusu (Loss Aversion) - Neleri Kaybediyor?
  const Step1 = () => (
    <div className="space-y-6 animate-in slide-in-from-right duration-300">
      <div className="text-center mb-6">
         <div className="bg-red-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-red-100">
            <ShieldAlert className="w-10 h-10 text-red-600" />
         </div>
         <h3 className="text-2xl font-bold text-slate-900">Aboneliği İptal Etmek Üzeresiniz</h3>
         <p className="text-slate-500 mt-2">
           GümrükAI hesabınızı ücretsiz plana düşürdüğünüzde, şu <strong>kritik avantajları</strong> anında kaybedeceksiniz:
         </p>
      </div>
      
      <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 space-y-4">
        <div className="flex items-start gap-3">
           <div className="bg-red-100 p-1.5 rounded text-red-600 mt-0.5">
              <Trash2 className="w-4 h-4" />
           </div>
           <div>
              <h4 className="font-bold text-slate-900 text-sm">Geçmiş Analiz Arşivi Silinir</h4>
              <p className="text-xs text-slate-500 mt-0.5">Yaptığınız tüm GTIP, Vergi ve Mevzuat sorgularının geçmiş kayıtlarına erişiminiz kapanır.</p>
           </div>
        </div>
        <div className="flex items-start gap-3">
           <div className="bg-red-100 p-1.5 rounded text-red-600 mt-0.5">
              <FileWarning className="w-4 h-4" />
           </div>
           <div>
              <h4 className="font-bold text-slate-900 text-sm">Güncel Mevzuat Koruması Biter</h4>
              <p className="text-xs text-slate-500 mt-0.5">Resmi Gazete'de yayınlanan yeni vergiler ve yasaklar hakkında yapay zeka uyarısı alamazsınız.</p>
           </div>
        </div>
        <div className="flex items-start gap-3">
           <div className="bg-red-100 p-1.5 rounded text-red-600 mt-0.5">
              <AlertTriangle className="w-4 h-4" />
           </div>
           <div>
              <h4 className="font-bold text-slate-900 text-sm">Sınırsız Sorgu Hakkı Kaybolur</h4>
              <p className="text-xs text-slate-500 mt-0.5">Aylık sınırsız kullanım hakkınız, ayda 0 krediye düşer. Her analiz için tekrar ödeme yapmanız gerekir.</p>
           </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 pt-4">
        <button 
          onClick={onClose} 
          className="w-full py-3.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold shadow-lg shadow-brand-500/20 transition-all flex items-center justify-center gap-2 transform active:scale-95"
        >
          <CheckCircle2 className="w-5 h-5" />
          Aboneliğimi Koru ve Devam Et
        </button>
        <button 
          onClick={() => setStep(2)} 
          className="w-full py-3 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl font-medium transition-colors text-sm"
        >
          Riskleri biliyorum, devam et
        </button>
      </div>
    </div>
  );

  // STEP 2: Neden Gidiyorsun? (Feedback)
  const Step2 = () => (
    <div className="space-y-6 text-center animate-in slide-in-from-right duration-300">
       <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <HeartCrack className="w-8 h-8 text-slate-400" />
       </div>
       <h3 className="text-xl font-bold text-slate-900">Sizi Üzdük Mü?</h3>
       <p className="text-slate-600 text-sm max-w-xs mx-auto">
         Ayrılma nedeninizi bilirsek, kendimizi geliştirebiliriz. Lütfen dürüst olun.
       </p>
       
       <div className="grid grid-cols-1 gap-3 text-left">
          <label className="flex items-center p-3 border border-slate-200 rounded-xl hover:border-brand-500 hover:bg-brand-50 cursor-pointer transition-all group">
             <input type="radio" name="reason" className="mr-3 w-4 h-4 accent-brand-600" />
             <span className="text-sm font-medium text-slate-700 group-hover:text-brand-700">Fiyat çok yüksek</span>
          </label>
          <label className="flex items-center p-3 border border-slate-200 rounded-xl hover:border-brand-500 hover:bg-brand-50 cursor-pointer transition-all group">
             <input type="radio" name="reason" className="mr-3 w-4 h-4 accent-brand-600" />
             <span className="text-sm font-medium text-slate-700 group-hover:text-brand-700">Artık ihtiyacım kalmadı</span>
          </label>
          <label className="flex items-center p-3 border border-slate-200 rounded-xl hover:border-brand-500 hover:bg-brand-50 cursor-pointer transition-all group">
             <input type="radio" name="reason" className="mr-3 w-4 h-4 accent-brand-600" />
             <span className="text-sm font-medium text-slate-700 group-hover:text-brand-700">GTIP sonuçları yetersiz</span>
          </label>
          <label className="flex items-center p-3 border border-slate-200 rounded-xl hover:border-brand-500 hover:bg-brand-50 cursor-pointer transition-all group">
             <input type="radio" name="reason" className="mr-3 w-4 h-4 accent-brand-600" />
             <span className="text-sm font-medium text-slate-700 group-hover:text-brand-700">Diğer</span>
          </label>
       </div>

       <div className="flex gap-3 pt-4">
        <button 
          onClick={onClose} 
          className="flex-1 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors"
        >
          Vazgeç
        </button>
        <button 
          onClick={() => setStep(3)} 
          className="flex-1 py-3 bg-white border-2 border-slate-100 text-slate-400 font-medium rounded-xl hover:border-red-200 hover:text-red-600 transition-all"
        >
          İlerle
        </button>
      </div>
    </div>
  );

  // STEP 3: Karşı Teklif (The Offer - 50% OFF)
  const Step3 = () => (
    <div className="space-y-6 text-center relative overflow-hidden animate-in slide-in-from-right duration-300">
       <div className="absolute inset-0 bg-gradient-to-b from-yellow-50/50 to-white -z-10"></div>
       <div className="bg-yellow-400 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-yellow-400/40 animate-pulse">
          <Gift className="w-12 h-12 text-white" />
       </div>
       
       <h3 className="text-2xl font-black text-slate-900 leading-tight">
         SON BİR ŞANS!<br/>
         <span className="text-brand-600">SİZE ÖZEL %50 İNDİRİM</span>
       </h3>
       <p className="text-slate-600 text-sm px-4">
         Aboneliğinizi iptal etmek yerine, önümüzdeki <strong>3 ay boyunca yarı fiyatına</strong> kullanmaya devam edin.
       </p>

       <div className="relative mx-4 mt-6 mb-8 transform hover:scale-105 transition-transform duration-300">
          <div className="absolute inset-0 bg-slate-900 rounded-2xl rotate-3 opacity-10"></div>
          <div className="relative bg-white border-2 border-brand-500 border-dashed rounded-2xl p-6 shadow-xl">
              <div className="flex justify-between items-end mb-2">
                 <div className="text-left">
                    <div className="text-xs text-slate-400 uppercase font-bold">Eski Fiyat</div>
                    <div className="text-lg font-medium text-slate-400 line-through decoration-red-500 decoration-2">
                        {user.planId === '1' ? '399 ₺' : '2.499 ₺'}
                    </div>
                 </div>
                 <div className="text-right">
                    <div className="text-xs text-brand-600 uppercase font-bold bg-brand-50 px-2 py-1 rounded">Yeni Fiyat</div>
                    <div className="text-3xl font-black text-slate-900">
                        {user.planId === '1' ? '199 ₺' : '1.249 ₺'}
                    </div>
                 </div>
              </div>
              <div className="w-full h-px bg-slate-100 my-3"></div>
              <div className="flex items-center justify-center gap-2 text-xs font-bold text-green-600">
                 <CheckCircle2 className="w-4 h-4" />
                 Tüm Pro Özellikler Dahil
              </div>
          </div>
       </div>

       <div className="flex flex-col gap-3 pt-2">
        <button 
          onClick={onAcceptDiscount} 
          className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold shadow-xl shadow-slate-900/20 transition-all flex items-center justify-center gap-2 text-lg transform active:scale-95"
        >
          <Gift className="w-5 h-5 text-yellow-400" />
          %50 İndirimi Kabul Et
        </button>
        <button 
          onClick={() => setStep(4)} 
          className="text-sm text-slate-400 hover:text-slate-600 underline decoration-slate-300 underline-offset-4 py-2"
        >
          Hayır, indirimi istemiyorum ve iptal edeceğim
        </button>
      </div>
    </div>
  );

  // STEP 4: Final Onay (Kesin Ayrılış)
  const Step4 = () => (
    <div className="space-y-6 text-center animate-in slide-in-from-right duration-300">
       <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-red-100">
          <StopCircle className="w-10 h-10 text-red-600" />
       </div>
       <h3 className="text-2xl font-bold text-slate-900">Son Kararınız Mı?</h3>
       <p className="text-slate-600 text-sm px-4">
         İşlemi onayladığınızda hesabınız <strong>anında</strong> "Ücretsiz Plan"a düşürülecek ve mevcut tüm kredileriniz/arşiviniz kalıcı olarak silinecektir.
       </p>
       
       <div className="bg-red-50 p-4 rounded-xl text-left border border-red-100 flex gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <p className="text-xs text-red-800 font-medium">
             Bu işlem geri alınamaz. İndirim hakkınızı da kaybedeceksiniz.
          </p>
       </div>

       <div className="flex gap-3 pt-4">
        <button 
          onClick={onClose} 
          className="flex-1 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors"
        >
          Vazgeç
        </button>
        <button 
          onClick={onConfirmCancel} 
          className="flex-1 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 shadow-lg shadow-red-600/20 transition-all transform active:scale-95"
        >
          Aboneliği İptal Et
        </button>
      </div>
      
      <button 
        onClick={() => setStep(3)}
        className="mt-6 text-sm text-brand-600 font-bold hover:text-brand-700 flex items-center justify-center gap-1 mx-auto hover:underline"
      >
        <ArrowLeft className="w-4 h-4" />
        Dur! %50 İndirimi Kullanmak İstiyorum
      </button>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-slate-900/90 backdrop-blur-md" 
        onClick={step === 1 ? onClose : undefined} 
      />

      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in duration-300">
        {/* Progress Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
           <div className="flex items-center gap-3">
              {step > 1 && (
                <button 
                  onClick={handleBack}
                  className="p-1.5 rounded-full hover:bg-slate-200 text-slate-500 transition-colors"
                  title="Geri Dön"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
              )}
              {step === 1 && <div className="w-7"></div>}

              {/* Progress Bar */}
              <div className="flex gap-1.5">
                  <div className={`h-1.5 rounded-full transition-all duration-500 ${step >= 1 ? 'w-6 bg-red-500' : 'w-2 bg-slate-200'}`}></div>
                  <div className={`h-1.5 rounded-full transition-all duration-500 ${step >= 2 ? 'w-6 bg-red-500' : 'w-2 bg-slate-200'}`}></div>
                  <div className={`h-1.5 rounded-full transition-all duration-500 ${step >= 3 ? 'w-6 bg-red-500' : 'w-2 bg-slate-200'}`}></div>
                  <div className={`h-1.5 rounded-full transition-all duration-500 ${step >= 4 ? 'w-6 bg-red-500' : 'w-2 bg-slate-200'}`}></div>
              </div>
           </div>
           
           <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors">
              <X className="w-5 h-5" />
           </button>
        </div>
        
        <div className="p-6 md:p-8">
           {step === 1 && <Step1 />}
           {step === 2 && <Step2 />}
           {step === 3 && <Step3 />}
           {step === 4 && <Step4 />}
        </div>
      </div>
    </div>
  );
};

export default CancelSubscriptionModal;
