import { BodyMetrics, MoonPhaseName, TideData } from '../types';
import { calculateMetabolics, LUNAR_CYCLE_DAYS } from './solunarEngine';

export interface CelestialMacroGoals {
  targetCalories: number;
  targetProteinGrams: number;
  targetCarbsGrams: number;
  targetFatGrams: number;
  targetProteinPct: number;
  targetCarbsPct: number;
  targetFatPct: number;
  phaseCategory: 'New Moon' | 'Waxing' | 'Full Moon' | 'Waning';
  phaseTitle: string;
  rationale: string;
}

export interface SolunarScheduleWindow {
  id: string;
  type: 'major_overhead' | 'major_underfoot' | 'minor_moonrise' | 'minor_moonset' | 'high_tide' | 'low_tide';
  title: string;
  timeRange: string;
  exactTime: string;
  hourFloat: number;
  solunarRating: 1 | 2 | 3 | 4 | 5;
  biteWindowType:
    | 'Major Solunar Bite'
    | 'Minor Solunar Bite'
    | 'Peak High Tide (Flood)'
    | 'Low Tide (Ebb Drainage)'
    | 'Epic Tidal-Solunar Overlap'
    | 'Peak Full Moon Midnight Bite'
    | 'Spring Tide Flood Surge';
  fishingSignificance: string;
  metabolicObjective: string;
  microIntake: {
    title: string;
    proteinG: number;
    carbsG: number;
    fatG: number;
    calories: number;
    suggestedMeal: string;
    keyElectrolytes: string;
    rationale: string;
    hydrationTip: string;
    sampleItems: string[];
  };
  isActive: boolean;
  waterDetail?: string;
}

/**
 * Calculates personalized celestial macronutrient targets (grams and calories)
 * customized to the user's biometric TDEE and current lunar phase chrononutrition.
 */
