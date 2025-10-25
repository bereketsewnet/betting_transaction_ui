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
  useBettingSites,
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
  currency: z.string().default('ETB'),
  depositBankId: z.string().optional(),
  withdrawalBankId: z.string().optional(),
  bankAccountNumber: z.string().optional(),
  accountHolderName: z.string().optional(),
  bettingSiteId: z.string().optional(),
  playerSiteId: z.string().optional(),
}).refine(
  (data) => {
    if (data.type === 'DEPOSIT') {
      return !!data.depositBankId && !!data.bettingSiteId && !!data.playerSiteId;
    }
    if (data.type === 'WITHDRAW') {
      return !!data.withdrawalBankId && !!data.bankAccountNumber && !!data.accountHolderName;
    }
    return true;
  },
  {
    message: 'For deposits: select bank, betting site, and enter player ID. For withdrawals: select bank and enter account details.',
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
  const { data: depositBanks, isLoading: loadingDepositBanks, error: depositBanksError } = useDepositBanks();
  const { data: withdrawalBanks, isLoading: loadingWithdrawalBanks, error: withdrawalBanksError } = useWithdrawalBanks();
  const { data: bettingSites, isLoading: loadingBettingSites, error: bettingSitesError } = useBettingSites();
  
  // Debug logging for all data
  console.log('Deposit Banks:', depositBanks);
  console.log('Loading Deposit Banks:', loadingDepositBanks);
  console.log('Deposit Banks Error:', depositBanksError);
  
  console.log('Withdrawal Banks:', withdrawalBanks);
  console.log('Loading Withdrawal Banks:', loadingWithdrawalBanks);
  console.log('Withdrawal Banks Error:', withdrawalBanksError);
  
  console.log('Betting Sites in Transaction Form:', bettingSites);
  console.log('Loading Betting Sites:', loadingBettingSites);
  console.log('Betting Sites Error:', bettingSitesError);
  console.log('Betting Sites Type:', typeof bettingSites?.bettingSites);
  console.log('Is Array:', Array.isArray(bettingSites?.bettingSites));
  
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
      currency: 'ETB',
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
      // Prepare transaction data according to EXAMPLES.md
      const transactionData: any = {
        playerUuid,
        type: data.type as TransactionType,
        amount: parseFloat(data.amount),
        currency: data.currency,
      };

      // Add deposit-specific fields
      if (data.type === 'DEPOSIT') {
        if (data.depositBankId) {
          transactionData.depositBankId = parseInt(data.depositBankId);
        }
        if (data.bettingSiteId) {
          transactionData.bettingSiteId = parseInt(data.bettingSiteId);
        }
        if (data.playerSiteId) {
          transactionData.playerSiteId = data.playerSiteId;
        }
        if (selectedFile) {
          transactionData.screenshot = selectedFile;
        }
      }

      // Add withdrawal-specific fields
      if (data.type === 'WITHDRAW') {
        if (data.withdrawalBankId) {
          transactionData.withdrawalBankId = parseInt(data.withdrawalBankId);
        }
        if (data.bankAccountNumber && data.accountHolderName) {
          transactionData.withdrawalAddress = `${data.bankAccountNumber} - ${data.accountHolderName}`;
        }
      }

      // Debug: Log the data being sent
      console.log('Transaction data being sent:', transactionData);
      console.log('Transaction type:', data.type);
      console.log('Selected file:', selectedFile);

      const result = await createTransaction.mutateAsync(transactionData);
      toast.success('Transaction created successfully!');
      navigate(`/player/transaction/${result.transaction.id}`, {
        state: { playerUuid },
      });
    } catch (error: any) {
      console.error('Transaction creation error:', error);
      console.error('Error response:', error.response?.data);
      
      // Show more specific error message
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.message || 
                          error.message || 
                          'Failed to create transaction';
      
      toast.error(`Transaction failed: ${errorMessage}`);
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
              defaultValue="ETB"
              readOnly
              helperText="Currency is set to ETB (Ethiopian Birr)"
              fullWidth
              required
            />

            <Select
              {...register('bettingSiteId')}
              label="Betting Site"
               options={
                 bettingSites?.bettingSites && Array.isArray(bettingSites.bettingSites)
                   ? bettingSites.bettingSites
                       .filter(site => site.isActive) // Only show active betting sites
                       .map(site => ({
                         value: site.id.toString(),
                         label: `${site.name} - ${site.website}`,
                       }))
                   : []
               }
              placeholder={loadingBettingSites ? "Loading betting sites..." : "Select betting site"}
              helperText={transactionType === 'DEPOSIT' ? "Required for deposits - Choose the betting platform" : "Optional for withdrawals"}
              fullWidth
              required={transactionType === 'DEPOSIT'}
            />
            {bettingSitesError && (
              <p style={{ color: 'var(--color-error)', fontSize: '0.875rem' }}>
                Error loading betting sites: {bettingSitesError.message}
              </p>
            )}
            {!loadingBettingSites && !bettingSitesError && (!bettingSites?.bettingSites || bettingSites.bettingSites.length === 0) && (
              <p style={{ color: 'var(--color-error)', fontSize: '0.875rem' }}>
                No betting sites available. Please contact support.
              </p>
            )}

            <Input
              {...register('playerSiteId')}
              label="Player Username/ID"
              placeholder="Enter your username or ID on the betting site"
              helperText={transactionType === 'DEPOSIT' ? "Required for deposits - Your username/ID on the selected betting site" : "Optional for withdrawals"}
              fullWidth
              required={transactionType === 'DEPOSIT'}
            />

            {transactionType === 'DEPOSIT' && (
              <>
                <Select
                  {...register('depositBankId')}
                  label="Select Bank"
                  placeholder={loadingDepositBanks ? "Loading banks..." : "Choose a bank"}
                  options={
                    depositBanks?.banks
                      ?.map((bank) => ({
                        value: bank.id.toString(),
                        label: `${bank.bankName} - ${bank.accountName}`,
                      })) || []
                  }
                  disabled={loadingDepositBanks}
                  fullWidth
                  required
                />
                {depositBanksError && (
                  <p style={{ color: 'var(--color-error)', fontSize: '0.875rem' }}>
                    Error loading banks: {depositBanksError.message}
                  </p>
                )}
                {!loadingDepositBanks && !depositBanksError && (!depositBanks?.banks || depositBanks.banks.length === 0) && (
                  <p style={{ color: 'var(--color-error)', fontSize: '0.875rem' }}>
                    No deposit banks available. Please contact support.
                  </p>
                )}

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
                  placeholder={loadingWithdrawalBanks ? "Loading methods..." : "Choose withdrawal method"}
                  options={
                    withdrawalBanks?.banks
                      ?.map((bank) => ({
                        value: bank.id.toString(),
                        label: bank.bankName,
                      })) || []
                  }
                  disabled={loadingWithdrawalBanks}
                  fullWidth
                  required
                />
                {withdrawalBanksError && (
                  <p style={{ color: 'var(--color-error)', fontSize: '0.875rem' }}>
                    Error loading withdrawal methods: {withdrawalBanksError.message}
                  </p>
                )}
                {!loadingWithdrawalBanks && !withdrawalBanksError && (!withdrawalBanks?.banks || withdrawalBanks.banks.length === 0) && (
                  <p style={{ color: 'var(--color-error)', fontSize: '0.875rem' }}>
                    No withdrawal methods available. Please contact support.
                  </p>
                )}

                <Input
                  {...register('bankAccountNumber')}
                  label="Bank Account Number"
                  placeholder="Enter your bank account number"
                  error={errors.bankAccountNumber?.message}
                  helperText="Your bank account number for receiving funds"
                  fullWidth
                  required
                />

                <Input
                  {...register('accountHolderName')}
                  label="Account Holder Name"
                  placeholder="Enter the account holder's full name"
                  error={errors.accountHolderName?.message}
                  helperText="The name as it appears on your bank account"
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

