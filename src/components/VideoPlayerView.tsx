import React, { useRef, useState, useEffect } from 'react';
import {
  Play,
  Pause,
  Download,
  RotateCcw,
  Maximize2,
  Volume2,
  VolumeX,
  Split,
  Eye,
  Film,
  Sparkles,
  Share2,
} from 'lucide-react';
import { GeneratedVideoItem } from '../types';
import { downloadBlob } from '../utils/helpers';

interface VideoPlayerViewProps {
  item: GeneratedVideoItem;
  isUrdu: boolean;
  onNewGeneration: () => void;
}

export const VideoPlayerView: React.FC<VideoPlayerViewProps> = ({
  item,
  isUrdu,
  onNewGeneration,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [audioOverlayEnabled, setAudioOverlayEnabled] = useState(Boolean(item.audioBlobUrl));
  const [showOriginalComparison, setShowOriginalComparison] = useState(false);
  const [sliderPosition, setSliderPosition] = useState(50); // percentage for split view

  useEffect(() => {
    // Autoplay when loaded
    if (videoRef.current) {
      videoRef.current.play().catch(() => setIsPlaying(false));
    }
  }, [item.videoBlobUrl]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      if (audioRef.current) audioRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      if (audioRef.current && audioOverlayEnabled) {
        audioRef.current.currentTime = videoRef.current.currentTime % (audioRef.current.duration || 1);
        audioRef.current.play();
      }
      setIsPlaying(true);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    const nextMuted = !isMuted;
    videoRef.current.muted = nextMuted;
    if (audioRef.current) audioRef.current.muted = nextMuted;
    setIsMuted(nextMuted);
  };

  const handleDownload = () => {
    if (item.videoBlobUrl) {
      downloadBlob(item.videoBlobUrl, `veo-animation-${item.aspectRatio.replace(':', '-')}.mp4`);
    }
  };

  const handleFullscreen = () => {
    if (containerRef.current) {
      if (!document.fullscreenElement) {
        containerRef.current.requestFullscreen().catch((err) => console.error(err));
      } else {
        document.exitFullscreen().catch((err) => console.error(err));
      }
    }
  };

  const handleRestart = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play();
      setIsPlaying(true);
    }
    if (audioRef.current && audioOverlayEnabled) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
    }
  };

  const isPortrait = item.aspectRatio === '9:16';

  return (
    <div className="space-y-6">
      {/* Top Banner with Stats & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <h2 className="text-base font-bold text-white">
              {isUrdu ? 'ویڈیو کامیابی سے تیار ہو گئی!' : 'Veo Video Rendered Successfully'}
            </h2>
            <span className="text-xs px-2 py-0.5 rounded-full font-mono bg-amber-500/10 text-amber-300 border border-amber-500/20">
              {item.aspectRatio}
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full font-mono bg-zinc-800 text-zinc-300">
              {item.resolution}
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5 font-mono">
            Model: {item.model}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Comparison Toggle */}
          <button
            type="button"
            onClick={() => setShowOriginalComparison(!showOriginalComparison)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
              showOriginalComparison
                ? 'bg-amber-500 text-zinc-950 border-amber-500 font-bold'
                : 'bg-zinc-800 text-zinc-200 border-zinc-700 hover:bg-zinc-700'
            }`}
          >
            <Split className="w-3.5 h-3.5" />
            <span>{isUrdu ? 'موازنہ (تصویر بمقابلہ ویڈیو)' : 'Split Comparison'}</span>
          </button>

          {/* Download Button */}
          <button
            type="button"
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isUrdu ? 'ویڈیو ڈاؤنلوڈ کریں' : 'Download MP4'}</span>
          </button>
        </div>
      </div>

      {/* Main Player Display */}
      <div
        ref={containerRef}
        className="relative mx-auto rounded-3xl overflow-hidden border border-zinc-800 bg-zinc-950 shadow-2xl flex items-center justify-center p-2 group"
      >
        <div
          className={`relative overflow-hidden rounded-2xl bg-zinc-900 flex items-center justify-center ${
            isPortrait
              ? 'aspect-[9/16] w-full max-w-[380px] h-auto max-h-[680px]'
              : 'aspect-[16/9] w-full max-w-[850px] h-auto max-h-[500px]'
          }`}
        >
          {/* Video Stream */}
          <video
            ref={videoRef}
            src={item.videoBlobUrl}
            autoPlay
            loop
            playsInline
            muted={isMuted}
            className="w-full h-full object-cover"
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          />

          {/* Hidden Audio Sync element for generated speech */}
          {item.audioBlobUrl && (
            <audio
              ref={audioRef}
              src={item.audioBlobUrl}
              loop
              muted={isMuted || !audioOverlayEnabled}
            />
          )}

          {/* Split Comparison Overlay */}
          {showOriginalComparison && item.sourceImagePreview && (
            <div
              className="absolute inset-y-0 left-0 overflow-hidden border-r-2 border-amber-400 z-10"
              style={{ width: `${sliderPosition}%` }}
            >
              <img
                src={item.sourceImagePreview}
                alt="Original source"
                className="absolute inset-0 w-full h-full object-cover"
                style={{
                  width: containerRef.current ? `${containerRef.current.offsetWidth}px` : '100%',
                  maxWidth: 'none',
                }}
              />
              <div className="absolute top-3 left-3 px-2 py-0.5 rounded bg-black/70 backdrop-blur-sm text-[10px] font-bold text-white uppercase tracking-wider">
                {isUrdu ? 'اصل تصویر' : 'Original Photo'}
              </div>
            </div>
          )}

          {showOriginalComparison && (
            <div className="absolute top-3 right-3 z-20 px-2 py-0.5 rounded bg-black/70 backdrop-blur-sm text-[10px] font-bold text-amber-400 uppercase tracking-wider">
              {isUrdu ? 'ویو متحرک ویڈیو' : 'Veo Animated'}
            </div>
          )}

          {/* Split Slider Handle */}
          {showOriginalComparison && (
            <input
              type="range"
              min="0"
              max="100"
              value={sliderPosition}
              onChange={(e) => setSliderPosition(Number(e.target.value))}
              className="absolute inset-x-0 bottom-16 z-30 opacity-70 hover:opacity-100 cursor-ew-resize mx-6 accent-amber-500"
            />
          )}

          {/* Player Controls Bar */}
          <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-zinc-950/90 via-zinc-950/40 to-transparent flex items-center justify-between z-20 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={togglePlay}
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm flex items-center justify-center transition-colors"
              >
                {isPlaying ? (
                  <Pause className="w-4 h-4 fill-current" />
                ) : (
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                )}
              </button>

              <button
                type="button"
                onClick={handleRestart}
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm flex items-center justify-center transition-colors"
                title="Replay from start"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={toggleMute}
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm flex items-center justify-center transition-colors"
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>

              {item.audioBlobUrl && (
                <button
                  type="button"
                  onClick={() => setAudioOverlayEnabled(!audioOverlayEnabled)}
                  className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border backdrop-blur-sm transition-all ${
                    audioOverlayEnabled
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-black/40 text-zinc-400 border-white/10'
                  }`}
                >
                  {isUrdu ? 'صوتی آواز: آن' : 'Voiceover Sync'}
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={handleFullscreen}
              className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm flex items-center justify-center transition-colors"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Quote & Generation Details Card */}
      <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-4">
        {item.quote && (
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-amber-400 mb-1">
              {isUrdu ? 'منسلک موٹیویشنل قول / تقریر' : 'Associated Motivational Speech'}
            </h4>
            <p className="text-sm text-zinc-200 font-urdu leading-relaxed bg-zinc-950 p-3.5 rounded-xl border border-zinc-800">
              "{item.quote}"
            </p>
          </div>
        )}

        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">
            {isUrdu ? 'ویو اینیمیشن پرامپٹ' : 'Veo Animation Prompt'}
          </h4>
          <p className="text-xs text-zinc-300 bg-zinc-950 p-3 rounded-xl border border-zinc-800 font-mono leading-relaxed">
            {item.prompt}
          </p>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={onNewGeneration}
            className="px-5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-zinc-100 transition-colors"
          >
            {isUrdu ? '+ ایک اور ویڈیو بنائیں' : '+ Animate Another Photo'}
          </button>
        </div>
      </div>
    </div>
  );
};
