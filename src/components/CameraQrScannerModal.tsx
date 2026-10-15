import React, { useState, useEffect, useRef, useCallback } from 'react';
import jsQR from 'jsqr';
import confetti from 'canvas-confetti';
import {
  Camera,
  QrCode,
  X,
  Scan,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  FolderLock,
  FileText,
  FileCheck,
  ShieldCheck,
  ArrowRight,
  ExternalLink,
  Upload,
  Volume2,
  VolumeX,
  Layers,
  FileDown,
  Sparkles,
  Search,
  Check,
  Eye,
  CameraOff
} from 'lucide-react';
import { VisaApplication, DocumentAuditHistoryItem, DocumentAuditType, ApplicationAuditEvent } from '../types';
import { formatDate } from '../lib/utils';
import { useLanguage } from '../context/LanguageContext';

interface CameraQrScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  applications: VisaApplication[];
  onLinkDocumentToApplication?: (appId: string, doc: DocumentAuditHistoryItem, event: ApplicationAuditEvent) => void;
  onSelectApplicationDossier?: (app: VisaApplication) => void;
  onOpenDocumentHistory?: (app: VisaApplication) => void;
  onExportDossierPdf?: (app: VisaApplication) => void;
  onAddNewApplicationWithPrefill?: (prefill: { passportNumber?: string; notes?: string; id?: string }) => void;
}

