// ==========================================================================
// WARLORD MISSION CONTROL // BASE 1 JACK SERVER
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
// ABSOLUTE PATH LOCK - BYPASSING OPENCLAW SANDBOX GHOSTING
// ==========================================================================
const MASTER_MCNC_DIR = "C:\\Warlord_Inc\\Warlord_WASP\\MCNC";

// ==========================================================================
// DYNAMIC VAULT PATHS - LOCKED TO MASTER FOLDER
// ==========================================================================
const OBSIDIAN_LOG_PATH = path.join(MASTER_MCNC_DIR, "vault", "MCNC_State", "Telemetry_Logs.md");
const OBSIDIAN_QUEUE_PATH = path.join(MASTER_MCNC_DIR, "vault", "MCNC_State", "Task_Queue.md");
const OBSIDIAN_TRANSCRIPT_PATH = path.join(MASTER_MCNC_DIR, "vault", "MCNC_State", "War_Room_Transcripts.md");
const OBSIDIAN_13_DOCS_PATH = path.join(MASTER_MCNC_DIR, "vault", "13_DOCS");

let wsServer = null;
let executionFleetState = {
    ALGO_CORE_01: "ONLINE", ALGO_CORE_02: "ONLINE", ALGO_CORE_03: "ONLINE", ALGO_CORE_04: "ONLINE",
    ALGO_CORE_05: "ONLINE", ALGO_CORE_06: "ONLINE", ALGO_CORE_07: "ONLINE", ALGO_CORE_08: "ONLINE"
};

// Monty's Active Brain State (01 EXEC)
let activeProvider = 'nvidia'; 
let activeModel = 'llama-3.3-70b-instruct';
let isMicRecording = false; 

function writeToObsidian(logEntry) {
    try {
        const timestamp = new Date().toISOString();
        const formattedEntry = `\n- [${timestamp}] ${logEntry}`;
        fs.appendFileSync(OBSIDIAN_LOG_PATH, formattedEntry, "utf8");
    } catch (err) { console.error("OBSIDIAN WRITE ERROR: " + err.message); }
}

function queueTaskInObsidian(director, task) {
    try {
        const timestamp = new Date().toISOString().slice(0, 19).replace("T", " ");
        const row = `| ${timestamp} | ${director} | ${task} | QUEUED |\n`;
        fs.appendFileSync(OBSIDIAN_QUEUE_PATH, row, "utf8");
    } catch (err) { console.error("TASK QUEUE WRITE ERROR: " + err.message); }
}

