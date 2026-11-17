const fs = require('fs');
const path = require('path');
const { execFile } = require('child_process');

const MCNC_ROOT = path.resolve(__dirname, '..');
const STATE_PATH = path.join(MCNC_ROOT, 'Data', 'State', 'active_bounty_state.json');
const SCRAPER_SCRIPT = path.join(MCNC_ROOT, 'scripts', 'bounty_scraper.py');

function isCampaignActiveAndValid() {
  if (!fs.existsSync(STATE_PATH)) {
    return { locked: false, reason: 'No active_bounty_state.json found.' };
  }

  try {
    const raw = fs.readFileSync(STATE_PATH, 'utf8');
    const state = JSON.parse(raw);

    if (state.status !== 'ACTIVE') {
      return { locked: false, reason: `Current status is ${state.status || 'UNSET'}.` };
    }

    const nowMs = Date.now();
    const expiryMs = state.expires_at ? new Date(state.expires_at).getTime() : 0;

    if (expiryMs && nowMs >= expiryMs) {
      state.status = 'EXPIRED';
      state.updated_at = new Date().toISOString();
      fs.writeFileSync(STATE_PATH, JSON.stringify(state, null, 2), 'utf8');
      return { locked: false, reason: `Campaign ${state.campaign_id} expired at ${state.expires_at}.` };
    }

    if (typeof state.remaining_pool_usd === 'number' && state.remaining_pool_usd <= 100) {
      state.status = 'DEPLETED';
      state.updated_at = new Date().toISOString();
      fs.writeFileSync(STATE_PATH, JSON.stringify(state, null, 2), 'utf8');
      return { locked: false, reason: `Campaign ${state.campaign_id} pool depleted ($${state.remaining_pool_usd}).` };
    }

    return {
      locked: true,
      reason: `ACTIVE LOCK: [${state.campaign_id}] ${state.title} valid until ${state.expires_at || 'manual release'}.`
    };
  } catch (err) {
    return { locked: false, reason: `State parse error (${err.message}); triggering fresh scan.` };
  }
}

function runBountyHunterSync() {
  return new Promise((resolve, reject) => {
    const check = isCampaignActiveAndValid();

    if (check.locked) {
      console.log(`[BOUNTY GUARD | 110 (90)] ZERO INTERFERENCE -> ${check.reason}`);
      return resolve({ skipped: true, reason: check.reason });
    }

    console.log(`[BOUNTY GUARD | 110 (10)] Triggering Orion & Tess Hunt -> ${check.reason}`);

    execFile('python', [SCRAPER_SCRIPT], { cwd: MCNC_ROOT, timeout: 120000 }, (error, stdout, stderr) => {
      if (stdout) console.log(stdout.trim());
      if (stderr) console.error(`[BOUNTY SCRAPER STDERR] ${stderr.trim()}`);

      if (error) {
        return reject(new Error(`bounty_scraper.py exited with error: ${error.message}`));
      }
      resolve({ skipped: false, output: stdout });
    });
  });
}

module.exports = { runBountyHunterSync };
