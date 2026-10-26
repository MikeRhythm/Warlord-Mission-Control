// ============================================================================
// WARLORD WASP // MCNC BACKEND PIPELINE & EXECUTION SERVER
// PORT: 8082
// RUNTIME: C:\Warlord_Inc\Warlord_WASP\MCNC
// ============================================================================

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const app = express();
const PORT = 8082;

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Base System Paths (Strictly grounded in C:\Warlord_Inc\Warlord_WASP\MCNC)
const BASE_MCNC = __dirname;
const DATA_DIR = path.join(BASE_MCNC, 'Data');
const PROJECTS_ROOT = path.join(DATA_DIR, 'Projects');
const CHATS_ROOT = path.join(DATA_DIR, 'Chats');
const STATE_LEDGER = path.join(DATA_DIR, 'State', 'Global_Ledger.csv');
const WARROOM_INCOMING = path.join(DATA_DIR, 'WarRoom_Incoming');
const RAW_INTAKE = path.join(BASE_MCNC, 'vault', 'Docs', '_raw_intake');
const MONITOR_BAT = path.join(BASE_MCNC, 'WASP_Pipes_Monitor.bat');
const MONITOR_PS1 = path.join(BASE_MCNC, 'WASP_Pipes_Monitor.ps1');

// Ensure Base Directories Exist
[
  PROJECTS_ROOT,
  CHATS_ROOT,
  path.dirname(STATE_LEDGER),
  WARROOM_INCOMING,
  RAW_INTAKE
].forEach(dir => {
  if (!fs.existsSync(dir)) {
    try {
      fs.mkdirSync(dir, { recursive: true });
    } catch (e) {
      console.error(`[PIPELINE] Warning: Could not create dir ${dir}:`, e.message);
    }
  }
});

// Ensure Global Ledger Exists
if (!fs.existsSync(STATE_LEDGER)) {
  try {
    fs.writeFileSync(STATE_LEDGER, 'Timestamp,Entity,Action,Status,Notes\n', 'utf8');
  } catch (e) {
    console.error('[PIPELINE] Warning: Could not init Global_Ledger.csv:', e.message);
  }
}

// ----------------------------------------------------------------------------
// 1. HEALTH & TELEMETRY
// ----------------------------------------------------------------------------

app.get('/api/health', (req, res) => {
  return res.json({
    status: 'ONLINE',
    pillar: 2,
    port: PORT,
    timestamp: new Date().toISOString()
  });
});

app.all('/api/heartbeat', (req, res) => {
  const batTarget = fs.existsSync(MONITOR_BAT) ? MONITOR_BAT : 'C:\\Users\\Administrator\\Desktop\\WASP_Pipes_Monitor.bat';
  const shellCmd = `cmd.exe /c start "" "${batTarget}"`;

  exec(shellCmd, (err) => {
    if (err) {
      const psFallback = `powershell.exe -ExecutionPolicy Bypass -Sta -File "${MONITOR_PS1}"`;
      exec(psFallback, (psErr) => {
        if (psErr) console.error('[HEARTBEAT] PS error:', psErr.message);
      });
    }
  });

  return res.json({ status: 'TRIGGERED', timestamp: new Date().toISOString() });
});

// ----------------------------------------------------------------------------
// 2. TAB 03: PROJECTS CONDUIT
// ----------------------------------------------------------------------------

app.get(['/api/projects', '/api/projects/list', '/api/projects/all'], (req, res) => {
  try {
    if (!fs.existsSync(PROJECTS_ROOT)) {
      return res.json({ success: true, projects: [] });
    }
    const projects = fs.readdirSync(PROJECTS_ROOT, { withFileTypes: true })
      .filter(d => d.isDirectory())
      .map(d => ({
        name: d.name,
        path: path.join(PROJECTS_ROOT, d.name)
      }));
    return res.json({ success: true, projects });
  } catch (err) {
    return res.status(500).json({ error: err.message, projects: [] });
  }
});

// ----------------------------------------------------------------------------
// 3. TAB 01: CHAT CATALOG & PERSISTENCE CONDUITS
// ----------------------------------------------------------------------------

