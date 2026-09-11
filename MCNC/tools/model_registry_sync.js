require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const fs = require('fs');
const path = require('path');
const https = require('https');

const CONFIG_DIR = path.join(__dirname, '..', 'vault', 'Config');
const MANIFEST_PATH = path.join(CONFIG_DIR, 'model_registry.json');

function fetchJson(options) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error(`Failed to parse response: ${data}`));
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

async function getGroqModels() {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return [];

  const res = await fetchJson({
    hostname: 'api.groq.com',
    path: '/openai/v1/models',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${apiKey}` }
  });

  return (res.data || []).map(m => m.id);
}

async function syncRegistry() {
  console.log('[REGISTRY] Probing model endpoints...');
  if (!fs.existsSync(CONFIG_DIR)) fs.mkdirSync(CONFIG_DIR, { recursive: true });

  const groqActive = await getGroqModels().catch(err => {
    console.warn(`[WARN] Groq model query failed: ${err.message}`);
    return [];
  });

  // Selection logic for Groq
  const groqReasoning = groqActive.find(id => id.startsWith('qwen/') || id.includes('70b') || id.includes('versatile')) || groqActive[0];
  const groqFast = groqActive.find(id => id.includes('8b') || id.includes('instant')) || groqReasoning;

  const manifest = {
    last_synced: new Date().toISOString(),
    providers: {
      groq: {
        active_models: groqActive,
        tiers: {
          REASONING_TIER: groqReasoning,
          FAST_TIER: groqFast
        }
      }
    },
    default_routing: {
      REASONING_TIER: { provider: 'groq', model: groqReasoning },
      FAST_TIER: { provider: 'groq', model: groqFast }
    }
  };

  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2), 'utf8');
  console.log(`[REGISTRY] Manifest updated: ${MANIFEST_PATH}`);
  console.log(`[REGISTRY] REASONING_TIER -> ${groqReasoning}`);
}

if (require.main === module) {
  syncRegistry();
}

module.exports = { syncRegistry };