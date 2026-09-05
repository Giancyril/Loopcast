import React, { useState } from 'react';
import { ABVariantPicker } from './ABVariantPicker';
import { FeedSimulatorCard } from './FeedSimulatorCard';
import { FlaskConical, BarChart3, Compass } from 'lucide-react';

export const SimulationLab: React.FC = () => {
  const [platform, setPlatform] = useState<'twitter' | 'linkedin'>('twitter');
  const [activeHook, setActiveHook] = useState(
    '90% of AI workflows are broken. Here is how top engineering teams fix them:'
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-8 text-white relative overflow-hidden border border-indigo-900/50 shadow-2xl">
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold tracking-wide uppercase border border-indigo-500/30">
            <FlaskConical className="w-3.5 h-3.5 text-indigo-400" />
            Social Simulation Sandbox & A/B Hook Lab
          </div>
          <h1 className="text-2xl lg:text-3xl font-black tracking-tight text-white">
            Pre-flight Simulation & Hook Battle
          </h1>
          <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
            Test and simulate audience engagement before pushing posts live. Run multi-variant A/B tests to predict virality score, CTR, sentiment distribution, and feed appearance.
          </p>

          {/* Quick Switcher */}
          <div className="pt-2 flex items-center gap-3">
            <button
              onClick={() => setPlatform('twitter')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                platform === 'twitter'
                  ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/25'
                  : 'bg-white/10 hover:bg-white/20 text-slate-300'
              }`}
            >
              <span className="font-mono font-bold text-xs">𝕏</span>
              Twitter (X) Simulation
            </button>
            <button
              onClick={() => setPlatform('linkedin')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                platform === 'linkedin'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                  : 'bg-white/10 hover:bg-white/20 text-slate-300'
              }`}
            >
              <span className="font-bold text-xs bg-white text-blue-600 px-1 rounded-xs">in</span>
              LinkedIn Feed Simulation
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: A/B Variant Lab & Live Feed Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Hook Variant Lab */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <ABVariantPicker
            platform={platform}
            onSelectWinningHook={(hook) => setActiveHook(hook)}
          />
        </div>

        {/* Right Column: Live Feed Simulator */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-indigo-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Live Feed Render Preview
                </h3>
              </div>
              <span className="text-[10px] font-semibold text-slate-400 uppercase">
                {platform.toUpperCase()} FEED
              </span>
            </div>

            {/* Simulated Post Card */}
            <div className="flex justify-center">
              <FeedSimulatorCard
                platform={platform}
                content={`${activeHook}\n\n1. Autonomous multi-agent pipelines\n2. Guardrail persona verification\n3. Algorithmic best-time delivery\n\nFull architecture breakdown below 🧵👇`}
                predictedLikes={platform === 'twitter' ? 418 : 284}
                predictedShares={platform === 'twitter' ? 95 : 62}
                predictedComments={platform === 'twitter' ? 52 : 38}
                predictedViews={platform === 'twitter' ? 18500 : 11200}
              />
            </div>
          </div>

          {/* Persona Tone & Sentiment Metrics Widget */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-emerald-600" />
              Projected Audience Sentiment
            </h4>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                <div className="text-base font-bold text-emerald-700">74%</div>
                <div className="text-[10px] text-emerald-600 font-medium">Positive</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="text-base font-bold text-slate-700">19%</div>
                <div className="text-[10px] text-slate-500 font-medium">Neutral</div>
              </div>
              <div className="p-3 bg-rose-50 rounded-xl border border-rose-100">
                <div className="text-base font-bold text-rose-700">7%</div>
                <div className="text-[10px] text-rose-600 font-medium">Critical</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

