// ============================================================================
// WARLORD WASP // MCNC BACKEND PIPELINE & EXECUTION SERVER
// PORT: 8082
// RUNTIME: C:\Warlord_Inc\Warlord_WASP\MCNC
// FILE: C:\Warlord_Inc\Warlord_WASP\MCNC\server_pipeline.js
// ============================================================================

require('dotenv').config();
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const app = express();
const PORT = 8082;
const { resolveTenantContext, checkTenantQuota } = require('./Tenant_Scope_Resolver');

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use('/api/projects', checkTenantQuota);

// Base System Paths (Strictly grounded in C:\Warlord_Inc\Warlord_WASP\MCNC)
const BASE_MCNC = path.resolve('C:\\Warlord_Inc\\Warlord_WASP\\MCNC');
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

// ============================================================================
// WEBSOCKET SERVER INSTANCE (PORT 8082)
// ============================================================================
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const broadcast = (type, payload) => {
  const message = JSON.stringify({
    type,
    payload,
    timestamp: new Date().toISOString()
  });
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
};

wss.on('connection', (ws) => {
  console.log('[PIPELINE WS] Client connected to Port 8082');
  ws.send(JSON.stringify({ type: 'CONNECTION_ESTABLISHED', port: 8082 }));
  
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      if (data.type === 'PING') {
        ws.send(JSON.stringify({ type: 'PONG', timestamp: new Date().toISOString() }));
      }
    } catch (e) {
      console.error('[PIPELINE WS] Invalid message format:', e.message);
    }
  });

  ws.on('close', () => {
    console.log('[PIPELINE WS] Client disconnected from Port 8082');
  });
});

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================
function normKey(s) {
  return String(s || '').trim().replace(/[\s_]+/g, '_').toLowerCase();
}

function findMatchingDir(baseDir, rawTarget) {
  if (!fs.existsSync(baseDir) || !rawTarget) return null;
  const targetNorm = normKey(rawTarget);
  try {
    const entries = fs.readdirSync(baseDir, { withFileTypes: true }).filter(d => d.isDirectory());
    const match = entries.find(d => normKey(d.name) === targetNorm);
    return match ? path.join(baseDir, match.name) : null;
  } catch (e) {
    return null;
  }
}

function findAllMatchingDirs(baseDir, rawTarget) {
  if (!fs.existsSync(baseDir) || !rawTarget) return [];
  const targetNorm = normKey(rawTarget);
  try {
    return fs.readdirSync(baseDir, { withFileTypes: true })
      .filter(d => d.isDirectory() && normKey(d.name) === targetNorm)
      .map(d => path.join(baseDir, d.name));
  } catch (e) {
    return [];
  }
}

// ----------------------------------------------------------------------------
// 1. HEALTH & TELEMETRY
// ----------------------------------------------------------------------------

