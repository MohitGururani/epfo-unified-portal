import {
  User,
  KYCRecord,
  EmploymentRecord,
  PFAccount,
  ContributionRecord,
  Claim,
  ClaimStatusHistoryItem,
  Grievance,
  Nomination,
  TransferRequest,
  AppNotification,
  AuditLog
} from './types.js';

class Database {
  users: User[] = [];
  kyc: KYCRecord[] = [];
  employment: EmploymentRecord[] = [];
  pfAccounts: PFAccount[] = [];
  contributions: ContributionRecord[] = [];
  claims: Claim[] = [];
  claimStatusHistory: ClaimStatusHistoryItem[] = [];
  grievances: Grievance[] = [];
  nominations: Nomination[] = [];
  transfers: TransferRequest[] = [];
  notifications: AppNotification[] = [];
  auditLogs: AuditLog[] = [];

  constructor() {
    this.seed();
  }

  seed() {
    // 1. Users
    this.users = [
      {
        id: 'usr_emp_01',
        uan: '100982349012',
        name: 'Ramesh Kumar Verma',
        email: 'ramesh.kumar@example.com',
        phone: '+91 98765 43210',
        role: 'EMPLOYEE',
        createdAt: '2022-04-15T09:30:00.000Z',
      },
      {
        id: 'usr_empr_01',
        uan: '200118844332',
        name: 'TechCorp India Solutions Ltd',
        email: 'hr.epf@techcorp.in',
        phone: '+91 80 4567 8900',
        role: 'EMPLOYER',
        createdAt: '2020-01-10T10:00:00.000Z',
      },
      {
        id: 'usr_off_01',
        uan: '300998877665',
        name: 'Sunita Rao, APFC Officer',
        email: 's.rao@epfindia.gov.in',
        phone: '+91 11 2345 6789',
        role: 'OFFICER',
        createdAt: '2019-06-01T08:00:00.000Z',
      },
      {
        id: 'usr_adm_01',
        uan: '400112233445',
        name: 'Central DevOps / System Admin',
        email: 'admin.epfo20@nic.in',
        phone: '+91 11 2617 2661',
        role: 'ADMIN',
        createdAt: '2018-01-01T00:00:00.000Z',
      }
    ];

    // 2. KYC Records
    this.kyc = [
      {
        id: 'kyc_01',
        userId: 'usr_emp_01',
        documentType: 'AADHAAR',
        documentNumber: 'XXXX-XXXX-8921',
        verified: true,
        verifiedAt: '2022-04-16T11:20:00.000Z',
        status: 'VERIFIED',
        nameOnDoc: 'Ramesh Kumar Verma',
      },
      {
        id: 'kyc_02',
        userId: 'usr_emp_01',
        documentType: 'PAN',
        documentNumber: 'ABCDE1234F',
        verified: true,
        verifiedAt: '2022-04-18T14:40:00.000Z',
        status: 'VERIFIED',
        nameOnDoc: 'RAMESH K VERMA',
      },
      {
        id: 'kyc_03',
        userId: 'usr_emp_01',
        documentType: 'BANK_ACCOUNT',
        documentNumber: '002910100049281 (HDFC Bank)',
        verified: true,
        verifiedAt: '2022-05-02T10:15:00.000Z',
        status: 'VERIFIED',
        nameOnDoc: 'Ramesh Kumar Verma',
      },
      {
        id: 'kyc_04',
        userId: 'usr_emp_01',
        documentType: 'PASSPORT',
        documentNumber: 'Z8920192',
        verified: false,
        status: 'PENDING',
        nameOnDoc: 'Ramesh Kumar Verma',
      }
    ];

    // 3. Employment Records
    this.employment = [
      {
        id: 'emp_rec_01',
        userId: 'usr_emp_01',
        establishmentId: 'DLCPM0019283000',
        establishmentName: 'TechCorp India Solutions Ltd',
        memberId: 'DLCPM00192830000010928',
        dateOfJoining: '2023-02-01',
        currentEmployer: true,
      },
      {
        id: 'emp_rec_02',
        userId: 'usr_emp_01',
        establishmentId: 'BGBNG0048291000',
        establishmentName: 'Infosys Infotech Ltd',
        memberId: 'BGBNG00482910000084729',
        dateOfJoining: '2020-07-15',
        dateOfExit: '2023-01-20',
        exitReason: 'RESIGNATION',
        currentEmployer: false,
      }
    ];

    // 4. PF Accounts
    this.pfAccounts = [
      {
        id: 'pf_acc_01',
        userId: 'usr_emp_01',
        uan: '100982349012',
        memberId: 'DLCPM00192830000010928',
        employeeShare: 424180,
        employerShare: 136820,
        pensionFund: 182400,
        totalBalance: 743400,
        interestEarned: 38450,
        lastUpdated: '2026-08-01T00:00:00.000Z',
      }
    ];

    // 5. Monthly Contributions (including a reconciliation mismatch for demo)
    this.contributions = [
      {
        id: 'cnt_01',
        userId: 'usr_emp_01',
        memberId: 'DLCPM00192830000010928',
        wageMonth: '2026-07',
        epfWages: 65000,
        epsWages: 15000,
        employeeShare: 7800,
        employerShare: 2470,
        pensionShare: 1250,
        expectedTotal: 11520,
        receivedTotal: 11520,
        status: 'MATCHED',
        depositedAt: '2026-08-10T12:00:00.000Z',
        ecrChallanNo: 'ECR2026081098210',
      },
      {
        id: 'cnt_02',
        userId: 'usr_emp_01',
        memberId: 'DLCPM00192830000010928',
        wageMonth: '2026-06',
        epfWages: 65000,
        epsWages: 15000,
        employeeShare: 7800,
        employerShare: 1800, // Discrepancy! Expected 2470
        pensionShare: 1250,
        expectedTotal: 11520,
        receivedTotal: 10850,
        status: 'MISMATCH',
        mismatchReason: 'Employer EPF share under-deposited by ₹670 against wage ceiling schedule.',
        depositedAt: '2026-07-12T11:30:00.000Z',
        ecrChallanNo: 'ECR2026071288471',
      },
      {
        id: 'cnt_03',
        userId: 'usr_emp_01',
        memberId: 'DLCPM00192830000010928',
        wageMonth: '2026-05',
        epfWages: 65000,
        epsWages: 15000,
        employeeShare: 7800,
        employerShare: 2470,
        pensionShare: 1250,
        expectedTotal: 11520,
        receivedTotal: 11520,
        status: 'MATCHED',
        depositedAt: '2026-06-11T14:10:00.000Z',
        ecrChallanNo: 'ECR2026061174921',
      },
      {
        id: 'cnt_04',
        userId: 'usr_emp_01',
        memberId: 'DLCPM00192830000010928',
        wageMonth: '2026-04',
        epfWages: 60000,
        epsWages: 15000,
        employeeShare: 7200,
        employerShare: 2280,
        pensionShare: 1250,
        expectedTotal: 10730,
        receivedTotal: 10730,
        status: 'MATCHED',
        depositedAt: '2026-05-14T09:45:00.000Z',
        ecrChallanNo: 'ECR2026051466391',
      },
      {
        id: 'cnt_05',
        userId: 'usr_emp_01',
        memberId: 'DLCPM00192830000010928',
        wageMonth: '2026-03',
        epfWages: 60000,
        epsWages: 15000,
        employeeShare: 7200,
        employerShare: 2280,
        pensionShare: 1250,
        expectedTotal: 10730,
        receivedTotal: 10730,
        status: 'MATCHED',
        depositedAt: '2026-04-12T16:20:00.000Z',
        ecrChallanNo: 'ECR2026041255102',
      }
    ];

    // 6. Existing Claims
    this.claims = [
      {
        id: 'CLM_2026_98124',
        userId: 'usr_emp_01',
        uan: '100982349012',
        memberId: 'DLCPM00192830000010928',
        claimType: 'FORM_31',
        claimTypeName: 'Form 31 (Advance / Illness & Medical Treatment)',
        purpose: 'Medical Treatment for Family Member',
        amountRequested: 75000,
        amountApproved: 75000,
        status: 'COMPLETED',
        bankAccount: '002910100049281',
        ifscCode: 'HDFC0000029',
        submittedAt: '2026-05-10T10:00:00.000Z',
        completedAt: '2026-05-12T16:30:00.000Z',
        statusHistory: [
          {
            id: 'csh_01',
            claimId: 'CLM_2026_98124',
            status: 'SUBMITTED',
            comment: 'Online claim application received via portal.',
            timestamp: '2026-05-10T10:00:00.000Z',
            performedBy: 'System API Gateway',
          },
          {
            id: 'csh_02',
            claimId: 'CLM_2026_98124',
            status: 'VALIDATING',
            comment: 'Aadhaar demographic matching and format checks passed.',
            timestamp: '2026-05-10T10:02:15.000Z',
            performedBy: 'Worker:claim-worker-01',
          },
          {
            id: 'csh_03',
            claimId: 'CLM_2026_98124',
            status: 'KYC_VERIFICATION',
            comment: 'Bank Account IFSC and PAN successfully validated against NPCI/UIDAI.',
            timestamp: '2026-05-10T10:04:30.000Z',
            performedBy: 'Worker:claim-worker-01',
          },
          {
            id: 'csh_04',
            claimId: 'CLM_2026_98124',
            status: 'ELIGIBILITY_CHECK',
            comment: 'Service tenure > 3 years verified; balance sufficiency confirmed.',
            timestamp: '2026-05-10T10:06:00.000Z',
            performedBy: 'Worker:claim-worker-01',
          },
          {
            id: 'csh_05',
            claimId: 'CLM_2026_98124',
            status: 'APPROVED',
            comment: 'Automated Rule Engine auto-approval granted for Medical Advance < 1 Lakh.',
            timestamp: '2026-05-11T09:00:00.000Z',
            performedBy: 'AutoSettlementEngine-V2',
          },
          {
            id: 'csh_06',
            claimId: 'CLM_2026_98124',
            status: 'PAYMENT_INITIATED',
            comment: 'NEFT credit mandate dispatched to RBI clearinghouse.',
            timestamp: '2026-05-12T11:15:00.000Z',
            performedBy: 'BankingDisbursementService',
          },
          {
            id: 'csh_07',
            claimId: 'CLM_2026_98124',
            status: 'COMPLETED',
            comment: 'UTR NEFT credit confirmation received (UTR: HDFCR5202605128912).',
            timestamp: '2026-05-12T16:30:00.000Z',
            performedBy: 'DisbursementWorker',
          }
        ]
      }
    ];

    // 7. Nominations
    this.nominations = [
      {
        id: 'nom_01',
        userId: 'usr_emp_01',
        nomineeName: 'Pooja Ramesh Verma',
        relationship: 'SPOUSE',
        dateOfBirth: '1992-11-14',
        sharePercentage: 70,
        isMinor: false,
        aadhaarLast4: '4192',
        eSigned: true,
        submittedAt: '2023-03-10T14:00:00.000Z',
      },
      {
        id: 'nom_02',
        userId: 'usr_emp_01',
        nomineeName: 'Aarav Ramesh Verma',
        relationship: 'SON',
        dateOfBirth: '2018-05-20',
        sharePercentage: 30,
        isMinor: true,
        guardianName: 'Pooja Ramesh Verma',
        aadhaarLast4: '9912',
        eSigned: true,
        submittedAt: '2023-03-10T14:00:00.000Z',
      }
    ];

    // 8. Transfers
    this.transfers = [
      {
        id: 'trf_01',
        trackingId: 'TRF2023021982',
        userId: 'usr_emp_01',
        previousEstablishment: 'Infosys Infotech Ltd (BGBNG0048291000)',
        previousMemberId: 'BGBNG00482910000084729',
        presentEstablishment: 'TechCorp India Solutions Ltd (DLCPM0019283000)',
        presentMemberId: 'DLCPM00192830000010928',
        attestationThrough: 'PRESENT_EMPLOYER',
        status: 'TRANSFER_COMPLETED',
        submittedAt: '2023-02-20T11:00:00.000Z',
        completedAt: '2023-03-05T15:30:00.000Z',
      }
    ];

    // 9. Grievances
    this.grievances = [
      {
        id: 'grv_01',
        registrationNumber: 'EPFOG/E/2026/00198',
        userId: 'usr_emp_01',
        uan: '100982349012',
        category: 'PASSBOOK_ERROR',
        subject: 'Contribution Mismatch in June 2026 Wage Month',
        description: 'Employer has short-deposited ₹670 in EPF share for June 2026. Requesting audit correction with employer TechCorp.',
        status: 'UNDER_EXAMINATION',
        registeredAt: '2026-07-20T15:30:00.000Z',
        assignedOfficer: 'Sunita Rao, APFC Officer',
      }
    ];

    // 10. Notifications
    this.notifications = [
      {
        id: 'notif_01',
        userId: 'usr_emp_01',
        title: 'Contribution Mismatch Detected',
        message: 'Intelligent Reconciliation Engine flagged a variance of ₹670 for Wage Month 06/2026.',
        type: 'CONTRIBUTION_MISMATCH',
        read: false,
        createdAt: '2026-07-13T10:00:00.000Z',
        deliveryChannels: {
          inApp: true,
          smsSimulated: true,
          emailSimulated: true,
        }
      },
      {
        id: 'notif_02',
        userId: 'usr_emp_01',
        title: 'Claim Settlement Dispatched',
        message: 'Your Form 31 Advance Claim CLM_2026_98124 for ₹75,000 was settled to Bank Account ending in 9281.',
        type: 'CLAIM_APPROVED',
        read: true,
        createdAt: '2026-05-12T16:35:00.000Z',
        deliveryChannels: {
          inApp: true,
          smsSimulated: true,
          emailSimulated: true,
        }
      }
    ];

    // 11. Audit Logs
    this.auditLogs = [
      {
        id: 'aud_01',
        userId: 'usr_emp_01',
        userRole: 'EMPLOYEE',
        action: 'USER_LOGIN_OTP',
        entity: 'User',
        entityId: 'usr_emp_01',
        details: 'Successful two-factor authentication via simulated Aadhaar OTP.',
        result: 'SUCCESS',
        timestamp: new Date().toISOString(),
        ipAddress: '103.21.144.92',
      },
      {
        id: 'aud_02',
        userId: 'usr_sys',
        userRole: 'SYSTEM_WORKER',
        action: 'RECONCILIATION_RUN',
        entity: 'Contribution',
        entityId: 'cnt_02',
        details: 'Automated ECR ledger comparison identified ₹670 employer underpayment.',
        result: 'WARNING',
        timestamp: '2026-07-13T09:59:00.000Z',
        ipAddress: '10.0.4.12',
      }
    ];
  }

  // Audit Helper
  logAudit(entry: Omit<AuditLog, 'id' | 'timestamp'>) {
    const log: AuditLog = {
      ...entry,
      id: `aud_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString(),
    };
    this.auditLogs.unshift(log);
    // Keep max 100 logs in memory
    if (this.auditLogs.length > 100) {
      this.auditLogs.pop();
    }
    return log;
  }
}

export const db = new Database();
