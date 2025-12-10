import React, { useCallback, useState, useEffect } from 'react';
import { Upload, Image as ImageIcon, Loader2, Clipboard } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (base64: string, mimeType: string) => void;
  isAnalyzing: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, isAnalyzing }) => {
  const [dragActive, setDragActive] = useState(false);

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

      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            processFile(file);
            // Prevent default behavior (like pasting into a text input if one was focused)
            e.preventDefault();
            break; // Stop after finding the first image
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => {
      window.removeEventListener('paste', handlePaste);
    };
  }, [isAnalyzing, onFileSelect]);

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
            ? 'border-blue-500 bg-blue-50/50 scale-[1.02]'
            : 'border-slate-300 hover:border-slate-400 bg-white/40 hover:bg-white/60'
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

        <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/0 to-white/40 pointer-events-none" />

        {isAnalyzing ? (
          <div className="flex flex-col items-center animate-pulse">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
            <p className="text-lg font-medium text-slate-700">Analyzing Market Structure...</p>
            <p className="text-sm text-slate-500 mt-2">Reading MACD & Alligator</p>
          </div>
        ) : (
          <>
            <div className={`w-16 h-16 mb-6 rounded-2xl flex items-center justify-center transition-colors duration-300 ${dragActive ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'}`}>
              <Upload className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-semibold text-slate-800 mb-2">
              Upload Chart Screenshot
            </h3>
            <p className="text-slate-500 max-w-md mx-auto leading-relaxed">
              Drag & drop, click to browse, or <span className="font-semibold text-slate-700 bg-slate-200/60 px-1.5 py-0.5 rounded text-xs mx-1">Paste (Ctrl+V)</span> directly from clipboard.
              <br />
              <span className="text-xs text-slate-400 mt-2 block">Supported: PNG, JPG, WEBP</span>
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default FileUpload;