import { EphemerisData, MoonPhaseName, TideData, UnitSystem, YearlySolarLunarData } from '../types';

// Baseline reference date for lunar synodic cycle (Known New Moon: Jan 18/20, 2026)
export const LUNAR_CYCLE_DAYS = 29.53058867;
export const REF_NEW_MOON = new Date('2026-01-18T20:53:00Z');
export const TIDE_CYCLE_HOURS = 12.4206; // Principal lunar semidiurnal constituent (M2)

/**
 * Calculates solar position (altitude and azimuth) for a given date, latitude, and longitude.
 */
export function calculateSunPosition(date: Date, lat: number, lon: number, timezoneOffsetHours?: number) {
  const dayOfYear = getDayOfYear(date);
  // Fractional year in radians
  const gamma = (2 * Math.PI / 365) * (dayOfYear - 1 + (date.getHours() - 12) / 24);
  
  // Equation of time in minutes
  const eqtime = 229.18 * (0.000075 + 0.001868 * Math.cos(gamma) - 0.032077 * Math.sin(gamma)
    - 0.014615 * Math.cos(2 * gamma) - 0.040849 * Math.sin(2 * gamma));
  
  // Solar declination in radians
  const decl = 0.006918 - 0.399912 * Math.cos(gamma) + 0.070257 * Math.sin(gamma)
    - 0.006758 * Math.cos(2 * gamma) + 0.000907 * Math.sin(2 * gamma)
    - 0.002697 * Math.cos(3 * gamma) + 0.00148 * Math.sin(3 * gamma);

  // Time offset in minutes
  const tzOffsetMin = timezoneOffsetHours !== undefined ? timezoneOffsetHours * 60 : -date.getTimezoneOffset();
  const timeOffset = eqtime + 4 * lon - tzOffsetMin;
  
  // True solar time in minutes
  const trueSolarTime = date.getHours() * 60 + date.getMinutes() + date.getSeconds() / 60 + timeOffset;
  let solarHourAngle = (trueSolarTime / 4) - 180; // in degrees
  if (solarHourAngle < -180) solarHourAngle += 360;
  if (solarHourAngle > 180) solarHourAngle -= 360;

  const latRad = (lat * Math.PI) / 180;
  const haRad = (solarHourAngle * Math.PI) / 180;

  // Solar zenith angle
  const cosZenith = Math.sin(latRad) * Math.sin(decl) + Math.cos(latRad) * Math.cos(decl) * Math.cos(haRad);
  const zenithRad = Math.acos(Math.max(-1, Math.min(1, cosZenith)));
  const altitudeDeg = 90 - (zenithRad * 180 / Math.PI);

  // Solar azimuth angle
  const cosAzimuth = (Math.sin(decl) - Math.cos(zenithRad) * Math.sin(latRad)) / (Math.sin(zenithRad) * Math.cos(latRad));
  let azimuthDeg = Math.acos(Math.max(-1, Math.min(1, cosAzimuth))) * 180 / Math.PI;
  if (solarHourAngle > 0) {
    azimuthDeg = 360 - azimuthDeg;
  }

  return {
    altitude: Math.round(altitudeDeg * 10) / 10,
    azimuth: Math.round(azimuthDeg * 10) / 10,
    declinationDeg: Math.round((decl * 180 / Math.PI) * 10) / 10,
  };
}

/**
 * Calculates approximate sunrise, sunset, and solar noon for a given date and location.
 */
