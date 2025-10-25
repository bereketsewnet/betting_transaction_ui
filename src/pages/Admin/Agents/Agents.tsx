import React from 'react';
import { Users, TrendingUp, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useAdminUsers, useAdminTransactions } from '@/api/hooks';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card/Card';
import { DataTable, Column } from '@/components/ui/DataTable/DataTable';
import styles from './Agents.module.css';

// Agent interface based on User data structure
interface AgentWithStats {
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
  // Get all active agents (role 8)
  const { data: agentsData, isLoading: agentsLoading, error: agentsError } = useAdminUsers(
    1,
    undefined, // No limit - get all users
    { role: 8, isActive: true } // Filter for active agents (role 8)
  );

  // Get all transactions to calculate agent statistics
  const { data: transactionsData, isLoading: transactionsLoading } = useAdminTransactions(
    1,
    undefined, // No limit - get all transactions
    {}
  );

  const isLoading = agentsLoading || transactionsLoading;
  const error = agentsError;

  // Debug logging
  console.log('Agents Data:', agentsData);
  console.log('Transactions Data:', transactionsData);
  console.log('Loading:', isLoading);
  console.log('Error:', error);

  // Calculate agent statistics from transaction data
  const agentsWithStats: AgentWithStats[] = React.useMemo(() => {
    if (!agentsData?.users || !transactionsData?.data) return [];

    return agentsData.users.map(agent => {
      const agentTransactions = transactionsData.data.filter(t => 
        t.assignedAgent?.id === agent.id
      );

      const stats = {
        totalAssigned: agentTransactions.length,
        pending: agentTransactions.filter(t => t.status === 'Pending' || t.status === 'PENDING').length,
        inProgress: agentTransactions.filter(t => t.status === 'In Progress' || t.status === 'IN_PROGRESS').length,
        completed: agentTransactions.filter(t => t.status === 'Success' || t.status === 'SUCCESS').length,
        failed: agentTransactions.filter(t => t.status === 'Failed' || t.status === 'FAILED').length,
        averageRating: 0, // TODO: Calculate from transaction ratings if available
      };

      return {
        id: agent.id,
        username: agent.username,
        displayName: agent.displayName || agent.username,
        isActive: agent.isActive,
        stats,
      };
    });
  }, [agentsData?.users, transactionsData?.data]);

  const columns: Column<AgentWithStats>[] = [
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

  const totalStats = agentsWithStats.reduce(
    (acc, agent) => ({
      totalAssigned: acc.totalAssigned + agent.stats.totalAssigned,
      pending: acc.pending + agent.stats.pending,
      inProgress: acc.inProgress + agent.stats.inProgress,
      completed: acc.completed + agent.stats.completed,
      failed: acc.failed + agent.stats.failed,
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
                <span className={styles.statValue}>{agentsWithStats.length}</span>
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
          ) : !agentsWithStats || agentsWithStats.length === 0 ? (
            <div className={styles.empty}>
              <p>No agents found</p>
              <small>Create agent users in the User Management section</small>
            </div>
          ) : (
            <DataTable
              data={agentsWithStats}
              columns={columns}
              emptyMessage="No agents found"
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

