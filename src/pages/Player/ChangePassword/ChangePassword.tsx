import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card/Card';
import { Input } from '@/components/ui/Input/Input';
import { Button } from '@/components/ui/Button/Button';
import styles from './ChangePassword.module.css';

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

export const PlayerChangePassword: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = React.useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
  });

  const onSubmit = async (data: ChangePasswordFormData) => {
    setIsLoading(true);
    try {
      console.log('🔄 Attempting to change password...');
      
      const accessToken = localStorage.getItem('playerAccessToken');
      if (!accessToken) {
        throw new Error('No access token found. Please login again.');
      }
      
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';
      const response = await fetch(`${apiBaseUrl}/auth/change-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to change password');
      }
      
      console.log('✅ Password changed successfully');
      toast.success('Password changed successfully! Please login again with your new password.');
      reset();
      
      // Clear player session and redirect to login
      localStorage.removeItem('playerUuid');
      localStorage.removeItem('playerAccessToken');
      localStorage.removeItem('playerRefreshToken');
      localStorage.removeItem('playerUser');
      localStorage.removeItem('pendingPlayerLookup');
      
      // Navigate to landing page to login again
      navigate('/');
    } catch (error: unknown) {
      console.error('❌ Password change error:', error);
      const err = error as Error;
      toast.error(err.message || 'Failed to change password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <Card variant="elevated">
          <CardHeader>
            <div className={styles.header}>
              <Lock size={32} />
              <CardTitle>Change Password</CardTitle>
            </div>
            <p className={styles.subtitle}>
              Update your account password
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
              <Input
                label="Current Password"
                type="password"
                {...register('currentPassword')}
                error={errors.currentPassword?.message}
                fullWidth
              />

              <Input
                label="New Password"
                type="password"
                {...register('newPassword')}
                error={errors.newPassword?.message}
                fullWidth
              />

              <Input
                label="Confirm New Password"
                type="password"
                {...register('confirmPassword')}
                error={errors.confirmPassword?.message}
                fullWidth
              />

              <div className={styles.actions}>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/player/dashboard')}
                >
                  Cancel
                </Button>
              <Button
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? 'Changing...' : 'Change Password'}
              </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

