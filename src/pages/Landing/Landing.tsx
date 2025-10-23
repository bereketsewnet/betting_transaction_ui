import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, DollarSign, Shield, Zap, Users } from 'lucide-react';
import { Button } from '@/components/ui/Button/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card/Card';
import styles from './Landing.module.css';

export const Landing: React.FC = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <DollarSign size={32} />,
      title: 'Fast Transactions',
      description: 'Quick and secure deposit and withdrawal processing',
    },
    {
      icon: <Shield size={32} />,
      title: 'Secure Platform',
      description: 'Bank-grade security for all your transactions',
    },
    {
      icon: <Zap size={32} />,
      title: 'Real-time Updates',
      description: 'Get instant notifications on transaction status',
    },
    {
      icon: <Users size={32} />,
      title: '24/7 Support',
      description: 'Our agents are always ready to assist you',
    },
  ];

  return (
    <div className={styles.container}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>
            Betting Payment Manager
          </h1>
          <p className={styles.heroSubtitle}>
            Secure, fast, and reliable payment processing for betting platforms
          </p>
          <div className={styles.heroActions}>
            <Button
              size="lg"
              onClick={() => navigate('/player/new-transaction')}
            >
              Make a Transaction
              <ArrowRight size={20} />
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate('/player/history')}
            >
              View Transaction History
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className={styles.features}>
        <div className="container">
          <h2 className={styles.sectionTitle}>Why Choose Us</h2>
          <div className={styles.featureGrid}>
            {features.map((feature, index) => (
              <Card key={index} variant="bordered">
                <CardContent>
                  <div className={styles.featureIcon}>{feature.icon}</div>
                  <h3 className={styles.featureTitle}>{feature.title}</h3>
                  <p className={styles.featureDescription}>{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.cta}>
        <div className="container">
          <Card variant="elevated" className={styles.ctaCard}>
            <CardContent>
              <h2 className={styles.ctaTitle}>Ready to Get Started?</h2>
              <p className={styles.ctaDescription}>
                Join thousands of users who trust us with their transactions
              </p>
              <div className={styles.ctaActions}>
                <Button
                  size="lg"
                  onClick={() => navigate('/player/new-transaction')}
                >
                  Create Transaction
                </Button>
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={() => navigate('/login')}
                >
                  Admin/Agent Login
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className="container">
          <p className={styles.footerText}>
            © 2024 Betting Payment Manager. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

