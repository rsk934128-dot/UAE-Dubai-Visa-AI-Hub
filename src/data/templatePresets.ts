import { CommunicationTemplate } from '../types';

export const DEFAULT_COMMUNICATION_TEMPLATES: CommunicationTemplate[] = [
  {
    id: 'tmpl-approval-tourist',
    name: 'GDRFA Tourist Visa Issuance & Travel Notice',
    category: 'email_update',
    targetVisaType: '30-Day / 60-Day Tourist Visa',
    subject: '🇦🇪 UAE E-Visa Approval Notification - {{applicant_name}} [Ref: {{tracking_id}}]',
    description: 'Official notification to client with issued E-Visa details, QR verification, entry timeline, and airport immigration instructions.',
    tags: ['Approval', 'Tourist', 'E-Visa', 'GDRFA'],
    content: `Dear {{applicant_name}},

We are pleased to inform you that your UAE Entry Permit ({{visa_type}}) has been officially APPROVED and issued by the General Directorate of Residency and Foreigners Affairs (GDRFA Dubai) / Federal ICP Authority.

APPLICATION SUMMARY:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Applicant Name: {{applicant_name}}
• Passport Number: {{passport_number}}
• Nationality: {{nationality}}
• Visa Category: {{visa_type}}
• Internal Dossier Ref: {{tracking_id}}
• Current Status: {{status}}
• Issuing Authority: GDRFA Dubai / ICP Smart Services

IMPORTANT TRAVEL & ENTRY GUIDELINES:
1. Entry Validity Window: You must enter the United Arab Emirates within 60 days from the issuance date indicated on your E-Visa.
2. Color Printout Required: Carry a clean, physical color printout of your electronic visa with the verifiable 2D barcode / QR code for airline check-in and Dubai Airport (DXB/DWC) smart gates.
3. Passport Validity: Ensure your passport remains valid for at least 6 months from your scheduled date of entry into the UAE.
4. Return Flight & Hotel Voucher: Maintain confirmed return flight tickets and valid accommodation confirmation as mandated by immigration border control.
5. Mandatory Health Insurance: Your electronic visa includes standard UAE emergency medical and COVID coverage under government guidelines.

Should you require any airport meet-and-assist or visa extension assistance during your stay, please contact our typing center desk.

Warm regards,
{{officer_name}} | Senior Immigration Consultant
UAE Visa AI Hub & Amer Services
Direct Contact: support@uaevisaaihub.ae | Dubai, UAE`
  },
  {
    id: 'tmpl-cover-letter-standard',
    name: 'Formal Typing Center Visa Application Cover Letter',
    category: 'cover_letter',
    targetVisaType: 'All Visitor & Tourist Visas',
    subject: 'VISA APPLICATION COVER LETTER & GUARANTEE - {{applicant_name}}',
    description: 'Official representation letter submitted to GDRFA / ICP on Amer Typing Center letterhead summarizing the applicant’s profile.',
    tags: ['Cover Letter', 'GDRFA', 'ICP', 'Submission'],
    content: `DATE: {{current_date}}
TO:
The Director General of Residency and Foreigners Affairs (GDRFA)
Federal Authority for Identity, Citizenship, Customs and Port Security (ICP)
United Arab Emirates

SUBJECT: APPLICATION FOR ISSUANCE OF {{visa_type}} (Ref: {{tracking_id}})

Respected Immigration Authority,

We, the undersigned registered typing service center and representative agency, hereby submit this formal application for the grant of a {{visa_type}} on behalf of the applicant whose particulars are detailed hereunder:

1. APPLICANT IDENTIFICATION:
   • Full Name (as per Passport): {{applicant_name}}
   • Passport Number: {{passport_number}}
   • Nationality / Citizenship: {{nationality}}
   • Purpose of Travel: Tourism, Family Visit & Business Sightseeing in the UAE
   • Duration Requested: {{visa_type}}

2. COMPLIANCE & DOCUMENTATION AUDIT:
   All supporting documents have been pre-audited and verified through the UAE Visa AI Hub System:
   a) High-Resolution Machine-Readable Passport Bio-data Page (6+ Months Validity Verified)
   b) Biometric ICAO Standard White-Background Digital Photograph
   c) Confirmed Round-Trip Flight Itinerary & Hotel Booking Reservation
   d) Mandatory UAE-approved Medical Travel Insurance

3. SPONSORSHIP & UNDERTAKING:
   The applicant undertakes to abide by all federal laws and immigration regulations of the United Arab Emirates and affirms that they shall exit the country prior to the expiration of the authorized residency period or apply for a lawful status change through approved channels.

We respectfully request the approval and electronic issuance of the entry permit.

Respectfully submitted,

____________________________
Authorized Signatory & Seal
{{officer_name}}
UAE Visa AI Hub / Amer Certified Typing Center
License No: AMER-DXB-99210-2026
Dubai, United Arab Emirates`
  },
  {
    id: 'tmpl-passport-validity-warning',
    name: 'Passport 6-Month Validity Warning & Renewal Notice',
    category: 'document_request',
    targetVisaType: 'All Categories',
    subject: '⚠️ Action Required: Passport Validity Warning for UAE Visa [Ref: {{tracking_id}}]',
    description: 'Urgent notification sent when passport OCR scan detects less than 180 days remaining before expiration.',
    tags: ['Urgent', 'Passport Rule', 'Compliance', 'Action Required'],
    content: `Dear {{applicant_name}},

During our automated AI pre-audit of your UAE Visa Dossier (Ref: {{tracking_id}}), our immigration compliance system detected an issue regarding your passport validity:

⚠️ CRITICAL COMPLIANCE NOTICE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Applicant Name: {{applicant_name}}
• Passport Number: {{passport_number}}
• Nationality: {{nationality}}
• Issue Detected: Passport has LESS than 6 months (180 days) validity remaining.

UAE IMMIGRATION REGULATION REQUIREMENT:
Under UAE Federal Law and GDRFA/ICP border guidelines, all foreign nationals entering the UAE must hold a passport valid for a minimum of 6 months (180 calendar days) from the entry date. Visas submitted with passports nearing expiration are automatically rejected by the electronic portal, and airlines will deny boarding.

REQUIRED ACTION FROM YOUR SIDE:
1. Please urgently apply for passport renewal with your national passport authority or embassy.
2. Once your renewed passport or official extension slip is issued, reply to this email with a clear, glare-free color scan of the new bio-data page.
3. We have temporarily placed your file on hold under status "{{status}}" to prevent government fee forfeiture.

If you have already renewed your passport and hold the new booklet, please upload it immediately so we can proceed with your GDRFA electronic submission.

Best regards,
{{officer_name}} | Verification Department
UAE Visa AI Hub CRM Desk`
  },
  {
    id: 'tmpl-photo-spec-request',
    name: 'Biometric Photo Specifications Re-upload Request',
    category: 'document_request',
    targetVisaType: 'All Categories',
    subject: '📸 Action Required: UAE Visa Photo Specifications Resubmission - {{applicant_name}}',
    description: 'Guidelines sent to applicants whose photo failed AI biometric check (background tone, shadow, zoom, resolution).',
    tags: ['Photo Specs', 'ICAO', 'Resubmission'],
    content: `Dear {{applicant_name}},

Thank you for choosing our typing services for your UAE Visa ({{visa_type}} - Ref: {{tracking_id}}).

During our automated ICAO & GDRFA biometric photo audit, your submitted photograph did not meet the mandatory electronic filing specifications.

PHOTO REJECTION / CORRECTION REASONS:
• The background must be pure studio off-white or white (no outdoor, wall patterns, or grey gradient).
• Facial zoom: Face must occupy between 70% to 80% of the entire frame (from crown of hair to chin).
• Eye visibility: Eyes must be open, looking directly at the camera with neutral expression.
• No reflections: No dark tinted lenses, heavy glare on spectacles, or shadows across the face.
• Minimum Resolution: 300 DPI (minimum 600x600 pixels) in high clarity JPEG format.

HOW TO RESUBMIT:
Please reply to this email with a new passport-sized photograph taken in a studio or in front of a well-lit white wall, or use our smart Photo Specification Auditor tool on our portal.

Once received, our officer will re-attach the photo and submit your application to the ICP/GDRFA server.

Warm regards,
{{officer_name}}
Documentation Review Team | UAE Visa AI Hub`
  },
  {
    id: 'tmpl-golden-visa-cover-letter',
    name: '10-Year Golden Visa Nomination & Dossier Cover Letter',
    category: 'cover_letter',
    targetVisaType: 'Golden Visa (10-Year)',
    subject: 'GOLDEN RESIDENCE NOMINATION DOSSIER: 10-YEAR CATEGORY - {{applicant_name}}',
    description: 'High-level formal dossier cover letter submitted to GDRFA Golden Visa Committee or ICP Federal Council for long-term residency nomination.',
    tags: ['Golden Visa', '10-Year', 'Nomination', 'Executive/Investor'],
    content: `DATE: {{current_date}}
TO:
The Golden Residency Nominations Committee
General Directorate of Residency and Foreigners Affairs (GDRFA Dubai)
Federal Authority for Identity, Citizenship, Customs and Port Security (ICP)
United Arab Emirates

SUBJECT: APPLICATION DOSSIER FOR 10-YEAR GOLDEN RESIDENCE PERMIT
APPLICANT: {{applicant_name}} | PASSPORT: {{passport_number}} | REF: {{tracking_id}}

Esteemed Committee Members,

We have the distinct honor of presenting the formal nomination dossier for {{applicant_name}}, a citizen of {{nationality}}, seeking the issuance of the prestigious 10-Year UAE Golden Visa under the specialized long-term residency framework.

APPLICANT PROFILE & MERIT SUMMARY:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Primary Category: Executive Leader / Specialized Talent / Tech Innovator
2. Academic Credentials: Certified Bachelor/Master's Degree accredited by UAE Ministry of Education (MOE Equivalency attached).
3. Professional Track Record: Over 10+ years of distinguished leadership in high-tech / strategic sectors.
4. Economic Contribution: Valid MoHRE Employment Contract with monthly remuneration exceeding the AED 30,000 baseline threshold (or approved real estate/investment portfolio).

ENCLOSED SUPPORTING ATTESTATIONS:
✓ Attested University Degree & Ministry of Foreign Affairs (MoFA) Seal
✓ MoHRE Salary Certificate & 6-Month Official Bank Statement
✓ Comprehensive UAE Health Insurance Policy
✓ Clean Criminal Record Certificate & Good Conduct Clearance
✓ Passport Copy (validity verified) & Biometric Studio Portraits

The applicant embodies the vision of the UAE leadership in fostering global talent, technological progress, and long-term sustainable economic growth. We humbly request the committee to review the attached documentation and grant the 10-Year Golden Visa Nomination Approval.

Sincerely,

____________________________
Principal Immigration Counsel
{{officer_name}}
UAE Visa AI Hub & Golden Visa Advisory Group
Dubai World Trade Centre, Dubai, UAE`
  },
  {
    id: 'tmpl-fee-quote-proforma',
    name: 'Itemized Visa Fee Quotation & Proforma Invoice',
    category: 'fee_quote',
    targetVisaType: 'All Visa Categories',
    subject: '💼 UAE Visa Fee Breakdown & Quotation - {{applicant_name}} [{{visa_type}}]',
    description: 'Itemized quotation breakdown with government fees, typing center processing, smart services, and local tax (VAT).',
    tags: ['Fee Quote', 'Invoice', 'Pricing', 'Breakdown'],
    content: `Dear {{applicant_name}},

Thank you for contacting UAE Visa AI Hub Typing Center. Below is the itemized cost breakdown and official fee schedule for your upcoming {{visa_type}} (File Ref: {{tracking_id}}).

OFFICIAL FEE BREAKDOWN (PER APPLICANT):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. GDRFA / ICP Federal Government Visa Fee: Included
2. Smart Services & Electronic Portal Security Charge: Included
3. Mandatory UAE Health & Travel Insurance (Government Provider): Included
4. Amer / Typing Center Electronic Application Preparation: Included
5. Federal Tax Authority VAT (5%): Included

TOTAL ESTIMATE FOR {{applicant_name}}:
• Applicable Currency: AED (UAE Dirham) / USD / BDT
• Processing Turnaround: Standard 24 to 48 working hours (Express priority available upon request)

PAYMENT INSTRUCTIONS & NEXT STEPS:
1. You may settle this fee via Bank Wire, UAE Direct IBAN, or Online Credit Card link.
2. Upon confirmation of payment, your application will be immediately lodged into the GDRFA Smart Immigration System for electronic approval.
3. A tax invoice with government transaction numbers will be generated upon submission.

If you have any questions regarding nationality compliance rules or travel timelines, please feel free to reach out.

Best regards,
{{officer_name}} | Billing & Client Accounts
UAE Visa AI Hub | Amer Typing Services`
  },
  {
    id: 'tmpl-security-clearance-update',
    name: 'Security Clearance & Background Verification Update',
    category: 'email_update',
    targetVisaType: 'All Visitor & Residence Visas',
    subject: 'ℹ️ GDRFA Processing Update: In-Depth Review - {{applicant_name}} [Ref: {{tracking_id}}]',
    description: 'Reassuring update sent to clients when an application undergoes routine additional review or security verification.',
    tags: ['In Process', 'Security Clearance', 'Timeline'],
    content: `Dear {{applicant_name}},

We are writing to provide you with a transparent status update regarding your UAE visa application ({{visa_type}} - Ref: {{tracking_id}}).

CURRENT WORKFLOW STATUS:
• Status: {{status}} (Under Routine Security Review & Verification)
• Passport: {{passport_number}}
• Nationality: {{nationality}}

WHAT THIS MEANS:
Your application has been successfully submitted to the GDRFA / ICP Immigration portal. The electronic system has routed the application for standard background verification. This is a routine administrative process for various nationalities and profession categories.

ESTIMATED TIMELINE:
• Expected resolution: 2 to 4 additional business days.
• Our automated tracking portal checks the government status hourly. You will receive an immediate SMS/Email alert the moment your E-Visa is granted.

RECOMMENDATION:
We strongly advise waiting for final e-visa approval before purchasing non-refundable air tickets or non-changeable accommodation bookings.

Thank you for your patience and cooperation.

Kind regards,
{{officer_name}}
Senior Processing Officer | UAE Visa AI Hub`
  },
  {
    id: 'tmpl-job-seeker-exploration',
    name: '60-Day Job Seeker Exploration Visa Cover Letter',
    category: 'cover_letter',
    targetVisaType: 'Job Seeker Exploration Visa (60/90 Days)',
    subject: 'EXPLORATION ENTRY PERMIT SUBMISSION: JOB SEEKER VISA - {{applicant_name}}',
    description: 'Formal submission letter for bachelor degree holders applying for self-sponsored UAE job search entry permits.',
    tags: ['Job Seeker', 'Exploration', 'Degree Attestation', 'ICP'],
    content: `DATE: {{current_date}}
TO:
The Federal Authority for Identity, Citizenship, Customs and Port Security (ICP)
United Arab Emirates

SUBJECT: APPLICATION FOR 60-DAY SINGLE-ENTRY JOB SEEKER EXPLORATION VISA
APPLICANT: {{applicant_name}} | PASSPORT: {{passport_number}} | DOSSIER: {{tracking_id}}

Respected Immigration Officers,

We have the honor to submit this application for the self-sponsored Job Seeker Exploration Visa on behalf of {{applicant_name}}, an eligible graduate professional from {{nationality}}.

ELIGIBILITY & ATTESTATION CRITERIA FULFILLED:
1. Educational Qualifications: The applicant holds an accredited Bachelor’s Degree (Level 1/2/3 under MoHRE professional classifications).
2. Attestation Verification: Degree has been fully authenticated by the Ministry of Foreign Affairs (MoFA) and UAE Embassy in the country of origin.
3. Financial Solvency: Proof of adequate living funds and refundable bank security deposit verified.
4. Purpose: Exploring career, contractual, and commercial opportunities within the United Arab Emirates in full compliance with ministerial decree guidelines.

We request the electronic issuance of the single-entry Job Seeker Permit to facilitate the applicant's travel.

Respectfully submitted,

____________________________
Authorized Typing Officer
{{officer_name}}
UAE Visa AI Hub CRM
Dubai, UAE`
  }
];

