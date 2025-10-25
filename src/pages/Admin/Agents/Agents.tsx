import React from 'react';
import { Users, TrendingUp, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useAdminAgents } from '@/api/hooks';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card/Card';
import { DataTable, Column } from '@/components/ui/DataTable/DataTable';
import styles from './Agents.module.css';

// Agent interface based on EXAMPLES.md line 894-922
interface Agent {
  id: number;
  username: string;
  displayName: string;
  isActive: boolean;
  stats: {
    totalAssigned: number;
    pending: number;
    inProgress: number;
    completed: number;
    failed: number;
    averageRating: number;
  };
}

export const Agents: React.FC = () => {
  const { data: agentsData, isLoading, error } = useAdminAgents();

  // Debug logging
  console.log('Agents Data:', agentsData);
  console.log('Loading:', isLoading);
  console.log('Error:', error);

  const columns: Column<Agent>[] = [
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
      key: 'isActive',
      header: 'Status',
      render: (value) => (
        <span className={value ? styles.statusActive : styles.statusInactive}>
          {value ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      key: 'totalAssigned',
      header: 'Total Assigned',
      render: (_value, row) => {
        return <span className={styles.stat}>{row.stats?.totalAssigned || 0}</span>;
      },
    },
    {
      key: 'pending',
      header: 'Pending',
      render: (_value, row) => {
        return <span className={styles.statPending}>{row.stats?.pending || 0}</span>;
      },
    },
    {
      key: 'inProgress',
      header: 'In Progress',
      render: (_value, row) => {
        return <span className={styles.statProcessing}>{row.stats?.inProgress || 0}</span>;
      },
    },
    {
      key: 'completed',
      header: 'Completed',
      render: (_value, row) => {
        return <span className={styles.statSuccess}>{row.stats?.completed || 0}</span>;
      },
    },
    {
      key: 'failed',
      header: 'Failed',
      render: (_value, row) => {
        return <span className={styles.statFailed}>{row.stats?.failed || 0}</span>;
      },
    },
    {
      key: 'averageRating',
      header: 'Avg Rating',
      render: (_value, row) => {
        const rating = row.stats?.averageRating || 0;
        return <span className={styles.rating}>{rating.toFixed(1)} ⭐</span>;
      },
    },
  ];

  const totalStats = agentsData?.agents?.reduce(
    (acc, agent) => ({
      totalAssigned: acc.totalAssigned + (agent.stats?.totalAssigned || 0),
      pending: acc.pending + (agent.stats?.pending || 0),
      inProgress: acc.inProgress + (agent.stats?.inProgress || 0),
      completed: acc.completed + (agent.stats?.completed || 0),
      failed: acc.failed + (agent.stats?.failed || 0),
    }),
    { totalAssigned: 0, pending: 0, inProgress: 0, completed: 0, failed: 0 }
  );

  if (error) {
    return (
      <div className={styles.container}>
        <Card>
          <CardContent>
            <div className={styles.error}>
              <h3>Error Loading Agents</h3>
              <p>{error.message || 'Failed to load agents data'}</p>
              <small>Check console for more details</small>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Agents Management</h1>
        <p className={styles.subtitle}>View all agents and their performance statistics</p>
      </div>

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
                <span className={styles.statLabel}>Total Assigned</span>
                <span className={styles.statValue}>{totalStats?.totalAssigned || 0}</span>
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
                <span className={styles.statValue}>{totalStats?.completed || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent padding="md">
            <div className={styles.statCard}>
              <XCircle size={32} className={styles.iconError} />
              <div className={styles.statInfo}>
                <span className={styles.statLabel}>Failed Tasks</span>
                <span className={styles.statValue}>{totalStats?.failed || 0}</span>
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
            <div className={styles.loading}>Loading agents...</div>
          ) : !agentsData?.agents || agentsData.agents.length === 0 ? (
            <div className={styles.empty}>
              <p>No agents found</p>
              <small>Create agent users in the User Management section</small>
            </div>
          ) : (
            <DataTable
              data={agentsData.agents}
              columns={columns}
              emptyMessage="No agents found"
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

