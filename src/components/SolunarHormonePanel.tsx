import React from 'react';
import { EphemerisData } from '../types';
import { Sun, Moon, Sparkles, Activity, Clock, ShieldAlert } from 'lucide-react';

interface SolunarHormonePanelProps {
  ephemeris: EphemerisData;
  isDarkMode: boolean;
}

export const SolunarHormonePanel: React.FC<SolunarHormonePanelProps> = ({
  ephemeris,
  isDarkMode,
}) => {
  // Melatonin bioavailability is inverse to melatonin suppression
  const melatoninBioavailabilityPct = 100 - ephemeris.melatoninSuppressionPct;

  return (
    <div
      id="solunar-hormone-panel"
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
              isDarkMode ? 'bg-slate-800 border-slate-700 text-amber-300' : 'bg-amber-50 border-amber-200 text-amber-700'
            }`}
          >
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-serif font-bold text-lg leading-tight">
              Solunar Ephemeris &amp; Hormonal Axis
            </h2>
            <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-stone-500'}`}>
              Real-time celestial angles, photobiology, melatonin suppression &amp; cortisol rhythm
            </p>
          </div>
        </div>

        <div
          className={`px-3 py-1 rounded-full text-xs font-mono font-medium border self-start sm:self-auto ${
            isDarkMode
              ? 'bg-indigo-950/60 border-indigo-800 text-indigo-300'
              : 'bg-indigo-50 border-indigo-200 text-indigo-900'
          }`}
        >
          {ephemeris.circadianState}
        </div>
      </div>

      {/* Primary Coordinates and Luminosity Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
        {/* Solar Ephemeris Card */}
        <div
          className={`p-4 rounded-xl border ${
            isDarkMode ? 'bg-slate-950/70 border-slate-800/90' : 'bg-stone-50 border-stone-200'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-amber-500">
              <Sun className="w-5 h-5" />
              <span className="font-serif font-bold text-sm">Solar Coordinates</span>
            </div>
            <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-500 border border-amber-500/20">
              {ephemeris.sunAltitude > 0 ? 'Daylight (Above Horizon)' : 'Night (Sub-Horizon)'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-3">
            <div className="p-2.5 rounded-lg border border-dashed border-stone-300 dark:border-slate-800">
              <span className="text-[10px] uppercase font-mono block text-stone-400">Solar Elevation</span>
              <span className="text-lg font-mono font-bold">
                {ephemeris.sunAltitude > 0 ? `+${ephemeris.sunAltitude}°` : `${ephemeris.sunAltitude}°`}
              </span>
              <span className="text-[10px] block text-stone-400 mt-0.5">Zenith reference</span>
            </div>
            <div className="p-2.5 rounded-lg border border-dashed border-stone-300 dark:border-slate-800">
              <span className="text-[10px] uppercase font-mono block text-stone-400">Solar Azimuth</span>
              <span className="text-lg font-mono font-bold">{ephemeris.sunAzimuth}°</span>
              <span className="text-[10px] block text-stone-400 mt-0.5">Compass heading</span>
            </div>
          </div>
          <p className="text-[11px] text-stone-400 mt-2.5 leading-relaxed">
            Directly stimulates retinal intrinsically photosensitive ganglion cells (ipRGCs) regulating the suprachiasmatic nucleus (SCN).
          </p>
        </div>

        {/* Lunar Ephemeris Card */}
        <div
          className={`p-4 rounded-xl border ${
            isDarkMode ? 'bg-slate-950/70 border-slate-800/90' : 'bg-stone-50 border-stone-200'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-indigo-400">
              <Moon className="w-5 h-5" />
              <span className="font-serif font-bold text-sm">Lunar Ephemeris</span>
            </div>
            <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              Day {ephemeris.cycleDay} / 29.53
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-3">
            <div className="p-2.5 rounded-lg border border-dashed border-stone-300 dark:border-slate-800">
              <span className="text-[10px] uppercase font-mono block text-stone-400">Luminosity (Illum)</span>
              <span className="text-lg font-mono font-bold text-indigo-400">{ephemeris.moonIllumination}%</span>
              <span className="text-[10px] block text-stone-400 mt-0.5">{ephemeris.moonPhaseName}</span>
            </div>
            <div className="p-2.5 rounded-lg border border-dashed border-stone-300 dark:border-slate-800">
              <span className="text-[10px] uppercase font-mono block text-stone-400">Lunar Elevation</span>
              <span className="text-lg font-mono font-bold">
                {ephemeris.moonAltitude > 0 ? `+${ephemeris.moonAltitude}°` : `${ephemeris.moonAltitude}°`}
              </span>
              <span className="text-[10px] block text-stone-400 mt-0.5">{ephemeris.isWaxing ? 'Waxing trajectory' : 'Waning trajectory'}</span>
            </div>
          </div>
          <p className="text-[11px] text-stone-400 mt-2.5 leading-relaxed">
            Lunar gravitation and nightly albedo alter sleep micro-architecture, fluid distribution, and nocturnal sympathetic tone.
          </p>
        </div>
      </div>

      {/* Hormonal Axis Indicators (Melatonin vs Cortisol) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Melatonin Suppression Gauge */}
        <div
          className={`p-4 rounded-xl border relative overflow-hidden ${
            isDarkMode ? 'bg-slate-950/80 border-slate-800' : 'bg-stone-50 border-stone-200'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-indigo-400" />
              <span className="text-xs uppercase font-mono font-bold tracking-wider">
                Melatonin Suppression
              </span>
            </div>
            <span className="text-lg font-mono font-bold text-indigo-400">
              {ephemeris.melatoninSuppressionPct}%
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full h-2.5 bg-stone-200 dark:bg-slate-800 rounded-full overflow-hidden my-2">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-sky-400 rounded-full transition-all duration-500"
              style={{ width: `${ephemeris.melatoninSuppressionPct}%` }}
            />
          </div>

          <div className="flex justify-between text-[11px] font-mono text-stone-400 mt-1">
            <span>Bioavailable: {melatoninBioavailabilityPct}%</span>
            <span>
              {ephemeris.melatoninSuppressionPct > 70
                ? 'High Sunlight Inhibition'
                : ephemeris.melatoninSuppressionPct < 30
                ? 'Night Surge Active'
                : 'Twilight Transition'}
            </span>
          </div>

          <p className="text-[11px] text-stone-400 mt-2 leading-relaxed">
            {ephemeris.melatoninSuppressionPct > 60
              ? 'Full daytime optical inhibition: Pineal gland suppresses melatonin synthesis to sustain vigilant daytime glucose metabolism.'
              : 'Diminishing solar lux allows pineal serotonin acetylation into active melatonin, initiating cellular autophagy and deep rest.'}
          </p>
        </div>

        {/* Cortisol Production Rhythm Gauge */}
        <div
          className={`p-4 rounded-xl border relative overflow-hidden ${
            isDarkMode ? 'bg-slate-950/80 border-slate-800' : 'bg-stone-50 border-stone-200'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-amber-500" />
              <span className="text-xs uppercase font-mono font-bold tracking-wider">
                Cortisol Production
              </span>
            </div>
            <span className="text-lg font-mono font-bold text-amber-500">
              {ephemeris.cortisolProductionPct}%
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full h-2.5 bg-stone-200 dark:bg-slate-800 rounded-full overflow-hidden my-2">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-orange-400 rounded-full transition-all duration-500"
              style={{ width: `${ephemeris.cortisolProductionPct}%` }}
            />
          </div>

          <div className="flex justify-between text-[11px] font-mono text-stone-400 mt-1">
            <span>Adrenal Output Index</span>
            <span>
              {ephemeris.cortisolProductionPct > 65
                ? 'Peak Awakening Wave'
                : ephemeris.cortisolProductionPct < 30
                ? 'Nocturnal Trough'
                : 'Afternoon Steady State'}
            </span>
          </div>

          <p className="text-[11px] text-stone-400 mt-2 leading-relaxed">
            {ephemeris.cortisolProductionPct > 60
              ? 'Adrenal cortex surges cortisol in response to sunrise (CAR), accelerating gluconeogenesis and priming muscle insulin sensitivity.'
              : 'Circadian cortisol tapers down, reducing cardiovascular strain and signaling readiness for restorative sleep.'}
          </p>
        </div>
      </div>
    </div>
  );
};
