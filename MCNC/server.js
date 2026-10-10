require('dotenv').config();
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const multer = require('multer');
const { exec } = require('child_process');
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
const TELEMETRY_DIR = path.join(VAULT_DIR, 'telemetry');
const TELEMETRY_FILE = path.join(TELEMETRY_DIR, 'active_telemetry.md');
const KEYS_DIR = path.join(VAULT_DIR, 'Keys');
const NIM_CLUSTER_FILE = path.join(KEYS_DIR, 'nim_cluster.json');
const GROQ_CLUSTER_FILE = path.join(KEYS_DIR, 'groq_cluster.json');
const GEMINI_CLUSTER_FILE = path.join(KEYS_DIR, 'gemini_cluster.json');
const PROJECTS_MANIFEST_FILE = path.join(VAULT_PATH, 'projects_manifest.json');
const ENV_FILE_PATH = path.join(__dirname, '.env');

[LOGS_PATH, UPLOADS_PATH, TELEMETRY_DIR, VAULT_DIR, KEYS_DIR, VAULT_PATH, PROJECTS_PATH, DOCS_PATH].forEach(dir => {
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
// ATOMIC PROJECT SCAFFOLDER
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

    const subDirs = [
        '01_PRD', '02_LEGAL_STATUTORY', '03_FINANCE_TREASURY',
        '04_MARKET_EXPANSION', '05_BRAND_COLLATERAL', '06_ASSETS_GRAPHICS',
        '07_SITE_TELEMETRY', '08_BIM_CAD', '09_MEETINGS_DECISIONS'
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
// REAL-TIME KAGGLE HANDSHAKE ENGINE
// ==========================================
let kaggleComputeActive = true;

async function verifyKaggleReachability(tunnelUrl) {
    if (!tunnelUrl) return false;
    try {
        const cleanUrl = tunnelUrl.trim().replace(/\/+$/, '');
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000);
        
        const testRes = await fetch(cleanUrl, { 
            method: 'GET',
            signal: controller.signal 
        }).catch(async () => {
            return await fetch(`${cleanUrl}/v1`, { signal: controller.signal });
        });
        
        clearTimeout(timeoutId);
        return Boolean(testRes && testRes.status < 500);
    } catch (e) {
        return false;
    }
}

const handleTunnelUpdate = (req, res) => {
    try {
        const rawUrl = req.body.url || req.body.tunnelUrl || req.body.endpoint || req.body.target || req.query.url;
        if (!rawUrl) {
            return res.status(400).json({ success: false, status: 'ERROR', message: 'Tunnel URL is required.' });
        }

        const cleanUrl = rawUrl.trim().replace(/\/+$/, '');
        process.env.KAGGLE_TUNNEL_URL = cleanUrl;
        kaggleComputeActive = true;

        if (fs.existsSync(ENV_FILE_PATH)) {
            let envContent = fs.readFileSync(ENV_FILE_PATH, 'utf8');
            if (envContent.includes('KAGGLE_TUNNEL_URL=')) {
                envContent = envContent.replace(/KAGGLE_TUNNEL_URL=.*/g, `KAGGLE_TUNNEL_URL=${cleanUrl}`);
            } else {
                envContent += `\nKAGGLE_TUNNEL_URL=${cleanUrl}`;
            }
            fs.writeFileSync(ENV_FILE_PATH, envContent, 'utf8');
        }

        broadcast('KAGGLE_STATUS', { active: true, status: 'ACTIVE', url: cleanUrl });
        broadcast('TRACE', `[KAGGLE TUNNEL] Active URL set to: ${cleanUrl}`);
        logTelemetry('KAGGLE_TUNNEL_SET', `Kaggle tunnel endpoint updated to: ${cleanUrl}`);

        return res.json({
            success: true,
            status: 'SUCCESS',
            active: true,
            tunnelUrl: cleanUrl,
            url: cleanUrl
        });
    } catch (err) {
        return res.status(500).json({ success: false, status: 'ERROR', message: err.message });
    }
};

const handleTunnelGet = async (req, res) => {
    const tunnelUrl = process.env.KAGGLE_TUNNEL_URL || '';
    let isPhysicallyAlive = false;

    if (kaggleComputeActive && tunnelUrl) {
        isPhysicallyAlive = await verifyKaggleReachability(tunnelUrl);
    }

    const currentStatus = (kaggleComputeActive && isPhysicallyAlive) ? 'ACTIVE' : 'STANDBY';

    res.json({
        success: true,
        active: isPhysicallyAlive && kaggleComputeActive,
        online: isPhysicallyAlive && kaggleComputeActive,
        status: currentStatus,
        tunnelUrl: tunnelUrl,
        url: tunnelUrl
    });
};

const handleToggleKaggle = async (req, res) => {
    kaggleComputeActive = !kaggleComputeActive;
    let isPhysicallyAlive = false;
    const tunnelUrl = process.env.KAGGLE_TUNNEL_URL || '';

    if (kaggleComputeActive && tunnelUrl) {
        isPhysicallyAlive = await verifyKaggleReachability(tunnelUrl);
    }

    const currentStatus = (kaggleComputeActive && isPhysicallyAlive) ? 'ACTIVE' : 'STANDBY';
    broadcast('KAGGLE_STATUS', { active: kaggleComputeActive && isPhysicallyAlive, status: currentStatus });
    return res.json({ success: true, active: kaggleComputeActive && isPhysicallyAlive, status: currentStatus });
};

// URL setters
app.post('/api/tunnel/set', handleTunnelUpdate);
app.post('/api/tunnel', handleTunnelUpdate);
app.post('/api/kaggle/tunnel', handleTunnelUpdate);
app.post('/api/kaggle/tunnel/set', handleTunnelUpdate);
app.post('/api/kaggle/set-tunnel', handleTunnelUpdate);
app.post('/api/tokens/tunnel', handleTunnelUpdate);
app.post('/api/compute/tunnel', handleTunnelUpdate);

// Status queries & Toggle
app.get('/api/tunnel/get', handleTunnelGet);
app.get('/api/tunnel', handleTunnelGet);
app.get('/api/kaggle/tunnel', handleTunnelGet);
app.get('/api/kaggle/status', handleTunnelGet);
app.get('/api/tokens/tunnel', handleTunnelGet);
app.get('/api/status', handleTunnelGet);

app.post('/api/kaggle/toggle', handleToggleKaggle);
app.post('/api/tokens/kaggle/toggle', handleToggleKaggle);
app.post('/api/compute/toggle', handleToggleKaggle);

// ==========================================
// ROUTING ENGINE (KAGGLE -> GEMINI -> NIM -> GROQ -> OPENROUTER)
// ==========================================
async function dispatchToOpenRouter(systemPrompt, userText, modelSlug) {
    const openRouterKey = process.env.OPENROUTER_API_KEY || process.env.VITE_OPENROUTER_API_KEY;
    if (!openRouterKey) throw new Error("OPENROUTER_API_KEY missing from .env");
    
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json', 
            'Authorization': `Bearer ${openRouterKey}`, 
            'HTTP-Referer': 'http://localhost:5173', 
            'X-Title': 'MCNC Master' 
        },
        body: JSON.stringify({ 
            model: modelSlug || 'meta-llama/llama-3.3-70b-instruct', 
            messages: [
                { role: 'system', content: systemPrompt }, 
                { role: 'user', content: userText }
            ], 
            temperature: 0.2, 
            max_tokens: 4096 
        })
    });
    if (!response.ok) throw new Error(`OpenRouter Error ${response.status}`);
    const data = await response.json();
    return data.choices?.[0]?.message?.content || "Empty response from OpenRouter.";
}

