import React from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ArrowLeft, Download } from 'lucide-react';
import { useTransaction } from '@/api/hooks';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card/Card';
import { Button } from '@/components/ui/Button/Button';
import { StatusBadge } from '@/components/StatusBadge/StatusBadge';
import { getUploadUrl } from '@/utils/constants';
import styles from './TransactionDetails.module.css';

export const TransactionDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get playerUuid from navigation state or localStorage
  // For temporary players, it should be stored when they create a transaction
  const playerUuid = (location.state as any)?.playerUuid || localStorage.getItem('playerUuid');
  
  const { data, isLoading } = useTransaction(parseInt(id || '0'), playerUuid || undefined);

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
            <p>The requested transaction could not be found.</p>
            <Button onClick={() => navigate('/player/history')}>
              Back to History
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const transaction = data.transaction;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Button
          variant="ghost"
          onClick={() => navigate('/player/history')}
        >
          <ArrowLeft size={20} style={{ paddingTop: '6px' }} />
          Back to History
        </Button>
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

            {transaction.type === 'WITHDRAW' && transaction.withdrawalBank && (
              <>
                <div className={styles.detailItem}>
                  <label>Withdrawal Method</label>
                  <span>{transaction.withdrawalBank.bankName}</span>
                </div>
                <div className={styles.detailItem}>
                  <label>Withdrawal Address</label>
                  <span>{transaction.withdrawalAddress}</span>
                </div>
              </>
            )}

            {transaction.assignedAgent && (
              <div className={styles.detailItem}>
                <label>Assigned Agent</label>
                <span>{transaction.assignedAgent.displayName}</span>
              </div>
            )}
          </div>

          {transaction.screenshotUrl && (
            <div className={styles.screenshot}>
              <label>Payment Screenshot</label>
              <div className={styles.imageContainer}>
                <img
                  src={getUploadUrl(transaction.screenshotUrl) || ''}
                  alt="Payment screenshot"
                  className={styles.image}
                />
                <a
                  href={getUploadUrl(transaction.screenshotUrl) || ''}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.downloadLink}
                >
                  <Download size={16} />
                  Download
                </a>
              </div>
            </div>
          )}

          {transaction.evidenceUrl && (
            <div className={styles.screenshot}>
              <label>Agent Evidence</label>
              <div className={styles.imageContainer}>
                <img
                  src={getUploadUrl(transaction.evidenceUrl) || ''}
                  alt="Agent evidence"
                  className={styles.image}
                />
                <a
                  href={getUploadUrl(transaction.evidenceUrl) || ''}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.downloadLink}
                >
                  <Download size={16} />
                  Download
                </a>
              </div>
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
    </div>
  );
};

