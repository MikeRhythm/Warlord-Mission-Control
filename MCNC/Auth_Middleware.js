'use strict';

const crypto = require('crypto');
const path = require('path');
const fs = require('fs');
const { DatabaseSync } = require('node:sqlite');

module.exports = function registerAuthAndTenants(app, DATA_PATH) {
    const AUTH_DB_PATH = path.join(DATA_PATH, 'MCNC_Auth.db');
    const TENANTS_ROOT = path.join(DATA_PATH, 'Tenants');
    const VALID_TENANTS = ['Mike', 'Adine', 'Claire'];

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

    console.log('[AUTH & TENANT ENGINE]   : /api/auth/* & /api/tenant/bounties MOUNTED (Mike/Adine/Claire)');
};
