import { VisaCategory, GoldenVisaCategory } from './types';

export const UAE_VISA_CATEGORIES: VisaCategory[] = [
  {
    id: 'tourist-30',
    title: '30-Day Single Entry Tourist Visa',
    titleBn: '৩০ দিনের সিঙ্গেল এন্ট্রি ট্যুরিস্ট ভিসা',
    duration: '30 Days from entry',
    entryType: 'Single Entry',
    typicalCostAED: 350,
    typicalCostUSD: 95,
    typicalCostBDT: 11500,
    processingTimeDays: '24 - 48 Hours',
    targetAudience: 'Short vacation, family visits, business conferences, layover explorations',
    requiredDocuments: [
      'Color passport copy (min. 6 months validity)',
      'Passport size photograph with clean white background (80% face coverage)',
      'Confirmed return flight ticket',
      'Hotel booking confirmation or host invitation with Emirates ID'
    ],
    eligibilityCriteria: [
      'Valid passport from recognized countries',
      'No active UAE travel ban or overstay penalties'
    ],
    channel: 'GDRFA (Dubai)'
  },
  {
    id: 'tourist-60',
    title: '60-Day Multiple Entry Tourist Visa',
    titleBn: '৬০ দিনের মাল্টিপল এন্ট্রি ট্যুরিস্ট ভিসা',
    duration: '60 Days from entry',
    entryType: 'Multiple Entry',
    typicalCostAED: 650,
    typicalCostUSD: 177,
    typicalCostBDT: 21500,
    processingTimeDays: '2 - 3 Days',
    targetAudience: 'Extended leisure stays, business scouting, family reunions with multiple trips',
    requiredDocuments: [
      'Color passport copy (min. 6 months validity)',
      'White background photograph (40x55mm)',
      'Bank statement (for certain nationalities upon request)',
      'Confirmed travel itinerary'
    ],
    eligibilityCriteria: [
      'Valid passport with at least 6 months validity from departure date'
    ],
    channel: 'GDRFA (Dubai)'
  },
  {
    id: 'green-visa-freelance',
    title: '5-Year Green Visa (Freelancer & Self-Employed)',
    titleBn: '৫ বছরের গ্রিন ভিসা (ফ্রিল্যান্সার ও স্বনির্ভর পেশাজীবী)',
    duration: '5 Years Renewable (Sponsor-Free)',
    entryType: 'Long-term Residence',
    typicalCostAED: 2280,
    typicalCostUSD: 620,
    typicalCostBDT: 75000,
    processingTimeDays: '5 - 7 Days',
    targetAudience: 'Skilled professionals, independent contractors, digital creatives, self-employed specialists',
    requiredDocuments: [
      'Valid passport copy',
      'Freelance / Self-employment permit from MOHRE or Free Zone',
      'Attested Bachelor’s Degree or Specialized Diploma',
      'Evidence of annual income from self-employment for previous 2 years (min. AED 360,000 or equivalent)',
      'Valid UAE Health Insurance'
    ],
    eligibilityCriteria: [
      'Minimum bachelor’s degree in related technical/creative field',
      'Demonstrated self-employment earnings or active consultancy contracts'
    ],
    channel: 'ICP (Federal/Abu Dhabi/Sharjah)'
  },
  {
    id: 'golden-visa-10yr',
    title: '10-Year Golden Visa (Investors, Tech Innovators & Executives)',
    titleBn: '১০ বছরের গোল্ডেন ভিসা (বিনিয়োগকারী, প্রযুক্তি বিশেষজ্ঞ ও উচ্চপদস্থ কর্মকর্তা)',
    duration: '10 Years Self-Sponsored Residence',
    entryType: 'Long-term Residence',
    typicalCostAED: 3850,
    typicalCostUSD: 1050,
    typicalCostBDT: 127000,
    processingTimeDays: '3 - 10 Days',
    targetAudience: 'Real estate investors (AED 2M+), software developers/AI engineers, high-earning managers (AED 30k+/mo)',
    requiredDocuments: [
      'Passport copy with 6+ months validity',
      'Title deed (Real Estate) OR Salary certificate & 6-month bank statement (Executives) OR Endorsement from UAE AI Council / Coders HQ',
      'Attested university degree (MoE equivalency)',
      'Comprehensive UAE medical insurance'
    ],
    eligibilityCriteria: [
      'Real Estate: AED 2,000,000+ property value (or mortgaged with NOC)',
      'Executive: AED 30,000+ monthly salary with attested Master/Bachelor degree',
      'Developer/Coder: Recommendation from Coders HQ or UAE AI Council'
    ],
    channel: 'GDRFA (Dubai)'
  },
  {
    id: 'transit-96hr',
    title: '96-Hour Transit Visa (Emirates / FlyDubai Stopover)',
    titleBn: '৯৬ ঘণ্টার ট্রানজিট ভিসা (দুবাই স্টপওভার)',
    duration: '96 Hours (Valid for 14 days before entry)',
    entryType: 'Single Entry',
    typicalCostAED: 180,
    typicalCostUSD: 49,
    typicalCostBDT: 5900,
    processingTimeDays: '12 - 24 Hours',
    targetAudience: 'Air transit passengers with connecting flights having layovers over 8 hours',
    requiredDocuments: [
      'Passport copy (min. 6 months validity)',
      'Confirmed onward flight ticket to 3rd country',
      'Hotel reservation in Dubai'
    ],
    eligibilityCriteria: [
      'Traveling onward to a distinct third country (not back to departure country)'
    ],
    channel: 'GDRFA (Dubai)'
  },
  {
    id: 'remote-work-1yr',
    title: '1-Year Virtual Working Visa (Dubai Remote Worker)',
    titleBn: '১ বছরের রিমোট ওয়ার্কিং / ভার্চুয়াল ওয়ার্ক ভিসা',
    duration: '1 Year Renewable',
    entryType: 'Long-term Residence',
    typicalCostAED: 1050,
    typicalCostUSD: 287,
    typicalCostBDT: 34500,
    processingTimeDays: '5 - 7 Days',
    targetAudience: 'Employees and business owners working remotely for companies outside the UAE',
    requiredDocuments: [
      'Passport copy',
      'Proof of Employment with 1-year contract validity OR Proof of Company Ownership outside UAE for 1+ year',
      'Minimum monthly income proof of USD $3,500 (or equivalent)',
      'Last 3 months bank statements',
      'Valid health insurance with UAE coverage'
    ],
    eligibilityCriteria: [
      'Working for remote entity outside the UAE',
      'Minimum US$3,500/month salary or dividend earnings'
    ],
    channel: 'GDRFA (Dubai)'
  }
];