export const TEMPLATE_STORAGE_KEY = 'uae_visa_crm_templates_v1';

export function getSavedTemplates(): CommunicationTemplate[] {
  try {
    const raw = localStorage.getItem(TEMPLATE_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Could not read saved templates from localStorage:', err);
  }
  return DEFAULT_COMMUNICATION_TEMPLATES;
}

export function saveTemplatesToStorage(templates: CommunicationTemplate[]) {
  try {
    localStorage.setItem(TEMPLATE_STORAGE_KEY, JSON.stringify(templates));
  } catch (err) {
    console.warn('Could not save templates to localStorage:', err);
  }
}

export function resolveTemplateVariables(
  content: string, 
  data: {
    applicantName?: string;
    passportNumber?: string;
    nationality?: string;
    visaType?: string;
    trackingId?: string;
    status?: string;
    officerName?: string;
    currentDate?: string;
  }
): string {
  const applicantName = data.applicantName || 'Applicant Full Name';
  const passportNumber = data.passportNumber || 'A00000000';
  const nationality = data.nationality || 'Bangladeshi';
  const visaType = data.visaType || '30-Day Single Entry Tourist Visa';
  const trackingId = data.trackingId || 'DXB-2026-88901';
  const status = data.status || 'Audited - Passed';
  const officerName = data.officerName || 'Amer Operations Team';
  const currentDate = data.currentDate || new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

  return content
    .replace(/\{\{applicant_name\}\}/gi, applicantName)
    .replace(/\{\{passport_number\}\}/gi, passportNumber)
    .replace(/\{\{nationality\}\}/gi, nationality)
    .replace(/\{\{visa_type\}\}/gi, visaType)
    .replace(/\{\{tracking_id\}\}/gi, trackingId)
    .replace(/\{\{file_id\}\}/gi, trackingId)
    .replace(/\{\{status\}\}/gi, status)
    .replace(/\{\{officer_name\}\}/gi, officerName)
    .replace(/\{\{current_date\}\}/gi, currentDate);
}
