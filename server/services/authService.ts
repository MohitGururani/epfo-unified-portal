import { db } from '../db.js';
import { redis } from '../redis.js';
import { Role } from '../types.js';

export const authService = {
  login(uan: string, password?: string, role: Role = 'EMPLOYEE') {
    const user = db.users.find((u) => u.uan === uan || (u.role === role && !uan));
    if (!user) {
      throw new Error('Invalid UAN or User not found.');
    }

    // Generate simulated session token
    const token = `epfo_jwt_${user.id}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    
    // Store session in Redis
    redis.set(`session:${token}`, {
      userId: user.id,
      uan: user.uan,
      role: user.role,
      name: user.name,
      createdAt: new Date().toISOString(),
    }, 3600); // 1 hour TTL

    // Audit log
    db.logAudit({
      userId: user.id,
      userRole: user.role,
      action: 'USER_LOGIN',
      entity: 'Session',
      entityId: token.substring(0, 15),
      details: `User ${user.name} (${user.uan}) authenticated with role ${user.role}.`,
      result: 'SUCCESS',
      ipAddress: '103.21.144.92',
    });

    return {
      token,
      user,
      expiresIn: 3600,
    };
  },

  verifyOtp(uan: string, otp: string) {
    if (otp !== '123456' && otp.length !== 6) {
      throw new Error('Invalid OTP. For demo/prototype use OTP: 123456.');
    }
    const user = db.users.find((u) => u.uan === uan) || db.users[0];
    const token = `epfo_jwt_${user.id}_${Date.now()}`;
    redis.set(`session:${token}`, {
      userId: user.id,
      uan: user.uan,
      role: user.role,
      name: user.name,
    }, 3600);

    return {
      token,
      user,
      verified: true,
    };
  },

  getUserByToken(token: string) {
    const session = redis.get<{ userId: string }>(`session:${token}`);
    if (session) {
      return db.users.find((u) => u.id === session.userId) || null;
    }
    // Fallback search in users list for quick demo token
    if (token.startsWith('epfo_jwt_')) {
      const parts = token.split('_');
      const userId = `${parts[2]}_${parts[3]}_${parts[4]}`;
      return db.users.find((u) => u.id === userId) || db.users[0];
    }
    return db.users[0];
  },

  switchUserRole(role: Role) {
    const user = db.users.find((u) => u.role === role) || db.users[0];
    const token = `epfo_jwt_${user.id}_${Date.now()}`;
    redis.set(`session:${token}`, {
      userId: user.id,
      uan: user.uan,
      role: user.role,
      name: user.name,
    }, 3600);

    return {
      token,
      user,
    };
  },

  register(payload: {
    name: string;
    uan?: string;
    email: string;
    phone: string;
    role?: Role;
    aadhaarNumber?: string;
    panNumber?: string;
    establishmentName?: string;
    initialBalance?: number;
  }) {
    const role: Role = payload.role || 'EMPLOYEE';
    const uan = payload.uan?.trim() || `100${Math.floor(100000000 + Math.random() * 900000000)}`;
    const userId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    
    // Check if user already exists
    const existing = db.users.find((u) => u.uan === uan);
    if (existing) {
      throw new Error(`Account with UAN ${uan} already exists. Please log in.`);
    }

    const newUser = {
      id: userId,
      uan,
      name: payload.name.trim(),
      email: payload.email.trim(),
      phone: payload.phone.trim(),
      role,
      createdAt: new Date().toISOString(),
    };

    db.users.push(newUser);

    // Create initial PF balance
    const initialBal = Number(payload.initialBalance) || 250000;
    const eeShare = Math.round(initialBal * 0.57);
    const erShare = Math.round(initialBal * 0.18);
    const epsShare = initialBal - eeShare - erShare;

    const memberId = `DLCPM0019283000${Math.floor(100000 + Math.random() * 900000)}`;
    db.pfAccounts.push({
      id: `pf_${userId}`,
      userId,
      uan,
      memberId,
      employeeShare: eeShare,
      employerShare: erShare,
      pensionFund: epsShare,
      totalBalance: initialBal,
      interestEarned: Math.round(initialBal * 0.0825),
      lastUpdated: new Date().toISOString(),
    });

    // Create employment record
    const establishmentName = payload.establishmentName?.trim() || 'TechCorp India Solutions Ltd';
    db.employment.push({
      id: `emp_${userId}`,
      userId,
      establishmentId: 'DLCPM0019283000',
      establishmentName,
      memberId,
      dateOfJoining: '2023-01-15',
      currentEmployer: true,
    });

    // Create KYC record
    if (payload.aadhaarNumber) {
      db.kyc.push({
        id: `kyc_adh_${userId}`,
        userId,
        documentType: 'AADHAAR',
        documentNumber: `XXXX-XXXX-${payload.aadhaarNumber.slice(-4) || '9999'}`,
        verified: true,
        verifiedAt: new Date().toISOString(),
        status: 'VERIFIED' as const,
        nameOnDoc: payload.name,
      });
    }

    // Seed initial contributions
    const currentWage = 65000;
    const wageMonths = ['2026-07', '2026-06', '2026-05', '2026-04'];
    wageMonths.forEach((wm, idx) => {
      db.contributions.push({
        id: `cnt_${userId}_${idx}`,
        userId,
        memberId,
        wageMonth: wm,
        epfWages: currentWage,
        epsWages: 15000,
        employeeShare: Math.round(currentWage * 0.12),
        employerShare: Math.round(currentWage * 0.0367),
        pensionShare: 1250,
        expectedTotal: Math.round(currentWage * 0.12 + currentWage * 0.0367 + 1250),
        receivedTotal: Math.round(currentWage * 0.12 + currentWage * 0.0367 + 1250),
        status: 'MATCHED' as const,
        ecrChallanNo: `ECR202607${Math.floor(100000 + Math.random() * 900000)}`,
        depositedAt: `2026-08-05T09:00:00.000Z`,
      });
    });

    // Generate token
    const token = `epfo_jwt_${userId}_${Date.now()}`;
    redis.set(`session:${token}`, {
      userId,
      uan,
      role,
      name: newUser.name,
    }, 3600);

    return {
      token,
      user: newUser,
      message: 'Account and UAN profile successfully created!',
    };
  },

  logout(token: string) {
    redis.del(`session:${token}`);
    return { success: true };
  }
};
