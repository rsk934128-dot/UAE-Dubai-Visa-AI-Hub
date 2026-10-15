import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Sector
} from 'recharts';
import {
  PieChart as PieChartIcon,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldCheck,
  FileQuestion,
  Filter,
  X,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Layers,
  ArrowUpRight,
  Info
} from 'lucide-react';
import { VisaApplication } from '../types';
import { useLanguage } from '../context/LanguageContext';

export interface ApplicationsStatusDoughnutSectionProps {
  applications: VisaApplication[];
  selectedStatus?: string;
  onSelectStatus?: (status: string) => void;
  onClearStatusFilter?: () => void;
}

interface StatusSliceData {
  name: string;
  key: string;
  value: number;
  percentage: number;
  color: string;
  lightBg: string;
  borderClass: string;
  icon: React.ReactNode;
  description: string;
  category: 'pending' | 'audited' | 'approved' | 'flagged';
}

// Render active enlarged shape for hovered doughnut slice
const renderActiveShape = (props: any) => {
  const {
    cx,
    cy,
    innerRadius,
    outerRadius,
    startAngle,
    endAngle,
    fill,
    payload,
    value,
    percent
  } = props;

  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius - 4}
        outerRadius={outerRadius + 8}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        style={{ filter: `drop-shadow(0px 0px 8px ${fill}66)` }}
      />
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={outerRadius + 10}
        outerRadius={outerRadius + 13}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
    </g>
  );
};

