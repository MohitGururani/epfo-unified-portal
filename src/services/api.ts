import {
  User,
  PFAccountBalance,
  ContributionRecord,
  Claim,
  KYCRecord,
  EmploymentRecord,
  Nomination,
  TransferRequest,
  Grievance,
  AppNotification,
  AuditLog,
  SystemStats,
  Role,
  ClaimType
} from '../types';

// Dynamic API Base URL (uses VITE_API_URL if configured, otherwise defaults to /api)
const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');

let authToken: string | null = localStorage.getItem('epfo_token');

export const setAuthToken = (token: string | null) => {
  authToken = token;
  if (token) {
    localStorage.setItem('epfo_token', token);
  } else {
    localStorage.removeItem('epfo_token');
  }
};

export const getAuthToken = () => authToken;

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const url = API_BASE ? `${API_BASE}/api${endpoint}` : `/api${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const json = await response.json();
  if (!response.ok || !json.success) {
    throw new Error(json.error || `HTTP error ${response.status}`);
  }

  return json.data !== undefined ? json.data : json;
}

export const api = {
  // Auth
  login: (uan: string, role?: Role) =>
    request<{ token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ uan, role }),
    }),
  register: (payload: {
    name: string;
    uan?: string;
    email: string;
    phone: string;
    role?: Role;
    aadhaarNumber?: string;
    panNumber?: string;
    establishmentName?: string;
    initialBalance?: number;
  }) =>
    request<{ token: string; user: User; message: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  verifyOtp: (uan: string, otp: string) =>
    request<{ token: string; user: User; verified: boolean }>('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ uan, otp }),
    }),
  getMe: () => request<{ user: User }>('/auth/me'),
  switchRole: (role: Role) =>
    request<{ token: string; user: User }>('/auth/switch-role', {
      method: 'POST',
      body: JSON.stringify({ role }),
    }),

  // PF Service
  getBalance: () => request<PFAccountBalance>('/pf/balance'),
  getContributions: () =>
    request<{ contributions: ContributionRecord[]; summary: any }>('/pf/contributions'),
  getPassbook: () => request<{ balance: PFAccountBalance; transactions: ContributionRecord[]; employment: EmploymentRecord[]; interestAccruedAnnual: number }>('/pf/passbook'),
  getEmploymentHistory: () => request<EmploymentRecord[]>('/pf/employment-history'),

  // Claims
  getClaims: () => request<Claim[]>('/claims'),
  getClaimById: (id: string) => request<Claim>(`/claims/${id}`),
  submitClaim: (payload: {
    claimType: ClaimType;
    purpose: string;
    amountRequested: number;
    bankAccount: string;
    ifscCode: string;
  }) =>
    request<{ success: boolean; message: string; claimId: string; claim: Claim; queueJobId: string }>(
      '/claims',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      }
    ),
  officerClaimAction: (claimId: string, action: 'APPROVE' | 'REJECT', note?: string, officerName?: string) =>
    request<{ success: boolean; claim: Claim }>(`/claims/${claimId}/action`, {
      method: 'POST',
      body: JSON.stringify({ action, note, officerName }),
    }),

  // Reconciliation
  getMismatches: () =>
    request<{ mismatches: ContributionRecord[]; count: number; totalDiscrepancyAmount: number }>(
      '/reconciliation/mismatches'
    ),
  resolveMismatch: (recordId: string, resolutionNote?: string) =>
    request<{ success: boolean; record: ContributionRecord; message: string }>(
      '/reconciliation/resolve',
      {
        method: 'POST',
        body: JSON.stringify({ recordId, resolutionNote }),
      }
    ),
  simulateEcrUpload: (data: {
    wageMonth: string;
    epfWages: number;
    epsWages: number;
    employeeShare: number;
    employerShare: number;
    pensionShare: number;
  }) =>
    request<{ success: boolean; contribution: ContributionRecord; isMismatch: boolean }>(
      '/reconciliation/simulate-ecr',
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    ),

  // Notifications
  getNotifications: () =>
    request<{ notifications: AppNotification[]; unreadCount: number }>('/notifications'),
  markNotificationsRead: () => request<{ success: boolean }>('/notifications/read-all', { method: 'POST' }),

  // KYC
  getKYC: () => request<{ records: KYCRecord[]; isFullyCompliant: boolean }>('/kyc'),
  updateKYC: (documentType: KYCRecord['documentType'], documentNumber: string, nameOnDoc: string) =>
    request<{ success: boolean; record: KYCRecord }>('/kyc/update', {
      method: 'POST',
      body: JSON.stringify({ documentType, documentNumber, nameOnDoc }),
    }),

  // Nominations
  getNominations: () => request<Nomination[]>('/nominations'),
  addNomination: (nominee: Omit<Nomination, 'id' | 'userId' | 'submittedAt'>) =>
    request<{ success: boolean; nomination: Nomination }>('/nominations', {
      method: 'POST',
      body: JSON.stringify(nominee),
    }),

  // Transfers
  getTransfers: () => request<TransferRequest[]>('/transfers'),
  submitTransfer: (data: {
    previousEstablishment: string;
    previousMemberId: string;
    presentEstablishment: string;
    presentMemberId: string;
    attestationThrough: 'PREVIOUS_EMPLOYER' | 'PRESENT_EMPLOYER';
  }) =>
    request<{ success: boolean; transfer: TransferRequest; trackingId: string }>('/transfers', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Grievances
  getGrievances: () => request<Grievance[]>('/grievances'),
  lodgeGrievance: (data: {
    category: Grievance['category'];
    subject: string;
    description: string;
  }) =>
    request<{ success: boolean; grievance: Grievance; registrationNumber: string }>('/grievances', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Audit Logs
  getAuditLogs: (filter?: { entity?: string; action?: string; limit?: number }) =>
    request<{ total: number; logs: AuditLog[] }>(
      `/audit/logs?entity=${filter?.entity || ''}&action=${filter?.action || ''}&limit=${filter?.limit || 50}`
    ),

  // System Stats
  getSystemStats: () => request<SystemStats>('/system/stats'),
};
