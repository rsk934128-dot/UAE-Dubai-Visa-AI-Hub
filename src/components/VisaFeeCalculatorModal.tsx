import React, { useState, useMemo } from 'react';
import {
  Calculator,
  DollarSign,
  ShieldCheck,
  Building2,
  FileText,
  Sparkles,
  Info,
  Check,
  Globe,
  Coins,
  Receipt,
  HelpCircle,
  Copy,
  CheckCircle2,
  ArrowRight,
  Zap,
  Users
} from 'lucide-react';

interface VisaFeeCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialVisaType?: string;
  initialNationality?: string;
  onApplyToNewDossier?: (feeDetails: {
    visaType: string;
    nationality: string;
    totalAED: number;
    totalUSD: number;
    totalBDT: number;
    breakdownNote: string;
  }) => void;
}

interface FeeStructure {
  id: string;
  name: string;
  category: string;
  baseGovFeeAED: number;
  icpGdrfaSmartServiceFeeAED: number;
  mandatoryInsuranceAED: number;
  typingCenterFeeAED: number;
  securityDepositRefundableAED: number; // for certain nationalities or visa types
  standardProcessingDays: string;
  expressSurchargeAED: number;
  urgentSurchargeAED: number;
  description: string;
}

const VISA_FEE_DATABASE: FeeStructure[] = [
  {
    id: 'tourist-30-single',
    name: '30-Day Single Entry Tourist Visa',
    category: 'Tourist',
    baseGovFeeAED: 250,
    icpGdrfaSmartServiceFeeAED: 50,
    mandatoryInsuranceAED: 40,
    typingCenterFeeAED: 60,
    securityDepositRefundableAED: 0,
    standardProcessingDays: '24 - 48 Hours',
    expressSurchargeAED: 120,
    urgentSurchargeAED: 250,
    description: 'Standard 30-day single entry leisure/business visitor visa via GDRFA Dubai or ICP.'
  },
  {
    id: 'tourist-60-single',
    name: '60-Day Single Entry Tourist Visa',
    category: 'Tourist',
    baseGovFeeAED: 420,
    icpGdrfaSmartServiceFeeAED: 60,
    mandatoryInsuranceAED: 65,
    typingCenterFeeAED: 85,
    securityDepositRefundableAED: 0,
    standardProcessingDays: '2 - 3 Working Days',
    expressSurchargeAED: 150,
    urgentSurchargeAED: 300,
    description: 'Extended 60-day single entry tourist visa for family visits, extended vacations, and scouting.'
  },
  {
    id: 'tourist-60-multi',
    name: '60-Day Multiple Entry Tourist Visa',
    category: 'Tourist',
    baseGovFeeAED: 550,
    icpGdrfaSmartServiceFeeAED: 70,
    mandatoryInsuranceAED: 80,
    typingCenterFeeAED: 100,
    securityDepositRefundableAED: 0,
    standardProcessingDays: '2 - 4 Working Days',
    expressSurchargeAED: 180,
    urgentSurchargeAED: 350,
    description: 'Multiple entry visitor permit allowing unlimited entries into the UAE within the 60-day validity.'
  },
  {
    id: 'transit-96h',
    name: '96-Hour Transit Visa',
    category: 'Transit',
    baseGovFeeAED: 100,
    icpGdrfaSmartServiceFeeAED: 40,
    mandatoryInsuranceAED: 25,
    typingCenterFeeAED: 45,
    securityDepositRefundableAED: 0,
    standardProcessingDays: '12 - 24 Hours',
    expressSurchargeAED: 80,
    urgentSurchargeAED: 150,
    description: 'Short airport layover transit visa with confirmed connecting flights to a 3rd country.'
  },
  {
    id: 'transit-48h',
    name: '48-Hour Transit Visa',
    category: 'Transit',
    baseGovFeeAED: 0, // Free Gov Fee
    icpGdrfaSmartServiceFeeAED: 40,
    mandatoryInsuranceAED: 20,
    typingCenterFeeAED: 40,
    securityDepositRefundableAED: 0,
    standardProcessingDays: '12 - 24 Hours',
    expressSurchargeAED: 60,
    urgentSurchargeAED: 120,
    description: 'Short 48-hour complimentary transit visa (service and insurance fees apply).'
  },
  {
    id: 'job-seeker-60',
    name: 'Job Seeker Exploration Visa (60 Days)',
    category: 'Exploration',
    baseGovFeeAED: 600,
    icpGdrfaSmartServiceFeeAED: 100,
    mandatoryInsuranceAED: 150,
    typingCenterFeeAED: 120,
    securityDepositRefundableAED: 1025, // Refundable security deposit for job exploration
    standardProcessingDays: '3 - 5 Working Days',
    expressSurchargeAED: 200,
    urgentSurchargeAED: 400,
    description: 'Single-sponsor free visa for degree holders exploring career opportunities in the UAE.'
  },
  {
    id: 'green-visa-5yr',
    name: '5-Year Green Visa (Freelance / Self-Employed)',
    category: 'Residence',
    baseGovFeeAED: 1650,
    icpGdrfaSmartServiceFeeAED: 250,
    mandatoryInsuranceAED: 380,
    typingCenterFeeAED: 200,
    securityDepositRefundableAED: 0,
    standardProcessingDays: '5 - 7 Working Days',
    expressSurchargeAED: 350,
    urgentSurchargeAED: 700,
    description: '5-year self-sponsored residency for qualified freelancers, contractors, and specialized professionals.'
  },
  {
    id: 'remote-work-1yr',
    name: '1-Year Virtual Working / Remote Visa',
    category: 'Residence',
    baseGovFeeAED: 800,
    icpGdrfaSmartServiceFeeAED: 120,
    mandatoryInsuranceAED: 220,
    typingCenterFeeAED: 150,
    securityDepositRefundableAED: 0,
    standardProcessingDays: '4 - 6 Working Days',
    expressSurchargeAED: 250,
    urgentSurchargeAED: 500,
    description: 'Live in Dubai while working remotely for your employer or company based outside the UAE.'
  },
  {
    id: 'golden-visa-10yr',
    name: '10-Year Golden Visa (Nomination & Entry Permit)',
    category: 'Golden Residence',
    baseGovFeeAED: 2750,
    icpGdrfaSmartServiceFeeAED: 400,
    mandatoryInsuranceAED: 500,
    typingCenterFeeAED: 350,
    securityDepositRefundableAED: 0,
    standardProcessingDays: '7 - 14 Working Days',
    expressSurchargeAED: 600,
    urgentSurchargeAED: 1200,
    description: 'Self-sponsored 10-year residency entry permit & processing for investors, coders, and top talent.'
  }
];

