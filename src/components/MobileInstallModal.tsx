import React, { useState } from 'react';
import {
  X,
  Smartphone,
  Apple,
  Share2,
  PlusSquare,
  Compass,
  Download,
  CheckCircle,
  ExternalLink,
  QrCode,
} from 'lucide-react';

interface MobileInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  onOpenQR: () => void;
}

export const MobileInstallModal: React.FC<MobileInstallModalProps> = ({
  isOpen,
  onClose,
  isDarkMode,
  onOpenQR,
}) => {
  const [activePlatform, setActivePlatform] = useState<'apple' | 'android'>('apple');

  if (!isOpen) return null;

  return (
    <div
      id="mobile-install-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs transition-opacity"
      onClick={onClose}
    >
      <div
        id="mobile-install-modal-content"
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-lg rounded-2xl border p-5 sm:p-6 shadow-2xl relative transition-all ${
          isDarkMode
            ? 'bg-slate-900 border-slate-700 text-slate-100'
            : 'bg-white border-stone-200 text-stone-900'
        }`}
      >
        <button
          id="close-mobile-install-modal-btn"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-stone-400 hover:text-stone-200 hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-lg leading-tight">
              Install on Apple iOS &amp; Android
            </h3>
            <p className="text-xs text-stone-400">
              Run Solunar Metabolics as a full-screen standalone application
            </p>
          </div>
        </div>

        {/* Platform Selector Switch */}
        <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-slate-950/60 border border-slate-800 mb-3">
          <button
            type="button"
            onClick={() => setActivePlatform('apple')}
            className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activePlatform === 'apple'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Apple className="w-4 h-4" />
            <span>Apple iPhone (iOS)</span>
          </button>
          <button
            type="button"
            onClick={() => setActivePlatform('android')}
            className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activePlatform === 'android'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>Android (Chrome)</span>
          </button>
        </div>

        {/* Note on Public Shared Link */}
        <div className="mb-4 px-3.5 py-2 rounded-xl border border-indigo-500/25 bg-indigo-500/10 text-[11px] text-slate-300 leading-relaxed">
          <span className="font-semibold text-indigo-400">Tester Sharing Tip:</span> If a phone displays "Page Not Found", make sure to click the <strong>Share</strong> button in the top toolbar of Google AI Studio and set access to <em>"Anyone with the link"</em>.
        </div>

        {/* Apple iOS Instructions */}
        {activePlatform === 'apple' && (
          <div className="space-y-3.5 text-xs">
            <div
              className={`p-3.5 rounded-xl border ${
                isDarkMode ? 'bg-slate-950/70 border-slate-800' : 'bg-stone-50 border-stone-200'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 shrink-0 font-mono font-bold text-sm">
                  1
                </div>
                <div>
                  <h4 className="font-semibold text-sm mb-0.5 flex items-center gap-1.5">
                    <span>Open in Safari</span>
                    <Compass className="w-3.5 h-3.5 text-indigo-400" />
                  </h4>
                  <p className="text-stone-400 leading-relaxed">
                    Open the live URL on your iPhone in <strong>Safari</strong> (or scan the outdoor QR code from your camera).
                  </p>
                </div>
              </div>
            </div>

            <div
              className={`p-3.5 rounded-xl border ${
                isDarkMode ? 'bg-slate-950/70 border-slate-800' : 'bg-stone-50 border-stone-200'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 shrink-0 font-mono font-bold text-sm">
                  2
                </div>
                <div>
                  <h4 className="font-semibold text-sm mb-0.5 flex items-center gap-1.5">
                    <span>Tap Share Button</span>
                    <Share2 className="w-3.5 h-3.5 text-sky-400" />
                  </h4>
                  <p className="text-stone-400 leading-relaxed">
                    Tap the <strong>Share</strong> icon (the square with an arrow pointing upward) located at the bottom toolbar of Safari.
                  </p>
                </div>
              </div>
            </div>

            <div
              className={`p-3.5 rounded-xl border ${
                isDarkMode ? 'bg-slate-950/70 border-slate-800' : 'bg-stone-50 border-stone-200'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 shrink-0 font-mono font-bold text-sm">
                  3
                </div>
                <div>
                  <h4 className="font-semibold text-sm mb-0.5 flex items-center gap-1.5">
                    <span>Add to Home Screen</span>
                    <PlusSquare className="w-3.5 h-3.5 text-emerald-400" />
                  </h4>
                  <p className="text-stone-400 leading-relaxed">
                    Scroll down and tap <strong>"Add to Home Screen"</strong>, then confirm by tapping <strong>"Add"</strong>. Solunar Metabolics will launch instantly as a native full-screen app.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Android Instructions */}
        {activePlatform === 'android' && (
          <div className="space-y-3.5 text-xs">
            <div
              className={`p-3.5 rounded-xl border ${
                isDarkMode ? 'bg-slate-950/70 border-slate-800' : 'bg-stone-50 border-stone-200'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0 font-mono font-bold text-sm">
                  1
                </div>
                <div>
                  <h4 className="font-semibold text-sm mb-0.5">Open in Google Chrome</h4>
                  <p className="text-stone-400 leading-relaxed">
                    Open the application URL in <strong>Chrome</strong> for Android.
                  </p>
                </div>
              </div>
            </div>

            <div
              className={`p-3.5 rounded-xl border ${
                isDarkMode ? 'bg-slate-950/70 border-slate-800' : 'bg-stone-50 border-stone-200'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0 font-mono font-bold text-sm">
                  2
                </div>
                <div>
                  <h4 className="font-semibold text-sm mb-0.5">Install App Prompt or Menu</h4>
                  <p className="text-stone-400 leading-relaxed">
                    Tap the <strong>"Install App"</strong> banner at the bottom or tap Chrome's three dots menu (<strong>⋮</strong>) in the upper-right corner.
                  </p>
                </div>
              </div>
            </div>

            <div
              className={`p-3.5 rounded-xl border ${
                isDarkMode ? 'bg-slate-950/70 border-slate-800' : 'bg-stone-50 border-stone-200'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0 font-mono font-bold text-sm">
                  3
                </div>
                <div>
                  <h4 className="font-semibold text-sm mb-0.5 flex items-center gap-1.5">
                    <span>Tap "Install" / "Add to Home screen"</span>
                    <Download className="w-3.5 h-3.5 text-emerald-400" />
                  </h4>
                  <p className="text-stone-400 leading-relaxed">
                    Select <strong>"Install"</strong>. The app icon will be pinned to your home screen and app drawer with standalone viewport.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer Actions: Scan QR code or Dismiss */}
        <div className="mt-6 pt-4 border-t border-stone-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenQR();
            }}
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <QrCode className="w-4 h-4 text-indigo-400" />
            <span>Scan QR on Mobile Phone</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs transition-all cursor-pointer shadow-xs"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};
