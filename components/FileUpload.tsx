import React, { useRef, useState, useEffect } from 'react';
import { Upload, Image as ImageIcon, Loader2, ScanLine, BrainCircuit, FileSearch, Scale, CheckCircle2 } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  isLoading: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, isLoading }) => {
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Timer State
  const [timeLeft, setTimeLeft] = useState(30);
  const [loadingStep, setLoadingStep] = useState(0);

  // Loading Steps Messages
  const loadingMessages = [
    { text: "Görsel yükleniyor ve yapay zeka motoru başlatılıyor...", icon: ScanLine },
    { text: "Ürünün materyali, kullanım alanı ve teknik özellikleri taranıyor...", icon: ImageIcon },
    { text: "2025 Gümrük Tarife Cetveli ve GTIP kodları eşleştiriliyor...", icon: FileSearch },
    { text: "Güncel vergi oranları, KDV ve ÖTV hesaplanıyor...", icon: Scale },
    { text: "İthalat için gerekli belgeler (CE, Tareks vb.) kontrol ediliyor...", icon: CheckCircle2 },
    { text: "Sonuçlar derleniyor, raporunuz hazırlanmak üzere...", icon: BrainCircuit },
  ];

  useEffect(() => {
    let interval: any;

    if (isLoading) {
      // Reset timer when loading starts
      setTimeLeft(30);
      setLoadingStep(0);

      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      // Reset when not loading
      setTimeLeft(30);
      setLoadingStep(0);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isLoading]);

  // Update message step based on time left
  useEffect(() => {
    if (!isLoading) return;
    
    // 30 sn toplam süre. 6 mesaj var. Her mesaj 5 saniye.
    // 30-26: Step 0
    // 25-21: Step 1
    // ...
    const step = Math.floor((30 - timeLeft) / 5);
    if (step < loadingMessages.length) {
      setLoadingStep(step);
    }
  }, [timeLeft, isLoading]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files[0]);
    }
  };

  const onButtonClick = () => {
    inputRef.current?.click();
  };

  // Calculate circle progress
  const radius = 30;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - ((30 - timeLeft) / 30) * circumference;

  const CurrentIcon = loadingMessages[Math.min(loadingStep, loadingMessages.length - 1)].icon;

  return (
    <div 
      className={`relative w-full max-w-2xl mx-auto min-h-[300px] border-2 border-dashed rounded-2xl transition-all duration-500 ease-in-out flex flex-col items-center justify-center p-8 text-center overflow-hidden
        ${dragActive ? 'border-brand-500 bg-brand-50 scale-[1.02]' : 'border-gray-200 bg-white hover:border-brand-300'}
        ${isLoading ? 'border-none ring-1 ring-slate-100 shadow-inner bg-slate-50' : 'cursor-pointer shadow-sm hover:shadow-md'}
      `}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      onClick={!isLoading ? onButtonClick : undefined}
    >
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept="image/*"
        onChange={handleChange}
        disabled={isLoading}
      />

      {isLoading ? (
        <div className="flex flex-col items-center justify-center w-full relative z-10 animate-in fade-in duration-500">
          
          {/* Progress Circle & Timer */}
          <div className="relative mb-8">
            <svg className="transform -rotate-90 w-32 h-32">
              <circle
                cx="64"
                cy="64"
                r={radius}
                stroke="currentColor"
                strokeWidth="4"
                fill="transparent"
                className="text-slate-200"
              />
              <circle
                cx="64"
                cy="64"
                r={radius}
                stroke="currentColor"
                strokeWidth="4"
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                className="text-brand-600 transition-all duration-1000 ease-linear"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center flex-col">
              <span className="text-3xl font-bold text-slate-800 font-mono tabular-nums">
                {timeLeft}
              </span>
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Saniye</span>
            </div>
          </div>

          {/* Dynamic Status Message */}
          <div className="max-w-md mx-auto min-h-[80px] flex flex-col items-center">
             <div className="bg-white p-3 rounded-full shadow-sm mb-3 animate-bounce">
                <CurrentIcon className="w-6 h-6 text-brand-600" />
             </div>
             <p className="text-lg font-medium text-slate-800 transition-all duration-500 ease-in-out key={loadingStep}">
               {loadingMessages[Math.min(loadingStep, loadingMessages.length - 1)].text}
             </p>
             
             {/* Progress Dots */}
             <div className="flex gap-1.5 mt-4">
                {loadingMessages.map((_, idx) => (
                  <div 
                    key={idx} 
                    className={`h-1.5 rounded-full transition-all duration-300 ${idx === loadingStep ? 'w-6 bg-brand-600' : idx < loadingStep ? 'w-1.5 bg-brand-200' : 'w-1.5 bg-slate-200'}`}
                  ></div>
                ))}
             </div>
          </div>

        </div>
      ) : (
        <div className="group space-y-4">
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-brand-100 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="bg-brand-50 p-6 rounded-full relative group-hover:scale-110 transition-transform duration-300">
              <Upload className="w-10 h-10 text-brand-600" />
            </div>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-slate-800">
              Fotoğrafı Buraya Bırak
            </h3>
            <p className="text-slate-500 text-sm max-w-sm mx-auto leading-relaxed">
              Veya dosya seçmek için <span className="text-brand-600 font-bold underline decoration-brand-200 decoration-2 underline-offset-2">tıklayın</span>.
            </p>
          </div>

          <div className="pt-4 flex items-center justify-center gap-4 text-xs text-slate-400 font-medium">
             <span className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded border border-slate-100">
               <ImageIcon className="w-3 h-3" /> JPG, PNG, WEBP
             </span>
             <span className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded border border-slate-100">
               <ScanLine className="w-3 h-3" /> Max 10MB
             </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;