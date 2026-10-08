import React from 'react';
import { AspectRatio, Resolution, EngineMode } from '../types';
import { Smartphone, Monitor, Sliders, Cpu, Zap, Sparkles, Cloud } from 'lucide-react';

interface AspectConfigProps {
  aspectRatio: AspectRatio;
  onAspectRatioChange: (ratio: AspectRatio) => void;
  resolution: Resolution;
  onResolutionChange: (res: Resolution) => void;
  model: string;
  onModelChange: (model: string) => void;
  engineMode: EngineMode;
  onEngineModeChange: (mode: EngineMode) => void;
  isUrdu: boolean;
}

export const AspectConfig: React.FC<AspectConfigProps> = ({
  aspectRatio,
  onAspectRatioChange,
  resolution,
  onResolutionChange,
  model,
  onModelChange,
  engineMode,
  onEngineModeChange,
  isUrdu,
}) => {
  return (
    <div className="space-y-4 p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800/80">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
          <Sliders className="w-4 h-4 text-amber-400" />
          <span>{isUrdu ? '۲. ویڈیو کا تناسب اور اینیمیشن انجن' : '2. Aspect Ratio & Animation Engine'}</span>
        </label>
        <span className="text-[11px] text-zinc-400 font-mono">
          {engineMode === 'studio' ? 'Studio Engine (Active)' : model}
        </span>
      </div>

      {/* Engine Mode Toggle */}
      <div className="grid grid-cols-2 gap-2 p-1 bg-zinc-950 rounded-xl border border-zinc-800">
        <button
          type="button"
          onClick={() => onEngineModeChange('studio')}
          className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
            engineMode === 'studio'
              ? 'bg-amber-500 text-zinc-950 shadow-md'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>{isUrdu ? 'اسٹوڈیو اینیمیٹر (مفت)' : 'Studio Engine (Free)'}</span>
        </button>

        <button
          type="button"
          onClick={() => onEngineModeChange('veo-cloud')}
          className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
            engineMode === 'veo-cloud'
              ? 'bg-amber-500 text-zinc-950 shadow-md'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Cloud className="w-3.5 h-3.5" />
          <span>{isUrdu ? 'کلاؤڈ Veo ۳.۱' : 'Cloud Veo 3.1'}</span>
        </button>
      </div>

      {/* Aspect Ratio Buttons (Strict Requirement: 16:9 or 9:16) */}
      <div className="grid grid-cols-2 gap-3">
        {/* 9:16 Portrait */}
        <button
          type="button"
          onClick={() => onAspectRatioChange('9:16')}
          className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
            aspectRatio === '9:16'
              ? 'border-amber-500 bg-amber-500/10 text-white shadow-sm'
              : 'border-zinc-800 bg-zinc-900/80 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
          }`}
        >
          <div
            className={`w-9 h-9 rounded-lg flex items-center justify-center ${
              aspectRatio === '9:16'
                ? 'bg-amber-500 text-zinc-950 font-bold'
                : 'bg-zinc-800 text-zinc-400'
            }`}
          >
            <Smartphone className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-sm font-bold text-zinc-100 flex items-center gap-1.5">
              <span>9:16</span>
              <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-300">
                {isUrdu ? 'عمودی' : 'Portrait'}
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 truncate">
              {isUrdu ? 'ریلز، شارٹس اور ٹک ٹاک' : 'Reels, Shorts, TikTok, Mobile'}
            </p>
          </div>
        </button>

        {/* 16:9 Landscape */}
        <button
          type="button"
          onClick={() => onAspectRatioChange('16:9')}
          className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
            aspectRatio === '16:9'
              ? 'border-amber-500 bg-amber-500/10 text-white shadow-sm'
              : 'border-zinc-800 bg-zinc-900/80 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
          }`}
        >
          <div
            className={`w-9 h-9 rounded-lg flex items-center justify-center ${
              aspectRatio === '16:9'
                ? 'bg-amber-500 text-zinc-950 font-bold'
                : 'bg-zinc-800 text-zinc-400'
            }`}
          >
            <Monitor className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-sm font-bold text-zinc-100 flex items-center gap-1.5">
              <span>16:9</span>
              <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-300">
                {isUrdu ? 'افقی' : 'Landscape'}
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 truncate">
              {isUrdu ? 'یوٹیوب، اسٹوڈیو اور سنیما' : 'YouTube, Widescreen, Cinema'}
            </p>
          </div>
        </button>
      </div>

      {/* Resolution & Model Row */}
      <div className="grid grid-cols-2 gap-3 pt-1">
        {/* Quality */}
        <div>
          <label className="block text-xs font-semibold text-zinc-400 mb-1.5">
            {isUrdu ? 'ریزولیوشن کوالٹی' : 'Resolution'}
          </label>
          <div className="grid grid-cols-2 gap-1.5 bg-zinc-950 p-1 rounded-xl border border-zinc-800">
            <button
              type="button"
              onClick={() => onResolutionChange('720p')}
              className={`py-1.5 rounded-lg text-xs font-semibold transition-all ${
                resolution === '720p'
                  ? 'bg-amber-500 text-zinc-950 font-bold shadow'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              720p
            </button>
            <button
              type="button"
              onClick={() => onResolutionChange('1080p')}
              className={`py-1.5 rounded-lg text-xs font-semibold transition-all ${
                resolution === '1080p'
                  ? 'bg-amber-500 text-zinc-950 font-bold shadow'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              1080p (HD)
            </button>
          </div>
        </div>

        {/* Veo Model Selector (relevant when in Veo Cloud mode or info) */}
        <div>
          <label className="block text-xs font-semibold text-zinc-400 mb-1.5">
            {isUrdu ? 'ماڈل انتخاب' : 'Veo Model'}
          </label>
          <div className="relative">
            <select
              value={model}
              onChange={(e) => onModelChange(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              <option value="veo-3.1-fast-generate-preview">
                veo-3.1-fast-generate-preview
              </option>
              <option value="veo-3.1-lite-generate-preview">
                veo-3.1-lite-generate-preview
              </option>
              <option value="veo-3.1-generate-preview">
                veo-3.1-generate-preview
              </option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};
