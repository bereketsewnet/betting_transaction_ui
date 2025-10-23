import { useMutation, useQuery, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import {
  authApi,
  playerApi,
  transactionApi,
  adminApi,
  agentApi,
  configApi,
  uploadApi,
} from './client';
import type {
  LoginRequest,
  CreatePlayerRequest,
  UpdatePlayerRequest,
  CreateTransactionRequest,
  UpdateTransactionStatusRequest,
  AssignTransactionRequest,
  ProcessTransactionRequest,
  TransactionFilters,
  AgentTaskFilters,
  CreateDepositBankRequest,
  UpdateDepositBankRequest,
  CreateWithdrawalBankRequest,
  UpdateWithdrawalBankRequest,
  CreateLanguageRequest,
  CreateTemplateRequest,
  ChangePasswordRequest,
  CreateUserRequest,
  UpdateUserRequest,
  ChangeUserPasswordRequest,
  UserFilters,
} from '@/types';

/* ==========================================
   QUERY KEYS
   ========================================== */

export const queryKeys = {
  auth: {
    profile: ['auth', 'profile'] as const,
  },
  player: {
    all: ['players'] as const,
    detail: (uuid: string) => ['players', uuid] as const,
  },
  transaction: {
    all: ['transactions'] as const,
    detail: (id: number) => ['transactions', id] as const,
    byPlayer: (uuid: string, page: number, limit: number) =>
      ['transactions', 'player', uuid, page, limit] as const,
  },
  admin: {
    transactions: (page: number, limit: number, filters?: TransactionFilters) =>
      ['admin', 'transactions', page, limit, filters] as const,
    agents: ['admin', 'agents'] as const,
    depositBanks: ['admin', 'deposit-banks'] as const,
    withdrawalBanks: ['admin', 'withdrawal-banks'] as const,
    languages: ['admin', 'languages'] as const,
    templates: ['admin', 'templates'] as const,
    users: (page: number, limit: number, filters?: UserFilters) =>
      ['admin', 'users', page, limit, filters] as const,
    userDetail: (id: number) => ['admin', 'users', id] as const,
    userStatistics: ['admin', 'users', 'statistics'] as const,
    roles: ['admin', 'roles'] as const,
  },
  agent: {
    tasks: (page: number, limit: number, filters?: AgentTaskFilters) =>
      ['agent', 'tasks', page, limit, filters] as const,
    stats: ['agent', 'stats'] as const,
  },
  config: {
    welcome: (lang: string) => ['config', 'welcome', lang] as const,
    depositBanks: ['config', 'deposit-banks'] as const,
    withdrawalBanks: ['config', 'withdrawal-banks'] as const,
    languages: ['config', 'languages'] as const,
  },
};

/* ==========================================
   AUTH HOOKS
   ========================================== */

export const useLogin = () => {
  return useMutation({
    mutationFn: (data: LoginRequest) => authApi.login(data),
  });
};

export const useProfile = (options?: Omit<UseQueryOptions<Awaited<ReturnType<typeof authApi.getProfile>>>, 'queryKey' | 'queryFn'>) => {
  return useQuery({
    queryKey: queryKeys.auth.profile,
    queryFn: () => authApi.getProfile(),
    ...options,
  });
};

export const useChangePassword = () => {
  return useMutation({
    mutationFn: (data: ChangePasswordRequest) => authApi.changePassword(data),
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: () => {
      queryClient.clear();
    },
  });
};

/* ==========================================
   PLAYER HOOKS
   ========================================== */

export const useCreatePlayer = () => {
  return useMutation({
    mutationFn: (data: CreatePlayerRequest) => playerApi.create(data),
  });
};

export const usePlayer = (uuid: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: queryKeys.player.detail(uuid),
    queryFn: () => playerApi.getByUuid(uuid),
    enabled,
  });
};

export const useUpdatePlayer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ uuid, data }: { uuid: string; data: UpdatePlayerRequest }) =>
      playerApi.update(uuid, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.player.detail(variables.uuid) });
    },
  });
};

/* ==========================================
   TRANSACTION HOOKS
   ========================================== */

export const useCreateTransaction = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateTransactionRequest) => transactionApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.transaction.all });
    },
  });
};

export const useTransaction = (id: number, playerUuid?: string) => {
  return useQuery({
    queryKey: queryKeys.transaction.detail(id),
    queryFn: () => transactionApi.getById(id, playerUuid),
  });
};

