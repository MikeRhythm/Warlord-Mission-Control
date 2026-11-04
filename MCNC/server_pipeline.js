// ============================================================================
// WARLORD WASP // MCNC BACKEND PIPELINE & EXECUTION SERVER
// PORT: 8082
// RUNTIME: C:\Warlord_Inc\Warlord_WASP\MCNC
// FILE: C:\Warlord_Inc\Warlord_WASP\MCNC\server_pipeline.js
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

app.get(['/api/projects', '/api/projects/list', '/api/projects/all'], (req, res) => {
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
          manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
        } catch (e) {
          console.error(`[PIPELINE] Failed to parse manifest for ${name}:`, e.message);
        }
      }

      // Scan physical subdirectories
      let subdirs = [];
      try {
        subdirs = fs.readdirSync(prjPath, { withFileTypes: true })
          .filter(d => d.isDirectory())
          .map(d => d.name);
      } catch (e) {}

      // Count files across all subdirectories
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

      // Check for lead files
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

    // Provision subdirectories
    const dirsToCreate = subdirectories && Array.isArray(subdirectories)
      ? subdirectories
      : ['Leads', 'Responses_And_Donations', 'Assets_And_Artwork', 'Web_And_Social', 'Source_Artifacts'];

    dirsToCreate.forEach(dir => {
      const subPath = path.join(targetDir, dir);
      if (!fs.existsSync(subPath)) {
        fs.mkdirSync(subPath, { recursive: true });
      }
    });

    // Write initial project_manifest.json
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

    // Seed master chat ledger
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

    return res.json({ success: true, project: cleanName, path: targetDir });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// ----------------------------------------------------------------------------
// 3. TAB 01: AUTO-HEALING CHAT DISCOVERY
// ----------------------------------------------------------------------------

app.get('/api/chats/all', (req, res) => {
  try {
    const catalog = {};
    const discoveredProjects = new Set(['General_Chats']);

    if (fs.existsSync(PROJECTS_ROOT)) {
      fs.readdirSync(PROJECTS_ROOT, { withFileTypes: true })
        .filter(d => d.isDirectory())
        .forEach(d => discoveredProjects.add(d.name));
    }

    if (fs.existsSync(CHATS_ROOT)) {
      fs.readdirSync(CHATS_ROOT, { withFileTypes: true })
        .filter(d => d.isDirectory())
        .forEach(d => discoveredProjects.add(d.name));
    }

    discoveredProjects.forEach(prj => {
      catalog[prj] = [];
      const prjChatDir = path.join(CHATS_ROOT, prj);

      if (!fs.existsSync(prjChatDir)) {
        fs.mkdirSync(prjChatDir, { recursive: true });
      }

      let files = fs.readdirSync(prjChatDir).filter(f => f.endsWith('.json') && !f.includes('Master'));

      if (files.length === 0) {
        const seedId = `chat_init_${Date.now()}`;
        const seedPayload = {
          id: seedId,
          title: 'Master Chat',
          project: prj,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          messages: []
        };
        fs.writeFileSync(path.join(prjChatDir, `${seedId}.json`), JSON.stringify(seedPayload, null, 2), 'utf8');
        files = [`${seedId}.json`];
      }

      catalog[prj] = files.map(file => {
        try {
          const raw = fs.readFileSync(path.join(prjChatDir, file), 'utf8');
          const parsed = JSON.parse(raw);
          return {
            id: parsed.id || file.replace('.json', ''),
            title: parsed.title || 'Master Chat',
            project: prj,
            updatedAt: parsed.updatedAt || new Date().toISOString()
          };
        } catch (e) {
          return { id: file.replace('.json', ''), title: file.replace('.json', ''), project: prj };
        }
      });
    });

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
// 4. TAB 09: NORMALIZED WINDOWS PREVIEWS ENGINE
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
// 5. GLOBAL FALLBACK & LISTEN
// ----------------------------------------------------------------------------

app.use((req, res) => {
  return res.json({
    success: true,
    status: 'FALLBACK_ACKNOWLEDGED',
    url: req.originalUrl
  });
});

const server = 
// ==========================================
// NUCLEAR PURGE & OBSIDIAN ARCHIVE CONTROLLERS
// ==========================================
app.post('/api/projects/purge', (req, res) => {
    try {
        const { projectName } = req.body;
        if (!projectName) return res.status(400).json({ success: false, error: 'Project name required.' });

        const safeSlug = projectName.toString().trim().replace(/[<>:"\/\\|?*]+/g, '');
        const targets = [
            path.join('C:\\Warlord_Inc\\Warlord_WASP\\MCNC\\Data\\Projects', safeSlug),
            path.join('C:\\Warlord_Inc\\Warlord_WASP\\MCNC\\Data\\Chats', safeSlug),
            path.join('C:\\Warlord_Inc\\Warlord_WASP\\MCNC\\vault\\Docs', safeSlug)
        ];

        targets.forEach(dir => {
            if (fs.existsSync(dir)) {
                fs.rmSync(dir, { recursive: true, force: true });
            }
        });

        const prdPattern = `01_PRD_${safeSlug.replace(/\s+/g, '_')}.md`;
        const rootPrd = path.join('C:\\Warlord_Inc\\Warlord_WASP\\MCNC\\vault\\Docs', prdPattern);
        if (fs.existsSync(rootPrd)) fs.unlinkSync(rootPrd);

        console.log(`[NUCLEAR PURGE] Physically obliterated project: ${safeSlug}`);
        res.json({ success: true, purged: safeSlug });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.post('/api/projects/archive-obsidian', (req, res) => {
    try {
        const { projectName } = req.body;
        if (!projectName) return res.status(400).json({ success: false, error: 'Project name required.' });

        const safeSlug = projectName.toString().trim().replace(/[<>:"\/\\|?*]+/g, '');
        const srcProj = path.join('C:\\Warlord_Inc\\Warlord_WASP\\MCNC\\Data\\Projects', safeSlug);
        const srcChat = path.join('C:\\Warlord_Inc\\Warlord_WASP\\MCNC\\Data\\Chats', safeSlug);
        
        const archiveRoot = 'C:\\Warlord_Inc\\Warlord_WASP\\MCNC\\vault\\Archive';
        const archiveProjDir = path.join(archiveRoot, 'Projects', safeSlug);
        const archiveChatDir = path.join(archiveRoot, 'Chats', safeSlug);

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

        console.log(`[OBSIDIAN ARCHIVE] Project moved to Obsidian Archive: ${safeSlug}`);
        res.json({ success: true, archived: safeSlug, archivePath: archiveProjDir });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.listen(PORT, () => {
  console.log('====================================================');
  console.log('[PILLAR 2] MCNC PIPELINE ENGINE ONLINE');
  console.log(`[PORT]             : ${PORT}`);
  console.log(`[CANONICAL ROOT]   : ${PROJECTS_ROOT}`);
  console.log(`[CHATS ROOT]       : ${CHATS_ROOT}`);
  console.log(`[STATUS]           : DISK-TRUTH ACTIVE`);
  console.log('====================================================');
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n[CRITICAL] Port ${PORT} already in use. Kill process first.\n`);
  }
});