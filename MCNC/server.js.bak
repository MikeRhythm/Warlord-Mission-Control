require('dotenv').config();
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const multer = require('multer');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Middleware Setup
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// Path Configurations
const WASP_DOCS_PATH = path.join('C:', 'Warlord_Inc', 'Warlord_WASP');
const SOULS_PATH = path.join(WASP_DOCS_PATH, 'WASP Documents', 'Final WASP Docs', '02_Director_Board');
const LOGS_PATH = path.join(WASP_DOCS_PATH, 'MCNC_Logs');
const UPLOADS_PATH = path.join(__dirname, 'uploads');

[LOGS_PATH, UPLOADS_PATH].forEach(dir => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// Multer Storage for Multimodal Screenshots & Files
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, UPLOADS_PATH),
    filename: (req, file, cb) => cb(null, `${Date.now()}_${file.originalname}`)
});
const upload = multer({ storage });

// Core Directive & Soul Protocol Loader
const WARLORD_CORE_DIRECTIVE = `You are MONTY, Chief of Staff for Warlord MCNC Base 1.
Your mandate under Rhythm Holdings and W.A.S.P. is operational control, planning, and agent orchestration. Mike (Warlord) is Commander.
DIRECTORS: Tess (Quant), Charlie (MQL5/Python), Roxy (UI/UX), Jack (Marketing/Node).
SOP: Full functional code only. Solid DodgerBlue, OrangeRed, Goldenrod lines only. Zero filler.
RHYTHM MULTIPLIER: Enforce 0.0 to 1.0 scaling on quantitative and telemetry arrays. Fallback default 1.0 to prevent NaN memory poisoning.`;

function loadSoul(directorName) {
    try {
        if (!fs.existsSync(SOULS_PATH)) return "";
        const cleanName = directorName.toLowerCase().replace(/^\d+_/, '').replace(/[^a-z]/g, '');
        const files = fs.readdirSync(SOULS_PATH);
        const match = files.find(f => {
            const normalized = f.toLowerCase().replace(/[^a-z]/g, '');
            return normalized.includes(cleanName) && (f.endsWith('.md') || f.endsWith('.txt'));
        });
        return match ? fs.readFileSync(path.join(SOULS_PATH, match), 'utf8') : "";
    } catch (e) {
        console.error(`[SOUL LOAD ERROR]: Failed to load soul for ${directorName}:`, e.message);
        return "";
    }
}

// Deep Prompt Extractor
function extractPromptText(body) {
    if (!body) return "Directive audit and status report.";
    if (typeof body === 'string') return body.trim();

    const priorityKeys = ['message', 'prompt', 'text', 'input', 'query', 'directive', 'content', 'instructions', 'userPrompt'];
    for (const key of priorityKeys) {
        if (typeof body[key] === 'string' && body[key].trim().length > 0) {
            return body[key].trim();
        }
    }

    for (const key of Object.keys(body)) {
        if (typeof body[key] === 'string' && body[key].trim().length > 0 && 
            !key.toLowerCase().includes('model') && 
            !key.toLowerCase().includes('project') &&
            !key.toLowerCase().includes('director')) {
            return body[key].trim();
        }
    }

    return "Directive audit and status report.";
}

// Unified Multi-Tier Brain Dispatcher
async function dispatchToBrain(systemPrompt, rawBody) {
    const validContent = extractPromptText(rawBody);
    const requestedModel = rawBody?.selectedModel || rawBody?.model || 'claude-3.5-sonnet';
    const reqModelLower = requestedModel.toLowerCase(); // Case-sensitivity fix applied here

    console.log(`\n========================================`);
    console.log(`[DISPATCH TRIGGERED] -> Target Model / Brain: "${requestedModel}"`);
    console.log(`[RESOLVED USER INPUT] -> "${validContent}"`);

    // Tier 1: Local Ollama
    if (reqModelLower.includes('local') || reqModelLower.includes('qwen') || reqModelLower.includes('ollama')) {
        const ollamaModel = reqModelLower.includes('qwen') ? 'qwen2.5-coder:latest' : 'llama3:latest';
        console.log(`[ROUTING TIER 1: OLLAMA LOCAL] -> ${ollamaModel}`);
        
        const response = await fetch('http://127.0.0.1:11434/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: ollamaModel,
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: validContent }
                ],
                stream: false,
                options: { temperature: 0.2 }
            })
        });

        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`Local Ollama Error ${response.status}: ${errText}`);
        }
        const data = await response.json();
        return { reply: data.message?.content?.trim() || "Empty response from local Ollama.", modelUsed: ollamaModel };
    }

    // Tier 2: NVIDIA NIM
    if (reqModelLower.includes('nim') || reqModelLower.includes('nemotron')) {
        const nimKey = process.env.NVIDIA_NIM_KEY || process.env.NVIDIA_API_KEY;
        if (!nimKey) throw new Error("NVIDIA_NIM_KEY missing from .env");

        const targetModel = 'meta/llama-3.3-70b-instruct';
        console.log(`[ROUTING TIER 2: NVIDIA NIM] -> ${targetModel}`);

        const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${nimKey}`
            },
            body: JSON.stringify({
                model: targetModel,
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: validContent }
                ],
                temperature: 0.2,
                max_tokens: 2048
            })
        });

        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`Upstream NVIDIA Error ${response.status}: ${errText}`);
        }
        const data = await response.json();
        return { reply: data.choices?.[0]?.message?.content?.trim() || "Empty response from NVIDIA NIM.", modelUsed: targetModel };
    }

    // Tier 3: OpenRouter
    const openRouterKey = process.env.OPENROUTER_API_KEY;
    if (!openRouterKey) throw new Error("OPENROUTER_API_KEY missing from .env");

    let targetModel = 'anthropic/claude-3.5-sonnet';
    if (reqModelLower.includes('gpt')) targetModel = 'openai/gpt-4o';
    else if (reqModelLower.includes('gemini')) targetModel = 'google/gemini-1.5-pro';

    console.log(`[ROUTING TIER 3: OPENROUTER] -> ${targetModel}`);

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${openRouterKey}`,
            'HTTP-Referer': 'http://localhost:5173',
            'X-Title': 'Warlord MCNC Master'
        },
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

    if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Upstream OpenRouter Error ${response.status}: ${errText}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "Empty response from OpenRouter.";
    console.log(`[RESPONSE EXTRACTED]  -> ${content.length} characters.`);
    console.log(`========================================\n`);
    return { reply: content.trim(), modelUsed: targetModel };
}

