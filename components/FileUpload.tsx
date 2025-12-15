import React, { useCallback, useState, useEffect } from 'react';
import { Upload, Image as ImageIcon, Loader2, Clipboard } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (base64: string, mimeType: string) => void;
  isAnalyzing: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, isAnalyzing }) => {
  const [dragActive, setDragActive] = useState(false);
  // Labor Illusion Steps
  const [loadingStep, setLoadingStep] = useState(0);
  const loadingMessages = [
    "Identifying Asset & Timeframe...",
    "Scanning Chart Patterns (Bullish/Bearish)...",
    "Calculating Risk/Reward Ratios...",
    "Finalizing Institutional Report..."
  ];

  useEffect(() => {
    if (isAnalyzing) {
      setLoadingStep(0);
      const interval = setInterval(() => {
        setLoadingStep(prev => (prev < loadingMessages.length - 1 ? prev + 1 : prev));
      }, 2000); // Change message every 2 seconds
      return () => clearInterval(interval);
    }
  }, [isAnalyzing]);

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert("Please upload an image file.");
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Extract base64 part
      const base64Data = result.split(',')[1];
      onFileSelect(base64Data, file.type);
    };
  };

  // Handle Global Paste Events


  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  }, [onFileSelect]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto mb-8">
      <div
        className={`relative group rounded-3xl border-2 border-dashed transition-all duration-300 ease-out p-12 flex flex-col items-center justify-center text-center cursor-pointer overflow-hidden
        ${dragActive
            ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/20 scale-[1.02]'
            : 'border-slate-300 dark:border-neutral-700 hover:border-slate-400 dark:hover:border-neutral-500 bg-white/40 dark:bg-white/5 hover:bg-white/60 dark:hover:bg-white/10'
          }
        ${isAnalyzing ? 'opacity-50 pointer-events-none' : ''}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          id="file-upload-input"
          type="file"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          onChange={handleChange}
          accept="image/*"
          disabled={isAnalyzing}
        />

        {/* Red "CHART REQUIRED" Banner */}
        <div className="absolute top-5 -right-8 pointer-events-none z-20">
          <div className="bg-gradient-to-r from-red-500 to-red-400 text-white text-xs font-black px-16 py-2 shadow-lg transform rotate-45 tracking-tighter">
            CHART REQUIRED
          </div>
        </div>

        <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/0 to-white/40 pointer-events-none" />

        {isAnalyzing ? (
          <div className="flex flex-col items-center animate-pulse">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
            <p className="text-lg font-bold text-slate-800 dark:text-white transition-all duration-500">
              {loadingMessages[loadingStep]}
            </p>
            <p className="text-sm text-slate-500 mt-2">Powered by AI Motion</p>

            {/* Progress Bar */}
            <div className="w-48 h-1 bg-slate-200 rounded-full mt-4 overflow-hidden">
              <div
                className="h-full bg-blue-600 transition-all duration-500 ease-out"
                style={{ width: `${((loadingStep + 1) / loadingMessages.length) * 100}%` }}
              />
            </div>
          </div>
        ) : (
          <>
            <div className={`w-16 h-16 mb-6 rounded-2xl flex items-center justify-center transition-colors duration-300 ${dragActive ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 dark:bg-neutral-800 text-slate-500 dark:text-neutral-400 group-hover:bg-slate-200 dark:group-hover:bg-neutral-700'}`}>
              <Upload className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-2">
              <span className="hidden md:inline">Upload Chart Screenshot</span>
              <span className="md:hidden">Upload from Photo Library</span>
            </h3>
            <p className="text-slate-500 dark:text-neutral-400 max-w-md mx-auto leading-relaxed">
              <span className="hidden md:inline">Drag & drop, click to browse, or <span className="font-semibold text-slate-700 dark:text-white bg-slate-200/60 dark:bg-neutral-700 px-1.5 py-0.5 rounded text-xs mx-1">Paste (Ctrl+V)</span> directly.</span>
              <span className="md:hidden">Tap to select a screenshot from your gallery.</span>
              <br />
              <span className="text-xs text-slate-400 dark:text-neutral-500 mt-2 block">Supported: PNG, JPG, WEBP</span>
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default FileUpload;