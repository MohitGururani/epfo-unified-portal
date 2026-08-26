import { db } from '../db.js';
import { rabbitmq } from '../rabbitmq.js';
import { ContributionRecord } from '../types.js';

export const reconciliationService = {
  getMismatches(userId?: string) {
    let list = db.contributions.filter((c) => c.status === 'MISMATCH');
    if (userId) {
      list = list.filter((c) => c.userId === userId || c.userId === 'usr_emp_01');
    }
    return {
      mismatches: list,
      count: list.length,
      totalDiscrepancyAmount: list.reduce((acc, curr) => acc + (curr.expectedTotal - curr.receivedTotal), 0),
    };
  },

  reconcileRecord(recordId: string, resolutionNote?: string) {
    const record = db.contributions.find((c) => c.id === recordId);
    if (!record) {
      throw new Error('Contribution record not found.');
    }

    const previousStatus = record.status;
    record.receivedTotal = record.expectedTotal;
    record.employerShare = record.expectedTotal - record.employeeShare - record.pensionShare;
    record.status = 'MATCHED';
    record.mismatchReason = undefined;

    // Log audit
    db.logAudit({
      userId: record.userId,
      userRole: 'OFFICER',
      action: 'RECONCILIATION_RESOLVED',
      entity: 'Contribution',
      entityId: record.id,
      details: `Discrepancy resolved for ${record.wageMonth}. Note: ${resolutionNote || 'Employer paid supplementary arrears challan.'}`,
      result: 'SUCCESS',
      ipAddress: '10.0.8.20',
    });

    return {
      success: true,
      record,
      message: `Contribution for wage month ${record.wageMonth} successfully reconciled to ₹${record.receivedTotal}.`,
    };
  },

  simulateEmployerECRUpload(data: {
    wageMonth: string;
    epfWages: number;
    epsWages: number;
    employeeShare: number;
    employerShare: number;
    pensionShare: number;
  }) {
    const expectedEmployee = Math.round(data.epfWages * 0.12);
    const expectedPension = Math.round(Math.min(data.epsWages, 15000) * 0.0833);
    const expectedEmployer = Math.round(data.epfWages * 0.12) - expectedPension;
    const expectedTotal = expectedEmployee + expectedEmployer + expectedPension;
    const receivedTotal = data.employeeShare + data.employerShare + data.pensionShare;

    const isMismatch = receivedTotal !== expectedTotal || data.employerShare < expectedEmployer;
    const mismatchReason = isMismatch
      ? `Employer calculated variance: Deposited ₹${receivedTotal} vs Statutory Expected ₹${expectedTotal} (Difference: ₹${Math.abs(expectedTotal - receivedTotal)}).`
      : undefined;

    const newContribution: ContributionRecord = {
      id: `cnt_${Date.now()}`,
      userId: 'usr_emp_01',
      memberId: 'DLCPM00192830000010928',
      wageMonth: data.wageMonth,
      epfWages: data.epfWages,
      epsWages: data.epsWages,
      employeeShare: data.employeeShare,
      employerShare: data.employerShare,
      pensionShare: data.pensionShare,
      expectedTotal,
      receivedTotal,
      status: isMismatch ? 'MISMATCH' : 'MATCHED',
      mismatchReason,
      depositedAt: new Date().toISOString(),
      ecrChallanNo: `ECR${Date.now().toString().slice(-10)}`,
    };

    db.contributions.unshift(newContribution);

    // Publish event to RabbitMQ
    rabbitmq.publish('reconciliation.events', {
      type: isMismatch ? 'CONTRIBUTION_MISMATCH' : 'CONTRIBUTION_MATCHED',
      contributionId: newContribution.id,
      wageMonth: data.wageMonth,
      difference: expectedTotal - receivedTotal,
    });

    if (isMismatch) {
      // Add notification
      db.notifications.unshift({
        id: `notif_${Date.now()}`,
        userId: 'usr_emp_01',
        title: `Reconciliation Alert: ${data.wageMonth}`,
        message: `Discrepancy of ₹${Math.abs(expectedTotal - receivedTotal)} detected in employer monthly ECR submission.`,
        type: 'CONTRIBUTION_MISMATCH',
        read: false,
        createdAt: new Date().toISOString(),
        deliveryChannels: { inApp: true, smsSimulated: true, emailSimulated: true },
      });
    }

    return {
      success: true,
      contribution: newContribution,
      isMismatch,
    };
  }
};
