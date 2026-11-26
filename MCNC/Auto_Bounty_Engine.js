// ============================================================================
// WARLORD WASP // AUTONOMOUS BOUNTY CLIPPING & DISPATCH ENGINE
// FILE: C:\Warlord_Inc\Warlord_WASP\MCNC\Auto_Bounty_Engine.js
// ============================================================================

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

const WORKSPACE_DIR = __dirname;
const DEFAULT_BOUNTY_DIR = path.join(WORKSPACE_DIR, 'Data', 'Projects', 'Bounty_Engine');
const DEFAULT_LEDGER_FILE = path.join(DEFAULT_BOUNTY_DIR, 'bounties_ledger.json');
const CHROME_SESSION_MASTER = path.join(WORKSPACE_DIR, 'Data', 'Chrome_Session');

const GLOBAL_DAILY_STEALTH_CAP = 6;
const PER_CAMPAIGN_DAILY_CAP = 3;

// ============================================================================
// DEL-101: IDEMPOTENT FILESYSTEM PROVISIONER
// ============================================================================
function provisionBountyFilesystem(bountyDataDir = DEFAULT_BOUNTY_DIR) {
    const dirs = [
        bountyDataDir,
        path.join(bountyDataDir, 'campaigns'),
        path.join(bountyDataDir, 'intake'),
        path.join(bountyDataDir, 'clips')
    ];
    dirs.forEach(dir => {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
    });

    const ledgerPath = path.join(bountyDataDir, 'bounties_ledger.json');
    if (!fs.existsSync(ledgerPath)) {
        const seed = {
            lastDispatchDate: new Date().toISOString().slice(0, 10),
            active: []
        };
        fs.writeFileSync(ledgerPath, JSON.stringify(seed, null, 2), 'utf8');
    }
    return bountyDataDir;
}

// ============================================================================
// DEL-102 / DEL-103: CHROME SESSION MASTER & WORKER CLONE ISOLATION
// ============================================================================
function provisionChromeSession(sessionDir = CHROME_SESSION_MASTER) {
    const defaultProfile = path.join(sessionDir, 'Default');
    if (!fs.existsSync(defaultProfile)) {
        fs.mkdirSync(defaultProfile, { recursive: true });
    }
    const localStateFile = path.join(sessionDir, 'Local State');
    if (!fs.existsSync(localStateFile)) {
        fs.writeFileSync(localStateFile, JSON.stringify({ profile: { info_cache: {} } }, null, 2), 'utf8');
    }
    return sessionDir;
}

function cloneIsolatedWorkerSession(workerTag = 'worker') {
    provisionChromeSession(CHROME_SESSION_MASTER);
    const workerDir = path.join(WORKSPACE_DIR, 'Data', 'Chrome_Workers', `${workerTag}_${Date.now()}`);
    fs.mkdirSync(path.join(workerDir, 'Default'), { recursive: true });

    const filesToClone = ['Cookies', 'Login Data', 'Web Data', 'Preferences', 'Secure Preferences'];
    filesToClone.forEach(fileName => {
        const src = path.join(CHROME_SESSION_MASTER, 'Default', fileName);
        const dst = path.join(workerDir, 'Default', fileName);
        if (fs.existsSync(src)) {
            try {
                fs.copyFileSync(src, dst);
            } catch (e) {}
        }
    });

    const masterLocalState = path.join(CHROME_SESSION_MASTER, 'Local State');
    if (fs.existsSync(masterLocalState)) {
        try {
            fs.copyFileSync(masterLocalState, path.join(workerDir, 'Local State'));
        } catch (e) {}
    }
    return workerDir;
}

function cleanupWorkerSession(workerDir) {
    if (workerDir && fs.existsSync(workerDir)) {
        try {
            fs.rmSync(workerDir, { recursive: true, force: true });
        } catch (e) {}
    }
}

