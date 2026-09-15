require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const fs = require('fs');
const path = require('path');
const https = require('https');

const VAULT_ROOT = path.join(__dirname, '..', 'vault');
const EVOLUTION_DIR = path.join(VAULT_ROOT, 'System_Evolution', 'Pending');
const REJECTED_DIR = path.join(VAULT_ROOT, 'System_Evolution', 'Rejected');

const GROQ_API_KEY = process.env.GROQ_API_KEY;

[EVOLUTION_DIR, REJECTED_DIR].forEach(dir => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function callGroqJudge(promptText, retries = 3) {
    return new Promise((resolve, reject) => {
        if (!GROQ_API_KEY) return reject(new Error('GROQ_API_KEY is not defined in .env'));

        const payload = JSON.stringify({
            model: 'qwen/qwen3.8-27b',
            max_tokens: 350,
            messages: [
                {
                    role: 'system',
                    content: `You are Tess, Senior Quant and Architectural Judge for Warlord Inc.
Audit technical dossiers against the Warlord MCNC stack:
1. BACKEND: Node.js, Express, WebSockets, Local Gateways, Cron Daemons.
2. FRONTEND: React/Vite, low-latency UI telemetry.
3. TRADING: MQL5, volatility scanners, persistent memory.

Reject generic consumer AI, marketing hacks, or conceptual theory lacking code/architecture.

Respond ONLY in valid JSON:
{
  "score": <0-100>,
  "verdict": "QUALIFIED" | "REJECTED",
  "rationale": "<brief 2-sentence rationale>",
  "targetSubsystems": ["<target subsystems>"],
  "suggestedAction": "<concrete action>"
}`
                },
                {
                    role: 'user',
                    content: promptText
                }
            ],
            temperature: 0.1,
            response_format: { type: "json_object" }
        });

        const executeRequest = (attempt) => {
            const req = https.request('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${GROQ_API_KEY}`,
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(payload)
                }
            }, (res) => {
                let body = '';
                res.on('data', chunk => body += chunk);
                res.on('end', async () => {
                    if (res.statusCode === 429) {
                        const waitMatch = body.match(/try again in ([\d\.]+)s/i);
                        const waitSec = waitMatch ? parseFloat(waitMatch[1]) + 2 : 12;
                        console.log(`  [RATE LIMIT HIT] Backing off for ${waitSec.toFixed(1)}s (Attempt ${attempt}/${retries})...`);
                        if (attempt < retries) {
                            await sleep(waitSec * 1000);
                            return executeRequest(attempt + 1);
                        } else {
                            return reject(new Error(`Rate limit exceeded after ${retries} retries: ${body}`));
                        }
                    }

                    try {
                        const parsed = JSON.parse(body);
                        if (parsed.choices && parsed.choices[0]) {
                            resolve(JSON.parse(parsed.choices[0].message.content.trim()));
                        } else {
                            reject(new Error(body));
                        }
                    } catch (e) {
                        reject(e);
                    }
                });
            });

            req.on('error', reject);
            req.write(payload);
            req.end();
        };

        executeRequest(1);
    });
}

function getAllMarkdownFiles(dir) {
    let files = [];
    if (!fs.existsSync(dir)) return files;
    
    const skipFolders = ['.obsidian', 'System_Evolution', 'Archive'];

    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
        if (entry.isDirectory()) {
            if (!skipFolders.includes(entry.name)) {
                files = files.concat(getAllMarkdownFiles(path.join(dir, entry.name)));
            }
        } else if (entry.isFile() && (entry.name.endsWith('.md') || entry.name.endsWith('.txt'))) {
            files.push(path.join(dir, entry.name));
        }
    }
    return files;
}

async function evaluateDossier(filePath) {
    const filename = path.basename(filePath);
    const content = fs.readFileSync(filePath, 'utf8');

    console.log(`[TESS AUDIT] Auditing: ${filename}...`);

    try {
        const result = await callGroqJudge(`DOSSIER FILENAME: ${filename}\n\nCONTENT:\n${content.slice(0, 3000)}`);
        
        console.log(`[VERDICT] ${filename} -> Score: ${result.score}/100 | Verdict: ${result.verdict}`);

        const candidateRecord = {
            sourceDossier: filename,
            sourcePath: filePath,
            evaluatedAt: new Date().toISOString(),
            score: result.score,
            verdict: result.verdict,
            rationale: result.rationale,
            targetSubsystems: result.targetSubsystems,
            suggestedAction: result.suggestedAction
        };

        const outName = filename.replace(/\.(md|txt)$/, '.json');
        
        if (result.score >= 80 && result.verdict === 'QUALIFIED') {
            const dest = path.join(EVOLUTION_DIR, outName);
            fs.writeFileSync(dest, JSON.stringify(candidateRecord, null, 2), 'utf8');
            console.log(`  └─> [QUALIFIED] Staged for Monty: ${outName}`);
        } else {
            const dest = path.join(REJECTED_DIR, outName);
            fs.writeFileSync(dest, JSON.stringify(candidateRecord, null, 2), 'utf8');
            console.log(`  └─> [REJECTED] Archived: ${outName}`);
        }
        return true;
    } catch (err) {
        console.error(`[EVALUATION FAILED] ${filename}:`, err.message);
        return false;
    }
}

async function runEvaluationPass() {
    if (!fs.existsSync(VAULT_ROOT)) {
        console.error(`[ERROR] Vault root not found: ${VAULT_ROOT}`);
        return;
    }

    const dossiers = getAllMarkdownFiles(VAULT_ROOT);
    console.log(`[TESS AUDIT] Found ${dossiers.length} files in MCNC vault. Commencing evaluation...`);

    for (const doc of dossiers) {
        const baseName = path.basename(doc).replace(/\.(md|txt)$/, '');
        const alreadyPending = fs.existsSync(path.join(EVOLUTION_DIR, `${baseName}.json`));
        const alreadyRejected = fs.existsSync(path.join(REJECTED_DIR, `${baseName}.json`));

        if (alreadyPending || alreadyRejected) {
            console.log(`[SKIP] Already evaluated: ${path.basename(doc)}`);
            continue;
        }

        await evaluateDossier(doc);
        // Base throttle between successful requests to stay within OTPM limits
        await sleep(5000);
    }

    console.log('[TESS AUDIT COMPLETE] High-ranking candidates ready in vault/System_Evolution/Pending/');
}

if (require.main === module) {
    runEvaluationPass();
}

module.exports = { evaluateDossier, runEvaluationPass };
