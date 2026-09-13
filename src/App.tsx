import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { UnitSystem, LocationData, BodyMetrics, DietaryLogItem, EphemerisData, TideData } from './types';
import { resolveLocation } from './services/geocoding';
import {
  calculateSunPosition,
  calculateSunTimes,
  calculateMoonPhase,
  calculateHormoneCircadian,
  calculateTides,
} from './services/solunarEngine';
import { findNearestNOAAStation, fetchNOAATideData, NOAA_STATIONS } from './services/noaaTideService';
import { Header } from './components/Header';
import { LocationPanel } from './components/LocationPanel';
import { BodyMetricsPanel } from './components/BodyMetricsPanel';
import { SolunarHormonePanel } from './components/SolunarHormonePanel';
import { DietaryPhasingPanel } from './components/DietaryPhasingPanel';
import { TideWaveformPanel } from './components/TideWaveformPanel';
import { YearlyOrbitGraphic } from './components/YearlyOrbitGraphic';
import { TemporalControlBar } from './components/TemporalControlBar';
import { QRCodeModal } from './components/QRCodeModal';
import { PanelExplanationModal } from './components/PanelExplanationModal';
import { MobileInstallModal } from './components/MobileInstallModal';
import { MedicalDisclaimerModal } from './components/MedicalDisclaimerModal';
import { ShieldAlert } from 'lucide-react';

// Storage keys
const STORAGE_UNIT = 'solunar_unit_system';
const STORAGE_THEME = 'solunar_dark_mode';
const STORAGE_BODY = 'solunar_body_metrics';
const STORAGE_LOGS = 'solunar_dietary_logs';
const STORAGE_LOC = 'solunar_location';
const STORAGE_TIDE_OFFSET = 'solunar_tide_offset';
const STORAGE_TIME_TIMESTAMP = 'solunar_custom_time_ts';
const STORAGE_TIME_TICKING = 'solunar_time_ticking';
const STORAGE_FONT_SIZE = 'solunar_font_size';

