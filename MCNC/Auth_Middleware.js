'use strict';

const crypto = require('crypto');
const path = require('path');
const fs = require('fs');
const { DatabaseSync } = require('node:sqlite');

module.exports = function registerAuthAndTenants(app, DATA_PATH) {
    const AUTH_DB_PATH = path.join(DATA_PATH, 'MCNC_Auth.db');
    const TENANTS_ROOT = path.join(DATA_PATH, 'Tenants');
    const VALID_TENANTS = ['Mike', 'Adine', 'Claire', 'Egmond'];

    // Derive deterministic signing secret from .env JWT_SECRET or machine fallback
    const SECRET_SEED = process.env.MCNC_AUTH_SECRET || process.env.API_KEY || 'MCNC_RHYTHM_SOVEREIGN_BASE1_KEY_2026';
    const SIGNING_KEY = crypto.createHash('sha256').update(SECRET_SEED).digest();

    function base64UrlEncode(buf) {
        return Buffer.from(buf).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
    }

    function base64UrlDecode(str) {
        const pad = 4 - (str.length % 4);
        const padded = str + (pad < 4 ? '='.repeat(pad) : '');
        return Buffer.from(padded.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8');
    }

    function signToken(payloadObj, ttlSeconds = 7200) {
        const header = base64UrlEncode(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
        const nowSec = Math.floor(Date.now() / 1000);
        const body = base64UrlEncode(JSON.stringify({
            ...payloadObj,
            iat: nowSec,
            exp: nowSec + ttlSeconds
        }));
        const sig = base64UrlEncode(
            crypto.createHmac('sha256', SIGNING_KEY).update(`${header}.${body}`).digest()
        );
        return `${header}.${body}.${sig}`;
    }

    function verifyToken(token) {
        if (!token || typeof token !== 'string') return null;
        const parts = token.split('.');
        if (parts.length !== 3) return null;
        const [header, body, sig] = parts;
        const expectedSig = base64UrlEncode(
            crypto.createHmac('sha256', SIGNING_KEY).update(`${header}.${body}`).digest()
        );
        const sigBuf = Buffer.from(sig);
        const expBuf = Buffer.from(expectedSig);
        if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
            return null;
        }
        try {
            const parsed = JSON.parse(base64UrlDecode(body));
            const nowSec = Math.floor(Date.now() / 1000);
            if (!parsed.exp || parsed.exp < nowSec) return null;
            return parsed;
        } catch (_) {
            return null;
        }
    }

    function verifyPassword(plainText, saltHex, expectedHashHex) {
        const derived = crypto.scryptSync(plainText, saltHex, 64).toString('hex');
        const a = Buffer.from(derived, 'hex');
        const b = Buffer.from(expectedHashHex, 'hex');
        return a.length === b.length && crypto.timingSafeEqual(a, b);
    }

    function hashNewPassword(plainText) {
        const salt = crypto.randomBytes(16).toString('hex');
        const hash = crypto.scryptSync(plainText, salt, 64).toString('hex');
        return { salt, hash };
    }

    function logAudit(actorId, targetTenant, action, targetPath = '') {
        let db;
        try {
            db = new DatabaseSync(AUTH_DB_PATH);
            db.prepare(
                'INSERT INTO Audit_Log (Actor_ID, Target_Tenant, Action, Target_Path, Timestamp) VALUES (?, ?, ?, ?, ?)'
            ).run(actorId, targetTenant, action, targetPath, new Date().toISOString());
        } catch (err) {
            console.error('[AUTH AUDIT ERROR]', err.message);
        } finally {
            if (db) db.close();
        }
    }

    function requireAuth(req, res, next) {
        const authHeader = req.headers['authorization'] || '';
        const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
        const claims = verifyToken(token);
        if (!claims) {
            return res.status(401).json({ success: false, error: 'Unauthorized or expired session' });
        }

        // Enforce strict tenant isolation vs EXEC_ADMIN context switch
        let effectiveTenant = claims.tenantId;
        const requestedTarget = (req.headers['x-target-tenant'] || '').trim();
        if (claims.role === 'EXEC_ADMIN' && requestedTarget && VALID_TENANTS.includes(requestedTarget)) {
            effectiveTenant = requestedTarget;
        }

        const tenantRoot = path.join(TENANTS_ROOT, effectiveTenant, 'Bounty_Clipping');
        req.mcncAuth = {
            userId: claims.userId,
            username: claims.username,
            role: claims.role,
            homeTenant: claims.tenantId,
            effectiveTenant,
            tenantRoot,
            ledgerPath: path.join(tenantRoot, 'Bounty_Ledger.db')
        };
        next();
    }

    // 1. Login Endpoint
    app.post('/api/auth/login', (req, res) => {
        const { username, password } = req.body || {};
        if (!username || !password) {
            return res.status(400).json({ success: false, error: 'Username and password required' });
        }

        let db;
        try {
            db = new DatabaseSync(AUTH_DB_PATH);
            const user = db.prepare(
                'SELECT User_ID, Username, Password_Hash, Password_Salt, Role, Tenant_ID, Storage_Quota_MB, Agent_Aliases_JSON FROM Users WHERE LOWER(Username) = LOWER(?)'
            ).get(String(username).trim());

            if (!user || !verifyPassword(String(password), user.Password_Salt, user.Password_Hash)) {
                logAudit(String(username), 'NONE', 'LOGIN_FAILED', '/api/auth/login');
                return res.status(401).json({ success: false, error: 'Invalid credentials' });
            }

            const token = signToken({
                userId: user.User_ID,
                username: user.Username,
                role: user.Role,
                tenantId: user.Tenant_ID
            });

            logAudit(user.User_ID, user.Tenant_ID, 'LOGIN_SUCCESS', '/api/auth/login');

            return res.json({
                success: true,
                token,
                user: {
                    userId: user.User_ID,
                    username: user.Username,
                    role: user.Role,
                    tenantId: user.Tenant_ID,
                    availableTenants: user.Role === 'EXEC_ADMIN' ? VALID_TENANTS : [user.Tenant_ID],
                    storageQuotaMb: user.Storage_Quota_MB,
                    agentAliases: JSON.parse(user.Agent_Aliases_JSON || '{}')
                }
            });
        } catch (err) {
            return res.status(500).json({ success: false, error: err.message });
        } finally {
            if (db) db.close();
        }
    });

    // 2. Session Check Endpoint
    app.get('/api/auth/me', requireAuth, (req, res) => {
        return res.json({
            success: true,
            auth: {
                userId: req.mcncAuth.userId,
                username: req.mcncAuth.username,
                role: req.mcncAuth.role,
                homeTenant: req.mcncAuth.homeTenant,
                effectiveTenant: req.mcncAuth.effectiveTenant,
                availableTenants: req.mcncAuth.role === 'EXEC_ADMIN' ? VALID_TENANTS : [req.mcncAuth.homeTenant]
            }
        });
    });

    // 3. Self-Service Password Rotation Endpoint
    app.post('/api/auth/change-password', requireAuth, (req, res) => {
        const { currentPassword, newPassword } = req.body || {};
        if (!currentPassword || !newPassword || String(newPassword).length < 8) {
            return res.status(400).json({ success: false, error: 'New password must be at least 8 characters' });
        }

        let db;
        try {
            db = new DatabaseSync(AUTH_DB_PATH);
            const user = db.prepare('SELECT User_ID, Password_Hash, Password_Salt FROM Users WHERE User_ID = ?').get(req.mcncAuth.userId);
            if (!user || !verifyPassword(String(currentPassword), user.Password_Salt, user.Password_Hash)) {
                return res.status(401).json({ success: false, error: 'Current password is incorrect' });
            }

            const { salt, hash } = hashNewPassword(String(newPassword));
            db.prepare('UPDATE Users SET Password_Hash = ?, Password_Salt = ? WHERE User_ID = ?').run(hash, salt, user.User_ID);
            logAudit(user.User_ID, req.mcncAuth.homeTenant, 'PASSWORD_CHANGED', '/api/auth/change-password');

            return res.json({ success: true, message: 'Password updated successfully' });
        } catch (err) {
            return res.status(500).json({ success: false, error: err.message });
        } finally {
            if (db) db.close();
        }
    });

    // 4. Scoped Tenant Bounty Ledger Read
    app.get('/api/tenant/bounties', requireAuth, (req, res) => {
        if (!fs.existsSync(req.mcncAuth.ledgerPath)) {
            return res.status(404).json({ success: false, error: 'Tenant ledger not initialized' });
        }
        let ledgerDb;
        try {
            ledgerDb = new DatabaseSync(req.mcncAuth.ledgerPath);
            const rows = ledgerDb.prepare('SELECT * FROM Bounties ORDER BY Updated_At DESC').all();
            return res.json({
                success: true,
                tenant: req.mcncAuth.effectiveTenant,
                bounties: rows
            });
        } catch (err) {
            return res.status(500).json({ success: false, error: err.message });
        } finally {
            if (ledgerDb) ledgerDb.close();
        }
    });

    // 5. Scoped Tenant Bounty Ledger Upsert
    app.post('/api/tenant/bounties', requireAuth, (req, res) => {
        const { bountyId, platform, campaignName, targetChannels, clipUrl, status, views, payoutUsd } = req.body || {};
        if (!campaignName) {
            return res.status(400).json({ success: false, error: 'campaignName is required' });
        }

        const id = bountyId || `BNT_${Date.now()}_${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
        const safeStatus = ['QUEUED', 'RENDERED', 'POSTED', 'PAID'].includes(status) ? status : 'QUEUED';
        const channelsStr = Array.isArray(targetChannels) ? JSON.stringify(targetChannels) : String(targetChannels || '[]');
        const nowIso = new Date().toISOString();

        let ledgerDb;
        try {
            ledgerDb = new DatabaseSync(req.mcncAuth.ledgerPath);
            ledgerDb.prepare(`
                INSERT INTO Bounties (Bounty_ID, Platform, Campaign_Name, Target_Channels, Clip_URL, Status, Views, Payout_USD, Updated_At)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(Bounty_ID) DO UPDATE SET
                    Platform = excluded.Platform,
                    Campaign_Name = excluded.Campaign_Name,
                    Target_Channels = excluded.Target_Channels,
                    Clip_URL = excluded.Clip_URL,
                    Status = excluded.Status,
                    Views = excluded.Views,
                    Payout_USD = excluded.Payout_USD,
                    Updated_At = excluded.Updated_At
            `).run(
                id,
                String(platform || 'Other'),
                String(campaignName),
                channelsStr,
                String(clipUrl || ''),
                safeStatus,
                Number(views || 0),
                Number(payoutUsd || 0),
                nowIso
            );

            logAudit(req.mcncAuth.userId, req.mcncAuth.effectiveTenant, 'BOUNTY_UPSERT', id);
            return res.json({ success: true, tenant: req.mcncAuth.effectiveTenant, bountyId: id });
        } catch (err) {
            return res.status(500).json({ success: false, error: err.message });
        } finally {
            if (ledgerDb) ledgerDb.close();
        }
    });

    
    // 6. Admin One-Click Invite Link Generator (EXEC_ADMIN only)
    app.post('/api/auth/invite', requireAuth, (req, res) => {
        if (req.mcncAuth.role !== 'EXEC_ADMIN') {
            return res.status(403).json({ success: false, error: 'Executive Admin required' });
        }
        const { tenantName, email, quotaMb } = req.body || {};
        const cleanTenant = String(tenantName || '').trim().replace(/[^a-zA-Z0-9_-]/g, '');
        if (!cleanTenant) {
            return res.status(400).json({ success: false, error: 'tenantName is required (e.g., Adine)' });
        }

        const inviteToken = signToken({
            purpose: 'MCNC_INVITE',
            tenantId: cleanTenant,
            email: String(email || '').trim(),
            quotaMb: Number(quotaMb || 500)
        }, 7 * 24 * 3600); // Valid for 7 days

        logAudit(req.mcncAuth.userId, cleanTenant, 'INVITE_CREATED', email || cleanTenant);
        return res.json({
            success: true,
            tenantName: cleanTenant,
            inviteToken
        });
    });

    // 7. Public Invite Verification & Profile Claim Endpoint
    app.post('/api/auth/accept-invite', (req, res) => {
        const { inviteToken, username, password, customDirectorName } = req.body || {};
        const claims = verifyToken(inviteToken);
        if (!claims || claims.purpose !== 'MCNC_INVITE') {
            return res.status(400).json({ success: false, error: 'Invalid or expired invitation link' });
        }
        const cleanUser = String(username || claims.tenantId).trim();
        if (!cleanUser || !password || String(password).length < 8) {
            return res.status(400).json({ success: false, error: 'Username and password (min 8 chars) required' });
        }

        const tenantId = claims.tenantId;
        const tenantBase = path.join(TENANTS_ROOT, tenantId);
        ['Projects', 'Projects\\BOUNTY_ENGINE', 'Chats', 'Memory', 'Bounty_Clipping'].forEach((sub) => {
            const full = path.join(tenantBase, sub);
            if (!fs.existsSync(full)) fs.mkdirSync(full, { recursive: true });
        });

        // Initialize clean-slate Bounty_Ledger.db if missing
        const ledgerPath = path.join(tenantBase, 'Bounty_Clipping', 'Bounty_Ledger.db');
        const ledgerDb = new DatabaseSync(ledgerPath);
        ledgerDb.exec(`
            CREATE TABLE IF NOT EXISTS Bounties (
                Bounty_ID TEXT PRIMARY KEY,
                Platform TEXT,
                Campaign_Name TEXT,
                Target_Channels TEXT,
                Clip_URL TEXT,
                Status TEXT,
                Views INTEGER DEFAULT 0,
                Payout_USD REAL DEFAULT 0,
                Updated_At TEXT
            );
        `);
        ledgerDb.close();

        const { salt, hash } = hashNewPassword(String(password));
        const aliases = customDirectorName ? JSON.stringify({ monty: String(customDirectorName).trim() }) : '{}';

        let db;
        try {
            db = new DatabaseSync(AUTH_DB_PATH);
            const existing = db.prepare('SELECT User_ID FROM Users WHERE Tenant_ID = ?').get(tenantId);
            let userId;
            if (existing) {
                userId = existing.User_ID;
                db.prepare('UPDATE Users SET Username = ?, Password_Hash = ?, Password_Salt = ?, Agent_Aliases_JSON = ? WHERE User_ID = ?')
                  .run(cleanUser, hash, salt, aliases, userId);
            } else {
                userId = `USR_${tenantId.toUpperCase()}_${crypto.randomBytes(2).toString('hex').toUpperCase()}`;
                db.prepare(`
                    INSERT INTO Users (User_ID, Username, Password_Hash, Password_Salt, Role, Tenant_ID, Storage_Quota_MB, Agent_Aliases_JSON, Created_At)
                    VALUES (?, ?, ?, ?, 'COLLABORATOR', ?, ?, ?, ?)
                `).run(userId, cleanUser, hash, salt, tenantId, Number(claims.quotaMb || 500), aliases, new Date().toISOString());
            }

            if (!VALID_TENANTS.includes(tenantId)) VALID_TENANTS.push(tenantId);

            const sessionToken = signToken({
                userId,
                username: cleanUser,
                role: 'COLLABORATOR',
                tenantId
            });

            logAudit(userId, tenantId, 'INVITE_CLAIMED', cleanUser);

            return res.json({
                success: true,
                token: sessionToken,
                user: {
                    userId,
                    username: cleanUser,
                    role: 'COLLABORATOR',
                    tenantId,
                    availableTenants: [tenantId],
                    storageQuotaMb: Number(claims.quotaMb || 500),
                    agentAliases: JSON.parse(aliases)
                }
            });
        } catch (err) {
            return res.status(500).json({ success: false, error: err.message });
        } finally {
            if (db) db.close();
        }
    });

    
    // 8. Live Tenant Usage & Billing Telemetry (Disk, Credits, Tokens, Renders)
    const { getTenantUsage, topUpTenantCredits } = require('./Credit_Meter');

    app.get('/api/auth/usage', requireAuth, (req, res) => {
        try {
            const targetTenant = req.mcncAuth.effectiveTenant || req.mcncAuth.tenantId;
            const usage = getTenantUsage(targetTenant);
            return res.json({ success: true, usage });
        } catch (err) {
            return res.status(500).json({ success: false, error: err.message });
        }
    });

    // 9. Admin Credit Top-Up & Plan Upgrade Endpoint (EXEC_ADMIN only)
    app.post('/api/auth/topup', requireAuth, (req, res) => {
        if (req.mcncAuth.role !== 'EXEC_ADMIN') {
            return res.status(403).json({ success: false, error: 'Executive Admin required' });
        }
        const { tenantId, addUsd, newQuotaMb, planTier } = req.body || {};
        if (!tenantId) {
            return res.status(400).json({ success: false, error: 'tenantId is required' });
        }
        try {
            const usage = topUpTenantCredits(String(tenantId).trim(), addUsd, newQuotaMb, planTier);
            logAudit(req.mcncAuth.userId, tenantId, 'CREDIT_TOPUP', `+${addUsd || 0} / ${newQuotaMb || 'same'}MB`);
            return res.json({ success: true, usage });
        } catch (err) {
            return res.status(500).json({ success: false, error: err.message });
        }
    });

    console.log('[AUTH & TENANT ENGINE]   : /api/auth/* & /api/tenant/bounties MOUNTED (Mike/Adine/Claire)');
};



