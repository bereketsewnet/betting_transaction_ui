/* ==========================================
   USER & AUTH TYPES
   ========================================== */

export interface User {
  id: number;
  username: string;
  email: string;
  displayName: string;
  roleId: number;
  phone?: string;
  role: {
    id: number;
    name: string;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type UserRole = 'admin' | 'agent' | 'player';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  expiresIn: number;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface Role {
  id: number;
  name: string;
  description?: string;
}

export interface CreateUserRequest {
  username: string;
  password: string;
  displayName: string;
  phone?: string;
  roleId: number;
  isActive?: boolean;
}

export interface UpdateUserRequest {
  username?: string;
  displayName?: string;
  phone?: string;
  roleId?: number;
  isActive?: boolean;
}

export interface ChangeUserPasswordRequest {
  newPassword: string;
}

export interface UserStatistics {
  totalUsers: number;
  roleDistribution: Array<{
    role: string;
    count: number;
  }>;
}

export interface UsersResponse {
  users: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  statistics: UserStatistics;
}

export interface UserFilters {
  role?: number;
  search?: string;
  isActive?: boolean;
}

/* ==========================================
   PLAYER TYPES
   ========================================== */

export interface Player {
  id: number;
  playerUuid: string;
  telegramId: string;
  telegramUsername?: string;
  languageCode: string;
  lastActive: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePlayerRequest {
  telegramId: string;
  telegramUsername?: string;
  languageCode: string;
}

export interface UpdatePlayerRequest {
  telegramId?: string;
  telegramUsername?: string;
  languageCode?: string;
}

/* ==========================================
   TRANSACTION TYPES
   ========================================== */

export interface Transaction {
  id: number;
  transactionUuid: string;
  playerUuid: string;
  type: TransactionType;
  amount: string;
  currency: string;
  status: TransactionStatus;
  depositBankId?: number;
  withdrawalBankId?: number;
  withdrawalAddress?: string;
  screenshotUrl?: string;
  evidenceUrl?: string;
  agentNotes?: string;
  adminNotes?: string;
  assignedAgentId?: number;
  requestedAt: string;
  processedAt?: string;
  createdAt: string;
  updatedAt: string;
  player?: Player;
  depositBank?: DepositBank;
  withdrawalBank?: WithdrawalBank;
  assignedAgent?: User;
}

export type TransactionType = 'DEPOSIT' | 'WITHDRAW';

export type TransactionStatus =
  | 'PENDING'
  | 'IN_PROGRESS'
  | 'SUCCESS'
  | 'FAILED'
  | 'CANCELLED';

export interface CreateTransactionRequest {
  playerUuid: string;
  type: TransactionType;
  amount: number;
  currency: string;
  depositBankId?: number;
  withdrawalBankId?: number;
  withdrawalAddress?: string;
  screenshot?: File;
}

export interface UpdateTransactionStatusRequest {
  status: TransactionStatus;
  adminNotes?: string;
}

export interface AssignTransactionRequest {
  agentId: number;
}

export interface ProcessTransactionRequest {
  status: TransactionStatus;
  agentNotes?: string;
  evidenceUrl?: string;
}

/* ==========================================
   BANK TYPES
   ========================================== */

export interface DepositBank {
  id: number;
  bankName: string;
  accountNumber: string;
  accountName: string;
  notes?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDepositBankRequest {
  bankName: string;
  accountNumber: string;
  accountName: string;
  notes?: string;
  isActive: boolean;
}

export interface UpdateDepositBankRequest {
  bankName?: string;
  accountNumber?: string;
  accountName?: string;
  notes?: string;
  isActive?: boolean;
}

export interface WithdrawalBank {
  id: number;
  bankName: string;
  requiredFields: BankField[];
  notes?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BankField {
  name: string;
  label: string;
  type: 'text' | 'number' | 'email';
  required: boolean;
}

// Config API response types (simplified for public endpoints)
export interface ConfigDepositBank {
  id: number;
  bankName: string;
  accountNumber: string;
  accountName: string;
  notes?: string;
}

export interface ConfigWithdrawalBank {
  id: number;
  bankName: string;
  requiredFields: string; // JSON string that needs to be parsed
  notes?: string;
}

export interface CreateWithdrawalBankRequest {
  bankName: string;
  requiredFields: BankField[];
  notes?: string;
  isActive: boolean;
}

export interface UpdateWithdrawalBankRequest {
  bankName?: string;
  requiredFields?: BankField[];
  notes?: string;
  isActive?: boolean;
}

/* ==========================================
   LANGUAGE & TEMPLATE TYPES
   ========================================== */

export interface Language {
  id: number;
  code: string;
  name: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLanguageRequest {
  code: string;
  name: string;
  isActive: boolean;
}

export interface Template {
  id: number;
  languageCode: string;
  keyName: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTemplateRequest {
  languageCode: string;
  keyName: string;
  content: string;
}

/* ==========================================
   AGENT STATISTICS TYPES
   ========================================== */

export interface AgentStats {
  userId: number;
  displayName: string;
  email: string;
  totalAssigned: number;
  completed: number;
  pending: number;
  successRate: number;
  averageProcessingTime: number;
}

export interface AgentTask extends Transaction {
  // Extended transaction for agent tasks
}

/* ==========================================
   FILE UPLOAD TYPES
   ========================================== */

export interface UploadResponse {
  message: string;
  fileUrl: string;
  filename: string;
}

export interface UploadConfig {
  maxSize: number;
  allowedTypes: string[];
}

/* ==========================================
   PAGINATION TYPES
   ========================================== */

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/* ==========================================
   FILTER & QUERY TYPES
   ========================================== */

export interface TransactionFilters {
  status?: TransactionStatus;
  type?: TransactionType;
  agent?: number;
  playerUuid?: string;
  startDate?: string;
  endDate?: string;
}

export interface AgentTaskFilters {
  status?: TransactionStatus;
}

/* ==========================================
   API RESPONSE TYPES
   ========================================== */

export interface ApiResponse<T = unknown> {
  message?: string;
  data?: T;
  error?: string;
  details?: string[];
}

export interface ErrorResponse {
  error: string;
  details?: string[];
  statusCode?: number;
}

/* ==========================================
   SOCKET EVENT TYPES
   ========================================== */

export interface SocketNotification {
  type: 'transaction:new' | 'transaction:assigned' | 'transaction:update';
  data: Transaction;
  timestamp: string;
}

/* ==========================================
   CONFIG TYPES
   ========================================== */

export interface WelcomeMessage {
  message: string;
  language: string;
}

export interface HealthCheckResponse {
  status: string;
  timestamp: string;
  uptime: number;
  environment: string;
}

/* ==========================================
   DASHBOARD STATISTICS
   ========================================== */

export interface DashboardStats {
  today: {
    deposits: number;
    withdrawals: number;
    total: number;
  };
  week: {
    deposits: number;
    withdrawals: number;
    total: number;
  };
  month: {
    deposits: number;
    withdrawals: number;
    total: number;
  };
  pending: number;
  inProgress: number;
  successRate: number;
}

export interface ChartData {
  date: string;
  deposits: number;
  withdrawals: number;
  total: number;
}

