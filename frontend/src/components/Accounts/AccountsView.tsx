import React from 'react';
import type { PlatformConnection } from '../../types';
import { Share2, CheckCircle2, Link as LinkIcon, Unlink } from 'lucide-react';

interface AccountsViewProps {
  platforms: PlatformConnection[];
  onConnect: (platform: string) => void;
  onDisconnect: (platform: string) => void;
  isActionLoading?: boolean;
}

export const AccountsView: React.FC<AccountsViewProps> = ({
  platforms,
  onConnect,
  onDisconnect,
  isActionLoading,
}) => {
  return (
    <div className="flex-1 overflow-y-auto p-8 max-w-4xl mx-auto w-full">
      <div className="mb-6 pb-4 border-b border-slate-200">
        <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Share2 className="w-5 h-5 text-indigo-600" />
          <span>Connected Social Accounts</span>
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Authorize social networks using OAuth 2.0. Tokens are securely encrypted with AES/Fernet.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {platforms.map((p) => {
          const isX = p.platform === 'twitter';

          return (
            <div
              key={p.platform}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold text-sm ${
                      isX ? 'bg-slate-900' : 'bg-[#0a66c2]'
                    }`}>
                      {isX ? 'X' : 'in'}
                    </div>
                    <div>
                      <h3 className="font-semibold text-xs text-slate-900">{p.name}</h3>
                      <p className="text-[11px] text-slate-500">{p.account_handle}</p>
                    </div>
                  </div>

                  <span className={`flex items-center space-x-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    p.is_connected
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-slate-100 text-slate-500'
                  }`}>
                    {p.is_connected ? (
                      <>
                        <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                        <span>Connected</span>
                      </>
                    ) : (
                      <span>Not Connected</span>
                    )}
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  {p.description}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-mono">
                  {p.is_connected ? 'OAuth 2.0 active' : 'Disconnected'}
                </span>

                {p.is_connected ? (
                  <button
                    onClick={() => onDisconnect(p.platform)}
                    disabled={isActionLoading}
                    className="flex items-center space-x-1 text-xs text-rose-600 hover:text-rose-800 font-medium cursor-pointer disabled:opacity-50"
                  >
                    <Unlink className="w-3.5 h-3.5" />
                    <span>Disconnect</span>
                  </button>
                ) : (
                  <button
                    onClick={() => onConnect(p.platform)}
                    disabled={isActionLoading}
                    className="flex items-center space-x-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <LinkIcon className="w-3 h-3" />
                    <span>Connect Account</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