app.get('/api/health', (req, res) => {
  const __tenantCtx = resolveTenantContext(req);
  return res.json({
    status: 'ONLINE',
    pillar: 2,
    port: PORT,
    projectsRoot: __tenantCtx.projectsRoot,
    chatsRoot: __tenantCtx.chatsRoot,
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

  return res.json({
    status: 'ACTIVE',
    bridge: 'ONLINE',
    framework: 'REACT VITE',
    port: PORT,
    timestamp: new Date().toISOString()
  });
});

// ----------------------------------------------------------------------------
// 2. TAB 03: DISK-TRUTH PROJECTS CONDUIT
// ----------------------------------------------------------------------------

app.get(['/api/projects', '/api/projects/list', '/api/projects/all', '/api/projects/disk'], (req, res) => {
  const __tenantCtx = resolveTenantContext(req);
  const PROJECTS_ROOT = __tenantCtx.projectsRoot;
  try {
    if (!fs.existsSync(PROJECTS_ROOT)) {
      return res.json({ success: true, projects: [] });
    }

    const projectDirs = fs.readdirSync(PROJECTS_ROOT, { withFileTypes: true })
      .filter(d => d.isDirectory())
      .map(d => d.name);

    const detailedProjects = projectDirs.map(name => {
      const prjPath = path.join(PROJECTS_ROOT, name);
      const manifestPath = path.join(prjPath, 'project_manifest.json');

      let manifest = null;
      if (fs.existsSync(manifestPath)) {
        try {
          const raw = fs.readFileSync(manifestPath, 'utf8').replace(/^\uFEFF/, '');
          manifest = JSON.parse(raw);
        } catch (e) {
          console.error(`[PIPELINE] Failed to parse manifest for ${name}:`, e.message);
        }
      }

      let subdirs = [];
      try {
        subdirs = fs.readdirSync(prjPath, { withFileTypes: true })
          .filter(d => d.isDirectory())
          .map(d => d.name);
      } catch (e) {}

      let fileCount = 0;
      let filesList = [];
      subdirs.forEach(sd => {
        const sdPath = path.join(prjPath, sd);
        try {
          const files = fs.readdirSync(sdPath).filter(f => !f.startsWith('.'));
          fileCount += files.length;
          files.forEach(f => filesList.push(`${sd}/${f}`));
        } catch (e) {}
      });

      let totalLeads = 0;
      const leadsPath = path.join(prjPath, 'Leads');
      if (fs.existsSync(leadsPath)) {
        try {
          const leadFiles = fs.readdirSync(leadsPath).filter(f => f.endsWith('.csv') || f.endsWith('.json'));
          totalLeads = leadFiles.length;
        } catch (e) {}
      }

      return {
        id: name,
        name: name.replace(/_/g, ' '),
        status: manifest?.status || 'ACTIVE',
        description: manifest?.prd_data?.objective || `Project workspace for ${name.replace(/_/g, ' ')}.`,
        industry: manifest?.prd_data?.industry || 'Operational',
        dominantMetric: manifest?.prd_data?.dominantMetric || 'Pipeline Velocity',
        stakeholder: manifest?.prd_data?.stakeholder || '',
        directories: subdirs,
        total_leads: totalLeads,
        fileCount: fileCount,
        files: filesList,
        manifest: manifest,
        pillars: manifest?.pillars || [],
        cronJobs: manifest?.cronJobs || [],
        path: prjPath
      };
    });

    return res.json({ success: true, projects: detailedProjects });
  } catch (err) {
    return res.status(500).json({ error: err.message, projects: [] });
  }
});

// Create / Provision Project on Disk
app.post('/api/projects/create', (req, res) => {
  const __tenantCtx = resolveTenantContext(req);
  const PROJECTS_ROOT = __tenantCtx.projectsRoot;
  const CHATS_ROOT = __tenantCtx.chatsRoot;
  try {
    const { projectName, subdirectories, prdPayload } = req.body;
    if (!projectName) {
      return res.status(400).json({ error: 'projectName is required' });
    }

    const cleanName = projectName.trim().replace(/[^a-zA-Z0-9_\- ]/g, '_');
    const targetDir = path.join(PROJECTS_ROOT, cleanName);

    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    const dirsToCreate = subdirectories && Array.isArray(subdirectories)
      ? subdirectories
      : ['Leads', 'Responses_And_Donations', 'Assets_And_Artwork', 'Web_And_Social', 'Source_Artifacts'];

    dirsToCreate.forEach(dir => {
      const subPath = path.join(targetDir, dir);
      if (!fs.existsSync(subPath)) {
        fs.mkdirSync(subPath, { recursive: true });
      }
    });

    const manifestPath = path.join(targetDir, 'project_manifest.json');
    const manifestData = {
      project_name: cleanName,
      created_at: new Date().toISOString(),
      status: 'ACTIVE',
      prd_data: prdPayload || {
        objective: `Operational node for ${cleanName}`,
        industry: 'Operational',
        dominantMetric: 'Pipeline Velocity'
      },
      directories: dirsToCreate,
      pillars: [],
      cronJobs: []
    };

    fs.writeFileSync(manifestPath, JSON.stringify(manifestData, null, 2), 'utf8');

    const prjChatDir = path.join(CHATS_ROOT, cleanName);
    if (!fs.existsSync(prjChatDir)) {
      fs.mkdirSync(prjChatDir, { recursive: true });
    }
    const seedId = `chat_init_${Date.now()}`;
    const seedPayload = {
      id: seedId,
      title: 'Master Chat',
      project: cleanName,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: []
    };
    fs.writeFileSync(path.join(prjChatDir, `${seedId}.json`), JSON.stringify(seedPayload, null, 2), 'utf8');

    // WEBSOCKET BROADCAST: PROJECT_SCAFFOLDED
    broadcast('PROJECT_SCAFFOLDED', {
      projectName: cleanName,
      path: targetDir,
      directories: dirsToCreate
    });

    return res.json({ success: true, project: cleanName, path: targetDir });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// Nuclear Purge Controller (Obliterates Project, Chats, and Docs across all casing/space variants)
app.post('/api/projects/purge', (req, res) => {
  const __tenantCtx = resolveTenantContext(req);
  const PROJECTS_ROOT = __tenantCtx.projectsRoot;
  const CHATS_ROOT = __tenantCtx.chatsRoot;
  try {
    const rawTarget = req.body.projectId || req.body.projectName;
    if (!rawTarget) return res.status(400).json({ success: false, error: 'Project name or ID required.' });

    const safeSlug = rawTarget.toString().trim().replace(/[<>:"\/\\|?*]+/g, '');
    const docsRoot = path.join(BASE_MCNC, 'vault', 'Docs');

    const matchedDirs = [
      ...findAllMatchingDirs(PROJECTS_ROOT, safeSlug),
      ...findAllMatchingDirs(CHATS_ROOT, safeSlug),
      ...findAllMatchingDirs(docsRoot, safeSlug)
    ];

    matchedDirs.forEach(dir => {
      if (fs.existsSync(dir)) {
        fs.rmSync(dir, { recursive: true, force: true });
      }
    });

    const prdPattern = `01_PRD_${safeSlug.replace(/[\s_]+/g, '_')}.md`;
    const rootPrd = path.join(docsRoot, prdPattern);
    if (fs.existsSync(rootPrd)) fs.unlinkSync(rootPrd);

    // WEBSOCKET BROADCAST: PROJECT_PURGED
    broadcast('PROJECT_PURGED', {
      projectName: safeSlug,
      removedPaths: matchedDirs
    });

    console.log(`[NUCLEAR PURGE] Physically obliterated project & chats: ${safeSlug} (${matchedDirs.length} dirs removed)`);
    return res.json({ success: true, purged: safeSlug, removedPaths: matchedDirs });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Obsidian Archive Controller
app.post('/api/projects/archive-obsidian', (req, res) => {
  const __tenantCtx = resolveTenantContext(req);
  const PROJECTS_ROOT = __tenantCtx.projectsRoot;
  const CHATS_ROOT = __tenantCtx.chatsRoot;
  try {
    const rawTarget = req.body.projectId || req.body.projectName;
    if (!rawTarget) return res.status(400).json({ success: false, error: 'Project name or ID required.' });

    const safeSlug = rawTarget.toString().trim().replace(/[<>:"\/\\|?*]+/g, '');
    const srcProj = findMatchingDir(PROJECTS_ROOT, safeSlug) || path.join(PROJECTS_ROOT, safeSlug);
    const srcChat = findMatchingDir(CHATS_ROOT, safeSlug) || path.join(CHATS_ROOT, safeSlug);
    const folderName = path.basename(srcProj);

    const archiveRoot = path.join(BASE_MCNC, 'vault', 'Archive');
    const archiveProjDir = path.join(archiveRoot, 'Projects', folderName);
    const archiveChatDir = path.join(archiveRoot, 'Chats', folderName);

    [archiveProjDir, archiveChatDir].forEach(d => {
      if (!fs.existsSync(path.dirname(d))) fs.mkdirSync(path.dirname(d), { recursive: true });
    });

    if (fs.existsSync(srcProj)) {
      if (fs.existsSync(archiveProjDir)) fs.rmSync(archiveProjDir, { recursive: true, force: true });
      fs.renameSync(srcProj, archiveProjDir);
    }

    if (fs.existsSync(srcChat)) {
      if (fs.existsSync(archiveChatDir)) fs.rmSync(archiveChatDir, { recursive: true, force: true });
      fs.renameSync(srcChat, archiveChatDir);
    }

    console.log(`[OBSIDIAN ARCHIVE] Project moved to Obsidian Archive: ${folderName}`);
    return res.json({ success: true, archived: folderName, archivePath: archiveProjDir });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ----------------------------------------------------------------------------
// 3. TAB 01: DISK-TRUTH CHAT DISCOVERY (NO ORPHANED OR DUPLICATE LEDGERS)
// ----------------------------------------------------------------------------

app.get('/api/chats/all', (req, res) => {
  const __tenantCtx = resolveTenantContext(req);
  const PROJECTS_ROOT = __tenantCtx.projectsRoot;
  const CHATS_ROOT = __tenantCtx.chatsRoot;
  try {
    const catalog = {};
    const validProjectMap = new Map();
    validProjectMap.set('general_chats', 'General_Chats');

    // 1. Source of truth: ONLY active project folders on disk in PROJECTS_ROOT
    if (fs.existsSync(PROJECTS_ROOT)) {
      fs.readdirSync(PROJECTS_ROOT, { withFileTypes: true })
        .filter(d => d.isDirectory())
        .forEach(d => {
          const key = normKey(d.name);
          if (!validProjectMap.has(key)) {
            validProjectMap.set(key, d.name);
          }
        });
    }

    // 2. Clean up orphaned chat folders in CHATS_ROOT whose project was deleted
    if (fs.existsSync(CHATS_ROOT)) {
      fs.readdirSync(CHATS_ROOT, { withFileTypes: true })
        .filter(d => d.isDirectory())
        .forEach(d => {
          const key = normKey(d.name);
          if (!validProjectMap.has(key)) {
            try {
              fs.rmSync(path.join(CHATS_ROOT, d.name), { recursive: true, force: true });
              console.log(`[CHATS CLEANUP] Purged orphaned chat ledger: ${d.name}`);
            } catch (e) {}
          }
        });
    }

    // 3. Build deduplicated catalog strictly for General_Chats + active disk projects
    validProjectMap.forEach((canonicalName, key) => {
      catalog[canonicalName] = [];
      const matchingChatDirs = findAllMatchingDirs(CHATS_ROOT, canonicalName);
      const primaryChatDir = matchingChatDirs[0] || path.join(CHATS_ROOT, canonicalName);

      if (!fs.existsSync(primaryChatDir)) {
        fs.mkdirSync(primaryChatDir, { recursive: true });
      }

      // Merge any duplicate space/underscore chat folders into primaryChatDir
      if (matchingChatDirs.length > 1) {
        for (let i = 1; i < matchingChatDirs.length; i++) {
          const dupDir = matchingChatDirs[i];
          try {
            fs.readdirSync(dupDir).forEach(f => {
              const src = path.join(dupDir, f);
              const dst = path.join(primaryChatDir, f);
              if (!fs.existsSync(dst)) fs.renameSync(src, dst);
            });
            fs.rmSync(dupDir, { recursive: true, force: true });
          } catch (e) {}
        }
      }

      let files = fs.readdirSync(primaryChatDir).filter(f => f.endsWith('.json') && !f.includes('Master'));

      if (files.length === 0) {
        const seedId = `chat_init_${Date.now()}`;
        const seedPayload = {
          id: seedId,
          title: 'Master Chat',
          project: canonicalName,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          messages: []
        };
        fs.writeFileSync(path.join(primaryChatDir, `${seedId}.json`), JSON.stringify(seedPayload, null, 2), 'utf8');
        files = [`${seedId}.json`];
      }

      catalog[canonicalName] = files.map(file => {
        try {
          const raw = fs.readFileSync(path.join(primaryChatDir, file), 'utf8');
          const parsed = JSON.parse(raw);
          return {
            id: parsed.id || file.replace('.json', ''),
            title: parsed.title || 'Master Chat',
            project: canonicalName,
            updatedAt: parsed.updatedAt || new Date().toISOString()
          };
        } catch (e) {
          return { id: file.replace('.json', ''), title: file.replace('.json', ''), project: canonicalName };
        }
      });
    });

    return res.json({ success: true, catalog });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.get('/api/chats/master', (req, res) => {
  const __tenantCtx = resolveTenantContext(req);
  const CHATS_ROOT = __tenantCtx.chatsRoot;
  try {
    const prj = req.query.project || 'General_Chats';
    const prjDir = findMatchingDir(CHATS_ROOT, prj) || path.join(CHATS_ROOT, prj);
    const masterPath = path.join(prjDir, 'Master_Ledger.md');
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
  const __tenantCtx = resolveTenantContext(req);
  const CHATS_ROOT = __tenantCtx.chatsRoot;
  try {
    const { project, id } = req.query;
    const prjDir = findMatchingDir(CHATS_ROOT, project || 'General_Chats') || path.join(CHATS_ROOT, project || 'General_Chats');
    const targetFile = path.join(prjDir, `${id}.json`);
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
  const __tenantCtx = resolveTenantContext(req);
  const CHATS_ROOT = __tenantCtx.chatsRoot;
  try {
    const { project, id, title, messages } = req.body;
    const prjDir = findMatchingDir(CHATS_ROOT, project || 'General_Chats') || path.join(CHATS_ROOT, project || 'General_Chats');
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

    // WEBSOCKET BROADCAST: CHAT_UPDATED
    broadcast('CHAT_UPDATED', {
      project,
      chatId: id,
      title,
      filePath: targetFile
    });

    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.delete('/api/chats/delete', (req, res) => {
  const __tenantCtx = resolveTenantContext(req);
  const CHATS_ROOT = __tenantCtx.chatsRoot;
  try {
    const { project, id, deleteLedger } = req.query;
    const prjDir = findMatchingDir(CHATS_ROOT, project || 'General_Chats') || path.join(CHATS_ROOT, project || 'General_Chats');

    if (deleteLedger === 'true' && normKey(project) !== 'general_chats') {
      if (fs.existsSync(prjDir)) {
        fs.rmSync(prjDir, { recursive: true, force: true });
      }
      return res.json({ success: true, deletedLedger: project });
    }

    const targetFile = path.join(prjDir, `${id}.json`);
    if (fs.existsSync(targetFile)) {
      fs.unlinkSync(targetFile);
    }
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.post('/api/chats/archive', (req, res) => {
  const __tenantCtx = resolveTenantContext(req);
  const CHATS_ROOT = __tenantCtx.chatsRoot;
  try {
    const { project, chatId, title, summary } = req.body;
    const prjDir = findMatchingDir(CHATS_ROOT, project || 'General_Chats') || path.join(CHATS_ROOT, project || 'General_Chats');
    if (!fs.existsSync(prjDir)) fs.mkdirSync(prjDir, { recursive: true });
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
// 4. TAB 09: NORMALIZED WINDOWS PREVIEWS ENGINE
// ----------------------------------------------------------------------------

app.get('/api/previews/list', (req, res) => {
  const __tenantCtx = resolveTenantContext(req);
  const PROJECTS_ROOT = __tenantCtx.projectsRoot;
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
  const __tenantCtx = resolveTenantContext(req);
  const PROJECTS_ROOT = __tenantCtx.projectsRoot;
  try {
    const relPath = req.query.path;
    if (!relPath) return res.status(400).send('Path parameter missing');

    const cleanRelPath = decodeURIComponent(relPath).replace(/[\/\\]+/g, path.sep);
    const targetPath = path.resolve(PROJECTS_ROOT, cleanRelPath);

    const normTarget = targetPath.toLowerCase();
    const normRoot = PROJECTS_ROOT.toLowerCase();

    if (!normTarget.startsWith(normRoot) || !fs.existsSync(targetPath)) {
      return res.status(404).send('Artifact boundary fault: File not found on disk.');
    }

    const content = fs.readFileSync(targetPath, 'utf8');
    const ext = path.extname(targetPath).toLowerCase();

    if (ext === '.html') {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
    } else {
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    }

    return res.send(content);
  } catch (err) {
    return res.status(500).send(err.message);
  }
});

app.post('/api/previews/action', (req, res) => {
  try {
    const { action, project, artifactPath, critique, timestamp } = req.body;
    const ts = timestamp || new Date().toISOString();

    if (action === 'ACCEPT') {
      const line = `"${ts}","${project}","${artifactPath}","STAGED_APPROVED","EXEC_VERIFIED"\n`;
      fs.appendFileSync(STATE_LEDGER, line, 'utf8');
      
      // WEBSOCKET BROADCAST: ARTIFACT_PERSISTED
      broadcast('ARTIFACT_PERSISTED', {
        project,
        artifactPath,
        action: 'ACCEPT',
        timestamp: ts
      });
      
      return res.json({ status: 'COMMITTED', ledger: STATE_LEDGER });
    }

    if (action === 'REVISE') {
      const feedbackPayload = {
        timestamp: ts,
        project,
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
// 5. GLOBAL FALLBACK & LISTEN (MUST REMAIN LAST)
// ----------------------------------------------------------------------------

app.use((req, res) => {
  return res.json({
    success: true,
    status: 'FALLBACK_ACKNOWLEDGED',
    url: req.originalUrl
  });
});

server.listen(PORT, () => {
  console.log('====================================================');
  console.log('[PILLAR 2] MCNC PIPELINE ENGINE ONLINE');
  console.log(`[PORT]             : ${PORT}`);
  console.log(`[CANONICAL ROOT]   : ${PROJECTS_ROOT}`);
  console.log(`[CHATS ROOT]       : ${CHATS_ROOT}`);
  console.log(`[WEBSOCKET]        : ACTIVE (Port ${PORT})`);
  console.log(`[STATUS]           : DISK-TRUTH ACTIVE`);
  console.log('====================================================');
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n[CRITICAL] Port ${PORT} already in use. Kill process first.\n`);
  }
});