export function calculateCelestialMacroGoals(
  bodyMetrics: BodyMetrics,
  cycleDay: number,
  moonPhaseName: MoonPhaseName
): CelestialMacroGoals {
  const metabolics = calculateMetabolics(
    bodyMetrics.weightKg,
    bodyMetrics.heightCm,
    bodyMetrics.age,
    bodyMetrics.gender,
    bodyMetrics.activityLevel,
    cycleDay
  );

  const tdee = metabolics.tdee;

  // New Moon (~Day 27 to 3.5): High Complex Carbohydrates, cellular glycogen loading
  if (cycleDay <= 3.5 || cycleDay >= 26.5) {
    const carbsPct = 58;
    const proteinPct = 22;
    const fatPct = 20;

    const carbsCal = (tdee * carbsPct) / 100;
    const proteinCal = (tdee * proteinPct) / 100;
    const fatCal = (tdee * fatPct) / 100;

    return {
      targetCalories: tdee,
      targetCarbsGrams: Math.round(carbsCal / 4),
      targetProteinGrams: Math.round(proteinCal / 4),
      targetFatGrams: Math.round(fatCal / 9),
      targetCarbsPct: carbsPct,
      targetProteinPct: proteinPct,
      targetFatPct: fatPct,
      phaseCategory: 'New Moon',
      phaseTitle: 'New Moon: Glycogen Loading & Complex Carbohydrates',
      rationale:
        'Heightened insulin sensitivity under minimal lunar luminosity. Prioritize long-chain amylose starches and slow polysaccharides to support melatonin and serotonin synthesis.',
    };
  }

  // Full Moon (~Day 13.5 to 16.5): High Structural Protein & Healthy Lipids
  if (cycleDay >= 13.5 && cycleDay <= 16.5) {
    const carbsPct = 35;
    const proteinPct = 35;
    const fatPct = 30;

    const carbsCal = (tdee * carbsPct) / 100;
    const proteinCal = (tdee * proteinPct) / 100;
    const fatCal = (tdee * fatPct) / 100;

    return {
      targetCalories: tdee,
      targetCarbsGrams: Math.round(carbsCal / 4),
      targetProteinGrams: Math.round(proteinCal / 4),
      targetFatGrams: Math.round(fatCal / 9),
      targetCarbsPct: carbsPct,
      targetProteinPct: proteinPct,
      targetFatPct: fatPct,
      phaseCategory: 'Full Moon',
      phaseTitle: 'Full Moon: Structural Protein & Omega Lipids',
      rationale:
        'Maximum gravitational pull stimulates cellular turnover and metabolic activation. Emphasize complete structural proteins, anti-inflammatory DHA/EPA lipids, and controlled glycemic starches.',
    };
  }

  // Waxing Phases (Building / Anabolic progression)
  if (cycleDay < 13.5) {
    const carbsPct = 48;
    const proteinPct = 27;
    const fatPct = 25;

    const carbsCal = (tdee * carbsPct) / 100;
    const proteinCal = (tdee * proteinPct) / 100;
    const fatCal = (tdee * fatPct) / 100;

    return {
      targetCalories: tdee,
      targetCarbsGrams: Math.round(carbsCal / 4),
      targetProteinGrams: Math.round(proteinCal / 4),
      targetFatGrams: Math.round(fatCal / 9),
      targetCarbsPct: carbsPct,
      targetProteinPct: proteinPct,
      targetFatPct: fatPct,
      phaseCategory: 'Waxing',
      phaseTitle: `${moonPhaseName}: Anabolic Building & Energy Assimilation`,
      rationale:
        'Progressive lunar illumination primes cellular uptake of amino acids and sustained glycogen. Balance complex carbohydrates with steady proteins.',
    };
  }

  // Waning Phases (Cleansing / Autophagy / Catabolic drainage)
  const carbsPct = 42;
  const proteinPct = 28;
  const fatPct = 30;

  const carbsCal = (tdee * carbsPct) / 100;
  const proteinCal = (tdee * proteinPct) / 100;
  const fatCal = (tdee * fatPct) / 100;

  return {
    targetCalories: tdee,
    targetCarbsGrams: Math.round(carbsCal / 4),
    targetProteinGrams: Math.round(proteinCal / 4),
    targetFatGrams: Math.round(fatCal / 9),
    targetCarbsPct: carbsPct,
    targetProteinPct: proteinPct,
    targetFatPct: fatPct,
    phaseCategory: 'Waning',
    phaseTitle: `${moonPhaseName}: Cellular Drainage & Autophagy`,
    rationale:
      'Waning gravitational tension assists cellular detox and lymphatic drainage. Moderate carbohydrates, increase bitter greens, polyphenols, and clean lipids.',
  };
}

/**
 * Format decimal hour (0.00 to 24.00) into 12-hour AM/PM string
 */
function formatHourDecimal(h: number): string {
  const norm = ((h % 24) + 24) % 24;
  const hour = Math.floor(norm);
  const min = Math.round((norm - hour) * 60);
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  return `${displayHour}:${min.toString().padStart(2, '0')} ${period}`;
}

/**
 * Format a range for a solunar or tide window
 */
function formatHourRange(centerHour: number, halfWidthHours: number): string {
  const start = centerHour - halfWidthHours;
  const end = centerHour + halfWidthHours;
  return `${formatHourDecimal(start)} – ${formatHourDecimal(end)}`;
}

/**
 * Generates the 24/7 365 daily micro-intake schedule based on:
 * 1. Current Tidal Highs and Lows (Peak Flood & Ebb Troughs)
 * 2. Moon Overhead (Upper Meridian Transit: Major Solunar Bite Window #1)
 * 3. Moon Underfoot (Lower Meridian Transit: Major Solunar Bite Window #2)
 * 4. Minor Solunar Windows (Moonrise & Moonset)
 * 5. Overlap Synergy (High/Low tide turning during overhead/underfoot = 5-star bite)
 */
