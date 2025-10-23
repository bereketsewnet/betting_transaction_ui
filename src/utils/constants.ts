// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';

// App Configuration
export const APP_NAME = import.meta.env.VITE_APP_NAME || 'Betting Payment Manager';
export const APP_VERSION = import.meta.env.VITE_APP_VERSION || '1.0.0';

// Upload Configuration
export const MAX_FILE_SIZE = Number(import.meta.env.VITE_MAX_FILE_SIZE) || 8388608; // 8MB
export const ALLOWED_FILE_TYPES = import.meta.env.VITE_ALLOWED_FILE_TYPES?.split(',') || [
  'image/png',
  'image/jpeg',
  'image/jpg',
];

// Pagination
export const DEFAULT_PAGE_SIZE = Number(import.meta.env.VITE_DEFAULT_PAGE_SIZE) || 10;

// Transaction Statuses
export const TRANSACTION_STATUSES = {
  PENDING: 'PENDING',
  IN_PROGRESS: 'IN_PROGRESS',
  SUCCESS: 'SUCCESS',
  FAILED: 'FAILED',
  CANCELLED: 'CANCELLED',
} as const;

// Transaction Types
export const TRANSACTION_TYPES = {
  DEPOSIT: 'DEPOSIT',
  WITHDRAW: 'WITHDRAW',
} as const;

// User Roles
export const USER_ROLES = {
  ADMIN: 'admin',
  AGENT: 'agent',
  PLAYER: 'player',
} as const;

// Routes
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  PLAYER_NEW_TRANSACTION: '/player/new-transaction',
  PLAYER_HISTORY: '/player/history',
  PLAYER_TRANSACTION: '/player/transaction/:id',
  AGENT_DASHBOARD: '/agent',
  AGENT_TASK: '/agent/task/:id',
  ADMIN_DASHBOARD: '/admin',
  ADMIN_TRANSACTION: '/admin/transaction/:id',
  ADMIN_AGENTS: '/admin/agents',
  ADMIN_CONFIG: '/admin/config',
} as const;

// Local Storage Keys
export const STORAGE_KEYS = {
  PLAYER_UUID: 'playerUuid',
  USER: 'user',
  USER_ROLE: 'userRole',
  LANGUAGE: 'i18nextLng',
} as const;

