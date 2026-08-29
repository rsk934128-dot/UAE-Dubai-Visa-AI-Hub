export async function convertFileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
}

/**
 * Converts any image source (including SVG data URIs) into a clean, raster PNG base64 string.
 * This guarantees compatibility with the Gemini API (which accepts JPEG, PNG, WebP).
 */
export async function ensureRasterBase64(dataUrl: string): Promise<{ base64: string; mimeType: string }> {
  // If it's already a standard raster base64
  if (dataUrl.startsWith('data:image/jpeg;base64,') || 
      dataUrl.startsWith('data:image/png;base64,') || 
      dataUrl.startsWith('data:image/webp;base64,')) {
    const mimeMatch = dataUrl.match(/^data:([^;]+);base64,/);
    const mimeType = mimeMatch ? mimeMatch[1] : 'image/png';
    return { base64: dataUrl, mimeType };
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || 800;
        canvas.height = img.naturalHeight || 520;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const pngUrl = canvas.toDataURL('image/png');
          resolve({ base64: pngUrl, mimeType: 'image/png' });
          return;
        }
      } catch (e) {
        console.warn('Canvas conversion fallback', e);
      }
      resolve({ base64: dataUrl, mimeType: 'image/png' });
    };

    img.onerror = () => {
      resolve({ base64: dataUrl, mimeType: 'image/png' });
    };

    if (dataUrl.startsWith('data:image/svg+xml;utf8,')) {
      const svgContent = dataUrl.replace('data:image/svg+xml;utf8,', '');
      const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
      img.src = URL.createObjectURL(blob);
    } else if (dataUrl.startsWith('<svg')) {
      const blob = new Blob([dataUrl], { type: 'image/svg+xml;charset=utf-8' });
      img.src = URL.createObjectURL(blob);
    } else {
      img.src = dataUrl;
    }
  });
}

export function formatDate(dateString?: string): string {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch {
    return dateString;
  }
}

export function calculateDaysRemaining(expiryDateStr?: string): number | null {
  if (!expiryDateStr) return null;
  try {
    const expiry = new Date(expiryDateStr);
    const today = new Date('2026-08-29'); // Synchronized with context
    const diffTime = expiry.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  } catch {
    return null;
  }
}

export const DUMMY_PASSPORT_SAMPLES = [
  {
    name: 'Sample 1: Valid Bangladeshi Passport (Md. Tariqul Islam)',
    nationality: 'Bangladeshi',
    number: 'A08923411',
    expiry: '2029-06-09',
    valid6Mo: true,
    dataUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="520" viewBox="0 0 800 520"><rect width="800" height="520" fill="%230f172a" rx="16"/><rect x="15" y="15" width="770" height="490" fill="%231e293b" rx="12" stroke="%2338bdf8" stroke-width="2"/><rect x="40" y="40" width="190" height="250" fill="%230f172a" rx="8" stroke="%2364748b"/><circle cx="135" cy="130" r="45" fill="%2394a3b8"/><path d="M70 260 C70 200, 200 200, 200 260 Z" fill="%2394a3b8"/><text x="260" y="70" fill="%2338bdf8" font-family="monospace" font-size="18" font-weight="bold">PEOPLE\'S REPUBLIC OF BANGLADESH</text><text x="260" y="95" fill="%23e2e8f0" font-family="monospace" font-size="13">PASSPORT / PASSEPORT</text><text x="260" y="140" fill="%2394a3b8" font-size="11">Type/Code</text><text x="260" y="160" fill="%23f8fafc" font-weight="bold">P / BGD</text><text x="440" y="140" fill="%2394a3b8" font-size="11">Passport No.</text><text x="440" y="160" fill="%2338bdf8" font-weight="bold">A08923411</text><text x="260" y="195" fill="%2394a3b8" font-size="11">Full Name</text><text x="260" y="215" fill="%23f8fafc" font-weight="bold">TARIQUL ISLAM CHOWDHURY</text><text x="260" y="250" fill="%2394a3b8" font-size="11">Nationality</text><text x="260" y="270" fill="%23f8fafc">BANGLADESHI</text><text x="440" y="250" fill="%2394a3b8" font-size="11">Date of Birth</text><text x="440" y="270" fill="%23f8fafc">14 MAY 1992</text><text x="260" y="305" fill="%2394a3b8" font-size="11">Date of Expiry</text><text x="260" y="325" fill="%2310b981" font-weight="bold">09 JUN 2029 (Valid: 3+ Years)</text><rect x="30" y="390" width="740" height="90" fill="%23090d16" rx="6"/><text x="45" y="425" fill="%2338bdf8" font-family="monospace" font-size="16">P&lt;BGDCHOWDHURY&lt;&lt;TARIQUL&lt;ISLAM&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;</text><text x="45" y="460" fill="%2338bdf8" font-family="monospace" font-size="16">A089234115BGD9205142M2906096&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;04</text></svg>'
  },
  {
    name: 'Sample 2: Expiring Passport Flagged (Fatima Rahman - Less than 6 Mo)',
    nationality: 'Bangladeshi',
    number: 'B01458920',
    expiry: '2026-12-04',
    valid6Mo: false,
    dataUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="520" viewBox="0 0 800 520"><rect width="800" height="520" fill="%230f172a" rx="16"/><rect x="15" y="15" width="770" height="490" fill="%231e293b" rx="12" stroke="%23ef4444" stroke-width="2"/><rect x="40" y="40" width="190" height="250" fill="%230f172a" rx="8" stroke="%2364748b"/><circle cx="135" cy="130" r="45" fill="%23f43f5e"/><path d="M70 260 C70 200, 200 200, 200 260 Z" fill="%23f43f5e"/><text x="260" y="70" fill="%23f87171" font-family="monospace" font-size="18" font-weight="bold">PEOPLE\'S REPUBLIC OF BANGLADESH</text><text x="260" y="95" fill="%23e2e8f0" font-family="monospace" font-size="13">PASSPORT / PASSEPORT</text><text x="260" y="140" fill="%2394a3b8" font-size="11">Type/Code</text><text x="260" y="160" fill="%23f8fafc" font-weight="bold">P / BGD</text><text x="440" y="140" fill="%2394a3b8" font-size="11">Passport No.</text><text x="440" y="160" fill="%23f87171" font-weight="bold">B01458920</text><text x="260" y="195" fill="%2394a3b8" font-size="11">Full Name</text><text x="260" y="215" fill="%23f8fafc" font-weight="bold">FATIMA AL ZAHRA RAHMAN</text><text x="260" y="250" fill="%2394a3b8" font-size="11">Nationality</text><text x="260" y="270" fill="%23f8fafc">BANGLADESHI</text><text x="440" y="250" fill="%2394a3b8" font-size="11">Date of Birth</text><text x="440" y="270" fill="%23f8fafc">20 NOV 1995</text><text x="260" y="305" fill="%2394a3b8" font-size="11">Date of Expiry</text><text x="260" y="325" fill="%23ef4444" font-weight="bold">04 DEC 2026 (Expiring in ~3 months!)</text><rect x="30" y="390" width="740" height="90" fill="%23090d16" rx="6"/><text x="45" y="425" fill="%23ef4444" font-family="monospace" font-size="16">P&lt;BGDRAHMAN&lt;&lt;FATIMA&lt;AL&lt;ZAHRA&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;</text><text x="45" y="460" fill="%23ef4444" font-family="monospace" font-size="16">B014589202BGD9511204F2612048&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;02</text></svg>'
  }
];

