require('dotenv').config();
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const multer = require('multer');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);
const { YoutubeTranscript } = require('youtube-transcript');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.static(path.join(__dirname, 'public')));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ==========================================
// ZERO-STATE INIT & DIRECTORY SETUP
// ==========================================
const WORKSPACE_ROOT = path.resolve('C:\\Warlord_Inc\\Warlord_WASP');
const SOULS_PATH = path.join('C:', 'Warlord_Inc', 'Warlord_WASP', 'MCNC', 'souls');
const LOGS_PATH = path.join('C:', 'Warlord_Inc', 'Warlord_WASP', 'MCNC_Logs');
const VAULT_PATH = path.join('C:', 'Warlord_Inc', 'Warlord_WASP', 'MCNC', 'vault');
const PROJECTS_PATH = path.join(VAULT_PATH, 'Projects');
const UPLOADS_PATH = path.join(__dirname, 'uploads');
const VAULT_DIR = path.join(__dirname, 'vault');
const DOCS_PATH = path.join(VAULT_DIR, 'Docs');
const CHATS_PATH = path.join(__dirname, 'Data', 'Chats');
const TELEMETRY_DIR = path.join(VAULT_DIR, 'telemetry');
const TELEMETRY_FILE = path.join(TELEMETRY_DIR, 'active_telemetry.md');
const KEYS_DIR = path.join(VAULT_DIR, 'Keys');
const NIM_CLUSTER_FILE = path.join(KEYS_DIR, 'nim_cluster.json');
const GROQ_CLUSTER_FILE = path.join(KEYS_DIR, 'groq_cluster.json');
const GEMINI_CLUSTER_FILE = path.join(KEYS_DIR, 'gemini_cluster.json');
const PROJECTS_MANIFEST_FILE = path.join(VAULT_PATH, 'projects_manifest.json');
const ENV_FILE_PATH = path.join(__dirname, '.env');

[LOGS_PATH, UPLOADS_PATH, TELEMETRY_DIR, VAULT_DIR, KEYS_DIR, VAULT_PATH, PROJECTS_PATH, DOCS_PATH, SOULS_PATH, CHATS_PATH].forEach(dir => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

if (!fs.existsSync(PROJECTS_MANIFEST_FILE)) {
    fs.writeFileSync(PROJECTS_MANIFEST_FILE, JSON.stringify({ activeProjectId: null, projects: [] }, null, 2), 'utf8');
}

function isPathSafe(targetPath) {
    const resolved = path.resolve(targetPath);
    return resolved.toLowerCase().startsWith(WORKSPACE_ROOT.toLowerCase());
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, UPLOADS_PATH),
    filename: (req, file, cb) => cb(null, `${Date.now()}_${file.originalname}`)
});
const upload = multer({ storage });

const CORE_DIRECTIVE = `You are an operational intelligence agent for MCNC Base 1.
Operational control, planning, and agent orchestration under Rhythm Holdings and W.A.S.P.
Mike is supreme CEO. Address Mike only as "Mike".
DIRECTORS: Tess (Quant), Silas (Database), Charlie (MQL5/Node), Roxy (UI/UX), Jack (Backend), Skyla (Media), Atlas (Infrastructure), Ares (Execution), Vance (Finance), Orion (Strategic Intel), The Askari (Security), Amber (Copywriter), Jax (Artwork Omega), Valerie (Relations), Maverick (SEO), Justin (Risk Legal).
SOP: Full functional code only when generating code. Solid DodgerBlue, OrangeRed, Goldenrod lines only for chart indicators. Zero fluff. Zero filler.
RHYTHM MULTIPLIER: Enforce 0.0 to 1.0 scaling on quantitative and telemetry arrays. Default 1.0.`;

// ==========================================
// WEBSOCKET BROADCASTER
// ==========================================
const broadcast = (type, msg) => {
    const payload = JSON.stringify({ type, msg, ts: new Date().toLocaleTimeString() });
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) client.send(payload);
    });
};

wss.on('connection', (ws) => {
    ws.send(JSON.stringify({ type: 'TELEMETRY_CONNECTED' }));
    ws.on('message', (message) => { 
        try { 
            const data = JSON.parse(message); 
            if (data.type === 'PING') {
                ws.send(JSON.stringify({ type: 'PONG' })); 
            } else if (data.action === 'TRIGGER_PROJECT_INTAKE') {
                const scaffold = scaffoldProjectWorkspace(data.payload);
                ws.send(JSON.stringify({ type: 'SCAFFOLD_COMPLETE', scaffold }));
            }
        } catch (e) {} 
    });
});

// ==========================================
// ATOMIC PROJECT SCAFFOLDER & DIRECTORY CANON
// ==========================================
function slugify(text) {
    return (text || 'unnamed_project')
        .toString()
        .toLowerCase()
        .trim()
        .replace(/[\s\/\\]+/g, '_')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '_');
}

function scaffoldProjectWorkspace(projectData) {
    const rawName = projectData.name || projectData.projectKey || 'UNNAMED_PROJECT';
    const slug = slugify(rawName);
    const projectDir = path.join(PROJECTS_PATH, slug);
    const docsDir = path.join(DOCS_PATH, slug);

    // Canonical Project Directory Doctrine (Tier 2 ROE / Canonical Registry)
    const subDirs = [
        '01_PRD', '02_LEGAL_STATUTORY', '03_FINANCE_TREASURY',
        '04_MARKET_EXPANSION', '05_BRAND_COLLATERAL', '06_ASSETS_GRAPHICS',
        '07_SITE_TELEMETRY', '08_BIM_CAD', '09_MEETINGS_DECISIONS',
        'Web_And_Social', 'Assets_And_Artwork', 'Leads', 'Responses_And_Donations'
    ];

    if (!fs.existsSync(projectDir)) fs.mkdirSync(projectDir, { recursive: true });
    subDirs.forEach(sub => {
        const fullSubPath = path.join(projectDir, sub);
        if (!fs.existsSync(fullSubPath)) fs.mkdirSync(fullSubPath, { recursive: true });
    });

    if (!fs.existsSync(docsDir)) fs.mkdirSync(docsDir, { recursive: true });

    const prdFilename = `01_PRD_${slug}.md`;
    const prdProjectPath = path.join(projectDir, '01_PRD', prdFilename);
    const prdDocsPath = path.join(docsDir, prdFilename);
    const prdDocsRootPath = path.join(DOCS_PATH, prdFilename);

    let seedContent = projectData.prdContent || `# PRODUCT REQUIREMENTS DOCUMENT (PRD)\n## PROJECT: ${rawName.toUpperCase()}\n**Authority:** Commander Mike // Supreme Command\n**Created:** ${new Date().toISOString()}\n\n---\n\n### 1. Executive Intent & Overview\nAutomated project instantiation initialized by MCNC Base 1.`;

    if (!fs.existsSync(prdProjectPath)) fs.writeFileSync(prdProjectPath, seedContent, 'utf8');
    fs.writeFileSync(prdDocsPath, seedContent, 'utf8');
    fs.writeFileSync(prdDocsRootPath, seedContent, 'utf8');

    logTelemetry('PROJECT_SCAFFOLDED', `Auto-scaffolded filesystem tree for project: ${slug}`);
    broadcast('TRACE', `[SCAFFOLD] Initialized project workspace: vault/Projects/${slug}`);

    return { slug, projectDir, docsDir, subDirs, prdFilename };
}

// ==========================================
// TELEMETRY & SOUL LOGGERS
// ==========================================
function logTelemetry(action, details) {
    try {
        if (!fs.existsSync(TELEMETRY_DIR)) fs.mkdirSync(TELEMETRY_DIR, { recursive: true });
        const entry = `\n- [${new Date().toISOString()}] **${action}**:${details}`;
        fs.appendFileSync(TELEMETRY_FILE, entry, 'utf8');
    } catch (e) {}
}

function getLiveSystemSnapshot() {
    let snapshot = "=== COMPRESSED TELEMETRY ===\n";
    try {
        if (fs.existsSync(TELEMETRY_FILE)) {
            const lines = fs.readFileSync(TELEMETRY_FILE, 'utf8').trim().split('\n').filter(line => line.trim() !== '');
            snapshot += "RECENT LOGS:\n" + lines.slice(-3).join('\n') + "\n";
        }
    } catch (e) {}
    snapshot += "===========================\n";
    return snapshot;
}

