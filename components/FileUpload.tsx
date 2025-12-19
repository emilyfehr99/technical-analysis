import React, { useCallback, useState, useEffect } from 'react';
import { Upload, Image as ImageIcon, Loader2, Clipboard } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (base64: string, mimeType: string) => void;
  isAnalyzing: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, isAnalyzing }) => {
  const [dragActive, setDragActive] = useState(false);
  const [showPasteFallback, setShowPasteFallback] = useState(false);
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
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (isAnalyzing) return;
      if (e.clipboardData && e.clipboardData.files.length > 0) {
        const file = e.clipboardData.files[0];
        processFile(file);
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [onFileSelect, isAnalyzing]);

  // Handle Mobile/Button Paste
  const handleManualPaste = async () => {
    try {
      const clipboardItems = await navigator.clipboard.read();
      for (const item of clipboardItems) {
        if (item.types && item.types.some(type => type.startsWith('image/'))) {
          const blob = await item.getType(item.types.find(type => type.startsWith('image/'))!);
          const file = new File([blob], "pasted-image.png", { type: blob.type });
          processFile(file);
          return;
        }
      }
      alert("No image found in clipboard. Please copy an image first.");
    } catch (err) {
      console.error('Failed to read clipboard contents: ', err);
      // Fallback for Firefox or mobile permissions denied
      setShowPasteFallback(true);
    }
  };

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

  return (
    <div className="w-full max-w-2xl mx-auto mb-8">
      <div
        className={`relative group rounded-3xl border-2 border-dashed transition-all duration-300 ease-out p-12 flex flex-col items-center justify-center text-center overflow-hidden
        ${dragActive
            ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/20 scale-[1.02]'
            : 'border-2 border-dashed border-yellow-500/50 animate-pulse bg-yellow-500/5 dark:bg-yellow-500/10 shadow-[0_0_15px_rgba(234,179,8,0.3)]'
          }
        ${isAnalyzing ? 'opacity-50 pointer-events-none' : ''}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >

        {/* Red "CHART REQUIRED" Banner */}
        {/* Red "CHART REQUIRED" Bubble */}
        <div className="absolute top-4 right-4 pointer-events-none z-20">
          <div className="bg-gradient-to-r from-red-500 to-red-400 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-lg tracking-tight flex items-center gap-1.5 border border-red-400/50">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse transition-opacity" />
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
            <div className={`w-16 h-16 mb-6 rounded-2xl flex items-center justify-center transition-colors duration-300 ${dragActive ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 dark:bg-neutral-800 text-slate-500 dark:text-neutral-400'}`}>
              <Clipboard className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-2">
              <span className="hidden md:inline">Paste Chart Screenshot</span>
              <span className="md:hidden">Paste from Clipboard</span>
            </h3>
            <p className="text-slate-500 dark:text-neutral-400 max-w-md mx-auto leading-relaxed mb-6">
              <span className="hidden md:inline">Drag & drop or <span className="font-semibold text-slate-700 dark:text-white bg-slate-200/60 dark:bg-neutral-700 px-1.5 py-0.5 rounded text-xs mx-1">Paste (Ctrl+V)</span> directly.</span>
              <span className="md:hidden">Tap below to paste a screenshot.</span>
              <br />
              <span className="text-xs text-slate-400 dark:text-neutral-500 mt-2 block">Supported: PNG, JPG, WEBP</span>
            </p>

            {/* Mobile Paste Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation(); // Prevent file dialog from opening
                handleManualPaste();
              }}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/30 transition-all z-20 md:hidden"
            >
              <Clipboard className="w-4 h-4" />
              Paste from Clipboard
            </button>
          </>
        )}
      </div>

      {/* Fallback Paste Modal */}
      {
        showPasteFallback && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200"
            onClick={() => setShowPasteFallback(false)}
          >
            <div
              className="bg-white dark:bg-neutral-900 p-6 rounded-3xl max-w-sm w-full shadow-2xl border border-slate-200 dark:border-neutral-800 animate-in zoom-in-95 duration-200"
              onClick={e => e.stopPropagation()}
            >
              <div className="text-center space-y-4">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto">
                  <Clipboard className="w-6 h-6" />
                </div>

                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Manual Paste</h3>
                  <p className="text-sm text-slate-500 dark:text-neutral-400">
                    Tap the box below, then select <span className="font-bold text-slate-700 dark:text-slate-300">"Paste"</span>
                  </p>
                </div>

                <textarea
                  autoFocus
                  className="w-full h-32 bg-slate-50 dark:bg-black border-2 border-dashed border-slate-300 dark:border-neutral-700 rounded-xl p-4 resize-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none text-base text-slate-900 dark:text-white placeholder:text-slate-400"
                  placeholder="Tap & Hold here to Paste..."
                  onPaste={(e) => {
                    if (e.clipboardData.files.length > 0) {
                      e.preventDefault();
                      processFile(e.clipboardData.files[0]);
                      setShowPasteFallback(false);
                    } else {
                      // If they paste text or something else, give feedback
                      // But let's just ignore for now or they might be reposting text
                    }
                  }}
                />

                <button
                  onClick={() => setShowPasteFallback(false)}
                  className="w-full py-3 text-slate-500 font-semibold hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )
      }
    </div >
  );
};

export default FileUpload;