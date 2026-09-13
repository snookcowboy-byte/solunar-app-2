import React, { useState } from 'react';
import { LocationData, EphemerisData } from '../types';
import { MapPin, Search, Navigation, Sunrise, Sunset, SunMedium, Clock, ShieldCheck } from 'lucide-react';

interface LocationPanelProps {
  location: LocationData;
  ephemeris: EphemerisData;
  isDarkMode: boolean;
  isLoading: boolean;
  onSearchLocation: (input: string) => Promise<void>;
  onUseCurrentGps: () => void;
  error?: string;
}

export const LocationPanel: React.FC<LocationPanelProps> = ({
  location,
  ephemeris,
  isDarkMode,
  isLoading,
  onSearchLocation,
  onUseCurrentGps,
  error,
}) => {
  const [query, setQuery] = useState(location.input || '33901');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearchLocation(query.trim());
    }
  };

  const daylightHours = Math.floor(ephemeris.daylightMinutes / 60);
  const daylightRemainderMin = ephemeris.daylightMinutes % 60;

  return (
    <div
      id="location-synchronization-panel"
      className={`rounded-2xl border p-5 sm:p-6 transition-all duration-200 ${
        isDarkMode
          ? 'bg-slate-900/90 border-slate-800 text-slate-100 shadow-xl shadow-black/20'
          : 'bg-white border-stone-200 text-stone-900 shadow-md shadow-stone-200/50'
      }`}
    >
      {/* Panel Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
        <div className="flex items-center gap-2.5">
          <div
            className={`p-2 rounded-xl border ${
              isDarkMode ? 'bg-slate-800 border-slate-700 text-sky-400' : 'bg-sky-50 border-sky-200 text-sky-700'
            }`}
          >
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-serif font-bold text-lg leading-tight">Location &amp; Circadian Synchronization</h2>
            <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-stone-500'}`}>
              Ephemeris alignment via Name or ZIP parameters (Privacy-Preserving Geocoder)
            </p>
          </div>
        </div>

        {/* Privacy verification tag */}
        <div
          className={`inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full border self-start sm:self-auto ${
            isDarkMode ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300' : 'bg-emerald-50 border-emerald-200 text-emerald-800'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Coarse Municipal Privacy</span>
        </div>
      </div>

      {/* Search Input Form */}
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            id="location-search-input"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter ZIP code (e.g. 33901, 33101) or City (e.g. Fort Myers, Miami)"
            className={`w-full pl-10 pr-8 py-2.5 rounded-xl border text-sm transition-all focus:outline-hidden focus:ring-2 ${
              isDarkMode
                ? 'bg-slate-950 border-slate-700 text-slate-100 placeholder-slate-500 focus:ring-sky-500/40 focus:border-sky-500'
                : 'bg-stone-50 border-stone-300 text-stone-900 placeholder-stone-400 focus:ring-sky-500/30 focus:border-sky-600'
            }`}
          />
          {query !== '' && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 text-sm px-1 cursor-pointer"
              title="Clear search"
              aria-label="Clear location search"
            >
              &times;
            </button>
          )}
        </div>

        <button
          id="location-submit-btn"
          type="submit"
          disabled={isLoading}
          className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 active:scale-98 text-white font-medium text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
        >
          {isLoading ? (
            <span className="inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
          ) : (
            <Search className="w-4 h-4" />
          )}
          <span>Sync Coordinates</span>
        </button>

        <button
          id="use-current-gps-btn"
          type="button"
          onClick={onUseCurrentGps}
          title="Detect Current Coordinates"
          className={`px-3.5 py-2.5 rounded-xl border text-sm font-medium transition-all flex items-center justify-center gap-2 cursor-pointer ${
            isDarkMode
              ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
              : 'bg-stone-100 hover:bg-stone-200 border-stone-300 text-stone-800'
          }`}
        >
          <Navigation className="w-4 h-4" />
          <span className="hidden sm:inline">GPS</span>
        </button>
      </form>

      {/* Quick Location Chips */}
      <div className="flex flex-wrap items-center gap-1.5 mb-4 text-xs">
        <span className={`font-mono text-[11px] mr-1 ${isDarkMode ? 'text-slate-400' : 'text-stone-500'}`}>Presets:</span>
        {['33901 (Fort Myers)', '33101 (Miami)', '90210 (Beverly Hills)', '10001 (New York)', 'London', 'Tokyo', 'Honolulu'].map((preset) => {
          const val = preset.split(' ')[0];
          return (
            <button
              key={preset}
              type="button"
              onClick={() => {
                setQuery(val);
                onSearchLocation(val);
              }}
              className={`px-2.5 py-1 rounded-lg border text-[11px] font-mono transition-all cursor-pointer ${
                isDarkMode
                  ? 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800 hover:border-slate-700'
                  : 'bg-stone-100 border-stone-200 text-stone-700 hover:bg-stone-200'
              }`}
            >
              {preset}
            </button>
          );
        })}
      </div>

      {error && (
        <div
          id="location-error-alert"
          className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs font-medium"
        >
          {error}
        </div>
      )}

      {/* Active Location & Ephemeris Readout Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
        {/* Resolved Location */}
        <div
          className={`p-3 rounded-xl border ${
            isDarkMode ? 'bg-slate-950/80 border-slate-800' : 'bg-stone-50 border-stone-200'
          }`}
        >
          <span className={`text-[10px] uppercase font-mono tracking-wider block ${isDarkMode ? 'text-slate-400' : 'text-stone-500'}`}>
            Resolved Station
          </span>
          <div className="font-semibold text-sm truncate mt-0.5" title={location.resolvedName}>
            {location.resolvedName}
          </div>
          <div className="text-[11px] font-mono text-stone-400 mt-0.5">
            {location.latitude.toFixed(2)}°N, {Math.abs(location.longitude).toFixed(2)}°{location.longitude >= 0 ? 'E' : 'W'}
          </div>
        </div>

        {/* Sunrise */}
        <div
          className={`p-3 rounded-xl border ${
            isDarkMode ? 'bg-slate-950/80 border-slate-800' : 'bg-stone-50 border-stone-200'
          }`}
        >
          <div className="flex items-center gap-1.5 text-amber-500">
            <Sunrise className="w-3.5 h-3.5" />
            <span className={`text-[10px] uppercase font-mono tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-stone-500'}`}>
              Dawn / Sunrise
            </span>
          </div>
          <div className="font-mono font-bold text-sm mt-0.5">{ephemeris.sunriseTime}</div>
          <div className="text-[11px] text-amber-600/90 dark:text-amber-400/90 mt-0.5">
            Cortisol Trigger (CAR)
          </div>
        </div>

        {/* Solar Noon */}
        <div
          className={`p-3 rounded-xl border ${
            isDarkMode ? 'bg-slate-950/80 border-slate-800' : 'bg-stone-50 border-stone-200'
          }`}
        >
          <div className="flex items-center gap-1.5 text-amber-400">
            <SunMedium className="w-3.5 h-3.5" />
            <span className={`text-[10px] uppercase font-mono tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-stone-500'}`}>
              Solar Zenith
            </span>
          </div>
          <div className="font-mono font-bold text-sm mt-0.5">{ephemeris.solarNoonTime}</div>
          <div className="text-[11px] text-stone-400 mt-0.5">
            Peak Metabolic Output
          </div>
        </div>

        {/* Sunset & Photoperiod */}
        <div
          className={`p-3 rounded-xl border ${
            isDarkMode ? 'bg-slate-950/80 border-slate-800' : 'bg-stone-50 border-stone-200'
          }`}
        >
          <div className="flex items-center gap-1.5 text-indigo-400">
            <Sunset className="w-3.5 h-3.5" />
            <span className={`text-[10px] uppercase font-mono tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-stone-500'}`}>
              Dusk / Sunset
            </span>
          </div>
          <div className="font-mono font-bold text-sm mt-0.5">{ephemeris.sunsetTime}</div>
          <div className="text-[11px] text-indigo-500 dark:text-indigo-400 mt-0.5 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{daylightHours}h {daylightRemainderMin}m daylight</span>
          </div>
        </div>
      </div>
    </div>
  );
};
