
import React, { useEffect, useState } from 'react';
import { X, CheckCircle2, Download, Mail, ArrowRight, Zap, Sparkles } from 'lucide-react';
import { SubscriptionPlan, User } from '../types';
import { invoiceService } from '../services/invoiceService';
import { storageService } from '../services/storageService';

interface PurchaseSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: SubscriptionPlan | null;
  user: User | null;
}

const PurchaseSuccessModal: React.FC<PurchaseSuccessModalProps> = ({ isOpen, onClose, plan, user }) => {
  const [invoiceHtml, setInvoiceHtml] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && plan && user) {
        // Fatura oluştur
        const invId = `INV-${Math.floor(100000 + Math.random() * 900000)}`;
        const date = new Date().toLocaleDateString('tr-TR');
        const html = invoiceService.generateInvoiceHTML(user, plan, invId, date);
        setInvoiceHtml(html);
        
        // Mail göndermeyi tetikle (Arka planda) - GÜNCEL AYARLARI ÇEK
        const currentContent = storageService.getSiteContent();
        
        // Eğer email ayarları henüz yoksa varsayılanı kullan (Eski veriler için fallback)
        const emailSettings = currentContent.emailSettings || {
            senderName: "GümrükAI",
            subject: "Sipariş Onayı",
            body: `Sayın ${user.name}, siparişiniz için teşekkürler.`
        };

        invoiceService.sendInvoiceEmail(user, plan, invId, date, emailSettings);
    }
  }, [isOpen, plan, user]);

  if (!isOpen || !plan || !user) return null;

  const handleDownloadInvoice = () => {
    if (invoiceHtml) {
        const blob = new Blob([invoiceHtml], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `GümrükAI_Fatura_${user.name.replace(/\s+/g, '_')}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
      {/* Confetti Background Effect (CSS only simulation) */}
      <div 
        className="absolute inset-0 bg-slate-900/90 backdrop-blur-md transition-opacity" 
      />

      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in duration-500 text-center">
        
        {/* Success Header Animation */}
        <div className="bg-green-50 pt-10 pb-6 px-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-green-100 to-transparent opacity-50"></div>
            <div className="relative z-10">
                <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-500/30 animate-bounce">
                    <CheckCircle2 className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-2xl font-black text-slate-900 mb-1">Ödeme Başarılı!</h2>
                <p className="text-green-700 font-medium">Paketiniz hesabınıza tanımlandı.</p>
            </div>
        </div>

        <div className="p-8">
            <div className="mb-6 space-y-4">
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex items-center gap-4 text-left">
                    <div className="p-3 bg-white rounded-lg shadow-sm border border-slate-100">
                         {plan.id === '2' ? <Sparkles className="w-6 h-6 text-amber-500" /> : <Zap className="w-6 h-6 text-brand-600" />}
                    </div>
                    <div>
                        <div className="text-xs text-slate-400 font-bold uppercase">Aktif Paket</div>
                        <div className="font-bold text-slate-900 text-lg">{plan.name}</div>
                    </div>
                </div>

                <div className="flex flex-col gap-2 text-sm text-slate-600">
                    <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        <span>Tüm kısıtlı özellikler açıldı.</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        <span>Sorgu haklarınız yenilendi.</span>
                    </div>
                </div>
            </div>

            {/* Invoice Notification */}
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-8 text-left">
                <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                        <h4 className="font-bold text-blue-900 text-sm">Faturanız Gönderildi</h4>
                        <p className="text-xs text-blue-700 mt-1 leading-relaxed">
                           Satın alma faturanız <strong>{user.email}</strong> adresine gönderilmiştir. Ayrıca aşağıdan indirebilirsiniz.
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex flex-col gap-3">
                <button 
                    onClick={onClose}
                    className="w-full py-3.5 bg-slate-900 text-white rounded-xl font-bold shadow-lg shadow-slate-900/20 hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
                >
                    Analiz Yapmaya Başla
                    <ArrowRight className="w-5 h-5" />
                </button>
                
                <button 
                    onClick={handleDownloadInvoice}
                    className="w-full py-3 bg-white border border-slate-200 text-slate-600 rounded-xl font-medium hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
                >
                    <Download className="w-4 h-4" />
                    Faturayı İndir
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default PurchaseSuccessModal;