'use client';

import { CLAIM_STATUS } from '@/config/theme';
import type { ClaimStatus } from '@/lib/types';

interface StatusBadgeProps {
  status: ClaimStatus;
  size?: 'sm' | 'md';
}

export default function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  // Robustness check: Map 'PENDIENTE' to 'PENDING' if encountered, else default to 'PENDING'
  let normalizedStatus = (status as string || '').toUpperCase() as keyof typeof CLAIM_STATUS;
  if (normalizedStatus as string === 'PENDIENTE') normalizedStatus = 'PENDING';
  if (normalizedStatus as string === 'EN_PROCESO') normalizedStatus = 'IN_PROGRESS';
  if (normalizedStatus as string === 'RESUELTO') normalizedStatus = 'RESOLVED';
  
  const config = CLAIM_STATUS[normalizedStatus] || CLAIM_STATUS.PENDING;

  return (
    <span
      className={`status-badge status-badge-${size}`}
      style={{
        background: `${config.color}22`,
        color: config.color,
        borderColor: `${config.color}44`,
      }}
    >
      <span className="status-badge-dot" style={{ background: config.color }} />
      {config.label}
    </span>
  );
}
