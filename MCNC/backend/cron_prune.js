const fs = require('fs');
const path = require('path');

// LIFECYCLE CONFIGURATION
const VAULT_DIR = path.resolve(__dirname, '..', 'vault');
const DOCS_DIR = path.join(VAULT_DIR, 'Docs');
const ARCHIVE_DIR = path.join(VAULT_DIR, 'Archive', 'Burn_Bag');

// Ensure Burn Bag directory exists
try {
    if (!fs.existsSync(ARCHIVE_DIR)) {
        fs.mkdirSync(ARCHIVE_DIR, { recursive: true });
    }
} catch (e) {
    console.error('[CRON PRUNE INIT WARN]:', e.message);
}

// Sovereign files that NEVER get pruned regardless of age
const IMMORTAL_PATTERNS = [
    /Master_ROE/i,
    /Master_SOP/i,
    /SOUL/i,
    /Mission_Statement/i,
    /02_Director_Board/i,
    /WASP_Protocol/i
];

function runLifecycleAudit(metadataRegistry = {}) {
    const now = Date.now();
    const DAY_MS = 24 * 60 * 60 * 1000;
    const auditLog = [];

    if (!fs.existsSync(DOCS_DIR)) return { audited: 0, pruned: 0, log: [] };

    const files = fs.readdirSync(DOCS_DIR);
    let prunedCount = 0;

    files.forEach(fileName => {
        const filePath = path.join(DOCS_DIR, fileName);
        try {
            if (!fs.statSync(filePath).isFile()) return;

            // 1. Check Sovereign Immunity
            const isImmortal = IMMORTAL_PATTERNS.some(rx => rx.test(fileName));
            const meta = metadataRegistry[fileName] || {
                access_count: 1,
                last_accessed: fs.statSync(filePath).mtimeMs,
                founder_sealed: isImmortal
            };

            if (meta.founder_sealed || isImmortal) {
                auditLog.push({ file: fileName, status: 'IMMORTAL // PROTECTED', score: 0.0 });
                return;
            }

            // 2. Calculate Obsolescence Pressure
            const idleDays = Math.max(0, (now - meta.last_accessed) / DAY_MS);
            const ttlMax = 60.0; // 60-day baseline TTL for research / video dumps
            const refVelocity = Math.log(1 + (meta.access_count || 0));

            // Quadratic time decay offset by reference frequency
            const timeFactor = Math.pow(idleDays / ttlMax, 2);
            const obsolescenceScore = Math.min(1.0, timeFactor / (1 + refVelocity));

            // 3. Execution Decision Thresholds
            if (obsolescenceScore > 0.50) {
                const destPath = path.join(ARCHIVE_DIR, fileName);
                fs.renameSync(filePath, destPath);
                prunedCount++;
                auditLog.push({
                    file: fileName,
                    status: 'PRUNED // BURN BAG',
                    score: obsolescenceScore.toFixed(3),
                    idleDays: idleDays.toFixed(1)
                });
            } else if (obsolescenceScore >= 0.25) {
                auditLog.push({
                    file: fileName,
                    status: 'LEEWAY // MONTY BUFFER',
                    score: obsolescenceScore.toFixed(3),
                    idleDays: idleDays.toFixed(1)
                });
            } else {
                auditLog.push({
                    file: fileName,
                    status: 'ACTIVE // HOT',
                    score: obsolescenceScore.toFixed(3),
                    accesses: meta.access_count
                });
            }
        } catch (fileErr) {
            console.error(`[AUDIT FILE SKIP] ${fileName}:`, fileErr.message);
        }
    });

    return { audited: files.length, pruned: prunedCount, log: auditLog };
}

module.exports = { runLifecycleAudit };