export const usePlayerTransactions = (playerUuid: string, page: number = 1, limit: number = 10) => {
  return useQuery({
    queryKey: queryKeys.transaction.byPlayer(playerUuid, page, limit),
    queryFn: () => transactionApi.getByPlayer(playerUuid, page, limit),
    enabled: !!playerUuid,
  });
};

/* ==========================================
   ADMIN HOOKS
   ========================================== */

export const useAdminTransactions = (
  page: number = 1,
  limit: number = 20,
  filters?: TransactionFilters
) => {
  return useQuery({
    queryKey: queryKeys.admin.transactions(page, limit, filters),
    queryFn: () => adminApi.getTransactions(page, limit, filters),
  });
};

export const useAssignTransaction = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: AssignTransactionRequest }) =>
      adminApi.assignTransaction(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.transactions(1, 20) });
      queryClient.invalidateQueries({ queryKey: queryKeys.transaction.all });
    },
  });
};

export const useUpdateTransactionStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateTransactionStatusRequest }) =>
      adminApi.updateTransactionStatus(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.transactions(1, 20) });
      queryClient.invalidateQueries({ queryKey: queryKeys.transaction.all });
    },
  });
};

export const useAdminAgents = () => {
  return useQuery({
    queryKey: queryKeys.admin.agents,
    queryFn: () => adminApi.getAgents(),
  });
};

// Deposit Banks
export const useAdminDepositBanks = () => {
  return useQuery({
    queryKey: queryKeys.admin.depositBanks,
    queryFn: () => adminApi.getDepositBanks(),
  });
};

export const useCreateDepositBank = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateDepositBankRequest) => adminApi.createDepositBank(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.depositBanks });
      queryClient.invalidateQueries({ queryKey: queryKeys.config.depositBanks });
    },
  });
};

export const useUpdateDepositBank = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateDepositBankRequest }) =>
      adminApi.updateDepositBank(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.depositBanks });
      queryClient.invalidateQueries({ queryKey: queryKeys.config.depositBanks });
    },
  });
};

export const useDeleteDepositBank = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => adminApi.deleteDepositBank(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.depositBanks });
      queryClient.invalidateQueries({ queryKey: queryKeys.config.depositBanks });
    },
  });
};

// Withdrawal Banks
export const useAdminWithdrawalBanks = () => {
  return useQuery({
    queryKey: queryKeys.admin.withdrawalBanks,
    queryFn: () => adminApi.getWithdrawalBanks(),
  });
};

export const useCreateWithdrawalBank = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateWithdrawalBankRequest) => adminApi.createWithdrawalBank(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.withdrawalBanks });
      queryClient.invalidateQueries({ queryKey: queryKeys.config.withdrawalBanks });
    },
  });
};

export const useUpdateWithdrawalBank = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateWithdrawalBankRequest }) =>
      adminApi.updateWithdrawalBank(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.withdrawalBanks });
      queryClient.invalidateQueries({ queryKey: queryKeys.config.withdrawalBanks });
    },
  });
};

export const useDeleteWithdrawalBank = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => adminApi.deleteWithdrawalBank(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.withdrawalBanks });
      queryClient.invalidateQueries({ queryKey: queryKeys.config.withdrawalBanks });
    },
  });
};

// Languages
export const useAdminLanguages = () => {
  return useQuery({
    queryKey: queryKeys.admin.languages,
    queryFn: () => adminApi.getLanguages(),
  });
};

export const useCreateLanguage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateLanguageRequest) => adminApi.createLanguage(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.languages });
      queryClient.invalidateQueries({ queryKey: queryKeys.config.languages });
    },
  });
};

// Templates
export const useAdminTemplates = () => {
  return useQuery({
    queryKey: queryKeys.admin.templates,
    queryFn: () => adminApi.getTemplates(),
  });
};

export const useCreateTemplate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateTemplateRequest) => adminApi.createTemplate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.templates });
    },
  });
};

export const useUpdateTemplate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: CreateTemplateRequest }) =>
      adminApi.updateTemplate(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.templates });
    },
  });
};

export const useDeleteTemplate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => adminApi.deleteTemplate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.templates });
    },
  });
};

export const useUpdateLanguage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: CreateLanguageRequest }) =>
      adminApi.updateLanguage(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.languages });
      queryClient.invalidateQueries({ queryKey: queryKeys.config.languages });
    },
  });
};

export const useDeleteLanguage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => adminApi.deleteLanguage(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.languages });
      queryClient.invalidateQueries({ queryKey: queryKeys.config.languages });
    },
  });
};

