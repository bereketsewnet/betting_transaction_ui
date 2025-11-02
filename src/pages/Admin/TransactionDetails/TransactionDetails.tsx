import React, { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { ArrowLeft, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  useAssignTransaction,
  useUpdateTransactionStatus,
  useDeleteTransaction,
  useAdminUsers,
} from '@/api/hooks';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card/Card';
import { Button } from '@/components/ui/Button/Button';
import { Select } from '@/components/ui/Select/Select';
import { Input } from '@/components/ui/Input/Input';
import { Modal, ModalFooter } from '@/components/ui/Modal/Modal';
import { StatusBadge } from '@/components/StatusBadge/StatusBadge';
import { ROLE_IDS } from '@/utils/constants';
import type { TransactionStatus } from '@/types';
import styles from './TransactionDetails.module.css';

const statusSchema = z.object({
  status: z.enum(['PENDING', 'IN_PROGRESS', 'SUCCESS', 'FAILED', 'CANCELLED']),
  adminNotes: z.string().optional(),
});

const assignSchema = z.object({
  agentId: z.string().min(1, 'Please select an agent'),
});

type StatusFormData = z.infer<typeof statusSchema>;
type AssignFormData = z.infer<typeof assignSchema>;

export const TransactionDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Get transaction data from navigation state
  const transaction = location.state?.transaction;

  const { data: agentsData } = useAdminUsers(
    1,
    undefined, // No limit - get all users
    { role: ROLE_IDS.AGENT, isActive: true } // Filter for active agents
  );
  const assignTransaction = useAssignTransaction();
  const updateStatus = useUpdateTransactionStatus();
  const deleteTransaction = useDeleteTransaction();

  const {
    register: registerStatus,
    handleSubmit: handleSubmitStatus,
    formState: { errors: errorsStatus },
  } = useForm<StatusFormData>({
    resolver: zodResolver(statusSchema),
  });

  const {
    register: registerAssign,
    handleSubmit: handleSubmitAssign,
    formState: { errors: errorsAssign },
  } = useForm<AssignFormData>({
    resolver: zodResolver(assignSchema),
  });

  const onAssign = async (formData: AssignFormData) => {
    if (!id) return;

    try {
      await assignTransaction.mutateAsync({
        id: parseInt(id),
        data: { agentId: parseInt(formData.agentId) },
      });
      toast.success('Transaction assigned successfully');
      setShowAssignModal(false);
      // Navigate back to transactions list to refresh data
      navigate('/admin/transactions');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to assign transaction');
    }
  };

  const onUpdateStatus = async (formData: StatusFormData) => {
    if (!id) return;

    try {
      await updateStatus.mutateAsync({
        id: parseInt(id),
        data: {
          status: formData.status as TransactionStatus,
          adminNotes: formData.adminNotes || undefined,
        },
      });
      toast.success('Status updated successfully');
      setShowStatusModal(false);
      // Navigate back to transactions list to refresh data
      navigate('/admin/transactions');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update status');
    }
  };

  const handleDelete = async () => {
    if (!id) return;

    setDeleteError(null);
    try {
      await deleteTransaction.mutateAsync(parseInt(id));
      toast.success('Transaction deleted successfully');
      setShowDeleteModal(false);
      // Navigate back to transactions list
      navigate('/admin/transactions');
    } catch (error: any) {
      console.error('Delete failed:', error);
      console.error('Error response:', error.response);
      console.error('Error response data:', error.response?.data);
      
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.message || 
                          error.message || 
                          'Failed to delete transaction';
      
      setDeleteError(errorMessage);
      toast.error(errorMessage);
    }
  };

  if (!transaction) {
    return (
      <div className={styles.container}>
        <Card variant="elevated" className={styles.errorCard}>
          <CardContent>
            <h2>Transaction Not Found</h2>
            <p>The requested transaction could not be found. Please navigate from the transactions list.</p>
            <Button onClick={() => navigate('/admin/transactions')}>
              Back to Transactions
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Debug logging for transaction data
  console.log('Transaction data:', transaction);
  console.log('Betting site:', transaction.bettingSite);
  console.log('Player site ID:', transaction.playerSiteId);
  console.log('Betting site ID:', transaction.bettingSiteId);
  console.log('All transaction keys:', Object.keys(transaction));
  console.log('Transaction type:', typeof transaction);
  console.log('Betting site type:', typeof transaction.bettingSite);
  console.log('Player site ID type:', typeof transaction.playerSiteId);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Button variant="ghost" onClick={() => navigate('/admin')}>
          <ArrowLeft size={20} />
          Back to Dashboard
        </Button>
        <div className={styles.headerActions}>
          <Button variant="outline" onClick={() => setShowAssignModal(true)}>
            {transaction.assignedAgent ? 'Reassign Agent' : 'Assign to Agent'}
          </Button>
          <Button onClick={() => setShowStatusModal(true)}>Update Status</Button>
          <Button 
            variant="outline" 
            onClick={() => {
              setShowDeleteModal(true);
              setDeleteError(null);
            }}
            style={{ 
              color: '#dc2626',
              borderColor: '#dc2626'
            }}
          >
            <Trash2 size={16} style={{ marginRight: '0.5rem' }} />
            Delete Transaction
          </Button>
        </div>
      </div>

      <Card variant="elevated">
        <CardHeader>
          <div className={styles.titleRow}>
            <CardTitle>Transaction Details</CardTitle>
            <StatusBadge status={transaction.status} />
          </div>
          <p className={styles.transactionId}>Transaction ID: #{transaction.id}</p>
        </CardHeader>
        <CardContent>
          <div className={styles.detailsGrid}>
            <div className={styles.detailItem}>
              <label>Type</label>
              <span className={transaction.type === 'DEPOSIT' ? styles.deposit : styles.withdraw}>
                {transaction.type}
              </span>
            </div>

            <div className={styles.detailItem}>
              <label>Amount</label>
              <span className={styles.amount}>
                {transaction.currency} {parseFloat(transaction.amount).toFixed(2)}
              </span>
            </div>

            <div className={styles.detailItem}>
              <label>Status</label>
              <StatusBadge status={transaction.status} />
            </div>

            <div className={styles.detailItem}>
              <label>Requested At</label>
              <span>{format(new Date(transaction.requestedAt), 'MMM dd, yyyy HH:mm:ss')}</span>
            </div>

            {transaction.processedAt && (
              <div className={styles.detailItem}>
                <label>Processed At</label>
                <span>{format(new Date(transaction.processedAt), 'MMM dd, yyyy HH:mm:ss')}</span>
              </div>
            )}

            {transaction.player && (
              <div className={styles.detailItem}>
                <label>Player UUID</label>
                <code className={styles.code}>{transaction.player.playerUuid}</code>
              </div>
            )}

            <div className={styles.detailItem}>
              <label>Betting Site</label>
              <span>
                {transaction.bettingSite && transaction.bettingSite.name
                  ? `${transaction.bettingSite.name} - ${transaction.bettingSite.website || 'No website'}`
                  : transaction.bettingSiteId 
                    ? `Site ID: ${transaction.bettingSiteId} (Details not loaded)`
                    : <span style={{ color: 'var(--color-text-tertiary)', fontStyle: 'italic' }}>Unknown Site</span>
                }
              </span>
            </div>

            <div className={styles.detailItem}>
              <label>Player Site ID</label>
              {transaction.playerSiteId ? (
                <code className={styles.code}>{transaction.playerSiteId}</code>
              ) : (
                <span style={{ color: 'var(--color-text-tertiary)', fontStyle: 'italic' }}>Unknown Site ID</span>
              )}
            </div>

            {transaction.assignedAgent && (
              <div className={styles.detailItem}>
                <label>Assigned Agent</label>
                <span>{transaction.assignedAgent.displayName}</span>
              </div>
            )}

            {transaction.type === 'DEPOSIT' && transaction.depositBank && (
              <>
                <div className={styles.detailItem}>
                  <label>Bank Name</label>
                  <span>{transaction.depositBank.bankName}</span>
                </div>
                <div className={styles.detailItem}>
                  <label>Account Name</label>
                  <span>{transaction.depositBank.accountName}</span>
                </div>
                <div className={styles.detailItem}>
                  <label>Account Number</label>
                  <span>{transaction.depositBank.accountNumber}</span>
                </div>
              </>
            )}

            {transaction.type === 'WITHDRAW' && (
              <>
                <div className={styles.detailItem}>
                  <label>Withdrawal Method</label>
                  <span>{transaction.withdrawalBank?.bankName}</span>
                </div>
                <div className={styles.detailItem}>
                  <label>Withdrawal Address</label>
                  <span>{transaction.withdrawalAddress}</span>
                </div>
              </>
            )}
          </div>

          {transaction.screenshotUrl && (
            <div className={styles.screenshot}>
              <label>Payment Screenshot</label>
              <img src={transaction.screenshotUrl} alt="Payment screenshot" className={styles.image} />
            </div>
          )}

          {transaction.evidenceUrl && (
            <div className={styles.screenshot}>
              <label>Agent Evidence</label>
              <img src={transaction.evidenceUrl} alt="Agent evidence" className={styles.image} />
            </div>
          )}

          {transaction.agentNotes && (
            <div className={styles.notes}>
              <label>Agent Notes</label>
              <p>{transaction.agentNotes}</p>
            </div>
          )}

          {transaction.adminNotes && (
            <div className={styles.notes}>
              <label>Admin Notes</label>
              <p>{transaction.adminNotes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Assign Modal */}
      <Modal isOpen={showAssignModal} onClose={() => setShowAssignModal(false)} title={transaction.assignedAgent ? "Reassign Agent" : "Assign to Agent"}>
        <form onSubmit={handleSubmitAssign(onAssign)}>
          <Select
            {...registerAssign('agentId')}
            label="Select Agent"
            placeholder="Choose an agent"
            options={[
              { value: '', label: 'Select an agent...' },
              ...(agentsData?.users.map((user) => ({
                value: user.id.toString(),
                label: user.displayName || user.username,
              })) || [])
            ]}
            error={errorsAssign.agentId?.message}
            fullWidth
          />
          <ModalFooter>
            <Button type="button" variant="outline" onClick={() => setShowAssignModal(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={assignTransaction.isPending}>
              {transaction.assignedAgent ? 'Reassign' : 'Assign'}
            </Button>
          </ModalFooter>
        </form>
      </Modal>

      {/* Update Status Modal */}
      <Modal isOpen={showStatusModal} onClose={() => setShowStatusModal(false)} title="Update Status">
        <form onSubmit={handleSubmitStatus(onUpdateStatus)} className={styles.form}>
          <Select
            {...registerStatus('status')}
            label="New Status"
            options={[
              { value: 'PENDING', label: 'Pending' },
              { value: 'IN_PROGRESS', label: 'In Progress' },
              { value: 'SUCCESS', label: 'Success' },
              { value: 'FAILED', label: 'Failed' },
              { value: 'CANCELLED', label: 'Cancelled' },
            ]}
            error={errorsStatus.status?.message}
            fullWidth
          />
          <Input
            {...registerStatus('adminNotes')}
            label="Admin Notes"
            placeholder="Add notes..."
            error={errorsStatus.adminNotes?.message}
            fullWidth
          />
          <ModalFooter>
            <Button type="button" variant="outline" onClick={() => setShowStatusModal(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={updateStatus.isPending}>
              Update
            </Button>
          </ModalFooter>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal 
        isOpen={showDeleteModal} 
        onClose={() => {
          setShowDeleteModal(false);
          setDeleteError(null);
        }} 
        title="Confirm Delete"
      >
        <div style={{ padding: '1rem 0' }}>
          <p>Are you sure you want to delete this transaction?</p>
          
          {transaction && (
            <div style={{ 
              padding: '0.75rem', 
              background: 'var(--color-background-secondary)', 
              borderRadius: '4px',
              marginTop: '0.75rem',
              marginBottom: '0.75rem'
            }}>
              <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>
                Transaction ID: #{transaction.id}
              </p>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: '0.25rem' }}>
                Type: <strong>{transaction.type}</strong>
              </p>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: '0.25rem' }}>
                Amount: <strong>{transaction.currency} {parseFloat(transaction.amount).toFixed(2)}</strong>
              </p>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
                Status: <strong>{transaction.status}</strong>
              </p>
            </div>
          )}

          {/* Warning message */}
          <div style={{
            padding: '0.75rem',
            background: '#fff3cd',
            border: '1px solid #ffc107',
            borderRadius: '4px',
            marginTop: '0.5rem',
            marginBottom: '0.5rem'
          }}>
            <p style={{ color: '#856404', margin: 0, fontSize: '0.875rem', fontWeight: 500 }}>
              ⚠️ Warning: This action cannot be undone.
            </p>
            <p style={{ 
              color: '#856404', 
              margin: '0.5rem 0 0 0', 
              fontSize: '0.8125rem'
            }}>
              Deleting this transaction will permanently remove all associated data including comments, evidence, and audit logs.
            </p>
          </div>

          {deleteError && (
            <div style={{
              padding: '0.75rem',
              background: '#fee',
              border: '1px solid #fcc',
              borderRadius: '4px',
              marginTop: '0.5rem',
              marginBottom: '0.5rem'
            }}>
              <p style={{ color: '#c33', margin: 0, fontSize: '0.875rem', fontWeight: 500 }}>
                Error: {deleteError}
              </p>
            </div>
          )}

          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginTop: '0.75rem' }}>
            This action will permanently delete the transaction and all its associated data. Please confirm you want to proceed.
          </p>
        </div>

        <ModalFooter>
          <Button 
            variant="outline" 
            onClick={() => {
              setShowDeleteModal(false);
              setDeleteError(null);
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            disabled={deleteTransaction.isPending}
            style={{
              background: '#dc2626',
              color: 'white'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#b91c1c';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#dc2626';
            }}
          >
            {deleteTransaction.isPending ? 'Deleting...' : 'Delete Transaction'}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

