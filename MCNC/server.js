// ==========================================================================
// WARLORD MISSION CONTROL // BASE 1 JACK SERVER (CLOUD-BRIDGE EDITION)
// ==========================================================================
const { YoutubeTranscript } = require('youtube-transcript');
const axios = require('axios');
const express = require("express");
const Http = require("http");
const WebSocket = require("ws");
const fs = require("fs");
const path = require("path");
const os = require("os");
const multer = require("multer");
const pdfParse = require("pdf-parse");

// ==========================================================================
// WARLORD KEY VAULT AUTO-LOADER
// ==========================================================================
try {
    const envPath = path.join("C:\\Warlord_Inc\\Warlord_WASP\\MCNC", ".env");
    if (fs.existsSync(envPath)) {
        const envFile = fs.readFileSync(envPath, 'utf8');
        envFile.split('\n').forEach(line => {
            const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
            if (match) process.env[match[1]] = match[2].trim();
        });
        console.log("[JACK] Warlord Key Vault (.env) loaded successfully.");
    }
} catch (e) {
    console.error("[JACK] Warning: Could not parse .env file.");
}

// ==========================================================================
// ABSOLUTE PATH LOCKS
// ==========================================================================
const MASTER_MCNC_DIR = "C:\\Warlord_Inc\\Warlord_WASP\\MCNC";
const COMMAND_TIER_PATH = "C:\\Warlord_Inc\\Warlord_WASP\\WASP Documents\\Final WASP Docs\\01_Command_Tier";
const MASTER_DOCTRINE_PATH = "C:\\Warlord_Inc\\Warlord_WASP\\WASP Documents\\Final WASP Docs\\00_Master_Doctrine";

const OBSIDIAN_LOG_PATH = path.join(MASTER_MCNC_DIR, "vault", "MCNC_State", "Telemetry_Logs.md");
const OBSIDIAN_QUEUE_PATH = path.join(MASTER_MCNC_DIR, "vault", "MCNC_State", "Task_Queue.md");
const OBSIDIAN_TRANSCRIPT_PATH = path.join(MASTER_MCNC_DIR, "vault", "MCNC_State", "War_Room_Transcripts.md");
const OBSIDIAN_13_DOCS_PATH = path.join(MASTER_MCNC_DIR, "vault", "13_DOCS");

let wsServer = null;
let executionFleetState = {
    ALGO_CORE_01: "ONLINE", ALGO_CORE_02: "ONLINE", ALGO_CORE_03: "ONLINE", ALGO_CORE_04: "ONLINE",
    ALGO_CORE_05: "ONLINE", ALGO_CORE_06: "ONLINE", ALGO_CORE_07: "ONLINE", ALGO_CORE_08: "ONLINE"
};

// CRITICAL FIX: Default model hardcoded to 3.2 90B
let activeProvider = 'nvidia'; 
let activeModel = 'meta/llama-3.2-90b-vision-instruct';
let chatHistory = [];

function writeToObsidian(logEntry) {
    try {
        const timestamp = new Date().toISOString();
        const formattedEntry = `\n- [${timestamp}] ${logEntry}`;
        fs.appendFileSync(OBSIDIAN_LOG_PATH, formattedEntry, "utf8");
    } catch (err) {}
}

function getRecentTasks() {
    try {
        if (!fs.existsSync(OBSIDIAN_QUEUE_PATH)) return [];
        const content = fs.readFileSync(OBSIDIAN_QUEUE_PATH, "utf8");
        const lines = content.split("\n").filter(l => l.startsWith("|") && !l.includes("Timestamp"));
        return lines.slice(-5).map(l => {
            const parts = l.split("|").map(p => p.trim());
            return { timestamp: parts[1], director: parts[2], task: parts[3], status: parts[4] };
        });
    } catch (e) { return []; }
}

function getSystemMetrics() {
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMemGB = ((totalMem - freeMem) / (1024 * 1024 * 1024)).toFixed(2);
    const totalMemGB = (totalMem / (1024 * 1024 * 1024)).toFixed(2);
    return {
        ram: `${usedMemGB} GB / ${totalMemGB} GB`,
        ramPercent: Math.round(((totalMem - freeMem) / totalMem) * 100),
        cpuCores: os.cpus().length,
        uptimeHrs: (os.uptime() / 3600).toFixed(1)
    };
}

