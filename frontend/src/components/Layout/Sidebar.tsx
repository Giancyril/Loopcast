import React from 'react';
import { 
  Inbox, 
  CalendarDays, 
  PlusCircle, 
  Share2, 
  Sparkles,
  RefreshCw
} from 'lucide-react';

export type NavTab = 'queue' | 'calendar' | 'accounts';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  pendingCount: number;
  onOpenComposer: () => void;
  onTriggerSync: () => void;
  isSyncing: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  pendingCount,
  onOpenComposer,
  onTriggerSync,
  isSyncing,
}) => {
  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between select-none h-screen shrink-0">
      <div>
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h1 className="font-semibold text-slate-900 text-sm leading-tight tracking-tight">
                Aegis Social
              </h1>
              <p className="text-[11px] text-slate-400 font-medium">
                Autonomous AI Agent
              </p>
            </div>
          </div>
        </div>

        {/* Primary Action Button */}
        <div className="p-3.5">
          <button
            onClick={onOpenComposer}
            className="w-full flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold py-2.5 px-4 rounded-lg shadow-xs hover:shadow transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create Draft with AI</span>
          </button>
        </div>

        {/* Navigation items */}
        <nav className="px-3 space-y-1">
          <button
            onClick={() => onSelectTab('queue')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              currentTab === 'queue'
                ? 'bg-indigo-50 text-indigo-700 font-semibold'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center space-x-2.5">
              <Inbox className={`w-4 h-4 ${currentTab === 'queue' ? 'text-indigo-600' : 'text-slate-400'}`} />
              <span>Approval Queue</span>
            </div>
            {pendingCount > 0 && (
              <span className="bg-amber-100 text-amber-800 text-[11px] font-bold px-2 py-0.5 rounded-full">
                {pendingCount}
              </span>
            )}
          </button>

          <button
            onClick={() => onSelectTab('calendar')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              currentTab === 'calendar'
                ? 'bg-indigo-50 text-indigo-700 font-semibold'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center space-x-2.5">
              <CalendarDays className={`w-4 h-4 ${currentTab === 'calendar' ? 'text-indigo-600' : 'text-slate-400'}`} />
              <span>Calendar</span>
            </div>
          </button>

          <button
            onClick={() => onSelectTab('accounts')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              currentTab === 'accounts'
                ? 'bg-indigo-50 text-indigo-700 font-semibold'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center space-x-2.5">
              <Share2 className={`w-4 h-4 ${currentTab === 'accounts' ? 'text-indigo-600' : 'text-slate-400'}`} />
              <span>Connected Accounts</span>
            </div>
          </button>
        </nav>
      </div>

      {/* Footer / System Health info */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[11px] font-medium text-slate-600">Cron Scheduler</span>
          </div>
          <button
            onClick={onTriggerSync}
            disabled={isSyncing}
            className="text-[11px] text-indigo-600 hover:text-indigo-800 font-medium flex items-center space-x-1 cursor-pointer disabled:opacity-50"
            title="Poll queue immediately"
          >
            <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Syncing...' : 'Run Sync'}</span>
          </button>
        </div>
        <p className="text-[10px] text-slate-400 font-mono">
          LangGraph Interrupt Engine active
        </p>
      </div>
    </aside>
  );
};
