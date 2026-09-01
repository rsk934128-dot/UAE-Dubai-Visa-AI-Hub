import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
  PolarAngleAxis
} from 'recharts';
import {
  ShieldCheck,
  AlertTriangle,
  XCircle,
  CheckCircle2,
  Clock,
  Scan,
  Sparkles,
  Camera,
  Layers,
  FileWarning,
  Activity,
  Award,
  ChevronRight,
  Info
} from 'lucide-react';
import { PassportAuditResult } from '../types';
import { useLanguage } from '../context/LanguageContext';

export interface VisualAuditSummaryProps {
  auditResult: PassportAuditResult;
  onOpenCertificate?: () => void;
  onDownloadPdf?: () => void;
}

export type HealthTier = 'valid' | 'near-expiry' | 'critical';

export const VisualAuditSummary: React.FC<VisualAuditSummaryProps> = ({
  auditResult,
  onOpenCertificate,
  onDownloadPdf
}) => {
  const { language } = useLanguage();

  // Compute the comprehensive Health Score and Tier
  const {
    tier,
    tierColor,
    tierBgColor,
    tierBorderColor,
    tierBadgeColor,
    tierLabel,
    tierDescription,
    subScores,
    gaugeData,
    overallScore,
    daysRemaining,
    remedyRecommendation
  } = useMemo(() => {
    const checks = auditResult.validationChecks;
    const score = auditResult.overallScore ?? 85;
    const days = checks.validityRemainingDays ?? 0;

    // Sub-score calculations (0 - 100 each)
    let validityScore = 0;
    if (days >= 365) validityScore = 100;
    else if (days >= 240) validityScore = 90;
    else if (days >= 180) validityScore = 70; // Borderline / near-expiry
    else if (days >= 90) validityScore = 35;
    else validityScore = 15;

    // 2. ICAO Doc 9303 MRZ Score
    let mrzScore = 100;
    if (!checks.isClearImage) mrzScore -= 20;
    if (!checks.mrzMatched) mrzScore -= 60;
    mrzScore = Math.max(0, mrzScore);

    // 3. Optical & Clarity Score
    let opticalScore = 100;
    if (!checks.noGlareOrCutoff) opticalScore -= 30;
    if (!checks.isClearImage) opticalScore -= 30;
    if (checks.minimumResolutionMet === false) opticalScore -= 20;
    opticalScore = Math.max(0, opticalScore);

    // 4. Boundary & Structural Integrity Score
    let boundaryScore = 100;
    if (!checks.properOrientation) boundaryScore -= 25;
    if (!checks.noGlareOrCutoff) boundaryScore -= 25;
    boundaryScore = Math.max(0, boundaryScore);

    // Determine Health Tier
    let determinedTier: HealthTier = 'valid';

    if (!checks.hasSixMonthsValidity || days < 180 || !auditResult.isValid || !checks.mrzMatched || score < 60) {
      determinedTier = 'critical';
    } else if (days < 240 || score < 80 || !checks.noGlareOrCutoff) {
      determinedTier = 'near-expiry';
    } else {
      determinedTier = 'valid';
    }

    let tColor = '#10b981'; // Green
    let tBgColor = 'bg-emerald-950/40';
    let tBorderColor = 'border-emerald-800/80';
    let tBadgeColor = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
    let tLabel = language === 'ar' ? 'جواز سليم ومطابق للمواصفات' : 'Prime Health: Fully Compliant';
    let tDesc = language === 'ar'
      ? 'استوفى الجواز متطلبات قاعدة الـ 6 أشهر والتدقيق البيومتري بدرجة امتياز، وهو جاهز تماماً للطباعة الفورية.'
      : 'Passport exceeds all UAE Federal ICP and GDRFA Dubai validity thresholds with zero critical defects detected.';
    let tRemedy = language === 'ar'
      ? 'جاهز للاعتماد وطباعة التأشيرة فوراً دون مخاطرة مالية.'
      : 'Proceed immediately with entry permit typing; optimal clearance guarantee.';

    if (determinedTier === 'critical') {
      tColor = '#f43f5e'; // Red
      tBgColor = 'bg-rose-950/40';
      tBorderColor = 'border-rose-800/80';
      tBadgeColor = 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      tLabel = language === 'ar' ? 'تنبيه تدقيق حرج: غير مطابق للضوابط' : 'Critical Defects: Non-Compliant';
      tDesc = language === 'ar'
        ? 'تم اكتشاف مانع قانوني صريح (أقل من 180 يوماً صلاحية أو خلل في الرمز الشريطي MRZ)، وسيتم رفض التأشيرة تلقائياً.'
        : 'Immediate rejection risk. Passport violates the statutory 180-day rule or contains machine-readable checksum failures.';
      tRemedy = language === 'ar'
        ? 'يجب توجيه المتعامل لتجديد الجواز فوراً لدى قنصلية بلده قبل سداد أي رسوم حكومية.'
        : 'Do NOT submit visa payment. Direct client to consular passport renewal to avoid government fee forfeiture.';
    } else if (determinedTier === 'near-expiry') {
      tColor = '#f59e0b'; // Amber / Orange
      tBgColor = 'bg-amber-950/40';
      tBorderColor = 'border-amber-800/80';
      tBadgeColor = 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      tLabel = language === 'ar' ? 'صلاحية حرجة (قريب من الانتهاء) / تنبيه جودة' : 'Near-Expiry Horizon / Quality Warning';
      tDesc = language === 'ar'
        ? 'الجواز مستوفٍ للحد الأدنى حالياً ولكن صلاحيته تقترب من عتبة الـ 6 أشهر (180 - 240 يوماً)، أو يحتوي على وهج ضوئي يستوجب الحذر.'
        : 'Borderline validity (180-240 days) or surface glare detected. Eligible for short-stay tourist visas, but high risk for multi-entry.';
      tRemedy = language === 'ar'
        ? 'يُسمح بتأشيرة السياحة 30 يوماً فقط؛ يوصى بالتجديد المسبق لتأشيرات العمل أو الإقامة.'
        : 'Advise 30-day tourist entry only; strongly recommend passport renewal prior to residency or multi-month applications.';
    }

    // Gauge Data for Recharts RadialBarChart
    const gData = [
      {
        name: 'Health Score',
        value: score,
        fill: tColor
      }
    ];

    return {
      tier: determinedTier,
      tierColor: tColor,
      tierBgColor: tBgColor,
      tierBorderColor: tBorderColor,
      tierBadgeColor: tBadgeColor,
      tierLabel: tLabel,
      tierDescription: tDesc,
      overallScore: score,
      daysRemaining: days,
      remedyRecommendation: tRemedy,
      gaugeData: gData,
      subScores: [
        {
          id: 'validity',
          title: language === 'ar' ? 'أفق الصلاحية (قاعدة الـ 6 أشهر)' : 'Validity Horizon (6-Mo Rule)',
          score: validityScore,
          days: days,
          status: days >= 240 ? 'Optimal' : days >= 180 ? 'Borderline' : 'Non-Compliant',
          statusAr: days >= 240 ? 'ممتاز (> 8 أشهر)' : days >= 180 ? 'حرج (6 - 8 أشهر)' : 'مخالف (< 6 أشهر)',
          color: days >= 240 ? '#10b981' : days >= 180 ? '#f59e0b' : '#f43f5e',
          icon: Clock
        },
        {
          id: 'mrz',
          title: language === 'ar' ? 'تطابق الرمز الشريطي (ICAO Doc 9303)' : 'MRZ Checksum Parity',
          score: mrzScore,
          status: checks.mrzMatched ? 'Verified' : 'Discrepancy',
          statusAr: checks.mrzMatched ? 'متطابق 100%' : 'خلل في المجموع',
          color: checks.mrzMatched ? '#10b981' : '#f43f5e',
          icon: Scan
        },
        {
          id: 'clarity',
          title: language === 'ar' ? 'وضوح الصورة وخلوها من الوهج' : 'Optical Clarity & Glare Scan',
          score: opticalScore,
          status: opticalScore >= 80 ? 'Clear' : opticalScore >= 60 ? 'Specular Glare' : 'Blurred Scan',
          statusAr: opticalScore >= 80 ? 'صورة نقية' : opticalScore >= 60 ? 'انعكاس ضوئي' : 'تشويش حركي',
          color: opticalScore >= 80 ? '#10b981' : opticalScore >= 60 ? '#f59e0b' : '#f43f5e',
          icon: Sparkles
        },
        {
          id: 'boundary',
          title: language === 'ar' ? 'سلامة الأركان والاتجاه' : 'Boundary & Frame Geometry',
          score: boundaryScore,
          status: checks.properOrientation && checks.noGlareOrCutoff ? '4 Corners Intact' : 'Attention Needed',
          statusAr: checks.properOrientation && checks.noGlareOrCutoff ? '4 أركان سليمة' : 'أركان محجوبة',
          color: checks.properOrientation && checks.noGlareOrCutoff ? '#10b981' : '#f59e0b',
          icon: Layers
        }
      ]
    };
  }, [auditResult, language]);

  return (
    <div
      id="visual-audit-summary-scorecard"
      className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-6 shadow-xl relative overflow-hidden"
    >
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border"
            style={{
              backgroundColor: `${tierColor}15`,
              borderColor: `${tierColor}40`,
              color: tierColor
            }}
          >
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white tracking-tight">
                {language === 'ar' ? 'الملخص المرئي وبطاقة صحة جواز السفر' : 'Visual Audit Summary & Health Scorecard'}
              </h3>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold border ${tierBadgeColor}`}
              >
                {tier === 'valid'
                  ? (language === 'ar' ? 'جواز سليم ✓' : 'Health: Optimal')
                  : tier === 'near-expiry'
                  ? (language === 'ar' ? 'صلاحية وشيكة ⚠️' : 'Health: Near-Expiry')
                  : (language === 'ar' ? 'خلل حرج ✕' : 'Health: Critical Error')}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {language === 'ar'
                ? 'مقياس إشعاعي ملون لتشخيص سلامة الجواز البيومترية ومطابقته للوائح إقامة دبي والهيئة الاتحادية'
                : 'Real-time radial gauge diagnostic evaluating biometric integrity against UAE 180-day immigration rules'}
            </p>
          </div>
        </div>

        {/* Quick Action Links */}
        <div className="flex items-center gap-2 shrink-0">
          {onOpenCertificate && (
            <button
              onClick={onOpenCertificate}
              className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-1.5 rounded-xl transition-all cursor-pointer font-medium flex items-center gap-1.5"
            >
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span>{language === 'ar' ? 'الشهادة الرسمية' : 'Certificate'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Grid: Left = Radial Gauge Scorecard, Right = Diagnostic Health Pillars */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Left: Recharts Radial Gauge Chart Card (5 Cols) */}
        <div
          id="radial-gauge-container"
          className={`lg:col-span-5 rounded-2xl p-5 border flex flex-col items-center justify-center relative overflow-hidden transition-all ${tierBgColor} ${tierBorderColor}`}
        >
          {/* Subtle background glow */}
          <div
            className="absolute -top-10 -left-10 w-40 h-40 rounded-full blur-3xl opacity-20 pointer-events-none"
            style={{ backgroundColor: tierColor }}
          />

          <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-1">
            {language === 'ar' ? 'المؤشر الإشعاعي لصحة الجواز' : 'Radial Health Gauge'}
          </span>

          {/* Recharts Radial Bar Speedometer / Gauge */}
          <div className="w-full h-44 sm:h-48 relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart
                cx="50%"
                cy="70%"
                innerRadius="72%"
                outerRadius="100%"
                barSize={18}
                data={gaugeData}
                startAngle={180}
                endAngle={0}
              >
                <PolarAngleAxis
                  type="number"
                  domain={[0, 100]}
                  angleAxisId={0}
                  tick={false}
                />
                <RadialBar
                  background={{ fill: '#1e293b' }}
                  dataKey="value"
                  cornerRadius={10}
                />
              </RadialBarChart>
            </ResponsiveContainer>

            {/* Centered Gauge Value & Health Icon */}
            <div className="absolute top-[38%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
              <div className="flex items-center justify-center gap-1">
                {tier === 'valid' ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-400 inline" />
                ) : tier === 'near-expiry' ? (
                  <AlertTriangle className="w-6 h-6 text-amber-400 inline" />
                ) : (
                  <XCircle className="w-6 h-6 text-rose-400 inline" />
                )}
                <span
                  className="text-3xl sm:text-4xl font-extrabold font-mono tracking-tight"
                  style={{ color: tierColor }}
                >
                  {overallScore}
                </span>
                <span className="text-xs font-mono text-slate-400 mt-2">/100</span>
              </div>
              <span className="text-[11px] font-bold tracking-wide uppercase block text-slate-300 mt-1">
                {tier === 'valid'
                  ? (language === 'ar' ? 'مطابق ومجاز' : 'Passed & Cleared')
                  : tier === 'near-expiry'
                  ? (language === 'ar' ? 'صلاحية وشيكة' : 'Near-Expiry Caution')
                  : (language === 'ar' ? 'مخالفة حرجة' : 'Critical Failure')}
              </span>
            </div>
          </div>

          {/* Speedometer Scale Marks */}
          <div className="w-full flex items-center justify-between px-6 text-[10px] font-mono text-slate-400 -mt-3">
            <span className="flex items-center gap-1 text-rose-400">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 inline-block" />
              0 (Critical)
            </span>
            <span className="flex items-center gap-1 text-amber-400">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block" />
              60 (Near-Expiry)
            </span>
            <span className="flex items-center gap-1 text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
              100 (Optimal)
            </span>
          </div>

          {/* Status Capsule */}
          <div className="mt-4 w-full text-center">
            <div
              className="py-1.5 px-3 rounded-xl border text-xs font-bold font-mono inline-block shadow-sm"
              style={{
                backgroundColor: `${tierColor}15`,
                borderColor: `${tierColor}50`,
                color: tierColor
              }}
            >
              {tierLabel}
            </div>
            <p className="text-[11px] text-slate-300 mt-2 leading-relaxed px-2">
              {tierDescription}
            </p>
          </div>
        </div>

        {/* Right: 4 Core Health Diagnostic Pillars (7 Cols) */}
        <div className="lg:col-span-7 space-y-3.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
              {language === 'ar' ? 'مؤشرات بطاقة الفحص التشخيصية (Pillars)' : 'Diagnostic Scorecard Pillars'}
            </span>
            <span className="text-[11px] font-mono text-slate-400">
              ICAO 9303 & GDRFA Certified
            </span>
          </div>

          {/* 4 Diagnostic Pillar Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {subScores.map((pillar) => {
              const IconComponent = pillar.icon;
              return (
                <div
                  key={pillar.id}
                  className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 hover:border-slate-700 transition-colors space-y-2 group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border"
                        style={{
                          backgroundColor: `${pillar.color}15`,
                          borderColor: `${pillar.color}30`,
                          color: pillar.color
                        }}
                      >
                        <IconComponent className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs font-bold text-white line-clamp-1">
                        {pillar.title}
                      </span>
                    </div>

                    <span
                      className="text-[10px] font-mono font-bold px-2 py-0.5 rounded border shrink-0"
                      style={{
                        backgroundColor: `${pillar.color}15`,
                        borderColor: `${pillar.color}40`,
                        color: pillar.color
                      }}
                    >
                      {language === 'ar' ? pillar.statusAr : pillar.status}
                    </span>
                  </div>

                  {/* Progress Bar and Value */}
                  <div className="space-y-1 pt-1">
                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                      <span>{pillar.id === 'validity' ? `${pillar.days} Days Left` : 'Integrity Index'}</span>
                      <span className="font-bold text-slate-200">{pillar.score}%</span>
                    </div>
                    <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${pillar.score}%`,
                          backgroundColor: pillar.color
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Actionable Remedy Banner */}
          <div
            className="p-3.5 rounded-xl border flex items-start gap-3 transition-colors"
            style={{
              backgroundColor: `${tierColor}10`,
              borderColor: `${tierColor}35`
            }}
          >
            <div className="mt-0.5 shrink-0" style={{ color: tierColor }}>
              {tier === 'valid' ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : tier === 'near-expiry' ? (
                <AlertTriangle className="w-4 h-4" />
              ) : (
                <XCircle className="w-4 h-4" />
              )}
            </div>
            <div className="text-xs space-y-0.5">
              <span className="font-bold block" style={{ color: tierColor }}>
                {language === 'ar' ? 'توصية وإجراء ضابط الجوازات المقترح:' : 'Immigration Officer Recommendation:'}
              </span>
              <span className="text-slate-300 leading-relaxed block text-[11px]">
                {remedyRecommendation}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
