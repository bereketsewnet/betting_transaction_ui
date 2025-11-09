import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { useCreatePlayerExtended, useLanguages } from '@/api/hooks';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card/Card';
import { Button } from '@/components/ui/Button/Button';
import { Input } from '@/components/ui/Input/Input';
import { Select } from '@/components/ui/Select/Select';
import { UserPlus, ArrowLeft } from 'lucide-react';
import styles from './PlayerRegistration.module.css';

const registrationSchema = z.object({
  // Full Account Info (All Required for Website)
  email: z.string().email('Must be a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  displayName: z.string().min(1, 'Display name is required'),
  phone: z.string().optional().or(z.literal('')),
  languageCode: z.string().min(1, 'Language is required'),
});

type RegistrationFormData = z.infer<typeof registrationSchema>;

export const PlayerRegistration: React.FC = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createPlayer = useCreatePlayerExtended();
  const { data: languages, isLoading: loadingLanguages, error: languagesError } = useLanguages();
  
  // Debug logging
  console.log('Languages data:', languages);
  console.log('Languages loading:', loadingLanguages);
  console.log('Languages error:', languagesError);
  
  // Prepare language options
  const languageOptions = React.useMemo(() => {
    console.log('Raw languages data:', languages);
    
    // Check if languages data exists and has the right structure
    if (languages?.languages && Array.isArray(languages.languages)) {
      console.log('Languages array:', languages.languages);
      // Don't filter by isActive - use all languages returned from API
      const mapped = languages.languages.map((lang) => ({
        value: lang.code,
        label: lang.name,
      }));
      console.log('Mapped options:', mapped);
      return mapped;
    }
    
    // Fallback to default languages
    console.log('Using fallback languages');
    return [
      { value: 'en', label: 'English' },
      { value: 'es', label: 'Spanish' },
      { value: 'fr', label: 'French' },
      { value: 'de', label: 'German' },
    ];
  }, [languages]);
  
  console.log('Final language options:', languageOptions);

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
      // Use email as both username and email
      // The backend accepts extended fields even though TypeScript type doesn't include them
      const response = await createPlayer.mutateAsync({
        telegramId: data.email, // Use email as telegramId for now
        telegramUsername: data.email,
        languageCode: data.languageCode,
        username: data.email,
        email: data.email,
        password: data.password,
        displayName: data.displayName,
        phone: data.phone,
      } as any);

      const playerUuid = response.player.playerUuid;
      localStorage.setItem('playerUuid', playerUuid);
      
      toast.success('Account created successfully! Welcome to Betting Payment Manager!');
      
      // Redirect to player dashboard
      navigate('/player/dashboard');
    } catch (error: any) {
      console.error('Registration error:', error);
      
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.message || 
                          error.message || 
                          'Failed to create account';
      
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Button variant="ghost" onClick={() => navigate('/')}>
          <ArrowLeft size={20} />
          Back to Home
        </Button>
        <div className={styles.headerInfo}>
          <h1 className={styles.title}>Player Registration</h1>
          <p className={styles.subtitle}>Create your player profile to start managing transactions</p>
        </div>
      </div>

      <Card variant="elevated" className={styles.card}>
        <CardHeader>
          <div className={styles.cardHeader}>
            <div className={styles.icon}>
              <UserPlus size={32} />
            </div>
            <div>
              <CardTitle>Create Your Account</CardTitle>
              <p className={styles.cardSubtitle}>
                Fill in your details to create a full player account
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
            {/* Account Information Section */}
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Account Information</h3>
              <div className={styles.formGrid}>
                <Input
                  {...register('email')}
                  label="Email Address"
                  type="email"
                  placeholder="player@example.com"
                  error={errors.email?.message}
                  helperText="This will be your login email and username"
                  fullWidth
                  required
                />

                <Input
                  {...register('password')}
                  label="Password"
                  type="password"
                  placeholder="Enter a secure password"
                  error={errors.password?.message}
                  helperText="Minimum 8 characters"
                  fullWidth
                  required
                />

                <Input
                  {...register('displayName')}
                  label="Full Name"
                  placeholder="Your full name"
                  error={errors.displayName?.message}
                  helperText="How you'd like to be addressed"
                  fullWidth
                  required
                />

                <Input
                  {...register('phone')}
                  label="Phone Number (Optional)"
                  placeholder="+1234567890"
                  error={errors.phone?.message}
                  helperText="Your phone number (optional)"
                  fullWidth
                />

                <Select
                  {...register('languageCode')}
                  label="Preferred Language"
                  options={languageOptions}
                  placeholder={
                    loadingLanguages 
                      ? "Loading languages..." 
                      : languagesError 
                      ? "Error loading languages" 
                      : "Select your language"
                  }
                  error={errors.languageCode?.message || (languagesError ? 'Failed to load languages' : undefined)}
                  helperText={
                    languagesError 
                      ? 'Using default languages. You can still proceed with registration.'
                      : 'Choose your preferred language'
                  }
                  fullWidth
                  required
                />
              </div>
            </div>

            <div className={styles.actions}>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/')}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                isLoading={isSubmitting || createPlayer.isPending}
                disabled={loadingLanguages}
              >
                <UserPlus size={16} />
                Create Account
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className={styles.footer}>
        <p className={styles.footerText}>
          Already have a profile? <a href="/player/new-transaction">Create Transaction</a>
        </p>
      </div>
    </div>
  );
};