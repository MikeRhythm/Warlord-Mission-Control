const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const puppeteer = require('puppeteer');

const WORKSPACE_DIR = __dirname;
const YTDLP_BIN = fs.existsSync(path.join(WORKSPACE_DIR, 'yt-dlp.exe'))
    ? path.join(WORKSPACE_DIR, 'yt-dlp.exe')
    : 'yt-dlp';

const GLOBAL_DAILY_CAP = 6;       // Safely under YouTube/TikTok 9-10/day spam threshold
const PER_CAMPAIGN_DAILY_CAP = 3; // Safely inside Vyro starter per-campaign limit
const MAX_CLIPS_PER_WINDOW = 2;   // Organic drip-feed per 2-hour cron window

function resolveFfmpegBin(bountyDataDir) {
    const candidates = [
        bountyDataDir ? path.join(bountyDataDir, 'ffmpeg.exe') : '',
        'C:\\Warlord_Inc\\Warlord_WASP\\MCNC\\Data\\Projects\\BOUNTY_ENGINE\\ffmpeg.exe',
        path.join(WORKSPACE_DIR, 'ffmpeg.exe')
    ].filter(Boolean);
    for (const candidate of candidates) {
        if (fs.existsSync(candidate)) return candidate;
    }
    return 'ffmpeg';
}

function getTodayKey() {
    return new Date().toISOString().slice(0, 10);
}

function isBountyExpiredOrDry(b) {
    if (!b) return true;
    const status = String(b.poolStatus || '').toUpperCase();
    if (status.includes('DRY') || status.includes('EXPIRED') || status.includes('PURGE')) return true;
    const pctMatch = status.match(/(\d+(?:\.\d+)?)%/);
    if (pctMatch && parseFloat(pctMatch[1]) <= 0) return true;
    if (b.runwayDays !== undefined && Number(b.runwayDays) <= 0) return true;
    return false;
}

function resolveBountyPlatform(b) {
    if (b && b.platform) return String(b.platform).trim();
    const idStr = String((b && b.id) || '').toLowerCase();
    const titleStr = String((b && b.title) || '').toLowerCase();
    if (idStr.startsWith('whop_') || titleStr.includes('whop')) return 'Whop';
    return 'Vyro';
}

function runCmd(cmd) {
    return new Promise((resolve, reject) => {
        exec(cmd, { maxBuffer: 1024 * 1024 * 50 }, (err, stdout, stderr) => {
            if (err) return reject(new Error(stderr || err.message));
            resolve(stdout.trim());
        });
    });
}

function getMediaDurationSec(ffmpegBin, filePath) {
    return new Promise((resolve) => {
        exec(`"${ffmpegBin}" -i "${filePath}"`, (err, stdout, stderr) => {
            const output = `${stdout || ''}\n${stderr || ''}`;
            const match = output.match(/Duration:\s*(\d+):(\d+):(\d+(?:\.\d+)?)/);
            if (!match) return resolve(0);
            const hrs = parseFloat(match[1]) || 0;
            const mins = parseFloat(match[2]) || 0;
            const secs = parseFloat(match[3]) || 0;
            resolve(hrs * 3600 + mins * 60 + secs);
        });
    });
}

function formatTimestamp(totalSeconds) {
    const clamped = Math.max(0, Math.floor(totalSeconds));
    const h = String(Math.floor(clamped / 3600)).padStart(2, '0');
    const m = String(Math.floor((clamped % 3600) / 60)).padStart(2, '0');
    const s = String(clamped % 60).padStart(2, '0');
    return `${h}:${m}:${s}`;
}

async function exportYouTubeCookies(sessionPath, cookieFile) {
    let browser = null;
    try {
        browser = await puppeteer.launch({
            headless: 'new',
            userDataDir: sessionPath,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();
        await page.goto('https://www.youtube.com', { waitUntil: 'domcontentloaded', timeout: 15000 }).catch(() => {});
        const cookies = await page.cookies('https://www.youtube.com', 'https://accounts.google.com');
        if (cookies && cookies.length > 0) {
            const lines = ['# Netscape HTTP Cookie File'];
            for (const c of cookies) {
                const domain = c.domain.startsWith('.') ? c.domain : `.${c.domain}`;
                const flag = domain.startsWith('.') ? 'TRUE' : 'FALSE';
                const secure = c.secure ? 'TRUE' : 'FALSE';
                const expiry = c.expires && c.expires > 0 ? Math.floor(c.expires) : Math.floor(Date.now() / 1000) + 86400 * 30;
                lines.push(`${domain}\t${flag}\t${c.path || '/'}\t${secure}\t${expiry}\t${c.name}\t${c.value}`);
            }
            fs.writeFileSync(cookieFile, lines.join('\n'), 'utf8');
        }
    } catch (e) {
    } finally {
        if (browser) await browser.close().catch(() => {});
    }
}

async function autoExecuteBounty({ bounty, logStep, bountyDataDir, ledgerFile }) {
    const today = getTodayKey();
    let ledger = { lastDispatchDate: today, active: [] };
    if (fs.existsSync(ledgerFile)) {
        try {
            const parsed = JSON.parse(fs.readFileSync(ledgerFile, 'utf8'));
            ledger = {
                lastDispatchDate: parsed.lastDispatchDate || today,
                active: Array.isArray(parsed.active) ? parsed.active : []
            };
        } catch (e) {}
    }

    if (ledger.lastDispatchDate !== today) {
        logStep(`[GOVERNOR] New calendar day (${today}). Auto-resetting daily dispatch slots to 0/${GLOBAL_DAILY_CAP}...`);
        ledger.lastDispatchDate = today;
        ledger.active = ledger.active.map(item => ({ ...item, dailyPostsUsed: 0 }));
    }

    if (bounty && bounty.id) {
        const exists = ledger.active.some(item => item.id === bounty.id);
        if (exists) {
            ledger.active = ledger.active.map(item => item.id === bounty.id ? { ...item, ...bounty } : item);
        } else {
            ledger.active.unshift({ ...bounty, dailyPostsUsed: 0 });
        }
    }

    const survivingFunnels = [];
    for (const item of ledger.active) {
        if (isBountyExpiredOrDry(item)) {
            const deadDir = path.join(bountyDataDir, 'campaigns', item.id);
            if (fs.existsSync(deadDir)) {
                fs.rmSync(deadDir, { recursive: true, force: true });
            }
            logStep(`[GOVERNOR PURGE] Funnel "${item.title || item.id}" ran out of pool/time. Purged disk artifacts & removed from queue.`);
        } else {
            survivingFunnels.push(item);
        }
    }
    ledger.active = survivingFunnels;
    fs.writeFileSync(ledgerFile, JSON.stringify(ledger, null, 2), 'utf8');

    if (ledger.active.length === 0) {
        logStep(`[GOVERNOR IDLE] All funnels exhausted & purged. Waiting for Tess auto-scout.`);
        return { sourceFile: '', renderedClips: [], updatedBounty: null, activeList: [], postStatus: 'ALL FUNNELS PURGED' };
    }

    const usedToday = ledger.active.reduce((sum, b) => sum + (Number(b.dailyPostsUsed) || 0), 0);
    const remainingGlobalSlots = Math.max(0, GLOBAL_DAILY_CAP - usedToday);

    if (remainingGlobalSlots <= 0) {
        logStep(`[CRON / STEALTH GATE] ${GLOBAL_DAILY_CAP} / ${GLOBAL_DAILY_CAP} daily dispatches completed for ${today}. Staying below radar until tomorrow.`);
        return {
            sourceFile: ledger.active[0].sourcePath || '',
            renderedClips: [],
            updatedBounty: ledger.active[0],
            activeList: ledger.active,
            postStatus: `DAILY STEALTH CAP REACHED (${GLOBAL_DAILY_CAP}/${GLOBAL_DAILY_CAP})`
        };
    }

    // Pick requested funnel if it still has per-campaign headroom (< 3/day), otherwise rotate to next open funnel
    let targetBounty = (bounty && ledger.active.find(b => b.id === bounty.id && (Number(b.dailyPostsUsed) || 0) < PER_CAMPAIGN_DAILY_CAP))
        || ledger.active.find(b => (Number(b.dailyPostsUsed) || 0) < PER_CAMPAIGN_DAILY_CAP);

    if (!targetBounty) {
        logStep(`[CRON / CAMPAIGN ROTATION] All queued funnels hit ${PER_CAMPAIGN_DAILY_CAP}/campaign today. Waiting for Tess to scout fresh campaign.`);
        return {
            sourceFile: ledger.active[0].sourcePath || '',
            renderedClips: [],
            updatedBounty: ledger.active[0],
            activeList: ledger.active,
            postStatus: 'ALL QUEUED FUNNELS AT CAMPAIGN CAP'
        };
    }

    const cleanId = targetBounty.id;
    const platform = resolveBountyPlatform(targetBounty);
    const campaignUsed = Number(targetBounty.dailyPostsUsed) || 0;
    const remainingCampaignSlots = Math.max(0, PER_CAMPAIGN_DAILY_CAP - campaignUsed);

    // Drip-feed max 2 clips per 2-hour window so social algorithms never flag a burst
    const clipsToCut = Math.min(MAX_CLIPS_PER_WINDOW, remainingGlobalSlots, remainingCampaignSlots);
    logStep(`[GOVERNOR STEALTH] ${remainingGlobalSlots} global slot(s) open (${usedToday}/${GLOBAL_DAILY_CAP}). Drip-dispatching ${clipsToCut} short(s) for [${platform.toUpperCase()}] "${targetBounty.title || cleanId}" (${campaignUsed}/${PER_CAMPAIGN_DAILY_CAP} campaign cap)...`);

    const campDir = path.join(bountyDataDir, 'campaigns', cleanId);
    const intakeDir = path.join(campDir, 'intake');
    const clipsDir = path.join(campDir, 'clips');
    fs.mkdirSync(intakeDir, { recursive: true });
    fs.mkdirSync(clipsDir, { recursive: true });

    const FFMPEG_BIN = resolveFfmpegBin(bountyDataDir);
    const sourceFile = (targetBounty.sourcePath && targetBounty.sourcePath.trim().endsWith('.mp4'))
        ? targetBounty.sourcePath.trim()
        : path.join(intakeDir, `${cleanId}_source.mp4`);

    const sessionPath = path.resolve('C:\\Warlord_Inc\\Warlord_WASP\\MCNC\\Data\\Chrome_Session');
    const cookieFile = path.join(bountyDataDir, 'yt_cookies.txt');

    const searchTitle = (targetBounty.title || 'Viral funny moments')
        .replace(/Whop Content Rewards\s*\/\//i, '')
        .replace('//', ' ')
        .trim();
    let existingDuration = fs.existsSync(sourceFile) ? await getMediaDurationSec(FFMPEG_BIN, sourceFile) : 0;

    if (!fs.existsSync(sourceFile) || fs.statSync(sourceFile).size < 100000 || existingDuration < 110) {
        if (fs.existsSync(sourceFile) && existingDuration > 0 && existingDuration < 110) {
            logStep(`[1/4 JACK] Existing source is only ${Math.round(existingDuration)}s (< 110s). Upgrading to full 2+ min compilation...`);
            fs.unlinkSync(sourceFile);
        } else {
            logStep(`[1/4 JACK] Harvesting 2+ min YouTube source MP4 for "${searchTitle}"...`);
        }

        await exportYouTubeCookies(sessionPath, cookieFile);

        const baseFlags = `--js-runtimes node --no-warnings --no-playlist --max-downloads 1`;
        const cookieFlag = fs.existsSync(cookieFile) ? `--cookies "${cookieFile}"` : '';
        const longFilter = `--match-filter "duration >= 120 & duration <= 1200"`;

        const tvLongCmd = `"${YTDLP_BIN}" ${baseFlags} ${cookieFlag} ${longFilter} --extractor-args "youtube:player_client=tv_embedded,ios,web_creator" "ytsearch5:${searchTitle} compilation" -f "best[height<=1080][ext=mp4]/best[ext=mp4]/best" -o "${sourceFile}"`;
        const webLongCmd = `"${YTDLP_BIN}" ${baseFlags} ${cookieFlag} ${longFilter} --extractor-args "youtube:player_client=mweb,android" "ytsearch5:${searchTitle}" -f "best[ext=mp4]/best" -o "${sourceFile}"`;
        const fallbackCmd = `"${YTDLP_BIN}" ${baseFlags} ${cookieFlag} --extractor-args "youtube:player_client=tv_embedded,ios,web_creator" "ytsearch1:${searchTitle}" -f "best[ext=mp4]/best" -o "${sourceFile}"`;

        try {
            await runCmd(tvLongCmd).catch(() => {});
            if (!fs.existsSync(sourceFile) || fs.statSync(sourceFile).size < 100000) {
                await runCmd(webLongCmd).catch(() => {});
            }
            if (!fs.existsSync(sourceFile) || fs.statSync(sourceFile).size < 100000) {
                await runCmd(fallbackCmd);
            }
        } catch (e1) {
            if (!fs.existsSync(sourceFile) || fs.statSync(sourceFile).size < 50000) {
                throw new Error(`YouTube blocked automated download on VPS IP. Paste a local .mp4 path into SOURCE PATH or run node Auth_Browser.js to refresh YouTube login.`);
            }
        }

        if (!fs.existsSync(sourceFile) || fs.statSync(sourceFile).size < 50000) {
            throw new Error(`YouTube blocked automated download on VPS IP. Paste a local .mp4 path into SOURCE PATH or run node Auth_Browser.js to refresh YouTube login.`);
        }
        existingDuration = await getMediaDurationSec(FFMPEG_BIN, sourceFile);
        const srcMb = (fs.statSync(sourceFile).size / (1024 * 1024)).toFixed(1);
        logStep(`[1/4 JACK COMPLETE] Source MP4 locked (${srcMb} MB | ${Math.round(existingDuration)}s) -> ${path.basename(sourceFile)}`);
    } else {
        const srcMb = (fs.statSync(sourceFile).size / (1024 * 1024)).toFixed(1);
        logStep(`[1/4 JACK COMPLETE] Using local source MP4 (${srcMb} MB | ${Math.round(existingDuration)}s) -> ${path.basename(sourceFile)}`);
    }

    // Offset slice windows by campaignUsed so later drip windows never cut duplicate timestamps
    const totalSec = existingDuration > 15 ? existingDuration : 150;
    logStep(`[2/4 TESS] Probing ${Math.round(totalSec)}s timeline (offset #${campaignUsed + 1}) for ${clipsToCut} unique window(s)...`);

    const allStartRatios = [0.06, 0.28, 0.52, 0.74];
    const allHooks = [
        `${(targetBounty.hookHeadline || 'WAIT FOR IT').substring(0, 34)} [PT 1]`,
        `${(targetBounty.hookHeadline || 'UNREAL MOMENT').substring(0, 34)} [PT 2]`,
        `${(targetBounty.hookHeadline || 'WATCH TILL END').substring(0, 34)} [PT 3]`,
        `${(targetBounty.hookHeadline || 'NOBODY SAW THIS').substring(0, 34)} [PT 4]`
    ];

    const clipPlan = [];
    for (let i = 0; i < clipsToCut; i++) {
        const slotIdx = (campaignUsed + i) % allStartRatios.length;
        const startSec = Math.min(Math.floor(totalSec * allStartRatios[slotIdx]), Math.max(0, Math.floor(totalSec - 25)));
        const safeDur = Math.min(42, Math.max(12, Math.floor(totalSec - startSec - 1)));
        clipPlan.push({
            index: campaignUsed + i + 1,
            start: formatTimestamp(startSec),
            duration: safeDur,
            hook: allHooks[slotIdx]
        });
    }
    logStep(`[2/4 TESS COMPLETE] ${clipsToCut} unique window(s) locked (${clipPlan.map(c => `${c.duration}s @ ${c.start}`).join(', ')}).`);

    const renderedClips = [];
    for (const seg of clipPlan) {
        const outName = `${cleanId}_short_${seg.index}_${Date.now().toString().slice(-4)}.mp4`;
        const outPath = path.join(clipsDir, outName);
        const ffCmd = `"${FFMPEG_BIN}" -y -ss ${seg.start} -i "${sourceFile}" -t ${seg.duration} -vf "scale=-2:1920,crop=1080:1920" -c:v libx264 -preset ultrafast -crf 23 -c:a aac -b:a 128k "${outPath}"`;
        await runCmd(ffCmd);
        const fileBytes = fs.existsSync(outPath) ? fs.statSync(outPath).size : 0;
        if (fileBytes < 50000) {
            if (fs.existsSync(outPath)) fs.unlinkSync(outPath);
            throw new Error(`FFmpeg produced an empty clip (${fileBytes} bytes) on Short #${seg.index}.`);
        }
        const sizeKb = Math.round(fileBytes / 1024);
        renderedClips.push({ index: seg.index, name: outName, path: outPath, sizeKb, hook: seg.hook });
        logStep(`[3/4 CHARLIE] Cut Short #${seg.index}: ${outName} (${sizeKb} KB) -> VERIFIED`);
    }

    const portalUrl = platform.toLowerCase() === 'whop'
        ? 'https://whop.com/content-rewards'
        : 'https://app.vyro.com/add-posts';

    logStep(`[4/4 ROXY] Staging ${renderedClips.length} short(s) to @EchoPodMedia Studio + ${platform} portal...`);
    let postStatus = `STAGED (${platform.toUpperCase()})`;
    let browser = null;
    try {
        browser = await puppeteer.launch({
            headless: false,
            userDataDir: sessionPath,
            defaultViewport: null,
            args: ['--start-maximized', '--no-sandbox', '--disable-blink-features=AutomationControlled']
        });

        const ytPage = await browser.newPage();
        await ytPage.goto('https://studio.youtube.com', { waitUntil: 'domcontentloaded', timeout: 20000 }).catch(() => {});
        await new Promise(r => setTimeout(r, 2500));
        const createBtn = await ytPage.$('#create-icon');
        if (createBtn) {
            await createBtn.click().catch(() => {});
            await new Promise(r => setTimeout(r, 1000));
            const uploadItem = await ytPage.$('#text-item-0');
            if (uploadItem) await uploadItem.click().catch(() => {});
            await new Promise(r => setTimeout(r, 1500));
            const fileInput = await ytPage.$('input[type="file"]');
            if (fileInput && renderedClips[0]) {
                await fileInput.uploadFile(renderedClips[0].path);
                postStatus = `YT STUDIO + ${platform.toUpperCase()} READY`;
            }
        }

        const ttPage = await browser.newPage();
        await ttPage.goto('https://www.tiktok.com/tiktokstudio/upload', { waitUntil: 'domcontentloaded', timeout: 20000 }).catch(() => {});
        await new Promise(r => setTimeout(r, 2000));
        const ttInput = await ttPage.$('input[type="file"]');
        if (ttInput && renderedClips[0]) {
            await ttInput.uploadFile(renderedClips[0].path).catch(() => {});
        }

        const rewardPage = await browser.newPage();
        await rewardPage.goto(portalUrl, { waitUntil: 'domcontentloaded', timeout: 20000 }).catch(() => {});

        exec(`explorer.exe "${clipsDir}"`);
        logStep(`[4/4 ROXY COMPLETE] Status: ${postStatus} | ${renderedClips.length} Short(s) ready for ${platform}.`);
    } catch (e) {
        exec(`explorer.exe "${clipsDir}"`);
        logStep(`[4/4 ROXY COMPLETE] Clips folder opened (${e.message}). Ready to drop into ${platform}.`);
    }

    let updatedBounty = null;
    ledger.lastDispatchDate = today;
    ledger.active = ledger.active.map(b => {
        if (b.id === cleanId) {
            const nextUsed = Math.min(PER_CAMPAIGN_DAILY_CAP, (Number(b.dailyPostsUsed) || 0) + renderedClips.length);
            updatedBounty = { ...b, platform, sourcePath: sourceFile, dailyPostsUsed: nextUsed };
            return updatedBounty;
        }
        return b;
    });
    fs.writeFileSync(ledgerFile, JSON.stringify(ledger, null, 2), 'utf8');

    return { sourceFile, renderedClips, updatedBounty, activeList: ledger.active, postStatus };
}

module.exports = { autoExecuteBounty, GLOBAL_DAILY_CAP, PER_CAMPAIGN_DAILY_CAP };
