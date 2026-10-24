/**
 * WARLORD INC // PILLAR 2: PROJECT & PIPELINE ENGINE & PERSISTENT CHAT LEDGER
 * Host Path: C:\Warlord_Inc\Warlord_WASP\MCNC\server_pipeline.js
 * Port: 8082
 */

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
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
    timestamp: new Date().toISOString()
  });
});

// Patched to return proper project objects for Tab03Projects.jsx
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
// PERSISTENT CHAT LEDGER ROUTES (MOUNTED FOR TAB 01 EXEC)
// ============================================================================

// 1. Fetch All Sub-Chats by Project
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

// 2. Save Sub-Chat to Disk
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

// 3. Load Specific Sub-Chat
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

// 4. Delete Sub-Chat from Disk
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

// 5. Load Immutable Master Chat
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

// 6. Archive Sub-Chat: Commit to Master Chat, 13 Docs, and Purge JSON
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

    // A. Append to Project MASTER_CHAT.md
    const masterFile = path.join(CHATS_ROOT, project, 'MASTER_CHAT.md');
    fs.appendFileSync(masterFile, fullNode, 'utf8');

    // B. Save copy to vault/Docs for Tab 13 Docs consumption
    const projDocsDir = path.join(VAULT_DOCS_ROOT, project);
    if (!fs.existsSync(projDocsDir)) {
      fs.mkdirSync(projDocsDir, { recursive: true });
    }
    const docFile = path.join(projDocsDir, `${chatId}_${title.replace(/[^a-zA-Z0-9_-]/g, '_')}.md`);
    fs.writeFileSync(docFile, `# ARCHIVED THREAD: ${title}\n` + fullNode, 'utf8');

    // C. Remove the transient sub-chat JSON
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
  console.log(`====================================================`);
  console.log(`[PILLAR 2] MCNC PROJECT & PIPELINE ENGINE ONLINE`);
  console.log(`[PORT]          : ${PORT}`);
  console.log(`[PROJECTS ROOT] : ${PROJECTS_ROOT}`);
  console.log(`[CHATS ROOT]    : ${CHATS_ROOT}`);
  console.log(`[STATE LEDGER]  : ${LEDGER_FILE}`);
  console.log(`[ENDPOINTS]     : GET    /api/projects`);
  console.log(`                : POST   /api/projects/create`);
  console.log(`                : POST   /api/pipeline/ingest`);
  console.log(`                : GET    /api/chats/all`);
  console.log(`                : POST   /api/chats/save`);
  console.log(`                : GET    /api/chats/load`);
  console.log(`                : DELETE /api/chats/delete`);
  console.log(`                : GET    /api/chats/master`);
  console.log(`                : POST   /api/chats/archive`);
  console.log(`====================================================`);
});