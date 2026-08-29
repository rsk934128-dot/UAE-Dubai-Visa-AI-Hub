import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI, Type, Schema } from '@google/genai';

dotenv.config();

const app = express();
const PORT = 3000;

// Middleware for parsing json and large image payloads
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Lazy Google Gen AI initialization
let aiClient: GoogleGenAI | null = null;
function getAI(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is not configured');
    }
    aiClient = new GoogleGenAI({ 
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });
  }
  return aiClient;
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Helper to cleanly parse base64 and ensure supported MIME type for Gemini Vision
function parseImagePayload(rawImage: string, fallbackMime = 'image/jpeg'): { data: string; mimeType: string } {
  let cleanData = rawImage;
  let resolvedMime = fallbackMime;

  if (rawImage.startsWith('data:')) {
    const match = rawImage.match(/^data:([^;]+);base64,(.+)$/s);
    if (match) {
      resolvedMime = match[1];
      cleanData = match[2];
    } else {
      const commaIdx = rawImage.indexOf(',');
      if (commaIdx !== -1) {
        cleanData = rawImage.slice(commaIdx + 1);
      }
    }
  }

  cleanData = cleanData.replace(/\s+/g, '');

  // Normalize MIME type to standard Gemini supported formats
  if (!['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif', 'application/pdf'].includes(resolvedMime)) {
    resolvedMime = 'image/png';
  }

  return { data: cleanData, mimeType: resolvedMime };
}

// 1. AI Passport OCR & Audit Endpoint
app.post('/api/audit-passport', async (req, res) => {
  try {
    const { imageBase64, mimeType = 'image/jpeg' } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ success: false, error: 'Passport image base64 is required.' });
    }

    const { data: cleanBase64, mimeType: normalizedMime } = parseImagePayload(imageBase64, mimeType);

    const ai = getAI();

    const prompt = `You are a certified UAE GDRFA (General Directorate of Residency and Foreigners Affairs Dubai) and ICP (Federal Authority for Identity and Citizenship) Master Visa Document Compliance Auditor.
Carefully perform optical character recognition (OCR), MRZ code decoding, and strict immigration audit rules on this uploaded passport bio-data page.

AUDIT RULES TO ENFORCE:
1. 6-Month Passport Rule: The passport expiration date MUST be at least 6 months (180 days) from today's date (Current date: 2026-08-29). If expiry is within 6 months, it MUST be marked as invalid with severe rejection warning.
2. MRZ Code Verification: Decode the two-line Machine Readable Zone (MRZ) at the bottom (P<XYZ...). Verify that passport number, nationality code, DOB, and expiry in the visual zone match the MRZ digits precisely.
3. Clarity & Quality: Check if the photo, text, stamp edges, and watermark are clear, unobstructed, not cut off at borders, and free of heavy flash glare.
4. Extract all bio-data accurately: Full legal name, passport number, nationality, country code, date of birth, sex, place of birth, issue date, expiry date, MRZ lines.
5. Provide actionable guidance and eligibility notes for Dubai entry / tourist / work / golden visa.

Return the result strictly structured in JSON format.`;

    const passportSchema: Schema = {
      type: Type.OBJECT,
      properties: {
        isValid: { type: Type.BOOLEAN, description: 'True if passport meets all UAE immigration criteria with at least 6 months validity' },
        overallScore: { type: Type.INTEGER, description: 'Compliance audit score from 0 to 100' },
        extractedData: {
          type: Type.OBJECT,
          properties: {
            fullName: { type: Type.STRING },
            passportNumber: { type: Type.STRING },
            nationality: { type: Type.STRING },
            countryCode: { type: Type.STRING },
            dateOfBirth: { type: Type.STRING, description: 'YYYY-MM-DD or readable date' },
            sex: { type: Type.STRING },
            placeOfBirth: { type: Type.STRING },
            issueDate: { type: Type.STRING },
            expiryDate: { type: Type.STRING, description: 'YYYY-MM-DD or readable date' },
            mrzLine1: { type: Type.STRING },
            mrzLine2: { type: Type.STRING }
          },
          required: ['fullName', 'passportNumber', 'nationality', 'expiryDate']
        },
        validationChecks: {
          type: Type.OBJECT,
          properties: {
            hasSixMonthsValidity: { type: Type.BOOLEAN },
            validityRemainingDays: { type: Type.INTEGER },
            isClearImage: { type: Type.BOOLEAN },
            mrzMatched: { type: Type.BOOLEAN },
            noGlareOrCutoff: { type: Type.BOOLEAN },
            properOrientation: { type: Type.BOOLEAN },
            minimumResolutionMet: { type: Type.BOOLEAN }
          },
          required: ['hasSixMonthsValidity', 'validityRemainingDays', 'isClearImage', 'mrzMatched']
        },
        rejectionReasons: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        },
        suggestions: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        },
        dubaiVisaEligibilityNotes: { type: Type.STRING }
      },
      required: ['isValid', 'overallScore', 'extractedData', 'validationChecks', 'rejectionReasons', 'suggestions']
    };

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: [
        {
          role: 'user',
          parts: [
            {
              inlineData: {
                data: cleanBase64,
                mimeType: normalizedMime
              }
            },
            {
              text: prompt
            }
          ]
        }
      ],
      config: {
        responseMimeType: 'application/json',
        responseSchema: passportSchema,
        temperature: 0.1
      }
    });

    const parsedData = JSON.parse(response.text || '{}');
    return res.json({ success: true, data: parsedData });
  } catch (error: any) {
    console.error('Passport OCR Audit Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to analyze passport document. Please ensure the image is clear and try again.'
    });
  }
});