export function calculateSunTimes(date: Date, lat: number, lon: number, timezoneOffsetHours?: number) {
  const dayOfYear = getDayOfYear(date);
  const gamma = (2 * Math.PI / 365) * (dayOfYear - 1);
  const decl = 0.409 * Math.sin(gamma - 1.39); // approx declination radians

  const eqtime = 229.18 * (0.000075 + 0.001868 * Math.cos(gamma) - 0.032077 * Math.sin(gamma)
    - 0.014615 * Math.cos(2 * gamma) - 0.040849 * Math.sin(2 * gamma));

  const latRad = (lat * Math.PI) / 180;
  // Hour angle at horizon (-0.833 degrees for refraction + solar disc)
  const cosH = -Math.tan(latRad) * Math.tan(decl);
  
  let sunriseMinutes = 360; // 6:00 default fallback
  let sunsetMinutes = 1080; // 18:00 default fallback
  let daylightMinutes = 720;

  const tzOffsetMin = timezoneOffsetHours !== undefined ? timezoneOffsetHours * 60 : -date.getTimezoneOffset();
  const timeOffset = eqtime + 4 * lon - tzOffsetMin;
  const solarNoonMin = 720 - timeOffset;

  if (cosH >= 1) {
    // Polar night
    daylightMinutes = 0;
  } else if (cosH <= -1) {
    // Midnight sun
    daylightMinutes = 1440;
    sunriseMinutes = 0;
    sunsetMinutes = 1439;
  } else {
    const H = Math.acos(cosH) * 180 / Math.PI;
    sunriseMinutes = solarNoonMin - (H * 4);
    sunsetMinutes = solarNoonMin + (H * 4);
    daylightMinutes = (sunsetMinutes - sunriseMinutes);
  }

  const formatMin = (m: number) => {
    let normalized = ((m % 1440) + 1440) % 1440;
    const hours = Math.floor(normalized / 60);
    const mins = Math.floor(normalized % 60);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 === 0 ? 12 : hours % 12;
    return `${displayHours}:${mins.toString().padStart(2, '0')} ${period}`;
  };

  return {
    sunriseTime: formatMin(sunriseMinutes),
    sunsetTime: formatMin(sunsetMinutes),
    solarNoonTime: formatMin(solarNoonMin),
    daylightMinutes: Math.max(0, Math.round(daylightMinutes)),
    sunriseMinOfDay: sunriseMinutes,
    sunsetMinOfDay: sunsetMinutes,
  };
}

/**
 * Calculates Moon phase, illumination %, cycle day, and approximate altitude.
 */
export function calculateMoonPhase(date: Date, lat: number) {
  const diffMs = date.getTime() - REF_NEW_MOON.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  const cycleDay = ((diffDays % LUNAR_CYCLE_DAYS) + LUNAR_CYCLE_DAYS) % LUNAR_CYCLE_DAYS;
  
  // Illumination calculation from Python baseline: (1 - cos(phase_angle)) / 2 * 100
  const phaseAngle = (cycleDay / LUNAR_CYCLE_DAYS) * 2 * Math.PI;
  const illumination = Math.round(((1 - Math.cos(phaseAngle)) / 2) * 1000) / 10;

  const isWaxing = cycleDay < (LUNAR_CYCLE_DAYS / 2);

  // Categorize moon phase name
  let phaseName: MoonPhaseName = 'New Moon';
  if (cycleDay < 1.5 || cycleDay >= 28.0) {
    phaseName = 'New Moon';
  } else if (cycleDay < 6.5) {
    phaseName = 'Waxing Crescent';
  } else if (cycleDay < 8.5) {
    phaseName = 'First Quarter';
  } else if (cycleDay < 13.5) {
    phaseName = 'Waxing Gibbous';
  } else if (cycleDay < 16.0) {
    phaseName = 'Full Moon';
  } else if (cycleDay < 21.0) {
    phaseName = 'Waning Gibbous';
  } else if (cycleDay < 23.0) {
    phaseName = 'Last Quarter';
  } else {
    phaseName = 'Waning Crescent';
  }

  // Approximate altitude based on hour and phase offset
  const hour = date.getHours() + date.getMinutes() / 60;
  // Moon culminates roughly 50 minutes later each day
  const moonTransitHour = ((cycleDay * (24 / LUNAR_CYCLE_DAYS) + 12) % 24);
  const hourDiff = Math.abs(hour - moonTransitHour);
  const normDiff = Math.min(hourDiff, 24 - hourDiff);
  const altitude = Math.round((90 - (normDiff / 6) * 90 - Math.abs(lat) * 0.2) * 10) / 10;

  return {
    cycleDay: Math.round(cycleDay * 10) / 10,
    illumination,
    phaseName,
    isWaxing,
    altitude: Math.max(-60, Math.min(85, altitude)),
    azimuth: Math.round(((hour * 15 + cycleDay * 12) % 360) * 10) / 10,
  };
}

