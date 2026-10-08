/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { ImagePicker } from './components/ImagePicker';
import { AspectConfig } from './components/AspectConfig';
import { MotivationalSpeechSelector } from './components/MotivationalSpeechSelector';
import { MotionPromptEditor } from './components/MotionPromptEditor';
import { GenerationModal } from './components/GenerationModal';
import { VideoPlayerView } from './components/VideoPlayerView';
import { HistoryDrawer } from './components/HistoryDrawer';
import {
  AspectRatio,
  Resolution,
  GeneratedVideoItem,
  GenerationStatus,
  MotionPreset,
} from './types';
import { MOTIVATIONAL_PRESETS, MOTION_PRESETS } from './constants/presets';
import { urlToBase64 } from './utils/helpers';
import { generateStudioVideo } from './utils/studioAnimator';
import { createDemoAnimatedVideo } from './utils/demoGenerator';
import { Play, Sparkles, Film, ArrowRight, Video, Flame, AlertCircle } from 'lucide-react';

export default function App() {
  const [lang, setLang] = useState<'ur' | 'en'>('ur');
  const isUrdu = lang === 'ur';

  // Core Generation State
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedMimeType, setSelectedMimeType] = useState<string>('image/jpeg');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('9:16');
  const [resolution, setResolution] = useState<Resolution>('720p');
  const [model, setModel] = useState<string>('veo-3.1-fast-generate-preview');
  const [engineMode, setEngineMode] = useState<'studio' | 'veo-cloud'>('studio');

  // Content & Motion
  const [currentQuote, setCurrentQuote] = useState<string>(MOTIVATIONAL_PRESETS[0].text);
  const [selectedPresetId, setSelectedPresetId] = useState<string>(MOTION_PRESETS[0].id);
  const [prompt, setPrompt] = useState<string>(MOTION_PRESETS[0].promptSnippet);
  const [audioBlobUrl, setAudioBlobUrl] = useState<string | null>(null);

  // Status & Progress
  const [status, setStatus] = useState<GenerationStatus>('idle');
  const [operationName, setOperationName] = useState<string | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isQuotaExceeded, setIsQuotaExceeded] = useState(false);

  // Results & History
  const [currentVideoItem, setCurrentVideoItem] = useState<GeneratedVideoItem | null>(null);
  const [history, setHistory] = useState<GeneratedVideoItem[]>([]);

  // Polling ref
  const pollIntervalRef = useRef<any>(null);
  const timerIntervalRef = useRef<any>(null);

  // Pre-load default speaker image on mount
  useEffect(() => {
    async function loadDefaultImage() {
      try {
        const { base64, mimeType } = await urlToBase64('/sample-speaker-portrait.jpg');
        setSelectedImage(base64);
        setSelectedMimeType(mimeType);
      } catch (e) {
        console.warn('Default image preload notice:', e);
      }
    }
    loadDefaultImage();
  }, []);

  // Timer effect for generation
  useEffect(() => {
    if (status !== 'idle' && status !== 'completed' && status !== 'failed') {
      timerIntervalRef.current = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [status]);

  // Clean up polling interval on unmount
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, []);

  const handleImageSelected = (
    base64: string,
    mimeType: string,
    defaultAspect?: AspectRatio
  ) => {
    setSelectedImage(base64);
    setSelectedMimeType(mimeType);
    if (defaultAspect) {
      setAspectRatio(defaultAspect);
    }
  };

  const handlePresetSelect = (preset: MotionPreset) => {
    setSelectedPresetId(preset.id);
    setPrompt(preset.promptSnippet);
  };

  const startGeneration = async () => {
    if (!selectedImage) return;

    try {
      setStatus('submitting');
      setErrorMessage(null);
      setElapsedSeconds(0);

      // Branch 1: Studio Engine (Free, Instant, No Paid Key Required)
      if (engineMode === 'studio') {
        const videoBlobUrl = await generateStudioVideo({
          imageBase64: selectedImage,
          aspectRatio,
          resolution,
          motionStyle: selectedPresetId,
          audioBlobUrl: audioBlobUrl,
          durationMs: 6000,
        });

        const newItem: GeneratedVideoItem = {
          id: `studio-${Date.now()}`,
          operationName: 'studio-cinematic-render',
          aspectRatio,
          resolution,
          model: 'Studio Animator (Fast & Free)',
          engineMode: 'studio',
          prompt: prompt || 'Studio realistic animation',
          quote: currentQuote,
          sourceImagePreview: selectedImage,
          videoBlobUrl,
          audioBlobUrl: audioBlobUrl || undefined,
          createdAt: Date.now(),
        };

        setCurrentVideoItem(newItem);
        setHistory((prev) => [newItem, ...prev]);
        setStatus('completed');
        return;
      }

      // Branch 2: Cloud Veo API Generation
      const response = await fetch('/api/generate-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: selectedImage,
          mimeType: selectedMimeType,
          prompt,
          aspectRatio,
          resolution,
          model,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorText = `${data.error || ''} ${data.message || ''} ${data.details || ''}`;
        if (
          response.status === 429 ||
          data.isQuotaExceeded ||
          errorText.includes('429') ||
          errorText.includes('quota') ||
          errorText.includes('RESOURCE_EXHAUSTED')
        ) {
          setIsQuotaExceeded(true);
          throw new Error(
            isUrdu
              ? 'ویو ماڈل کا کوٹہ مکمل ہو چکا ہے (429 RESOURCE_EXHAUSTED)۔ براہ کرم پیڈ کی منتخب کریں یا نیچے "ڈیمو اینیمیشن دیکھیں" آزمائیں!'
              : 'Veo Video Generation Quota Exceeded (429 RESOURCE_EXHAUSTED). Please select a paid key or test the instant Demo Preview!'
          );
        }
        throw new Error(data.error || 'Failed to start video generation');
      }

      setIsQuotaExceeded(false);
      const opName = data.operationName;
      setOperationName(opName);
      setStatus('polling');

      // 2. Poll Status
      pollIntervalRef.current = setInterval(async () => {
        try {
          const statusRes = await fetch('/api/video-status', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ operationName: opName }),
          });

          const statusData = await statusRes.json();

          if (!statusRes.ok) {
            throw new Error(statusData.error || 'Failed to check status');
          }

          if (statusData.done) {
            clearInterval(pollIntervalRef.current);

            if (statusData.error) {
              const errStr = typeof statusData.error === 'string' ? statusData.error : JSON.stringify(statusData.error);
              if (errStr.includes('429') || errStr.includes('quota') || errStr.includes('RESOURCE_EXHAUSTED')) {
                setIsQuotaExceeded(true);
              }
              throw new Error(errStr);
            }

            // 3. Download Generated Video Stream
            setStatus('downloading');
            const downloadRes = await fetch('/api/video-download', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ operationName: opName }),
            });

            if (!downloadRes.ok) {
              const errJson = await downloadRes.json().catch(() => ({}));
              throw new Error(errJson.error || 'Failed to download generated video');
            }

            const videoBlob = await downloadRes.blob();
            const videoUrl = URL.createObjectURL(videoBlob);

            const newItem: GeneratedVideoItem = {
              id: Date.now().toString(),
              operationName: opName,
              aspectRatio,
              resolution,
              model: data.modelUsed || model,
              prompt,
              quote: currentQuote,
              sourceImagePreview: selectedImage,
              videoBlobUrl: videoUrl,
              audioBlobUrl: audioBlobUrl || undefined,
              createdAt: Date.now(),
            };

            setCurrentVideoItem(newItem);
            setHistory((prev) => [newItem, ...prev]);
            setStatus('completed');
          }
        } catch (pollErr: any) {
          console.error('Polling error:', pollErr);
          clearInterval(pollIntervalRef.current);
          const msg = pollErr.message || 'Error occurred while generating video';
          if (msg.includes('429') || msg.includes('quota') || msg.includes('RESOURCE_EXHAUSTED')) {
            setIsQuotaExceeded(true);
          }
          setErrorMessage(msg);
          setStatus('failed');
        }
      }, 6000);
    } catch (err: any) {
      console.error('Generation initiation error:', err);
      const msg = err.message || 'Failed to start video generation';
      if (msg.includes('429') || msg.includes('quota') || msg.includes('RESOURCE_EXHAUSTED')) {
        setIsQuotaExceeded(true);
      }
      setErrorMessage(msg);
      setStatus('failed');
    }
  };

  const handleTryDemo = async () => {
    if (!selectedImage) return;
    try {
      setStatus('submitting');
      setErrorMessage(null);
      const demoVideoUrl = await createDemoAnimatedVideo(selectedImage, aspectRatio);

      const newItem: GeneratedVideoItem = {
        id: `demo-${Date.now()}`,
        operationName: 'demo-cinematic-render',
        aspectRatio,
        resolution,
        model: `${model} (Demo Simulation)`,
        prompt: prompt || 'Cinematic zoom and lighting animation',
        quote: currentQuote,
        sourceImagePreview: selectedImage,
        videoBlobUrl: demoVideoUrl,
        audioBlobUrl: audioBlobUrl || undefined,
        createdAt: Date.now(),
      };

      setCurrentVideoItem(newItem);
      setHistory((prev) => [newItem, ...prev]);
      setStatus('completed');
      setIsQuotaExceeded(false);
    } catch (err: any) {
      console.error('Demo generation error:', err);
      setErrorMessage('Could not render demo video');
      setStatus('failed');
    }
  };

  const handleCancelGeneration = () => {
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    setStatus('idle');
    setErrorMessage(null);
    setIsQuotaExceeded(false);
  };

  const handleToggleLang = () => {
    setLang((prev) => (prev === 'ur' ? 'en' : 'ur'));
  };

  return (
    <div
      className={`min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans ${
        isUrdu ? 'rtl' : 'ltr'
      }`}
      dir={isUrdu ? 'rtl' : 'ltr'}
    >
      {/* Navigation Header */}
      <Header
        currentLang={lang}
        onToggleLang={handleToggleLang}
        activeModel={model}
        engineMode={engineMode}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Hero Motivational Banner */}
        <div className="relative overflow-hidden rounded-3xl border border-zinc-800/80 bg-gradient-to-r from-zinc-900 via-zinc-900/90 to-zinc-950 p-6 sm:p-8 shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/20">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>{isUrdu ? 'ویو ۳.۱ فاسٹ اینیمیشن اسٹوڈیو' : 'Veo 3.1 Fast Image-to-Video Studio'}</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white leading-tight">
              {isUrdu
                ? 'کسی بھی تصویر کو حقیقت پسندانہ متحرک ویڈیو میں تبدیل کریں'
                : 'Animate Photos into Cinematic Videos with Google Veo'}
            </h2>

            <p className="text-sm text-zinc-300 font-urdu leading-relaxed">
              "کامیابی اُنہی لوگوں کو ملتی ہے جو اپنے خوابوں پر یقین رکھتے ہیں۔ راستہ کتنا ہی مشکل کیوں نہ ہو، ہمت نہیں ہارنی چاہیے۔"
            </p>
          </div>
        </div>

        {/* Studio Workspace Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Image Source & Formats (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <ImagePicker
              selectedImage={selectedImage}
              onImageSelected={handleImageSelected}
              aspectRatio={aspectRatio}
              isUrdu={isUrdu}
            />

            <AspectConfig
              aspectRatio={aspectRatio}
              onAspectRatioChange={setAspectRatio}
              resolution={resolution}
              onResolutionChange={setResolution}
              model={model}
              onModelChange={setModel}
              engineMode={engineMode}
              onEngineModeChange={setEngineMode}
              isUrdu={isUrdu}
            />
          </div>

          {/* Right Column: Quotes, Motion, and Output (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* If video is generated and completed, show player view; otherwise show configuration */}
            {currentVideoItem && status === 'completed' ? (
              <VideoPlayerView
                item={currentVideoItem}
                isUrdu={isUrdu}
                onNewGeneration={() => {
                  setCurrentVideoItem(null);
                  setStatus('idle');
                }}
              />
            ) : (
              <>
                <MotivationalSpeechSelector
                  currentQuote={currentQuote}
                  onQuoteChange={setCurrentQuote}
                  audioBlobUrl={audioBlobUrl}
                  onAudioGenerated={setAudioBlobUrl}
                  isUrdu={isUrdu}
                />

                <MotionPromptEditor
                  prompt={prompt}
                  onPromptChange={setPrompt}
                  selectedPresetId={selectedPresetId}
                  onPresetSelect={handlePresetSelect}
                  quoteText={currentQuote}
                  isUrdu={isUrdu}
                />

                {/* Main Action Call-To-Action */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={startGeneration}
                    disabled={!selectedImage || status !== 'idle'}
                    className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-zinc-950 font-black text-base shadow-xl shadow-amber-500/25 transition-all duration-200 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group active:scale-[0.99]"
                  >
                    <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                    <span>
                      {isUrdu
                        ? engineMode === 'studio'
                          ? 'اینیمیٹڈ ویڈیو بنائیں (اسٹوڈیو اینیمیٹر)'
                          : 'ویو ۳.۱ فاسٹ سے ویڈیو بنائیں'
                        : `Generate Video (${aspectRatio} • ${resolution})`}
                    </span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform rtl:rotate-180" />
                  </button>

                  <div className="mt-3 flex items-center justify-center gap-3 text-xs text-zinc-500 font-mono">
                    <span>
                      Engine: {engineMode === 'studio' ? 'Cinematic Studio (Free)' : model}
                    </span>
                    <span>•</span>
                    <span>Aspect Ratio: {aspectRatio}</span>
                    <span>•</span>
                    <span>Quality: {resolution}</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Video Creations History Drawer */}
        <HistoryDrawer
          items={history}
          selectedId={currentVideoItem?.id || null}
          onSelectItem={(item) => {
            setCurrentVideoItem(item);
            setStatus('completed');
          }}
          onClearHistory={() => setHistory([])}
          isUrdu={isUrdu}
        />
      </main>

      {/* Progress / Loading Modal */}
      <GenerationModal
        status={status}
        elapsedSeconds={elapsedSeconds}
        currentQuote={currentQuote}
        errorMessage={errorMessage}
        isQuotaExceeded={isQuotaExceeded}
        onCancel={handleCancelGeneration}
        onTryDemo={handleTryDemo}
        isUrdu={isUrdu}
        model={model}
        engineMode={engineMode}
      />
    </div>
  );
}