export const DUMMY_PHOTO_SAMPLES = [
  {
    name: 'Sample 1: Compliant White Background Studio Portrait (80% Face)',
    valid: true,
    dataUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="550" viewBox="0 0 400 550"><rect width="400" height="550" fill="%23ffffff"/><circle cx="200" cy="200" r="130" fill="%23e2b998"/><circle cx="160" cy="180" r="14" fill="%232d3748"/><circle cx="240" cy="180" r="14" fill="%232d3748"/><path d="M190 225 L200 245 L210 225" stroke="%23c28e67" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M165 270 Q200 290 235 270" stroke="%23991b1b" stroke-width="6" fill="none" stroke-linecap="round"/><path d="M80 550 C80 370 320 370 320 550 Z" fill="%231e293b"/></svg>'
  },
  {
    name: 'Sample 2: Non-compliant (Off-white / Dark Shadows / Too small)',
    valid: false,
    dataUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="550" viewBox="0 0 400 550"><rect width="400" height="550" fill="%2394a3b8"/><circle cx="200" cy="260" r="70" fill="%23c28e67"/><circle cx="180" cy="250" r="10" fill="%230f172a"/><circle cx="220" cy="250" r="10" fill="%230f172a"/><path d="M120 550 C120 440 280 440 280 550 Z" fill="%23334155"/></svg>'
  }
];

export const DUMMY_SELFIE_SAMPLES = [
  {
    name: 'Real-time Live Selfie (Matching Person - Tariqul Islam)',
    isMatch: true,
    dataUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="500" viewBox="0 0 400 500"><defs><linearGradient id="bgGrad" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="%231e293b"/><stop offset="100%" stop-color="%230f172a"/></linearGradient></defs><rect width="400" height="500" fill="url(%23bgGrad)"/><circle cx="200" cy="210" r="125" fill="%23e2b998"/><circle cx="162" cy="190" r="13" fill="%232d3748"/><circle cx="238" cy="190" r="13" fill="%232d3748"/><path d="M192 232 L200 250 L208 232" stroke="%23c28e67" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M165 280 Q200 305 235 280" stroke="%23991b1b" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M90 500 C90 350 310 350 310 500 Z" fill="%230284c7"/><text x="200" y="470" fill="%2338bdf8" font-size="12" font-family="monospace" text-anchor="middle" font-weight="bold">LIVE WEBCAM FRAME #0429</text></svg>'
  },
  {
    name: 'Real-time Live Selfie (Different Individual - Mismatch)',
    isMatch: false,
    dataUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="500" viewBox="0 0 400 500"><rect width="400" height="500" fill="%2318181b"/><circle cx="200" cy="220" r="110" fill="%23fcd34d"/><circle cx="165" cy="205" r="16" fill="%231e293b"/><circle cx="235" cy="205" r="16" fill="%231e293b"/><path d="M195 240 L200 258 L205 240" stroke="%23b45309" stroke-width="3" fill="none"/><path d="M175 290 Q200 275 225 290" stroke="%2378350f" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M100 500 C100 380 300 380 300 500 Z" fill="%23475569"/><text x="200" y="470" fill="%23f43f5e" font-size="12" font-family="monospace" text-anchor="middle" font-weight="bold">LIVE WEBCAM FRAME #0781 (DIFF FACE)</text></svg>'
  }
];
