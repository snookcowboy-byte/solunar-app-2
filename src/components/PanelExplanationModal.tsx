import React from 'react';
import { X, MapPin, Scale, Sparkles, Utensils, Waves, Orbit, BookOpen } from 'lucide-react';

interface PanelExplanationModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
}

export const PanelExplanationModal: React.FC<PanelExplanationModalProps> = ({
  isOpen,
  onClose,
  isDarkMode,
}) => {
  if (!isOpen) return null;

  const panels = [
    {
      title: '1. Location & Circadian Synchronization Panel',
      icon: MapPin,
      color: 'text-sky-400',
      description:
        'Resolves your terrestrial coordinates (via privacy-preserving ZIP code or City geocoding). Local latitude and longitude dictate your exact solar zenith, sunrise, solar noon, and sunset. The body uses these solar milestones to synchronize internal peripheral circadian clocks in the liver, pancreas, and muscle tissues.',
    },
    {
      title: '2. Body Composition & Basal Metabolics Panel',
      icon: Scale,
      color: 'text-amber-400',
      description:
        'Calculates clinical Body Mass Index (BMI), Basal Metabolic Rate (BMR via Mifflin-St Jeor), and Total Daily Energy Expenditure (TDEE). Crucially, the engine applies solunar metabolic shifts: a +5% caloric allowance during Full Moon gravitational and nervous system peaks, and restorative glycemic stability targets during the New Moon.',
    },
    {
      title: '3. Solunar Ephemeris & Hormonal Axis Panel',
      icon: Sparkles,
      color: 'text-indigo-400',
      description:
        'Tracks real-time solar elevation, azimuth, and lunar luminosity (illumination %). Formulates Photobiological Melatonin Suppression (driven by retinal ganglion ipRGC cells responding to blue daylight wavelengths) and Cortisol Production (tracking the morning Cortisol Awakening Response [CAR] and nocturnal descent).',
    },
    {
      title: '4. Celestial Dietary Phasing & Intake Log Panel',
      icon: Utensils,
      color: 'text-emerald-400',
      description:
        'Translates lunar synodic cycles into targeted nutritional directives: (a) New Moon Phase requires Long-Chain Carbohydrates (sweet potatoes, legumes, oats) to replenish glycogen, stabilize blood sugar, and synthesize nocturnal serotonin/melatonin; (b) Full Moon Phase requires Structural Proteins and Healthy Lipids (wild fish, eggs, avocado, olive oil) to provide amino acids and essential fats for cellular repair and neurotransmitter modulation under peak gravitational tidal pull.',
    },
    {
      title: '5. Harmonic Tidal Ephemeris & Waveform Panel',
      icon: Waves,
      color: 'text-cyan-400',
      description:
        'Simulates ocean and biological tidal oscillations using the principal lunar semi-diurnal constituent (M2 tide, 12.42-hour harmonic periodicity). Demonstrates Syzygy amplification (Spring tides during New and Full Moons when solar and lunar vectors align) versus Quadrature dampening (Neap tides during quarter moons), providing insight into body water retention and extracellular fluid shifts.',
    },
    {
      title: '6. 365-Day Solar & Lunar Seasonal Orbit Visualizer',
      icon: Orbit,
      color: 'text-orange-400',
      description:
        'Maps annual seasonal shifts based on the Earth’s 23.44° axial tilt. Traces the solar declination sine wave across the Spring Equinox, Summer Solstice, Autumn Equinox, and Winter Solstice alongside the 12.37 lunar synodic cycles, enabling you to track changing daylight photoperiods and macro-seasonal metabolic setpoints.',
    },
  ];

  return (
    <div
      id="panel-explanation-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs transition-opacity"
      onClick={onClose}
    >
      <div
        id="panel-explanation-modal-content"
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl border p-6 shadow-2xl relative transition-all ${
          isDarkMode
            ? 'bg-slate-900 border-slate-700 text-slate-100'
            : 'bg-white border-stone-200 text-stone-900'
        }`}
      >
        <button
          id="close-explanation-modal-btn"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-stone-400 hover:text-stone-200 hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5 mb-5">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-xl leading-tight">
              Solunar Metabolics &bull; Scientific Architecture Guide
            </h3>
            <p className="text-xs text-stone-400">
              Detailed physiological &amp; astronomical explanation of each module
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {panels.map((p, idx) => {
            const Icon = p.icon;
            return (
              <div
                key={idx}
                className={`p-4 rounded-xl border ${
                  isDarkMode ? 'bg-slate-950/70 border-slate-800' : 'bg-stone-50 border-stone-200'
                }`}
              >
                <div className="flex items-center gap-2.5 mb-2">
                  <Icon className={`w-4 h-4 ${p.color}`} />
                  <h4 className="font-semibold text-sm font-serif">{p.title}</h4>
                </div>
                <p className="text-xs leading-relaxed text-stone-400">
                  {p.description}
                </p>
              </div>
            );
          })}
        </div>

        <div className="mt-6 pt-4 border-t border-stone-200 dark:border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-medium text-xs transition-all cursor-pointer shadow-xs"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
