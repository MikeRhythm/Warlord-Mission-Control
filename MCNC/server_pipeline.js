// ============================================================================
// WARLORD WASP // MCNC BACKEND PIPELINE & EXECUTION SERVER
// PORT: 8082
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

// Base System Paths
const BASE_MCNC = 'C:\\Warlord_Inc\\Warlord_WASP\\MCNC';
const PROJECTS_ROOT = path.join(BASE_MCNC, 'Data', 'Projects');
const CHATS_ROOT = path.join(BASE_MCNC, 'Data', 'Chats');
const STATE_LEDGER = path.join(BASE_MCNC, 'Data', 'State', 'Global_Ledger.csv');
const RAW_INTAKE = path.join(BASE_MCNC, 'vault', 'Docs', '_raw_intake');
const MONITOR_BAT = path.join(BASE_MCNC, 'WASP_Pipes_Monitor.bat');
const MONITOR_PS1 = path.join(BASE_MCNC, 'WASP_Pipes_Monitor.ps1');

// Ensure Base Directories Exist
[PROJECTS_ROOT, CHATS_ROOT, path.dirname(STATE_LEDGER), RAW_INTAKE].forEach(dir => {
    if (!fs.existsSync(dir)) {
        try {
            fs.mkdirSync(dir, { recursive: true });
        } catch (e) {
            console.error(`[PIPELINE] Warning: Could not create directory ${dir}:`, e.message);
        }
    }
});

// Ensure Global Ledger Exists
if (!fs.existsSync(STATE_LEDGER)) {
    try {
        fs.writeFileSync(STATE_LEDGER, 'Timestamp,Entity,Action,Status,Notes\n', 'utf8');
    } catch (e) {
        console.error('[PIPELINE] Warning: Could not initialize Global_Ledger.csv:', e.message);
    }
}

// ----------------------------------------------------------------------------
// 1. HEALTH & TELEMETRY CONDUITS
// ----------------------------------------------------------------------------

app.get('/api/health', (req, res) => {
    return res.json({
        status: 'ONLINE',
        pillar: 2,
        port: PORT,
        timestamp: new Date().toISOString()
    });
});

// Trigger WASP Heartbeat GUI HUD onto Desktop
app.all('/api/heartbeat', (req, res) => {
    console.log('[HEARTBEAT] Signal received from cockpit. Launching WASP Heartbeat HUD...');

    // Use Windows ShellExecute via cmd.exe start to force the GUI window onto the interactive desktop in focus
    const batTarget = fs.existsSync(MONITOR_BAT) ? MONITOR_BAT : 'C:\\Users\\Administrator\\Desktop\\WASP_Pipes_Monitor.bat';
    const shellCmd = `cmd.exe /c start "" "${batTarget}"`;

    exec(shellCmd, (err) => {
        if (err) {
            console.warn('[HEARTBEAT] Batch launch fallback, trying PowerShell directly:', err.message);
            const psFallback = `powershell.exe -ExecutionPolicy Bypass -Sta -File "${MONITOR_PS1}"`;
            exec(psFallback, (psErr) => {
                if (psErr) console.error('[HEARTBEAT] Execution error:', psErr.message);
            });
        }
    });

    return res.json({ status: 'TRIGGERED', timestamp: new Date().toISOString() });
});

// ----------------------------------------------------------------------------
// 2. FILE & INTAKE CONDUITS
// ----------------------------------------------------------------------------

app.get('/api/intake/files', (req, res) => {
    try {
        if (!fs.existsSync(RAW_INTAKE)) {
            return res.json({ files: [] });
        }
        const files = fs.readdirSync(RAW_INTAKE).map(f => {
            const fullPath = path.join(RAW_INTAKE, f);
            const stats = fs.statSync(fullPath);
            return {
                name: f,
                size: stats.size,
                mtime: stats.mtime
            };
        });
        return res.json({ files });
    } catch (err) {
        console.error('[INTAKE] File read error:', err.message);
        return res.status(500).json({ error: err.message });
    }
});

// ----------------------------------------------------------------------------
// 3. LEDGER & CHAT MANAGEMENT
// ----------------------------------------------------------------------------

app.get('/api/ledger/state', (req, res) => {
    try {
        if (!fs.existsSync(STATE_LEDGER)) {
            return res.json({ lines: [] });
        }
        const data = fs.readFileSync(STATE_LEDGER, 'utf8');
        const lines = data.split('\n').filter(Boolean);
        return res.json({ lines });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

app.post('/api/ledger/append', (req, res) => {
    try {
        const { entity, action, status, notes } = req.body;
        const line = `"${new Date().toISOString()}","${entity || ''}","${action || ''}","${status || ''}","${notes || ''}"\n`;
        fs.appendFileSync(STATE_LEDGER, line, 'utf8');
        return res.json({ success: true });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

// ----------------------------------------------------------------------------
// 4. SERVER INITIALIZATION & LISTENER WITH ERROR HANDLING
// ----------------------------------------------------------------------------

const server = app.listen(PORT, () => {
    const geminiStatus = process.env.GEMINI_API_KEY ? 'DETECTED (ONLINE)' : 'UNSET (OPTIONAL)';
    console.log('====================================================');
    console.log('[PILLAR 2] MCNC PROJECT & PIPELINE ENGINE ONLINE');
    console.log(`[PORT]           : ${PORT}`);
    console.log(`[GEMINI API KEY] : ${geminiStatus}`);
    console.log(`[PROJECTS ROOT]  : ${PROJECTS_ROOT}`);
    console.log(`[CHATS ROOT]     : ${CHATS_ROOT}`);
    console.log(`[STATE LEDGER]   : ${STATE_LEDGER}`);
    console.log('[STATUS]         : 100% OPERATIONAL // CLEAN');
    console.log('====================================================');
});

server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`\n[CRITICAL] Port ${PORT} is ALREADY in use by another process.`);
        console.error(`Kill the existing process on port ${PORT} before running.\n`);
    } else {
        console.error('[CRITICAL] Server listen error:', err.message);
    }
});