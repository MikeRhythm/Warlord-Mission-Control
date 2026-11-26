'use strict';

const fs = require('fs');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');

const BOUNTY_ROOT = path.resolve('C:\\Warlord_Inc\\Warlord_WASP\\MCNC\\Data\\Projects\\Bounty_Engine');
const BOUNTY_LEDGER_FILE = path.join(BOUNTY_ROOT, 'bounties_ledger.json');
const BOUNTY_CAMPAIGNS_DIR = path.join(BOUNTY_ROOT, 'campaigns');
const ARCHIVE_ROOT = path.resolve('C:\\Warlord_Inc\\Warlord_WASP\\MCNC\\vault\\archive\\purged_campaigns');
const TELEMETRY_FILE = path.resolve('C:\\Warlord_Inc\\Warlord_WASP\\MCNC\\vault\\telemetry\\active_telemetry.md');
const PAPERCLIP_TICKETS = path.join(BOUNTY_ROOT, 'Paperclip_Tickets.json');

function logAudit(action, details) {
    const timestamp = new Date().toISOString();
    const entry = `\n- [${timestamp}] **PURGE_AUDIT**:${action} | ${details}`;
    try {
        fs.appendFileSync(TELEMETRY_FILE, entry, 'utf8');
    } catch (e) {
        console.error('[PURGE AUDIT ERROR]', e.message);
    }
}

function preFlightAuditSweep(campaignId) {
    const auditReport = {
        passed: true,
        violations: []
    };

    // 1. Check for uncommitted telemetry references
    if (fs.existsSync(TELEMETRY_FILE)) {
        const telemetryContent = fs.readFileSync(TELEMETRY_FILE, 'utf8');
        if (telemetryContent.includes(campaignId)) {
            auditReport.passed = false;
            auditReport.violations.push(`Uncommitted telemetry reference detected for campaign: ${campaignId}`);
        }
    }

    // 2. Check for pending Paperclip approvals
    if (fs.existsSync(PAPERCLIP_TICKETS)) {
        try {
            const tickets = JSON.parse(fs.readFileSync(PAPERCLIP_TICKETS, 'utf8'));
            const pendingTickets = (tickets.tickets || []).filter(t => 
                t.campaignId === campaignId && t.status !== 'CLOSED'
            );
            if (pendingTickets.length > 0) {
                auditReport.passed = false;
                auditReport.violations.push(`${pendingTickets.length} pending approval ticket(s) found for campaign: ${campaignId}`);
            }
        } catch (e) {
            auditReport.violations.push(`Failed to parse Paperclip_Tickets.json: ${e.message}`);
        }
    }

    // 3. Verify no active WebSocket sessions (placeholder for future integration)
    // This would require querying the live WebSocket registry on Port 8081/8082
    // For now, we log a warning if the campaign was modified in the last 60 seconds
    const campaignDir = path.join(BOUNTY_CAMPAIGNS_DIR, campaignId);
    if (fs.existsSync(campaignDir)) {
        const stat = fs.statSync(campaignDir);
        const ageSeconds = (Date.now() - stat.mtimeMs) / 1000;
        if (ageSeconds < 60) {
            auditReport.passed = false;
            auditReport.violations.push(`Campaign directory modified within last 60 seconds (possible active session): ${campaignId}`);
        }
    }

    return auditReport;
}

function createRollbackSnapshot(campaignId, ledgerEntry) {
    const timestamp = new Date().toISOString().replace(/[-:T.Z]/g, '').slice(0, 14);
    const snapshotDir = path.join(ARCHIVE_ROOT, `${campaignId}_${timestamp}`);

    if (!fs.existsSync(snapshotDir)) {
        fs.mkdirSync(snapshotDir, { recursive: true });
    }

    // Archive campaign directory tree
    const campaignDir = path.join(BOUNTY_CAMPAIGNS_DIR, campaignId);
    if (fs.existsSync(campaignDir)) {
        const archiveCampaignDir = path.join(snapshotDir, 'campaign_files');
        fs.cpSync(campaignDir, archiveCampaignDir, { recursive: true });
    }

    // Archive ledger entry
    const ledgerSnapshot = {
        campaignId,
        purgedAt: new Date().toISOString(),
        ledgerEntry,
        reason: 'Automated purge: expired/dry/locked status + 7-day inactivity threshold'
    };
    fs.writeFileSync(
        path.join(snapshotDir, 'ledger_snapshot.json'),
        JSON.stringify(ledgerSnapshot, null, 2),
        'utf8'
    );

    logAudit('SNAPSHOT_CREATED', `30-day rollback snapshot archived at: ${snapshotDir}`);
    return snapshotDir;
}

