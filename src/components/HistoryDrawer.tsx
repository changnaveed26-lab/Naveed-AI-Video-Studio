import React from 'react';
import { History, Play, Trash2, Film, Clock } from 'lucide-react';
import { GeneratedVideoItem } from '../types';

interface HistoryDrawerProps {
  items: GeneratedVideoItem[];
  selectedId: string | null;
  onSelectItem: (item: GeneratedVideoItem) => void;
  onClearHistory: () => void;
  isUrdu: boolean;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  items,
  selectedId,
  onSelectItem,
  onClearHistory,
  isUrdu,
}) => {
  if (items.length === 0) return null;

  return (
    <div className="p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
          <History className="w-3.5 h-3.5 text-amber-400" />
          <span>{isUrdu ? 'تیار کردہ ویڈیوز (تاریخچہ)' : 'Recent Video Creations'}</span>
          <span className="px-1.5 py-0.2 rounded-full bg-zinc-800 text-zinc-400 font-mono text-[10px]">
            {items.length}
          </span>
        </h3>
        <button
          type="button"
          onClick={onClearHistory}
          className="text-[11px] text-zinc-500 hover:text-rose-400 transition-colors flex items-center gap-1"
        >
          <Trash2 className="w-3 h-3" />
          <span>{isUrdu ? 'صاف کریں' : 'Clear'}</span>
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
        {items.map((item) => {
          const isSelected = item.id === selectedId;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectItem(item)}
              className={`group relative rounded-xl overflow-hidden border text-left transition-all ${
                isSelected
                  ? 'border-amber-500 ring-2 ring-amber-500/30'
                  : 'border-zinc-800 hover:border-zinc-700 bg-zinc-950'
              }`}
            >
              <div className="aspect-[9/16] relative bg-zinc-900 overflow-hidden">
                <img
                  src={item.sourceImagePreview}
                  alt="Thumbnail"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-8 h-8 rounded-full bg-amber-500 text-zinc-950 flex items-center justify-center shadow-lg">
                    <Play className="w-4 h-4 fill-current ml-0.5" />
                  </div>
                </div>
                <div className="absolute bottom-1 right-1 px-1 rounded bg-black/70 text-[9px] font-mono text-amber-400">
                  {item.aspectRatio}
                </div>
              </div>
              <div className="p-1.5 bg-zinc-950">
                <p className="text-[10px] text-zinc-300 truncate font-medium">
                  {item.prompt.slice(0, 24)}...
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