export const CameraQrScannerModal: React.FC<CameraQrScannerModalProps> = ({
  isOpen,
  onClose,
  applications,
  onLinkDocumentToApplication,
  onSelectApplicationDossier,
  onOpenDocumentHistory,
  onExportDossierPdf,
  onAddNewApplicationWithPrefill
}) => {
  const { language } = useLanguage();
  const isRTL = language === 'ar';

  // Video & Stream state
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const [streamActive, setStreamActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [availableCameras, setAvailableCameras] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const [torchOn, setTorchOn] = useState(false);
  const [hasTorch, setHasTorch] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Scan state
  const [scannedData, setScannedData] = useState<string | null>(null);
  const [matchedApp, setMatchedApp] = useState<VisaApplication | null>(null);
  const [capturedSnapshot, setCapturedSnapshot] = useState<string | null>(null);
  const [isScanningActive, setIsScanningActive] = useState(true);

  // Manual fallback selection if no match
  const [manualSearchQuery, setManualSearchQuery] = useState('');
  const [manualSelectedAppId, setManualSelectedAppId] = useState<string>('');

  // Physical document linking form fields
  const [physicalDocType, setPhysicalDocType] = useState<DocumentAuditType>('Physical Document Archive');
  const [physicalDocTitle, setPhysicalDocTitle] = useState('Physical Passport Deposit (Original Booklet)');
  const [physicalStorageLocation, setPhysicalStorageLocation] = useState('Locker 03 - Shelf B - Tray #12');
  const [physicalCondition, setPhysicalCondition] = useState('Original Document - Inspected & Pristine');
  const [receivingOfficer, setReceivingOfficer] = useState('Desk Officer 01 (Dubai Hub)');
  const [physicalNotes, setPhysicalNotes] = useState('');
  const [linkSuccess, setLinkSuccess] = useState(false);
  const [linkedAppId, setLinkedAppId] = useState<string | null>(null);

  // Play synthesized scan confirmation beep
  const playBeep = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime); // A5 note
      osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.12);

      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } catch (e) {
      console.warn('Audio beep failed:', e);
    }
  }, [soundEnabled]);

  // Enumerate cameras
  useEffect(() => {
    if (!isOpen) return;
    navigator.mediaDevices?.enumerateDevices?.().then((devices) => {
      const videoDevices = devices.filter((d) => d.kind === 'videoinput');
      setAvailableCameras(videoDevices);
      if (videoDevices.length > 0 && !selectedDeviceId) {
        setSelectedDeviceId(videoDevices[0].deviceId);
      }
    }).catch((err) => {
      console.warn('Error enumerating cameras:', err);
    });
  }, [isOpen, selectedDeviceId]);

  // Start Camera Stream
  const startCamera = useCallback(async () => {
    setCameraError(null);
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError('Camera API is not supported on this device/browser. Please upload an image or select a file.');
      return;
    }

    try {
      // Stop old tracks
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }

      const constraints: MediaStreamConstraints = {
        video: selectedDeviceId
          ? { deviceId: { exact: selectedDeviceId } }
          : {
              facingMode: { ideal: facingMode },
              width: { ideal: 1280 },
              height: { ideal: 720 }
            }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();
        setStreamActive(true);

        // Check torch capability
        const track = stream.getVideoTracks()[0];
        if (track && typeof track.getCapabilities === 'function') {
          const caps = track.getCapabilities() as { torch?: boolean };
          setHasTorch(!!caps.torch);
        }
      }
    } catch (err: unknown) {
      console.error('Camera access error:', err);
      const message = err instanceof Error ? err.message : 'Camera permission denied or camera device in use.';
      setCameraError(`Camera Error: ${message}. You can switch cameras or upload an image file.`);
      setStreamActive(false);
    }
  }, [facingMode, selectedDeviceId]);

  // Stop Camera Stream
  const stopCamera = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setStreamActive(false);
  }, []);

  // Toggle Torch/Flashlight
  const toggleTorch = async () => {
    if (!videoRef.current || !videoRef.current.srcObject) return;
    try {
      const stream = videoRef.current.srcObject as MediaStream;
      const track = stream.getVideoTracks()[0];
      if (track) {
        const nextTorch = !torchOn;
        await track.applyConstraints({
          advanced: [{ torch: nextTorch } as MediaTrackConstraintSet]
        });
        setTorchOn(nextTorch);
      }
    } catch (e) {
      console.warn('Torch toggle error:', e);
    }
  };

  // Find matching application from decoded string
  const findMatchingApplication = useCallback((decoded: string): VisaApplication | null => {
    const raw = decoded.trim();
    if (!raw) return null;

    // 1. Check if decoded text is a URL with params
    try {
      if (raw.startsWith('http://') || raw.startsWith('https://') || raw.includes('?')) {
        const urlStr = raw.startsWith('http') ? raw : `https://dummy.local/${raw}`;
        const parsed = new URL(urlStr);
        const appIdParam = parsed.searchParams.get('appId') || parsed.searchParams.get('ref') || parsed.searchParams.get('id');
        const passportParam = parsed.searchParams.get('passport');

        if (appIdParam) {
          const matched = applications.find(
            (a) => a.id.toLowerCase() === appIdParam.toLowerCase() ||
                   a.passportNumber.toLowerCase() === appIdParam.toLowerCase()
          );
          if (matched) return matched;
        }

        if (passportParam) {
          const matched = applications.find(
            (a) => a.passportNumber.toLowerCase() === passportParam.toLowerCase()
          );
          if (matched) return matched;
        }
      }
    } catch {
      // not a valid url, continue
    }

    // 2. Check JSON payload
    try {
      if (raw.startsWith('{') && raw.endsWith('}')) {
        const parsed = JSON.parse(raw);
        const idToCheck = parsed.appId || parsed.id || parsed.applicationId;
        const passToCheck = parsed.passportNumber || parsed.passport;
        if (idToCheck) {
          const matched = applications.find(
            (a) => a.id.toLowerCase() === String(idToCheck).toLowerCase()
          );
          if (matched) return matched;
        }
        if (passToCheck) {
          const matched = applications.find(
            (a) => a.passportNumber.toLowerCase() === String(passToCheck).toLowerCase()
          );
          if (matched) return matched;
        }
      }
    } catch {
      // not JSON
    }

    // 3. Direct ID match (e.g. UAE-2026-8812, etc.)
    const exactIdMatch = applications.find((a) => a.id.toLowerCase() === raw.toLowerCase());
    if (exactIdMatch) return exactIdMatch;

    // 4. Direct passport match
    const exactPassMatch = applications.find(
      (a) => a.passportNumber.toLowerCase() === raw.toLowerCase()
    );
    if (exactPassMatch) return exactPassMatch;

    // 5. Check if raw contains an app ID (e.g. "UAE-2026-8812")
    const idPattern = /UAE-\d{4}-\d{4}/i;
    const regexMatch = raw.match(idPattern);
    if (regexMatch) {
      const found = applications.find((a) => a.id.toLowerCase() === regexMatch[0].toLowerCase());
      if (found) return found;
    }

    // 6. Check if raw contains any known app ID
    for (const app of applications) {
      if (raw.toLowerCase().includes(app.id.toLowerCase())) {
        return app;
      }
      if (app.passportNumber && raw.toLowerCase().includes(app.passportNumber.toLowerCase())) {
        return app;
      }
    }

    return null;
  }, [applications]);

  // Handle scanned result
  const handleDecodedQr = useCallback((decoded: string) => {
    if (!decoded || decoded === scannedData) return;
    playBeep();
    setScannedData(decoded);
    setIsScanningActive(false);

    // Capture snapshot of physical document from video frame
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        try {
          const snapshotUrl = canvas.toDataURL('image/jpeg', 0.85);
          setCapturedSnapshot(snapshotUrl);
        } catch (e) {
          console.warn('Could not export snapshot data URL:', e);
        }
      }
    }

    // Match with CRM database
    const matched = findMatchingApplication(decoded);
    setMatchedApp(matched);
    if (matched) {
      setManualSelectedAppId(matched.id);
      // Pre-set document title based on target
      setPhysicalDocTitle(`Physical Document [Scan Ref: ${decoded.slice(0, 24)}]`);
    }
  }, [findMatchingApplication, playBeep, scannedData]);

  // Real-time video frame scanning loop
  const scanLoop = useCallback(() => {
    if (!isScanningActive) return;

    if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          
          // Use jsQR to decode
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: 'attemptBoth'
          });

          if (code && code.data) {
            handleDecodedQr(code.data);
            return;
          }
        }
      }
    }

    animationFrameRef.current = requestAnimationFrame(scanLoop);
  }, [handleDecodedQr, isScanningActive]);

  // Start stream on open & trigger scan loop
  useEffect(() => {
    if (isOpen) {
      setIsScanningActive(true);
      setScannedData(null);
      setMatchedApp(null);
      setCapturedSnapshot(null);
      setLinkSuccess(false);
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, startCamera, stopCamera]);

  // Trigger scanning loop when video stream is active
  useEffect(() => {
    if (streamActive && isScanningActive) {
      animationFrameRef.current = requestAnimationFrame(scanLoop);
    }
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [scanLoop, streamActive, isScanningActive]);

  // Manual snapshot capture
  const handleCaptureSnapshot = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const snapshotUrl = canvas.toDataURL('image/jpeg', 0.85);
        setCapturedSnapshot(snapshotUrl);
      }
    }
  };

  // Handle Image File Upload for QR Decoding
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: 'attemptBoth'
          });
          if (code && code.data) {
            setCapturedSnapshot(event.target?.result as string);
            handleDecodedQr(code.data);
          } else {
            alert('No valid QR code was detected in the uploaded image. Please ensure the QR code is clearly visible and try again.');
          }
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Reset scanner to scan another code
  const handleResetScan = () => {
    setScannedData(null);
    setMatchedApp(null);
    setCapturedSnapshot(null);
    setLinkSuccess(false);
    setIsScanningActive(true);
    if (!streamActive) {
      startCamera();
    }
  };

  // Target application for linking (either matched directly or manually selected)
  const effectiveApp = matchedApp || applications.find((a) => a.id === manualSelectedAppId) || null;

  // Filter applications for manual selector
  const filteredAppsForManual = applications.filter((app) => {
    if (!manualSearchQuery) return true;
    const q = manualSearchQuery.toLowerCase();
    return (
      app.applicantName.toLowerCase().includes(q) ||
      app.passportNumber.toLowerCase().includes(q) ||
      app.id.toLowerCase().includes(q)
    );
  });

  // Execute linking of physical document to digital dossier
  const handleExecuteLinkDocument = () => {
    if (!effectiveApp) return;

    const newDocId = `doc-physical-${effectiveApp.id}-${Date.now().toString(36)}`;
    const nowIso = new Date().toISOString();

    const newDocItem: DocumentAuditHistoryItem = {
      id: newDocId,
      version: `phys-v${((effectiveApp.documentHistory?.length || 0) + 1)}.0`,
      documentType: physicalDocType,
      fileName: `${effectiveApp.applicantName.toLowerCase().replace(/\s+/g, '_')}_physical_${Date.now().toString(36).slice(-4)}.jpg`,
      uploadedAt: nowIso,
      uploadedBy: receivingOfficer || 'Desk Officer (Dubai Hub)',
      status: 'Passed',
      score: 98,
      summary: `Physical Document Linked via Scanner: ${physicalDocTitle}. Stored at: ${physicalStorageLocation}. Condition: ${physicalCondition}.`,
      details: {
        fileSize: 'Physical Hardcopy Folder',
        checksumSha256: `qr-${scannedData?.slice(0, 16) || Math.random().toString(36).substring(2, 10)}`,
        previewUrl: capturedSnapshot || undefined,
        physicalStorageLocation: physicalStorageLocation.trim(),
        physicalBarcode: scannedData || undefined,
        physicalCondition: physicalCondition.trim(),
        receivedByOfficer: receivingOfficer.trim(),
        rejectionReasons: [],
        suggestions: [`Document verified and filed in ${physicalStorageLocation}. Link with electronic dossier active.`]
      },
      notes: physicalNotes.trim() ? `${physicalNotes.trim()} | QR Token: ${scannedData}` : `Physical document intake scanned and verified. QR Token: ${scannedData}`
    };

    const auditEvent: ApplicationAuditEvent = {
      id: `audit-${Date.now()}-phys-link`,
      applicationId: effectiveApp.id,
      applicantName: effectiveApp.applicantName,
      passportNumber: effectiveApp.passportNumber,
      timestamp: nowIso,
      type: 'document_update',
      title: `Physical Document Linked: ${physicalDocTitle}`,
      titleBn: `শারীরিক নথি ডিজিটাল ফাইলে সংযুক্ত করা হয়েছে: ${physicalDocTitle}`,
      actor: receivingOfficer || 'Desk Officer (Dubai Hub)',
      details: {
        documentType: physicalDocType,
        fileName: newDocItem.fileName,
        version: newDocItem.version,
        score: 98,
        notes: `Physical storage bin: ${physicalStorageLocation}. QR Identifier: ${scannedData}`
      }
    };

    if (onLinkDocumentToApplication) {
      onLinkDocumentToApplication(effectiveApp.id, newDocItem, auditEvent);
    }

    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 }
      });
    } catch {
      // non-critical
    }

    setLinkedAppId(effectiveApp.id);
    setLinkSuccess(true);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
      <div className={`bg-slate-900 border border-slate-800 rounded-2xl max-w-4xl w-full max-h-[94vh] flex flex-col shadow-2xl overflow-hidden ${isRTL ? 'font-arabic' : ''}`}>
        
        {/* Modal Top Bar */}
        <div className="px-5 py-4 border-b border-slate-800/90 bg-slate-950/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-tight">
                  {language === 'ar' ? 'ماسح رمز الاستجابة السريعة (QR) وربط الوثائق' : 'Physical Document QR Scanner & Linker'}
                </h3>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Live Camera
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {language === 'ar' 
                  ? 'امسح رمز QR على الوثيقة الورقية أو الجواز لربطه بملف الطلب الرقمي فورًا' 
                  : 'Scan physical application dossier or passport QR code to link hardcopy documents directly to digital records.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              title={soundEnabled ? 'Mute scanner beep' : 'Enable scanner beep'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              title="Close Scanner"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Main Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          
          {/* Main Grid: Left side Camera Viewfinder / Right side Linking Interface */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Camera Viewfinder Column (5 or 6 cols) */}
            <div className="lg:col-span-5 space-y-3">
              <div className="relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-inner aspect-4/3 flex items-center justify-center">
                
                {/* Hidden canvas for image analysis */}
                <canvas ref={canvasRef} className="hidden" />

                {/* Video element */}
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`w-full h-full object-cover ${!streamActive ? 'hidden' : ''}`}
                />

                {/* If stream is inactive or camera error */}
                {!streamActive && (
                  <div className="p-6 text-center space-y-3">
                    <div className="w-12 h-12 mx-auto rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
                      <CameraOff className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-300 font-medium">Camera Inactive</p>
                      <p className="text-[11px] text-slate-500 mt-1 max-w-xs mx-auto">
                        {cameraError || 'Click below to start camera or upload an image containing a document QR code.'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={startCamera}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg inline-flex items-center gap-1.5 cursor-pointer shadow-sm transition-colors"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>Start Camera</span>
                    </button>
                  </div>
                )}

                {/* Viewfinder Overlay with Scanning Reticle & Laser Beam */}
                {streamActive && isScanningActive && (
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                    {/* Darkened corners */}
                    <div className="absolute inset-0 bg-slate-950/20" />
                    
                    {/* Targeting Box */}
                    <div className="relative w-56 h-56 border-2 border-emerald-400/80 rounded-2xl shadow-[0_0_20px_rgba(16,185,129,0.3)] flex items-center justify-center">
                      {/* Corner Target Marks */}
                      <div className="absolute -top-1 -left-1 w-5 h-5 border-t-4 border-l-4 border-emerald-400 rounded-tl" />
                      <div className="absolute -top-1 -right-1 w-5 h-5 border-t-4 border-r-4 border-emerald-400 rounded-tr" />
                      <div className="absolute -bottom-1 -left-1 w-5 h-5 border-b-4 border-l-4 border-emerald-400 rounded-bl" />
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 border-b-4 border-r-4 border-emerald-400 rounded-br" />

                      {/* Animated Scanning Laser Line */}
                      <div className="absolute inset-x-2 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_8px_rgba(52,211,153,1)] animate-pulse top-1/2 -translate-y-1/2" />
                      
                      <div className="text-center px-4">
                        <Scan className="w-6 h-6 text-emerald-400/80 mx-auto animate-pulse" />
                        <span className="text-[10px] text-emerald-300 font-mono tracking-widest uppercase block mt-1">
                          Align QR Code
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Captured or Paused Indicator */}
                {scannedData && !isScanningActive && (
                  <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs flex flex-col items-center justify-center p-4 text-center">
                    <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mb-2">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <p className="text-xs font-bold text-white">QR Code Recognized</p>
                    <p className="text-[11px] font-mono text-emerald-300 max-w-xs truncate mt-0.5">
                      {scannedData}
                    </p>
                    <button
                      type="button"
                      onClick={handleResetScan}
                      className="mt-3 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Scan Another Document</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Camera Controls Bar */}
              <div className="flex flex-wrap items-center justify-between gap-2 p-2 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="flex items-center gap-1.5">
                  {/* Flip Front/Back */}
                  <button
                    type="button"
                    onClick={() => {
                      setFacingMode(facingMode === 'environment' ? 'user' : 'environment');
                    }}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1 cursor-pointer transition-colors"
                    title="Flip camera (front / rear)"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span className="text-[11px]">{facingMode === 'environment' ? 'Rear' : 'Front'}</span>
                  </button>

                  {/* Camera select if multiple */}
                  {availableCameras.length > 1 && (
                    <select
                      value={selectedDeviceId}
                      onChange={(e) => setSelectedDeviceId(e.target.value)}
                      className="bg-slate-800 border border-slate-700 text-slate-300 text-[11px] rounded-lg px-2 py-1 max-w-[130px] truncate"
                    >
                      {availableCameras.map((cam, idx) => (
                        <option key={cam.deviceId || idx} value={cam.deviceId}>
                          {cam.label || `Camera ${idx + 1}`}
                        </option>
                      ))}
                    </select>
                  )}

                  {/* Torch toggle if supported */}
                  {hasTorch && (
                    <button
                      type="button"
                      onClick={toggleTorch}
                      className={`p-1.5 rounded-lg text-xs flex items-center gap-1 cursor-pointer transition-colors ${
                        torchOn ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                      title="Toggle camera flash"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span className="text-[11px]">{torchOn ? 'Flash On' : 'Flash'}</span>
                    </button>
                  )}

                  {/* Manual Snapshot Grab */}
                  {streamActive && isScanningActive && (
                    <button
                      type="button"
                      onClick={handleCaptureSnapshot}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-300 text-xs flex items-center gap-1 cursor-pointer transition-colors"
                      title="Capture hardcopy photo snapshot"
                    >
                      <Camera className="w-3.5 h-3.5 text-sky-400" />
                      <span className="text-[11px]">Snapshot</span>
                    </button>
                  )}
                </div>

                {/* Upload Image fallback */}
                <label className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1 cursor-pointer transition-colors">
                  <Upload className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-[11px]">Upload Image</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Quick Demo QR Codes for 1-click Testing */}
              <div className="p-3 bg-slate-950/40 border border-slate-800/80 rounded-xl space-y-2">
                <span className="text-[10px] font-mono uppercase text-slate-400 block font-semibold">
                  Quick Simulation / Test Scans:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {applications.slice(0, 3).map((app) => (
                    <button
                      key={app.id}
                      type="button"
                      onClick={() => handleDecodedQr(`https://uaevisa.app?tab=agency-crm&appId=${app.id}&action=documents`)}
                      className="text-[11px] bg-slate-800/80 hover:bg-emerald-950/60 hover:text-emerald-300 hover:border-emerald-700 border border-slate-700/80 text-slate-300 px-2.5 py-1 rounded-md transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <QrCode className="w-3 h-3 text-amber-400" />
                      <span className="font-mono">{app.id}</span>
                      <span className="text-[10px] text-slate-400">({app.applicantName.split(' ')[0]})</span>
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => handleDecodedQr(`DOC-PHYSICAL-INTAKE-${Date.now().toString(36).toUpperCase()}`)}
                    className="text-[11px] bg-slate-800/80 hover:bg-sky-950/60 hover:text-sky-300 hover:border-sky-700 border border-slate-700/80 text-slate-300 px-2 py-1 rounded-md transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <QrCode className="w-3 h-3 text-sky-400" />
                    <span>Test Unlinked Barcode</span>
                  </button>
                </div>
              </div>

              {/* Snapshot Preview Card if captured */}
              {capturedSnapshot && (
                <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl flex items-center gap-3">
                  <img
                    src={capturedSnapshot}
                    alt="Physical Document Snapshot"
                    className="w-16 h-12 object-cover rounded-lg border border-slate-700"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-200">Physical Snapshot Captured</p>
                    <p className="text-[11px] text-slate-400 truncate">
                      Will be attached to electronic dossier archive
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCapturedSnapshot(null)}
                    className="text-slate-400 hover:text-white p-1"
                    title="Remove snapshot"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Right Column: Matched Digital Dossier & Physical Linking Form (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              
              {/* Scan Status Banner */}
              {!scannedData ? (
                <div className="p-4 rounded-xl border border-dashed border-slate-700 bg-slate-950/40 text-center py-8 space-y-2">
                  <QrCode className="w-8 h-8 text-slate-500 mx-auto" />
                  <p className="text-sm font-semibold text-slate-300">
                    Point camera at a physical application document or QR sticker
                  </p>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    The scanner automatically matches the barcode or QR payload with existing digital files in your Agency CRM.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  
                  {/* Scanned Payload Banner */}
                  <div className="p-3 bg-emerald-950/30 border border-emerald-500/30 rounded-xl flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-[11px] font-mono text-emerald-400 uppercase font-bold block">
                          Decoded QR / Barcode Payload
                        </span>
                        <p className="text-xs font-mono text-white break-all mt-0.5 font-semibold">
                          {scannedData}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleResetScan}
                      className="text-xs text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 shrink-0"
                      title="Clear & rescan"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Result Card: Matched Application vs Unmatched */}
                  {effectiveApp ? (
                    <div className="p-4 rounded-xl border border-emerald-500/40 bg-gradient-to-br from-emerald-950/20 via-slate-900 to-slate-950 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                            <ShieldCheck className="w-4 h-4" />
                            <span>Digital Dossier Matched:</span>
                          </span>
                          <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                            {effectiveApp.id}
                          </span>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                          effectiveApp.status === 'Approved' || effectiveApp.status === 'Audited - Passed'
                            ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
                            : 'bg-amber-950 text-amber-300 border-amber-700'
                        }`}>
                          {effectiveApp.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3 bg-slate-950/60 rounded-lg border border-slate-800 text-xs">
                        <div>
                          <span className="text-[10px] text-slate-500 uppercase block">Applicant</span>
                          <span className="font-semibold text-slate-200 block truncate">{effectiveApp.applicantName}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 uppercase block">Passport #</span>
                          <span className="font-mono font-bold text-amber-400 block">{effectiveApp.passportNumber}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 uppercase block">Visa Category</span>
                          <span className="text-slate-300 block truncate">{effectiveApp.visaType}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 uppercase block">Nationality</span>
                          <span className="text-slate-300 block">{effectiveApp.nationality}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 uppercase block">Existing Files</span>
                          <span className="font-mono text-sky-400 block">{effectiveApp.documentHistory?.length || 0} versions</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 uppercase block">Urgency</span>
                          <span className="text-slate-300 block">{effectiveApp.urgency || 'Standard'}</span>
                        </div>
                      </div>

                      {/* Linking Form */}
                      {!linkSuccess ? (
                        <div className="space-y-3 pt-2 border-t border-slate-800">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                            <FolderLock className="w-3.5 h-3.5 text-amber-400" />
                            <span>Link Physical Document to this File</span>
                          </h4>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                            <div>
                              <label className="block text-[11px] text-slate-400 mb-1">
                                Document Category
                              </label>
                              <select
                                value={physicalDocType}
                                onChange={(e) => setPhysicalDocType(e.target.value as DocumentAuditType)}
                                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200"
                              >
                                <option value="Physical Document Archive">Physical Document Archive</option>
                                <option value="Physical Intake Dossier">Physical Intake Dossier</option>
                                <option value="Passport OCR">Original Passport Booklet</option>
                                <option value="Attested Degree">Attested Degree Hardcopy</option>
                                <option value="Biometric Photo">Physical Biometric Photos (40x55mm)</option>
                                <option value="Emirates ID / National ID">Emirates ID / National ID Hardcopy</option>
                                <option value="Salary Certificate / Bank Statement">Bank Statement Stamped Physical</option>
                                <option value="Trade License / Work Contract">Tawjeeh / Ministry Work Contract</option>
                                <option value="Other Document">Other Physical Attachment</option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-[11px] text-slate-400 mb-1">
                                Document Label / Title
                              </label>
                              <input
                                type="text"
                                value={physicalDocTitle}
                                onChange={(e) => setPhysicalDocTitle(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200"
                                placeholder="e.g. Original Passport Booklet Deposit"
                              />
                            </div>

                            <div>
                              <label className="block text-[11px] text-slate-400 mb-1">
                                Physical Storage Filing Ref (Shelf/Bin)
                              </label>
                              <input
                                type="text"
                                value={physicalStorageLocation}
                                onChange={(e) => setPhysicalStorageLocation(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-amber-300 font-mono"
                                placeholder="e.g. Cabinet 02 - Shelf B - Slot 14"
                              />
                            </div>

                            <div>
                              <label className="block text-[11px] text-slate-400 mb-1">
                                Physical Condition & Verification
                              </label>
                              <select
                                value={physicalCondition}
                                onChange={(e) => setPhysicalCondition(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200"
                              >
                                <option value="Original Document - Inspected & Pristine">Original Document - Inspected & Pristine</option>
                                <option value="Original Booklet - Deposited in Safe">Original Booklet - Deposited in Safe</option>
                                <option value="Certified True Copy - Notarized">Certified True Copy - Notarized</option>
                                <option value="UAE Embassy & MOFA Stamped">UAE Embassy & MOFA Stamped</option>
                                <option value="Customer Copy Retained">Customer Copy Retained</option>
                              </select>
                            </div>
                          </div>

                          <div>
                            <label className="block text-[11px] text-slate-400 mb-1">
                              Receiving Officer & Remarks
                            </label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              <input
                                type="text"
                                value={receivingOfficer}
                                onChange={(e) => setReceivingOfficer(e.target.value)}
                                className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200"
                                placeholder="Receiving Officer Name"
                              />
                              <input
                                type="text"
                                value={physicalNotes}
                                onChange={(e) => setPhysicalNotes(e.target.value)}
                                className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200"
                                placeholder="Optional audit notes or receipt #"
                              />
                            </div>
                          </div>

                          <div className="pt-2 flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={handleExecuteLinkDocument}
                              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-2 rounded-lg text-xs flex items-center gap-1.5 cursor-pointer shadow-md transition-all active:scale-95"
                            >
                              <FileCheck className="w-4 h-4" />
                              <span>Link & Archive Physical Document</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="p-4 bg-emerald-950/40 border border-emerald-500/50 rounded-xl space-y-3">
                          <div className="flex items-center gap-2 text-emerald-300 font-bold text-xs">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            <span>Physical Document Successfully Linked to {effectiveApp.id}!</span>
                          </div>
                          <p className="text-xs text-slate-300">
                            The physical document has been registered in the digital document history and an official compliance audit event was logged.
                          </p>
                          <div className="flex flex-wrap items-center gap-2 pt-2">
                            {onOpenDocumentHistory && (
                              <button
                                type="button"
                                onClick={() => {
                                  onOpenDocumentHistory(effectiveApp);
                                  onClose();
                                }}
                                className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 cursor-pointer"
                              >
                                <Layers className="w-3.5 h-3.5 text-amber-400" />
                                <span>View Document History</span>
                              </button>
                            )}

                            {onExportDossierPdf && (
                              <button
                                type="button"
                                onClick={() => {
                                  onExportDossierPdf(effectiveApp);
                                }}
                                className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 cursor-pointer"
                              >
                                <FileDown className="w-3.5 h-3.5 text-amber-400" />
                                <span>Export Updated Dossier PDF</span>
                              </button>
                            )}

                            {onSelectApplicationDossier && (
                              <button
                                type="button"
                                onClick={() => {
                                  onSelectApplicationDossier(effectiveApp);
                                  onClose();
                                }}
                                className="bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 cursor-pointer"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>Open Full Dossier</span>
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={handleResetScan}
                              className="text-xs text-slate-400 hover:text-white px-3 py-1.5 ml-auto"
                            >
                              Scan Another Code
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* No exact digital file match -> Offer manual search link or create new */
                    <div className="p-4 rounded-xl border border-amber-500/40 bg-slate-950/60 space-y-4">
                      <div className="flex items-start gap-2.5">
                        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-bold text-amber-300">
                            No existing file automatically matched this QR / Barcode
                          </p>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            You can manually link this physical QR to an existing client file, or register a new visa application dossier.
                          </p>
                        </div>
                      </div>

                      {/* Manual Search & Select existing dossier */}
                      <div className="space-y-2 p-3 bg-slate-900 rounded-lg border border-slate-800">
                        <label className="block text-[11px] font-semibold text-slate-300">
                          Option 1: Link to an existing client application
                        </label>
                        <div className="relative">
                          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            value={manualSearchQuery}
                            onChange={(e) => setManualSearchQuery(e.target.value)}
                            placeholder="Search applicant name, passport # or app ID..."
                            className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-200"
                          />
                        </div>

                        <div className="max-h-36 overflow-y-auto space-y-1">
                          {filteredAppsForManual.slice(0, 5).map((app) => (
                            <button
                              key={app.id}
                              type="button"
                              onClick={() => {
                                setMatchedApp(app);
                                setManualSelectedAppId(app.id);
                              }}
                              className="w-full text-left p-2 rounded bg-slate-950/80 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 flex items-center justify-between text-xs cursor-pointer transition-colors"
                            >
                              <div>
                                <span className="font-semibold text-white block">{app.applicantName}</span>
                                <span className="text-[10px] text-slate-400 font-mono">
                                  {app.id} • {app.passportNumber}
                                </span>
                              </div>
                              <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                                Select & Link
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Create New Application from Scanned Physical Document */}
                      {onAddNewApplicationWithPrefill && (
                        <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                          <span className="text-xs text-slate-400">
                            Option 2: Register brand new file
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              onAddNewApplicationWithPrefill({
                                notes: `Physical document intake registered via QR scanner: ${scannedData}`
                              });
                              onClose();
                            }}
                            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 cursor-pointer"
                          >
                            <span>Create New Dossier from Document</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-slate-800/90 bg-slate-950/80 flex items-center justify-between text-xs text-slate-400 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] font-mono">
              {streamActive ? 'Scanner Active & Ready' : 'Camera Ready'}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
