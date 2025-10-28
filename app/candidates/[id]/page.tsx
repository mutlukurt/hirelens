'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Mail, Phone, MapPin, Briefcase, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MatchGauge } from '@/components/MatchGauge';
import { GapList } from '@/components/GapList';
import { KeywordHeatmap } from '@/components/KeywordHeatmap';
import { useCandidatesStore } from '@/store/candidates';
import { useJobsStore } from '@/store/jobs';
import { useMatchesStore } from '@/store/matches';
import { createMatch } from '@/lib/rank/score';
import { toast } from 'sonner';

export default function CandidateDetail() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { candidates, getCandidateById } = useCandidatesStore();
  const { jobs } = useJobsStore();
  const { matches, addMatch, getBestMatchForCandidate } = useMatchesStore();

  const [selectedJobId, setSelectedJobId] = useState<string>('');
  const [isScoring, setIsScoring] = useState(false);

  const candidate = getCandidateById(id);
  const bestMatch = getBestMatchForCandidate(id);
  const currentMatch = selectedJobId
    ? matches.find((m) => m.candidateId === id && m.jobId === selectedJobId)
    : bestMatch;

  useEffect(() => {
    if (bestMatch) {
      setSelectedJobId(bestMatch.jobId);
    }
  }, [bestMatch]);

  const handleScore = async () => {
    if (!candidate || !selectedJobId) return;

    const job = jobs.find((j) => j.id === selectedJobId);
    if (!job) return;

    setIsScoring(true);
    try {
      const match = createMatch(candidate, job, candidates);
      await addMatch(match);
      toast.success('Match score calculated');
    } catch (error) {
      toast.error('Failed to calculate match score');
    } finally {
      setIsScoring(false);
    }
  };

  if (!candidate) {
    return (
      <div className="min-h-screen bg-gray-50  p-6">
        <div className="max-w-4xl mx-auto">
          <p className="text-center text-gray-600 ">
            Candidate not found
          </p>
        </div>
      </div>
    );
  }

  const selectedJob = jobs.find((j) => j.id === selectedJobId);

  return (
    <div className="min-h-screen bg-gray-50  p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <Button variant="ghost" onClick={() => router.push('/')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-2xl">{candidate.name}</CardTitle>
                <div className="mt-4 space-y-2 text-sm text-gray-600 ">
                  {candidate.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      <a
                        href={`mailto:${candidate.email}`}
                        className="hover:text-blue-600 "
                      >
                        {candidate.email}
                      </a>
                    </div>
                  )}
                  {candidate.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      <span>{candidate.phone}</span>
                    </div>
                  )}
                  {candidate.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span>{candidate.location}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4" />
                    <span>{candidate.yearsExperience} years experience</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>
                      Added {new Date(candidate.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
              {currentMatch && (
                <MatchGauge score={currentMatch.score} size="lg" />
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-2">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {candidate.skills.map((skill) => (
                    <Badge key={skill} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-2">Stage</h3>
                <Badge variant="outline">{candidate.stage}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Score Against Job</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <select
                className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm  dark:border-gray-700"
                value={selectedJobId}
                onChange={(e) => setSelectedJobId(e.target.value)}
              >
                <option value="">Select a job...</option>
                {jobs
                  .filter((j) => j.isActive)
                  .map((job) => (
                    <option key={job.id} value={job.id}>
                      {job.title}
                    </option>
                  ))}
              </select>
              <Button
                onClick={handleScore}
                disabled={!selectedJobId || isScoring}
              >
                {isScoring ? 'Scoring...' : 'Score'}
              </Button>
            </div>

            {currentMatch && (
              <div className="space-y-4 pt-4 border-t border-gray-200 ">
                <div>
                  <h4 className="text-sm font-medium mb-2">Explanations</h4>
                  <ul className="space-y-1 text-sm text-gray-600 ">
                    {currentMatch.explanations.map((exp, index) => (
                      <li key={index}>• {exp}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {currentMatch && selectedJob && (
          <>
            <GapList gaps={currentMatch.gaps} />

            <KeywordHeatmap
              matchedSkills={currentMatch.matchedSkills}
              requiredSkills={[
                ...selectedJob.mustHaveSkills,
                ...selectedJob.niceToHaveSkills,
              ]}
              candidateSkills={candidate.skills}
            />
          </>
        )}
      </div>
    </div>
  );
}
