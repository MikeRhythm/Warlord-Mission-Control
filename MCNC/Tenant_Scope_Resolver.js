'use strict';

const crypto = require('crypto');
const path = require('path');
const fs = require('fs');
const { DatabaseSync } = require('node:sqlite');

const BASE_MCNC = path.resolve('C:\\Warlord_Inc\\Warlord_WASP\\MCNC');
const DATA_DIR = path.join(BASE_MCNC, 'Data');
const AUTH_DB_PATH = path.join(DATA_DIR, 'MCNC_Auth.db');
const TENANTS_ROOT = path.join(DATA_DIR, 'Tenants');
const MASTER_PROJECTS_ROOT = path.join(DATA_DIR, 'Projects');
const MASTER_CHATS_ROOT = path.join(DATA_DIR, 'Chats');
const VALID_TENANTS = ['Mike', 'Adine', 'Claire', 'Egmond'];

const SECRET_SEED = process.env.MCNC_AUTH_SECRET || process.env.API_KEY || 'MCNC_RHYTHM_SOVEREIGN_BASE1_KEY_2026';
const SIGNING_KEY = crypto.createHash('sha256').update(SECRET_SEED).digest();

function base64UrlDecode(str) {
    const pad = 4 - (str.length % 4);
    const padded = str + (pad < 4 ? '='.repeat(pad) : '');
    return Buffer.from(padded.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8');
}

function verifyToken(token) {
    if (!token || typeof token !== 'string') return null;
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [header, body, sig] = parts;
    const expectedSig = Buffer.from(
        crypto.createHmac('sha256', SIGNING_KEY).update(`${header}.${body}`).digest()
    ).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
    const a = Buffer.from(sig);
    const b = Buffer.from(expectedSig);
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
    try {
        const parsed = JSON.parse(base64UrlDecode(body));
        if (!parsed.exp || parsed.exp < Math.floor(Date.now() / 1000)) return null;
        return parsed;
    } catch (_) {
        return null;
    }
}

function getFolderSizeBytes(dirPath) {
    if (!fs.existsSync(dirPath)) return 0;
    let total = 0;
    for (const entry of fs.readdirSync(dirPath, { withFileTypes: true })) {
        const full = path.join(dirPath, entry.name);
        if (entry.isDirectory()) total += getFolderSizeBytes(full);
        else total += fs.statSync(full).size;
    }
    return total;
}

function resolveTenantContext(req) {
    const authHeader = (req && req.headers && req.headers['authorization']) || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
    const claims = verifyToken(token);

    if (!claims) {
        return {
            authenticated: false,
            role: 'GUEST',
            effectiveTenant: 'UNAUTHENTICATED',
            projectsRoot: path.join(TENANTS_ROOT, '_Unauthenticated_Empty'),
            chatsRoot: path.join(TENANTS_ROOT, '_Unauthenticated_Empty'),
            quotaMb: 0
        };
    }

    let effectiveTenant = claims.tenantId;
    const requestedTarget = ((req.headers && req.headers['x-target-tenant']) || '').trim();
    if (claims.role === 'EXEC_ADMIN' && requestedTarget && VALID_TENANTS.includes(requestedTarget)) {
        effectiveTenant = requestedTarget;
    }

    let quotaMb = 500;
    let db;
    try {
        db = new DatabaseSync(AUTH_DB_PATH);
        const row = db.prepare('SELECT Storage_Quota_MB FROM Users WHERE Tenant_ID = ?').get(effectiveTenant);
        if (row && row.Storage_Quota_MB) quotaMb = row.Storage_Quota_MB;
    } catch (_) {
        // Fallback to default 500MB
    } finally {
        if (db) db.close();
    }

    // Mike viewing his own workspace uses Master Projects; Adine/Claire (or Mike inspecting them) use isolated Tenant folders
    const isMikeMaster = (claims.role === 'EXEC_ADMIN' && effectiveTenant === 'Mike');
    const projectsRoot = isMikeMaster ? MASTER_PROJECTS_ROOT : path.join(TENANTS_ROOT, effectiveTenant, 'Projects');
    const chatsRoot = isMikeMaster ? MASTER_CHATS_ROOT : path.join(TENANTS_ROOT, effectiveTenant, 'Chats');

    if (!fs.existsSync(projectsRoot)) fs.mkdirSync(projectsRoot, { recursive: true });
    if (!fs.existsSync(chatsRoot)) fs.mkdirSync(chatsRoot, { recursive: true });

    return {
        authenticated: true,
        userId: claims.userId,
        role: claims.role,
        effectiveTenant,
        projectsRoot,
        chatsRoot,
        quotaMb
    };
}

function checkTenantQuota(req, res, next) {
    if (req.method === 'POST' || req.method === 'PUT') {
        const ctx = resolveTenantContext(req);
        if (!ctx.authenticated) {
            return res.status(401).json({ success: false, error: 'Authentication required' });
        }
        const tenantBase = path.join(TENANTS_ROOT, ctx.effectiveTenant);
        const usedMb = getFolderSizeBytes(tenantBase) / (1024 * 1024);
        if (usedMb >= ctx.quotaMb) {
            return res.status(402).json({
                success: false,
                code: 'QUOTA_EXCEEDED',
                error: `Storage limit reached (${usedMb.toFixed(1)}MB / ${ctx.quotaMb}MB). Upgrade plan to expand workspace capacity.`
            });
        }
    }
    next();
}

module.exports = { resolveTenantContext, checkTenantQuota };

