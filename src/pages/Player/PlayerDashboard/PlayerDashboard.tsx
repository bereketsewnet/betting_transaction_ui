import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlayerTransactions } from '@/api/hooks';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card/Card';
import { Button } from '@/components/ui/Button/Button';
import { DataTable } from '@/components/ui/DataTable/DataTable';
import { 
  LayoutDashboard, 
  Plus, 
  TrendingUp, 
  TrendingDown, 
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  LogOut,
  User,
  Database
} from 'lucide-react';
import styles from './PlayerDashboard.module.css';

export const PlayerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [playerUuid, setPlayerUuid] = useState<string | null>(null);
  const limit = 10;

  useEffect(() => {
    const storedPlayerUuid = localStorage.getItem('playerUuid');
    const pendingLookup = localStorage.getItem('pendingPlayerLookup');
    const playerUser = localStorage.getItem('playerUser');
    
    if (!storedPlayerUuid && !pendingLookup) {
      navigate('/player/register');
      return;
    }
    
    if (pendingLookup && playerUser) {
      // Try to resolve playerUuid from the user account
      console.log('🔄 Dashboard: Attempting to resolve playerUuid from pending lookup');
      const user = JSON.parse(playerUser);
      const accessToken = localStorage.getItem('playerAccessToken');
      
      if (accessToken && user.id) {
        // Try to fetch player profile by user ID
        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';
        fetch(`${apiBaseUrl}/players/user/${user.id}`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        })
        .then(res => res.ok ? res.json() : null)
        .then(playerData => {
          if (playerData?.player?.playerUuid || playerData?.playerUuid) {
            const resolvedUuid = playerData.player?.playerUuid || playerData.playerUuid;
            localStorage.setItem('playerUuid', resolvedUuid);
            localStorage.removeItem('pendingPlayerLookup');
            setPlayerUuid(resolvedUuid);
            console.log('✅ Successfully resolved playerUuid:', resolvedUuid);
          }
        })
        .catch(err => console.error('Failed to resolve playerUuid:', err));
      }
    } else if (storedPlayerUuid) {
      setPlayerUuid(storedPlayerUuid);
    }
  }, [navigate]);

  const { data, isLoading } = usePlayerTransactions(
    playerUuid || '',
    page,
    limit
  );

  const handleLogout = () => {
    localStorage.removeItem('playerUuid');
    navigate('/');
  };

  // Calculate statistics - counts only, no money amounts
  const stats = React.useMemo(() => {
    if (!data?.transactions) {
      return {
        totalTransactions: 0,
        depositCount: 0,
        withdrawalCount: 0,
        pendingCount: 0,
        completedCount: 0,
        rejectedCount: 0,
      };
    }

    return data.transactions.reduce(
      (acc, transaction) => {
        acc.totalTransactions++;
        
        if (transaction.type === 'DEPOSIT') {
          acc.depositCount++;
        } else {
          acc.withdrawalCount++;
        }

        if (transaction.status === 'PENDING') acc.pendingCount++;
        if (transaction.status === 'COMPLETED') acc.completedCount++;
        if (transaction.status === 'REJECTED') acc.rejectedCount++;

        return acc;
      },
      {
        totalTransactions: 0,
        depositCount: 0,
        withdrawalCount: 0,
        pendingCount: 0,
        completedCount: 0,
        rejectedCount: 0,
      }
    );
  }, [data]);

  const columns = [
    {
      key: 'id' as const,
      header: 'ID',
      render: (value: number) => `#${value}`,
    },
    {
      key: 'type' as const,
      header: 'Type',
      render: (value: string) => (
        <span className={`${styles.badge} ${styles[value.toLowerCase()]}`}>
          {value}
        </span>
      ),
    },
    {
      key: 'amount' as const,
      header: 'Amount',
      render: (value: number | string) => {
        const amount = typeof value === 'string' ? parseFloat(value) : value;
        return `$${amount.toFixed(2)}`;
      },
    },
    {
      key: 'status' as const,
      header: 'Status',
      render: (value: string) => (
        <span className={`${styles.statusBadge} ${styles[value.toLowerCase()]}`}>
          {value === 'PENDING' && <Clock size={14} />}
          {value === 'COMPLETED' && <CheckCircle size={14} />}
          {value === 'REJECTED' && <XCircle size={14} />}
          {value}
        </span>
      ),
    },
    {
      key: 'createdAt' as const,
      header: 'Date',
      render: (value: string) => new Date(value).toLocaleDateString(),
    },
  ];

  if (!playerUuid) {
    return null;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerLeft}>
            <LayoutDashboard size={32} className={styles.headerIcon} />
            <div>
              <h1 className={styles.title}>Player Dashboard</h1>
              <p className={styles.subtitle}>Track your transactions and account activity</p>
            </div>
          </div>
          <div className={styles.headerActions}>
            <Button
              variant="outline"
              onClick={() => navigate('/player/profile')}
              className={styles.profileButton}
            >
              <User size={18} />
              Profile
            </Button>
            <Button
              variant="outline"
              onClick={handleLogout}
              className={styles.logoutButton}
            >
              <LogOut size={18} />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Statistics Cards - Counts Only */}
      <div className={styles.statsGrid}>
        <Card className={styles.statCard}>
          <CardContent className={styles.statContent}>
            <div className={styles.statIcon} style={{ background: 'linear-gradient(135deg, #00d4ff 0%, #0ea5e9 100%)' }}>
              <Database size={24} />
            </div>
            <div className={styles.statInfo}>
              <p className={styles.statLabel}>Total Transactions</p>
              <h3 className={styles.statValue}>{stats.totalTransactions}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className={styles.statCard}>
          <CardContent className={styles.statContent}>
            <div className={styles.statIcon} style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
              <TrendingUp size={24} />
            </div>
            <div className={styles.statInfo}>
              <p className={styles.statLabel}>Deposits</p>
              <h3 className={styles.statValue}>{stats.depositCount}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className={styles.statCard}>
          <CardContent className={styles.statContent}>
            <div className={styles.statIcon} style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' }}>
              <TrendingDown size={24} />
            </div>
            <div className={styles.statInfo}>
              <p className={styles.statLabel}>Withdrawals</p>
              <h3 className={styles.statValue}>{stats.withdrawalCount}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className={styles.statCard}>
          <CardContent className={styles.statContent}>
            <div className={styles.statIcon} style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}>
              <Clock size={24} />
            </div>
            <div className={styles.statInfo}>
              <p className={styles.statLabel}>Pending</p>
              <h3 className={styles.statValue}>{stats.pendingCount}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className={styles.statCard}>
          <CardContent className={styles.statContent}>
            <div className={styles.statIcon} style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
              <CheckCircle size={24} />
            </div>
            <div className={styles.statInfo}>
              <p className={styles.statLabel}>Completed</p>
              <h3 className={styles.statValue}>{stats.completedCount}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className={styles.statCard}>
          <CardContent className={styles.statContent}>
            <div className={styles.statIcon} style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' }}>
              <XCircle size={24} />
            </div>
            <div className={styles.statInfo}>
              <p className={styles.statLabel}>Rejected</p>
              <h3 className={styles.statValue}>{stats.rejectedCount}</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* All Transactions */}
      <Card className={styles.transactionsCard}>
        <CardHeader>
          <div className={styles.cardHeaderWithButton}>
            <CardTitle>All Transactions</CardTitle>
            <Button
              onClick={() => navigate('/player/new-transaction')}
              className={styles.addButton}
            >
              <Plus size={20} />
              Add Transaction
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className={styles.loading}>Loading transactions...</div>
          ) : !data?.transactions || data.transactions.length === 0 ? (
            <div className={styles.empty}>
              <AlertCircle size={48} className={styles.emptyIcon} />
              <h3>No Transactions Yet</h3>
              <p>Start by creating your first transaction</p>
              <Button
                onClick={() => navigate('/player/new-transaction')}
                style={{ marginTop: '1rem' }}
              >
                <Plus size={20} />
                Create Transaction
              </Button>
            </div>
          ) : (
            <DataTable
              data={data.transactions}
              columns={columns}
              pagination={
                data.pagination
                  ? {
                      currentPage: data.pagination.page,
                      totalPages: data.pagination.pages || data.pagination.totalPages,
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
          )}
        </CardContent>
      </Card>

      {/* Player Info */}
      <Card className={styles.infoCard}>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className={styles.infoItem}>
            <strong>Player UUID:</strong>
            <code className={styles.uuid}>{playerUuid}</code>
          </div>
          <p className={styles.infoText}>
            Save your Player UUID to access your account and transactions.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

