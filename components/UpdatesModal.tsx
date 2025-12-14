import React from 'react';
import { X, GitCommit, Calendar, Tag, Zap, Shield, Sparkles, Rocket } from 'lucide-react';
import { storageService } from '../services/storageService';

interface UpdatesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const UpdatesModal: React.FC<UpdatesModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  // Veriyi dinamik olarak çek
  const content = storageService.getSiteContent();
  const updates = content.updates || [];

  const getIcon = (type: string) => {
    switch (type) {
        case 'major': return Zap;
        case 'feature': return Sparkles;
        case 'improvement': return GitCommit;
        case 'init': return Rocket;
        default: return GitCommit;
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col animate-in zoom-in duration-300">
        
        {/* Header */}
        <div className="flex justify-between items-center px-8 py-6 border-b border-slate-100 bg-slate-50 rounded-t-2xl sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
              <GitCommit className="w-6 h-6 text-brand-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Sürüm Notları</h2>
              <p className="text-sm text-slate-500">GümrükAI'nin gelişim yolculuğu</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-200 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content - Timeline */}
        <div className="p-8 overflow-y-auto bg-white">
           <div className="relative border-l-2 border-slate-100 ml-3 md:ml-6 space-y-12">
              {updates.map((update, index) => {
                const Icon = getIcon(update.type);
                return (
                    <div key={update.id} className="relative pl-8 md:pl-12">
                    {/* Timeline Dot */}
                    <div className={`absolute -left-[9px] top-0 w-5 h-5 rounded-full border-4 border-white ${index === 0 ? 'bg-brand-600 ring-4 ring-brand-100' : 'bg-slate-300'}`}></div>
                    
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold w-fit ${index === 0 ? 'bg-brand-100 text-brand-700' : 'bg-slate-100 text-slate-600'}`}>
                            {update.version}
                        </span>
                        <span className="flex items-center gap-1 text-xs font-medium text-slate-400">
                            <Calendar className="w-3 h-3" />
                            {update.date}
                        </span>
                    </div>

                    <h3 className="text-xl font-bold text-slate-900 mb-2 flex items-center gap-2">
                        {update.title}
                        {index === 0 && <span className="bg-red-100 text-red-600 text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wide">Yeni</span>}
                    </h3>
                    
                    <p className="text-slate-600 text-sm mb-4 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100 italic">
                        "{update.description}"
                    </p>

                    <ul className="space-y-3">
                        {update.changes.map((change, cIndex) => (
                            <li key={cIndex} className="flex items-start gap-3 text-sm text-slate-700">
                            <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-brand-400 flex-shrink-0"></div>
                            <span className="leading-relaxed">{change}</span>
                            </li>
                        ))}
                    </ul>
                    </div>
                );
              })}
           </div>
           
           <div className="mt-12 text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-full text-xs text-slate-400 font-medium">
                 <Rocket className="w-4 h-4" />
                 Yolculuğumuz devam ediyor...
              </div>
           </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 rounded-b-2xl flex justify-end">
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/10"
          >
            Tamam
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpdatesModal;