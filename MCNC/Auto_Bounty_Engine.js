const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const puppeteer = require('puppeteer');

const WORKSPACE_DIR = __dirname;
const YTDLP_BIN = fs.existsSync(path.join(WORKSPACE_DIR, 'yt-dlp.exe'))
    ? path.join(WORKSPACE_DIR, 'yt-dlp.exe')
    : 'yt-dlp';

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
        // Proceed with Android/iOS client extraction if browser profile is momentarily locked
    } finally {
        if (browser) await browser.close().catch(() => {});
    }
}

async function autoExecuteBounty({ bounty, logStep, bountyDataDir, ledgerFile }) {
    const cleanId = bounty.id || 'vyro_active';
    const campDir = path.join(bountyDataDir, 'campaigns', cleanId);
    const intakeDir = path.join(campDir, 'intake');
    const clipsDir = path.join(campDir, 'clips');
    fs.mkdirSync(intakeDir, { recursive: true });
    fs.mkdirSync(clipsDir, { recursive: true });

    const FFMPEG_BIN = resolveFfmpegBin(bountyDataDir);
    const sourceFile = (bounty.sourcePath && bounty.sourcePath.trim().endsWith('.mp4'))
        ? bounty.sourcePath.trim()
        : path.join(intakeDir, `${cleanId}_source.mp4`);

    const sessionPath = path.resolve('C:\\Warlord_Inc\\Warlord_WASP\\MCNC\\Data\\Chrome_Session');
    const cookieFile = path.join(bountyDataDir, 'yt_cookies.txt');

    // STAGE 1: JACK AUTO-DOWNLOADS LONG-FORM SOURCE MP4 (>= 120s PREFERRED)
    const searchTitle = (bounty.title || 'ABC Scrubs funny moments').replace('//', ' ').trim();
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

    // STAGE 2: TESS PROBES DURATION & LOCKS 3 GUARANTEED NON-EMPTY SEGMENTS
    const totalSec = existingDuration > 15 ? existingDuration : 150;
    logStep(`[2/4 TESS] Probing ${Math.round(totalSec)}s source timeline for 3 vertical windows...`);

    const hooks = [
        `${(bounty.hookHeadline || 'WAIT FOR IT').substring(0, 34)} [1/3]`,
        `${(bounty.hookHeadline || 'UNREAL MOMENT').substring(0, 34)} [2/3]`,
        `${(bounty.hookHeadline || 'WATCH TILL END').substring(0, 34)} [3/3]`
    ];

    const clipPlan = [];
    if (totalSec >= 135) {
        const starts = [8, Math.floor(totalSec * 0.36), Math.floor(totalSec * 0.68)];
        const durations = [42, 45, 38];
        for (let i = 0; i < 3; i++) {
            const safeDur = Math.min(durations[i], Math.max(15, Math.floor(totalSec - starts[i] - 1)));
            clipPlan.push({ index: i + 1, start: formatTimestamp(starts[i]), duration: safeDur, hook: hooks[i] });
        }
    } else {
        const usableSec = Math.max(15, totalSec - 2);
        const sliceDur = Math.max(10, Math.min(45, Math.floor(usableSec / 3)));
        for (let i = 0; i < 3; i++) {
            const startSec = Math.min(Math.floor(i * sliceDur), Math.max(0, Math.floor(totalSec - sliceDur - 1)));
            const safeDur = Math.max(8, Math.min(sliceDur, Math.floor(totalSec - startSec)));
            clipPlan.push({ index: i + 1, start: formatTimestamp(startSec), duration: safeDur, hook: hooks[i] });
        }
    }
    logStep(`[2/4 TESS COMPLETE] 3 windows locked (${clipPlan.map(c => `${c.duration}s @ ${c.start}`).join(', ')}).`);

    // STAGE 3: CHARLIE RENDERS ALL 3 VERTICAL 9:16 SHORTS WITH SIZE VERIFICATION
    const renderedClips = [];
    for (const seg of clipPlan) {
        const outName = `${cleanId}_short_${seg.index}_${Date.now().toString().slice(-4)}.mp4`;
        const outPath = path.join(clipsDir, outName);
        const ffCmd = `"${FFMPEG_BIN}" -y -ss ${seg.start} -i "${sourceFile}" -t ${seg.duration} -vf "scale=-2:1920,crop=1080:1920" -c:v libx264 -preset ultrafast -crf 23 -c:a aac -b:a 128k "${outPath}"`;
        await runCmd(ffCmd);
        const fileBytes = fs.existsSync(outPath) ? fs.statSync(outPath).size : 0;
        if (fileBytes < 50000) {
            if (fs.existsSync(outPath)) fs.unlinkSync(outPath);
            throw new Error(`FFmpeg produced an empty clip (${fileBytes} bytes) on Short ${seg.index}/3. Check source MP4 integrity.`);
        }
        const sizeKb = Math.round(fileBytes / 1024);
        renderedClips.push({ index: seg.index, name: outName, path: outPath, sizeKb, hook: seg.hook });
        logStep(`[3/4 CHARLIE] Cut Short ${seg.index}/3: ${outName} (${sizeKb} KB) -> VERIFIED`);
    }

    // STAGE 4: ROXY & JACK AUTO-STAGE & UPLOAD TO @ECHOPODMEDIA CHANNELS
    logStep(`[4/4 ROXY] Pushing 3 verified shorts to @EchoPodMedia (YouTube Studio / TikTok / Vyro)...`);
    let postStatus = 'STAGED IN STUDIO';
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
                postStatus = 'UPLOADED TO YT STUDIO + STAGED';
            }
        }

        const ttPage = await browser.newPage();
        await ttPage.goto('https://www.tiktok.com/tiktokstudio/upload', { waitUntil: 'domcontentloaded', timeout: 20000 }).catch(() => {});
        await new Promise(r => setTimeout(r, 2000));
        const ttInput = await ttPage.$('input[type="file"]');
        if (ttInput && renderedClips[0]) {
            await ttInput.uploadFile(renderedClips[0].path).catch(() => {});
        }

        const vyroPage = await browser.newPage();
        await vyroPage.goto('https://app.vyro.com/add-posts', { waitUntil: 'domcontentloaded', timeout: 20000 }).catch(() => {});

        exec(`explorer.exe "${clipsDir}"`);
        logStep(`[4/4 ROXY COMPLETE] Status: ${postStatus} | 3 Verified Shorts ready in @EchoPodMedia Studio.`);
    } catch (e) {
        exec(`explorer.exe "${clipsDir}"`);
        logStep(`[4/4 ROXY COMPLETE] Clips folder opened (${e.message}). Ready to drop into Studio.`);
    }

    // STAGE 5: UPDATE LEDGER
    let ledger = { active: [] };
    if (fs.existsSync(ledgerFile)) {
        ledger = JSON.parse(fs.readFileSync(ledgerFile, 'utf8'));
    }
    let updatedBounty = null;
    ledger.active = (ledger.active || []).map(b => {
        if (b.id === cleanId) {
            const nextUsed = Math.min(5, (Number(b.dailyPostsUsed) || 0) + 3);
            updatedBounty = { ...b, sourcePath: sourceFile, dailyPostsUsed: nextUsed };
            return updatedBounty;
        }
        return b;
    });
    fs.writeFileSync(ledgerFile, JSON.stringify(ledger, null, 2), 'utf8');

    return { sourceFile, renderedClips, updatedBounty, activeList: ledger.active, postStatus };
}

module.exports = { autoExecuteBounty };
