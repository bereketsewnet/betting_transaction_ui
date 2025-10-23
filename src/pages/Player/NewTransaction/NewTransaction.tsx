import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import {
  useCreatePlayer,
  useCreateTransaction,
  useDepositBanks,
  useWithdrawalBanks,
  useLanguages,
} from '@/api/hooks';
import { Input } from '@/components/ui/Input/Input';
import { Select } from '@/components/ui/Select/Select';
import { Button } from '@/components/ui/Button/Button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/Card/Card';
import { FileUpload } from '@/components/ui/FileUpload/FileUpload';
import type { TransactionType } from '@/types';
import styles from './NewTransaction.module.css';

const transactionSchema = z.object({
  type: z.enum(['DEPOSIT', 'WITHDRAW']),
  amount: z.string().min(1, 'Amount is required').refine((val) => !isNaN(Number(val)) && Number(val) > 0, 'Invalid amount'),
  currency: z.string().default('USD'),
  depositBankId: z.string().optional(),
  withdrawalBankId: z.string().optional(),
  withdrawalAddress: z.string().optional(),
}).refine(
  (data) => {
    if (data.type === 'DEPOSIT') return !!data.depositBankId;
    if (data.type === 'WITHDRAW') return !!data.withdrawalBankId && !!data.withdrawalAddress;
    return true;
  },
  {
    message: 'Please fill in all required fields',
    path: ['type'],
  }
);

type TransactionFormData = z.infer<typeof transactionSchema>;

export const NewTransaction: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [playerUuid, setPlayerUuid] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [languageCode, setLanguageCode] = useState('en');

  const createPlayer = useCreatePlayer();
  const createTransaction = useCreateTransaction();
  const { data: depositBanks, isLoading: loadingDepositBanks } = useDepositBanks();
  const { data: withdrawalBanks, isLoading: loadingWithdrawalBanks } = useWithdrawalBanks();
  const { data: languages } = useLanguages();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: 'DEPOSIT',
      currency: 'USD',
    },
  });

  const transactionType = watch('type');

  // Check if player exists in localStorage
  useEffect(() => {
    const storedPlayerUuid = localStorage.getItem('playerUuid');
    if (storedPlayerUuid) {
      setPlayerUuid(storedPlayerUuid);
      setStep(2);
    }
  }, []);

  const handleLanguageSetup = async () => {
    try {
      // Create player profile
      const telegramId = `web_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      const response = await createPlayer.mutateAsync({
        telegramId,
        languageCode,
      });

      const uuid = response.player.playerUuid;
      setPlayerUuid(uuid);
      localStorage.setItem('playerUuid', uuid);
      toast.success('Profile created successfully!');
      setStep(2);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to create profile');
    }
  };

  const onSubmit = async (data: TransactionFormData) => {
    if (!playerUuid) {
      toast.error('Player profile not found');
      return;
    }

    try {
      const transactionData = {
        playerUuid,
        type: data.type as TransactionType,
        amount: parseFloat(data.amount),
        currency: data.currency,
        depositBankId: data.depositBankId ? parseInt(data.depositBankId) : undefined,
        withdrawalBankId: data.withdrawalBankId ? parseInt(data.withdrawalBankId) : undefined,
        withdrawalAddress: data.withdrawalAddress,
        screenshot: selectedFile || undefined,
      };

      const result = await createTransaction.mutateAsync(transactionData);
      toast.success('Transaction created successfully!');
      navigate(`/player/transaction/${result.transaction.id}`, {
        state: { playerUuid },
      });
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to create transaction');
    }
  };

  if (step === 1) {
    return (
      <div className={styles.container}>
        <Card variant="elevated" className={styles.card}>
          <CardHeader>
            <CardTitle>Welcome! Select Your Language</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={styles.form}>
              <Select
                label="Preferred Language"
                value={languageCode}
                onChange={(e) => setLanguageCode(e.target.value)}
                options={
                  languages?.languages.map((lang) => ({
                    value: lang.code,
                    label: lang.name,
                  })) || []
                }
                fullWidth
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button
              fullWidth
              onClick={handleLanguageSetup}
              isLoading={createPlayer.isPending}
            >
              Continue
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Card variant="elevated" className={styles.card}>
        <CardHeader>
          <CardTitle>New Transaction</CardTitle>
          <p className={styles.subtitle}>Create a deposit or withdrawal request</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
            <Select
              {...register('type')}
              label="Transaction Type"
              options={[
                { value: 'DEPOSIT', label: 'Deposit' },
                { value: 'WITHDRAW', label: 'Withdrawal' },
              ]}
              fullWidth
              required
            />

            <Input
              {...register('amount')}
              label="Amount"
              type="number"
              step="0.01"
              placeholder="Enter amount"
              error={errors.amount?.message}
              fullWidth
              required
            />

            <Input
              {...register('currency')}
              label="Currency"
              defaultValue="USD"
              fullWidth
              required
            />

            {transactionType === 'DEPOSIT' && (
              <>
                <Select
                  {...register('depositBankId')}
                  label="Select Bank"
                  placeholder="Choose a bank"
                  options={
                    depositBanks?.banks
                      .filter((bank) => bank.isActive)
                      .map((bank) => ({
                        value: bank.id.toString(),
                        label: `${bank.bankName} - ${bank.accountName}`,
                      })) || []
                  }
                  fullWidth
                  required
                />

                {depositBanks?.banks.find(
                  (b) => b.id.toString() === watch('depositBankId')
                ) && (
                  <div className={styles.bankDetails}>
                    <h4>Bank Details:</h4>
                    {(() => {
                      const selectedBank = depositBanks.banks.find(
                        (b) => b.id.toString() === watch('depositBankId')
                      );
                      return selectedBank ? (
                        <div className={styles.detailsList}>
                          <p><strong>Bank:</strong> {selectedBank.bankName}</p>
                          <p><strong>Account Name:</strong> {selectedBank.accountName}</p>
                          <p><strong>Account Number:</strong> {selectedBank.accountNumber}</p>
                          {selectedBank.notes && <p><strong>Notes:</strong> {selectedBank.notes}</p>}
                        </div>
                      ) : null;
                    })()}
                  </div>
                )}

                <div>
                  <label className={styles.label}>
                    Payment Screenshot (Optional)
                  </label>
                  <FileUpload
                    onFileSelect={setSelectedFile}
                    helperText="Upload a screenshot of your payment confirmation"
                  />
                </div>
              </>
            )}

            {transactionType === 'WITHDRAW' && (
              <>
                <Select
                  {...register('withdrawalBankId')}
                  label="Withdrawal Method"
                  placeholder="Choose withdrawal method"
                  options={
                    withdrawalBanks?.banks
                      .filter((bank) => bank.isActive)
                      .map((bank) => ({
                        value: bank.id.toString(),
                        label: bank.bankName,
                      })) || []
                  }
                  fullWidth
                  required
                />

                <Input
                  {...register('withdrawalAddress')}
                  label="Withdrawal Address/Account"
                  placeholder="Enter your account details"
                  error={errors.withdrawalAddress?.message}
                  helperText="Enter the address or account number where you want to receive funds"
                  fullWidth
                  required
                />
              </>
            )}

            <div className={styles.actions}>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/')}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                isLoading={createTransaction.isPending}
              >
                Submit Transaction
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