function purgeCampaign(campaignId) {
    console.log(`[PURGE ENGINE] Initiating purge protocol for campaign: ${campaignId}`);

    // PHASE 1: PRE-FLIGHT AUDIT SWEEP
    const auditReport = preFlightAuditSweep(campaignId);
    if (!auditReport.passed) {
        const errorMsg = `PRE-PURGE AUDIT FAILED:\n${auditReport.violations.join('\n')}`;
        logAudit('PURGE_ABORTED', errorMsg);
        console.error(`[PURGE ENGINE] ${errorMsg}`);
        return { success: false, error: errorMsg };
    }

    // Load ledger
    if (!fs.existsSync(BOUNTY_LEDGER_FILE)) {
        return { success: false, error: 'Bounty ledger file not found.' };
    }

    let ledger;
    try {
        ledger = JSON.parse(fs.readFileSync(BOUNTY_LEDGER_FILE, 'utf8').replace(/^\uFEFF/, ''));
    } catch (e) {
        return { success: false, error: `Failed to parse ledger: ${e.message}` };
    }

    const targetEntry = (ledger.active || []).find(b => b.id === campaignId);
    if (!targetEntry) {
        return { success: false, error: `Campaign not found in ledger: ${campaignId}` };
    }

    // Verify time-gated safeguard (7-day inactivity threshold)
    const lastActivity = new Date(targetEntry.createdAt || targetEntry.updatedAt || 0);
    const daysSinceActivity = (Date.now() - lastActivity.getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceActivity < 7) {
        const errorMsg = `Campaign was active within last 7 days (${daysSinceActivity.toFixed(1)} days ago). Purge blocked by time-gated safeguard.`;
        logAudit('PURGE_BLOCKED', errorMsg);
        return { success: false, error: errorMsg };
    }

    // Verify status qualifies for purge
    const status = String(targetEntry.poolStatus || '').toUpperCase();
    const isDry = status.includes('DRY') || status.includes('EXPIRED') || status.includes('LOCKED');
    if (!isDry) {
        return { success: false, error: `Campaign status does not qualify for purge: ${status}` };
    }

    // PHASE 2: CREATE ROLLBACK SNAPSHOT
    const snapshotDir = createRollbackSnapshot(campaignId, targetEntry);

    // PHASE 3: ATOMIC DELETION
    // Remove from ledger
    ledger.active = (ledger.active || []).filter(b => b.id !== campaignId);
    fs.writeFileSync(BOUNTY_LEDGER_FILE, JSON.stringify(ledger, null, 2), 'utf8');

    // Remove physical campaign directory
    const campaignDir = path.join(BOUNTY_CAMPAIGNS_DIR, campaignId);
    if (fs.existsSync(campaignDir)) {
        fs.rmSync(campaignDir, { recursive: true, force: true });
    }

    logAudit('CAMPAIGN_PURGED', `Campaign ${campaignId} purged. Snapshot: ${snapshotDir}`);
    console.log(`[PURGE ENGINE] Campaign ${campaignId} successfully purged. 30-day rollback snapshot: ${snapshotDir}`);

    return { success: true, campaignId, snapshotDir };
}

function purgeExpiredSnapshots() {
    if (!fs.existsSync(ARCHIVE_ROOT)) return;

    const now = Date.now();
    const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;

    fs.readdirSync(ARCHIVE_ROOT, { withFileTypes: true })
        .filter(d => d.isDirectory())
        .forEach(d => {
            const snapshotPath = path.join(ARCHIVE_ROOT, d.name);
            const stat = fs.statSync(snapshotPath);
            const ageMs = now - stat.mtimeMs;

            if (ageMs > thirtyDaysMs) {
                fs.rmSync(snapshotPath, { recursive: true, force: true });
                logAudit('SNAPSHOT_EXPIRED', `Permanently deleted 30-day expired snapshot: ${d.name}`);
                console.log(`[PURGE ENGINE] Expired snapshot deleted: ${d.name}`);
            }
        });
}

// CLI Execution Interface
if (require.main === module) {
    const args = process.argv.slice(2);
    const command = args[0];

    if (command === 'purge' && args[1]) {
        const result = purgeCampaign(args[1]);
        console.log(JSON.stringify(result, null, 2));
        process.exit(result.success ? 0 : 1);
    } else if (command === 'cleanup-snapshots') {
        purgeExpiredSnapshots();
        console.log('[PURGE ENGINE] Snapshot cleanup complete.');
        process.exit(0);
    } else {
        console.log('Usage:');
        console.log('  node purge_campaigns.js purge <campaign_id>');
        console.log('  node purge_campaigns.js cleanup-snapshots');
        process.exit(1);
    }
}

module.exports = { purgeCampaign, purgeExpiredSnapshots, preFlightAuditSweep };