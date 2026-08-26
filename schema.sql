-- ==============================================================================
-- EPFO 2.0 UNIFIED SOCIAL SECURITY PORTAL - POSTGRESQL SCHEMA (SUPABASE / NEON)
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users & Identities
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    uan VARCHAR(12) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(32) NOT NULL,
    role VARCHAR(32) NOT NULL DEFAULT 'EMPLOYEE',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. KYC Records
CREATE TABLE IF NOT EXISTS kyc_records (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
    document_type VARCHAR(32) NOT NULL,
    document_number VARCHAR(128) NOT NULL,
    verified BOOLEAN DEFAULT FALSE,
    verified_at TIMESTAMPTZ,
    status VARCHAR(32) NOT NULL DEFAULT 'PENDING',
    name_on_doc VARCHAR(255)
);

-- 3. Employment History
CREATE TABLE IF NOT EXISTS employment_records (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
    establishment_id VARCHAR(64) NOT NULL,
    establishment_name VARCHAR(255) NOT NULL,
    member_id VARCHAR(64) NOT NULL,
    date_of_joining DATE NOT NULL,
    date_of_exit DATE,
    exit_reason VARCHAR(128),
    current_employer BOOLEAN DEFAULT FALSE
);

-- 4. PF Ledger & Accounts
CREATE TABLE IF NOT EXISTS pf_accounts (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
    uan VARCHAR(12) NOT NULL,
    member_id VARCHAR(64) NOT NULL,
    employee_share NUMERIC(12, 2) DEFAULT 0,
    employer_share NUMERIC(12, 2) DEFAULT 0,
    pension_fund NUMERIC(12, 2) DEFAULT 0,
    total_balance NUMERIC(12, 2) DEFAULT 0,
    interest_earned NUMERIC(12, 2) DEFAULT 0,
    last_updated TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Monthly Contributions & Reconciliation Records
CREATE TABLE IF NOT EXISTS contribution_records (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
    member_id VARCHAR(64) NOT NULL,
    wage_month VARCHAR(7) NOT NULL, -- e.g. 2026-07
    epf_wages NUMERIC(10, 2) NOT NULL,
    eps_wages NUMERIC(10, 2) NOT NULL,
    employee_share NUMERIC(10, 2) NOT NULL,
    employer_share NUMERIC(10, 2) NOT NULL,
    pension_share NUMERIC(10, 2) NOT NULL,
    expected_total NUMERIC(10, 2) NOT NULL,
    received_total NUMERIC(10, 2) NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'MATCHED',
    mismatch_reason TEXT,
    deposited_at TIMESTAMPTZ,
    ecr_challan_no VARCHAR(64)
);

-- 6. Claims & Digital Settlement Workflow
CREATE TABLE IF NOT EXISTS claims (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
    uan VARCHAR(12) NOT NULL,
    member_id VARCHAR(64) NOT NULL,
    claim_type VARCHAR(32) NOT NULL,
    claim_type_name VARCHAR(128) NOT NULL,
    purpose TEXT,
    amount_requested NUMERIC(12, 2) NOT NULL,
    amount_approved NUMERIC(12, 2) DEFAULT 0,
    status VARCHAR(32) NOT NULL DEFAULT 'SUBMITTED',
    bank_account VARCHAR(64) NOT NULL,
    ifsc_code VARCHAR(32) NOT NULL,
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- 7. Claim Status History Audit Trail
CREATE TABLE IF NOT EXISTS claim_status_history (
    id VARCHAR(64) PRIMARY KEY,
    claim_id VARCHAR(64) REFERENCES claims(id) ON DELETE CASCADE,
    status VARCHAR(32) NOT NULL,
    comment TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    performed_by VARCHAR(128)
);

-- 8. Nominations
CREATE TABLE IF NOT EXISTS nominations (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
    nominee_name VARCHAR(255) NOT NULL,
    relationship VARCHAR(64) NOT NULL,
    date_of_birth DATE NOT NULL,
    share_percentage NUMERIC(5, 2) NOT NULL,
    is_minor BOOLEAN DEFAULT FALSE,
    guardian_name VARCHAR(255),
    aadhaar_last4 VARCHAR(4) NOT NULL,
    e_signed BOOLEAN DEFAULT TRUE,
    submitted_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. PF Transfer Requests
CREATE TABLE IF NOT EXISTS transfer_requests (
    id VARCHAR(64) PRIMARY KEY,
    tracking_id VARCHAR(64) UNIQUE NOT NULL,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
    previous_establishment VARCHAR(255) NOT NULL,
    previous_member_id VARCHAR(64) NOT NULL,
    present_establishment VARCHAR(255) NOT NULL,
    present_member_id VARCHAR(64) NOT NULL,
    attestation_through VARCHAR(64) NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'SUBMITTED',
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- 10. Grievances (EPFiGMS)
CREATE TABLE IF NOT EXISTS grievances (
    id VARCHAR(64) PRIMARY KEY,
    registration_number VARCHAR(64) UNIQUE NOT NULL,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
    uan VARCHAR(12) NOT NULL,
    category VARCHAR(64) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'SUBMITTED',
    registered_at TIMESTAMPTZ DEFAULT NOW(),
    assigned_officer VARCHAR(128),
    resolved_at TIMESTAMPTZ,
    resolution_remarks TEXT
);

-- 11. App Notifications
CREATE TABLE IF NOT EXISTS app_notifications (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(64) NOT NULL,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. Security Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64),
    user_role VARCHAR(32) NOT NULL,
    action VARCHAR(64) NOT NULL,
    entity VARCHAR(64) NOT NULL,
    entity_id VARCHAR(64) NOT NULL,
    details TEXT,
    result VARCHAR(32) NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    ip_address VARCHAR(45)
);

-- ==============================================================================
-- INITIAL SEED DATA (DEFAULT PERSONAS)
-- ==============================================================================

INSERT INTO users (id, uan, name, email, phone, role)
VALUES 
    ('usr_emp_01', '100982349012', 'Ramesh Kumar Verma', 'ramesh.kumar@example.com', '+91 98765 43210', 'EMPLOYEE'),
    ('usr_empr_01', '200118844332', 'TechCorp India Solutions Ltd', 'hr.epf@techcorp.in', '+91 80 4567 8900', 'EMPLOYER'),
    ('usr_off_01', '300998877665', 'Sunita Rao, APFC Officer', 's.rao@epfindia.gov.in', '+91 11 2345 6789', 'OFFICER'),
    ('usr_adm_01', '400112233445', 'Central DevOps / System Admin', 'admin.epfo20@nic.in', '+91 11 2617 2661', 'ADMIN')
ON CONFLICT (id) DO NOTHING;

INSERT INTO pf_accounts (id, user_id, uan, member_id, employee_share, employer_share, pension_fund, total_balance, interest_earned)
VALUES 
    ('pf_acc_01', 'usr_emp_01', '100982349012', 'DLCPM00192830000010928', 424180, 136820, 182400, 743400, 38450)
ON CONFLICT (id) DO NOTHING;
