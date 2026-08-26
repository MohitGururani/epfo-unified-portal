import { db } from '../db.js';
import { rabbitmq } from '../rabbitmq.js';
import { redis } from '../redis.js';
import { Claim, ClaimType, ClaimStatusHistoryItem } from '../types.js';

export const claimService = {
  getClaims(userId?: string) {
    let list = db.claims;
    if (userId) {
      list = list.filter((c) => c.userId === userId || c.userId === 'usr_emp_01');
    }
    return list.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
  },

  getClaimById(claimId: string) {
    const claim = db.claims.find((c) => c.id === claimId);
    if (!claim) {
      throw new Error(`Claim ${claimId} not found.`);
    }
    return claim;
  },

  createClaim(params: {
    userId: string;
    claimType: ClaimType;
    purpose: string;
    amountRequested: number;
    bankAccount: string;
    ifscCode: string;
  }) {
    const user = db.users.find((u) => u.id === params.userId) || db.users[0];
    const claimId = `CLM_${new Date().getFullYear()}_${Math.floor(10000 + Math.random() * 90000)}`;

    const claimTypeNameMap: Record<ClaimType, string> = {
      FORM_31: 'Form 31 (PF Advance / Illness / Housing)',
      FORM_19: 'Form 19 (Final PF Settlement on Retirement/Exit)',
      FORM_10C: 'Form 10C (EPS Pension Withdrawal Benefit)',
    };

    const initialHistoryItem: ClaimStatusHistoryItem = {
      id: `csh_${Date.now()}_init`,
      claimId,
      status: 'SUBMITTED',
      comment: 'Claim submitted online via EPFO 2.0 Unified Portal. Queued for validation.',
      timestamp: new Date().toISOString(),
      performedBy: 'API Gateway',
    };

    const newClaim: Claim = {
      id: claimId,
      userId: user.id,
      uan: user.uan,
      memberId: 'DLCPM00192830000010928',
      claimType: params.claimType,
      claimTypeName: claimTypeNameMap[params.claimType] || params.claimType,
      purpose: params.purpose || 'Statutory advance under EPFO scheme rules',
      amountRequested: Number(params.amountRequested),
      status: 'SUBMITTED',
      bankAccount: params.bankAccount || '002910100049281',
      ifscCode: params.ifscCode || 'HDFC0000029',
      submittedAt: new Date().toISOString(),
      statusHistory: [initialHistoryItem],
    };

    // 1. Save in DB
    db.claims.unshift(newClaim);
    db.claimStatusHistory.push(initialHistoryItem);

    // 2. Publish to RabbitMQ Message Queue
    const job = rabbitmq.publish('claims.processing', { claimId });
    newClaim.workerJobId = job.id;

    // 3. Clear relevant Redis cache
    redis.del(`claim:${claimId}`);
    redis.del(`claims:user:${user.id}`);

    // 4. Audit Log
    db.logAudit({
      userId: user.id,
      userRole: user.role,
      action: 'CLAIM_SUBMISSION',
      entity: 'Claim',
      entityId: claimId,
      details: `Submitted ${newClaim.claimTypeName} for ₹${newClaim.amountRequested.toLocaleString('en-IN')}. Enqueued job ${job.id} to RabbitMQ.`,
      result: 'SUCCESS',
      ipAddress: '103.21.144.92',
    });

    // 5. Immediate response with Claim ID
    return {
      success: true,
      message: 'Claim registered and queued for asynchronous processing.',
      claimId,
      claim: newClaim,
      queueJobId: job.id,
    };
  },

  officerAction(claimId: string, action: 'APPROVE' | 'REJECT', note?: string, officerName?: string) {
    const claim = db.claims.find((c) => c.id === claimId);
    if (!claim) {
      throw new Error(`Claim ${claimId} not found.`);
    }

    const officer = officerName || 'Officer S. Rao (APFC)';
    if (action === 'APPROVE') {
      claim.status = 'APPROVED';
      claim.amountApproved = claim.amountRequested;
      const historyItem: ClaimStatusHistoryItem = {
        id: `csh_${Date.now()}_off`,
        claimId,
        status: 'APPROVED',
        comment: note || 'Digital approval endorsed by field APFC officer.',
        timestamp: new Date().toISOString(),
        performedBy: officer,
      };
      claim.statusHistory.push(historyItem);
      db.claimStatusHistory.push(historyItem);
    } else {
      claim.status = 'REJECTED';
      claim.rejectionReason = note || 'Rejected due to documentary discrepancies.';
      const historyItem: ClaimStatusHistoryItem = {
        id: `csh_${Date.now()}_off_rej`,
        claimId,
        status: 'REJECTED',
        comment: note || 'Claim rejected by reviewing officer.',
        timestamp: new Date().toISOString(),
        performedBy: officer,
      };
      claim.statusHistory.push(historyItem);
      db.claimStatusHistory.push(historyItem);
    }

    redis.del(`claim:${claimId}`);
    return { success: true, claim };
  }
};