export function calculateDailySolunarTideWindows(
  currentDate: Date,
  cycleDay: number,
  tideData: TideData,
  bodyMetrics: BodyMetrics
): SolunarScheduleWindow[] {
  const currentHourFloat = currentDate.getHours() + currentDate.getMinutes() / 60;
  const windows: SolunarScheduleWindow[] = [];

  // 1. Calculate Lunar Transits
  // Moon Overhead (Upper Meridian Transit): highest celestial altitude
  const moonOverheadHour = ((cycleDay * (24 / LUNAR_CYCLE_DAYS) + 12) % 24);
  // Moon Underfoot (Lower Meridian Transit / Nadir): opposite side of Earth
  const moonUnderfootHour = ((moonOverheadHour + 12.42) % 24);
  // Moonrise & Moonset: approximately ± 6.21 hours
  const moonriseHour = ((moonOverheadHour - 6.21 + 24) % 24);
  const moonsetHour = ((moonOverheadHour + 6.21) % 24);

  // 2. Identify High and Low Tide turning points from hourlyWavePoints
  const wavePoints = tideData.hourlyWavePoints || [];
  const highTidePeaks: { hour: number; height: number }[] = [];
  const lowTideTroughs: { hour: number; height: number }[] = [];

  if (wavePoints.length >= 5) {
    for (let i = 1; i < wavePoints.length - 1; i++) {
      const prev = wavePoints[i - 1].height;
      const curr = wavePoints[i].height;
      const next = wavePoints[i + 1].height;

      // Local maximum
      if (curr >= prev && curr >= next && (curr > prev || curr > next)) {
        // avoid duplicates if plateau
        if (highTidePeaks.length === 0 || Math.abs(wavePoints[i].hour - highTidePeaks[highTidePeaks.length - 1].hour) > 3) {
          highTidePeaks.push({ hour: wavePoints[i].hour, height: curr });
        }
      }
      // Local minimum
      if (curr <= prev && curr <= next && (curr < prev || curr < next)) {
        if (lowTideTroughs.length === 0 || Math.abs(wavePoints[i].hour - lowTideTroughs[lowTideTroughs.length - 1].hour) > 3) {
          lowTideTroughs.push({ hour: wavePoints[i].hour, height: curr });
        }
      }
    }
  }

  // Fallback defaults if wave data was flat
  if (highTidePeaks.length === 0) {
    highTidePeaks.push({ hour: 14.0, height: tideData.currentHeight });
    highTidePeaks.push({ hour: 2.5, height: tideData.currentHeight - 0.2 });
  }
  if (lowTideTroughs.length === 0) {
    lowTideTroughs.push({ hour: 8.25, height: Math.max(0.2, tideData.currentHeight - 1.2) });
    lowTideTroughs.push({ hour: 20.5, height: Math.max(0.2, tideData.currentHeight - 1.0) });
  }

  // Helper to check hour distance
  const hourDist = (h1: number, h2: number) => {
    const diff = Math.abs(h1 - h2);
    return Math.min(diff, 24 - diff);
  };

  const isFullMoonCycle = (cycleDay >= 12.5 && cycleDay <= 17.5) || tideData.tideCategory.toLowerCase().includes('full moon');

  // 3. Construct Moon Overhead (Major Solunar 1)
  const distOverheadToHigh = Math.min(...highTidePeaks.map((p) => hourDist(moonOverheadHour, p.hour)));
  const isOverheadOverlap = distOverheadToHigh <= 1.5;
  const isOverheadActive = hourDist(currentHourFloat, moonOverheadHour) <= 1.0;

  windows.push({
    id: 'solunar-major-overhead',
    type: 'major_overhead',
    title: isFullMoonCycle
      ? 'Moon Overhead (Full Moon Syzygy Midnight Zenith)'
      : 'Moon Overhead (Upper Lunar Transit)',
    timeRange: formatHourRange(moonOverheadHour, 1.0),
    exactTime: formatHourDecimal(moonOverheadHour),
    hourFloat: moonOverheadHour,
    solunarRating: isFullMoonCycle || isOverheadOverlap ? 5 : 4,
    biteWindowType: isFullMoonCycle
      ? 'Peak Full Moon Midnight Bite'
      : isOverheadOverlap
      ? 'Epic Tidal-Solunar Overlap'
      : 'Major Solunar Bite',
    fishingSignificance: isFullMoonCycle
      ? '⭐⭐⭐⭐⭐ MAXIMUM FULL MOON BITE FRENZY: The illuminated full moon reaches absolute overhead zenith at midnight (~00:00). Combined syzygy gravitational pull triggers aggressive predatory strikes from Snook, Tarpon, and Redfish along shadow lines, bridge piers, and lit current passes.'
      : isOverheadOverlap
      ? '⭐⭐⭐⭐⭐ MAXIMUM BITE FRENZY: Moon overhead directly synchronizing with tidal surge. Predatory gamefish (Snook, Tarpon, Redfish) feed with peak aggression.'
      : '⭐⭐⭐⭐ MAJOR SOLUNAR WINDOW: Peak gravitational pull overhead. Gamefish surface feed aggressively for a 2-hour window.',
    metabolicObjective: isFullMoonCycle
      ? 'Full Moon Structural Cellular Repair & Fluid Stabilization: High-biological-value structural proteins (wild salmon, pastured eggs, collagen) and marine omega-3 DHA/EPA phospholipids to protect cell membranes under spring-tide hydrostatic pressure, paired with natural potassium to eliminate fluid retention.'
      : 'Peak Chronobiological Digestive Power: Gastric acid secretion and insulin-mediated muscle glycogen uptake peak under overhead gravitational alignment. Primary meal window.',
    microIntake: {
      title: isFullMoonCycle
        ? 'Full Moon Structural Protein & Omega-3 Lipids'
        : 'Prime Anabolic & Glycogen Meal',
      proteinG: Math.round(bodyMetrics.weightKg * (isFullMoonCycle ? 0.48 : 0.45)),
      carbsG: Math.round(bodyMetrics.weightKg * (isFullMoonCycle ? 0.45 : 0.7)),
      fatG: Math.round(bodyMetrics.weightKg * (isFullMoonCycle ? 0.32 : 0.22)),
      calories: Math.round(bodyMetrics.weightKg * 6.5),
      suggestedMeal: isFullMoonCycle
        ? 'Wild Alaskan Sockeye Salmon or Snook Fillet with Sautéed Dandelion Greens, Avocado, & Tart Cherry Mineral Water'
        : 'Wild-Caught Grilled Fish or Clean Poultry with Roasted Sweet Potatoes, Quinoa, & Steamed Greens',
      keyElectrolytes: isFullMoonCycle
        ? 'Potassium Citrate, Magnesium Glycinate, Marine DHA/EPA, Astaxanthin'
        : 'Zinc, Vitamin B6, Magnesium, Digestive Bitters',
      rationale: isFullMoonCycle
        ? 'Full moon syzygy stimulates peak cellular turnover. Structural amino acids support tissue rebuilding without spiking nocturnal insulin or blunting restorative sleep.'
        : 'Metabolism is primed to shuttle amino acids and complex carbohydrates directly into skeletal muscle and hepatic glycogen reserves rather than adipose storage.',
      hydrationTip: isFullMoonCycle
        ? 'Potassium-rich coconut water with fresh lime juice to counteract Full Moon extracellular water retention.'
        : 'Hydrate 30 minutes prior with lemon-mineral water; avoid drinking cold water during food intake.',
      sampleItems: isFullMoonCycle
        ? [
            '6–8 oz Wild Sockeye Salmon or Snook Fillet',
            '1.5 cups Sautéed Dandelion Greens or Asparagus with garlic',
            '1/2 Hass Avocado with coarse Celtic sea salt',
          ]
        : [
            '6–8 oz Wild Snook, Salmon, or Pastured Chicken',
            '1 cup Baked Sweet Potato or Sprouted Quinoa',
            '1.5 cups Steamed Asparagus or Broccolini with cold-pressed olive oil',
          ],
    },
    isActive: isOverheadActive,
    waterDetail: isFullMoonCycle
      ? 'Full Moon Syzygy Zenith &bull; Maximum Lunar Gravitation'
      : `Gravitational Zenith &bull; ${isOverheadOverlap ? 'Coinciding with Tide Push' : 'Major Transit'}`,
  });

  // 4. Construct Moon Underfoot (Major Solunar 2)
  const distUnderfootToTide = Math.min(
    ...highTidePeaks.map((p) => hourDist(moonUnderfootHour, p.hour)),
    ...lowTideTroughs.map((p) => hourDist(moonUnderfootHour, p.hour))
  );
  const isUnderfootOverlap = distUnderfootToTide <= 1.5;
  const isUnderfootActive = hourDist(currentHourFloat, moonUnderfootHour) <= 1.0;

  windows.push({
    id: 'solunar-major-underfoot',
    type: 'major_underfoot',
    title: isFullMoonCycle
      ? 'Moon Underfoot (Full Moon Solar Noon Nadir)'
      : 'Moon Underfoot (Lower Lunar Transit / Nadir)',
    timeRange: formatHourRange(moonUnderfootHour, 1.0),
    exactTime: formatHourDecimal(moonUnderfootHour),
    hourFloat: moonUnderfootHour,
    solunarRating: isUnderfootOverlap ? 5 : 4,
    biteWindowType: isUnderfootOverlap ? 'Epic Tidal-Solunar Overlap' : 'Major Solunar Bite',
    fishingSignificance: isFullMoonCycle
      ? '⭐⭐⭐⭐ HIGH NOON UNDERFOOT BITE: Deep gravitational vector pull through Earth center during solar noon. Predatory fish stage in deeper channel drop-offs and bridge shadows to ambush active bait.'
      : isUnderfootOverlap
      ? '⭐⭐⭐⭐⭐ EPIC NIGHT/DAWN BITE: Moon transiting underfoot aligned with tidal movement. Deep structure ambush feeding peaks.'
      : '⭐⭐⭐⭐ MAJOR SOLUNAR WINDOW: Secondary peak gravitational alignment through Earth center. Strong sustained bite window.',
    metabolicObjective:
      'Nocturnal & Parasympathetic Restorative Uptake: Slow-burning cellular repair, tryptophan absorption, and anti-inflammatory cellular membrane recovery.',
    microIntake: {
      title: 'Restorative Protein & Slow Lipid Fuel',
      proteinG: Math.round(bodyMetrics.weightKg * 0.38),
      carbsG: Math.round(bodyMetrics.weightKg * 0.4),
      fatG: Math.round(bodyMetrics.weightKg * 0.28),
      calories: Math.round(bodyMetrics.weightKg * 5.4),
      suggestedMeal: 'Bone Broth Infusion or Steamed White Fish with Avocado, Braised Chard, & Pumpkin Seeds',
      keyElectrolytes: 'L-Tryptophan, Potassium, Magnesium Glycinate, Omega-3 DHA/EPA',
      rationale:
        'Sustained amino acid availability during deep tissue rebuilding without spiking nocturnal insulin or blunting endogenous melatonin release.',
      hydrationTip: 'Warm chamomile or linden flower infusion with a pinch of Celtic sea salt.',
      sampleItems: [
        '5–6 oz Poached Halibut or Collagen Peptides broth',
        '1/2 Hass Avocado sprinkled with crushed pumpkin seeds',
        '1 cup Sautéed Swiss Chard or Spinach',
      ],
    },
    isActive: isUnderfootActive,
    waterDetail: 'Gravitational Nadir &bull; Sustained Solunar Feeding Pull',
  });

  // 5. Construct High Tide Windows (Flood / Peak Slack)
  highTidePeaks.forEach((ht, idx) => {
    const isHtActive = hourDist(currentHourFloat, ht.hour) <= 1.25;
    const isOverlappingOverhead = hourDist(ht.hour, moonOverheadHour) <= 1.5;
    const isOverlappingUnderfoot = hourDist(ht.hour, moonUnderfootHour) <= 1.5;
    const overlapSolunar = isOverlappingOverhead || isOverlappingUnderfoot;

    windows.push({
      id: `tide-high-${idx + 1}`,
      type: 'high_tide',
      title: isFullMoonCycle
        ? `High Tide #${idx + 1} (Full Moon Spring Tide Flood)`
        : `High Tide #${idx + 1} (Peak Water & Flood Slack)`,
      timeRange: formatHourRange(ht.hour, 1.25),
      exactTime: formatHourDecimal(ht.hour),
      hourFloat: ht.hour,
      solunarRating: isFullMoonCycle || overlapSolunar ? 5 : 4,
      biteWindowType: isFullMoonCycle
        ? 'Spring Tide Flood Surge'
        : overlapSolunar
        ? 'Epic Tidal-Solunar Overlap'
        : 'Peak High Tide (Flood)',
      fishingSignificance: isFullMoonCycle
        ? '⭐⭐⭐⭐⭐ SPRING TIDE HIGH WATER: Maximum lunar-solar gravitational alignment pushes high water deep into mangrove root systems and shallow oyster flats. Prime Snook, Tarpon, and Redfish ambush window.'
        : '⭐⭐⭐⭐ HIGH TIDE WATER INFLOW: High water pushes predatory snook and redfish onto mangrove shorelines and oyster flats. Prime casting window.',
      metabolicObjective: isFullMoonCycle
        ? 'Spring Tide Extracellular Fluid Clearance & Lean Protein: Maximum gravitational water volume requires natural potassium diuretics (asparagus, dandelion) and lean protein to prevent cellular edema.'
        : 'Extracellular Fluid Expansion & Anabolic Nutrient Uptake: Peak hydrostatic water volume corresponds with maximum cellular hydration and electrolyte absorption.',
      microIntake: {
        title: isFullMoonCycle
          ? 'Spring Tide Lean Protein & Potassium Balance'
          : 'Electrolyte Hydration & Lean Structural Protein',
        proteinG: Math.round(bodyMetrics.weightKg * 0.38),
        carbsG: Math.round(bodyMetrics.weightKg * (isFullMoonCycle ? 0.35 : 0.45)),
        fatG: Math.round(bodyMetrics.weightKg * (isFullMoonCycle ? 0.22 : 0.18)),
        calories: Math.round(bodyMetrics.weightKg * 4.8),
        suggestedMeal: isFullMoonCycle
          ? 'Pastured Eggs or Wild Shrimp with Charred Asparagus, Sliced Avocado, & Fresh Lime Water'
          : 'Pastured Eggs or Wild Shrimp with Sliced Cucumber, Coconut Water, & Sprouted Ancient Bread',
        keyElectrolytes: isFullMoonCycle
          ? 'Potassium (2:1 to Sodium), Magnesium Glycinate, Marine Minerals'
          : 'Sodium-Potassium 1:3 ratio, Coconut Electrolytes, Trace Marine Minerals',
        rationale: isFullMoonCycle
          ? 'Counteract spring tide osmotic fluid retention with natural potassium diuretics and high biological value protein.'
          : 'Replenish intracellular potassium and cellular hydration to match the high osmotic fluid state of high tide.',
        hydrationTip: 'Pure coconut water or spring water with a lemon squeeze and raw sea salt.',
        sampleItems: isFullMoonCycle
          ? [
              '3 Poached pastured organic eggs or 6 oz wild gulf shrimp',
              '10 spears grilled wild asparagus with olive oil',
              '12 oz coconut water with squeezed lime',
            ]
          : [
              '3 Poached pastured eggs or 6 oz wild gulf shrimp',
              '1 slice sprouted ancient sourdough or 1/2 cup cooked farro',
              '8 oz raw coconut water with pinch of sea salt',
            ],
      },
      isActive: isHtActive,
      waterDetail: isFullMoonCycle
        ? `Spring High Tide: ~${ht.height.toFixed(2)} ${tideData.unit} &bull; Syzygy Flood`
        : `High Tide: ~${ht.height.toFixed(2)} ${tideData.unit} &bull; Flood Slack`,
    });
  });

  // 6. Construct Low Tide Windows (Ebb / Trough Drainage)
  lowTideTroughs.forEach((lt, idx) => {
    const isLtActive = hourDist(currentHourFloat, lt.hour) <= 1.25;

    windows.push({
      id: `tide-low-${idx + 1}`,
      type: 'low_tide',
      title: `Low Tide #${idx + 1} (Ebb Trough & Drainage)`,
      timeRange: formatHourRange(lt.hour, 1.25),
      exactTime: formatHourDecimal(lt.hour),
      hourFloat: lt.hour,
      solunarRating: 3,
      biteWindowType: 'Low Tide (Ebb Drainage)',
      fishingSignificance:
        '⭐⭐⭐ OUTFLOW PASSES & CUTS: Baitfish drain off shallow flats into deeper channel drop-offs. Excellent staging window around channel edges.',
      metabolicObjective:
        'Lymphatic Clearing & Clean Ketone / Lipid Utilization: Gravitational recession promotes cellular autophagy, fluid clearance, and gentle fat oxidation.',
      microIntake: {
        title: 'Cleansing Polyphenols & Clean Lipids',
        proteinG: Math.round(bodyMetrics.weightKg * 0.22),
        carbsG: Math.round(bodyMetrics.weightKg * 0.2),
        fatG: Math.round(bodyMetrics.weightKg * 0.28),
        calories: Math.round(bodyMetrics.weightKg * 3.8),
        suggestedMeal: 'Bone Broth with Celery Greens, Extra Virgin Olive Oil, & Raw Walnuts or Chia Pudding',
        keyElectrolytes: 'Citrus Bioflavonoids, Dandelion Root, Magnesium, Polyphenols',
        rationale:
          'Low tide supports interstitial drainage and cellular cleansing. Keep carbohydrates low and emphasize clean lipids and alkalizing minerals.',
        hydrationTip: 'Hibiscus or dandelion root iced tea infused with fresh lime.',
        sampleItems: [
          '1 cup mineral-rich simmered bone broth',
          '1 oz raw organic walnuts or chia seed pudding',
          'Arugula salad with cold-pressed olive oil & lemon juice',
        ],
      },
      isActive: isLtActive,
      waterDetail: `Low Tide: ~${lt.height.toFixed(2)} ${tideData.unit} &bull; Ebb Run`,
    });
  });

  // 7. Add Minor Solunar Windows (Moonrise & Moonset)
  const isMoonriseActive = hourDist(currentHourFloat, moonriseHour) <= 0.75;
  windows.push({
    id: 'solunar-minor-moonrise',
    type: 'minor_moonrise',
    title: 'Moonrise (Minor Solunar Window)',
    timeRange: formatHourRange(moonriseHour, 0.75),
    exactTime: formatHourDecimal(moonriseHour),
    hourFloat: moonriseHour,
    solunarRating: 3,
    biteWindowType: 'Minor Solunar Bite',
    fishingSignificance:
      '⭐⭐⭐ MINOR FEEDING SPIKE: 45–60 minute burst of active fish feeding as the moon breaks the horizon.',
    metabolicObjective:
      'Transitional Glycemic Sustenance: Quick adaptogenic fuel to maintain stable blood glucose and cellular hydration.',
    microIntake: {
      title: 'Light Adaptogenic Snack & Hydration',
      proteinG: Math.round(bodyMetrics.weightKg * 0.18),
      carbsG: Math.round(bodyMetrics.weightKg * 0.3),
      fatG: Math.round(bodyMetrics.weightKg * 0.12),
      calories: Math.round(bodyMetrics.weightKg * 2.8),
      suggestedMeal: 'Handful of Raw Pumpkin Seeds with Green Apple Slices & Ashwagandha Tea',
      keyElectrolytes: 'Zinc, Potassium, Quercetin',
      rationale:
        'Gentle energy bridge preventing cortisol spikes between primary meals.',
      hydrationTip: 'Chilled spring water with sliced mint leaves.',
      sampleItems: ['2 tbsp raw pumpkin seeds', '1 medium crisp green apple', 'Herbal adaptogen tea'],
    },
    isActive: isMoonriseActive,
    waterDetail: 'Horizon Moonrise &bull; Minor Gravitational Vector',
  });

  const isMoonsetActive = hourDist(currentHourFloat, moonsetHour) <= 0.75;
  windows.push({
    id: 'solunar-minor-moonset',
    type: 'minor_moonset',
    title: 'Moonset (Minor Solunar Window)',
    timeRange: formatHourRange(moonsetHour, 0.75),
    exactTime: formatHourDecimal(moonsetHour),
    hourFloat: moonsetHour,
    solunarRating: 3,
    biteWindowType: 'Minor Solunar Bite',
    fishingSignificance:
      '⭐⭐⭐ HORIZON RETREAT BITE: Secondary active window as the lunar disc dips below the horizon.',
    metabolicObjective:
      'Cellular Electrolyte Rebalancing: Preparing organ systems for diurnal or nocturnal transition.',
    microIntake: {
      title: 'Mineral Reset & Calming Amino Acids',
      proteinG: Math.round(bodyMetrics.weightKg * 0.18),
      carbsG: Math.round(bodyMetrics.weightKg * 0.25),
      fatG: Math.round(bodyMetrics.weightKg * 0.12),
      calories: Math.round(bodyMetrics.weightKg * 2.7),
      suggestedMeal: 'Golden Milk Turmeric & Ginger Infusion with Collagen Peptides or Almond Butter Celery Sticks',
      keyElectrolytes: 'Curcumin, Magnesium, Calcium, Glycine',
      rationale:
        'Anti-inflammatory modulation clearing systemic oxidative load.',
      hydrationTip: 'Warm golden milk with almond milk, turmeric, ginger, and black pepper.',
      sampleItems: ['1 mug warm turmeric golden milk', '1 scoop pure grass-fed collagen peptides', '2 stalks celery with almond butter'],
    },
    isActive: isMoonsetActive,
    waterDetail: 'Horizon Moonset &bull; Western Descent',
  });

  // Sort chronologically across the 24-hour day
  return windows.sort((a, b) => a.hourFloat - b.hourFloat);
}

