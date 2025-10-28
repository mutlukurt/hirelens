'use client';

import Link from 'next/link';
import { Mail, Phone, MapPin, Briefcase, Star } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MatchGauge } from './MatchGauge';
import type { Candidate } from '@/lib/db/types';

interface CandidateCardProps {
  candidate: Candidate;
  matchScore?: number;
  showMatchGauge?: boolean;
  className?: string;
}

export function CandidateCard({
  candidate,
  matchScore,
  showMatchGauge = false,
  className,
}: CandidateCardProps) {
  const topSkills = candidate.skills.slice(0, 5);

  return (
    <Card className={`${className} border-none shadow-sm hover:shadow-md transition-shadow bg-white`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <Link
              href={`/candidates/${candidate.id}`}
              className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors"
            >
              {candidate.name}
            </Link>
            <div className="mt-2 space-y-1 text-sm text-gray-600">
              {candidate.email && (
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 flex-shrink-0 text-gray-400" />
                  <span className="truncate">{candidate.email}</span>
                </div>
              )}
              {candidate.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 flex-shrink-0 text-gray-400" />
                  <span>{candidate.phone}</span>
                </div>
              )}
              {candidate.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 flex-shrink-0 text-gray-400" />
                  <span>{candidate.location}</span>
                </div>
              )}
              {candidate.yearsExperience > 0 && (
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 flex-shrink-0 text-gray-400" />
                  <span>{candidate.yearsExperience} years experience</span>
                </div>
              )}
            </div>
          </div>
          {showMatchGauge && matchScore !== undefined && (
            <MatchGauge score={matchScore} size="sm" showLabel={false} />
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {topSkills.map((skill) => (
            <Badge key={skill} variant="secondary" className="bg-blue-50 text-blue-700 border-0">
              {skill}
            </Badge>
          ))}
          {candidate.skills.length > 5 && (
            <Badge variant="outline" className="text-gray-600">
              +{candidate.skills.length - 5} more
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
