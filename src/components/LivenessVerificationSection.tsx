import React, { useState, useRef, useEffect } from 'react';
import { 
  Camera, 
  Video, 
  VideoOff, 
  ShieldCheck, 
  Scan, 
  UserCheck, 
  Sparkles, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Eye, 
  Layers, 
  Copy, 
  Check, 
  ArrowRight,
  Upload,
  Info,
  Award
} from 'lucide-react';
import { LivenessCheckResult } from '../types';
import { DUMMY_SELFIE_SAMPLES, DUMMY_PHOTO_SAMPLES, ensureRasterBase64, convertFileToBase64 } from '../lib/utils';

interface LivenessVerificationSectionProps {
  passportPhotoUrl?: string | null;
  onVerificationComplete?: (result: LivenessCheckResult) => void;
  onSelectPassportPhoto?: (dataUrl: string) => void;
}

export const LivenessVerificationSection: React.FC<LivenessVerificationSectionProps> = ({
  passportPhotoUrl,
  onVerificationComplete,
  onSelectPassportPhoto
}) => {
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [capturedSelfie, setCapturedSelfie] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [livenessResult, setLivenessResult] = useState<LivenessCheckResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedCert, setCopiedCert] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Stop camera on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    setCameraError(null);
    setErrorMsg(null);
    setCapturedSelfie(null);
    setLivenessResult(null);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Webcam streaming is not supported by your browser environment.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 480 }
        },
        audio: false
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setCameraActive(true);
    } catch (err: any) {
      console.warn('Camera access error:', err);
      setCameraError(
        err.message || 'Camera permission denied or camera device is in use by another application. You can still test using live presets or upload a selfie.'
      );
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
    setCountdown(null);
  };

  const triggerCaptureWithCountdown = () => {
    setCountdown(3);
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(interval);
          takeSnapshot();
          return null;
        }
        return prev - 1;
      });
    }, 900);
  };

  const takeSnapshot = () => {
    if (!videoRef.current) return;
    try {
      const video = videoRef.current;
      const canvas = canvasRef.current || document.createElement('canvas');
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
        setCapturedSelfie(dataUrl);
        stopCamera();
      }
    } catch (e: any) {
      console.error('Failed to capture snapshot:', e);
      setErrorMsg('Failed to grab snapshot frame from camera.');
    }
  };

  const handleSelfieUpload = async (file: File) => {
    try {
      setErrorMsg(null);
      stopCamera();
      const rawBase64 = await convertFileToBase64(file);
      setCapturedSelfie(rawBase64);
    } catch {
      setErrorMsg('Failed to process uploaded selfie.');
    }
  };

  const handleRunLivenessVerification = async (selfieDataUrl?: string) => {
    const selfieToUse = selfieDataUrl || capturedSelfie;
    const passportToUse = passportPhotoUrl || DUMMY_PHOTO_SAMPLES[0].dataUrl;

    if (!selfieToUse) {
      setErrorMsg('Please capture or select a live selfie first.');
      return;
    }

    if (!passportToUse) {
      setErrorMsg('Please upload a passport specification photo to compare against.');
      return;
    }

    setIsVerifying(true);
    setErrorMsg(null);
    setLivenessResult(null);

    try {
      const [rasterPassport, rasterSelfie] = await Promise.all([
        ensureRasterBase64(passportToUse),
        ensureRasterBase64(selfieToUse)
      ]);

      const response = await fetch('/api/verify-liveness', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          passportPhotoBase64: rasterPassport.base64,
          passportMime: rasterPassport.mimeType,
          selfieBase64: rasterSelfie.base64,
          selfieMime: rasterSelfie.mimeType
        })
      });

      const resData = await response.json();
      if (!resData.success) {
        throw new Error(resData.error || 'Biometric verification failed.');
      }

      setLivenessResult(resData.data);
      if (onVerificationComplete) {
        onVerificationComplete(resData.data);
      }
    } catch (err: any) {
      console.error('Liveness verification error:', err);
      setErrorMsg(err.message || 'Liveness verification service unavailable.');
    } finally {
      setIsVerifying(false);
    }
  };

  const copyCertificate = () => {
    if (!livenessResult) return;
    const text = `=== UAE GDRFA/ICA BIOMETRIC LIVENESS VERIFICATION CERTIFICATE ===
Status: ${livenessResult.verdict} (${livenessResult.matchConfidenceScore}% Match)
Real Human Verified: ${livenessResult.livenessValidation.isRealHuman ? 'YES' : 'NO'}
Anti-Spoofing Protected: ${livenessResult.livenessValidation.noSpoofingDetected ? 'PASSED' : 'FLAGGED'}
Face Landmarks:
- Jawline: ${livenessResult.facialStructureAnalysis.jawlineMatch}
- Eyes & Canthal Tilt: ${livenessResult.facialStructureAnalysis.eyesAndBrowsMatch}
- Nose Structure: ${livenessResult.facialStructureAnalysis.noseStructureMatch}
- Lips & Mouth: ${livenessResult.facialStructureAnalysis.mouthAndLipsMatch}
Summary: ${livenessResult.summary}
Audited by: Gemini AI Biometric Facial Engine (GDRFA/ICP Compliance)`;

    navigator.clipboard.writeText(text);
    setCopiedCert(true);
    setTimeout(() => setCopiedCert(false), 2500);
  };

  return (
    <div className="space-y-6" id="liveness-verification-module">
      {/* Hidden canvas for capturing video frames */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Info Header Box */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 backdrop-blur-md">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 font-semibold tracking-wide text-xs uppercase mb-1">
              <ShieldCheck className="w-4 h-4" />
              Biometric Liveness &amp; Facial Match Engine
            </div>
            <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              Real-Time Selfie Facial Structure Verification
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-sky-950 text-sky-300 border border-sky-800">
                Gemini 3.7 Vision
              </span>
            </h3>
            <p className="text-slate-400 text-sm mt-1 max-w-2xl">
              Captures a live applicant selfie to perform real-time anti-spoofing and compare facial biometric landmarks (jawline, eye spacing, nose bridge, lip geometry) against the passport photo.
            </p>
          </div>

          {/* Quick preset tests for immediate evaluation */}
          <div className="flex flex-wrap gap-2">
            <button
              id="test-matching-selfie-btn"
              onClick={async () => {
                stopCamera();
                if (!passportPhotoUrl && onSelectPassportPhoto) {
                  onSelectPassportPhoto(DUMMY_PHOTO_SAMPLES[0].dataUrl);
                }
                setCapturedSelfie(DUMMY_SELFIE_SAMPLES[0].dataUrl);
                handleRunLivenessVerification(DUMMY_SELFIE_SAMPLES[0].dataUrl);
              }}
              className="text-xs bg-emerald-950/40 hover:bg-emerald-900/50 text-emerald-300 border border-emerald-800/60 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer font-medium"
            >
              <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
              Test Match Selfie
            </button>
            <button
              id="test-mismatch-selfie-btn"
              onClick={async () => {
                stopCamera();
                if (!passportPhotoUrl && onSelectPassportPhoto) {
                  onSelectPassportPhoto(DUMMY_PHOTO_SAMPLES[0].dataUrl);
                }
                setCapturedSelfie(DUMMY_SELFIE_SAMPLES[1].dataUrl);
                handleRunLivenessVerification(DUMMY_SELFIE_SAMPLES[1].dataUrl);
              }}
              className="text-xs bg-red-950/40 hover:bg-red-900/50 text-red-300 border border-red-800/60 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer font-medium"
            >
              <XCircle className="w-3.5 h-3.5 text-red-400" />
              Test Mismatch Selfie
            </button>
          </div>
        </div>
      </div>

      {/* Dual Comparison Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Passport Reference Photo */}
        <div className="lg:col-span-4 space-y-3">
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex flex-col h-full">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-sky-400" />
                1. Passport Photo (Reference)
              </span>
              {passportPhotoUrl ? (
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                  Active
                </span>
              ) : (
                <span className="text-[10px] font-mono text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-800">
                  Sample Loaded
                </span>
              )}
            </div>

            <div className="relative rounded-lg overflow-hidden border border-slate-800 bg-slate-950 w-full h-64 flex items-center justify-center shadow-inner group">
              <img
                src={passportPhotoUrl || DUMMY_PHOTO_SAMPLES[0].dataUrl}
                alt="Passport Spec Reference"
                className="w-full h-full object-contain p-2"
              />
              
              {/* Biometric overlay grid */}
              <div className="absolute inset-4 border border-dashed border-sky-500/30 rounded pointer-events-none flex flex-col justify-between p-1">
                <div className="flex justify-between items-center text-[9px] font-mono text-sky-400/80">
                  <span>REF#01</span>
                  <span>40x55mm</span>
                </div>
                <div className="text-center">
                  <div className="w-20 h-24 border border-sky-400/20 rounded-full mx-auto" />
                </div>
                <div className="text-[9px] font-mono text-sky-400/80 text-center bg-slate-950/80 px-1 py-0.5 rounded">
                  ICA IMMIGRATION RECORD
                </div>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
              <span>Primary biometric bio-data template</span>
              {onSelectPassportPhoto && (
                <button
                  onClick={() => onSelectPassportPhoto(DUMMY_PHOTO_SAMPLES[0].dataUrl)}
                  className="text-sky-400 hover:text-sky-300 font-medium cursor-pointer text-xs"
                >
                  Reset to Sample
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Middle Column: Live Selfie Camera / Capture Feed */}
        <div className="lg:col-span-4 space-y-3">
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex flex-col h-full">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-emerald-400" />
                2. Real-Time Selfie (Live Capture)
              </span>
              {cameraActive ? (
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800 flex items-center gap-1 animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Live Feed
                </span>
              ) : capturedSelfie ? (
                <span className="text-[10px] font-mono text-sky-400 bg-sky-950/80 px-2 py-0.5 rounded border border-sky-800">
                  Frame Captured
                </span>
              ) : (
                <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                  Standby
                </span>
              )}
            </div>

            {/* Video / Captured Image Container */}
            <div className="relative rounded-lg overflow-hidden border border-slate-800 bg-slate-950 w-full h-64 flex items-center justify-center shadow-inner">
              {cameraActive ? (
                <div className="relative w-full h-full">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover scale-x-[-1]"
                  />
                  
                  {/* Holographic Face Guide Reticle */}
                  <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
                    <div className="w-36 h-48 border-2 border-emerald-400/70 rounded-[50%] relative flex items-center justify-center shadow-[0_0_15px_rgba(52,211,153,0.3)]">
                      {/* Scanning crosshairs */}
                      <div className="absolute top-0 w-3 h-0.5 bg-emerald-400" />
                      <div className="absolute bottom-0 w-3 h-0.5 bg-emerald-400" />
                      <div className="absolute left-0 w-0.5 h-3 bg-emerald-400" />
                      <div className="absolute right-0 w-0.5 h-3 bg-emerald-400" />
                      
                      {/* Eye alignment guide */}
                      <div className="w-24 border-b border-emerald-400/40 -mt-6 flex justify-between px-2">
                        <span className="w-2 h-2 rounded-full border border-emerald-400/60" />
                        <span className="w-2 h-2 rounded-full border border-emerald-400/60" />
                      </div>
                    </div>
                    
                    <span className="mt-2 text-[10px] font-mono text-emerald-300 bg-slate-950/80 px-2 py-0.5 rounded border border-emerald-800/50">
                      Center your face inside the oval
                    </span>
                  </div>

                  {/* Countdown overlay */}
                  {countdown !== null && (
                    <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center">
                      <span className="text-6xl font-black text-emerald-400 animate-ping font-mono">
                        {countdown}
                      </span>
                    </div>
                  )}
                </div>
              ) : capturedSelfie ? (
                <div className="relative w-full h-full">
                  <img
                    src={capturedSelfie}
                    alt="Captured Live Selfie"
                    className="w-full h-full object-contain p-2"
                  />
                  <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[9px] font-mono text-emerald-400 bg-slate-950/80 px-2 py-1 rounded border border-emerald-900/60">
                    <span>LIVE CAPTURE READY</span>
                    <button
                      onClick={startCamera}
                      className="text-sky-400 hover:text-white underline cursor-pointer"
                    >
                      Retake
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-6 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                    <Video className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-200">
                      Webcam Selfie Liveness
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Enable your camera to take an instant live selfie
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Action buttons under camera */}
            <div className="mt-3 flex flex-col gap-2">
              {cameraActive ? (
                <div className="flex gap-2">
                  <button
                    id="capture-live-selfie-btn"
                    onClick={triggerCaptureWithCountdown}
                    disabled={countdown !== null}
                    className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-2 px-3 rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-emerald-500/20"
                  >
                    <Camera className="w-4 h-4" />
                    {countdown !== null ? `Capturing in ${countdown}...` : 'Capture Selfie (3s Timer)'}
                  </button>
                  <button
                    onClick={takeSnapshot}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-2 rounded-lg text-xs transition-colors cursor-pointer"
                    title="Instant Capture"
                  >
                    Snap Now
                  </button>
                  <button
                    onClick={stopCamera}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-400 px-3 py-2 rounded-lg text-xs transition-colors cursor-pointer"
                  >
                    <VideoOff className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <button
                    id="start-camera-btn"
                    onClick={startCamera}
                    className="flex-1 bg-sky-600 hover:bg-sky-500 text-white font-semibold py-2 px-3 rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-sky-600/20"
                  >
                    <Video className="w-4 h-4" />
                    Start Live Webcam
                  </button>
                  
                  <label className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium px-3 py-2 rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer border border-slate-700">
                    <Upload className="w-3.5 h-3.5" />
                    Upload File
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => e.target.files?.[0] && handleSelfieUpload(e.target.files[0])}
                    />
                  </label>
                </div>
              )}

              {cameraError && (
                <div className="text-[11px] text-amber-300 bg-amber-950/50 border border-amber-800/80 rounded-lg p-2 flex items-start gap-1.5">
                  <Info className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                  <span>{cameraError}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: AI Verification Engine Trigger & Quick Stats */}
        <div className="lg:col-span-4 space-y-3">
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex flex-col justify-between h-full">
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-3">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                3. Biometric Match Audit
              </span>

              <div className="space-y-2.5 text-xs text-slate-300">
                <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-400">Anti-Spoofing AI Check:</span>
                  <span className="text-emerald-400 font-mono font-medium">Active (Real 3D Face)</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-400">Landmarks Compared:</span>
                  <span className="text-sky-400 font-mono font-medium">Jaw, Eyes, Nose, Lips</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-400">Compliance Standard:</span>
                  <span className="text-slate-200 font-mono">GDRFA &amp; ICP Dubai</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800">
              <button
                id="run-liveness-comparison-btn"
                onClick={() => handleRunLivenessVerification()}
                disabled={!capturedSelfie || isVerifying}
                className={`w-full py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg ${
                  !capturedSelfie
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    : isVerifying
                    ? 'bg-amber-600 text-white animate-pulse'
                    : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-emerald-500/20'
                }`}
              >
                {isVerifying ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Comparing Biometric Facial Structure...
                  </>
                ) : (
                  <>
                    <Scan className="w-4 h-4" />
                    Compare Facial Structure &amp; Verify Liveness
                  </>
                )}
              </button>

              {!capturedSelfie && (
                <p className="text-[11px] text-center text-slate-500 mt-2">
                  Capture a selfie via webcam or select a test preset above to compare
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Error Message if any */}
      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-950/50 border border-red-800 text-red-300 text-sm flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <div>
            <strong className="block font-semibold">Verification Alert</strong>
            <span>{errorMsg}</span>
          </div>
        </div>
      )}

      {/* Biometric Verification Results Card */}
      {livenessResult && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6 shadow-xl animate-in fade-in duration-300">
          {/* Header Banner */}
          <div className={`p-5 rounded-xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
            livenessResult.isMatch
              ? 'bg-emerald-950/60 border-emerald-800/80 text-emerald-200 shadow-emerald-950/50'
              : 'bg-red-950/60 border-red-800/80 text-red-200 shadow-red-950/50'
          }`}>
            <div className="flex items-center gap-3.5">
              {livenessResult.isMatch ? (
                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-7 h-7 text-emerald-400" />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-xl bg-red-500/20 border border-red-400/40 flex items-center justify-center shrink-0">
                  <XCircle className="w-7 h-7 text-red-400" />
                </div>
              )}
              <div>
                <div className="text-xs font-mono uppercase tracking-wider text-slate-300">
                  UAE Border Control Biometric Match Status
                </div>
                <div className="text-lg font-black tracking-tight mt-0.5">
                  {livenessResult.isMatch 
                    ? 'Identity Verified — Same Person Confirmed' 
                    : 'Identity Mismatch or Anti-Spoofing Warning'}
                </div>
                <div className="text-xs text-slate-300/80 mt-1">
                  Verdict: <span className="font-mono font-bold uppercase">{livenessResult.verdict}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 self-end md:self-auto">
              <div className="text-right">
                <span className="text-3xl font-black font-mono">
                  {livenessResult.matchConfidenceScore}%
                </span>
                <span className="text-xs text-slate-400 block font-mono">Match Confidence</span>
              </div>

              <button
                onClick={copyCertificate}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3.5 py-2 rounded-lg text-xs transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
              >
                {copiedCert ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    Copy Certificate
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Liveness Checks & Facial Structure Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Liveness & Anti-Spoofing Checklist */}
            <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-slate-400">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Anti-Spoofing &amp; Liveness Validation
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/80 border border-slate-800">
                  <span className="text-slate-300">Real Human Face Present:</span>
                  {livenessResult.livenessValidation.isRealHuman ? (
                    <span className="text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Verified Human
                    </span>
                  ) : (
                    <span className="text-red-400 font-semibold flex items-center gap-1">
                      <XCircle className="w-3.5 h-3.5" /> Flagged
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/80 border border-slate-800">
                  <span className="text-slate-300">Live Camera Presence:</span>
                  {livenessResult.livenessValidation.isLiveCapture ? (
                    <span className="text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Interactive Live
                    </span>
                  ) : (
                    <span className="text-amber-400 font-semibold flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" /> Static Frame
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/80 border border-slate-800">
                  <span className="text-slate-300">Anti-Screen Replay / Printout:</span>
                  {livenessResult.livenessValidation.noScreenReplayOrPrintout ? (
                    <span className="text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> No Spoof Detected
                    </span>
                  ) : (
                    <span className="text-red-400 font-semibold flex items-center gap-1">
                      <XCircle className="w-3.5 h-3.5" /> Screen Replay Suspected
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/80 border border-slate-800">
                  <span className="text-slate-300">Frontal Camera Pose:</span>
                  {livenessResult.livenessValidation.isFrontalPose ? (
                    <span className="text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Optimal Angle
                    </span>
                  ) : (
                    <span className="text-amber-400 font-semibold flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" /> Off-Angle
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Facial Structure Anatomical Comparison */}
            <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-slate-400">
                <Eye className="w-4 h-4 text-sky-400" />
                Facial Landmark Anatomical Breakdown
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/80 border border-slate-800">
                  <span className="text-slate-300">Jawline &amp; Mandible Contour:</span>
                  <span className={`font-semibold px-2 py-0.5 rounded text-[11px] ${
                    livenessResult.facialStructureAnalysis.jawlineMatch === 'High' 
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      : livenessResult.facialStructureAnalysis.jawlineMatch === 'Moderate'
                      ? 'bg-sky-950 text-sky-400 border border-sky-800'
                      : 'bg-red-950 text-red-400 border border-red-800'
                  }`}>
                    {livenessResult.facialStructureAnalysis.jawlineMatch} Match
                  </span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/80 border border-slate-800">
                  <span className="text-slate-300">Inter-Pupillary &amp; Eye Structure:</span>
                  <span className={`font-semibold px-2 py-0.5 rounded text-[11px] ${
                    livenessResult.facialStructureAnalysis.eyesAndBrowsMatch === 'High' 
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      : livenessResult.facialStructureAnalysis.eyesAndBrowsMatch === 'Moderate'
                      ? 'bg-sky-950 text-sky-400 border border-sky-800'
                      : 'bg-red-950 text-red-400 border border-red-800'
                  }`}>
                    {livenessResult.facialStructureAnalysis.eyesAndBrowsMatch} Match
                  </span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/80 border border-slate-800">
                  <span className="text-slate-300">Nose Bridge &amp; Tip Projection:</span>
                  <span className={`font-semibold px-2 py-0.5 rounded text-[11px] ${
                    livenessResult.facialStructureAnalysis.noseStructureMatch === 'High' 
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      : livenessResult.facialStructureAnalysis.noseStructureMatch === 'Moderate'
                      ? 'bg-sky-950 text-sky-400 border border-sky-800'
                      : 'bg-red-950 text-red-400 border border-red-800'
                  }`}>
                    {livenessResult.facialStructureAnalysis.noseStructureMatch} Match
                  </span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/80 border border-slate-800">
                  <span className="text-slate-300">Mouth Width &amp; Lip Geometry:</span>
                  <span className={`font-semibold px-2 py-0.5 rounded text-[11px] ${
                    livenessResult.facialStructureAnalysis.mouthAndLipsMatch === 'High' 
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      : livenessResult.facialStructureAnalysis.mouthAndLipsMatch === 'Moderate'
                      ? 'bg-sky-950 text-sky-400 border border-sky-800'
                      : 'bg-red-950 text-red-400 border border-red-800'
                  }`}>
                    {livenessResult.facialStructureAnalysis.mouthAndLipsMatch} Match
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Observations & Summary */}
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 space-y-3 text-xs">
            <span className="font-semibold text-slate-200 block font-mono text-xs uppercase tracking-wider">
              AI Biometric Evaluation Summary &amp; Landmark Observations:
            </span>
            <p className="text-slate-300 leading-relaxed">
              {livenessResult.summary}
            </p>
            {livenessResult.facialStructureAnalysis.facialProportionsNotes && (
              <p className="text-slate-400 text-[11px] italic bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                Landmarks Note: {livenessResult.facialStructureAnalysis.facialProportionsNotes}
              </p>
            )}

            {/* Matched & Differing traits */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {livenessResult.matchedCharacteristics?.length > 0 && (
                <div className="space-y-1">
                  <span className="font-medium text-emerald-400 flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Corroborated Facial Points:
                  </span>
                  <ul className="list-disc pl-4 space-y-0.5 text-slate-300 text-[11px]">
                    {livenessResult.matchedCharacteristics.map((m, i) => (
                      <li key={i}>{m}</li>
                    ))}
                  </ul>
                </div>
              )}

              {livenessResult.differingCharacteristics?.length > 0 && (
                <div className="space-y-1">
                  <span className="font-medium text-amber-400 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> Observed Variances:
                  </span>
                  <ul className="list-disc pl-4 space-y-0.5 text-slate-400 text-[11px]">
                    {livenessResult.differingCharacteristics.map((d, i) => (
                      <li key={i}>{d}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Recommendations */}
            {livenessResult.recommendations?.length > 0 && (
              <div className="pt-2 border-t border-slate-800">
                <span className="font-semibold text-sky-400 block mb-1">
                  Immigration Advisory &amp; Next Steps:
                </span>
                <ul className="list-disc pl-4 space-y-0.5 text-slate-400 text-[11px]">
                  {livenessResult.recommendations.map((rec, i) => (
                    <li key={i}>{rec}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