// REST Endpoints
app.post('/api/chat', async (req, res) => {
    try {
        const soul = loadSoul('monty');
        const systemPrompt = soul ? `${WARLORD_CORE_DIRECTIVE}\n\n${soul}` : WARLORD_CORE_DIRECTIVE;
        const { reply, modelUsed } = await dispatchToBrain(systemPrompt, req.body);
        return res.json({ reply, speaker: 'CHIEF OF STAFF // MONTY', activeModelUsed: modelUsed });
    } catch (err) {
        console.error('[CHAT ERROR]:', err.message);
        return res.status(500).json({ reply: `Daemon execution error: ${err.message}`, speaker: 'SYSTEM // ERROR' });
    }
});

app.post('/api/pipeline/refine', async (req, res) => {
    try {
        const soul = loadSoul('monty');
        const systemPrompt = soul ? `${WARLORD_CORE_DIRECTIVE}\n\n${soul}` : WARLORD_CORE_DIRECTIVE;
        const { reply, modelUsed } = await dispatchToBrain(systemPrompt, req.body);
        return res.json({ status: 'PLAN_READY', plan: reply, reply: reply, speaker: 'CHIEF OF STAFF // MONTY', activeModelUsed: modelUsed });
    } catch (err) {
        console.error('[REFINE ERROR]:', err.message);
        return res.status(500).json({ reply: `Daemon execution error: ${err.message}`, speaker: 'SYSTEM // ERROR' });
    }
});

app.post('/api/pipeline/approve', async (req, res) => {
    try {
        const director = req.body.director || '11_charlie';
        const soul = loadSoul(director);
        const systemPrompt = `${WARLORD_CORE_DIRECTIVE}\n${soul}\nExecute approved plan. Full functional code only. Solid DodgerBlue, OrangeRed, Goldenrod lines only. No histograms.`;
        const { reply, modelUsed } = await dispatchToBrain(systemPrompt, req.body);
        return res.json({ status: 'EXECUTED', director: director.toUpperCase(), output: reply, reply: reply, activeModelUsed: modelUsed });
    } catch (err) {
        console.error('[APPROVE ERROR]:', err.message);
        return res.status(500).json({ reply: `Daemon execution error: ${err.message}`, speaker: 'SYSTEM // ERROR' });
    }
});

app.post('/api/upload', upload.single('file'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded.' });
    console.log(`[ATTACHMENT STORED]: ${req.file.path}`);
    res.json({ status: 'UPLOADED', filePath: req.file.path, filename: req.file.filename });
});

app.get('/api/status', (req, res) => {
    res.json({
        status: 'ONLINE',
        station: 'Base 1 Command',
        bridge: 'ACTIVE',
        port: PORT,
        director_board: SOULS_PATH,
        ws_clients_connected: wss.clients.size
    });
});

// WebSocket Telemetry & Execution Stream
wss.on('connection', (ws) => {
    console.log('[WEBSOCKET]: Client connected to Base 1 telemetry stream.');
    ws.send(JSON.stringify({ type: 'TELEMETRY_CONNECTED', message: 'Base 1 Telemetry Link Established.' }));

    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            console.log(`[WS INBOUND]:`, data.type || 'RAW_DATA');
            if (data.type === 'PING') ws.send(JSON.stringify({ type: 'PONG' }));
        } catch (e) {
            console.error('[WS PARSE ERROR]:', e.message);
        }
    });

    ws.on('close', () => console.log('[WEBSOCKET]: Client disconnected.'));
});

// Port Binding & Daemon Initialization
const PORT = process.env.PORT || 8081;
server.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`[BASE 1 MASTER DAEMON]    : Active on port ${PORT}`);
    console.log(`[WEBSOCKET ENGINE]        : Live on ws://localhost:${PORT}`);
    console.log(`[DIRECTOR SOULS PATH]     : ${SOULS_PATH}`);
    console.log(`[MULTIMODAL UPLOADS PATH] : ${UPLOADS_PATH}`);
    console.log(`[DEFAULT ROUTER]          : TIER 3 READY`);
    console.log(`====================================================`);
});