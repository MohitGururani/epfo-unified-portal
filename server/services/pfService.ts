import { db } from '../db.js';
import { redis } from '../redis.js';

export const pfService = {
  getBalance(userId: string) {
    const user = db.users.find((u) => u.id === userId);
    const uan = user?.uan || '100982349012';

    // Check Redis cache first
    const cacheKey = `pf:summary:${uan}`;
    const cached = redis.get(cacheKey);
    if (cached) {
      return {
        ...cached,
        _source: 'REDIS_CACHE_HIT',
      };
    }

    const pfAcc = db.pfAccounts.find((p) => p.userId === userId || p.uan === uan);
    if (!pfAcc) {
      throw new Error('PF Account not found for user.');
    }

    const response = {
      uan: pfAcc.uan,
      memberId: pfAcc.memberId,
      employeeShare: pfAcc.employeeShare,
      employerShare: pfAcc.employerShare,
      pensionFund: pfAcc.pensionFund,
      totalBalance: pfAcc.totalBalance,
      interestEarned: pfAcc.interestEarned,
      interestRate: 8.25,
      financialYear: '2025-2026',
      lastUpdated: pfAcc.lastUpdated,
      _source: 'POSTGRESQL_DB_QUERY',
    };

    // Cache in Redis for 120s
    redis.set(cacheKey, response, 120);

    return response;
  },

  getContributions(userId: string) {
    const contributions = db.contributions
      .filter((c) => c.userId === userId || c.userId === 'usr_emp_01')
      .sort((a, b) => b.wageMonth.localeCompare(a.wageMonth));

    const totalEmployeePaid = contributions.reduce((acc, c) => acc + c.employeeShare, 0);
    const totalEmployerPaid = contributions.reduce((acc, c) => acc + c.employerShare, 0);
    const totalPensionPaid = contributions.reduce((acc, c) => acc + c.pensionShare, 0);

    return {
      contributions,
      summary: {
        totalEmployeePaid,
        totalEmployerPaid,
        totalPensionPaid,
        recordCount: contributions.length,
        hasDiscrepancy: contributions.some((c) => c.status === 'MISMATCH'),
      }
    };
  },

  getPassbook(userId: string) {
    const balance = this.getBalance(userId);
    const { contributions } = this.getContributions(userId);
    const employment = db.employment.filter((e) => e.userId === userId || e.userId === 'usr_emp_01');

    return {
      balance,
      transactions: contributions,
      employment,
      interestAccruedAnnual: Math.round(balance.totalBalance * 0.0825),
      generatedAt: new Date().toISOString(),
    };
  },

  getEmploymentHistory(userId: string) {
    return db.employment.filter((e) => e.userId === userId || e.userId === 'usr_emp_01');
  }
};
