require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const { syncRegistry } = require('./tools/model_registry_sync');
const { runAiRadarSync } = require('./tools/ai_radar_sync');

/**
 * WARLORD MCNC CRON DAEMON
 * Owner: Jack
 * Jobs:
 *  1. LLM Registry Sync: Every 6 Hours
 *  2. AI Intel Radar Sync: Daily at 06:00
 */

const SIX_HOURS_MS = 6 * 60 * 60 * 1000;
const ONE_MINUTE_MS = 60 * 1000;

let lastRadarDay = null;

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

async function checkDailyRadarSchedule() {
  const now = new Date();
  const currentDay = now.toISOString().split('T')[0];
  const currentHour = now.getHours();

  // Run at 06:00 once per calendar day
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
}

console.log('====================================================');
console.log('  WARLORD MCNC CRON DAEMON INITIALIZED (BASE 1)     ');
console.log('  Cadence: Model Sync (6h) | AI Radar (Daily 06:00) ');
console.log('====================================================');

// 1. Initial registry sync on boot
executeModelSync();

// 2. Set interval loops
setInterval(executeModelSync, SIX_HOURS_MS);
setInterval(checkDailyRadarSchedule, ONE_MINUTE_MS);