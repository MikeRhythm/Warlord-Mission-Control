require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { syncRegistry } = require('../tools/model_registry_sync');
const { runAiRadarSync } = require('../tools/ai_radar_sync');
const { runBountyHunterSync } = require('../tools/bounty_hunter_sync');

const SIX_HOURS_MS = 6 * 60 * 60 * 1000;
const ONE_MINUTE_MS = 60 * 1000;

let lastRadarDay = null;
let lastBountyDay = null;

async function executeModelSync() {
  const timestamp = new Date().toISOString();
  console.log(`\n[CRON DAEMON | ${timestamp}] Triggering Model Registry check...`);
  try {
    await syncRegistry();
    console.log(`[CRON DAEMON | ${timestamp}] Active models successfully refreshed.`);
  } catch (err) {
    console.error(`[CRON DAEMON ERROR | ${timestamp}] Model sync failed: ${err.message}`);
  }
}

async function executeBountyGate() {
  const timestamp = new Date().toISOString();
  console.log(`\n[CRON DAEMON | ${timestamp}] Checking 110 Bounty State Lock...`);
  try {
    await runBountyHunterSync();
  } catch (err) {
    console.error(`[CRON DAEMON ERROR | ${timestamp}] Bounty Gate failed: ${err.message}`);
  }
}

async function checkDailySchedules() {
  const now = new Date();
  const currentDay = now.toISOString().split('T')[0];
  const currentHour = now.getHours();

  if (currentHour === 6 && lastRadarDay !== currentDay) {
    lastRadarDay = currentDay;
    console.log(`\n[CRON DAEMON | ${now.toISOString()}] Executing Daily AI Radar Ingestion...`);
    try {
      await runAiRadarSync();
      console.log(`[CRON DAEMON | ${now.toISOString()}] AI Radar report staged successfully.`);
    } catch (err) {
      console.error(`[CRON DAEMON ERROR] AI Radar sync failed: ${err.message}`);
    }
  }

  if (currentHour === 6 && lastBountyDay !== currentDay) {
    lastBountyDay = currentDay;
    await executeBountyGate();
  }
}

console.log('====================================================');
console.log('  WARLORD MCNC CRON DAEMON INITIALIZED (BASE 1)     ');
console.log('  Cadence: Model Sync (6h) | Radar & Bounty (06:00) ');
console.log('====================================================');

executeModelSync();
executeBountyGate();

setInterval(executeModelSync, SIX_HOURS_MS);
setInterval(checkDailySchedules, ONE_MINUTE_MS);
