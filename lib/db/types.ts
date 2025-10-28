export interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  skills: string[];
  yearsExperience: number;
  location?: string;
  rawText: string;
  resumeUrl?: string;
  stage: 'new' | 'shortlist' | 'interview';
  createdAt: number;
  updatedAt: number;
}

export interface Job {
  id: string;
  title: string;
  description: string;
  mustHaveSkills: string[];
  niceToHaveSkills: string[];
  minYears: number;
  location?: string;
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface Match {
  id: string;
  candidateId: string;
  jobId: string;
  score: number;
  explanations: string[];
  gaps: string[];
  matchedSkills: string[];
  missingMustHave: string[];
  createdAt: number;
}

export interface Settings {
  theme: 'light' | 'dark' | 'system';
  reducedMotion: boolean;
  apiKey?: string;
  skillDictionary: Record<string, string[]>;
  updatedAt: number;
}

export interface DBSchema {
  candidates: {
    key: string;
    value: Candidate;
  };
  jobs: {
    key: string;
    value: Job;
  };
  matches: {
    key: string;
    value: Match;
    indexes: {
      'by-candidate': string;
      'by-job': string;
    };
  };
  settings: {
    key: string;
    value: Settings;
  };
}
