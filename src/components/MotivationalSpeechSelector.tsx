import React, { useState } from 'react';
import { Quote, Volume2, Sparkles, Check, Play, Pause, Loader2 } from 'lucide-react';
import { MOTIVATIONAL_PRESETS } from '../constants/presets';
import { MotivationalPreset } from '../types';

interface MotivationalSpeechSelectorProps {
  currentQuote: string;
  onQuoteChange: (quote: string) => void;
  audioBlobUrl: string | null;
  onAudioGenerated: (audioUrl: string) => void;
  isUrdu: boolean;
}

export const MotivationalSpeechSelector: React.FC<MotivationalSpeechSelectorProps> = ({
  currentQuote,
  onQuoteChange,
  audioBlobUrl,
  onAudioGenerated,
  isUrdu,
}) => {
  const [isGeneratingTts, setIsGeneratingTts] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const [ttsError, setTtsError] = useState<string | null>(null);

  const handleSelectPreset = (preset: MotivationalPreset) => {
    onQuoteChange(preset.text);
  };

  const handleGenerateVoiceover = async () => {
    if (!currentQuote.trim()) return;

    try {
      setIsGeneratingTts(true);
      setTtsError(null);

      const res = await fetch('/api/generate-tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: currentQuote,
          voiceName: 'Zephyr',
          tone: 'Inspiring charismatic motivational speaker',
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate voiceover');
      }

      // Convert base64 audio to Blob URL
      const byteCharacters = atob(data.audioBase64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: data.mimeType || 'audio/wav' });
      const url = URL.createObjectURL(blob);

      onAudioGenerated(url);

      // Play audio automatically to test
      const audio = new Audio(url);
      setAudioElement(audio);
      audio.onended = () => setIsPlayingAudio(false);
      audio.play();
      setIsPlayingAudio(true);
    } catch (err: any) {
      console.error('Error in TTS generation:', err);
      setTtsError(err.message || 'Error generating voiceover');
    } finally {
      setIsGeneratingTts(false);
    }
  };

  const togglePlayAudio = () => {
    if (!audioBlobUrl) return;
    if (isPlayingAudio && audioElement) {
      audioElement.pause();
      setIsPlayingAudio(false);
    } else {
      const audio = audioElement || new Audio(audioBlobUrl);
      if (!audioElement) setAudioElement(audio);
      audio.onended = () => setIsPlayingAudio(false);
      audio.play();
      setIsPlayingAudio(true);
    }
  };

  return (
    <div className="space-y-4 p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800/80">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
          <Quote className="w-4 h-4 text-amber-400" />
          <span>{isUrdu ? '۳. موٹیویشنل تقریر اور اقوال' : '3. Motivational Speech & Speech Script'}</span>
        </label>
        <span className="text-[11px] text-zinc-400">
          {isUrdu ? 'اردو / انگریزی اسکرپٹ' : 'Urdu & English Ready'}
        </span>
      </div>

      {/* Preset Chips */}
      <div className="flex flex-wrap gap-2">
        {MOTIVATIONAL_PRESETS.map((preset) => {
          const isSelected = currentQuote.trim() === preset.text.trim();
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => handleSelectPreset(preset)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all flex items-center gap-1.5 ${
                isSelected
                  ? 'border-amber-500 bg-amber-500/15 text-amber-300'
                  : 'border-zinc-800 bg-zinc-950/70 text-zinc-300 hover:border-zinc-700 hover:text-white'
              }`}
            >
              {isSelected && <Check className="w-3.5 h-3.5 text-amber-400" />}
              <span>{preset.title}</span>
            </button>
          );
        })}
      </div>

      {/* Quote / Speech TextArea */}
      <div className="relative">
        <textarea
          value={currentQuote}
          onChange={(e) => onQuoteChange(e.target.value)}
          rows={4}
          dir="auto"
          placeholder={
            isUrdu
              ? 'یہاں اپنا موٹیویشنل جملہ، اقتباس یا تقریر درج کریں...'
              : 'Enter your motivational quote, speech lines or podcast dialogue here...'
          }
          className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500 font-urdu leading-relaxed transition-colors resize-none"
        />
      </div>

      {/* Voiceover Generator Button & Player */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
        <button
          type="button"
          onClick={handleGenerateVoiceover}
          disabled={isGeneratingTts || !currentQuote.trim()}
          className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-xs font-semibold text-zinc-100 transition-all disabled:opacity-50"
        >
          {isGeneratingTts ? (
            <Loader2 className="w-4 h-4 text-amber-400 animate-spin" />
          ) : (
            <Volume2 className="w-4 h-4 text-amber-400" />
          )}
          <span>
            {isGeneratingTts
              ? isUrdu
                ? 'آواز تیار ہو رہی ہے...'
                : 'Generating Speech Voiceover...'
              : isUrdu
              ? 'جیمنائی کے ذریعے اردو آواز بنائیں (TTS)'
              : 'Generate Voiceover Speech (Gemini TTS)'}
          </span>
        </button>

        {audioBlobUrl && (
          <div className="flex items-center gap-2 bg-zinc-950 px-3 py-1.5 rounded-xl border border-zinc-800 self-start sm:self-auto">
            <button
              type="button"
              onClick={togglePlayAudio}
              className="w-7 h-7 rounded-lg bg-amber-500 text-zinc-950 flex items-center justify-center hover:bg-amber-400 transition-colors shadow-sm"
              title={isPlayingAudio ? 'Pause' : 'Play Voiceover'}
            >
              {isPlayingAudio ? (
                <Pause className="w-3.5 h-3.5 fill-current" />
              ) : (
                <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
              )}
            </button>
            <span className="text-xs text-zinc-300 font-medium">
              {isPlayingAudio
                ? isUrdu
                  ? 'آواز چل رہی ہے'
                  : 'Playing Audio...'
                : isUrdu
                ? 'تیار آواز سنیں'
                : 'Voiceover Ready'}
            </span>
          </div>
        )}
      </div>

      {ttsError && (
        <p className="text-xs text-rose-400 bg-rose-950/40 border border-rose-800/40 px-3 py-1.5 rounded-lg">
          {ttsError}
        </p>
      )}
    </div>
  );
};