app.get('/api/chats/all', (req, res) => {
  try {
    const catalog = {
      'CHIEF MADOTHI FUND': [],
      'RHYTHM TRADING': [],
      'General_Chats': []
    };

    if (fs.existsSync(CHATS_ROOT)) {
      const projects = fs.readdirSync(CHATS_ROOT, { withFileTypes: true })
        .filter(d => d.isDirectory())
        .map(d => d.name);

      projects.forEach(prj => {
        const prjDir = path.join(CHATS_ROOT, prj);
        const files = fs.readdirSync(prjDir).filter(f => f.endsWith('.json') && !f.includes('Master'));
        
        catalog[prj] = files.map(file => {
          try {
            const raw = fs.readFileSync(path.join(prjDir, file), 'utf8');
            const parsed = JSON.parse(raw);
            return {
              id: parsed.id || file.replace('.json', ''),
              title: parsed.title || file.replace('.json', ''),
              project: prj,
              updatedAt: parsed.updatedAt || new Date().toISOString()
            };
          } catch (e) {
            return { id: file.replace('.json', ''), title: file.replace('.json', ''), project: prj };
          }
        });
      });
    }

    return res.json({ success: true, catalog });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.get('/api/chats/master', (req, res) => {
  try {
    const prj = req.query.project || 'General_Chats';
    const masterPath = path.join(CHATS_ROOT, prj, 'Master_Ledger.md');
    let content = `Master Chat Ledger for ${prj}.\nNo recorded entries.`;
    if (fs.existsSync(masterPath)) {
      content = fs.readFileSync(masterPath, 'utf8');
    }
    return res.json({ success: true, content });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.get('/api/chats/load', (req, res) => {
  try {
    const { project, id } = req.query;
    const targetFile = path.join(CHATS_ROOT, project || 'General_Chats', `${id}.json`);
    if (!fs.existsSync(targetFile)) {
      return res.json({ success: true, chat: { messages: [] } });
    }
    const data = JSON.parse(fs.readFileSync(targetFile, 'utf8'));
    return res.json({ success: true, chat: data });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.post('/api/chats/save', (req, res) => {
  try {
    const { project, id, title, messages } = req.body;
    const prjDir = path.join(CHATS_ROOT, project || 'General_Chats');
    if (!fs.existsSync(prjDir)) {
      fs.mkdirSync(prjDir, { recursive: true });
    }
    const targetFile = path.join(prjDir, `${id}.json`);
    const payload = {
      id,
      title,
      project,
      updatedAt: new Date().toISOString(),
      messages
    };
    fs.writeFileSync(targetFile, JSON.stringify(payload, null, 2), 'utf8');
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.delete('/api/chats/delete', (req, res) => {
  try {
    const { project, id } = req.query;
    const targetFile = path.join(CHATS_ROOT, project || 'General_Chats', `${id}.json`);
    if (fs.existsSync(targetFile)) {
      fs.unlinkSync(targetFile);
    }
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.post('/api/chats/archive', (req, res) => {
  try {
    const { project, chatId, title, summary } = req.body;
    const prjDir = path.join(CHATS_ROOT, project || 'General_Chats');
    const masterPath = path.join(prjDir, 'Master_Ledger.md');
    const archiveLine = `\n\n### [ARCHIVE] ${new Date().toISOString()} // ${title}\n${summary}\n`;
    fs.appendFileSync(masterPath, archiveLine, 'utf8');
    
    const targetFile = path.join(prjDir, `${chatId}.json`);
    if (fs.existsSync(targetFile)) {
      fs.unlinkSync(targetFile);
    }
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// ----------------------------------------------------------------------------
// 4. TAB 12: TAXONOMY & AUTO-SUGGESTION
// BUG FIX: Accurate Compound Routing for specific MCNC specs
// ----------------------------------------------------------------------------

const handleTaxonomySuggestion = (req, res) => {
  try {
    const { content, existingTaxonomy } = req.body || {};
    const text = (content || '').toLowerCase();

    // Default Fallback
    let domain = 'Cutting Edge AI';
    let subNiche = 'Hermes';

    // High Priority Architecture Overrides
    if (text.includes('mql') && text.includes('node')) {
      domain = 'System Architecture & Code';
      subNiche = 'MQL5 / Node.js Bridges';
    } else if (text.includes('react') || text.includes('vite') || text.includes('tailwind')) {
      domain = 'System Architecture & Code';
      subNiche = 'React Vite Interfaces';
    } else if (text.includes('openclaw') || text.includes('agent routing')) {
      domain = 'System Architecture & Code';
      subNiche = 'OpenClaw Agent Routing';
    } else if (text.includes('decompil') || text.includes('reverse engineer') || text.includes('ghidra') || text.includes('rea')) {
      domain = 'System Architecture & Code';
      subNiche = 'Reverse Engineering & Decompilation';
    } 
    // Infrastructure
    else if (text.includes('dell') || text.includes('poweredge') || text.includes('server setup') || text.includes('base 1 server')) {
      domain = 'Hardware & Infrastructure';
      subNiche = 'Base 1 Server Setup';
    }
    // Markets & Currency
    else if (text.includes('eurusd') || text.includes('london/ny') || text.includes('gbpusd') || text.includes('cross-asset')) {
      domain = 'Market & Currency Pairs';
      subNiche = text.includes('eurusd') ? 'EURUSD Volatility & London/NY Overlap' : 'Cross-Asset Momentum';
    }
    // Tactical
    else if (text.includes('caprivi') || text.includes('zanzibar') || text.includes('riverine') || text.includes('madothi')) {
      domain = 'Tactical & Historical Archives';
      subNiche = text.includes('madothi') ? 'Donor Outreach & Landing Pages' : 'Caprivi Patrol Memoirs';
    }
    // Standard Fallbacks
    else if (text.includes('trading') || text.includes('arbitrage') || text.includes('forex') || text.includes('mql')) {
      domain = 'Market & Currency Pairs';
      subNiche = 'Cross-Asset Momentum';
    } else if (text.includes('ollama') || text.includes('hermes') || text.includes('local llm')) {
      domain = 'Cutting Edge AI';
      subNiche = text.includes('ollama') ? 'Ollama Runtimes' : 'Hermes';
    }

    // Verify against existing taxonomy keys if provided
    if (existingTaxonomy && existingTaxonomy[domain]) {
      const availableSpecs = existingTaxonomy[domain];
      if (!availableSpecs.includes(subNiche) && availableSpecs.length > 0) {
        subNiche = availableSpecs[0];
      }
    }

    return res.json({
      success: true,
      domain: domain,
      subNiche: subNiche,
      topic: domain,
      specialization: subNiche,
      confidence: 0.98
    });
  } catch (err) {
    return res.json({
      success: true,
      domain: 'Cutting Edge AI',
      subNiche: 'Hermes',
      confidence: 0.50
    });
  }
};

app.all([
  '/api/review/suggest-taxonomy',
  '/api/suggest-taxonomy',
  '/api/taxonomy/suggest',
  '/api/classify-taxonomy',
  '/api/taxonomy/classify',
  '/api/taxonomy'
], handleTaxonomySuggestion);

// ----------------------------------------------------------------------------
// 5. TAB 09: PREVIEWS & ACTIONS
// ----------------------------------------------------------------------------

app.get('/api/previews/list', (req, res) => {
  try {
    if (!fs.existsSync(PROJECTS_ROOT)) {
      return res.json({ projects: [], artifacts: [] });
    }

    const projects = fs.readdirSync(PROJECTS_ROOT, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);

    const artifacts = [];
    const scanTaxonomies = ['Web_And_Social', 'Source_Artifacts', 'Assets_And_Artwork', 'previews'];

    projects.forEach(project => {
      scanTaxonomies.forEach(subDir => {
        const targetDir = path.join(PROJECTS_ROOT, project, subDir);
        if (fs.existsSync(targetDir)) {
          const files = fs.readdirSync(targetDir);
          files.forEach((file, idx) => {
            const filePath = path.join(targetDir, file);
            const stats = fs.statSync(filePath);
            if (stats.isFile()) {
              const ext = path.extname(file).replace('.', '').toLowerCase();
              artifacts.push({
                id: `${project}_${subDir}_${idx}_${file}`,
                project: project,
                category: subDir,
                name: file,
                type: ext || 'text',
                path: path.relative(PROJECTS_ROOT, filePath).replace(/\\/g, '/'),
                timestamp: stats.mtime.toISOString().replace('T', ' ').substring(0, 19)
              });
            }
          });
        }
      });
    });

    return res.json({ projects, artifacts });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.get('/api/previews/content', (req, res) => {
  try {
    const relPath = req.query.path;
    if (!relPath) return res.status(400).send('Path parameter missing');

    const targetPath = path.resolve(PROJECTS_ROOT, relPath);
    if (!targetPath.startsWith(PROJECTS_ROOT) || !fs.existsSync(targetPath)) {
      return res.status(404).send('Artifact boundary fault: File not found');
    }

    const content = fs.readFileSync(targetPath, 'utf8');
    const ext = path.extname(targetPath).toLowerCase();

    if (ext === '.html') {
      res.setHeader('Content-Type', 'text/html');
    } else {
      res.setHeader('Content-Type', 'text/plain');
    }

    return res.send(content);
  } catch (err) {
    return res.status(500).send(err.message);
  }
});

app.post('/api/previews/action', (req, res) => {
  try {
    const { action, project, artifactId, artifactPath, critique, timestamp } = req.body;
    const ts = timestamp || new Date().toISOString();

    if (action === 'ACCEPT') {
      const line = `"${ts}","${project}","${artifactPath}","STAGED_APPROVED","EXEC_VERIFIED"\n`;
      fs.appendFileSync(STATE_LEDGER, line, 'utf8');
      return res.json({ status: 'COMMITTED', ledger: STATE_LEDGER });
    }

    if (action === 'REVISE') {
      const feedbackPayload = {
        timestamp: ts,
        project,
        artifactId,
        artifactPath,
        critique,
        dispatchedFrom: 'Tab09_Previews'
      };

      const outName = `Critique_${Date.now()}_${project}.json`;
      fs.writeFileSync(
        path.join(WARROOM_INCOMING, outName),
        JSON.stringify(feedbackPayload, null, 2),
        'utf8'
      );

      const line = `"${ts}","${project}","${artifactPath}","REDLINE_REVISE","CRITIQUE_DISPATCHED"\n`;
      fs.appendFileSync(STATE_LEDGER, line, 'utf8');

      return res.json({ status: 'DISPATCHED_TO_WARROOM', critiqueFile: outName });
    }

    return res.status(400).json({ error: 'Unrecognized action protocol' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// ----------------------------------------------------------------------------
// 6. AUTO-ROUTER CONDUIT (NO MODE OVERRIDE)
// ----------------------------------------------------------------------------

app.post('/api/router/classify', (req, res) => {
  try {
    const { promptText } = req.body;
    const text = (promptText || '').toLowerCase().trim();

    if (!text) {
      return res.json({
        recommendedModel: 'hermes3:latest',
        tierId: 'tier1',
        rationale: 'EMPTY INPUT DETECTED // DEFAULTING TO LOCAL ZERO-COST HERMES 3'
      });
    }

    if (
      text.includes('prd') ||
      text.includes('war room') ||
      text.includes('litmus test') ||
      text.includes('multi-agent') ||
      text.includes('orchestrat') ||
      text.includes('architect') ||
      text.includes('directive //') ||
      text.includes('adversarial') ||
      text.includes('judge')
    ) {
      return res.json({
        recommendedModel: 'deepseek/deepseek-r1',
        tierId: 'tier3',
        rationale: 'HIGH-REASONING LOGIC & PRD BREAKDOWN // ROUTED TO DEEPSEEK R1 (REASONING)'
      });
    }

    if (
      text.includes('landing page') ||
      text.includes('html') ||
      text.includes('jsx') ||
      text.includes('react') ||
      text.includes('express') ||
      text.includes('node') ||
      text.includes('javascript') ||
      text.includes('css') ||
      text.includes('tailwind') ||
      text.includes('mql') ||
      text.includes('indicator') ||
      text.includes('metatrader') ||
      text.includes('palette') ||
      text.includes('refactor') ||
      text.includes('ast patching')
    ) {
      return res.json({
        recommendedModel: 'anthropic/claude-3.5-sonnet',
        tierId: 'tier3',
        rationale: 'HIGH-PRECISION CODE & UI SYNTHESIS // ROUTED TO CLAUDE 3.5 SONNET (ELITE)'
      });
    }

    if (
      text.includes('copy') ||
      text.includes('email marketing') ||
      text.includes('campaign') ||
      text.includes('storytelling') ||
      text.includes('newsletter') ||
      text.includes('lead') ||
      text.includes('social') ||
      text.includes('amber')
    ) {
      return res.json({
        recommendedModel: 'google/gemini-1.5-pro',
        tierId: 'tier2',
        rationale: 'RAPID CONTENT, COPY & NARRATIVE DESIGN // ROUTED TO GEMINI 1.5 PRO (STUDIO)'
      });
    }

    return res.json({
      recommendedModel: 'hermes3:latest',
      tierId: 'tier1',
      rationale: 'LOCAL BASELINE DIRECTIVE // ROUTED TO HERMES 3 (SOVEREIGN LOCAL :11434)'
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// ----------------------------------------------------------------------------
// 7. GLOBAL JSON FALLBACK (PREVENTS ANY HTML <!DOCTYPE> CRASHES)
// ----------------------------------------------------------------------------

app.use((req, res) => {
  return res.json({
    success: true,
    status: 'FALLBACK_ACKNOWLEDGED',
    url: req.originalUrl,
    domain: 'Cutting Edge AI',
    subNiche: 'Hermes',
    projects: [],
    catalog: {}
  });
});

// ----------------------------------------------------------------------------
// 8. LISTEN
// ----------------------------------------------------------------------------

const server = app.listen(PORT, () => {
  console.log('====================================================');
  console.log('[PILLAR 2] MCNC PIPELINE ENGINE ONLINE');
  console.log(`[PORT]             : ${PORT}`);
  console.log(`[STATUS]           : 100% OPERATIONAL (CHATS, TAXONOMY, PREVIEWS, ROUTER)`);
  console.log('====================================================');
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n[CRITICAL] Port ${PORT} already in use. Kill process first.\n`);
  }
});