import React, { useState } from 'react';
import { Presentation, ChevronLeft, ChevronRight, Sparkles, Target, BarChart3, CheckSquare } from 'lucide-react';

interface CarouselSlide {
  slide: number;
  title: string;
  subtitle?: string;
  content?: string;
  type: 'cover' | 'problem' | 'solution' | 'metrics' | 'cta';
}

interface LinkedInCarouselProps {
  slides: CarouselSlide[];
  topic?: string;
}

const SLIDE_THEMES: Record<string, { bg: string; icon: React.FC<{ className?: string }>; accent: string }> = {
  cover: { bg: 'bg-gradient-to-br from-indigo-600 to-violet-700', icon: Sparkles, accent: 'text-white' },
  problem: { bg: 'bg-gradient-to-br from-rose-500 to-orange-600', icon: Target, accent: 'text-white' },
  solution: { bg: 'bg-gradient-to-br from-emerald-500 to-teal-600', icon: Sparkles, accent: 'text-white' },
  metrics: { bg: 'bg-gradient-to-br from-sky-500 to-blue-700', icon: BarChart3, accent: 'text-white' },
  cta: { bg: 'bg-gradient-to-br from-amber-500 to-orange-500', icon: CheckSquare, accent: 'text-white' },
};

export const LinkedInCarousel: React.FC<LinkedInCarouselProps> = ({ slides, topic }) => {
  const [activeIdx, setActiveIdx] = useState(0);

  if (!slides || slides.length === 0) {
    return (
      <div className="flex items-center justify-center p-6 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-400">
        No carousel slides available.
      </div>
    );
  }

  const current = slides[activeIdx];
  const theme = SLIDE_THEMES[current.type] || SLIDE_THEMES.cover;
  const Icon = theme.icon;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
        <Presentation className="w-4 h-4 text-[#0a66c2]" />
        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
          LinkedIn Carousel Breakdown ({slides.length} Slides)
        </h4>
      </div>

      {/* Slide Preview */}
      <div className={`${theme.bg} rounded-xl p-6 min-h-[160px] relative overflow-hidden`}>
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white transform translate-x-8 -translate-y-8" />
          <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-white transform -translate-x-8 translate-y-8" />
        </div>

        <div className="relative z-10 space-y-2">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-bold uppercase tracking-wider">
              <Icon className="w-3 h-3" />
              {current.type}
            </span>
            <span className="text-white/70 text-[10px] font-mono">{activeIdx + 1} / {slides.length}</span>
          </div>

          <h3 className="text-white text-base font-bold leading-tight">{current.title}</h3>
          {current.subtitle && (
            <p className="text-white/85 text-xs">{current.subtitle}</p>
          )}
          {current.content && (
            <div className="mt-2 text-white/90 text-xs leading-relaxed whitespace-pre-line">
              {current.content}
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setActiveIdx(Math.max(0, activeIdx - 1))}
          disabled={activeIdx === 0}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          Prev
        </button>

        {/* Dot indicators */}
        <div className="flex gap-1.5">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveIdx(i)}
              className={`w-2 h-2 rounded-full transition-all cursor-pointer ${i === activeIdx ? 'bg-[#0a66c2] w-4' : 'bg-slate-300 hover:bg-slate-400'}`}
            />
          ))}
        </div>

        <button
          onClick={() => setActiveIdx(Math.min(slides.length - 1, activeIdx + 1))}
          disabled={activeIdx === slides.length - 1}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          Next
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};