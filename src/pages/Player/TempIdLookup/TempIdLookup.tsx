import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ArrowLeft, Eye, Search, AlertCircle } from 'lucide-react';
import { useTempIdTransactions } from '@/api/hooks';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card/Card';
import { Button } from '@/components/ui/Button/Button';
import { DataTable, Column } from '@/components/ui/DataTable/DataTable';
import { StatusBadge } from '@/components/StatusBadge/StatusBadge';
import type { Transaction } from '@/types';
import styles from './TempIdLookup.module.css';

export const TempIdLookup: React.FC = () => {
  const { tempId } = useParams<{ tempId: string }>();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data, isLoading, error } = useTempIdTransactions(tempId || '', page, limit);

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
        <span className={`${styles.type} ${styles[value.toLowerCase()]}`}>
          {value}
        </span>
      ),
    },
    {
      key: 'amount',
      header: 'Amount',
      render: (value, row) => (
        <span className={styles.amount}>
          {row.currency} {value}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (value) => <StatusBadge status={value as any} />,
    },
    {
      key: 'requestedAt',
      header: 'Requested',
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
              state: { tempId, isTempLookup: true }
            });
          }}
        >
          <Eye size={16} />
          View
        </Button>
      ),
    },
  ];

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <Button variant="ghost" onClick={() => navigate('/')}>
            <ArrowLeft size={20} />
            Back to Home
          </Button>
        </div>
        <Card variant="elevated" className={styles.errorCard}>
          <CardContent>
            <div className={styles.errorContent}>
              <AlertCircle size={48} className={styles.errorIcon} />
              <h2>No Transactions Found</h2>
              <p>No transactions were found for temp ID: <strong>{tempId}</strong></p>
              <p>Please check your temp ID and try again.</p>
              <div className={styles.errorActions}>
                <Button onClick={() => navigate('/')}>
                  Back to Home
                </Button>
                <Button variant="outline" onClick={() => navigate('/player/register')}>
                  Create Account
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Button variant="ghost" onClick={() => navigate('/')}>
          <ArrowLeft size={20} />
          Back to Home
        </Button>
        <div className={styles.headerInfo}>
          <h1 className={styles.title}>Transaction Lookup</h1>
          <p className={styles.subtitle}>
            Transactions for Temp ID: <span className={styles.tempId}>{tempId}</span>
          </p>
        </div>
      </div>

      {data?.playerInfo && (
        <Card variant="bordered" className={styles.playerInfoCard}>
          <CardContent>
            <div className={styles.playerInfo}>
              <div className={styles.playerDetails}>
                <h3>Player Information</h3>
                <p><strong>Username:</strong> {data.playerInfo.telegramUsername}</p>
                <p><strong>Status:</strong> 
                  <span className={`${styles.status} ${data.playerInfo.isTemporary ? styles.temporary : styles.registered}`}>
                    {data.playerInfo.isTemporary ? 'Temporary Account' : 'Registered Account'}
                  </span>
                </p>
              </div>
              <div className={styles.playerActions}>
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/player/register')}
                >
                  Create Full Account
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card variant="bordered">
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <p className={styles.cardSubtitle}>
            {data?.pagination?.total || 0} transactions found
          </p>
        </CardHeader>
        <CardContent padding="none">
          <DataTable
            data={data?.transactions || []}
            columns={columns}
            isLoading={isLoading}
            emptyMessage="No transactions found for this temp ID"
            pagination={
              data?.pagination
                ? {
                    currentPage: data.pagination.page,
                    totalPages: data.pagination.pages,
                    onPageChange: setPage,
                  }
                : undefined
            }
            onRowClick={(row) =>
              navigate(`/player/transaction/${row.id}`, {
                state: { tempId, isTempLookup: true }
              })
            }
          />
        </CardContent>
      </Card>

      <div className={styles.info}>
        <div className={styles.infoCard}>
          <Search size={20} />
          <div>
            <h4>Temp ID Lookup</h4>
            <p>You're viewing transactions using a temporary ID. To access full features, consider creating a registered account.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
