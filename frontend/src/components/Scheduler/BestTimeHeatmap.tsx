import React, { useState, useEffect } from 'react';
import { Clock, TrendingUp, Zap, Star } from 'lucide-react';

interface HeatmapSlot {
  weekday: number;
  weekday_label: string;
  hour: number;
  score: number;
  estimated_reach: number;
  label: string;
  next_occurrence: string | null;
}

interface Recommendation {
  weekday: string;
  hour_utc: number;
  score: number;
  estimated_reach: number;
  label: string;
  next_occurrence: string;
}

interface PlatformData {
  heatmap: HeatmapSlot[];
  top_recommendations: Recommendation[];
}

interface BestTimeHeatmapProps {
  platforms?: string[];
  contentType?: string;
  personaId?: string;
}

const DEFAULT_PLATFORMS: string[] = ['twitter', 'linkedin', 'instagram'];

const PLATFORM_COLORS: Record<string, { bg: string; accent: string; border: string }> = {
  twitter: { bg: 'from-sky-500 to-blue-600', accent: 'text-sky-600', border: 'border-sky-200' },
  linkedin: { bg: 'from-blue-700 to-indigo-700', accent: 'text-blue-700', border: 'border-blue-200' },
  instagram: { bg: 'from-pink-500 to-purple-600', accent: 'text-pink-600', border: 'border-pink-200' },
};

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function scoreToColor(score: number): string {
  if (score >= 85) return 'bg-emerald-500';
  if (score >= 65) return 'bg-amber-400';
  if (score >= 20) return 'bg-slate-300';
  return 'bg-slate-100';
}

function scoreToOpacity(score: number): string {
  if (score >= 85) return 'opacity-100';
  if (score >= 65) return 'opacity-80';
  if (score >= 20) return 'opacity-40';
  return 'opacity-10';
}

