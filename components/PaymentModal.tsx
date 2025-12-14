
import React, { useState } from 'react';
import { X, Lock, CreditCard, Calendar, ShieldCheck, Loader2, AlertCircle } from 'lucide-react';
import { SubscriptionPlan } from '../types';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: SubscriptionPlan | null;
  onPaymentSuccess: () => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, plan, onPaymentSuccess }) => {
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !plan) return null;

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    // Gerçek bir backend olmadığı için simülasyon yapıyoruz.
    // Production'da burası Iyzico API'sine gider.
    setTimeout(() => {
      // Basit doğrulama simülasyonu
      if (cardNumber.length >= 15 && cvc.length >= 3) {
        setIsLoading(false);
        onPaymentSuccess();
      } else {
        setIsLoading(false);
        setError("Lütfen geçerli kart bilgileri giriniz.");
      }
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" 
        onClick={onClose}
      />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col md:flex-row animate-in zoom-in duration-300">
        
        {/* Left Side: Summary */}
        <div className="w-full md:w-80 bg-slate-50 border-r border-slate-200 p-6 flex flex-col">
          <div className="mb-6">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Seçilen Paket</h3>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <h4 className="font-bold text-slate-900 text-lg">{plan.name}</h4>
              <div className="text-brand-600 font-bold text-xl mt-1">{plan.price}</div>
              <div className="text-xs text-slate-500 mt-1">{plan.period}</div>
            </div>
          </div>

          <div className="mt-auto bg-blue-50 border border-blue-100 rounded-xl p-4">
            <div className="flex items-center gap-2 text-blue-800 font-bold text-sm mb-2">
              <ShieldCheck className="w-4 h-4" />
              <span>Güvenli Ödeme</span>
            </div>
            <p className="text-xs text-blue-600 mb-3">
              Ödemeniz 256-bit SSL şifreleme ile korunmaktadır. Kredi kartı bilgileriniz sistemlerimizde saklanmaz.
            </p>
          </div>
        </div>

        {/* Right Side: Payment Form */}
        <div className="flex-1 p-8">
           <div className="flex justify-between items-center mb-6">
             <h2 className="text-2xl font-bold text-slate-900">Ödeme Bilgileri</h2>
             <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600">
               <X className="w-5 h-5" />
             </button>
           </div>

           {error && (
            <div className="mb-6 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 flex items-center gap-2 animate-in slide-in-from-top-2">
              <AlertCircle className="w-4 h-4" /> {error}
            </div>
           )}

           <form onSubmit={handlePayment} className="space-y-5">
             {/* Card Visualization */}
             <div className="mb-6 bg-gradient-to-r from-slate-800 to-slate-900 rounded-xl p-6 text-white shadow-lg relative overflow-hidden h-48 flex flex-col justify-between hidden md:flex">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-10 -mt-10 blur-xl"></div>
                <div className="flex justify-between items-start">
                  <div className="w-12 h-8 bg-amber-400 rounded-md opacity-80"></div>
                  <span className="text-xs font-mono opacity-50">CREDIT CARD</span>
                </div>
                <div>
                   <div className="font-mono text-xl tracking-widest mb-4">
                     {cardNumber || '•••• •••• •••• ••••'}
                   </div>
                   <div className="flex justify-between items-end">
                     <div>
                       <div className="text-[10px] opacity-60 uppercase mb-1">Card Holder</div>
                       <div className="font-medium tracking-wide uppercase text-sm">{cardName || 'AD SOYAD'}</div>
                     </div>
                     <div>
                       <div className="text-[10px] opacity-60 uppercase mb-1">Expires</div>
                       <div className="font-medium tracking-wide text-sm">{expiry || 'MM/YY'}</div>
                     </div>
                   </div>
                </div>
             </div>

             <div>
               <label className="text-sm font-medium text-slate-700 block mb-1.5">Kart Sahibi</label>
               <input 
                 type="text" 
                 placeholder="Kart üzerindeki isim"
                 className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none transition-all uppercase"
                 value={cardName}
                 onChange={(e) => setCardName(e.target.value)}
                 required
               />
             </div>

             <div>
               <label className="text-sm font-medium text-slate-700 block mb-1.5">Kart Numarası</label>
               <div className="relative">
                 <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                 <input 
                    type="text" 
                    placeholder="0000 0000 0000 0000"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none transition-all font-mono"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                    maxLength={19}
                    required
                 />
               </div>
             </div>

             <div className="grid grid-cols-2 gap-4">
               <div>
                 <label className="text-sm font-medium text-slate-700 block mb-1.5">Son Kullanma (AA/YY)</label>
                 <div className="relative">
                   <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                   <input 
                      type="text" 
                      placeholder="MM/YY"
                      className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none transition-all"
                      value={expiry}
                      onChange={(e) => {
                         let val = e.target.value.replace(/\D/g, '');
                         if (val.length >= 2) val = val.slice(0,2) + '/' + val.slice(2,4);
                         setExpiry(val);
                      }}
                      maxLength={5}
                      required
                   />
                 </div>
               </div>
               <div>
                 <label className="text-sm font-medium text-slate-700 block mb-1.5">CVC / CVV</label>
                 <div className="relative">
                   <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                   <input 
                      type="text" 
                      placeholder="***"
                      className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none transition-all"
                      value={cvc}
                      onChange={(e) => setCvc(e.target.value.replace(/\D/g, '').slice(0, 3))}
                      maxLength={3}
                      required
                   />
                 </div>
               </div>
             </div>

             <button 
               type="submit"
               disabled={isLoading}
               className="w-full bg-brand-600 hover:bg-brand-700 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-brand-500/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2 mt-4"
             >
               {isLoading ? (
                 <>
                   <Loader2 className="w-5 h-5 animate-spin" />
                   Ödeme İşleniyor...
                 </>
               ) : (
                 <>
                   <ShieldCheck className="w-5 h-5" />
                   {plan.price} ile Güvenli Öde
                 </>
               )}
             </button>
             
             <div className="text-center">
                <p className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
                  <Lock className="w-3 h-3" />
                  İşlem Iyzico güvencesiyle gerçekleşmektedir.
                </p>
             </div>
           </form>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
