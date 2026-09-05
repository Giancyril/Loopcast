import React, { useState } from 'react';
import { X } from 'lucide-react';
import type { GenerateParams } from '../../types';

interface ComposerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (params: GenerateParams) => void;
  isGenerating?: boolean;
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
}) => {
  const [topic, setTopic] = useState('');
  const [tone, setTone] = useState('engaging');
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
      target_platforms: platforms
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-2">
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
          {/* Topic input */}
          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-1.5">
              Content Topic or Brief
            </label>
            <textarea
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Announcing our new open-source LangGraph multi-platform social media scheduler with human approval..."
              rows={3}
              className="w-full text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400 resize-none font-sans"
              required
            />
          </div>

          {/* Tone Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-1.5">
              Voice & Tone
            </label>
            <div className="grid grid-cols-2 gap-2">
              {TONES.map(t => (
                <button
                  type="button"
                  key={t.id}
                  onClick={() => setTone(t.id)}
                  className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${tone === t.id
                    ? 'border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-600'
                    : 'border-slate-200 hover:bg-slate-50'
                    }`}
                >
                  <span className="block text-xs font-semibold text-slate-900">{t.label}</span>
                  <span className="block text-[10px] text-slate-500">{t.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Target Platforms */}
          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-1.5">
              Target Networks
            </label>
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={() => togglePlatform('twitter')}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg border text-xs font-medium cursor-pointer transition-all ${platforms.includes('twitter')
                  ? 'border-slate-900 bg-slate-900 text-white'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
              >
                <span className="font-bold">X</span>
                <span>(Twitter)</span>
              </button>

              <button
                type="button"
                onClick={() => togglePlatform('linkedin')}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg border text-xs font-medium cursor-pointer transition-all ${platforms.includes('linkedin')
                  ? 'border-[#0a66c2] bg-[#0a66c2] text-white'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
              >
                <span className="font-bold">in</span>
                <span>LinkedIn</span>
              </button>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isGenerating || !topic.trim()}
              className="flex items-center space-x-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-all disabled:opacity-50 cursor-pointer"
            >

              <span>{isGenerating ? 'Running Agent...' : 'Generate & Critique'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
