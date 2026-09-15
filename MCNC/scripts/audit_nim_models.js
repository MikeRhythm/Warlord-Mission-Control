require('dotenv').config();
const fs = require('fs');
const path = require('path');

const NIM_KEY = process.env.NVIDIA_NIM_KEY || process.env.NVIDIA_API_KEY;
const VAULT_OUTPUT = path.join(__dirname, '..', 'vault', 'telemetry', 'nim_catalog.md');

async function auditNIM() {
  if (!NIM_KEY) {
    console.error('[NIM AUDIT ERROR] No NVIDIA_NIM_KEY or NVIDIA_API_KEY found in .env');
    process.exit(1);
  }

  try {
    console.log('[NIM AUDIT] Querying NVIDIA API catalog endpoint...');
    const res = await fetch('https://integrate.api.nvidia.com/v1/models', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${NIM_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`HTTP ${res.status}: ${errText}`);
    }

    const json = await res.json();
    const models = json.data || [];
    console.log(`[NIM AUDIT] Retrieved ${models.length} total models from NVIDIA.`);

    // Filter down to text/chat models (Meta, Mistral, Qwen, DeepSeek, Nemotron)
    const chatModels = models
      .filter(m => {
        const id = m.id.toLowerCase();
        return (
          id.includes('meta/') ||
          id.includes('nvidia/') ||
          id.includes('mistral') ||
          id.includes('deepseek') ||
          id.includes('qwen')
        ) && !id.includes('embed') && !id.includes('reward') && !id.includes('guard');
      })
      .sort((a, b) => a.id.localeCompare(b.id));

    let md = `# ACTIVE NVIDIA NIM MODEL REGISTRY\n\n`;
    md += `**Audit Timestamp:** ${new Date().toISOString()}\n`;
    md += `**Total Usable Chat Models:** ${chatModels.length}\n\n`;
    md += `| Target Slug | Owned By |\n`;
    md += `| :--- | :--- |\n`;

    chatModels.forEach(m => {
      md += `| \`${m.id}\` | ${m.owned_by || 'nvidia'} |\n`;
    });

    const outDir = path.dirname(VAULT_OUTPUT);
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(VAULT_OUTPUT, md, 'utf8');

    console.log(`\n--- USABLE NIM CHAT MODELS (${chatModels.length}) ---`);
    chatModels.slice(0, 10).forEach(m => console.log(` * ${m.id}`));
    if (chatModels.length > 10) console.log(` ... and ${chatModels.length - 10} more.`);
    console.log(`\n[SUCCESS] Catalog written to ${VAULT_OUTPUT}`);

  } catch (err) {
    console.error('[NIM AUDIT FAILED]:', err.message);
    process.exit(1);
  }
}

auditNIM();
