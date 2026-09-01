export interface PassportAuditResult {
  isValid: boolean;
  overallScore: number; // 0 - 100
  extractedData: {
    fullName: string;
    passportNumber: string;
    nationality: string;
    countryCode: string;
    dateOfBirth: string;
    sex: string;
    placeOfBirth: string;
    issueDate: string;
    expiryDate: string;
    mrzLine1?: string;
    mrzLine2?: string;
  };
  validationChecks: {
    hasSixMonthsValidity: boolean;
    validityRemainingDays: number;
    isClearImage: boolean;
    mrzMatched: boolean;
    noGlareOrCutoff: boolean;
    properOrientation: boolean;
    minimumResolutionMet: boolean;
  };
  rejectionReasons: string[];
  suggestions: string[];
  dubaiVisaEligibilityNotes: string;
}

export interface SavedPassportAudit {
  id: string;
  timestamp: string;
  previewUrl: string;
  result: PassportAuditResult;
  fileName?: string;
}

export interface BatchPassportAuditItem {
  id: string;
  fileName: string;
  fileSize?: number;
  previewUrl: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  result?: PassportAuditResult;
  error?: string;
  processedAt?: string;
}

export interface LivenessCheckResult {
  isMatch: boolean;
  matchConfidenceScore: number; // 0 - 100
  verdict: 'VERIFIED_MATCH' | 'POTENTIAL_MISMATCH' | 'REJECTED_MISMATCH' | 'INCONCLUSIVE';
  livenessValidation: {
    isRealHuman: boolean;
    isLiveCapture: boolean;
    isNaturalLighting: boolean;
    isFrontalPose: boolean;
    noSpoofingDetected: boolean;
    noScreenReplayOrPrintout: boolean;
  };
  facialStructureAnalysis: {
    jawlineMatch: 'High' | 'Moderate' | 'Low' | 'Mismatch';
    eyesAndBrowsMatch: 'High' | 'Moderate' | 'Low' | 'Mismatch';
    noseStructureMatch: 'High' | 'Moderate' | 'Low' | 'Mismatch';
    mouthAndLipsMatch: 'High' | 'Moderate' | 'Low' | 'Mismatch';
    facialProportionsNotes: string;
  };
  matchedCharacteristics: string[];
  differingCharacteristics: string[];
  summary: string;
  recommendations: string[];
  timestamp?: string;
}

export interface PhotoAuditResult {
  isValid: boolean;
  overallScore: number; // 0 - 100
  checks: {
    isWhiteBackground: boolean;
    isFaceCentered: boolean;
    faceCoverageRatio: number; // e.g. 75 - 80%
    is80PercentFaceVisible: boolean;
    isDimensionsCompliant: boolean; // 40x55mm or 2x2 inch standard
    isEyesVisibleAndOpen: boolean;
    noDarkGlassesOrMask: boolean;
    noHeavyShadows: boolean;
    isHighClarity: boolean;
  };
  detectedAttributes: {
    backgroundTone: string;
    estimatedDimensions: string;
    lightingQuality: string;
    expression: string;
  };
  rejectionReasons: string[];
  suggestions: string[];
  livenessResult?: LivenessCheckResult;
}

export interface VisaCategory {
  id: string;
  title: string;
  titleBn: string;
  duration: string;
  entryType: 'Single Entry' | 'Multiple Entry' | 'Long-term Residence';
  typicalCostAED: number;
  typicalCostUSD: number;
  typicalCostBDT: number;
  processingTimeDays: string;
  targetAudience: string;
  requiredDocuments: string[];
  eligibilityCriteria: string[];
  channel: 'ICP (Federal/Abu Dhabi/Sharjah)' | 'GDRFA (Dubai)';
}

export interface GoldenVisaCategory {
  id: string;
  title: string;
  category: 'Investor' | 'Entrepreneur' | 'Specialized Talent / Coder' | 'Outstanding Student' | 'Executive / Doctor';
  durationYears: 10 | 5;
  minimumInvestmentAED?: number;
  minimumSalaryAED?: number;
  eligibilityRequirements: string[];
  requiredAttestations: string[];
  stepByStepGuide: string[];
}

export type DocumentAuditType = 
  | 'Passport OCR' 
  | 'Biometric Photo' 
  | 'Selfie Liveness' 
  | 'Attested Degree' 
  | 'Salary Certificate / Bank Statement' 
  | 'Emirates ID / National ID' 
  | 'Trade License / Work Contract' 
  | 'Other Document';

export type DocumentAuditStatus = 'Passed' | 'Flagged' | 'Under Review' | 'Superseded' | 'Approved';

