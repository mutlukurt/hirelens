'use client';

import { useEffect, useState, useMemo } from 'react';
import { Users, Briefcase, TrendingUp, Upload, Settings } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileDropzone } from '@/components/FileDropzone';
import { KanbanColumn } from '@/components/KanbanColumn';
import { LogoWithText } from '@/components/Logo';
import { useCandidatesStore } from '@/store/candidates';
import { useJobsStore } from '@/store/jobs';
import { useMatchesStore } from '@/store/matches';
import { parseCVFromFile, createCandidateFromParsed } from '@/lib/parse/cvParser';
import { createMatch } from '@/lib/rank/score';
import { registerServiceWorker } from '@/lib/sw-register';
import { seedJobs } from '@/lib/seed';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

export default function Dashboard() {
  const { candidates, loadCandidates, addCandidate, updateCandidate } = useCandidatesStore();
  const { jobs, loadJobs, addJob } = useJobsStore();
  const { matches, loadMatches, addMatch } = useMatchesStore();
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const initializeData = async () => {
      await loadJobs();
      await loadCandidates();
      await loadMatches();
      registerServiceWorker();
    };

    initializeData();
  }, [loadCandidates, loadJobs, loadMatches]);

  useEffect(() => {
    const seedData = async () => {
      if (jobs.length === 0) {
        console.log('No jobs found, seeding 45 jobs...');
        for (const job of seedJobs) {
          await addJob(job);
        }
        await loadJobs();
      }
    };

    seedData();
  }, [jobs.length, addJob, loadJobs]);

  useEffect(() => {
    console.log('Matches state updated! Total matches:', matches.length);
    if (matches.length > 0) {
      const totalScore = matches.reduce((sum, m) => sum + m.score, 0);
      console.log('Match scores:', matches.map(m => m.score));
      console.log('Total score:', totalScore, 'Avg:', Math.round(totalScore / matches.length));
    }
  }, [matches]);

  const handleFileSelect = async (file: File) => {
    setIsUploading(true);

    try {
      console.log('[Mobile Debug] Starting CV upload, file:', file.name, file.type, file.size);

      toast.info('Parsing CV...');
      const parsed = await parseCVFromFile(file);
      console.log('[Mobile Debug] Parsed CV:', parsed);

      toast.info('Creating candidate profile...');
      const candidate = createCandidateFromParsed(parsed);
      console.log('[Mobile Debug] Created candidate:', candidate);

      await addCandidate(candidate);
      console.log('[Mobile Debug] Candidate added to store');

      const activeJobs = jobs.filter(j => j.isActive);
      console.log(`[Mobile Debug] Found ${activeJobs.length} active jobs for matching`);

      if (activeJobs.length === 0) {
        toast.warning(`Added ${candidate.name} but no active jobs found for matching`);
        setIsUploading(false);
        return;
      }

      toast.info(`Matching with ${activeJobs.length} jobs...`);
      let matchCount = 0;
      const createdMatches = [];

      for (const job of activeJobs) {
        try {
          const match = createMatch(candidate, job, [...candidates, candidate]);
          console.log(`[Mobile Debug] Match for ${job.title}: ${match.score}%`, match);
          await addMatch(match);
          createdMatches.push(match);
          matchCount++;
        } catch (matchError) {
          console.error(`[Mobile Debug] Failed to match with ${job.title}:`, matchError);
        }
      }

      console.log('[Mobile Debug] Reloading matches from store...');
      await loadMatches();

      const avgScore = createdMatches.length > 0
        ? Math.round(createdMatches.reduce((sum, m) => sum + m.score, 0) / createdMatches.length)
        : 0;

      console.log(`[Mobile Debug] Final: ${matchCount} matches created, avg score: ${avgScore}%`);

      setTimeout(() => {
        console.log('[Mobile Debug] Force refresh all stores for UI update...');
        loadMatches();
        loadCandidates();
      }, 300);

      toast.success(`✓ ${candidate.name} added with ${avgScore}% avg match (${matchCount} jobs)`, {
        duration: 5000,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to parse CV. Please try again.';
      console.error('[Mobile Debug] CV parsing error:', error);
      toast.error(`Error: ${message}`, { duration: 5000 });
    } finally {
      setIsUploading(false);
    }
  };

  const handleCandidateMove = async (
    candidateId: string,
    newStage: 'new' | 'shortlist' | 'interview'
  ) => {
    const candidate = candidates.find((c) => c.id === candidateId);
    if (candidate && candidate.stage !== newStage) {
      await updateCandidate({
        ...candidate,
        stage: newStage,
        updatedAt: Date.now(),
      });
      toast.success(`Moved ${candidate.name} to ${newStage}`);
    }
  };

  const activeJobs = useMemo(() => jobs.filter((j) => j.isActive).length, [jobs]);

  const avgMatch = useMemo(() => {
    if (matches.length === 0) return 0;
    const totalScore = matches.reduce((sum, m) => sum + m.score, 0);
    const avg = Math.round(totalScore / matches.length);
    console.log('Calculating avg match - Total matches:', matches.length, 'Total score:', totalScore, 'Avg:', avg);
    return avg;
  }, [matches]);

  const newCandidates = candidates.filter((c) => c.stage === 'new');
  const shortlistCandidates = candidates.filter((c) => c.stage === 'shortlist');
  const interviewCandidates = candidates.filter((c) => c.stage === 'interview');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <LogoWithText />
            <div className="flex gap-3">
              <Button variant="outline" asChild>
                <a href="/jobs">
                  <Briefcase className="w-4 h-4 mr-2" />
                  Jobs
                </a>
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <a href="/settings">
                  <Settings className="w-5 h-5" />
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-8">{''}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-none shadow-md bg-white hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Candidates</CardTitle>
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{candidates.length}</div>
              <p className="text-xs text-gray-500 mt-1">candidates in pipeline</p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md bg-white hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Active Jobs</CardTitle>
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <Briefcase className="h-5 w-5 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{activeJobs}</div>
              <p className="text-xs text-gray-500 mt-1">open positions</p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md bg-white hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Avg Match Score</CardTitle>
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{avgMatch}%</div>
              <p className="text-xs text-gray-500 mt-1">average compatibility</p>
            </CardContent>
          </Card>
        </div>

        <Card className="border-none shadow-md bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <Upload className="h-5 w-5 text-blue-600" />
              Upload Resume
            </CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              Drop a PDF resume to automatically extract candidate information
            </p>
          </CardHeader>
          <CardContent>
            <FileDropzone onFileSelect={handleFileSelect} />
            {isUploading && (
              <div className="mt-4 flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-gray-600">Processing resume...</p>
              </div>
            )}
          </CardContent>
        </Card>

        <div>
          <h2 className="text-2xl font-bold mb-6 text-gray-900">Candidate Pipeline</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <KanbanColumn
              title="New"
              stage="new"
              candidates={newCandidates}
              onCandidateMove={handleCandidateMove}
            />
            <KanbanColumn
              title="Shortlist"
              stage="shortlist"
              candidates={shortlistCandidates}
              onCandidateMove={handleCandidateMove}
            />
            <KanbanColumn
              title="Interview"
              stage="interview"
              candidates={interviewCandidates}
              onCandidateMove={handleCandidateMove}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
