import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { X, Copy, Check, QrCode as QrIcon, Smartphone, Apple, ExternalLink, AlertCircle, Share2, Globe } from 'lucide-react';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  onOpenMobileInstall?: () => void;
}

export const QRCodeModal: React.FC<QRCodeModalProps> = ({
  isOpen,
  onClose,
  isDarkMode,
  onOpenMobileInstall,
}) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [selectedUrlType, setSelectedUrlType] = useState<'shared' | 'dev'>('shared');

  // Compute the appropriate URLs
  const currentBrowserUrl = typeof window !== 'undefined' ? window.location.href : '';
  
  // Calculate public shared URL (ais-pre-...)
  const sharedUrl = typeof window !== 'undefined'
    ? window.location.href.replace('ais-dev-', 'ais-pre-').split('?')[0]
    : 'https://ais-pre-as6onza75dw4452fx6hm2o-352361638736.us-west2.run.app';

  const devUrl = typeof window !== 'undefined'
    ? window.location.href.split('?')[0]
    : 'https://ais-dev-as6onza75dw4452fx6hm2o-352361638736.us-west2.run.app';

  const activeUrl = selectedUrlType === 'shared' ? sharedUrl : devUrl;

  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  useEffect(() => {
    if (isOpen && activeUrl) {
      QRCode.toDataURL(
        activeUrl,
        {
          width: 280,
          margin: 2,
          color: {
            dark: '#0f172a',
            light: '#ffffff',
          },
        },
        (err, url) => {
          if (!err && url) {
            setQrDataUrl(url);
          }
        }
      );
    }
  }, [isOpen, activeUrl]);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(activeUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div
      id="qr-code-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs transition-opacity"
      onClick={onClose}
    >
      <div
        id="qr-code-modal-content"
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border p-5 sm:p-6 shadow-2xl relative transition-all ${
          isDarkMode
            ? 'bg-slate-900 border-slate-700 text-slate-100'
            : 'bg-white border-stone-200 text-stone-900'
        }`}
      >
        <button
          id="close-qr-modal-btn"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-stone-400 hover:text-stone-200 hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5 mb-3">
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <QrIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-lg leading-tight">Mobile QR Synchronization</h3>
            <p className="text-xs text-stone-400">
              Scan with your Android (Chrome/Camera) or iPhone (Safari/Camera)
            </p>
          </div>
        </div>

        {/* Why Page Not Found Explanation Box */}
        <div
          className={`p-3.5 rounded-xl border mb-3.5 text-xs leading-relaxed ${
            isDarkMode
              ? 'bg-amber-950/30 border-amber-800/60 text-amber-200'
              : 'bg-amber-50 border-amber-200 text-amber-900'
          }`}
        >
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block text-[11px] uppercase tracking-wide">
                Getting "Page Not Found" on your Android Phone?
              </span>
              <p className="mt-1 text-[11px] leading-normal text-slate-300 dark:text-amber-200/90">
                In Google AI Studio, external testers can only open the app after you activate the public share link:
              </p>
              <ol className="list-decimal list-inside mt-1.5 space-y-1 text-[11px] font-medium">
                <li>Look at the top-right header in Google AI Studio.</li>
                <li>Click the <span className="underline font-bold">Share</span> button (next to Deploy / Settings).</li>
                <li>Set access to <strong>"Anyone with the link"</strong> and click <strong>Create / Update Link</strong>.</li>
              </ol>
            </div>
          </div>
        </div>

        {/* URL Target Toggle */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950/60 border border-slate-800 mb-3">
          <button
            type="button"
            onClick={() => setSelectedUrlType('shared')}
            className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              selectedUrlType === 'shared'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Public Shared Link (For 20 Testers)</span>
          </button>
          <button
            type="button"
            onClick={() => setSelectedUrlType('dev')}
            className={`py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              selectedUrlType === 'dev'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <span>Dev Container</span>
          </button>
        </div>

        {/* QR Display Container */}
        <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-white border border-stone-200 shadow-inner my-2">
          {qrDataUrl ? (
            <img
              src={qrDataUrl}
              alt="Solunar Metabolics QR Code"
              className="w-52 h-52 sm:w-56 sm:h-56 rounded-lg object-contain"
            />
          ) : (
            <div className="w-52 h-52 flex items-center justify-center text-stone-400 text-xs">
              Generating Ephemeris QR...
            </div>
          )}
          <div className="flex items-center gap-3 text-[11px] font-mono text-stone-600 mt-2">
            <span className="flex items-center gap-1">
              <Apple className="w-3.5 h-3.5 text-stone-800" />
              <span>Apple iOS Safari</span>
            </span>
            <span>&bull;</span>
            <span className="flex items-center gap-1">
              <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
              <span>Android Chrome</span>
            </span>
          </div>
        </div>

        {/* URL Box & Copy */}
        <div className="mt-3">
          <div className="flex items-center justify-between mb-1">
            <label className="text-[10px] font-mono uppercase text-stone-400">
              {selectedUrlType === 'shared' ? 'Shared Live URL (Cloud Run)' : 'Current Container Endpoint'}
            </label>
            <span className="text-[10px] text-indigo-400 font-mono">
              {selectedUrlType === 'shared' ? 'Requires AI Studio Share click' : 'Direct container'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={activeUrl}
              className={`flex-1 px-3 py-2 rounded-xl border text-xs font-mono truncate ${
                isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-300' : 'bg-stone-50 border-stone-300 text-stone-700'
              }`}
            />
            <button
              id="copy-app-url-btn"
              onClick={handleCopyLink}
              className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer shadow-xs shrink-0"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>

        {onOpenMobileInstall && (
          <div className="mt-4 pt-3 border-t border-slate-800 flex justify-center">
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenMobileInstall();
              }}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1.5 cursor-pointer"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>View Step-by-Step Apple &amp; Android Installation Guide</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
