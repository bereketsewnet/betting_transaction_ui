import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Eye, DollarSign, TrendingUp, Clock, CheckCircle, Users } from 'lucide-react';
import { useAdminTransactions, useAdminUsers } from '@/api/hooks';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card/Card';
import { Button } from '@/components/ui/Button/Button';
import { Select } from '@/components/ui/Select/Select';
import { DataTable, Column } from '@/components/ui/DataTable/DataTable';
import { StatusBadge } from '@/components/StatusBadge/StatusBadge';
import type { Transaction, TransactionStatus, TransactionType } from '@/types';
import styles from './AdminDashboard.module.css';

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<TransactionStatus | ''>('');
  const [typeFilter, setTypeFilter] = useState<TransactionType | ''>('');

  // Fetch ALL transactions for both display and statistics (no pagination)
  const { data: allTransactionsData, isLoading } = useAdminTransactions(
    1,
    undefined, // No limit - get all transactions by default
    {}
  );

  // Filter transactions for display based on selected filters
  const filteredTransactions = React.useMemo(() => {
    if (!allTransactionsData?.data) return [];
    
    let filtered = allTransactionsData.data;
    
    if (statusFilter) {
      filtered = filtered.filter(t => t.status === statusFilter);
    }
    
    if (typeFilter) {
      filtered = filtered.filter(t => t.type === typeFilter);
    }
    
    return filtered;
  }, [allTransactionsData?.data, statusFilter, typeFilter]);

  const { data: agentsData } = useAdminUsers(
    1,
    undefined, // No limit - get all users
    { role: 8, isActive: true } // Filter for active agents (role 8)
  );

  // Calculate stats from ALL transactions
  const stats = React.useMemo(() => {
    const transactions = allTransactionsData?.data || [];
    const users = agentsData?.users || []; // Use users instead of agents
    
    // Count transactions by status
    const pending = transactions.filter((t) => t.status === 'Pending' || t.status === 'PENDING').length;
    const inProgress = transactions.filter((t) => t.status === 'In Progress' || t.status === 'IN_PROGRESS').length;
    const success = transactions.filter((t) => t.status === 'Success' || t.status === 'SUCCESS').length;
    const failed = transactions.filter((t) => t.status === 'Failed' || t.status === 'FAILED').length;
    
    // Calculate success rate from completed transactions (success + failed)
    const completedTransactions = success + failed;
    const successRate = completedTransactions > 0 ? (success / completedTransactions) * 100 : 0;
    
    // Count active agents (users with role 8 and isActive true)
    const activeAgents = users.length; // Already filtered by role=8 and isActive=true

    return {
      pending,
      inProgress,
      success,
      failed,
      successRate,
      totalAgents: activeAgents,
    };
  }, [allTransactionsData, agentsData]);

  // Debug logging
  console.log('All transactions for stats:', allTransactionsData?.data?.length || 0);
  console.log('Agents data:', agentsData?.users?.length || 0);
  console.log('Success rate calculation:', {
    success: stats.success,
    failed: stats.failed,
    completed: stats.success + stats.failed,
    successRate: stats.successRate
  });
  console.log('Calculated stats:', stats);

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
      key: 'bettingSite',
      header: 'Betting Site',
      render: (value, row) => {
        if (row.bettingSite) {
          return (
            <div className={styles.bettingSiteInfo}>
              <div className={styles.siteName}>{row.bettingSite.name}</div>
              <div className={styles.playerId}>@{row.playerSiteId || 'Unknown'}</div>
            </div>
          );
        }
        return <span className={styles.noSite}>No site</span>;
      },
    },
    {
      key: 'requestedAt',
      header: 'Requested',
      render: (value) => format(new Date(value), 'MMM dd, HH:mm'),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (value, row) => (
        <Button
          size="sm"
          variant="outline"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/admin/transaction/${row.id}`, {
              state: { transaction: row },
            });
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
            data={filteredTransactions}
            columns={columns}
            isLoading={isLoading}
            emptyMessage="No transactions found"
            onRowClick={(row) =>
              navigate(`/admin/transaction/${row.id}`, {
                state: { transaction: row },
              })
            }
          />
        </CardContent>
      </Card>
    </div>
  );
};