export const BestTimeHeatmap: React.FC<BestTimeHeatmapProps> = ({
  platforms = DEFAULT_PLATFORMS,
  contentType = 'single',
  personaId,
}) => {
  const activePlatformsList = platforms.length > 0 ? platforms : DEFAULT_PLATFORMS;
  const [activePlatform, setActivePlatform] = useState<string>(activePlatformsList[0] || 'twitter');
  const [data, setData] = useState<Record<string, PlatformData> | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [hoveredSlot, setHoveredSlot] = useState<HeatmapSlot | null>(null);

  const platformsKey = activePlatformsList.join(',');

  useEffect(() => {
    let isMounted = true;

    async function loadBestTimes() {
      try {
        const resp = await fetch('/api/v1/best-times', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            platforms: activePlatformsList,
            content_type: contentType,
            persona_id: personaId || null,
          }),
        });
        if (!resp.ok) throw new Error('API failed');
        const json = await resp.json();
        if (isMounted) {
          setData(json.recommendations);
          setLoading(false);
        }
      } catch {
        if (!isMounted) return;
        // Deterministic fallback mock data
        const mock: Record<string, PlatformData> = {};
        for (const p of activePlatformsList) {
          const heatmap: HeatmapSlot[] = [];
          for (let w = 0; w < 7; w++) {
            for (let h = 0; h < 24; h++) {
              const isGood = [9, 12, 17].includes(h) && w < 5;
              const isPeak = h === 12 && [1, 2, 3].includes(w);
              const score = isPeak ? 95 : isGood ? 70 : 0;
              heatmap.push({
                weekday: w,
                weekday_label: DAYS[w],
                hour: h,
                score,
                estimated_reach: isPeak ? 18000 : isGood ? 12000 : 0,
                label: isPeak ? 'Peak' : isGood ? 'Good' : 'Off-peak',
                next_occurrence: null,
              });
            }
          }
          mock[p] = {
            heatmap,
            top_recommendations: [
              { weekday: 'Tue', hour_utc: 12, score: 98.0, estimated_reach: 19200, label: 'Peak', next_occurrence: new Date().toISOString() },
              { weekday: 'Wed', hour_utc: 12, score: 92.0, estimated_reach: 18100, label: 'Peak', next_occurrence: new Date().toISOString() },
              { weekday: 'Wed', hour_utc: 9, score: 87.0, estimated_reach: 17400, label: 'Peak', next_occurrence: new Date().toISOString() },
            ],
          };
        }
        setData(mock);
        setLoading(false);
      }
    }

    loadBestTimes();

    return () => {
      isMounted = false;
    };
  }, [platformsKey, contentType, personaId]);

  const platformData = data?.[activePlatform];
  const colors = PLATFORM_COLORS[activePlatform] || PLATFORM_COLORS.twitter;

  const getSlot = (day: number, hour: number) =>
    platformData?.heatmap.find(s => s.weekday === day && s.hour === hour);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className={`bg-gradient-to-r ${colors.bg} px-6 py-4`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-white" />
            <h3 className="text-white font-bold text-sm">Best Time to Post</h3>
          </div>
          <div className="flex gap-2">
            {activePlatformsList.map(p => (
              <button
                key={p}
                onClick={() => setActivePlatform(p)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer capitalize ${
                  activePlatform === p
                    ? 'bg-white text-slate-800 shadow-sm'
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="p-6 space-y-5 min-h-[360px]">
        {/* Top recommendations */}
        {platformData?.top_recommendations && (
          <div className="grid grid-cols-3 gap-3">
            {platformData.top_recommendations.map((rec, i) => (
              <div
                key={i}
                className={`rounded-xl border ${colors.border} p-3 bg-slate-50 relative overflow-hidden`}
              >
                {i === 0 && (
                  <div className="absolute top-2 right-2">
                    <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                  </div>
                )}
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Zap className={`w-3.5 h-3.5 ${colors.accent}`} />
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">#{i + 1} Slot</span>
                </div>
                <div className="text-sm font-bold text-slate-900">{rec.weekday} {rec.hour_utc}:00 UTC</div>
                <div className={`text-xs font-semibold ${colors.accent} mt-0.5`}>{rec.label} — {rec.score.toFixed(0)}%</div>
                <div className="text-[10px] text-slate-400 mt-0.5">~{rec.estimated_reach.toLocaleString()} reach</div>
              </div>
            ))}
          </div>
        )}

        {/* Heatmap grid */}
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin w-6 h-6 border-2 border-slate-300 border-t-slate-700 rounded-full" />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <div className="min-w-[600px]">
                {/* Hour labels */}
                <div className="flex mb-1 ml-10">
                  {HOURS.filter(h => h % 3 === 0).map(h => (
                    <div key={h} className="text-[9px] text-slate-400 text-center" style={{ width: `${(3 / 24) * 100}%` }}>
                      {h}h
                    </div>
                  ))}
                </div>

                {/* Grid rows */}
                {DAYS.map((day, dayIdx) => (
                  <div key={day} className="flex items-center gap-1 mb-0.5">
                    <div className="w-10 text-[10px] text-slate-500 text-right pr-1 shrink-0">{day}</div>
                    <div className="flex flex-1 gap-px">
                      {HOURS.map(h => {
                        const slot = getSlot(dayIdx, h);
                        return (
                          <div
                            key={h}
                            className={`flex-1 h-5 rounded-sm cursor-pointer transition-all hover:scale-110 hover:z-10 relative ${
                              slot && slot.score > 0
                                ? `${scoreToColor(slot.score)} ${scoreToOpacity(slot.score)}`
                                : 'bg-slate-100'
                            }`}
                            onMouseEnter={() => slot && slot.score > 0 ? setHoveredSlot(slot) : null}
                            onMouseLeave={() => setHoveredSlot(null)}
                          />
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tooltip */}
            {hoveredSlot && (
              <div className="bg-slate-900 text-white text-xs rounded-lg px-3 py-2 shadow-xl inline-flex gap-3 items-center">
                <Clock className="w-3 h-3 text-slate-400" />
                <span className="font-medium">{hoveredSlot.weekday_label} {hoveredSlot.hour}:00 UTC</span>
                <span className={`font-bold ${hoveredSlot.score >= 85 ? 'text-emerald-400' : hoveredSlot.score >= 65 ? 'text-amber-400' : 'text-slate-400'}`}>
                  {hoveredSlot.label} ({hoveredSlot.score}%)
                </span>
                <span className="text-slate-400">~{hoveredSlot.estimated_reach.toLocaleString()} reach</span>
              </div>
            )}

            {/* Legend */}
            <div className="flex items-center gap-4 pt-1">
              <span className="text-[10px] text-slate-400 font-medium">Engagement:</span>
              {[['Peak', 'bg-emerald-500'], ['Good', 'bg-amber-400'], ['Average', 'bg-slate-300'], ['Off-peak', 'bg-slate-100']].map(([label, cls]) => (
                <div key={label} className="flex items-center gap-1.5">
                  <div className={`w-3 h-3 rounded-sm ${cls}`} />
                  <span className="text-[10px] text-slate-500">{label}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
