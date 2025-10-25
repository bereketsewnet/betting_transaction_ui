import apiClient from './axios';
import type {
  LoginRequest,
  LoginResponse,
  RefreshTokenResponse,
  ChangePasswordRequest,
  User,
  Player,
  CreatePlayerRequest,
  UpdatePlayerRequest,
  Transaction,
  CreateTransactionRequest,
  UpdateTransactionStatusRequest,
  AssignTransactionRequest,
  ProcessTransactionRequest,
  PaginatedResponse,
  TransactionFilters,
  AgentTaskFilters,
  DepositBank,
  CreateDepositBankRequest,
  UpdateDepositBankRequest,
  WithdrawalBank,
  CreateWithdrawalBankRequest,
  UpdateWithdrawalBankRequest,
  Language,
  CreateLanguageRequest,
  Template,
  CreateTemplateRequest,
  AgentStats,
  UploadResponse,
  UploadConfig,
  WelcomeMessage,
  HealthCheckResponse,
  CreateUserRequest,
  UpdateUserRequest,
  ChangeUserPasswordRequest,
  UserStatistics,
  UserFilters,
  Role,
  ConfigDepositBank,
  ConfigWithdrawalBank,
  UsersResponse,
} from '@/types';

/* ==========================================
   AUTHENTICATION API
   ========================================== */

export const authApi = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/auth/login', data);
    return response.data;
  },

  refresh: async (): Promise<RefreshTokenResponse> => {
    const response = await apiClient.post<RefreshTokenResponse>('/auth/refresh');
    return response.data;
  },

  getProfile: async (): Promise<User> => {
    const response = await apiClient.get<User>('/auth/profile');
    return response.data;
  },

  changePassword: async (data: ChangePasswordRequest): Promise<void> => {
    await apiClient.put('/auth/change-password', data);
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
  },
};

/* ==========================================
   PLAYER API
   ========================================== */

export const playerApi = {
  create: async (data: CreatePlayerRequest): Promise<{ player: Player }> => {
    const response = await apiClient.post<{ player: Player }>('/players', data);
    return response.data;
  },

  getByUuid: async (playerUuid: string): Promise<{ player: Player }> => {
    const response = await apiClient.get<{ player: Player }>(`/players/${playerUuid}`);
    return response.data;
  },

  update: async (
    playerUuid: string,
    data: UpdatePlayerRequest
  ): Promise<{ player: Player }> => {
    const response = await apiClient.put<{ player: Player }>(`/players/${playerUuid}`, data);
    return response.data;
  },
};

/* ==========================================
   TRANSACTION API
   ========================================== */

