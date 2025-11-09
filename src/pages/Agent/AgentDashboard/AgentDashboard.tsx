import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { Eye, TrendingUp, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAgentTasks, useAgentStats, useProcessTransaction, useBettingSites } from '@/api/hooks';
import { useAuth } from '@/auth/AuthContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card/Card';
import { Button } from '@/components/ui/Button/Button';
import { Select } from '@/components/ui/Select/Select';
import { Input } from '@/components/ui/Input/Input';
import { Modal, ModalFooter } from '@/components/ui/Modal/Modal';
import { DataTable, Column } from '@/components/ui/DataTable/DataTable';
import { StatusBadge } from '@/components/StatusBadge/StatusBadge';
import type { Transaction, TransactionStatus } from '@/types';
import styles from './AgentDashboard.module.css';

const statusUpdateSchema = z.object({
  status: z.enum(['PENDING', 'IN_PROGRESS', 'SUCCESS', 'FAILED']),
  agentNotes: z.string().min(1, 'Description is required'),
});

type StatusUpdateFormData = z.infer<typeof statusUpdateSchema>;

export const AgentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<TransactionStatus | ''>('');
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const limit = 10;

  // Debug logging for user context
  console.log('AgentDashboard Debug:');
  console.log('- Current user:', user);
  console.log('- User ID:', user?.id);
  console.log('- User role:', user?.role);
  console.log('- Is authenticated:', isAuthenticated);

  const { data: statsResponse, error: _statsError, isLoading: _statsLoading } = useAgentStats(user?.id || 0);
  const { data: tasksData, isLoading: tasksLoading, error: tasksError, refetch: refetchTasks } = useAgentTasks(
    user?.id || 0,
    page,
    limit,
    statusFilter ? { status: statusFilter } : undefined
  );
  const { data: bettingSitesData } = useBettingSites();
  const processTransaction = useProcessTransaction();

  // Create betting site ID to name mapping
  const bettingSiteMap = React.useMemo(() => {
    if (!bettingSitesData?.bettingSites) return {};
    return bettingSitesData.bettingSites.reduce((acc, site) => {
      acc[site.id] = site.name;
      return acc;
    }, {} as Record<number, string>);
  }, [bettingSitesData]);

  // Debug logging for API responses
  console.log('API Debug:');
  console.log('- Stats response:', statsResponse);
  console.log('- Tasks data:', tasksData);
  console.log('- Tasks error:', tasksError);
  console.log('- Sample task:', tasksData?.data?.[0]);
  console.log('- Sample task betting site:', tasksData?.data?.[0]?.bettingSite);
  console.log('- Sample task betting site ID:', tasksData?.data?.[0]?.bettingSiteId);
  console.log('- Sample task player site ID:', tasksData?.data?.[0]?.playerSiteId);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
  } = useForm<StatusUpdateFormData>({
    resolver: zodResolver(statusUpdateSchema),
    mode: 'onSubmit',
    defaultValues: {
      status: 'PENDING',
      agentNotes: '',
    },
  });

  // Extract stats from the response
  const stats = statsResponse?.stats;

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
      key: 'player',
      header: 'Player',
      render: (_value, row) => (
        <div>
          <div className={styles.playerName}>
            {row.player?.telegramUsername || 'Unknown'}
          </div>
          <div className={styles.playerId}>
            {row.player?.playerUuid?.slice(0, 8)}...
          </div>
        </div>
      ),
    },
    {
      key: 'bettingSite',
      header: 'Betting Site',
      render: (_value, row) => (
        <div className={styles.bettingSiteInfo}>
          {row.bettingSite ? (
            <>
              <div className={styles.siteName}>{row.bettingSite.name}</div>
              {row.playerSiteId && (
                <div className={styles.playerId}>{row.playerSiteId}</div>
              )}
            </>
          ) : row.bettingSiteId && bettingSiteMap[row.bettingSiteId] ? (
            <>
              <div className={styles.siteName}>{bettingSiteMap[row.bettingSiteId]}</div>
              {row.playerSiteId && (
                <div className={styles.playerId}>{row.playerSiteId}</div>
              )}
            </>
          ) : row.bettingSiteId ? (
            <>
              <div className={styles.siteName}>Site ID: {row.bettingSiteId}</div>
              {row.playerSiteId && (
                <div className={styles.playerId}>{row.playerSiteId}</div>
              )}
            </>
          ) : (
            <span className={styles.noSite}>No site</span>
          )}
        </div>
      ),
    },
    {
      key: 'evidence',
      header: 'Evidence',
      render: (_value, row) => (
        <div className={styles.evidence}>
          {row.screenshotUrl ? (
            <span className={styles.hasEvidence}>📎 Screenshot</span>
          ) : (
            <span className={styles.noEvidence}>No evidence</span>
          )}
        </div>
      ),
    },
    {
      key: 'requestedAt',
      header: 'Requested',
      render: (value) => format(new Date(value), 'MMM dd, HH:mm'),
    },
    {
      key: 'id',
      header: 'Actions',
      render: (_value, row) => (
        <div className={styles.actions}>
          <Button
            size="sm"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/agent/task/${row.id}`, {
                state: { transaction: row }
              });
            }}
          >
            <Eye size={16} />
            View
          </Button>
          <Button
            size="sm"
            variant="primary"
            onClick={(e) => {
              e.stopPropagation();
              openStatusModal(row);
            }}
          >
            Update Status
          </Button>
        </div>
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
      title: 'In Progress',
      value: stats?.inProgress || 0,
      icon: <Clock size={24} />,
      color: 'var(--color-primary)',
    },
    {
      title: 'Completed',
      value: stats?.completed || 0,
      icon: <CheckCircle size={24} />,
      color: 'var(--color-success)',
    },
    {
      title: 'Failed',
      value: stats?.failed || 0,
      icon: <AlertCircle size={24} />,
      color: 'var(--color-danger)',
    },
    {
      title: 'Success Rate',
      value: stats?.completed && stats?.totalAssigned 
        ? `${((stats.completed / stats.totalAssigned) * 100).toFixed(1)}%`
        : '0%',
      icon: <TrendingUp size={24} />,
      color: 'var(--color-success)',
    },
  ];

  const handleUpdateStatus = async (formData: StatusUpdateFormData) => {
    if (!selectedTransaction) return;

    console.log('Form data:', formData);
    console.log('Selected transaction:', selectedTransaction);
    console.log('Form validation errors:', errors);
    console.log('Form is valid:', isValid);

    try {
      const updateData = {
        id: selectedTransaction.id,
        data: {
          status: formData.status as TransactionStatus,
          agentNotes: formData.agentNotes,
        },
      };
      
      console.log('Sending update data:', updateData);
      
      await processTransaction.mutateAsync(updateData);

      toast.success('Transaction status updated successfully');
      setIsStatusModalOpen(false);
      setSelectedTransaction(null);
      reset();
      refetchTasks();
    } catch (error: any) {
      console.error('Update error:', error);
      console.error('Error response:', error.response?.data);
      toast.error(error.response?.data?.error || 'Failed to update transaction status');
    }
  };

  const openStatusModal = (transaction: Transaction) => {
    console.log('Opening modal for transaction:', transaction);
    setSelectedTransaction(transaction);
    setIsStatusModalOpen(true);
    // Reset form with current transaction status
    setTimeout(() => {
      reset({
        status: transaction.status as any,
        agentNotes: '',
      });
      console.log('Form reset with status:', transaction.status);
    }, 100);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Agent Dashboard</h1>
          <p className={styles.subtitle}>Manage your assigned tasks and transactions</p>
          <div style={{ 
            background: '#f8f9fa', 
            border: '1px solid #dee2e6',
            padding: '8px 12px', 
            borderRadius: '6px', 
            marginTop: '8px',
            fontSize: '12px',
            fontFamily: 'monospace',
            color: '#495057'
          }}>
            INFO: Agent ID: {user?.id} | Role: {typeof user?.role === 'string' ? user.role : user?.role?.name || 'unknown'} | Tasks Count: {tasksData?.data?.length || 0}
          </div>
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
            isLoading={tasksLoading}
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

      {/* Status Update Modal */}
      <Modal
        isOpen={isStatusModalOpen}
        onClose={() => {
          setIsStatusModalOpen(false);
          setSelectedTransaction(null);
          reset();
        }}
        title="Update Transaction Status"
      >
        <form onSubmit={handleSubmit(handleUpdateStatus)} className={styles.modalForm}>
          <p className={styles.modalDescription}>
            Update status for transaction #{selectedTransaction?.id}:
          </p>
          
          <Select
            {...register('status')}
            label="New Status"
            options={[
              { value: 'PENDING', label: 'Pending' },
              { value: 'IN_PROGRESS', label: 'In Progress' },
              { value: 'SUCCESS', label: 'Success' },
              { value: 'FAILED', label: 'Failed' },
            ]}
            error={errors.status?.message}
            fullWidth
            required
          />

          <Input
            {...register('agentNotes')}
            label="Description (Required)"
            placeholder="Add description about this transaction status update..."
            error={errors.agentNotes?.message}
            fullWidth
            required
          />

          <ModalFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsStatusModalOpen(false);
                setSelectedTransaction(null);
                reset();
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={processTransaction.isPending}
            >
              Update Status
            </Button>
          </ModalFooter>
        </form>
      </Modal>
    </div>
  );
};