// 2. AI Photo Specification Auditor
app.post('/api/audit-photo', async (req, res) => {
  try {
    const { imageBase64, mimeType = 'image/jpeg' } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ success: false, error: 'Photo image base64 is required.' });
    }

    const { data: cleanBase64, mimeType: normalizedMime } = parseImagePayload(imageBase64, mimeType);
    const ai = getAI();

    const prompt = `You are a UAE ICA / GDRFA Biometric Photograph Verification Auditor.
Verify if this uploaded passport photograph meets all strict UAE Dubai visa application guidelines:
1. White Background: Background must be pristine, pure plain white (no off-white walls, gray shadows, outdoor objects, or patterns).
2. Face Visibility: Face must cover approximately 70% to 80% of the entire photo frame from the crown of the head to the chin.
3. Frontal Stance: Head straight, direct eye contact with the camera, neutral facial expression with closed mouth.
4. Lighting & Shadows: Even lighting across both sides of the face, no deep facial shadows or heavy background reflections.
5. Accessories: No tinted/dark sunglasses, no headphones, no obstruction over eyes or eyebrows. (Religious head coverings like hijab are allowed if full oval of face from forehead to chin is clearly visible).
6. Quality & Dimensions: Sharp focus, not pixelated, standard 40x55mm / 2x2 inch aspect ratio.

Score the photo (0-100), identify specific passes/fails, and provide immediate fixes if flagged.`;

    const photoSchema: Schema = {
      type: Type.OBJECT,
      properties: {
        isValid: { type: Type.BOOLEAN },
        overallScore: { type: Type.INTEGER },
        checks: {
          type: Type.OBJECT,
          properties: {
            isWhiteBackground: { type: Type.BOOLEAN },
            isFaceCentered: { type: Type.BOOLEAN },
            faceCoverageRatio: { type: Type.INTEGER, description: 'Estimated face coverage percentage e.g. 78' },
            is80PercentFaceVisible: { type: Type.BOOLEAN },
            isDimensionsCompliant: { type: Type.BOOLEAN },
            isEyesVisibleAndOpen: { type: Type.BOOLEAN },
            noDarkGlassesOrMask: { type: Type.BOOLEAN },
            noHeavyShadows: { type: Type.BOOLEAN },
            isHighClarity: { type: Type.BOOLEAN }
          },
          required: ['isWhiteBackground', 'isFaceCentered', 'is80PercentFaceVisible', 'isEyesVisibleAndOpen']
        },
        detectedAttributes: {
          type: Type.OBJECT,
          properties: {
            backgroundTone: { type: Type.STRING },
            estimatedDimensions: { type: Type.STRING },
            lightingQuality: { type: Type.STRING },
            expression: { type: Type.STRING }
          },
          required: ['backgroundTone', 'lightingQuality', 'expression']
        },
        rejectionReasons: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        },
        suggestions: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      },
      required: ['isValid', 'overallScore', 'checks', 'detectedAttributes', 'rejectionReasons', 'suggestions']
    };

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: [
        {
          role: 'user',
          parts: [
            {
              inlineData: {
                data: cleanBase64,
                mimeType: normalizedMime
              }
            },
            {
              text: prompt
            }
          ]
        }
      ],
      config: {
        responseMimeType: 'application/json',
        responseSchema: photoSchema,
        temperature: 0.1
      }
    });

    const parsedData = JSON.parse(response.text || '{}');
    return res.json({ success: true, data: parsedData });
  } catch (error: any) {
    console.error('Photo Audit Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to analyze photograph. Please try again.'
    });
  }
});

