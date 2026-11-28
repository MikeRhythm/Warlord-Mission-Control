'use strict';

const crypto = require('crypto');
const path = require('path');
const fs = require('fs');
const nodemailer = require('nodemailer');
const { DatabaseSync } = require('node:sqlite');

module.exports = function registerAuthAndTenants(app, DATA_PATH) {
    const AUTH_DB_PATH = path.join(DATA_PATH, 'MCNC_Auth.db');
    const TENANTS_ROOT = path.join(DATA_PATH, 'Tenants');
    const VALID_TENANTS = ['Mike', 'Adine', 'Claire', 'Egmond'];
    const RESET_CODES = new Map(); // username_lower -> { code, expiresAt }

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

    function signToken(payloadObj, ttlSeconds = 86400) {
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

    function escapeHtml(str) {
        return String(str || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    async function sendInviteEmail({ toEmail, recipientName, inviteUrl, customMessage, inviteRole }) {
        const host = process.env.SMTP_RHYTHM_HOST;
        const port = Number(process.env.SMTP_RHYTHM_PORT || 465);
        const secure = String(process.env.SMTP_RHYTHM_SECURE || 'true').toLowerCase() !== 'false';
        const user = process.env.SMTP_RHYTHM_USER;
        const pass = process.env.SMTP_RHYTHM_PASS;
        const from = process.env.SMTP_RHYTHM_FROM || user;

        if (!host || !user || !pass) {
            throw new Error('SMTP_RHYTHM_* credentials not configured in MCNC/.env');
        }

        const transporter = nodemailer.createTransport({
            host,
            port,
            secure,
            auth: { user, pass }
        });

        const tierLabel = inviteRole === 'GUEST_OBSERVER'
            ? 'Guest Observer Pass (Read-Only Dashboard + Live Monty Chat)'
            : 'Full Collaborator Invitation';

        const safeMessageHtml = escapeHtml(customMessage).replace(/\r?\n/g, '<br/>');
        const subject = `Your Private MCNC Access Pass — Rhythm Holdings`;

        const textBody = `${customMessage}\n\nAccess Tier: ${tierLabel}\nOpen your private MCNC workspace here:\n${inviteUrl}\n\n— Mike // Rhythm Holdings`;

        const htmlBody = `
            <div style="background:#080a0c;color:#e2e8f0;font-family:'Segoe UI',Arial,sans-serif;padding:28px;border:1px solid #1f242d;border-radius:8px;max-width:600px;margin:0 auto;">
                <div style="color:#DAA520;font-size:12px;font-weight:700;letter-spacing:1.4px;text-transform:uppercase;margin-bottom:8px;">
                    RHYTHM HOLDINGS // MISSION CONTROL NERVE CENTER
                </div>
                <h2 style="color:#ffffff;margin:0 0 14px 0;font-size:20px;">Private Access Invitation for ${escapeHtml(recipientName)}</h2>
                <div style="background:#0d1016;border:1px solid #1f2633;border-radius:6px;padding:16px;color:#cbd5e1;font-size:14px;line-height:1.6;margin-bottom:18px;">
                    ${safeMessageHtml}
                </div>
                <div style="font-size:12px;color:#94a3b8;margin-bottom:16px;">
                    <strong style="color:#C5BD9F;">ACCESS TIER:</strong> ${escapeHtml(tierLabel)}
                </div>
                <div style="margin-bottom:20px;">
                    <a href="${escapeHtml(inviteUrl)}" style="display:inline-block;background:#DAA520;color:#080a0c;text-decoration:none;font-weight:800;font-size:13px;padding:12px 22px;border-radius:5px;letter-spacing:0.8px;">
                        LAUNCH MCNC DASHBOARD
                    </a>
                </div>
                <div style="font-size:11px;color:#64748b;word-break:break-all;border-top:1px solid #1a212e;padding-top:12px;">
                    Direct Link: ${escapeHtml(inviteUrl)}
                </div>
            </div>
        `;

        await transporter.sendMail({
            from,
            to: toEmail,
            subject,
            text: textBody,
            html: htmlBody
        });
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

    // Global Guard: Block GUEST_OBSERVER from all write/mutation API calls except Monty chat
    app.use('/api', (req, res, next) => {
        if (req.method === 'GET' || req.path.startsWith('/auth/')) return next();
        const authHeader = req.headers['authorization'] || '';
        const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
        const claims = verifyToken(token);
        if (claims && claims.role === 'GUEST_OBSERVER') {
            const allowedGuestPosts = ['/api/chat', '/api/monty', '/api/exec/chat'];
            if (!allowedGuestPosts.some(p => req.originalUrl.startsWith(p))) {
                logAudit(claims.userId, claims.tenantId, 'GUEST_WRITE_BLOCKED', req.originalUrl);
                return res.status(403).json({
                    success: false,
                    error: 'Read-Only Guest Access: Sign up for full membership at rhythmtradingco.com to unlock execution & pipelines.'
                });
            }
        }
        next();
    });

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

    // 1B. Guest Pass Session Minting
    app.post('/api/auth/guest-login', (req, res) => {
        const { guestToken, guestName } = req.body || {};
        if (guestToken) {
            const claims = verifyToken(guestToken);
            if (!claims || claims.role !== 'GUEST_OBSERVER') {
                return res.status(401).json({ success: false, error: 'Invalid or expired guest pass' });
            }
            const sessionToken = signToken({
                userId: claims.userId,
                username: claims.username,
                role: 'GUEST_OBSERVER',
                tenantId: claims.tenantId
            }, 43200);
            logAudit(claims.userId, claims.tenantId, 'GUEST_LOGIN', claims.username);
            return res.json({
                success: true,
                token: sessionToken,
                user: {
                    userId: claims.userId,
                    username: claims.username,
                    role: 'GUEST_OBSERVER',
                    tenantId: claims.tenantId,
                    availableTenants: [claims.tenantId]
                }
            });
        }

        const cleanGuest = String(guestName || 'Guest_Visitor').trim().replace(/[^a-zA-Z0-9 _-]/g, '').slice(0, 32) || 'Guest_Visitor';
        const guestId = `GUEST_${cleanGuest.toUpperCase().replace(/\s+/g, '_')}`;
        const sessionToken = signToken({
            userId: guestId,
            username: cleanGuest,
            role: 'GUEST_OBSERVER',
            tenantId: 'GUEST_PREVIEW'
        }, 21600);
        logAudit(guestId, 'GUEST_PREVIEW', 'GUEST_PREVIEW_STARTED', cleanGuest);
        return res.json({
            success: true,
            token: sessionToken,
            user: {
                userId: guestId,
                username: cleanGuest,
                role: 'GUEST_OBSERVER',
                tenantId: 'GUEST_PREVIEW',
                availableTenants: ['GUEST_PREVIEW']
            }
        });
    });

    // 1C. Forgot Password Recovery Code Generator
    app.post('/api/auth/forgot-password', (req, res) => {
        const { username } = req.body || {};
        const cleanUser = String(username || '').trim();
        if (!cleanUser) {
            return res.status(400).json({ success: false, error: 'Enter your operator username first' });
        }

        let db;
        try {
            db = new DatabaseSync(AUTH_DB_PATH);
            const user = db.prepare('SELECT User_ID, Username, Tenant_ID FROM Users WHERE LOWER(Username) = LOWER(?)').get(cleanUser);
            if (!user) {
                return res.status(404).json({ success: false, error: 'Operator username not found' });
            }

            const code = String(crypto.randomInt(100000, 999999));
            RESET_CODES.set(user.Username.toLowerCase(), {
                code,
                expiresAt: Date.now() + 15 * 60 * 1000
            });

            console.log(`\n======================================================`);
            console.log(`[MCNC PASSWORD RECOVERY] Operator: ${user.Username}`);
            console.log(`[MCNC PASSWORD RECOVERY] 6-Digit Reset Code: ${code} (Valid 15m)`);
            console.log(`======================================================\n`);
            logAudit(user.User_ID, user.Tenant_ID, 'PASSWORD_RESET_REQUESTED', '/api/auth/forgot-password');

            return res.json({
                success: true,
                message: '6-digit recovery code dispatched to Base 1 Server Terminal (valid 15 mins).'
            });
        } catch (err) {
            return res.status(500).json({ success: false, error: err.message });
        } finally {
            if (db) db.close();
        }
    });

    // 1D. Verify Recovery Code & Set New Password
    app.post('/api/auth/reset-password', (req, res) => {
        const { username, code, newPassword } = req.body || {};
        const cleanUser = String(username || '').trim().toLowerCase();
        if (!cleanUser || !code || !newPassword || String(newPassword).length < 8) {
            return res.status(400).json({ success: false, error: 'Username, 6-digit code, and new password (min 8 chars) required' });
        }

        const record = RESET_CODES.get(cleanUser);
        if (!record || record.expiresAt < Date.now() || record.code !== String(code).trim()) {
            return res.status(400).json({ success: false, error: 'Invalid or expired recovery code' });
        }

        let db;
        try {
            db = new DatabaseSync(AUTH_DB_PATH);
            const user = db.prepare('SELECT User_ID, Tenant_ID FROM Users WHERE LOWER(Username) = LOWER(?)').get(cleanUser);
            if (!user) {
                return res.status(404).json({ success: false, error: 'Operator account not found' });
            }

            const { salt, hash } = hashNewPassword(String(newPassword));
            db.prepare('UPDATE Users SET Password_Hash = ?, Password_Salt = ? WHERE User_ID = ?').run(hash, salt, user.User_ID);
            RESET_CODES.delete(cleanUser);
            logAudit(user.User_ID, user.Tenant_ID, 'PASSWORD_RESET_COMPLETED', '/api/auth/reset-password');

            return res.json({ success: true, message: 'Password reset complete. You may now authenticate.' });
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
        if (req.mcncAuth.role === 'GUEST_OBSERVER') {
            return res.status(403).json({ success: false, error: 'Guest sessions cannot modify passwords' });
        }
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
        if (req.mcncAuth.role === 'GUEST_OBSERVER') {
            return res.status(403).json({ success: false, error: 'Read-only guest access' });
        }
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

    // 6. Admin One-Click Invite Link Generator + SMTP Email Dispatch (EXEC_ADMIN only)
    app.post('/api/auth/invite', requireAuth, async (req, res) => {
        if (req.mcncAuth.role !== 'EXEC_ADMIN') {
            return res.status(403).json({ success: false, error: 'Executive Admin required' });
        }
        const { tenantName, email, quotaMb, inviteRole, customMessage, originUrl } = req.body || {};
        const cleanTenant = String(tenantName || '').trim().replace(/[^a-zA-Z0-9 _-]/g, '');
        if (!cleanTenant) {
            return res.status(400).json({ success: false, error: 'Visitor name is required (e.g., Egmond)' });
        }

        const role = inviteRole === 'COLLABORATOR' ? 'COLLABORATOR' : 'GUEST_OBSERVER';
        let inviteToken;
        if (role === 'GUEST_OBSERVER') {
            inviteToken = signToken({
                userId: `GUEST_${cleanTenant.toUpperCase().replace(/\s+/g, '_')}`,
                username: cleanTenant,
                role: 'GUEST_OBSERVER',
                tenantId: cleanTenant.replace(/\s+/g, '_')
            }, 14 * 24 * 3600);
        } else {
            inviteToken = signToken({
                purpose: 'MCNC_INVITE',
                tenantId: cleanTenant.replace(/\s+/g, '_'),
                email: String(email || '').trim(),
                quotaMb: Number(quotaMb || 500)
            }, 7 * 24 * 3600);
        }

        const baseOrigin = String(originUrl || 'https://rhythmtradingco.com').replace(/\/+$/, '');
        const param = role === 'GUEST_OBSERVER'
            ? `guest_token=${encodeURIComponent(inviteToken)}`
            : `invite=${encodeURIComponent(inviteToken)}`;
        const inviteUrl = `${baseOrigin}/?${param}`;

        let emailSent = false;
        let emailError = '';
        const cleanEmail = String(email || '').trim();
        if (cleanEmail) {
            try {
                const msgBody = String(customMessage || '').trim() ||
                    `Hi ${cleanTenant},\n\nYou've been invited to preview the Rhythm Holdings Mission Control Nerve Center (MCNC). You can browse all 14 stations in Read-Only mode, click OVERVIEW and TAB BRIEF on any screen, and chat live with Monty on Tab 01.`;
                await sendInviteEmail({
                    toEmail: cleanEmail,
                    recipientName: cleanTenant,
                    inviteUrl,
                    customMessage: msgBody,
                    inviteRole: role
                });
                emailSent = true;
            } catch (err) {
                emailError = err.message;
                console.error('[MCNC INVITE EMAIL ERROR]', err.message);
            }
        }

        logAudit(req.mcncAuth.userId, cleanTenant, emailSent ? 'INVITE_EMAILED' : 'INVITE_CREATED', cleanEmail || cleanTenant);

        return res.json({
            success: true,
            tenantName: cleanTenant,
            inviteRole: role,
            inviteToken,
            inviteUrl,
            emailSent,
            emailError
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

    // 8. Live Tenant Usage & Billing Telemetry
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

    // 9. Admin Credit Top-Up & Plan Upgrade Endpoint
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

    console.log('[AUTH & TENANT ENGINE]   : /api/auth/* + SMTP_RHYTHM Invite Mailer MOUNTED');
};