export const transactionApi = {
  create: async (data: CreateTransactionRequest): Promise<{ transaction: Transaction }> => {
    // Check if there's a file upload
    if (data.screenshot) {
      // Use FormData for file uploads
      const formData = new FormData();
      formData.append('playerUuid', data.playerUuid);
      formData.append('type', data.type);
      formData.append('amount', data.amount.toString());
      formData.append('currency', data.currency);

      if (data.depositBankId) {
        formData.append('depositBankId', data.depositBankId.toString());
      }
      if (data.withdrawalBankId) {
        formData.append('withdrawalBankId', data.withdrawalBankId.toString());
      }
      if (data.withdrawalAddress) {
        formData.append('withdrawalAddress', data.withdrawalAddress);
      }
      if (data.bettingSiteId) {
        formData.append('bettingSiteId', data.bettingSiteId.toString());
      }
      if (data.playerSiteId) {
        formData.append('playerSiteId', data.playerSiteId);
      }
      formData.append('screenshot', data.screenshot);

      const response = await apiClient.post<{ transaction: Transaction }>(
        '/transactions',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data;
    } else {
      // Use JSON for transactions without file uploads
      const jsonData: any = {
        playerUuid: data.playerUuid,
        type: data.type,
        amount: data.amount,
        currency: data.currency,
      };

      if (data.depositBankId) {
        jsonData.depositBankId = data.depositBankId;
      }
      if (data.withdrawalBankId) {
        jsonData.withdrawalBankId = data.withdrawalBankId;
      }
      if (data.withdrawalAddress) {
        jsonData.withdrawalAddress = data.withdrawalAddress;
      }
      if (data.bettingSiteId) {
        jsonData.bettingSiteId = data.bettingSiteId;
      }
      if (data.playerSiteId) {
        jsonData.playerSiteId = data.playerSiteId;
      }

      const response = await apiClient.post<{ transaction: Transaction }>(
        '/transactions',
        jsonData,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data;
    }
  },

  getById: async (id: number, playerUuid?: string): Promise<{ transaction: Transaction }> => {
    const params = playerUuid ? { player_uuid: playerUuid } : {};
    const response = await apiClient.get<{ transaction: Transaction }>(
      `/transactions/${id}`,
      { params }
    );
    
    // Debug logging
    console.log('Raw transaction by ID response:', response.data);
    console.log('Raw transaction object:', response.data.transaction);
    if (response.data.transaction) {
      console.log('Raw transaction bettingSite:', response.data.transaction.bettingSite);
      console.log('Raw transaction playerSiteId:', response.data.transaction.playerSiteId);
      console.log('Raw transaction bettingSiteId:', response.data.transaction.bettingSiteId);
    }
    
    return response.data;
  },

  getByPlayer: async (
    playerUuid: string,
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedResponse<Transaction>> => {
    const response = await apiClient.get<PaginatedResponse<Transaction>>('/transactions', {
      params: { playerUuid, page, limit },
    });
    return response.data;
  },
};

/* ==========================================
   ADMIN API
   ========================================== */

export const adminApi = {
  // Transactions
  getTransactions: async (
    page: number = 1,
    limit?: number,
    filters?: TransactionFilters
  ): Promise<PaginatedResponse<Transaction>> => {
    const params: any = { page, ...filters };
    if (limit !== undefined) {
      params.limit = limit;
    }
    
    const response = await apiClient.get<{
      transactions: Transaction[];
      pagination: {
        total: number;
        page: number;
        limit: number;
        pages: number;
      };
    }>('/admin/transactions', {
      params,
    });
    
    // Transform the response to match the expected structure
    return {
      data: response.data.transactions,
      pagination: {
        page: response.data.pagination.page,
        limit: response.data.pagination.limit,
        total: response.data.pagination.total,
        totalPages: response.data.pagination.pages,
      },
    };
  },

  assignTransaction: async (id: number, data: AssignTransactionRequest): Promise<void> => {
    await apiClient.put(`/admin/transactions/${id}/assign`, data);
  },

  updateTransactionStatus: async (
    id: number,
    data: UpdateTransactionStatusRequest
  ): Promise<void> => {
    await apiClient.put(`/admin/transactions/${id}/status`, data);
  },

  // Agents
  getAgents: async (): Promise<{ agents: AgentStats[] }> => {
    const response = await apiClient.get<{ agents: AgentStats[] }>('/admin/agents');
    return response.data;
  },

  // Deposit Banks
  getDepositBanks: async (): Promise<{ banks: DepositBank[] }> => {
    const response = await apiClient.get<{ banks: DepositBank[] }>('/admin/deposit-banks');
    return response.data;
  },

  createDepositBank: async (data: CreateDepositBankRequest): Promise<{ bank: DepositBank }> => {
    const response = await apiClient.post<{ bank: DepositBank }>('/admin/deposit-banks', data);
    return response.data;
  },

  updateDepositBank: async (
    id: number,
    data: UpdateDepositBankRequest
  ): Promise<{ bank: DepositBank }> => {
    const response = await apiClient.put<{ bank: DepositBank }>(
      `/admin/deposit-banks/${id}`,
      data
    );
    return response.data;
  },

  deleteDepositBank: async (id: number): Promise<void> => {
    await apiClient.delete(`/admin/deposit-banks/${id}`);
  },

  // Withdrawal Banks
  getWithdrawalBanks: async (): Promise<{ banks: WithdrawalBank[] }> => {
    const response = await apiClient.get<{ banks: WithdrawalBank[] }>(
      '/admin/withdrawal-banks'
    );
    return response.data;
  },

  createWithdrawalBank: async (
    data: CreateWithdrawalBankRequest
  ): Promise<{ bank: WithdrawalBank }> => {
    const response = await apiClient.post<{ bank: WithdrawalBank }>(
      '/admin/withdrawal-banks',
      data
    );
    return response.data;
  },

  updateWithdrawalBank: async (
    id: number,
    data: UpdateWithdrawalBankRequest
  ): Promise<{ bank: WithdrawalBank }> => {
    const response = await apiClient.put<{ bank: WithdrawalBank }>(
      `/admin/withdrawal-banks/${id}`,
      data
    );
    return response.data;
  },

  deleteWithdrawalBank: async (id: number): Promise<void> => {
    await apiClient.delete(`/admin/withdrawal-banks/${id}`);
  },

  // Languages
  getLanguages: async (): Promise<{ languages: Language[] }> => {
    const response = await apiClient.get<{ languages: Language[] }>('/admin/languages');
    return response.data;
  },

  createLanguage: async (data: CreateLanguageRequest): Promise<{ language: Language }> => {
    const response = await apiClient.post<{ language: Language }>('/admin/languages', data);
    return response.data;
  },

  // Templates
  getTemplates: async (): Promise<{ templates: Template[] }> => {
    const response = await apiClient.get<{ templates: Template[] }>('/admin/templates');
    return response.data;
  },

  createTemplate: async (data: CreateTemplateRequest): Promise<{ template: Template }> => {
    const response = await apiClient.post<{ template: Template }>('/admin/templates', data);
    return response.data;
  },

  updateTemplate: async (id: number, data: CreateTemplateRequest): Promise<{ template: Template }> => {
    const response = await apiClient.put<{ template: Template }>(`/admin/templates/${id}`, data);
    return response.data;
  },

  deleteTemplate: async (id: number): Promise<void> => {
    await apiClient.delete(`/admin/templates/${id}`);
  },

  // Update Language
  updateLanguage: async (id: number, data: CreateLanguageRequest): Promise<{ language: Language }> => {
    const response = await apiClient.put<{ language: Language }>(`/admin/languages/${id}`, data);
    return response.data;
  },

  deleteLanguage: async (id: number): Promise<void> => {
    await apiClient.delete(`/admin/languages/${id}`);
  },

  // User Management
  getUsers: async (
    page: number = 1,
    limit: number = 20,
    filters?: UserFilters
  ): Promise<UsersResponse> => {
    const response = await apiClient.get<UsersResponse>(
      '/admin/users',
      {
        params: { page, limit, ...filters },
      }
    );
    return response.data;
  },

  getUserById: async (id: number): Promise<{ user: User }> => {
    const response = await apiClient.get<{ user: User }>(`/admin/users/${id}`);
    return response.data;
  },

  createUser: async (data: CreateUserRequest): Promise<{ user: User }> => {
    const response = await apiClient.post<{ user: User }>('/admin/users', data);
    return response.data;
  },

  updateUser: async (id: number, data: UpdateUserRequest): Promise<{ user: User }> => {
    const response = await apiClient.put<{ user: User }>(`/admin/users/${id}`, data);
    return response.data;
  },

  changeUserPassword: async (id: number, data: ChangeUserPasswordRequest): Promise<void> => {
    await apiClient.put(`/admin/users/${id}/password`, data);
  },

  toggleUserStatus: async (id: number): Promise<{ user: User }> => {
    const response = await apiClient.put<{ user: User }>(`/admin/users/${id}/toggle-status`);
    return response.data;
  },

  deleteUser: async (id: number): Promise<void> => {
    await apiClient.delete(`/admin/users/${id}`);
  },

  getUserStatistics: async (): Promise<{ statistics: UserStatistics }> => {
    const response = await apiClient.get<{ statistics: UserStatistics }>('/admin/users/statistics');
    return response.data;
  },

  getRoles: async (): Promise<{ roles: Role[] }> => {
    const response = await apiClient.get<{ roles: Role[] }>('/admin/roles');
    return response.data;
  },

  // Betting Sites Management
  getBettingSites: async (): Promise<BettingSitesResponse> => {
    const response = await apiClient.get<BettingSite[]>('/admin/betting-sites');
    console.log('Raw admin betting sites response:', response.data);
    
    // Handle different response structures
    if (Array.isArray(response.data)) {
      return {
        bettingSites: response.data,
        total: response.data.length,
      };
    } else if (response.data && typeof response.data === 'object') {
      // If it's an object, try to extract the array
      const data = response.data as any;
      if (data.bettingSites && Array.isArray(data.bettingSites)) {
        return {
          bettingSites: data.bettingSites,
          total: data.total || data.bettingSites.length,
        };
      }
    }
    
    // Fallback: return empty array
    console.warn('Unexpected admin betting sites response structure:', response.data);
    return {
      bettingSites: [],
      total: 0,
    };
  },

  getBettingSite: async (id: number): Promise<{ bettingSite: BettingSite }> => {
    const response = await apiClient.get<{ bettingSite: BettingSite }>(`/admin/betting-sites/${id}`);
    return response.data;
  },

  createBettingSite: async (data: CreateBettingSiteRequest): Promise<{ bettingSite: BettingSite }> => {
    const response = await apiClient.post<{ bettingSite: BettingSite }>('/admin/betting-sites', data);
    return response.data;
  },

  updateBettingSite: async (id: number, data: UpdateBettingSiteRequest): Promise<{ bettingSite: BettingSite }> => {
    const response = await apiClient.put<{ bettingSite: BettingSite }>(`/admin/betting-sites/${id}`, data);
    return response.data;
  },

  toggleBettingSiteStatus: async (id: number): Promise<{ bettingSite: BettingSite }> => {
    const response = await apiClient.put<{ bettingSite: BettingSite }>(`/admin/betting-sites/${id}/toggle-status`);
    return response.data;
  },

  deleteBettingSite: async (id: number): Promise<void> => {
    await apiClient.delete(`/admin/betting-sites/${id}`);
  },
};

/* ==========================================
   AGENT API
   ========================================== */

export const agentApi = {
  getTasks: async (
    page: number = 1,
    limit: number = 10,
    filters?: AgentTaskFilters
  ): Promise<PaginatedResponse<Transaction>> => {
    const response = await apiClient.get<PaginatedResponse<Transaction>>('/agent/tasks', {
      params: { page, limit, ...filters },
    });
    return response.data;
  },

  processTransaction: async (id: number, data: ProcessTransactionRequest): Promise<void> => {
    await apiClient.put(`/agent/transactions/${id}/process`, data);
  },

  uploadEvidence: async (file: File): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post<UploadResponse>('/agent/evidence', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getStats: async (): Promise<AgentStats> => {
    const response = await apiClient.get<AgentStats>('/agent/stats');
    return response.data;
  },
};

/* ==========================================
   CONFIG API (Public)
   ========================================== */

export const configApi = {
  getWelcome: async (lang: string = 'en'): Promise<WelcomeMessage> => {
    const response = await apiClient.get<WelcomeMessage>('/config/welcome', {
      params: { lang },
    });
    return response.data;
  },

  getDepositBanks: async (): Promise<{ banks: ConfigDepositBank[] }> => {
    const response = await apiClient.get<{ banks: ConfigDepositBank[] }>('/config/deposit-banks');
    return response.data;
  },

  getWithdrawalBanks: async (): Promise<{ banks: ConfigWithdrawalBank[] }> => {
    const response = await apiClient.get<{ banks: ConfigWithdrawalBank[] }>(
      '/config/withdrawal-banks'
    );
    return response.data;
  },

  getBettingSites: async (): Promise<BettingSitesResponse> => {
    const response = await apiClient.get<BettingSite[]>('/config/betting-sites');
    console.log('Raw betting sites response:', response.data);
    
    // Handle different response structures
    if (Array.isArray(response.data)) {
      return {
        bettingSites: response.data,
        total: response.data.length,
      };
    } else if (response.data && typeof response.data === 'object') {
      // If it's an object, try to extract the array
      const data = response.data as any;
      if (data.bettingSites && Array.isArray(data.bettingSites)) {
        return {
          bettingSites: data.bettingSites,
          total: data.total || data.bettingSites.length,
        };
      }
    }
    
    // Fallback: return empty array
    console.warn('Unexpected betting sites response structure:', response.data);
    return {
      bettingSites: [],
      total: 0,
    };
  },

  getLanguages: async (): Promise<{ languages: Language[] }> => {
    const response = await apiClient.get<{ languages: Language[] }>('/config/languages');
    return response.data;
  },
};

/* ==========================================
   UPLOAD API
   ========================================== */

export const uploadApi = {
  uploadFile: async (file: File, onProgress?: (progress: number) => void): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post<UploadResponse>('/uploads', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    });
    return response.data;
  },

  getConfig: async (): Promise<UploadConfig> => {
    const response = await apiClient.get<UploadConfig>('/uploads/config');
    return response.data;
  },

  deleteFile: async (filename: string): Promise<void> => {
    await apiClient.delete(`/uploads/${filename}`);
  },
};

/* ==========================================
   SYSTEM API
   ========================================== */

export const systemApi = {
  healthCheck: async (): Promise<HealthCheckResponse> => {
    const response = await apiClient.get<HealthCheckResponse>('/health');
    return response.data;
  },

  getMetrics: async (): Promise<unknown> => {
    const response = await apiClient.get('/metrics');
    return response.data;
  },
};