// 2b. AI Biometric Liveness & Facial Structure Comparison Auditor
app.post('/api/verify-liveness', async (req, res) => {
  try {
    const { passportPhotoBase64, selfieBase64, passportMime = 'image/jpeg', selfieMime = 'image/jpeg' } = req.body;

    if (!passportPhotoBase64 || !selfieBase64) {
      return res.status(400).json({
        success: false,
        error: 'Both the passport specification photo and the live selfie are required for comparison.'
      });
    }

    const cleanPassport = parseImagePayload(passportPhotoBase64, passportMime);
    const cleanSelfie = parseImagePayload(selfieBase64, selfieMime);

    const ai = getAI();

    const prompt = `You are a UAE ICA / GDRFA Biometric Border Control and Identity Verification Specialist.
Compare the two provided images for applicant identity verification and real-time liveness:
- Image 1: Official Passport Bio-data / Specification Photograph of the applicant.
- Image 2: Real-time Live Selfie capture captured via camera for biometric liveness verification.

Conduct two comprehensive evaluations:

1. BIOMETRIC LIVENESS & ANTI-SPOOFING ASSESSMENT:
- Evaluate whether Image 2 is a genuine, live capture of an actual human being present in front of the camera.
- Check for anti-spoofing flags: screen replay, paper printout photo, deepfake synthesis, mask, static cutout, or camera tampering.
- Inspect natural ambient illumination, 3D facial contours, natural skin reflectance, and eye gaze.

2. FACIAL STRUCTURE BIOMETRIC MATCHING:
- Compare key anatomical facial landmarks between Image 1 and Image 2:
  * Jawline, chin contour, and mandible shape
  * Inter-pupillary distance, eye contour, canthal tilt, and brow ridge
  * Nasal bridge width, tip projection, and nostril structure
  * Mouth width, lip ratio, and philtrum depth
  * Overall cranial and facial proportions
- Account for normal variations such as slight facial angle/expression (neutral vs gentle smile), minor age change, glasses, or lighting variances.

3. DECISION & CONFIDENCE:
- isMatch: true if both images represent the EXACT SAME individual with high certainty; false if different individuals or spoofed.
- matchConfidenceScore: 0 - 100 percentage. (90-100: High confidence identical person, 75-89: Probable match, 50-74: Inconclusive/low match, <50: Clear mismatch or spoof).
- verdict: VERIFIED_MATCH | POTENTIAL_MISMATCH | REJECTED_MISMATCH | INCONCLUSIVE.
- List matched structural characteristics and any differing attributes.
- Provide a clear, professional summary and recommendations for UAE immigration submission.`;

    const livenessSchema: Schema = {
      type: Type.OBJECT,
      properties: {
        isMatch: { type: Type.BOOLEAN, description: 'True if both images belong to the same person' },
        matchConfidenceScore: { type: Type.INTEGER, description: 'Biometric match confidence score 0 to 100' },
        verdict: {
          type: Type.STRING,
          description: 'VERIFIED_MATCH | POTENTIAL_MISMATCH | REJECTED_MISMATCH | INCONCLUSIVE'
        },
        livenessValidation: {
          type: Type.OBJECT,
          properties: {
            isRealHuman: { type: Type.BOOLEAN },
            isLiveCapture: { type: Type.BOOLEAN },
            isNaturalLighting: { type: Type.BOOLEAN },
            isFrontalPose: { type: Type.BOOLEAN },
            noSpoofingDetected: { type: Type.BOOLEAN },
            noScreenReplayOrPrintout: { type: Type.BOOLEAN }
          },
          required: ['isRealHuman', 'isLiveCapture', 'isFrontalPose', 'noSpoofingDetected', 'noScreenReplayOrPrintout']
        },
        facialStructureAnalysis: {
          type: Type.OBJECT,
          properties: {
            jawlineMatch: { type: Type.STRING, description: 'High | Moderate | Low | Mismatch' },
            eyesAndBrowsMatch: { type: Type.STRING, description: 'High | Moderate | Low | Mismatch' },
            noseStructureMatch: { type: Type.STRING, description: 'High | Moderate | Low | Mismatch' },
            mouthAndLipsMatch: { type: Type.STRING, description: 'High | Moderate | Low | Mismatch' },
            facialProportionsNotes: { type: Type.STRING }
          },
          required: ['jawlineMatch', 'eyesAndBrowsMatch', 'noseStructureMatch', 'mouthAndLipsMatch', 'facialProportionsNotes']
        },
        matchedCharacteristics: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        },
        differingCharacteristics: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        },
        summary: { type: Type.STRING },
        recommendations: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      },
      required: [
        'isMatch',
        'matchConfidenceScore',
        'verdict',
        'livenessValidation',
        'facialStructureAnalysis',
        'matchedCharacteristics',
        'summary',
        'recommendations'
      ]
    };

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: [
        {
          role: 'user',
          parts: [
            {
              inlineData: {
                data: cleanPassport.data,
                mimeType: cleanPassport.mimeType
              }
            },
            {
              inlineData: {
                data: cleanSelfie.data,
                mimeType: cleanSelfie.mimeType
              }
            },
            {
              text: prompt
            }
          ]
        }
      ],
      config: {
        responseMimeType: 'application/json',
        responseSchema: livenessSchema,
        temperature: 0.1
      }
    });

    const parsedData = JSON.parse(response.text || '{}');
    parsedData.timestamp = new Date().toISOString();
    return res.json({ success: true, data: parsedData });
  } catch (error: any) {
    console.error('Liveness Verification Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to complete biometric liveness verification. Please try again.'
    });
  }
});

