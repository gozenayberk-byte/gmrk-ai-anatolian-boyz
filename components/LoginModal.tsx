
import React, { useState, useRef, useEffect } from 'react';
import { X, Lock, Mail, Loader2, ArrowRight, Info, User as UserIcon, Check, ShieldCheck, AlertCircle } from 'lucide-react';
import { User } from '../types';
import { storageService } from '../services/storageService';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (user: User) => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLogin }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (isRegister) {
        const user = await storageService.registerUser(name, email, password);
        onLogin(user);
      } else {
        const user = await storageService.loginUser(email, password);
        onLogin(user);
      }
      onClose();
    } catch (err: any) {
      setError(err.message || "İşlem sırasında bir hata oluştu.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[140] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="bg-slate-50 px-8 py-6 border-b border-slate-100">
          <h2 className="text-2xl font-bold text-slate-800">{isRegister ? "Kayıt Ol" : "Giriş Yap"}</h2>
          <p className="text-sm text-slate-500">{isRegister ? "GümrükAI dünyasına katılın." : "Hesabınıza erişin."}</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" /> 
              <span>{error}</span>
            </div>
          )}

          {isRegister && (
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Ad Soyad</label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none" required />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase">E-Posta</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none" required />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase">Şifre</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none" required />
            </div>
          </div>

          <button type="submit" disabled={isLoading} className="w-full bg-slate-900 hover:bg-slate-800 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2">
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : isRegister ? "Kaydı Tamamla" : "Giriş Yap"}
          </button>

          <div className="text-center pt-2">
             <button type="button" onClick={() => setIsRegister(!isRegister)} className="text-sm font-bold text-brand-600">
               {isRegister ? "Zaten hesabım var" : "Henüz hesabım yok"}
             </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginModal;
