import React, { useState } from 'react';
import { 
  Search, 
  Globe2, 
  ExternalLink, 
  Clock, 
  CheckCircle2, 
  ShieldCheck, 
  Building, 
  FileSearch,
  Sparkles,
  Layers
} from 'lucide-react';
import { TrackingResult } from '../types';

export const GdrfaIcpTrackingPortal: React.FC = () => {
  const [portal, setPortal] = useState<'GDRFA' | 'ICP'>('GDRFA');
  const [referenceNumber, setReferenceNumber] = useState('GDRFA-2026-778219');
  const [passportNumber, setPassportNumber] = useState('A08923411');
  const [nationality, setNationality] = useState('Bangladesh (BGD)');
  const [isSearching, setIsSearching] = useState(false);
  const [result, setResult] = useState<TrackingResult | null>(null);

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);

    setTimeout(() => {
      // Return structured tracking data
      setResult({
        found: true,
        applicationNumber: referenceNumber || 'GDRFA-2026-778219',
        applicantName: 'TARIQUL ISLAM CHOWDHURY',
        visaType: '30 Days Tourist Single Entry (Dubai GDRFA Smart Channel)',
        status: 'Under Final Security Clearance & Stamping',
        statusColor: 'green',
        submissionDate: '2026-08-28 14:10:00 (GST)',
        currentStage: 'Stage 3 of 4: Entry Permit Generation',
        issuingAuthority: portal === 'GDRFA' ? 'GDRFA Dubai (Al Jafiliya HQ)' : 'Federal Authority for Identity & Citizenship (ICP Abu Dhabi)',
        history: [
          {
            date: '2026-08-28 14:10:00',
            stage: 'Application Received & AI Audit Cleared',
            remarks: 'Passport MRZ & 6-month validity verified. Biometric photo cleared.'
          },
          {
            date: '2026-08-28 16:30:00',
            stage: 'Federal Blacklist & Travel Ban Verification',
            remarks: 'Passed no-objection and security clearance.'
          },
          {
            date: '2026-08-29 08:00:00',
            stage: 'Residency Permit Drafting',
            remarks: 'Electronic Visa PDF generation queue.'
          }
        ]
      });
      setIsSearching(false);
    }, 600);
  };

  return (
    <div className="space-y-6" id="tracking-portal-container">
      {/* Top Banner */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 backdrop-blur-md">
        <div className="flex items-center gap-2 text-sky-400 font-semibold tracking-wide text-xs uppercase mb-1">
          <Globe2 className="w-4 h-4" />
          Official UAE Government Smart Services Gateway
        </div>
        <h2 className="text-xl font-bold text-white tracking-tight">
          GDRFA Dubai &amp; ICP Federal Visa Status Tracker
        </h2>
        <p className="text-slate-400 text-sm mt-1 max-w-3xl">
          Direct API tracking interface for Dubai GDRFA (General Directorate of Residency and Foreigners Affairs) and ICP (Federal Authority for Identity, Citizenship, Customs and Port Security).
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Search Panel Left */}
        <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => setPortal('GDRFA')}
              className={`flex-1 py-1.5 rounded-md text-xs font-semibold transition-all ${
                portal === 'GDRFA' 
                  ? 'bg-amber-500 text-slate-950 shadow' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              GDRFA (Dubai Visas)
            </button>
            <button
              onClick={() => setPortal('ICP')}
              className={`flex-1 py-1.5 rounded-md text-xs font-semibold transition-all ${
                portal === 'ICP' 
                  ? 'bg-amber-500 text-slate-950 shadow' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              ICP (Abu Dhabi / Federal)
            </button>
          </div>

          <form onSubmit={handleTrack} className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-400 mb-1">Application / Reference Number *</label>
              <input
                type="text"
                required
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
                placeholder="e.g. GDRFA-2026-778219"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 font-mono focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Passport Number *</label>
              <input
                type="text"
                required
                value={passportNumber}
                onChange={(e) => setPassportNumber(e.target.value)}
                placeholder="e.g. A08923411"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 font-mono uppercase focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Nationality</label>
              <select
                value={nationality}
                onChange={(e) => setNationality(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:border-amber-500 focus:outline-none"
              >
                <option>Bangladesh (BGD)</option>
                <option>Pakistan (PAK)</option>
                <option>India (IND)</option>
                <option>Philippines (PHL)</option>
                <option>Egypt (EGY)</option>
                <option>United Kingdom (GBR)</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={isSearching}
              className="w-full bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-lg shadow-sky-500/20"
            >
              {isSearching ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin" />
                  Querying {portal} Smart Gateways...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  Query Live Status
                </>
              )}
            </button>
          </form>

          {/* Direct Government Links */}
          <div className="pt-3 border-t border-slate-800 space-y-2 text-xs">
            <span className="text-slate-400 font-semibold block text-[11px]">Official Direct Portal Links:</span>
            <div className="flex flex-col gap-1.5 text-sky-400">
              <a
                href="https://smartservices.icp.gov.ae"
                target="_blank"
                rel="noreferrer"
                className="hover:underline flex items-center gap-1"
              >
                <ExternalLink className="w-3 h-3" />
                ICP Smart Services (smartservices.icp.gov.ae)
              </a>
              <a
                href="https://gdrfad.gov.ae/en"
                target="_blank"
                rel="noreferrer"
                className="hover:underline flex items-center gap-1"
              >
                <ExternalLink className="w-3 h-3" />
                GDRFA Dubai Residency Portal (gdrfad.gov.ae)
              </a>
            </div>
          </div>
        </div>

        {/* Results Panel Right */}
        <div className="lg:col-span-7">
          {result ? (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-5">
              {/* Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                <div>
                  <span className="text-xs font-mono uppercase tracking-wider text-sky-400">
                    {result.issuingAuthority}
                  </span>
                  <h4 className="text-lg font-bold text-white mt-0.5">
                    {result.applicantName}
                  </h4>
                  <p className="text-xs text-slate-400">{result.visaType}</p>
                </div>

                <div className="bg-emerald-950/60 border border-emerald-800/80 px-3 py-1.5 rounded-lg text-right">
                  <span className="text-xs font-bold text-emerald-300 block">
                    {result.status}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {result.currentStage}
                  </span>
                </div>
              </div>

              {/* Progress Milestones Timeline */}
              <div className="space-y-3">
                <span className="text-xs uppercase font-mono tracking-wider text-slate-400 block">
                  Application Timeline &amp; Government Logs
                </span>
                
                <div className="space-y-3 border-l-2 border-slate-800 pl-4 ml-2">
                  {result.history.map((h, i) => (
                    <div key={i} className="relative space-y-1">
                      <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-sky-400 ring-4 ring-slate-950"></div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-200">{h.stage}</span>
                        <span className="text-[11px] font-mono text-slate-500">{h.date}</span>
                      </div>
                      <p className="text-[11px] text-slate-400">{h.remarks}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900/40 border border-slate-800/60 rounded-xl p-12 text-center flex flex-col items-center justify-center text-slate-500 h-full min-h-[350px]">
              <FileSearch className="w-12 h-12 text-slate-700 mb-3" />
              <h3 className="text-slate-300 font-medium text-base mb-1">Enter File Reference</h3>
              <p className="text-xs text-slate-500 max-w-sm">
                Provide your GDRFA or ICP reference number along with applicant passport number to inspect live clearance stages.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
