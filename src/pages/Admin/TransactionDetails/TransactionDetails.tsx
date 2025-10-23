import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  useTransaction,
  useAssignTransaction,
  useUpdateTransactionStatus,
  useAdminAgents,
} from '@/api/hooks';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card/Card';
import { Button } from '@/components/ui/Button/Button';
import { Select } from '@/components/ui/Select/Select';
import { Input } from '@/components/ui/Input/Input';
import { Modal, ModalFooter } from '@/components/ui/Modal/Modal';
import { StatusBadge } from '@/components/StatusBadge/StatusBadge';
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
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);

  const { data, isLoading, refetch } = useTransaction(parseInt(id || '0'));
  const { data: agentsData } = useAdminAgents();
  const assignTransaction = useAssignTransaction();
  const updateStatus = useUpdateTransactionStatus();

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
      refetch();
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
          adminNotes: formData.adminNotes,
        },
      });
      toast.success('Status updated successfully');
      setShowStatusModal(false);
      refetch();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update status');
    }
  };

  if (isLoading) {
    return (
      <div className={styles.loading}>
        <div className="animate-spin" style={{
          width: '48px',
          height: '48px',
          border: '4px solid var(--color-border)',
          borderTopColor: 'var(--color-primary)',
          borderRadius: '50%',
        }} />
      </div>
    );
  }

  if (!data?.transaction) {
    return (
      <div className={styles.container}>
        <Card variant="elevated" className={styles.errorCard}>
          <CardContent>
            <h2>Transaction Not Found</h2>
            <Button onClick={() => navigate('/admin')}>Back to Dashboard</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const transaction = data.transaction;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Button variant="ghost" onClick={() => navigate('/admin')}>
          <ArrowLeft size={20} />
          Back to Dashboard
        </Button>
        <div className={styles.headerActions}>
          <Button variant="outline" onClick={() => setShowAssignModal(true)}>
            Assign to Agent
          </Button>
          <Button onClick={() => setShowStatusModal(true)}>Update Status</Button>
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
      <Modal isOpen={showAssignModal} onClose={() => setShowAssignModal(false)} title="Assign to Agent">
        <form onSubmit={handleSubmitAssign(onAssign)}>
          <Select
            {...registerAssign('agentId')}
            label="Select Agent"
            placeholder="Choose an agent"
            options={
              agentsData?.agents.map((agent) => ({
                value: agent.userId.toString(),
                label: `${agent.displayName} (${agent.pending} pending)`,
              })) || []
            }
            error={errorsAssign.agentId?.message}
            fullWidth
          />
          <ModalFooter>
            <Button type="button" variant="outline" onClick={() => setShowAssignModal(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={assignTransaction.isPending}>
              Assign
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
    </div>
  );
};

