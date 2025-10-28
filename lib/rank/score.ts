import type { Candidate, Job, Match } from '../db/types';
import { compareSkills, getSkillFrequency, normalizeSkills } from '../nlp/normalize';
import { calculateBM25Normalized } from './bm25';

interface ScoringResult {
  score: number;
  explanations: string[];
  gaps: string[];
  matchedSkills: string[];
  missingMustHave: string[];
}

export function scoreCandidate(
  candidate: Candidate,
  job: Job,
  allCandidates: Candidate[]
): ScoringResult {
  let score = 50;
  const explanations: string[] = [];
  const gaps: string[] = [];

  const allTexts = allCandidates.map((c) => c.rawText);
  const bm25Score = calculateBM25Normalized(
    `${job.title} ${job.description} ${job.mustHaveSkills.join(' ')}`,
    candidate.rawText,
    allTexts
  );
  score += bm25Score * 0.3;
  explanations.push(`Text relevance score: ${bm25Score.toFixed(1)}/100`);

  const { matched: matchedMustHave, missing: missingMustHave } = compareSkills(
    candidate.skills,
    job.mustHaveSkills
  );

  const mustHavePenalty = Math.min(missingMustHave.length * 15, 50);
  score -= mustHavePenalty;

  if (missingMustHave.length > 0) {
    explanations.push(`Missing ${missingMustHave.length} must-have skill(s): -${mustHavePenalty}pts`);
    missingMustHave.forEach((skill) => {
      gaps.push(`Missing required skill: ${skill}`);
    });
  } else {
    explanations.push(`All ${matchedMustHave.length} must-have skills present: +0pts`);
  }

  const { matched: matchedNiceToHave } = compareSkills(
    candidate.skills,
    job.niceToHaveSkills
  );

  const niceToHaveBonus = Math.min(matchedNiceToHave.length * 3, 15);
  score += niceToHaveBonus;

  if (matchedNiceToHave.length > 0) {
    explanations.push(`${matchedNiceToHave.length} nice-to-have skill(s): +${niceToHaveBonus}pts`);
  }

  if (job.minYears > 0) {
    if (candidate.yearsExperience < job.minYears) {
      const experienceGap = job.minYears - candidate.yearsExperience;
      score -= 10;
      explanations.push(
        `Experience below minimum (${candidate.yearsExperience} vs ${job.minYears} years): -10pts`
      );
      gaps.push(`Needs ${experienceGap} more year(s) of experience`);
    } else {
      explanations.push(
        `Experience meets requirement (${candidate.yearsExperience} years): +0pts`
      );
    }
  }

  if (job.location && candidate.location) {
    const jobLoc = job.location.toLowerCase();
    const candLoc = candidate.location.toLowerCase();

    if (!candLoc.includes(jobLoc) && !jobLoc.includes(candLoc)) {
      score -= 5;
      explanations.push(`Location mismatch: -5pts`);
      gaps.push(`Preferred location: ${job.location}`);
    } else {
      explanations.push(`Location match: +0pts`);
    }
  }

  const allRequiredSkills = [...job.mustHaveSkills, ...job.niceToHaveSkills];
  let keywordDensity = 0;

  allRequiredSkills.forEach((skill) => {
    const freq = getSkillFrequency(candidate.rawText, skill);
    keywordDensity += freq;
  });

  const densityBonus = Math.min(Math.floor(keywordDensity / 3), 10);
  score += densityBonus;

  if (densityBonus > 0) {
    explanations.push(`Keyword density bonus: +${densityBonus}pts`);
  }

  score = Math.max(0, Math.min(100, score));

  const allMatchedSkills = normalizeSkills([...matchedMustHave, ...matchedNiceToHave]);

  return {
    score: Math.round(score),
    explanations,
    gaps,
    matchedSkills: allMatchedSkills,
    missingMustHave,
  };
}

export function createMatch(
  candidate: Candidate,
  job: Job,
  allCandidates: Candidate[]
): Match {
  const result = scoreCandidate(candidate, job, allCandidates);

  return {
    id: `match-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    candidateId: candidate.id,
    jobId: job.id,
    score: result.score,
    explanations: result.explanations,
    gaps: result.gaps,
    matchedSkills: result.matchedSkills,
    missingMustHave: result.missingMustHave,
    createdAt: Date.now(),
  };
}
