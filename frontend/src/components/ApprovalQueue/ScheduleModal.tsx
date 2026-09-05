import React, { useState } from 'react';
import { Calendar, X, Check } from 'lucide-react';

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApprove: (scheduledFor?: string) => void;
  isSubmitting?: boolean;
}

export const ScheduleModal: React.FC<ScheduleModalProps> = ({
  isOpen,
  onClose,
  onApprove,
  isSubmitting,
}) => {
  const [scheduleType, setScheduleType] = useState<'immediate' | 'future'>('immediate');
  const [date, setDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [time, setTime] = useState('09:00');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (scheduleType === 'immediate') {
      onApprove(undefined);
    } else {
      const scheduledIso = new Date(`${date}T${time}:00`).toISOString();
      onApprove(scheduledIso);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900">
              Approve & Schedule Distribution
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5">
          <div className="space-y-3 mb-5">
            <label
              onClick={() => setScheduleType('immediate')}
              className={`flex items-start p-3 rounded-lg border cursor-pointer transition-all ${
                scheduleType === 'immediate'
                  ? 'border-indigo-600 bg-indigo-50/40 ring-1 ring-indigo-600'
                  : 'border-slate-200 hover:bg-slate-50'
              }`}
            >
              <input
                type="radio"
                name="scheduleType"
                checked={scheduleType === 'immediate'}
                onChange={() => setScheduleType('immediate')}
                className="mt-0.5 text-indigo-600 focus:ring-indigo-500"
              />
              <div className="ml-3">
                <span className="block text-xs font-semibold text-slate-900">Publish Immediately</span>
                <span className="block text-[11px] text-slate-500">
                  Release to connected platforms on the next cron tick (~15s)
                </span>
              </div>
            </label>

            <label
              onClick={() => setScheduleType('future')}
              className={`flex items-start p-3 rounded-lg border cursor-pointer transition-all ${
                scheduleType === 'future'
                  ? 'border-indigo-600 bg-indigo-50/40 ring-1 ring-indigo-600'
                  : 'border-slate-200 hover:bg-slate-50'
              }`}
            >
              <input
                type="radio"
                name="scheduleType"
                checked={scheduleType === 'future'}
                onChange={() => setScheduleType('future')}
                className="mt-0.5 text-indigo-600 focus:ring-indigo-500"
              />
              <div className="ml-3">
                <span className="block text-xs font-semibold text-slate-900">Schedule for Later</span>
                <span className="block text-[11px] text-slate-500">
                  Select date and optimal publishing window
                </span>
              </div>
            </label>
          </div>

          {scheduleType === 'future' && (
            <div className="grid grid-cols-2 gap-3 mb-5 p-3 bg-slate-50 rounded-lg border border-slate-100 animate-in fade-in duration-150">
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">Publish Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full text-xs bg-white border border-slate-200 rounded-md px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">Time (Local)</label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full text-xs bg-white border border-slate-200 rounded-md px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  required
                />
              </div>
            </div>
          )}

          <div className="flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-all cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{scheduleType === 'immediate' ? 'Approve & Publish' : 'Confirm Schedule'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