async function dispatchToBrain(systemPrompt, rawBody) {
    let validContent = extractPromptText(rawBody);

    const referencedDirs = resolveReferencedDirectories(validContent);
    if (referencedDirs) validContent += `\n\n[DIRECTOR TOOL NOTICE: Audited directories]:${referencedDirs}`;

    const referencedFiles = resolveReferencedFiles(validContent);
    if (referencedFiles) validContent += `\n\n[DIRECTOR TOOL NOTICE: Ingested files]:${referencedFiles}`;

    const requestedModel = rawBody.model || '';

    // ==========================================
    // TIER 4: KAGGLE ROUTING (Zero-Cost Tunnel)
    // ==========================================
    if (requestedModel.startsWith('KAGGLE/')) {
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
                    max_tokens: 4096
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
                reply: `[KAGGLE TUNNEL ERROR]: Failed to reach Kaggle GPU endpoint at ${targetEndpoint}.\n\nEnsure your Kaggle notebook is active, Ollama/vLLM is running, and the URL is set.\n\nDetails: ${err.message}`, 
                modelUsed: 'KAGGLE OFFLINE' 
            };
        }
    }

    // TIER 1: GEMINI
    const activeGeminiKeys = getActiveGeminiKeys();
    if (activeGeminiKeys.length > 0) {
        for (let i = 0; i < activeGeminiKeys.length; i++) {
            const mask = `...${activeGeminiKeys[i].slice(-6)}`;
            try {
                const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${activeGeminiKeys[i]}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        contents: [{ role: "user", parts: [{ text: systemPrompt + "\n\n" + validContent }] }],
                        generationConfig: { temperature: 0.2, maxOutputTokens: 8192 }
                    })
                });
                if (response.ok) {
                    const data = await response.json();
                    const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
                    if (text) return { reply: text, modelUsed: `gemini-1.5-pro (Tier 1: Gemini [${mask}])` };
                }
            } catch (err) {}
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
                        max_tokens: 3000 
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
                        max_tokens: 4096 
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

    // TIER 4: OPENROUTER
    const fallbackReply = await dispatchToOpenRouter(systemPrompt, validContent, "meta-llama/llama-3.3-70b-instruct");
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
        const { url, contentDump, topicDomain, specialization, model } = req.body;
        let rawContent = (contentDump || '').trim();

        if (url && url.trim()) {
            const videoId = extractYouTubeId(url);
            if (videoId) {
                try {
                    broadcast('TRACE', `[REFINERY] Scraping transcript for YouTube: ${videoId}...`);
                    const transcriptArr = await YoutubeTranscript.fetchTranscript(videoId);
                    const ytText = transcriptArr.map(t => t.text).join(' ');
                    rawContent = `[SOURCE URL]: ${url}\n\n[SCRAPED TRANSCRIPT]:\n${ytText}\n\n${rawContent}`;
                } catch (ytErr) {
                    rawContent = `[SOURCE URL]: ${url} (Transcript auto-scrape unavailable: ${ytErr.message})\n\n${rawContent}`;
                }
            } else {
                rawContent = `[SOURCE URL]: ${url}\n\n${rawContent}`;
            }
        }

        if (!rawContent || rawContent.length < 5) {
            return res.status(400).json({ error: 'No content or link provided to harvest.' });
        }

        const systemPrompt = `You are MONTY, Chief of Staff and Master Intelligence Triage Judge for MCNC Base 1.
Strip narrative fluff and output a dense Markdown dossier:
Domain: ${topicDomain || 'General'}
Sub-Niche: ${specialization || 'General'}
Format:
# RESEARCH DOSSIER // [TITLE]
### 1. Executive Summary & Core Value Proposition
### 2. Technical Architecture & Mechanics
### 3. Actionable Directives & Implementation Roadmap
Zero marketing filler. Pure high-signal engineering nuggets only.`;

        broadcast('TRACE', `[REFINERY] Executing fluff-stripping across ${topicDomain} > ${specialization}...`);
        
        const { reply, modelUsed } = await dispatchToBrain(systemPrompt, { 
            text: rawContent, 
            model: model || process.env.DEFAULT_BRAIN || '' 
        });

        res.json({ success: true, nugget: reply, modelUsed, domain: topicDomain, specialization });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ==========================================
