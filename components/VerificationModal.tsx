
import React, { useState } from 'react';
import { X, Mail, Smartphone, CheckCircle2, Gift, Loader2, AlertCircle, ExternalLink } from 'lucide-react';
import { User } from '../types';
import { supabase } from '../services/supabaseClient';

interface VerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onUpdateUser: (updatedUser: User) => void;
}

const VerificationModal: React.FC<VerificationModalProps> = ({ isOpen, onClose, user, onUpdateUser }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  if (!isOpen) return null;

  const handleResendEmail = async () => {
    setIsLoading(true);
    setMsg(null);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: user.email,
        options: { emailRedirectTo: window.location.origin }
      });
      if (error) throw error;
      setMsg({ type: 'success', text: "Doğrulama bağlantısı tekrar gönderildi. Lütfen gelen kutunuzu (ve spam klasörünü) kontrol edin." });
    } catch (e: any) {
      setMsg({ type: 'error', text: e.message || "Bir hata oluştu." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in duration-300">
        <div className="bg-slate-900 p-6 text-white flex justify-between items-center">
            <h2 className="text-xl font-bold flex items-center gap-2">
                <Gift className="w-6 h-6 text-yellow-300" />
                Hesap Doğrulama
            </h2>
            <button onClick={onClose} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-8 text-center">
            <div className="w-20 h-20 bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Mail className="w-10 h-10 text-brand-600" />
            </div>
            
            <h3 className="text-lg font-bold text-slate-900 mb-2">E-Posta Adresini Doğrula</h3>
            <p className="text-slate-500 text-sm mb-6">
                Güvenliğiniz için <strong>{user.email}</strong> adresine gönderilen bağlantıya tıklamanız gerekmektedir. Doğrulama sonrası +1 analiz hakkı kazanırsınız.
            </p>

            {msg && (
                <div className={`p-4 rounded-xl mb-6 text-sm flex items-start gap-2 text-left ${msg.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                    {msg.type === 'success' ? <CheckCircle2 className="w-5 h-5 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 flex-shrink-0" />}
                    <span>{msg.text}</span>
                </div>
            )}

            <div className="space-y-3">
                <button 
                    onClick={handleResendEmail} 
                    disabled={isLoading}
                    className="w-full py-3 bg-brand-600 text-white rounded-xl font-bold hover:bg-brand-700 transition-colors flex items-center justify-center gap-2"
                >
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Bağlantıyı Tekrar Gönder"}
                </button>
                <button 
                    onClick={onClose}
                    className="w-full py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-colors"
                >
                    Kapat
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default VerificationModal;
