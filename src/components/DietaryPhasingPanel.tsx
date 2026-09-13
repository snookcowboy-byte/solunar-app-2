import React, { useState } from 'react';
import { DietaryLogItem, MoonPhaseName, TideData, EphemerisData, BodyMetrics } from '../types';
import {
  Utensils,
  Plus,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Sparkles,
  Apple,
  Award,
  Clock,
  Droplets,
  Flame,
  Layers,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Compass,
  Fish,
} from 'lucide-react';
import {
  getLunarPhaseDietaryRecommendations,
  DailyMealRecommendation,
} from '../services/lunarDietaryService';
import { MacroSummaryChart } from './MacroSummaryChart';
import { SolunarTideScheduleView } from './SolunarTideScheduleView';
import {
  calculateCelestialMacroGoals,
  calculateDailySolunarTideWindows,
  SolunarScheduleWindow,
} from '../services/solunarBiteService';

interface DietaryPhasingPanelProps {
  moonPhaseName: MoonPhaseName;
  cycleDay: number;
  dietaryLogs: DietaryLogItem[];
  onAddLogItem: (item: Omit<DietaryLogItem, 'id' | 'timestamp' | 'phaseAlignment'>) => void;
  onRemoveLogItem: (id: string) => void;
  isDarkMode: boolean;
  tideData?: TideData;
  ephemeris?: EphemerisData;
  currentTime?: Date;
  bodyMetrics?: BodyMetrics;
}

