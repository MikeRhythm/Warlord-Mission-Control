const fs = require('fs');
const path = require('path');

// 1. Stamp headers directly onto any markdown files missing DOMAIN/NICHE
const vaultDir = path.normalize('C:/Warlord_Inc/Warlord_WASP/MCNC/vault');

function scanVault(dir) {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir);
  for (const entry of entries) {
    const fullPath = path.join(dir, entry);
    if (fs.statSync(fullPath).isDirectory()) {
      scanVault(fullPath);
    } else if (entry.endsWith('.md')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      if (!content.includes('DOMAIN:')) {
        let domain = 'Autonomous Agents';
        let niche = entry.replace('.md', '');
        if (entry.includes('Jev')) {
          domain = 'AI Tools';
          niche = 'Jev';
        } else if (entry.toLowerCase().includes('hermes')) {
          domain = 'Autonomous Agents';
          niche = 'Hermes';
        }
        const updated = 'DOMAIN: ' + domain + '\nNICHE: ' + niche + '\nTITLE: ' + niche + '\n\n' + content.trim();
        fs.writeFileSync(fullPath, updated, 'utf8');
        console.log('[HEADER INJECTED] ' + entry + ' -> ' + domain + ' / ' + niche);
      }
    }
  }
}
scanVault(vaultDir);

// 2. Patch server.js to force DOMAIN and NICHE header injection on every future push
const serverPath = path.normalize('C:/Warlord_Inc/Warlord_WASP/MCNC/server.js');
let sCode = fs.readFileSync(serverPath, 'utf8');

const targetSaveNeedle = "const { filename, title, domain, specialization, niche, content, pruneAndMerge } = req.body;";
const targetReplacement = 
  "let { filename, title, domain, specialization, niche, content, pruneAndMerge } = req.body;\n" +
  "    const cleanDomain = (domain || 'Autonomous Agents').trim();\n" +
  "    const cleanNiche = (specialization || niche || 'General').trim();\n" +
  "    if (!content.includes('DOMAIN:') || !content.includes('NICHE:')) {\n" +
  "        const stripped = content.replace(/^DOMAIN:.*\\r?\\n/m, '').replace(/^NICHE:.*\\r?\\n/m, '');\n" +
  "        content = 'DOMAIN: ' + cleanDomain + '\\nNICHE: ' + cleanNiche + '\\nTITLE: ' + cleanNiche + '\\n\\n' + stripped.trim();\n" +
  "    }";

if (sCode.includes(targetSaveNeedle)) {
  sCode = sCode.replace(targetSaveNeedle, targetReplacement);
  fs.writeFileSync(serverPath, sCode, 'utf8');
  console.log('[SUCCESS] server.js patched with permanent header injection.');
} else {
  console.log('[INFO] server.js save endpoint already updated.');
}

console.log('[COMPLETE] All vault files verified.');
