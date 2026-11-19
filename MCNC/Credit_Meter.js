'use strict';

const path = require('path');
const fs = require('fs');
const { DatabaseSync } = require('node:sqlite');
const { resolveTenantContext } = require('./Tenant_Scope_Resolver');

const DATA_DIR = path.resolve('C:\\Warlord_Inc\\Warlord_WASP\\MCNC\\Data');
const AUTH_DB_PATH = path.join(DATA_DIR, 'MCNC_Auth.db');
const TENANTS_ROOT = path.join(DATA_DIR, 'Tenants');

// Commercial markup multiplier on underlying OpenRouter API spend (4x = 75% gross margin)
const MARKUP_MULTIPLIER = 4.0;

// Underlying per-1M token rates (USD) for premium models; local/free clusters = $0
const MODEL_RATES = [
    { match: /opus/i, inPer1M: 15.0, outPer1M: 75.0 },
    { match: /sonnet|claude-3\.5|claude-3\.7|claude-5/i, inPer1M: 3.0, outPer1M: 15.0 },
    { match: /grok/i, inPer1M: 2.0, outPer1M: 6.0 },
    { match: /gpt-4o|gpt-5/i, inPer1M: 2.5, outPer1M: 10.0 },
    { match: /haiku|mini|flash/i, inPer1M: 0.25, outPer1M: 1.25 }
];

function isFreeClusterModel(modelName) {
    const m = String(modelName || '').toLowerCase();
    if (!m) return true;
    if (m.includes('ollama') || m.includes('local') || m.includes('groq') || m.includes('nim') || m.includes('free')) {
        return true;
    }
    return !MODEL_RATES.some((r) => r.match.test(m));
}