/**
 * Calculates Melatonin Suppression % and Cortisol Production % based on Solar & Lunar photobiology.
 */
export function calculateHormoneCircadian(
  sunAltitude: number,
  isDaytime: boolean,
  currentHour: number,
  moonIllumination: number
) {
  // Melatonin:
  // Photoreceptors in retina (ipRGCs with melanopsin) sense blue wavelengths (~480nm).
  // When sun altitude > 0 (daylight), melatonin is suppressed by 85-99%.
  // In dusk / civil twilight (-6° to 0°), suppression falls rapidly.
  // Deep night (sun altitude < -12°), melatonin peaks (suppression ~ 5-15%).
  // Bright moonlight (full moon ~ 0.25 lux) produces a modest 5-8% nighttime suppression.
  let melatoninSuppression = 10; // baseline night suppression (low melatonin suppression = high melatonin release)
  if (sunAltitude > 5) {
    melatoninSuppression = 92 + Math.min(7, sunAltitude * 0.1);
  } else if (sunAltitude > 0) {
    melatoninSuppression = 75 + sunAltitude * 3.4;
  } else if (sunAltitude > -6) {
    // Civil twilight
    melatoninSuppression = 45 + (sunAltitude + 6) * 5;
  } else if (sunAltitude > -12) {
    // Nautical twilight
    melatoninSuppression = 20 + (sunAltitude + 12) * 4;
  } else {
    // Full night: ambient moonlight modulation
    melatoninSuppression = 10 + (moonIllumination / 100) * 8;
  }

  // Cortisol:
  // Diurnal cortisol rhythm: Cortisol Awakening Response (CAR) surges 30-45m after wake/sunrise (peaking around 7:30 - 9:00 AM local).
  // Declines steadily through afternoon (2:00 - 5:00 PM), low in evening, lowest around midnight to 3 AM.
  let cortisolProduction = 20;
  if (currentHour >= 5 && currentHour < 9) {
    // Morning Awakening surge
    const progress = (currentHour - 5) / 4;
    cortisolProduction = 45 + Math.sin(progress * Math.PI) * 50;
  } else if (currentHour >= 9 && currentHour < 14) {
    // Elevated productive midday plateau
    cortisolProduction = 70 - ((currentHour - 9) / 5) * 25;
  } else if (currentHour >= 14 && currentHour < 19) {
    // Afternoon descent
    cortisolProduction = 45 - ((currentHour - 14) / 5) * 20;
  } else if (currentHour >= 19 && currentHour < 23) {
    // Evening winding down
    cortisolProduction = 25 - ((currentHour - 19) / 4) * 12;
  } else {
    // Night nadir (23:00 to 05:00)
    cortisolProduction = 12 + Math.sin(((currentHour + 24 - 23) % 24) * 0.2) * 5;
  }

  let circadianState: EphemerisData['circadianState'] = 'Sustained Midday Metabolism';
  if (currentHour >= 5 && currentHour < 10) {
    circadianState = 'Morning Awakening Peak';
  } else if (currentHour >= 10 && currentHour < 15) {
    circadianState = 'Sustained Midday Metabolism';
  } else if (currentHour >= 15 && currentHour < 19) {
    circadianState = 'Late Afternoon Decline';
  } else if (currentHour >= 19 && currentHour < 23) {
    circadianState = 'Evening Melatonin Surge';
  } else {
    circadianState = 'Deep Circadian Reset';
  }

  return {
    melatoninSuppressionPct: Math.round(Math.max(5, Math.min(99, melatoninSuppression))),
    cortisolProductionPct: Math.round(Math.max(10, Math.min(98, cortisolProduction))),
    circadianState,
  };
}

