/**
 * WARLORD INC // PILLAR 2: PROJECT & PIPELINE ENGINE & PERSISTENT CHAT LEDGER
 * Host Path: C:\Warlord_Inc\Warlord_WASP\MCNC\server_pipeline.js
 * Port: 8082
 */

const fs = require('fs');
const path = require('path');

// Dynamically locate and load .env from possible root locations
const rootEnv = path.join(__dirname, '.env');
const v2Env = path.join(__dirname, '..', 'MCNC_V2', '.env');

if (fs.existsSync(rootEnv)) {
  require('dotenv').config({ path: rootEnv });
} else if (fs.existsSync(v2Env)) {
  require('dotenv').config({ path: v2Env });
} else {
  require('dotenv').config();
}

const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');

const app = express();
const PORT = 8082;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

const BASE_DIR = 'C:\\Warlord_Inc\\Warlord_WASP\\MCNC';
const DATA_DIR = path.join(BASE_DIR, 'Data');
const PROJECTS_ROOT = path.join(DATA_DIR, 'Projects');
const STATE_DIR = path.join(DATA_DIR, 'State');
const LEDGER_FILE = path.join(STATE_DIR, 'Global_Ledger.csv');
const SCRIPTS_DIR = path.join(BASE_DIR, 'scripts');
const CHATS_ROOT = path.join(DATA_DIR, 'Chats');
const VAULT_DOCS_ROOT = path.join(BASE_DIR, 'vault', 'Docs');

// Ensure foundational directories exist
[PROJECTS_ROOT, STATE_DIR, CHATS_ROOT, VAULT_DOCS_ROOT].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Ensure base project chat buckets and master ledger exist
['CHIEF MADOTHI FUND', 'RHYTHM TRADING', 'General_Chats'].forEach((proj) => {
  const projDir = path.join(CHATS_ROOT, proj);
  if (!fs.existsSync(projDir)) {
    fs.mkdirSync(projDir, { recursive: true });
  }
  const masterFile = path.join(projDir, 'MASTER_CHAT.md');
  if (!fs.existsSync(masterFile)) {
    fs.writeFileSync(
      masterFile,
      `# ${proj} // MASTER CHAT LEDGER\n*Initialized: ${new Date().toISOString()}*\n\n---\n\n`,
      'utf8'
    );
  }
});

function countCsvRecords(filePath) {
  if (!fs.existsSync(filePath)) return 0;
  try {
    const lines = fs.readFileSync(filePath, 'utf8').trim().split(/\r?\n/);
    return Math.max(0, lines.length - 1);
  } catch {
    return 0;
  }
}

// ============================================================================
// PIPELINE & HEALTH ROUTES
// ============================================================================

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    port: PORT,
    geminiKeyDetected: Boolean(process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY),
    timestamp: new Date().toISOString()
  });
});

app.get('/api/projects', (req, res) => {
  try {
    if (!fs.existsSync(PROJECTS_ROOT)) {
      return res.json({ success: true, projects: [] });
    }
    const dirNames = fs.readdirSync(PROJECTS_ROOT).filter((file) => {
      return fs.statSync(path.join(PROJECTS_ROOT, file)).isDirectory();
    });

    const projects = dirNames.map((name) => {
      const manifestPath = path.join(PROJECTS_ROOT, name, 'manifest.json');
      let manifest = null;
      if (fs.existsSync(manifestPath)) {
        try {
          manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
        } catch {}
      }
      return {
        id: name,
        name: name,
        manifest: manifest || {}
      };
    });

    res.json({ success: true, projects });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/projects/create', (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, error: 'Project name is required' });
    }
    const projectPath = path.join(PROJECTS_ROOT, name);
    if (!fs.existsSync(projectPath)) {
      fs.mkdirSync(projectPath, { recursive: true });
    }
    res.json({ success: true, project: name, path: projectPath });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/pipeline/ingest', (req, res) => {
  const { file, profile, category } = req.body;

  if (!file || !profile || !category) {
    return res.status(400).json({
      success: false,
      error: 'Missing parameters. Required: file, profile, category.'
    });
  }

  const scriptPath = path.join(SCRIPTS_DIR, 'Intel_To_Leads.js');
  const command = `node "${scriptPath}" --profile=${profile} --category=${category} --file="${file}"`;

  console.log(`[*] Executing pipeline ingest: ${command}`);

  exec(command, { cwd: BASE_DIR }, (error, stdout, stderr) => {
    if (error) {
      console.error(`[!] Ingestion error: ${stderr || error.message}`);
      return res.status(500).json({ success: false, error: stderr || error.message });
    }

    console.log(`[✔] Ingestion complete:\n${stdout}`);
    res.json({
      success: true,
      output: stdout.trim(),
      file,
      profile,
      category
    });
  });
});

// ============================================================================
// REVIEW & TAXONOMY CLASSIFIER (TAB 12 REVIEW -> TAB 13 DOCS)
// ============================================================================