// 3. AI Golden Visa & Eligibility Consultant Engine
app.post('/api/calculate-eligibility', async (req, res) => {
  try {
    const { nationality, purpose, profession, monthlySalaryAED, investmentAmountAED, educationLevel, experienceYears, hasCompany } = req.body;

    const ai = getAI();

    const prompt = `You are a Senior UAE Immigration Consultant & Dubai Economic Development Authority Specialist.
Analyze the user's profile and determine their exact eligibility for Dubai & UAE visas (Tourist, Green Visa Freelancer/Self-Employed, 10-Year Golden Visa, Remote Worker, Employment Entry).

Applicant Profile:
- Nationality: ${nationality || 'Not specified'}
- Primary Purpose: ${purpose || 'Relocation / Tourism'}
- Current Profession / Title: ${profession || 'Not specified'}
- Monthly Salary / Income: AED ${monthlySalaryAED || '0'}
- Real Estate or Business Investment: AED ${investmentAmountAED || '0'}
- Highest Education: ${educationLevel || 'Bachelor Degree'}
- Years of Experience: ${experienceYears || '5+ years'}
- Owns Active Business / Startup: ${hasCompany ? 'Yes' : 'No'}

Provide a detailed evaluation:
1. Recommended Visa Category (Primary best match)
2. Alternative Options (e.g., Green Visa, Remote Work, Tourist)
3. Golden Visa Eligibility Score (0 - 100%) and Qualification Status (Eligible, Conditionally Eligible, Not Currently Eligible)
4. Step-by-step roadmap to qualify & submit
5. Approximate official fees in AED, USD and BDT
6. Key required documents and attested certificates.`;

    const eligibilitySchema: Schema = {
      type: Type.OBJECT,
      properties: {
        recommendedVisa: { type: Type.STRING },
        eligibilityStatus: { type: Type.STRING, description: 'Highly Eligible / Eligible / Needs Additional Requirements / Ineligible' },
        goldenVisaScore: { type: Type.INTEGER, description: '0 to 100 percentage match' },
        goldenVisaCategory: { type: Type.STRING, description: 'E.g., Specialized Tech Talent, Real Estate Investor, Senior Executive, or None' },
        estimatedCostAED: { type: Type.NUMBER },
        estimatedCostUSD: { type: Type.NUMBER },
        estimatedCostBDT: { type: Type.NUMBER },
        processingTime: { type: Type.STRING },
        keyAdvantages: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        },
        mandatoryDocuments: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        },
        actionableSteps: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        },
        expertAdviceBn: { type: Type.STRING, description: 'Summary advice in clear Bengali' },
        expertAdviceEn: { type: Type.STRING, description: 'Summary advice in English' }
      },
      required: ['recommendedVisa', 'eligibilityStatus', 'goldenVisaScore', 'estimatedCostAED', 'keyAdvantages', 'mandatoryDocuments', 'actionableSteps', 'expertAdviceBn', 'expertAdviceEn']
    };

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }]
        }
      ],
      config: {
        responseMimeType: 'application/json',
        responseSchema: eligibilitySchema,
        temperature: 0.2
      }
    });

    const parsedData = JSON.parse(response.text || '{}');
    return res.json({ success: true, data: parsedData });
  } catch (error: any) {
    console.error('Eligibility Calculation Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to calculate eligibility.'
    });
  }
});

