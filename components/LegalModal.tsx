import React from 'react';
import { X, Shield, FileText, Mail } from 'lucide-react';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: string;
  type: 'privacy' | 'terms' | 'contact';
}

const LegalModal: React.FC<LegalModalProps> = ({ isOpen, onClose, title, content, type }) => {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'privacy': return <Shield className="w-6 h-6 text-brand-600" />;
      case 'terms': return <FileText className="w-6 h-6 text-brand-600" />;
      case 'contact': return <Mail className="w-6 h-6 text-brand-600" />;
      default: return null;
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col animate-in zoom-in duration-300">
        
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-slate-50 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-sm">
              {getIcon()}
            </div>
            <h2 className="text-xl font-bold text-slate-900">{title}</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-200 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto prose prose-slate max-w-none text-slate-600 leading-relaxed text-sm">
           <div dangerouslySetInnerHTML={{ __html: content.replace(/\n/g, '<br/>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/### (.*?)\n/g, '<h3 class="text-lg font-bold text-slate-900 mt-6 mb-2">$1</h3>').replace(/## (.*?)\n/g, '<h2 class="text-xl font-bold text-slate-900 mt-4 mb-4 pb-2 border-b border-slate-200">$1</h2>') }} />
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 rounded-b-2xl flex justify-end">
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
};

export default LegalModal;