import React, { useState } from 'react';
import { Clock, Calendar, RotateCcw, FastForward, Rewind, Play, Pause, Check, Compass } from 'lucide-react';

interface TemporalControlBarProps {
  currentTime: Date;
  onChangeTime: (newTime: Date) => void;
  onResetToTarget: () => void;
  isTicking: boolean;
  onToggleTicking: () => void;
  isDarkMode: boolean;
  locationName: string;
}

export const TARGET_DATE_TIME = new Date(2026, 8, 12, 14, 0, 0); // 2026-09-12 14:00:00 (2:00 PM)

export const TemporalControlBar: React.FC<TemporalControlBarProps> = ({
  currentTime,
  onChangeTime,
  onResetToTarget,
  isTicking,
  onToggleTicking,
  isDarkMode,
  locationName,
}) => {
  const [showPicker, setShowPicker] = useState<boolean>(false);

  // Format date and time for display
  const dateFormatted = currentTime.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const timeFormatted = currentTime.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });

  // Check if close to target date/time (9/12/2026 2:00 PM)
  const isTargetDate =
    currentTime.getFullYear() === 2026 &&
    currentTime.getMonth() === 8 &&
    currentTime.getDate() === 12 &&
    currentTime.getHours() === 14;

  // Format for HTML datetime-local input (YYYY-MM-DDTHH:mm)
  const pad = (n: number) => String(n).padStart(2, '0');
  const datetimeInputValue = `${currentTime.getFullYear()}-${pad(currentTime.getMonth() + 1)}-${pad(
    currentTime.getDate()
  )}T${pad(currentTime.getHours())}:${pad(currentTime.getMinutes())}`;

  const handleStepTime = (minutes: number) => {
    const updated = new Date(currentTime.getTime() + minutes * 60 * 1000);
    onChangeTime(updated);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (!val) return;
    const parts = val.split('T');
    if (parts.length !== 2) return;
    const [y, m, d] = parts[0].split('-').map(Number);
    const [h, min] = parts[1].split(':').map(Number);
    if (!isNaN(y) && !isNaN(m) && !isNaN(d) && !isNaN(h) && !isNaN(min)) {
      const updated = new Date(y, m - 1, d, h, min, 0);
      onChangeTime(updated);
    }
  };

  return (
    <section
      id="temporal-synchronization-bar"
      aria-label="Temporal Synchronization Controls"
      className={`w-full rounded-2xl border p-4 sm:p-5 transition-all duration-200 ${
        isDarkMode
          ? 'bg-slate-900/90 border-slate-800 text-slate-100 shadow-xl shadow-black/20'
          : 'bg-white border-stone-200 text-stone-900 shadow-md shadow-stone-200/50'
      }`}
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Date & Time Live Display */}
        <div className="flex items-start sm:items-center gap-3">
          <div
            className={`p-2.5 rounded-xl border shrink-0 ${
              isDarkMode
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                : 'bg-amber-50 border-amber-200 text-amber-700'
            }`}
          >
            <Clock className="w-5 h-5 animate-pulse" />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-serif font-bold text-base sm:text-lg tracking-tight">
                {dateFormatted}
              </span>
              <span className="font-mono text-base sm:text-lg font-bold text-sky-600 dark:text-sky-400">
                {timeFormatted}
              </span>

              {/* Status Badge */}
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium border ${
                  isTargetDate
                    ? isDarkMode
                      ? 'bg-emerald-950/60 border-emerald-700 text-emerald-300'
                      : 'bg-emerald-50 border-emerald-300 text-emerald-800'
                    : isDarkMode
                    ? 'bg-indigo-950/60 border-indigo-800 text-indigo-300'
                    : 'bg-indigo-50 border-indigo-200 text-indigo-800'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-current animate-ping" />
                {isTargetDate ? 'Synchronized: 9/12/2026 2:00 PM' : 'Active Date/Time Shift'}
              </span>
            </div>

            <p className={`text-xs mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-stone-500'}`}>
              Reference point: <strong className="font-semibold text-stone-800 dark:text-slate-200">Sep 12, 2026 at 2:00 PM EDT</strong> &bull; Location: {locationName}
            </p>
          </div>
        </div>

        {/* Action Controls & Fast Scrubber */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Step buttons */}
          <div
            className={`flex items-center rounded-xl border p-0.5 ${
              isDarkMode ? 'bg-slate-950/80 border-slate-800' : 'bg-stone-100 border-stone-300'
            }`}
          >
            <button
              id="step-time-minus-1h-btn"
              type="button"
              onClick={() => handleStepTime(-60)}
              title="Step back 1 hour"
              className={`px-2.5 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer ${
                isDarkMode
                  ? 'text-slate-300 hover:text-white hover:bg-slate-800'
                  : 'text-stone-700 hover:text-stone-950 hover:bg-white shadow-xs'
              }`}
            >
              -1h
            </button>
            <button
              id="step-time-minus-15m-btn"
              type="button"
              onClick={() => handleStepTime(-15)}
              title="Step back 15 minutes"
              className={`px-2.5 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer ${
                isDarkMode
                  ? 'text-slate-300 hover:text-white hover:bg-slate-800'
                  : 'text-stone-700 hover:text-stone-950 hover:bg-white shadow-xs'
              }`}
            >
              -15m
            </button>
            <button
              id="step-time-plus-15m-btn"
              type="button"
              onClick={() => handleStepTime(15)}
              title="Advance 15 minutes"
              className={`px-2.5 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer ${
                isDarkMode
                  ? 'text-slate-300 hover:text-white hover:bg-slate-800'
                  : 'text-stone-700 hover:text-stone-950 hover:bg-white shadow-xs'
              }`}
            >
              +15m
            </button>
            <button
              id="step-time-plus-1h-btn"
              type="button"
              onClick={() => handleStepTime(60)}
              title="Advance 1 hour"
              className={`px-2.5 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer ${
                isDarkMode
                  ? 'text-slate-300 hover:text-white hover:bg-slate-800'
                  : 'text-stone-700 hover:text-stone-950 hover:bg-white shadow-xs'
              }`}
            >
              +1h
            </button>
          </div>

          {/* Reset to 9/12/2026 2:00 PM */}
          <button
            id="reset-to-target-time-btn"
            type="button"
            onClick={onResetToTarget}
            title="Reset directly to 9/12/2026 2:00 PM"
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs ${
              isTargetDate
                ? isDarkMode
                  ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300'
                  : 'bg-emerald-50 border-emerald-300 text-emerald-800'
                : isDarkMode
                ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-amber-300'
                : 'bg-stone-50 hover:bg-stone-200 border-stone-300 text-stone-800'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to 9/12 2:00 PM</span>
          </button>

          {/* Live minute tick toggle */}
          <button
            id="toggle-live-progression-btn"
            type="button"
            onClick={onToggleTicking}
            title={isTicking ? 'Pause minute clock progression' : 'Resume minute clock progression'}
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              isTicking
                ? isDarkMode
                  ? 'bg-sky-950/50 border-sky-800 text-sky-300 hover:bg-sky-900/60'
                  : 'bg-sky-50 border-sky-300 text-sky-800 hover:bg-sky-100'
                : isDarkMode
                ? 'bg-slate-800 border-slate-700 text-slate-400'
                : 'bg-stone-100 border-stone-300 text-stone-600'
            }`}
          >
            {isTicking ? (
              <>
                <Pause className="w-3.5 h-3.5 text-sky-500 animate-pulse" />
                <span>Clock Running</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" />
                <span>Clock Paused</span>
              </>
            )}
          </button>

          {/* Exact Date & Time Picker */}
          <div className="relative">
            <input
              id="custom-datetime-picker-input"
              type="datetime-local"
              value={datetimeInputValue}
              onChange={handleInputChange}
              aria-label="Set specific date and time"
              className={`px-2.5 py-1.5 rounded-xl border text-xs font-mono font-medium transition-all focus:outline-hidden focus:ring-2 cursor-pointer ${
                isDarkMode
                  ? 'bg-slate-950 border-slate-700 text-slate-200 focus:ring-sky-500/40 focus:border-sky-500'
                  : 'bg-stone-50 border-stone-300 text-stone-800 focus:ring-sky-500/30 focus:border-sky-600'
              }`}
            />
          </div>
        </div>
      </div>
    </section>
  );
};
