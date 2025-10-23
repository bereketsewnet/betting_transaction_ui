import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { ArrowLeft, Upload } from 'lucide-react';
import toast from 'react-hot-toast';
import { useTransaction, useProcessTransaction, useUploadEvidence } from '@/api/hooks';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card/Card';
import { Button } from '@/components/ui/Button/Button';
import { Input } from '@/components/ui/Input/Input';
import { Select } from '@/components/ui/Select/Select';
import { FileUpload } from '@/components/ui/FileUpload/FileUpload';
import { StatusBadge } from '@/components/StatusBadge/StatusBadge';
import type { TransactionStatus } from '@/types';
import styles from './TaskDetails.module.css';

const processSchema = z.object({
  status: z.enum(['SUCCESS', 'FAILED', 'IN_PROGRESS']),
  agentNotes: z.string().optional(),
});

type ProcessFormData = z.infer<typeof processSchema>;

export const TaskDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [evidenceFile, setEvidenceFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const { data, isLoading, refetch } = useTransaction(parseInt(id || '0'));
  const processTransaction = useProcessTransaction();
  const uploadEvidence = useUploadEvidence();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProcessFormData>({
    resolver: zodResolver(processSchema),
  });

  const handleUploadEvidence = async (): Promise<string | undefined> => {
    if (!evidenceFile) return undefined;

    try {
      const result = await uploadEvidence.mutateAsync(evidenceFile);
      toast.success('Evidence uploaded successfully');
      return result.fileUrl;
    } catch (error) {
      toast.error('Failed to upload evidence');
      return undefined;
    }
  };

  const onSubmit = async (formData: ProcessFormData) => {
    if (!id) return;

    try {
      let evidenceUrl: string | undefined;
      
      if (evidenceFile) {
        evidenceUrl = await handleUploadEvidence();
      }

      await processTransaction.mutateAsync({
        id: parseInt(id),
        data: {
          status: formData.status as TransactionStatus,
          agentNotes: formData.agentNotes,
          evidenceUrl,
        },
      });

      toast.success('Transaction processed successfully');
      refetch();
      setTimeout(() => navigate('/agent'), 1500);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to process transaction');
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
            <Button onClick={() => navigate('/agent')}>Back to Dashboard</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const transaction = data.transaction;
  const canProcess = ['PENDING', 'IN_PROGRESS'].includes(transaction.status);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Button variant="ghost" onClick={() => navigate('/agent')}>
          <ArrowLeft size={20} />
          Back to Dashboard
        </Button>
      </div>

      <div className={styles.content}>
        {/* Transaction Details */}
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
                <label>Requested At</label>
                <span>{format(new Date(transaction.requestedAt), 'MMM dd, yyyy HH:mm:ss')}</span>
              </div>

              {transaction.player && (
                <div className={styles.detailItem}>
                  <label>Player UUID</label>
                  <code className={styles.code}>{transaction.player.playerUuid}</code>
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
                <img
                  src={transaction.screenshotUrl}
                  alt="Payment screenshot"
                  className={styles.image}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Process Transaction Form */}
        {canProcess && (
          <Card variant="elevated">
            <CardHeader>
              <CardTitle>Process Transaction</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
                <Select
                  {...register('status')}
                  label="Update Status"
                  options={[
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
                  label="Agent Notes"
                  placeholder="Add notes about this transaction..."
                  error={errors.agentNotes?.message}
                  fullWidth
                />

                <div>
                  <label className={styles.label}>Upload Evidence</label>
                  <FileUpload
                    onFileSelect={setEvidenceFile}
                    helperText="Upload proof of transaction processing"
                  />
                </div>

                <div className={styles.actions}>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/agent')}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    isLoading={processTransaction.isPending || uploadEvidence.isPending}
                  >
                    Process Transaction
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Already Processed Info */}
        {!canProcess && (
          <Card variant="bordered">
            <CardContent>
              <div className={styles.processedInfo}>
                <h3>Transaction Already Processed</h3>
                {transaction.agentNotes && (
                  <div className={styles.notes}>
                    <label>Agent Notes:</label>
                    <p>{transaction.agentNotes}</p>
                  </div>
                )}
                {transaction.evidenceUrl && (
                  <div className={styles.screenshot}>
                    <label>Evidence:</label>
                    <img src={transaction.evidenceUrl} alt="Evidence" className={styles.image} />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

