// ==========================================================================
// WARLORD MISSION CONTROL // BASE 1 JACK SERVER (PURE LOCAL EDITION)
// ==========================================================================
const express = require("express");
const Http = require("http");
const WebSocket = require("ws");
const fs = require("fs");
const path = require("path");
const os = require("os");
const multer = require("multer");

// ==========================================================================
// ABSOLUTE PATH LOCKS
// ==========================================================================
const MASTER_MCNC_DIR = "C:\\Warlord_Inc\\Warlord_WASP\\MCNC";
const COMMAND_TIER_PATH = "C:\\Warlord_Inc\\Warlord_WASP\\WASP Documents\\Final WASP Docs\\01_Command_Tier";
const MASTER_DOCTRINE_PATH = "C:\\Warlord_Inc\\Warlord_WASP\\WASP Documents\\Final WASP Docs\\00_Master_Doctrine";

const OBSIDIAN_LOG_PATH = path.join(MASTER_MCNC_DIR, "vault", "MCNC_State", "Telemetry_Logs.md");
const OBSIDIAN_QUEUE_PATH = path.join(MASTER_MCNC_DIR, "vault", "MCNC_State", "Task_Queue.md");
const OBSIDIAN_13_DOCS_PATH = path.join(MASTER_MCNC_DIR, "vault", "13_DOCS");

let wsServer = null;
let executionFleetState = {
    ALGO_CORE_01: "ONLINE", ALGO_CORE_02: "ONLINE", ALGO_CORE_03: "ONLINE", ALGO_CORE_04: "ONLINE",
    ALGO_CORE_05: "ONLINE", ALGO_CORE_06: "ONLINE", ALGO_CORE_07: "ONLINE", ALGO_CORE_08: "ONLINE"
};

let activeModel = 'llama3:latest'; // Default local model
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

    // ==========================================================================
    // PURE LOCAL OLLAMA PIPELINE
    // ==========================================================================
    const MONTY_BASE_PROMPT = `You are Monty, the Chief of Staff and Omni-Director for Mike (The Warlord) operating out of Base One. You are a conversational, intelligent, and highly capable chief of staff. Speak naturally and directly to Mike. Integrate the DOCTRINE seamlessly into your understanding without acting like a numb robot.`;

    app.post('/api/exec/prompt', async (req, res) => {
        const { model, prompt } = req.body;

        try {
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

            const FINAL_SYSTEM_PROMPT = `${MONTY_BASE_PROMPT}\n\n${dynamicBlueprint}\n${masterDoctrineBlock}\n\n[SYSTEM STATE: You are running 100% locally on Base One hardware.]`;
            const messagesPayload = [ { role: 'system', content: FINAL_SYSTEM_PROMPT }, ...chatHistory, { role: 'user', content: prompt } ];

            // ENFORCED MEMORY CAP (num_ctx: 8192) TO PREVENT BASE 1 FROM FREEZING
            const ollamaRes = await fetch('http://127.0.0.1:11434/api/chat', { 
                method: 'POST', 
                headers: { 'Content-Type': 'application/json' }, 
                body: JSON.stringify({ 
                    model: model || 'llama3:latest', 
                    messages: messagesPayload, 
                    stream: false, 
                    options: { temperature: 0.4, num_ctx: 8192 } 
                }) 
            });
            
            if (!ollamaRes.ok) throw new Error(`Ollama Engine Error: Status ${ollamaRes.status}`);
            const ollamaData = await ollamaRes.json();
            const responseText = ollamaData.message.content;

            chatHistory.push({ role: 'user', content: prompt });
            chatHistory.push({ role: 'assistant', content: responseText });
            if (chatHistory.length > 6) chatHistory = chatHistory.slice(chatHistory.length - 6); 

            return res.json({ success: true, output: responseText });
        } catch (error) {
            console.error(`[LOCAL GATEWAY ERROR]:`, error.message);
            return res.status(200).json({ success: true, output: `[BASE 1 OVERRIDE - LOOP BROKEN]: ${error.message}` });
        }
    });

    // TEMPORARY AUDIO STUB (Awaiting Stage 2 Frontend Update)
    app.post('/api/transcribe', (req, res) => {
        return res.status(200).json({ success: true, text: "Cloud dictation severed. Awaiting Stage 2 Warlord Audio update." });
    });

    app.use((req, res) => res.redirect('/exec'));
    app.listen(UI_PORT, () => console.log(`[JACK] Warlord UI Server (PURE LOCAL) running on http://localhost:${UI_PORT}`));

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
                    activeModel = packet.model; chatHistory = []; 
                } else if (packet.type === 'MONTY_EXEC_DISPATCH') {
                    setTimeout(() => ws.send(JSON.stringify({ type: 'MONTY_EXEC_UPDATE', speaker: 'CHIEF OF STAFF // MONTY 2', text: `Local link active. Awaiting raw instructions.`, color: 'Goldenrod' })), 600); 
                }
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