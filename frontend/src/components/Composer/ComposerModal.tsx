import React, { useState } from 'react';
import { X, Mic, Layers, FileText, Share2, Sparkles } from 'lucide-react';
import type { GenerateParams, Persona } from '../../types';

interface ComposerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (params: GenerateParams) => void;
  isGenerating?: boolean;
  personas?: Persona[];
}

const TONES = [
  { id: 'engaging', label: 'Engaging & Viral', desc: 'Punchy hooks, conversational' },
  { id: 'professional', label: 'Professional', desc: 'Thought leadership, refined' },
  { id: 'technical', label: 'Technical', desc: 'Engineering-focused, concise' },
  { id: 'announcement', label: 'Launch / News', desc: 'Big updates and milestones' }
];

export const ComposerModal: React.FC<ComposerModalProps> = ({
  isOpen,
  onClose,
  onGenerate,
  isGenerating,
  personas = [],
}) => {
  const [topic, setTopic] = useState('');
  const [tone, setTone] = useState('engaging');
  const [format, setFormat] = useState<'single' | 'thread' | 'carousel'>('single');
  const [selectedPersonaId, setSelectedPersonaId] = useState<string>(
    personas.find(p => p.is_default)?.id || personas[0]?.id || ''
  );
  const [platforms, setPlatforms] = useState<string[]>(['twitter', 'linkedin']);

  if (!isOpen) return null;

  const togglePlatform = (p: string) => {
    setPlatforms(prev =>
      prev.includes(p)
        ? (prev.length > 1 ? prev.filter(item => item !== p) : prev)
        : [...prev, p]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;
    onGenerate({
      topic: topic.trim(),
      tone,
      persona_id: selectedPersonaId || undefined,
      target_platforms: platforms,
      is_thread: format === 'thread',
      content_format: format,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-semibold text-slate-900">
              Create Draft — Loopcast AI
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Topic or Brief
            </label>
            <textarea
              rows={3}
              required
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., We rebuilt our indexing engine from scratch to handle 10x throughput..."
              className="w-full text-xs p-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-slate-900 placeholder:text-slate-400 resize-none"
            />
          </div>

          {/* Content Format Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Content Format & Structure
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setFormat('single')}
                className={`flex flex-col items-center justify-center p-2.5 rounded-lg border text-center transition-all cursor-pointer ${
                  format === 'single'
                    ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Share2 className="w-4 h-4 mb-1 text-slate-700" />
                <span className="text-[11px] font-semibold">Standard</span>
                <span className="text-[9px] text-slate-400">Single post</span>
              </button>

              <button
                type="button"
                onClick={() => setFormat('thread')}
                className={`flex flex-col items-center justify-center p-2.5 rounded-lg border text-center transition-all cursor-pointer ${
                  format === 'thread'
                    ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Layers className="w-4 h-4 mb-1 text-indigo-600" />
                <span className="text-[11px] font-semibold">X Thread</span>
                <span className="text-[9px] text-slate-400">3-7 tweets</span>
              </button>

              <button
                type="button"
                onClick={() => setFormat('carousel')}
                className={`flex flex-col items-center justify-center p-2.5 rounded-lg border text-center transition-all cursor-pointer ${
                  format === 'carousel'
                    ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <FileText className="w-4 h-4 mb-1 text-[#0a66c2]" />
                <span className="text-[11px] font-semibold">Carousel</span>
                <span className="text-[9px] text-slate-400">5 slides</span>
              </button>
            </div>
          </div>

          {/* Persona Selection */}
          {personas.length > 0 && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <Mic className="w-3.5 h-3.5 text-indigo-600" />
                Brand Voice Persona
              </label>
              <select
                value={selectedPersonaId}
                onChange={(e) => setSelectedPersonaId(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-900 bg-white cursor-pointer"
              >
                {personas.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} — {p.archetype} ({p.tone_profile?.formality ? 'Formality ' + p.tone_profile.formality + '%' : 'Default'})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Target Platforms */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Target Platforms
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => togglePlatform('twitter')}
                className={`flex-1 py-1.5 px-3 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                  platforms.includes('twitter')
                    ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                X (Twitter)
              </button>
              <button
                type="button"
                onClick={() => togglePlatform('linkedin')}
                className={`flex-1 py-1.5 px-3 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                  platforms.includes('linkedin')
                    ? 'border-[#0a66c2] bg-[#0a66c2] text-white shadow-xs'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                LinkedIn
              </button>
            </div>
          </div>

          {/* Tone Archetype */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Tone Preset
            </label>
            <div className="grid grid-cols-2 gap-2">
              {TONES.map(t => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTone(t.id)}
                  className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                    tone === t.id
                      ? 'border-indigo-600 bg-indigo-50/50 text-indigo-950'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <p className="text-xs font-semibold">{t.label}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">{t.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isGenerating || !topic.trim()}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center space-x-1.5 disabled:opacity-50 cursor-pointer"
            >
              {isGenerating ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Generating Pipeline...</span>
                </>
              ) : (
                <span>Generate Draft</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
