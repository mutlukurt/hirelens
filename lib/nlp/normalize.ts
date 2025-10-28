import skillsDict from './skills.json';

type SkillDictionary = Record<string, string[]>;

const dictionary: SkillDictionary = skillsDict;

const reverseMap = new Map<string, string>();
Object.entries(dictionary).forEach(([canonical, synonyms]) => {
  reverseMap.set(canonical.toLowerCase(), canonical);
  synonyms.forEach((syn) => reverseMap.set(syn.toLowerCase(), canonical));
});

export function normalizeSkill(skill: string): string {
  const lower = skill.toLowerCase().trim();
  return reverseMap.get(lower) || skill;
}

export function normalizeSkills(skills: string[]): string[] {
  const normalized = skills.map(normalizeSkill);
  return Array.from(new Set(normalized));
}

export function extractSkillsFromText(text: string): string[] {
  const words = text
    .toLowerCase()
    .replace(/[^\w\s.#+]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 1);

  const foundSkills = new Set<string>();

  for (let i = 0; i < words.length; i++) {
    for (let len = 5; len >= 1; len--) {
      if (i + len > words.length) continue;
      const phrase = words.slice(i, i + len).join(' ');
      const normalized = normalizeSkill(phrase);
      if (reverseMap.has(phrase)) {
        foundSkills.add(normalized);
      }
    }
  }

  words.forEach((word) => {
    const normalized = normalizeSkill(word);
    if (reverseMap.has(word)) {
      foundSkills.add(normalized);
    }
  });

  return Array.from(foundSkills);
}

export function getSkillFrequency(text: string, skill: string): number {
  const normalized = normalizeSkill(skill);
  const synonyms = [normalized, ...(dictionary[normalized] || [])];
  const lower = text.toLowerCase();

  let count = 0;
  synonyms.forEach((syn) => {
    const regex = new RegExp(`\\b${syn.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
    const matches = lower.match(regex);
    count += matches ? matches.length : 0;
  });

  return count;
}

export function compareSkills(
  candidateSkills: string[],
  requiredSkills: string[]
): {
  matched: string[];
  missing: string[];
} {
  const normalizedCandidate = normalizeSkills(candidateSkills);
  const normalizedRequired = normalizeSkills(requiredSkills);

  const matched: string[] = [];
  const missing: string[] = [];

  normalizedRequired.forEach((reqSkill) => {
    if (normalizedCandidate.includes(reqSkill)) {
      matched.push(reqSkill);
    } else {
      missing.push(reqSkill);
    }
  });

  return { matched, missing };
}

export function getSkillDictionary(): SkillDictionary {
  return dictionary;
}

export function addSkillSynonym(canonical: string, synonym: string): void {
  const lower = canonical.toLowerCase();
  if (!dictionary[lower]) {
    dictionary[lower] = [];
  }
  if (!dictionary[lower].includes(synonym.toLowerCase())) {
    dictionary[lower].push(synonym.toLowerCase());
  }
  reverseMap.set(synonym.toLowerCase(), lower);
}
