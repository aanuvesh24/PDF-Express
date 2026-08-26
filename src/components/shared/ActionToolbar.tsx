import React from 'react';
import { Sparkles, Loader2, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ActionToolbarProps {
  itemCount: number;
  itemLabel?: string;
  actionText: string;
  onAction: () => void;
  onReset?: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  secondaryAction?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
  };
  children?: React.ReactNode;
  className?: string;
}

export const ActionToolbar: React.FC<ActionToolbarProps> = ({
  itemCount,
  itemLabel = 'items',
  actionText,
  onAction,
  onReset,
  isLoading = false,
  disabled = false,
  secondaryAction,
  children,
  className,
}) => {
  return (
    <div
      className={cn(
        'sticky bottom-6 z-40 mx-auto w-full max-w-5xl rounded-2xl border border-slate-700/80 bg-slate-900/90 p-4 shadow-2xl backdrop-blur-xl ring-1 ring-white/10',
        'animate-fade-in transition-all',
        className
      )}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Left Info & Reset */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/20 text-xs font-bold font-mono text-indigo-300 ring-1 ring-indigo-500/30">
              {itemCount}
            </span>
            <span className="text-sm font-medium text-slate-300">
              {itemCount === 1 ? itemLabel.replace(/s$/, '') : itemLabel}
            </span>
          </div>

          {onReset && (
            <button
              type="button"
              onClick={onReset}
              disabled={isLoading}
              className="text-xs font-medium text-slate-400 hover:text-rose-400 transition-colors underline-offset-4 hover:underline ml-2"
            >
              Clear all
            </button>
          )}

          {children}
        </div>

        {/* Right CTA buttons */}
        <div className="flex items-center gap-3">
          {secondaryAction && (
            <button
              type="button"
              onClick={secondaryAction.onClick}
              disabled={disabled || isLoading}
              className="flex items-center gap-2 rounded-xl bg-slate-800 px-4 py-2.5 text-sm font-semibold text-slate-200 transition-all hover:bg-slate-700 disabled:opacity-50"
            >
              {secondaryAction.icon}
              {secondaryAction.label}
            </button>
          )}

          <button
            type="button"
            onClick={onAction}
            disabled={disabled || isLoading}
            className={cn(
              'group relative flex items-center justify-center gap-2 rounded-xl px-6 py-2.5 text-sm font-bold text-white shadow-lg transition-all',
              'bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500',
              'shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-[1.02] active:scale-[0.98]',
              'disabled:opacity-50 disabled:pointer-events-none'
            )}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 transition-transform group-hover:rotate-12 text-indigo-200" />
                <span>{actionText}</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
