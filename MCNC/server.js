require('dotenv').config();
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const multer = require('multer');
const { exec } = require('child_process');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Middleware Setup
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// EJS View Engine Setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Directory Paths - Consolidated Root Structure
const WASP_DOCS_PATH = path.join('C:', 'Warlord_Inc', 'Warlord_WASP');
const MCNC_PATH = path.join(WASP_DOCS_PATH, 'MCNC');
const SOULS_PATH = path.join(MCNC_PATH, 'souls');
const VAULT_PATH = path.join(MCNC_PATH, 'vault');
const LOGS_PATH = path.join(MCNC_PATH, 'MCNC_Logs');
const TOOLS_PATH = path.join(MCNC_PATH, 'tools');
const SKILLS_PATH = path.join(VAULT_PATH, 'Skills');
const UPLOADS_PATH = path.join(__dirname, 'uploads');

[LOGS_PATH, UPLOADS_PATH, VAULT_PATH, TOOLS_PATH, SKILLS_PATH].forEach(dir => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// Multer Storage for Multimodal Screenshots & Files
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, UPLOADS_PATH),
    filename: (req, file, cb) => cb(null, `${Date.now()}_${file.originalname}`)
});
const upload = multer({ storage });

// Core Directive & Dynamic Context Loaders
const WARLORD_CORE_DIRECTIVE = `You are MONTY, Chief of Staff for Warlord MCNC Base 1.
Your mandate under Rhythm Holdings and W.A.S.P. is operational control, planning, and agent orchestration. Mike (Warlord) is Commander.
DIRECTORS: Tess (Quant), Charlie (MQL5/Python), Roxy (UI/UX), Jack (Marketing/Node).
SOP: Full functional code only. Solid DodgerBlue, OrangeRed, Goldenrod lines only. Zero filler.
RHYTHM MULTIPLIER: Enforce 0.0 to 1.0 scaling on quantitative and telemetry arrays. Fallback default 1.0 to prevent NaN memory poisoning.`;

// Vault Loader
function loadVaultRecursive(dir) {
    let combinedContent = "";
    if (!fs.existsSync(dir)) return combinedContent;

    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            if (!entry.name.startsWith('.') && entry.name.toLowerCase() !== 'archive') {
                combinedContent += loadVaultRecursive(fullPath);
            }
        } else if (entry.isFile() && (entry.name.endsWith('.md') || entry.name.endsWith('.txt'))) {
            try {
                combinedContent += `\n--- BEGIN VAULT FILE: ${entry.name} ---\n`;
                combinedContent += fs.readFileSync(fullPath, 'utf8') + "\n";
                combinedContent += `--- END VAULT FILE: ${entry.name} ---\n`;
            } catch (err) {
                console.error(`[VAULT READ ERROR] File ${entry.name}:`, err.message);
            }
        }
    }
    return combinedContent;
}

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
        console.error(`[SOUL LOAD ERROR]:`, e.message);
        return "";
    }
}