export interface DocumentAuditHistoryItem {
  id: string;
  version: string; // e.g. "v1.0", "v1.1", "v2.0"
  documentType: DocumentAuditType;
  fileName: string;
  uploadedAt: string;
  uploadedBy: string;
  status: DocumentAuditStatus;
  score: number; // 0 - 100
  summary: string;
  details: {
    validityDaysRemaining?: number;
    expiryDate?: string;
    mrzStatus?: 'Matched' | 'Discrepancy' | 'Missing' | 'N/A';
    sixMonthRuleMet?: boolean;
    photoDimensions?: string;
    faceCoverageRatio?: number;
    backgroundTone?: string;
    rejectionReasons?: string[];
    suggestions?: string[];
    previewUrl?: string;
    fileSize?: string;
    checksumSha256?: string;
  };
  notes?: string;
  passportAudit?: PassportAuditResult;
  photoAudit?: PhotoAuditResult;
  livenessResult?: LivenessCheckResult;
}

export type AuditEventType = 
  | 'status_change' 
  | 'email_alert' 
  | 'document_update' 
  | 'application_created' 
  | 'note_added';

export interface ApplicationAuditEvent {
  id: string;
  applicationId: string;
  applicantName: string;
  passportNumber?: string;
  timestamp: string; // ISO string
  type: AuditEventType;
  title: string;
  titleBn?: string;
  actor: string;
  details: {
    previousStatus?: string;
    newStatus?: string;
    statusColor?: string;
    recipientEmail?: string;
    subject?: string;
    emailBodyPreview?: string;
    templateUsed?: string;
    deliveryStatus?: 'Delivered' | 'Sent via Gmail' | 'Queued' | 'Failed';
    documentType?: string;
    fileName?: string;
    version?: string;
    score?: number;
    fileSize?: string;
    checksumSha256?: string;
    notes?: string;
    reason?: string;
  };
}

export interface VisaApplication {
  id: string;
  createdAt: string;
  updatedAt: string;
  applicantName: string;
  passportNumber: string;
  nationality: string;
  contactEmail: string;
  contactPhone: string;
  visaType: string;
  status: 'Draft' | 'Audited - Passed' | 'Audited - Flagged' | 'Submitted to GDRFA/ICP' | 'In Process' | 'Approved' | 'Rejected';
  urgency: 'Standard' | 'Express 24h' | 'Emergency 6h';
  assignedAgent: string;
  passportAudit?: PassportAuditResult;
  photoAudit?: PhotoAuditResult;
  documentHistory?: DocumentAuditHistoryItem[];
  notes: string;
  feePaid: boolean;
  referenceNumber?: string;
  lastEmailSent?: string;
  auditTrail?: ApplicationAuditEvent[];
}

export interface TrackingQuery {
  portal: 'GDRFA' | 'ICP';
  referenceNumber: string;
  passportNumber?: string;
  nationality?: string;
  dateOfBirth?: string;
}

export interface TrackingResult {
  found: boolean;
  applicationNumber: string;
  applicantName: string;
  visaType: string;
  status: string;
  statusColor: 'green' | 'amber' | 'blue' | 'red';
  submissionDate: string;
  currentStage: string;
  expiryDate?: string;
  issuingAuthority: string;
  history: Array<{
    date: string;
    stage: string;
    remarks: string;
  }>;
}

export type TemplateCategory = 
  | 'email_update' 
  | 'cover_letter' 
  | 'document_request' 
  | 'fee_quote' 
  | 'rejection_advisory';

export interface CommunicationTemplate {
  id: string;
  name: string;
  category: TemplateCategory;
  targetVisaType: string;
  subject: string;
  content: string;
  description: string;
  tags?: string[];
  isCustom?: boolean;
  lastModified?: string;
}

export type B2BPartnerCategory = 
  | 'typing_center' 
  | 'travel_agency' 
  | 'corporate_pro' 
  | 'manpower_recruitment' 
  | 'golden_visa' 
  | 'custom';

export interface B2BPartnerLead {
  id: string;
  companyName: string;
  category: B2BPartnerCategory;
  contactPerson: string;
  designation: string;
  email: string;
  secondaryEmail?: string;
  phone?: string;
  whatsapp?: string;
  city: string;
  country: string;
  estimatedVolume: string;
  status: 'new' | 'contacted' | 'negotiating' | 'partner_signed' | 'follow_up';
  lastContactedAt?: string;
  notes?: string;
  isCustom?: boolean;
}

export interface B2BOutreachCampaign {
  id: string;
  name: string;
  templateId: string;
  subject: string;
  body: string;
  recipientsCount: number;
  recipientEmails: string[];
  sentAt: string;
  dispatchMethod: 'gmail_web' | 'gmail_api' | 'mailto' | 'copied';
  status: 'sent' | 'draft';
}
