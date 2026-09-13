import React, { useState } from 'react';
import { SolunarScheduleWindow, get365SolunarSeasonalInsight } from '../services/solunarBiteService';
import {
  Compass,
  Fish,
  Droplets,
  Clock,
  Sparkles,
  CheckCircle2,
  Calendar,
  Flame,
  ArrowRight,
  Zap,
} from 'lucide-react';

interface SolunarTideScheduleViewProps {
  windows: SolunarScheduleWindow[];
  onAdoptMicroIntake: (window: SolunarScheduleWindow) => void;
  isDarkMode: boolean;
  currentDate: Date;
  tideCategory: string;
}

export const SolunarTideScheduleView: React.FC<SolunarTideScheduleViewProps> = ({
  windows,
  onAdoptMicroIntake,
  isDarkMode,
  currentDate,
  tideCategory,
}) => {
  const [activeView, setActiveView] = useState<'daily-schedule' | 'annual-365'>('daily-schedule');
  const [filterType, setFilterType] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Day of year calculation for seasonal insight
  const start = new Date(currentDate.getFullYear(), 0, 0);
  const diff = currentDate.getTime() - start.getTime();
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
  const seasonalInsight = get365SolunarSeasonalInsight(dayOfYear);

  const filteredWindows = windows.filter((w) => {
    if (filterType === 'major') return w.type === 'major_overhead' || w.type === 'major_underfoot';
    if (filterType === 'tides') return w.type === 'high_tide' || w.type === 'low_tide';
    if (filterType === 'minor') return w.type === 'minor_moonrise' || w.type === 'minor_moonset';
    return true;
  });

  return (
    <div id="solunar-tide-schedule-container" className="space-y-4">
      {/* Schedule Header & Sub-Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3 border-stone-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-serif font-bold text-base sm:text-lg flex items-center gap-2">
              <Compass className="w-5 h-5 text-sky-500" />
              <span>24/7 365 Tidal &amp; Solunar Micro-Intake Schedule</span>
            </h3>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full font-bold bg-sky-500/10 border border-sky-500/30 text-sky-400">
              Active Flow
            </span>
          </div>
          <p className={`text-xs mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-stone-500'}`}>
            Chrononutrition calibrated to each tidal high, low, and moon transit &bull; Matched to prime fishing bite windows
          </p>
        </div>

        {/* Schedule Mode Toggle */}
        <div
          className={`flex items-center p-0.5 rounded-xl border text-xs font-mono self-start sm:self-auto ${
            isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-stone-100 border-stone-300'
          }`}
        >
          <button
            type="button"
            onClick={() => setActiveView('daily-schedule')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer font-medium ${
              activeView === 'daily-schedule'
                ? isDarkMode
                  ? 'bg-sky-600 text-white font-bold shadow-xs'
                  : 'bg-white text-stone-900 font-bold shadow-xs'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            Today's 24h Windows ({windows.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveView('annual-365')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer font-medium ${
              activeView === 'annual-365'
                ? isDarkMode
                  ? 'bg-sky-600 text-white font-bold shadow-xs'
                  : 'bg-white text-stone-900 font-bold shadow-xs'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            365-Day Seasonal Solunar
          </button>
        </div>
      </div>

      {activeView === 'daily-schedule' && (
        <>
          {/* Quick Filter Chips & Context Banner */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-xs font-mono">
              <span className="text-stone-400 mr-1 text-[11px]">View:</span>
              {[
                { id: 'all', label: 'All Cycles' },
                { id: 'major', label: 'Major Solunar (Overhead/Underfoot)' },
                { id: 'tides', label: 'High & Low Tides' },
                { id: 'minor', label: 'Minor Windows' },
              ].map((filter) => (
                <button
                  key={filter.id}
                  type="button"
                  onClick={() => setFilterType(filter.id)}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer text-xs ${
                    filterType === filter.id
                      ? isDarkMode
                        ? 'bg-slate-700 text-white font-bold'
                        : 'bg-stone-300 text-stone-900 font-bold'
                      : 'text-stone-400 hover:text-stone-200'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            <div className="text-[11px] font-mono text-stone-400 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>{tideCategory}</span>
            </div>
          </div>

          {/* Schedule Cards Timeline */}
          <div className="space-y-3">
            {filteredWindows.map((win) => {
              const isMajor = win.type === 'major_overhead' || win.type === 'major_underfoot';
              const isHighTide = win.type === 'high_tide';
              const isLowTide = win.type === 'low_tide';
              const isExpanded = expandedId === win.id;

              return (
                <div
                  key={win.id}
                  id={`window-card-${win.id}`}
                  className={`rounded-2xl border p-4 sm:p-5 transition-all relative overflow-hidden ${
                    win.isActive
                      ? isDarkMode
                        ? 'bg-gradient-to-r from-sky-950/70 via-slate-900 to-indigo-950/60 border-sky-500/80 ring-2 ring-sky-500/40 shadow-lg shadow-sky-950/50'
                        : 'bg-gradient-to-r from-sky-50 via-white to-indigo-50/60 border-sky-400 ring-2 ring-sky-400/30 shadow-md shadow-sky-100'
                      : isDarkMode
                      ? 'bg-slate-950/70 hover:bg-slate-900/80 border-slate-800 text-slate-200'
                      : 'bg-stone-50/80 hover:bg-stone-100/90 border-stone-200 text-stone-800'
                  }`}
                >
                  {/* Active Now Pill Badge */}
                  {win.isActive && (
                    <div className="absolute top-3 right-4 sm:right-5 flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-sky-500 text-white shadow-xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                      <span>WINDOW OPEN NOW</span>
                    </div>
                  )}

                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                    {/* Left: Window Identification & Solunar Fishing Bite Rating */}
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Type badge */}
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider border ${
                            win.solunarRating === 5
                              ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                              : isMajor
                              ? 'bg-indigo-500/15 border-indigo-500/30 text-indigo-400'
                              : isHighTide
                              ? 'bg-sky-500/15 border-sky-500/30 text-sky-400'
                              : isLowTide
                              ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                              : 'bg-stone-200 dark:bg-slate-800 border-stone-300 dark:border-slate-700 text-stone-400'
                          }`}
                        >
                          {win.biteWindowType}
                        </span>

                        {/* Timing */}
                        <span className="font-mono text-xs font-bold text-sky-500 dark:text-sky-400 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{win.timeRange}</span>
                          <span className="text-stone-400 font-normal">({win.exactTime} peak)</span>
                        </span>

                        {/* Rating Stars */}
                        <div className="flex items-center text-xs font-mono font-bold text-amber-400">
                          {'★'.repeat(win.solunarRating)}
                          <span className="text-stone-500 font-normal ml-1 text-[11px]">
                            ({win.solunarRating}/5)
                          </span>
                        </div>
                      </div>

                      <h4 className="font-serif font-bold text-base sm:text-lg flex items-center gap-2">
                        <span>{win.title}</span>
                      </h4>

                      {/* Fishing Bite Window Description */}
                      <div
                        className={`p-2.5 rounded-xl border text-xs leading-relaxed flex items-start gap-2.5 ${
                          win.solunarRating === 5
                            ? isDarkMode
                              ? 'bg-amber-950/40 border-amber-800/60 text-amber-200'
                              : 'bg-amber-50/80 border-amber-200 text-amber-900'
                            : isDarkMode
                            ? 'bg-slate-900/60 border-slate-800/80 text-slate-300'
                            : 'bg-white/80 border-stone-200 text-stone-700'
                        }`}
                      >
                        <Fish className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        <div>
                          <strong className="font-semibold text-[11px] uppercase tracking-wider block mb-0.5">
                            Fishing Bite Window &amp; Wildlife Activity:
                          </strong>
                          <span>{win.fishingSignificance}</span>
                        </div>
                      </div>

                      {/* Metabolic Objective */}
                      <p className={`text-xs leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-stone-600'}`}>
                        <strong className="text-stone-900 dark:text-slate-200 font-semibold">
                          Metabolic Chronobiology:
                        </strong>{' '}
                        {win.metabolicObjective}
                      </p>
                    </div>

                    {/* Right: Micro Daily Intake Recommendation Box */}
                    <div
                      className={`p-4 rounded-xl border lg:w-80 shrink-0 space-y-3 ${
                        win.isActive
                          ? isDarkMode
                            ? 'bg-sky-950/60 border-sky-700'
                            : 'bg-sky-50 border-sky-200'
                          : isDarkMode
                          ? 'bg-slate-900/80 border-slate-800'
                          : 'bg-white border-stone-200'
                      }`}
                    >
                      <div className="flex items-center justify-between border-b pb-2 border-stone-200 dark:border-slate-800">
                        <div className="flex items-center gap-1.5">
                          <Sparkles className="w-4 h-4 text-emerald-400" />
                          <span className="font-serif font-bold text-xs">
                            Recommended Micro-Intake
                          </span>
                        </div>
                        <span className="font-mono text-xs font-bold text-amber-500">
                          {win.microIntake.calories} kcal
                        </span>
                      </div>

                      <div className="text-xs font-semibold leading-tight text-stone-900 dark:text-slate-100">
                        {win.microIntake.suggestedMeal}
                      </div>

                      {/* Macronutrient Micro Distribution */}
                      <div className="grid grid-cols-3 gap-1.5 text-center font-mono text-[11px]">
                        <div className={`p-1.5 rounded-lg ${isDarkMode ? 'bg-slate-950/80' : 'bg-stone-100'}`}>
                          <span className="text-[9px] text-stone-400 uppercase block">Protein</span>
                          <span className="font-bold text-sky-400">{win.microIntake.proteinG}g</span>
                        </div>
                        <div className={`p-1.5 rounded-lg ${isDarkMode ? 'bg-slate-950/80' : 'bg-stone-100'}`}>
                          <span className="text-[9px] text-stone-400 uppercase block">Carbs</span>
                          <span className="font-bold text-amber-500">{win.microIntake.carbsG}g</span>
                        </div>
                        <div className={`p-1.5 rounded-lg ${isDarkMode ? 'bg-slate-950/80' : 'bg-stone-100'}`}>
                          <span className="text-[9px] text-stone-400 uppercase block">Lipids</span>
                          <span className="font-bold text-emerald-400">{win.microIntake.fatG}g</span>
                        </div>
                      </div>

                      {/* Electrolytes & Hydration */}
                      <div className="text-[11px] space-y-1 text-stone-500 dark:text-slate-400">
                        <div>
                          <strong className="text-stone-700 dark:text-slate-300">Key Nutrients:</strong>{' '}
                          {win.microIntake.keyElectrolytes}
                        </div>
                        <div>
                          <strong className="text-stone-700 dark:text-slate-300">Hydration:</strong>{' '}
                          {win.microIntake.hydrationTip}
                        </div>
                      </div>

                      {/* One-Click Action: Adopt Window Intake */}
                      <button
                        type="button"
                        onClick={() => onAdoptMicroIntake(win)}
                        className="w-full py-2 px-3 rounded-xl text-xs font-medium bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Adopt This Micro-Intake</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* View 2: 365-Day Annual Solunar & Tidal Rhythms Guide */}
      {activeView === 'annual-365' && (
        <div
          className={`p-5 sm:p-6 rounded-2xl border ${
            isDarkMode ? 'bg-slate-950/80 border-slate-800' : 'bg-stone-50 border-stone-200'
          }`}
        >
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-amber-500" />
            <h4 className="font-serif font-bold text-base sm:text-lg">
              365-Day Annual Solunar &amp; Tidal Synchrony
            </h4>
          </div>

          <div className="space-y-4 text-xs leading-relaxed">
            <div
              className={`p-4 rounded-xl border ${
                isDarkMode ? 'bg-amber-950/30 border-amber-800/50 text-amber-200' : 'bg-amber-50 border-amber-200 text-amber-900'
              }`}
            >
              <span className="font-mono uppercase font-bold text-[11px] block mb-1">
                Current Season (Day {dayOfYear} of 365): {seasonalInsight.season}
              </span>
              <p className="mb-2">
                <strong className="font-semibold">Tidal Dynamics:</strong> {seasonalInsight.tideBehavior}
              </p>
              <p className="mb-2">
                <strong className="font-semibold">Bite Strategy:</strong> {seasonalInsight.biteAdvice}
              </p>
              <p>
                <strong className="font-semibold">Yearly Dietary Focus:</strong> {seasonalInsight.dietaryEmphasis}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-stone-600 dark:text-slate-300">
              <div className={`p-3.5 rounded-xl border ${isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-stone-200'}`}>
                <h5 className="font-serif font-bold text-xs text-stone-900 dark:text-slate-100 mb-1">
                  The Solunar Bite Law (Knight's Marine Principle)
                </h5>
                <p className="text-[11px] leading-relaxed">
                  Fish and wildlife do not feed continuously. Peak predatory activity occurs during Moon Overhead (Upper Transit) and Moon Underfoot (Lower Transit). When these 2-hour windows coincide with moving water (incoming high tide or outgoing low tide), bite activity surges up to 400%.
                </p>
              </div>

              <div className={`p-3.5 rounded-xl border ${isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-stone-200'}`}>
                <h5 className="font-serif font-bold text-xs text-stone-900 dark:text-slate-100 mb-1">
                  Human Cellular Resonance &amp; Micro-Intake
                </h5>
                <p className="text-[11px] leading-relaxed">
                  The human body is ~65% water, subject to the same gravitational harmonics that dictate coastal tides. High tides elevate extracellular fluid pressure and nutrient assimilation; low tides activate lymphatic drainage and fat oxidation. Fueling in rhythm optimizes mitochondrial ATP efficiency.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