function loadCommanderProtocol() {
    try {
        const protocolFile = path.join(VAULT_PATH, 'AGENT_PROTOCOL_Mike_CEO_of_Rhythm_Trading.md');
        if (fs.existsSync(protocolFile)) return fs.readFileSync(protocolFile, 'utf8');
        
        if (!fs.existsSync(SOULS_PATH)) return "";
        const files = fs.readdirSync(SOULS_PATH);
        const match = files.find(f => f.toLowerCase().includes('mike') && f.toLowerCase().includes('ceo'));
        return match ? fs.readFileSync(path.join(SOULS_PATH, match), 'utf8') : "";
    } catch (e) {
        console.error(`[COMMANDER PROTOCOL LOAD ERROR]:`, e.message);
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

// ==========================================
// WARLORD MCP TOOL INTEGRATION: YOUTUBE
// ==========================================
const mcpTools = [{
    type: "function",
    function: {
        name: "extract_youtube_transcript",
        description: "Extracts the full text transcript from a YouTube video URL. Use this IMMEDIATELY to read a video when the Commander provides a YouTube link.",
        parameters: {
            type: "object",
            properties: {
                url: {
                    type: "string",
                    description: "The full YouTube video URL provided by the Commander."
                }
            },
            required: ["url"]
        }
    }
}];

function executeYouTubeScraper(url) {
    return new Promise((resolve) => {
        exec(`python youtube_scraper.py "${url}"`, (error, stdout, stderr) => {
            if (error) {
                resolve({ status: "error", error: `CRITICAL FAILURE: ${error.message}` });
                return;
            }
            try {
                resolve(JSON.parse(stdout));
            } catch (err) {
                resolve({ status: "error", error: `PARSE FAILURE: ${err.message}` });
            }
        });
    });
}
// ==========================================

// Multi-Tier Brain Dispatcher
async function dispatchToBrain(systemPrompt, rawBody) {
    const validContent = extractPromptText(rawBody);
    const requestedModel = rawBody?.selectedModel || rawBody?.model || 'anthropic/claude-sonnet-4.6';
    const reqModelLower = requestedModel.toLowerCase();

    console.log(`\n========================================`);
    console.log(`[DISPATCH TRIGGERED] -> Target Model / Brain: "${requestedModel}"`);

    let messages = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: validContent }
    ];

    // Tier 1: Local Ollama
    if (reqModelLower.includes('local') || reqModelLower.includes('qwen') || reqModelLower.includes('ollama')) {
        const ollamaModel = reqModelLower.includes('qwen') ? 'qwen2.5-coder:latest' : 'llama3:latest';
        console.log(`[ROUTING TIER 1: OLLAMA LOCAL] -> ${ollamaModel}`);
        
        const response = await fetch('http://127.0.0.1:11434/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: ollamaModel,
                messages: messages,
                stream: false,
                options: { temperature: 0.2 }
            })
        });

        if (!response.ok) throw new Error(`Local Ollama Error ${response.status}:${await response.text()}`);
        const data = await response.json();
        return { reply: data.message?.content?.trim() || "Empty response.", modelUsed: ollamaModel };
    }

    // Tier 2: Groq
    if (reqModelLower.includes('groq') || reqModelLower.includes('llama-3.3-70b-versatile')) {
        const groqKey = process.env.GROQ_API_KEY?.trim();
        if (!groqKey) throw new Error("GROQ_API_KEY missing from .env");

        console.log(`[ROUTING TIER 2: GROQ API] -> ${requestedModel}`);
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${groqKey}`
            },
            body: JSON.stringify({
                model: requestedModel.replace(' (Groq)', ''),
                messages: messages,
                temperature: 0.2,
                max_tokens: 4096
            })
        });

        if (response.ok) {
            const data = await response.json();
            return { reply: data.choices?.[0]?.message?.content?.trim() || "Empty response from Groq.", modelUsed: requestedModel };
        }
        throw new Error(`Groq API Error: ${await response.text()}`);
    }

    // Tier 3: NVIDIA NIM
    if (reqModelLower.includes('nim') || reqModelLower.includes('nemotron') || reqModelLower.includes('nvidia') || reqModelLower.includes('deepseek-v4') || reqModelLower.includes('meta/llama-3.1')) {
        const nimKey = process.env.NVIDIA_NIM_KEY?.trim();
        if (!nimKey) throw new Error("NVIDIA_NIM_KEY missing from .env");

        console.log(`[ROUTING TIER 3: NVIDIA NIM] -> ${requestedModel}`);
        
        let reqPayload = {
            model: requestedModel,
            messages: messages,
            temperature: 0.2,
            max_tokens: 2048
        };
        
        if (!rawBody.disableTools) {
            reqPayload.tools = mcpTools;
            reqPayload.tool_choice = "auto";
        }

        let response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${nimKey}`
            },
            body: JSON.stringify(reqPayload)
        });

        if (!response.ok) throw new Error(`NVIDIA NIM Error ${response.status}:${await response.text()}`);
        let data = await response.json();
        let msgObj = data.choices?.[0]?.message;

        if (msgObj && msgObj.tool_calls) {
            console.log(`[TOOL CALL DETECTED] -> NVIDIA NIM executing ${msgObj.tool_calls[0].function.name}`);
            messages.push(msgObj);
            
            for (const toolCall of msgObj.tool_calls) {
                if (toolCall.function.name === "extract_youtube_transcript") {
                    const args = JSON.parse(toolCall.function.arguments);
                    console.log(`[SCRAPING URL] -> ${args.url}`);
                    const scraperResult = await executeYouTubeScraper(args.url);
                    messages.push({
                        role: 'tool',
                        tool_call_id: toolCall.id,
                        name: toolCall.function.name,
                        content: JSON.stringify(scraperResult)
                    });
                }
            }

            response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${nimKey}`
                },
                body: JSON.stringify({
                    model: requestedModel,
                    messages: messages,
                    temperature: 0.2,
                    max_tokens: 2048
                })
            });
            if (!response.ok) throw new Error(`NVIDIA NIM Tool Pass Error: ${await response.text()}`);
            data = await response.json();
            return { reply: data.choices?.[0]?.message?.content?.trim() || "Empty tool response.", modelUsed: requestedModel };
        }

        return { reply: msgObj?.content?.trim() || "Empty response from NVIDIA NIM.", modelUsed: requestedModel };
    }

    // Tier 4: OpenRouter
    const openRouterKey = process.env.OPENROUTER_API_KEY?.trim();
    if (!openRouterKey) throw new Error("OPENROUTER_API_KEY missing from .env");

    let targetModel = requestedModel;
    console.log(`[ROUTING TIER 4: OPENROUTER] -> ${targetModel}`);

    let reqPayload = {
        model: targetModel,
        messages: messages,
        temperature: 0.2,
        max_tokens: 4096
    };
    
    if (!rawBody.disableTools) {
        reqPayload.tools = mcpTools;
        reqPayload.tool_choice = "auto";
    }

    let response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${openRouterKey}`,
            'HTTP-Referer': 'http://localhost:5173',
            'X-Title': 'Warlord MCNC Master'
        },
        body: JSON.stringify(reqPayload)
    });

    if (!response.ok) throw new Error(`OpenRouter Error ${response.status}:${await response.text()}`);
    let data = await response.json();
    let msgObj = data.choices?.[0]?.message;

    if (msgObj && msgObj.tool_calls) {
        console.log(`[TOOL CALL DETECTED] -> OpenRouter executing ${msgObj.tool_calls[0].function.name}`);
        messages.push(msgObj);
        
        for (const toolCall of msgObj.tool_calls) {
            if (toolCall.function.name === "extract_youtube_transcript") {
                const args = JSON.parse(toolCall.function.arguments);
                console.log(`[SCRAPING URL] -> ${args.url}`);
                const scraperResult = await executeYouTubeScraper(args.url);
                messages.push({
                    role: 'tool',
                    tool_call_id: toolCall.id,
                    name: toolCall.function.name,
                    content: JSON.stringify(scraperResult)
                });
            }
        }

        response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${openRouterKey}`,
                'HTTP-Referer': 'http://localhost:5173',
                'X-Title': 'Warlord MCNC Master'
            },
            body: JSON.stringify({
                model: targetModel,
                messages: messages,
                temperature: 0.2,
                max_tokens: 4096
            })
        });
        if (!response.ok) throw new Error(`OpenRouter Tool Pass Error: ${await response.text()}`);
        data = await response.json();
        return { reply: data.choices?.[0]?.message?.content?.trim() || "Empty tool response.", modelUsed: targetModel };
    }

    return { reply: msgObj?.content?.trim() || "Empty response from OpenRouter.", modelUsed: targetModel };
}

// REST Endpoints
app.post('/api/chat', async (req, res) => {
    try {
        const fullVaultDoctrine = loadVaultRecursive(VAULT_PATH);
        const soul = loadSoul('monty');
        const commanderProtocol = loadCommanderProtocol();
        const systemPrompt = `${WARLORD_CORE_DIRECTIVE}\n\n[COMMANDER MIKE PROTOCOL]:\n${commanderProtocol}\n\n[WARLORD RECURSIVE VAULT]:\n${fullVaultDoctrine}\n\n[MONTY PROTOCOL]:\n${soul}`;
        
        const { reply, modelUsed } = await dispatchToBrain(systemPrompt, req.body);
        return res.json({ reply, speaker: 'CHIEF OF STAFF // MONTY', activeModelUsed: modelUsed });
    } catch (err) {
        console.error('[CHAT ERROR]:', err.message);
        return res.status(500).json({ reply: `Daemon execution error: ${err.message}`, speaker: 'SYSTEM // ERROR' });
    }
});

// HARVEST ENDPOINT (PURIFIES SOURCE INTELLIGENCE)
app.post('/api/harvest', async (req, res) => {
    try {
        const { url, contentDump, topicDomain, specialization } = req.body;
        let extractionSource = "";

        if (url) {
            const scraperResult = await executeYouTubeScraper(url);
            if (scraperResult.status === 'error' || scraperResult.error || !scraperResult.data) {
                return res.status(500).json({ error: scraperResult.error || "CRITICAL FAILURE: Scraper returned zero data. YouTube may be blocking the request or subtitles are disabled for this video." });
            }
            extractionSource = scraperResult.data;
        } else if (contentDump) {
            extractionSource = contentDump;
        } else {
            return res.status(400).json({ error: 'No data source provided.' });
        }

        if (!extractionSource || typeof extractionSource !== 'string' || extractionSource.trim().length === 0) {
            return res.status(500).json({ error: 'CRITICAL FAILURE: Pipeline returned zero vectors.' });
        }

        const universalPrompt = `You are the Triage Judge for Warlord MCNC. 
        Analyze the following data under the target domain: [${topicDomain} ->${specialization}]. 
        Extract core factual vectors, technical specifications, terminal commands, or actionable instructions.
        
        NEGATIVE CONSTRAINTS (STRICT):
        - BANNED: Never include affiliate links, referral links, or coupon/discount codes.
        - BANNED: Never include pricing tiers, sales pitches, sponsor promotions, or coaching/consulting offers.
        - BANNED: Never include external communities (Discord, Skool, Telegram, WhatsApp groups, Patreon) or channel subscription requests.
        - Strip 100% of narrative fluff, video introductions, and conversational filler.
        
        Return a clean, structured Markdown payload.`;

        const analysisResult = await dispatchToBrain(universalPrompt, { 
            model: 'openai/gpt-4o', 
            content: extractionSource, 
            disableTools: true 
        });

        return res.json({ status: 'SUCCESS', nugget: analysisResult.reply });
    } catch (err) {
        console.error('[HARVEST ERROR]:', err.message);
        return res.status(500).json({ error: err.message });
    }
});

// VAULT DOCUMENT SAVE & SYNTHESIS ENDPOINT (CANONICAL SINGLE-FILE ARCHITECTURE)
app.post('/api/docs/save', async (req, res) => {
    try {
        const { domain, specialization, content, pruneAndMerge } = req.body;
        if (!domain || !specialization || !content) {
            return res.status(400).json({ error: 'Missing payload data.' });
        }

        const safeDomain = domain.replace(/[^a-z0-9 _-]/gi, '').trim();
        const safeSpec = specialization.replace(/[^a-z0-9 _-]/gi, '').trim();
        const targetDir = path.join(VAULT_PATH, safeDomain);
        
        if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir, { recursive: true });
        }

        let filename = req.body.filename;
        if (!filename || !filename.endsWith('.md')) {
            filename = `${safeSpec.replace(/\s+/g, '_')}.md`;
        }

        const filePath = path.join(targetDir, filename);
        let finalContent = content;

        if (fs.existsSync(filePath) && pruneAndMerge) {
            console.log(`[VAULT SYNTHESIS TRIGGERED] -> Merging into canonical file: ${filename}`);
            const existingContent = fs.readFileSync(filePath, 'utf8');

            const mergePrompt = `You are the Lead Editor for the Warlord Vault.
            Your task is to merge newly harvested intelligence into the existing master dossier for [${safeDomain} ->${safeSpec}].
            
            RULES & EXTRACTION OBJECTIVE:
            1. Consolidate overlapping information and eliminate duplication.
            2. Integrate novel technical parameters, steps, configurations, and facts seamlessly into existing sections.
            3. RUTHLESSLY PRUNE: Remove superseded, deprecated, or contradictory older details.
            
            STRICT NEGATIVE CONSTRAINTS (ZERO TOLERANCE):
            1. BANNED: Affiliate links, discount/promo codes (e.g., Hostinger coupons, referral links).
            2. BANNED: External communities, paid masterminds, coaching calls, Skool/Discord/Telegram links.
            3. BANNED: Resource sections promoting external courses, strategy sessions, or channel subscriptions.
            4. If any such promotional text exists in the existing document or the new intelligence, STRIP IT OUT COMPLETELY.
            
            OUTPUT:
            Keep the output clean, authoritative, dense, and 100% current Markdown.
            Output ONLY the updated markdown dossier. Do not include conversational introductions or markdown block fences (\`\`\`markdown).`;

            const mergeBody = `--- EXISTING MASTER DOSSIER ---\n${existingContent}\n\n--- NEW HARVESTED INTELLIGENCE ---\n${content}`;

            const mergeResult = await dispatchToBrain(mergePrompt, {
                model: 'openai/gpt-4o',
                content: mergeBody,
                disableTools: true
            });

            if (mergeResult && mergeResult.reply && mergeResult.reply.trim().length > 50) {
                finalContent = mergeResult.reply.trim();
                finalContent = finalContent.replace(/^```markdown\s*/i, '').replace(/^```\s*/i, '').replace(/```$/i, '').trim();
                console.log(`[VAULT SYNTHESIS COMPLETE] -> Successfully unified dossier without promotional fluff.`);
            }
        }

        fs.writeFileSync(filePath, finalContent, 'utf8');
        console.log(`[VAULT WRITE SUCCESS] -> Saved payload to ${targetDir}\\${filename}`);
        res.json({ status: 'SUCCESS', message: `Saved to ${safeDomain}/${filename}`, canonicalFile: filename });
    } catch (err) {
        console.error('[DOC SAVE ERROR]:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// VAULT DOCUMENT LIST ENDPOINT (RECURSIVE DIRECTORY SCANNER)
app.get('/api/docs/list', (req, res) => {
    try {
        const results = [];

        function scanDir(dir, currentCategory = 'GENERAL RESEARCH') {
            if (!fs.existsSync(dir)) return;
            const entries = fs.readdirSync(dir, { withFileTypes: true });

            for (const entry of entries) {
                const fullPath = path.join(dir, entry.name);
                if (entry.isDirectory()) {
                    if (!entry.name.startsWith('.') && entry.name.toLowerCase() !== 'archive') {
                        scanDir(fullPath, entry.name);
                    }
                } else if (entry.isFile() && (entry.name.endsWith('.md') || entry.name.endsWith('.txt'))) {
                    try {
                        const content = fs.readFileSync(fullPath, 'utf8');
                        const stats = fs.statSync(fullPath);
                        
                        let niche = entry.name.replace(/\.(md|txt)$/i, '').replace(/_/g, ' ');

                        results.push({
                            id: Buffer.from(fullPath).toString('base64'),
                            category: currentCategory,
                            niche: niche,
                            title: entry.name,
                            type: entry.name.toUpperCase().includes('ROE') ? 'HARD CONSTRAINT' : 'DOSSIER',
                            purity: '100% CANONICAL',
                            updated: stats.mtime.toISOString().split('T')[0],
                            content: content,
                            filePath: fullPath
                        });
                    } catch (readErr) {
                        console.error(`[DOC READ FAILED] ${entry.name}:`, readErr.message);
                    }
                }
            }
        }

        scanDir(VAULT_PATH);
        return res.json({ status: 'SUCCESS', count: results.length, docs: results });
    } catch (err) {
        console.error('[DOCS LIST ERROR]:', err.message);
        return res.status(500).json({ error: err.message });
    }
});

// VAULT DOCUMENT PRUNE ENDPOINT (DISTILLATION ENGINE)
app.post('/api/docs/prune', async (req, res) => {
    try {
        const { filePath } = req.body;
        if (!filePath) return res.status(400).json({ error: 'No filePath specified for pruning.' });

        const normalized = path.normalize(filePath);
        if (!normalized.startsWith(path.normalize(VAULT_PATH))) {
            return res.status(403).json({ error: 'Access denied: Target outside Vault root.' });
        }

        if (!fs.existsSync(normalized)) {
            return res.status(404).json({ error: 'File not found on disk.' });
        }

        const { pruneDocument } = require('./tools/prune_doc');
        console.log(`[VAULT PRUNE] Initiating distillation: ${path.basename(normalized)}`);

        const success = await pruneDocument(normalized);
        if (success) {
            const updatedContent = fs.readFileSync(normalized, 'utf8');
            console.log(`[VAULT PRUNE SUCCESS] Distilled: ${path.basename(normalized)}`);
            return res.json({ status: 'SUCCESS', content: updatedContent });
        } else {
            return res.status(500).json({ error: 'Pruning engine failed to process document.' });
        }
    } catch (err) {
        console.error('[VAULT PRUNE ERROR]', err.message);
        return res.status(500).json({ error: err.message });
    }
});

// VAULT DOCUMENT DELETE / PRUNE ENDPOINT
app.post('/api/docs/delete', (req, res) => {
    try {
        const { filePath } = req.body;
        if (!filePath) return res.status(400).json({ error: 'No filePath specified for deletion.' });

        const normalized = path.normalize(filePath);
        if (!normalized.startsWith(path.normalize(VAULT_PATH))) {
            return res.status(403).json({ error: 'Access denied: Target outside Vault root.' });
        }

        if (fs.existsSync(normalized)) {
            fs.unlinkSync(normalized);
            console.log(`[VAULT PRUNE SUCCESS] -> Removed: ${normalized}`);
            return res.json({ status: 'SUCCESS', message: `Deleted ${path.basename(normalized)}` });
        } else {
            return res.status(404).json({ error: 'File not found on disk.' });
        }
    } catch (err) {
        console.error('[DOCS DELETE ERROR]:', err.message);
        return res.status(500).json({ error: err.message });
    }
});

// =========================================================================
// MONTY AUTONOMOUS ASSET ENGINE: TOOLS & SKILLS REPOSITORIES
// =========================================================================

// 1. TOOL DEPLOYER: Deploys runtime script + companion README to tools/
app.post('/api/tools/deploy', (req, res) => {
    try {
        const { filename, code, readme, owner } = req.body;
        if (!filename || !code) {
            return res.status(400).json({ error: "Missing filename or code payload." });
        }

        // Optional: Run through guardrail filter if present
        const guardrailPath = path.join(TOOLS_PATH, 'guardrail_filter.js');
        if (fs.existsSync(guardrailPath)) {
            try {
                const { inspectCommand } = require(guardrailPath);
                const check = inspectCommand(code);
                if (!check.allowed) {
                    console.error(`[GUARDRAIL REJECTION] Tool deployment blocked: ${check.reason}`);
                    return res.status(403).json({ error: `Pre-tool guardrail rejected deployment: ${check.reason}` });
                }
            } catch (gErr) {
                console.warn(`[GUARDRAIL WARNING] Guardrail module execution skipped:`, gErr.message);
            }
        }

        // Deploy executable script (.js, .py, .sh)
        const targetToolPath = path.join(TOOLS_PATH, filename);
        fs.writeFileSync(targetToolPath, code, 'utf8');

        // Deploy companion descriptor README (.md)
        const baseName = filename.substring(0, filename.lastIndexOf('.')) || filename;
        const readmeContent = readme || `# TOOL: ${baseName}\n**Owner:** ${owner || 'Jack'}\n**Deployed:** ${new Date().toISOString()}\n\nExecution ready.`;
        const targetReadmePath = path.join(TOOLS_PATH, `${baseName}.md`);
        fs.writeFileSync(targetReadmePath, readmeContent, 'utf8');

        console.log(`[MONTY // TOOLS] Deployed runtime asset: ${filename} and ${baseName}.md to ${TOOLS_PATH}`);
        return res.json({ 
            status: 'SUCCESS', 
            message: `Tool ${filename} deployed successfully to runtime.`,
            paths: { code: targetToolPath, readme: targetReadmePath }
        });
    } catch (err) {
        console.error('[MONTY TOOL DEPLOY ERROR]:', err.message);
        return res.status(500).json({ error: err.message });
    }
});

// 2. SKILL DEPLOYER: Deploys procedural playbooks to vault/Skills/[category]
app.post('/api/skills/deploy', (req, res) => {
    try {
        const { filename, category, content } = req.body;
        if (!filename || !content) {
            return res.status(400).json({ error: "Missing filename or playbook content." });
        }

        const safeCategory = category ? category.replace(/[^a-z0-9 _-]/gi, '').trim() : '';
        const targetDir = safeCategory ? path.join(SKILLS_PATH, safeCategory) : SKILLS_PATH;

        if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir, { recursive: true });
        }

        const safeFilename = filename.endsWith('.md') ? filename : `${filename}.md`;
        const skillPath = path.join(targetDir, safeFilename);

        fs.writeFileSync(skillPath, content, 'utf8');
        console.log(`[MONTY // SKILLS] Deployed procedural playbook: ${safeFilename} to ${targetDir}`);
        return res.json({
            status: 'SUCCESS',
            message: `Skill ${safeFilename} deployed successfully.`,
            filePath: skillPath
        });
    } catch (err) {
        console.error('[MONTY SKILL DEPLOY ERROR]:', err.message);
        return res.status(500).json({ error: err.message });
    }
});

