import React from 'react';
import { cn } from '@/lib/utils';

export type VerdictStatus = 'approved' | 'flagged' | 'rejected' | 'pending' | 'auditing';

interface VerdictBadgeProps {
  status: VerdictStatus;
  className?: string;
}

export default function VerdictBadge({ status, className }: VerdictBadgeProps) {
  const styles: Record<VerdictStatus, string> = {
    approved: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    flagged: 'bg-amber-100 text-amber-700 border-amber-200',
    rejected: 'bg-rose-100 text-rose-700 border-rose-200',
    pending: 'bg-slate-100 text-slate-700 border-slate-200',
    auditing: 'bg-indigo-100 text-indigo-700 border-indigo-200 animate-pulse',
  };

  const labels: Record<VerdictStatus, string> = {
    approved: 'Approved',
    flagged: 'Flagged',
    rejected: 'Rejected',
    pending: 'Pending',
    auditing: 'Auditing...',
  };

  return (
    <span className={cn(
      'px-2.5 py-0.5 rounded-full text-xs font-bold border uppercase tracking-wider',
      styles[status],
      className
    )}>
      {labels[status]}
    </span>
  );
}
