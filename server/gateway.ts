import { Request, Response, NextFunction, Router } from 'express';
import { authService } from './services/authService.js';
import { pfService } from './services/pfService.js';
import { claimService } from './services/claimService.js';
import { reconciliationService } from './services/reconciliationService.js';
import { notificationService } from './services/notificationService.js';
import { auditService, kycService, nominationService, transferService, grievanceService } from './services/extraServices.js';
import { redis } from './redis.js';
import { rabbitmq } from './rabbitmq.js';
import { db } from './db.js';

export const gatewayRouter = Router();

// Gateway Metrics & Request Logging Tracker
export const gatewayMetrics = {
  totalRequests: 84,
  activeConnections: 1,
  servicesStatus: {
    'auth-service': 'HEALTHY',
    'pf-service': 'HEALTHY',
    'claim-service': 'HEALTHY',
    'reconciliation-service': 'HEALTHY',
    'notification-service': 'HEALTHY',
    'rabbitmq-broker': 'HEALTHY',
    'redis-cache': 'HEALTHY',
    'postgres-db': 'HEALTHY',
  },
  recentLogs: [] as {
    id: string;
    method: string;
    path: string;
    status: number;
    responseTimeMs: number;
    timestamp: string;
    clientIp: string;
  }[]
};

// Middleware: Request Logger & Latency profiler
gatewayRouter.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  gatewayMetrics.totalRequests++;

  res.on('finish', () => {
    const duration = Date.now() - start;
    gatewayMetrics.recentLogs.unshift({
      id: `req_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
      method: req.method,
      path: req.originalUrl,
      status: res.statusCode,
      responseTimeMs: duration,
      timestamp: new Date().toISOString(),
      clientIp: (req.headers['x-forwarded-for'] as string) || req.ip || '127.0.0.1',
    });
    if (gatewayMetrics.recentLogs.length > 50) {
      gatewayMetrics.recentLogs.pop();
    }
  });

  next();
});

// Middleware: Token & Auth Resolver
const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : (req.query.token as string);

  if (token) {
    const user = authService.getUserByToken(token);
    (req as any).user = user;
  } else {
    // Default to first employee user for smooth interactive demo
    (req as any).user = db.users[0];
  }
  next();
};

// ==========================================
// 1. AUTH SERVICE ROUTES (/api/auth/*)
// ==========================================
gatewayRouter.post('/auth/login', (req: Request, res: Response) => {
  try {
    const { uan, password, role } = req.body;
    const result = authService.login(uan, password, role);
    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

gatewayRouter.post('/auth/verify-otp', (req: Request, res: Response) => {
  try {
    const { uan, otp } = req.body;
    const result = authService.verifyOtp(uan, otp);
    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

gatewayRouter.post('/auth/register', (req: Request, res: Response) => {
  try {
    const result = authService.register(req.body);
    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

gatewayRouter.get('/auth/me', authMiddleware, (req: Request, res: Response) => {
  res.json({ success: true, user: (req as any).user });
});

gatewayRouter.post('/auth/switch-role', (req: Request, res: Response) => {
  try {
    const { role } = req.body;
    const result = authService.switchUserRole(role);
    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// ==========================================
// 2. PF SERVICE ROUTES (/api/pf/*)
// ==========================================
gatewayRouter.get('/pf/balance', authMiddleware, (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id || 'usr_emp_01';
    const data = pfService.getBalance(userId);
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

gatewayRouter.get('/pf/contributions', authMiddleware, (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id || 'usr_emp_01';
    const data = pfService.getContributions(userId);
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

gatewayRouter.get('/pf/passbook', authMiddleware, (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id || 'usr_emp_01';
    const data = pfService.getPassbook(userId);
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

gatewayRouter.get('/pf/employment-history', authMiddleware, (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id || 'usr_emp_01';
    const data = pfService.getEmploymentHistory(userId);
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 3. CLAIM SERVICE ROUTES (/api/claims/*)
// ==========================================
gatewayRouter.get('/claims', authMiddleware, (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.role === 'OFFICER' || (req as any).user?.role === 'ADMIN'
      ? undefined
      : (req as any).user?.id;
    const claims = claimService.getClaims(userId);
    res.json({ success: true, data: claims });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

gatewayRouter.get('/claims/:id', (req: Request, res: Response) => {
  try {
    const claim = claimService.getClaimById(req.params.id);
    res.json({ success: true, data: claim });
  } catch (err: any) {
    res.status(404).json({ success: false, error: err.message });
  }
});

gatewayRouter.post('/claims', authMiddleware, (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id || 'usr_emp_01';
    const { claimType, purpose, amountRequested, bankAccount, ifscCode } = req.body;
    
    if (!claimType || !amountRequested) {
      return res.status(400).json({ success: false, error: 'claimType and amountRequested are required.' });
    }

    const result = claimService.createClaim({
      userId,
      claimType,
      purpose,
      amountRequested: Number(amountRequested),
      bankAccount,
      ifscCode,
    });

    res.status(201).json({ success: true, data: result });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

gatewayRouter.post('/claims/:id/action', (req: Request, res: Response) => {
  try {
    const { action, note, officerName } = req.body;
    const result = claimService.officerAction(req.params.id, action, note, officerName);
    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// ==========================================
// 4. RECONCILIATION SERVICE ROUTES (/api/reconciliation/*)
// ==========================================
gatewayRouter.get('/reconciliation/mismatches', authMiddleware, (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.role === 'OFFICER' || (req as any).user?.role === 'ADMIN'
      ? undefined
      : (req as any).user?.id;
    const data = reconciliationService.getMismatches(userId);
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

gatewayRouter.post('/reconciliation/resolve', (req: Request, res: Response) => {
  try {
    const { recordId, resolutionNote } = req.body;
    const result = reconciliationService.reconcileRecord(recordId, resolutionNote);
    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

gatewayRouter.post('/reconciliation/simulate-ecr', (req: Request, res: Response) => {
  try {
    const result = reconciliationService.simulateEmployerECRUpload(req.body);
    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// ==========================================
// 5. NOTIFICATION SERVICE ROUTES (/api/notifications/*)
// ==========================================
gatewayRouter.get('/notifications', authMiddleware, (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id || 'usr_emp_01';
    const data = notificationService.getNotifications(userId);
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

gatewayRouter.post('/notifications/read-all', (req: Request, res: Response) => {
  const result = notificationService.markAsRead();
  res.json({ success: true, data: result });
});

// ==========================================
// 6. EXTRA ENTITY ROUTES (KYC, Nominations, Transfers, Grievances, Audit)
// ==========================================
gatewayRouter.get('/kyc', authMiddleware, (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  res.json({ success: true, data: kycService.getKYC(userId) });
});

gatewayRouter.post('/kyc/update', authMiddleware, (req: Request, res: Response) => {
  const userId = (req as any).user?.id || 'usr_emp_01';
  const { documentType, documentNumber, nameOnDoc } = req.body;
  const result = kycService.updateKYC(userId, documentType, documentNumber, nameOnDoc);
  res.json({ success: true, data: result });
});

gatewayRouter.get('/nominations', authMiddleware, (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  res.json({ success: true, data: nominationService.getNominations(userId) });
});

gatewayRouter.post('/nominations', authMiddleware, (req: Request, res: Response) => {
  const userId = (req as any).user?.id || 'usr_emp_01';
  const result = nominationService.addNomination(userId, req.body);
  res.json({ success: true, data: result });
});

gatewayRouter.get('/transfers', authMiddleware, (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  res.json({ success: true, data: transferService.getTransfers(userId) });
});

gatewayRouter.post('/transfers', authMiddleware, (req: Request, res: Response) => {
  const userId = (req as any).user?.id || 'usr_emp_01';
  const result = transferService.submitTransfer(userId, req.body);
  res.json({ success: true, data: result });
});

gatewayRouter.get('/grievances', authMiddleware, (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  res.json({ success: true, data: grievanceService.getGrievances(userId) });
});

gatewayRouter.post('/grievances', authMiddleware, (req: Request, res: Response) => {
  const userId = (req as any).user?.id || 'usr_emp_01';
  const result = grievanceService.lodgeGrievance(userId, req.body);
  res.json({ success: true, data: result });
});

gatewayRouter.get('/audit/logs', (req: Request, res: Response) => {
  const entity = req.query.entity as string;
  const action = req.query.action as string;
  const limit = req.query.limit ? Number(req.query.limit) : 50;
  res.json({ success: true, data: auditService.getLogs({ entity, action, limit }) });
});

// ==========================================
// 7. SYSTEM OBSERVABILITY & ARCHITECTURE HUB
// ==========================================
gatewayRouter.get('/system/stats', (req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      gateway: {
        totalRequests: gatewayMetrics.totalRequests,
        servicesStatus: gatewayMetrics.servicesStatus,
        recentLogs: gatewayMetrics.recentLogs.slice(0, 15),
      },
      redis: {
        stats: redis.stats,
        activeKeys: redis.keys(),
      },
      rabbitmq: {
        stats: rabbitmq.stats,
        queues: rabbitmq.getQueuesSummary(),
        recentJobs: rabbitmq.getAllJobs().slice(0, 10),
      },
      postgres: {
        tableCounts: {
          users: db.users.length,
          kyc: db.kyc.length,
          employment: db.employment.length,
          pf_accounts: db.pfAccounts.length,
          contributions: db.contributions.length,
          claims: db.claims.length,
          claim_status_history: db.claimStatusHistory.length,
          grievances: db.grievances.length,
          nominations: db.nominations.length,
          transfers: db.transfers.length,
          notifications: db.notifications.length,
          audit_logs: db.auditLogs.length,
        }
      }
    }
  });
});