// 3. TOOL RUNTIME REGISTRY: Telemetry scanner for Tab 14
app.get('/api/tools/list', (req, res) => {
    try {
        if (!fs.existsSync(TOOLS_PATH)) return res.json({ tools: [] });

        const files = fs.readdirSync(TOOLS_PATH);
        const toolsMap = {};

        files.forEach(file => {
            const ext = path.extname(file).toLowerCase();
            const baseName = path.basename(file, ext);

            if (!toolsMap[baseName]) {
                toolsMap[baseName] = { name: baseName, executable: null, readme: null, modified: null };
            }

            const stats = fs.statSync(path.join(TOOLS_PATH, file));
            toolsMap[baseName].modified = stats.mtime.toISOString().split('T')[0];

            if (ext === '.js' || ext === '.py' || ext === '.sh') {
                toolsMap[baseName].executable = file;
                toolsMap[baseName].type = ext.replace('.', '').toUpperCase();
            } else if (ext === '.md') {
                toolsMap[baseName].readme = file;
                toolsMap[baseName].documentation = fs.readFileSync(path.join(TOOLS_PATH, file), 'utf8');
            }
        });

        const activeTools = Object.values(toolsMap).filter(t => t.executable !== null);
        return res.json({ status: 'SUCCESS', count: activeTools.length, tools: activeTools });
    } catch (err) {
        console.error('[TOOLS LIST ERROR]:', err.message);
        return res.status(500).json({ error: err.message });
    }
});

