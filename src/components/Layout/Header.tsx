import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogOut, User, Menu, Settings, Database, DollarSign, FileText, Globe, Users, UserCog, Lock, ChevronDown, CreditCard, Building2 } from 'lucide-react';
import { useAuth } from '@/auth/AuthContext';
import { Button } from '@/components/ui/Button/Button';
import styles from './Header.module.css';

interface HeaderProps {
  onMenuClick?: () => void;
  showMenu?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick, showMenu = false }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showAdminMenu, setShowAdminMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showPlayerMenu, setShowPlayerMenu] = useState(false);
  
  // Check if player is logged in (has playerUuid in localStorage)
  const playerUuid = localStorage.getItem('playerUuid');

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.left}>
          {showMenu && onMenuClick && (
            <button className={styles.menuButton} onClick={onMenuClick} aria-label="Toggle menu">
              <Menu size={24} />
            </button>
          )}
          <Link to="/" className={styles.logo}>
            <h1 className={styles.logoText}>Betting Payment Manager</h1>
          </Link>

          {/* Admin Navigation */}
          {isAuthenticated && (typeof user?.role === 'string' ? user.role : user?.role?.name) === 'admin' && (
            <nav className={styles.nav}>
              <Link 
                to="/admin" 
                className={`${styles.navLink} ${isActive('/admin') ? styles.active : ''}`}
              >
                Dashboard
              </Link>
              
              <div 
                className={styles.dropdown}
                onMouseEnter={() => setShowAdminMenu(true)}
                onMouseLeave={() => setShowAdminMenu(false)}
              >
                <button className={styles.dropdownToggle}>
                  <Settings size={16} />
                  Configuration
                  <ChevronDown size={16} />
                </button>
                {showAdminMenu && (
                  <div className={styles.dropdownMenu}>
                    <Link to="/admin/transactions" className={styles.dropdownItem}>
                      <CreditCard size={16} />
                      Transactions
                    </Link>
                    <Link to="/admin/deposit-banks" className={styles.dropdownItem}>
                      <Database size={16} />
                      Deposit Banks
                    </Link>
                    <Link to="/admin/withdrawal-banks" className={styles.dropdownItem}>
                      <DollarSign size={16} />
                      Withdrawal Banks
                    </Link>
                    <Link to="/admin/templates" className={styles.dropdownItem}>
                      <FileText size={16} />
                      Templates
                    </Link>
                    <Link to="/admin/languages" className={styles.dropdownItem}>
                      <Globe size={16} />
                      Languages
                    </Link>
                    <Link to="/admin/agents" className={styles.dropdownItem}>
                      <Users size={16} />
                      Agents
                    </Link>
                    <Link to="/admin/users" className={styles.dropdownItem}>
                      <UserCog size={16} />
                      User Management
                    </Link>
                    <Link to="/admin/betting-sites" className={styles.dropdownItem}>
                      <Building2 size={16} />
                      Betting Sites
                    </Link>
                  </div>
                )}
              </div>
            </nav>
          )}

          {/* Agent Navigation */}
          {isAuthenticated && (typeof user?.role === 'string' ? user.role : user?.role?.name) === 'agent' && (
            <nav className={styles.nav}>
              <Link 
                to="/agent" 
                className={`${styles.navLink} ${isActive('/agent') ? styles.active : ''}`}
              >
                My Tasks
              </Link>
            </nav>
          )}
          
          {/* Player Navigation (when logged in as player) */}
          {!isAuthenticated && playerUuid && (
            <nav className={styles.nav}>
              <Link 
                to="/player/dashboard" 
                className={`${styles.navLink} ${isActive('/player/dashboard') ? styles.active : ''}`}
              >
                Dashboard
              </Link>
              <Link 
                to="/player/new-transaction" 
                className={`${styles.navLink} ${isActive('/player/new-transaction') ? styles.active : ''}`}
              >
                New Transaction
              </Link>
              <Link 
                to="/player/history" 
                className={`${styles.navLink} ${isActive('/player/history') ? styles.active : ''}`}
              >
                History
              </Link>
            </nav>
          )}
        </div>

        <div className={styles.right}>
          {isAuthenticated && user && user.role ? (
            <>
              <div 
                className={styles.userMenu}
                onMouseEnter={() => setShowUserMenu(true)}
                onMouseLeave={() => setShowUserMenu(false)}
              >
                <button className={styles.userInfo}>
                  <User size={20} />
                  <span className={styles.username}>{user.displayName || user.username || 'User'}</span>
                  <span className={styles.role}>({typeof user.role === 'string' ? user.role : user.role?.name || 'unknown'})</span>
                  <ChevronDown size={16} />
                </button>
                {showUserMenu && (
                  <div className={styles.userDropdown}>
                    <Link to="/change-password" className={styles.dropdownItem}>
                      <Lock size={16} />
                      Change Password
                    </Link>
                    <button onClick={handleLogout} className={styles.dropdownItem}>
                      <LogOut size={16} />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : playerUuid ? (
            <div 
              className={styles.userMenu}
              onMouseEnter={() => setShowPlayerMenu(true)}
              onMouseLeave={() => setShowPlayerMenu(false)}
            >
              <button className={styles.userInfo}>
                <User size={20} />
                <span className={styles.username}>Player</span>
                <ChevronDown size={16} />
              </button>
              {showPlayerMenu && (
                <div className={styles.userDropdown}>
                  <Link to="/player/dashboard" className={styles.dropdownItem}>
                    <Database size={16} />
                    Dashboard
                  </Link>
                  <button 
                    onClick={() => {
                      localStorage.removeItem('playerUuid');
                      navigate('/');
                      window.location.reload();
                    }} 
                    className={styles.dropdownItem}
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Button variant="outline" size="sm" onClick={() => navigate('/login')}>
              Login
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