export const ApplicationsStatusDoughnutSection: React.FC<ApplicationsStatusDoughnutSectionProps> = ({
  applications,
  selectedStatus = 'ALL',
  onSelectStatus,
  onClearStatusFilter
}) => {
  const { language } = useLanguage();
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'detailed' | 'grouped'>('detailed');
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

  // Status mapping & colors configuration
  const detailedData: StatusSliceData[] = useMemo(() => {
    const total = applications.length || 1;

    const counts: Record<string, number> = {
      'Approved': 0,
      'Audited - Passed': 0,
      'Audited - Flagged': 0,
      'Submitted to GDRFA/ICP': 0,
      'In Process': 0,
      'Draft': 0,
      'Rejected': 0
    };

    applications.forEach((app) => {
      if (counts[app.status] !== undefined) {
        counts[app.status]++;
      } else {
        counts['Draft'] = (counts['Draft'] || 0) + 1;
      }
    });

    const list: StatusSliceData[] = [
      {
        name: language === 'ar' ? 'تمت الموافقة والإصدار' : 'Approved',
        key: 'Approved',
        value: counts['Approved'],
        percentage: Math.round((counts['Approved'] / total) * 100),
        color: '#10b981', // Emerald
        lightBg: 'bg-emerald-500/10 text-emerald-400',
        borderClass: 'border-emerald-500/30 hover:border-emerald-500/60',
        icon: <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />,
        description: language === 'ar' ? 'تم إصدار التأشيرة / الهوية' : 'Visa issued & residency active',
        category: 'approved'
      },
      {
        name: language === 'ar' ? 'مدقق - مطابق للشروط' : 'Audited - Passed',
        key: 'Audited - Passed',
        value: counts['Audited - Passed'],
        percentage: Math.round((counts['Audited - Passed'] / total) * 100),
        color: '#06b6d4', // Cyan
        lightBg: 'bg-cyan-500/10 text-cyan-400',
        borderClass: 'border-cyan-500/30 hover:border-cyan-500/60',
        icon: <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />,
        description: language === 'ar' ? 'مستوفٍ لقاعدة الـ 6 أشهر والمواصفات' : 'ICAO & 6-Mo validity verified',
        category: 'audited'
      },
      {
        name: language === 'ar' ? 'مدقق - يحتاج تصحيح' : 'Audited - Flagged',
        key: 'Audited - Flagged',
        value: counts['Audited - Flagged'],
        percentage: Math.round((counts['Audited - Flagged'] / total) * 100),
        color: '#f43f5e', // Rose
        lightBg: 'bg-rose-500/10 text-rose-400',
        borderClass: 'border-rose-500/30 hover:border-rose-500/60',
        icon: <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />,
        description: language === 'ar' ? 'مخالفة الصلاحية أو عدم تطابق MRZ' : 'Validity <180d or MRZ defect',
        category: 'flagged'
      },
      {
        name: language === 'ar' ? 'مقدم للإقامة / الهيئة' : 'Submitted to GDRFA/ICP',
        key: 'Submitted to GDRFA/ICP',
        value: counts['Submitted to GDRFA/ICP'],
        percentage: Math.round((counts['Submitted to GDRFA/ICP'] / total) * 100),
        color: '#3b82f6', // Blue
        lightBg: 'bg-blue-500/10 text-blue-400',
        borderClass: 'border-blue-500/30 hover:border-blue-500/60',
        icon: <Clock className="w-3.5 h-3.5 text-blue-400" />,
        description: language === 'ar' ? 'قيد التدقيق الحكومي النهائي' : 'Gov system review in progress',
        category: 'pending'
      },
      {
        name: language === 'ar' ? 'قيد الإجراء والطباعة' : 'In Process',
        key: 'In Process',
        value: counts['In Process'],
        percentage: Math.round((counts['In Process'] / total) * 100),
        color: '#8b5cf6', // Violet
        lightBg: 'bg-violet-500/10 text-violet-400',
        borderClass: 'border-violet-500/30 hover:border-violet-500/60',
        icon: <Clock className="w-3.5 h-3.5 text-violet-400" />,
        description: language === 'ar' ? 'تجهيز المستندات والرسوم' : 'Under agency preparation',
        category: 'pending'
      },
      {
        name: language === 'ar' ? 'مسودة أولية / بانتظار الوثائق' : 'Draft',
        key: 'Draft',
        value: counts['Draft'],
        percentage: Math.round((counts['Draft'] / total) * 100),
        color: '#f59e0b', // Amber
        lightBg: 'bg-amber-500/10 text-amber-400',
        borderClass: 'border-amber-500/30 hover:border-amber-500/60',
        icon: <FileQuestion className="w-3.5 h-3.5 text-amber-400" />,
        description: language === 'ar' ? 'بانتظار رفع الجواز أو الصورة' : 'Pending biometric scan upload',
        category: 'pending'
      }
    ];

    if (counts['Rejected'] > 0) {
      list.push({
        name: language === 'ar' ? 'مرفوض' : 'Rejected',
        key: 'Rejected',
        value: counts['Rejected'],
        percentage: Math.round((counts['Rejected'] / total) * 100),
        color: '#64748b',
        lightBg: 'bg-slate-500/10 text-slate-400',
        borderClass: 'border-slate-500/30 hover:border-slate-500/60',
        icon: <AlertTriangle className="w-3.5 h-3.5 text-slate-400" />,
        description: language === 'ar' ? 'مرفوض من الجهات الرسمية' : 'Rejected by authorities',
        category: 'flagged'
      });
    }

    return list;
  }, [applications, language]);

  // High-level grouped view (Pending, Audited, Approved) as explicitly specified in user prompt:
  // "show 'Applications by Status' (e.g., Pending, Audited, Approved) as a doughnut chart"
  const groupedData: StatusSliceData[] = useMemo(() => {
    const total = applications.length || 1;

    let pendingCount = 0;
    let auditedPassedCount = 0;
    let auditedFlaggedCount = 0;
    let approvedCount = 0;

    applications.forEach((app) => {
      if (app.status === 'Approved') {
        approvedCount++;
      } else if (app.status === 'Audited - Passed') {
        auditedPassedCount++;
      } else if (app.status === 'Audited - Flagged') {
        auditedFlaggedCount++;
      } else {
        // 'Draft', 'Submitted to GDRFA/ICP', 'In Process', etc.
        pendingCount++;
      }
    });

    return [
      {
        name: language === 'ar' ? 'تمت الموافقة (Approved)' : 'Approved',
        key: 'Approved',
        value: approvedCount,
        percentage: Math.round((approvedCount / total) * 100),
        color: '#10b981', // Emerald
        lightBg: 'bg-emerald-500/10 text-emerald-400',
        borderClass: 'border-emerald-500/30 hover:border-emerald-500/60',
        icon: <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />,
        description: language === 'ar' ? 'التأشيرات المنجزة والمعتمدة رسمياً' : 'Visas issued & cleared for entry',
        category: 'approved'
      },
      {
        name: language === 'ar' ? 'مدقق ومطابق (Audited - Passed)' : 'Audited (Passed)',
        key: 'Audited - Passed',
        value: auditedPassedCount,
        percentage: Math.round((auditedPassedCount / total) * 100),
        color: '#06b6d4', // Cyan
        lightBg: 'bg-cyan-500/10 text-cyan-400',
        borderClass: 'border-cyan-500/30 hover:border-cyan-500/60',
        icon: <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />,
        description: language === 'ar' ? 'جوازات مدققة وجاهزة للتقديم' : 'Pre-screened & ready for fee submission',
        category: 'audited'
      },
      {
        name: language === 'ar' ? 'قيد الانتظار والمعالجة (Pending)' : 'Pending Processing',
        key: 'Pending',
        value: pendingCount,
        percentage: Math.round((pendingCount / total) * 100),
        color: '#f59e0b', // Amber
        lightBg: 'bg-amber-500/10 text-amber-400',
        borderClass: 'border-amber-500/30 hover:border-amber-500/60',
        icon: <Clock className="w-3.5 h-3.5 text-amber-400" />,
        description: language === 'ar' ? 'مسودات وملفات بانتظار الإجراء أو الرد الحكومي' : 'Drafts, intakes & GDRFA/ICP queued files',
        category: 'pending'
      },
      {
        name: language === 'ar' ? 'ملفات معلقة للتصحيح (Flagged)' : 'Audited (Flagged)',
        key: 'Audited - Flagged',
        value: auditedFlaggedCount,
        percentage: Math.round((auditedFlaggedCount / total) * 100),
        color: '#f43f5e', // Rose
        lightBg: 'bg-rose-500/10 text-rose-400',
        borderClass: 'border-rose-500/30 hover:border-rose-500/60',
        icon: <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />,
        description: language === 'ar' ? 'جوازات أقل من 6 أشهر أو صور غير مطابقة' : 'Defect flagged (validity or photo)',
        category: 'flagged'
      }
    ];
  }, [applications, language]);

  const activeChartData = viewMode === 'detailed' ? detailedData : groupedData;
  const filteredData = activeChartData.filter((d) => d.value > 0);

  // If no data exists, provide a fallback placeholder so chart still renders gracefully
  const chartDataToRender = filteredData.length > 0
    ? filteredData
    : activeChartData;

  // Active slice calculation
  const hoveredItem = activeIndex !== null && chartDataToRender[activeIndex]
    ? chartDataToRender[activeIndex]
    : null;

  // Total and clearance calculations
  const totalApps = applications.length;
  const approvedOrPassedCount = applications.filter(
    (a) => a.status === 'Approved' || a.status === 'Audited - Passed'
  ).length;
  const clearanceRate = totalApps > 0 ? Math.round((approvedOrPassedCount / totalApps) * 100) : 0;
  const flaggedCount = applications.filter((a) => a.status === 'Audited - Flagged').length;

  const handleSliceClick = (data: StatusSliceData) => {
    if (!onSelectStatus) return;

    if (viewMode === 'grouped') {
      if (data.key === 'Pending') {
        // If clicking pending in grouped view, set filter to Draft or toggle
        if (selectedStatus === 'Draft' || selectedStatus === 'Submitted to GDRFA/ICP') {
          onClearStatusFilter ? onClearStatusFilter() : onSelectStatus('ALL');
        } else {
          onSelectStatus('Draft');
        }
      } else {
        if (selectedStatus === data.key) {
          onClearStatusFilter ? onClearStatusFilter() : onSelectStatus('ALL');
        } else {
          onSelectStatus(data.key);
        }
      }
    } else {
      if (selectedStatus === data.key) {
        onClearStatusFilter ? onClearStatusFilter() : onSelectStatus('ALL');
      } else {
        onSelectStatus(data.key);
      }
    }
  };

  return (
    <div
      id="applications-by-status-section"
      className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl backdrop-blur-md transition-all duration-300 relative overflow-hidden"
    >
      {/* Subtle background glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-sky-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-3 relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <PieChartIcon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <span>{language === 'ar' ? 'توزيع الطلبات حسب الحالة' : 'Applications by Status'}</span>
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-amber-300 border border-amber-500/30">
                Recharts Doughnut
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {language === 'ar'
                ? 'مخطط دائري تفاعلي لمراقبة دورة حياة التأشيرة من المسودة الأولية حتى الموافقة النهائية.'
                : 'Real-time interactive breakdown across pipeline stages (Pending, Audited, Approved). Click slices to filter.'}
            </p>
          </div>
        </div>

        {/* View Mode & Collapse Controls */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          {/* Detailed vs High-level toggle */}
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-medium">
            <button
              id="btn-status-view-detailed"
              type="button"
              onClick={() => setViewMode('detailed')}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer text-xs flex items-center gap-1.5 ${
                viewMode === 'detailed'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="View all individual pipeline status stages"
            >
              <Layers className="w-3 h-3" />
              <span>{language === 'ar' ? 'تفصيلي (7 حالات)' : 'Detailed'}</span>
            </button>
            <button
              id="btn-status-view-grouped"
              type="button"
              onClick={() => setViewMode('grouped')}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer text-xs flex items-center gap-1.5 ${
                viewMode === 'grouped'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="View aggregated high-level categories: Pending, Audited, Approved"
            >
              <Sparkles className="w-3 h-3" />
              <span>{language === 'ar' ? 'ملخص عام' : 'High-Level (Pending/Audited/Approved)'}</span>
            </button>
          </div>

          {/* Collapse/Expand Toggle */}
          <button
            id="btn-toggle-status-doughnut-collapse"
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors cursor-pointer"
            title={isCollapsed ? 'Expand visualization' : 'Collapse visualization'}
          >
            {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Active Filter Bar if a slice is currently filtering the table */}
      {selectedStatus !== 'ALL' && (
        <div className="mt-3 bg-amber-500/10 border border-amber-500/30 rounded-xl px-3 py-2 flex items-center justify-between text-xs text-amber-300 animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-amber-400" />
            <span>
              {language === 'ar' ? 'التصفية الحالية في الجدول:' : 'Active table filter:'}{' '}
              <strong className="text-white font-mono bg-slate-900 px-2 py-0.5 rounded border border-amber-500/30">
                {selectedStatus}
              </strong>
            </span>
          </div>
          <button
            type="button"
            onClick={() => onClearStatusFilter ? onClearStatusFilter() : onSelectStatus && onSelectStatus('ALL')}
            className="hover:bg-amber-500/20 text-amber-200 hover:text-white px-2 py-0.5 rounded-md flex items-center gap-1 font-semibold transition-colors cursor-pointer"
          >
            <X className="w-3 h-3" />
            <span>{language === 'ar' ? 'إلغاء التصفية' : 'Clear Filter'}</span>
          </button>
        </div>
      )}

      {/* Collapsible Content Body */}
      {!isCollapsed && (
        <div className="mt-4 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Left Column: Recharts Doughnut Chart Canvas */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center relative">
            <div className="w-full h-64 sm:h-72 relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload as StatusSliceData;
                        return (
                          <div className="bg-slate-950/95 border border-slate-700/80 rounded-xl p-3 shadow-2xl backdrop-blur-md text-xs space-y-1 z-50">
                            <div className="flex items-center gap-2 font-bold text-white">
                              <span
                                className="w-2.5 h-2.5 rounded-full"
                                style={{ backgroundColor: data.color }}
                              />
                              <span>{data.name}</span>
                            </div>
                            <div className="text-slate-300 flex items-center justify-between gap-4 font-mono">
                              <span>{language === 'ar' ? 'العدد:' : 'Count:'} {data.value}</span>
                              <span className="text-amber-400 font-bold">{data.percentage}%</span>
                            </div>
                            <p className="text-[10px] text-slate-400 border-t border-slate-800 pt-1 mt-1">
                              {data.description}
                            </p>
                            <p className="text-[9px] text-sky-400 font-semibold italic">
                              {language === 'ar' ? 'انقر لتصفية جدول الملفات' : 'Click to filter CRM table'}
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />

                  <Pie
                    data={chartDataToRender}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={68}
                    outerRadius={98}
                    paddingAngle={4}
                    cornerRadius={5}
                    activeIndex={activeIndex !== null ? activeIndex : undefined}
                    activeShape={renderActiveShape}
                    onMouseEnter={(_, index) => setActiveIndex(index)}
                    onMouseLeave={() => setActiveIndex(null)}
                    onClick={(entry: any) => {
                      const payload = entry?.payload || entry;
                      if (payload && payload.key) {
                        handleSliceClick(payload as StatusSliceData);
                      }
                    }}
                    className="cursor-pointer outline-none"
                  >
                    {chartDataToRender.map((entry, index) => {
                      const isFilterActive = selectedStatus === entry.key;
                      return (
                        <Cell
                          key={`status-slice-${index}`}
                          fill={entry.color}
                          stroke={isFilterActive ? '#ffffff' : '#0f172a'}
                          strokeWidth={isFilterActive ? 3 : 2}
                          className="transition-all duration-300"
                        />
                      );
                    })}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>

              {/* Center Donut Hole Information Display */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-4">
                {hoveredItem ? (
                  <div className="animate-in fade-in zoom-in-90 duration-150">
                    <span
                      className="text-2xl sm:text-3xl font-black font-mono block"
                      style={{ color: hoveredItem.color }}
                    >
                      {hoveredItem.value}
                    </span>
                    <span className="text-[10px] uppercase font-bold text-slate-300 tracking-wider block max-w-[120px] truncate mx-auto">
                      {hoveredItem.name}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 block mt-0.5">
                      {hoveredItem.percentage}% {language === 'ar' ? 'من الإجمالي' : 'of total'}
                    </span>
                  </div>
                ) : (
                  <div>
                    <span className="text-3xl sm:text-4xl font-black font-mono text-white block">
                      {totalApps}
                    </span>
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                      {language === 'ar' ? 'إجمالي الملفات' : 'Total Dossiers'}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full mt-1">
                      {clearanceRate}% {language === 'ar' ? 'مطابق' : 'Cleared'}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Quick helper tip */}
            <span className="text-[11px] text-slate-500 flex items-center gap-1 mt-1">
              <Info className="w-3 h-3 text-slate-400" />
              {language === 'ar' ? 'مرر للتفاصيل أو انقر للعزل في الجدول' : 'Hover for slice details • Click to filter table'}
            </span>
          </div>

          {/* Right Column: Status Breakdown Cards & Interactive Legend */}
          <div className="lg:col-span-7 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {activeChartData.map((item, idx) => {
                const isSelected = selectedStatus === item.key;
                const isHovered = activeIndex === idx;

                return (
                  <div
                    key={item.key}
                    id={`status-card-${item.key.toLowerCase().replace(/\s+/g, '-')}`}
                    onClick={() => handleSliceClick(item)}
                    onMouseEnter={() => setActiveIndex(idx)}
                    onMouseLeave={() => setActiveIndex(null)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer relative overflow-hidden group ${
                      isSelected
                        ? 'bg-slate-800/90 border-amber-500 ring-1 ring-amber-500/50 shadow-md'
                        : isHovered
                        ? 'bg-slate-800/60 border-slate-700'
                        : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-900/60'
                    }`}
                  >
                    {/* Top row */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-xs font-bold text-white truncate group-hover:text-amber-300 transition-colors">
                          {item.name}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0 font-mono">
                        <span className="text-xs font-bold text-white">{item.value}</span>
                        <span className="text-[10px] text-slate-400">({item.percentage}%)</span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-800/80 rounded-full h-1.5 mt-2 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${item.percentage}%`,
                          backgroundColor: item.color
                        }}
                      />
                    </div>

                    {/* Bottom description and filter link */}
                    <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-800/60 text-[10px] text-slate-400">
                      <span className="truncate pr-2">{item.description}</span>
                      <span className="text-amber-400 group-hover:underline flex items-center gap-0.5 shrink-0 font-medium">
                        {isSelected ? (language === 'ar' ? 'مفعل' : 'Filtered') : (language === 'ar' ? 'تصفية' : 'Filter')}
                        <ArrowUpRight className="w-2.5 h-2.5" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quick KPI Insights Strip */}
            <div className="grid grid-cols-3 gap-2 pt-1">
              <div className="bg-slate-950/40 border border-slate-800/60 rounded-xl p-2.5 text-center">
                <span className="text-[10px] text-slate-400 uppercase font-mono block">
                  {language === 'ar' ? 'نسبة الامتثال' : 'Clearance Rate'}
                </span>
                <span className="text-base font-bold font-mono text-emerald-400 mt-0.5 block">
                  {clearanceRate}%
                </span>
                <span className="text-[9px] text-slate-500 block">
                  {approvedOrPassedCount} {language === 'ar' ? 'جاهز' : 'ready/approved'}
                </span>
              </div>

              <div className="bg-slate-950/40 border border-slate-800/60 rounded-xl p-2.5 text-center">
                <span className="text-[10px] text-slate-400 uppercase font-mono block">
                  {language === 'ar' ? 'تحت الإجراء' : 'Under Review'}
                </span>
                <span className="text-base font-bold font-mono text-sky-400 mt-0.5 block">
                  {applications.filter(a => a.status === 'Submitted to GDRFA/ICP' || a.status === 'In Process').length}
                </span>
                <span className="text-[9px] text-slate-500 block">
                  {language === 'ar' ? 'بوابة الهيئة والإقامة' : 'Gov system queue'}
                </span>
              </div>

              <div className="bg-slate-950/40 border border-slate-800/60 rounded-xl p-2.5 text-center">
                <span className="text-[10px] text-slate-400 uppercase font-mono block">
                  {language === 'ar' ? 'بحاجة لتصحيح' : 'Action Required'}
                </span>
                <span className="text-base font-bold font-mono text-rose-400 mt-0.5 block">
                  {flaggedCount}
                </span>
                <span className="text-[9px] text-slate-500 block">
                  {language === 'ar' ? 'تجديد جواز / صورة' : 'Passport/photo issue'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
