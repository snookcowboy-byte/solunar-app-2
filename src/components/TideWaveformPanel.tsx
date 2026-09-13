import React, { useState } from 'react';
import { TideData, UnitSystem } from '../types';
import {
  Waves,
  ArrowUpRight,
  ArrowDownRight,
  Compass,
  Droplet,
  RefreshCw,
  Sliders,
  CheckCircle2,
  Anchor,
  Radio,
} from 'lucide-react';
import { NOAA_STATIONS, NOAAStation } from '../services/noaaTideService';

interface TideWaveformPanelProps {
  tideData: TideData;
  unitSystem: UnitSystem;
  isDarkMode: boolean;
  isLoadingNoaa?: boolean;
  onRefresh?: () => void;
  onAdjustOffset?: (delta: number) => void;
  onSetExactHeight?: (target: number) => void;
  onResetOffset?: () => void;
  onSelectStation?: (stationId: string) => void;
  selectedStationId?: string | null;
  currentTime?: Date;
}

export const TideWaveformPanel: React.FC<TideWaveformPanelProps> = ({
  tideData,
  unitSystem,
  isDarkMode,
  isLoadingNoaa = false,
  onRefresh,
  onAdjustOffset,
  onSetExactHeight,
  onResetOffset,
  onSelectStation,
  selectedStationId,
  currentTime,
}) => {
  const [hoveredPoint, setHoveredPoint] = useState<(typeof tideData.hourlyWavePoints)[0] | null>(null);
  const [showCalibration, setShowCalibration] = useState<boolean>(false);
  const [customCalibrateInput, setCustomCalibrateInput] = useState<string>('1.5');

  // SVG dimensions
  const svgWidth = 720;
  const svgHeight = 180;
  const paddingX = 42;
  const paddingY = 24;

  const points = tideData.hourlyWavePoints && tideData.hourlyWavePoints.length > 0
    ? tideData.hourlyWavePoints
    : [{ hour: 0, timeLabel: '12 AM', height: 1.0, isPast: false }];

  const heights = points.map((p) => p.height);
  const minRaw = Math.min(...heights);
  const maxRaw = Math.max(...heights);

  // Sensible vertical bounds with padding
  const minH = Math.min(0, Math.floor(minRaw * 10) / 10);
  const maxH = Math.max(minH + 1.2, Math.ceil(maxRaw * 10) / 10 + 0.3);
  const rangeH = maxH - minH || 1;

  // Convert (hour: 0..24, height: minH..maxH) to SVG coords
  const getSvgCoords = (hour: number, height: number) => {
    const x = paddingX + (hour / 24) * (svgWidth - 2 * paddingX);
    const normalizedY = (height - minH) / rangeH;
    const y = svgHeight - paddingY - normalizedY * (svgHeight - 2 * paddingY);
    return { x, y };
  };

  // Build SVG smooth path
  const pathD = points.reduce((acc, pt, index) => {
    const { x, y } = getSvgCoords(pt.hour, pt.height);
    if (index === 0) return `M ${x} ${y}`;
    return `${acc} L ${x} ${y}`;
  }, '');

  // Fill area under curve
  const areaD = `${pathD} L ${svgWidth - paddingX} ${svgHeight - paddingY} L ${paddingX} ${svgHeight - paddingY} Z`;

  // Current time position
  const activeNow = currentTime || new Date();
  const currentHourFloat = activeNow.getHours() + activeNow.getMinutes() / 60;
  const currentCoords = getSvgCoords(currentHourFloat, tideData.currentHeight);

  // Relevant nearby stations for quick selection
  const relevantStations = NOAA_STATIONS.slice(0, 5);

  return (
    <div
      id="tidal-ephemeris-waveform-panel"
      className={`rounded-2xl border p-5 sm:p-6 transition-all duration-200 ${
        isDarkMode
          ? 'bg-slate-900/90 border-slate-800 text-slate-100 shadow-xl shadow-black/20'
          : 'bg-white border-stone-200 text-stone-900 shadow-md shadow-stone-200/50'
      }`}
    >
      {/* Header with Live Station Badge */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-2.5">
          <div
            className={`p-2.5 rounded-xl border ${
              isDarkMode ? 'bg-slate-800 border-slate-700 text-cyan-400' : 'bg-cyan-50 border-cyan-200 text-cyan-700'
            }`}
          >
            <Waves className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-serif font-bold text-lg leading-tight">Harmonic Tidal Ephemeris</h2>
              {tideData.source?.includes('NOAA') && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  NOAA Real-Time
                </span>
              )}
            </div>
            <p className={`text-xs mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-stone-500'}`}>
              {tideData.stationName || 'Regional Astronomic Harmonic Oscillator'} ({tideData.unit})
            </p>
          </div>
        </div>

        {/* Controls: Refresh, Station Selector & Calibration Toggle */}
        <div className="flex items-center gap-2 flex-wrap">
          {onSelectStation && (
            <div className="flex items-center gap-1.5">
              <label htmlFor="tide-station-select" className="sr-only">
                Tide Station
              </label>
              <select
                id="tide-station-select"
                value={selectedStationId || tideData.stationId || '8725520'}
                onChange={(e) => onSelectStation(e.target.value)}
                className={`text-xs font-mono py-1 px-2.5 rounded-lg border cursor-pointer transition-colors ${
                  isDarkMode
                    ? 'bg-slate-950 border-slate-700 text-slate-200 hover:border-cyan-700'
                    : 'bg-stone-50 border-stone-300 text-stone-800 hover:border-cyan-400'
                }`}
              >
                <option value="8725520">NOAA 8725520 – Fort Myers (River)</option>
                <option value="8725110">NOAA 8725110 – Fort Myers Beach</option>
                <option value="8725577">NOAA 8725577 – Cape Coral Bridge</option>
                <option value="8726520">NOAA 8726520 – St. Petersburg, FL</option>
                <option value="harmonic">Astronomical Harmonic Model</option>
              </select>
            </div>
          )}

          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              disabled={isLoadingNoaa}
              className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 transition-colors cursor-pointer ${
                isDarkMode
                  ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                  : 'bg-stone-100 border-stone-300 text-stone-700 hover:bg-stone-200'
              }`}
              title="Refresh NOAA tide predictions"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingNoaa ? 'animate-spin text-cyan-400' : ''}`} />
            </button>
          )}

          <button
            type="button"
            onClick={() => setShowCalibration(!showCalibration)}
            className={`px-2.5 py-1 rounded-lg border text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer ${
              showCalibration || (tideData.manualOffset && tideData.manualOffset !== 0)
                ? 'bg-amber-500/15 border-amber-500/40 text-amber-600 dark:text-amber-400 font-semibold'
                : isDarkMode
                ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                : 'bg-stone-100 border-stone-300 text-stone-700 hover:bg-stone-200'
            }`}
            title="Calibrate or fine-tune tide height"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Calibrate</span>
          </button>
        </div>
      </div>

      {/* Calibration Subpanel */}
      {showCalibration && (
        <div
          className={`mb-5 p-3.5 rounded-xl border transition-all ${
            isDarkMode ? 'bg-slate-950 border-amber-500/30' : 'bg-amber-50/60 border-amber-200'
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                  Local River / Dock Gauge Calibration
                </span>
                {tideData.manualOffset && tideData.manualOffset !== 0 ? (
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-500">
                    Active Offset: {tideData.manualOffset > 0 ? `+${tideData.manualOffset}` : tideData.manualOffset}{' '}
                    {tideData.unit}
                  </span>
                ) : null}
              </div>
              <p className={`text-[11px] ${isDarkMode ? 'text-slate-400' : 'text-stone-600'}`}>
                Fine-tune tide readings to match your local dock marker, river surge, or exact NOAA gauge reading.
              </p>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              {onAdjustOffset && (
                <>
                  <button
                    type="button"
                    onClick={() => onAdjustOffset(-0.2)}
                    className="px-2 py-1 text-xs font-mono rounded border bg-white dark:bg-slate-900 border-stone-300 dark:border-slate-700 hover:border-amber-500 cursor-pointer"
                  >
                    -0.2
                  </button>
                  <button
                    type="button"
                    onClick={() => onAdjustOffset(-0.1)}
                    className="px-2 py-1 text-xs font-mono rounded border bg-white dark:bg-slate-900 border-stone-300 dark:border-slate-700 hover:border-amber-500 cursor-pointer"
                  >
                    -0.1
                  </button>
                  <button
                    type="button"
                    onClick={() => onAdjustOffset(0.1)}
                    className="px-2 py-1 text-xs font-mono rounded border bg-white dark:bg-slate-900 border-stone-300 dark:border-slate-700 hover:border-amber-500 cursor-pointer"
                  >
                    +0.1
                  </button>
                  <button
                    type="button"
                    onClick={() => onAdjustOffset(0.2)}
                    className="px-2 py-1 text-xs font-mono rounded border bg-white dark:bg-slate-900 border-stone-300 dark:border-slate-700 hover:border-amber-500 cursor-pointer"
                  >
                    +0.2
                  </button>
                </>
              )}

              {onSetExactHeight && (
                <button
                  type="button"
                  onClick={() => onSetExactHeight(1.5)}
                  className="px-2.5 py-1 text-xs font-mono font-bold rounded border bg-cyan-500/20 border-cyan-500/40 text-cyan-600 dark:text-cyan-300 hover:bg-cyan-500/30 cursor-pointer"
                  title="Calibrate to exactly 1.5 ft (Fort Myers Incoming Tide)"
                >
                  Set to 1.5 ft
                </button>
              )}

              {onResetOffset && tideData.manualOffset !== 0 && (
                <button
                  type="button"
                  onClick={onResetOffset}
                  className="px-2 py-1 text-xs font-mono rounded border bg-rose-500/10 border-rose-500/30 text-rose-500 hover:bg-rose-500/20 cursor-pointer"
                >
                  Reset
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {/* Current Water Height */}
        <div
          className={`p-3.5 rounded-xl border ${
            isDarkMode ? 'bg-slate-950/80 border-slate-800' : 'bg-stone-50 border-stone-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-[10px] uppercase font-mono tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-stone-500'}`}>
              Current Water Level
            </span>
            <Droplet className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-mono font-bold mt-1 text-cyan-500">
            {tideData.currentHeight > 0 ? `+${tideData.currentHeight.toFixed(2)}` : tideData.currentHeight.toFixed(2)}{' '}
            <span className="text-xs font-sans font-normal text-stone-400">{tideData.unit}</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-cyan-500 mt-1 font-medium">
            {tideData.isRising ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
            <span>{tideData.isRising ? 'Rising (Incoming Flood)' : 'Falling (Ebb Tide)'}</span>
          </div>
        </div>

        {/* Next Tidal Event */}
        <div
          className={`p-3.5 rounded-xl border ${
            isDarkMode ? 'bg-slate-950/80 border-slate-800' : 'bg-stone-50 border-stone-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-[10px] uppercase font-mono tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-stone-500'}`}>
              Next Milestone
            </span>
            <Compass className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-xl font-mono font-bold mt-1 text-sky-400">
            {tideData.nextEventType}
          </div>
          <div className="text-[11px] text-stone-400 mt-1 leading-tight">
            {tideData.nextEventTime}
          </div>
        </div>

        {/* Time Remaining */}
        <div
          className={`p-3.5 rounded-xl border ${
            isDarkMode ? 'bg-slate-950/80 border-slate-800' : 'bg-stone-50 border-stone-200'
          }`}
        >
          <span className={`text-[10px] uppercase font-mono tracking-wider block ${isDarkMode ? 'text-slate-400' : 'text-stone-500'}`}>
            Time to Peak / Low
          </span>
          <div className="text-xl font-mono font-bold mt-1">
            {Math.floor(tideData.minutesToNextEvent / 60)}h {tideData.minutesToNextEvent % 60}m
          </div>
          <div className="text-[11px] text-stone-400 mt-1">
            Incoming water phase
          </div>
        </div>

        {/* Basin & Amplitude Regime */}
        <div
          className={`p-3.5 rounded-xl border ${
            isDarkMode ? 'bg-slate-950/80 border-slate-800' : 'bg-stone-50 border-stone-200'
          }`}
        >
          <span className={`text-[10px] uppercase font-mono tracking-wider block ${isDarkMode ? 'text-slate-400' : 'text-stone-500'}`}>
            Tidal Basin Regime
          </span>
          <div className="text-base font-semibold mt-1 truncate text-amber-500">
            Micro-Tidal (1.5 ft)
          </div>
          <div className="text-[11px] text-stone-400 mt-1 truncate">
            Gulf Coast MLLW Datum
          </div>
        </div>
      </div>

      {/* SVG Waveform Graphic */}
      <div
        className={`p-4 rounded-xl border relative overflow-hidden ${
          isDarkMode ? 'bg-slate-950/90 border-slate-800' : 'bg-stone-50 border-stone-200'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
          <span className="text-[11px] font-mono text-stone-400 uppercase tracking-wider">
            24-Hour Tidal Hydrograph &amp; Water Level Curve
          </span>
          <span className="text-[11px] font-mono text-cyan-400 font-semibold">
            {hoveredPoint
              ? `${hoveredPoint.timeLabel}: ${hoveredPoint.height > 0 ? '+' : ''}${hoveredPoint.height.toFixed(2)} ${tideData.unit}`
              : `Current (${activeNow.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}): ${tideData.currentHeight > 0 ? '+' : ''}${tideData.currentHeight.toFixed(2)} ${tideData.unit}`}
          </span>
        </div>

        {/* Responsive SVG Container */}
        <div className="w-full overflow-x-auto">
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="w-full h-44 select-none"
            onMouseLeave={() => setHoveredPoint(null)}
          >
            <defs>
              <linearGradient id="tideGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.45" />
                <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.02" />
              </linearGradient>
            </defs>

            {/* Zero water line (MLLW datum) */}
            {(() => {
              const zeroCoords = getSvgCoords(0, 0);
              return (
                <g>
                  <line
                    x1={paddingX}
                    y1={zeroCoords.y}
                    x2={svgWidth - paddingX}
                    y2={zeroCoords.y}
                    stroke={isDarkMode ? '#334155' : '#cbd5e1'}
                    strokeDasharray="4 4"
                    strokeWidth="1"
                  />
                  <text
                    x={svgWidth - paddingX + 4}
                    y={zeroCoords.y + 3}
                    fill={isDarkMode ? '#64748b' : '#94a3b8'}
                    fontSize="9"
                    fontFamily="monospace"
                  >
                    0 MLLW
                  </text>
                </g>
              );
            })()}

            {/* 1.5 ft target incoming tide marker line */}
            {(() => {
              const targetCoords = getSvgCoords(0, 1.5);
              return (
                <g>
                  <line
                    x1={paddingX}
                    y1={targetCoords.y}
                    x2={svgWidth - paddingX}
                    y2={targetCoords.y}
                    stroke="#06b6d4"
                    strokeDasharray="2 3"
                    strokeOpacity="0.5"
                    strokeWidth="1"
                  />
                  <text
                    x={svgWidth - paddingX + 4}
                    y={targetCoords.y + 3}
                    fill="#06b6d4"
                    fontSize="9"
                    fontFamily="monospace"
                  >
                    1.5 ft High
                  </text>
                </g>
              );
            })()}

            {/* Wave area fill */}
            <path d={areaD} fill="url(#tideGradient)" />

            {/* Wave stroke */}
            <path
              d={pathD}
              fill="none"
              stroke="#06b6d4"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Hour marker lines and labels */}
            {[0, 4, 8, 12, 16, 20, 24].map((hr) => {
              const { x } = getSvgCoords(hr, 0);
              const label = hr === 0 ? '12 AM' : hr === 12 ? '12 PM' : hr === 24 ? '12 AM' : `${hr % 12} ${hr >= 12 ? 'PM' : 'AM'}`;
              return (
                <g key={hr}>
                  <line
                    x1={x}
                    y1={paddingY}
                    x2={x}
                    y2={svgHeight - paddingY}
                    stroke={isDarkMode ? '#1e293b' : '#e2e8f0'}
                    strokeWidth="1"
                  />
                  <text
                    x={x}
                    y={svgHeight - 6}
                    textAnchor="middle"
                    fill={isDarkMode ? '#64748b' : '#94a3b8'}
                    fontSize="10"
                    fontFamily="monospace"
                  >
                    {label}
                  </text>
                </g>
              );
            })}

            {/* Height axis marks */}
            <text
              x={paddingX - 6}
              y={getSvgCoords(0, maxH).y + 3}
              textAnchor="end"
              fill={isDarkMode ? '#64748b' : '#94a3b8'}
              fontSize="9"
              fontFamily="monospace"
            >
              +{maxH.toFixed(1)}
            </text>
            <text
              x={paddingX - 6}
              y={getSvgCoords(0, 1.5).y + 3}
              textAnchor="end"
              fill="#06b6d4"
              fontSize="9"
              fontFamily="monospace"
              fontWeight="bold"
            >
              1.5
            </text>
            <text
              x={paddingX - 6}
              y={getSvgCoords(0, minH).y + 3}
              textAnchor="end"
              fill={isDarkMode ? '#64748b' : '#94a3b8'}
              fontSize="9"
              fontFamily="monospace"
            >
              {minH.toFixed(1)}
            </text>

            {/* Current Water Level Indicator */}
            <line
              x1={currentCoords.x}
              y1={paddingY}
              x2={currentCoords.x}
              y2={svgHeight - paddingY}
              stroke="#38bdf8"
              strokeWidth="1.5"
              strokeDasharray="3 3"
            />
            <circle
              cx={currentCoords.x}
              cy={currentCoords.y}
              r="5.5"
              fill="#0284c7"
              stroke="#e0f2fe"
              strokeWidth="2.5"
            />

            {/* Interactive hover points */}
            {points.map((pt, i) => {
              const { x, y } = getSvgCoords(pt.hour, pt.height);
              return (
                <circle
                  key={i}
                  cx={x}
                  cy={y}
                  r="7"
                  fill="transparent"
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredPoint(pt)}
                />
              );
            })}
          </svg>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mt-2 pt-2 border-t border-stone-200 dark:border-slate-800 text-[11px] text-stone-400">
          <span>
            {tideData.source || 'NOAA CO-OPS Tide Predictions'} • Datum: Mean Lower Low Water (MLLW)
          </span>
          <span className="text-cyan-500 dark:text-cyan-400 font-medium">
            Fort Myers Incoming Peak: ~1.54 ft
          </span>
        </div>
      </div>
    </div>
  );
};