export const GOLDEN_VISA_CATEGORIES: GoldenVisaCategory[] = [
  {
    id: 'gv-property',
    title: 'Real Estate Investor Golden Visa (10 Years)',
    category: 'Investor',
    durationYears: 10,
    minimumInvestmentAED: 2000000,
    eligibilityRequirements: [
      'Own one or multiple properties in Dubai/UAE with a total purchase value of at least AED 2,000,000 ($545,000 USD)',
      'Off-plan properties purchased from approved developers are eligible with paid-up milestones or mortgage letter'
    ],
    requiredAttestations: [
      'Dubai Land Department (DLD) Title Deed or Oqood certificate',
      'Bank statement showing fund transfers or developer statement of accounts'
    ],
    stepByStepGuide: [
      'Obtain initial Title Deed/Oqood confirmation from Dubai Land Department',
      'Apply for DLD Golden Visa pre-approval letter via Cube Centre',
      'Undergo UAE medical fitness exam and biometric Emirates ID enrollment',
      'Issuance of 10-year residency stamp and Golden Emirates ID card'
    ]
  },
  {
    id: 'gv-coder',
    title: 'Software Developer & AI Talent Golden Visa (10 Years)',
    category: 'Specialized Talent / Coder',
    durationYears: 10,
    eligibilityRequirements: [
      'Demonstrated expertise in Software Engineering, Artificial Intelligence, Machine Learning, Data Science, or Blockchain',
      'Active GitHub/portfolio, notable tech leadership, or employment in high-tech UAE/global firms'
    ],
    requiredAttestations: [
      'Nomination/Endorsement letter from UAE AI Office or Coders HQ (Artificial Intelligence, Digital Economy & Remote Work Applications Office)',
      'Attested Computer Science/Engineering degree certificate'
    ],
    stepByStepGuide: [
      'Submit tech portfolio/GitHub/resume to Coders HQ / UAE AI Office portal for nomination',
      'Receive official UAE Government Golden Visa Endorsement Certificate',
      'Submit application through GDRFA Dubai Smart Services with nomination number',
      'Complete local medical screening and receive 10-year visa'
    ]
  },
  {
    id: 'gv-executive',
    title: 'Senior Executive & Manager Golden Visa (10 Years)',
    category: 'Executive / Doctor',
    durationYears: 10,
    minimumSalaryAED: 30000,
    eligibilityRequirements: [
      'Hold a managerial or executive position (Occupational Level 1 or 2 as classified by MOHRE)',
      'Earn a certified gross monthly salary of at least AED 30,000 in the UAE',
      'Hold a recognized Bachelor’s Degree or higher qualification'
    ],
    requiredAttestations: [
      'MOHRE valid employment contract showing salary ≥ AED 30,000',
      'Salary certificate + 6 months consecutive bank statements reflecting salary deposits',
      'MoE (Ministry of Education) Degree Equivalency Certificate'
    ],
    stepByStepGuide: [
      'Obtain MoE equivalency for your university degree certificate',
      'Collect 6-month bank statement with WPS salary credits',
      'Apply for GDRFA nomination under Senior Executives Category',
      'Finalize residency endorsement and receive 10-year Emirates ID'
    ]
  },
  {
    id: 'gv-entrepreneur',
    title: 'Tech & Innovative Entrepreneur Golden Visa (5-10 Years)',
    category: 'Entrepreneur',
    durationYears: 5,
    minimumInvestmentAED: 500000,
    eligibilityRequirements: [
      'Founder or co-owner of an innovative / tech startup with valuation of min. AED 500,000',
      'Approval from an accredited UAE incubator/accelerator (e.g., AREA 2071, Hub71, in5, Dubai Future District)'
    ],
    requiredAttestations: [
      'Trade License with founding shareholding',
      'Audited financial statements or incubator endorsement certificate',
      'Ministry of Economy approval for innovative project'
    ],
    stepByStepGuide: [
      'Submit pitch deck and financial projection to accredited UAE incubator',
      'Receive formal endorsement letter from Ministry of Economy / Incubator',
      'Submit Golden Visa application via ICP or GDRFA portal',
      'Residency visa stamping and Emirates ID delivery'
    ]
  }
];

