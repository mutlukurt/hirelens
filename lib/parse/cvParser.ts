import {
  extractTextFromPdf,
  extractEmail,
  extractPhone,
  extractName,
  extractYearsExperience,
  extractLocation,
} from './pdfClient';
import { extractSkillsFromText } from '../nlp/normalize';
import type { Candidate } from '../db/types';

export interface ParsedCV {
  name: string;
  email: string;
  phone: string;
  skills: string[];
  yearsExperience: number;
  location: string;
  rawText: string;
}

export async function parseCVFromFile(file: File): Promise<ParsedCV> {
  try {
    if (!file.type.includes('pdf') && !file.name.toLowerCase().endsWith('.pdf')) {
      throw new Error('Please upload a PDF file');
    }

    if (file.size === 0) {
      throw new Error('The uploaded file is empty');
    }

    if (file.size > 10 * 1024 * 1024) {
      throw new Error('File size must be less than 10MB');
    }

    const rawText = await extractTextFromPdf(file);

    if (!rawText || rawText.trim().length === 0) {
      throw new Error('Could not extract text from PDF. The file may be corrupted or image-based.');
    }

    const name = extractName(rawText);
    const email = extractEmail(rawText);
    const phone = extractPhone(rawText);
    const location = extractLocation(rawText);
    const yearsExperience = extractYearsExperience(rawText);
    const skills = extractSkillsFromText(rawText);

    if (name === 'Unknown' && !email && skills.length === 0) {
      throw new Error('Could not extract meaningful data from PDF. Please ensure the CV contains readable text.');
    }

    return {
      name,
      email,
      phone,
      skills,
      yearsExperience,
      location,
      rawText,
    };
  } catch (error) {
    console.error('Error parsing CV:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to parse CV. Please ensure the file is a valid PDF.');
  }
}

export function createCandidateFromParsed(parsed: ParsedCV): Candidate {
  const now = Date.now();
  return {
    id: `candidate-${now}-${Math.random().toString(36).substring(2, 9)}`,
    name: parsed.name,
    email: parsed.email,
    phone: parsed.phone,
    skills: parsed.skills,
    yearsExperience: parsed.yearsExperience,
    location: parsed.location,
    rawText: parsed.rawText,
    stage: 'new',
    createdAt: now,
    updatedAt: now,
  };
}