function loadSoul(identifier) {
    try {
        if (!fs.existsSync(SOULS_PATH)) return "";
        const files = fs.readdirSync(SOULS_PATH);
        const match = files.find(f => f.toLowerCase().includes(identifier.toLowerCase()) && (f.endsWith('.md') || f.endsWith('.txt')));
        return match ? fs.readFileSync(path.join(SOULS_PATH, match), 'utf8') : "";
    } catch (e) { return ""; }
}

function extractPromptText(body) {
    if (!body) return "Directive audit and status report.";
    if (typeof body === 'string') return body.trim();
    for (const key of ['message', 'prompt', 'text', 'input', 'query', 'directive', 'content']) {
        if (typeof body[key] === 'string' && body[key].trim().length > 0) return body[key].trim();
    }
    return "Directive audit and status report.";
}

function extractYouTubeId(urlStr) {
    if (!urlStr || typeof urlStr !== 'string') return null;
    try {
        const cleanUrl = urlStr.trim();
        const urlObj = new URL(cleanUrl);
        if (urlObj.hostname.includes('youtube.com')) {
            if (urlObj.pathname === '/watch') return urlObj.searchParams.get('v');
            if (urlObj.pathname.startsWith('/embed/') || urlObj.pathname.startsWith('/v/')) return urlObj.pathname.split('/')[2];
            if (urlObj.pathname.startsWith('/shorts/')) return urlObj.pathname.split('/')[2];
        }
        if (urlObj.hostname.includes('youtu.be')) return urlObj.pathname.replace(/^\/+/, '');
    } catch (e) {}
    const match = urlStr.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/);
    return match ? match[1] : null;
}

function cleanVttToText(rawVtt) {
    return (rawVtt || '')
        .replace(/WEBVTT[\s\S]*?\n\n/, '')
        .replace(/<[^>]+>/g, '')
        .replace(/\d{2}:\d{2}:\d{2}\.\d{3}\s*-->\s*\d{2}:\d{2}:\d{2}\.\d{3}.*/g, '')
        .replace(/align:start position:0%/g, '')
        .split('\n')
        .map(line => line.trim())
        .filter((line, idx, arr) => line.length > 0 && line !== arr[idx - 1])
        .join(' ')
        .trim();
}

// ==========================================
// MULTI-VECTOR YOUTUBE EXTRACTION ENGINE
// ==========================================
async function extractYouTubeTranscript(videoId) {
    try {
        console.log(`[REFINERY INGEST] Vector 1 (Tactiq Cloud Proxy) for: ${videoId}`);
        const tacRes = await fetch('https://tactiq-apps-prod.tactiq.io/transcript', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            body: JSON.stringify({
                videoUrl: `https://www.youtube.com/watch?v=${videoId}`,
                langCode: 'en'
            })
        });
        if (tacRes.ok) {
            const tacData = await tacRes.json();
            if (Array.isArray(tacData.captions) && tacData.captions.length > 0) {
                const text = tacData.captions.map(c => c.text).join(' ').trim();
                if (text.length >= 50) {
                    console.log(`[REFINERY INGEST] Vector 1 (Tactiq Cloud) succeeded (${text.length} chars)`);
                    return text;
                }
            }
        }
    } catch (err) {
        console.warn(`[REFINERY INGEST] Vector 1 skipped: ${err.message}`);
    }

    try {
        console.log(`[REFINERY INGEST] Vector 2 (Direct API) for: ${videoId}`);
        const transcriptArr = await YoutubeTranscript.fetchTranscript(videoId);
        if (Array.isArray(transcriptArr) && transcriptArr.length > 0) {
            const text = transcriptArr.map(t => t.text).join(' ').trim();
            if (text.length >= 50) {
                console.log(`[REFINERY INGEST] Vector 2 succeeded (${text.length} chars)`);
                return text;
            }
        }
    } catch (err) {
        console.warn(`[REFINERY INGEST] Vector 2 failed: ${err.message}`);
    }

    const relayInstances = [
        'https://inv.tux.pizza',
        'https://invidious.nerdvpn.de',
        'https://yewtu.be',
        'https://invidious.privacyredirect.com',
        'https://iv.ggtyler.dev'
    ];

    for (const instance of relayInstances) {
        try {
            console.log(`[REFINERY INGEST] Vector 3 (Relay Proxy: ${instance}) for: ${videoId}`);
            const controller = new AbortController();
            const timer = setTimeout(() => controller.abort(), 6000);
            const capRes = await fetch(`${instance}/api/v1/captions/${videoId}`, { signal: controller.signal });
            clearTimeout(timer);

            if (capRes.ok) {
                const capData = await capRes.json();
                const captions = capData.captions || [];
                const enTrack = captions.find(c => c.language_code && c.language_code.startsWith('en')) || captions[0];
                if (enTrack && enTrack.url) {
                    const trackUrl = enTrack.url.startsWith('http') ? enTrack.url : `${instance}${enTrack.url}`;
                    const vttRes = await fetch(trackUrl);
                    if (vttRes.ok) {
                        const rawVtt = await vttRes.text();
                        const cleaned = cleanVttToText(rawVtt);
                        if (cleaned.length >= 50) {
                            console.log(`[REFINERY INGEST] Vector 3 succeeded via ${instance} (${cleaned.length} chars)`);
                            return cleaned;
                        }
                    }
                }
            }
        } catch (relayErr) {}
    }

    return '';
}

// ==========================================
// GEMINI NATIVE YOUTUBE VIDEO INGESTION
// ==========================================
async function dispatchYouTubeDirectToGemini(systemPrompt, videoId, extraNotes) {
    const activeGeminiKeys = getActiveGeminiKeys();
    if (activeGeminiKeys.length === 0) {
        throw new Error("No active Gemini API keys found in .env or cluster vault.");
    }

    const cleanYtUrl = `https://www.youtube.com/watch?v=${videoId}`;
    const supportedModels = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-2.5-pro', 'gemini-1.5-pro'];

    for (const modelName of supportedModels) {
        for (let i = 0; i < activeGeminiKeys.length; i++) {
            const mask = `...${activeGeminiKeys[i].slice(-6)}`;
            try {
                console.log(`[REFINERY INGEST] Routing YouTube URL (${cleanYtUrl}) directly to Google Cloud via ${modelName} [${mask}]...`);
                const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${activeGeminiKeys[i]}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{
                            role: "user",
                            parts: [
                                { fileData: { mimeType: "video/*", fileUri: cleanYtUrl } },
                                { text: `${systemPrompt}\n\nWatch and analyze this YouTube video directly. Extract all technical facts, architecture, code implementations, and operational directives.${extraNotes ? '\n\nAdditional Notes:\n' + extraNotes : ''}` }
                            ]
                        }],
                        generationConfig: { temperature: 0.2, maxOutputTokens: 8192 }
                    })
                });

                if (response.ok) {
                    const data = await response.json();
                    const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
                    if (text && text.length >= 50) {
                        console.log(`[REFINERY INGEST] SUCCESS! ${modelName} natively digested YouTube video (${text.length} chars)`);
                        return { reply: text, modelUsed: `${modelName} (Native YouTube Cloud Ingest [${mask}])` };
                    }
                } else {
                    const errTxt = await response.text();
                    console.warn(`[REFINERY INGEST] ${modelName} [${mask}] HTTP ${response.status}: ${errTxt.slice(0, 180)}`);
                }
            } catch (err) {
                console.warn(`[REFINERY INGEST] ${modelName} error: ${err.message}`);
            }
        }
    }

    return null;
}

