import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card/Card';
import { Button } from '@/components/ui/Button/Button';
import { Input } from '@/components/ui/Input/Input';
import { Search, UserPlus, User, Eye } from 'lucide-react';
import styles from './PlayerLanding.module.css';

export const PlayerLanding: React.FC = () => {
  const navigate = useNavigate();
  const [tempId, setTempId] = useState('');

  const handleTempIdLookup = () => {
    if (tempId.trim()) {
      navigate(`/player/temp-lookup/${tempId.trim()}`);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Betting Payment Manager</h1>
        <p className={styles.subtitle}>Choose how you'd like to access your transactions</p>
      </div>

      <div className={styles.options}>
        {/* Option 1: No Restriction - View Public Info */}
        <Card variant="elevated" className={styles.optionCard}>
          <CardHeader>
            <div className={styles.optionIcon}>
              <Eye size={32} />
            </div>
            <CardTitle>Public Access</CardTitle>
          </CardHeader>
          <CardContent>
            <p className={styles.optionDescription}>
              View general information about our betting payment services without any restrictions.
            </p>
            <Button 
              variant="outline" 
              onClick={() => navigate('/player/public-info')}
              className={styles.optionButton}
            >
              View Public Information
            </Button>
          </CardContent>
        </Card>

        {/* Option 2: Temp ID Lookup */}
        <Card variant="elevated" className={styles.optionCard}>
          <CardHeader>
            <div className={styles.optionIcon}>
              <Search size={32} />
            </div>
            <CardTitle>Lookup by Temp ID</CardTitle>
          </CardHeader>
          <CardContent>
            <p className={styles.optionDescription}>
              Enter your temporary ID to view your transaction history without creating an account.
            </p>
            <div className={styles.tempIdForm}>
              <Input
                value={tempId}
                onChange={(e) => setTempId(e.target.value)}
                placeholder="Enter your temp ID (e.g., temp_1234567890)"
                className={styles.tempIdInput}
              />
              <Button 
                onClick={handleTempIdLookup}
                disabled={!tempId.trim()}
                className={styles.lookupButton}
              >
                <Search size={16} />
                Lookup Transactions
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Option 3: Full Registration */}
        <Card variant="elevated" className={styles.optionCard}>
          <CardHeader>
            <div className={styles.optionIcon}>
              <UserPlus size={32} />
            </div>
            <CardTitle>Create Account</CardTitle>
          </CardHeader>
          <CardContent>
            <p className={styles.optionDescription}>
              Create a full player account to manage transactions, view detailed history, and access advanced features.
            </p>
            <div className={styles.registrationOptions}>
              <Button 
                variant="primary" 
                onClick={() => navigate('/player/register')}
                className={styles.optionButton}
              >
                <UserPlus size={16} />
                Register New Account
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate('/player/login')}
                className={styles.optionButton}
              >
                <User size={16} />
                Sign In
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className={styles.footer}>
        <p className={styles.footerText}>
          Need help? Contact our support team for assistance with your transactions.
        </p>
      </div>
    </div>
  );
};