/**
 * Calculates tidal heights, harmonic wave form, and next milestone.
 * Ported & expanded from the Python LunarMetabolicTideEngine M2 constituent model.
 */
export function calculateTides(
  date: Date,
  lat: number,
  lon: number,
  isMetric: boolean,
  cycleDay: number
): TideData {
  const epoch2026 = new Date('2026-01-01T00:00:00Z');
  const hoursSinceEpoch = (date.getTime() - epoch2026.getTime()) / (1000 * 3600);
  
  // Spring vs Neap Tide amplification multiplier based on moon cycle
  // Syzygy (New Moon day 0 & Full Moon day ~14.76): spring tides (amplified ~1.15x)
  // Quadrature (First/Last Quarter day ~7.4 & 22.1): neap tides (dampened ~0.85x)
  const springNeapFactor = 1 + 0.15 * Math.cos((cycleDay / (LUNAR_CYCLE_DAYS / 2)) * 2 * Math.PI);
  
  let tideCategory: TideData['tideCategory'] = 'Normal Intermediate Tide';
  if (springNeapFactor > 1.10) {
    tideCategory = 'Spring Tide (Syzygy Amplification)';
  } else if (springNeapFactor < 0.90) {
    tideCategory = 'Neap Tide (Quadrature Dampening)';
  }

  // Geographic tidal amphidromic calibration:
  // Fort Myers & SW Florida / Gulf of Mexico are micro-tidal regimes with a mean range of only 1.5 - 2.0 ft,
  // peaking at ~1.5 to 1.55 ft for high incoming tide (NOAA Station 8725520 baseline).
  const isFtMyersOrSWFL = lat >= 25.8 && lat <= 27.5 && lon >= -83.0 && lon <= -81.0;
  const isGulfCoast = lat >= 24.0 && lat <= 31.0 && lon >= -98.0 && lon <= -80.0;
  const isPacificUS = lat >= 30.0 && lat <= 50.0 && lon >= -125.0 && lon <= -116.0;
  const isAtlanticUS = lat >= 25.0 && lat <= 45.0 && lon >= -81.0 && lon <= -66.0;

  let baseAmplitudeFt = 1.3;
  let datumOffsetFt = 1.5;
  let diurnalWeight = 0.25;

  if (isFtMyersOrSWFL) {
    // Fort Myers, Caloosahatchee River & SW Florida: incoming high tide peaks at 1.5 ft (NOAA 8725520)
    baseAmplitudeFt = 0.51;
    datumOffsetFt = 1.02;
    diurnalWeight = 0.40; // Mixed diurnal dominance
  } else if (isGulfCoast) {
    baseAmplitudeFt = 0.65;
    datumOffsetFt = 1.15;
    diurnalWeight = 0.35;
  } else if (isPacificUS) {
    baseAmplitudeFt = 2.3;
    datumOffsetFt = 2.8;
    diurnalWeight = 0.30;
  } else if (isAtlanticUS) {
    baseAmplitudeFt = 1.5;
    datumOffsetFt = 1.8;
    diurnalWeight = 0.15;
  }

  // Longitude-corrected lunar transit lag (15 degrees per hour)
  const lonLagHours = lon / 15;
  const localTideHours = hoursSinceEpoch + lonLagHours;

  // Semi-diurnal M2 constituent (~12.42h) and diurnal K1/O1 constituent (~24.84h)
  const semiDiurnalPhase = ((localTideHours % TIDE_CYCLE_HOURS) / TIDE_CYCLE_HOURS) * 2 * Math.PI;
  const diurnalPhase = ((localTideHours % 24.84) / 24.84) * 2 * Math.PI;

  const calculateHeightAtHours = (targetHours: number) => {
    const targetLocalHours = targetHours + lonLagHours;
    const sPhase = ((targetLocalHours % TIDE_CYCLE_HOURS) / TIDE_CYCLE_HOURS) * 2 * Math.PI;
    const dPhase = ((targetLocalHours % 24.84) / 24.84) * 2 * Math.PI;

    const waveComponent =
      (1 - diurnalWeight) * Math.sin(sPhase) +
      diurnalWeight * Math.sin(dPhase) +
      0.15 * Math.sin(sPhase * 2);

    const heightFt = datumOffsetFt + waveComponent * baseAmplitudeFt * springNeapFactor;
    return Math.max(0.1, heightFt);
  };

  const rawHeightFt = calculateHeightAtHours(hoursSinceEpoch);
  const currentHeight = isMetric
    ? Math.round((rawHeightFt / 3.28084) * 100) / 100
    : Math.round(rawHeightFt * 100) / 100;

  const unit = isMetric ? 'meters' : 'feet';

  // Determine slope (rising or falling)
  const heightNow = rawHeightFt;
  const heightIn15Min = calculateHeightAtHours(hoursSinceEpoch + 0.25);
  const isRising = heightIn15Min >= heightNow;
  const nextEventType: 'High Tide' | 'Low Tide' = isRising ? 'High Tide' : 'Low Tide';

  // Search forward for next turning point within 13 hours
  let timeToNextPeakHours = 3;
  let extremeVal = heightNow;
  for (let step = 0.1; step <= 13; step += 0.1) {
    const h = calculateHeightAtHours(hoursSinceEpoch + step);
    const prev = calculateHeightAtHours(hoursSinceEpoch + step - 0.1);
    const next = calculateHeightAtHours(hoursSinceEpoch + step + 0.1);

    if (isRising) {
      if (h >= prev && h >= next && h > extremeVal) {
        timeToNextPeakHours = step;
        extremeVal = h;
        break;
      }
    } else {
      if (h <= prev && h <= next && h < extremeVal) {
        timeToNextPeakHours = step;
        extremeVal = h;
        break;
      }
    }
  }

  const nextTideDate = new Date(date.getTime() + timeToNextPeakHours * 3600 * 1000);

  const formatTime = (d: Date) => {
    let hours = d.getHours();
    const minutes = d.getMinutes();
    const period = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return `${hours}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  // Generate 24 hourly wave points for the interactive waveform display
  const currentHourFloat = date.getHours() + date.getMinutes() / 60;
  const hourlyWavePoints = [];

  for (let i = 0; i <= 24; i += 0.5) {
    const pointTime = new Date(date);
    pointTime.setHours(0, 0, 0, 0);
    pointTime.setTime(pointTime.getTime() + i * 3600 * 1000);

    const ptHoursSinceEpoch = (pointTime.getTime() - epoch2026.getTime()) / (1000 * 3600);
    const ptHeightFt = calculateHeightAtHours(ptHoursSinceEpoch);

    const displayHeight = isMetric
      ? Math.round((ptHeightFt / 3.28084) * 100) / 100
      : Math.round(ptHeightFt * 100) / 100;

    hourlyWavePoints.push({
      hour: i,
      timeLabel: formatTime(pointTime),
      height: displayHeight,
      isPast: i < currentHourFloat,
    });
  }

  return {
    currentHeight,
    unit,
    rawHeightMeters: Number((rawHeightFt / 3.28084).toFixed(2)),
    nextEventType,
    nextEventTime: formatTime(nextTideDate),
    minutesToNextEvent: Math.round(timeToNextPeakHours * 60),
    tidePhaseRad: semiDiurnalPhase,
    isRising,
    tideCategory,
    hourlyWavePoints,
    stationName: isFtMyersOrSWFL ? 'Fort Myers (Caloosahatchee River Harmonic Model)' : undefined,
    source: 'Regional Astronomic Harmonic Model',
  };
}

/**
 * Generates 365-day solar declination curve and lunar transition cycle dataset.
 */
export function generateYearlyTransitions(year: number = 2026): YearlySolarLunarData[] {
  const points: YearlySolarLunarData[] = [];
  const daysInYear = isLeapYear(year) ? 366 : 365;

  for (let day = 1; day <= daysInYear; day += 3) {
    const date = new Date(Date.UTC(year, 0, day));
    const gamma = (2 * Math.PI / 365) * (day - 1);
    
    // Solar declination in degrees (-23.44° to +23.44°)
    const declDeg = 23.44 * Math.sin(gamma - 1.39);
    
    // Day length at latitude ~40° for visualization
    const latRad = (40 * Math.PI) / 180;
    const declRad = (declDeg * Math.PI) / 180;
    const cosH = -Math.tan(latRad) * Math.tan(declRad);
    const dayLengthHours = Math.acos(Math.max(-1, Math.min(1, cosH))) * (24 / Math.PI);

    // Season determination
    let season: YearlySolarLunarData['season'] = 'Winter';
    if (day >= 79 && day < 172) season = 'Spring';
    else if (day >= 172 && day < 265) season = 'Summer';
    else if (day >= 265 && day < 355) season = 'Autumn';
    else season = 'Winter';

    // Moon phase on this day
    const moon = calculateMoonPhase(date, 40);

    points.push({
      dayOfYear: day,
      dateStr: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      season,
      solarDeclinationDeg: Math.round(declDeg * 10) / 10,
      dayLengthHours: Math.round(dayLengthHours * 10) / 10,
      lunarCycleIndex: Math.floor(day / LUNAR_CYCLE_DAYS) + 1,
      moonPhaseOnDay: moon.phaseName,
    });
  }

  return points;
}

/**
 * Calculates Mifflin-St Jeor Basal Metabolic Rate (BMR) and Total Daily Energy Expenditure (TDEE).
 */
export function calculateMetabolics(
  weightKg: number,
  heightCm: number,
  age: number,
  gender: 'male' | 'female',
  activityLevel: string,
  cycleDay: number
) {
  // BMI = weight (kg) / (height (m))^2
  const heightMeters = heightCm / 100;
  const bmi = heightMeters > 0 ? Math.round((weightKg / (heightMeters * heightMeters)) * 10) / 10 : 0;
  
  let bmiCategory = 'Normal Weight';
  if (bmi < 18.5) bmiCategory = 'Underweight';
  else if (bmi < 25) bmiCategory = 'Optimal Weight';
  else if (bmi < 30) bmiCategory = 'Overweight';
  else bmiCategory = 'Obese';

  // Mifflin-St Jeor BMR
  let bmr = 10 * weightKg + 6.25 * heightCm - 5 * age;
  if (gender === 'male') {
    bmr += 5;
  } else {
    bmr -= 161;
  }

  const activityMultipliers: Record<string, number> = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9,
  };

  const tdee = Math.round(bmr * (activityMultipliers[activityLevel] || 1.375));

  // Solunar metabolic adjustment:
  // Full Moon phase (days ~13-17) carries higher metabolic activation and fluid retention tendency (+5% caloric ceiling, focus on protein & good fats).
  // New Moon phase (days ~28-3) carries restorative metabolic profile (clean maintenance calories, focus on complex carbohydrates).
  const isFullMoonPhase = cycleDay >= 13 && cycleDay <= 17;
  const isNewMoonPhase = cycleDay <= 3 || cycleDay >= 27;

  return {
    bmi,
    bmiCategory,
    bmr: Math.round(bmr),
    tdee,
    isFullMoonPhase,
    isNewMoonPhase,
  };
}

// Utility helpers
export function getDayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
}

function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}
