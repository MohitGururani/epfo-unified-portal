import { rabbitmq } from '../rabbitmq.js';
import { db } from '../db.js';
import { redis } from '../redis.js';
import { ClaimStatus, ClaimStatusHistoryItem } from '../types.js';

export function startClaimWorker() {
  console.log('[ClaimWorker] Background claim worker initialized and listening on queue "claims.processing"...');

  rabbitmq.subscribe<{ claimId: string }>('claims.processing', async (job) => {
    const { claimId } = job.payload;
    const claim = db.claims.find((c) => c.id === claimId);

    if (!claim) {
      throw new Error(`Claim with ID ${claimId} not found in database.`);
    }

    console.log(`[ClaimWorker] Starting asynchronous processing pipeline for Claim ${claimId}...`);

    const updateStatus = (
      status: ClaimStatus,
      comment: string,
      performedBy: string = 'Worker:claim-worker-01'
    ) => {
      claim.status = status;
      const historyItem: ClaimStatusHistoryItem = {
        id: `csh_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        claimId: claim.id,
        status,
        comment,
        timestamp: new Date().toISOString(),
        performedBy,
      };
      claim.statusHistory.push(historyItem);
      db.claimStatusHistory.push(historyItem);

      // Invalidate Redis PF cache so user's claim status reflects instantly
      redis.del(`claim:${claim.id}`);
      redis.del(`claims:user:${claim.userId}`);
    };

    // Helper sleep function for phased pipeline demo
    const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

    // Phase 1: VALIDATING (Schema & Demographic checks)
    await sleep(2500);
    updateStatus(
      'VALIDATING',
      'Format checks passed: Member ID DLCPM00192830000010928 authenticated; Aadhaar hash verified with UIDAI CIDR gateway.'
    );

    // Phase 2: KYC_VERIFICATION (Bank Account / NPCI check)
    await sleep(2500);
    updateStatus(
      'KYC_VERIFICATION',
      `Bank IFSC (${claim.ifscCode}) & Account verified with NPCI penny-drop registry. PAN active & seeded.`
    );

    // Phase 3: ELIGIBILITY_CHECK (Service rules, reason validity & balance sufficiency)
    await sleep(2500);
    const userPf = db.pfAccounts.find((p) => p.userId === claim.userId);
    const balance = userPf?.totalBalance || 0;

    if (claim.amountRequested > balance && claim.claimType === 'FORM_19') {
      updateStatus(
        'REJECTED',
        `Eligibility check failed: Requested amount (₹${claim.amountRequested}) exceeds available ledger balance (₹${balance}).`,
        'Worker:eligibility-rules-engine'
      );
      claim.rejectionReason = 'Insufficient balance in member ledger.';

      // Dispatch Notification
      db.notifications.unshift({
        id: `notif_${Date.now()}`,
        userId: claim.userId,
        title: 'Claim Rejected: ' + claim.id,
        message: `Your claim ${claim.id} for ${claim.claimTypeName} could not be approved due to balance constraints.`,
        type: 'CLAIM_REJECTED',
        read: false,
        createdAt: new Date().toISOString(),
        deliveryChannels: { inApp: true, smsSimulated: true, emailSimulated: true },
      });
      return;
    }

    updateStatus(
      'ELIGIBILITY_CHECK',
      `Rule evaluation passed: Valid reason (${claim.purpose}), non-contributory period verified, eligibility score: 100%.`
    );

    // Phase 4: EPFO_REVIEW or AUTO_APPROVAL
    await sleep(2500);
    if (claim.amountRequested <= 100000 && claim.claimType === 'FORM_31') {
      // Auto-approval for Medical / Illness advance under 1 Lakh
      claim.amountApproved = claim.amountRequested;
      updateStatus(
        'APPROVED',
        'Auto-Settlement Engine v2.0 approved instant disbursement under Fast-Track Advance Policy.',
        'AutoSettlementEngine-V2'
      );
    } else {
      updateStatus(
        'EPFO_REVIEW',
        'High value claim queued for digital sign-off by Assistant PF Commissioner (APFC).',
        'Worker:workflow-router'
      );
      await sleep(3000);
      claim.amountApproved = claim.amountRequested;
      updateStatus(
        'APPROVED',
        'Officer Sunita Rao (APFC) approved claim after digital signature verification.',
        'Officer: S. Rao (APFC)'
      );
    }

    // Phase 5: PAYMENT_INITIATED
    await sleep(2500);
    updateStatus(
      'PAYMENT_INITIATED',
      `NEFT Batch Mandate generated for ₹${claim.amountApproved?.toLocaleString('en-IN')}. Sent to RBI CBS/SBI payment gateway.`,
      'DisbursementEngine'
    );

    // Phase 6: COMPLETED
    await sleep(2500);
    const utr = `EPFO20${Date.now().toString().slice(-8)}`;
    claim.completedAt = new Date().toISOString();
    updateStatus(
      'COMPLETED',
      `Settlement funds successfully credited to A/C ending in ${claim.bankAccount.slice(-4)}. NEFT UTR: ${utr}.`,
      'DisbursementWorker'
    );

    // Deduct balance from PF Account
    if (userPf && claim.amountApproved) {
      userPf.employeeShare = Math.max(0, userPf.employeeShare - claim.amountApproved);
      userPf.totalBalance = userPf.employeeShare + userPf.employerShare + userPf.pensionFund;
      userPf.lastUpdated = new Date().toISOString();
      redis.del(`pf:summary:${userPf.uan}`);
    }

    // Dispatch Notification
    const notif = {
      id: `notif_${Date.now()}`,
      userId: claim.userId,
      title: `Claim Settled: ₹${claim.amountApproved?.toLocaleString('en-IN')}`,
      message: `Your ${claim.claimTypeName} (${claim.id}) has been successfully processed & credited. UTR: ${utr}.`,
      type: 'CLAIM_APPROVED' as const,
      read: false,
      createdAt: new Date().toISOString(),
      deliveryChannels: { inApp: true, smsSimulated: true, emailSimulated: true },
    };
    db.notifications.unshift(notif);

    // Audit Logging
    db.logAudit({
      userId: claim.userId,
      userRole: 'WORKER_ASYNC',
      action: 'CLAIM_COMPLETED_DISBURSEMENT',
      entity: 'Claim',
      entityId: claim.id,
      details: `Full automated pipeline executed: ₹${claim.amountApproved} credited via UTR ${utr}.`,
      result: 'SUCCESS',
      ipAddress: '10.0.12.5',
    });

    console.log(`[ClaimWorker] Finished pipeline for Claim ${claimId} successfully.`);
  });
}
