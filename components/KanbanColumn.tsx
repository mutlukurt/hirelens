'use client';

import { Card } from '@/components/ui/card';
import { CandidateCard } from './CandidateCard';
import type { Candidate } from '@/lib/db/types';
import { cn } from '@/lib/utils';

interface KanbanColumnProps {
  title: string;
  candidates: Candidate[];
  stage: 'new' | 'shortlist' | 'interview';
  onCandidateMove: (candidateId: string, newStage: 'new' | 'shortlist' | 'interview') => void;
  className?: string;
}

export function KanbanColumn({
  title,
  candidates,
  stage,
  onCandidateMove,
  className,
}: KanbanColumnProps) {
  const handleDragStart = (e: React.DragEvent, candidateId: string) => {
    e.dataTransfer.setData('candidateId', candidateId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const candidateId = e.dataTransfer.getData('candidateId');
    if (candidateId) {
      onCandidateMove(candidateId, stage);
    }
  };

  return (
    <div
      className={cn('flex flex-col gap-4 min-h-[400px]', className)}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      role="region"
      aria-label={`${title} column with ${candidates.length} candidates`}
    >
      <div className="flex items-center justify-between px-1">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <span className="px-2 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded-full">
          {candidates.length}
        </span>
      </div>
      <div className="flex-1 space-y-3 p-4 bg-white border-2 border-dashed border-gray-200 rounded-xl">
        {candidates.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">
            No candidates in this stage
          </p>
        ) : (
          candidates.map((candidate) => (
            <div
              key={candidate.id}
              draggable
              onDragStart={(e) => handleDragStart(e, candidate.id)}
              className="cursor-move transition-transform hover:scale-102"
              role="button"
              tabIndex={0}
              aria-label={`Move ${candidate.name} to another stage`}
            >
              <CandidateCard candidate={candidate} />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
