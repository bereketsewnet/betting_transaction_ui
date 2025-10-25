import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { useCreatePlayer, useLanguages } from '@/api/hooks';
import { Input } from '@/components/ui/Input/Input';
import { Select } from '@/components/ui/Select/Select';
import { Button } from '@/components/ui/Button/Button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/Card/Card';
import styles from './PlayerRegistration.module.css';

const registrationSchema = z.object({
  telegramId: z.string().min(1, 'Telegram ID is required'),
  telegramUsername: z.string().optional(),
  languageCode: z.string().min(1, 'Language is required'),
});

type RegistrationFormData = z.infer<typeof registrationSchema>;

export const PlayerRegistration: React.FC = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createPlayer = useCreatePlayer();
  const { data: languages, isLoading: loadingLanguages } = useLanguages();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      languageCode: 'en',
    },
  });

  const onSubmit = async (data: RegistrationFormData) => {
    setIsSubmitting(true);
    try {
      const response = await createPlayer.mutateAsync({
        telegramId: data.telegramId,
        telegramUsername: data.telegramUsername || undefined,
        languageCode: data.languageCode,
      });

      const playerUuid = response.player.playerUuid;
      localStorage.setItem('playerUuid', playerUuid);
      
      toast.success('Registration successful! Welcome to Betting Payment Manager!');
      
      // Redirect to new transaction page
      navigate('/player/new-transaction');
    } catch (error: any) {
      console.error('Registration error:', error);
      
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.message || 
                          error.message || 
                          'Failed to create player profile';
      
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      <Card variant="elevated" className={styles.card}>
        <CardHeader>
          <CardTitle>Player Registration</CardTitle>
          <p className={styles.subtitle}>Create your player profile to start managing transactions</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
            <Input
              {...register('telegramId')}
              label="Telegram ID"
              placeholder="Enter your Telegram ID"
              error={errors.telegramId?.message}
              helperText="Your unique Telegram user ID (e.g., 123456789)"
              fullWidth
              required
            />

            <Input
              {...register('telegramUsername')}
              label="Telegram Username (Optional)"
              placeholder="@username"
              error={errors.telegramUsername?.message}
              helperText="Your Telegram username (optional)"
              fullWidth
            />

            <Select
              {...register('languageCode')}
              label="Preferred Language"
              options={
                languages?.languages
                  ?.filter(lang => lang.isActive)
                  ?.map((lang) => ({
                    value: lang.code,
                    label: lang.name,
                  })) || []
              }
              placeholder={loadingLanguages ? "Loading languages..." : "Select your language"}
              error={errors.languageCode?.message}
              helperText="Choose your preferred language for communication"
              fullWidth
              required
            />

            <div className={styles.actions}>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/')}
                disabled={isSubmitting}
              >
                Back to Home
              </Button>
              <Button
                type="submit"
                isLoading={isSubmitting || createPlayer.isPending}
                disabled={loadingLanguages}
              >
                Create Profile
              </Button>
            </div>
          </form>
        </CardContent>
        <CardFooter>
          <div className={styles.footer}>
            <p className={styles.footerText}>
              Already have a profile? <a href="/player/new-transaction">Create Transaction</a>
            </p>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

