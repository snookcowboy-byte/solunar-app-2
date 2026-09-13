import React, { useState, useEffect } from 'react';
import { X, ShieldAlert, AlertTriangle, HeartPulse, CheckCircle2, Stethoscope, Scale, FileText, ExternalLink } from 'lucide-react';

interface MedicalDisclaimerModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
}

export const MedicalDisclaimerModal: React.FC<MedicalDisclaimerModalProps> = ({
  isOpen,
  onClose,
  isDarkMode,
}) => {
  const [hasAcknowledged, setHasAcknowledged] = useState<boolean>(false);

  useEffect(() => {
    try {
      const ack = localStorage.getItem('solunar_medical_disclaimer_ack');
      if (ack === 'true') {
        setHasAcknowledged(true);
      }
    } catch {
      // localStorage may fail in private mode
    }
  }, [isOpen]);

  const handleAcknowledge = () => {
    try {
      localStorage.setItem('solunar_medical_disclaimer_ack', 'true');
    } catch {
      // ignore
    }
    setHasAcknowledged(true);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      id="medical-disclaimer-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs transition-opacity"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="medical-disclaimer-title"
    >
      <div
        id="medical-disclaimer-modal-content"
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-2xl max-h-[88vh] flex flex-col rounded-2xl border shadow-2xl relative transition-all overflow-hidden ${
          isDarkMode
            ? 'bg-slate-900 border-slate-700 text-slate-100'
            : 'bg-white border-stone-200 text-stone-900'
        }`}
      >
        {/* Header */}
        <div
          className={`p-5 sm:p-6 border-b flex items-start justify-between gap-4 ${
            isDarkMode ? 'border-slate-800 bg-slate-950/50' : 'border-stone-200 bg-amber-50/50'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`p-2.5 rounded-xl border flex items-center justify-center ${
                isDarkMode
                  ? 'bg-rose-950/60 border-rose-800/80 text-rose-400'
                  : 'bg-rose-100 border-rose-300 text-rose-700'
              }`}
            >
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h2
                id="medical-disclaimer-title"
                className="font-serif font-bold text-lg sm:text-xl leading-snug flex items-center gap-2"
              >
                Medical Disclaimer &amp; Regulatory Notice
              </h2>
              <p
                className={`text-xs mt-0.5 ${
                  isDarkMode ? 'text-slate-400' : 'text-stone-500'
                }`}
              >
                Apple App Store (Guideline 1.4.1) &bull; Google Play Health Policy Compliant
              </p>
            </div>
          </div>
          <button
            id="close-medical-disclaimer-btn"
            onClick={onClose}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              isDarkMode
                ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                : 'text-stone-400 hover:text-stone-900 hover:bg-stone-100'
            }`}
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-5 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto text-xs sm:text-sm leading-relaxed">
          {/* Prominent Callout Banner */}
          <div
            className={`p-4 rounded-xl border flex items-start gap-3 ${
              isDarkMode
                ? 'bg-rose-950/30 border-rose-900/60 text-rose-200'
                : 'bg-rose-50 border-rose-200 text-rose-900'
            }`}
          >
            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-rose-500" />
            <div>
              <span className="font-bold text-xs uppercase tracking-wide block mb-1">
                Mandatory Health Warning
              </span>
              <p className="text-xs sm:text-sm font-medium">
                Solunar Metabolics is designed solely for informational, lifestyle, and educational purposes.
                It does <strong>not</strong> provide medical diagnosis, treatment, prescription, or clinical advice.
                Always consult a licensed physician before starting any diet, fasting protocol, or physical regimen.
              </p>
            </div>
          </div>

          {/* Section 1: Informational & Educational Scope */}
          <div
            className={`p-4 rounded-xl border ${
              isDarkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-stone-50 border-stone-200'
            }`}
          >
            <div className="flex items-center gap-2 mb-1.5">
              <FileText className="w-4 h-4 text-indigo-400" />
              <h3 className="font-semibold text-xs sm:text-sm font-serif">
                1. Educational and Chronobiological Modeling Only
              </h3>
            </div>
            <p className={isDarkMode ? 'text-slate-300' : 'text-stone-600'}>
              All algorithms, charts, solunar curves, hormone indicators (e.g., melatonin suppression and cortisol
              curves), and meal macro recommendations generated by Solunar Metabolics are derived from
              theoretical mathematical models, astronomical ephemeris (solar zenith, lunar synodic cycles, M2 tide
              harmonics), and published chronobiological research. They are intended solely for exploration of circadian
              rhythms and nutritional timing.
            </p>
          </div>

          {/* Section 2: No Doctor-Patient Relationship */}
          <div
            className={`p-4 rounded-xl border ${
              isDarkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-stone-50 border-stone-200'
            }`}
          >
            <div className="flex items-center gap-2 mb-1.5">
              <Stethoscope className="w-4 h-4 text-emerald-400" />
              <h3 className="font-semibold text-xs sm:text-sm font-serif">
                2. No Doctor-Patient Relationship or Clinical Practice
              </h3>
            </div>
            <p className={isDarkMode ? 'text-slate-300' : 'text-stone-600'}>
              The use of this application does not establish a doctor-patient, dietitian-client, or other healthcare
              professional relationship. The contents of this application should never be used as a substitute for
              the direct advice, diagnosis, or treatment of a qualified medical practitioner. Never disregard
              professional medical advice or delay seeking it because of something you have read or calculated in
              this software.
            </p>
          </div>

          {/* Section 3: High-Risk Conditions & Consultation Mandate */}
          <div
            className={`p-4 rounded-xl border ${
              isDarkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-stone-50 border-stone-200'
            }`}
          >
            <div className="flex items-center gap-2 mb-1.5">
              <HeartPulse className="w-4 h-4 text-amber-400" />
              <h3 className="font-semibold text-xs sm:text-sm font-serif">
                3. High-Risk Individuals &amp; Contraindications
              </h3>
            </div>
            <p className={isDarkMode ? 'text-slate-300' : 'text-stone-600'}>
              Modifications to caloric intake, intermittent fasting schedules, carbohydrate or lipid phasing, and
              electrolyte or fluid intake can present serious health risks, particularly for individuals who are
              pregnant or nursing, individuals with type 1 or type 2 diabetes, hypoglycemia, cardiovascular diseases,
              kidney disorders, metabolic conditions, history of eating disorders, or those taking prescription
              medications. Consult your primary healthcare provider before undertaking any dietary changes.
            </p>
          </div>

          {/* Section 4: Emergency Guidance */}
          <div
            className={`p-4 rounded-xl border ${
              isDarkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-stone-50 border-stone-200'
            }`}
          >
            <div className="flex items-center gap-2 mb-1.5">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <h3 className="font-semibold text-xs sm:text-sm font-serif">
                4. Medical Emergencies
              </h3>
            </div>
            <p className={isDarkMode ? 'text-slate-300' : 'text-stone-600'}>
              If you think you may have a medical emergency, acute chest discomfort, shortness of breath, severe
              hypoglycemic shock, fainting, or allergic reaction, immediately call your local emergency services (such as
              911 in the United States, 112 in Europe, or 999 in the UK) or go to the nearest emergency room.
            </p>
          </div>
        </div>

        {/* Footer & Acknowledgment Action */}
        <div
          className={`p-4 sm:p-5 border-t flex flex-col sm:flex-row items-center justify-between gap-3 ${
            isDarkMode ? 'border-slate-800 bg-slate-950/70' : 'border-stone-200 bg-stone-50'
          }`}
        >
          <div className="flex items-center gap-2 text-xs">
            {hasAcknowledged ? (
              <span className="flex items-center gap-1.5 text-emerald-500 font-medium">
                <CheckCircle2 className="w-4 h-4" />
                Acknowledged by user
              </span>
            ) : (
              <span className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-stone-500'}`}>
                Please review and acknowledge before use.
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-medium border transition-colors cursor-pointer ${
                isDarkMode
                  ? 'border-slate-700 hover:bg-slate-800 text-slate-300'
                  : 'border-stone-300 hover:bg-stone-200 text-stone-700'
              }`}
            >
              Close
            </button>
            <button
              type="button"
              id="acknowledge-disclaimer-btn"
              onClick={handleAcknowledge}
              className="flex-1 sm:flex-initial px-5 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-semibold text-xs transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>I Understand &amp; Acknowledge</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
