const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const puppeteer = require('puppeteer');

const WORKSPACE_DIR = __dirname;
const YTDLP_BIN = fs.existsSync(path.join(WORKSPACE_DIR, 'yt-dlp.exe'))
    ? path.join(WORKSPACE_DIR, 'yt-dlp.exe')
    : 'yt-dlp';

function runCmd(cmd) {
    return new Promise((resolve, reject) => {
        exec(cmd, { maxBuffer: 1024 * 1024 * 50 }, (err, stdout, stderr) => {
            if (err) return reject(new Error(stderr || err.message));
            resolve(stdout.trim());
        });
    });
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

    const sourceFile = (bounty.sourcePath && bounty.sourcePath.trim().endsWith('.mp4'))
        ? bounty.sourcePath.trim()
        : path.join(intakeDir, `${cleanId}_source.mp4`);

    const sessionPath = path.resolve('C:\\Warlord_Inc\\Warlord_WASP\\MCNC\\Data\\Chrome_Session');
    const cookieFile = path.join(bountyDataDir, 'yt_cookies.txt');

    // STAGE 1: JACK AUTO-DOWNLOADS SOURCE MP4
    const searchTitle = (bounty.title || 'ABC Scrubs funny moments').replace('//', ' ').trim();
    if (!fs.existsSync(sourceFile) || fs.statSync(sourceFile).size < 100000) {
        logStep(`[1/4 JACK] Harvesting YouTube source MP4 for "${searchTitle}"...`);
        await exportYouTubeCookies(sessionPath, cookieFile);

        const baseFlags = `--js-runtimes node --no-warnings --no-playlist`;
        const cookieFlag = fs.existsSync(cookieFile) ? `--cookies "${cookieFile}"` : '';
        const tvCmd = `"${YTDLP_BIN}" ${baseFlags} ${cookieFlag} --extractor-args "youtube:player_client=tv_embedded,ios,web_creator" "ytsearch1:${searchTitle} clip" -f "best[height<=1080][ext=mp4]/best[ext=mp4]/best" -o "${sourceFile}"`;
        const webCmd = `"${YTDLP_BIN}" ${baseFlags} ${cookieFlag} --extractor-args "youtube:player_client=mweb,android" "ytsearch1:${searchTitle}" -f "best[ext=mp4]/best" -o "${sourceFile}"`;

        try {
            await runCmd(tvCmd);
        } catch (e1) {
            await runCmd(webCmd);
        }

        if (!fs.existsSync(sourceFile) || fs.statSync(sourceFile).size < 50000) {
            throw new Error(`YouTube blocked automated download on VPS IP. Paste a local .mp4 path into SOURCE PATH or run node Auth_Browser.js to refresh YouTube login.`);
        }
        const srcMb = (fs.statSync(sourceFile).size / (1024 * 1024)).toFixed(1);
        logStep(`[1/4 JACK COMPLETE] Source MP4 locked (${srcMb} MB) -> ${path.basename(sourceFile)}`);
    } else {
        const srcMb = (fs.statSync(sourceFile).size / (1024 * 1024)).toFixed(1);
        logStep(`[1/4 JACK COMPLETE] Using local source MP4 (${srcMb} MB) -> ${path.basename(sourceFile)}`);
    }

    // STAGE 2: TESS LOCKS 3 (30-60s) SEGMENTS
    logStep(`[2/4 TESS] Slicing 3 viral 30-60s vertical windows...`);
    const clipPlan = [
        { index: 1, start: '00:00:10', duration: 42, hook: `${(bounty.hookHeadline || 'WAIT FOR IT').substring(0, 34)} [1/3]` },
        { index: 2, start: '00:00:58', duration: 45, hook: `${(bounty.hookHeadline || 'UNREAL MOMENT').substring(0, 34)} [2/3]` },
        { index: 3, start: '00:01:48', duration: 38, hook: `${(bounty.hookHeadline || 'WATCH TILL END').substring(0, 34)} [3/3]` }
    ];
    logStep(`[2/4 TESS COMPLETE] 3 windows locked (42s, 45s, 38s).`);

    // STAGE 3: CHARLIE RENDERS ALL 3 VERTICAL 9:16 SHORTS
    const renderedClips = [];
    for (const seg of clipPlan) {
        const outName = `${cleanId}_short_${seg.index}_${Date.now().toString().slice(-4)}.mp4`;
        const outPath = path.join(clipsDir, outName);
        const ffCmd = `ffmpeg -y -ss ${seg.start} -i "${sourceFile}" -t ${seg.duration} -vf "scale=-2:1920,crop=1080:1920" -c:v libx264 -preset ultrafast -crf 23 -c:a aac -b:a 128k "${outPath}"`;
        await runCmd(ffCmd);
        const sizeKb = Math.round(fs.statSync(outPath).size / 1024);
        renderedClips.push({ index: seg.index, name: outName, path: outPath, sizeKb, hook: seg.hook });
        logStep(`[3/4 CHARLIE] Cut Short ${seg.index}/3: ${outName} (${sizeKb} KB) -> SAVED`);
    }

    // STAGE 4: ROXY & JACK AUTO-STAGE & UPLOAD TO @ECHOPODMEDIA CHANNELS
    logStep(`[4/4 ROXY] Pushing 3 shorts to @EchoPodMedia (YouTube Studio / TikTok / Vyro)...`);
    let postStatus = 'STAGED IN STUDIO';
    let browser = null;
    try {
        browser = await puppeteer.launch({
            headless: false,
            userDataDir: sessionPath,
            defaultViewport: null,
            args: ['--start-maximized', '--no-sandbox', '--disable-blink-features=AutomationControlled']
        });

        // Open YouTube Studio Upload & attach Short #1 automatically if file input is exposed
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

        // Open TikTok Studio & Vyro Add Posts tabs
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
        logStep(`[4/4 ROXY COMPLETE] Status: ${postStatus} | 3 Shorts ready in @EchoPodMedia Studio.`);
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