function writeWarRoomTranscript(speaker, message) {
    try {
        if (!fs.existsSync(OBSIDIAN_TRANSCRIPT_PATH)) {
            fs.mkdirSync(path.dirname(OBSIDIAN_TRANSCRIPT_PATH), { recursive: true });
            fs.writeFileSync(OBSIDIAN_TRANSCRIPT_PATH, "# MCNC War Room Transcript Ledger\n\n", "utf8");
        }
        const timestamp = new Date().toISOString();
        const entry = `\n- **[${timestamp}] ${speaker}**: ${message}`;
        fs.appendFileSync(OBSIDIAN_TRANSCRIPT_PATH, entry, "utf8");
    } catch (err) { console.error("TRANSCRIPT WRITE ERROR: " + err.message); }
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
    
    // ABSOLUTE PATH LOCK APPLIED HERE
    app.use(express.static(path.join(MASTER_MCNC_DIR, 'public')));
    
    app.set('view engine', 'ejs');
    app.set('views', path.join(MASTER_MCNC_DIR, 'views'));

    const uploadsDir = path.join(MASTER_MCNC_DIR, 'uploads');
    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);
    const upload = multer({ dest: uploadsDir });

    // PAGE ROUTING
    app.get('/', (req, res) => res.redirect('/exec'));
    app.get('/exec', (req, res) => res.render('layout', { activeView: 'partials/tab_01_exec' }));
    app.get('/warroom', (req, res) => res.render('layout', { activeView: 'partials/tab_02_warroom' }));
    app.get('/projects', (req, res) => res.render('layout', { activeView: 'partials/tab_03_projects' }));
    app.get('/taskboard', (req, res) => res.render('layout', { activeView: 'partials/tab_04_taskboard' }));
    app.get('/calendar', (req, res) => res.render('layout', { activeView: 'partials/tab_05_calendar' }));
    app.get('/memory', (req, res) => res.render('layout', { activeView: 'partials/tab_06_memory' }));
    app.get('/paperclip', (req, res) => res.render('layout', { activeView: 'partials/tab_07_paperclip' }));
    app.get('/palettes', (req, res) => res.render('layout', { activeView: 'partials/tab_08_palettes' }));
    app.get('/org', (req, res) => res.render('layout', { activeView: 'partials/tab_09_org' }));
    app.get('/office', (req, res) => res.render('layout', { activeView: 'partials/tab_10_office' }));
    app.get('/galaxy', (req, res) => res.render('layout', { activeView: 'partials/tab_11_galaxy' }));
    app.get('/review', (req, res) => res.render('layout', { activeView: 'partials/tab_12_reviewmedia' }));
    app.get('/docs', (req, res) => res.render('layout', { activeView: 'partials/tab_13_docs' }));

    // ==========================================================================
    // REST API ENDPOINTS 
    // ==========================================================================
    
    // PDF INGESTION TO OLLAMA
    app.post('/api/ingest', upload.single('mediaFile'), async (req, res) => {
        try {
            if (!req.file) return res.status(400).json({ error: "No file detected by Jack." });
            if (req.file.mimetype !== 'application/pdf') {
                fs.unlinkSync(req.file.path);
                return res.status(400).json({ error: "Only PDFs are supported in this current test phase." });
            }

            console.log(`[JACK] PDF Ingested. Ripping text layers from ${req.file.originalname}...`);
            const dataBuffer = fs.readFileSync(req.file.path);
            const pdfData = await pdfParse(dataBuffer);
            const safeText = pdfData.text.replace(/\s+/g, ' ').trim().substring(0, 5000); 

            const prompt = `You are Monty, a Warlord Intelligence Agent. Analyze the following document text and provide a concise, highly structured executive summary. Focus on key metrics, core architecture, and actionable intel. Format your response in clean Markdown with headers and bullet points.\n\nDOCUMENT TEXT:\n${safeText}`;

            const payload = JSON.stringify({ model: "llama3", prompt: prompt, stream: false });

            const options = {
                hostname: '127.0.0.1', port: 11434, path: '/api/generate', method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) }
            };

            const ollamaReq = Http.request(options, (ollamaRes) => {
                let data = '';
                ollamaRes.on('data', (chunk) => data += chunk);
                ollamaRes.on('end', () => {
                    fs.unlinkSync(req.file.path); 
                    try {
                        res.json({ analysis: JSON.parse(data).response });
                    } catch (e) {
                        res.status(500).json({ error: "Monty returned corrupt data." });
                    }
                });
            });

            ollamaReq.on('error', (e) => {
                fs.unlinkSync(req.file.path);
                res.status(500).json({ error: "Failed to reach Ollama on port 11434. Is your Ollama engine running?" });
            });
            ollamaReq.write(payload);
            ollamaReq.end();

        } catch (err) {
            console.error(err);
            if(req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
            res.status(500).json({ error: err.message });
        }
    });

    // PAPERCLIP TTS VOICEBOX
    app.post('/api/tts/synthesize', (req, res) => {
        try {
            const { text } = req.body;
            if (!text) return res.status(400).json({ error: 'No text provided.' });

            console.log(`[JACK] Routing TTS Request to Voicebox. Port 17493. Path: /api/generate`);
            const payload = JSON.stringify({ text: text });

            const options = {
                hostname: '127.0.0.1', port: 17493, path: '/api/generate', method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) }
            };

            const ttsReq = Http.request(options, (ttsRes) => {
                if (ttsRes.statusCode !== 200) {
                    console.error(`[JACK] Voicebox Error Code: ${ttsRes.statusCode}`);
                    return res.status(ttsRes.statusCode).json({ error: `Voicebox status: ${ttsRes.statusCode}` });
                }
                res.set({ 'Content-Type': 'audio/wav', 'Transfer-Encoding': 'chunked' });
                ttsRes.pipe(res);
            });

            ttsReq.on('error', (e) => {
                console.error('[JACK] TTS Engine Error:', e.message);
                res.status(500).json({ error: 'Failed to connect.' });
            });
            ttsReq.write(payload);
            ttsReq.end();
        } catch (error) {
            console.error('[JACK] TTS Bridge Fatal:', error.message);
            res.status(500).json({ error: 'Failed to execute TTS bridge.' });
        }
    });

    // 13 DOCS ROUTER
    app.post('/api/pipeline', (req, res) => {
        try {
            const { folder, content, source } = req.body;
            if (!folder || !content) return res.status(400).json({ error: "Missing pipeline payload data." });

            const safeFolder = folder.replace(/[^a-zA-Z0-9_\- ]/g, '').trim().toUpperCase();
            const targetDir = path.join(OBSIDIAN_13_DOCS_PATH, safeFolder);
            if (!fs.existsSync(targetDir)) {
                fs.mkdirSync(targetDir, { recursive: true });
                console.log(`[JACK] Created new vault subdirectory -> ${targetDir}`);
            }

            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const safeSource = source ? source.replace(/[^a-zA-Z0-9_\- ]/g, '_').trim() : 'Analysis';
            const filePath = path.join(targetDir, `${safeSource}_${timestamp}.md`);

            fs.writeFileSync(filePath, content, "utf8");
            console.log(`[JACK] Pipeline payload successfully written -> ${filePath}`);
            res.json({ success: true, path: filePath });
        } catch (err) {
            console.error("[JACK] PIPELINE FATAL:", err.message);
            res.status(500).json({ error: err.message });
        }
    });

    app.get('/api/docs/tree', (req, res) => {
        try {
            if (!fs.existsSync(OBSIDIAN_13_DOCS_PATH)) return res.json({ tree: [] });
            const folders = fs.readdirSync(OBSIDIAN_13_DOCS_PATH, { withFileTypes: true })
                .filter(dirent => dirent.isDirectory())
                .map(dirent => {
                    const files = fs.readdirSync(path.join(OBSIDIAN_13_DOCS_PATH, dirent.name)).filter(f => f.endsWith('.md'));
                    return { folder: dirent.name, files: files };
                });
            res.json({ tree: folders });
        } catch (err) { res.status(500).json({ error: err.message }); }
    });

    app.post('/api/docs/read', (req, res) => {
        try {
            const { folder, file } = req.body;
            if (!folder || !file) return res.status(400).json({ error: "Missing folder or file parameters." });

            const filePath = path.join(OBSIDIAN_13_DOCS_PATH, folder.replace(/[^a-zA-Z0-9_\- ]/g, '').trim(), file.replace(/[^a-zA-Z0-9_\- \.]/g, '').trim());
            if (fs.existsSync(filePath)) res.json({ content: fs.readFileSync(filePath, 'utf8') });
            else res.status(404).json({ error: "File not found in vault." });
        } catch (err) { res.status(500).json({ error: err.message }); }
    });

    app.post('/api/docs/synthesize', async (req, res) => {
        try {
            const { folder } = req.body;
            if (!folder) return res.status(400).json({ error: "Missing folder parameter." });

            const targetDir = path.join(OBSIDIAN_13_DOCS_PATH, folder.replace(/[^a-zA-Z0-9_\- ]/g, '').trim());
            if (!fs.existsSync(targetDir)) return res.status(404).json({ error: "Folder not found in vault." });

            const files = fs.readdirSync(targetDir).filter(f => f.endsWith('.md') && !f.toLowerCase().endsWith('_overview.md'));
            if (files.length === 0) return res.status(400).json({ error: "No intelligence files found to synthesize." });

            let combinedText = "";
            files.forEach(file => {
                combinedText += `\n\n--- DOCUMENT: ${file} ---\n${fs.readFileSync(path.join(targetDir, file), 'utf8')}`;
            });

            const prompt = `You are an elite Warlord Intelligence Agent. I am providing you with multiple documents from the vault folder '${folder}'. Synthesize this raw data into a single, comprehensive précis. Extract the most critical overarching themes, core strategies, and actionable intelligence found across all the files. Do not simply list the files. Connect the concepts. Format your response in clean Markdown with distinct headers.\n\nVAULT DATA:\n${combinedText.substring(0, 15000)}`;
            const payload = JSON.stringify({ model: "llama3", prompt: prompt, stream: false });

            const options = {
                hostname: '127.0.0.1', port: 11434, path: '/api/generate', method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) }
            };

            const ollamaReq = Http.request(options, (ollamaRes) => {
                let data = '';
                ollamaRes.on('data', (chunk) => data += chunk);
                ollamaRes.on('end', () => {
                    try { res.json({ synthesis: JSON.parse(data).response }); } 
                    catch (e) { res.status(500).json({ error: "Agent returned corrupt data during synthesis." }); }
                });
            });
            ollamaReq.on('error', (e) => res.status(500).json({ error: "Failed to reach Ollama engine." }));
            ollamaReq.write(payload);
            ollamaReq.end();
        } catch (err) { res.status(500).json({ error: err.message }); }
    });

    app.post('/api/docs/save-overview', (req, res) => {
        try {
            const { folder, content } = req.body;
            if (!folder || !content) return res.status(400).json({ error: "Missing payload data." });

            const safeFolder = folder.replace(/[^a-zA-Z0-9_\- ]/g, '').trim();
            const targetDir = path.join(OBSIDIAN_13_DOCS_PATH, safeFolder);
            if (!fs.existsSync(targetDir)) return res.status(404).json({ error: "Target folder not found." });

            const fileName = `${safeFolder.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()}_overview.md`;
            const filePath = path.join(targetDir, fileName);
            
            fs.writeFileSync(filePath, content, "utf8");
            console.log(`[JACK] Directory overview updated -> ${filePath}`);
            res.json({ success: true, path: filePath, generatedName: fileName });
        } catch (err) {
            console.error("[JACK] OVERVIEW SAVE FATAL:", err.message);
            res.status(500).json({ error: err.message });
        }
    });

    app.use((req, res) => res.redirect('/exec'));

    app.listen(UI_PORT, () => {
        console.log(`[JACK] Warlord UI Server running on http://localhost:${UI_PORT}`);
    });

    // ==========================================================================
    // MASTER WEBSOCKET BRIDGE (UNIFIED PIPELINE)
    // ==========================================================================
    const WS_PORT = 8081;
    const httpServer = Http.createServer();
    // Binds explicitly to 0.0.0.0 to prevent Windows network routing ghosts
    wsServer = new WebSocket.Server({ server: httpServer, host: '0.0.0.0' }); 

    wsServer.on("connection", (ws) => {
        writeToObsidian("WEBSOCKET TELEMETRY PIPELINE STABILIZED // FRONTEND CONNECTED");
        console.log('[JACK] Frontend UI connected to MCNC Master Pipeline.');
        
        ws.send(JSON.stringify({
            type: "SYSTEM_STATE_SNAPSHOT", fleet: executionFleetState,
            metrics: getSystemMetrics(), tasks: getRecentTasks(),
            checkpoint: "EC4BE8972DFCEE8D7A2220ED84658BB4450BD66E472B3F11B32501D85FA73A7C"
        }));

        ws.on("message", async (message) => {
            try {
                const packet = JSON.parse(message);
                
                // --- 01 EXEC LOGIC ---
                if (packet.type === 'SWITCH_BRAIN') {
                    activeProvider = packet.provider;
                    activeModel = packet.model;
                    console.log(`[JACK] Brain Switched -> Provider: ${activeProvider.toUpperCase()} | Model: ${activeModel}`);
                } 
                else if (packet.type === 'MONTY_EXEC_DISPATCH') {
                    console.log(`[JACK] Routing prompt to ${activeProvider.toUpperCase()} (${activeModel}): "${packet.promptText}"`);
                    
                    // Sending execution ping back to the 01 Exec glass
                    setTimeout(() => {
                        ws.send(JSON.stringify({
                            type: 'MONTY_EXEC_UPDATE',
                            speaker: 'CHIEF OF STAFF // MONTY 2',
                            text: `Link active on ${activeProvider.toUpperCase()}. Awaiting raw instructions.`,
                            color: 'Goldenrod'
                        }));
                    }, 600); 
                }

                // --- 02 WAR ROOM & MASTER LOGIC ---
                else if (packet.type === "WAR_ROOM_DISPATCH") {
                    const { mode, promptText } = packet;
                    writeWarRoomTranscript(`MIKE (${mode.toUpperCase()})`, promptText);
                    broadcastToViewers({ type: "WAR_ROOM_UPDATE", speaker: "MIKE // WARLORD", text: promptText, mode: mode, color: "var(--gold-core)" });
                } 
                else if (packet.type === "WAR_ROOM_APPROVE") {
                    console.log(`[JACK] War Room Approval received. Bypassing sandbox rules.`);
                    broadcastToViewers({ type: "WAR_ROOM_UPDATE", speaker: "SYSTEM // GATE KEEPER", text: "Authorization accepted.", mode: packet.mode, color: "var(--emerald-core)" });
                } 
                else if (packet.type === "KANBAN_NEW_IDEA") {
                    queueTaskInObsidian("PROJECT MANAGER", packet.ideaText);
                } 
                else if (packet.type === "UI_TOGGLE_MIC") {
                    isMicRecording = !isMicRecording;
                    console.log(`[JACK] Mic toggle requested. Status: ${isMicRecording ? 'Listening' : 'Idle'}`);
                    
                    // Unified broadcast to update UI on all tabs
                    broadcastToViewers({ 
                        type: "UI_MIC_STATUS", 
                        status: isMicRecording ? 'listening' : 'idle' 
                    });
                    
                    // Triggers legacy whisper pipeline if still active in War Room
                    broadcastToViewers({ type: "SYS_TOGGLE_MIC" }); 
                } 
                else if (packet.type === "SYS_MIC_STATUS") {
                    broadcastToViewers({ type: "UI_MIC_STATUS", status: packet.status });
                } 
                else if (packet.type === "SYS_MIC_TRANSCRIPT") {
                    broadcastToViewers({ type: "UI_MIC_TRANSCRIPT", text: packet.text });
                }

                // --- 04 REVIEW MEDIA LOGIC (YOUTUBE EXTRACT) ---
                else if (packet.type === 'EXTRACT_MEDIA_REQUEST') {
                    console.log(`[JACK] Extraction request received for target: ${packet.url}`);
                    try {
                        ws.send(JSON.stringify({ type: 'EXTRACT_MEDIA_PROGRESS', payload: `[ SYSTEM ] Locating and downloading YouTube transcript...` }));
                        
                        const transcriptObj = await YoutubeTranscript.fetchTranscript(packet.url);
                        const rawText = transcriptObj.map(t => t.text).join(' ');
                        
                        ws.send(JSON.stringify({ type: 'EXTRACT_MEDIA_PROGRESS', payload: `[ SYSTEM ] Transcript acquired (${rawText.length} chars). Synthesizing intelligence...` }));

                        let summary = "";
                        try {
                            const ollamaResponse = await axios.post('http://127.0.0.1:11434/api/generate', {
                                model: "qwen2.5:latest",
                                prompt: `You are a Warlord intelligence agent. Extract key takeaways, core concepts, and actionable insights from this raw video transcript. Filter out sponsor segments, noise, and fluff. Format output in strict, readable markdown.\n\nTRANSCRIPT:\n${rawText}`,
                                stream: false
                            }, { timeout: 180000 });

                            summary = ollamaResponse.data.response;
                        } catch (ollamaErr) {
                            console.warn("[JACK] Ollama offline or timeout. Engaging Warlord Local Fallback Parser...");
                            summary = `### [ WARLORD INTELLIGENCE PRÉCIS // OFFLINE FALLBACK MODE ]\n\n` +
                                      `**Target URL:** ${packet.url}\n` +
                                      `**Transcript Length:** ${rawText.length} characters\n\n` +
                                      `#### Core Extracted Text:\n` +
                                      `> ${rawText.substring(0, 1500)}...\n\n` +
                                      `*Note: Processed via local fallback engine because the primary local AI container was offline.*`;
                        }

                        ws.send(JSON.stringify({ type: 'EXTRACT_MEDIA_RESPONSE', payload: summary }));
                        console.log(`[JACK] Précis payload delivered to MCNC Master.`);
                    } catch (err) {
                        console.error("[CRITICAL ERROR] EXTRACTION PIPELINE CRASHED:", err.stack || err.message);
                        ws.send(JSON.stringify({ 
                            type: 'EXTRACT_MEDIA_ERROR', 
                            payload: `[ WARLORD ERROR // CRASH DETECTED ]\nPipeline failed to process target.\n\nERROR MESSAGE:\n${err.message}` 
                        }));
                    }
                }
            } catch (err) { console.error("CORRUPT PACKET INTERCEPTED: " + err.message); }
        });

        ws.on('close', () => console.log('[JACK] Frontend UI disconnected.'));
    });

    setInterval(() => {
        broadcastToViewers({ type: "SYSTEM_METRICS_UPDATE", metrics: getSystemMetrics() });
    }, 2000);

    httpServer.listen(WS_PORT, '0.0.0.0', () => {
        console.log(`[JACK] Warlord WebSocket Bridge running on ws://0.0.0.0:${WS_PORT}`);
        console.log("==================================================================");
        console.log("MCNC RUNTIME ACTIVE // LIVE STREAMING ENGAGED");
        console.log("==================================================================");
    });
}

function broadcastToViewers(data) {
    if (!wsServer) return;
    const payload = JSON.stringify(data);
    wsServer.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) client.send(payload);
    });
}

initializeMcncBackend();