app.post('/api/review/suggest-taxonomy', async (req, res) => {
  try {
    const { content, existingTaxonomy } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'No content provided for classification.' });
    }

    const lower = content.toLowerCase();

    // Instant local heuristics for zero-latency deterministic classification
    if (
      lower.includes('reverse engineer') ||
      lower.includes('ghidra') ||
      lower.includes('decompile') ||
      lower.includes('artcraft') ||
      lower.includes('binary') ||
      lower.includes('disassembl')
    ) {
      console.log('[✔] Taxonomy Classified via Heuristics: System Architecture & Code > Reverse Engineering & Decompilation');
      return res.json({
        domain: 'System Architecture & Code',
        subNiche: 'Reverse Engineering & Decompilation'
      });
    }

    if (
      lower.includes('claude code') ||
      lower.includes('ollama') ||
      lower.includes('freellmapi') ||
      lower.includes('opencode')
    ) {
      console.log('[✔] Taxonomy Classified via Heuristics: Cutting Edge AI > Local LLM Harnesses');
      return res.json({
        domain: 'Cutting Edge AI',
        subNiche: 'Local LLM Harnesses'
      });
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

    if (!apiKey) {
      console.warn('[!] GEMINI_API_KEY not found. Defaulting to general code domain.');
      return res.json({
        domain: 'System Architecture & Code',
        subNiche: 'Architecture & Tooling'
      });
    }

    const prompt = `
You are an expert taxonomy and knowledge-management classifier for the Warlord MCNC Docs Vault.
Analyze the following research dossier excerpt and determine the best Topic Domain and Specialization/Sub-Niche.

EXISTING TAXONOMY CATALOG:
${JSON.stringify(existingTaxonomy || {}, null, 2)}

INSTRUCTIONS:
1. Prefer assigning to an existing Topic Domain and Sub-Niche if it is an accurate match.
2. If none fit well, propose a clean, concise NEW Topic Domain (e.g. "Reverse Engineering", "Quant Systems") and NEW Sub-Niche (e.g. "Binary Decompilation", "Orderflow Delta").
3. Do NOT default to "Cutting Edge AI" unless the content is strictly about LLM weights or neural networks.
4. Return ONLY a valid JSON object with keys "domain" and "subNiche".

RESEARCH CONTENT:
${content.slice(0, 3500)}
`;

    // 4-second timeout cutoff to eliminate any UI hang
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            response_mime_type: 'application/json',
            temperature: 0.1
          }
        })
      }
    );
    clearTimeout(timeout);

    const data = await response.json();
    if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
      const parsed = JSON.parse(data.candidates[0].content.parts[0].text);
      console.log(`[✔] Taxonomy Classified via Gemini Cloud: [${parsed.domain}] > [${parsed.subNiche}]`);
      return res.json(parsed);
    }

    return res.json({
      domain: 'System Architecture & Code',
      subNiche: 'General Tooling'
    });
  } catch (err) {
    console.warn('[!] Fast taxonomy error handler active:', err.message);
    const lower = (req.body.content || '').toLowerCase();
    if (lower.includes('reverse') || lower.includes('ghidra') || lower.includes('artcraft')) {
      return res.json({
        domain: 'System Architecture & Code',
        subNiche: 'Reverse Engineering & Decompilation'
      });
    }
    return res.json({
      domain: 'General Research',
      subNiche: 'Technical Dossiers'
    });
  }
});

// ============================================================================
// PERSISTENT CHAT LEDGER ROUTES (MOUNTED FOR TAB 01 EXEC)
// ============================================================================

