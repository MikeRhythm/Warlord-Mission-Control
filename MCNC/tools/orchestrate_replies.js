require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const fs = require('fs');
const path = require('path');
const https = require('https');

/**
 * WARLORD MCNC ORCHESTRATION BRIDGE (GROQ LLAMA 3.3 70B)
 * Synthesizes draft replies for incoming leads.
 */

const PENDING_DIR = path.join(__dirname, '..', 'vault', 'Marketing', 'Pending_Replies');

function callGroq(prompt) {
  return new Promise((resolve, reject) => {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return reject(new Error('GROQ_API_KEY is missing in .env file'));
    }

    const payload = JSON.stringify({
      model: 'qwen/qwen3.8-27b',
      messages: [
        {
          role: 'system',
          content: 'You are Monty, Chief of Staff for Commander Mike. Draft high-density, direct, plain-text email replies using the Minto Pyramid framework. 50-80 words max. No corporate fluff. End with one binary question and sign off: "Best,\nMike"'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3
    });

    const req = https.request({
      hostname: 'api.groq.com',
      path: '/openai/v1/chat/completions',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.error) {
            reject(new Error(parsed.error.message || 'Groq API error'));
          } else {
            resolve(parsed.choices[0].message.content.trim());
          }
        } catch (e) {
          reject(new Error(`Failed to parse Groq response: ${data}`));
        }
      });
    });

    req.on('error', (err) => reject(err));
    req.write(payload);
    req.end();
  });
}

async function orchestrate() {
  if (!fs.existsSync(PENDING_DIR)) {
    console.log('[MONTY] No pending directory found.');
    return;
  }

  const files = fs.readdirSync(PENDING_DIR).filter(f => f.endsWith('.md'));
  console.log(`[MONTY] Scanning pending inbox replies. Found: ${files.length}`);

  for (const file of files) {
    const filePath = path.join(PENDING_DIR, file);
    let content = fs.readFileSync(filePath, 'utf8');

    // Skip if already drafted
    if (content.includes('COMMANDER_STATUS:') && !content.includes('Error parsing model response.')) {
      continue;
    }

    console.log(`[MONTY] Calling Groq (Llama 3.3 70B) for: ${file}`);

    try {
      const draft = await callGroq(`Review this incoming inquiry and draft our reply:\n\n${content}`);

      // Strip existing failed draft blocks if re-running
      let cleaned = content.split('## Staged Response Draft (Monty)')[0];
      
      const newFileContent = `${cleaned.trim()}\n\n## Staged Response Draft (Monty)\n${draft}\n\n---\n## Execution Gate\nCOMMANDER_STATUS: PENDING_APPROVAL\nDISPATCH_READY: FALSE\n`;

      fs.writeFileSync(filePath, newFileContent, 'utf8');
      console.log(`[MONTY] Success! Draft staged into ${file}`);
    } catch (err) {
      console.error(`[ERROR] Monty synthesis failed: ${err.message}`);
    }
  }

  console.log('[MONTY] Cycle complete.');
}

orchestrate();