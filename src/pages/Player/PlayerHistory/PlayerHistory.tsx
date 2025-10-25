import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Eye } from 'lucide-react';
import { usePlayerTransactions } from '@/api/hooks';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card/Card';
import { Button } from '@/components/ui/Button/Button';
import { DataTable, Column } from '@/components/ui/DataTable/DataTable';
import { StatusBadge } from '@/components/StatusBadge/StatusBadge';
import type { Transaction } from '@/types';
import styles from './PlayerHistory.module.css';

export const PlayerHistory: React.FC = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const limit = 10;

  const playerUuid = localStorage.getItem('playerUuid');

  const { data, isLoading } = usePlayerTransactions(playerUuid || '', page, limit);

  const columns: Column<Transaction>[] = [
    {
      key: 'id',
      header: 'ID',
      render: (value) => `#${value}`,
    },
    {
      key: 'type',
      header: 'Type',
      render: (value) => (
        <span className={value === 'DEPOSIT' ? styles.deposit : styles.withdraw}>
          {value}
        </span>
      ),
    },
    {
      key: 'amount',
      header: 'Amount',
      render: (value, row) => `${row.currency} ${parseFloat(value).toFixed(2)}`,
    },
    {
      key: 'status',
      header: 'Status',
      render: (value) => <StatusBadge status={value} />,
    },
    {
      key: 'bettingSite',
      header: 'Betting Site',
      render: (value, row) => (
        <div className={styles.bettingSiteInfo}>
          {row.bettingSite ? (
            <>
              <div className={styles.siteName}>{row.bettingSite.name}</div>
              {row.playerSiteId && (
                <div className={styles.playerId}>@{row.playerSiteId}</div>
              )}
            </>
          ) : (
            <span className={styles.noSite}>No site</span>
          )}
        </div>
      ),
    },
    {
      key: 'requestedAt',
      header: 'Date',
      render: (value) => format(new Date(value), 'MMM dd, yyyy HH:mm'),
    },
    {
      key: 'id',
      header: 'Actions',
      render: (_value, row) => (
        <Button
          size="sm"
          variant="outline"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/player/transaction/${row.id}`, {
              state: { playerUuid },
            });
          }}
        >
          <Eye size={16} />
          View
        </Button>
      ),
    },
  ];

  if (!playerUuid) {
    return (
      <div className={styles.container}>
        <Card variant="elevated" className={styles.errorCard}>
          <CardContent>
            <h2>No Player Profile Found</h2>
            <p>Please create a transaction first to view your history.</p>
            <Button onClick={() => navigate('/player/new-transaction')}>
              Create Transaction
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Transaction History</h1>
          <p className={styles.subtitle}>View all your past transactions</p>
        </div>
        <Button onClick={() => navigate('/player/new-transaction')}>
          New Transaction
        </Button>
      </div>

      <Card variant="bordered">
        <CardContent padding="none">
          <DataTable
            data={data?.data || []}
            columns={columns}
            isLoading={isLoading}
            emptyMessage="No transactions found"
            pagination={
              data?.pagination
                ? {
                    currentPage: data.pagination.page,
                    totalPages: data.pagination.totalPages,
                    onPageChange: setPage,
                  }
                : undefined
            }
            onRowClick={(row) =>
              navigate(`/player/transaction/${row.id}`, {
                state: { playerUuid },
              })
            }
          />
        </CardContent>
      </Card>

      <div className={styles.info}>
        <Card variant="bordered">
          <CardHeader>
            <CardTitle>Player Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={styles.infoItem}>
              <strong>Player UUID:</strong>
              <code className={styles.uuid}>{playerUuid}</code>
            </div>
            <p className={styles.infoText}>
              Save your Player UUID to access your transactions later.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

