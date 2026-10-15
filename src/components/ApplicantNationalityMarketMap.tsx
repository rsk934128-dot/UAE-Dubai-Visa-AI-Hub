import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { 
  Globe, 
  MapPin, 
  Users, 
  TrendingUp, 
  Filter, 
  Download, 
  ArrowUpRight, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  PieChart, 
  BarChart3, 
  Layers, 
  Sparkles, 
  Navigation,
  DollarSign,
  ChevronRight,
  Maximize2
} from 'lucide-react';
import { VisaApplication } from '../types';
import { useLanguage } from '../context/LanguageContext';

export interface NationalityMarketData {
  nationality: string;
  countryCode: string;
  flag: string;
  region: string;
  lat: number;
  lng: number;
  totalApplicants: number;
  approvedCount: number;
  flaggedCount: number;
  submittedCount: number;
  draftCount: number;
  approvalRate: number; // 0 - 100
  topVisaType: string;
  estimatedRevenueAED: number;
  avgScore: number;
}

// Geographic centroid reference coordinates for top UAE visa sourcing countries
const COUNTRY_COORDINATES: Record<string, { lat: number; lng: number; code: string; flag: string; region: string }> = {
  'Bangladeshi': { lat: 23.6850, lng: 90.3563, code: 'BGD', flag: '🇧🇩', region: 'South Asia' },
  'Bangladesh': { lat: 23.6850, lng: 90.3563, code: 'BGD', flag: '🇧🇩', region: 'South Asia' },
  'Indian': { lat: 20.5937, lng: 78.9629, code: 'IND', flag: '🇮🇳', region: 'South Asia' },
  'India': { lat: 20.5937, lng: 78.9629, code: 'IND', flag: '🇮🇳', region: 'South Asia' },
  'Pakistani': { lat: 30.3753, lng: 69.3451, code: 'PAK', flag: '🇵🇰', region: 'South Asia' },
  'Pakistan': { lat: 30.3753, lng: 69.3451, code: 'PAK', flag: '🇵🇰', region: 'South Asia' },
  'Filipino': { lat: 12.8797, lng: 121.7740, code: 'PHL', flag: '🇵🇭', region: 'Southeast Asia' },
  'Philippines': { lat: 12.8797, lng: 121.7740, code: 'PHL', flag: '🇵🇭', region: 'Southeast Asia' },
  'Egyptian': { lat: 26.8206, lng: 30.8025, code: 'EGY', flag: '🇪🇬', region: 'MENA' },
  'Egypt': { lat: 26.8206, lng: 30.8025, code: 'EGY', flag: '🇪🇬', region: 'MENA' },
  'Nepalese': { lat: 28.3949, lng: 84.1240, code: 'NPL', flag: '🇳🇵', region: 'South Asia' },
  'Nepal': { lat: 28.3949, lng: 84.1240, code: 'NPL', flag: '🇳🇵', region: 'South Asia' },
  'British': { lat: 55.3781, lng: -3.4360, code: 'GBR', flag: '🇬🇧', region: 'Europe' },
  'United Kingdom': { lat: 55.3781, lng: -3.4360, code: 'GBR', flag: '🇬🇧', region: 'Europe' },
  'Nigerian': { lat: 9.0820, lng: 8.6753, code: 'NGA', flag: '🇳🇬', region: 'Africa' },
  'Nigeria': { lat: 9.0820, lng: 8.6753, code: 'NGA', flag: '🇳🇬', region: 'Africa' },
  'Sri Lankan': { lat: 7.8731, lng: 80.7718, code: 'LKA', flag: '🇱🇰', region: 'South Asia' },
  'Sri Lanka': { lat: 7.8731, lng: 80.7718, code: 'LKA', flag: '🇱🇰', region: 'South Asia' },
  'Russian': { lat: 61.5240, lng: 105.3188, code: 'RUS', flag: '🇷🇺', region: 'Eurasia' },
  'Russia': { lat: 61.5240, lng: 105.3188, code: 'RUS', flag: '🇷🇺', region: 'Eurasia' },
  'Emirati': { lat: 23.4241, lng: 53.8478, code: 'ARE', flag: '🇦🇪', region: 'GCC' },
  'United Arab Emirates': { lat: 23.4241, lng: 53.8478, code: 'ARE', flag: '🇦🇪', region: 'GCC' }
};

