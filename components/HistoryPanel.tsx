import React from 'react';
import { HistoryItem } from '../types';
import { Clock, Search, ArrowRight, Trash2, FileText, Hash } from 'lucide-react';

interface HistoryPanelProps {
  history: HistoryItem[];
  onSelectHistory: (item: HistoryItem) => void;
  onDeleteHistory: (id: string) => void;
  onBack: () => void;
}

const HistoryPanel: React.FC<HistoryPanelProps> = ({ 
  history, 
  onSelectHistory, 
  onDeleteHistory,
  onBack 
}) => {
  return (
    <div className="max-w-4xl mx-auto pb-20">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Clock className="w-6 h-6 text-brand-600" />
            Sorgu Geçmişi
          </h2>
          <p className="text-slate-500 mt-1">Daha önce yaptığınız analizlere buradan ulaşabilirsiniz.</p>
        </div>
        <button 
          onClick={onBack}
          className="text-sm font-medium text-slate-500 hover:text-slate-800"
        >
          Ana Ekrana Dön
        </button>
      </div>

      {history.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-sm">
          <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">Henüz Geçmiş Yok</h3>
          <p className="text-slate-500 mb-6">Yaptığınız analizler burada listelenecektir.</p>
          <button 
            onClick={onBack}
            className="px-6 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors"
          >
            Yeni Analiz Başlat
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {history.map((item) => (
            <div 
              key={item.id}
              className="group bg-white rounded-xl border border-slate-200 p-5 hover:border-brand-300 hover:shadow-md transition-all duration-200 flex items-center justify-between gap-4"
            >
              <div 
                className="flex-1 cursor-pointer"
                onClick={() => onSelectHistory(item)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded uppercase">
                      {item.hsCode}
                    </span>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {item.date}
                    </span>
                  </div>
                </div>
                <h3 className="font-bold text-slate-900 text-lg group-hover:text-brand-600 transition-colors">
                  {item.productName}
                </h3>
                <p className="text-sm text-slate-500 line-clamp-1 mt-1">
                  {item.description}
                </p>
                <div className="flex items-center gap-4 mt-3">
                   <div className="flex items-center gap-1 text-xs text-slate-500 bg-slate-50 px-2 py-1 rounded">
                      <Hash className="w-3 h-3" />
                      Vergiler: {item.taxes.length} Adet
                   </div>
                   <div className="flex items-center gap-1 text-xs text-slate-500 bg-slate-50 px-2 py-1 rounded">
                      <FileText className="w-3 h-3" />
                      Evraklar: {item.documents.length} Adet
                   </div>
                </div>
              </div>

              <div className="flex flex-col gap-2 pl-4 border-l border-slate-100">
                <button 
                  onClick={() => onSelectHistory(item)}
                  className="p-2 text-brand-600 bg-brand-50 hover:bg-brand-100 rounded-lg transition-colors"
                  title="Detayları Gör"
                >
                  <ArrowRight className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => onDeleteHistory(item.id)}
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Kaydı Sil"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HistoryPanel;