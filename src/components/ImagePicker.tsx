import React, { useRef, useState } from 'react';
import { UploadCloud, Image as ImageIcon, Sparkles, RefreshCw, Check } from 'lucide-react';
import { SAMPLE_IMAGES } from '../constants/presets';
import { fileToBase64, urlToBase64 } from '../utils/helpers';
import { AspectRatio } from '../types';

interface ImagePickerProps {
  selectedImage: string | null;
  onImageSelected: (base64: string, mimeType: string, defaultAspect?: AspectRatio) => void;
  aspectRatio: AspectRatio;
  isUrdu: boolean;
}

export const ImagePicker: React.FC<ImagePickerProps> = ({
  selectedImage,
  onImageSelected,
  aspectRatio,
  isUrdu,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [loadingPreset, setLoadingPreset] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const { base64, mimeType } = await fileToBase64(file);
      onImageSelected(base64, mimeType);
    } catch (err) {
      console.error('Failed to read image file:', err);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      try {
        const { base64, mimeType } = await fileToBase64(file);
        onImageSelected(base64, mimeType);
      } catch (err) {
        console.error('Failed to drop image:', err);
      }
    }
  };

  const loadSample = async (sample: (typeof SAMPLE_IMAGES)[0]) => {
    try {
      setLoadingPreset(sample.id);
      const { base64, mimeType } = await urlToBase64(sample.url);
      onImageSelected(base64, mimeType, sample.aspectRatio);
    } catch (err) {
      console.error('Failed to load sample image:', err);
    } finally {
      setLoadingPreset(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-amber-400" />
          <span>{isUrdu ? '۱. تصویر اپلوڈ یا منتخب کریں' : '1. Upload or Select Photo to Animate'}</span>
        </label>
        {selectedImage && (
          <button
            onClick={() => fileInputRef.current?.click()}
            className="text-xs text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1 transition-colors"
          >
            <RefreshCw className="w-3 h-3" />
            <span>{isUrdu ? 'تصویر تبدیل کریں' : 'Change Image'}</span>
          </button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Main Dropzone / Preview */}
      {!selectedImage ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 min-h-[220px] ${
            isDragging
              ? 'border-amber-400 bg-amber-500/10'
              : 'border-zinc-800 bg-zinc-900/60 hover:border-zinc-700 hover:bg-zinc-900'
          }`}
        >
          <div className="w-14 h-14 rounded-2xl bg-zinc-800/80 flex items-center justify-center mb-3 shadow-inner text-amber-400 group-hover:scale-105 transition-transform">
            <UploadCloud className="w-7 h-7" />
          </div>
          <p className="text-sm font-semibold text-zinc-200 mb-1">
            {isUrdu ? 'تصویر یہاں ڈریگ کریں یا کلک کریں' : 'Click to upload or drag & drop'}
          </p>
          <p className="text-xs text-zinc-400 max-w-xs">
            {isUrdu
              ? 'جے پی جی، پی این جی یا ویب پی تصویر (پوڈکاسٹ، اسپیکر، پورٹریٹ وغیرہ)'
              : 'PNG, JPG, or WEBP up to 20MB. Portrait or landscape supported.'}
          </p>
        </div>
      ) : (
        <div className="relative rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-950 p-2 group">
          <div
            className={`relative mx-auto rounded-xl overflow-hidden bg-zinc-900 flex items-center justify-center ${
              aspectRatio === '9:16'
                ? 'aspect-[9/16] max-h-[380px] w-auto'
                : 'aspect-[16/9] w-full max-h-[320px]'
            }`}
          >
            <img
              src={selectedImage}
              alt="Selected source"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 rounded-lg bg-zinc-900/90 hover:bg-zinc-800 text-xs text-white font-medium backdrop-blur-sm border border-zinc-700 shadow-md flex items-center gap-1.5 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
                {isUrdu ? 'نئی تصویر منتخب کریں' : 'Replace Image'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preset Samples (Motivational Speaker & Studio) */}
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>{isUrdu ? 'تیار نمونہ تصاویر (فوری ٹیسٹ)' : 'Quick Sample Photos (1-Click Test)'}</span>
        </p>
        <div className="grid grid-cols-2 gap-3">
          {SAMPLE_IMAGES.map((sample) => {
            const isLoading = loadingPreset === sample.id;
            return (
              <button
                key={sample.id}
                type="button"
                onClick={() => loadSample(sample)}
                disabled={isLoading}
                className="flex items-center gap-2.5 p-2 rounded-xl bg-zinc-900/70 hover:bg-zinc-800/80 border border-zinc-800/80 hover:border-amber-500/40 text-left transition-all group disabled:opacity-60"
              >
                <img
                  src={sample.url}
                  alt={sample.title}
                  className="w-12 h-12 rounded-lg object-cover border border-zinc-800 group-hover:border-amber-400/50 flex-shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-zinc-200 truncate group-hover:text-amber-300">
                      {isUrdu ? sample.titleUrdu : sample.title}
                    </span>
                  </div>
                  <span className="inline-block text-[10px] font-mono text-zinc-400">
                    {sample.aspectRatio}
                  </span>
                </div>
                {isLoading && (
                  <RefreshCw className="w-4 h-4 text-amber-400 animate-spin flex-shrink-0 mr-1" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
