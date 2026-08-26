export type Role = 'EMPLOYEE' | 'EMPLOYER' | 'OFFICER' | 'ADMIN';

export interface User {
  id: string;
  uan: string;
  name: string;
  email: string;
  phone: string;
  role: Role;
  avatarUrl?: string;
  createdAt: string;
}

export interface KYCRecord {
  id: string;
  userId: string;
  documentType: 'AADHAAR' | 'PAN' | 'BANK_ACCOUNT' | 'PASSPORT';
  documentNumber: string;
  verified: boolean;
  verifiedAt?: string;
  status: 'VERIFIED' | 'PENDING' | 'REJECTED';
  nameOnDoc: string;
}

export interface EmploymentRecord {
  id: string;
  userId: string;
  establishmentId: string;
  establishmentName: string;
  memberId: string;
  dateOfJoining: string;
  dateOfExit?: string;
  exitReason?: string;
  currentEmployer: boolean;
}

export interface PFAccount {
  id: string;
  userId: string;
  uan: string;
  memberId: string;
  employeeShare: number;
  employerShare: number;
  pensionFund: number;
  totalBalance: number;
  interestEarned: number;
  lastUpdated: string;
}

export interface ContributionRecord {
  id: string;
  userId: string;
  memberId: string;
  wageMonth: string; // e.g. "2026-07"
  epfWages: number;
  epsWages: number;
  employeeShare: number;
  employerShare: number;
  pensionShare: number;
  expectedTotal: number;
  receivedTotal: number;
  status: 'MATCHED' | 'MISMATCH' | 'PENDING_RECONCILIATION';
  mismatchReason?: string;
  depositedAt: string;
  ecrChallanNo: string;
}

export type ClaimType = 'FORM_19' | 'FORM_10C' | 'FORM_31';

export type ClaimStatus = 
  | 'SUBMITTED'
  | 'VALIDATING'
  | 'KYC_VERIFICATION'
  | 'ELIGIBILITY_CHECK'
  | 'EPFO_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'PAYMENT_INITIATED'
  | 'COMPLETED';

export interface ClaimStatusHistoryItem {
  id: string;
  claimId: string;
  status: ClaimStatus;
  comment: string;
  timestamp: string;
  performedBy: string; // e.g. "Worker:claim-worker-01", "Officer: Sharma R."
}

export interface Claim {
  id: string;
  userId: string;
  uan: string;
  memberId: string;
  claimType: ClaimType;
  claimTypeName: string;
  purpose: string;
  amountRequested: number;
  amountApproved?: number;
  status: ClaimStatus;
  bankAccount: string;
  ifscCode: string;
  submittedAt: string;
  completedAt?: string;
  rejectionReason?: string;
  statusHistory: ClaimStatusHistoryItem[];
  workerJobId?: string;
}

export interface Grievance {
  id: string;
  registrationNumber: string;
  userId: string;
  uan: string;
  category: 'CLAIM_SETTLEMENT' | 'PASSBOOK_ERROR' | 'TRANSFER_ISSUE' | 'EMPLOYER_DEFAULT' | 'OTHER';
  subject: string;
  description: string;
  status: 'REGISTERED' | 'UNDER_EXAMINATION' | 'RESOLVED' | 'CLOSED';
  registeredAt: string;
  resolution?: string;
  resolvedAt?: string;
  assignedOfficer?: string;
}

export interface Nomination {
  id: string;
  userId: string;
  nomineeName: string;
  relationship: string;
  dateOfBirth: string;
  sharePercentage: number;
  isMinor: boolean;
  guardianName?: string;
  aadhaarLast4: string;
  eSigned: boolean;
  submittedAt: string;
}

export interface TransferRequest {
  id: string;
  trackingId: string;
  userId: string;
  previousEstablishment: string;
  previousMemberId: string;
  presentEstablishment: string;
  presentMemberId: string;
  attestationThrough: 'PREVIOUS_EMPLOYER' | 'PRESENT_EMPLOYER';
  status: 'PENDING_EMPLOYER_ATTESTATION' | 'FIELD_OFFICE_PROCESSING' | 'TRANSFER_COMPLETED';
  submittedAt: string;
  completedAt?: string;
}

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'CLAIM_APPROVED' | 'CLAIM_REJECTED' | 'CONTRIBUTION_MISMATCH' | 'TRANSFER_COMPLETED' | 'KYC_ALERT' | 'SYSTEM';
  read: boolean;
  createdAt: string;
  deliveryChannels: {
    inApp: boolean;
    smsSimulated: boolean;
    emailSimulated: boolean;
  };
}

export interface AuditLog {
  id: string;
  userId: string;
  userRole: string;
  action: string;
  entity: string;
  entityId: string;
  details: string;
  result: 'SUCCESS' | 'FAILURE' | 'WARNING';
  timestamp: string;
  ipAddress: string;
}

export interface QueueJob<T = any> {
  id: string;
  queue: string;
  payload: T;
  status: 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  retryCount: number;
  maxRetries: number;
  createdAt: string;
  processedAt?: string;
  error?: string;
}
