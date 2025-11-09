import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { useAuth } from '@/auth/AuthContext';
import { Input } from '@/components/ui/Input/Input';
import { Button } from '@/components/ui/Button/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card/Card';
import styles from './Login.module.css';

const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
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
      await login(data.username, data.password);
      toast.success('Login successful!');
      
      // Get user role from localStorage (just set by login function)
      const userRole = localStorage.getItem('userRole');
      
      // Redirect to the page user was trying to access, or to their role's dashboard
      const from = (location.state as any)?.from?.pathname;
      if (from && from !== '/login') {
        navigate(from);
      } else {
        // Redirect based on user role
        if (userRole === 'admin') {
          navigate('/admin');
        } else if (userRole === 'agent') {
          navigate('/agent');
        } else if (userRole === 'player') {
          // Players should use the landing page login
          toast.error('This login section is for Admin and Agent only. Please use the Player Login button on the landing page.');
          navigate('/');
        } else {
          // Fallback: try to get role from stored user object
          const storedUser = localStorage.getItem('user');
          if (storedUser) {
            try {
              const userObj = JSON.parse(storedUser);
              const roleFromUser = typeof userObj.role === 'string' ? userObj.role : userObj.role?.name;
              if (roleFromUser === 'admin') {
                navigate('/admin');
              } else if (roleFromUser === 'agent') {
                navigate('/agent');
              } else {
                navigate('/');
              }
            } catch {
              navigate('/');
            }
          } else {
            navigate('/');
          }
        }
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <Card variant="elevated" className={styles.card}>
          <CardHeader>
            <CardTitle>Login</CardTitle>
            <p className={styles.subtitle}>
              Sign in to access your account
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
              <Input
                {...register('username')}
                id="username"
                label="Username or Email"
                placeholder="Enter your username"
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

              <Button type="submit" fullWidth isLoading={isLoading}>
                Sign In
              </Button>
            </form>

            <div className={styles.divider}>
              <span className={styles.dividerText}>or</span>
            </div>

            <Button
              variant="outline"
              fullWidth
              onClick={() => navigate('/')}
            >
              Back to Home
            </Button>

            <div className={styles.credentials}>
              <p className={styles.credentialTitle}>Default Credentials:</p>
              <div className={styles.credentialList}>
                <div>
                  <strong>Admin:</strong> admin@example.com / AdminPass123!
                </div>
                <div>
                  <strong>Agent:</strong> agent@example.com / AgentPass123!
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

