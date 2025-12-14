import React from 'react';
import { X, BookOpen, ArrowRight } from 'lucide-react';
import { User } from '../types';
import GuideContent from './GuideContent';
import { storageService } from '../services/storageService';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
}

const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onClose, user }) => {
  if (!isOpen) return null;

  // Veriyi storage'dan çek
  const siteContent = storageService.getSiteContent();

  return (
    <div className="fixed inset-0 z-[160] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      {/* Content */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in duration-300">
        
        {/* Header */}
        <div className="bg-slate-900 px-8 py-6 text-white flex justify-between items-center flex-shrink-0">
           <div className="flex items-center gap-3">
              <div className="bg-white/10 p-2 rounded-lg">
                 <BookOpen className="w-6 h-6 text-brand-300" />
              </div>
              <div>
                 <h2 className="text-xl font-bold">Hoş Geldiniz, {user.name.split(' ')[0]}!</h2>
                 <p className="text-slate-400 text-sm">GümrükAI'yi verimli kullanmanız için kısa bir rehber.</p>
              </div>
           </div>
           <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
              <X className="w-6 h-6" />
           </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-8 overflow-y-auto">
           <GuideContent user={user} content={siteContent.guide} />
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end flex-shrink-0">
           <button 
             onClick={onClose}
             className="px-8 py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-brand-500/20 transition-all"
           >
             Hemen Başla
             <ArrowRight className="w-5 h-5" />
           </button>
        </div>

      </div>
    </div>
  );
};

export default OnboardingModal;