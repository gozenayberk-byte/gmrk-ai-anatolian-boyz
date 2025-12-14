
import React, { useState } from 'react';
import { X, Mail, Smartphone, CheckCircle2, Gift, Loader2, AlertCircle } from 'lucide-react';
import { User } from '../types';
import { storageService } from '../services/storageService';

interface VerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onUpdateUser: (updatedUser: User) => void;
}

const VerificationModal: React.FC<VerificationModalProps> = ({ isOpen, onClose, user, onUpdateUser }) => {
  const [activeTab, setActiveTab] = useState<'email' | 'phone'>(user.isEmailVerified ? 'phone' : 'email');
  const [code, setCode] = useState('');
  const [phoneNumber, setPhoneNumber] = useState(user.phoneNumber || '');
  const [isLoading, setIsLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [codeSent, setCodeSent] = useState(false);

  if (!isOpen) return null;

  const handleSendCode = () => {
    setMsg(null);
    setIsLoading(true);

    if (activeTab === 'phone' && phoneNumber.length < 10) {
        setIsLoading(false);
        setMsg({ type: 'error', text: 'Lütfen geçerli bir telefon numarası girin.' });
        return;
    }

    // Backend Simulation - SMS/Email gönderme
    setTimeout(() => {
        const identifier = activeTab === 'email' ? user.email : phoneNumber;
        const generatedCode = storageService.generateVerificationCode(activeTab, identifier);
        
        setIsLoading(false);
        setCodeSent(true);
        
        // Production simülasyonu: Gerçekte SMS/Email gider.
        // Kullanıcıya kolaylık olsun diye burada alert ile gösteriyoruz (Backend olmadığı için)
        alert(`GümrükAI Doğrulama Kodunuz: ${generatedCode}`);
        setMsg({ type: 'success', text: `Doğrulama kodu ${activeTab === 'email' ? 'e-posta adresinize' : 'telefonunuza'} gönderildi.` });
    }, 1500);
  };

  const handleVerify = async () => {
    setMsg(null);
    setIsLoading(true);

    try {
        const result = await storageService.verifyUserContact(
            user.email, 
            activeTab, 
            code, 
            activeTab === 'phone' ? phoneNumber : undefined
        );

        setIsLoading(false);

        if (result.success && result.user) {
            onUpdateUser(result.user);
            setMsg({ type: 'success', text: result.message });
            setCode('');
            setCodeSent(false);
            
            // Eğer e-posta doğrulandıysa ve telefon doğrulanmamışsa telefona geç
            if (activeTab === 'email' && !result.user.isPhoneVerified) {
                setTimeout(() => {
                    setActiveTab('phone');
                    setMsg(null);
                }, 2000);
            }
        } else {
            setMsg({ type: 'error', text: result.message });
        }
    } catch (e) {
        setIsLoading(false);
        setMsg({ type: 'error', text: 'Bir hata oluştu.' });
    }
  };

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in duration-300">
        <div className="bg-gradient-to-r from-brand-600 to-brand-800 p-6 text-white flex justify-between items-start">
            <div>
                <h2 className="text-xl font-bold flex items-center gap-2">
                    <Gift className="w-6 h-6 text-yellow-300" />
                    Doğrula & Kazan
                </h2>
                <p className="text-brand-100 text-sm mt-1">
                    Hesabını doğrula, toplamda 2 ücretsiz analiz hakkı kazan!
                </p>
            </div>
            <button onClick={onClose} className="text-brand-200 hover:text-white">
                <X className="w-5 h-5" />
            </button>
        </div>

        <div className="p-6">
            {/* Tabs */}
            <div className="flex bg-slate-100 p-1 rounded-xl mb-6">
                <button 
                    onClick={() => setActiveTab('email')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'email' ? 'bg-white shadow-sm text-brand-600' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    <Mail className="w-4 h-4" />
                    {user.isEmailVerified && <CheckCircle2 className="w-3 h-3 text-green-500" />}
                    E-Posta
                </button>
                <button 
                    onClick={() => setActiveTab('phone')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'phone' ? 'bg-white shadow-sm text-brand-600' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    <Smartphone className="w-4 h-4" />
                    {user.isPhoneVerified && <CheckCircle2 className="w-3 h-3 text-green-500" />}
                    Telefon
                </button>
            </div>

            {/* Content */}
            <div className="min-h-[200px]">
                {msg && (
                    <div className={`p-3 rounded-lg mb-4 text-sm flex items-center gap-2 ${msg.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                        {msg.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                        {msg.text}
                    </div>
                )}

                {/* EMAIL VERIFICATION */}
                {activeTab === 'email' && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                        {user.isEmailVerified ? (
                             <div className="text-center py-8">
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <CheckCircle2 className="w-8 h-8 text-green-600" />
                                </div>
                                <h3 className="font-bold text-slate-900">E-Posta Doğrulandı!</h3>
                                <p className="text-slate-500 text-sm">1 Kredi hesabınıza eklendi.</p>
                             </div>
                        ) : (
                            <>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase">E-Posta Adresi</label>
                                    <div className="text-slate-900 font-medium bg-slate-50 p-3 rounded-lg border border-slate-200 mt-1 flex justify-between items-center">
                                        {user.email}
                                        <Mail className="w-4 h-4 text-slate-400" />
                                    </div>
                                </div>

                                {!codeSent ? (
                                    <button 
                                        onClick={handleSendCode} 
                                        disabled={isLoading}
                                        className="w-full py-3 bg-brand-600 text-white rounded-xl font-bold hover:bg-brand-700 transition-colors flex items-center justify-center gap-2"
                                    >
                                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Doğrulama Kodu Gönder"}
                                    </button>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="relative">
                                            <input 
                                                type="text" 
                                                value={code}
                                                onChange={(e) => setCode(e.target.value)}
                                                placeholder="6 Haneli Kod"
                                                className="w-full px-4 py-3 border border-brand-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none text-center text-lg tracking-widest font-mono"
                                                maxLength={6}
                                            />
                                        </div>
                                        <button 
                                            onClick={handleVerify}
                                            disabled={isLoading || code.length < 6}
                                            className="w-full py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                                        >
                                            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Kodu Onayla ve Kazan"}
                                        </button>
                                        <button onClick={() => { setCodeSent(false); }} className="w-full text-xs text-slate-500 hover:text-slate-800">
                                            Kodu tekrar gönder
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )}

                {/* PHONE VERIFICATION */}
                {activeTab === 'phone' && (
                     <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                        {user.isPhoneVerified ? (
                             <div className="text-center py-8">
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <CheckCircle2 className="w-8 h-8 text-green-600" />
                                </div>
                                <h3 className="font-bold text-slate-900">Telefon Doğrulandı!</h3>
                                <p className="text-slate-500 text-sm">1 Kredi hesabınıza eklendi.</p>
                             </div>
                        ) : (
                            <>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase">Telefon Numarası</label>
                                    <div className="relative mt-1">
                                        <input 
                                            type="tel"
                                            value={phoneNumber}
                                            onChange={(e) => setPhoneNumber(e.target.value)}
                                            placeholder="5XX XXX XX XX"
                                            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none"
                                            disabled={codeSent}
                                        />
                                        <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    </div>
                                </div>

                                {!codeSent ? (
                                    <button 
                                        onClick={handleSendCode} 
                                        disabled={isLoading}
                                        className="w-full py-3 bg-brand-600 text-white rounded-xl font-bold hover:bg-brand-700 transition-colors flex items-center justify-center gap-2"
                                    >
                                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "SMS Kodu Gönder"}
                                    </button>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="relative">
                                            <input 
                                                type="text" 
                                                value={code}
                                                onChange={(e) => setCode(e.target.value)}
                                                placeholder="6 Haneli Kod"
                                                className="w-full px-4 py-3 border border-brand-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none text-center text-lg tracking-widest font-mono"
                                                maxLength={6}
                                            />
                                        </div>
                                        <button 
                                            onClick={handleVerify}
                                            disabled={isLoading || code.length < 6}
                                            className="w-full py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                                        >
                                            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "SMS Kodunu Onayla"}
                                        </button>
                                        <button onClick={() => { setCodeSent(false); }} className="w-full text-xs text-slate-500 hover:text-slate-800">
                                            Numarayı değiştir / Kodu tekrar gönder
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                     </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default VerificationModal;
