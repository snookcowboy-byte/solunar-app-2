export type UnitSystem = 'standard' | 'metric';

export type MoonPhaseName = 
  | 'New Moon'
  | 'Waxing Crescent'
  | 'First Quarter'
  | 'Waxing Gibbous'
  | 'Full Moon'
  | 'Waning Gibbous'
  | 'Last Quarter'
  | 'Waning Crescent';

export interface LocationData {
  input: string;
  resolvedName: string;
  latitude: number;
  longitude: number;
  country?: string;
  timezoneOffsetHours: number;
}

export interface EphemerisData {
  sunAltitude: number; // in degrees
  sunAzimuth: number; // in degrees
  sunriseTime: string;
  sunsetTime: string;
  solarNoonTime: string;
  daylightMinutes: number;
  isDaytime: boolean;

  moonAltitude: number;
  moonAzimuth: number;
  moonIllumination: number; // 0 to 100%
  moonPhaseName: MoonPhaseName;
  cycleDay: number; // 0 to 29.53
  isWaxing: boolean;

  melatoninSuppressionPct: number; // 0 to 100%
  cortisolProductionPct: number; // 0 to 100%
  circadianState: 'Morning Awakening Peak' | 'Sustained Midday Metabolism' | 'Late Afternoon Decline' | 'Evening Melatonin Surge' | 'Deep Circadian Reset';
}

export interface TideData {
  currentHeight: number; // in meters or feet
  unit: string;
  rawHeightMeters: number;
  nextEventType: 'High Tide' | 'Low Tide';
  nextEventTime: string;
  minutesToNextEvent: number;
  tidePhaseRad: number;
  isRising: boolean;
  tideCategory: 'Spring Tide (Syzygy Amplification)' | 'Neap Tide (Quadrature Dampening)' | 'Normal Intermediate Tide';
  hourlyWavePoints: { hour: number; timeLabel: string; height: number; isPast: boolean }[];
  stationName?: string;
  stationId?: string;
  source?: string;
  observedWaterLevel?: number;
  manualOffset?: number;
}

export interface BodyMetrics {
  age: number;
  gender: 'male' | 'female';
  heightCm: number;
  weightKg: number;
  weightLbs?: number;
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
}

export interface DietaryLogItem {
  id: string;
  timestamp: string;
  foodName: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  category: 'long_chain_carbs' | 'proteins' | 'lipids' | 'leafy_greens' | 'balanced_mixed';
  calories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  phaseAlignment: 'optimal' | 'moderate' | 'non_aligned';
  notes: string;
}

export interface YearlySolarLunarData {
  dayOfYear: number;
  dateStr: string;
  season: 'Spring' | 'Summer' | 'Autumn' | 'Winter';
  solarDeclinationDeg: number;
  dayLengthHours: number;
  lunarCycleIndex: number;
  moonPhaseOnDay: MoonPhaseName;
}
