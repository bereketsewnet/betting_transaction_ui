import React from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { useTransaction, useProcessTransaction, useBettingSites } from '@/api/hooks';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card/Card';
import { Button } from '@/components/ui/Button/Button';
import { Input } from '@/components/ui/Input/Input';
import { Select } from '@/components/ui/Select/Select';
import { StatusBadge } from '@/components/StatusBadge/StatusBadge';
import type { TransactionStatus } from '@/types';
import styles from './TaskDetails.module.css';

const processSchema = z.object({
  status: z.enum(['PENDING', 'IN_PROGRESS', 'SUCCESS', 'FAILED']),
  agentNotes: z.string().min(1, 'Description is required when updating status'),
});

type ProcessFormData = z.infer<typeof processSchema>;

export const TaskDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  // Get transaction data from navigation state (passed from table)
  const transactionFromState = location.state?.transaction;
  
  // Fallback to API call if no state data
  const { data: apiData, isLoading, refetch, error } = useTransaction(
    parseInt(id || '0')
  );
  
  const { data: bettingSitesData } = useBettingSites();
  const processTransaction = useProcessTransaction();

  // Use transaction from state or API
  const transaction = transactionFromState || apiData?.transaction;

  // Create betting site ID to name mapping
  const bettingSiteMap = React.useMemo(() => {
    if (!bettingSitesData?.bettingSites) return {};
    return bettingSitesData.bettingSites.reduce((acc, site) => {
      acc[site.id] = site.name;
      return acc;
    }, {} as Record<number, string>);
  }, [bettingSitesData]);

  // Debug logging for transaction details
  console.log('TaskDetails Debug:');
  console.log('- Transaction from state:', transactionFromState);
  console.log('- API data:', apiData);
  console.log('- Final transaction:', transaction);
  console.log('- Betting sites data:', bettingSitesData);
  console.log('- Betting site map:', bettingSiteMap);
  console.log('- Transaction betting site ID:', transaction?.bettingSiteId);
  console.log('- Transaction player site ID:', transaction?.playerSiteId);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProcessFormData>({
    resolver: zodResolver(processSchema),
  });

  const onSubmit = async (formData: ProcessFormData) => {
    if (!id) return;

    try {
      await processTransaction.mutateAsync({
        id: parseInt(id),
        data: {
          status: formData.status as TransactionStatus,
          agentNotes: formData.agentNotes,
        },
      });

      toast.success('Transaction status updated successfully');
      refetch();
      setTimeout(() => navigate('/agent'), 1500);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update transaction status');
    }
  };


  if (isLoading && !transactionFromState) {
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

  if (error && !transactionFromState) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <Button variant="ghost" onClick={() => navigate('/agent')}>
            <ArrowLeft size={20} />
            Back to Dashboard
          </Button>
        </div>
        <Card variant="elevated" className={styles.errorCard}>
          <CardContent>
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <h2>Error Loading Transaction</h2>
              <p>Failed to load transaction details. Please try again.</p>
              <Button onClick={() => navigate('/agent')}>Back to Dashboard</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <Button variant="ghost" onClick={() => navigate('/agent')}>
            <ArrowLeft size={20} />
            Back to Dashboard
          </Button>
        </div>
        <Card variant="elevated" className={styles.errorCard}>
          <CardContent>
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <h2>Transaction Not Found</h2>
              <p>The transaction you're looking for doesn't exist or you don't have permission to view it.</p>
              <Button onClick={() => navigate('/agent')}>Back to Dashboard</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  // const canProcess = ['PENDING', 'IN_PROGRESS'].includes(transaction.status);

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
              INFO: Betting Site ID: {transaction.bettingSiteId} | Player Site ID: {transaction.playerSiteId} | Site Name: {bettingSiteMap[transaction.bettingSiteId] || 'Not found'}
            </div>
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

              <div className={styles.detailItem}>
                <label>Betting Site</label>
                <span>
                  {transaction.bettingSite && transaction.bettingSite.name
                    ? `${transaction.bettingSite.name} - ${transaction.bettingSite.website || 'No website'}`
                    : transaction.bettingSiteId && bettingSiteMap[transaction.bettingSiteId]
                      ? `${bettingSiteMap[transaction.bettingSiteId]} (ID: ${transaction.bettingSiteId})`
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

        {/* Status Update Form - Always Visible */}
        <Card variant="elevated">
          <CardHeader>
            <CardTitle>Update Transaction Status</CardTitle>
            <p className={styles.subtitle}>Update the status and add notes for this transaction</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
              <Select
                {...register('status')}
                label="Update Status"
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

              <div className={styles.actions}>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/agent')}
                >
                  Back to Dashboard
                </Button>
                <Button
                  type="submit"
                  isLoading={processTransaction.isPending}
                >
                  Update Status
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

