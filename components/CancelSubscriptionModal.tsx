import React, { useState } from 'react';
import { X, AlertTriangle, ShieldAlert, HeartCrack, Gift, CheckCircle2, ArrowRight, StopCircle, ArrowLeft } from 'lucide-react';
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

  // STEP 1: Kayıp Vurgusu (Loss Aversion)
  const Step1 = () => (
    <div className="space-y-6 animate-in slide-in-from-right duration-300">
      <div className="bg-red-50 p-4 rounded-xl border border-red-100 flex items-start gap-4">
        <div className="bg-white p-2 rounded-full shadow-sm">
           <ShieldAlert className="w-8 h-8 text-red-600" />
        </div>
        <div>
           <h3 className="font-bold text-red-900 text-lg">Güvenli Limandan Ayrılıyorsunuz!</h3>
           <p className="text-red-700 text-sm mt-1">
             Gümrük mevzuatı her gün değişiyor. Aboneliğinizi iptal ettiğinizde yapay zeka korumasını kaybedeceksiniz.
           </p>
        </div>
      </div>
      
      <div className="space-y-3">
        <h4 className="font-bold text-slate-800">Şunları kaybedeceksiniz:</h4>
        <ul className="space-y-2">
          <li className="flex items-center gap-2 text-slate-600">
             <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold text-xs">X</div>
             <span>Geçmiş {user.planId === '1' ? '50' : 'Sınırsız'} sorgu arşiviniz silinecek.</span>
          </li>
          <li className="flex items-center gap-2 text-slate-600">
             <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold text-xs">X</div>
             <span>Güncel vergi oranları bildirimleri duracak.</span>
          </li>
          <li className="flex items-center gap-2 text-slate-600">
             <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold text-xs">X</div>
             <span>Gemini 3.0 Pro'nun %99.9 doğruluk garantisi kalkacak.</span>
          </li>
        </ul>
      </div>

      <div className="flex flex-col gap-3 pt-4">
        <button 
          onClick={onClose} 
          className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold shadow-lg shadow-brand-500/20 transition-all flex items-center justify-center gap-2"
        >
          <CheckCircle2 className="w-5 h-5" />
          Aboneliğimi Koru ve Devam Et
        </button>
        <button 
          onClick={() => setStep(2)} 
          className="w-full py-3 bg-white border border-slate-200 text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-xl font-medium transition-all text-sm"
        >
          Riskleri Kabul Ediyorum, İlerle
        </button>
      </div>
    </div>
  );

  // STEP 2: Duygusal Bağ & Sorgulama (Feedback Loop)
  const Step2 = () => (
    <div className="space-y-6 text-center animate-in slide-in-from-right duration-300">
       <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <HeartCrack className="w-10 h-10 text-slate-400" />
       </div>
       <h3 className="text-xl font-bold text-slate-900">Sizi Üzdük Mü?</h3>
       <p className="text-slate-600">
         GümrükAI ekibi olarak işinizi kolaylaştırmak için çok çalışıyoruz. Sorun fiyatsa, konuşabiliriz. Sorun özelliklerse, geliştirebiliriz.
       </p>
       
       <div className="grid grid-cols-2 gap-3 text-left">
          <label className="p-3 border border-slate-200 rounded-lg hover:border-brand-500 cursor-pointer transition-colors">
             <input type="radio" name="reason" className="mr-2 accent-brand-600" />
             <span className="text-sm text-slate-700">Çok pahalı</span>
          </label>
          <label className="p-3 border border-slate-200 rounded-lg hover:border-brand-500 cursor-pointer transition-colors">
             <input type="radio" name="reason" className="mr-2 accent-brand-600" />
             <span className="text-sm text-slate-700">İhtiyacım kalmadı</span>
          </label>
          <label className="p-3 border border-slate-200 rounded-lg hover:border-brand-500 cursor-pointer transition-colors">
             <input type="radio" name="reason" className="mr-2 accent-brand-600" />
             <span className="text-sm text-slate-700">Karışık geldi</span>
          </label>
          <label className="p-3 border border-slate-200 rounded-lg hover:border-brand-500 cursor-pointer transition-colors">
             <input type="radio" name="reason" className="mr-2 accent-brand-600" />
             <span className="text-sm text-slate-700">Diğer</span>
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
          className="flex-1 py-3 bg-white border border-red-200 text-red-600 font-medium rounded-xl hover:bg-red-50 transition-colors"
        >
          Yine de İptal Et
        </button>
      </div>
    </div>
  );

  // STEP 3: İndirim Teklifi (The Offer)
  const Step3 = () => (
    <div className="space-y-6 text-center relative overflow-hidden animate-in slide-in-from-right duration-300">
       <div className="absolute inset-0 bg-gradient-to-br from-yellow-50 to-white -z-10"></div>
       <div className="bg-yellow-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
          <Gift className="w-10 h-10 text-yellow-600" />
       </div>
       
       <h3 className="text-2xl font-black text-slate-900">BEKLE! SANA ÖZEL TEKLİFİMİZ VAR</h3>
       <p className="text-slate-600">
         Seni kaybetmek istemiyoruz. Aboneliğine devam edersen önümüzdeki 3 ay boyunca geçerli:
       </p>

       <div className="bg-white border-2 border-yellow-400 border-dashed rounded-xl p-6 shadow-sm transform rotate-1 hover:rotate-0 transition-transform duration-300">
          <div className="text-lg font-medium text-slate-500 line-through">
             {user.planId === '1' ? '399 ₺' : '2.499 ₺'}
          </div>
          <div className="text-4xl font-black text-brand-600 mb-2">
             %50 İNDİRİM
          </div>
          <div className="text-sm text-slate-500 font-medium">
             Sadece <span className="text-slate-900 font-bold">{user.planId === '1' ? '199 ₺' : '1.249 ₺'} / ay</span> ödeyerek devam et.
          </div>
       </div>

       <div className="flex flex-col gap-3 pt-2">
        <button 
          onClick={onAcceptDiscount} 
          className="w-full py-4 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold shadow-lg shadow-brand-500/30 transition-all flex items-center justify-center gap-2 text-lg"
        >
          <Gift className="w-5 h-5" />
          Teklifi Kabul Et & %50 İndirimi Kap
        </button>
        <button 
          onClick={() => setStep(4)} 
          className="text-sm text-slate-400 hover:text-slate-600 underline decoration-slate-300 underline-offset-4"
        >
          İndirimi istemiyorum, iptal işlemine devam et
        </button>
      </div>
    </div>
  );

  // STEP 4: Final Onay (Final Confirmation)
  const Step4 = () => (
    <div className="space-y-6 text-center animate-in slide-in-from-right duration-300">
       <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-100">
          <StopCircle className="w-10 h-10 text-red-600" />
       </div>
       <h3 className="text-xl font-bold text-slate-900">Son Kararınız Mı?</h3>
       <p className="text-slate-600 text-sm">
         İşlemi onayladığınızda hesabınız <strong>anında</strong> Ücretsiz Plana düşürülecek ve mevcut haklarınız silinecektir. Bu işlem geri alınamaz.
       </p>
       
       <div className="bg-slate-50 p-4 rounded-lg text-left text-xs text-slate-500 border border-slate-200">
          Lütfen "İPTAL ET" yazarak onaylayın: (Simülasyon için gerek yok, butona basın)
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
          className="flex-1 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 shadow-lg shadow-red-600/20 transition-colors"
        >
          Aboneliği İptal Et
        </button>
      </div>
      
      <button 
        onClick={() => setStep(3)}
        className="mt-4 text-sm text-brand-600 font-medium hover:text-brand-700 flex items-center justify-center gap-1 mx-auto hover:underline"
      >
        <ArrowLeft className="w-4 h-4" />
        Fikrimi değiştirdim, %50 indirimi kullanmak istiyorum
      </button>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-slate-900/90 backdrop-blur-sm" 
        onClick={step === 1 ? onClose : undefined} 
      />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in duration-300">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
           <div className="flex items-center gap-3">
              {/* Back Button - Only visible after step 1 */}
              {step > 1 ? (
                <button 
                  onClick={handleBack}
                  className="p-1 rounded-full hover:bg-slate-200 text-slate-500 transition-colors"
                  title="Geri Dön"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
              ) : (
                <div className="w-7 h-7"></div> // Spacer to keep layout balanced
              )}

              {/* Progress Dots */}
              <div className="flex gap-1">
                  <div className={`h-2 rounded-full transition-all duration-500 ${step >= 1 ? 'w-8 bg-red-500' : 'w-2 bg-slate-200'}`}></div>
                  <div className={`h-2 rounded-full transition-all duration-500 ${step >= 2 ? 'w-8 bg-red-500' : 'w-2 bg-slate-200'}`}></div>
                  <div className={`h-2 rounded-full transition-all duration-500 ${step >= 3 ? 'w-8 bg-red-500' : 'w-2 bg-slate-200'}`}></div>
                  <div className={`h-2 rounded-full transition-all duration-500 ${step >= 4 ? 'w-8 bg-red-500' : 'w-2 bg-slate-200'}`}></div>
              </div>
           </div>
           
           <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
           </button>
        </div>
        
        <div className="p-6">
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