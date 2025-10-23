import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Eye, TrendingUp, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { useAgentTasks, useAgentStats } from '@/api/hooks';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card/Card';
import { Button } from '@/components/ui/Button/Button';
import { Select } from '@/components/ui/Select/Select';
import { DataTable, Column } from '@/components/ui/DataTable/DataTable';
import { StatusBadge } from '@/components/StatusBadge/StatusBadge';
import type { Transaction, TransactionStatus } from '@/types';
import styles from './AgentDashboard.module.css';

export const AgentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<TransactionStatus | ''>('');
  const limit = 10;

  const { data: stats } = useAgentStats();
  const { data: tasksData, isLoading } = useAgentTasks(
    page,
    limit,
    statusFilter ? { status: statusFilter } : undefined
  );

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
      key: 'requestedAt',
      header: 'Requested',
      render: (value) => format(new Date(value), 'MMM dd, yyyy HH:mm'),
    },
    {
      key: 'id',
      header: 'Actions',
      render: (value, row) => (
        <Button
          size="sm"
          variant="outline"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/agent/task/${row.id}`);
          }}
        >
          <Eye size={16} />
          Process
        </Button>
      ),
    },
  ];

  const statCards = [
    {
      title: 'Total Assigned',
      value: stats?.totalAssigned || 0,
      icon: <TrendingUp size={24} />,
      color: 'var(--color-info)',
    },
    {
      title: 'Pending',
      value: stats?.pending || 0,
      icon: <Clock size={24} />,
      color: 'var(--color-warning)',
    },
    {
      title: 'Completed',
      value: stats?.completed || 0,
      icon: <CheckCircle size={24} />,
      color: 'var(--color-success)',
    },
    {
      title: 'Success Rate',
      value: `${(stats?.successRate || 0).toFixed(1)}%`,
      icon: <AlertCircle size={24} />,
      color: 'var(--color-primary)',
    },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Agent Dashboard</h1>
          <p className={styles.subtitle}>Manage your assigned tasks and transactions</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className={styles.statsGrid}>
        {statCards.map((stat, index) => (
          <Card key={index} variant="bordered">
            <CardContent>
              <div className={styles.statCard}>
                <div className={styles.statIcon} style={{ color: stat.color }}>
                  {stat.icon}
                </div>
                <div className={styles.statContent}>
                  <p className={styles.statTitle}>{stat.title}</p>
                  <p className={styles.statValue}>{stat.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tasks Table */}
      <Card variant="bordered">
        <CardHeader>
          <div className={styles.tableHeader}>
            <CardTitle>Assigned Tasks</CardTitle>
            <div className={styles.filters}>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as TransactionStatus | '')}
                options={[
                  { value: '', label: 'All Status' },
                  { value: 'PENDING', label: 'Pending' },
                  { value: 'IN_PROGRESS', label: 'In Progress' },
                  { value: 'SUCCESS', label: 'Success' },
                  { value: 'FAILED', label: 'Failed' },
                ]}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent padding="none">
          <DataTable
            data={tasksData?.data || []}
            columns={columns}
            isLoading={isLoading}
            emptyMessage="No tasks assigned yet"
            pagination={
              tasksData?.pagination
                ? {
                    currentPage: tasksData.pagination.page,
                    totalPages: tasksData.pagination.totalPages,
                    onPageChange: setPage,
                  }
                : undefined
            }
            onRowClick={(row) => navigate(`/agent/task/${row.id}`)}
          />
        </CardContent>
      </Card>
    </div>
  );
};

