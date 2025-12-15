
import React, { useState } from 'react';
import { X, Lock, Mail, Loader2, ArrowRight, Info, Copy, User as UserIcon, Check, ShieldCheck } from 'lucide-react';
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
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setIsLoading(true);

    const cleanEmail = email.trim();
    const cleanPass = password.trim();
    const cleanName = name.trim();

    // Zaman aşımı koruması: 10 saniye içinde yanıt gelmezse durdur.
    const timeoutId = setTimeout(() => {
        if (isLoading) {
            setIsLoading(false);
            setError("Sunucu yanıt vermiyor veya işlem zaman aşımına uğradı. Lütfen tekrar deneyin.");
        }
    }, 10000);

    try {
      if (isRegister) {
        if (!cleanName || !cleanEmail || !cleanPass) throw new Error("Lütfen tüm alanları doldurun.");
        
        const user = await storageService.registerUser(cleanName, cleanEmail, cleanPass);
        clearTimeout(timeoutId);
        setSuccessMsg("Kayıt başarılı! Giriş yapılıyor...");
        
        setTimeout(() => {
           onLogin(user);
           onClose();
        }, 1000);

      } else {
        const user = await storageService.loginUser(cleanEmail, cleanPass, rememberMe);
        clearTimeout(timeoutId);
        onLogin(user);
        onClose();
      }
    } catch (err: any) {
      clearTimeout(timeoutId);
      setError(err.message || "İşlem sırasında bir hata oluştu.");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsRegister(!isRegister);
    setError(null);
    setSuccessMsg(null);
  };

  const fillDemoCredentials = (type: 'admin' | 'demo') => {
      if (type === 'admin') {
          setEmail('admin@admin.com');
          setPassword('admin');
      } else {
          setEmail('demo@gumrukai.com');
          setPassword('demo');
      }
  };

  return (
    <div className="fixed inset-0 z-[140] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col md:flex-row animate-in fade-in zoom-in duration-300 max-h-[90vh]">
        
        <div className="flex-1 flex flex-col">
          <div className="bg-slate-50 px-8 py-6 border-b border-slate-100 flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">
                {isRegister ? "Kayıt Ol" : "Giriş Yap"}
              </h2>
              <p className="text-sm text-slate-500">
                {isRegister ? "Hemen hesap oluşturun." : "Hesabınıza erişin."}
              </p>
            </div>
            <button 
              onClick={onClose}
              className="md:hidden p-2 bg-white rounded-full text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-5 flex-1 overflow-y-auto">
            {error && (
              <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 flex items-center gap-2 animate-in slide-in-from-top-2">
                <span className="font-medium">Hata:</span> {error}
              </div>
            )}
            {successMsg && (
              <div className="p-3 bg-green-50 text-green-600 text-sm rounded-lg border border-green-100 flex items-center gap-2 animate-in slide-in-from-top-2">
                 <Loader2 className="w-4 h-4 animate-spin" /> {successMsg}
              </div>
            )}

            {isRegister && (
              <div className="space-y-2 animate-in slide-in-from-top-2">
                <label className="text-sm font-medium text-slate-700 block">Ad Soyad</label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Adınız Soyadınız"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                    required={isRegister}
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 block">E-Posta Adresi</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ornek@test.com"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 block">Şifre</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                  required
                />
              </div>
            </div>

            {!isRegister && (
              <div className="flex items-center gap-2">
                <div className="relative flex items-center">
                  <input
                    type="checkbox"
                    id="rememberMe"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="peer h-4 w-4 cursor-pointer appearance-none rounded border border-slate-300 shadow-sm transition-all checked:border-brand-600 checked:bg-brand-600 hover:border-brand-400 focus:ring-2 focus:ring-brand-500 focus:ring-offset-1"
                  />
                  <Check className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100 w-3 h-3" />
                </div>
                <label htmlFor="rememberMe" className="text-sm text-slate-600 cursor-pointer select-none">
                  Oturumumu açık tut
                </label>
              </div>
            )}

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white py-3.5 rounded-xl font-semibold shadow-lg shadow-slate-900/20 transition-all flex items-center justify-center gap-2 mt-4"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  İşlem Yapılıyor...
                </>
              ) : (
                <>
                  {isRegister ? "Kayıt Ol" : "Giriş Yap"}
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>

            <div className="text-center pt-2">
               <p className="text-slate-500 text-sm">
                 {isRegister ? "Zaten hesabınız var mı?" : "Hesabınız yok mu?"}
                 <button 
                   type="button"
                   onClick={toggleMode}
                   className="ml-2 font-bold text-brand-600 hover:text-brand-800 hover:underline transition-colors"
                 >
                   {isRegister ? "Giriş Yapın" : "Hemen Kayıt Olun"}
                 </button>
               </p>
            </div>
          </form>
        </div>

        {/* Info Side */}
        <div className="bg-brand-50 w-full md:w-80 border-l border-brand-100 p-6 flex flex-col justify-center">
            
            <div className="mb-6 p-4 bg-white/60 rounded-xl border border-brand-100 shadow-sm">
                <div className="flex items-center gap-2 text-brand-800 font-bold mb-2 text-sm">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Demo Giriş Bilgileri</span>
                </div>
                <div className="space-y-3">
                    <button 
                        onClick={() => fillDemoCredentials('demo')}
                        className="w-full text-left p-2 hover:bg-white rounded transition-colors group"
                    >
                        <div className="text-xs text-brand-500 font-bold uppercase">Kullanıcı (User)</div>
                        <div className="text-xs text-slate-600 font-mono mt-0.5 group-hover:text-brand-700">demo@gumrukai.com</div>
                        <div className="text-xs text-slate-400 font-mono">pass: demo</div>
                    </button>
                    <div className="h-px bg-brand-100"></div>
                    <button 
                        onClick={() => fillDemoCredentials('admin')}
                        className="w-full text-left p-2 hover:bg-white rounded transition-colors group"
                    >
                        <div className="text-xs text-indigo-500 font-bold uppercase">Yönetici (Admin)</div>
                        <div className="text-xs text-slate-600 font-mono mt-0.5 group-hover:text-indigo-700">admin@admin.com</div>
                        <div className="text-xs text-slate-400 font-mono">pass: admin</div>
                    </button>
                </div>
                <p className="text-[10px] text-slate-400 mt-3 text-center">
                   Test için yukarıdaki hesaplara tıklayarak bilgileri otomatik doldurabilirsiniz.
                </p>
            </div>

            <div className="flex items-center gap-2 text-brand-800 font-bold mb-2 text-sm">
              <Info className="w-4 h-4" />
              <span>Veri Güvenliği</span>
            </div>
            <p className="text-xs text-brand-600 mb-6">
              Bu uygulama Supabase veritabanına bağlı çalışmaktadır. Verileriniz şifrelenerek saklanır.
            </p>
            <button onClick={onClose} className="hidden md:flex absolute top-4 right-4 p-2 bg-white/50 rounded-full text-brand-700 hover:bg-white">
              <X className="w-5 h-5" />
            </button>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
