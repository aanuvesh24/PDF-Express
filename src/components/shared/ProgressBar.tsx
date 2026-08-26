import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProgressBarProps {
  progress: number;
  stage: string;
  current?: number;
  total?: number;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  stage,
  current,
  total,
  className,
}) => {
  const percentage = Math.min(100, Math.max(0, Math.round(progress)));

  return (
    <div className={cn('w-full rounded-xl border border-indigo-500/30 bg-slate-900/90 p-4 shadow-xl backdrop-blur-md', className)}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin text-indigo-400" />
          <span className="text-sm font-medium text-slate-200">{stage}</span>
        </div>
        <div className="text-xs font-mono font-semibold text-indigo-300">
          {current !== undefined && total !== undefined
            ? `${current}/${total} (${percentage}%)`
            : `${percentage}%`}
        </div>
      </div>

      <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-800 ring-1 ring-slate-700">
        <div
          className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-400 transition-all duration-300 ease-out shadow-sm shadow-indigo-500/50"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
