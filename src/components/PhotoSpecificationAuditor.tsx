import React, { useState } from 'react';
import { 
  Camera, 
  UploadCloud, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  RefreshCw, 
  Sparkles, 
  SunMedium, 
  UserCheck,
  Maximize2,
  ShieldCheck,
  ArrowRight
} from 'lucide-react';
import { PhotoAuditResult, LivenessCheckResult } from '../types';
import { DUMMY_PHOTO_SAMPLES, convertFileToBase64, ensureRasterBase64 } from '../lib/utils';
import { LivenessVerificationSection } from './LivenessVerificationSection';

interface PhotoSpecificationAuditorProps {
  onPhotoAudited?: (result: PhotoAuditResult, previewUrl: string) => void;
}

export const PhotoSpecificationAuditor: React.FC<PhotoSpecificationAuditorProps> = ({ onPhotoAudited }) => {
  const [activeSubTab, setActiveSubTab] = useState<'photo-spec' | 'liveness'>('photo-spec');
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [auditResult, setAuditResult] = useState<PhotoAuditResult | null>(null);
  const [livenessResult, setLivenessResult] = useState<LivenessCheckResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleFileUpload = async (file: File) => {
    try {
      setErrorMsg(null);
      const rawBase64 = await convertFileToBase64(file);
      setSelectedPhoto(rawBase64);
      const { base64, mimeType } = await ensureRasterBase64(rawBase64);
      runPhotoAudit(base64, mimeType);
    } catch {
      setErrorMsg('Failed to read photograph.');
    }
  };

  const runPhotoAudit = async (base64Data: string, mimeType: string) => {
    setAnalyzing(true);
    setErrorMsg(null);
    setAuditResult(null);

    try {
      const raster = await ensureRasterBase64(base64Data);
      const response = await fetch('/api/audit-photo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: raster.base64, mimeType: raster.mimeType })
      });

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Photo audit failed');
      }

      setAuditResult(data.data);
      if (onPhotoAudited) {
        onPhotoAudited(data.data, raster.base64);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Photo auditor service unavailable.');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6" id="photo-audit-container">
      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <button
          id="subtab-photo-spec-btn"
          onClick={() => setActiveSubTab('photo-spec')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'photo-spec'
              ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850 bg-slate-900/60'
          }`}
        >
          <Camera className="w-4 h-4" />
          ১. Photo Background &amp; Spec Auditor (40x55mm)
        </button>

        <button
          id="subtab-liveness-btn"
          onClick={() => setActiveSubTab('liveness')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer relative ${
            activeSubTab === 'liveness'
              ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850 bg-slate-900/60'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          ২. Real-Time Selfie Liveness &amp; Biometric Match Check
          <span className="ml-1 px-1.5 py-0.5 rounded text-[9px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-800/80">
            Live AI
          </span>
        </button>
      </div>

      {/* Mode 1: Photo Specification & Background Auditor */}
      {activeSubTab === 'photo-spec' && (
        <div className="space-y-6">
          {/* Header Banner */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 backdrop-blur-md">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-sky-400 font-semibold tracking-wide text-xs uppercase mb-1">
                  <Camera className="w-4 h-4" />
                  ICA &amp; GDRFA Dubai Biometric Photo Specification Standard
                </div>
                <h2 className="text-xl font-bold text-white tracking-tight">
                  AI Visa Photo Quality &amp; Background Auditor (40x55mm / 80% Face)
                </h2>
                <p className="text-slate-400 text-sm mt-1 max-w-2xl">
                  Strict UAE immigration rules require pure white background, 80% face visibility, open eyes, and zero shadows. Instant AI diagnostic catches rejections before submission.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  id="test-compliant-photo-btn"
                  onClick={async () => {
                    setSelectedPhoto(DUMMY_PHOTO_SAMPLES[0].dataUrl);
                    const raster = await ensureRasterBase64(DUMMY_PHOTO_SAMPLES[0].dataUrl);
                    runPhotoAudit(raster.base64, raster.mimeType);
                  }}
                  className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Test Compliant Photo
                </button>
                <button
                  id="test-noncompliant-photo-btn"
                  onClick={async () => {
                    setSelectedPhoto(DUMMY_PHOTO_SAMPLES[1].dataUrl);
                    const raster = await ensureRasterBase64(DUMMY_PHOTO_SAMPLES[1].dataUrl);
                    runPhotoAudit(raster.base64, raster.mimeType);
                  }}
                  className="text-xs bg-red-950/40 hover:bg-red-900/50 text-red-300 border border-red-800/60 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                  Test Non-Compliant
                </button>
              </div>
            </div>
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Upload Column */}
            <div className="lg:col-span-5 space-y-4">
              <div className="border-2 border-dashed border-slate-800 hover:border-slate-700 bg-slate-900/50 rounded-xl p-6 text-center relative">
                <input
                  type="file"
                  id="photo-file-input"
                  accept="image/*"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                />

                {selectedPhoto ? (
                  <div className="space-y-4">
                    <div className="relative rounded-lg overflow-hidden border border-slate-700/80 bg-slate-950 w-48 h-64 mx-auto flex items-center justify-center shadow-lg">
                      <img
                        src={selectedPhoto}
                        alt="Applicant Photo"
                        className="w-full h-full object-contain"
                      />
                      {/* Aspect Ratio Box Overlay */}
                      <div className="absolute inset-2 border border-sky-400/40 rounded pointer-events-none flex flex-col justify-between p-1">
                        <span className="text-[9px] font-mono text-sky-300 bg-slate-950/70 px-1 py-0.5 rounded w-max">
                          40x55mm / 80%
                        </span>
                      </div>

                      {analyzing && (
                        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs flex flex-col items-center justify-center gap-2">
                          <RefreshCw className="w-7 h-7 text-sky-400 animate-spin" />
                          <span className="text-[10px] font-mono text-sky-300">ANALYZING FACE RATIO &amp; BG...</span>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-slate-400">Click or drag another image to replace</p>
                  </div>
                ) : (
                  <div className="py-8 space-y-3">
                    <div className="w-12 h-12 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center mx-auto">
                      <Camera className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-200">
                        Upload Applicant Passport Photo
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        Color portrait photo with white background (40x55mm)
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Quick Guidance Box */}
              <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-4 text-xs space-y-2 text-slate-400">
                <span className="font-semibold text-slate-300 block">UAE Photo Rejection Causes:</span>
                <ul className="list-disc pl-4 space-y-1">
                  <li>Colored, patterned, or cream/gray walls.</li>
                  <li>Face smaller than 70% or excessive head margins.</li>
                  <li>Flash glare on prescription glasses or closed eyes.</li>
                </ul>
              </div>
            </div>

            {/* Results Column */}
            <div className="lg:col-span-7">
              {errorMsg && (
                <div className="p-4 rounded-xl bg-red-950/50 border border-red-800 text-red-300 text-sm flex items-start gap-3 mb-4">
                  <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block font-semibold">Audit Error</strong>
                    <span>{errorMsg}</span>
                  </div>
                </div>
              )}

              {!selectedPhoto && !auditResult && !analyzing && (
                <div className="bg-slate-900/40 border border-slate-800/60 rounded-xl p-12 text-center flex flex-col items-center justify-center text-slate-500 h-full min-h-[350px]">
                  <Camera className="w-12 h-12 text-slate-700 mb-3" />
                  <h3 className="text-slate-300 font-medium text-base mb-1">Awaiting Applicant Photo</h3>
                  <p className="text-xs text-slate-500 max-w-xs">
                    Upload a portrait or click a sample to verify 40x55mm dimensions, background luminance, and facial centering.
                  </p>
                </div>
              )}

              {analyzing && (
                <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-8 text-center flex flex-col items-center justify-center min-h-[350px] space-y-4">
                  <div className="w-14 h-14 rounded-full border-4 border-slate-800 border-t-sky-500 animate-spin"></div>
                  <p className="text-sm font-semibold text-slate-200">Evaluating Biometric Face Dimensions &amp; Backlight...</p>
                </div>
              )}

              {auditResult && !analyzing && (
                <div className="space-y-4">
                  {/* Top Score */}
                  <div className={`p-4 rounded-xl border flex items-center justify-between gap-4 ${
                    auditResult.isValid 
                      ? 'bg-emerald-950/40 border-emerald-800/80 text-emerald-200' 
                      : 'bg-red-950/40 border-red-800/80 text-red-200'
                  }`}>
                    <div className="flex items-center gap-3">
                      {auditResult.isValid ? (
                        <CheckCircle2 className="w-8 h-8 text-emerald-400 shrink-0" />
                      ) : (
                        <XCircle className="w-8 h-8 text-red-400 shrink-0" />
                      )}
                      <div>
                        <div className="text-xs font-mono uppercase tracking-wider text-slate-400">
                          Photo Standard Score
                        </div>
                        <div className="text-base font-bold">
                          {auditResult.isValid ? 'Approved for UAE Visa Portal' : 'Rejected - Re-take or Clean Background'}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-2xl font-black font-mono">
                        {auditResult.overallScore}
                      </span>
                      <span className="text-xs text-slate-400 block">/ 100</span>
                    </div>
                  </div>

                  {/* Proceed to Liveness Check Banner */}
                  <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/70 to-teal-950/70 border border-emerald-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center shrink-0">
                        <ShieldCheck className="w-5 h-5 text-emerald-400" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-emerald-200">
                          Next Step: Biometric Identity &amp; Liveness Check
                        </div>
                        <p className="text-[11px] text-slate-300">
                          Capture a live selfie to compare facial structure and verify applicant presence.
                        </p>
                      </div>
                    </div>

                    <button
                      id="proceed-to-liveness-btn"
                      onClick={() => setActiveSubTab('liveness')}
                      className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-3.5 py-2 rounded-lg text-xs transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap shadow-md shadow-emerald-500/20"
                    >
                      Verify Liveness Now
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Attributes Matrix */}
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                    <span className="text-xs font-mono uppercase tracking-wider text-slate-400 block mb-3">
                      Biometric Inspection Checklist
                    </span>
                    
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                        <span className="text-slate-400">Pure White Background:</span>
                        {auditResult.checks.isWhiteBackground ? (
                          <span className="text-emerald-400 font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> 100% White
                          </span>
                        ) : (
                          <span className="text-red-400 font-semibold flex items-center gap-1">
                            <XCircle className="w-3.5 h-3.5" /> Non-White
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                        <span className="text-slate-400">Face Coverage Ratio:</span>
                        <span className={`font-semibold flex items-center gap-1 ${
                          auditResult.checks.is80PercentFaceVisible ? 'text-emerald-400' : 'text-amber-400'
                        }`}>
                          {auditResult.checks.faceCoverageRatio ? `${auditResult.checks.faceCoverageRatio}%` : 'Standard'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                        <span className="text-slate-400">Eyes Open &amp; Visible:</span>
                        {auditResult.checks.isEyesVisibleAndOpen ? (
                          <span className="text-emerald-400 font-semibold">Yes</span>
                        ) : (
                          <span className="text-red-400 font-semibold">Obstructed</span>
                        )}
                      </div>

                      <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                        <span className="text-slate-400">Lighting Quality:</span>
                        <span className="text-slate-200 capitalize font-medium">
                          {auditResult.detectedAttributes.lightingQuality || 'Standard'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Suggestions / Rejection reasons */}
                  {(auditResult.rejectionReasons?.length > 0 || auditResult.suggestions?.length > 0) && (
                    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-2 text-xs">
                      {auditResult.rejectionReasons?.length > 0 && (
                        <div className="text-red-300 space-y-1">
                          <span className="font-semibold text-red-400 block">Flagged Details:</span>
                          <ul className="list-disc pl-4 space-y-0.5">
                            {auditResult.rejectionReasons.map((r, i) => (
                              <li key={i}>{r}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {auditResult.suggestions?.length > 0 && (
                        <div className="text-slate-300 space-y-1 pt-1">
                          <span className="font-semibold text-sky-400 block">Suggested Fixes:</span>
                          <ul className="list-disc pl-4 space-y-0.5 text-slate-400">
                            {auditResult.suggestions.map((s, i) => (
                              <li key={i}>{s}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mode 2: Real-time Selfie Biometric Liveness & Comparison Check */}
      {activeSubTab === 'liveness' && (
        <LivenessVerificationSection
          passportPhotoUrl={selectedPhoto || DUMMY_PHOTO_SAMPLES[0].dataUrl}
          onVerificationComplete={(result) => {
            setLivenessResult(result);
            if (auditResult) {
              setAuditResult({ ...auditResult, livenessResult: result });
            }
          }}
          onSelectPassportPhoto={(dataUrl) => setSelectedPhoto(dataUrl)}
        />
      )}
    </div>
  );
};

