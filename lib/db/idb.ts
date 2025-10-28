import { openDB, DBSchema as IDBSchema, IDBPDatabase } from 'idb';
import type { Candidate, Job, Match, Settings, DBSchema } from './types';

const DB_NAME = 'hirelens-db';
const DB_VERSION = 1;

let dbInstance: IDBPDatabase<DBSchema> | null = null;

export async function getDB(): Promise<IDBPDatabase<DBSchema>> {
  if (dbInstance) return dbInstance;

  dbInstance = await openDB<DBSchema>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('candidates')) {
        db.createObjectStore('candidates', { keyPath: 'id' });
      }

      if (!db.objectStoreNames.contains('jobs')) {
        db.createObjectStore('jobs', { keyPath: 'id' });
      }

      if (!db.objectStoreNames.contains('matches')) {
        const matchStore = db.createObjectStore('matches', { keyPath: 'id' });
        matchStore.createIndex('by-candidate', 'candidateId');
        matchStore.createIndex('by-job', 'jobId');
      }

      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings', { keyPath: 'theme' });
      }
    },
  });

  return dbInstance;
}

export async function addCandidate(candidate: Candidate): Promise<void> {
  const db = await getDB();
  await db.put('candidates', candidate);
}

export async function getCandidate(id: string): Promise<Candidate | undefined> {
  const db = await getDB();
  return db.get('candidates', id);
}

export async function getAllCandidates(): Promise<Candidate[]> {
  const db = await getDB();
  return db.getAll('candidates');
}

export async function updateCandidate(candidate: Candidate): Promise<void> {
  const db = await getDB();
  await db.put('candidates', candidate);
}

export async function deleteCandidate(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('candidates', id);
}

export async function addJob(job: Job): Promise<void> {
  const db = await getDB();
  await db.put('jobs', job);
}

export async function getJob(id: string): Promise<Job | undefined> {
  const db = await getDB();
  return db.get('jobs', id);
}

export async function getAllJobs(): Promise<Job[]> {
  const db = await getDB();
  return db.getAll('jobs');
}

export async function updateJob(job: Job): Promise<void> {
  const db = await getDB();
  await db.put('jobs', job);
}

export async function deleteJob(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('jobs', id);
}

export async function addMatch(match: Match): Promise<void> {
  const db = await getDB();
  await db.put('matches', match);
}

export async function getMatch(id: string): Promise<Match | undefined> {
  const db = await getDB();
  return db.get('matches', id);
}

export async function getMatchesByCandidate(candidateId: string): Promise<Match[]> {
  const db = await getDB();
  return db.getAllFromIndex('matches', 'by-candidate', candidateId);
}

export async function getMatchesByJob(jobId: string): Promise<Match[]> {
  const db = await getDB();
  return db.getAllFromIndex('matches', 'by-job', jobId);
}

export async function getAllMatches(): Promise<Match[]> {
  const db = await getDB();
  return db.getAll('matches');
}

export async function deleteMatch(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('matches', id);
}

export async function getSettings(): Promise<Settings | undefined> {
  const db = await getDB();
  const allSettings = await db.getAll('settings');
  return allSettings[0];
}

export async function updateSettings(settings: Settings): Promise<void> {
  const db = await getDB();
  await db.put('settings', settings);
}

export async function clearAllData(): Promise<void> {
  const db = await getDB();
  await db.clear('candidates');
  await db.clear('jobs');
  await db.clear('matches');
}

export async function exportData(): Promise<{
  candidates: Candidate[];
  jobs: Job[];
  matches: Match[];
}> {
  const db = await getDB();
  const [candidates, jobs, matches] = await Promise.all([
    db.getAll('candidates'),
    db.getAll('jobs'),
    db.getAll('matches'),
  ]);
  return { candidates, jobs, matches };
}

export async function importData(data: {
  candidates?: Candidate[];
  jobs?: Job[];
  matches?: Match[];
}): Promise<void> {
  const db = await getDB();
  const tx = db.transaction(['candidates', 'jobs', 'matches'], 'readwrite');

  if (data.candidates) {
    for (const candidate of data.candidates) {
      await tx.objectStore('candidates').put(candidate);
    }
  }

  if (data.jobs) {
    for (const job of data.jobs) {
      await tx.objectStore('jobs').put(job);
    }
  }

  if (data.matches) {
    for (const match of data.matches) {
      await tx.objectStore('matches').put(match);
    }
  }

  await tx.done;
}
