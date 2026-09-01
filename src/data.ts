import { VisaCategory, GoldenVisaCategory, VisaApplication } from './types';

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

export const SAMPLE_APPLICATIONS: VisaApplication[] = [
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
    documentHistory: [
      {
        id: 'doc-tariqul-01',
        version: 'v1.0',
        documentType: 'Passport OCR',
        fileName: 'tariqul_chowdhury_passport_scan.png',
        uploadedAt: '2026-08-28T10:15:00Z',
        uploadedBy: 'Desk Officer (OCR Auto-Parser)',
        status: 'Passed',
        score: 96,
        summary: 'ICAO Doc 9303 Compliant. MRZ checksum verified. Passport validity: 1,015 days (>6 months).',
        details: {
          validityDaysRemaining: 1015,
          expiryDate: '2029-06-09',
          mrzStatus: 'Matched',
          sixMonthRuleMet: true,
          previewUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="260" viewBox="0 0 800 520"><rect width="800" height="520" fill="%230f172a" rx="16"/><rect x="15" y="15" width="770" height="490" fill="%231e293b" rx="12" stroke="%2338bdf8" stroke-width="2"/><text x="260" y="70" fill="%2338bdf8" font-family="monospace" font-size="20" font-weight="bold">BANGLADESH PASSPORT v1.0</text><text x="260" y="140" fill="%2394a3b8" font-size="16">Passport No: A08923411</text><text x="260" y="180" fill="%2310b981" font-size="16" font-weight="bold">Exp: 09 JUN 2029 (Valid)</text></svg>',
          fileSize: '1.8 MB',
          checksumSha256: '9f83ab12c45e89d10e...'
        },
        notes: 'Original scan passed all high-resolution clarity filters.'
      },
      {
        id: 'doc-tariqul-02',
        version: 'v1.1',
        documentType: 'Biometric Photo',
        fileName: 'tariqul_white_bg_40x55.jpg',
        uploadedAt: '2026-08-28T11:00:00Z',
        uploadedBy: 'Ahmed Al-Mansoori (Dubai Hub)',
        status: 'Passed',
        score: 94,
        summary: '40x55mm dimension verified. 78% face coverage ratio, pure white background RGB(250,250,250).',
        details: {
          photoDimensions: '40x55 mm',
          faceCoverageRatio: 78,
          backgroundTone: 'Pure White (RGB 250,250,250)',
          fileSize: '420 KB',
          checksumSha256: 'a12bc902de4451fa8...'
        },
        notes: 'Complies with GDRFA and ICP e-channel biometric photo specs.'
      },
      {
        id: 'doc-tariqul-03',
        version: 'v1.2',
        documentType: 'Selfie Liveness',
        fileName: 'tariqul_live_face_match.png',
        uploadedAt: '2026-08-28T11:30:00Z',
        uploadedBy: 'Biometric Engine (Live AI)',
        status: 'Passed',
        score: 98,
        summary: 'Facial recognition match 98% between live selfie camera capture and passport photo page.',
        details: {
          fileSize: '890 KB',
          checksumSha256: 'f87a32190bbca4...'
        },
        notes: 'Liveness anti-spoofing certified (3D depth texture & blink detection passed).'
      }
    ],
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
    },
    auditTrail: [
      {
        id: 'audit-tariqul-01',
        applicationId: 'DXB-2026-8941',
        applicantName: 'Tariqul Islam Chowdhury',
        passportNumber: 'A08923411',
        timestamp: '2026-08-28T10:00:00Z',
        type: 'application_created',
        title: 'Application Dossier Initialized',
        titleBn: 'আবেদন ফাইল তৈরি করা হয়েছে',
        actor: 'Ahmed Al-Mansoori (Dubai Hub)',
        details: {
          previousStatus: 'None',
          newStatus: 'Draft',
          notes: 'Client intake for 30-Day Single Entry Tourist Visa. Awaiting passport scan and biometric photo.'
        }
      },
      {
        id: 'audit-tariqul-02',
        applicationId: 'DXB-2026-8941',
        applicantName: 'Tariqul Islam Chowdhury',
        passportNumber: 'A08923411',
        timestamp: '2026-08-28T10:15:00Z',
        type: 'document_update',
        title: 'Passport OCR Audited (Score: 96/100)',
        titleBn: 'পাসপোর্ট ওসিআর অডিট সম্পন্ন (স্কোর: ৯৬/১০০)',
        actor: 'Desk Officer (OCR Auto-Parser)',
        details: {
          documentType: 'Passport OCR',
          fileName: 'tariqul_chowdhury_passport_scan.png',
          version: 'v1.0',
          score: 96,
          fileSize: '1.8 MB',
          checksumSha256: '9f83ab12c45e89d10e...',
          notes: 'ICAO Doc 9303 Compliant. MRZ checksum verified. Passport validity: 1,015 days (>6 months).'
        }
      },
      {
        id: 'audit-tariqul-03',
        applicationId: 'DXB-2026-8941',
        applicantName: 'Tariqul Islam Chowdhury',
        passportNumber: 'A08923411',
        timestamp: '2026-08-28T11:00:00Z',
        type: 'document_update',
        title: 'Biometric Photo Specification Validated',
        titleBn: 'বায়োমেট্রিক ছবি যাচাই সম্পন্ন (স্কোর: ৯৪/১০০)',
        actor: 'Ahmed Al-Mansoori (Dubai Hub)',
        details: {
          documentType: 'Biometric Photo',
          fileName: 'tariqul_white_bg_40x55.jpg',
          version: 'v1.1',
          score: 94,
          fileSize: '420 KB',
          checksumSha256: 'a12bc902de4451fa8...',
          notes: '40x55mm dimension verified. 78% face coverage ratio, pure white background RGB(250,250,250).'
        }
      },
      {
        id: 'audit-tariqul-04',
        applicationId: 'DXB-2026-8941',
        applicantName: 'Tariqul Islam Chowdhury',
        passportNumber: 'A08923411',
        timestamp: '2026-08-28T11:30:00Z',
        type: 'document_update',
        title: 'Selfie Liveness Anti-Spoofing Certified',
        titleBn: 'সেলফি লাইভনেস চেক উত্তীর্ণ (স্কোর: ৯৮/১০০)',
        actor: 'Biometric Engine (Live AI)',
        details: {
          documentType: 'Selfie Liveness',
          fileName: 'tariqul_live_face_match.png',
          version: 'v1.2',
          score: 98,
          fileSize: '890 KB',
          checksumSha256: 'f87a32190bbca4...',
          notes: 'Facial recognition match 98% between live selfie camera capture and passport photo page.'
        }
      },
      {
        id: 'audit-tariqul-05',
        applicationId: 'DXB-2026-8941',
        applicantName: 'Tariqul Islam Chowdhury',
        passportNumber: 'A08923411',
        timestamp: '2026-08-28T11:35:00Z',
        type: 'status_change',
        title: 'Status Updated: Draft ➔ Audited - Passed',
        titleBn: 'স্ট্যাটাস পরিবর্তিত: খসড়া ➔ অডিট উত্তীর্ণ',
        actor: 'Ahmed Al-Mansoori (Dubai Hub)',
        details: {
          previousStatus: 'Draft',
          newStatus: 'Audited - Passed',
          reason: 'All documents met GDRFA checklist criteria. 6-Month validity verified (1,015 days remaining).',
          statusColor: 'emerald'
        }
      },
      {
        id: 'audit-tariqul-06',
        applicationId: 'DXB-2026-8941',
        applicantName: 'Tariqul Islam Chowdhury',
        passportNumber: 'A08923411',
        timestamp: '2026-08-28T11:45:00Z',
        type: 'email_alert',
        title: 'Pre-Audit Clearance Email Alert Dispatched',
        titleBn: 'ইমেইল অ্যালার্ট: প্রি-চেক ক্লিয়ারেন্স নোটিফিকেশন',
        actor: 'Ahmed Al-Mansoori (Dubai Hub)',
        details: {
          recipientEmail: 'rubelbank92@gmail.com',
          subject: 'UAE Visa Application Cleared - GDRFA Pre-Check Passed for Tariqul Islam Chowdhury',
          deliveryStatus: 'Delivered',
          templateUsed: 'Pre-Audit Clearance Notice',
          emailBodyPreview: 'Dear Tariqul Islam Chowdhury, Your passport OCR and biometric photos have successfully passed GDRFA pre-screening...'
        }
      },
      {
        id: 'audit-tariqul-07',
        applicationId: 'DXB-2026-8941',
        applicantName: 'Tariqul Islam Chowdhury',
        passportNumber: 'A08923411',
        timestamp: '2026-08-28T14:10:00Z',
        type: 'status_change',
        title: 'Status Updated: Audited - Passed ➔ Submitted to GDRFA/ICP',
        titleBn: 'স্ট্যাটাস পরিবর্তিত: অডিট উত্তীর্ণ ➔ জিডিআরএফএ-তে জমাদান',
        actor: 'Ahmed Al-Mansoori (Dubai Hub)',
        details: {
          previousStatus: 'Audited - Passed',
          newStatus: 'Submitted to GDRFA/ICP',
          reason: 'Official e-Visa application lodged via GDRFA Dubai Smart Channel. Filing reference: GDRFA-2026-778219.',
          statusColor: 'sky'
        }
      },
      {
        id: 'audit-tariqul-08',
        applicationId: 'DXB-2026-8941',
        applicantName: 'Tariqul Islam Chowdhury',
        passportNumber: 'A08923411',
        timestamp: '2026-08-28T14:15:00Z',
        type: 'email_alert',
        title: 'GDRFA Reference & Tracking Confirmation Dispatched',
        titleBn: 'ইমেইল অ্যালার্ট: জিডিআরএফএ ট্র্যাকিং নিশ্চিতকরণ',
        actor: 'Ahmed Al-Mansoori (Dubai Hub)',
        details: {
          recipientEmail: 'rubelbank92@gmail.com',
          subject: 'Official Filing Notice: Application #GDRFA-2026-778219 Submitted to Dubai Immigration',
          deliveryStatus: 'Delivered',
          templateUsed: 'Application Submission Confirmation',
          emailBodyPreview: 'Your application has been officially registered on the GDRFA Dubai Smart Portal with reference #GDRFA-2026-778219...'
        }
      }
    ]
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
    documentHistory: [
      {
        id: 'doc-fatima-01',
        version: 'v1.0',
        documentType: 'Passport OCR',
        fileName: 'fatima_rahman_old_passport.png',
        uploadedAt: '2026-08-29T06:05:00Z',
        uploadedBy: 'Sarah Jenkins (Visa Desk)',
        status: 'Flagged',
        score: 62,
        summary: 'CRITICAL FLAGGED: Passport validity is 97 days (<180 days rule). UAE entry permit will be rejected automatically.',
        details: {
          validityDaysRemaining: 97,
          expiryDate: '2026-12-04',
          mrzStatus: 'Matched',
          sixMonthRuleMet: false,
          rejectionReasons: ['Passport expires on Dec 4, 2026. Less than 6 months validity remaining.'],
          suggestions: ['Applicant must provide renewed e-Passport.'],
          fileSize: '2.1 MB',
          checksumSha256: '7c81a293df450e12...'
        },
        notes: 'Notice dispatched to applicant requesting urgent re-issue slip.'
      },
      {
        id: 'doc-fatima-02',
        version: 'v1.1',
        documentType: 'Other Document',
        fileName: 'bd_embassy_reissue_acknowledgement.pdf',
        uploadedAt: '2026-08-29T07:20:00Z',
        uploadedBy: 'Sarah Jenkins (Visa Desk)',
        status: 'Under Review',
        score: 85,
        summary: 'Embassy of Bangladesh Passport Re-issue Acknowledgement Slip #BGD-DUB-99410.',
        details: {
          fileSize: '540 KB',
          checksumSha256: '3e41b990cc1123fa...'
        },
        notes: 'Provisional proof of renewal pending final passport booklet print.'
      }
    ],
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
    },
    auditTrail: [
      {
        id: 'audit-fatima-01',
        applicationId: 'DXB-2026-9012',
        applicantName: 'Fatima Al-Zahra Rahman',
        passportNumber: 'B01458920',
        timestamp: '2026-08-29T06:00:00Z',
        type: 'application_created',
        title: 'Green Visa Application Dossier Initiated',
        titleBn: 'গ্রিন ভিসা আবেদন ফাইল তৈরি করা হয়েছে',
        actor: 'Sarah Jenkins (Visa Desk)',
        details: {
          previousStatus: 'None',
          newStatus: 'Draft',
          notes: 'Intake for 5-Year Green Visa (Freelancer & Self-Employed). Initial passport copy uploaded.'
        }
      },
      {
        id: 'audit-fatima-02',
        applicationId: 'DXB-2026-9012',
        applicantName: 'Fatima Al-Zahra Rahman',
        passportNumber: 'B01458920',
        timestamp: '2026-08-29T06:05:00Z',
        type: 'document_update',
        title: 'Passport OCR Audit Completed - Flagged (Score: 62/100)',
        titleBn: 'পাসপোর্ট ওসিআর অডিট সম্পন্ন - ফ্ল্যাগড (স্কোর: ৬২/১০০)',
        actor: 'Sarah Jenkins (Visa Desk)',
        details: {
          documentType: 'Passport OCR',
          fileName: 'fatima_rahman_old_passport.png',
          version: 'v1.0',
          score: 62,
          fileSize: '2.1 MB',
          notes: 'CRITICAL FLAGGED: Passport validity is 97 days (<180 days rule). Exp: 04 Dec 2026. UAE immigration entry permit will be rejected.'
        }
      },
      {
        id: 'audit-fatima-03',
        applicationId: 'DXB-2026-9012',
        applicantName: 'Fatima Al-Zahra Rahman',
        passportNumber: 'B01458920',
        timestamp: '2026-08-29T06:10:00Z',
        type: 'status_change',
        title: 'Status Updated: Draft ➔ Audited - Flagged',
        titleBn: 'স্ট্যাটাস পরিবর্তিত: খসড়া ➔ অডিট ফ্ল্যাগড',
        actor: 'Sarah Jenkins (Visa Desk)',
        details: {
          previousStatus: 'Draft',
          newStatus: 'Audited - Flagged',
          reason: 'Passport expires in less than 6 months (Remaining: ~97 days). UAE immigration requires min. 180 days validity.',
          statusColor: 'red'
        }
      },
      {
        id: 'audit-fatima-04',
        applicationId: 'DXB-2026-9012',
        applicantName: 'Fatima Al-Zahra Rahman',
        passportNumber: 'B01458920',
        timestamp: '2026-08-29T06:20:00Z',
        type: 'email_alert',
        title: 'Critical Document Renewal Advisory Alert Dispatched',
        titleBn: 'ইমেইল অ্যালার্ট: জরুরি পাসপোর্ট নবায়ন নোটিশ পাঠানো হয়েছে',
        actor: 'Sarah Jenkins (Visa Desk)',
        details: {
          recipientEmail: 'fatima.rahman@example.com',
          subject: 'URGENT ATTENTION: UAE Visa Pre-Audit Flagged - Passport Renewal Required for Fatima Rahman',
          deliveryStatus: 'Delivered',
          templateUsed: 'Missing Documents / Renewal Advisory',
          emailBodyPreview: 'Dear Fatima, Your passport expires on 04 Dec 2026 (less than 6 months remaining). UAE immigration requires min. 180 days validity. Please arrange urgent passport reissue...'
        }
      },
      {
        id: 'audit-fatima-05',
        applicationId: 'DXB-2026-9012',
        applicantName: 'Fatima Al-Zahra Rahman',
        passportNumber: 'B01458920',
        timestamp: '2026-08-29T07:20:00Z',
        type: 'document_update',
        title: 'Embassy Renewal Acknowledgement Slip Uploaded',
        titleBn: 'দূতাবাস নবায়ন প্রাপ্তি রশিদ আপলোড করা হয়েছে',
        actor: 'Sarah Jenkins (Visa Desk)',
        details: {
          documentType: 'Other Document',
          fileName: 'bd_embassy_reissue_acknowledgement.pdf',
          version: 'v1.1',
          score: 85,
          fileSize: '540 KB',
          notes: 'Embassy of Bangladesh Passport Re-issue Acknowledgement Slip #BGD-DUB-99410 registered.'
        }
      },
      {
        id: 'audit-fatima-06',
        applicationId: 'DXB-2026-9012',
        applicantName: 'Fatima Al-Zahra Rahman',
        passportNumber: 'B01458920',
        timestamp: '2026-08-29T07:45:00Z',
        type: 'note_added',
        title: 'Compliance Officer Note Logged',
        titleBn: 'কমপ্লায়েন্স নোট সংরক্ষণ করা হয়েছে',
        actor: 'Sarah Jenkins (Visa Desk)',
        details: {
          notes: 'Applicant lodged urgent 48-hour renewal at Embassy. File placed on temporary hold pending new passport booklet delivery.'
        }
      }
    ]
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
    lastEmailSent: '2026-08-29T04:15:00Z',
    documentHistory: [
      {
        id: 'doc-arshad-01',
        version: 'v1.0',
        documentType: 'Passport OCR',
        fileName: 'arshad_khan_passport_pk.pdf',
        uploadedAt: '2026-08-27T14:30:00Z',
        uploadedBy: 'Ahmed Al-Mansoori (Dubai Hub)',
        status: 'Passed',
        score: 99,
        summary: 'Passport validity: 6+ years (Exp: 2032). MRZ checksum 100% matched.',
        details: {
          validityDaysRemaining: 2190,
          expiryDate: '2032-08-15',
          mrzStatus: 'Matched',
          sixMonthRuleMet: true,
          fileSize: '3.4 MB',
          checksumSha256: '99ab12f00234ac99...'
        },
        notes: 'Primary identity document verified.'
      },
      {
        id: 'doc-arshad-02',
        version: 'v1.1',
        documentType: 'Other Document',
        fileName: 'coders_hq_endorsement_letter.pdf',
        uploadedAt: '2026-08-27T15:10:00Z',
        uploadedBy: 'Ahmed Al-Mansoori (Dubai Hub)',
        status: 'Approved',
        score: 100,
        summary: 'Official endorsement letter issued by Dubai AI Office & Coders HQ for 10-Year Golden Residency.',
        details: {
          fileSize: '1.2 MB',
          checksumSha256: '00f12c8849aa523...'
        },
        notes: 'Category: Specialized Talent (AI / Deep Learning Researcher).'
      },
      {
        id: 'doc-arshad-03',
        version: 'v1.2',
        documentType: 'Attested Degree',
        fileName: 'mofaic_attested_masters_cs.pdf',
        uploadedAt: '2026-08-28T09:00:00Z',
        uploadedBy: 'Ahmed Al-Mansoori (Dubai Hub)',
        status: 'Approved',
        score: 95,
        summary: 'Master of Science in Computer Science attested by UAE Ministry of Foreign Affairs (MOFAIC) & MoE Equivalency.',
        details: {
          fileSize: '2.8 MB',
          checksumSha256: '88bc34101def890...'
        },
        notes: 'Equivalency Certificate #MOE-EQ-2026-88192 on file.'
      }
    ],
    auditTrail: [
      {
        id: 'audit-arshad-01',
        applicationId: 'DXB-2026-9055',
        applicantName: 'Muhammad Arshad Khan',
        passportNumber: 'PK9920144',
        timestamp: '2026-08-27T14:20:00Z',
        type: 'application_created',
        title: 'Golden Visa Dossier Initialized',
        titleBn: 'গোল্ডেন ভিসা ফাইল তৈরি করা হয়েছে',
        actor: 'Ahmed Al-Mansoori (Dubai Hub)',
        details: {
          previousStatus: 'None',
          newStatus: 'Draft',
          notes: '10-Year Golden Visa (Specialized Talent - AI/Deep Learning Researcher).'
        }
      },
      {
        id: 'audit-arshad-02',
        applicationId: 'DXB-2026-9055',
        applicantName: 'Muhammad Arshad Khan',
        passportNumber: 'PK9920144',
        timestamp: '2026-08-27T14:30:00Z',
        type: 'document_update',
        title: 'Passport OCR Audited (Score: 99/100)',
        titleBn: 'পাসপোর্ট ওসিআর অডিট সম্পন্ন (স্কোর: ৯৯/১০০)',
        actor: 'Ahmed Al-Mansoori (Dubai Hub)',
        details: {
          documentType: 'Passport OCR',
          fileName: 'arshad_khan_passport_pk.pdf',
          version: 'v1.0',
          score: 99,
          fileSize: '3.4 MB',
          checksumSha256: '99ab12f00234ac99...',
          notes: 'Passport validity: 6+ years (Exp: 2032). MRZ checksum 100% matched.'
        }
      },
      {
        id: 'audit-arshad-03',
        applicationId: 'DXB-2026-9055',
        applicantName: 'Muhammad Arshad Khan',
        passportNumber: 'PK9920144',
        timestamp: '2026-08-27T15:10:00Z',
        type: 'document_update',
        title: 'Coders HQ Endorsement Letter Approved (100/100)',
        titleBn: 'কোডার্স হেডকোয়ার্টার্স অনুমোদনপত্র যাচাই সম্পন্ন',
        actor: 'Ahmed Al-Mansoori (Dubai Hub)',
        details: {
          documentType: 'Other Document',
          fileName: 'coders_hq_endorsement_letter.pdf',
          version: 'v1.1',
          score: 100,
          fileSize: '1.2 MB',
          checksumSha256: '00f12c8849aa523...',
          notes: 'Official endorsement letter issued by Dubai AI Office & Coders HQ for 10-Year Golden Residency.'
        }
      },
      {
        id: 'audit-arshad-04',
        applicationId: 'DXB-2026-9055',
        applicantName: 'Muhammad Arshad Khan',
        passportNumber: 'PK9920144',
        timestamp: '2026-08-28T09:00:00Z',
        type: 'document_update',
        title: 'MOFAIC Attested Degree Verified (Score: 95/100)',
        titleBn: 'মোফাইক সত্যায়িত ডিগ্রি যাচাই সম্পন্ন',
        actor: 'Ahmed Al-Mansoori (Dubai Hub)',
        details: {
          documentType: 'Attested Degree',
          fileName: 'mofaic_attested_masters_cs.pdf',
          version: 'v1.2',
          score: 95,
          fileSize: '2.8 MB',
          checksumSha256: '88bc34101def890...',
          notes: 'Master of Science in Computer Science attested by MOFAIC & MoE Equivalency #MOE-EQ-2026-88192.'
        }
      },
      {
        id: 'audit-arshad-05',
        applicationId: 'DXB-2026-9055',
        applicantName: 'Muhammad Arshad Khan',
        passportNumber: 'PK9920144',
        timestamp: '2026-08-28T09:30:00Z',
        type: 'status_change',
        title: 'Status Updated: Draft ➔ Audited - Passed',
        titleBn: 'স্ট্যাটাস পরিবর্তিত: খসড়া ➔ অডিট উত্তীর্ণ',
        actor: 'Ahmed Al-Mansoori (Dubai Hub)',
        details: {
          previousStatus: 'Draft',
          newStatus: 'Audited - Passed',
          reason: 'All Golden Visa prerequisites verified with Coders HQ accreditation.',
          statusColor: 'emerald'
        }
      },
      {
        id: 'audit-arshad-06',
        applicationId: 'DXB-2026-9055',
        applicantName: 'Muhammad Arshad Khan',
        passportNumber: 'PK9920144',
        timestamp: '2026-08-28T10:00:00Z',
        type: 'status_change',
        title: 'Status Updated: Audited - Passed ➔ Submitted to GDRFA/ICP',
        titleBn: 'স্ট্যাটাস পরিবর্তিত: অডিট উত্তীর্ণ ➔ আইসিপি-তে জমাদান',
        actor: 'Ahmed Al-Mansoori (Dubai Hub)',
        details: {
          previousStatus: 'Audited - Passed',
          newStatus: 'Submitted to GDRFA/ICP',
          reason: 'Nomination dossier transmitted to ICP Federal Portal. Ref: ICP-GV-2026-009182.',
          statusColor: 'sky'
        }
      },
      {
        id: 'audit-arshad-07',
        applicationId: 'DXB-2026-9055',
        applicantName: 'Muhammad Arshad Khan',
        passportNumber: 'PK9920144',
        timestamp: '2026-08-29T04:10:00Z',
        type: 'status_change',
        title: 'Status Updated: Submitted to GDRFA/ICP ➔ Approved',
        titleBn: 'স্ট্যাটাস পরিবর্তিত: জমাদান ➔ অনুমোদিত',
        actor: 'Ahmed Al-Mansoori (Dubai Hub)',
        details: {
          previousStatus: 'Submitted to GDRFA/ICP',
          newStatus: 'Approved',
          reason: 'Federal ICP Approval Grant received. 10-Year Golden Visa residency status active.',
          statusColor: 'emerald'
        }
      },
      {
        id: 'audit-arshad-08',
        applicationId: 'DXB-2026-9055',
        applicantName: 'Muhammad Arshad Khan',
        passportNumber: 'PK9920144',
        timestamp: '2026-08-29T04:15:00Z',
        type: 'email_alert',
        title: 'Golden Visa Grant Approval Notice Dispatched',
        titleBn: 'ইমেইল অ্যালার্ট: গোল্ডেন ভিসা অনুমোদন নোটিশ প্রেরণ',
        actor: 'Ahmed Al-Mansoori (Dubai Hub)',
        details: {
          recipientEmail: 'arshad.khan@techventure.ae',
          subject: 'CONGRATULATIONS: UAE 10-Year Golden Visa Approved for Muhammad Arshad Khan',
          deliveryStatus: 'Delivered',
          templateUsed: 'Golden Visa Approval Notice',
          emailBodyPreview: 'We are pleased to inform you that your 10-Year UAE Golden Visa nomination (#ICP-GV-2026-009182) has been approved...'
        }
      }
    ]
  }
];
