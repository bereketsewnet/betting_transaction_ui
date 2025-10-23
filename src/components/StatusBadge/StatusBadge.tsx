import React from 'react';
import { Badge } from '@/components/ui/Badge/Badge';
import type { TransactionStatus } from '@/types';

interface StatusBadgeProps {
  status: TransactionStatus;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const variantMap: Record<TransactionStatus, 'success' | 'error' | 'warning' | 'info' | 'pending'> = {
    SUCCESS: 'success',
    FAILED: 'error',
    CANCELLED: 'error',
    IN_PROGRESS: 'info',
    PENDING: 'pending',
  };

  const variant = variantMap[status] || 'default';

  return <Badge variant={variant}>{status}</Badge>;
};

