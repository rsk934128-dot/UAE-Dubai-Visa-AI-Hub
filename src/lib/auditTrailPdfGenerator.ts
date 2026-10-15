import { VisaApplication, ApplicationAuditEvent } from '../types';
import { generateApplicationDossierPdf, GenerateDossierPdfOptions } from './applicationDossierPdfGenerator';

export interface GenerateAuditTrailPdfOptions extends GenerateDossierPdfOptions {}

/**
 * Generates an executive, branded, multi-page PDF Application Dossier Report
 * containing the full verified passport data, status logs, and chronological audit history.
 */
export async function generateApplicationAuditTrailPdf(
  options: GenerateAuditTrailPdfOptions
): Promise<void> {
  return generateApplicationDossierPdf(options);
}

export { generateApplicationDossierPdf };
