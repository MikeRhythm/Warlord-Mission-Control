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

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.static(path.join(__dirname, 'public')));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

const SOULS_PATH = path.join('C:', 'Warlord_Inc', 'Warlord_WASP', 'MCNC', 'souls');
const LOGS_PATH = path.join('C:', 'Warlord_Inc', 'Warlord_WASP', 'MCNC_Logs');
const UPLOADS_PATH = path.join(__dirname, 'uploads');

[LOGS_PATH, UPLOADS_PATH].forEach(dir => {
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
DIRECTORS: Tess (Quant), Silas (Database), Charlie (MQL5/Node), Roxy (UI/UX), Jack (Marketing).
SOP: Full functional code only. Solid DodgerBlue, OrangeRed, Goldenrod lines only for chart indicators. High Finance palette for UI. Zero filler.
RHYTHM MULTIPLIER: Enforce 0.0 to 1.0 scaling on quantitative and telemetry arrays. Default 1.0.`;

function loadSoul(identifier) {
    try {
        if (!fs.existsSync(SOULS_PATH)) {
            console.warn(`[SOULS_PATH NOT FOUND]: ${SOULS_PATH}`);
            return "";
        }
        const files = fs.readdirSync(SOULS_PATH);
        const match = files.find(f => {
            const normF = f.toLowerCase();
            const normId = identifier.toLowerCase();
            return normF.includes(normId) && (f.endsWith('.md') || f.endsWith('.txt'));
        });
        if (match) {
            const raw = fs.readFileSync(path.join(SOULS_PATH, match), 'utf8');
            console.log(`[SOUL ATTACHED]: ${match} (${raw.length} bytes)`);
            return raw;
        } else {
            console.warn(`[SOUL NOT LOCATED]: Keyword '${identifier}' had no match in ${SOULS_PATH}`);
            return "";
        }
    } catch (e) {
        console.error(`[SOUL LOAD ERROR]: ${identifier} ->`, e.message);
        return "";
    }
}

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

async function dispatchToBrain(systemPrompt, rawBody) {
    const validContent = extractPromptText(rawBody);
    const requestedModel = rawBody?.selectedModel || rawBody?.model || 'openrouter/openai/gpt-4o';
    const reqModelLower = requestedModel.toLowerCase();

    console.log(`\n========================================`);
    console.log(`[DISPATCH] Target Brain: "${requestedModel}"`);
    console.log(`[DISPATCH] User Input  : "${validContent}"`);

    // Tier 1: Local Ollama
    if (reqModelLower.includes('local') || reqModelLower.includes('ollama')) {
        const ollamaModel = reqModelLower.includes('qwen') ? 'qwen2.5-coder:latest' : (reqModelLower.includes('deepseek') ? 'deepseek-r1:latest' : 'llama3:latest');
        console.log(`[ROUTING TIER 1] -> ${ollamaModel}`);
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
                options: { temperature: 0.3 }
            })
        });
        if (!response.ok) throw new Error(`Ollama Error ${response.status}: ${await response.text()}`);
        const data = await response.json();
        return { reply: data.message?.content?.trim() || "Empty response from local Ollama.", modelUsed: ollamaModel };
    }

    // Tier 2: NVIDIA NIM
    if (reqModelLower.includes('nim') || reqModelLower.includes('nemotron')) {
        const nimKey = process.env.NVIDIA_NIM_KEY || process.env.NVIDIA_API_KEY;
        if (!nimKey) throw new Error("NVIDIA_NIM_KEY missing from .env");
        const targetModel = 'meta/llama-3.3-70b-instruct';
        console.log(`[ROUTING TIER 2] -> ${targetModel}`);
        const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${nimKey}` },
            body: JSON.stringify({
                model: targetModel,
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: validContent }
                ],
                temperature: 0.3,
                max_tokens: 2048
            })
        });
        if (!response.ok) throw new Error(`NVIDIA Error ${response.status}: ${await response.text()}`);
        const data = await response.json();
        return { reply: data.choices?.[0]?.message?.content?.trim() || "Empty response from NVIDIA NIM.", modelUsed: targetModel };
    }

    // Tier 3: OpenRouter
    const openRouterKey = process.env.OPENROUTER_API_KEY;
    if (!openRouterKey) throw new Error("OPENROUTER_API_KEY missing from .env");

    let targetModel = requestedModel.replace(/^openrouter\//i, '');
    if (!targetModel.includes('/')) {
        if (reqModelLower.includes('gpt')) targetModel = 'openai/gpt-4o';
        else if (reqModelLower.includes('claude')) targetModel = 'anthropic/claude-3.5-sonnet';
        else targetModel = 'openai/gpt-4o';
    }

    console.log(`[ROUTING TIER 3] -> ${targetModel}`);
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
            temperature: 0.3,
            max_tokens: 4096
        })
    });
    if (!response.ok) throw new Error(`OpenRouter Error ${response.status}: ${await response.text()}`);
    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "Empty response from OpenRouter.";
    console.log(`[RESPONSE EXTRACTED] -> ${content.length} characters.`);
    console.log(`========================================\n`);
    return { reply: content.trim(), modelUsed: targetModel };
}

app.post('/api/chat', async (req, res) => {
    try {
        const montySoul = loadSoul('monty');
        const mikeSoul = loadSoul('mike');

        let systemPrompt = WARLORD_CORE_DIRECTIVE;
        if (montySoul) systemPrompt += `\n\n=== CHIEF OF STAFF PROTOCOL (MONTY) ===\n${montySoul}`;
        if (mikeSoul) systemPrompt += `\n\n=== COMMANDER PROFILE & INNER CIRCLE (MIKE) ===\n${mikeSoul}`;

        const { reply, modelUsed } = await dispatchToBrain(systemPrompt, req.body);
        return res.json({ reply, speaker: 'CHIEF OF STAFF // MONTY', activeModelUsed: modelUsed });
    } catch (err) {
        console.error('[CHAT ERROR]:', err.message);
        return res.status(500).json({ reply: `Daemon execution error: ${err.message}`, speaker: 'SYSTEM // ERROR' });
    }
});

app.post('/api/upload', upload.single('file'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded.' });
    res.json({ status: 'UPLOADED', filePath: req.file.path, filename: req.file.filename });
});

app.get('/', (req, res) => res.render('layout'));

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

wss.on('connection', (ws) => {
    ws.send(JSON.stringify({ type: 'TELEMETRY_CONNECTED', message: 'Base 1 Telemetry Link Established.' }));
    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            if (data.type === 'PING') ws.send(JSON.stringify({ type: 'PONG' }));
        } catch (e) {
            console.error('[WS PARSE ERROR]:', e.message);
        }
    });
});

const PORT = process.env.PORT || 8081;
server.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`[BASE 1 MASTER DAEMON]    : Port ${PORT}`);
    console.log(`[SOULS DIRECTORY]         : ${SOULS_PATH}`);
    console.log(`====================================================`);
});