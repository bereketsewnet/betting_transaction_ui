import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Eye, DollarSign, TrendingUp, Clock, CheckCircle, Users } from 'lucide-react';
import { useAdminTransactions, useAdminAgents } from '@/api/hooks';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card/Card';
import { Button } from '@/components/ui/Button/Button';
import { Select } from '@/components/ui/Select/Select';
import { DataTable, Column } from '@/components/ui/DataTable/DataTable';
import { StatusBadge } from '@/components/StatusBadge/StatusBadge';
import type { Transaction, TransactionStatus, TransactionType } from '@/types';
import styles from './AdminDashboard.module.css';

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<TransactionStatus | ''>('');
  const [typeFilter, setTypeFilter] = useState<TransactionType | ''>('');
  const limit = 20;

  const { data: transactionsData, isLoading } = useAdminTransactions(
    page,
    limit,
    {
      ...(statusFilter && { status: statusFilter }),
      ...(typeFilter && { type: typeFilter }),
    }
  );

  const { data: agentsData } = useAdminAgents();

  // Calculate stats from transactions
  const stats = React.useMemo(() => {
    const transactions = transactionsData?.data || [];
    const pending = transactions.filter((t) => t.status === 'PENDING').length;
    const inProgress = transactions.filter((t) => t.status === 'IN_PROGRESS').length;
    const success = transactions.filter((t) => t.status === 'SUCCESS').length;
    const total = transactions.length;
    const successRate = total > 0 ? (success / total) * 100 : 0;

    return {
      pending,
      inProgress,
      success,
      successRate,
      totalAgents: agentsData?.agents.length || 0,
    };
  }, [transactionsData, agentsData]);

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
      key: 'assignedAgent',
      header: 'Agent',
      render: (value) => value?.displayName || '-',
    },
    {
      key: 'requestedAt',
      header: 'Requested',
      render: (value) => format(new Date(value), 'MMM dd, HH:mm'),
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
            navigate(`/admin/transaction/${row.id}`);
          }}
        >
          <Eye size={16} />
          View
        </Button>
      ),
    },
  ];

  const statCards = [
    {
      title: 'Pending',
      value: stats.pending,
      icon: <Clock size={24} />,
      color: 'var(--color-warning)',
    },
    {
      title: 'In Progress',
      value: stats.inProgress,
      icon: <TrendingUp size={24} />,
      color: 'var(--color-info)',
    },
    {
      title: 'Completed',
      value: stats.success,
      icon: <CheckCircle size={24} />,
      color: 'var(--color-success)',
    },
    {
      title: 'Success Rate',
      value: `${stats.successRate.toFixed(1)}%`,
      icon: <DollarSign size={24} />,
      color: 'var(--color-primary)',
    },
    {
      title: 'Active Agents',
      value: stats.totalAgents,
      icon: <Users size={24} />,
      color: 'var(--color-info)',
    },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Admin Dashboard</h1>
          <p className={styles.subtitle}>Manage all transactions and agents</p>
        </div>
        <div className={styles.headerActions}>
          <Button variant="outline" onClick={() => navigate('/admin/agents')}>
            Manage Agents
          </Button>
          <Button variant="outline" onClick={() => navigate('/admin/config')}>
            Configuration
          </Button>
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

      {/* Transactions Table */}
      <Card variant="bordered">
        <CardHeader>
          <div className={styles.tableHeader}>
            <CardTitle>All Transactions</CardTitle>
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
              <Select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as TransactionType | '')}
                options={[
                  { value: '', label: 'All Types' },
                  { value: 'DEPOSIT', label: 'Deposit' },
                  { value: 'WITHDRAW', label: 'Withdrawal' },
                ]}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent padding="none">
          <DataTable
            data={transactionsData?.data || []}
            columns={columns}
            isLoading={isLoading}
            emptyMessage="No transactions found"
            pagination={
              transactionsData?.pagination
                ? {
                    currentPage: transactionsData.pagination.page,
                    totalPages: transactionsData.pagination.totalPages,
                    onPageChange: setPage,
                  }
                : undefined
            }
            onRowClick={(row) => navigate(`/admin/transaction/${row.id}`)}
          />
        </CardContent>
      </Card>
    </div>
  );
};