// Destination Dubai / UAE coordinate
const DUBAI_COORDS = { lat: 25.2048, lng: 55.2708, label: 'Dubai (GDRFA Hub)', flag: '🇦🇪' };

interface ApplicantNationalityMarketMapProps {
  applications: VisaApplication[];
  onSelectNationality?: (nationality: string) => void;
  selectedNationality?: string | null;
}

export const ApplicantNationalityMarketMap: React.FC<ApplicantNationalityMarketMapProps> = ({
  applications,
  onSelectNationality,
  selectedNationality
}) => {
  const { language } = useLanguage();
  const svgRef = useRef<SVGSVGElement | null>(null);
  const barChartRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [viewMode, setViewMode] = useState<'map' | 'bars' | 'split'>('split');
  const [metricMode, setMetricMode] = useState<'volume' | 'approval' | 'revenue'>('volume');
  const [selectedFilterCategory, setSelectedFilterCategory] = useState<string>('ALL');
  const [hoveredMarket, setHoveredMarket] = useState<NationalityMarketData | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);

  // Group applications by nationality with detailed aggregations
  const marketData: NationalityMarketData[] = useMemo(() => {
    const filteredApps = selectedFilterCategory === 'ALL'
      ? applications
      : applications.filter(a => a.visaType.toLowerCase().includes(selectedFilterCategory.toLowerCase()));

    const map = new Map<string, {
      total: number;
      approved: number;
      flagged: number;
      submitted: number;
      draft: number;
      scores: number[];
      visaTypes: Record<string, number>;
      revenue: number;
    }>();

    filteredApps.forEach(app => {
      // Normalize nationality label
      const nat = app.nationality || 'Other';
      const existing = map.get(nat) || {
        total: 0,
        approved: 0,
        flagged: 0,
        submitted: 0,
        draft: 0,
        scores: [],
        visaTypes: {},
        revenue: 0
      };

      existing.total += 1;
      if (app.status === 'Approved') existing.approved += 1;
      if (app.status === 'Audited - Flagged' || app.status === 'Rejected') existing.flagged += 1;
      if (app.status === 'Submitted to GDRFA/ICP') existing.submitted += 1;
      if (app.status === 'Draft' || app.status === 'Audited - Passed') existing.draft += 1;

      if (app.passportAudit?.overallScore) {
        existing.scores.push(app.passportAudit.overallScore);
      } else {
        existing.scores.push(app.status === 'Audited - Flagged' ? 60 : 92);
      }

      // Track visa types
      existing.visaTypes[app.visaType] = (existing.visaTypes[app.visaType] || 0) + 1;

      // Estimate typing & agency processing revenue
      let fee = 350; // standard 30-day
      if (app.visaType.includes('60-Day')) fee = 650;
      if (app.visaType.includes('Green Visa')) fee = 2280;
      if (app.visaType.includes('Golden Visa')) fee = 3850;
      if (app.visaType.includes('Remote Work')) fee = 1450;
      existing.revenue += fee;

      map.set(nat, existing);
    });

    const results: NationalityMarketData[] = [];

    map.forEach((data, nat) => {
      const coordInfo = COUNTRY_COORDINATES[nat] || {
        lat: 20 + Math.random() * 20,
        lng: 70 + Math.random() * 30,
        code: nat.substring(0, 3).toUpperCase(),
        flag: '🌐',
        region: 'International'
      };

      // Top visa type
      let topVisa = '30-Day Single Entry Tourist Visa';
      let maxCount = -1;
      Object.entries(data.visaTypes).forEach(([vt, cnt]) => {
        if (cnt > maxCount) {
          maxCount = cnt;
          topVisa = vt;
        }
      });

      const avgScore = data.scores.length > 0 
        ? Math.round(data.scores.reduce((a, b) => a + b, 0) / data.scores.length) 
        : 85;

      const approvalRate = data.total > 0
        ? Math.round(((data.approved + data.submitted) / data.total) * 100)
        : 0;

      results.push({
        nationality: nat,
        countryCode: coordInfo.code,
        flag: coordInfo.flag,
        region: coordInfo.region,
        lat: coordInfo.lat,
        lng: coordInfo.lng,
        totalApplicants: data.total,
        approvedCount: data.approved,
        flaggedCount: data.flagged,
        submittedCount: data.submitted,
        draftCount: data.draft,
        approvalRate,
        topVisaType: topVisa,
        estimatedRevenueAED: data.revenue,
        avgScore
      });
    });

    // Sort descending by total applicants
    return results.sort((a, b) => b.totalApplicants - a.totalApplicants);
  }, [applications, selectedFilterCategory]);

  const totalMarketApplicants = useMemo(() => {
    return marketData.reduce((sum, m) => sum + m.totalApplicants, 0);
  }, [marketData]);

  const topCountry = marketData[0] || null;

  // D3 Geographic Arc & Bubble Map Rendering
  useEffect(() => {
    if (!svgRef.current || marketData.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = 760;
    const height = 440;

    svg.attr('viewBox', `0 0 ${width} ${height}`);

    // Create container group
    const g = svg.append('g').attr('class', 'main-map-group');

    // Subtle dark grid background representing latitude & longitude
    const gridGroup = g.append('g').attr('class', 'grid-lines').attr('opacity', 0.2);

    for (let x = 60; x < width; x += 60) {
      gridGroup.append('line')
        .attr('x1', x)
        .attr('y1', 20)
        .attr('x2', x)
        .attr('y2', height - 20)
        .attr('stroke', '#334155')
        .attr('stroke-dasharray', '2,4')
        .attr('stroke-width', 1);
    }
    for (let y = 40; y < height; y += 50) {
      gridGroup.append('line')
        .attr('x1', 20)
        .attr('y1', y)
        .attr('x2', width - 20)
        .attr('y2', y)
        .attr('stroke', '#334155')
        .attr('stroke-dasharray', '2,4')
        .attr('stroke-width', 1);
    }

    // Projection bounds centered around Middle East & Indian Ocean / Asia / Europe corridor
    // Map bounds: Longitude from -10 (UK) to 130 (Philippines); Latitude from 0 to 60
    const minLng = -15;
    const maxLng = 135;
    const minLat = 5;
    const maxLat = 58;

    const scaleX = d3.scaleLinear()
      .domain([minLng, maxLng])
      .range([40, width - 40]);

    const scaleY = d3.scaleLinear()
      .domain([minLat, maxLat])
      .range([height - 50, 40]); // Invert latitude for standard SVG Y

    // Dubai Hub Coordinates
    const dubaiX = scaleX(DUBAI_COORDS.lng);
    const dubaiY = scaleY(DUBAI_COORDS.lat);

    // Max applications for radius scaling
    const maxApplicants = d3.max(marketData, d => d.totalApplicants) || 1;
    const radiusScale = d3.scaleSqrt()
      .domain([1, maxApplicants])
      .range([14, 38]);

    // Color scale for metric
    const colorScale = d3.scaleLinear<string>()
      .domain([0, 50, 100])
      .range(['#ef4444', '#f59e0b', '#10b981']);

    // Defs for gradients and glow filters
    const defs = svg.append('defs');

    // Glow filter
    const filter = defs.append('filter').attr('id', 'glow').attr('x', '-50%').attr('y', '-50%').attr('width', '200%').attr('height', '200%');
    filter.append('feGaussianBlur').attr('stdDeviation', '4').attr('result', 'coloredBlur');
    const feMerge = filter.append('feMerge');
    feMerge.append('feMergeNode').attr('in', 'coloredBlur');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    // Corridor Flight Arcs connecting origin countries to Dubai
    const arcsGroup = g.append('g').attr('class', 'flight-arcs');

    marketData.forEach((d) => {
      const originX = scaleX(d.lng);
      const originY = scaleY(d.lat);

      // Mid-point with curve displacement for flight corridor
      const midX = (originX + dubaiX) / 2;
      const midY = Math.min(originY, dubaiY) - Math.abs(originX - dubaiX) * 0.18;

      const pathData = `M ${originX} ${originY} Q ${midX} ${midY} ${dubaiX} ${dubaiY}`;

      // Arc gradient
      const arcGradId = `arc-grad-${d.countryCode}`;
      const arcGrad = defs.append('linearGradient')
        .attr('id', arcGradId)
        .attr('gradientUnits', 'userSpaceOnUse')
        .attr('x1', originX).attr('y1', originY)
        .attr('x2', dubaiX).attr('y2', dubaiY);

      arcGrad.append('stop').attr('offset', '0%').attr('stop-color', '#38bdf8').attr('stop-opacity', 0.85);
      arcGrad.append('stop').attr('offset', '100%').attr('stop-color', '#f59e0b').attr('stop-opacity', 0.95);

      // Draw background curve
      arcsGroup.append('path')
        .attr('d', pathData)
        .attr('fill', 'none')
        .attr('stroke', `url(#${arcGradId})`)
        .attr('stroke-width', Math.max(1.5, Math.min(4, d.totalApplicants * 0.9)))
        .attr('stroke-dasharray', '4,4')
        .attr('opacity', selectedNationality && selectedNationality === d.nationality ? 1 : 0.65)
        .style('transition', 'all 0.3s ease');

      // Moving particle dot on top corridor
      if (d.totalApplicants >= 2) {
        const particle = arcsGroup.append('circle')
          .attr('r', 2.5)
          .attr('fill', '#fde047')
          .attr('filter', 'url(#glow)');

        // Simple animation loop along path
        function repeatAnimation() {
          particle
            .transition()
            .duration(3200 + Math.random() * 800)
            .ease(d3.easeLinear)
            .attrTween('transform', function() {
              return function(t: number) {
                // Approximate quadratic bezier formula: (1-t)^2 * P0 + 2*(1-t)*t*P1 + t^2*P2
                const curX = (1 - t) * (1 - t) * originX + 2 * (1 - t) * t * midX + t * t * dubaiX;
                const curY = (1 - t) * (1 - t) * originY + 2 * (1 - t) * t * midY + t * t * dubaiY;
                return `translate(${curX}, ${curY})`;
              };
            })
            .on('end', repeatAnimation);
        }
        repeatAnimation();
      }
    });

    // Destination: Dubai Central Hub Marker
    const dubaiGroup = g.append('g').attr('transform', `translate(${dubaiX}, ${dubaiY})`).attr('class', 'dubai-hub');

    // Dubai Outer Pulse Ring
    dubaiGroup.append('circle')
      .attr('r', 24)
      .attr('fill', 'none')
      .attr('stroke', '#f59e0b')
      .attr('stroke-width', 1.5)
      .attr('opacity', 0.4)
      .append('animate')
      .attr('attributeName', 'r')
      .attr('values', '16;30;16')
      .attr('dur', '3s')
      .attr('repeatCount', 'indefinite');

    dubaiGroup.append('circle')
      .attr('r', 12)
      .attr('fill', '#f59e0b')
      .attr('filter', 'url(#glow)')
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 2);

    dubaiGroup.append('text')
      .attr('y', -18)
      .attr('text-anchor', 'middle')
      .attr('fill', '#fde047')
      .attr('font-size', '11px')
      .attr('font-weight', 'bold')
      .text('🇦🇪 DUBAI HUB (GDRFA/ICP)');

    // Country Bubbles Group
    const bubblesGroup = g.append('g').attr('class', 'country-bubbles');

    marketData.forEach(d => {
      const cx = scaleX(d.lng);
      const cy = scaleY(d.lat);
      const r = radiusScale(d.totalApplicants);
      const isSelected = selectedNationality === d.nationality;
      const isTop = topCountry?.nationality === d.nationality;

      const bubbleNode = bubblesGroup.append('g')
        .attr('transform', `translate(${cx}, ${cy})`)
        .attr('class', `bubble-${d.countryCode} cursor-pointer`)
        .on('mouseenter', (event) => {
          setHoveredMarket(d);
          const rect = containerRef.current?.getBoundingClientRect();
          if (rect) {
            setTooltipPos({
              x: event.clientX - rect.left,
              y: event.clientY - rect.top
            });
          }
        })
        .on('mousemove', (event) => {
          const rect = containerRef.current?.getBoundingClientRect();
          if (rect) {
            setTooltipPos({
              x: event.clientX - rect.left,
              y: event.clientY - rect.top
            });
          }
        })
        .on('mouseleave', () => {
          setHoveredMarket(null);
          setTooltipPos(null);
        })
        .on('click', () => {
          if (onSelectNationality) {
            onSelectNationality(isSelected ? 'ALL' : d.nationality);
          }
        });

      // Animated beacon ring for top sourcing country (e.g. Bangladesh)
      if (isTop) {
        bubbleNode.append('circle')
          .attr('r', r + 10)
          .attr('fill', 'none')
          .attr('stroke', '#38bdf8')
          .attr('stroke-width', 2)
          .attr('opacity', 0.5)
          .append('animate')
          .attr('attributeName', 'r')
          .attr('values', `${r + 4};${r + 14};${r + 4}`)
          .attr('dur', '2.5s')
          .attr('repeatCount', 'indefinite');
      }

      // Outer Bubble Circle
      const baseColor = metricMode === 'approval' 
        ? colorScale(d.approvalRate)
        : metricMode === 'revenue'
          ? '#10b981'
          : (isTop ? '#0284c7' : '#334155');

      bubbleNode.append('circle')
        .attr('r', r)
        .attr('fill', baseColor)
        .attr('fill-opacity', isSelected ? 0.95 : 0.75)
        .attr('stroke', isSelected ? '#38bdf8' : (isTop ? '#7dd3fc' : '#64748b'))
        .attr('stroke-width', isSelected ? 3 : (isTop ? 2.5 : 1.5))
        .attr('filter', isSelected || isTop ? 'url(#glow)' : null)
        .style('transition', 'all 0.2s ease');

      // Country Flag & Code inside bubble
      bubbleNode.append('text')
        .attr('text-anchor', 'middle')
        .attr('dy', r > 24 ? '-0.25em' : '0.35em')
        .attr('font-size', r > 24 ? '14px' : '11px')
        .text(d.flag);

      if (r > 24) {
        bubbleNode.append('text')
          .attr('text-anchor', 'middle')
          .attr('dy', '1.1em')
          .attr('fill', '#ffffff')
          .attr('font-size', '10px')
          .attr('font-weight', 'bold')
          .text(`${d.totalApplicants}`);
      }

      // Label below bubble
      bubbleNode.append('text')
        .attr('y', r + 14)
        .attr('text-anchor', 'middle')
        .attr('fill', isSelected ? '#38bdf8' : '#cbd5e1')
        .attr('font-size', '10px')
        .attr('font-weight', isSelected || isTop ? 'bold' : 'normal')
        .text(`${d.nationality} (${d.totalApplicants})`);
    });

  }, [marketData, metricMode, selectedNationality, onSelectNationality, topCountry]);

  // D3 Horizontal Market Volume Bar Chart Rendering
  useEffect(() => {
    if (!barChartRef.current || marketData.length === 0) return;

    const svg = d3.select(barChartRef.current);
    svg.selectAll('*').remove();

    const containerWidth = 580;
    const barHeight = 28;
    const margin = { top: 20, right: 35, bottom: 25, left: 110 };
    const chartHeight = marketData.length * (barHeight + 10) + margin.top + margin.bottom;

    svg.attr('viewBox', `0 0 ${containerWidth} ${chartHeight}`);

    const g = svg.append('g').attr('transform', `translate(${margin.left}, ${margin.top})`);
    const innerWidth = containerWidth - margin.left - margin.right;

    // Scales
    const maxVal = d3.max(marketData, d => 
      metricMode === 'volume' ? d.totalApplicants : metricMode === 'approval' ? 100 : d.estimatedRevenueAED
    ) || 10;

    const xScale = d3.scaleLinear()
      .domain([0, maxVal])
      .range([0, innerWidth]);

    const yScale = d3.scaleBand()
      .domain(marketData.map(d => d.nationality))
      .range([0, marketData.length * (barHeight + 10)])
      .padding(0.25);

    // Bars
    marketData.forEach(d => {
      const yPos = yScale(d.nationality) || 0;
      const barVal = metricMode === 'volume' ? d.totalApplicants : metricMode === 'approval' ? d.approvalRate : d.estimatedRevenueAED;
      const barW = xScale(barVal);
      const isSelected = selectedNationality === d.nationality;
      const isTop = topCountry?.nationality === d.nationality;

      const barGroup = g.append('g')
        .attr('class', 'bar-row cursor-pointer')
        .on('click', () => {
          if (onSelectNationality) {
            onSelectNationality(isSelected ? 'ALL' : d.nationality);
          }
        });

      // Background Track
      barGroup.append('rect')
        .attr('x', 0)
        .attr('y', yPos)
        .attr('width', innerWidth)
        .attr('height', yScale.bandwidth())
        .attr('fill', '#1e293b')
        .attr('rx', 5);

      // Value Fill Bar with D3 Transition
      const fillBar = barGroup.append('rect')
        .attr('x', 0)
        .attr('y', yPos)
        .attr('width', 0)
        .attr('height', yScale.bandwidth())
        .attr('fill', isSelected ? '#38bdf8' : (isTop ? '#f59e0b' : '#3b82f6'))
        .attr('rx', 5);

      fillBar.transition()
        .duration(800)
        .attr('width', Math.max(8, barW));

      // Country label with flag on Y Axis
      g.append('text')
        .attr('x', -10)
        .attr('y', yPos + yScale.bandwidth() / 2 + 4)
        .attr('text-anchor', 'end')
        .attr('fill', isSelected ? '#38bdf8' : '#e2e8f0')
        .attr('font-size', '11px')
        .attr('font-weight', isSelected || isTop ? 'bold' : 'normal')
        .text(`${d.flag} ${d.nationality}`);

      // Metric value label at end of bar
      barGroup.append('text')
        .attr('x', Math.max(barW + 8, 16))
        .attr('y', yPos + yScale.bandwidth() / 2 + 4)
        .attr('fill', '#f8fafc')
        .attr('font-size', '10px')
        .attr('font-weight', 'bold')
        .text(
          metricMode === 'volume' 
            ? `${d.totalApplicants} files (${Math.round((d.totalApplicants / totalMarketApplicants) * 100)}%)` 
            : metricMode === 'approval'
              ? `${d.approvalRate}% pass`
              : `${d.estimatedRevenueAED.toLocaleString()} AED`
        );
    });

  }, [marketData, metricMode, selectedNationality, totalMarketApplicants, topCountry, onSelectNationality]);

  // Export SVG / Dataset handler
  const handleExportDataCsv = () => {
    const csvRows = [
      ['Nationality', 'Country Code', 'Total Applicants', 'Market Share %', 'Approval Rate %', 'Top Visa Type', 'Estimated Revenue AED', 'Average Audit Score']
    ];
    marketData.forEach(d => {
      csvRows.push([
        d.nationality,
        d.countryCode,
        String(d.totalApplicants),
        `${Math.round((d.totalApplicants / totalMarketApplicants) * 100)}%`,
        `${d.approvalRate}%`,
        `"${d.topVisaType}"`,
        String(d.estimatedRevenueAED),
        String(d.avgScore)
      ]);
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.map(e => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `uae_visa_applicant_nationality_market_analysis_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div ref={containerRef} className="relative bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-5">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-400">
              <Globe className="w-5 h-5" />
            </span>
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <span>{language === 'ar' ? '🗺️ خريطة توزيع المتقدمين حسب الجنسية (D3.js)' : '🗺️ Applicant Geographic Distribution & Nationality Markets (D3.js)'}</span>
              <span className="text-[10px] bg-sky-950 text-sky-300 border border-sky-800 px-2 py-0.5 rounded-full font-mono uppercase font-bold">
                D3 v7 Engine
              </span>
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {language === 'ar' 
              ? 'تحليل إحصائي جغرافي للأسواق الأكثر طلباً لتأشيرات دبي والإمارات لتحديد الفرص التسويقية والتدقيق المسبق.'
              : 'Interactive geographic corridors and market share analysis to identify high-volume applicant sourcing corridors and approval trends.'}
          </p>
        </div>

        {/* View & Metric Selectors */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Metric Selector */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-1 flex items-center gap-1 text-xs">
            <button
              onClick={() => setMetricMode('volume')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                metricMode === 'volume' ? 'bg-sky-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Applicants
            </button>
            <button
              onClick={() => setMetricMode('approval')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                metricMode === 'approval' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Approval %
            </button>
            <button
              onClick={() => setMetricMode('revenue')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                metricMode === 'revenue' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Revenue (AED)
            </button>
          </div>

          {/* View Mode Toggle */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-1 flex items-center gap-1 text-xs">
            <button
              onClick={() => setViewMode('split')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'split' ? 'bg-slate-800 text-amber-400' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Split View (Map + Bars)"
            >
              <Layers className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'map' ? 'bg-slate-800 text-amber-400' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Corridor Map Only"
            >
              <Globe className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('bars')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'bars' ? 'bg-slate-800 text-amber-400' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Market Ranking Bars Only"
            >
              <BarChart3 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Export CSV */}
          <button
            onClick={handleExportDataCsv}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold px-2.5 py-1.5 rounded-xl border border-slate-700 transition-colors cursor-pointer"
            title="Export CSV Dataset"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">CSV</span>
          </button>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-3">
          <div className="text-[11px] text-slate-400 font-medium flex items-center justify-between">
            <span>Top Source Market</span>
            <span className="text-base">{topCountry?.flag || '🌐'}</span>
          </div>
          <div className="text-lg font-bold text-slate-100 mt-1 flex items-baseline gap-1.5">
            <span>{topCountry?.nationality || 'N/A'}</span>
            <span className="text-xs text-sky-400 font-normal">
              ({topCountry ? Math.round((topCountry.totalApplicants / totalMarketApplicants) * 100) : 0}%)
            </span>
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Primary intake corridor</div>
        </div>

        <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-3">
          <div className="text-[11px] text-slate-400 font-medium flex items-center justify-between">
            <span>Total Applicants</span>
            <Users className="w-3.5 h-3.5 text-sky-400" />
          </div>
          <div className="text-lg font-bold text-sky-400 mt-1">
            {totalMarketApplicants} <span className="text-xs text-slate-400 font-normal">files</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Across {marketData.length} sovereign origins</div>
        </div>

        <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-3">
          <div className="text-[11px] text-slate-400 font-medium flex items-center justify-between">
            <span>Avg OCR Quality Score</span>
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-lg font-bold text-emerald-400 mt-1">
            {marketData.length > 0 
              ? Math.round(marketData.reduce((s, m) => s + m.avgScore, 0) / marketData.length)
              : 0} <span className="text-xs text-slate-400 font-normal">/ 100</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">ICAO Doc 9303 compliance</div>
        </div>

        <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-3">
          <div className="text-[11px] text-slate-400 font-medium flex items-center justify-between">
            <span>Est. Typing Revenue</span>
            <DollarSign className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-lg font-bold text-amber-400 mt-1">
            {marketData.reduce((s, m) => s + m.estimatedRevenueAED, 0).toLocaleString()} <span className="text-xs text-slate-400 font-normal">AED</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Processing & typing value</div>
        </div>
      </div>

      {/* Main Visualization Grid */}
      <div className={`grid gap-4 ${viewMode === 'split' ? 'grid-cols-1 lg:grid-cols-12' : 'grid-cols-1'}`}>
        {/* D3 Geographic Corridor Map */}
        {(viewMode === 'map' || viewMode === 'split') && (
          <div className={`${viewMode === 'split' ? 'lg:col-span-7' : 'col-span-1'} bg-slate-950 border border-slate-800 rounded-xl p-3 flex flex-col`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-xs text-slate-300 font-semibold">
                <Navigation className="w-3.5 h-3.5 text-sky-400" />
                <span>Global Sourcing Corridors ➔ Dubai Entry Portal</span>
              </div>
              <span className="text-[10px] text-slate-400">Click country to filter CRM</span>
            </div>

            <div className="relative w-full overflow-hidden rounded-lg bg-slate-950 flex-1 min-h-[300px]">
              <svg 
                ref={svgRef} 
                className="w-full h-auto max-h-[440px] select-none"
              />

              {/* Legend overlay */}
              <div className="absolute bottom-2 left-2 bg-slate-900/90 backdrop-blur-xs border border-slate-800 rounded-lg p-2 text-[10px] text-slate-300 flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
                  <span>Dubai Hub</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-sky-500 inline-block"></span>
                  <span>Applicant Origins</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-3 h-0.5 bg-sky-400 inline-block border-t border-dashed"></span>
                  <span>Flight Corridor</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* D3 Market Share Ranking Bars */}
        {(viewMode === 'bars' || viewMode === 'split') && (
          <div className={`${viewMode === 'split' ? 'lg:col-span-5' : 'col-span-1'} bg-slate-950 border border-slate-800 rounded-xl p-3 flex flex-col`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-xs text-slate-300 font-semibold">
                <BarChart3 className="w-3.5 h-3.5 text-amber-400" />
                <span>Market Share by Nationality ({marketData.length})</span>
              </div>
              {selectedNationality && selectedNationality !== 'ALL' && (
                <button
                  onClick={() => onSelectNationality && onSelectNationality('ALL')}
                  className="text-[10px] text-amber-400 hover:underline cursor-pointer"
                >
                  Clear Filter ({selectedNationality})
                </button>
              )}
            </div>

            <div className="w-full overflow-y-auto max-h-[440px] pr-1">
              <svg 
                ref={barChartRef} 
                className="w-full h-auto select-none"
              />
            </div>
          </div>
        )}
      </div>

      {/* Interactive Tooltip on hover */}
      {hoveredMarket && tooltipPos && (
        <div 
          className="absolute z-50 pointer-events-none bg-slate-900/95 backdrop-blur-md border border-slate-700 rounded-xl p-3 shadow-2xl text-xs text-slate-200 min-w-[220px]"
          style={{
            left: `${Math.min(tooltipPos.x + 15, (containerRef.current?.clientWidth || 700) - 240)}px`,
            top: `${Math.max(10, tooltipPos.y - 80)}px`
          }}
        >
          <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 mb-2">
            <div className="flex items-center gap-1.5 font-bold text-sm text-slate-100">
              <span>{hoveredMarket.flag}</span>
              <span>{hoveredMarket.nationality}</span>
            </div>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-800 text-sky-400 font-mono">
              {hoveredMarket.countryCode}
            </span>
          </div>

          <div className="space-y-1 text-[11px]">
            <div className="flex justify-between">
              <span className="text-slate-400">Total Applications:</span>
              <span className="font-bold text-slate-100">{hoveredMarket.totalApplicants} files</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Market Share:</span>
              <span className="font-bold text-sky-400">
                {Math.round((hoveredMarket.totalApplicants / totalMarketApplicants) * 100)}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Approval Rate:</span>
              <span className={`font-bold ${hoveredMarket.approvalRate >= 80 ? 'text-emerald-400' : 'text-amber-400'}`}>
                {hoveredMarket.approvalRate}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Top Visa Category:</span>
              <span className="font-medium text-slate-200 truncate max-w-[120px] text-right" title={hoveredMarket.topVisaType}>
                {hoveredMarket.topVisaType}
              </span>
            </div>
            <div className="flex justify-between pt-1 border-t border-slate-800/80">
              <span className="text-slate-400">Estimated Revenue:</span>
              <span className="font-bold text-amber-400">
                {hoveredMarket.estimatedRevenueAED.toLocaleString()} AED
              </span>
            </div>
          </div>
          <div className="mt-2 text-[9px] text-slate-400 italic text-center">
            Click to filter CRM applications table
          </div>
        </div>
      )}

      {/* Operational Strategic Advice for Agents */}
      <div className="bg-sky-950/20 border border-sky-800/30 rounded-xl p-3 flex items-start gap-3">
        <Sparkles className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-300">
          <span className="font-bold text-sky-300">
            {language === 'ar' ? 'توصية وكلاء الهجرة الاستراتيجية:' : 'B2B Strategic Market Intelligence:'}
          </span>{' '}
          {language === 'ar'
            ? `يشكل المتقدمون من ${topCountry?.nationality || 'بنغلاديش'} النسبة الأكبر (${topCountry ? Math.round((topCountry.totalApplicants / totalMarketApplicants) * 100) : 0}%) من إجمالي الطلبات. ينصح بالتركيز على إعداد قوالب واتساب باللغة البنغالية وتدقيق صلاحية الـ 180 يوماً قبل السداد الحكومي.`
            : `Applicants from ${topCountry?.nationality || 'Bangladesh'} constitute the largest sourcing corridor (${topCountry ? Math.round((topCountry.totalApplicants / totalMarketApplicants) * 100) : 0}%). Ensuring pre-screened 180-day passport validity and bilingual Bengali WhatsApp updates maximizes client retention and eliminates non-refundable GDRFA rejection penalties.`
          }
        </div>
      </div>
    </div>
  );
};