// TAB 13 / OBSIDIAN VAULT DOCS REPOSITORY API
// ==========================================
function scanVaultDocuments() {
    const docList = [];
    const seenPaths = new Set();

    function walkDir(dir, domainName = 'General', defaultNiche = 'Vault') {
        if (!fs.existsSync(dir)) return;
        let items;
        try { items = fs.readdirSync(dir, { withFileTypes: true }); } catch (e) { return; }

        for (const item of items) {
            if (item.name.startsWith('.') || item.name === 'node_modules' || item.name === 'uploads' || item.name === 'dist') continue;
            const fullPath = path.join(dir, item.name);

            if (item.isDirectory()) {
                const subDomain = domainName === 'General' ? item.name : domainName;
                const subNiche = domainName === 'General' ? 'Vault' : item.name;
                walkDir(fullPath, subDomain, subNiche);
            } else if (item.isFile()) {
                const ext = path.extname(item.name).toLowerCase();
                if (['.md', '.txt'].includes(ext)) {
                    if (!seenPaths.has(fullPath.toLowerCase())) {
                        seenPaths.add(fullPath.toLowerCase());
                        try {
                            const content = fs.readFileSync(fullPath, 'utf8');
                            const stat = fs.statSync(fullPath);
                            
                            const firstHeaderMatch = content.match(/^#\s+(.+)$/m);
                            const title = firstHeaderMatch ? firstHeaderMatch[1].trim() : item.name.replace(/\.(md|txt)$/i, '');

                            docList.push({
                                filename: item.name,
                                title: title,
                                domain: domainName,
                                niche: defaultNiche,
                                path: fullPath,
                                relativePath: path.relative(WORKSPACE_ROOT, fullPath),
                                content: content,
                                size: stat.size,
                                modified: stat.mtime
                            });
                        } catch (e) {}
                    }
                }
            }
        }
    }

    walkDir(DOCS_PATH);
    walkDir(path.join(WORKSPACE_ROOT, 'MCNC', 'vault'), 'Vault Core', 'System');
    walkDir(path.join(WORKSPACE_ROOT, 'WASP Documents'), 'WASP Doctrine', 'Doctrine');
    walkDir(path.join(WORKSPACE_ROOT, 'WASP Artwork'), 'Artwork', 'Palettes');

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
        const { filename, title, domain, niche, content, specialization, pruneAndMerge } = req.body;
        if (!content || !content.trim()) return res.status(400).json({ error: 'Content payload is empty.' });

        const safeDomain = (domain || 'General').replace(/[\\\/:\*\?"<>\|]/g, '_').trim();
        const safeNiche = (niche || specialization || 'General').replace(/\s+/g, '_').replace(/[\\\/:\*\?"<>\|]/g, '_').trim();
        
        let targetFilename = filename;
        if (!targetFilename) {
            targetFilename = `${safeNiche}.md`;
        }
        if (!targetFilename.endsWith('.md') && !targetFilename.endsWith('.txt')) {
            targetFilename += '.md';
        }

        const targetDir = path.join(DOCS_PATH, safeDomain);
        if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });

        const filePath = path.join(targetDir, targetFilename);

        let finalPayload = content.trim();
        if (fs.existsSync(filePath) && pruneAndMerge) {
            const existingContent = fs.readFileSync(filePath, 'utf8');
            finalPayload = `${existingContent}\n\n---\n\n## [APPENDED UPDATE // ${new Date().toISOString()}]\n\n${finalPayload}`;
        }

        fs.writeFileSync(filePath, finalPayload, 'utf8');
        logTelemetry('DOCS_SAVED', `Synthesized canonical dossier to vault/Docs/${safeDomain}/${targetFilename}`);
        broadcast('TRACE', `[VAULT WRITE] Synthesized: vault/Docs/${safeDomain}/${targetFilename}`);

        res.json({ 
            success: true, 
            message: `Successfully synthesized to vault/Docs/${safeDomain}/${targetFilename}`, 
            filePath, 
            filename: targetFilename 
        });
    } catch (err) { 
        res.status(500).json({ error: err.message }); 
    }
});

// ==========================================
// CHAT & HEALTH
// ==========================================
app.post('/api/chat', async (req, res) => {
    try {
        const montySoul = loadSoul('monty');
        const liveTelemetry = getLiveSystemSnapshot();
        const systemPrompt = liveTelemetry + "\n\n" + CORE_DIRECTIVE + (montySoul ? `\n\n=== PROTOCOL ===\n${montySoul}` : "");
        const { reply, modelUsed } = await dispatchToBrain(systemPrompt, req.body);
        broadcast('CHAT_COMPLETE', { reply, activeModelUsed: modelUsed });
        res.json({ status: 'SUCCESS', reply, activeModelUsed: modelUsed });
    } catch (err) { res.status(500).json({ status: 'ERROR', reply: err.message }); }
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
    console.log(`[AGENT FS TOOLS]         : /api/tools/{read,write,list,search,stat}`);
    console.log(`[DYNAMIC TUNNEL ENGINE]  : /api/tunnel/{get,set} & /api/kaggle/* ONLINE`);
    console.log(`[HANDSHAKE HEARTBEAT]    : 2000ms AbortController Active`);
    console.log(`[REFINERY ENGINE]        : /api/harvest & /api/docs/save ONLINE`);
    console.log(`[CLUSTER MANAGERS]       : NIM, GROQ, GEMINI ONLINE`);
    console.log(`[ACTIVE KAGGLE TUNNEL]   : ${process.env.KAGGLE_TUNNEL_URL || 'NOT SET'}`);
    console.log(`[STATUS]                 : 100% OPERATIONAL // CLEAN`);
    console.log(`====================================================`);
});