// User Management
export const useAdminUsers = (
  page: number = 1,
  limit: number = 20,
  filters?: UserFilters
) => {
  return useQuery({
    queryKey: queryKeys.admin.users(page, limit, filters),
    queryFn: () => adminApi.getUsers(page, limit, filters),
  });
};

export const useAdminUser = (id: number) => {
  return useQuery({
    queryKey: queryKeys.admin.userDetail(id),
    queryFn: () => adminApi.getUserById(id),
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateUserRequest) => adminApi.createUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.userStatistics });
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.agents });
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateUserRequest }) =>
      adminApi.updateUser(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.userDetail(variables.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.agents });
    },
  });
};

export const useChangeUserPassword = () => {
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ChangeUserPasswordRequest }) =>
      adminApi.changeUserPassword(id, data),
  });
};

export const useToggleUserStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => adminApi.toggleUserStatus(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.userStatistics });
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => adminApi.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.userStatistics });
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.agents });
    },
  });
};

export const useUserStatistics = () => {
  return useQuery({
    queryKey: queryKeys.admin.userStatistics,
    queryFn: () => adminApi.getUserStatistics(),
  });
};

export const useRoles = () => {
  return useQuery({
    queryKey: queryKeys.admin.roles,
    queryFn: () => adminApi.getRoles(),
  });
};

// Betting Sites Hooks
export const useBettingSites = () => {
  return useQuery({
    queryKey: ['config', 'betting-sites'],
    queryFn: () => configApi.getBettingSites(),
  });
};

export const useAdminBettingSites = () => {
  return useQuery({
    queryKey: ['admin', 'betting-sites'],
    queryFn: () => adminApi.getBettingSites(),
  });
};

export const useAdminBettingSite = (id: number) => {
  return useQuery({
    queryKey: ['admin', 'betting-sites', id],
    queryFn: () => adminApi.getBettingSite(id),
    enabled: !!id,
  });
};

export const useCreateBettingSite = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateBettingSiteRequest) => adminApi.createBettingSite(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'betting-sites'] });
    },
  });
};

export const useUpdateBettingSite = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateBettingSiteRequest }) =>
      adminApi.updateBettingSite(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'betting-sites'] });
    },
  });
};

export const useToggleBettingSiteStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => adminApi.toggleBettingSiteStatus(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'betting-sites'] });
    },
  });
};

export const useDeleteBettingSite = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => adminApi.deleteBettingSite(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'betting-sites'] });
    },
  });
};

/* ==========================================
   AGENT HOOKS
   ========================================== */

export const useAgentTasks = (
  page: number = 1,
  limit: number = 10,
  filters?: AgentTaskFilters
) => {
  return useQuery({
    queryKey: queryKeys.agent.tasks(page, limit, filters),
    queryFn: () => agentApi.getTasks(page, limit, filters),
  });
};

export const useProcessTransaction = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ProcessTransactionRequest }) =>
      agentApi.processTransaction(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.agent.tasks(1, 10) });
      queryClient.invalidateQueries({ queryKey: queryKeys.transaction.all });
    },
  });
};

export const useUploadEvidence = () => {
  return useMutation({
    mutationFn: (file: File) => agentApi.uploadEvidence(file),
  });
};

export const useAgentStats = () => {
  return useQuery({
    queryKey: queryKeys.agent.stats,
    queryFn: () => agentApi.getStats(),
  });
};

/* ==========================================
   CONFIG HOOKS (Public)
   ========================================== */

export const useWelcomeMessage = (lang: string = 'en') => {
  return useQuery({
    queryKey: queryKeys.config.welcome(lang),
    queryFn: () => configApi.getWelcome(lang),
  });
};

export const useDepositBanks = () => {
  return useQuery({
    queryKey: queryKeys.config.depositBanks,
    queryFn: () => configApi.getDepositBanks(),
  });
};

export const useWithdrawalBanks = () => {
  return useQuery({
    queryKey: queryKeys.config.withdrawalBanks,
    queryFn: () => configApi.getWithdrawalBanks(),
  });
};

export const useLanguages = () => {
  return useQuery({
    queryKey: queryKeys.config.languages,
    queryFn: () => configApi.getLanguages(),
  });
};

/* ==========================================
   UPLOAD HOOKS
   ========================================== */

export const useUploadFile = () => {
  return useMutation({
    mutationFn: ({ file, onProgress }: { file: File; onProgress?: (progress: number) => void }) =>
      uploadApi.uploadFile(file, onProgress),
  });
};

