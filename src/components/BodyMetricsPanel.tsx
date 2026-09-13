import React, { useState, useEffect } from 'react';
import { BodyMetrics, UnitSystem } from '../types';
import { User, Activity, Flame, Scale, TrendingUp, Info } from 'lucide-react';
import { calculateMetabolics } from '../services/solunarEngine';

interface BodyMetricsPanelProps {
  metrics: BodyMetrics;
  onChangeMetrics: (updated: Partial<BodyMetrics>) => void;
  unitSystem: UnitSystem;
  cycleDay: number;
  isDarkMode: boolean;
}

export const BodyMetricsPanel: React.FC<BodyMetricsPanelProps> = ({
  metrics,
  onChangeMetrics,
  unitSystem,
  cycleDay,
  isDarkMode,
}) => {
  const isMetric = unitSystem === 'metric';

  // Display conversions
  const heightInches = Math.round((metrics.heightCm || 175) / 2.54);
  const heightFeet = Math.floor(heightInches / 12);
  const heightRemainderInches = heightInches % 12;
  const weightLbs = metrics.weightLbs ?? Math.round((metrics.weightKg || 63.5) * 2.20462);

  // Local string states to allow clearing out inputs completely without snapping back
  const [ageStr, setAgeStr] = useState<string>(() => (metrics.age ? String(metrics.age) : ''));
  const [heightCmStr, setHeightCmStr] = useState<string>(() => (metrics.heightCm ? String(metrics.heightCm) : ''));
  const [heightFtStr, setHeightFtStr] = useState<string>(() => String(heightFeet));
  const [heightInStr, setHeightInStr] = useState<string>(() => String(heightRemainderInches));
  const [weightStr, setWeightStr] = useState<string>(() =>
    isMetric
      ? (metrics.weightKg ? String(metrics.weightKg) : '63.5')
      : String(metrics.weightLbs || (metrics.weightKg ? Math.round(metrics.weightKg * 2.20462) : 140))
  );

  // Synchronize when unit system changes
  useEffect(() => {
    if (isMetric) {
      const kg = metrics.weightKg || (metrics.weightLbs ? Number((metrics.weightLbs / 2.20462).toFixed(1)) : 63.5);
      setWeightStr(String(kg));
      setHeightCmStr(metrics.heightCm ? String(metrics.heightCm) : '175');
    } else {
      const inTot = Math.round((metrics.heightCm || 175) / 2.54);
      const lbs = metrics.weightLbs || Math.round((metrics.weightKg || 63.5) * 2.20462);
      setWeightStr(String(lbs));
      setHeightFtStr(String(Math.floor(inTot / 12)));
      setHeightInStr(String(inTot % 12));
    }
  }, [isMetric]);

  // Synchronize with external changes to metrics (if not currently focused/cleared by user)
  useEffect(() => {
    if (ageStr !== '' && parseInt(ageStr, 10) !== metrics.age) {
      setAgeStr(metrics.age ? String(metrics.age) : '');
    }
  }, [metrics.age]);

  useEffect(() => {
    if (isMetric) {
      if (heightCmStr !== '' && parseInt(heightCmStr, 10) !== metrics.heightCm) {
        setHeightCmStr(metrics.heightCm ? String(metrics.heightCm) : '');
      }
    } else {
      const inTot = Math.round((metrics.heightCm || 175) / 2.54);
      const ft = Math.floor(inTot / 12);
      const inc = inTot % 12;
      if (heightFtStr !== '' && parseInt(heightFtStr, 10) !== ft) {
        setHeightFtStr(String(ft));
      }
      if (heightInStr !== '' && parseInt(heightInStr, 10) !== inc) {
        setHeightInStr(String(inc));
      }
    }
  }, [metrics.heightCm, isMetric]);

  // Handle Age
  const handleAgeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setAgeStr(val);
    if (val.trim() === '') {
      return; // Permitted to be completely empty
    }
    const num = parseInt(val, 10);
    if (!isNaN(num) && num > 0) {
      onChangeMetrics({ age: num });
    }
  };

  const handleAgeBlur = () => {
    if (ageStr.trim() === '' || isNaN(parseInt(ageStr, 10)) || parseInt(ageStr, 10) < 10) {
      const fallback = metrics.age || 28;
      setAgeStr(String(fallback));
      onChangeMetrics({ age: fallback });
    }
  };

  // Handle Height (Metric)
  const handleHeightCmChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setHeightCmStr(val);
    if (val.trim() === '') {
      return;
    }
    const num = parseInt(val, 10);
    if (!isNaN(num) && num > 0) {
      onChangeMetrics({ heightCm: num });
    }
  };

  const handleHeightCmBlur = () => {
    if (heightCmStr.trim() === '' || isNaN(parseInt(heightCmStr, 10)) || parseInt(heightCmStr, 10) < 50) {
      const fallback = metrics.heightCm || 175;
      setHeightCmStr(String(fallback));
      onChangeMetrics({ heightCm: fallback });
    }
  };

  // Handle Height (Imperial: Feet & Inches)
  const handleHeightFtChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setHeightFtStr(val);
    if (val.trim() === '') {
      return;
    }
    const ft = parseInt(val, 10);
    const inc = parseInt(heightInStr, 10) || 0;
    if (!isNaN(ft) && ft > 0) {
      const totalIn = ft * 12 + inc;
      onChangeMetrics({ heightCm: Math.round(totalIn * 2.54) });
    }
  };

  const handleHeightInChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setHeightInStr(val);
    if (val.trim() === '') {
      return;
    }
    const inc = parseInt(val, 10);
    const ft = parseInt(heightFtStr, 10) || 5;
    if (!isNaN(inc) && inc >= 0) {
      const totalIn = ft * 12 + inc;
      onChangeMetrics({ heightCm: Math.round(totalIn * 2.54) });
    }
  };

  const handleHeightImperialBlur = () => {
    const ft = parseInt(heightFtStr, 10);
    const inc = parseInt(heightInStr, 10);
    const validFt = !isNaN(ft) && ft > 0 ? ft : 5;
    const validIn = !isNaN(inc) && inc >= 0 ? inc : 10;
    setHeightFtStr(String(validFt));
    setHeightInStr(String(validIn));
    onChangeMetrics({ heightCm: Math.round((validFt * 12 + validIn) * 2.54) });
  };

  // Weight Range parameters: explicitly 10 lbs to 600 lbs (or 4.5 kg to 272 kg in metric)
  const minWeightAllowed = isMetric ? 4.5 : 10;
  const maxWeightAllowed = isMetric ? 272 : 600;

  // Handle Weight
  const handleWeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setWeightStr(val);
    if (val.trim() === '') {
      return;
    }
    const num = parseFloat(val);
    if (!isNaN(num) && num > 0) {
      const weightKg = isMetric ? num : Number((num / 2.20462).toFixed(2));
      const weightLbsVal = isMetric ? Math.round(num * 2.20462) : Math.round(num);
      onChangeMetrics({ weightKg, weightLbs: weightLbsVal });
    }
  };

  const handleWeightBlur = () => {
    const val = parseFloat(weightStr);
    if (weightStr.trim() === '' || isNaN(val)) {
      const fallbackKg = 63.5; // ~140 lbs
      const fallbackDisplay = isMetric ? '63.5' : '140';
      setWeightStr(fallbackDisplay);
      onChangeMetrics({ weightKg: fallbackKg, weightLbs: 140 });
    } else if (val < minWeightAllowed) {
      setWeightStr(String(minWeightAllowed));
      const weightKg = isMetric ? minWeightAllowed : Number((minWeightAllowed / 2.20462).toFixed(2));
      onChangeMetrics({ weightKg, weightLbs: isMetric ? Math.round(minWeightAllowed * 2.20462) : minWeightAllowed });
    } else if (val > maxWeightAllowed) {
      setWeightStr(String(maxWeightAllowed));
      const weightKg = isMetric ? maxWeightAllowed : Number((maxWeightAllowed / 2.20462).toFixed(2));
      onChangeMetrics({ weightKg, weightLbs: isMetric ? Math.round(maxWeightAllowed * 2.20462) : maxWeightAllowed });
    }
  };

  // Adjust weight with stepper or slider
  const adjustWeight = (delta: number) => {
    const current = parseFloat(weightStr) || (isMetric ? 63.5 : 140);
    const step = isMetric ? delta * 0.5 : delta;
    const updated = Math.min(maxWeightAllowed, Math.max(minWeightAllowed, Math.round((current + step) * 2) / 2));
    const finalStr = isMetric ? String(updated) : String(Math.round(updated));
    setWeightStr(finalStr);
    const weightKg = isMetric ? updated : Number((updated / 2.20462).toFixed(2));
    const weightLbsVal = isMetric ? Math.round(updated * 2.20462) : Math.round(updated);
    onChangeMetrics({ weightKg, weightLbs: weightLbsVal });
  };

  const setPresetWeight = (presetVal: number) => {
    const finalStr = String(presetVal);
    setWeightStr(finalStr);
    const weightKg = isMetric ? presetVal : Number((presetVal / 2.20462).toFixed(2));
    const weightLbsVal = isMetric ? Math.round(presetVal * 2.20462) : presetVal;
    onChangeMetrics({ weightKg, weightLbs: weightLbsVal });
  };

  const currentNumericWeight = Math.min(
    maxWeightAllowed,
    Math.max(minWeightAllowed, parseFloat(weightStr) || (isMetric ? 63.5 : 140))
  );

  // Safe effective numbers for metabolic formula without crashing or showing NaN
  const effectiveAge = parseInt(ageStr, 10) > 0 ? parseInt(ageStr, 10) : metrics.age || 28;

  let effectiveHeightCm = metrics.heightCm || 175;
  if (isMetric) {
    const cm = parseInt(heightCmStr, 10);
    if (!isNaN(cm) && cm > 0) effectiveHeightCm = cm;
  } else {
    const ft = parseInt(heightFtStr, 10);
    const inc = parseInt(heightInStr, 10);
    const validFt = !isNaN(ft) && ft > 0 ? ft : 5;
    const validIn = !isNaN(inc) && inc >= 0 ? inc : 0;
    effectiveHeightCm = Math.round((validFt * 12 + validIn) * 2.54);
  }

  let effectiveWeightKg = metrics.weightKg || 63.5;
  const numWeight = parseFloat(weightStr);
  if (!isNaN(numWeight) && numWeight > 0) {
    effectiveWeightKg = isMetric ? numWeight : Number((numWeight / 2.20462).toFixed(2));
  }

  const { bmi, bmiCategory, bmr, tdee, isFullMoonPhase, isNewMoonPhase } = calculateMetabolics(
    effectiveWeightKg,
    effectiveHeightCm,
    effectiveAge,
    metrics.gender,
    metrics.activityLevel,
    cycleDay
  );

  const getBmiColor = (cat: string) => {
    switch (cat) {
      case 'Underweight':
        return 'text-amber-500 bg-amber-500/10 border-amber-500/30';
      case 'Optimal Weight':
        return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/30';
      case 'Overweight':
        return 'text-amber-500 bg-amber-500/10 border-amber-500/30';
      default:
        return 'text-rose-500 bg-rose-500/10 border-rose-500/30';
    }
  };

  return (
    <div
      id="body-size-metabolic-panel"
      className={`rounded-2xl border p-5 sm:p-6 transition-all duration-200 ${
        isDarkMode
          ? 'bg-slate-900/90 border-slate-800 text-slate-100 shadow-xl shadow-black/20'
          : 'bg-white border-stone-200 text-stone-900 shadow-md shadow-stone-200/50'
      }`}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
        <div className="flex items-center gap-2.5">
          <div
            className={`p-2 rounded-xl border ${
              isDarkMode ? 'bg-slate-800 border-slate-700 text-amber-400' : 'bg-amber-50 border-amber-200 text-amber-700'
            }`}
          >
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-serif font-bold text-lg leading-tight">Body Composition &amp; Basal Metabolics</h2>
            <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-stone-500'}`}>
              Biometric profiling calibrated to circadian &amp; solunar energetics ({isMetric ? 'Metric Units' : 'Standard Imperial'})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <span
            className={`text-xs px-3 py-1 rounded-full font-mono font-semibold border ${getBmiColor(
              bmiCategory
            )}`}
          >
            BMI {bmi} &bull; {bmiCategory}
          </span>
        </div>
      </div>

      {/* Input controls */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mb-5">
        {/* Age */}
        <div>
          <label className={`block text-[11px] font-mono uppercase tracking-wider mb-1 ${isDarkMode ? 'text-slate-400' : 'text-stone-500'}`}>
            Age (Years)
          </label>
          <div className="relative">
            <input
              id="body-age-input"
              type="number"
              min="16"
              max="120"
              value={ageStr}
              onChange={handleAgeChange}
              onBlur={handleAgeBlur}
              placeholder="e.g. 34"
              className={`w-full px-3 py-2 pr-7 rounded-xl border text-sm font-mono font-medium transition-all ${
                isDarkMode
                  ? 'bg-slate-950 border-slate-700 text-slate-100 focus:border-amber-400'
                  : 'bg-stone-50 border-stone-300 text-stone-900 focus:border-amber-600'
              }`}
            />
            {ageStr !== '' && (
              <button
                type="button"
                onClick={() => setAgeStr('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 text-sm px-1 cursor-pointer"
                title="Clear age"
                aria-label="Clear age"
              >
                &times;
              </button>
            )}
          </div>
        </div>

        {/* Gender */}
        <div>
          <label className={`block text-[11px] font-mono uppercase tracking-wider mb-1 ${isDarkMode ? 'text-slate-400' : 'text-stone-500'}`}>
            Biological Sex
          </label>
          <select
            id="body-gender-select"
            value={metrics.gender}
            onChange={(e) => onChangeMetrics({ gender: e.target.value as 'male' | 'female' })}
            className={`w-full px-3 py-2 rounded-xl border text-sm font-medium transition-all ${
              isDarkMode
                ? 'bg-slate-950 border-slate-700 text-slate-100'
                : 'bg-stone-50 border-stone-300 text-stone-900'
            }`}
          >
            <option value="male">Male (XY)</option>
            <option value="female">Female (XX)</option>
          </select>
        </div>

        {/* Height */}
        <div>
          <label className={`block text-[11px] font-mono uppercase tracking-wider mb-1 ${isDarkMode ? 'text-slate-400' : 'text-stone-500'}`}>
            Height ({isMetric ? 'cm' : 'ft / in'})
          </label>
          {isMetric ? (
            <div className="relative">
              <input
                id="body-height-cm-input"
                type="number"
                min="50"
                max="250"
                value={heightCmStr}
                onChange={handleHeightCmChange}
                onBlur={handleHeightCmBlur}
                placeholder="e.g. 178"
                className={`w-full px-3 py-2 pr-7 rounded-xl border text-sm font-mono font-medium transition-all ${
                  isDarkMode
                    ? 'bg-slate-950 border-slate-700 text-slate-100'
                    : 'bg-stone-50 border-stone-300 text-stone-900'
                }`}
              />
              {heightCmStr !== '' && (
                <button
                  type="button"
                  onClick={() => setHeightCmStr('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 text-sm px-1 cursor-pointer"
                  title="Clear height"
                  aria-label="Clear height"
                >
                  &times;
                </button>
              )}
            </div>
          ) : (
            <div className="flex gap-1.5">
              <div className="relative w-1/2">
                <input
                  id="body-height-ft-input"
                  type="number"
                  min="2"
                  max="8"
                  value={heightFtStr}
                  onChange={handleHeightFtChange}
                  onBlur={handleHeightImperialBlur}
                  className={`w-full px-2 py-2 pr-5 rounded-xl border text-xs font-mono text-center ${
                    isDarkMode ? 'bg-slate-950 border-slate-700 text-slate-100' : 'bg-stone-50 border-stone-300 text-stone-900'
                  }`}
                  placeholder="ft"
                />
                {heightFtStr !== '' && (
                  <button
                    type="button"
                    onClick={() => setHeightFtStr('')}
                    className="absolute right-1 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 text-xs px-1 cursor-pointer"
                    title="Clear feet"
                    aria-label="Clear feet"
                  >
                    &times;
                  </button>
                )}
              </div>
              <div className="relative w-1/2">
                <input
                  id="body-height-in-input"
                  type="number"
                  min="0"
                  max="11"
                  value={heightInStr}
                  onChange={handleHeightInChange}
                  onBlur={handleHeightImperialBlur}
                  className={`w-full px-2 py-2 pr-5 rounded-xl border text-xs font-mono text-center ${
                    isDarkMode ? 'bg-slate-950 border-slate-700 text-slate-100' : 'bg-stone-50 border-stone-300 text-stone-900'
                  }`}
                  placeholder="in"
                />
                {heightInStr !== '' && (
                  <button
                    type="button"
                    onClick={() => setHeightInStr('')}
                    className="absolute right-1 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 text-xs px-1 cursor-pointer"
                    title="Clear inches"
                    aria-label="Clear inches"
                  >
                    &times;
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Weight */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className={`block text-[11px] font-mono uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-stone-500'}`}>
              Weight ({isMetric ? 'kg' : 'lbs'})
            </label>
            <span className="text-[10px] font-mono text-stone-400">
              {isMetric ? '4.5 – 272 kg' : '10 – 600 lbs'}
            </span>
          </div>
          <div className="relative">
            <input
              id="body-weight-input"
              type="number"
              min={isMetric ? 4.5 : 10}
              max={isMetric ? 272 : 600}
              step={isMetric ? '0.1' : '1'}
              value={weightStr}
              onChange={handleWeightChange}
              onBlur={handleWeightBlur}
              placeholder={isMetric ? 'e.g. 63.5' : 'e.g. 140'}
              className={`w-full px-3 py-2 pr-7 rounded-xl border text-sm font-mono font-medium transition-all ${
                isDarkMode
                  ? 'bg-slate-950 border-slate-700 text-slate-100'
                  : 'bg-stone-50 border-stone-300 text-stone-900'
              }`}
            />
            {weightStr !== '' && (
              <button
                type="button"
                onClick={() => setWeightStr('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 text-sm px-1 cursor-pointer"
                title="Clear weight"
                aria-label="Clear weight"
              >
                &times;
              </button>
            )}
          </div>

          {/* Quick Slider & Stepper Controls ranging from 10 to 600 lbs */}
          <div className="mt-1.5 flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => adjustWeight(-5)}
              className={`px-1.5 py-0.5 rounded text-[10px] font-mono border transition-colors cursor-pointer ${
                isDarkMode
                  ? 'border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-800'
                  : 'border-stone-300 bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
              title={isMetric ? 'Minus 2.5 kg' : 'Minus 5 lbs'}
            >
              -5
            </button>
            <input
              id="body-weight-slider"
              type="range"
              min={isMetric ? 4.5 : 10}
              max={isMetric ? 272 : 600}
              step={isMetric ? 0.5 : 1}
              value={currentNumericWeight}
              onChange={(e) => {
                const val = e.target.value;
                setWeightStr(val);
                const num = parseFloat(val);
                if (!isNaN(num)) {
                  const weightKg = isMetric ? num : Number((num / 2.20462).toFixed(2));
                  const weightLbsVal = isMetric ? Math.round(num * 2.20462) : Math.round(num);
                  onChangeMetrics({ weightKg, weightLbs: weightLbsVal });
                }
              }}
              className="flex-1 accent-amber-500 h-1.5 bg-stone-200 dark:bg-slate-800 rounded-lg cursor-pointer"
              title={`Slide weight (${isMetric ? '4.5 - 272 kg' : '10 - 600 lbs'})`}
            />
            <button
              type="button"
              onClick={() => adjustWeight(5)}
              className={`px-1.5 py-0.5 rounded text-[10px] font-mono border transition-colors cursor-pointer ${
                isDarkMode
                  ? 'border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-800'
                  : 'border-stone-300 bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
              title={isMetric ? 'Plus 2.5 kg' : 'Plus 5 lbs'}
            >
              +5
            </button>
          </div>

          {/* Quick preset chips for mobile convenience */}
          <div className="mt-1.5 flex items-center justify-between gap-1 overflow-x-auto py-0.5">
            {(isMetric ? [50, 58, 63.5, 70, 80, 90] : [110, 125, 140, 155, 175, 200]).map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setPresetWeight(preset)}
                className={`text-[9px] font-mono px-1.5 py-0.5 rounded-md border transition-colors cursor-pointer ${
                  Math.round(currentNumericWeight) === Math.round(preset)
                    ? 'border-amber-500 bg-amber-500/15 text-amber-500 font-bold'
                    : isDarkMode
                    ? 'border-slate-800 text-slate-400 hover:border-slate-700'
                    : 'border-stone-200 text-stone-500 hover:border-stone-300'
                }`}
              >
                {preset}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Activity Level Selector */}
      <div className="mb-5">
        <label className={`block text-[11px] font-mono uppercase tracking-wider mb-1.5 ${isDarkMode ? 'text-slate-400' : 'text-stone-500'}`}>
          Daily Metabolic Activity Level
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {[
            { key: 'sedentary', label: 'Sedentary', sub: 'Desk / Low' },
            { key: 'light', label: 'Light', sub: '1-2 days/wk' },
            { key: 'moderate', label: 'Moderate', sub: '3-5 days/wk' },
            { key: 'active', label: 'Active', sub: '6-7 days/wk' },
            { key: 'very_active', label: 'Very Active', sub: 'Intense / Athletic' },
          ].map((act) => {
            const isSelected = metrics.activityLevel === act.key;
            return (
              <button
                key={act.key}
                type="button"
                onClick={() => onChangeMetrics({ activityLevel: act.key as BodyMetrics['activityLevel'] })}
                className={`px-2.5 py-2 rounded-xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? isDarkMode
                      ? 'bg-amber-500/15 border-amber-400 text-amber-200'
                      : 'bg-amber-100/70 border-amber-400 text-amber-950 font-semibold'
                    : isDarkMode
                    ? 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                    : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
                }`}
              >
                <div className="text-xs font-medium leading-tight">{act.label}</div>
                <div className="text-[10px] opacity-75 font-mono">{act.sub}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Metabolic Outcomes Card Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Basal Metabolic Rate (BMR) */}
        <div
          className={`p-3.5 rounded-xl border ${
            isDarkMode ? 'bg-slate-950/80 border-slate-800' : 'bg-stone-50 border-stone-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-[10px] uppercase font-mono tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-stone-500'}`}>
              BMR (Basal Rate)
            </span>
            <Flame className="w-4 h-4 text-orange-500" />
          </div>
          <div className="text-xl font-mono font-bold mt-1">
            {bmr.toLocaleString()} <span className="text-xs font-sans font-normal text-stone-400">kcal/day</span>
          </div>
          <p className="text-[11px] text-stone-400 mt-1 leading-relaxed">
            Minimum cellular baseline at rest (Mifflin-St Jeor formula).
          </p>
        </div>

        {/* Total Daily Energy Expenditure (TDEE) */}
        <div
          className={`p-3.5 rounded-xl border ${
            isDarkMode ? 'bg-slate-950/80 border-slate-800' : 'bg-stone-50 border-stone-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-[10px] uppercase font-mono tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-stone-500'}`}>
              TDEE (Daily Output)
            </span>
            <Activity className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-xl font-mono font-bold mt-1">
            {tdee.toLocaleString()} <span className="text-xs font-sans font-normal text-stone-400">kcal/day</span>
          </div>
          <p className="text-[11px] text-stone-400 mt-1 leading-relaxed">
            Active expenditure incorporating thermic work &amp; movement.
          </p>
        </div>

        {/* Solunar Metabolic Shift */}
        <div
          className={`p-3.5 rounded-xl border ${
            isFullMoonPhase
              ? isDarkMode
                ? 'bg-amber-950/30 border-amber-800/60 text-amber-200'
                : 'bg-amber-50/80 border-amber-200 text-amber-900'
              : isNewMoonPhase
              ? isDarkMode
                ? 'bg-indigo-950/30 border-indigo-800/60 text-indigo-200'
                : 'bg-indigo-50/80 border-indigo-200 text-indigo-900'
              : isDarkMode
              ? 'bg-slate-950/80 border-slate-800 text-slate-200'
              : 'bg-stone-50 border-stone-200 text-stone-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-mono tracking-wider font-semibold">
              {isFullMoonPhase ? 'Full Moon Metabolic Phase' : isNewMoonPhase ? 'New Moon Restorative Phase' : 'Transitional Energy Phase'}
            </span>
            <TrendingUp className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-sm font-semibold mt-1">
            {isFullMoonPhase
              ? 'Protein & Lipid Uptake Active'
              : isNewMoonPhase
              ? 'Long-Chain Carb Glycogen Loading'
              : 'Balanced Sustained Macro Split'}
          </div>
          <p className="text-[11px] opacity-80 mt-1 leading-relaxed">
            {isFullMoonPhase
              ? `Caloric target ~${tdee + 100} kcal. Gravitational & light flux demands cellular tissue repair.`
              : isNewMoonPhase
              ? `Caloric target ~${tdee} kcal. Prioritize complex carbs for glycogen & melatonin synthesis.`
              : `Standard maintenance ~${tdee} kcal.`}
          </p>
        </div>
      </div>
    </div>
  );
};
