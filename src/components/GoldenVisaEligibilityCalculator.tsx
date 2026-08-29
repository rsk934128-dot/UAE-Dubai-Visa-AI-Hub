import React, { useState } from 'react';
import { 
  Calculator, 
  Award, 
  Sparkles, 
  Briefcase, 
  Building2, 
  GraduationCap, 
  Coins, 
  CheckCircle2, 
  ArrowRight,
  TrendingUp,
  Globe,
  FileCheck2
} from 'lucide-react';
import { GOLDEN_VISA_CATEGORIES, UAE_VISA_CATEGORIES } from '../data';

export const GoldenVisaEligibilityCalculator: React.FC = () => {
  const [nationality, setNationality] = useState('Bangladeshi');
  const [purpose, setPurpose] = useState('Tech Career & Long-term Residency');
  const [profession, setProfession] = useState('Senior AI Software Engineer');
  const [monthlySalary, setMonthlySalary] = useState(35000);
  const [investmentAmount, setInvestmentAmount] = useState(0);
  const [educationLevel, setEducationLevel] = useState("Master's Degree (Computer Science)");
  const [experienceYears, setExperienceYears] = useState('7+ Years');
  const [hasCompany, setHasCompany] = useState(false);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);

  const handleCalculate = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/calculate-eligibility', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nationality,
          purpose,
          profession,
          monthlySalaryAED: monthlySalary,
          investmentAmountAED: investmentAmount,
          educationLevel,
          experienceYears,
          hasCompany
        })
      });

      const data = await response.json();
      if (data.success) {
        setResult(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6" id="golden-visa-hub">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 border border-amber-500/20 rounded-xl p-5 backdrop-blur-md">
        <div className="flex items-center gap-2 text-amber-400 font-semibold tracking-wide text-xs uppercase mb-1">
          <Award className="w-4 h-4" />
          UAE Golden &amp; Green Visa Intelligence Engine
        </div>
        <h2 className="text-xl font-bold text-white tracking-tight">
          Golden Visa (10-Year) &amp; Freelance Green Visa Eligibility Analyzer
        </h2>
        <p className="text-slate-400 text-sm mt-1 max-w-3xl">
          Evaluate salary thresholds (AED 30k+), developer/AI endorsements (Coders HQ), real estate property portfolios (AED 2M+), and startup founder qualifications.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form Inputs Left */}
        <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <Calculator className="w-4 h-4 text-amber-400" />
            Applicant Profile Data
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-400 mb-1">Nationality / Passport Country</label>
              <input
                type="text"
                value={nationality}
                onChange={(e) => setNationality(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                placeholder="E.g. Bangladeshi, Pakistani, Indian"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Current Profession / Designation</label>
              <input
                type="text"
                value={profession}
                onChange={(e) => setProfession(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                placeholder="E.g. AI Specialist, Real Estate Investor, Doctor"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1">Monthly Salary (AED)</label>
                <input
                  type="number"
                  value={monthlySalary}
                  onChange={(e) => setMonthlySalary(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 font-mono focus:outline-none focus:border-amber-500"
                />
                <span className="text-[10px] text-slate-500 mt-0.5 block">Exec Rule: AED 30,000+</span>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Real Estate Investment (AED)</label>
                <input
                  type="number"
                  value={investmentAmount}
                  onChange={(e) => setInvestmentAmount(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 font-mono focus:outline-none focus:border-amber-500"
                />
                <span className="text-[10px] text-slate-500 mt-0.5 block">Property Rule: AED 2M+</span>
              </div>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Highest Education Level</label>
              <select
                value={educationLevel}
                onChange={(e) => setEducationLevel(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
              >
                <option>Master&apos;s Degree or Ph.D. (MoE Equivalency)</option>
                <option>Bachelor&apos;s Degree / University Graduate</option>
                <option>Technical Diploma (3-Year)</option>
                <option>High School / Non-Degree</option>
              </select>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="check-has-company"
                checked={hasCompany}
                onChange={(e) => setHasCompany(e.target.checked)}
                className="rounded border-slate-700 bg-slate-950 text-amber-500 focus:ring-amber-500"
              />
              <label htmlFor="check-has-company" className="text-slate-300 text-xs cursor-pointer">
                Own an active UAE Free Zone / Mainland Startup or Trade License
              </label>
            </div>

            <button
              id="btn-calculate-golden-visa"
              onClick={handleCalculate}
              disabled={loading}
              className="w-full mt-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 cursor-pointer transition-all shadow-lg shadow-amber-500/20"
            >
              {loading ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin" />
                  Analyzing UAE Immigration Regulations...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Evaluate UAE Visa Eligibility
                </>
              )}
            </button>
          </div>
        </div>

        {/* Results / Categories Right */}
        <div className="lg:col-span-7 space-y-4">
          {result ? (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-5">
              {/* Header with match score */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                <div>
                  <span className="text-xs font-mono uppercase tracking-wider text-amber-400">
                    Recommended Pathway
                  </span>
                  <h4 className="text-lg font-bold text-white mt-0.5">
                    {result.recommendedVisa}
                  </h4>
                  <div className="inline-block mt-1 bg-emerald-950/60 text-emerald-300 border border-emerald-800/80 px-2 py-0.5 rounded text-xs font-semibold">
                    {result.eligibilityStatus}
                  </div>
                </div>

                <div className="text-right bg-slate-950 px-4 py-2 rounded-lg border border-slate-800">
                  <span className="text-2xl font-black font-mono text-amber-400">
                    {result.goldenVisaScore}%
                  </span>
                  <span className="text-[10px] text-slate-400 block uppercase">Golden Visa Score</span>
                </div>
              </div>

              {/* Cost & Processing Estimate */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                  <span className="text-slate-500 block text-[10px] uppercase font-mono">Government Fee (AED)</span>
                  <span className="text-white font-mono font-bold text-sm mt-0.5 block">
                    AED {result.estimatedCostAED?.toLocaleString()}
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                  <span className="text-slate-500 block text-[10px] uppercase font-mono">Approx. (BDT)</span>
                  <span className="text-amber-400 font-mono font-bold text-sm mt-0.5 block">
                    ৳{result.estimatedCostBDT?.toLocaleString()}
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                  <span className="text-slate-500 block text-[10px] uppercase font-mono">Processing Time</span>
                  <span className="text-slate-200 font-medium text-sm mt-0.5 block">
                    {result.processingTime || '3 - 7 Days'}
                  </span>
                </div>
              </div>

              {/* Expert Advice Bilingual Box */}
              <div className="space-y-2">
                <div className="p-3 rounded-lg bg-amber-950/20 border border-amber-900/50 text-xs text-amber-200">
                  <strong className="block font-semibold mb-1 text-amber-300">বাংলা পরামর্শ (Summary Advice):</strong>
                  <p className="leading-relaxed text-slate-300">{result.expertAdviceBn}</p>
                </div>

                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300">
                  <strong className="block font-semibold mb-1 text-slate-200">Strategic Roadmap:</strong>
                  <p className="leading-relaxed text-slate-400">{result.expertAdviceEn}</p>
                </div>
              </div>

              {/* Required Documents */}
              {result.mandatoryDocuments?.length > 0 && (
                <div className="bg-slate-950/60 p-3.5 rounded-lg border border-slate-800 text-xs">
                  <span className="font-semibold text-slate-300 block mb-2 flex items-center gap-1.5">
                    <FileCheck2 className="w-4 h-4 text-sky-400" />
                    Mandatory Dossier Documents
                  </span>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-400">
                    {result.mandatoryDocuments.map((doc: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{doc}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            /* Reference Grid of Golden Visa Categories */
            <div className="space-y-3">
              <span className="text-xs uppercase font-mono tracking-wider text-slate-400 block">
                Official Dubai Golden Visa Categories Overview
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {GOLDEN_VISA_CATEGORIES.map((cat) => (
                  <div key={cat.id} className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-2 hover:border-slate-700 transition-colors">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
                        {cat.durationYears} Years Residency
                      </span>
                      <span className="text-[10px] text-slate-500">{cat.category}</span>
                    </div>
                    <h5 className="text-sm font-semibold text-slate-100">{cat.title}</h5>
                    <ul className="text-[11px] text-slate-400 space-y-1 list-disc pl-4">
                      {cat.eligibilityRequirements.map((req, i) => (
                        <li key={i}>{req}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