export const SAMPLE_APPLICATIONS: any[] = [
  {
    id: 'DXB-2026-8941',
    createdAt: '2026-08-28T10:30:00Z',
    updatedAt: '2026-08-29T08:15:00Z',
    applicantName: 'Tariqul Islam Chowdhury',
    passportNumber: 'A08923411',
    nationality: 'Bangladeshi',
    contactEmail: 'rubelbank92@gmail.com',
    contactPhone: '+880 1712-345678',
    visaType: '30-Day Single Entry Tourist Visa',
    status: 'Audited - Passed',
    urgency: 'Express 24h',
    assignedAgent: 'Ahmed Al-Mansoori (Dubai Hub)',
    notes: 'Passport valid till 2029 (over 3 years). Clean white background photo validated. Flight return ticket verified.',
    feePaid: true,
    referenceNumber: 'GDRFA-2026-778219',
    passportAudit: {
      isValid: true,
      overallScore: 96,
      extractedData: {
        fullName: 'TARIQUL ISLAM CHOWDHURY',
        passportNumber: 'A08923411',
        nationality: 'BANGLADESH',
        countryCode: 'BGD',
        dateOfBirth: '1992-05-14',
        sex: 'M',
        placeOfBirth: 'DHAKA',
        issueDate: '2022-06-10',
        expiryDate: '2029-06-09',
        mrzLine1: 'P<BGDCHOWDHURY<<TARIQUL<ISLAM<<<<<<<<<<<<<<<<<<',
        mrzLine2: 'A089234115BGD9205142M2906096<<<<<<<<<<<<<<04'
      },
      validationChecks: {
        hasSixMonthsValidity: true,
        validityRemainingDays: 1015,
        isClearImage: true,
        mrzMatched: true,
        noGlareOrCutoff: true,
        properOrientation: true,
        minimumResolutionMet: true
      },
      rejectionReasons: [],
      suggestions: ['All GDRFA checklist criteria met. Ready for direct portal dispatch.'],
      dubaiVisaEligibilityNotes: 'Standard 30-day tourist entry permit eligible without additional security bond.'
    },
    photoAudit: {
      isValid: true,
      overallScore: 94,
      checks: {
        isWhiteBackground: true,
        isFaceCentered: true,
        faceCoverageRatio: 78,
        is80PercentFaceVisible: true,
        isDimensionsCompliant: true,
        isEyesVisibleAndOpen: true,
        noDarkGlassesOrMask: true,
        noHeavyShadows: true,
        isHighClarity: true
      },
      detectedAttributes: {
        backgroundTone: 'Pure White (RGB 250,250,250)',
        estimatedDimensions: '40x55 mm standard',
        lightingQuality: 'Even diffuse studio lighting',
        expression: 'Neutral frontal gaze'
      },
      rejectionReasons: [],
      suggestions: ['Photo meets ICA / GDRFA biometric standard.']
    }
  },
  {
    id: 'DXB-2026-9012',
    createdAt: '2026-08-29T06:00:00Z',
    updatedAt: '2026-08-29T07:45:00Z',
    applicantName: 'Fatima Al-Zahra Rahman',
    passportNumber: 'B01458920',
    nationality: 'Bangladeshi',
    contactEmail: 'fatima.rahman@example.com',
    contactPhone: '+880 1823-998877',
    visaType: '5-Year Green Visa (Freelancer & Self-Employed)',
    status: 'Audited - Flagged',
    urgency: 'Standard',
    assignedAgent: 'Sarah Jenkins (Visa Desk)',
    notes: 'Passport expiry is in 4 months (Exp: Dec 2026). Requires passport renewal before ICP submission.',
    feePaid: false,
    passportAudit: {
      isValid: false,
      overallScore: 62,
      extractedData: {
        fullName: 'FATIMA AL ZAHRA RAHMAN',
        passportNumber: 'B01458920',
        nationality: 'BANGLADESH',
        countryCode: 'BGD',
        dateOfBirth: '1995-11-20',
        sex: 'F',
        placeOfBirth: 'CHITTAGONG',
        issueDate: '2021-12-05',
        expiryDate: '2026-12-04',
        mrzLine1: 'P<BGDRAHMAN<<FATIMA<AL<ZAHRA<<<<<<<<<<<<<<<<<<',
        mrzLine2: 'B014589202BGD9511204F2612048<<<<<<<<<<<<<<02'
      },
      validationChecks: {
        hasSixMonthsValidity: false,
        validityRemainingDays: 97,
        isClearImage: true,
        mrzMatched: true,
        noGlareOrCutoff: true,
        properOrientation: true,
        minimumResolutionMet: true
      },
      rejectionReasons: [
        'CRITICAL: Passport expires in less than 6 months (Remaining: ~97 days). UAE immigration will reject immediately.'
      ],
      suggestions: [
        'Applicant must apply for an urgent passport reissue at the Bangladesh Passport Office or Embassy before visa submission.'
      ],
      dubaiVisaEligibilityNotes: 'Cannot proceed until renewed passport copy with 6+ months validity is uploaded.'
    }
  },
  {
    id: 'DXB-2026-9055',
    createdAt: '2026-08-27T14:20:00Z',
    updatedAt: '2026-08-29T04:10:00Z',
    applicantName: 'Muhammad Arshad Khan',
    passportNumber: 'PK9920144',
    nationality: 'Pakistani',
    contactEmail: 'arshad.khan@techventure.ae',
    contactPhone: '+971 50 882 1944',
    visaType: '10-Year Golden Visa (Investors, Tech Innovators & Executives)',
    status: 'Approved',
    urgency: 'Express 24h',
    assignedAgent: 'Ahmed Al-Mansoori (Dubai Hub)',
    notes: 'Nominated via Coders HQ & Dubai AI Office. Residency approved. Emirates ID issued.',
    feePaid: true,
    referenceNumber: 'ICP-GV-2026-009182',
    lastEmailSent: '2026-08-29T04:15:00Z'
  }
];
