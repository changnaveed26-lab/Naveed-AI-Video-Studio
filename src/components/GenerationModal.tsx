import React, { useEffect, useState } from 'react';
import { Loader2, Sparkles, Film, Clock, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { formatTime } from '../utils/helpers';
import { GenerationStatus } from '../types';

interface GenerationModalProps {
  status: GenerationStatus;
  elapsedSeconds: number;
  currentQuote: string;
  errorMessage: string | null;
  isQuotaExceeded?: boolean;
  onCancel: () => void;
  onTryDemo?: () => void;
  isUrdu: boolean;
  model: string;
  engineMode?: 'studio' | 'veo-cloud';
}

export const GenerationModal: React.FC<GenerationModalProps> = ({
  status,
  elapsedSeconds,
  currentQuote,
  errorMessage,
  isQuotaExceeded,
  onCancel,
  onTryDemo,
  isUrdu,
  model,
  engineMode = 'studio',
}) => {
  const [quoteIndex, setQuoteIndex] = useState(0);

  const tips = [
    isUrdu
      ? 'ویو ماڈل آپ کی تصویر کے باریک خدوخال اور تاثرات کا تجزیہ کر رہا ہے...'
      : 'Veo 3.1 is analyzing facial geometry and studio lighting dynamics...',
    isUrdu
      ? 'بولنے کے قدرتی انداز اور ہاتھ کی حرکات تیار کی جا رہی ہیں...'
      : 'Synthesizing natural speech cadence, microphone interactions, and gestures...',
    isUrdu
      ? 'ہائی ڈیفینیشن ویڈیو فریمز کی جدید نیورل رینڈرنگ جاری ہے...'
      : 'Rendering high-definition temporal video frames with cinematic depth...',
    isUrdu
      ? 'حتمی ویڈیو کی انکوڈنگ اور آؤٹ پٹ فائل تیار کی جا رہی ہے...'
      : 'Assembling photorealistic MP4 stream at broadcast quality...',
  ];

  const currentTip = tips[Math.floor(elapsedSeconds / 15) % tips.length];

  if (status === 'idle' || status === 'completed') return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-24 bg-amber-500/10 blur-3xl rounded-full pointer-events-none" />

        <div className="relative text-center space-y-6">
          {/* Animated Spinner Icon */}
          <div className="mx-auto w-20 h-20 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-center relative shadow-inner">
            {errorMessage ? (
              <AlertTriangle className="w-10 h-10 text-amber-500" />
            ) : (
              <>
                <div className="absolute inset-0 rounded-2xl border-2 border-amber-500/20 animate-pulse" />
                <Loader2 className="w-10 h-10 text-amber-400 animate-spin" />
              </>
            )}
          </div>

          {/* Heading & Subheading */}
          <div>
            <h3 className="text-lg font-bold text-white mb-1 flex items-center justify-center gap-2">
              {isQuotaExceeded ? (
                <span className="text-amber-400">
                  {isUrdu ? 'کوٹہ کی حد مکمل ہو گئی (429)' : 'API Quota Exceeded (429)'}
                </span>
              ) : errorMessage ? (
                <span className="text-rose-400">{isUrdu ? 'خرابی پیش آ گئی' : 'Generation Error'}</span>
              ) : (
                <span>
                  {isUrdu
                    ? engineMode === 'studio'
                      ? 'اسٹوڈیو اینیمیٹر سے ویڈیو بن رہی ہے...'
                      : 'ویڈیو تیار کی جا رہی ہے...'
                    : engineMode === 'studio'
                    ? 'Rendering Studio Animated Video...'
                    : 'Generating Video with Veo 3.1'}
                </span>
              )}
            </h3>
            <p className="text-xs text-zinc-400 font-mono">
              {engineMode === 'studio' ? 'Cinematic Studio Engine' : model} • {formatTime(elapsedSeconds)} {isUrdu ? 'گزرے سیکنڈ' : 'elapsed'}
            </p>
          </div>

          {/* Dynamic Reassuring Message or Quota Box */}
          {!errorMessage ? (
            <div className="p-4 rounded-2xl bg-zinc-950/70 border border-zinc-800/80 space-y-2">
              <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-amber-300">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                <span>{currentTip}</span>
              </div>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                {isUrdu
                  ? 'ویڈیو جنریشن عام طور پر ۶۰ سے ۹۰ سیکنڈ لیتی ہے۔ براہ کرم اسکرین بند نہ کریں۔'
                  : 'Veo video synthesis typically takes 1 to 2 minutes to generate photorealistic movement.'}
              </p>
            </div>
          ) : isQuotaExceeded ? (
            <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-800/40 text-left text-xs text-amber-200 space-y-2">
              <p className="font-semibold text-amber-300">
                {isUrdu
                  ? 'آپ کے اکاؤنٹ کا ویڈیو جنریشن کوٹہ ختم ہو چکا ہے۔'
                  : 'Your API key has reached its Veo video generation quota limit.'}
              </p>
              <p className="text-[11px] text-zinc-300 leading-relaxed">
                {isUrdu
                  ? 'گوگل اے آئی اسٹوڈیو میں Veo ماڈلز کے لیے ایکٹو بلنگ یا پیڈ کی درکار ہوتی ہے۔ آپ فوراً "ڈیمو اینیمیشن دیکھیں" پر کلک کر کے فل اسٹوڈیو پلیئر کا مکمل تجربہ حاصل کر سکتے ہیں!'
                  : 'Veo models require a paid billing tier in Google AI Studio. You can click "Test Demo Video Preview" below to test the full video player, synchronized speech, and comparison tools right now!'}
              </p>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-800/50 text-left text-xs text-rose-200">
              <p className="font-semibold mb-1">{isUrdu ? 'تفصیلات:' : 'Error details:'}</p>
              <p className="font-mono text-[11px] break-words">{errorMessage}</p>
            </div>
          )}

          {/* Motivational Quote in Backdrop */}
          {currentQuote && !errorMessage && (
            <div className="text-center pt-1 border-t border-zinc-800/60">
              <p className="text-xs text-zinc-400 font-urdu leading-relaxed line-clamp-2 px-4 italic">
                "{currentQuote.split('\n')[0]}"
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="pt-2 flex items-center justify-center gap-3">
            {isQuotaExceeded && onTryDemo && (
              <button
                type="button"
                onClick={onTryDemo}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-zinc-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isUrdu ? 'ڈیمو اینیمیشن ویڈیو دیکھیں' : 'Test Demo Video Preview'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={onCancel}
              className="px-5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-300 hover:text-white transition-colors"
            >
              {errorMessage
                ? isUrdu
                  ? 'بند کریں'
                  : 'Close'
                : isUrdu
                ? 'منسوخ کریں'
                : 'Cancel Request'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
