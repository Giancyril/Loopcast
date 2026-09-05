import React from "react";
import {
  Mic,
  Inbox,
  CalendarDays,
  PlusCircle,
  Share2,
  RefreshCw,
  BarChart2,
  FlaskConical,
} from "lucide-react";

export type NavTab = "queue" | "calendar" | "personas" | "simulation" | "analytics" | "accounts";

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  pendingCount: number;
  onOpenComposer: () => void;
  onTriggerSync: () => void;
  isSyncing: boolean;
}

const NAV_ITEMS: {
  id: NavTab;
  label: string;
  icon: React.FC<{ className?: string }>;
  badgeKey?: "pendingCount";
}[] = [
    { id: "queue", label: "Approval Queue", icon: Inbox, badgeKey: "pendingCount" },
    { id: "calendar", label: "Calendar", icon: CalendarDays },
    { id: "personas", label: "Voice Studio", icon: Mic },`n    { id: "simulation", label: "Simulation Lab", icon: FlaskConical },
    { id: "analytics", label: "Analytics", icon: BarChart2 },
    { id: "accounts", label: "Connected Accounts", icon: Share2 },
  ];

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  pendingCount,
  onOpenComposer,
  onTriggerSync,
  isSyncing,
}) => {
  const badgeValues: Record<string, number> = { pendingCount };

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between select-none h-screen shrink-0">
      <div>
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-100">
          <div className="flex items-center space-x-2.5">
            <div>
              <h1 className="font-semibold text-slate-900 text-sm leading-tight tracking-tight">
                Loopcast
              </h1>
              <p className="text-[11px] text-slate-400 font-medium">
                AI-Powered Publishing Loop
              </p>
            </div>
          </div>
        </div>

        {/* Primary CTA */}
        <div className="p-3.5">
          <button
            id="btn-open-composer"
            onClick={onOpenComposer}
            className="w-full flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-semibold py-2.5 px-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-150 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create Draft with AI</span>
          </button>
        </div>

        {/* Navigation */}
        <nav className="px-3 space-y-0.5">
          {NAV_ITEMS.map(({ id, label, icon: Icon, badgeKey }) => {
            const isActive = currentTab === id;
            const badgeCount = badgeKey ? badgeValues[badgeKey] : 0;
            return (
              <button
                key={id}
                id={`nav-${id}`}
                onClick={() => onSelectTab(id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer ${isActive
                  ? "bg-indigo-50 text-indigo-700 font-semibold"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
              >
                <div className="flex items-center space-x-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? "text-indigo-600" : "text-slate-400"}`} />
                  <span>{label}</span>
                </div>
                {badgeCount > 0 && (
                  <span className="bg-amber-100 text-amber-800 text-[11px] font-bold px-2 py-0.5 rounded-full">
                    {badgeCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â System Status */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/60">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center space-x-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-[11px] font-medium text-slate-600">Cron Scheduler</span>
          </div>
          <button
            id="btn-trigger-sync"
            onClick={onTriggerSync}
            disabled={isSyncing}
            className="text-[11px] text-indigo-600 hover:text-indigo-800 font-medium flex items-center space-x-1 cursor-pointer disabled:opacity-50"
            title="Poll queue immediately"
          >
            <RefreshCw className={`w-3 h-3 ${isSyncing ? "animate-spin" : ""}`} />
            <span>{isSyncing ? "Syncing..." : "Run Sync"}</span>
          </button>
        </div>
        <p className="text-[10px] text-slate-400 font-mono">
          LangGraph Interrupt Engine active
        </p>
      </div>
    </aside>
  );
};

