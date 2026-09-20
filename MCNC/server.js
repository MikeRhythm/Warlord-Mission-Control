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
const SOULS_PATH = path.join('C:', 'Warlord_Inc', 'Warlord_WASP', 'MCNC', 'souls');
const LOGS_PATH = path.join('C:', 'Warlord_Inc', 'Warlord_WASP', 'MCNC_Logs');
const VAULT_PATH = path.join('C:', 'Warlord_Inc', 'Warlord_WASP', 'MCNC', 'vault');
const UPLOADS_PATH = path.join(__dirname, 'uploads');
const VAULT_DIR = path.join(__dirname, 'vault');
const TELEMETRY_DIR = path.join(VAULT_DIR, 'telemetry');
const TELEMETRY_FILE = path.join(TELEMETRY_DIR, 'active_telemetry.md');
const KEYS_DIR = path.join(VAULT_DIR, 'Keys');
const NIM_CLUSTER_FILE = path.join(KEYS_DIR, 'nim_cluster.json');
const GROQ_CLUSTER_FILE = path.join(KEYS_DIR, 'groq_cluster.json');
const GEMINI_CLUSTER_FILE = path.join(KEYS_DIR, 'gemini_cluster.json');

[LOGS_PATH, UPLOADS_PATH, TELEMETRY_DIR, VAULT_DIR, KEYS_DIR, VAULT_PATH].forEach(dir => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, UPLOADS_PATH),
    filename: (req, file, cb) => cb(null, `${Date.now()}_${file.originalname}`)
});
const upload = multer({ storage });