function estimateCostUsd(modelName, promptTokens, completionTokens) {
    if (isFreeClusterModel(modelName)) return 0;
    const m = String(modelName || '');
    const rate = MODEL_RATES.find((r) => r.match.test(m)) || { inPer1M: 2.0, outPer1M: 8.0 };
    const rawUsd = ((promptTokens / 1e6) * rate.inPer1M) + ((completionTokens / 1e6) * rate.outPer1M);
    return Number((rawUsd * MARKUP_MULTIPLIER).toFixed(6));
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

function ensureCreditColumns() {
    let db;
    try {
        db = new DatabaseSync(AUTH_DB_PATH);
        const cols = [
            "ALTER TABLE Users ADD COLUMN Plan_Tier TEXT DEFAULT 'STARTER'",
            "ALTER TABLE Users ADD COLUMN Credit_Balance_USD REAL DEFAULT 10.0",
            "ALTER TABLE Users ADD COLUMN Credits_Used_USD REAL DEFAULT 0.0",
            "ALTER TABLE Users ADD COLUMN Total_Tokens_Used INTEGER DEFAULT 0",
            "ALTER TABLE Users ADD COLUMN Monthly_Renders_Used INTEGER DEFAULT 0",
            "ALTER TABLE Users ADD COLUMN Monthly_Renders_Limit INTEGER DEFAULT 20"
        ];
        for (const sql of cols) {
            try { db.exec(sql); } catch (_) { /* Column already exists */ }
        }
        // Ensure EXEC_ADMIN (Mike) has Sovereign tier & uncapped balance
        db.prepare("UPDATE Users SET Plan_Tier = 'SOVEREIGN_ADMIN', Credit_Balance_USD = 999999.0, Monthly_Renders_Limit = 9999 WHERE Role = 'EXEC_ADMIN'").run();
    } finally {
        if (db) db.close();
    }
}

function getTenantUsage(tenantId) {
    ensureCreditColumns();
    let db;
    try {
        db = new DatabaseSync(AUTH_DB_PATH);
        const row = db.prepare(`
            SELECT Username, Role, Tenant_ID, Storage_Quota_MB, Plan_Tier,
                   Credit_Balance_USD, Credits_Used_USD, Total_Tokens_Used,
                   Monthly_Renders_Used, Monthly_Renders_Limit
            FROM Users WHERE Tenant_ID = ?
        `).get(tenantId);

        const targetDir = (row && row.Role === 'EXEC_ADMIN' && tenantId === 'Mike')
            ? path.join(DATA_DIR, 'Projects')
            : path.join(TENANTS_ROOT, tenantId);

        const diskUsedMb = Number((getFolderSizeBytes(targetDir) / (1024 * 1024)).toFixed(2));

        if (!row) {
            return {
                tenantId,
                planTier: 'STARTER',
                diskUsedMb,
                diskQuotaMb: 500,
                creditBalanceUsd: 0,
                creditsUsedUsd: 0,
                totalTokensUsed: 0,
                rendersUsed: 0,
                rendersLimit: 20
            };
        }

        return {
            username: row.Username,
            role: row.Role,
            tenantId: row.Tenant_ID,
            planTier: row.Plan_Tier || 'STARTER',
            diskUsedMb,
            diskQuotaMb: Number(row.Storage_Quota_MB || 500),
            creditBalanceUsd: Number((row.Credit_Balance_USD ?? 10.0).toFixed(4)),
            creditsUsedUsd: Number((row.Credits_Used_USD ?? 0).toFixed(4)),
            totalTokensUsed: Number(row.Total_Tokens_Used || 0),
            rendersUsed: Number(row.Monthly_Renders_Used || 0),
            rendersLimit: Number(row.Monthly_Renders_Limit || 20)
        };
    } finally {
        if (db) db.close();
    }
}

function deductChatCredits(tenantId, modelName, promptTokens, completionTokens) {
    if (!tenantId || tenantId === 'Mike') return;
    const totalTokens = Math.max(0, Math.round(promptTokens + completionTokens));
    const costUsd = estimateCostUsd(modelName, promptTokens, completionTokens);
    let db;
    try {
        db = new DatabaseSync(AUTH_DB_PATH);
        db.prepare(`
            UPDATE Users
            SET Credit_Balance_USD = MAX(0, COALESCE(Credit_Balance_USD, 10.0) - ?),
                Credits_Used_USD = COALESCE(Credits_Used_USD, 0.0) + ?,
                Total_Tokens_Used = COALESCE(Total_Tokens_Used, 0) + ?
            WHERE Tenant_ID = ?
        `).run(costUsd, costUsd, totalTokens, tenantId);
    } catch (_) {
        // Non-blocking telemetry fallback
    } finally {
        if (db) db.close();
    }
}

function topUpTenantCredits(tenantId, addUsd, newQuotaMb, planTier) {
    ensureCreditColumns();
    let db;
    try {
        db = new DatabaseSync(AUTH_DB_PATH);
        const amt = Math.max(0, Number(addUsd || 0));
        if (amt > 0) {
            db.prepare('UPDATE Users SET Credit_Balance_USD = COALESCE(Credit_Balance_USD, 0) + ? WHERE Tenant_ID = ?')
              .run(amt, tenantId);
        }
        if (newQuotaMb && Number(newQuotaMb) >= 100) {
            db.prepare('UPDATE Users SET Storage_Quota_MB = ? WHERE Tenant_ID = ?')
              .run(Number(newQuotaMb), tenantId);
        }
        if (planTier) {
            db.prepare('UPDATE Users SET Plan_Tier = ? WHERE Tenant_ID = ?')
              .run(String(planTier).toUpperCase(), tenantId);
        }
        return getTenantUsage(tenantId);
    } finally {
        if (db) db.close();
    }
}

// Express middleware for /api/chat: blocks paid models at $0 balance & meters response tokens
function creditMeterMiddleware(req, res, next) {
    const ctx = resolveTenantContext(req);
    if (!ctx.authenticated) {
        return res.status(401).json({ success: false, error: 'Authentication required' });
    }
    if (ctx.isMasterMike) return next();

    const requestedModel = (req.body && (req.body.model || req.body.engine || req.body.tier)) || '';
    const usage = getTenantUsage(ctx.effectiveTenant);

    if (!isFreeClusterModel(requestedModel) && usage.creditBalanceUsd <= 0) {
        return res.status(402).json({
            success: false,
            code: 'CREDITS_EXHAUSTED',
            error: 'AI Compute Credits exhausted ($0.00 remaining). Switch to Local/Free Engine or Top Up Credits in your Usage Drawer.'
        });
    }

    // Wrap res.json to capture token usage from LLM response cleanly
    const origJson = res.json.bind(res);
    res.json = function (payload) {
        try {
            const promptText = JSON.stringify((req.body && (req.body.message || req.body.prompt || req.body.messages)) || '');
            const replyText = JSON.stringify((payload && (payload.reply || payload.response || payload.text || payload.content)) || '');
            const pTokens = (payload && payload.usage && payload.usage.prompt_tokens) || Math.ceil(promptText.length / 4);
            const cTokens = (payload && payload.usage && payload.usage.completion_tokens) || Math.ceil(replyText.length / 4);
            const usedModel = (payload && payload.model) || requestedModel;
            deductChatCredits(ctx.effectiveTenant, usedModel, pTokens, cTokens);
        } catch (_) {
            // Never block response delivery
        }
        return origJson(payload);
    };

    next();
}

ensureCreditColumns();

module.exports = {
    ensureCreditColumns,
    getTenantUsage,
    deductChatCredits,
    topUpTenantCredits,
    creditMeterMiddleware
};
