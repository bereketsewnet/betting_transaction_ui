import React from 'react';
import { Users, TrendingUp, Clock, CheckCircle } from 'lucide-react';
import { useAdminAgents } from '@/api/hooks';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card/Card';
import { DataTable, Column } from '@/components/ui/DataTable/DataTable';
import type { AgentStats } from '@/types';
import styles from './Agents.module.css';

export const Agents: React.FC = () => {
  const { data: agentsData, isLoading } = useAdminAgents();

  const columns: Column<AgentStats>[] = [
    {
      key: 'id',
      header: 'ID',
      render: (value) => <span>#{value}</span>,
    },
    {
      key: 'username',
      header: 'Username',
      render: (value) => <span className={styles.username}>{value}</span>,
    },
    {
      key: 'displayName',
      header: 'Display Name',
    },
    {
      key: 'email',
      header: 'Email',
      render: (value) => <span className={styles.email}>{value}</span>,
    },
    {
      key: 'stats-total',
      header: 'Total Tasks',
      render: (_value, row) => {
        const stats = row.stats;
        return <span className={styles.stat}>{stats?.total || 0}</span>;
      },
    },
    {
      key: 'stats-pending',
      header: 'Pending',
      render: (_value, row) => {
        const stats = row.stats;
        return <span className={styles.statPending}>{stats?.pending || 0}</span>;
      },
    },
    {
      key: 'stats-processing',
      header: 'Processing',
      render: (_value, row) => {
        const stats = row.stats;
        return <span className={styles.statProcessing}>{stats?.processing || 0}</span>;
      },
    },
    {
      key: 'stats-success',
      header: 'Success',
      render: (_value, row) => {
        const stats = row.stats;
        return <span className={styles.statSuccess}>{stats?.success || 0}</span>;
      },
    },
    {
      key: 'stats-failed',
      header: 'Failed',
      render: (_value, row) => {
        const stats = row.stats;
        return <span className={styles.statFailed}>{stats?.failed || 0}</span>;
      },
    },
    {
      key: 'stats-rate',
      header: 'Success Rate',
      render: (_value, row) => {
        const stats = row.stats;
        if (!stats || stats.total === 0) return <span>-</span>;
        
        const successRate = ((stats.success / stats.total) * 100).toFixed(1);
        return <span className={styles.successRate}>{successRate}%</span>;
      },
    },
  ];

  const totalStats = agentsData?.agents?.reduce(
    (acc, agent) => ({
      total: acc.total + (agent.stats?.total || 0),
      pending: acc.pending + (agent.stats?.pending || 0),
      processing: acc.processing + (agent.stats?.processing || 0),
      success: acc.success + (agent.stats?.success || 0),
      failed: acc.failed + (agent.stats?.failed || 0),
    }),
    { total: 0, pending: 0, processing: 0, success: 0, failed: 0 }
  );

  return (
    <div className={styles.container}>
      <div className={styles.statsGrid}>
        <Card>
          <CardContent padding="md">
            <div className={styles.statCard}>
              <Users size={32} className={styles.iconPrimary} />
              <div className={styles.statInfo}>
                <span className={styles.statLabel}>Total Agents</span>
                <span className={styles.statValue}>{agentsData?.agents?.length || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent padding="md">
            <div className={styles.statCard}>
              <TrendingUp size={32} className={styles.iconPrimary} />
              <div className={styles.statInfo}>
                <span className={styles.statLabel}>Total Tasks</span>
                <span className={styles.statValue}>{totalStats?.total || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent padding="md">
            <div className={styles.statCard}>
              <Clock size={32} className={styles.iconWarning} />
              <div className={styles.statInfo}>
                <span className={styles.statLabel}>Pending Tasks</span>
                <span className={styles.statValue}>{totalStats?.pending || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent padding="md">
            <div className={styles.statCard}>
              <CheckCircle size={32} className={styles.iconSuccess} />
              <div className={styles.statInfo}>
                <span className={styles.statLabel}>Completed Tasks</span>
                <span className={styles.statValue}>{totalStats?.success || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Agents with Statistics</CardTitle>
        </CardHeader>
        <CardContent padding="none">
          {isLoading ? (
            <div className={styles.loading}>Loading...</div>
          ) : (
            <DataTable
              data={agentsData?.agents || []}
              columns={columns}
              pagination={{
                currentPage: 1,
                totalPages: 1,
                totalItems: agentsData?.agents?.length || 0,
                pageSize: agentsData?.agents?.length || 0,
                onPageChange: () => {},
              }}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