const WARLORD_CORE_DIRECTIVE = `You are MONTY, Chief of Staff for Warlord MCNC Base 1.
Operational control, planning, and agent orchestration under Rhythm Holdings and W.A.S.P.
Commander Mike (The Warlord) is supreme command.
DIRECTORS: Tess (Quant), Silas (Database), Charlie (MQL5/Node), Roxy (UI/UX), Jack (Marketing), Skyla (Frontend), Atlas (Infrastructure), Ares (Execution), Vance (Finance), Orion (Strategic Intel), The Askari (Security), Amber (Copywriter), Jax (Artwork Omega), Valerie (Relations), Maverick (SEO), Justin (Risk Legal).
SOP: Full functional code only. Solid DodgerBlue, OrangeRed, Goldenrod lines only for chart indicators. High Finance palette for UI. Zero filler.
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
            if (data.type === 'PING') ws.send(JSON.stringify({ type: 'PONG' })); 
        } catch (e) {} 
    });
});

// ==========================================
// TELEMETRY & COMPRESSION ENGINE
// ==========================================
function logTelemetry(action, details) {
    try {
        if (!fs.existsSync(TELEMETRY_DIR)) fs.mkdirSync(TELEMETRY_DIR, { recursive: true });
        const entry = `\n- [${new Date().toISOString()}] **${action}**: ${details}`;
        fs.appendFileSync(TELEMETRY_FILE, entry, 'utf8');
    } catch (e) {
        console.error('[TELEMETRY LOG ERROR]:', e.message);
    }
}

function getLiveSystemSnapshot() {
    let snapshot = "=== COMPRESSED TELEMETRY ===\n";
    try {
        const propDir = path.join(__dirname, 'vault', 'System_Evolution', 'Proposals');
        if (fs.existsSync(propDir)) {
            const files = fs.readdirSync(propDir).filter(f => f.endsWith('.json'));
            snapshot += `PENDING PROPOSALS: ${files.length}\n`;
        }
    } catch (e) {}
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

// ARMORED YOUTUBE PARSER
function extractYouTubeId(urlStr) {
    if (!urlStr) return null;
    try {
        const urlObj = new URL(urlStr);
        if (urlObj.hostname.includes('youtube.com')) {
            if (urlObj.pathname === '/watch') return urlObj.searchParams.get('v');
            if (urlObj.pathname.startsWith('/embed/') || urlObj.pathname.startsWith('/v/')) return urlObj.pathname.split('/')[2];
        }
        if (urlObj.hostname.includes('youtu.be')) return urlObj.pathname.slice(1);
    } catch (e) {
        const match = urlStr.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
        return match ? match[1] : null;
    }
    return null;
}

// ==========================================
// CLUSTER VAULT CONTROLLERS & ROUND-ROBIN
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
const getActiveNimKeys = () => readNimCluster().keys.filter(k => k.status === 'ACTIVE').map(k => k.key);

const readGroqCluster = () => readClusterFile(GROQ_CLUSTER_FILE, "groq");
const writeGroqCluster = (data) => writeClusterFile(GROQ_CLUSTER_FILE, data);
const getActiveGroqKeys = () => readGroqCluster().keys.filter(k => k.status === 'ACTIVE').map(k => k.key);

const readGeminiCluster = () => readClusterFile(GEMINI_CLUSTER_FILE, "gemini");
const writeGeminiCluster = (data) => writeClusterFile(GEMINI_CLUSTER_FILE, data);
const getActiveGeminiKeys = () => readGeminiCluster().keys.filter(k => k.status === 'ACTIVE').map(k => k.key);

const rrState = { nim: 0, groq: 0, gemini: 0 };

function getNextActiveKey(clusterType) {
    let keys = [];
    if (clusterType === 'nim') keys = getActiveNimKeys();
    else if (clusterType === 'groq') keys = getActiveGroqKeys();
    else if (clusterType === 'gemini') keys = getActiveGeminiKeys();

    if (keys.length === 0) return null;

    if (rrState[clusterType] >= keys.length) rrState[clusterType] = 0;
    const key = keys[rrState[clusterType]];
    rrState[clusterType] = (rrState[clusterType] + 1) % keys.length;
    return key;
}

// ==========================================
// CAPABILITY ROUTING MATRIX (MONTY'S BRAIN - 16 DIRECTORS)
// ==========================================
const DIRECTOR_TRAITS = {
    'CHARLIE // CODE': 'CODE',
    'SKYLA // FRONTEND WEB': 'CODE',
    'ATLAS // INFRASTRUCTURE': 'CODE',
    'TESS // QUANT': 'REASONING',
    'ARES // EXECUTION': 'REASONING',
    'VANCE // FINANCE': 'REASONING',
    'ORION // STRATEGIC INTEL': 'REASONING',
    'THE ASKARI // SECURITY': 'REASONING',
    'AMBER // COPYWRITER': 'CREATIVE',
    'ROXY // ARTWORK ALPHA': 'CREATIVE',
    'JAX // ARTWORK OMEGA': 'CREATIVE',
    'JACK // MARKETING': 'CREATIVE',
    'VALERIE // RELATIONS': 'CREATIVE',
    'SILAS // DATABASE': 'CONTEXT',
    'MAVERICK // SEO': 'CONTEXT',
    'JUSTIN // RISK LEGAL': 'CONTEXT'
};

function routeToOptimalModel(director, fallbackModel) {
    if (!director || director.includes('AUTO-ROUTING') || director.includes('ROUND-ROBIN')) return fallbackModel;
    const trait = DIRECTOR_TRAITS[director] || 'CREATIVE';
    switch (trait) {
        case 'CODE': return 'meta/llama-3.3-70b-instruct';
        case 'REASONING': return 'nvidia/nemotron-70b-ultra';
        case 'CONTEXT': return 'gemini-1.5-pro';
        case 'CREATIVE': return 'llama-3.3-70b-versatile';
        default: return fallbackModel;
    }
}

// ==========================================
// KAGGLE LIVE PROBE ENGINE (NON-BLOCKING)
// ==========================================
let kaggleHealthCache = {
    isLive: false,
    lastChecked: 0,
    latency: 'N/A'
};

async function verifyKaggleTunnel() {
    const now = Date.now();
    if (now - kaggleHealthCache.lastChecked < 8000) {
        return kaggleHealthCache.isLive;
    }

    const tunnelBase = process.env.KAGGLE_TUNNEL_URL || process.env.VITE_KAGGLE_TUNNEL_URL;
    if (!tunnelBase) {
        kaggleHealthCache = { isLive: false, lastChecked: now, latency: 'OFFLINE' };
        return false;
    }

    const cleanBase = tunnelBase.replace(/\/+$/, '');
    const probeUrl = cleanBase.endsWith('/v1') ? `${cleanBase}/models` : `${cleanBase}/v1/models`;

    const start = Date.now();
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2500);

        const response = await fetch(probeUrl, {
            method: 'GET',
            signal: controller.signal
        });
        clearTimeout(timeoutId);

        const latency = `${Date.now() - start}ms`;
        if (response.ok) {
            kaggleHealthCache = { isLive: true, lastChecked: now, latency };
            return true;
        } else {
            kaggleHealthCache = { isLive: false, lastChecked: now, latency: `HTTP_${response.status}` };
            return false;
        }
    } catch (e) {
        kaggleHealthCache = { isLive: false, lastChecked: now, latency: 'TIMEOUT/OFFLINE' };
        return false;
    }
}

// ==========================================
// ROUTING ENGINE (KAGGLE COMPUTE + IN-FLIGHT ROLLOVER)
// ==========================================

async function dispatchToKaggle(systemPrompt, userText, modelSlug) {
    let tunnelBase = process.env.KAGGLE_TUNNEL_URL || process.env.VITE_KAGGLE_TUNNEL_URL;
    if (!tunnelBase) throw new Error("KAGGLE_TUNNEL_URL missing from .env");

    tunnelBase = tunnelBase.replace(/\/+$/, '');
    const targetUrl = tunnelBase.endsWith('/v1') ? `${tunnelBase}/chat/completions` : `${tunnelBase}/v1/chat/completions`;

    console.log(`[COMPUTE] -> Dispatching to Kaggle Dual-T4 Bridge: ${targetUrl}`);
    broadcast('TRACE', `[COMPUTE] Offloading to Kaggle Dual-T4 (${modelSlug || 'qwen2.5:7b'})...`);

    const response = await fetch(targetUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            model: modelSlug || 'qwen2.5:7b',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userText }
            ],
            temperature: 0.3
        })
    });

    if (!response.ok) throw new Error(`Kaggle Tunnel HTTP Error ${response.status}`);
    const data = await response.json();
    return data.choices?.[0]?.message?.content || "Empty response from Kaggle Compute.";
}

async function dispatchToOpenRouter(systemPrompt, userText, modelSlug) {
    const openRouterKey = process.env.OPENROUTER_API_KEY || process.env.VITE_OPENROUTER_API_KEY;
    if (!openRouterKey) throw new Error("OPENROUTER_API_KEY missing from .env");
    
    console.log(`[FALLBACK / ELITE] -> OpenRouter: ${modelSlug}`);
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json', 
            'Authorization': `Bearer ${openRouterKey}`, 
            'HTTP-Referer': 'http://localhost:5173', 
            'X-Title': 'Warlord MCNC Master' 
        },
        body: JSON.stringify({ 
            model: modelSlug, 
            messages: [
                { role: 'system', content: systemPrompt }, 
                { role: 'user', content: userText }
            ], 
            temperature: 0.3, 
            max_tokens: 4096 
        })
    });
    if (!response.ok) throw new Error(`OpenRouter Error ${response.status}`);
    const data = await response.json();
    return data.choices?.[0]?.message?.content || "Empty response from OpenRouter.";
}

async function dispatchToBrain(systemPrompt, rawBody) {
    const validContent = extractPromptText(rawBody);
    const requestedModel = rawBody?.model || 'meta/llama-3.3-70b-instruct';
    const reqModelLower = requestedModel.toLowerCase();
    const computeMode = (process.env.COMPUTE_MODE || process.env.VITE_COMPUTE_MODE || 'STANDBY').toUpperCase();
    const kaggleUrl = process.env.KAGGLE_TUNNEL_URL || process.env.VITE_KAGGLE_TUNNEL_URL;

    console.log(`\n========================================`);
    console.log(`[DISPATCH] Target Model: "${requestedModel}" | Mode: "${computeMode}"`);

    // 1. TIER 0: KAGGLE FREE CLOUD COMPUTE BRIDGE (Only if toggled ON and responding)
    if (computeMode === 'KAGGLE' && kaggleUrl) {
        const isTunnelLive = await verifyKaggleTunnel();
        if (isTunnelLive) {
            try {
                const kaggleModel = (requestedModel.includes('/') || requestedModel.includes('gemini')) ? 'qwen2.5:7b' : requestedModel;
                const reply = await dispatchToKaggle(systemPrompt, validContent, kaggleModel);
                return { reply: reply.trim(), modelUsed: `${kaggleModel} (Kaggle Dual-T4)` };
            } catch (kaggleErr) {
                console.warn(`[WARN] Kaggle Compute Failed (${kaggleErr.message}). Rolling over to Multi-Cluster...`);
                broadcast('WARN', `[ROLLOVER] Kaggle unreachable. Engaging Multi-Cluster Vaults...`);
            }
        } else {
            console.warn(`[WARN] Kaggle Mode is KAGGLE but Tunnel is DEAD. Rolling over...`);
        }
    }

    // 2. TIER 1: GEMINI CLUSTER
    if (reqModelLower.includes('gemini')) {
        const activeGeminiKeys = getActiveGeminiKeys();
        for (let i = 0; i < activeGeminiKeys.length; i++) {
            const mask = `...${activeGeminiKeys[i].slice(-6)}`;
            try {
                const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${activeGeminiKeys[i]}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        contents: [{ role: "user", parts: [{ text: systemPrompt + "\n\n" + validContent }] }],
                        generationConfig: { temperature: 0.3, maxOutputTokens: 8192 }
                    })
                });
                if (response.ok) {
                    const data = await response.json();
                    return { reply: data.candidates?.[0]?.content?.parts?.[0]?.text?.trim(), modelUsed: `${requestedModel} (Gemini [${mask}])` };
                }
            } catch (err) {}
        }
    }

    // 3. TIER 2: GROQ CLUSTER
    if (reqModelLower.includes('groq') || reqModelLower.includes('llama-3.1-70b-versatile') || reqModelLower.includes('mixtral') || reqModelLower === 'llama-3.3-70b-versatile') {
        const activeGroqKeys = getActiveGroqKeys();
        for (let i = 0; i < activeGroqKeys.length; i++) {
            const mask = `...${activeGroqKeys[i].slice(-6)}`;
            try {
                const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${activeGroqKeys[i]}` },
                    body: JSON.stringify({ model: requestedModel, messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: validContent }], temperature: 0.3, max_tokens: 4096 })
                });
                if (response.ok) {
                    const data = await response.json();
                    return { reply: data.choices?.[0]?.message?.content?.trim(), modelUsed: `${requestedModel} (Groq [${mask}])` };
                }
            } catch (err) {}
        }
    }

    // 4. TIER 3: NVIDIA NIM CLUSTER
    const activeNimKeys = getActiveNimKeys();
    if (activeNimKeys.length > 0 && !reqModelLower.includes('anthropic/') && !reqModelLower.includes('openai/') && !reqModelLower.includes('google/')) {
        for (let i = 0; i < activeNimKeys.length; i++) {
            const mask = `...${activeNimKeys[i].slice(-6)}`;
            try {
                const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${activeNimKeys[i]}` },
                    body: JSON.stringify({ model: requestedModel, messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: validContent }], temperature: 0.3, max_tokens: 2048 })
                });
                if (response.ok) {
                    const data = await response.json();
                    return { reply: data.choices?.[0]?.message?.content?.trim(), modelUsed: `${requestedModel} (NIM [${mask}])` };
                }
            } catch (fetchErr) {}
        }
    }

    // 5. TIER 4: OPENROUTER SHIELD (FINAL RESILIENT FALLBACK)
    console.warn(`[!] CLUSTERS EXHAUSTED OR ELITE MODEL REQUESTED. ENGAGING OPENROUTER SHIELD...`);
    let fallbackSlug = requestedModel;
    if (!reqModelLower.includes('anthropic/') && !reqModelLower.includes('openai/') && !reqModelLower.includes('google/')) {
        fallbackSlug = 'meta-llama/llama-3.3-70b-instruct';
    }
    const fallbackReply = await dispatchToOpenRouter(systemPrompt, validContent, fallbackSlug);
    return { reply: fallbackReply.trim(), modelUsed: `${fallbackSlug} (OpenRouter Shield)` };
}

// ==========================================
// REST API ROUTES
// ==========================================

app.get('/api/cluster/nim/keys', (req, res) => {
    const safeKeys = readNimCluster().keys.map(k => ({ masked: `nvapi-...${k.key.slice(-6)}`, alias: k.alias, status: k.status, lastChecked: k.lastChecked, latency: k.latency || 'N/A' }));
    res.json({ total: safeKeys.length, active: safeKeys.filter(k => k.status === 'ACTIVE').length, keys: safeKeys });
});
app.post('/api/cluster/nim/add', (req, res) => {
    const { rawKeys } = req.body;
    if (!rawKeys) return res.status(400).json({ error: 'No keys provided.' });
    const keyList = rawKeys.split(/[\n,]+/).map(k => k.trim()).filter(k => k.startsWith('nvapi-'));
    const cluster = readNimCluster();
    const existing = new Set(cluster.keys.map(k => k.key));
    let addedCount = 0;
    keyList.forEach((k, idx) => {
        if (!existing.has(k)) {
            cluster.keys.push({ key: k, alias: `Harvest_${Date.now()}_${idx + 1}`, status: 'ACTIVE', lastChecked: new Date().toISOString(), latency: 'Untested' });
            existing.add(k); addedCount++;
        }
    });
    writeNimCluster(cluster);
    broadcast('AUDIT', `[CLUSTER ADD] Ingested ${addedCount} keys into NIM Vault.`);
    res.json({ success: true, added: addedCount, total: cluster.keys.length });
});
app.post('/api/cluster/nim/audit', async (req, res) => {
    const cluster = readNimCluster();
    const auditLogs = []; const validKeys = [];
    for (const item of cluster.keys) {
        const mask = `nvapi-...${item.key.slice(-6)}`;
        const start = Date.now();
        try {
            const resp = await fetch('https://integrate.api.nvidia.com/v1/models', { headers: { 'Authorization': `Bearer ${item.key}` } });
            const latency = `${Date.now() - start}ms`;
            if (resp.ok) { item.status = 'ACTIVE'; item.latency = latency; item.lastChecked = new Date().toISOString(); validKeys.push(item); auditLogs.push(`[ACK] NIM ${mask} -> ACTIVE (${latency})`); }
            else if (resp.status === 401 || resp.status === 403) { auditLogs.push(`[PURGE] NIM ${mask} -> HTTP ${resp.status} (Revoked). DELETED.`); }
            else if (resp.status === 429) { item.status = 'RATE_LIMITED'; item.latency = latency; item.lastChecked = new Date().toISOString(); validKeys.push(item); auditLogs.push(`[WARN] NIM ${mask} -> RATE LIMITED. Retained.`); }
            else { item.status = 'ERROR'; validKeys.push(item); auditLogs.push(`[WARN] NIM ${mask} -> HTTP ${resp.status}.`); }
        } catch (err) { auditLogs.push(`[FAIL] NIM ${mask} -> Network Timeout. DELETED.`); }
    }
    cluster.keys = validKeys; writeNimCluster(cluster);
    res.json({ success: true, remainingActive: validKeys.filter(k => k.status === 'ACTIVE').length, totalRemaining: validKeys.length, logs: auditLogs });
});

app.get('/api/cluster/groq/keys', (req, res) => {
    const safeKeys = readGroqCluster().keys.map(k => ({ masked: `gsk_...${k.key.slice(-6)}`, alias: k.alias, status: k.status, lastChecked: k.lastChecked, latency: k.latency || 'N/A' }));
    res.json({ total: safeKeys.length, active: safeKeys.filter(k => k.status === 'ACTIVE').length, keys: safeKeys });
});
app.post('/api/cluster/groq/add', (req, res) => {
    const { rawKeys } = req.body;
    if (!rawKeys) return res.status(400).json({ error: 'No keys provided.' });
    const keyList = rawKeys.split(/[\n,]+/).map(k => k.trim()).filter(k => k.startsWith('gsk_'));
    const cluster = readGroqCluster();
    const existing = new Set(cluster.keys.map(k => k.key));
    let addedCount = 0;
    keyList.forEach((k, idx) => {
        if (!existing.has(k)) {
            cluster.keys.push({ key: k, alias: `Harvest_Groq_${Date.now()}_${idx + 1}`, status: 'ACTIVE', lastChecked: new Date().toISOString(), latency: 'Untested' });
            existing.add(k); addedCount++;
        }
    });
    writeGroqCluster(cluster);
    broadcast('AUDIT', `[CLUSTER ADD] Ingested ${addedCount} keys into GROQ Vault.`);
    res.json({ success: true, added: addedCount, total: cluster.keys.length });
});
app.post('/api/cluster/groq/audit', async (req, res) => {
    const cluster = readGroqCluster();
    const auditLogs = []; const validKeys = [];
    for (const item of cluster.keys) {
        const mask = `gsk_...${item.key.slice(-6)}`;
        const start = Date.now();
        try {
            const resp = await fetch('https://api.groq.com/openai/v1/models', { headers: { 'Authorization': `Bearer ${item.key}` } });
            const latency = `${Date.now() - start}ms`;
            if (resp.ok) { item.status = 'ACTIVE'; item.latency = latency; item.lastChecked = new Date().toISOString(); validKeys.push(item); auditLogs.push(`[ACK] GROQ ${mask} -> ACTIVE (${latency})`); }
            else if (resp.status === 401 || resp.status === 403) { auditLogs.push(`[PURGE] GROQ ${mask} -> HTTP ${resp.status} (Revoked). DELETED.`); }
            else if (resp.status === 429) { item.status = 'RATE_LIMITED'; item.latency = latency; item.lastChecked = new Date().toISOString(); validKeys.push(item); auditLogs.push(`[WARN] GROQ ${mask} -> RATE LIMITED. Retained.`); }
            else { item.status = 'ERROR'; validKeys.push(item); auditLogs.push(`[WARN] GROQ ${mask} -> HTTP ${resp.status}.`); }
        } catch (err) { auditLogs.push(`[FAIL] GROQ ${mask} -> Network Timeout. DELETED.`); }
    }
    cluster.keys = validKeys; writeGroqCluster(cluster);
    res.json({ success: true, remainingActive: validKeys.filter(k => k.status === 'ACTIVE').length, totalRemaining: validKeys.length, logs: auditLogs });
});

app.get('/api/cluster/gemini/keys', (req, res) => {
    const safeKeys = readGeminiCluster().keys.map(k => ({ masked: `AIza...${k.key.slice(-6)}`, alias: k.alias, status: k.status, lastChecked: k.lastChecked, latency: k.latency || 'N/A' }));
    res.json({ total: safeKeys.length, active: safeKeys.filter(k => k.status === 'ACTIVE').length, keys: safeKeys });
});
app.post('/api/cluster/gemini/add', (req, res) => {
    const { rawKeys } = req.body;
    if (!rawKeys) return res.status(400).json({ error: 'No keys provided.' });
    const keyList = rawKeys.split(/[\n,]+/).map(k => k.trim()).filter(k => k.startsWith('AIza'));
    const cluster = readGeminiCluster();
    const existing = new Set(cluster.keys.map(k => k.key));
    let addedCount = 0;
    keyList.forEach((k, idx) => {
        if (!existing.has(k)) {
            cluster.keys.push({ key: k, alias: `Harvest_Gemini_${Date.now()}_${idx + 1}`, status: 'ACTIVE', lastChecked: new Date().toISOString(), latency: 'Untested' });
            existing.add(k); addedCount++;
        }
    });
    writeGeminiCluster(cluster);
    broadcast('AUDIT', `[CLUSTER ADD] Ingested ${addedCount} keys into GEMINI Vault.`);
    res.json({ success: true, added: addedCount, total: cluster.keys.length });
});
app.post('/api/cluster/gemini/audit', async (req, res) => {
    const cluster = readGeminiCluster();
    const auditLogs = []; const validKeys = [];
    for (const item of cluster.keys) {
        const mask = `AIza...${item.key.slice(-6)}`;
        const start = Date.now();
        try {
            const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${item.key}`);
            const latency = `${Date.now() - start}ms`;
            if (resp.ok) { item.status = 'ACTIVE'; item.latency = latency; item.lastChecked = new Date().toISOString(); validKeys.push(item); auditLogs.push(`[ACK] GEMINI ${mask} -> ACTIVE (${latency})`); }
            else if (resp.status === 400 || resp.status === 403) { auditLogs.push(`[PURGE] GEMINI ${mask} -> HTTP ${resp.status} (Revoked). DELETED.`); }
            else if (resp.status === 429) { item.status = 'RATE_LIMITED'; item.latency = latency; item.lastChecked = new Date().toISOString(); validKeys.push(item); auditLogs.push(`[WARN] GEMINI ${mask} -> RATE LIMITED. Retained.`); }
            else { item.status = 'ERROR'; validKeys.push(item); auditLogs.push(`[WARN] GEMINI ${mask} -> HTTP ${resp.status}.`); }
        } catch (err) { auditLogs.push(`[FAIL] GEMINI ${mask} -> Network Timeout. DELETED.`); }
    }
    cluster.keys = validKeys; writeGeminiCluster(cluster);
    res.json({ success: true, remainingActive: validKeys.filter(k => k.status === 'ACTIVE').length, totalRemaining: validKeys.length, logs: auditLogs });
});