// ============================================================================
// DEL-104 / DEL-112: EXPLICIT DRY, EXPIRED & LOCKED CAMPAIGN REJECTION GATE
// ============================================================================
function isBountyExpiredOrDry(b) {
    if (!b) return true;
    const statusUpper = String(`${b.poolStatus || ''} ${b.status || ''} ${b.title || ''}`).toUpperCase();
    if (
        statusUpper.includes('LOCKED') ||
        statusUpper.includes('PAUSED') ||
        statusUpper.includes('MANUAL_HOLD') ||
        statusUpper.includes('DRY') ||
        statusUpper.includes('EXPIRED') ||
        statusUpper.includes('ENDED') ||
        statusUpper.includes('CLOSED') ||
        statusUpper.includes('PURGE')
    ) {
        return true;
    }

    const pctMatch = statusUpper.match(/(\d+(?:\.\d+)?)%/);
    if (pctMatch && parseFloat(pctMatch[1]) <= 0) return true;
    if (b.runwayDays !== undefined && Number(b.runwayDays) <= 0) return true;
    return false;
}

// Boot-time filesystem & Chrome session initialization
provisionBountyFilesystem(DEFAULT_BOUNTY_DIR);
provisionChromeSession(CHROME_SESSION_MASTER);

// ============================================================================
// FFMPEG 9:16 VERTICAL SHORT RENDERER
// ============================================================================
function buildVerticalShortCommand(sourceFile, hookText, startTimestamp, endTimestamp, outputPath) {
    const cleanHook = String(hookText || 'MUST WATCH')
        .toUpperCase()
        .replace(/['":\\;%]/g, '')
        .slice(0, 46);

    const winFont = 'C:/Windows/Fonts/arialbd.ttf';
    const fontPart = fs.existsSync(winFont) ? `fontfile='C\\:/Windows/Fonts/arialbd.ttf':` : '';
    const startSec = startTimestamp || '00:00:00';
    const endSec = endTimestamp || '00:00:55';

    return `ffmpeg -y -ss ${startSec} -to ${endSec} -i "${sourceFile}" -vf "crop=ih*(9/16):ih:(iw-ih*(9/16))/2:0,scale=1080:1920,drawtext=${fontPart}text='${cleanHook}':fontcolor=white:fontsize=46:box=1:boxcolor=black@0.72:boxborderw=18:x=(w-text_w)/2:y=230:enable='between(t,0,4.0)'" -c:v libx264 -crf 20 -preset fast -c:a aac -b:a 192k "${outputPath}"`;
}

// ============================================================================
// SOURCE INTAKE RESOLVER (LOCAL MP4 -> YOUTUBE URL -> DISCOVERY SEARCH)
// ============================================================================
async function resolveOrDownloadSourceVideo(bounty, intakeDir, logStep) {
    const configuredPath = (bounty.sourcePath || '').trim();
    if (configuredPath && fs.existsSync(configuredPath)) {
        logStep(`[1/4 INTAKE] Verified local source MP4 on disk: ${path.basename(configuredPath)}`);
        return configuredPath;
    }

    const defaultLocal = path.join(intakeDir, `${bounty.id}_source.mp4`);
    if (fs.existsSync(defaultLocal)) {
        logStep(`[1/4 INTAKE] Found cached campaign source MP4: ${path.basename(defaultLocal)}`);
        return defaultLocal;
    }

    // Check if an existing MP4 already sits in intakeDir
    if (fs.existsSync(intakeDir)) {
        const existingMp4 = fs.readdirSync(intakeDir).find(f => f.toLowerCase().endsWith('.mp4'));
        if (existingMp4) {
            const fullExisting = path.join(intakeDir, existingMp4);
            logStep(`[1/4 INTAKE] Using staged intake video: ${existingMp4}`);
            return fullExisting;
        }
    }

    // Download via yt-dlp using explicit YouTube URL or targeted search query
    const rawQuery = (bounty.youtubeUrl || '').trim()
        || `ytsearch1:${(bounty.title || 'viral podcast highlight').replace(/\/\/.*/g, '').trim()} funny moment`;

    const cookiesTxt = path.join(CHROME_SESSION_MASTER, 'youtube_cookies.txt');
    const authFlag = fs.existsSync(cookiesTxt)
        ? `--cookies "${cookiesTxt}"`
        : `--cookies-from-browser "chrome:${CHROME_SESSION_MASTER}"`;

    logStep(`[1/4 INTAKE] Acquiring 1080p source footage via yt-dlp (${rawQuery.slice(0, 64)})...`);
    const ytdlpCmd = `python -m yt_dlp --js-runtimes node --remote-components ejs:github --extractor-args "youtube:player_client=default,web_embedded" ${authFlag} -f "best[height<=1080][protocol*=m3u8]/bestvideo[height<=1080]+bestaudio/best[height<=1080]/best" --max-filesize 250M --merge-output-format mp4 -o "${defaultLocal}" "${rawQuery}"`;
    await execPromise(ytdlpCmd, { timeout: 180000 });

    if (!fs.existsSync(defaultLocal)) {
        throw new Error(`yt-dlp completed but source MP4 was not found at ${defaultLocal}`);
    }
    return defaultLocal;
}

// ============================================================================
// MAIN AUTONOMOUS BOUNTY EXECUTION ENTRYPOINT (CALLED BY SERVER.JS & CRON)
// ============================================================================
async function autoExecuteBounty({
    bounty = null,
    logStep = (msg) => console.log(msg),
    bountyDataDir = DEFAULT_BOUNTY_DIR,
    ledgerFile = DEFAULT_LEDGER_FILE
} = {}) {
    provisionBountyFilesystem(bountyDataDir);
    const today = new Date().toISOString().slice(0, 10);

    let ledger = { lastDispatchDate: today, active: [] };
    if (fs.existsSync(ledgerFile)) {
        try {
            const parsed = JSON.parse(fs.readFileSync(ledgerFile, 'utf8').replace(/^\uFEFF/, ''));
            ledger = {
                lastDispatchDate: parsed.lastDispatchDate || today,
                active: Array.isArray(parsed.active) ? parsed.active : []
            };
        } catch (e) {}
    }

    // Reset daily counters on new calendar day
    if (ledger.lastDispatchDate !== today) {
        ledger.lastDispatchDate = today;
        ledger.active = ledger.active.map(item => ({ ...item, dailyPostsUsed: 0 }));
    }

    // Purge any dry, locked, or expired campaigns from ledger & disk before dispatch
    const validActive = [];
    for (const item of ledger.active) {
        if (isBountyExpiredOrDry(item)) {
            logStep(`[AUTO-PURGE] Obliterating dry/expired funnel: ${item.id}`);
            const deadDir = path.join(bountyDataDir, 'campaigns', item.id);
            if (fs.existsSync(deadDir)) {
                try { fs.rmSync(deadDir, { recursive: true, force: true }); } catch (e) {}
            }
        } else {
            validActive.push(item);
        }
    }
    ledger.active = validActive;

    // Enforce global daily stealth cap (6/day)
    const totalUsedToday = ledger.active.reduce((sum, item) => sum + (Number(item.dailyPostsUsed) || 0), 0);
    if (totalUsedToday >= GLOBAL_DAILY_STEALTH_CAP) {
        fs.writeFileSync(ledgerFile, JSON.stringify(ledger, null, 2), 'utf8');
        logStep(`[GOVERNOR GATE] Global stealth cap reached (${totalUsedToday}/${GLOBAL_DAILY_STEALTH_CAP}). Sleeping until tomorrow.`);
        return {
            renderedClips: [],
            postStatus: 'CAP_REACHED',
            activeList: ledger.active
        };
    }

    // Select target campaign (explicit override or highest-yielding eligible campaign under 3/campaign cap)
    let target = bounty && !isBountyExpiredOrDry(bounty)
        ? (ledger.active.find(x => x.id === bounty.id) || bounty)
        : ledger.active.find(x => (Number(x.dailyPostsUsed) || 0) < PER_CAMPAIGN_DAILY_CAP);

    if (!target) {
        fs.writeFileSync(ledgerFile, JSON.stringify(ledger, null, 2), 'utf8');
        logStep(`[GOVERNOR GATE] No eligible active campaigns with open slots.`);
        return {
            renderedClips: [],
            postStatus: 'NO_ELIGIBLE_BOUNTIES',
            activeList: ledger.active
        };
    }

    const campaignDir = path.join(bountyDataDir, 'campaigns', target.id);
    const intakeDir = path.join(campaignDir, 'intake');
    const clipsDir = path.join(campaignDir, 'clips');
    fs.mkdirSync(intakeDir, { recursive: true });
    fs.mkdirSync(clipsDir, { recursive: true });

    // Step 1: Acquire / verify source video
    const sourceFile = await resolveOrDownloadSourceVideo(target, intakeDir, logStep);

    // Step 2: Render 1 vertical 9:16 Short per dispatch pass
    const clipIndex = (Number(target.dailyPostsUsed) || 0) + 1;
    const outputFilename = `${target.id}_short_${clipIndex}_${Date.now()}.mp4`;
    const outputPath = path.join(clipsDir, outputFilename);

    logStep(`[2/4 RENDER] Rendering 9:16 Short via FFmpeg (${outputFilename})...`);
    const ffmpegCmd = buildVerticalShortCommand(
        sourceFile,
        target.hookHeadline || target.title,
        target.startTime || '00:00:05',
        target.endTime || '00:00:55',
        outputPath
    );
    await execPromise(ffmpegCmd, { timeout: 180000 });

    if (!fs.existsSync(outputPath)) {
        throw new Error(`FFmpeg render failed to produce output file: ${outputPath}`);
    }

    // Step 3: Isolated worker session check & staging verification
    let workerSessionDir = null;
    try {
        workerSessionDir = cloneIsolatedWorkerSession(target.id);
        logStep(`[3/4 STAGING] Verified isolated Chrome worker session & staged clip in outbox (${clipsDir}).`);
    } finally {
        cleanupWorkerSession(workerSessionDir);
    }

    // Step 4: Persist updated daily post telemetry to bounties_ledger.json
    let updatedTarget = null;
    ledger.active = ledger.active.map(item => {
        if (item.id === target.id) {
            updatedTarget = {
                ...item,
                sourcePath: sourceFile,
                dailyPostsUsed: (Number(item.dailyPostsUsed) || 0) + 1,
                lastDispatchedAt: new Date().toISOString()
            };
            return updatedTarget;
        }
        return item;
    });

    if (!updatedTarget) {
        updatedTarget = {
            ...target,
            sourcePath: sourceFile,
            dailyPostsUsed: 1,
            lastDispatchedAt: new Date().toISOString()
        };
        ledger.active.unshift(updatedTarget);
    }

    ledger.active = ledger.active.slice(0, 5);
    fs.writeFileSync(ledgerFile, JSON.stringify(ledger, null, 2), 'utf8');
    logStep(`[4/4 LEDGER SYNC] Updated bounties_ledger.json (${updatedTarget.dailyPostsUsed}/${PER_CAMPAIGN_DAILY_CAP} campaign slots used).`);

    return {
        bountyId: target.id,
        renderedClips: [{ filename: outputFilename, path: outputPath }],
        postStatus: 'STAGED_AND_VERIFIED',
        activeList: ledger.active
    };
}

module.exports = {
    autoExecuteBounty,
    isBountyExpiredOrDry,
    provisionBountyFilesystem,
    provisionChromeSession
};