app.get('/api/chats/all', (req, res) => {
  try {
    const catalog = {};
    const projects = ['CHIEF MADOTHI FUND', 'RHYTHM TRADING', 'General_Chats'];

    projects.forEach((proj) => {
      const projDir = path.join(CHATS_ROOT, proj);
      if (!fs.existsSync(projDir)) {
        fs.mkdirSync(projDir, { recursive: true });
      }

      const files = fs.readdirSync(projDir).filter((f) => f.endsWith('.json'));
      catalog[proj] = files.map((f) => {
        try {
          const content = JSON.parse(fs.readFileSync(path.join(projDir, f), 'utf8'));
          return {
            id: content.id || f.replace('.json', ''),
            title: content.title || f.replace('.json', ''),
            project: proj,
            updatedAt: content.updatedAt || fs.statSync(path.join(projDir, f)).mtime
          };
        } catch {
          return {
            id: f.replace('.json', ''),
            title: f.replace('.json', ''),
            project: proj,
            updatedAt: fs.statSync(path.join(projDir, f)).mtime
          };
        }
      });
    });

    res.json({ success: true, catalog });
  } catch (err) {
    console.error('Error fetching chat catalog:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/chats/save', (req, res) => {
  try {
    const { project, id, title, messages } = req.body;
    if (!project || !id) {
      return res.status(400).json({ success: false, error: 'Project and id are required' });
    }

    const projDir = path.join(CHATS_ROOT, project);
    if (!fs.existsSync(projDir)) {
      fs.mkdirSync(projDir, { recursive: true });
    }

    const filePath = path.join(projDir, `${id}.json`);
    const payload = {
      id,
      title: title || id,
      project,
      updatedAt: new Date().toISOString(),
      messages: messages || []
    };

    fs.writeFileSync(filePath, JSON.stringify(payload, null, 2), 'utf8');
    res.json({ success: true, id, path: filePath });
  } catch (err) {
    console.error('Error saving chat:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/chats/load', (req, res) => {
  try {
    const { project, id } = req.query;
    if (!project || !id) {
      return res.status(400).json({ success: false, error: 'Project and id are required' });
    }

    const filePath = path.join(CHATS_ROOT, project, `${id}.json`);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, error: 'Chat not found' });
    }

    const chatData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    res.json({ success: true, chat: chatData });
  } catch (err) {
    console.error('Error loading chat:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/chats/delete', (req, res) => {
  try {
    const { project, id } = req.query;
    if (!project || !id) {
      return res.status(400).json({ success: false, error: 'Project and id are required' });
    }

    const filePath = path.join(CHATS_ROOT, project, `${id}.json`);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    res.json({ success: true, deleted: id });
  } catch (err) {
    console.error('Error deleting chat:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/chats/master', (req, res) => {
  try {
    const project = req.query.project || 'CHIEF MADOTHI FUND';
    const masterFile = path.join(CHATS_ROOT, project, 'MASTER_CHAT.md');

    if (!fs.existsSync(masterFile)) {
      fs.writeFileSync(
        masterFile,
        `# ${project} // MASTER CHAT LEDGER\n*Initialized: ${new Date().toISOString()}*\n\n---\n\n`,
        'utf8'
      );
    }

    const content = fs.readFileSync(masterFile, 'utf8');
    res.json({ success: true, project, content });
  } catch (err) {
    console.error('Error loading master chat:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/chats/archive', (req, res) => {
  try {
    const { project, chatId, title, summary } = req.body;
    if (!project || !chatId) {
      return res.status(400).json({ success: false, error: 'Project and chatId required' });
    }

    const chatFile = path.join(CHATS_ROOT, project, `${chatId}.json`);
    let chatMessages = [];
    if (fs.existsSync(chatFile)) {
      const chatData = JSON.parse(fs.readFileSync(chatFile, 'utf8'));
      chatMessages = chatData.messages || [];
    }

    const timestamp = new Date().toISOString();
    const nodeHeader = `\n\n### [OPERATIONAL NODE] ${title.toUpperCase()}\n- **Timestamp:** ${timestamp}\n- **Summary:** ${summary || 'Thread archived into immutable master ledger.'}\n\n`;

    const transcript = chatMessages
      .map((m) => `**[${m.sender}]**: ${m.text}`)
      .join('\n\n');

    const fullNode = nodeHeader + transcript + '\n\n---\n';

    const masterFile = path.join(CHATS_ROOT, project, 'MASTER_CHAT.md');
    fs.appendFileSync(masterFile, fullNode, 'utf8');

    const projDocsDir = path.join(VAULT_DOCS_ROOT, project);
    if (!fs.existsSync(projDocsDir)) {
      fs.mkdirSync(projDocsDir, { recursive: true });
    }
    const docFile = path.join(projDocsDir, `${chatId}_${title.replace(/[^a-zA-Z0-9_-]/g, '_')}.md`);
    fs.writeFileSync(docFile, `# ARCHIVED THREAD: ${title}\n` + fullNode, 'utf8');

    if (fs.existsSync(chatFile)) {
      fs.unlinkSync(chatFile);
    }

    console.log(`[✔] Thread [${title}] archived into ${masterFile} and ${docFile}`);
    res.json({ success: true, archived: chatId, masterFile, docFile });
  } catch (err) {
    console.error('Error archiving chat:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ============================================================================
// SERVER LISTENER
// ============================================================================

app.listen(PORT, () => {
  const keyStatus = Boolean(process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY)
    ? 'DETECTED (ONLINE)'
    : 'MISSING (USING HEURISTIC CLASSIFIER)';

  console.log(`====================================================`);
  console.log(`[PILLAR 2] MCNC PROJECT & PIPELINE ENGINE ONLINE`);
  console.log(`[PORT]          : ${PORT}`);
  console.log(`[GEMINI API KEY]: ${keyStatus}`);
  console.log(`[PROJECTS ROOT] : ${PROJECTS_ROOT}`);
  console.log(`[CHATS ROOT]    : ${CHATS_ROOT}`);
  console.log(`[STATE LEDGER]  : ${LEDGER_FILE}`);
  console.log(`[ENDPOINTS]     : POST   /api/review/suggest-taxonomy`);
  console.log(`                : GET    /api/chats/all`);
  console.log(`                : POST   /api/chats/archive`);
  console.log(`====================================================`);
});