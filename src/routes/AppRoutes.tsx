import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';

// Layouts
import { Header } from '@/components/Layout/Header';

// Public Pages
import { Landing } from '@/pages/Landing/Landing';
import { Login } from '@/pages/Login/Login';

// Player Pages
import { PlayerLanding } from '@/pages/Player/PlayerLanding/PlayerLanding';
import { PlayerRegistration } from '@/pages/Player/PlayerRegistration/PlayerRegistration';
import { PlayerDashboard } from '@/pages/Player/PlayerDashboard/PlayerDashboard';
import { NewTransaction } from '@/pages/Player/NewTransaction/NewTransaction';
import { PlayerHistory } from '@/pages/Player/PlayerHistory/PlayerHistory';
import { TransactionDetails as PlayerTransactionDetails } from '@/pages/Player/TransactionDetails/TransactionDetails';
import { TempIdLookup } from '@/pages/Player/TempIdLookup/TempIdLookup';

// Agent Pages
import { AgentDashboard } from '@/pages/Agent/AgentDashboard/AgentDashboard';
import { TaskDetails } from '@/pages/Agent/TaskDetails/TaskDetails';

// Admin Pages
import { AdminDashboard } from '@/pages/Admin/AdminDashboard/AdminDashboard';
import { Transactions } from '@/pages/Admin/Transactions/Transactions';
import { TransactionDetails as AdminTransactionDetails } from '@/pages/Admin/TransactionDetails/TransactionDetails';
import { DepositBanks } from '@/pages/Admin/DepositBanks/DepositBanks';
import { WithdrawalBanks } from '@/pages/Admin/WithdrawalBanks/WithdrawalBanks';
import { Templates } from '@/pages/Admin/Templates/Templates';
import { Languages } from '@/pages/Admin/Languages/Languages';
import { Agents } from '@/pages/Admin/Agents/Agents';
import { Users } from '@/pages/Admin/Users/Users';
import { BettingSites } from '@/pages/Admin/BettingSites/BettingSites';

// Shared Pages
import { ChangePassword } from '@/pages/ChangePassword/ChangePassword';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<><Header /><Landing /></>} />
      <Route path="/login" element={<><Header /><Login /></>} />

      {/* Player Routes (Public) */}
      <Route path="/player">
        <Route path="landing" element={<><Header /><PlayerLanding /></>} />
        <Route path="register" element={<><Header /><PlayerRegistration /></>} />
        <Route path="dashboard" element={<><Header /><PlayerDashboard /></>} />
        <Route path="new-transaction" element={<><Header /><NewTransaction /></>} />
        <Route path="history" element={<><Header /><PlayerHistory /></>} />
        <Route path="transaction/:id" element={<><Header /><PlayerTransactionDetails /></>} />
        <Route path="temp-lookup/:tempId" element={<><Header /><TempIdLookup /></>} />
      </Route>

      {/* Agent Routes (Protected) */}
      <Route
        path="/agent"
        element={
          <ProtectedRoute allowedRoles={['agent']}>
            <><Header /><AgentDashboard /></>
          </ProtectedRoute>
        }
      />
      <Route
        path="/agent/task/:id"
        element={
          <ProtectedRoute allowedRoles={['agent']}>
            <><Header /><TaskDetails /></>
          </ProtectedRoute>
        }
      />

      {/* Admin Routes (Protected) */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <><Header /><AdminDashboard /></>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/transactions"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <><Header /><Transactions /></>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/transaction/:id"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <><Header /><AdminTransactionDetails /></>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/deposit-banks"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <><Header /><DepositBanks /></>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/withdrawal-banks"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <><Header /><WithdrawalBanks /></>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/templates"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <><Header /><Templates /></>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/languages"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <><Header /><Languages /></>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/agents"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <><Header /><Agents /></>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <><Header /><Users /></>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/betting-sites"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <><Header /><BettingSites /></>
          </ProtectedRoute>
        }
      />

      {/* Shared Protected Routes */}
      <Route
        path="/change-password"
        element={
          <ProtectedRoute allowedRoles={['admin', 'agent']}>
            <><Header /><ChangePassword /></>
          </ProtectedRoute>
        }
      />

      {/* Catch all - redirect to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