// Standard Uploads & System Status
app.post('/api/upload', upload.single('file'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded.' });
    res.json({ status: 'UPLOADED', filePath: req.file.path, filename: req.file.filename });
});

app.get('/api/status', (req, res) => {
    res.json({ 
        status: 'ONLINE', 
        bridge: 'ACTIVE', 
        ws_clients_connected: wss.clients.size,
        tools_registered: fs.existsSync(TOOLS_PATH) ? fs.readdirSync(TOOLS_PATH).filter(f => !f.endsWith('.md')).length : 0
    });
});

// WebSocket Telemetry
wss.on('connection', (ws) => {
    ws.send(JSON.stringify({ type: 'TELEMETRY_CONNECTED', message: 'Base 1 Telemetry Link Established.' }));
    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            if (data.type === 'PING') ws.send(JSON.stringify({ type: 'PONG' }));
        } catch (e) {}
    });
});

const PORT = process.env.PORT || 8081;
server.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`[BASE 1 MASTER DAEMON]    : Active on port ${PORT}`);
    console.log(`[PIPELINES ACTIVE]        : OLLAMA | GROQ | NVIDIA | OPENROUTER`);
    console.log(`[AUTONOMOUS ASSETS]       : /tools & /vault/Skills ONLINE`);
    console.log(`====================================================`);
});
