'use client';

import { AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface GapListProps {
  gaps: string[];
  className?: string;
}

export function GapList({ gaps, className }: GapListProps) {
  if (gaps.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-lg">Skill Gaps</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            No significant gaps identified. This candidate meets all requirements.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg">Skill Gaps</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {gaps.map((gap, index) => (
          <Alert key={index} variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{gap}</AlertDescription>
          </Alert>
        ))}
      </CardContent>
    </Card>
  );
}
