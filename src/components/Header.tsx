import React from 'react';
import { Film, Sparkles, Languages, CheckCircle2, Zap } from 'lucide-react';

interface HeaderProps {
  currentLang: 'en' | 'ur';
  onToggleLang: () => void;
  activeModel: string;
  engineMode?: 'studio' | 'veo-cloud';
}

export const Header: React.FC<HeaderProps> = ({ currentLang, onToggleLang, activeModel, engineMode = 'studio' }) => {
  const isUrdu = currentLang === 'ur';

  return (
    <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-600 shadow-lg shadow-amber-500/20 text-zinc-950 font-black">
            <Film className="w-5 h-5 text-zinc-950" />
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-extrabold tracking-tight text-white flex items-center gap-1.5">
                Veo<span className="text-amber-400">Animator</span>
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/20">
                <Zap className="w-3 h-3 text-amber-400" />
                {engineMode === 'studio' ? 'Studio Engine' : 'Veo 3.1 Fast'}
              </span>
            </div>
            <p className="text-xs text-zinc-400 hidden md:block">
              {isUrdu
                ? 'تصویر سے متحرک سنیماٹک ویڈیو جنریٹر'
                : 'Transform still photos into cinematic videos with Veo 3.1'}
            </p>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {/* Active Model Pill */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-300">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span className="font-mono text-zinc-300 font-medium">
              {engineMode === 'studio' ? 'Instant Studio Engine' : activeModel}
            </span>
          </div>

          {/* Language Toggle */}
          <button
            onClick={onToggleLang}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-semibold text-zinc-200 transition-colors"
            title="Switch Language / زبان تبدیل کریں"
          >
            <Languages className="w-4 h-4 text-amber-400" />
            <span>{isUrdu ? 'English' : 'اردو (Urdu)'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
