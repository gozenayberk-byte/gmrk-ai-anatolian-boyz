
import React, { useState } from 'react';
import { X, Lock, CreditCard, Calendar, ShieldCheck, Loader2, AlertCircle, Percent } from 'lucide-react';
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

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    // Iyzico Integration Note: 
    // Client-side direct payment is not secure. 
    // This part should normally call your backend endpoint that uses Iyzico SDK.
    // For now, we simulate the backend response but structure it to be ready for the VITE_IYZICO_API_KEY.
    
    try {
        console.log("Initiating payment via Iyzico with API Key:", process.env.VITE_IYZICO_API_KEY);
        
        // Simulating backend processing
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        if (cardNumber.length >= 15) {
            onPaymentSuccess();
        } else {
            throw new Error("Geçersiz kart bilgisi.");
        }
    } catch (err: any) {
        setError(err.message);
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in duration-300">
        <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
            <h3 className="font-bold text-slate-800">Güvenli Ödeme</h3>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
        </div>

        <form onSubmit={handlePayment} className="p-8 space-y-4">
            <div className="bg-brand-50 p-4 rounded-xl border border-brand-100 flex justify-between items-center mb-4">
                <div>
                    <div className="text-xs text-brand-600 font-bold uppercase">Ödenecek Tutar</div>
                    <div className="text-2xl font-black text-brand-900">{plan.price}</div>
                </div>
                <div className="text-right">
                    <div className="text-xs text-slate-500 font-medium">{plan.name}</div>
                    <div className="text-[10px] text-slate-400">{plan.period}</div>
                </div>
            </div>

            {error && <div className="text-xs text-red-600 bg-red-50 p-2 rounded border border-red-100">{error}</div>}

            <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Kart Üzerindeki İsim</label>
                <input type="text" value={cardName} onChange={(e) => setCardName(e.target.value.toUpperCase())} className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-brand-500" required />
            </div>

            <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Kart Numarası</label>
                <div className="relative">
                    <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type="text" value={cardNumber} onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').slice(0, 16))} className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-brand-500 font-mono" placeholder="0000 0000 0000 0000" required />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">Son Kullanma</label>
                    <input type="text" value={expiry} onChange={(e) => setExpiry(e.target.value)} placeholder="AA/YY" className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-brand-500" required />
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">CVC</label>
                    <input type="text" value={cvc} onChange={(e) => setCvc(e.target.value.replace(/\D/g, '').slice(0, 3))} placeholder="***" className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-brand-500" required />
                </div>
            </div>

            <button type="submit" disabled={isLoading} className="w-full bg-brand-600 hover:bg-brand-700 text-white py-3 rounded-xl font-bold shadow-lg shadow-brand-500/20 flex items-center justify-center gap-2">
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><ShieldCheck className="w-5 h-5" /> Ödemeyi Tamamla</>}
            </button>

            <div className="text-center">
                <p className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
                    <Lock className="w-3 h-3" />
                    256-Bit SSL iyzico güvencesiyle korunmaktadır.
                </p>
            </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentModal;
