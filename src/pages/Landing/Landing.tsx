import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, 
  DollarSign, 
  Shield, 
  Users, 
  CheckCircle,
  Clock,
  TrendingUp,
  Mail,
  Phone,
  MapPin,
  Search,
  LogIn
} from 'lucide-react';
import { Button } from '@/components/ui/Button/Button';
import { Card, CardContent } from '@/components/ui/Card/Card';
import { PlayerLogin } from '@/components/PlayerLogin/PlayerLogin';
import styles from './Landing.module.css';

export const Landing: React.FC = () => {
  const navigate = useNavigate();
  const heroRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const [showPlayerLogin, setShowPlayerLogin] = useState(false);

  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add(styles.visible);
        }
      });
    }, observerOptions);

    const elements = document.querySelectorAll(`.${styles.fadeInUp}`);
    elements.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const features = [
    {
      icon: <DollarSign size={40} />,
      title: 'Fast Transactions',
      description: 'Process deposits and withdrawals in seconds with our streamlined payment system',
    },
    {
      icon: <Shield size={40} />,
      title: 'Secure & Encrypted',
      description: 'Your transactions are protected with our encryption and security database',
    },
    {
      icon: <Users size={40} />,
      title: '24/7 Support',
      description: 'Our dedicated support team is always available to assist you',
    },
  ];

  const stats = [
    { value: '2K+', label: 'Active Users' },
    { value: '99.9%', label: 'Uptime' },
    { value: '<15min', label: 'Avg. Processing' },
    { value: '5K+', label: 'Transactions/Day' },
  ];

  const benefits = [
    'Instant transaction processing',
    'Multiple payment methods supported',
    'Transparent fee structure',
    'Detailed transaction history',
    'Multi-language support',
  ];

  return (
    <div className={styles.container}>
      {/* Hero Section */}
      <section className={styles.hero} ref={heroRef}>
        <div className={styles.heroBackground}>
          <div className={styles.heroPattern}></div>
        </div>
        <div className={styles.heroContent}>
          <div className={styles.heroText}>
            <h1 className={`${styles.heroTitle} ${styles.fadeInUp}`}>
              Manage Your Betting Payments
              <span className={styles.highlight}> Seamlessly</span>
            </h1>
            <p className={`${styles.heroSubtitle} ${styles.fadeInUp}`}>
              Fast, secure, and reliable payment processing platform for betting transactions. 
              Join thousands of users who trust us with their deposits and withdrawals.
            </p>
            <div className={`${styles.heroActions} ${styles.fadeInUp}`}>
              <Button
                size="lg"
                className={styles.primaryButton}
                onClick={() => navigate('/player/register')}
              >
                Player Registration
                <ArrowRight size={20} style={{ paddingTop: '6px' }} />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className={styles.secondaryButton}
                onClick={() => setShowPlayerLogin(true)}
              >
                <LogIn size={20} style={{ paddingTop: '6px' }} />
                Player Login
              </Button>
              <Button
                variant="outline"
                size="lg"
                className={styles.secondaryButton}
                onClick={() => navigate('/player/new-transaction')}
              >
                <Search size={20} style={{ paddingTop: '6px' }} />
                Transactions
              </Button>
            </div>
            <div className={styles.trustBadges}>
              <div className={styles.badge}>
                <CheckCircle size={16} />
                <span>Secure & Encrypted</span>
              </div>
              <div className={styles.badge}>
                <Clock size={16} />
                <span>24/7 Available</span>
              </div>
              <div className={styles.badge}>
                <TrendingUp size={16} />
                <span>Fast Processing</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className={styles.stats}>
        <div className={styles.statsContainer}>
          {stats.map((stat, index) => (
            <div key={index} className={`${styles.statItem} ${styles.fadeInUp}`}>
              <div className={styles.statValue}>{stat.value}</div>
              <div className={styles.statLabel}>{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className={styles.features} ref={featuresRef}>
        <div className={styles.featuresContainer}>
          <div className={`${styles.sectionHeader} ${styles.fadeInUp}`}>
            <h2 className={styles.sectionTitle}>Why Choose Our Platform</h2>
            <p className={styles.sectionSubtitle}>
              Experience the best payment management system designed for your convenience
            </p>
          </div>
          <div className={styles.featureGrid}>
            {features.map((feature, index) => (
              <Card key={index} className={`${styles.featureCard} ${styles.fadeInUp}`}>
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

      {/* Benefits Section */}
      <section className={styles.benefits}>
        <div className={styles.benefitsContainer}>
          <div className={`${styles.benefitsContent} ${styles.fadeInUp}`}>
            <h2 className={styles.benefitsTitle}>Everything You Need in One Place</h2>
            <p className={styles.benefitsSubtitle}>
              Our platform provides all the tools and features you need for seamless payment management
            </p>
            <div className={styles.benefitsList}>
              {benefits.map((benefit, index) => (
                <div key={index} className={styles.benefitItem}>
                  <CheckCircle size={20} className={styles.benefitIcon} />
                  <span>{benefit}</span>
                </div>
              ))}
            </div>
            <Button
              size="lg"
              onClick={() => navigate('/player/register')}
              className={styles.benefitsButton}
            >
              Get Started Now
              <ArrowRight size={20} style={{ paddingTop: '6px' }}/>
            </Button>
          </div>
          <div className={`${styles.benefitsImage} ${styles.fadeInUp}`}>
            <div className={styles.imagePlaceholder}>
            </div>
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section className={styles.about}>
        <div className={styles.aboutContainer}>
          <div className={`${styles.sectionHeader} ${styles.fadeInUp}`}>
            <h2 className={styles.sectionTitle}>About Us</h2>
            <p className={styles.sectionSubtitle}>
              Your trusted partner in betting payment management
            </p>
          </div>
          <div className={`${styles.aboutContent} ${styles.fadeInUp}`}>
            <p className={styles.aboutText}>
              We are a leading payment management platform dedicated to providing secure, 
              fast, and reliable transaction processing for betting platforms. With years of 
              experience in the industry, we understand the unique needs of our users and 
              strive to deliver the best service possible.
            </p>
            <p className={styles.aboutText}>
              Our mission is to make payment processing seamless and hassle-free, allowing 
              you to focus on what matters most. We employ cutting-edge technology and 
              industry best practices to ensure your transactions are always safe and secure.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className={styles.contact}>
        <div className={styles.contactContainer}>
          <div className={`${styles.sectionHeader} ${styles.fadeInUp}`}>
            <h2 className={styles.sectionTitle}>Get in Touch</h2>
            <p className={styles.sectionSubtitle}>
              Have questions? We're here to help
            </p>
          </div>
          <div className={styles.contactGrid}>
            <Card className={`${styles.contactCard} ${styles.fadeInUp}`}>
              <CardContent>
                <div className={styles.contactIcon}>
                  <Mail size={32} />
                </div>
                <h3 className={styles.contactTitle}>Email Us</h3>
                <p className={styles.contactText}>support@bettingpayment.com</p>
              </CardContent>
            </Card>
            <Card className={`${styles.contactCard} ${styles.fadeInUp}`}>
              <CardContent>
                <div className={styles.contactIcon}>
                  <Phone size={32} />
                </div>
                <h3 className={styles.contactTitle}>Call Us</h3>
                <p className={styles.contactText}>+1 (555) 123-4567</p>
              </CardContent>
            </Card>
            <Card className={`${styles.contactCard} ${styles.fadeInUp}`}>
              <CardContent>
                <div className={styles.contactIcon}>
                  <MapPin size={32} />
                </div>
                <h3 className={styles.contactTitle}>Visit Us</h3>
                <p className={styles.contactText}>123 Payment Street, Finance City</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.cta}>
        <div className={`${styles.ctaContent} ${styles.fadeInUp}`}>
          <h2 className={styles.ctaTitle}>Ready to Get Started?</h2>
          <p className={styles.ctaDescription}>
            Join thousands of satisfied users and experience seamless payment management today
          </p>
          <div className={styles.ctaActions}>
            <Button
              size="lg"
              onClick={() => navigate('/player/register')}
              className={styles.ctaPrimaryButton}
            >
              Create Account
              <ArrowRight size={20} style={{ paddingTop: '6px' }} />
            </Button>
            <Button
              size="lg"
              onClick={() => navigate('/login')}
              className={styles.ctaPrimaryButton}
            >
              Staff Login
              <ArrowRight size={20} style={{ paddingTop: '6px' }} />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerContainer}>
          <div className={styles.footerContent}>
            <div className={styles.footerSection}>
              <h3 className={styles.footerTitle}>Betting Payment Manager</h3>
              <p className={styles.footerText}>
                Your trusted partner for secure and fast betting payment processing.
              </p>
            </div>
            <div className={styles.footerSection}>
              <h4 className={styles.footerHeading}>Quick Links</h4>
              <ul className={styles.footerLinks}>
                <li><a href="/player/register">Register</a></li>
                <li><a href="/player/new-transaction">New Transaction</a></li>
                <li><a href="/login">Staff Login</a></li>
              </ul>
            </div>
            <div className={styles.footerSection}>
              <h4 className={styles.footerHeading}>Support</h4>
              <ul className={styles.footerLinks}>
                <li><a href="#about">About Us</a></li>
                <li><a href="#contact">Contact</a></li>
                <li><a href="#help">Help Center</a></li>
              </ul>
            </div>
          </div>
          <div className={styles.footerBottom}>
            <p className={styles.copyright}>
              © 2024 Betting Payment Manager. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* Player Login Modal */}
      {showPlayerLogin && (
        <PlayerLogin onClose={() => setShowPlayerLogin(false)} />
      )}
    </div>
  );
};

