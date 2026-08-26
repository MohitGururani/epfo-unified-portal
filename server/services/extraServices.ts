import { db } from '../db.js';
import { redis } from '../redis.js';
import { KYCRecord, Nomination, TransferRequest, Grievance } from '../types.js';

export const auditService = {
  getLogs(filter?: { entity?: string; action?: string; limit?: number }) {
    let list = db.auditLogs;
    if (filter?.entity) {
      list = list.filter((l) => l.entity.toLowerCase() === filter.entity!.toLowerCase());
    }
    if (filter?.action) {
      list = list.filter((l) => l.action.toLowerCase().includes(filter.action!.toLowerCase()));
    }
    const limit = filter?.limit || 50;
    return {
      total: list.length,
      logs: list.slice(0, limit),
    };
  }
};

export const kycService = {
  getKYC(userId?: string) {
    const list = db.kyc.filter((k) => !userId || k.userId === userId || k.userId === 'usr_emp_01');
    return {
      records: list,
      isFullyCompliant: list.filter((k) => k.verified).length >= 3,
    };
  },

  updateKYC(userId: string, documentType: KYCRecord['documentType'], documentNumber: string, nameOnDoc: string) {
    let existing = db.kyc.find((k) => k.userId === userId && k.documentType === documentType);
    if (existing) {
      existing.documentNumber = documentNumber;
      existing.nameOnDoc = nameOnDoc;
      existing.verified = true;
      existing.verifiedAt = new Date().toISOString();
      existing.status = 'VERIFIED';
    } else {
      existing = {
        id: `kyc_${Date.now()}`,
        userId,
        documentType,
        documentNumber,
        nameOnDoc,
        verified: true,
        verifiedAt: new Date().toISOString(),
        status: 'VERIFIED',
      };
      db.kyc.push(existing);
    }

    db.logAudit({
      userId,
      userRole: 'EMPLOYEE',
      action: 'KYC_UPDATED_VERIFIED',
      entity: 'KYC',
      entityId: existing.id,
      details: `${documentType} successfully validated and linked.`,
      result: 'SUCCESS',
      ipAddress: '103.21.144.92',
    });

    return { success: true, record: existing };
  }
};

export const nominationService = {
  getNominations(userId?: string) {
    return db.nominations.filter((n) => !userId || n.userId === userId || n.userId === 'usr_emp_01');
  },

  addNomination(userId: string, nominee: Omit<Nomination, 'id' | 'userId' | 'submittedAt'>) {
    const newNom: Nomination = {
      id: `nom_${Date.now()}`,
      userId,
      ...nominee,
      submittedAt: new Date().toISOString(),
    };
    db.nominations.push(newNom);

    db.logAudit({
      userId,
      userRole: 'EMPLOYEE',
      action: 'NOMINATION_E_SIGNED',
      entity: 'Nomination',
      entityId: newNom.id,
      details: `Nominee ${newNom.nomineeName} (${newNom.sharePercentage}%) registered with Aadhaar e-Sign.`,
      result: 'SUCCESS',
      ipAddress: '103.21.144.92',
    });

    return { success: true, nomination: newNom };
  }
};

export const transferService = {
  getTransfers(userId?: string) {
    return db.transfers.filter((t) => !userId || t.userId === userId || t.userId === 'usr_emp_01');
  },

  submitTransfer(userId: string, data: {
    previousEstablishment: string;
    previousMemberId: string;
    presentEstablishment: string;
    presentMemberId: string;
    attestationThrough: 'PREVIOUS_EMPLOYER' | 'PRESENT_EMPLOYER';
  }) {
    const trackingId = `TRF${new Date().getFullYear()}${Math.floor(100000 + Math.random() * 900000)}`;
    const newTransfer: TransferRequest = {
      id: `trf_${Date.now()}`,
      trackingId,
      userId,
      ...data,
      status: 'PENDING_EMPLOYER_ATTESTATION',
      submittedAt: new Date().toISOString(),
    };
    db.transfers.unshift(newTransfer);

    db.logAudit({
      userId,
      userRole: 'EMPLOYEE',
      action: 'PF_TRANSFER_REQUEST',
      entity: 'Transfer',
      entityId: trackingId,
      details: `One Member One PF transfer initiated from ${data.previousMemberId} to ${data.presentMemberId}.`,
      result: 'SUCCESS',
      ipAddress: '103.21.144.92',
    });

    return { success: true, transfer: newTransfer, trackingId };
  }
};

export const grievanceService = {
  getGrievances(userId?: string) {
    return db.grievances.filter((g) => !userId || g.userId === userId || g.userId === 'usr_emp_01');
  },

  lodgeGrievance(userId: string, data: {
    category: Grievance['category'];
    subject: string;
    description: string;
  }) {
    const regNo = `EPFOG/E/${new Date().getFullYear()}/${Math.floor(10000 + Math.random() * 90000)}`;
    const newGrievance: Grievance = {
      id: `grv_${Date.now()}`,
      registrationNumber: regNo,
      userId,
      uan: '100982349012',
      ...data,
      status: 'REGISTERED',
      registeredAt: new Date().toISOString(),
      assignedOfficer: 'Sunita Rao, APFC Officer',
    };
    db.grievances.unshift(newGrievance);

    db.logAudit({
      userId,
      userRole: 'EMPLOYEE',
      action: 'GRIEVANCE_LODGED',
      entity: 'Grievance',
      entityId: regNo,
      details: `EPFiGMS ticket logged under category ${data.category}.`,
      result: 'SUCCESS',
      ipAddress: '103.21.144.92',
    });

    return { success: true, grievance: newGrievance, registrationNumber: regNo };
  }
};
