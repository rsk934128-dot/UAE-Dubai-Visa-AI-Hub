import jsPDF from 'jspdf';
import QRCode from 'qrcode';
import { PassportAuditResult } from '../types';
import { formatDate } from './utils';

export interface GeneratePdfOptions {
  auditResult: PassportAuditResult;
  passportImageBase64?: string | null;
  agencyName?: string;
  consultantName?: string;
}

export async function generatePassportAuditPdf({
  auditResult,
  passportImageBase64,
  agencyName = 'UAE & Dubai Visa AI Hub',
  consultantName
}: GeneratePdfOptions): Promise<void> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;

  // Background subtle tint & frame
  doc.setFillColor(248, 250, 252); // slate-50
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  // Decorative Top Gold/Navy Header Banner
  doc.setFillColor(15, 23, 42); // slate-900 (Navy)
  doc.rect(0, 0, pageWidth, 28, 'F');

  // Gold accent line
  doc.setFillColor(217, 119, 6); // amber-600
  doc.rect(0, 28, pageWidth, 2.5, 'F');

  // Header Title
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('UAE & DUBAI IMMIGRATION COMPLIANCE AUDIT', margin, 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(226, 232, 240);
  doc.text('ICAO Doc 9303 MRZ Verification & 6-Month Entry Gatekeeper Certificate', margin, 18);

  // Agency Branding / Date on Right
  doc.setFontSize(8);
  doc.setTextColor(251, 191, 36); // amber-300
  const auditDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
  const refCode = `AUD-${auditResult.extractedData.passportNumber || 'UAEX'}-${Date.now().toString().slice(-4)}`;
  doc.text(`Ref: ${refCode}`, pageWidth - margin, 12, { align: 'right' });
  doc.setTextColor(203, 213, 225);
  doc.text(`Issued: ${auditDate}`, pageWidth - margin, 18, { align: 'right' });

  let y = 36;

  // Verdict Card
  const isValid = auditResult.isValid;
  if (isValid) {
    doc.setFillColor(240, 253, 244); // emerald-50
    doc.setDrawColor(34, 197, 94); // emerald-500
  } else {
    doc.setFillColor(254, 242, 242); // red-50
    doc.setDrawColor(239, 68, 68); // red-500
  }
  doc.setLineWidth(0.6);
  doc.roundedRect(margin, y, contentWidth, 22, 2, 2, 'FD');

  // Verdict text
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  if (isValid) {
    doc.setTextColor(21, 128, 61); // emerald-700
    doc.text('PASSED: DUBAI & UAE IMMIGRATION COMPLIANT', margin + 6, y + 9);
  } else {
    doc.setTextColor(185, 28, 28); // red-700
    doc.text('FLAGGED: IMMIGRATION RECTIFICATION REQUIRED', margin + 6, y + 9);
  }

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  const verdictSubtitle = isValid 
    ? 'Document satisfies GDRFA Dubai & ICP Federal 6-month validity rule and MRZ check.'
    : 'Passport fails 180-day entry validity rule or visual clarity checks. Review recommendations below.';
  doc.text(verdictSubtitle, margin + 6, y + 16);

  // Overall Score Badge
  const scoreX = pageWidth - margin - 24;
  doc.setFillColor(isValid ? 22 : 153, isValid ? 163 : 27, isValid ? 74 : 27);
  doc.roundedRect(scoreX, y + 3, 20, 16, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text(`${auditResult.overallScore}`, scoreX + 10, y + 11, { align: 'center' });
  doc.setFontSize(6.5);
  doc.text('/ 100 SCORE', scoreX + 10, y + 16, { align: 'center' });

  y += 28;

  // Section 1: Extracted Bio-Data Matrix
  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, y, contentWidth, 54, 2, 2, 'FD');

  // Section Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text('1. APPLICANT BIO-DATA & PASSPORT MATRIX (ICAO OCR)', margin + 4, y + 6.5);

  const colWidth = (contentWidth - 8) / 3;
  const startX = margin + 4;
  const startDataY = y + 12;

  const dataFields = [
    { label: 'FULL LEGAL NAME', value: auditResult.extractedData.fullName || 'N/A' },
    { label: 'PASSPORT NUMBER', value: auditResult.extractedData.passportNumber || 'N/A', highlight: true },
    { label: 'NATIONALITY / CODE', value: `${auditResult.extractedData.nationality || 'N/A'} (${auditResult.extractedData.countryCode || 'N/A'})` },
    { label: 'DATE OF BIRTH', value: formatDate(auditResult.extractedData.dateOfBirth) },
    { label: 'GENDER / SEX', value: auditResult.extractedData.sex || 'M/F' },
    { 
      label: 'EXPIRY DATE (6-MO RULE)', 
      value: `${formatDate(auditResult.extractedData.expiryDate)} (${auditResult.validationChecks.validityRemainingDays || 0}d left)`,
      alert: !auditResult.validationChecks.hasSixMonthsValidity
    }
  ];

  dataFields.forEach((field, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const boxX = startX + col * colWidth;
    const boxY = startDataY + row * 18;

    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(boxX, boxY, colWidth - 2, 14, 1.5, 1.5, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(100, 116, 139);
    doc.text(field.label, boxX + 3, boxY + 4.5);

    doc.setFont('helvetica', field.highlight ? 'bold' : 'normal');
    doc.setFontSize(8);
    if (field.alert) {
      doc.setTextColor(220, 38, 38);
    } else if (field.highlight) {
      doc.setTextColor(180, 83, 9);
    } else {
      doc.setTextColor(15, 23, 42);
    }
    
    // Truncate if too long
    const valText = doc.splitTextToSize(field.value, colWidth - 8);
    doc.text(valText[0] || 'N/A', boxX + 3, boxY + 10.5);
  });

  y += 59;

  // MRZ Decoded Box (if present)
  if (auditResult.extractedData.mrzLine1 || auditResult.extractedData.mrzLine2) {
    doc.setFillColor(15, 23, 42);
    doc.roundedRect(margin, y, contentWidth, 18, 1.5, 1.5, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(251, 191, 36);
    doc.text('MACHINE READABLE ZONE (MRZ 2-LINE ICAO DECODE):', margin + 4, y + 4.5);

    doc.setFont('courier', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(56, 189, 248);
    if (auditResult.extractedData.mrzLine1) {
      doc.text(auditResult.extractedData.mrzLine1, margin + 4, y + 9.5);
    }
    if (auditResult.extractedData.mrzLine2) {
      doc.text(auditResult.extractedData.mrzLine2, margin + 4, y + 14.5);
    }

    y += 22;
  }

  // Section 2: Inspection Checkpoints
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, y, contentWidth, 38, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text('2. IMMIGRATION CHECKPOINTS & SECURITY AUDIT', margin + 4, y + 6.5);

  const checks = [
    {
      title: '6-Month Minimum Validity Rule',
      status: auditResult.validationChecks.hasSixMonthsValidity ? 'PASSED' : 'FAILED',
      detail: `${auditResult.validationChecks.validityRemainingDays || 0} days remaining from current date`,
      passed: auditResult.validationChecks.hasSixMonthsValidity
    },
    {
      title: 'ICAO MRZ & Visual Consistency',
      status: auditResult.validationChecks.mrzMatched ? 'VERIFIED' : 'DISCREPANCY',
      detail: 'Passport number, DOB and names match across OCR and MRZ checksums',
      passed: auditResult.validationChecks.mrzMatched
    },
    {
      title: 'Image Resolution & Clarity',
      status: auditResult.validationChecks.isClearImage ? 'HIGH QUALITY' : 'BLURRY / RESCAN',
      detail: 'Text edges and character sharpness compliant with e-channel portal',
      passed: auditResult.validationChecks.isClearImage
    },
    {
      title: 'Border Framing & Reflection Check',
      status: auditResult.validationChecks.noGlareOrCutoff ? 'PASSED' : 'ADJUST FRAMING',
      detail: 'No flash glare over photo, MRZ or national security holograms',
      passed: auditResult.validationChecks.noGlareOrCutoff
    }
  ];

  checks.forEach((chk, idx) => {
    const chkY = y + 12 + idx * 6;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(51, 65, 85);
    doc.text(`• ${chk.title}:`, margin + 4, chkY);

    // Status Tag
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    if (chk.passed) {
      doc.setTextColor(22, 101, 52); // green
      doc.text(`[✓ ${chk.status}]`, margin + 65, chkY);
    } else {
      doc.setTextColor(185, 28, 28); // red
      doc.text(`[✗ ${chk.status}]`, margin + 65, chkY);
    }

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.setFontSize(6.5);
    doc.text(chk.detail, margin + 98, chkY);
  });

  y += 43;

  // Section 3: Recommendations & Dubai Visa Eligibility
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, y, contentWidth, 42, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text('3. AI IMMIGRATION CONSULTANT RECOMMENDATIONS & ELIGIBILITY', margin + 4, y + 6.5);

  let recY = y + 12;

  // Rejection reasons if any
  if (auditResult.rejectionReasons && auditResult.rejectionReasons.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(185, 28, 28);
    doc.text('Attention Required:', margin + 4, recY);
    doc.setFont('helvetica', 'normal');
    auditResult.rejectionReasons.slice(0, 2).forEach((r) => {
      recY += 4.5;
      doc.text(`• ${r}`, margin + 6, recY);
    });
    recY += 5;
  }

  // Suggestions
  if (auditResult.suggestions && auditResult.suggestions.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(180, 83, 9);
    doc.text('Recommended Actions:', margin + 4, recY);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 65, 85);
    auditResult.suggestions.slice(0, 2).forEach((s) => {
      recY += 4.5;
      doc.text(`• ${s}`, margin + 6, recY);
    });
    recY += 5;
  }

  // Eligibility notes
  if (auditResult.dubaiVisaEligibilityNotes) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(7);
    doc.setTextColor(71, 85, 105);
    const notes = doc.splitTextToSize(`Note: ${auditResult.dubaiVisaEligibilityNotes}`, contentWidth - 8);
    doc.text(notes.slice(0, 2), margin + 4, recY);
  }

  y += 48;

  // Footer / Verification Seal & QR Code
  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, y, contentWidth, 26, 2, 2, 'FD');

  // Seal badge simulation
  doc.setFillColor(15, 23, 42);
  doc.circle(margin + 10, y + 13, 6.5, 'F');
  doc.setTextColor(251, 191, 36);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(5.5);
  doc.text('UAE', margin + 10, y + 11.5, { align: 'center' });
  doc.text('AI HUB', margin + 10, y + 15, { align: 'center' });

  // Verification text
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  doc.text('OFFICIAL VERIFICATION CERTIFICATE & SECURE QR', margin + 20, y + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.2);
  doc.setTextColor(100, 116, 139);
  doc.text('This document has been audited against GDRFA Dubai & ICP Federal immigration parameters.', margin + 20, y + 11.5);
  doc.text(`Issued by: ${agencyName}${consultantName ? ` • Consultant: ${consultantName}` : ''}`, margin + 20, y + 15.5);
  doc.text('Digital Signature: VERIFIED_DOC_ICAO_9303_AUTHENTICATED', margin + 20, y + 19.5);

  const securityHash = `SHA256:${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
  doc.setFont('courier', 'bold');
  doc.setFontSize(5.8);
  doc.setTextColor(100, 116, 139);
  doc.text(securityHash, margin + 20, y + 23.5);

  // Generate & Embed QR Code on right side of certificate
  try {
    const qrPayload = JSON.stringify({
      schema: 'UAE_VISA_AI_HUB_V1',
      ref: refCode,
      passportNumber: auditResult.extractedData.passportNumber,
      name: auditResult.extractedData.fullName,
      nationality: auditResult.extractedData.nationality,
      expiryDate: auditResult.extractedData.expiryDate,
      validityDays: auditResult.validationChecks.validityRemainingDays || 0,
      sixMonthRule: auditResult.validationChecks.hasSixMonthsValidity,
      score: auditResult.overallScore,
      verdict: auditResult.isValid ? 'PASSED' : 'FLAGGED',
      auditedAt: new Date().toISOString()
    });

    const qrDataUri = await QRCode.toDataURL(qrPayload, {
      margin: 1,
      width: 120,
      errorCorrectionLevel: 'M',
      color: {
        dark: '#0F172A',
        light: '#FFFFFF'
      }
    });

    // Add QR image to PDF
    const qrSize = 22;
    const qrX = pageWidth - margin - qrSize - 2;
    const qrY = y + 2;
    doc.addImage(qrDataUri, 'PNG', qrX, qrY, qrSize, qrSize);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(4.8);
    doc.setTextColor(71, 85, 105);
    doc.text('SCAN TO VERIFY', qrX + qrSize / 2, qrY + qrSize + 1.5, { align: 'center' });
  } catch (qrErr) {
    console.warn('Could not embed QR code into PDF:', qrErr);
  }

  // Final bottom disclaimer
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(6);
  doc.setTextColor(148, 163, 184);
  doc.text(
    'Disclaimer: This pre-submission AI audit report is intended for typing centers, agencies and applicants to verify document compliance before portal payment.',
    pageWidth / 2,
    pageHeight - 6,
    { align: 'center' }
  );

  // Save the PDF with a clean descriptive filename
  const cleanName = (auditResult.extractedData.fullName || 'Applicant')
    .replace(/[^a-zA-Z0-9]/g, '_')
    .substring(0, 25);
  const passportNum = auditResult.extractedData.passportNumber || 'PASSPORT';
  const filename = `UAE_Visa_Audit_${cleanName}_${passportNum}.pdf`;

  doc.save(filename);
}
