/**
 * WARLORD INC // PILLAR 2: PROJECT & PIPELINE ENGINE
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
app.use(express.json());

const BASE_DIR = 'C:\\Warlord_Inc\\Warlord_WASP\\MCNC';
const DATA_DIR = path.join(BASE_DIR, 'Data');
const PROJECTS_ROOT = path.join(DATA_DIR, 'Projects');
const STATE_DIR = path.join(DATA_DIR, 'State');
const LEDGER_FILE = path.join(STATE_DIR, 'Global_Ledger.csv');
const SCRIPTS_DIR = path.join(BASE_DIR, 'scripts');

// Ensure foundational directories exist
[PROJECTS_ROOT, STATE_DIR].forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
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

app.get('/api/health', (req, res) => {
    res.json({
        status: 'ONLINE',
        pillar: 'PROJECT_AND_PIPELINE_ENGINE',
        port: PORT,
        projects_root: PROJECTS_ROOT
    });
});

app.get('/api/projects', (req, res) => {
    try {
        if (!fs.existsSync(PROJECTS_ROOT)) {
            return res.json({ success: true, count: 0, projects: [] });
        }

        const projectFolders = fs.readdirSync(PROJECTS_ROOT, { withFileTypes: true })
            .filter(dirent => dirent.isDirectory());

        const projects = projectFolders.map(dirent => {
            const projPath = path.join(PROJECTS_ROOT, dirent.name);
            const subDirs = fs.readdirSync(projPath, { withFileTypes: true })
                .filter(sub => sub.isDirectory())
                .map(sub => sub.name);

            const manifestPath = path.join(projPath, 'project_manifest.json');
            let manifest = { status: 'ACTIVE', category: 'General' };
            if (fs.existsSync(manifestPath)) {
                try {
                    manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
                } catch {
                    manifest = { status: 'CORRUPT_MANIFEST' };
                }
            }

            const leadsDir = path.join(projPath, 'Leads');
            let totalLeads = 0;
            const leadFiles = [];
            if (fs.existsSync(leadsDir)) {
                fs.readdirSync(leadsDir)
                    .filter(file => file.endsWith('.csv'))
                    .forEach(file => {
                        const count = countCsvRecords(path.join(leadsDir, file));
                        totalLeads += count;
                        leadFiles.push({ file, count });
                    });
            }

            return {
                id: dirent.name,
                name: dirent.name.replace(/_/g, ' '),
                path: projPath,
                directories: subDirs,
                total_leads: totalLeads,
                lead_files: leadFiles,
                manifest: manifest
            };
        });

        res.json({ success: true, count: projects.length, projects });
    } catch (error) {
        console.error('[!] FATAL: Failed to scan projects directory:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/projects/create', (req, res) => {
    const { projectName, subdirectories, prdPayload } = req.body;

    if (!projectName || !Array.isArray(subdirectories)) {
        return res.status(400).json({ 
            success: false, 
            error: 'Missing required parameters: projectName (string) and subdirectories (array).' 
        });
    }

    const cleanName = projectName.trim().replace(/[^a-zA-Z0-9_]/g, '_');
    const targetPath = path.join(PROJECTS_ROOT, cleanName);

    try {
        if (fs.existsSync(targetPath)) {
            return res.status(400).json({ success: false, error: `Project '${cleanName}' already exists on disk.` });
        }

        fs.mkdirSync(targetPath, { recursive: true });

        const createdDirs = [];
        subdirectories.forEach(dir => {
            const cleanSub = dir.trim().replace(/[^a-zA-Z0-9_]/g, '_');
            const subPath = path.join(targetPath, cleanSub);
            if (!fs.existsSync(subPath)) {
                fs.mkdirSync(subPath, { recursive: true });
                createdDirs.push(cleanSub);
            }
        });

        const manifest = {
            project_name: cleanName,
            created_at: new Date().toISOString(),
            schema: createdDirs,
            prd_data: prdPayload || {}
        };
        fs.writeFileSync(
            path.join(targetPath, 'project_manifest.json'),
            JSON.stringify(manifest, null, 4),
            'utf8'
        );

        console.log(`[+] Provisioned new project: ${cleanName} with ${createdDirs.length} subdirectories.`);
        res.json({ success: true, project: cleanName, directories: createdDirs, manifest });
    } catch (error) {
        console.error('[!] FATAL: Dynamic project creation failed:', error);
        res.status(500).json({ success: false, error: error.message });
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

app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`[PILLAR 2] MCNC PROJECT & PIPELINE ENGINE ONLINE`);
    console.log(`[PORT]          : ${PORT}`);
    console.log(`[PROJECTS ROOT] : ${PROJECTS_ROOT}`);
    console.log(`[STATE LEDGER]  : ${LEDGER_FILE}`);
    console.log(`[ENDPOINTS]     : GET  /api/projects`);
    console.log(`                : POST /api/projects/create`);
    console.log(`                : POST /api/pipeline/ingest`);
    console.log(`====================================================`);
});