// ==========================================
// AUTONOMOUS RUNTIME FILE/DIR INTERCEPTOR
// ==========================================
function resolveReferencedDirectories(rawText) {
    if (!rawText || typeof rawText !== 'string') return '';
    const lines = rawText.split('\n');
    let injectedContext = '';
    const seen = new Set();
    const dirRegex = /(?:vault[\\\/]Projects[\\\/][^\r\n]+|[a-zA-Z]:\\[^\r\n]+|0[1-9]_[A-Z0-9_]+[^\r\n]*)/i;

    for (let line of lines) {
        const match = line.match(dirRegex);
        if (!match) continue;

        let cleanMatch = match[0].trim().replace(/^[0-9]+\.\s*/, '').replace(/["'`]/g, '').trim();
        if (cleanMatch.length < 3 || seen.has(cleanMatch.toLowerCase())) continue;
        seen.add(cleanMatch.toLowerCase());

        let candidatePaths = [];
        if (path.isAbsolute(cleanMatch)) {
            candidatePaths.push(cleanMatch);
        } else {
            candidatePaths.push(path.join(WORKSPACE_ROOT, 'MCNC', cleanMatch));
            candidatePaths.push(path.join(WORKSPACE_ROOT, cleanMatch));
            candidatePaths.push(path.join(VAULT_PATH, cleanMatch.replace(/^vault[\\\/]/i, '')));
            candidatePaths.push(path.join(PROJECTS_PATH, cleanMatch));
        }

        let resolvedPath = null;
        for (const cand of candidatePaths) {
            if (fs.existsSync(cand)) {
                try {
                    const st = fs.statSync(cand);
                    if (st.isDirectory()) {
                        resolvedPath = cand;
                        break;
                    }
                } catch (e) {}
            }
        }

        if (resolvedPath) {
            try {
                const entries = fs.readdirSync(resolvedPath, { withFileTypes: true });
                const fileList = entries.map(e => {
                    const subItem = path.join(resolvedPath, e.name);
                    if (e.isDirectory()) return `[DIR]  ${e.name}/`;
                    try {
                        const fStat = fs.statSync(subItem);
                        return `[FILE] ${e.name} (${(fStat.size / 1024).toFixed(1)} KB)`;
                    } catch (err) {
                        return `[FILE] ${e.name}`;
                    }
                });

                broadcast('TRACE', `[TOOL INGEST] Real disk folder audit: ${path.basename(resolvedPath)} (${fileList.length} items)`);
                injectedContext += `\n\n=== [AUTONOMOUS DIRECTORY AUDIT: ${cleanMatch}] ===\n` +
                    `Physical Path: ${resolvedPath}\n` +
                    `Total Items Found: ${fileList.length}\n` +
                    (fileList.length > 0 ? fileList.join('\n') : '(Directory is physically empty on disk)') +
                    `\n=== [END DIRECTORY AUDIT: ${cleanMatch}] ===\n`;
            } catch (err) {}
        }
    }
    return injectedContext;
}

function resolveReferencedFiles(rawText) {
    if (!rawText || typeof rawText !== 'string') return '';
    const fileRegex = /([a-zA-Z]:\\[\w\s\-\.\\]+\.\w+|[\w\-_\\\/]+\.(css|js|jsx|json|md|txt|py|html|mq4|mq5|png|jpg|jpeg|pdf|csv|xlsx|docx))/gi;
    const matches = rawText.match(fileRegex) || [];
    let injectedContext = '';
    const seen = new Set();

    for (const match of matches) {
        const cleanMatch = match.trim().replace(/^["'`]|["'`]$/g, '');
        if (seen.has(cleanMatch.toLowerCase())) continue;
        seen.add(cleanMatch.toLowerCase());

        let candidatePaths = [];
        if (path.isAbsolute(cleanMatch)) {
            candidatePaths.push(cleanMatch);
        } else {
            candidatePaths.push(path.join(WORKSPACE_ROOT, 'MCNC', cleanMatch));
            candidatePaths.push(path.join(WORKSPACE_ROOT, cleanMatch));
            candidatePaths.push(path.join(VAULT_PATH, cleanMatch.replace(/^vault[\\\/]/i, '')));
        }

        let target = candidatePaths.find(p => fs.existsSync(p));

        if (target && isPathSafe(target)) {
            try {
                const stat = fs.statSync(target);
                if (stat.isFile()) {
                    const ext = path.extname(target).toLowerCase();
                    const isBinary = ['.png', '.jpg', '.jpeg', '.pdf', '.zip', '.xlsx', '.docx'].includes(ext);

                    if (isBinary) {
                        injectedContext += `\n\n=== [AUTONOMOUS BINARY FILE CONFIRMED: ${cleanMatch}] ===\nSize: ${(stat.size / 1024).toFixed(1)} KB\nPath: ${target}\n=== [END BINARY CONFIRMATION] ===\n`;
                    } else {
                        const data = fs.readFileSync(target, 'utf8');
                        broadcast('TRACE', `[TOOL INGEST] Real disk read: ${path.basename(target)} (${(data.length / 1024).toFixed(1)} KB)`);
                        injectedContext += `\n\n=== [AUTONOMOUS FILE INGEST: ${cleanMatch}] ===\n${data.slice(0, 100000)}\n=== [END FILE: ${cleanMatch}] ===\n`;
                    }
                }
            } catch (err) {}
        }
    }
    return injectedContext;
}

// ==========================================
// CLUSTERS & KEY VAULTS
// ==========================================
function readClusterFile(filePath, providerName) {
    try {
        if (!fs.existsSync(filePath)) {
            const initial = { provider: providerName, keys: [] };
            fs.writeFileSync(filePath, JSON.stringify(initial, null, 2), 'utf8');
            return initial;
        }
        const data = fs.readFileSync(filePath, 'utf8').trim();
        return data ? JSON.parse(data) : { provider: providerName, keys: [] };
    } catch (e) { return { provider: providerName, keys: [] }; }
}

function writeClusterFile(filePath, data) {
    try { fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8'); } catch (e) {}
}

const readNimCluster = () => readClusterFile(NIM_CLUSTER_FILE, "nvidia_nim");
const writeNimCluster = (data) => writeClusterFile(NIM_CLUSTER_FILE, data);
const getActiveNimKeys = () => {
    const fromVault = readNimCluster().keys.filter(k => k.status === 'ACTIVE' || k.status === 'VALID').map(k => k.key);
    const envKeys = [process.env.NVIDIA_API_KEY, process.env.NIM_API_KEY, process.env.VITE_NVIDIA_API_KEY, process.env.NVIDIA_NIM_KEY].filter(Boolean);
    return Array.from(new Set([...fromVault, ...envKeys]));
};

const readGroqCluster = () => readClusterFile(GROQ_CLUSTER_FILE, "groq");
const writeGroqCluster = (data) => writeClusterFile(GROQ_CLUSTER_FILE, data);
const getActiveGroqKeys = () => {
    const fromVault = readGroqCluster().keys.filter(k => k.status === 'ACTIVE' || k.status === 'VALID').map(k => k.key);
    const envKeys = [process.env.GROQ_API_KEY, process.env.VITE_GROQ_API_KEY].filter(Boolean);
    return Array.from(new Set([...fromVault, ...envKeys]));
};

const readGeminiCluster = () => readClusterFile(GEMINI_CLUSTER_FILE, "gemini");
const writeGeminiCluster = (data) => writeClusterFile(GEMINI_CLUSTER_FILE, data);
const getActiveGeminiKeys = () => {
    const fromVault = readGeminiCluster().keys.filter(k => k.status === 'ACTIVE' || k.status === 'VALID').map(k => k.key);
    const envKeys = [process.env.GEMINI_API_KEY, process.env.GEMINI_KEY_2, process.env.VITE_GEMINI_API_KEY].filter(Boolean);
    return Array.from(new Set([...fromVault, ...envKeys]));
};

// ==========================================
// TAB 10 DYNAMIC TUNNEL HANDLERS (ON-DEMAND ONLY)
// ==========================================
const handleTunnelUpdate = (req, res) => {
    try {
        const rawUrl = req.body.url || req.body.tunnelUrl || req.body.endpoint || req.body.target || req.query.url;
        if (!rawUrl) {
            return res.status(400).json({ success: false, status: 'ERROR', message: 'Tunnel URL is required.' });
        }

        const cleanUrl = rawUrl.trim();
        process.env.KAGGLE_TUNNEL_URL = cleanUrl;

        if (fs.existsSync(ENV_FILE_PATH)) {
            let envContent = fs.readFileSync(ENV_FILE_PATH, 'utf8');
            if (envContent.includes('KAGGLE_TUNNEL_URL=')) {
                envContent = envContent.replace(/KAGGLE_TUNNEL_URL=.*/g, `KAGGLE_TUNNEL_URL=${cleanUrl}`);
            } else {
                envContent += `\nKAGGLE_TUNNEL_URL=${cleanUrl}`;
            }
            fs.writeFileSync(ENV_FILE_PATH, envContent, 'utf8');
        }

        logTelemetry('KAGGLE_TUNNEL_SET', `Kaggle tunnel endpoint updated to: ${cleanUrl}`);

        return res.json({
            success: true,
            status: 'SUCCESS',
            message: 'Tunnel URL updated successfully.',
            tunnelUrl: cleanUrl,
            url: cleanUrl
        });
    } catch (err) {
        return res.status(500).json({ success: false, status: 'ERROR', message: err.message });
    }
};

const handleTunnelGet = (req, res) => {
    res.json({
        success: true,
        status: process.env.KAGGLE_TUNNEL_URL ? 'ONLINE' : 'STANDBY',
        tunnelUrl: process.env.KAGGLE_TUNNEL_URL || '',
        url: process.env.KAGGLE_TUNNEL_URL || ''
    });
};

app.post('/api/tunnel/set', handleTunnelUpdate);
app.post('/api/tunnel', handleTunnelUpdate);
app.post('/api/kaggle/tunnel', handleTunnelUpdate);
app.post('/api/kaggle/tunnel/set', handleTunnelUpdate);
app.post('/api/kaggle/set-tunnel', handleTunnelUpdate);
app.post('/api/tokens/tunnel', handleTunnelUpdate);

app.get('/api/tunnel/get', handleTunnelGet);
app.get('/api/tunnel', handleTunnelGet);
app.get('/api/kaggle/tunnel', handleTunnelGet);
app.get('/api/tokens/tunnel', handleTunnelGet);

// ==========================================
// NATIVE TOOL EXECUTION ENGINE
// ==========================================
const MCNC_TOOLS = [
    {
        type: "function",
        function: {
            name: "mcnc_read_file",
            description: "Read the exact physical contents of a file on Base 1 disk. Use this to verify a file exists before modifying it or referencing its contents.",
            parameters: {
                type: "object",
                properties: { targetPath: { type: "string", description: "Absolute path to the file" } },
                required: ["targetPath"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "mcnc_list_directory",
            description: "List all files and folders in a physical directory on disk.",
            parameters: {
                type: "object",
                properties: { dirPath: { type: "string", description: "Absolute path to the directory" } },
                required: ["dirPath"]
            }
        }
    }
];

async function executeNativeTool(toolCall) {
    const name = toolCall.function.name;
    let args = {};
    try { args = JSON.parse(toolCall.function.arguments); } catch (e) {}

    try {
        if (name === 'mcnc_read_file') {
            const target = path.isAbsolute(args.targetPath) ? args.targetPath : path.join(WORKSPACE_ROOT, args.targetPath);
            if (!isPathSafe(target)) return JSON.stringify({ error: "Access denied. Path outside workspace." });
            if (!fs.existsSync(target)) return JSON.stringify({ exists: false, error: "FILE DOES NOT EXIST ON DISK. Trigger SOP 11." });
            return fs.readFileSync(target, 'utf8').slice(0, 12000);
        }
        if (name === 'mcnc_list_directory') {
            const target = path.isAbsolute(args.dirPath) ? args.dirPath : path.join(WORKSPACE_ROOT, args.dirPath);
            if (!isPathSafe(target)) return JSON.stringify({ error: "Access denied." });
            if (!fs.existsSync(target)) return JSON.stringify({ exists: false, error: "DIRECTORY DOES NOT EXIST." });
            const entries = fs.readdirSync(target, { withFileTypes: true });
            return JSON.stringify(entries.map(e => ({ name: e.name, type: e.isDirectory() ? 'dir' : 'file' })));
        }
        return JSON.stringify({ error: "Unknown tool." });
    } catch (e) {
        return JSON.stringify({ error: e.message });
    }
}

// ==========================================
// ROUTING ENGINE (KAGGLE -> GEMINI -> NIM -> GROQ -> OPENROUTER)
// ==========================================
async function dispatchToOpenRouter(systemPrompt, userText, modelSlug, isCodeExecution = false) {
    const openRouterKey = process.env.OPENROUTER_API_KEY || process.env.VITE_OPENROUTER_API_KEY;
    if (!openRouterKey) throw new Error("OPENROUTER_API_KEY missing from .env");

    // MODEL SLUG NORMALIZATION: Lock Anthropic Sonnet calls to verified Claude 3.7
    let targetModel = modelSlug || 'anthropic/claude-3.7-sonnet';
    if (targetModel.includes('claude-3.5-sonnet') || targetModel.includes('claude-3-5-sonnet')) {
        targetModel = 'anthropic/claude-3.7-sonnet';
    }
    
    let messages = [
        { role: 'system', content: systemPrompt }, 
        { role: 'user', content: userText }
    ];

    let iteration = 0;
    const maxIterations = 3;
    // CRITICAL FIX: Unlock 8192 tokens for code production so single-file artifacts never truncate
    const tokenLimit = isCodeExecution ? 8192 : 4096;

    while (iteration < maxIterations) {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json', 
                'Authorization': `Bearer ${openRouterKey}`, 
                'HTTP-Referer': 'http://localhost:5173', 
                'X-Title': 'MCNC Master' 
            },
            body: JSON.stringify({ 
                model: targetModel, 
                messages: messages,
                tools: MCNC_TOOLS,
                tool_choice: "auto",
                temperature: 0.2, 
                max_tokens: tokenLimit 
            })
        });
        
        if (!response.ok) {
            const errTxt = await response.text();
            throw new Error(`OpenRouter Error ${response.status}: ${errTxt}`);
        }

        const data = await response.json();
        const choice = data.choices?.[0];
        const message = choice?.message;
        
        if (!message) throw new Error("Empty response from OpenRouter.");

        // Check if OpenRouter prematurely truncated the response
        if (choice.finish_reason === 'length') {
            console.warn('[!] OPENROUTER WARNING: Generation truncated due to max_tokens ceiling.');
        }

        messages.push(message);

        if (message.tool_calls && message.tool_calls.length > 0) {
            for (const toolCall of message.tool_calls) {
                const toolResult = await executeNativeTool(toolCall);
                messages.push({
                    role: "tool",
                    tool_call_id: toolCall.id,
                    name: toolCall.function.name,
                    content: toolResult
                });
            }
            iteration++;
            continue;
        } else {
            return message.content || "Empty response.";
        }
    }
    return messages[messages.length - 1].content || "Max tool iterations reached.";
}

async function dispatchToBrain(systemPrompt, rawBody) {
    let validContent = extractPromptText(rawBody);

    const referencedDirs = resolveReferencedDirectories(validContent);
    if (referencedDirs) validContent += `\n\n[DIRECTOR TOOL NOTICE: Audited directories]:${referencedDirs}`;

    const referencedFiles = resolveReferencedFiles(validContent);
    if (referencedFiles) validContent += `\n\n[DIRECTOR TOOL NOTICE: Ingested files]:${referencedFiles}`;

    let requestedModel = rawBody.model || '';
    const isCodeExecution = Boolean(
        rawBody.role === 'Full Code Generation Lead' || 
        validContent.includes('EXECUTE: STAGE 2') ||
        validContent.includes('PHYSICAL PRODUCTION CODE GENERATION') ||
        validContent.includes('<!DOCTYPE html>')
    );

    // NORMALIZE CLAUDE SONNET TO 3.7
    if (requestedModel.includes('claude-3.5-sonnet') || requestedModel.includes('claude-3-5-sonnet') || requestedModel.includes('claude-3.7-sonnet')) {
        requestedModel = 'anthropic/claude-3.7-sonnet';
    }

    // EXPLICIT OPENROUTER MODEL REQUEST (e.g. Claude 3.7 Sonnet / GPT-4o Frontier)
    if (requestedModel && (requestedModel.includes('/') || requestedModel.startsWith('anthropic') || requestedModel.startsWith('openai'))) {
        broadcast('TRACE', `[ROUTING ENGINE] Directing request to OpenRouter: ${requestedModel}`);
        const reply = await dispatchToOpenRouter(systemPrompt, validContent, requestedModel, isCodeExecution);
        return { reply: reply.trim(), modelUsed: `${requestedModel} (OpenRouter Frontier)` };
    }

    // TIER 4: KAGGLE ROUTING (ONLY ENGAGED ON EXPLICIT SELECTION)
    if (requestedModel.startsWith('KAGGLE/') || rawBody.useKaggle) {
        const KAGGLE_MODEL_MAP = {
            'KAGGLE/QWEN-2.5-VL-7B': 'Qwen/Qwen2.5-VL-7B-Instruct',
            'KAGGLE/QWEN-2.5-14B': 'Qwen/Qwen2.5-14B-Instruct-GPTQ-Int4',
            'KAGGLE/QWEN-2.5-CODER': 'Qwen/Qwen2.5-Coder-14B-Instruct-GPTQ-Int4',
            'KAGGLE/LLAMA-3.1-8B': 'meta-llama/Llama-3.1-8B-Instruct'
        };
        const targetModel = KAGGLE_MODEL_MAP[requestedModel] || 'Qwen/Qwen2.5-14B-Instruct-GPTQ-Int4';
        
        let baseUrl = (process.env.KAGGLE_TUNNEL_URL || 'http://localhost:5000').trim().replace(/\/+$/, '');
        const targetEndpoint = baseUrl.endsWith('/v1') 
            ? `${baseUrl}/chat/completions` 
            : `${baseUrl}/v1/chat/completions`;

        try {
            const response = await fetch(targetEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: targetModel,
                    messages: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: validContent }
                    ],
                    temperature: 0.2,
                    max_tokens: isCodeExecution ? 8192 : 4096
                })
            });
            
            if (response.ok) {
                const data = await response.json();
                const text = data.choices?.[0]?.message?.content?.trim();
                if (text) return { reply: text, modelUsed: `${targetModel} (Tier 4: Kaggle T4 Compute)` };
            }
            
            const errData = await response.text();
            throw new Error(`Kaggle Tunnel HTTP ${response.status}: ${errData}`);
        } catch (err) {
            console.error("Kaggle Route Error:", err.message);
            return { 
                reply: `[KAGGLE TUNNEL ERROR]: Failed to reach Kaggle GPU endpoint at ${targetEndpoint}.\n\nEnsure Kaggle notebook is active and URL is set.\n\nDetails: ${err.message}`, 
                modelUsed: 'KAGGLE OFFLINE' 
            };
        }
    }

    // TIER 1: GEMINI
    const activeGeminiKeys = getActiveGeminiKeys();
    const geminiModels = ['gemini-2.5-pro', 'gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-pro'];
    if (activeGeminiKeys.length > 0) {
        for (const gModel of geminiModels) {
            for (let i = 0; i < activeGeminiKeys.length; i++) {
                const mask = `...${activeGeminiKeys[i].slice(-6)}`;
                try {
                    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${gModel}:generateContent?key=${activeGeminiKeys[i]}`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ 
                            contents: [{ role: "user", parts: [{ text: systemPrompt + "\n\n" + validContent }] }],
                            generationConfig: { temperature: 0.2, maxOutputTokens: isCodeExecution ? 8192 : 4096 }
                        })
                    });
                    if (response.ok) {
                        const data = await response.json();
                        const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
                        if (text) return { reply: text, modelUsed: `${gModel} (Tier 1: Gemini [${mask}])` };
                    }
                } catch (err) {}
            }
        }
    }

    // TIER 2: NVIDIA NIM
    const activeNimKeys = getActiveNimKeys();
    if (activeNimKeys.length > 0) {
        for (let i = 0; i < activeNimKeys.length; i++) {
            const mask = `...${activeNimKeys[i].slice(-6)}`;
            try {
                const response = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${activeNimKeys[i]}` },
                    body: JSON.stringify({ 
                        model: 'meta/llama-3.3-70b-instruct', 
                        messages: [
                            { role: 'system', content: systemPrompt }, 
                            { role: 'user', content: validContent }
                        ], 
                        temperature: 0.2, 
                        max_tokens: isCodeExecution ? 4096 : 3000 
                    })
                });
                if (response.ok) {
                    const data = await response.json();
                    const text = data.choices?.[0]?.message?.content?.trim();
                    if (text) return { reply: text, modelUsed: `llama-3.3-70b (Tier 2: NIM [${mask}])` };
                }
            } catch (fetchErr) {}
        }
    }

    // TIER 3: GROQ
    const activeGroqKeys = getActiveGroqKeys();
    if (activeGroqKeys.length > 0) {
        for (let i = 0; i < activeGroqKeys.length; i++) {
            const mask = `...${activeGroqKeys[i].slice(-6)}`;
            try {
                const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${activeGroqKeys[i]}` },
                    body: JSON.stringify({ 
                        model: "llama-3.3-70b-versatile", 
                        messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: validContent }], 
                        temperature: 0.2, 
                        max_tokens: isCodeExecution ? 8192 : 4096 
                    })
                });
                if (response.ok) {
                    const data = await response.json();
                    const text = data.choices?.[0]?.message?.content?.trim();
                    if (text) return { reply: text, modelUsed: `llama-3.3-70b (Tier 3: Groq [${mask}])` };
                }
            } catch (err) {}
        }
    }

    // TIER 5: OPENROUTER FALLBACK SHIELD
    const fallbackReply = await dispatchToOpenRouter(systemPrompt, validContent, "meta-llama/llama-3.3-70b-instruct", isCodeExecution);
    return { reply: fallbackReply.trim(), modelUsed: "llama-3.3-70b (Tier 5: OpenRouter Shield)" };
}

// ==========================================
// AGENT FS TOOLS
// ==========================================
app.post('/api/tools/read', async (req, res) => {
    try {
        const { filePath } = req.body;
        if (!filePath) return res.status(400).json({ status: 'ERROR', message: 'filePath is required.' });
        const target = path.isAbsolute(filePath) ? filePath : path.join(WORKSPACE_ROOT, filePath);
        if (!isPathSafe(target)) return res.status(403).json({ status: 'ERROR', message: 'Access denied.' });
        if (!fs.existsSync(target)) return res.status(404).json({ status: 'ERROR', message: 'File not found.' });
        const stat = fs.statSync(target);
        const content = fs.readFileSync(target, 'utf8');
        res.json({ status: 'SUCCESS', filePath: target, size: stat.size, content });
    } catch (err) { res.status(500).json({ status: 'ERROR', message: err.message }); }
});

app.post('/api/tools/write', async (req, res) => {
    try {
        const { filePath, content, confirmed } = req.body;
        if (!filePath) return res.status(400).json({ status: 'ERROR', message: 'filePath is required.' });
        if (!confirmed) return res.status(400).json({ status: 'ERROR', message: 'Requires explicit Mike authorization.' });
        const target = path.isAbsolute(filePath) ? filePath : path.join(WORKSPACE_ROOT, filePath);
        if (!isPathSafe(target)) return res.status(403).json({ status: 'ERROR', message: 'Access denied.' });
        const parentDir = path.dirname(target);
        if (!fs.existsSync(parentDir)) fs.mkdirSync(parentDir, { recursive: true });
        if (fs.existsSync(target)) fs.copyFileSync(target, `${target}.bak_${Date.now()}`);
        fs.writeFileSync(target, content, 'utf8');
        res.json({ status: 'SUCCESS', message: `Saved: ${path.basename(target)}`, filePath: target });
    } catch (err) { res.status(500).json({ status: 'ERROR', message: err.message }); }
});

app.post('/api/tools/list', async (req, res) => {
    try {
        const { dirPath, recursive, maxDepth } = req.body;
        const target = dirPath ? (path.isAbsolute(dirPath) ? dirPath : path.join(WORKSPACE_ROOT, dirPath)) : WORKSPACE_ROOT;
        if (!isPathSafe(target)) return res.status(403).json({ status: 'ERROR', message: 'Access denied.' });
        if (!fs.existsSync(target)) return res.status(404).json({ status: 'ERROR', message: 'Not found.' });
        const depthLimit = typeof maxDepth === 'number' ? maxDepth : 3;

        const scanDirectory = (currentDir, currentDepth = 0) => {
            const items = [];
            const entries = fs.readdirSync(currentDir, { withFileTypes: true });
            for (const entry of entries) {
                if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === '.obsidian') continue;
                const fullPath = path.join(currentDir, entry.name);
                const relPath = path.relative(WORKSPACE_ROOT, fullPath);
                if (entry.isDirectory()) {
                    const dirObj = { name: entry.name, type: 'directory', path: fullPath, relativePath: relPath };
                    if (recursive && currentDepth < depthLimit) dirObj.children = scanDirectory(fullPath, currentDepth + 1);
                    items.push(dirObj);
                } else if (entry.isFile()) {
                    try {
                        const stat = fs.statSync(fullPath);
                        items.push({ name: entry.name, type: 'file', path: fullPath, relativePath: relPath, size: stat.size, modified: stat.mtime.toISOString() });
                    } catch (e) {}
                }
            }
            return items;
        };
        res.json({ status: 'SUCCESS', baseDirectory: target, entries: scanDirectory(target) });
    } catch (err) { res.status(500).json({ status: 'ERROR', message: err.message }); }
});

app.post('/api/tools/search', async (req, res) => {
    try {
        const { query, subDir, maxResults } = req.body;
        if (!query) return res.status(400).json({ status: 'ERROR', message: 'Query required.' });
        const searchRoot = subDir ? (path.isAbsolute(subDir) ? subDir : path.join(WORKSPACE_ROOT, subDir)) : WORKSPACE_ROOT;
        if (!isPathSafe(searchRoot)) return res.status(403).json({ status: 'ERROR', message: 'Access denied.' });

        const limit = typeof maxResults === 'number' ? maxResults : 50;
        const matches = [];
        const lowerQuery = query.toLowerCase();

        const searchRecursive = (dir) => {
            if (matches.length >= limit) return;
            const entries = fs.readdirSync(dir, { withFileTypes: true });
            for (const entry of entries) {
                if (matches.length >= limit) break;
                if (entry.name === 'node_modules' || entry.name === '.git') continue;
                const fullPath = path.join(dir, entry.name);
                if (entry.isDirectory()) {
                    searchRecursive(fullPath);
                } else if (entry.isFile()) {
                    const nameMatch = entry.name.toLowerCase().includes(lowerQuery);
                    if (nameMatch) {
                        const stat = fs.statSync(fullPath);
                        matches.push({ filename: entry.name, path: fullPath, size: stat.size });
                    }
                }
            }
        };
        searchRecursive(searchRoot);
        res.json({ status: 'SUCCESS', query, totalFound: matches.length, results: matches });
    } catch (err) { res.status(500).json({ status: 'ERROR', message: err.message }); }
});

app.post('/api/tools/stat', async (req, res) => {
    try {
        const { targetPath } = req.body;
        if (!targetPath) return res.status(400).json({ status: 'ERROR', message: 'targetPath required.' });
        const target = path.isAbsolute(targetPath) ? targetPath : path.join(WORKSPACE_ROOT, targetPath);
        if (!isPathSafe(target)) return res.status(403).json({ status: 'ERROR', message: 'Access denied.' });
        if (!fs.existsSync(target)) return res.json({ status: 'SUCCESS', exists: false });
        const stat = fs.statSync(target);
        res.json({ status: 'SUCCESS', exists: true, isDirectory: stat.isDirectory(), isFile: stat.isFile(), size: stat.size });
    } catch (err) { res.status(500).json({ status: 'ERROR', message: err.message }); }
});

// ==========================================
// ELEVENLABS TTS PROXY ROUTE (TAB 14 PIPELINE)
// ==========================================
app.post('/api/tts', async (req, res) => {
    try {
        const { text, voiceId, apiKey, speed, stability, similarityBoost } = req.body;
        if (!apiKey || !voiceId) return res.status(400).json({ error: 'Missing ElevenLabs API Key or Voice ID.' });

        const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
            method: 'POST',
            headers: { 'Accept': 'audio/mpeg', 'Content-Type': 'application/json', 'xi-api-key': apiKey },
            body: JSON.stringify({
                text: text || "Director online.",
                model_id: 'eleven_multilingual_v2',
                voice_settings: { stability: stability || 0.75, similarity_boost: similarityBoost || 0.8, speed: speed || 1.0 }
            })
        });
        if (!response.ok) return res.status(response.status).json({ error: await response.text() });
        const arrayBuffer = await response.arrayBuffer();
        res.setHeader('Content-Type', 'audio/mpeg');
        res.send(Buffer.from(arrayBuffer));
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// ==========================================
// CLUSTERS CONTROLLER (NIM, GROQ, GEMINI)
// ==========================================
app.get('/api/cluster/nim/keys', (req, res) => {
    const keys = readNimCluster().keys.map(k => ({ masked: `nvapi-...${k.key.slice(-6)}`, status: k.status }));
    res.json({ total: keys.length, active: keys.filter(k => k.status === 'ACTIVE' || k.status === 'VALID').length, keys });
});

app.post('/api/cluster/nim/add', (req, res) => {
    const { rawKeys } = req.body;
    if (!rawKeys) return res.status(400).json({ error: 'No keys provided.' });
    const keyList = rawKeys.split(/[\n,]+/).map(k => k.trim()).filter(k => k.startsWith('nvapi-'));
    const cluster = readNimCluster();
    const existing = new Set(cluster.keys.map(k => k.key));
    let added = 0;
    keyList.forEach(k => {
        if (!existing.has(k)) {
            cluster.keys.push({ key: k, status: 'ACTIVE', lastChecked: new Date().toISOString() });
            existing.add(k);
            added++;
        }
    });
    writeNimCluster(cluster);
    res.json({ success: true, added, total: cluster.keys.length });
});

app.get('/api/cluster/groq/keys', (req, res) => {
    const keys = readGroqCluster().keys.map(k => ({ masked: `gsk_...${k.key.slice(-6)}`, status: k.status }));
    res.json({ total: keys.length, active: keys.filter(k => k.status === 'ACTIVE' || k.status === 'VALID').length, keys });
});

app.post('/api/cluster/groq/add', (req, res) => {
    const { rawKeys } = req.body;
    if (!rawKeys) return res.status(400).json({ error: 'No keys provided.' });
    const keyList = rawKeys.split(/[\n,]+/).map(k => k.trim()).filter(k => k.startsWith('gsk_'));
    const cluster = readGroqCluster();
    const existing = new Set(cluster.keys.map(k => k.key));
    let added = 0;
    keyList.forEach(k => {
        if (!existing.has(k)) {
            cluster.keys.push({ key: k, status: 'ACTIVE', lastChecked: new Date().toISOString() });
            existing.add(k);
            added++;
        }
    });
    writeGroqCluster(cluster);
    res.json({ success: true, added, total: cluster.keys.length });
});

app.get('/api/cluster/gemini/keys', (req, res) => {
    const keys = readGeminiCluster().keys.map(k => ({ masked: `AIza...${k.key.slice(-6)}`, status: k.status }));
    res.json({ total: keys.length, active: keys.filter(k => k.status === 'ACTIVE' || k.status === 'VALID').length, keys });
});

app.post('/api/cluster/gemini/add', (req, res) => {
    const { rawKeys } = req.body;
    if (!rawKeys) return res.status(400).json({ error: 'No keys provided.' });
    const keyList = rawKeys.split(/[\n,]+/).map(k => k.trim()).filter(k => k.startsWith('AIza'));
    const cluster = readGeminiCluster();
    const existing = new Set(cluster.keys.map(k => k.key));
    let added = 0;
    keyList.forEach(k => {
        if (!existing.has(k)) {
            cluster.keys.push({ key: k, status: 'ACTIVE', lastChecked: new Date().toISOString() });
            existing.add(k);
            added++;
        }
    });
    writeGeminiCluster(cluster);
    res.json({ success: true, added, total: cluster.keys.length });
});

// ==========================================
// TAB 12 REFINERY HARVESTER
// ==========================================
app.post('/api/harvest', async (req, res) => {
    try {
        const { url, contentDump, topicDomain, specialization } = req.body;
        let rawContent = (contentDump || '').trim();
        let extractedFromMedia = '';

        console.log(`[REFINERY DISPATCH] Ingest initiated. Target: ${url || 'Direct Text Payload'}`);

        const systemPrompt = `[MONTY] here, Chief of Staff and Master Intelligence Triage Judge for MCNC Base 1.
Execute SOP 17 Ingestion Hopper extraction on the provided technical source material.
Domain: ${topicDomain || 'General'}
Sub-Niche: ${specialization || 'General'}

You must extract and output strictly in this exact SOP 17 schema:
# RESEARCH DOSSIER // [EXACT TITLE OR ARCHITECTURAL SUBJECT]

### 1. CORE NUGGET
Concrete technical fact, architectural pattern, model requirement, or operational dependency. Zero fluff or narrative biography.

### 2. CODE / IMPLEMENTATION
Exact schema, configuration, prompt template, or functional code syntax extracted from the source. No placeholders, ellipses, or pseudo-code.

### 3. SUPERSEDES
Explicit declaration of any legacy, previous pattern, or outdated implementation rendered obsolete by this intelligence. If none, state "None documented."

Strict Zero Fluff Mandate: Deliver high-signal engineering nuggets only.`;

        if (url && url.trim()) {
            const videoId = extractYouTubeId(url);
            if (videoId) {
                broadcast('TRACE', `[REFINERY] Ingesting YouTube video: ${videoId}...`);

                const directGeminiResult = await dispatchYouTubeDirectToGemini(systemPrompt, videoId, rawContent);
                if (directGeminiResult) {
                    return res.json({
                        success: true,
                        nugget: directGeminiResult.reply,
                        modelUsed: directGeminiResult.modelUsed,
                        domain: topicDomain,
                        specialization
                    });
                }

                extractedFromMedia = await extractYouTubeTranscript(videoId);
                if (extractedFromMedia && extractedFromMedia.length >= 50) {
                    rawContent = `[SOURCE URL]: ${url}\n\n[SCRAPED TRANSCRIPT]:\n${extractedFromMedia}\n\n${rawContent}`;
                    broadcast('TRACE', `[REFINERY] Ingested ${extractedFromMedia.length} chars of transcript data.`);
                } else {
                    console.error(`[REFINERY GUARD] All extraction vectors failed for: ${url}`);
                    return res.status(422).json({ 
                        error: `EXTRACTION REJECTED: Check that a valid GEMINI_API_KEY is active in Tab 10 or .env. Process halted (SOP 11).` 
                    });
                }
            } else {
                rawContent = `[SOURCE URL]: ${url}\n\n${rawContent}`;
            }
        }

        if (!rawContent || rawContent.length < 50) {
            return res.status(400).json({ 
                error: 'PAYLOAD REJECTED: Ingest content must be at least 50 characters of verifiable data.' 
            });
        }

        broadcast('TRACE', `[REFINERY] Routing to Gemini for SOP 17 distillation...`);
        const { reply, modelUsed } = await dispatchToBrain(systemPrompt, { 
            text: rawContent, 
            model: 'gemini-2.5-pro' 
        });

        res.json({ success: true, nugget: reply, modelUsed, domain: topicDomain, specialization });
    } catch (err) {
        console.error(`[REFINERY ERROR]:`, err.message);
        res.status(500).json({ error: err.message });
    }
});

// ==========================================
// TAB 13 / UNIFIED GOVERNANCE SCANNER
// ==========================================
function scanVaultDocuments() {
    const docList = [];
    const seenPaths = new Set();

    function addDoc(fullPath, domainName, nicheName, cleanTitle) {
        if (!fs.existsSync(fullPath)) return;
        const normalized = path.resolve(fullPath).toLowerCase();
        if (seenPaths.has(normalized)) return;
        seenPaths.add(normalized);

        try {
            const content = fs.readFileSync(fullPath, 'utf8');
            const stat = fs.statSync(fullPath);
            const firstHeaderMatch = content.match(/^#\s+(.+)$/m);
            const title = cleanTitle || (firstHeaderMatch ? firstHeaderMatch[1].trim() : path.basename(fullPath).replace(/\.(md|txt)$/i, ''));

            docList.push({
                filename: path.basename(fullPath),
                title: title,
                domain: domainName.trim(),
                niche: nicheName.trim(),
                specialization: nicheName.trim(),
                path: fullPath,
                relativePath: path.relative(WORKSPACE_ROOT, fullPath),
                content: content,
                size: stat.size,
                modified: stat.mtime
            });
        } catch (e) {}
    }

    // 1. Scan Live Director Souls directly from MCNC/souls
    if (fs.existsSync(SOULS_PATH)) {
        try {
            const soulFiles = fs.readdirSync(SOULS_PATH, { withFileTypes: true });
            for (const f of soulFiles) {
                if (f.isFile() && (f.name.endsWith('.md') || f.name.endsWith('.txt'))) {
                    const directorName = f.name.replace(/\.(md|txt)$/i, '').replace(/_/g, ' ');
                    addDoc(path.join(SOULS_PATH, f.name), 'Core Documents', 'Souls', `${directorName.toUpperCase()} (Soul)`);
                }
            }
        } catch (e) {}
    }

    // 2. Scan Real WASP Documents directly
    const waspDocsDir = path.join(WORKSPACE_ROOT, 'WASP Documents');
    if (fs.existsSync(waspDocsDir)) {
        try {
            const waspFiles = fs.readdirSync(waspDocsDir, { withFileTypes: true });
            for (const f of waspFiles) {
                if (f.isFile() && (f.name.endsWith('.md') || f.name.endsWith('.txt'))) {
                    const clean = f.name.toLowerCase();
                    let niche = 'ROEs';
                    if (clean.includes('sop')) niche = 'SOPs';
                    else if (clean.includes('mission') || clean.includes('statement')) niche = 'Mission Statement';
                    addDoc(path.join(waspDocsDir, f.name), 'Core Documents', niche);
                }
            }
        } catch (e) {}
    }

    // 3. Scan Vault Docs Hierarchy
    function walkDir(dir, domainName = 'General', defaultNiche = 'Vault') {
        if (!fs.existsSync(dir)) return;
        let items;
        try { items = fs.readdirSync(dir, { withFileTypes: true }); } catch (e) { return; }

        for (const item of items) {
            if (item.name.startsWith('.') || item.name === 'node_modules' || item.name === 'uploads' || item.name === 'dist') continue;
            const fullPath = path.join(dir, item.name);

            if (item.isDirectory()) {
                const subDomain = domainName === 'General' ? item.name : domainName;
                walkDir(fullPath, subDomain, item.name);
            } else if (item.isFile()) {
                const ext = path.extname(item.name).toLowerCase();
                if (['.md', '.txt'].includes(ext)) {
                    const cleanBaseName = item.name.replace(/\.(md|txt)$/i, '').replace(/_/g, ' ');
                    const resolvedNiche = (defaultNiche !== 'Vault' && defaultNiche !== domainName) ? defaultNiche : cleanBaseName;
                    addDoc(fullPath, domainName, resolvedNiche);
                }
            }
        }
    }

    walkDir(DOCS_PATH);

    // 4. Physical Mount: Scan Data/Chats for MASTER_CHAT.md per project
    if (fs.existsSync(CHATS_PATH)) {
        try {
            const projectDirs = fs.readdirSync(CHATS_PATH, { withFileTypes: true });
            for (const pDir of projectDirs) {
                if (pDir.isDirectory()) {
                    const masterPath = path.join(CHATS_PATH, pDir.name, 'MASTER_CHAT.md');
                    if (fs.existsSync(masterPath)) {
                        addDoc(masterPath, pDir.name, 'Master Ledger', `${pDir.name} // MASTER CHAT LEDGER`);
                    }
                }
            }
        } catch (e) {}
    }

    return docList;
}