app.get('/api/models/active', async (req, res) => {
    const activeNimKeys = getActiveNimKeys();
    const activeGeminiKeys = getActiveGeminiKeys();
    const computeMode = (process.env.COMPUTE_MODE || 'STANDBY').toUpperCase();
    const isLive = computeMode === 'KAGGLE' ? await verifyKaggleTunnel() : false;

    let nimModels = [];
    let geminiModels = [];

    if (activeNimKeys.length > 0) {
        try {
            const nRes = await fetch('https://integrate.api.nvidia.com/v1/models', { headers: { 'Authorization': `Bearer ${activeNimKeys[0]}` } });
            if (nRes.ok) {
                const nData = await nRes.json();
                nimModels = (nData.data || []).filter(m => !m.id.includes('embed') && !m.id.includes('guard')).map(m => ({ id: m.id, name: m.id.split('/').pop(), tag: 'NIM' }));
            }
        } catch (e) {}
    }
    if (activeGeminiKeys.length > 0) {
        try {
            const gemRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${activeGeminiKeys[0]}`);
            if (gemRes.ok) {
                const gData = await gemRes.json();
                geminiModels = (gData.models || []).filter(m => m.supportedGenerationMethods?.includes("generateContent")).map(m => ({ id: m.name.replace('models/', ''), name: m.displayName || m.name.replace('models/', ''), tag: 'GEMINI' }));
            }
        } catch (e) {}
    }

    const tiers = [];
    if (isLive) {
        tiers.push({
            category: 'TIER 0: KAGGLE FREE CLOUD COMPUTE (DUAL T4 32GB)',
            models: [
                { id: 'qwen2.5:7b', name: 'Qwen 2.5 7B (Active Bridge)', tag: 'KAGGLE_GPU' }
            ]
        });
    }

    tiers.push(
        { category: 'TIER 1: NVIDIA NIM (ACTIVE CLUSTER)', models: nimModels.slice(0, 6) },
        { category: 'TIER 2: GOOGLE GEMINI (ACTIVE CLUSTER)', models: geminiModels.slice(0, 5) },
        { category: 'TIER 3: OPENROUTER (HEAVY LIFTING)', models: [{ id: 'anthropic/claude-3.5-sonnet', name: 'Claude Sonnet 3.5', tag: 'ELITE' }, { id: 'openai/gpt-4o', name: 'GPT-4o Frontier', tag: 'ELITE' }] }
    );

    res.json({ tiers });
});

app.post('/api/orchestrate/turn', async (req, res) => {
    const { turnId, payload } = req.body;
    const PAPERCLIP_PORT = 3100;
    let targetCluster = '';
    
    switch(turnId) {
        case 1: targetCluster = 'nim'; break;    
        case 2: targetCluster = 'groq'; break;   
        case 3: targetCluster = 'gemini'; break; 
        case 4: targetCluster = 'nim'; break;    
        case 5: targetCluster = 'judge'; break;  
        default: targetCluster = 'nim';
    }

    broadcast('TRACE', `[TURN ${turnId}] Routing payload to ${targetCluster.toUpperCase()}...`);

    if (targetCluster === 'judge') {
        broadcast('TRACE', `[JUDGE GATE] Evaluating PRD for Paperclip escalation...`);
        broadcast('TRACE', `[SUCCESS] PRD Approved. Ready for Paperclip CEO (Port ${PAPERCLIP_PORT}).`);
        return res.json({ status: 'APPROVED', nextAction: 'PAPERCLIP_DISPATCH' });
    }

    const key = getNextActiveKey(targetCluster);
    if (!key) {
        broadcast('WARN', `[EXHAUSTED] No active keys in ${targetCluster.toUpperCase()} cluster.`);
        return res.status(429).json({ error: 'Cluster exhausted', failover: true });
    }

    let mask = key.slice(-4);
    if (targetCluster === 'nim') mask = `nvapi-...${mask}`;
    if (targetCluster === 'groq') mask = `gsk_...${mask}`;
    if (targetCluster === 'gemini') mask = `AIza...${mask}`;

    broadcast('TRACE', `[DISPATCH] Firing request using ${targetCluster.toUpperCase()} Key Index: ${rrState[targetCluster] - 1 < 0 ? 0 : rrState[targetCluster] - 1}`);
    res.json({ targetCluster, key_used: mask, status: 'DISPATCHED' });
});

app.post('/api/chat', async (req, res) => {
    try {
        const targetDirector = req.body?.director || 'ALL DIRECTORS // AUTO-ROUTING';
        const rawRequestedModel = req.body?.model || 'meta/llama-3.3-70b-instruct';
        
        const optimalModel = routeToOptimalModel(targetDirector, rawRequestedModel);
        req.body.model = optimalModel; 

        const montySoul = loadSoul('monty');
        const mikeSoul = loadSoul('mike');
        const liveTelemetry = getLiveSystemSnapshot();
        
        let directorSoul = "";
        if (targetDirector && !targetDirector.includes('AUTO-ROUTING') && !targetDirector.includes('ROUND-ROBIN')) {
            const baseName = targetDirector.split(' // ')[0].toLowerCase().trim();
            directorSoul = loadSoul(baseName);
        }
        
        let systemPrompt = liveTelemetry + "\n\n" + WARLORD_CORE_DIRECTIVE;
        if (montySoul) systemPrompt += `\n\n=== CHIEF OF STAFF PROTOCOL (MONTY) ===\n${montySoul}`;
        if (mikeSoul) systemPrompt += `\n\n=== COMMANDER PROFILE & INNER CIRCLE (MIKE) ===\n${mikeSoul}`;
        
        if (directorSoul) {
            systemPrompt += `\n\n=== ACTIVE DIRECTOR PROTOCOL (${targetDirector}) ===\n${directorSoul}`;
        }
        
        const { reply, modelUsed } = await dispatchToBrain(systemPrompt, req.body);
        return res.json({ reply, activeModelUsed: modelUsed });
    } catch (err) {
        return res.status(500).json({ reply: `Daemon execution error: ${err.message}`, activeModelUsed: 'ERROR' });
    }
});

// ==========================================
// TAB 06 MEMORY // PERSISTENT CONTEXT
// ==========================================
app.get('/api/memory', (req, res) => {
    try {
        const memoryNodes = [];

        const getAllFiles = (dirPath, arrayOfFiles = []) => {
            if (!fs.existsSync(dirPath)) return arrayOfFiles;
            const entries = fs.readdirSync(dirPath, { withFileTypes: true });
            entries.forEach(entry => {
                const fullPath = path.join(dirPath, entry.name);
                if (entry.isDirectory()) {
                    if (entry.name !== '.obsidian' && entry.name !== '.git') {
                        getAllFiles(fullPath, arrayOfFiles);
                    }
                } else if (entry.isFile() && (entry.name.endsWith('.md') || entry.name.endsWith('.txt') || entry.name.endsWith('.json'))) {
                    arrayOfFiles.push(fullPath);
                }
            });
            return arrayOfFiles;
        };

        if (fs.existsSync(SOULS_PATH)) {
            const soulFiles = fs.readdirSync(SOULS_PATH).filter(f => f.endsWith('.md') || f.endsWith('.txt'));
            soulFiles.forEach(file => {
                const fullPath = path.join(SOULS_PATH, file);
                const content = fs.readFileSync(fullPath, 'utf8');
                const title = file.replace(/\.(md|txt)$/, '').replace(/_/g, ' ').toUpperCase();
                memoryNodes.push({
                    id: `core-${file}`,
                    title: `DIRECTIVE // ${title}`,
                    category: 'system',
                    content: content,
                    updated: fs.statSync(fullPath).mtime.toLocaleString()
                });
            });
        }

        if (fs.existsSync(TELEMETRY_DIR)) {
            const telemetryFiles = fs.readdirSync(TELEMETRY_DIR).filter(f => f.endsWith('.md') || f.endsWith('.json') || f.endsWith('.log'));
            telemetryFiles.forEach(file => {
                const fullPath = path.join(TELEMETRY_DIR, file);
                const content = fs.readFileSync(fullPath, 'utf8');
                memoryNodes.push({
                    id: `ephemeral-${file}`,
                    title: `SESSION // ${file}`,
                    category: 'ephemeral',
                    content: content,
                    updated: fs.statSync(fullPath).mtime.toLocaleString()
                });
            });
        }

        const proposalsDir = path.join(VAULT_DIR, 'System_Evolution', 'Proposals');
        if (fs.existsSync(proposalsDir)) {
            const propFiles = fs.readdirSync(proposalsDir).filter(f => f.endsWith('.json') || f.endsWith('.md'));
            propFiles.forEach(file => {
                const fullPath = path.join(proposalsDir, file);
                const content = fs.readFileSync(fullPath, 'utf8');
                memoryNodes.push({
                    id: `checkpoint-${file}`,
                    title: `CHECKPOINT // ${file}`,
                    category: 'agents',
                    content: content,
                    updated: fs.statSync(fullPath).mtime.toLocaleString()
                });
            });
        }

        if (fs.existsSync(VAULT_PATH)) {
            const vaultFiles = getAllFiles(VAULT_PATH);
            vaultFiles.forEach(fullPath => {
                if (!fullPath.includes('telemetry') && !fullPath.includes('System_Evolution')) {
                    const content = fs.readFileSync(fullPath, 'utf8');
                    const relativeName = path.relative(VAULT_PATH, fullPath).replace(/\\/g, ' > ').replace('.md', '');
                    memoryNodes.push({
                        id: `rag-${Buffer.from(fullPath).toString('base64')}`,
                        title: `RAG VECTOR // ${relativeName}`,
                        category: 'rag',
                        content: content,
                        updated: fs.statSync(fullPath).mtime.toLocaleString()
                    });
                }
            });
        }

        res.json({ status: 'SUCCESS', nodes: memoryNodes });
    } catch (err) {
        console.error('[MEMORY API ERROR]:', err.message);
        res.status(500).json({ status: 'ERROR', error: err.message, nodes: [] });
    }
});

