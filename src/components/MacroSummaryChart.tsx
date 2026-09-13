import React from 'react';
import { CelestialMacroGoals } from '../services/solunarBiteService';
import { Flame, Award, CheckCircle2, TrendingUp, AlertTriangle } from 'lucide-react';

interface MacroSummaryChartProps {
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  goals: CelestialMacroGoals;
  isDarkMode: boolean;
}

export const MacroSummaryChart: React.FC<MacroSummaryChartProps> = ({
  totalCalories,
  totalProtein,
  totalCarbs,
  totalFat,
  goals,
  isDarkMode,
}) => {
  // Caloric calculations
  const proteinKcal = totalProtein * 4;
  const carbsKcal = totalCarbs * 4;
  const fatKcal = totalFat * 9;
  const loggedKcalSum = proteinKcal + carbsKcal + fatKcal;

  // Actual macro distribution percentages
  const actualProteinPct = loggedKcalSum > 0 ? Math.round((proteinKcal / loggedKcalSum) * 100) : 0;
  const actualCarbsPct = loggedKcalSum > 0 ? Math.round((carbsKcal / loggedKcalSum) * 100) : 0;
  const actualFatPct = loggedKcalSum > 0 ? Math.round((fatKcal / loggedKcalSum) * 100) : 0;

  // Percentages of target completed
  const proteinProgress = Math.min(150, Math.round((totalProtein / Math.max(1, goals.targetProteinGrams)) * 100));
  const carbsProgress = Math.min(150, Math.round((totalCarbs / Math.max(1, goals.targetCarbsGrams)) * 100));
  const fatProgress = Math.min(150, Math.round((totalFat / Math.max(1, goals.targetFatGrams)) * 100));
  const calorieProgress = Math.min(150, Math.round((totalCalories / Math.max(1, goals.targetCalories)) * 100));

  const caloriesRemaining = goals.targetCalories - totalCalories;

  // Evaluate alignment status
  const carbsDiff = Math.abs(actualCarbsPct - goals.targetCarbsPct);
  const proteinDiff = Math.abs(actualProteinPct - goals.targetProteinPct);
  const fatDiff = Math.abs(actualFatPct - goals.targetFatPct);
  const averageDeviation = (carbsDiff + proteinDiff + fatDiff) / 3;

  let alignmentStatus: 'Optimal' | 'Favorable' | 'Needs Adjustment' = 'Optimal';
  if (loggedKcalSum === 0) {
    alignmentStatus = 'Optimal';
  } else if (averageDeviation <= 6) {
    alignmentStatus = 'Optimal';
  } else if (averageDeviation <= 14) {
    alignmentStatus = 'Favorable';
  } else {
    alignmentStatus = 'Needs Adjustment';
  }

  return (
    <div
      id="celestial-macronutrient-summary-chart"
      className={`rounded-2xl border p-5 sm:p-6 mb-6 transition-all duration-200 ${
        isDarkMode
          ? 'bg-slate-950/80 border-slate-800 text-slate-100 shadow-md shadow-black/20'
          : 'bg-white border-stone-200 text-stone-900 shadow-sm shadow-stone-200/50'
      }`}
    >
      {/* Top Banner: Goal Headline & Alignment Score */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-5 border-b pb-4 border-stone-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-serif font-bold text-base sm:text-lg">
              Daily Macronutrient Intake vs. Celestial Goals
            </h3>
            <span
              className={`px-2 py-0.5 rounded-full text-[11px] font-mono font-semibold border flex items-center gap-1 ${
                alignmentStatus === 'Optimal'
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : alignmentStatus === 'Favorable'
                  ? 'bg-sky-500/10 border-sky-500/30 text-sky-400'
                  : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
              }`}
            >
              <Award className="w-3 h-3" />
              <span>{alignmentStatus} Alignment</span>
            </span>
          </div>
          <p className={`text-xs mt-1 leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-stone-500'}`}>
            {goals.phaseTitle} &bull; {goals.rationale}
          </p>
        </div>

        {/* Total Calories Progress Summary */}
        <div
          className={`p-3 rounded-xl border shrink-0 md:w-64 text-xs font-mono ${
            isDarkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-stone-50 border-stone-200'
          }`}
        >
          <div className="flex justify-between items-center mb-1">
            <span className="text-stone-400 uppercase tracking-wider text-[10px]">Total Energy</span>
            <span className="font-bold flex items-center gap-1 text-amber-500">
              <Flame className="w-3.5 h-3.5" />
              {totalCalories} / {goals.targetCalories} kcal
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-stone-200 dark:bg-slate-800 rounded-full h-2 overflow-hidden mb-1">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                calorieProgress > 105 ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(100, calorieProgress)}%` }}
            />
          </div>

          <div className="flex justify-between text-[11px] text-stone-400">
            <span>{calorieProgress}% of Daily TDEE</span>
            <span>{caloriesRemaining > 0 ? `${caloriesRemaining} kcal remaining` : 'Target fulfilled'}</span>
          </div>
        </div>
      </div>

      {/* Visual Macronutrient Dual Comparison Bars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* PROTEIN */}
        <div
          className={`p-4 rounded-xl border transition-all ${
            isDarkMode ? 'bg-slate-900/60 border-slate-800/80' : 'bg-stone-50/70 border-stone-200'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-400" />
              <span className="font-serif font-bold text-xs uppercase tracking-wider text-sky-400">
                Protein
              </span>
            </div>
            <span className="text-[11px] font-mono font-semibold text-stone-400">
              Goal: {goals.targetProteinPct}%
            </span>
          </div>

          <div className="flex items-baseline justify-between mb-1.5">
            <span className="font-mono text-xl font-bold">{totalProtein}g</span>
            <span className="text-xs font-mono text-stone-400">
              of {goals.targetProteinGrams}g target
            </span>
          </div>

          {/* Progress gauge */}
          <div className="w-full bg-stone-200 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden relative mb-2">
            <div
              className="h-full rounded-full bg-sky-500 transition-all duration-500"
              style={{ width: `${Math.min(100, proteinProgress)}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono text-stone-400">
            <span>{proteinProgress}% fulfilled</span>
            <span>{proteinKcal} kcal ({actualProteinPct}%)</span>
          </div>
        </div>

        {/* CARBOHYDRATES */}
        <div
          className={`p-4 rounded-xl border transition-all ${
            isDarkMode ? 'bg-slate-900/60 border-slate-800/80' : 'bg-stone-50/70 border-stone-200'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <span className="font-serif font-bold text-xs uppercase tracking-wider text-amber-500">
                Carbohydrates
              </span>
            </div>
            <span className="text-[11px] font-mono font-semibold text-stone-400">
              Goal: {goals.targetCarbsPct}%
            </span>
          </div>

          <div className="flex items-baseline justify-between mb-1.5">
            <span className="font-mono text-xl font-bold">{totalCarbs}g</span>
            <span className="text-xs font-mono text-stone-400">
              of {goals.targetCarbsGrams}g target
            </span>
          </div>

          {/* Progress gauge */}
          <div className="w-full bg-stone-200 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden relative mb-2">
            <div
              className="h-full rounded-full bg-amber-500 transition-all duration-500"
              style={{ width: `${Math.min(100, carbsProgress)}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono text-stone-400">
            <span>{carbsProgress}% fulfilled</span>
            <span>{carbsKcal} kcal ({actualCarbsPct}%)</span>
          </div>
        </div>

        {/* LIPIDS / FATS */}
        <div
          className={`p-4 rounded-xl border transition-all ${
            isDarkMode ? 'bg-slate-900/60 border-slate-800/80' : 'bg-stone-50/70 border-stone-200'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              <span className="font-serif font-bold text-xs uppercase tracking-wider text-emerald-400">
                Lipids / Fats
              </span>
            </div>
            <span className="text-[11px] font-mono font-semibold text-stone-400">
              Goal: {goals.targetFatPct}%
            </span>
          </div>

          <div className="flex items-baseline justify-between mb-1.5">
            <span className="font-mono text-xl font-bold">{totalFat}g</span>
            <span className="text-xs font-mono text-stone-400">
              of {goals.targetFatGrams}g target
            </span>
          </div>

          {/* Progress gauge */}
          <div className="w-full bg-stone-200 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden relative mb-2">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all duration-500"
              style={{ width: `${Math.min(100, fatProgress)}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono text-stone-400">
            <span>{fatProgress}% fulfilled</span>
            <span>{fatKcal} kcal ({actualFatPct}%)</span>
          </div>
        </div>
      </div>

      {/* Macro Ratio Stacked Comparison Bar: Consumed vs Target */}
      <div
        className={`p-4 rounded-xl border ${
          isDarkMode ? 'bg-slate-900/40 border-slate-800' : 'bg-stone-50/50 border-stone-200'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <span className="text-xs font-serif font-bold">
            Macronutrient Caloric Ratio Distribution: Consumed vs. Celestial Target
          </span>
          <div className="flex items-center gap-3 text-[11px] font-mono">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-sky-400" /> Protein
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-400" /> Carbs
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400" /> Lipids
            </span>
          </div>
        </div>

        {/* Actual Consumed Distribution Bar */}
        <div className="space-y-1.5 mb-3">
          <div className="flex justify-between text-[11px] font-mono text-stone-400">
            <span>Logged Today ({totalCalories > 0 ? `${totalCalories} kcal` : 'No logs yet'})</span>
            <span>
              P: {actualProteinPct}% &bull; C: {actualCarbsPct}% &bull; F: {actualFatPct}%
            </span>
          </div>
          <div className="w-full h-3 rounded-full overflow-hidden flex bg-stone-200 dark:bg-slate-800">
            {loggedKcalSum > 0 ? (
              <>
                <div
                  className="bg-sky-500 transition-all duration-500"
                  style={{ width: `${actualProteinPct}%` }}
                  title={`Protein: ${actualProteinPct}%`}
                />
                <div
                  className="bg-amber-500 transition-all duration-500"
                  style={{ width: `${actualCarbsPct}%` }}
                  title={`Carbs: ${actualCarbsPct}%`}
                />
                <div
                  className="bg-emerald-500 transition-all duration-500"
                  style={{ width: `${actualFatPct}%` }}
                  title={`Lipids: ${actualFatPct}%`}
                />
              </>
            ) : (
              <div className="w-full h-full bg-stone-300 dark:bg-slate-800 flex items-center justify-center text-[9px] font-mono text-stone-500">
                Awaiting intake entries
              </div>
            )}
          </div>
        </div>

        {/* Celestial Target Distribution Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-[11px] font-mono text-stone-400">
            <span>Celestial Target Ratio ({goals.phaseCategory})</span>
            <span>
              P: {goals.targetProteinPct}% &bull; C: {goals.targetCarbsPct}% &bull; F: {goals.targetFatPct}%
            </span>
          </div>
          <div className="w-full h-3 rounded-full overflow-hidden flex bg-stone-200 dark:bg-slate-800">
            <div
              className="bg-sky-500/80 transition-all duration-500"
              style={{ width: `${goals.targetProteinPct}%` }}
              title={`Target Protein: ${goals.targetProteinPct}%`}
            />
            <div
              className="bg-amber-500/80 transition-all duration-500"
              style={{ width: `${goals.targetCarbsPct}%` }}
              title={`Target Carbs: ${goals.targetCarbsPct}%`}
            />
            <div
              className="bg-emerald-500/80 transition-all duration-500"
              style={{ width: `${goals.targetFatPct}%` }}
              title={`Target Lipids: ${goals.targetFatPct}%`}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