/**
 * Provides annual 365-day solunar & tidal season context
 */
export function get365SolunarSeasonalInsight(dayOfYear: number): {
  season: string;
  tideBehavior: string;
  biteAdvice: string;
  dietaryEmphasis: string;
} {
  if (dayOfYear >= 79 && dayOfYear < 172) {
    return {
      season: 'Spring Equinox & Warming Flats',
      tideBehavior: 'Spring King tides begin building with amplified tidal ranges and high-velocity current movement.',
      biteAdvice: 'Aggressive pre-spawn feeding. Target flats during early incoming flood tides when water warms rapidly.',
      dietaryEmphasis: 'Sprouted greens, bitter dandelion, lean wild fish, and clean liver-supporting sulfur compounds.',
    };
  }
  if (dayOfYear >= 172 && dayOfYear < 265) {
    return {
      season: 'Summer Solstice & High Thermals',
      tideBehavior: 'Diurnal heat shifts water oxygen levels; maximum tidal movement occurs during dawn and nocturnal transits.',
      biteAdvice: 'Peak bite windows condense into early morning High Tides and nocturnal Moon Overhead/Underfoot transits.',
      dietaryEmphasis: 'High electrolyte fluids (coconut water, raw melons), cold-pressed lipids, and easily digestible proteins.',
    };
  }
  if (dayOfYear >= 265 && dayOfYear < 355) {
    return {
      season: 'Autumn Equinox & Fall Solunar Migration',
      tideBehavior: 'Historic high September/October King Tides with maximum coastal water intrusion and strong baitfish flushes.',
      biteAdvice: 'Yearly peak bite activity! Snook and redfish gorge on finger mullet flushing off flats during ebb tides.',
      dietaryEmphasis: 'Carbohydrate glycogen loading, roasted squash, rich omega-3 fatty acids, and zinc-rich seeds.',
    };
  }
  return {
    season: 'Winter Solstice & Low Negative Tides',
    tideBehavior: 'Winter negative low tides expose shallow oyster bars, compressing fish into deep thermal holes.',
    biteAdvice: 'Fish move slowly; bite windows activate during peak afternoon sun when shallow mud warms by 2–4 degrees.',
    dietaryEmphasis: 'Warm bone broths, root vegetables, warming spices (ginger, turmeric, cayenne), and collagen proteins.',
  };
}