app.get('/api/docs', (req, res) => {
    try {
        const docs = scanVaultDocuments();
        res.json(docs);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/docs/refresh', (req, res) => {
    try {
        const docs = scanVaultDocuments();
        res.json({ success: true, count: docs.length, documents: docs });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/docs/save', async (req, res) => {
    try {
        const { filename, domain, niche, specialization, content, filePath } = req.body;
        if (!content || !content.trim()) return res.status(400).json({ error: 'Content payload is empty.' });

        let targetFile = filePath;

        if (!targetFile || !fs.existsSync(path.dirname(targetFile))) {
            const safeDomain = (domain || 'General').replace(/[\\\/:\*\?"<>\|]/g, '_').trim();
            const rawNiche = specialization || niche || 'General';
            const safeNiche = rawNiche.trim().replace(/[\\\/:\*\?"<>\|]/g, '_').replace(/\s+/g, '_');
            
            let targetFilename = filename;
            if (!targetFilename) targetFilename = `${safeNiche}.md`;
            if (!targetFilename.endsWith('.md') && !targetFilename.endsWith('.txt')) targetFilename += '.md';

            const targetDir = path.join(DOCS_PATH, safeDomain);
            if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });
            targetFile = path.join(targetDir, targetFilename);
        }

        fs.writeFileSync(targetFile, content.trim(), 'utf8');
        logTelemetry('DOCS_SAVED', `Updated document at: ${targetFile}`);
        broadcast('TRACE', `[VAULT WRITE] Updated authentic file: ${targetFile}`);

        res.json({ 
            success: true, 
            message: `Successfully saved to ${targetFile}`, 
            filePath: targetFile, 
            filename: path.basename(targetFile) 
        });
    } catch (err) { 
        console.error('[!] Vault Save Error:', err.message);
        res.status(500).json({ error: err.message }); 
    }
});

// ==========================================
// MECHANICAL JUDGE: WARLORD SOP INTERCEPTOR (FIXED ATTRIBUTE REGEX)
// ==========================================
function warlordJudgeInterceptor(text) {
    if (!text) return { passed: false, error: "Empty payload." };

    // SURGICAL FIX: Do NOT match valid CSS attribute brackets like [type="..."] or Markdown link syntax
    const bannedPatterns = [
        { rx: /\[(Client|Insert|Date|TODO|Your Name|Company Name|Placeholder).*?\]/gi, name: "Explicit Placeholders ([Client], [Insert], [TODO])" },
        { rx: /\{\{.*?\}\}/g, name: "Curly Braces / Template Tags ({{name}})" },
        { rx: /555-\d{4}/g, name: "Fake Hollywood Phone Numbers (555-XXXX)" },
        { rx: /\.{4,}/g, name: "Ellipses / Code Snippets (....)" },
        { rx: /example\.com/gi, name: "Fake Placeholder Domains (example.com)" },
        { rx: /<placeholder.*?>/gi, name: "XML/HTML Placeholders" }
    ];

    for (const rule of bannedPatterns) {
        if (rule.rx.test(text)) {
            return { 
                passed: false, 
                error: `VIOLATION DETECTED: Output contains banned pattern: ${rule.name}. You are in breach of the Warlord SOP. Remove this and output production-ready data only.` 
            };
        }
    }
    return { passed: true };
}

// ==========================================
// AUTOMATED STAGE 2 ARTIFACT WRITER (SOP 04 DISK SYNC)
// ==========================================
function autoPersistCodeArtifact(projectName, replyText) {
    if (!replyText || (!replyText.includes('<!DOCTYPE html>') && !replyText.includes('<html'))) {
        return null;
    }

    try {
        const slug = slugify(projectName || 'The_Chief_Madothi_Fund');
        const candidateDirs = [
            path.join(PROJECTS_PATH, slug, 'Web_And_Social'),
            path.join(WORKSPACE_ROOT, 'MCNC', 'Data', 'Projects', slug, 'Web_And_Social'),
            path.join(WORKSPACE_ROOT, 'public')
        ];

        let targetDir = candidateDirs[0];
        for (const c of candidateDirs) {
            if (fs.existsSync(c)) {
                targetDir = c;
                break;
            }
        }

        if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });

        const targetFile = path.join(targetDir, 'index.html');
        
        // SOP 12: Pre-execution checkpoint
        if (fs.existsSync(targetFile)) {
            fs.copyFileSync(targetFile, `${targetFile}.bak_${Date.now()}`);
        }

        // Clean out any accidental markdown code fences
        let cleanHtml = replyText;
        if (cleanHtml.includes('```html')) {
            cleanHtml = cleanHtml.split('```html')[1].split('```')[0].trim();
        } else if (cleanHtml.includes('```')) {
            cleanHtml = cleanHtml.split('```')[1].split('```')[0].trim();
        }

        fs.writeFileSync(targetFile, cleanHtml, 'utf8');
        logTelemetry('ARTIFACT_COMMITTED', `Automatically persisted production index.html to ${targetFile}`);
        broadcast('TRACE', `[DISK WRITE] Stage 2 physical artifact persisted to disk: ${targetFile}`);
        return targetFile;
    } catch (err) {
        console.error('[!] Failed to auto-persist artifact:', err.message);
        return null;
    }
}

// ==========================================
// CHAT & HEALTH
// ==========================================
app.post('/api/chat', async (req, res) => {
    try {
        const montySoul = loadSoul('monty');
        const liveTelemetry = getLiveSystemSnapshot();
        const baseSystemPrompt = liveTelemetry + "\n\n" + CORE_DIRECTIVE + (montySoul ? `\n\n=== PROTOCOL ===\n${montySoul}` : "");
        
        let currentPromptBody = req.body;
        let attempt = 1;
        const maxAttempts = 3;
        let finalReply = "";
        let finalModel = "";

        while (attempt <= maxAttempts) {
            const { reply, modelUsed } = await dispatchToBrain(baseSystemPrompt, currentPromptBody);
            finalModel = modelUsed;
            
            const audit = warlordJudgeInterceptor(reply);
            
            if (audit.passed) {
                finalReply = reply;
                break;
            } else {
                console.warn(`[JUDGE INTERCEPT - STRIKE ${attempt}] ${audit.error}`);
                if (attempt === maxAttempts) {
                    finalReply = `[SYSTEM ESCALATION]: Agent failed the Warlord SOP 3 times. Last error: ${audit.error}\n\nRaw Output:\n${reply}`;
                    break;
                }
                let previousText = extractPromptText(currentPromptBody);
                let correctedText = `${previousText}\n\n[SYSTEM JUDGE REJECTION]: Your previous attempt failed. ${audit.error} REWRITE ENTIRELY WITHOUT PLACEHOLDERS OR SNIPPETS.`;
                currentPromptBody = { ...currentPromptBody, text: correctedText, prompt: correctedText, message: correctedText };
                attempt++;
            }
        }

        // AUTOMATED DISK WRITE FOR STAGE 2 ARTIFACTS
        const persistedPath = autoPersistCodeArtifact(currentPromptBody.project, finalReply);
        if (persistedPath) {
            broadcast('TRACE', `[PIPELINE CLOSURE] Disk persistence verified at ${persistedPath}`);
        }

        broadcast('CHAT_COMPLETE', { 
            reply: finalReply, 
            activeModelUsed: finalModel, 
            persistedFile: persistedPath 
        });

        res.json({ 
            status: 'SUCCESS', 
            reply: finalReply, 
            activeModelUsed: finalModel, 
            persistedFile: persistedPath 
        });
    } catch (err) { 
        res.status(500).json({ status: 'ERROR', reply: err.message }); 
    }
});

app.get('/api/health', (req, res) => {
    res.json({ status: 'ONLINE', uptime: process.uptime(), memory: process.memoryUsage() });
});

// ==========================================
// MASTER DAEMON INITIALIZATION
// ==========================================
const PORT = process.env.PORT || 8081;
server.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`[BASE 1 MASTER DAEMON]   : Port ${PORT}`);
    console.log(`[WORKSPACE ROOT]         : ${WORKSPACE_ROOT}`);
    console.log(`[DOCS REPOSITORY]        : ${DOCS_PATH}`);
    console.log(`[CHATS REPOSITORY]       : ${CHATS_PATH}`);
    console.log(`[LIVE SOULS REPOSITORY]  : ${SOULS_PATH}`);
    console.log(`[AGENT FS TOOLS]         : /api/tools/{read,write,list,search,stat}`);
    console.log(`[REFINERY ENGINE]        : /api/harvest & /api/docs/save ONLINE`);
    console.log(`[CLUSTER MANAGERS]       : NIM, GROQ, GEMINI ONLINE`);
    console.log(`[STAGE 2 AUTO-WRITER]    : ACTIVE (8192 Max Tokens Enabled)`);
    console.log(`[STATUS]                 : 100% OPERATIONAL // CLEAN`);
    console.log(`====================================================`);
});