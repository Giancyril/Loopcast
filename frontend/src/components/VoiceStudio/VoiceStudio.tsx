import React, { useState } from "react";
import type { Persona } from "../../types";
import {
  Mic,
  Sliders,
  ShieldAlert,
  Sparkles,
  Plus,
  Trash2,
  CheckCircle,
  Tag,
  Users,
  Quote,
  Flame,
} from "lucide-react";
import { useToast } from "../Layout/ToastProvider";

interface VoiceStudioProps {
  personas: Persona[];
  onRefresh?: () => void;
  onUpdatePersona: (id: string, updates: Partial<Persona>) => Promise<void>;
  onCreatePersona: (persona: Partial<Persona>) => Promise<void>;
  onDeletePersona: (id: string) => Promise<void>;
}

export const VoiceStudio: React.FC<VoiceStudioProps> = ({
  personas,
  onUpdatePersona,
  onCreatePersona,
  onDeletePersona,
}) => {
  const { toast } = useToast();
  const [selectedId, setSelectedId] = useState<string>(
    personas.find((p) => p.is_default)?.id || personas[0]?.id || ""
  );
  const [newBannedWord, setNewBannedWord] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: "",
    handle_or_tag: "@voice",
    bio: "",
    archetype: "founder",
    target_audience: "Tech Builders & Creators",
  });

  const activePersona = personas.find((p) => p.id === selectedId) || personas[0];

  const handleSliderChange = async (key: string, value: number) => {
    if (!activePersona) return;
    const updatedAttrs = {
      ...activePersona.tone_attributes,
      [key]: value,
    };
    try {
      await onUpdatePersona(activePersona.id, { tone_attributes: updatedAttrs });
      toast("Tone attribute updated", "success");
    } catch {
      toast("Failed to update tone", "error");
    }
  };

  const handleAddBannedWord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBannedWord.trim() || !activePersona) return;
    const word = newBannedWord.trim().toLowerCase();
    if (activePersona.banned_words.includes(word)) {
      toast("Word is already on blacklist", "info");
      return;
    }
    const updated = [...activePersona.banned_words, word];
    try {
      await onUpdatePersona(activePersona.id, { banned_words: updated });
      setNewBannedWord("");
      toast(`Added "${word}" to banned blacklist`, "success");
    } catch {
      toast("Failed to add banned word", "error");
    }
  };

  const handleRemoveBannedWord = async (word: string) => {
    if (!activePersona) return;
    const updated = activePersona.banned_words.filter((w) => w !== word);
    try {
      await onUpdatePersona(activePersona.id, { banned_words: updated });
      toast(`Removed "${word}" from blacklist`, "info");
    } catch {
      toast("Failed to remove word", "error");
    }
  };

  const handleSetDefault = async () => {
    if (!activePersona) return;
    try {
      await onUpdatePersona(activePersona.id, { is_default: true });
      toast(`"${activePersona.name}" set as active default persona`, "success");
    } catch {
      toast("Failed to set default persona", "error");
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.name.trim()) return;
    try {
      await onCreatePersona({
        ...createForm,
        tone_attributes: { wit: 60, formality: 40, provocation: 50, technical_depth: 75 },
        banned_words: ["delve", "game-changer", "unleash"],
        sample_hooks: ["Here is what most teams get wrong about this:"],
        is_default: false,
      });
      setIsCreating(false);
      setCreateForm({
        name: "",
        handle_or_tag: "@voice",
        bio: "",
        archetype: "founder",
        target_audience: "Tech Builders & Creators",
      });
      toast("New persona voice created successfully", "success");
    } catch {
      toast("Failed to create persona", "error");
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 max-w-6xl mx-auto w-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Mic className="w-5 h-5 text-indigo-600" />
            <span>Voice Studio & Persona DNA</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure distinct brand identities, tone sliders, and buzzword blacklists enforced by LangGraph.
          </p>
        </div>

        <button
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Persona</span>
        </button>
      </div>

      {/* Persona Selection Pills */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {personas.map((p) => {
          const isSelected = p.id === (activePersona?.id || "");
          return (
            <div
              key={p.id}
              onClick={() => setSelectedId(p.id)}
              className={`p-4 rounded-xl border transition-all cursor-pointer relative ${
                isSelected
                  ? "bg-indigo-50/70 border-indigo-300 ring-1 ring-indigo-400 shadow-xs"
                  : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50"
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-100/70 px-2 py-0.5 rounded-full">
                    {p.archetype}
                  </span>
                  <h3 className="text-xs font-bold text-slate-900 mt-1.5">{p.name}</h3>
                  <p className="text-[11px] text-slate-500 line-clamp-2 mt-1">{p.bio}</p>
                </div>
              </div>
              {p.is_default && (
                <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 font-semibold mt-2">
                  <CheckCircle className="w-3 h-3" /> Default Active
                </span>
              )}
            </div>
          );
        })}
      </div>

      {activePersona && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Sliders & DNA */}
          <div className="lg:col-span-2 space-y-6">
            {/* Persona Overview Card */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900">{activePersona.name}</h3>
                    <span className="text-xs font-mono text-slate-400">{activePersona.handle_or_tag}</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">{activePersona.bio}</p>
                </div>
                {!activePersona.is_default && (
                  <button
                    onClick={handleSetDefault}
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 cursor-pointer"
                  >
                    Set as Default
                  </button>
                )}
              </div>

              <div className="flex items-center gap-4 text-xs text-slate-500 pt-3 border-t border-slate-100">
                <span className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-indigo-500" />
                  Audience: <strong className="text-slate-800">{activePersona.target_audience}</strong>
                </span>
              </div>
            </div>

            {/* Tone Sliders Card */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-5">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <Sliders className="w-4 h-4 text-indigo-600" />
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Tone & Stylistic Calibrations
                </h4>
              </div>

              {[
                { key: "wit", label: "Wit & Humor vs Direct Earnestness", left: "Serious", right: "Witty / Punchy" },
                { key: "technical_depth", label: "Technical Depth vs Simplicity", left: "High-level", right: "Deep Technical" },
                { key: "provocation", label: "Provocation & Contrarian Heat", left: "Consensus", right: "Provocative Take" },
                { key: "formality", label: "Formality vs Conversational Cadence", left: "Casual", right: "Executive / Formal" },
              ].map(({ key, label, left, right }) => {
                const val = activePersona.tone_attributes[key] ?? 50;
                return (
                  <div key={key} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold text-slate-800">
                      <span>{label}</span>
                      <span className="font-mono text-indigo-600">{val}%</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={val}
                      onChange={(e) => handleSliderChange(key, Number(e.target.value))}
                      className="w-full accent-indigo-600 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>{left}</span>
                      <span>{right}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Sample Hooks Card */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <Quote className="w-4 h-4 text-indigo-600" />
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Style Anchors & Signature Hooks
                </h4>
              </div>
              <div className="space-y-2">
                {activePersona.sample_hooks.map((hook, i) => (
                  <div
                    key={i}
                    className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs text-slate-700 italic flex items-start gap-2"
                  >
                    <Flame className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                    <span>"{hook}"</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Col: Banned Buzzwords Blacklist */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <ShieldAlert className="w-4 h-4 text-rose-500" />
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Forbidden Buzzword Blacklist
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    LangGraph will automatically reject drafts using these terms.
                  </p>
                </div>
              </div>

              <form onSubmit={handleAddBannedWord} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add banned word (e.g. delve)..."
                  value={newBannedWord}
                  onChange={(e) => setNewBannedWord(e.target.value)}
                  className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:ring-1 focus:ring-indigo-500 outline-none"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg cursor-pointer"
                >
                  Add
                </button>
              </form>

              <div className="flex flex-wrap gap-1.5 pt-2">
                {activePersona.banned_words.map((word) => (
                  <span
                    key={word}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium"
                  >
                    <Tag className="w-3 h-3 text-rose-400" />
                    {word}
                    <button
                      onClick={() => handleRemoveBannedWord(word)}
                      className="hover:text-rose-900 cursor-pointer ml-1"
                    >
                      &times;
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Danger Zone */}
            {personas.length > 1 && (
              <div className="bg-white rounded-xl border border-rose-100 p-5 shadow-xs space-y-3">
                <h5 className="text-xs font-bold text-rose-800 uppercase tracking-wider">Delete Persona</h5>
                <p className="text-[11px] text-slate-500">
                  Permanently remove this persona voice definition.
                </p>
                <button
                  onClick={async () => {
                    if (confirm(`Delete persona "${activePersona.name}"?`)) {
                      await onDeletePersona(activePersona.id);
                      toast("Persona deleted", "info");
                    }
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-lg cursor-pointer font-semibold"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete {activePersona.name}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create Modal */}
      {isCreating && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-md p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              Create New Brand Voice Persona
            </h3>

            <form onSubmit={handleCreateSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Persona Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Maverick Growth Advisor"
                  value={createForm.name}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Archetype</label>
                  <select
                    value={createForm.archetype}
                    onChange={(e) => setCreateForm({ ...createForm, archetype: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs outline-none focus:border-indigo-500"
                  >
                    <option value="founder">Founder</option>
                    <option value="explainer">Explainer</option>
                    <option value="growth_hacker">Growth Hacker</option>
                    <option value="executive">Executive</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Handle / Tag</label>
                  <input
                    type="text"
                    value={createForm.handle_or_tag}
                    onChange={(e) => setCreateForm({ ...createForm, handle_or_tag: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Core Bio & Philosophy</label>
                <textarea
                  rows={2}
                  placeholder="How this persona thinks, writes, and views the world..."
                  value={createForm.bio}
                  onChange={(e) => setCreateForm({ ...createForm, bio: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Target Audience</label>
                <input
                  type="text"
                  value={createForm.target_audience}
                  onChange={(e) => setCreateForm({ ...createForm, target_audience: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg cursor-pointer shadow-xs"
                >
                  Save Persona
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};