export const DietaryPhasingPanel: React.FC<DietaryPhasingPanelProps> = ({
  moonPhaseName,
  cycleDay,
  dietaryLogs,
  onAddLogItem,
  onRemoveLogItem,
  isDarkMode,
  tideData,
  ephemeris,
  currentTime,
  bodyMetrics,
}) => {
  // Calibration mode state: 'live' | 'full_moon' | 'new_moon' | 'waxing' | 'waning'
  const [calibrationMode, setCalibrationMode] = useState<'live' | 'full_moon' | 'new_moon' | 'waxing' | 'waning'>('live');

  const effectivePhaseName: MoonPhaseName =
    calibrationMode === 'full_moon'
      ? 'Full Moon'
      : calibrationMode === 'new_moon'
      ? 'New Moon'
      : calibrationMode === 'waxing'
      ? 'First Quarter'
      : calibrationMode === 'waning'
      ? 'Last Quarter'
      : moonPhaseName;

  const effectiveCycleDay: number =
    calibrationMode === 'full_moon'
      ? 14.8
      : calibrationMode === 'new_moon'
      ? 0.8
      : calibrationMode === 'waxing'
      ? 7.4
      : calibrationMode === 'waning'
      ? 22.1
      : cycleDay;

  // Retrieve daily recommendations tailored to effective lunar phase
  const guidance = getLunarPhaseDietaryRecommendations(effectivePhaseName, effectiveCycleDay);

  // Biometric and celestial baseline configurations
  const defaultBodyMetrics: BodyMetrics = bodyMetrics || {
    age: 35,
    gender: 'male',
    heightCm: 178,
    weightKg: 63.5, // 140 lbs baseline
    activityLevel: 'moderate',
  };

  const isEffectiveFullMoon =
    effectivePhaseName === 'Full Moon' || (effectiveCycleDay >= 12.5 && effectiveCycleDay <= 17.5);

  const defaultTideData: TideData = isEffectiveFullMoon
    ? {
        currentHeight: 2.8,
        unit: 'feet',
        rawHeightMeters: 0.85,
        nextEventType: 'High Tide',
        nextEventTime: '12:00 AM',
        minutesToNextEvent: 10,
        tidePhaseRad: 0,
        isRising: true,
        tideCategory: 'Spring Tide (Full Moon Syzygy Amplification)',
        hourlyWavePoints: [
          { hour: 0, height: 2.8 },
          { hour: 3, height: 1.1 },
          { hour: 6.25, height: -0.5 },
          { hour: 9.5, height: 1.2 },
          { hour: 12.5, height: 2.7 },
          { hour: 15.5, height: 1.0 },
          { hour: 18.75, height: -0.6 },
          { hour: 21.5, height: 1.3 },
          { hour: 24, height: 2.8 },
        ],
      }
    : tideData || {
        currentHeight: 1.5,
        unit: 'feet',
        rawHeightMeters: 0.46,
        nextEventType: 'High Tide',
        nextEventTime: '2:15 PM',
        minutesToNextEvent: 15,
        tidePhaseRad: 0,
        isRising: true,
        tideCategory: 'Spring Tide (Syzygy Amplification)',
        hourlyWavePoints: [],
      };

  const activeDate = currentTime || new Date();

  // Celestial macro goals calculated from user biometric TDEE and lunar phase
  const celestialGoals = calculateCelestialMacroGoals(defaultBodyMetrics, effectiveCycleDay, effectivePhaseName);

  // 24/7 365 daily micro-intake schedule based on tidal highs and lows and moon overhead/underfoot
  const solunarWindows = calculateDailySolunarTideWindows(
    activeDate,
    effectiveCycleDay,
    defaultTideData,
    defaultBodyMetrics
  );

  // Active tabs for recommendations view: 'solunar-schedule' | 'daily-menu' | 'superfoods' | 'intake-log'
  const [activeTab, setActiveTab] = useState<'solunar-schedule' | 'daily-menu' | 'superfoods' | 'intake-log'>('solunar-schedule');

  // Selected meal recommendation filter
  const [selectedMealFilter, setSelectedMealFilter] = useState<string>('All');

  // Food logging form state
  const isNewMoon = guidance.phaseCategory === 'New Moon';
  const isFullMoon = guidance.phaseCategory === 'Full Moon';

  const [foodName, setFoodName] = useState('');
  const [mealType, setMealType] = useState<DietaryLogItem['mealType']>('breakfast');
  const [category, setCategory] = useState<DietaryLogItem['category']>(
    isNewMoon ? 'long_chain_carbs' : isFullMoon ? 'proteins' : 'balanced_mixed'
  );
  const [calories, setCalories] = useState<string>('450');
  const [proteinGrams, setProteinGrams] = useState<string>('25');
  const [carbsGrams, setCarbsGrams] = useState<string>('50');
  const [fatGrams, setFatGrams] = useState<string>('15');
  const [notes, setNotes] = useState('');
  const [showLogSuccess, setShowLogSuccess] = useState<boolean>(false);

  // Handle logging a recommended meal with one click
  const handleAdoptRecommendation = (meal: DailyMealRecommendation) => {
    setFoodName(meal.title);
    const mType =
      meal.mealTime === 'Night Bite'
        ? 'snack'
        : (meal.mealTime.toLowerCase() as DietaryLogItem['mealType']);
    setMealType(mType);

    // Auto-select category aligned with current phase
    if (guidance.phaseCategory === 'New Moon') {
      setCategory('long_chain_carbs');
    } else if (guidance.phaseCategory === 'Full Moon') {
      setCategory(
        meal.macroRatio.proteinPct >= 35
          ? 'proteins'
          : meal.macroRatio.fatPct >= 35
          ? 'lipids'
          : 'proteins'
      );
    } else {
      setCategory(meal.macroRatio.proteinPct >= 35 ? 'proteins' : 'balanced_mixed');
    }

    setCalories(String(meal.calories));
    setProteinGrams(String(meal.proteinG));
    setCarbsGrams(String(meal.carbsG));
    setFatGrams(String(meal.fatG));

    setNotes(
      `Calibrated to ${guidance.phaseCategory} (${meal.mealTime}): ${meal.keyNutrients.slice(0, 3).join(', ')}. ${meal.portionTip}`
    );
    // Scroll or switch to log tab
    setActiveTab('intake-log');
  };

  // Handle adopting a micro-intake recommendation from the 24/7 solunar & tidal schedule
  const handleAdoptSolunarWindowIntake = (win: SolunarScheduleWindow) => {
    setFoodName(`${win.title}: ${win.microIntake.suggestedMeal}`);
    const mType: DietaryLogItem['mealType'] =
      win.type === 'high_tide' || win.type === 'major_overhead'
        ? 'lunch'
        : win.type === 'major_underfoot'
        ? 'dinner'
        : 'snack';
    setMealType(mType);

    if (win.type === 'major_overhead') {
      setCategory('long_chain_carbs');
    } else if (win.type === 'high_tide') {
      setCategory('proteins');
    } else if (win.type === 'low_tide') {
      setCategory('lipids');
    } else {
      setCategory('balanced_mixed');
    }

    setCalories(String(win.microIntake.calories));
    setProteinGrams(String(win.microIntake.proteinG));
    setCarbsGrams(String(win.microIntake.carbsG));
    setFatGrams(String(win.microIntake.fatG));
    setNotes(
      `Micro-Intake (${win.timeRange} | ${win.biteWindowType}): ${win.microIntake.keyElectrolytes}. Rationale: ${win.microIntake.rationale}`
    );
    setActiveTab('intake-log');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!foodName.trim()) return;

    onAddLogItem({
      foodName: foodName.trim(),
      mealType,
      category,
      calories: Math.max(0, parseInt(calories, 10) || 0),
      proteinGrams: Math.max(0, parseInt(proteinGrams, 10) || 0),
      carbsGrams: Math.max(0, parseInt(carbsGrams, 10) || 0),
      fatGrams: Math.max(0, parseInt(fatGrams, 10) || 0),
      notes: notes.trim(),
    });

    setFoodName('');
    setNotes('');
    setShowLogSuccess(true);
    setTimeout(() => setShowLogSuccess(false), 3000);
  };

  // Quick preset meals based on current phase
  const presets = isNewMoon
    ? [
        {
          name: 'Sweet Potato, Black Bean & Quinoa Bowl',
          type: 'lunch' as const,
          cat: 'long_chain_carbs' as const,
          cal: 520,
          p: 18,
          c: 88,
          f: 11,
          notes: 'High amylose long-chain polysaccharides for restorative serotonin conversion.',
        },
        {
          name: 'Steel-Cut Oats with Berries & Pumpkin Seeds',
          type: 'breakfast' as const,
          cat: 'long_chain_carbs' as const,
          cal: 390,
          p: 14,
          c: 65,
          f: 9,
          notes: 'Beta-glucan complex fiber promoting steady nocturnal glycogen maintenance.',
        },
        {
          name: 'Lentil Dahl with Roasted Butternut Squash',
          type: 'dinner' as const,
          cat: 'long_chain_carbs' as const,
          cal: 480,
          p: 22,
          c: 74,
          f: 10,
          notes: 'Grounding low-GI carbohydrates balancing parasympathetic recovery.',
        },
      ]
    : isFullMoon
    ? [
        {
          name: 'Wild Alaskan Salmon & Avocado Plate',
          type: 'dinner' as const,
          cat: 'proteins' as const,
          cal: 620,
          p: 42,
          c: 32,
          f: 34,
          notes: 'Balanced omega-3 DHA/EPA lipids, structural protein & low-glycemic greens.',
        },
        {
          name: 'Pastured Eggs, Olive Oil Greens & Sourdough',
          type: 'breakfast' as const,
          cat: 'lipids' as const,
          cal: 510,
          p: 28,
          c: 28,
          f: 30,
          notes: 'Balanced lipids and bioavailable choline supporting lunar cognitive stability.',
        },
        {
          name: 'Grass-Fed Sirloin & Roasted Mediterranean Greens',
          type: 'lunch' as const,
          cat: 'proteins' as const,
          cal: 640,
          p: 46,
          c: 34,
          f: 32,
          notes: 'Heme-iron and structural amino matrix under peak gravitational spring tide.',
        },
      ]
    : [
        {
          name: 'Mediterranean Grilled Chicken & Farro Salad',
          type: 'lunch' as const,
          cat: 'balanced_mixed' as const,
          cal: 540,
          p: 38,
          c: 52,
          f: 18,
          notes: 'Balanced macronutrients for intermediate lunar transition trajectory.',
        },
        {
          name: 'Chia Seed Greek Yogurt Parfait with Walnuts',
          type: 'breakfast' as const,
          cat: 'balanced_mixed' as const,
          cal: 420,
          p: 24,
          c: 36,
          f: 20,
          notes: 'Prebiotic fiber with balanced slow whey/casein protein peptides.',
        },
      ];

  const loadPreset = (preset: (typeof presets)[0]) => {
    setFoodName(preset.name);
    setMealType(preset.type);
    setCategory(preset.cat);
    setCalories(String(preset.cal));
    setProteinGrams(String(preset.p));
    setCarbsGrams(String(preset.c));
    setFatGrams(String(preset.f));
    setNotes(preset.notes);
    setActiveTab('intake-log');
  };

  // Macro Totals
  const totalCalories = dietaryLogs.reduce((sum, item) => sum + item.calories, 0);
  const totalProtein = dietaryLogs.reduce((sum, item) => sum + item.proteinGrams, 0);
  const totalCarbs = dietaryLogs.reduce((sum, item) => sum + item.carbsGrams, 0);
  const totalFat = dietaryLogs.reduce((sum, item) => sum + item.fatGrams, 0);

  const alignedCount = dietaryLogs.filter((i) => i.phaseAlignment === 'optimal').length;

  // Filtered meals
  const filteredMeals =
    selectedMealFilter === 'All'
      ? guidance.meals
      : guidance.meals.filter((m) => m.mealTime === selectedMealFilter);

  return (
    <div
      id="dietary-phasing-intake-panel"
      className={`rounded-2xl border p-5 sm:p-6 transition-all duration-200 ${
        isDarkMode
          ? 'bg-slate-900/90 border-slate-800 text-slate-100 shadow-xl shadow-black/20'
          : 'bg-white border-stone-200 text-stone-900 shadow-md shadow-stone-200/50'
      }`}
    >
      {/* Header with Lunar Phase Directives */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div
            className={`p-2.5 rounded-xl border ${
              isNewMoon
                ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400'
                : isFullMoon
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-500'
                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500'
            }`}
          >
            <Utensils className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-serif font-bold text-lg sm:text-xl leading-tight">
                Daily Lunar Dietary Recommendations
              </h2>
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-mono font-semibold border ${
                  calibrationMode === 'full_moon'
                    ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                    : calibrationMode === 'live'
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                    : 'bg-sky-500/10 border-sky-500/30 text-sky-400'
                }`}
              >
                {calibrationMode === 'full_moon'
                  ? '🌕 Full Moon Calibrated'
                  : calibrationMode === 'live'
                  ? 'Live Sync'
                  : 'Calibrated Mode'}
              </span>
            </div>
            <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-stone-500'}`}>
              Chrononutrition calibrated to Day {effectiveCycleDay.toFixed(1)} of 29.5 &bull; {effectivePhaseName}
            </p>
          </div>
        </div>

        {/* Phase directive badge */}
        <div
          className={`px-3.5 py-1.5 rounded-full text-xs font-mono font-semibold border flex items-center gap-2 self-start sm:self-auto ${
            isNewMoon
              ? 'bg-indigo-950/80 border-indigo-700 text-indigo-200 shadow-xs'
              : isFullMoon
              ? 'bg-amber-950/80 border-amber-600 text-amber-200 shadow-xs'
              : 'bg-stone-100 dark:bg-slate-800 border-stone-300 dark:border-slate-700 text-stone-800 dark:text-slate-200'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">
            {isNewMoon
              ? 'New Moon: High Complex Carbohydrates'
              : isFullMoon
              ? 'Full Moon: Balanced Proteins, Carbs & Lipids'
              : `${effectivePhaseName}: Harmonic Nutrition`}
          </span>
        </div>
      </div>

      {/* Lunar Phase Menu Calibration Selector Bar */}
      <div
        id="phase-calibration-selector-bar"
        className={`p-3 rounded-2xl border mb-5 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs ${
          isDarkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-stone-50 border-stone-200'
        }`}
      >
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
          <span className="font-mono font-bold tracking-wide">Phase Menu Calibration:</span>
          {calibrationMode !== 'live' && (
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-bold border border-amber-500/30">
              Calibrated Simulation
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-1.5 font-mono">
          <button
            type="button"
            id="calibrate-live-sync-btn"
            onClick={() => setCalibrationMode('live')}
            className={`px-2.5 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              calibrationMode === 'live'
                ? 'bg-stone-800 dark:bg-stone-100 text-white dark:text-stone-900 font-bold shadow-xs'
                : 'text-stone-400 hover:text-stone-200 hover:bg-black/10 dark:hover:bg-white/5'
            }`}
          >
            <span>Live Celestial Sync</span>
          </button>

          <button
            type="button"
            id="calibrate-full-moon-btn"
            onClick={() => setCalibrationMode('full_moon')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 font-bold ${
              calibrationMode === 'full_moon'
                ? 'bg-amber-500 text-amber-950 shadow-md ring-2 ring-amber-400/50'
                : 'bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20'
            }`}
          >
            <span>🌕 Full Moon Cycle (Day 14.8)</span>
          </button>

          <button
            type="button"
            id="calibrate-new-moon-btn"
            onClick={() => setCalibrationMode('new_moon')}
            className={`px-2.5 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              calibrationMode === 'new_moon'
                ? 'bg-indigo-600 text-white font-bold shadow-xs'
                : 'text-indigo-400 hover:text-indigo-300 hover:bg-indigo-950/30'
            }`}
          >
            <span>🌑 New Moon (Day 0.8)</span>
          </button>

          <button
            type="button"
            id="calibrate-waxing-btn"
            onClick={() => setCalibrationMode('waxing')}
            className={`px-2.5 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              calibrationMode === 'waxing'
                ? 'bg-emerald-600 text-white font-bold shadow-xs'
                : 'text-emerald-400 hover:text-emerald-300 hover:bg-emerald-950/30'
            }`}
          >
            <span>🌓 Waxing (Day 7.4)</span>
          </button>

          <button
            type="button"
            id="calibrate-waning-btn"
            onClick={() => setCalibrationMode('waning')}
            className={`px-2.5 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              calibrationMode === 'waning'
                ? 'bg-purple-600 text-white font-bold shadow-xs'
                : 'text-purple-400 hover:text-purple-300 hover:bg-purple-950/30'
            }`}
          >
            <span>🌗 Waning (Day 22.1)</span>
          </button>
        </div>
      </div>

      {/* Full Moon Specific Calibration Banner */}
      {isEffectiveFullMoon && (
        <div
          id="full-moon-calibration-alert"
          className={`p-4 rounded-2xl border mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
            isDarkMode
              ? 'bg-amber-950/40 border-amber-600/40 text-amber-200'
              : 'bg-amber-50 border-amber-300 text-amber-950'
          }`}
        >
          <div className="flex items-start gap-3">
            <span className="text-2xl mt-0.5 select-none">🌕</span>
            <div className="space-y-1">
              <div className="font-mono font-bold uppercase tracking-wider text-[11px] text-amber-400 flex items-center gap-2">
                <span>Full Moon Synodic Calibration Calibrated &amp; Active</span>
                <span className="opacity-60">&bull;</span>
                <span className="font-normal text-stone-300">Day {effectiveCycleDay.toFixed(1)} / 29.5 &bull; 100% Illum &bull; Syzygy Spring Tides</span>
              </div>
              <p className="leading-relaxed opacity-90 max-w-3xl">
                The phase menu and 24/7 tidal schedule are calibrated for <strong>Full Moon Syzygy Spring Tides</strong>. Macro targets are calibrated for structural tissue remodeling (30–35% protein) and marine omega phospholipids (30–35% lipids), with natural potassium diuretics (wild asparagus, dandelion greens) to counteract hydrostatic extracellular fluid retention. Night Bite nocturnal angling fuel is included for midnight overhead solunar windows.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setActiveTab('daily-menu');
              setSelectedMealFilter('Night Bite');
            }}
            className="shrink-0 px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-amber-950 font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition-all self-start sm:self-center"
          >
            <Fish className="w-3.5 h-3.5" />
            <span>View Full Moon Night Bite</span>
          </button>
        </div>
      )}

      {/* Prominent Current Lunar Phase Recommendation Banner */}
      <div
        id="phase-recommendation-hero-card"
        className={`p-4 sm:p-5 rounded-2xl border mb-6 relative overflow-hidden ${
          isNewMoon
            ? isDarkMode
              ? 'bg-gradient-to-br from-indigo-950/80 via-slate-900 to-indigo-950/50 border-indigo-700/70 text-indigo-100'
              : 'bg-gradient-to-br from-indigo-50 via-white to-indigo-100/50 border-indigo-200 text-indigo-950'
            : isFullMoon
            ? isDarkMode
              ? 'bg-gradient-to-br from-amber-950/80 via-slate-900 to-amber-950/50 border-amber-700/70 text-amber-100'
              : 'bg-gradient-to-br from-amber-50 via-white to-amber-100/50 border-amber-200 text-amber-950'
            : isDarkMode
            ? 'bg-slate-950/80 border-slate-800 text-slate-200'
            : 'bg-stone-50 border-stone-200 text-stone-900'
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="flex items-start gap-3.5 flex-1">
            <div className="text-3xl sm:text-4xl select-none mt-0.5">
              {isNewMoon ? '🌑' : isFullMoon ? '🌕' : guidance.phaseCategory === 'Waxing' ? '🌓' : '🌗'}
            </div>
            <div className="space-y-1.5 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-md font-bold bg-black/20 dark:bg-white/10">
                  {guidance.phaseCategory} Mandate
                </span>
                <span className="text-xs font-mono opacity-80">Cycle Day {effectiveCycleDay.toFixed(1)} / 29.5</span>
              </div>
              <h3 className="font-serif font-bold text-base sm:text-lg leading-tight">
                {guidance.headline}
              </h3>
              <p className="text-xs leading-relaxed opacity-90 max-w-3xl">
                {guidance.biologicalMechanism}
              </p>
            </div>
          </div>

          {/* Quick Target Macronutrient Distribution Pill */}
          <div
            className={`p-3 rounded-xl border text-xs font-mono shrink-0 md:w-64 ${
              isDarkMode ? 'bg-slate-950/60 border-slate-800/80' : 'bg-white/80 border-stone-300/80'
            }`}
          >
            <div className="font-bold uppercase tracking-wider text-[10px] opacity-75 mb-2 flex items-center justify-between">
              <span>Target Macro Ratio</span>
              <span className="text-emerald-500">Phase Calibrated</span>
            </div>
            <div className="space-y-1 text-[11px]">
              <div className="flex justify-between">
                <span className="opacity-80">Carbohydrates:</span>
                <span className="font-bold text-amber-500">
                  {isNewMoon ? '55% – 60% (High Complex)' : isFullMoon ? '35% – 40% (Controlled)' : '45% – 50%'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-80">Protein:</span>
                <span className="font-bold text-sky-400">
                  {isNewMoon ? '20% – 25%' : isFullMoon ? '30% – 35% (Structural)' : '25% – 30%'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-80">Lipids / Fats:</span>
                <span className="font-bold text-emerald-400">
                  {isNewMoon ? '20% (Low-Moderate)' : isFullMoon ? '30% – 35% (Healthy Omegas)' : '25%'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Daily Macronutrient Summary Chart: Consumed vs Celestial Goals */}
      <MacroSummaryChart
        totalCalories={totalCalories}
        totalProtein={totalProtein}
        totalCarbs={totalCarbs}
        totalFat={totalFat}
        goals={celestialGoals}
        isDarkMode={isDarkMode}
      />

      {/* Navigation Tabs for Dietary Recommendations */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-3 mb-5 border-stone-200 dark:border-slate-800">
        <div className="flex items-center gap-1.5 overflow-x-auto py-1">
          <button
            id="tab-solunar-schedule-btn"
            type="button"
            onClick={() => setActiveTab('solunar-schedule')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'solunar-schedule'
                ? 'bg-sky-600 text-white shadow-xs font-semibold'
                : isDarkMode
                ? 'bg-slate-800/80 hover:bg-slate-700 text-slate-300'
                : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
            }`}
          >
            <Compass className="w-3.5 h-3.5 text-sky-400" />
            <span>24/7 Solunar &amp; Tide Micro-Schedule ({solunarWindows.length})</span>
          </button>

          <button
            id="tab-daily-menu-btn"
            type="button"
            onClick={() => setActiveTab('daily-menu')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'daily-menu'
                ? 'bg-amber-600 text-white shadow-xs font-semibold'
                : isDarkMode
                ? 'bg-slate-800/80 hover:bg-slate-700 text-slate-300'
                : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Phase Menu ({guidance.meals.length})</span>
          </button>

          <button
            id="tab-superfoods-btn"
            type="button"
            onClick={() => setActiveTab('superfoods')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'superfoods'
                ? 'bg-amber-600 text-white shadow-xs font-semibold'
                : isDarkMode
                ? 'bg-slate-800/80 hover:bg-slate-700 text-slate-300'
                : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
            }`}
          >
            <Apple className="w-3.5 h-3.5" />
            <span>Superfoods &amp; Hydration</span>
          </button>

          <button
            id="tab-intake-log-btn"
            type="button"
            onClick={() => setActiveTab('intake-log')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'intake-log'
                ? 'bg-amber-600 text-white shadow-xs font-semibold'
                : isDarkMode
                ? 'bg-slate-800/80 hover:bg-slate-700 text-slate-300'
                : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Log Intake ({dietaryLogs.length})</span>
          </button>
        </div>

        {/* Meal timing filter when on daily menu */}
        {activeTab === 'daily-menu' && (
          <div className="flex items-center gap-1 text-[11px] font-mono overflow-x-auto py-0.5">
            <span className="text-stone-400 mr-1 hidden sm:inline">Filter:</span>
            {['All', 'Breakfast', 'Lunch', 'Dinner', 'Snack', 'Night Bite'].map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setSelectedMealFilter(m)}
                className={`px-2 py-1 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                  selectedMealFilter === m
                    ? isDarkMode
                      ? 'bg-slate-700 text-white font-bold'
                      : 'bg-stone-300 text-stone-900 font-bold'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                {m === 'Night Bite' ? '🌙 Night Bite' : m}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* TAB 0: 24/7 Solunar & Tidal Micro-Schedule */}
      {activeTab === 'solunar-schedule' && (
        <div className="mb-6">
          <SolunarTideScheduleView
            windows={solunarWindows}
            onAdoptMicroIntake={handleAdoptSolunarWindowIntake}
            isDarkMode={isDarkMode}
            currentDate={activeDate}
            tideCategory={defaultTideData.tideCategory}
          />
        </div>
      )}

      {/* TAB 1: Daily Menu Recommendations */}
      {activeTab === 'daily-menu' && (
        <div className="space-y-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredMeals.map((meal, idx) => (
              <div
                key={idx}
                id={`recommended-meal-${meal.mealTime.toLowerCase().replace(/\s+/g, '-')}`}
                className={`p-4 sm:p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                  isDarkMode
                    ? 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                    : 'bg-stone-50 border-stone-200 hover:border-stone-300'
                }`}
              >
                <div>
                  {/* Top Bar: Meal Timing and Macronutrient ratios */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span
                      className={`text-xs font-mono uppercase px-2.5 py-0.5 rounded-full font-bold border flex items-center gap-1 ${
                        meal.mealTime === 'Breakfast'
                          ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                          : meal.mealTime === 'Lunch'
                          ? 'bg-sky-500/10 border-sky-500/30 text-sky-400'
                          : meal.mealTime === 'Dinner'
                          ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400'
                          : meal.mealTime === 'Night Bite'
                          ? 'bg-purple-500/15 border-purple-500/40 text-purple-300'
                          : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                      }`}
                    >
                      {meal.mealTime === 'Night Bite' && <span>🌙</span>}
                      <span>{meal.mealTime} Recommendation</span>
                    </span>

                    <div className="text-[11px] font-mono text-stone-400">
                      C:{meal.macroRatio.carbsPct}% &bull; P:{meal.macroRatio.proteinPct}% &bull; F:{meal.macroRatio.fatPct}%
                    </div>
                  </div>

                  {/* Meal Title */}
                  <h4 className="font-serif font-bold text-base sm:text-lg mb-1 leading-snug">
                    {meal.title}
                  </h4>

                  {/* Calibrated Exact Macros Pill */}
                  <div className="flex flex-wrap items-center gap-2 py-1.5 px-3 my-2 rounded-xl bg-black/5 dark:bg-white/5 border border-stone-200 dark:border-slate-800 text-xs font-mono">
                    <span className="font-bold text-amber-500">{meal.calories} kcal</span>
                    <span className="text-stone-300 dark:text-slate-600">&bull;</span>
                    <span className="text-sky-400 font-semibold">{meal.proteinG}g Protein</span>
                    <span className="text-stone-300 dark:text-slate-600">&bull;</span>
                    <span className="text-amber-400 font-semibold">{meal.carbsG}g Carbs</span>
                    <span className="text-stone-300 dark:text-slate-600">&bull;</span>
                    <span className="text-emerald-400 font-semibold">{meal.fatG}g Lipids</span>
                  </div>

                  {/* Description */}
                  <p className="text-xs leading-relaxed text-stone-400 mb-3">
                    {meal.description}
                  </p>

                  {/* Sample Ingredients / Portions */}
                  <div
                    className={`p-3 rounded-xl border text-xs mb-3 ${
                      isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-stone-200'
                    }`}
                  >
                    <span className="font-mono text-[10px] uppercase text-stone-400 tracking-wider block mb-1.5">
                      Recommended Components &bull; Portion Guidelines:
                    </span>
                    <ul className="space-y-1 text-xs">
                      {meal.sampleItems.map((item, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-amber-500 font-bold">&bull;</span>
                          <span className={isDarkMode ? 'text-slate-200' : 'text-stone-800'}>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Key nutrients chips */}
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {meal.keyNutrients.map((nutrient, i) => (
                      <span
                        key={i}
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-md border ${
                          isDarkMode
                            ? 'bg-slate-900 border-slate-800 text-slate-300'
                            : 'bg-stone-100 border-stone-300 text-stone-700'
                        }`}
                      >
                        {nutrient}
                      </span>
                    ))}
                  </div>

                  {/* Hydration tip */}
                  <div className="flex items-center gap-2 text-[11px] text-sky-400 font-mono mb-4">
                    <Droplets className="w-3.5 h-3.5 shrink-0" />
                    <span>Hydration: {meal.hydrationTip}</span>
                  </div>
                </div>

                {/* Adopt into Intake Log Button */}
                <button
                  type="button"
                  onClick={() => handleAdoptRecommendation(meal)}
                  className="w-full py-2 px-3 rounded-xl bg-amber-600/90 hover:bg-amber-600 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Log This Recommendation to My Daily Tracker</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: Phase Superfoods & Hydration Strategy */}
      {activeTab === 'superfoods' && (
        <div className="space-y-5 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Superfoods to Prioritize */}
            <div
              className={`p-5 rounded-2xl border ${
                isDarkMode ? 'bg-slate-950/70 border-slate-800' : 'bg-stone-50 border-stone-200'
              }`}
            >
              <div className="flex items-center gap-2 mb-3 text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                <h4 className="font-serif font-bold text-sm">Prioritize These Celestial Superfoods</h4>
              </div>
              <ul className="space-y-2">
                {guidance.recommendedSuperfoods.map((food, i) => (
                  <li
                    key={i}
                    className={`p-2.5 rounded-xl border text-xs flex items-center justify-between gap-2 ${
                      isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-stone-200'
                    }`}
                  >
                    <span className="font-medium">{food}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                      Recommended
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Foods to Limit & Hydration */}
            <div className="space-y-4">
              <div
                className={`p-5 rounded-2xl border ${
                  isDarkMode ? 'bg-slate-950/70 border-slate-800' : 'bg-stone-50 border-stone-200'
                }`}
              >
                <div className="flex items-center gap-2 mb-3 text-rose-400">
                  <AlertCircle className="w-4 h-4" />
                  <h4 className="font-serif font-bold text-sm">Foods to Minimize During This Phase</h4>
                </div>
                <ul className="space-y-2">
                  {guidance.foodsToLimit.map((food, i) => (
                    <li
                      key={i}
                      className={`p-2.5 rounded-xl border text-xs flex items-center gap-2 ${
                        isDarkMode ? 'bg-slate-900/60 border-slate-800 text-slate-300' : 'bg-white border-stone-200 text-stone-700'
                      }`}
                    >
                      <span className="text-rose-400 font-bold">&bull;</span>
                      <span>{food}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Hydration Strategy */}
              <div
                className={`p-5 rounded-2xl border ${
                  isDarkMode ? 'bg-sky-950/40 border-sky-800/60 text-sky-200' : 'bg-sky-50 border-sky-200 text-sky-950'
                }`}
              >
                <div className="flex items-center gap-2 mb-2 text-sky-400">
                  <Droplets className="w-4 h-4" />
                  <h4 className="font-serif font-bold text-sm">Circadian Hydration Protocol</h4>
                </div>
                <p className="text-xs leading-relaxed opacity-90">{guidance.hydrationStrategy}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Intake Logger Form & Current Log */}
      {activeTab === 'intake-log' && (
        <div>
          {/* Quick Presets row */}
          <div className="mb-5">
            <div className="flex items-center justify-between mb-2">
              <span className={`text-xs font-mono uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-stone-500'}`}>
                Phase-Calibrated Fast Presets
              </span>
              <span className="text-[11px] font-mono text-stone-400">1-Click Load into Form</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {presets.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => loadPreset(preset)}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    isDarkMode
                      ? 'bg-slate-950/60 hover:bg-slate-800/80 border-slate-800 hover:border-slate-700 text-slate-200'
                      : 'bg-stone-50 hover:bg-stone-100 border-stone-200 text-stone-800'
                  }`}
                >
                  <div className="text-xs font-semibold truncate">{preset.name}</div>
                  <div className="flex items-center gap-2 mt-1 text-[11px] font-mono text-stone-400">
                    <span>{preset.cal} kcal</span>
                    <span>&bull;</span>
                    <span className="capitalize">{preset.cat.replace(/_/g, ' ')}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Meal Entry Form */}
          <form
            onSubmit={handleSubmit}
            className={`p-4 sm:p-5 rounded-2xl border mb-5 ${
              isDarkMode ? 'bg-slate-950/80 border-slate-800' : 'bg-stone-50/80 border-stone-200'
            }`}
          >
            <div className="font-serif font-bold text-sm mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Plus className="w-4 h-4 text-emerald-500" />
                <span>Log Dietary Intake to Circadian Journal</span>
              </div>
              {showLogSuccess && (
                <span className="text-xs text-emerald-400 flex items-center gap-1 font-mono">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Added to today's log!
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
              <div className="sm:col-span-2">
                <label className={`block text-[10px] font-mono uppercase tracking-wider mb-1 ${isDarkMode ? 'text-slate-400' : 'text-stone-500'}`}>
                  Food or Meal Description
                </label>
                <input
                  id="food-name-input"
                  type="text"
                  required
                  value={foodName}
                  onChange={(e) => setFoodName(e.target.value)}
                  placeholder={
                    isNewMoon
                      ? 'e.g., Roasted Japanese Sweet Potatoes with Quinoa & Lentils'
                      : isFullMoon
                      ? 'e.g., Wild Salmon with Hass Avocado & Asparagus'
                      : 'e.g., Farro Grain Salad with Grilled Chicken'
                  }
                  className={`w-full px-3 py-2 rounded-xl border text-xs font-medium transition-all ${
                    isDarkMode
                      ? 'bg-slate-900 border-slate-700 text-slate-100'
                      : 'bg-white border-stone-300 text-stone-900'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-[10px] font-mono uppercase tracking-wider mb-1 ${isDarkMode ? 'text-slate-400' : 'text-stone-500'}`}>
                  Meal Timing
                </label>
                <select
                  id="meal-type-select"
                  value={mealType}
                  onChange={(e) => setMealType(e.target.value as DietaryLogItem['mealType'])}
                  className={`w-full px-3 py-2 rounded-xl border text-xs font-medium ${
                    isDarkMode
                      ? 'bg-slate-900 border-slate-700 text-slate-100'
                      : 'bg-white border-stone-300 text-stone-900'
                  }`}
                >
                  <option value="breakfast">Breakfast (Cortisol Awakening Peak)</option>
                  <option value="lunch">Lunch (Solar Zenith / Peak Metabolism)</option>
                  <option value="dinner">Dinner (Pre-Melatonin Window)</option>
                  <option value="snack">Electrolyte / Nutrient Sustenance</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 mb-3">
              <div className="col-span-2 sm:col-span-2">
                <label className={`block text-[10px] font-mono uppercase tracking-wider mb-1 ${isDarkMode ? 'text-slate-400' : 'text-stone-500'}`}>
                  Celestial Phasing Category
                </label>
                <select
                  id="nutrition-category-select"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as DietaryLogItem['category'])}
                  className={`w-full px-3 py-2 rounded-xl border text-xs font-medium ${
                    isDarkMode
                      ? 'bg-slate-900 border-slate-700 text-slate-100'
                      : 'bg-white border-stone-300 text-stone-900'
                  }`}
                >
                  <option value="long_chain_carbs">Long-Chain Carbs (New Moon Priority: Glycogen)</option>
                  <option value="proteins">Structural Proteins (Full Moon Priority: Repair)</option>
                  <option value="lipids">Healthy Lipids &amp; Omegas (Full Moon Priority: Membranes)</option>
                  <option value="leafy_greens">Leafy Greens &amp; Minerals (Waning Phase Detox)</option>
                  <option value="balanced_mixed">Balanced Mixed Macronutrients (Transitional)</option>
                </select>
              </div>

              <div>
                <label className={`block text-[10px] font-mono uppercase tracking-wider mb-1 ${isDarkMode ? 'text-slate-400' : 'text-stone-500'}`}>
                  Calories (kcal)
                </label>
                <input
                  id="meal-calories-input"
                  type="number"
                  min="0"
                  value={calories}
                  onChange={(e) => setCalories(e.target.value)}
                  placeholder="0"
                  className={`w-full px-2.5 py-2 rounded-xl border text-xs font-mono font-medium ${
                    isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-stone-300'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-[10px] font-mono uppercase tracking-wider mb-1 ${isDarkMode ? 'text-slate-400' : 'text-stone-500'}`}>
                  Protein (g)
                </label>
                <input
                  id="meal-protein-input"
                  type="number"
                  min="0"
                  value={proteinGrams}
                  onChange={(e) => setProteinGrams(e.target.value)}
                  placeholder="0"
                  className={`w-full px-2.5 py-2 rounded-xl border text-xs font-mono font-medium ${
                    isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-stone-300'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-[10px] font-mono uppercase tracking-wider mb-1 ${isDarkMode ? 'text-slate-400' : 'text-stone-500'}`}>
                  Carbs / Fat (g)
                </label>
                <div className="flex gap-1">
                  <input
                    id="meal-carbs-input"
                    type="number"
                    min="0"
                    value={carbsGrams}
                    onChange={(e) => setCarbsGrams(e.target.value)}
                    title="Carbohydrates (g)"
                    placeholder="C"
                    className={`w-1/2 px-1.5 py-2 rounded-xl border text-xs font-mono text-center ${
                      isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-stone-300'
                    }`}
                  />
                  <input
                    id="meal-fat-input"
                    type="number"
                    min="0"
                    value={fatGrams}
                    onChange={(e) => setFatGrams(e.target.value)}
                    title="Lipids / Fat (g)"
                    placeholder="F"
                    className={`w-1/2 px-1.5 py-2 rounded-xl border text-xs font-mono text-center ${
                      isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-stone-300'
                    }`}
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <div className="w-full sm:w-auto flex-1">
                <input
                  id="meal-notes-input"
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Notes (e.g., Eaten under sun elevation +25°, post-workout)"
                  className={`w-full px-3 py-1.5 rounded-xl border text-xs ${
                    isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-stone-300'
                  }`}
                />
              </div>
              <button
                id="submit-dietary-log-btn"
                type="submit"
                className="w-full sm:w-auto px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Save Intake Record</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Daily Macros & Alignment Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-5">
        <div className={`p-3 rounded-xl border ${isDarkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-stone-50 border-stone-200'}`}>
          <span className="text-[10px] font-mono text-stone-400 uppercase">Logged Calories</span>
          <div className="font-mono font-bold text-base mt-0.5">{totalCalories} kcal</div>
        </div>
        <div className={`p-3 rounded-xl border ${isDarkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-stone-50 border-stone-200'}`}>
          <span className="text-[10px] font-mono text-stone-400 uppercase">Protein</span>
          <div className="font-mono font-bold text-base mt-0.5 text-sky-400">{totalProtein}g</div>
        </div>
        <div className={`p-3 rounded-xl border ${isDarkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-stone-50 border-stone-200'}`}>
          <span className="text-[10px] font-mono text-stone-400 uppercase">Carbohydrates</span>
          <div className="font-mono font-bold text-base mt-0.5 text-amber-500">{totalCarbs}g</div>
        </div>
        <div className={`p-3 rounded-xl border ${isDarkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-stone-50 border-stone-200'}`}>
          <span className="text-[10px] font-mono text-stone-400 uppercase">Celestial Alignment</span>
          <div className="font-mono font-bold text-base mt-0.5 text-emerald-400 flex items-center gap-1">
            <Award className="w-4 h-4 text-emerald-400" />
            <span>{dietaryLogs.length > 0 ? `${Math.round((alignedCount / dietaryLogs.length) * 100)}%` : '100%'}</span>
          </div>
        </div>
      </div>

      {/* Logged items list */}
      <div>
        <div className="text-xs font-mono uppercase tracking-wider text-stone-400 mb-2">
          Today's Circadian Nutrition Log ({dietaryLogs.length} items logged)
        </div>

        {dietaryLogs.length === 0 ? (
          <div
            className={`p-6 rounded-xl border text-center text-xs ${
              isDarkMode ? 'border-dashed border-slate-800 text-slate-500' : 'border-dashed border-stone-200 text-stone-400'
            }`}
          >
            No intake logged for today's celestial cycle yet. Use the "Today's Phase Menu" tab to adopt recommended meals or log custom items.
          </div>
        ) : (
          <div className="space-y-2">
            {dietaryLogs.map((item) => {
              const isAligned = item.phaseAlignment === 'optimal';
              return (
                <div
                  key={item.id}
                  className={`p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2 transition-all ${
                    isDarkMode ? 'bg-slate-950/70 border-slate-800' : 'bg-stone-50 border-stone-200'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <div className="mt-0.5">
                      {isAligned ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-amber-400" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs">{item.foodName}</span>
                        <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-md bg-stone-200 dark:bg-slate-800 text-stone-600 dark:text-slate-300">
                          {item.mealType}
                        </span>
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded-md border ${
                            isAligned
                              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                              : 'bg-stone-200/50 dark:bg-slate-800 border-stone-300 text-stone-500'
                          }`}
                        >
                          {isAligned ? 'Aligned to Lunar Phase' : 'Neutral Macronutrient'}
                        </span>
                      </div>
                      {item.notes && <p className="text-[11px] text-stone-400 mt-0.5">{item.notes}</p>}
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 text-xs font-mono">
                    <span className="font-bold">{item.calories} kcal</span>
                    <span className="text-stone-400">
                      P:{item.proteinGrams}g &bull; C:{item.carbsGrams}g &bull; F:{item.fatGrams}g
                    </span>
                    <button
                      type="button"
                      onClick={() => onRemoveLogItem(item.id)}
                      title="Delete record"
                      className="p-1 rounded-lg text-stone-400 hover:text-rose-500 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Regulatory & Nutritional Notice */}
        <div className="mt-4 pt-3 border-t border-stone-200/60 dark:border-slate-800/60 flex items-center justify-between text-[11px] text-stone-500 dark:text-slate-400">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span>Educational chrononutrition timing guide &bull; Not clinical or medical advice &bull; Consult your healthcare provider before fasting or changing macros.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