function initializeMcncBackend() {
    if (!fs.existsSync(OBSIDIAN_LOG_PATH)) {
        fs.mkdirSync(path.dirname(OBSIDIAN_LOG_PATH), { recursive: true });
        fs.writeFileSync(OBSIDIAN_LOG_PATH, "# MCNC Telemetry Log Stream\n\n", "utf8");
    }
    if (!fs.existsSync(OBSIDIAN_13_DOCS_PATH)) {
        fs.mkdirSync(OBSIDIAN_13_DOCS_PATH, { recursive: true });
    }

    const app = express();
    const UI_PORT = 3000;

    app.use(express.json());
    app.use(express.static(path.join(MASTER_MCNC_DIR, 'public')));
    app.set('view engine', 'ejs');
    app.set('views', path.join(MASTER_MCNC_DIR, 'views'));

    app.get('/', (req, res) => res.redirect('/exec'));
    app.get('/exec', (req, res) => res.render('layout', { activeView: 'partials/tab_01_exec' }));
    app.get('/warroom', (req, res) => res.render('layout', { activeView: 'partials/tab_02_warroom' }));
    app.get('/projects', (req, res) => res.render('layout', { activeView: 'partials/tab_03_projects' }));
    app.get('/taskboard', (req, res) => res.render('layout', { activeView: 'partials/tab_04_taskboard' }));

    const uploadsDir = path.join(MASTER_MCNC_DIR, 'uploads');
    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);
    const upload = multer({ dest: uploadsDir });

    // ==========================================================================
    // MULTI-PROVIDER LLM ROUTING
    // ==========================================================================
    const MONTY_BASE_PROMPT = `You are Monty, the Chief of Staff and Omni-Director for Mike (The Warlord) operating out of Base One. You are NOT a generic AI, you are NOT an LFM, and you must NEVER mention OpenAI, Liquid AI, or your underlying architecture. You are a conversational, intelligent, and highly capable chief of staff. Speak naturally and directly to Mike as his trusted right-hand operator. Integrate the DOCTRINE seamlessly into your understanding without acting like a numb robot.`;

    app.post('/api/exec/prompt', async (req, res) => {
        const { provider, model, prompt } = req.body;

        try {
            let responseText = "";
            let dynamicBlueprint = "";
            const blueprintPath = path.join(COMMAND_TIER_PATH, "00_COMMAND_Monty_Chief_Of_Staff.md");
            if (fs.existsSync(blueprintPath)) dynamicBlueprint = fs.readFileSync(blueprintPath, "utf8");

            let masterDoctrineBlock = "\n\n=== WARLORD MASTER DOCTRINE ===\n";
            try {
                if (fs.existsSync(MASTER_DOCTRINE_PATH)) {
                    const files = fs.readdirSync(MASTER_DOCTRINE_PATH).filter(f => f.endsWith('.md'));
                    for (const file of files) {
                        masterDoctrineBlock += `\n--- ${file.toUpperCase()} ---\n`;
                        masterDoctrineBlock += fs.readFileSync(path.join(MASTER_DOCTRINE_PATH, file), "utf8");
                    }
                }
            } catch (docErr) {}

            const FINAL_SYSTEM_PROMPT = `${MONTY_BASE_PROMPT}\n\n${dynamicBlueprint}\n${masterDoctrineBlock}\n\n[SYSTEM STATE: You are routing through ${provider.toUpperCase()} via model ${model}.]`;
            const messagesPayload = [ { role: 'system', content: FINAL_SYSTEM_PROMPT }, ...chatHistory, { role: 'user', content: prompt } ];

            switch (provider) {
                case 'ollama':
                    const ollamaRes = await fetch('http://127.0.0.1:11434/api/chat', { 
                        method: 'POST', headers: { 'Content-Type': 'application/json' }, 
                        body: JSON.stringify({ model: model || 'llama3:latest', messages: messagesPayload, stream: false, options: { temperature: 0.4, num_ctx: 8192 } }) 
                    });
                    if (!ollamaRes.ok) throw new Error(`Ollama Error: Status ${ollamaRes.status}`);
                    const ollamaData = await ollamaRes.json();
                    responseText = ollamaData.message.content;
                    break;
                    
                case 'nvidia':
                    if (!process.env.NVIDIA_API_KEY) throw new Error('NVIDIA_API_KEY missing in Warlord Key Vault (.env).');
                    const nvidiaRes = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', { 
                        method: 'POST', headers: { 'Authorization': `Bearer ${process.env.NVIDIA_API_KEY}`, 'Content-Type': 'application/json' }, 
                        body: JSON.stringify({ model: model, messages: messagesPayload, temperature: 0.4, max_tokens: 2048 }) 
                    });
                    if (!nvidiaRes.ok) throw new Error(`NVIDIA API Error: Status ${nvidiaRes.status}. Check compute limits or key validity.`);
                    const nvidiaData = await nvidiaRes.json();
                    responseText = nvidiaData.choices[0].message.content;
                    break;
                    
                case 'openrouter':
                    if (!process.env.OPENROUTER_API_KEY) throw new Error('OPENROUTER_API_KEY missing in Warlord Key Vault (.env).');
                    const openrouterRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                        method: 'POST', headers: { 'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`, 'HTTP-Referer': 'http://localhost:3000', 'X-Title': 'Warlord MCNC', 'Content-Type': 'application/json' },
                        body: JSON.stringify({ model: model, messages: messagesPayload, temperature: 0.4 })
                    });
                    if (!openrouterRes.ok) throw new Error(`OpenRouter API Error: Status ${openrouterRes.status}`);
                    const openrouterData = await openrouterRes.json();
                    responseText = openrouterData.choices[0].message.content;
                    break;
            }

            chatHistory.push({ role: 'user', content: prompt });
            chatHistory.push({ role: 'assistant', content: responseText });
            if (chatHistory.length > 6) chatHistory = chatHistory.slice(chatHistory.length - 6); 

            return res.json({ success: true, output: responseText });
        } catch (error) {
            console.error(`[GATEWAY ERROR]:`, error.message);
            return res.status(200).json({ success: true, output: `[SYSTEM ALERT - COMPUTE OVERRIDE]: ${error.message}` });
        }
    });

    // ==========================================================================
    // WARLORD WHISPER PIPELINE (GROQ CLOUD + AUTO-CORRECTOR)
    // ==========================================================================
    app.post('/api/transcribe', upload.single('audio'), async (req, res) => {
        if (!req.file) return res.status(400).json({ success: false, error: 'No audio file received.' });
        const audioPath = req.file.path;

        if (!process.env.GROQ_API_KEY) {
            if (fs.existsSync(audioPath)) fs.unlinkSync(audioPath); 
            return res.status(500).json({ success: false, error: 'GROQ_API_KEY is missing.' });
        }

        try {
            const audioBuffer = fs.readFileSync(audioPath);
            const audioBlob = new Blob([audioBuffer], { type: 'audio/wav' });
            
            const formData = new FormData();
            formData.append("file", audioBlob, "dictation.wav");
            formData.append("model", "whisper-large-v3-turbo");
            formData.append("prompt", "Hello Monty, I am Mike the Warlord. We are using MCNC Base One and MQL5 MetaTrader. Howzit boet, what are the ROE Rules of Engagement?");
            formData.append("response_format", "json");
            formData.append("language", "en"); 
            
            const response = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", { method: "POST", headers: { "Authorization": `Bearer ${process.env.GROQ_API_KEY}` }, body: formData });
            if (fs.existsSync(audioPath)) fs.unlinkSync(audioPath);
            if (!response.ok) throw new Error(`Groq API Error`);

            const data = await response.json();
            
            let finalDictation = data.text.trim();
            finalDictation = finalDictation.replace(/\b[Mm]ulti\b/g, "Monty");
            finalDictation = finalDictation.replace(/\b[Mm]onte\b/g, "Monty");
            finalDictation = finalDictation.replace(/\b[Mm]onti\b/g, "Monty");
            finalDictation = finalDictation.replace(/\bM CNC\b/gi, "MCNC");
            
            res.json({ success: true, text: finalDictation });
        } catch (error) {
            if (fs.existsSync(audioPath)) fs.unlinkSync(audioPath); 
            return res.status(500).json({ success: false, error: 'Transcription failed.' });
        }
    });

    app.use((req, res) => res.redirect('/exec'));
    app.listen(UI_PORT, () => console.log(`[JACK] Warlord UI Server running on http://localhost:${UI_PORT}`));

    // ==========================================================================
    // MASTER WEBSOCKET BRIDGE
    // ==========================================================================
    const WS_PORT = 8081;
    const httpServer = Http.createServer();
    wsServer = new WebSocket.Server({ server: httpServer, host: '0.0.0.0' }); 

    wsServer.on("connection", (ws) => {
        ws.send(JSON.stringify({ type: "SYSTEM_STATE_SNAPSHOT", fleet: executionFleetState, metrics: getSystemMetrics(), tasks: getRecentTasks() }));

        ws.on("message", async (message) => {
            try {
                const packet = JSON.parse(message);
                if (packet.type === 'SWITCH_BRAIN') {
                    activeProvider = packet.provider; activeModel = packet.model; chatHistory = []; 
                } 
                // Ghost loop trigger remains permanently deleted.
            } catch (err) {}
        });
    });

    setInterval(() => broadcastToViewers({ type: "SYSTEM_METRICS_UPDATE", metrics: getSystemMetrics() }), 2000);
    httpServer.listen(WS_PORT, '0.0.0.0', () => console.log(`[JACK] Warlord WebSocket Bridge running on ws://0.0.0.0:${WS_PORT}`));
}

function broadcastToViewers(data) {
    if (!wsServer) return;
    const payload = JSON.stringify(data);
    wsServer.clients.forEach((client) => { if (client.readyState === WebSocket.OPEN) client.send(payload); });
}

initializeMcncBackend();