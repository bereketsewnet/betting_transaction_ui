import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Eye, UserPlus, CheckCircle, XCircle, Clock, Filter, Download } from 'lucide-react';
import { useAdminTransactions, useAdminAgents, useAssignTransaction, useUpdateTransactionStatus } from '@/api/hooks';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card/Card';
import { Button } from '@/components/ui/Button/Button';
import { Select } from '@/components/ui/Select/Select';
import { Input } from '@/components/ui/Input/Input';
import { DataTable, Column } from '@/components/ui/DataTable/DataTable';
import { Modal } from '@/components/ui/Modal/Modal';
import { StatusBadge } from '@/components/StatusBadge/StatusBadge';
import type { Transaction, TransactionStatus, TransactionType, AssignTransactionRequest } from '@/types';
import styles from './Transactions.module.css';

export const Transactions: React.FC = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<TransactionStatus | ''>('');
  const [typeFilter, setTypeFilter] = useState<TransactionType | ''>('');
  const [agentFilter, setAgentFilter] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [selectedAgentId, setSelectedAgentId] = useState<string>('');
  const [newStatus, setNewStatus] = useState<TransactionStatus>('PENDING');
  const [adminNotes, setAdminNotes] = useState('');
  const [showAllTransactions, setShowAllTransactions] = useState(false);

  const limit = showAllTransactions ? 1000 : 20;

  const filters = {
    ...(statusFilter && { status: statusFilter }),
    ...(typeFilter && { type: typeFilter }),
    ...(agentFilter && { agent: parseInt(agentFilter) }),
    ...(searchTerm && { search: searchTerm }),
  };

  const { data: transactionsData, isLoading, refetch } = useAdminTransactions(page, limit, filters);
  const { data: agentsData } = useAdminAgents();
  const assignMutation = useAssignTransaction();
  const statusMutation = useUpdateTransactionStatus();

  const handleAssignTransaction = async () => {
    if (!selectedTransaction || !selectedAgentId) return;
    
    try {
      await assignMutation.mutateAsync({
        id: selectedTransaction.id,
        data: { agentId: parseInt(selectedAgentId) }
      });
      setIsAssignModalOpen(false);
      setSelectedTransaction(null);
      setSelectedAgentId('');
      refetch();
    } catch (error) {
      console.error('Assign failed:', error);
    }
  };

  const handleUpdateStatus = async () => {
    if (!selectedTransaction) return;
    
    try {
      await statusMutation.mutateAsync({
        id: selectedTransaction.id,
        data: { 
          status: newStatus,
          adminNotes: adminNotes || undefined
        }
      });
      setIsStatusModalOpen(false);
      setSelectedTransaction(null);
      setNewStatus('PENDING');
      setAdminNotes('');
      refetch();
    } catch (error) {
      console.error('Status update failed:', error);
    }
  };

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
      header: 'Requested',
      render: (value) => format(new Date(value), 'MMM dd, HH:mm'),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (_value, row) => (
        <div className={styles.actions}>
          <Button
            size="sm"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/admin/transaction/${row.id}`, {
                state: { transaction: row },
              });
            }}
            title="View Details"
          >
            <Eye size={16} />
          </Button>
          {!row.assignedAgent && (
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedTransaction(row);
                setIsAssignModalOpen(true);
              }}
              title="Assign to Agent"
            >
              <UserPlus size={16} />
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedTransaction(row);
              setNewStatus(row.status);
              setIsStatusModalOpen(true);
            }}
            title="Update Status"
          >
            <CheckCircle size={16} />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Transaction Management</h1>
          <p className={styles.subtitle}>Manage all transactions, assign agents, and update status</p>
        </div>
        <div className={styles.headerActions}>
          <Button 
            variant="outline" 
            onClick={() => setShowAllTransactions(!showAllTransactions)}
          >
            {showAllTransactions ? 'Show Less' : 'See More'}
          </Button>
          <Button variant="outline" onClick={() => navigate('/admin/agents')}>
            Manage Agents
          </Button>
          <Button variant="outline">
            <Download size={16} />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>
            <Filter size={20} />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={styles.filters}>
            <Input
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as TransactionStatus | '')}
              options={[
                { value: '', label: 'All Status' },
                { value: 'PENDING', label: 'Pending' },
                { value: 'IN_PROGRESS', label: 'In Progress' },
                { value: 'SUCCESS', label: 'Success' },
                { value: 'FAILED', label: 'Failed' },
                { value: 'CANCELLED', label: 'Cancelled' },
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
            <Select
              value={agentFilter}
              onChange={(e) => setAgentFilter(e.target.value)}
              options={[
                { value: '', label: 'All Agents' },
                ...(agentsData?.agents.map(agent => ({
                  value: agent.userId.toString(),
                  label: agent.displayName,
                })) || [])
              ]}
            />
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Transactions</CardTitle>
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
                    totalItems: transactionsData.pagination.total,
                    pageSize: transactionsData.pagination.limit,
                    onPageChange: setPage,
                  }
                : undefined
            }
            onRowClick={(row) =>
              navigate(`/admin/transaction/${row.id}`, {
                state: { transaction: row },
              })
            }
          />
        </CardContent>
      </Card>

      {/* Assign Transaction Modal */}
      <Modal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        title="Assign Transaction to Agent"
      >
        <div className={styles.modalContent}>
          <p>Assign transaction #{selectedTransaction?.id} to an agent:</p>
          <Select
            label="Select Agent"
            value={selectedAgentId}
            onChange={(e) => setSelectedAgentId(e.target.value)}
            options={agentsData?.agents.map(agent => ({
              value: agent.userId.toString(),
              label: agent.displayName,
            })) || []}
          />
          <div className={styles.modalActions}>
            <Button variant="outline" onClick={() => setIsAssignModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAssignTransaction}
              disabled={!selectedAgentId || assignMutation.isPending}
            >
              {assignMutation.isPending ? 'Assigning...' : 'Assign'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Update Status Modal */}
      <Modal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        title="Update Transaction Status"
      >
        <div className={styles.modalContent}>
          <p>Update status for transaction #{selectedTransaction?.id}:</p>
          <Select
            label="New Status"
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value as TransactionStatus)}
            options={[
              { value: 'PENDING', label: 'Pending' },
              { value: 'IN_PROGRESS', label: 'In Progress' },
              { value: 'SUCCESS', label: 'Success' },
              { value: 'FAILED', label: 'Failed' },
              { value: 'CANCELLED', label: 'Cancelled' },
            ]}
          />
          <Input
            label="Admin Notes (Optional)"
            value={adminNotes}
            onChange={(e) => setAdminNotes(e.target.value)}
            placeholder="Add notes about this status change..."
          />
          <div className={styles.modalActions}>
            <Button variant="outline" onClick={() => setIsStatusModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleUpdateStatus}
              disabled={statusMutation.isPending}
            >
              {statusMutation.isPending ? 'Updating...' : 'Update Status'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
