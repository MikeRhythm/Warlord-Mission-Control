'use strict';

const crypto = require('crypto');
const path = require('path');

let dbDriver = null;
let DatabaseCtor = null;

try {
    DatabaseCtor = require('better-sqlite3');
    dbDriver = 'better-sqlite3';
} catch (_) {
    try {
        const nodeSqlite = require('node:sqlite');
        DatabaseCtor = nodeSqlite.DatabaseSync;
        dbDriver = 'node:sqlite';
    } catch (err) {
        console.error('[EMERGENCY BRAKE] Neither better-sqlite3 nor built-in node:sqlite is available.');
        console.error('Run "node -v" and report back to Monty before installing any package (SOP 15).');
        process.exit(1);
    }
}

console.log(`[INIT] Using SQLite driver: ${dbDriver}`);

const DATA_ROOT = 'C:\\Warlord_Inc\\Warlord_WASP\\MCNC\\Data';
const AUTH_DB_PATH = path.join(DATA_ROOT, 'MCNC_Auth.db');

const DEFAULT_ALIASES = JSON.stringify({
    CHIEF_OF_STAFF: 'Monty',
    CODING_LEAD: 'Charlie',
    FRONTEND_UI: 'Skyla',
    INFRASTRUCTURE_VPS: 'Atlas',
    QUANT_VOLATILITY: 'Tess',
    DATABASE_PERSISTENCE: 'Silas',
    SEO_TRAFFIC: 'Maverick',
    RISK_COMPLIANCE: 'Justin',
    BACKEND_BRIDGES: 'Jack',
    TRADE_EXECUTION: 'Ares',
    FINANCE_ACCOUNTING: 'Vance',
    STRATEGIC_INTEL: 'Orion',
    SECURITY_GUARDRAILS: 'The Askari',
    COPYWRITING_DOCS: 'Amber',
    DESIGN_VISUAL: 'Roxy',
    ARTWORK_OMEGA: 'Jax',
    PARTNER_PR: 'Valerie'
});

function hashPassword(plainText) {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.scryptSync(plainText, salt, 64).toString('hex');
    return { salt, hash };
}

const nowIso = new Date().toISOString();

// Initialize Master Auth DB
const authDb = new DatabaseCtor(AUTH_DB_PATH);
authDb.exec('BEGIN TRANSACTION;');
try {
    authDb.exec(`
        CREATE TABLE IF NOT EXISTS Users (
            User_ID TEXT PRIMARY KEY,
            Username TEXT UNIQUE NOT NULL,
            Password_Hash TEXT NOT NULL,
            Password_Salt TEXT NOT NULL,
            Role TEXT NOT NULL CHECK(Role IN ('EXEC_ADMIN', 'COLLABORATOR')),
            Tenant_ID TEXT NOT NULL,
            Storage_Quota_MB INTEGER NOT NULL DEFAULT 500,
            Proxy_URL TEXT NOT NULL DEFAULT '',
            Agent_Aliases_JSON TEXT NOT NULL,
            Created_At TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS Sessions (
            Session_ID TEXT PRIMARY KEY,
            User_ID TEXT NOT NULL,
            Refresh_Token_Hash TEXT NOT NULL,
            Expires_At TEXT NOT NULL,
            IP_Address TEXT NOT NULL DEFAULT '',
            Revoked INTEGER NOT NULL DEFAULT 0,
            FOREIGN KEY (User_ID) REFERENCES Users(User_ID)
        );

        CREATE TABLE IF NOT EXISTS Audit_Log (
            Event_ID INTEGER PRIMARY KEY AUTOINCREMENT,
            Actor_ID TEXT NOT NULL,
            Target_Tenant TEXT NOT NULL,
            Action TEXT NOT NULL,
            Target_Path TEXT NOT NULL DEFAULT '',
            Timestamp TEXT NOT NULL
        );
    `);

    const seedUsers = [
        { id: 'USR_MIKE_01', username: 'Mike', tempPass: 'MCNC_Mike_2026!', role: 'EXEC_ADMIN', tenant: 'Mike', quota: 5000 },
        { id: 'USR_ADINE_02', username: 'Adine', tempPass: 'MCNC_Adine_2026!', role: 'COLLABORATOR', tenant: 'Adine', quota: 500 },
        { id: 'USR_CLAIRE_03', username: 'Claire', tempPass: 'MCNC_Claire_2026!', role: 'COLLABORATOR', tenant: 'Claire', quota: 500 }
    ];

    const insertUser = authDb.prepare(`
        INSERT OR IGNORE INTO Users
        (User_ID, Username, Password_Hash, Password_Salt, Role, Tenant_ID, Storage_Quota_MB, Proxy_URL, Agent_Aliases_JSON, Created_At)
        VALUES (?, ?, ?, ?, ?, ?, ?, '', ?, ?)
    `);

    for (const u of seedUsers) {
        const { salt, hash } = hashPassword(u.tempPass);
        insertUser.run(u.id, u.username, hash, salt, u.role, u.tenant, u.quota, DEFAULT_ALIASES, nowIso);
    }

    authDb.exec('COMMIT;');
} catch (err) {
    authDb.exec('ROLLBACK;');
    console.error('[ERROR] Auth DB transaction failed:', err.message);
    process.exit(1);
}

// Initialize Per-Tenant Bounty Ledgers
const tenants = ['Mike', 'Adine', 'Claire'];
for (const tenant of tenants) {
    const ledgerPath = path.join(DATA_ROOT, 'Tenants', tenant, 'Bounty_Clipping', 'Bounty_Ledger.db');
    const ledgerDb = new DatabaseCtor(ledgerPath);
    ledgerDb.exec('BEGIN TRANSACTION;');
    try {
        ledgerDb.exec(`
            CREATE TABLE IF NOT EXISTS Bounties (
                Bounty_ID TEXT PRIMARY KEY,
                Platform TEXT NOT NULL DEFAULT 'Other',
                Campaign_Name TEXT NOT NULL,
                Target_Channels TEXT NOT NULL DEFAULT '[]',
                Clip_URL TEXT NOT NULL DEFAULT '',
                Status TEXT NOT NULL DEFAULT 'QUEUED' CHECK(Status IN ('QUEUED', 'RENDERED', 'POSTED', 'PAID')),
                Views INTEGER NOT NULL DEFAULT 0,
                Payout_USD REAL NOT NULL DEFAULT 0.0,
                Updated_At TEXT NOT NULL
            );
        `);
        ledgerDb.exec('COMMIT;');
        ledgerDb.close();
    } catch (err) {
        ledgerDb.exec('ROLLBACK;');
        ledgerDb.close();
        console.error(`[ERROR] Ledger DB failed for ${tenant}:`, err.message);
        process.exit(1);
    }
}

// Verification Output (Hashes Redacted)
const rows = authDb.prepare('SELECT User_ID, Username, Role, Tenant_ID, Storage_Quota_MB, Created_At FROM Users').all();
console.log('\n[VERIFICATION] Seeded Users in MCNC_Auth.db:');
console.table(rows);
authDb.close();
console.log('[STAGE 1 COMPLETE] All tenant directories, auth tables, and bounty ledgers initialized cleanly.');