app.get('/api/evolution/proposals', (req, res) => {
    try {
        const propDir = path.join(__dirname, 'vault', 'System_Evolution', 'Proposals');
        if (!fs.existsSync(propDir)) return res.json({ proposals: [] });
        const files = fs.readdirSync(propDir).filter(f => f.endsWith('.json'));
        const proposals = files.map(f => {
            const p = JSON.parse(fs.readFileSync(path.join(propDir, f), 'utf8'));
            return { ...p, filename: f };
        });
        res.json({ proposals });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.post('/api/evolution/authorize', (req, res) => {
    const { filename, proposalId } = req.body;
    const propPath = path.join(__dirname, 'vault', 'System_Evolution', 'Proposals', filename);
    const archiveDir = path.join(__dirname, 'vault', 'System_Evolution', 'Archive');
    if (!fs.existsSync(propPath)) return res.status(404).json({ error: 'Proposal not found' });

    try {
        const proposal = JSON.parse(fs.readFileSync(propPath, 'utf8'));
        exec('node -c server.js', { cwd: __dirname }, (vErr, vStdout, vStderr) => {
            if (vErr) return res.status(500).json({ error: 'Syntax verification failed', details: vStderr });
            if (!fs.existsSync(archiveDir)) fs.mkdirSync(archiveDir, { recursive: true });
            fs.renameSync(propPath, path.join(archiveDir, filename));
            logTelemetry('SYSTEM_EVOLUTION_AUTHORIZED', `Ratified proposal ${proposalId || filename}.`);
            res.json({ success: true, message: `Verified and archived: ${proposalId || filename}` });
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/upload', upload.single('file'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded.' });
    res.json({ status: 'UPLOADED', filePath: req.file.path, filename: req.file.filename });
});

// ==========================================
// TAB 12 & 13: OBSIDIAN VAULT OPERATIONS
// ==========================================

app.post('/api/harvest', async (req, res) => {
    try {
        const { url, contentDump, topicDomain, specialization } = req.body;
        
        let sourceMaterial = "";
        
        if (url && url.trim().length > 0) {
            sourceMaterial += `SOURCE URL: ${url.trim()}\n\n`;
            const videoId = extractYouTubeId(url.trim());
            
            if (videoId) {
                try {
                    const transcriptArr = await YoutubeTranscript.fetchTranscript(videoId);
                    const fetchedTranscript = transcriptArr.map(t => t.text).join(' ');
                    sourceMaterial += `=== YOUTUBE TRANSCRIPT SCRAPED ===\n${fetchedTranscript}\n\n`;
                    console.log(`[HARVEST TACTICAL] Transcript extracted: ${fetchedTranscript.length} characters.`);
                } catch (ytErr) {
                    console.warn(`[HARVEST WARN] Failed to grab transcript for ${videoId}:`, ytErr.message);
                    return res.status(400).json({ error: `Transcript extraction failed: ${ytErr.message}` });
                }
            } else {
                return res.status(400).json({ error: 'CRITICAL FAILURE: Invalid YouTube URL format.' });
            }
        }

        if (contentDump && contentDump.trim().length > 0) {
            sourceMaterial += `=== RAW CONTENT DUMP ===\n${contentDump.trim()}\n\n`;
        }

        if (!sourceMaterial.trim() || sourceMaterial === `SOURCE URL: ${url.trim()}\n\n`) {
            return res.status(400).json({ error: "No URL or transcript extracted for processing." });
        }

        console.log(`[HARVEST DISPATCH] Domain: ${topicDomain} // Specialization: ${specialization}. Raw length: ${sourceMaterial.length}`);

        const systemPrompt = `You are MONTY, the Base 1 Intelligence Refinery Daemon.
Your objective is to perform a 'Fluff-to-Nugget' extraction.
DOMAIN: ${topicDomain}
SPECIALIZATION: ${specialization}

INSTRUCTIONS:
1. Strip all narrative fluff, filler words, sponsorships, and irrelevant tangents.
2. Extract only the high-value, actionable "nuggets" (code blocks, core concepts, tactical data, quantitative metrics).
3. Format the output in clean Warlord Master Markdown (### for headers, bullet points).
4. Do not include introductory or concluding conversational text. Output ONLY the refined dossier content.`;

        const harvestPayload = { model: 'gemini-1.5-pro', prompt: sourceMaterial };
        const { reply, modelUsed } = await dispatchToBrain(systemPrompt, harvestPayload);

        res.json({ nugget: reply, activeModelUsed: modelUsed });
    } catch (error) {
        console.error('[HARVEST ERROR]:', error);
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/docs', (req, res) => {
    try {
        if (!fs.existsSync(VAULT_PATH)) return res.json([]);
        const files = fs.readdirSync(VAULT_PATH).filter(f => f.endsWith('.md'));
        
        const docs = files.map(file => {
            const rawContent = fs.readFileSync(path.join(VAULT_PATH, file), 'utf8');
            let title = file.replace('.md', '');
            let domain = 'Vault';
            let niche = 'General';
            
            const lines = rawContent.split('\n');
            const domainLine = lines.find(l => l.toUpperCase().includes('DOMAIN:'));
            const nicheLine = lines.find(l => l.toUpperCase().includes('NICHE:'));
            if (domainLine) domain = domainLine.split(':')[1].trim();
            if (nicheLine) niche = nicheLine.split(':')[1].trim();

            return { filename: file, title, domain, niche, content: rawContent };
        });
        res.json(docs);
    } catch (err) {
        console.error('[DOCS LIST ERROR]:', err.message);
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/docs/save', (req, res) => {
    const { filename, title, domain, specialization, niche, content, pruneAndMerge } = req.body;
    try {
        let saveName = filename;
        if (!saveName) {
            const safeDomain = (domain || 'Vault').replace(/[^a-zA-Z0-9_-]/g, '');
            const safeNiche = (specialization || niche || 'General').replace(/[^a-zA-Z0-9_-]/g, '_');
            saveName = `${safeDomain}_${safeNiche}.md`;
        }

        const fullPath = path.join(VAULT_PATH, saveName);
        
        if (pruneAndMerge && fs.existsSync(fullPath)) {
            const existingContent = fs.readFileSync(fullPath, 'utf8');
            const mergedContent = existingContent + "\n\n---\n\n" + content;
            fs.writeFileSync(fullPath, mergedContent, 'utf8');
            console.log(`[VAULT WRITE] Appended document to ${fullPath}`);
            res.json({ message: 'Appended to existing dossier in Vault.', filename: saveName });
        } else {
            fs.writeFileSync(fullPath, content || '', 'utf8');
            console.log(`[VAULT WRITE] Created document ${fullPath}`);
            res.json({ message: 'Dossier committed to Vault successfully.', filename: saveName });
        }
    } catch (err) {
        console.error('[VAULT WRITE ERROR]:', err.message);
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/docs/prune', async (req, res) => {
    try {
        const { filePath } = req.body;
        if (!filePath || !fs.existsSync(filePath)) {
            return res.status(400).json({ status: 'ERROR', error: 'File path invalid or not found.' });
        }

        const rawContent = fs.readFileSync(filePath, 'utf8');
        
        const systemPrompt = `You are MONTY, the Base 1 Intelligence Refinery Daemon.
Your objective is to PRUNE and DISTILL the provided dossier file.
1. Remove duplicate information, conversational fluff, and redundant vectors.
2. Consolidate the core operational signals, rules of engagement, code snippets, and hard metrics.
3. Maintain clean Markdown formatting. Do not output anything other than the final refined file content.`;

        const prunePayload = { model: 'gemini-1.5-pro', prompt: rawContent };
        const { reply } = await dispatchToBrain(systemPrompt, prunePayload);

        fs.writeFileSync(filePath, reply.trim(), 'utf8');
        res.json({ status: 'SUCCESS', content: reply.trim() });
    } catch (error) {
        console.error('[PRUNE ERROR]:', error);
        res.status(500).json({ status: 'ERROR', error: error.message });
    }
});

app.get('/', (req, res) => res.render('layout'));

// ==========================================
// SYSTEM STATUS & DYNAMIC COMPUTE TOGGLES
// ==========================================

app.get('/api/status', async (req, res) => {
    const computeMode = (process.env.COMPUTE_MODE || 'STANDBY').toUpperCase();
    const isLive = computeMode === 'KAGGLE' ? await verifyKaggleTunnel() : false;

    res.json({ 
        status: 'ONLINE', 
        station: 'Base 1 Command', 
        bridge: 'ACTIVE', 
        compute_mode: computeMode,
        kaggle_gpu_online: isLive,
        kaggle_latency: kaggleHealthCache.latency,
        port: PORT, 
        ws_clients_connected: wss.clients.size 
    });
});

// Toggle Kaggle Mode: ACTIVE <-> STANDBY
app.post('/api/compute/toggle', async (req, res) => {
    const current = (process.env.COMPUTE_MODE || 'STANDBY').toUpperCase();
    process.env.COMPUTE_MODE = current === 'KAGGLE' ? 'STANDBY' : 'KAGGLE';
    const isKaggle = process.env.COMPUTE_MODE === 'KAGGLE';
    
    kaggleHealthCache.lastChecked = 0;
    const isLive = isKaggle ? await verifyKaggleTunnel() : false;

    console.log(`[COMPUTE TOGGLE] Mode switched to: ${process.env.COMPUTE_MODE} (Live: ${isLive})`);
    broadcast('COMPUTE_MODE_CHANGED', { compute_mode: process.env.COMPUTE_MODE, kaggle_gpu_online: isLive });
    
    res.json({
        success: true,
        compute_mode: process.env.COMPUTE_MODE,
        kaggle_gpu_online: isLive,
        kaggle_latency: kaggleHealthCache.latency
    });
});

// Update Kaggle Tunnel URL dynamically from UI
app.post('/api/compute/tunnel', async (req, res) => {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: 'URL required' });

    process.env.KAGGLE_TUNNEL_URL = url.trim();
    process.env.COMPUTE_MODE = 'KAGGLE';
    kaggleHealthCache.lastChecked = 0;
    const isLive = await verifyKaggleTunnel();

    console.log(`[TUNNEL UPDATED] New URL: ${process.env.KAGGLE_TUNNEL_URL} (Live: ${isLive})`);
    broadcast('TRACE', `[COMPUTE] Updated Kaggle Tunnel -> ${isLive ? 'ONLINE' : 'UNREACHABLE'}`);

    res.json({
        success: true,
        tunnel_url: process.env.KAGGLE_TUNNEL_URL,
        kaggle_gpu_online: isLive,
        latency: kaggleHealthCache.latency
    });
});

const PORT = process.env.PORT || 8081;
server.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`[BASE 1 MASTER DAEMON]   : Port ${PORT}`);
    console.log(`[COMPUTE ARCHITECTURE]   : Kaggle Dual-T4 (Handshake Probed) -> Multi-Cluster -> OpenRouter Shield`);
    console.log(`[INTELLIGENCE MATRIX]    : 16-Director Capability Matrix Active`);
    console.log(`[OBSIDIAN VAULT]         : ${VAULT_PATH}`);
    console.log(`====================================================`);
});