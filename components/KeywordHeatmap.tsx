'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface KeywordHeatmapProps {
  matchedSkills: string[];
  requiredSkills: string[];
  candidateSkills: string[];
  className?: string;
}

export function KeywordHeatmap({
  matchedSkills,
  requiredSkills,
  candidateSkills,
  className,
}: KeywordHeatmapProps) {
  const getSkillStatus = (skill: string): 'matched' | 'missing' | 'extra' => {
    if (requiredSkills.includes(skill) && candidateSkills.includes(skill)) {
      return 'matched';
    }
    if (requiredSkills.includes(skill) && !candidateSkills.includes(skill)) {
      return 'missing';
    }
    return 'extra';
  };

  const getVariant = (
    status: 'matched' | 'missing' | 'extra'
  ): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (status) {
      case 'matched':
        return 'default';
      case 'missing':
        return 'destructive';
      case 'extra':
        return 'secondary';
    }
  };

  const allSkills = Array.from(new Set([...requiredSkills, ...candidateSkills]));

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg">Skill Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-600" />
              <span>Matched</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-600" />
              <span>Missing</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gray-400" />
              <span>Additional</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {allSkills.map((skill) => {
              const status = getSkillStatus(skill);
              return (
                <Badge
                  key={skill}
                  variant={getVariant(status)}
                  className={cn('transition-all')}
                >
                  {skill}
                </Badge>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
