import React, { useState } from 'react';
import { Sparkles, Video, Wand2, Loader2, Plus, Film } from 'lucide-react';
import { MOTION_PRESETS } from '../constants/presets';
import { MotionPreset } from '../types';

interface MotionPromptEditorProps {
  prompt: string;
  onPromptChange: (prompt: string) => void;
  selectedPresetId: string;
  onPresetSelect: (preset: MotionPreset) => void;
  quoteText: string;
  isUrdu: boolean;
}

export const MotionPromptEditor: React.FC<MotionPromptEditorProps> = ({
  prompt,
  onPromptChange,
  selectedPresetId,
  onPresetSelect,
  quoteText,
  isUrdu,
}) => {
  const [isEnhancing, setIsEnhancing] = useState(false);

  const handleEnhancePrompt = async () => {
    try {
      setIsEnhancing(true);
      const res = await fetch('/api/enhance-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userPrompt: prompt,
          style: selectedPresetId,
          quoteText: quoteText,
          language: isUrdu ? 'ur' : 'en',
        }),
      });

      const data = await res.json();
      if (res.ok && data.enhancedPrompt) {
        onPromptChange(data.enhancedPrompt);
      }
    } catch (err) {
      console.error('Failed to enhance prompt:', err);
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleAddTag = (tag: string) => {
    const updated = prompt ? `${prompt.trim()}, ${tag}` : tag;
    onPromptChange(updated);
  };

  const QUICK_TAGS = [
    'natural speaking lip sync',
    'expressive hand gesturing',
    'slow cinematic camera push-in',
    'warm studio rim lighting',
    'lifelike eye blinking and gaze',
    '24fps photorealistic motion blur',
    'shallow depth of field bokeh',
  ];

  return (
    <div className="space-y-4 p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800/80">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
          <Film className="w-4 h-4 text-amber-400" />
          <span>{isUrdu ? '۴. متحرک ویڈیو اسٹائل اور پرامپٹ' : '4. Video Motion Style & Veo Prompt'}</span>
        </label>
        <span className="text-[11px] text-zinc-400">
          {isUrdu ? 'ویو ماڈل کے لیے ہدایات' : 'Veo Director Prompt'}
        </span>
      </div>

      {/* Motion Style Presets Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {MOTION_PRESETS.map((preset) => {
          const isSelected = selectedPresetId === preset.id;
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => onPresetSelect(preset)}
              className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                isSelected
                  ? 'border-amber-500 bg-amber-500/10 text-white ring-1 ring-amber-500/30'
                  : 'border-zinc-800/80 bg-zinc-950/60 text-zinc-300 hover:border-zinc-700 hover:bg-zinc-900'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-1">
                <span className="text-xs font-bold text-zinc-100 flex items-center gap-1.5">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isSelected ? 'bg-amber-400' : 'bg-zinc-600'
                    }`}
                  />
                  {isUrdu ? preset.titleUrdu : preset.title}
                </span>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">
                  {isSelected ? 'Active' : 'Style'}
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 line-clamp-2">
                {preset.description}
              </p>
            </button>
          );
        })}
      </div>

      {/* Prompt TextArea with Magic Enhance */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-zinc-400">
            {isUrdu ? 'تفصیلی موشن پرامپٹ (Veo Prompt)' : 'Veo Animation Prompt'}
          </span>
          <button
            type="button"
            onClick={handleEnhancePrompt}
            disabled={isEnhancing}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-medium transition-all disabled:opacity-50"
          >
            {isEnhancing ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Wand2 className="w-3.5 h-3.5" />
            )}
            <span>
              {isEnhancing
                ? isUrdu
                  ? 'پرامپٹ بہتر بنایا جا رہا ہے...'
                  : 'Enhancing...'
                : isUrdu
                ? 'جیمنائی سے پرامپٹ شاندار بنائیں'
                : 'Enhance with Gemini 3.8'}
            </span>
          </button>
        </div>

        <textarea
          value={prompt}
          onChange={(e) => onPromptChange(e.target.value)}
          rows={3}
          placeholder="Describe how the speaker or scene should animate (e.g. passionate speaking, hand gestures, camera zoom)..."
          className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500 transition-colors resize-none leading-relaxed"
        />

        {/* Quick Tags Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider mr-1">
            {isUrdu ? 'فوری موشن ٹیگز:' : 'Add elements:'}
          </span>
          {QUICK_TAGS.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => handleAddTag(tag)}
              className="text-[10px] px-2 py-0.8 rounded-full bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-amber-300 transition-colors flex items-center gap-1"
            >
              <Plus className="w-2.5 h-2.5" />
              <span>{tag}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