// 4. Send Visa Audit & Status Notification Email via Gmail API proxy
app.post('/api/send-email-notification', async (req, res) => {
  try {
    const { toEmail, applicantName, visaType, status, auditSummary, notes, accessToken, customSubject, customBody } = req.body;

    if (!toEmail) {
      return res.status(400).json({ success: false, error: 'Recipient email is required.' });
    }

    if (!accessToken) {
      return res.status(401).json({
        success: false,
        error: 'Google OAuth token is required to send emails via your Gmail account. Please authenticate.'
      });
    }

    const subject = customSubject || `UAE & Dubai Visa Processing Update: ${applicantName} [${status}]`;
    const emailBody = customBody || `Dear ${applicantName},

This is an automated notification regarding your Dubai / UAE Visa Application (${visaType}).

Current Status: ${status?.toUpperCase()}
Timestamp: ${new Date().toUTCString()}

--- Document Audit & Processing Details ---
${auditSummary || 'Your documents have been reviewed by our AI Compliance Engine.'}

${notes ? `Additional Agent Remarks:\n${notes}\n\n` : ''}
Important Notice:
- Passports must remain valid for a minimum of 6 months from travel date.
- For official inquiries, GDRFA Dubai and ICP Smart Services trackings are accessible via your reference portal.

Best regards,
UAE & Dubai Visa AI Processing Desk
Powered by Google AI Studio`;

    // Construct RFC 2822 email message
    const utf8Subject = `=?utf-8?B?${Buffer.from(subject).toString('base64')}?=`;
    const messageParts = [
      `To: ${toEmail}`,
      'Content-Type: text/plain; charset=utf-8',
      'MIME-Version: 1.0',
      `Subject: ${utf8Subject}`,
      '',
      emailBody
    ];
    const rawMessage = messageParts.join('\r\n');
    const encodedMessage = Buffer.from(rawMessage)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    // Call Gmail API
    const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ raw: encodedMessage })
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error?.message || `Gmail API returned ${response.status}`);
    }

    const resData = await response.json();
    return res.json({ success: true, messageId: resData.id, timestamp: new Date().toISOString() });
  } catch (error: any) {
    console.error('Send Email Notification Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to dispatch email via Gmail API.'
    });
  }
});

// Vite middleware setup (development vs production)
async function start() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`UAE Visa AI Hub server active on http://0.0.0.0:${PORT}`);
  });
}

start();
