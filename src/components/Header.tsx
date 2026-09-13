import React from 'react';
import { UnitSystem } from '../types';
import { Sun, Moon, QrCode, HelpCircle, Compass, Smartphone, Type, ShieldAlert } from 'lucide-react';

interface HeaderProps {
  unitSystem: UnitSystem;
  onToggleUnit: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenQR: () => void;
  onOpenGuide: () => void;
  onOpenInstall: () => void;
  onOpenDisclaimer?: () => void;
  moonIllumination: number;
  moonPhaseName: string;
  fontSize?: 'standard' | 'larger' | 'extralarge';
  onCycleFontSize?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  unitSystem,
  onToggleUnit,
  isDarkMode,
  onToggleDarkMode,
  onOpenQR,
  onOpenGuide,
  onOpenInstall,
  onOpenDisclaimer,
  moonIllumination,
  moonPhaseName,
  fontSize = 'larger',
  onCycleFontSize,
}) => {
  return (
    <header
      id="app-header"
      className={`border-b transition-colors duration-200 sticky top-0 z-30 ${
        isDarkMode
          ? 'bg-slate-950/90 border-slate-800 text-slate-100 backdrop-blur-md'
          : 'bg-white/90 border-stone-200 text-stone-900 backdrop-blur-md'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand & Celestial status */}
        <div className="flex items-center gap-3">
          <div
            id="brand-icon-container"
            className={`w-10 h-10 rounded-xl flex items-center justify-center border shadow-xs ${
              isDarkMode
                ? 'bg-slate-900 border-indigo-900/60 text-indigo-300'
                : 'bg-stone-50 border-amber-300 text-amber-600'
            }`}
          >
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif font-bold text-lg sm:text-xl tracking-tight leading-none">
                Solunar Metabolics
              </h1>
              <span
                id="moon-badge"
                className={`text-xs px-2 py-0.5 rounded-full font-mono font-medium hidden sm:inline-flex items-center gap-1.5 border ${
                  isDarkMode
                    ? 'bg-indigo-950/70 border-indigo-800/80 text-indigo-300'
                    : 'bg-amber-50 border-amber-200 text-amber-900'
                }`}
              >
                <Moon className="w-3 h-3" />
                {moonPhaseName} ({moonIllumination}%)
              </span>
            </div>
            <p
              className={`text-xs ${
                isDarkMode ? 'text-slate-400' : 'text-stone-500'
              } hidden md:block`}
            >
              Circadian Ephemeris &bull; Hormonal Axis &bull; Dietary Phasing &bull; Harmonic Tides
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Mobile App Install Button (Android + Apple iOS) */}
          <button
            id="open-install-button"
            onClick={onOpenInstall}
            title="Install Solunar Metabolics on Apple iPhone or Android"
            className="px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide border transition-all flex items-center gap-1.5 cursor-pointer bg-gradient-to-r from-indigo-600/90 to-emerald-600/90 hover:from-indigo-600 hover:to-emerald-600 text-white border-indigo-400/40 shadow-xs"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">iOS &bull; Android App</span>
            <span className="sm:hidden">Install</span>
          </button>

          {/* Unit System Toggle */}
          <button
            id="unit-system-toggle"
            onClick={onToggleUnit}
            title="Toggle Metric and Standard Units"
            className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide border transition-all flex items-center gap-1.5 cursor-pointer ${
              isDarkMode
                ? 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-200'
                : 'bg-stone-100 hover:bg-stone-200 border-stone-300 text-stone-800'
            }`}
          >
            <span className="text-xs uppercase font-mono text-indigo-500 font-bold hidden sm:inline">Units:</span>
            <span>{unitSystem === 'metric' ? 'Metric' : 'Standard'}</span>
          </button>

          {/* Font Size Readability Toggle */}
          {onCycleFontSize && (
            <button
              id="font-size-toggle"
              onClick={onCycleFontSize}
              title={`Text Size: ${
                fontSize === 'larger'
                  ? 'One Size Bigger (18px) - Click for Extra Large (20px)'
                  : fontSize === 'extralarge'
                  ? 'Extra Large (20px) - Click for Standard (16px)'
                  : 'Standard (16px) - Click for One Size Bigger (18px)'
              }`}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide border transition-all flex items-center gap-1.5 cursor-pointer ${
                fontSize === 'larger' || fontSize === 'extralarge'
                  ? 'bg-amber-500/15 border-amber-500/40 text-amber-500 dark:text-amber-300 font-bold'
                  : isDarkMode
                  ? 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-200'
                  : 'bg-stone-100 hover:bg-stone-200 border-stone-300 text-stone-800'
              }`}
            >
              <Type className="w-3.5 h-3.5" />
              <span className="font-mono text-xs">
                {fontSize === 'extralarge' ? 'Text: XL' : fontSize === 'larger' ? 'Text: +1' : 'Text: 1x'}
              </span>
            </button>
          )}

          {/* Dark / Light Toggle */}
          <button
            id="theme-mode-toggle"
            onClick={onToggleDarkMode}
            title={isDarkMode ? 'Switch to Solar Light Mode' : 'Switch to Lunar Dark Mode'}
            className={`p-2 rounded-lg border transition-all cursor-pointer ${
              isDarkMode
                ? 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-amber-300'
                : 'bg-stone-100 hover:bg-stone-200 border-stone-300 text-slate-700'
            }`}
          >
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* QR Code trigger */}
          <button
            id="open-qr-button"
            onClick={onOpenQR}
            title="Generate QR Code for Mobile Outdoor Sync"
            className={`p-2 rounded-lg border transition-all cursor-pointer ${
              isDarkMode
                ? 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
                : 'bg-stone-100 hover:bg-stone-200 border-stone-300 text-stone-700 hover:text-stone-900'
            }`}
          >
            <QrCode className="w-4 h-4" />
          </button>

          {/* Explanations Guide trigger */}
          <button
            id="open-guide-button"
            onClick={onOpenGuide}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all flex items-center gap-1.5 cursor-pointer ${
              isDarkMode
                ? 'bg-indigo-950/60 hover:bg-indigo-900/80 border-indigo-800 text-indigo-300'
                : 'bg-amber-100/70 hover:bg-amber-100 border-amber-300 text-amber-900'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Panel Guide</span>
          </button>

          {/* Medical Disclaimer & Regulatory trigger */}
          {onOpenDisclaimer && (
            <button
              id="open-disclaimer-button"
              onClick={onOpenDisclaimer}
              title="Medical Disclaimer & Regulatory Compliance"
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-medium border transition-all flex items-center gap-1.5 cursor-pointer ${
                isDarkMode
                  ? 'bg-rose-950/50 hover:bg-rose-900/70 border-rose-800/80 text-rose-300'
                  : 'bg-rose-50 hover:bg-rose-100 border-rose-200 text-rose-800'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
              <span className="hidden md:inline">Rx Notice</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
