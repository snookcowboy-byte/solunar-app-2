import React, { useState } from 'react';
import { YearlySolarLunarData } from '../types';
import { generateYearlyTransitions, getDayOfYear } from '../services/solunarEngine';
import { Calendar, Sun, Moon, Sparkles, Orbit, Compass } from 'lucide-react';

interface YearlyOrbitGraphicProps {
  isDarkMode: boolean;
  currentTime?: Date;
}

export const YearlyOrbitGraphic: React.FC<YearlyOrbitGraphicProps> = ({ isDarkMode, currentTime }) => {
  const [data] = useState<YearlySolarLunarData[]>(() => generateYearlyTransitions(currentTime ? currentTime.getFullYear() : 2026));
  
  const todayDayOfYear = getDayOfYear(currentTime || new Date());
  const [selectedDay, setSelectedDay] = useState<number>(todayDayOfYear);

  React.useEffect(() => {
    if (currentTime) {
      setSelectedDay(getDayOfYear(currentTime));
    }
  }, [currentTime]);

  // Find active data point
  const activePoint =
    data.find((d) => Math.abs(d.dayOfYear - selectedDay) <= 2) ||
    data[Math.floor((selectedDay / 365) * data.length)] ||
    data[0];

  const svgWidth = 800;
  const svgHeight = 220;
  const paddingX = 40;
  const paddingY = 30;

  // Solar declination ranges from -23.44 to +23.44 degrees
  const minDecl = -24;
  const maxDecl = 24;

  const getSvgCoords = (dayOfYear: number, declDeg: number) => {
    const x = paddingX + ((dayOfYear - 1) / 365) * (svgWidth - 2 * paddingX);
    const normalizedY = (declDeg - minDecl) / (maxDecl - minDecl);
    const y = svgHeight - paddingY - normalizedY * (svgHeight - 2 * paddingY);
    return { x, y };
  };

  // Solar declination curve path
  const solarPathD = data.reduce((acc, pt, index) => {
    const { x, y } = getSvgCoords(pt.dayOfYear, pt.solarDeclinationDeg);
    if (index === 0) return `M ${x} ${y}`;
    return `${acc} L ${x} ${y}`;
  }, '');

  // Equator (0 deg declination) line
  const zeroCoords = getSvgCoords(1, 0);

  // Current active indicator coords
  const activeCoords = getSvgCoords(selectedDay, activePoint.solarDeclinationDeg);
  const todayCoords = getSvgCoords(todayDayOfYear, activePoint.solarDeclinationDeg);

  // Key astronomical seasonal events
  const seasonalEvents = [
    { day: 79, label: 'Spring Equinox', date: 'Mar 20', decl: 0, season: 'Spring' },
    { day: 172, label: 'Summer Solstice', date: 'Jun 21', decl: 23.44, season: 'Summer' },
    { day: 265, label: 'Autumn Equinox', date: 'Sep 22', decl: 0, season: 'Autumn' },
    { day: 355, label: 'Winter Solstice', date: 'Dec 21', decl: -23.44, season: 'Winter' },
  ];

  return (
    <div
      id="yearly-orbital-graphic-panel"
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
            <Orbit className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-serif font-bold text-lg leading-tight">
              365-Day Solar &amp; Lunar Seasonal Orbit Visualizer
            </h2>
            <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-stone-500'}`}>
              Annual solar declination (&plusmn;23.44&deg;), photoperiod shifts, and 12-cycle synodic transitions
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setSelectedDay(todayDayOfYear)}
          className={`px-3 py-1 rounded-full text-xs font-mono font-medium border flex items-center gap-1.5 transition-all cursor-pointer self-start sm:self-auto ${
            isDarkMode
              ? 'bg-amber-950/60 hover:bg-amber-900/80 border-amber-700 text-amber-300'
              : 'bg-amber-100 hover:bg-amber-200 border-amber-300 text-amber-950'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Jump to Today (Day {todayDayOfYear})</span>
        </button>
      </div>

      {/* Active Inspector Details Card */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        <div className={`p-3 rounded-xl border ${isDarkMode ? 'bg-slate-950/80 border-slate-800' : 'bg-stone-50 border-stone-200'}`}>
          <span className="text-[10px] font-mono uppercase text-stone-400">Day &amp; Calendar</span>
          <div className="font-mono font-bold text-base mt-0.5">
            Day {selectedDay} / 365
          </div>
          <div className="text-[11px] text-stone-400 mt-0.5">{activePoint.dateStr} &bull; {activePoint.season}</div>
        </div>

        <div className={`p-3 rounded-xl border ${isDarkMode ? 'bg-slate-950/80 border-slate-800' : 'bg-stone-50 border-stone-200'}`}>
          <span className="text-[10px] font-mono uppercase text-stone-400">Solar Declination</span>
          <div className="font-mono font-bold text-base mt-0.5 text-amber-500">
            {activePoint.solarDeclinationDeg > 0 ? `+${activePoint.solarDeclinationDeg}°` : `${activePoint.solarDeclinationDeg}°`}
          </div>
          <div className="text-[11px] text-stone-400 mt-0.5">
            {activePoint.solarDeclinationDeg > 0 ? 'Northern Solar Tilt' : 'Southern Solar Tilt'}
          </div>
        </div>

        <div className={`p-3 rounded-xl border ${isDarkMode ? 'bg-slate-950/80 border-slate-800' : 'bg-stone-50 border-stone-200'}`}>
          <span className="text-[10px] font-mono uppercase text-stone-400">Photoperiod (Mid-Lat)</span>
          <div className="font-mono font-bold text-base mt-0.5 text-sky-400">
            {activePoint.dayLengthHours} hours
          </div>
          <div className="text-[11px] text-stone-400 mt-0.5">Natural daylight window</div>
        </div>

        <div className={`p-3 rounded-xl border ${isDarkMode ? 'bg-slate-950/80 border-slate-800' : 'bg-stone-50 border-stone-200'}`}>
          <span className="text-[10px] font-mono uppercase text-stone-400">Lunar Synodic Phase</span>
          <div className="font-semibold text-xs mt-1 text-indigo-400 truncate">
            {activePoint.moonPhaseOnDay}
          </div>
          <div className="text-[11px] font-mono text-stone-400 mt-0.5">
            Cycle #{activePoint.lunarCycleIndex} of 12
          </div>
        </div>
      </div>

      {/* SVG 365-Day Solar Declination & Lunar Track Graphic */}
      <div
        className={`p-4 rounded-xl border relative overflow-hidden mb-4 ${
          isDarkMode ? 'bg-slate-950/90 border-slate-800' : 'bg-stone-50 border-stone-200'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-mono text-stone-400 uppercase tracking-wider">
            Earth Orbital Tilt &amp; 365-Day Solar Declination Arc
          </span>
          <span className="text-[11px] font-mono text-amber-500">
            Current Position: {activePoint.dateStr}
          </span>
        </div>

        <div className="w-full overflow-x-auto">
          <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-48 select-none">
            <defs>
              <linearGradient id="solarGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.1" />
              </linearGradient>
            </defs>

            {/* Seasonal sector backgrounds */}
            {seasonalEvents.map((evt, idx) => {
              const nextEvtDay = idx < 3 ? seasonalEvents[idx + 1].day : 365;
              const x1 = paddingX + ((evt.day - 1) / 365) * (svgWidth - 2 * paddingX);
              const x2 = paddingX + ((nextEvtDay - 1) / 365) * (svgWidth - 2 * paddingX);
              return (
                <g key={evt.label}>
                  <line
                    x1={x1}
                    y1={paddingY}
                    x2={x1}
                    y2={svgHeight - paddingY}
                    stroke={isDarkMode ? '#334155' : '#cbd5e1'}
                    strokeDasharray="3 3"
                    strokeWidth="1"
                  />
                  <text
                    x={x1 + 4}
                    y={paddingY + 12}
                    fill={isDarkMode ? '#94a3b8' : '#64748b'}
                    fontSize="9"
                    fontFamily="monospace"
                  >
                    {evt.label} ({evt.date})
                  </text>
                </g>
              );
            })}

            {/* Celestial Equator (0 deg declination) */}
            <line
              x1={paddingX}
              y1={zeroCoords.y}
              x2={svgWidth - paddingX}
              y2={zeroCoords.y}
              stroke={isDarkMode ? '#475569' : '#94a3b8'}
              strokeWidth="1.2"
              strokeDasharray="4 4"
            />
            <text
              x={paddingX - 6}
              y={zeroCoords.y + 3}
              textAnchor="end"
              fill={isDarkMode ? '#64748b' : '#94a3b8'}
              fontSize="9"
              fontFamily="monospace"
            >
              0° Equator
            </text>

            <text
              x={paddingX - 6}
              y={paddingY + 10}
              textAnchor="end"
              fill="#f59e0b"
              fontSize="9"
              fontFamily="monospace"
            >
              +23.4°
            </text>

            <text
              x={paddingX - 6}
              y={svgHeight - paddingY - 2}
              textAnchor="end"
              fill="#38bdf8"
              fontSize="9"
              fontFamily="monospace"
            >
              -23.4°
            </text>

            {/* Solar Declination Sine Curve */}
            <path
              d={solarPathD}
              fill="none"
              stroke="#f59e0b"
              strokeWidth="2.5"
              strokeLinecap="round"
            />

            {/* Month labels at bottom */}
            {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map(
              (month, mIdx) => {
                const day = mIdx * 30.4 + 15;
                const x = paddingX + (day / 365) * (svgWidth - 2 * paddingX);
                return (
                  <text
                    key={month}
                    x={x}
                    y={svgHeight - 8}
                    textAnchor="middle"
                    fill={isDarkMode ? '#64748b' : '#94a3b8'}
                    fontSize="10"
                    fontFamily="monospace"
                  >
                    {month}
                  </text>
                );
              }
            )}

            {/* Today's fixed marker */}
            <circle
              cx={todayCoords.x}
              cy={todayCoords.y}
              r="4"
              fill="#f43f5e"
              stroke="#fff"
              strokeWidth="1.5"
            />

            {/* User Selected Interactive Marker */}
            <line
              x1={activeCoords.x}
              y1={paddingY}
              x2={activeCoords.x}
              y2={svgHeight - paddingY}
              stroke="#f59e0b"
              strokeWidth="1.5"
              strokeDasharray="2 2"
            />
            <circle
              cx={activeCoords.x}
              cy={activeCoords.y}
              r="7"
              fill="#f59e0b"
              stroke="#ffffff"
              strokeWidth="2"
            />
          </svg>
        </div>

        {/* 365-Day Slider Scrubber */}
        <div className="mt-3">
          <div className="flex justify-between items-center text-[11px] font-mono text-stone-400 mb-1">
            <span>Drag / Scrub to monitor seasonal transitions:</span>
            <span className="font-bold text-amber-500">Day {selectedDay} (of 365)</span>
          </div>
          <input
            id="day-of-year-scrubber"
            type="range"
            min="1"
            max="365"
            value={selectedDay}
            onChange={(e) => setSelectedDay(parseInt(e.target.value))}
            className="w-full accent-amber-500 cursor-pointer h-2 bg-stone-200 dark:bg-slate-800 rounded-lg"
          />
        </div>

        <p className="text-[11px] text-stone-400 mt-3 leading-relaxed">
          The sun traverses between the Tropic of Cancer (+23.44°) and Tropic of Capricorn (-23.44°). Human metabolic set-points, thyroid hormone T3 conversion, and insulin sensitivity naturally modulate across this 365-day annual cycle.
        </p>
      </div>
    </div>
  );
};
