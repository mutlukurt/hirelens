'use client';

import { cn } from '@/lib/utils';

interface MatchGaugeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export function MatchGauge({
  score,
  size = 'md',
  showLabel = true,
  className,
}: MatchGaugeProps) {
  const normalizedScore = Math.max(0, Math.min(100, score));

  const getColor = (score: number) => {
    if (score >= 75) return 'text-green-600 dark:text-green-400';
    if (score >= 50) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getStrokeColor = (score: number) => {
    if (score >= 75) return 'stroke-green-600 dark:stroke-green-400';
    if (score >= 50) return 'stroke-yellow-600 dark:stroke-yellow-400';
    return 'stroke-red-600 dark:stroke-red-400';
  };

  const sizes = {
    sm: { width: 80, height: 80, strokeWidth: 6, fontSize: 'text-lg' },
    md: { width: 120, height: 120, strokeWidth: 8, fontSize: 'text-2xl' },
    lg: { width: 160, height: 160, strokeWidth: 10, fontSize: 'text-4xl' },
  };

  const { width, height, strokeWidth, fontSize } = sizes[size];
  const radius = (width - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (normalizedScore / 100) * circumference;

  return (
    <div className={cn('flex flex-col items-center gap-2', className)}>
      <div className="relative" style={{ width, height }}>
        <svg width={width} height={height} className="transform -rotate-90">
          <circle
            cx={width / 2}
            cy={height / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-gray-200 dark:text-gray-700"
          />
          <circle
            cx={width / 2}
            cy={height / 2}
            r={radius}
            fill="none"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className={cn('transition-all duration-500', getStrokeColor(normalizedScore))}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={cn('font-bold', fontSize, getColor(normalizedScore))}>
            {Math.round(normalizedScore)}
          </span>
        </div>
      </div>
      {showLabel && (
        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
          Match Score
        </span>
      )}
    </div>
  );
}