export default function App() {
  // Unit System
  const [unitSystem, setUnitSystem] = useState<UnitSystem>(() => {
    const saved = localStorage.getItem(STORAGE_UNIT);
    return (saved as UnitSystem) || 'standard';
  });

  // Dark Mode
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_THEME);
    return saved !== null ? saved === 'true' : true; // Default dark mode for celestial visualization
  });

  // Font Size (Default to 'larger' - one size bigger / 18px for enhanced readability)
  const [fontSize, setFontSize] = useState<'standard' | 'larger' | 'extralarge'>(() => {
    const saved = localStorage.getItem(STORAGE_FONT_SIZE);
    return (saved as 'standard' | 'larger' | 'extralarge') || 'larger';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-font-size', fontSize);
    localStorage.setItem(STORAGE_FONT_SIZE, fontSize);
  }, [fontSize]);

  const handleCycleFontSize = () => {
    setFontSize((prev) => {
      if (prev === 'larger') return 'extralarge';
      if (prev === 'extralarge') return 'standard';
      return 'larger';
    });
  };

  // Modals
  const [isQrOpen, setIsQrOpen] = useState<boolean>(false);
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);
  const [isInstallOpen, setIsInstallOpen] = useState<boolean>(false);
  const [isDisclaimerOpen, setIsDisclaimerOpen] = useState<boolean>(false);

  // Location State (Default Fort Myers, FL for coastal ephemeris & tide calibration)
  const [location, setLocation] = useState<LocationData>(() => {
    const saved = localStorage.getItem(STORAGE_LOC);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.latitude) {
          // If the location was previously the default Beverly Hills, switch to Fort Myers, FL
          if (parsed.input === '90210' || parsed.resolvedName?.includes('Beverly Hills')) {
            return {
              input: 'Fort Myers, FL',
              resolvedName: 'Fort Myers, FL',
              latitude: 26.6406,
              longitude: -81.8723,
              timezoneOffsetHours: -new Date().getTimezoneOffset() / 60,
            };
          }
          return parsed;
        }
      } catch {
        // fallback
      }
    }
    return {
      input: 'Fort Myers, FL',
      resolvedName: 'Fort Myers, FL',
      latitude: 26.6406,
      longitude: -81.8723,
      timezoneOffsetHours: -new Date().getTimezoneOffset() / 60,
    };
  });
  const [locLoading, setLocLoading] = useState<boolean>(false);
  const [locError, setLocError] = useState<string | undefined>();

  // Body Metrics State (with responsive BMI synchronization)
  const [bodyMetrics, setBodyMetrics] = useState<BodyMetrics>(() => {
    const saved = localStorage.getItem(STORAGE_BODY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return {
      age: 34,
      heightCm: 178, // ~5'10"
      weightKg: 63.5, // 140 lbs
      weightLbs: 140,
      bmi: 20.0,
      bmiCategory: 'Normal weight',
      activityLevel: 'moderate',
    };
  });

  // Dietary Intake Records
  const [dietaryLogs, setDietaryLogs] = useState<DietaryLogItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_LOGS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return [
      {
        id: 'seed-1',
        timestamp: new Date().toISOString(),
        foodName: 'Roasted Sweet Potato & Black Beans',
        mealType: 'breakfast',
        category: 'long_chain_carbs',
        calories: 420,
        proteinGrams: 14,
        carbsGrams: 76,
        fatGrams: 6,
        phaseAlignment: 'optimal',
        notes: 'Pre-noon complex polysaccharides for gradual glycogen release.',
      },
      {
        id: 'seed-2',
        timestamp: new Date().toISOString(),
        foodName: 'Wild Sockeye Salmon with Olive Oil Sautéed Greens',
        mealType: 'lunch',
        category: 'proteins',
        calories: 540,
        proteinGrams: 42,
        carbsGrams: 12,
        fatGrams: 36,
        phaseAlignment: 'optimal',
        notes: 'High omega-3 phospholipids & complete amino matrix.',
      },
    ];
  });

  // Keep local storage synchronized
  useEffect(() => {
    localStorage.setItem(STORAGE_UNIT, unitSystem);
  }, [unitSystem]);

  useEffect(() => {
    localStorage.setItem(STORAGE_THEME, String(isDarkMode));
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  useEffect(() => {
    localStorage.setItem(STORAGE_LOC, JSON.stringify(location));
  }, [location]);

  useEffect(() => {
    localStorage.setItem(STORAGE_BODY, JSON.stringify(bodyMetrics));
  }, [bodyMetrics]);

  useEffect(() => {
    localStorage.setItem(STORAGE_LOGS, JSON.stringify(dietaryLogs));
  }, [dietaryLogs]);

  // Current Date/Time state: default anchored to target 9/12/2026 2:00 PM (EDT)
  const [currentTime, setCurrentTime] = useState<Date>(() => {
    const saved = localStorage.getItem(STORAGE_TIME_TIMESTAMP);
    if (saved) {
      const parsed = parseInt(saved, 10);
      if (!isNaN(parsed)) return new Date(parsed);
    }
    return new Date(2026, 8, 12, 14, 0, 0); // 9/12/2026 2:00 PM EDT
  });

  const [isTicking, setIsTicking] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_TIME_TICKING);
    return saved !== null ? saved === 'true' : true;
  });

  useEffect(() => {
    if (!isTicking) return;
    const timer = setInterval(() => {
      setCurrentTime((prev) => {
        const next = new Date(prev.getTime() + 60000);
        localStorage.setItem(STORAGE_TIME_TIMESTAMP, String(next.getTime()));
        return next;
      });
    }, 60000); // advance minute
    return () => clearInterval(timer);
  }, [isTicking]);

  const handleResetToTargetTime = useCallback(() => {
    const target = new Date(2026, 8, 12, 14, 0, 0);
    setCurrentTime(target);
    localStorage.setItem(STORAGE_TIME_TIMESTAMP, String(target.getTime()));
  }, []);

  const handleChangeTime = useCallback((newTime: Date) => {
    setCurrentTime(newTime);
    localStorage.setItem(STORAGE_TIME_TIMESTAMP, String(newTime.getTime()));
  }, []);

  const handleToggleTicking = useCallback(() => {
    setIsTicking((prev) => {
      const updated = !prev;
      localStorage.setItem(STORAGE_TIME_TICKING, String(updated));
      return updated;
    });
  }, []);

  // Compute Ephemeris Data
  const ephemeris: EphemerisData = useMemo(() => {
    const sunPos = calculateSunPosition(
      currentTime,
      location.latitude,
      location.longitude,
      location.timezoneOffsetHours
    );
    const sunTimes = calculateSunTimes(
      currentTime,
      location.latitude,
      location.longitude,
      location.timezoneOffsetHours
    );
    const moon = calculateMoonPhase(currentTime, location.latitude);
    const isDaytime = sunPos.altitude > 0;
    const currentHour = currentTime.getHours() + currentTime.getMinutes() / 60;

    const hormones = calculateHormoneCircadian(
      sunPos.altitude,
      isDaytime,
      currentHour,
      moon.illumination
    );

    return {
      sunAltitude: sunPos.altitude,
      sunAzimuth: sunPos.azimuth,
      sunriseTime: sunTimes.sunriseTime,
      sunsetTime: sunTimes.sunsetTime,
      solarNoonTime: sunTimes.solarNoonTime,
      daylightMinutes: sunTimes.daylightMinutes,
      isDaytime,

      moonAltitude: moon.altitude,
      moonAzimuth: moon.azimuth,
      moonIllumination: moon.illumination,
      moonPhaseName: moon.phaseName,
      cycleDay: moon.cycleDay,
      isWaxing: moon.isWaxing,

      melatoninSuppressionPct: hormones.melatoninSuppressionPct,
      cortisolProductionPct: hormones.cortisolProductionPct,
      circadianState: hormones.circadianState,
    };
  }, [currentTime, location.latitude, location.longitude, location.timezoneOffsetHours]);

  // NOAA Live Tide State & Calibration
  const [liveNoaaTide, setLiveNoaaTide] = useState<TideData | null>(null);
  const [isNoaaLoading, setIsNoaaLoading] = useState<boolean>(false);
  const [selectedStationId, setSelectedStationId] = useState<string | null>('8725520'); // Fort Myers (River)
  const [manualTideOffset, setManualTideOffset] = useState<number>(() => {
    const saved = localStorage.getItem(STORAGE_TIDE_OFFSET);
    return saved ? parseFloat(saved) || 0 : 0;
  });

  // Fetch verified NOAA CO-OPS predictions & sensors
  const refreshNoaaTides = useCallback(async () => {
    if (selectedStationId === 'harmonic') {
      setLiveNoaaTide(null);
      return;
    }

    const nearest = findNearestNOAAStation(location.latitude, location.longitude);
    const targetStation = selectedStationId
      ? NOAA_STATIONS.find((s) => s.id === selectedStationId) || nearest
      : nearest;

    if (!targetStation) {
      setLiveNoaaTide(null);
      return;
    }

    setIsNoaaLoading(true);
    try {
      const data = await fetchNOAATideData(targetStation, unitSystem === 'metric', currentTime);
      if (data) {
        setLiveNoaaTide(data);
      }
    } catch (e) {
      console.warn('NOAA Tide fetch fallback to regional harmonic model', e);
    } finally {
      setIsNoaaLoading(false);
    }
  }, [location.latitude, location.longitude, selectedStationId, unitSystem, currentTime]);

  useEffect(() => {
    refreshNoaaTides();
  }, [refreshNoaaTides]);

  // Compute Tide Data (using verified NOAA station predictions or regional harmonic model)
  const tideData: TideData = useMemo(() => {
    const base = liveNoaaTide || calculateTides(
      currentTime,
      location.latitude,
      location.longitude,
      unitSystem === 'metric',
      ephemeris.cycleDay
    );

    if (manualTideOffset === 0) {
      return base;
    }

    const adjustedCurrent = Math.round((base.currentHeight + manualTideOffset) * 100) / 100;
    return {
      ...base,
      currentHeight: adjustedCurrent,
      manualOffset: manualTideOffset,
      hourlyWavePoints: base.hourlyWavePoints.map((p) => ({
        ...p,
        height: Math.round((p.height + manualTideOffset) * 100) / 100,
      })),
    };
  }, [liveNoaaTide, currentTime, location.latitude, location.longitude, unitSystem, ephemeris.cycleDay, manualTideOffset]);

  const handleAdjustTideOffset = (delta: number) => {
    setManualTideOffset((prev) => {
      const updated = Math.round((prev + delta) * 10) / 10;
      localStorage.setItem(STORAGE_TIDE_OFFSET, String(updated));
      return updated;
    });
  };

  const handleSetExactTideHeight = (target: number) => {
    const baseHeight = liveNoaaTide
      ? liveNoaaTide.currentHeight
      : calculateTides(currentTime, location.latitude, location.longitude, unitSystem === 'metric', ephemeris.cycleDay).currentHeight;
    const neededOffset = Math.round((target - baseHeight) * 100) / 100;
    setManualTideOffset(neededOffset);
    localStorage.setItem(STORAGE_TIDE_OFFSET, String(neededOffset));
  };

  const handleResetTideOffset = () => {
    setManualTideOffset(0);
    localStorage.removeItem(STORAGE_TIDE_OFFSET);
  };

  // Handle location search
  const handleSearchLocation = useCallback(async (query: string) => {
    setLocLoading(true);
    setLocError(undefined);
    try {
      const res = await resolveLocation(query);
      if (res.success && res.data) {
        setLocation(res.data);
      } else {
        setLocError(res.error || 'Failed to resolve location.');
      }
    } catch {
      setLocError('Network error connecting to geocoder.');
    } finally {
      setLocLoading(false);
    }
  }, []);

  // Use GPS location
  const handleUseCurrentGps = useCallback(() => {
    if (!navigator.geolocation) {
      setLocError('Geolocation is not supported by your browser.');
      return;
    }
    setLocLoading(true);
    setLocError(undefined);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        setLocation({
          input: `${lat.toFixed(2)}, ${lon.toFixed(2)}`,
          resolvedName: `GPS Station (${lat.toFixed(2)}°N, ${lon.toFixed(2)}°E)`,
          latitude: lat,
          longitude: lon,
          timezoneOffsetHours: -new Date().getTimezoneOffset() / 60,
        });
        setLocLoading(false);
      },
      (err) => {
        setLocError(`GPS Permission error: ${err.message}`);
        setLocLoading(false);
      },
      { timeout: 8000 }
    );
  }, []);

  // Update body metrics
  const handleUpdateBodyMetrics = useCallback((updated: Partial<BodyMetrics>) => {
    setBodyMetrics((prev) => ({ ...prev, ...updated }));
  }, []);

  // Add dietary item
  const handleAddDietaryItem = useCallback(
    (item: Omit<DietaryLogItem, 'id' | 'timestamp' | 'phaseAlignment'>) => {
      // Evaluate alignment with current lunar phase
      const isNewMoon = ephemeris.cycleDay <= 3.5 || ephemeris.cycleDay >= 26.5;
      const isFullMoon = ephemeris.cycleDay >= 12.5 && ephemeris.cycleDay <= 17.5;

      let alignment: DietaryLogItem['phaseAlignment'] = 'moderate';
      if (isNewMoon && item.category === 'long_chain_carbs') {
        alignment = 'optimal';
      } else if (isFullMoon && (item.category === 'proteins' || item.category === 'lipids')) {
        alignment = 'optimal';
      } else if (!isNewMoon && !isFullMoon && item.category === 'balanced_mixed') {
        alignment = 'optimal';
      }

      const newItem: DietaryLogItem = {
        ...item,
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        phaseAlignment: alignment,
      };

      setDietaryLogs((prev) => [newItem, ...prev]);
    },
    [ephemeris.cycleDay]
  );

  // Remove dietary item
  const handleRemoveDietaryItem = useCallback((id: string) => {
    setDietaryLogs((prev) => prev.filter((i) => i.id !== id));
  }, []);

  return (
    <div
      id="solunar-metabolics-app"
      className={`min-h-screen font-sans transition-colors duration-200 ${
        isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-stone-100/70 text-stone-900'
      }`}
    >
      {/* Navigation Header */}
      <Header
        unitSystem={unitSystem}
        onToggleUnit={() => setUnitSystem((prev) => (prev === 'standard' ? 'metric' : 'standard'))}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode((prev) => !prev)}
        onOpenQR={() => setIsQrOpen(true)}
        onOpenGuide={() => setIsGuideOpen(true)}
        onOpenInstall={() => setIsInstallOpen(true)}
        onOpenDisclaimer={() => setIsDisclaimerOpen(true)}
        moonIllumination={ephemeris.moonIllumination}
        moonPhaseName={ephemeris.moonPhaseName}
        fontSize={fontSize}
        onCycleFontSize={handleCycleFontSize}
      />

      {/* Main Content Layout */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
        {/* Real-time Temporal Synchronization Controller */}
        <TemporalControlBar
          currentTime={currentTime}
          onChangeTime={handleChangeTime}
          onResetToTarget={handleResetToTargetTime}
          isTicking={isTicking}
          onToggleTicking={handleToggleTicking}
          isDarkMode={isDarkMode}
          locationName={location.resolvedName}
        />

        {/* Top Grid: Location & Body Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <LocationPanel
            location={location}
            ephemeris={ephemeris}
            isDarkMode={isDarkMode}
            isLoading={locLoading}
            onSearchLocation={handleSearchLocation}
            onUseCurrentGps={handleUseCurrentGps}
            error={locError}
          />
          <BodyMetricsPanel
            metrics={bodyMetrics}
            onChangeMetrics={handleUpdateBodyMetrics}
            unitSystem={unitSystem}
            cycleDay={ephemeris.cycleDay}
            isDarkMode={isDarkMode}
          />
        </div>

        {/* Solunar Ephemeris & Hormonal Axis (Melatonin / Cortisol) */}
        <SolunarHormonePanel ephemeris={ephemeris} isDarkMode={isDarkMode} />

        {/* Celestial Dietary Phasing & Intake Log */}
        <DietaryPhasingPanel
          moonPhaseName={ephemeris.moonPhaseName}
          cycleDay={ephemeris.cycleDay}
          dietaryLogs={dietaryLogs}
          onAddLogItem={handleAddDietaryItem}
          onRemoveLogItem={handleRemoveDietaryItem}
          isDarkMode={isDarkMode}
          tideData={tideData}
          ephemeris={ephemeris}
          currentTime={currentTime}
          bodyMetrics={bodyMetrics}
        />

        {/* Harmonic Tidal Ephemeris & Waveform */}
        <TideWaveformPanel
          tideData={tideData}
          unitSystem={unitSystem}
          isDarkMode={isDarkMode}
          isLoadingNoaa={isNoaaLoading}
          onRefresh={refreshNoaaTides}
          onAdjustOffset={handleAdjustTideOffset}
          onSetExactHeight={handleSetExactTideHeight}
          onResetOffset={handleResetTideOffset}
          onSelectStation={setSelectedStationId}
          selectedStationId={selectedStationId}
          currentTime={currentTime}
        />

        {/* 365-Day Solar & Lunar Seasonal Orbit Visualizer */}
        <YearlyOrbitGraphic isDarkMode={isDarkMode} currentTime={currentTime} />
      </main>

      {/* Footer */}
      <footer
        className={`mt-12 py-8 border-t text-xs ${
          isDarkMode ? 'border-slate-800/80 text-slate-500' : 'border-stone-200 text-stone-500'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 space-y-5">
          {/* Prominent Store-Compliant Regulatory Notice Box */}
          <div
            className={`p-4 rounded-xl border text-left flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
              isDarkMode
                ? 'bg-slate-900/60 border-slate-800 text-slate-400'
                : 'bg-stone-50 border-stone-200 text-stone-600'
            }`}
          >
            <div className="flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-xs tracking-wide uppercase text-rose-500">
                  Regulatory &amp; Medical Notice (App Store 1.4.1 &bull; Google Play Health Compliance)
                </p>
                <p className="text-xs mt-0.5 leading-relaxed">
                  Solunar Metabolics is an informational chronobiological modeling engine and educational ephemeris tracker.
                  It does <strong>not</strong> provide medical diagnosis, treatment, or clinical advice. Consult a board-certified physician before making dietary, fasting, or lifestyle modifications.
                </p>
              </div>
            </div>
            <button
              id="footer-review-disclaimer-btn"
              onClick={() => setIsDisclaimerOpen(true)}
              className="shrink-0 px-3.5 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer transition-colors border-rose-500/30 text-rose-500 hover:bg-rose-500/10"
            >
              Read Medical Disclaimer
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <div className="font-mono text-center sm:text-left">
              Solunar Metabolics Engine &bull; Ephemeris M2 constituent &bull; Photobiology &amp; Chrononutrition
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
              <button
                onClick={() => setIsInstallOpen(true)}
                className="hover:underline cursor-pointer text-indigo-400"
              >
                Mobile App (iOS &bull; Android)
              </button>
              <span>&bull;</span>
              <button
                onClick={() => setIsGuideOpen(true)}
                className="hover:underline cursor-pointer"
              >
                Scientific Explanations
              </button>
              <span>&bull;</span>
              <button
                onClick={() => setIsQrOpen(true)}
                className="hover:underline cursor-pointer"
              >
                Mobile QR Sync
              </button>
              <span>&bull;</span>
              <button
                id="footer-disclaimer-link"
                onClick={() => setIsDisclaimerOpen(true)}
                className="hover:underline cursor-pointer text-rose-400 font-medium"
              >
                Medical Disclaimer
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* QR Code Modal */}
      <QRCodeModal
        isOpen={isQrOpen}
        onClose={() => setIsQrOpen(false)}
        isDarkMode={isDarkMode}
        onOpenMobileInstall={() => {
          setIsQrOpen(false);
          setIsInstallOpen(true);
        }}
      />

      {/* Mobile Install Guide Modal (Apple iPhone & Android) */}
      <MobileInstallModal
        isOpen={isInstallOpen}
        onClose={() => setIsInstallOpen(false)}
        isDarkMode={isDarkMode}
        onOpenQR={() => {
          setIsInstallOpen(false);
          setIsQrOpen(true);
        }}
      />

      {/* Panel Explanation Modal */}
      <PanelExplanationModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
        isDarkMode={isDarkMode}
      />

      {/* Medical Disclaimer & Regulatory Notice Modal */}
      <MedicalDisclaimerModal
        isOpen={isDisclaimerOpen}
        onClose={() => setIsDisclaimerOpen(false)}
        isDarkMode={isDarkMode}
      />
    </div>
  );
}
