
import React from 'react';
import { Box, Home, History, CreditCard, Lock, FileText, Mail, ShieldCheck, GitCommit } from 'lucide-react';
import { SiteContent } from '../types';

interface FooterProps {
  content: SiteContent['footer'];
  onHomeClick: () => void;
  onHistoryClick: () => void;
  onPricingClick: () => void;
  onOpenPrivacy: () => void;
  onOpenTerms: () => void;
  onOpenContact: () => void;
  onOpenUpdates: () => void;
}

const Footer: React.FC<FooterProps> = ({ 
  content, 
  onHomeClick, 
  onHistoryClick, 
  onPricingClick,
  onOpenPrivacy,
  onOpenTerms,
  onOpenContact,
  onOpenUpdates
}) => {
  return (
    <footer className="bg-white border-t border-slate-100 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">
          
          {/* Logo & Description Section */}
          <div className="md:col-span-5 space-y-6">
            <div className="flex items-center gap-2">
              <div className="bg-brand-600 p-2 rounded-lg shadow-sm">
                <Box className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-900">{content.brandName}</span>
            </div>
            <p className="text-slate-500 leading-relaxed max-w-sm">
              {content.brandDesc}
            </p>
          </div>

          {/* Platform Links */}
          <div className="md:col-span-3">
            <h4 className="font-bold text-slate-900 mb-6 flex items-center gap-2 border-l-4 border-brand-500 pl-3">
              PLATFORM
            </h4>
            <ul className="space-y-4">
              <li>
                <button onClick={onHomeClick} className="flex items-center gap-2 text-slate-500 hover:text-brand-600 transition-colors">
                  <Home className="w-4 h-4" />
                  Ana Sayfa
                </button>
              </li>
              <li>
                <button onClick={onHistoryClick} className="flex items-center gap-2 text-slate-500 hover:text-brand-600 transition-colors">
                  <History className="w-4 h-4" />
                  Geçmiş Analizler
                </button>
              </li>
              <li>
                <button onClick={onPricingClick} className="flex items-center gap-2 text-slate-500 hover:text-brand-600 transition-colors">
                  <CreditCard className="w-4 h-4" />
                  Fiyatlandırma
                </button>
              </li>
              <li>
                <button onClick={onOpenUpdates} className="flex items-center gap-2 text-slate-500 hover:text-brand-600 transition-colors">
                  <GitCommit className="w-4 h-4" />
                  Güncellemeler & Sürüm Notları
                </button>
              </li>
            </ul>
          </div>

          {/* Corporate Links */}
          <div className="md:col-span-4">
            <h4 className="font-bold text-slate-900 mb-6 flex items-center gap-2 border-l-4 border-slate-800 pl-3">
              KURUMSAL
            </h4>
            <ul className="space-y-4">
              <li>
                <button onClick={onOpenPrivacy} className="flex items-center gap-2 text-slate-500 hover:text-brand-600 transition-colors">
                  <Lock className="w-4 h-4" />
                  Gizlilik Politikası
                </button>
              </li>
              <li>
                <button onClick={onOpenTerms} className="flex items-center gap-2 text-slate-500 hover:text-brand-600 transition-colors">
                  <FileText className="w-4 h-4" />
                  Kullanım Koşulları
                </button>
              </li>
              <li>
                <button onClick={onOpenContact} className="flex items-center gap-2 text-slate-500 hover:text-brand-600 transition-colors">
                  <Mail className="w-4 h-4" />
                  İletişim
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-sm text-slate-400">
            {content.copyright}
          </div>
          
          <div className="flex flex-col md:flex-row items-center gap-6">
             {/* Iyzico & Payment Trust Badge (Simulated) */}
             <div className="flex items-center bg-white border border-slate-200 rounded-lg px-3 py-1.5 gap-3 shadow-sm hover:shadow-md transition-all">
                <div className="flex flex-col items-start leading-none border-r border-slate-200 pr-3 mr-1">
                    <span className="text-[10px] font-bold text-blue-600">iyzico</span>
                    <span className="text-[8px] text-slate-400">ile öde</span>
                </div>
                <div className="flex gap-2 opacity-70 grayscale hover:grayscale-0 transition-all">
                    {/* SVG Placeholders for VISA/Master/Troy */}
                    <div className="h-4 w-8 bg-blue-800 rounded flex items-center justify-center text-[6px] text-white font-bold tracking-widest">VISA</div>
                    <div className="h-4 w-8 bg-red-600 rounded flex items-center justify-center text-[6px] text-white font-bold tracking-widest">MASTER</div>
                    <div className="h-4 w-8 bg-teal-600 rounded flex items-center justify-center text-[6px] text-white font-bold tracking-widest">TROY</div>
                </div>
             </div>

             <div className="h-4 w-px bg-slate-200 hidden md:block"></div>

             <div className="flex items-center gap-1 text-xs font-medium text-slate-500 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200">
                {content.badgeText}
             </div>
             
             <div className="flex items-center gap-1.5 opacity-50 hover:opacity-100 transition-opacity">
                <ShieldCheck className="w-4 h-4 text-green-600" />
                <span className="text-[10px] font-bold text-slate-500">SSL SECURE</span>
             </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;