declare global {
  interface Window {
    pdfjsLib?: any;
  }
}

const PDF_JS_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
const PDF_WORKER_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

let loadPromise: Promise<void> | null = null;

export async function loadPdfJs(): Promise<void> {
  if (typeof window === 'undefined') {
    throw new Error('PDF.js can only be loaded in browser environment');
  }

  if (window.pdfjsLib) {
    console.log('[PDF.js] Already loaded');
    return;
  }

  if (loadPromise) {
    console.log('[PDF.js] Load in progress, waiting...');
    return loadPromise;
  }

  console.log('[PDF.js] Starting to load from CDN...');
  loadPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = PDF_JS_CDN;
    script.async = true;

    script.onload = () => {
      if (window.pdfjsLib) {
        console.log('[PDF.js] Loaded successfully, setting worker...');
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = PDF_WORKER_CDN;
        resolve();
      } else {
        console.error('[PDF.js] Script loaded but pdfjsLib not found');
        reject(new Error('PDF.js loaded but pdfjsLib not found'));
      }
    };

    script.onerror = (error) => {
      console.error('[PDF.js] Failed to load from CDN:', error);
      reject(new Error('Failed to load PDF.js from CDN'));
    };

    document.head.appendChild(script);
  });

  return loadPromise;
}

export async function extractTextFromPdf(file: File): Promise<string> {
  try {
    console.log('[PDF Extract] Starting extraction for file:', file.name, file.type, file.size);
    await loadPdfJs();

    if (!window.pdfjsLib) {
      throw new Error('PDF.js library failed to load. Please refresh the page and try again.');
    }

    console.log('[PDF Extract] Reading file as ArrayBuffer...');
    const arrayBuffer = await file.arrayBuffer();

    if (arrayBuffer.byteLength === 0) {
      throw new Error('PDF file is empty or corrupted');
    }

    console.log('[PDF Extract] ArrayBuffer size:', arrayBuffer.byteLength, 'bytes');

    let pdf;
    try {
      console.log('[PDF Extract] Loading PDF document...');
      pdf = await window.pdfjsLib.getDocument({
        data: arrayBuffer,
        useWorkerFetch: false,
        isEvalSupported: false,
        useSystemFonts: true,
      }).promise;
      console.log('[PDF Extract] PDF loaded, pages:', pdf.numPages);
    } catch (pdfError: any) {
      console.error('[PDF Extract] PDF loading error:', pdfError);
      if (pdfError.message?.includes('Invalid PDF')) {
        throw new Error('Invalid PDF file. The file may be corrupted or password-protected.');
      }
      throw new Error('Failed to load PDF. The file may be corrupted.');
    }

    if (!pdf || pdf.numPages === 0) {
      throw new Error('PDF has no pages or is empty');
    }

    let fullText = '';

    for (let i = 1; i <= pdf.numPages; i++) {
      try {
        console.log(`[PDF Extract] Extracting page ${i}/${pdf.numPages}...`);
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str || '')
          .filter((str: string) => str.trim().length > 0)
          .join(' ');
        fullText += pageText + '\n';
        console.log(`[PDF Extract] Page ${i} extracted, chars: ${pageText.length}`);
      } catch (pageError) {
        console.error(`[PDF Extract] Error extracting text from page ${i}:`, pageError);
      }
    }

    console.log('[PDF Extract] Total text extracted:', fullText.length, 'chars');
    return fullText.trim();
  } catch (error) {
    console.error('[PDF Extract] Error in extractTextFromPdf:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to extract text from PDF');
  }
}

export function extractEmail(text: string): string {
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
  const match = text.match(emailRegex);
  return match ? match[0] : '';
}

export function extractPhone(text: string): string {
  const phoneRegex = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/;
  const match = text.match(phoneRegex);
  return match ? match[0].trim() : '';
}

export function extractName(text: string): string {
  const lines = text.split('\n').filter((line) => line.trim());
  if (lines.length === 0) return 'Unknown';

  const firstLine = lines[0].trim();
  if (firstLine.length < 50 && /^[A-Z][a-z]+(\s[A-Z][a-z]+)+/.test(firstLine)) {
    return firstLine;
  }

  for (let i = 0; i < Math.min(5, lines.length); i++) {
    const line = lines[i].trim();
    if (line.length > 3 && line.length < 50 && /^[A-Z][a-z]+(\s[A-Z][a-z]+)+/.test(line)) {
      return line;
    }
  }

  return 'Unknown';
}

export function extractYearsExperience(text: string): number {
  const patterns = [
    /(\d+)\+?\s*years?\s*(?:of\s*)?experience/gi,
    /experience[:\s]+(\d+)\+?\s*years?/gi,
    /(\d{4})\s*-\s*(?:present|current|now|\d{4})/gi,
  ];

  let maxYears = 0;

  patterns.forEach((pattern) => {
    const matches = Array.from(text.matchAll(pattern));
    for (const match of matches) {
      const num = parseInt(match[1], 10);
      if (!isNaN(num) && num > maxYears && num < 50) {
        maxYears = num;
      }
    }
  });

  const yearRanges = Array.from(text.matchAll(/(\d{4})\s*-\s*(\d{4}|present|current|now)/gi));
  const currentYear = new Date().getFullYear();

  for (const match of yearRanges) {
    const startYear = parseInt(match[1], 10);
    const endYear = match[2].toLowerCase().includes('present') ||
                    match[2].toLowerCase().includes('current') ||
                    match[2].toLowerCase().includes('now')
      ? currentYear
      : parseInt(match[2], 10);

    if (!isNaN(startYear) && !isNaN(endYear) && startYear >= 1990 && endYear >= startYear) {
      const years = endYear - startYear;
      maxYears += years;
    }
  }

  return maxYears;
}

export function extractLocation(text: string): string {
  const locationPatterns = [
    /(?:location|address|based in)[:\s]+([A-Z][a-z]+(?:,?\s*[A-Z]{2})?)/i,
    /([A-Z][a-z]+,\s*[A-Z]{2}\s*\d{5})/,
    /\b([A-Z][a-z]+,\s*[A-Z]{2})\b/,
  ];

  for (const pattern of locationPatterns) {
    const match = text.match(pattern);
    if (match) {
      return match[1].trim();
    }
  }

  return '';
}