// Country Risk & Additional Compliance Tiers
interface NationalityRule {
  country: string;
  depositRequiredAED: number;
  complianceFeeAED: number;
  notes: string;
}

const NATIONALITY_RULES: Record<string, NationalityRule> = {
  'Bangladesh': {
    country: 'Bangladesh',
    depositRequiredAED: 0,
    complianceFeeAED: 35,
    notes: 'Special security clearance & profession verification may be required during GDRFA review.'
  },
  'Bangladeshi': {
    country: 'Bangladesh',
    depositRequiredAED: 0,
    complianceFeeAED: 35,
    notes: 'Special security clearance & profession verification may be required during GDRFA review.'
  },
  'India': {
    country: 'India',
    depositRequiredAED: 0,
    complianceFeeAED: 0,
    notes: 'Standard processing. US/UK/Schengen visa holders eligible for Visa on Arrival (VoA) extension.'
  },
  'Indian': {
    country: 'India',
    depositRequiredAED: 0,
    complianceFeeAED: 0,
    notes: 'Standard processing. US/UK/Schengen visa holders eligible for Visa on Arrival (VoA) extension.'
  },
  'Pakistan': {
    country: 'Pakistan',
    depositRequiredAED: 0,
    complianceFeeAED: 40,
    notes: 'Additional ICP Smart Services background verification check required.'
  },
  'Pakistani': {
    country: 'Pakistan',
    depositRequiredAED: 0,
    complianceFeeAED: 40,
    notes: 'Additional ICP Smart Services background verification check required.'
  },
  'Philippines': {
    country: 'Philippines',
    depositRequiredAED: 0,
    complianceFeeAED: 0,
    notes: 'Standard processing. Affidavit of Support & Guarantee (ASG) required if hosted by relatives.'
  },
  'Filipino': {
    country: 'Philippines',
    depositRequiredAED: 0,
    complianceFeeAED: 0,
    notes: 'Standard processing. Affidavit of Support & Guarantee (ASG) required if hosted by relatives.'
  },
  'Nigeria': {
    country: 'Nigeria',
    depositRequiredAED: 500,
    complianceFeeAED: 80,
    notes: 'Special hotel voucher & return itinerary validation mandatory under bilateral guidelines.'
  },
  'Nigerian': {
    country: 'Nigeria',
    depositRequiredAED: 500,
    complianceFeeAED: 80,
    notes: 'Special hotel voucher & return itinerary validation mandatory under bilateral guidelines.'
  },
  'Egypt': {
    country: 'Egypt',
    depositRequiredAED: 0,
    complianceFeeAED: 20,
    notes: 'Standard Arab League bilateral fee schedule applies.'
  },
  'Egyptian': {
    country: 'Egypt',
    depositRequiredAED: 0,
    complianceFeeAED: 20,
    notes: 'Standard Arab League bilateral fee schedule applies.'
  },
  'Nepal': {
    country: 'Nepal',
    depositRequiredAED: 0,
    complianceFeeAED: 15,
    notes: 'Standard processing. Return flight ticket mandatory.'
  },
  'Nepalese': {
    country: 'Nepal',
    depositRequiredAED: 0,
    complianceFeeAED: 15,
    notes: 'Standard processing. Return flight ticket mandatory.'
  },
  'Sri Lanka': {
    country: 'Sri Lanka',
    depositRequiredAED: 0,
    complianceFeeAED: 15,
    notes: 'Standard processing. Valid passport min 6 months.'
  },
  'Sri Lankan': {
    country: 'Sri Lanka',
    depositRequiredAED: 0,
    complianceFeeAED: 15,
    notes: 'Standard processing. Valid passport min 6 months.'
  },
  'United Kingdom': {
    country: 'United Kingdom',
    depositRequiredAED: 0,
    complianceFeeAED: 0,
    notes: 'Visa On Arrival (30 Days free). Extension fees apply for 60-day long stays.'
  },
  'British': {
    country: 'United Kingdom',
    depositRequiredAED: 0,
    complianceFeeAED: 0,
    notes: 'Visa On Arrival (30 Days free). Extension fees apply for 60-day long stays.'
  },
  'United States': {
    country: 'United States',
    depositRequiredAED: 0,
    complianceFeeAED: 0,
    notes: 'Visa On Arrival (30 Days free). Extension fees apply for 60-day long stays.'
  },
  'American': {
    country: 'United States',
    depositRequiredAED: 0,
    complianceFeeAED: 0,
    notes: 'Visa On Arrival (30 Days free). Extension fees apply for 60-day long stays.'
  }
};

