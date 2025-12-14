import React from 'react';
import { X, Check, Star, Shield, Zap, Building2 } from 'lucide-react';
import { SubscriptionPlan } from '../types';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  plans: SubscriptionPlan[];
  onSelectPlan?: (plan: SubscriptionPlan) => void;
}

const PricingModal: React.FC<PricingModalProps> = ({ isOpen, onClose, plans, onSelectPlan }) => {
  if (!isOpen) return null;

  const getIcon = (key: string) => {
    switch (key) {
      case 'zap': return <Zap className="w-6 h-6 text-slate-500" />;
      case 'star': return <Star className="w-6 h-6 text-brand-100" />;
      case 'building': return <Building2 className="w-6 h-6 text-indigo-500" />;
      default: return <Zap className="w-6 h-6 text-slate-500" />;
    }
  };

  const handleSelect = (plan: SubscriptionPlan) => {
    if (onSelectPlan) {
      onSelectPlan(plan);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative bg-slate-50 rounded-2xl shadow-2xl w-full max-w-6xl my-auto animate-in fade-in zoom-in duration-300 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-white px-8 py-6 border-b border-slate-200 flex justify-between items-center sticky top-0 z-10">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Abonelik Paketleri</h2>
            <p className="text-slate-500">İşletmenizin hacmine uygun planı seçin, ithalata güvenle başlayın.</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 bg-slate-100 rounded-full text-slate-500 hover:text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Pricing Cards Container */}
        <div className="p-8 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan) => (
              <div 
                key={plan.id} 
                className={`relative rounded-2xl border transition-all duration-300 flex flex-col
                  ${plan.popular 
                    ? 'bg-white border-brand-500 shadow-xl shadow-brand-500/10 scale-105 z-10' 
                    : 'bg-white border-slate-200 hover:border-brand-200 hover:shadow-lg'
                  }
                `}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-brand-600 to-brand-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide shadow-md">
                    En Çok Tercih Edilen
                  </div>
                )}

                <div className="p-8 flex-1">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6
                    ${plan.popular ? 'bg-brand-600' : 'bg-slate-100'}
                  `}>
                    {getIcon(plan.iconKey)}
                  </div>
                  
                  <h3 className="text-xl font-bold text-slate-900 mb-2">{plan.name}</h3>
                  <p className="text-sm text-slate-500 mb-6 h-10 line-clamp-2">{plan.description}</p>
                  
                  <div className="flex items-baseline gap-1 mb-8">
                    <span className="text-4xl font-extrabold text-slate-900">{plan.price}</span>
                    <span className="text-slate-500 font-medium">{plan.period}</span>
                  </div>

                  <ul className="space-y-4 mb-8">
                    {plan.features.map((feature, fIdx) => (
                      <li key={fIdx} className="flex items-start gap-3 text-sm text-slate-700">
                        <Check className={`w-5 h-5 flex-shrink-0 ${plan.popular ? 'text-brand-500' : 'text-slate-400'}`} />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-8 pt-0 mt-auto">
                  <button 
                    onClick={() => handleSelect(plan)}
                    className={`w-full py-4 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2
                    ${plan.popular 
                      ? 'bg-brand-600 text-white hover:bg-brand-700 shadow-lg shadow-brand-500/20 hover:shadow-brand-500/30' 
                      : 'bg-slate-100 text-slate-900 hover:bg-slate-200'
                    }
                  `}>
                    {plan.cta}
                  </button>
                  {plan.name === "Kurumsal" && (
                    <p className="text-xs text-center text-slate-400 mt-3">Kurumsal faturalandırma mevcuttur.</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center bg-blue-50 rounded-xl p-6 border border-blue-100">
             <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-blue-900">
                <Shield className="w-8 h-8 text-blue-600" />
                <div className="text-left">
                  <h4 className="font-bold">Güvenli Ödeme ve %100 Memnuniyet</h4>
                  <p className="text-sm text-blue-700">Tüm planlarda 14 gün içinde koşulsuz iade garantisi sunuyoruz. Kredi kartı bilgileriniz 256-bit SSL ile korunmaktadır.</p>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingModal;