import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { Input } from '@/components/ui/Input/Input';
import { Button } from '@/components/ui/Button/Button';
import { LogIn, User, X } from 'lucide-react';
import styles from './PlayerLogin.module.css';

const loginSchema = z.object({
  username: z.string().min(1, 'Username or email is required'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

interface PlayerLoginProps {
  onClose?: () => void;
}

export const PlayerLogin: React.FC<PlayerLoginProps> = ({ onClose }) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';
      
      console.log('🔍 Player Login - Attempting login with:', data.username);
      
      // Login using auth/login endpoint
      const loginResponse = await fetch(`${apiBaseUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: data.username,
          password: data.password,
        }),
      });

      if (!loginResponse.ok) {
        throw new Error('Invalid credentials');
      }

      const result = await loginResponse.json();
      console.log('✅ Auth login response:', JSON.stringify(result, null, 2));
      
      const user = result.user;
      
      if (!user) {
        throw new Error('Invalid response from server');
      }

      let playerUuid = null;
      
      // Check if playerUuid is directly in the response
      if (result.playerUuid) {
        console.log('✅ Found playerUuid in result:', result.playerUuid);
        playerUuid = result.playerUuid;
      } else if (user.playerUuid) {
        console.log('✅ Found playerUuid in user:', user.playerUuid);
        playerUuid = user.playerUuid;
      }
      
      console.log('🎯 Final playerUuid:', playerUuid);
      
      // If playerUuid found, store it and redirect
      if (playerUuid) {
        console.log('✅ Storing playerUuid and redirecting to dashboard');
        localStorage.setItem('playerUuid', playerUuid);
        localStorage.setItem('playerAccessToken', result.accessToken);
        localStorage.setItem('playerUser', JSON.stringify(user));
        
        toast.success('Player login successful!');
        navigate('/player/dashboard');
        if (onClose) onClose();
      } else {
        // Player UUID not found in auth response - TEMPORARY WORKAROUND
        // Store the access token and user info, dashboard will try to fetch player profile
        console.warn('⚠️ No playerUuid in login response, storing access token for dashboard to resolve');
        console.log('💾 Storing temporary player session with user ID:', user.id);
        
        localStorage.setItem('playerAccessToken', result.accessToken);
        localStorage.setItem('playerRefreshToken', result.refreshToken);
        localStorage.setItem('playerUser', JSON.stringify(user));
        localStorage.setItem('pendingPlayerLookup', 'true');
        
        toast.success('Login successful! Loading dashboard...');
        navigate('/player/dashboard');
        if (onClose) onClose();
      }
    } catch (error: any) {
      console.error('❌ Player login error:', error);
      toast.error(error.message || 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <User size={24} className={styles.icon} />
            <div>
              <h2 className={styles.title}>Player Login</h2>
              <p className={styles.subtitle}>Access your player dashboard</p>
            </div>
          </div>
          {onClose && (
            <button className={styles.closeButton} onClick={onClose}>
              <X size={20} />
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
          <Input
            {...register('username')}
            id="username"
            label="Email or Username"
            placeholder="Enter your email or username"
            error={errors.username?.message}
            fullWidth
            autoComplete="username"
          />

          <Input
            {...register('password')}
            id="password"
            type="password"
            label="Password"
            placeholder="Enter your password"
            error={errors.password?.message}
            fullWidth
            autoComplete="current-password"
          />

          <Button type="submit" fullWidth isLoading={isLoading} className={styles.submitButton}>
            <LogIn size={20} style={{ paddingTop: '6px' }}/>
            Login
          </Button>
        </form>

        <div className={styles.footer}>
          <p className={styles.footerText}>
            Don't have an account?{' '}
            <button onClick={() => navigate('/player/register')} className={styles.linkButton}>
              Register here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