const AED_TO_USD = 0.272; // ~3.67 AED = 1 USD
const AED_TO_BDT = 32.85; // ~1 AED = 32.85 BDT
const AED_TO_INR = 22.80; // ~1 AED = 22.80 INR
const AED_TO_PHP = 15.65; // ~1 AED = 15.65 PHP

export const VisaFeeCalculatorModal: React.FC<VisaFeeCalculatorModalProps> = ({
  isOpen,
  onClose,
  initialVisaType,
  initialNationality,
  onApplyToNewDossier
}) => {
  const [selectedVisaId, setSelectedVisaId] = useState<string>(() => {
    if (initialVisaType) {
      const match = VISA_FEE_DATABASE.find(v => v.name.toLowerCase().includes(initialVisaType.toLowerCase()));
      if (match) return match.id;
    }
    return 'tourist-30-single';
  });

  const [nationality, setNationality] = useState<string>(initialNationality || 'Bangladeshi');
  const [urgency, setUrgency] = useState<'standard' | 'express' | 'urgent'>('standard');
  const [agencyServiceMarginAED, setAgencyServiceMarginAED] = useState<number>(75);
  const [includeVat, setIncludeVat] = useState<boolean>(true);
  const [applicantCount, setApplicantCount] = useState<number>(1);
  const [currency, setCurrency] = useState<'AED' | 'USD' | 'BDT' | 'INR' | 'PHP'>('AED');
  const [copied, setCopied] = useState(false);

  // Selected Visa info
  const selectedVisa = useMemo(() => {
    return VISA_FEE_DATABASE.find(v => v.id === selectedVisaId) || VISA_FEE_DATABASE[0];
  }, [selectedVisaId]);

  // Nationality compliance rule
  const natRule = useMemo(() => {
    return NATIONALITY_RULES[nationality] || {
      country: nationality,
      depositRequiredAED: 0,
      complianceFeeAED: 0,
      notes: 'Standard international traveler processing schedule.'
    };
  }, [nationality]);

  // Calculations
  const calculations = useMemo(() => {
    // 1. Government Base Fees
    const govFee = selectedVisa.baseGovFeeAED;
    const smartFee = selectedVisa.icpGdrfaSmartServiceFeeAED;
    const insurance = selectedVisa.mandatoryInsuranceAED;
    const typingFee = selectedVisa.typingCenterFeeAED;
    const totalGovAndProcessing = govFee + smartFee + insurance + typingFee;

    // 2. Nationality additions
    const natCompliance = natRule.complianceFeeAED;
    const refundableDeposit = selectedVisa.securityDepositRefundableAED + natRule.depositRequiredAED;

    // 3. Urgency Surcharges
    let urgencySurcharge = 0;
    if (urgency === 'express') {
      urgencySurcharge = selectedVisa.expressSurchargeAED;
    } else if (urgency === 'urgent') {
      urgencySurcharge = selectedVisa.urgentSurchargeAED;
    }

    // 4. Subtotal per applicant (before VAT and Agency Service Margin)
    const officialFeesPerPerson = totalGovAndProcessing + natCompliance + urgencySurcharge;
    const agencyMarginPerPerson = agencyServiceMarginAED;

    // 5. UAE VAT (5% on taxable typing & agency service fees: typingFee + agencyMargin)
    const vatBase = (typingFee + agencyMarginPerPerson + urgencySurcharge) * 0.05;
    const vatPerPerson = includeVat ? Math.round(vatBase) : 0;

    const totalPerPersonAED = officialFeesPerPerson + agencyMarginPerPerson + vatPerPerson + refundableDeposit;
    const grandTotalAED = totalPerPersonAED * applicantCount;

    // Multi-currency values
    const grandTotalUSD = Math.round(grandTotalAED * AED_TO_USD);
    const grandTotalBDT = Math.round(grandTotalAED * AED_TO_BDT);
    const grandTotalINR = Math.round(grandTotalAED * AED_TO_INR);
    const grandTotalPHP = Math.round(grandTotalAED * AED_TO_PHP);

    return {
      govFee,
      smartFee,
      insurance,
      typingFee,
      natCompliance,
      refundableDeposit,
      urgencySurcharge,
      officialFeesPerPerson,
      agencyMarginPerPerson,
      vatPerPerson,
      totalPerPersonAED,
      grandTotalAED,
      grandTotalUSD,
      grandTotalBDT,
      grandTotalINR,
      grandTotalPHP
    };
  }, [selectedVisa, natRule, urgency, agencyServiceMarginAED, includeVat, applicantCount]);

  if (!isOpen) return null;

  const handleCopyQuote = () => {
    const text = `🇦🇪 UAE VISA FEE ESTIMATE (Agency Quote)
━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 Visa Type: ${selectedVisa.name}
🌍 Nationality: ${nationality}
👥 Applicants: ${applicantCount}
⚡ Processing Speed: ${urgency.toUpperCase()} (${selectedVisa.standardProcessingDays})
──────────────────────────
🏛️ Official Govt & ICP/GDRFA Fees: AED ${calculations.officialFeesPerPerson} / person
🏢 Agency Typing & Handling: AED ${calculations.agencyMarginPerPerson} / person
${calculations.refundableDeposit > 0 ? `🛡️ Refundable Security Deposit: AED ${calculations.refundableDeposit} / person\n` : ''}🧾 UAE VAT (5%): AED ${calculations.vatPerPerson} / person
──────────────────────────
💰 TOTAL AMOUNT: 
• AED ${calculations.grandTotalAED.toLocaleString()}
• USD $${calculations.grandTotalUSD.toLocaleString()}
• BDT ৳${calculations.grandTotalBDT.toLocaleString()}
━━━━━━━━━━━━━━━━━━━━━━━━━━
Issued via UAE Visa AI Hub Typing Center CRM`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleApply = () => {
    if (onApplyToNewDossier) {
      onApplyToNewDossier({
        visaType: selectedVisa.name,
        nationality,
        totalAED: calculations.grandTotalAED,
        totalUSD: calculations.grandTotalUSD,
        totalBDT: calculations.grandTotalBDT,
        breakdownNote: `Fee Quote (${currency}): Total AED ${calculations.grandTotalAED} (Gov: ${calculations.officialFeesPerPerson} + Service: ${calculations.agencyMarginPerPerson} + VAT: ${calculations.vatPerPerson}). Speed: ${urgency.toUpperCase()}.`
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-150">
      <div 
        id="fee-calculator-modal"
        className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh]"
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/30 px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 flex items-center justify-center font-bold shadow-md shadow-amber-500/20">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>UAE &amp; Dubai Visa Fee Calculator</span>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 font-mono px-2 py-0.5 rounded-full border border-amber-500/40">
                  2026 GDRFA / ICP Schedule
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Instant cost estimate combining official government fees, mandatory insurance, smart service charges &amp; agency margin.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center text-sm transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Modal Body: Two-column layout on Desktop */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Top Parameter Selector Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
            {/* 1. Visa Category */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-amber-400" />
                Select Visa Category &amp; Duration
              </label>
              <select
                id="select-calculator-visa-type"
                value={selectedVisaId}
                onChange={(e) => setSelectedVisaId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              >
                {VISA_FEE_DATABASE.map(v => (
                  <option key={v.id} value={v.id}>
                    {v.name} ({v.category}) — Base Gov: AED {v.baseGovFeeAED}
                  </option>
                ))}
              </select>
            </div>

            {/* 2. Nationality */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-sky-400" />
                Applicant Nationality
              </label>
              <select
                id="select-calculator-nationality"
                value={nationality}
                onChange={(e) => setNationality(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              >
                <option value="Bangladeshi">Bangladesh (বাংলাদেশ)</option>
                <option value="Indian">India (ভারত)</option>
                <option value="Pakistani">Pakistan</option>
                <option value="Filipino">Philippines</option>
                <option value="Egyptian">Egypt</option>
                <option value="Nepalese">Nepal</option>
                <option value="Sri Lankan">Sri Lanka</option>
                <option value="Nigerian">Nigeria</option>
                <option value="British">United Kingdom (UK)</option>
                <option value="American">United States (USA)</option>
              </select>
            </div>
          </div>

          {/* Secondary Controls: Urgency, Margin, Applicants, VAT */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            {/* Urgency */}
            <div className="space-y-1.5">
              <label className="text-slate-400 font-medium flex items-center gap-1">
                <Zap className="w-3 h-3 text-amber-400" />
                Processing Speed
              </label>
              <select
                value={urgency}
                onChange={(e) => setUrgency(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200"
              >
                <option value="standard">Standard ({selectedVisa.standardProcessingDays})</option>
                <option value="express">Express (+AED {selectedVisa.expressSurchargeAED})</option>
                <option value="urgent">Urgent 6h (+AED {selectedVisa.urgentSurchargeAED})</option>
              </select>
            </div>

            {/* Applicant Count */}
            <div className="space-y-1.5">
              <label className="text-slate-400 font-medium flex items-center gap-1">
                <Users className="w-3 h-3 text-emerald-400" />
                Number of Applicants
              </label>
              <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg overflow-hidden">
                <button
                  type="button"
                  onClick={() => setApplicantCount(Math.max(1, applicantCount - 1))}
                  className="px-2.5 py-1.5 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  -
                </button>
                <span className="flex-1 text-center font-mono font-bold text-white text-xs">
                  {applicantCount}
                </span>
                <button
                  type="button"
                  onClick={() => setApplicantCount(applicantCount + 1)}
                  className="px-2.5 py-1.5 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            {/* Agency Service Margin */}
            <div className="space-y-1.5">
              <label className="text-slate-400 font-medium flex items-center gap-1">
                <Coins className="w-3 h-3 text-amber-400" />
                Agency Service Fee
              </label>
              <div className="relative">
                <span className="absolute left-2.5 top-1.5 text-[10px] text-slate-500 font-mono">AED</span>
                <input
                  type="number"
                  min="0"
                  max="1000"
                  step="5"
                  value={agencyServiceMarginAED}
                  onChange={(e) => setAgencyServiceMarginAED(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-2 py-1.5 text-slate-200 font-mono text-xs"
                />
              </div>
            </div>

            {/* VAT 5% Option */}
            <div className="space-y-1.5 flex flex-col justify-end">
              <label className="text-slate-400 font-medium flex items-center gap-1">
                <Receipt className="w-3 h-3 text-sky-400" />
                UAE Tax (VAT 5%)
              </label>
              <label className="flex items-center gap-2 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-lg text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeVat}
                  onChange={(e) => setIncludeVat(e.target.checked)}
                  className="rounded text-amber-500 focus:ring-0"
                />
                <span className="text-xs">Include 5% VAT</span>
              </label>
            </div>
          </div>

          {/* Breakdown & Calculation Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Left Box: Detailed Itemized Cost Breakdown */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h4 className="text-xs font-bold text-slate-200 uppercase font-mono tracking-wider flex items-center gap-1.5">
                  <Receipt className="w-3.5 h-3.5 text-amber-400" />
                  Itemized Cost Breakdown (Per Person)
                </h4>
                <span className="text-[10px] text-slate-500 font-mono">Currency: AED</span>
              </div>

              <div className="space-y-2 text-xs divide-y divide-slate-800/60">
                <div className="flex items-center justify-between pt-1">
                  <span className="text-slate-400 flex items-center gap-1">
                    GDRFA / ICP Government Fee
                  </span>
                  <span className="font-mono text-white">AED {calculations.govFee}</span>
                </div>

                <div className="flex items-center justify-between pt-1.5">
                  <span className="text-slate-400">Smart Services &amp; Electronic System Fee</span>
                  <span className="font-mono text-white">AED {calculations.smartFee}</span>
                </div>

                <div className="flex items-center justify-between pt-1.5">
                  <span className="text-slate-400">Mandatory UAE Health &amp; Covid Coverage</span>
                  <span className="font-mono text-white">AED {calculations.insurance}</span>
                </div>

                <div className="flex items-center justify-between pt-1.5">
                  <span className="text-slate-400">Amer / Typing Center Submission Fee</span>
                  <span className="font-mono text-white">AED {calculations.typingFee}</span>
                </div>

                {calculations.natCompliance > 0 && (
                  <div className="flex items-center justify-between pt-1.5 text-amber-400">
                    <span>Nationality Compliance / Security Clearance</span>
                    <span className="font-mono">+AED {calculations.natCompliance}</span>
                  </div>
                )}

                {calculations.urgencySurcharge > 0 && (
                  <div className="flex items-center justify-between pt-1.5 text-amber-400">
                    <span>Speed Surcharge ({urgency.toUpperCase()})</span>
                    <span className="font-mono">+AED {calculations.urgencySurcharge}</span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-1.5 text-sky-300">
                  <span>Agency Service &amp; Client Handling Margin</span>
                  <span className="font-mono">AED {calculations.agencyMarginPerPerson}</span>
                </div>

                {includeVat && (
                  <div className="flex items-center justify-between pt-1.5 text-slate-400">
                    <span>UAE Federal Tax Authority VAT (5%)</span>
                    <span className="font-mono">AED {calculations.vatPerPerson}</span>
                  </div>
                )}

                {calculations.refundableDeposit > 0 && (
                  <div className="flex items-center justify-between pt-1.5 text-emerald-400">
                    <span className="flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      Refundable Security Deposit
                    </span>
                    <span className="font-mono">AED {calculations.refundableDeposit}</span>
                  </div>
                )}
              </div>

              {/* Per Person Subtotal */}
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between font-bold text-xs">
                <span className="text-slate-300">Subtotal Per Applicant:</span>
                <span className="font-mono text-amber-400">AED {calculations.totalPerPersonAED}</span>
              </div>
            </div>

            {/* Right Box: Total Quote Banner & Multi-currency conversion */}
            <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950/40 border border-amber-500/30 rounded-xl p-4 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono text-amber-300 uppercase tracking-wide font-semibold">
                    Grand Total Estimate ({applicantCount} {applicantCount === 1 ? 'Applicant' : 'Applicants'})
                  </span>
                  <div className="flex bg-slate-900 border border-slate-700 rounded-lg p-0.5 text-[10px] font-mono">
                    {(['AED', 'USD', 'BDT', 'INR', 'PHP'] as const).map(curr => (
                      <button
                        key={curr}
                        onClick={() => setCurrency(curr)}
                        className={`px-1.5 py-0.5 rounded transition-colors cursor-pointer ${
                          currency === curr ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {curr}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Primary Display Number */}
                <div className="mt-3">
                  <div className="text-3xl sm:text-4xl font-extrabold font-mono text-white tracking-tight flex items-baseline gap-2">
                    {currency === 'AED' && <span>AED {calculations.grandTotalAED.toLocaleString()}</span>}
                    {currency === 'USD' && <span>${calculations.grandTotalUSD.toLocaleString()}</span>}
                    {currency === 'BDT' && <span>৳{calculations.grandTotalBDT.toLocaleString()}</span>}
                    {currency === 'INR' && <span>₹{calculations.grandTotalINR.toLocaleString()}</span>}
                    {currency === 'PHP' && <span>₱{calculations.grandTotalPHP.toLocaleString()}</span>}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    {selectedVisa.name} • {selectedVisa.standardProcessingDays}
                  </p>
                </div>

                {/* Multi-Currency Reference Strip */}
                <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-800 text-[11px] font-mono">
                  <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800 text-center">
                    <span className="text-slate-500 block text-[9px]">AED (DIRHAM)</span>
                    <span className="font-bold text-amber-300">{calculations.grandTotalAED.toLocaleString()}</span>
                  </div>
                  <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800 text-center">
                    <span className="text-slate-500 block text-[9px]">USD ($)</span>
                    <span className="font-bold text-sky-300">${calculations.grandTotalUSD.toLocaleString()}</span>
                  </div>
                  <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800 text-center">
                    <span className="text-slate-500 block text-[9px]">BDT (TAKA)</span>
                    <span className="font-bold text-emerald-300">৳{calculations.grandTotalBDT.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Nationality specific notice */}
              <div className="bg-slate-900/70 border border-slate-800/80 rounded-lg p-2.5 text-[11px] text-slate-400 space-y-1">
                <div className="flex items-center gap-1.5 font-semibold text-slate-300">
                  <Info className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                  <span>{nationality} Nationality Advisory:</span>
                </div>
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  {natRule.notes}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="bg-slate-950 px-5 py-3.5 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleCopyQuote}
              className="flex-1 sm:flex-initial text-xs bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 px-3.5 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 font-semibold">Quote Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                  <span>Copy Client Quote</span>
                </>
              )}
            </button>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              Close
            </button>

            {onApplyToNewDossier && (
              <button
                id="btn-apply-fee-to-dossier"
                onClick={handleApply}
                className="flex-1 sm:flex-initial bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20 transition-all cursor-pointer"
              >
                <span>Apply to New Intake</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
