require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const fs = require('fs');
const path = require('path');
const https = require('https');

const SOURCES_PATH = path.join(__dirname, '..', 'vault', 'Config', 'ai_radar_sources.json');
const REGISTRY_PATH = path.join(__dirname, '..', 'vault', 'Config', 'model_registry.json');
const REVIEW_PENDING_DIR = path.join(__dirname, '..', 'vault', 'Review', 'Pending');
const DOCS_DIR = path.join(__dirname, '..', 'vault', 'Docs');

function getActiveModel() {
  let model = 'qwen/qwen3.6-27b';
  if (fs.existsSync(REGISTRY_PATH)) {
    try {
      const reg = JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf8'));
      model = reg.default_routing?.REASONING_TIER?.model || model;
    } catch (_) {}
  }
  return model;
}

function fetchHttps(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return resolve(fetchHttps(res.headers.location));
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

async function resolveChannelFeed(channel) {
  if (channel.feedUrl) return channel.feedUrl;
  try {
    const html = await fetchHttps(`https://www.youtube.com/${channel.handle}`);
    const match = html.match(/channel_id=([a-zA-Z0-9_-]{24})/);
    if (match && match[1]) {
      channel.feedUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${match[1]}`;
      return channel.feedUrl;
    }
  } catch (err) {
    console.warn(`[WARN] Could not resolve channel ID for ${channel.handle}: ${err.message}`);
  }
  return null;
}

function parseYouTubeRss(xmlText, channelName) {
  const entries = [];
  const entryMatches = xmlText.match(/<entry>[\s\S]*?<\/entry>/g) || [];

  for (const entry of entryMatches) {
    const titleMatch = entry.match(/<title>(.*?)<\/title>/);
    const linkMatch = entry.match(/<link rel="alternate" href="(.*?)"\/>/);
    const publishedMatch = entry.match(/<published>(.*?)<\/published>/);
    const videoIdMatch = entry.match(/<yt:videoId>(.*?)<\/yt:videoId>/);

    if (titleMatch && linkMatch) {
      const pubDate = publishedMatch ? new Date(publishedMatch[1]) : new Date();
      const hoursAgo = (Date.now() - pubDate.getTime()) / (1000 * 60 * 60);

      if (hoursAgo <= 48) {
        entries.push({
          channel: channelName,
          title: titleMatch[1].replace(/&quot;/g, '"').replace(/&amp;/g, '&'),
          url: linkMatch[1],
          videoId: videoIdMatch ? videoIdMatch[1] : `vid_${Date.now()}`,
          published: pubDate.toISOString()
        });
      }
    }
  }
  return entries;
}

function callTessFilter(items) {
  return new Promise((resolve, reject) => {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) return reject(new Error('GROQ_API_KEY missing in .env'));

    const itemsPayload = items.map(i => ({
      id: i.videoId,
      channel: i.channel,
      title: i.title,
      url: i.url
    }));

    const payload = JSON.stringify({
      model: getActiveModel(),
      messages: [
        {
          role: 'system',
          content: `You are Tess, Lead Quant & Intel Analyst for Warlord MCNC.
Evaluate candidate videos for operational AI, development workflows, or automated architecture.

ALLOWED CATEGORIES:
- "Hermes" (Local model fine-tunes, agent pipelines, system prompts, inference)
- "Paperclip" (Context ingestion, document scraping, vault memory, vector storage)
- "Kanban" (Task execution flows, project management, queue dispatch)
- "MQL5" (Trading automation, quantitative systems, tick bridges)
- "Architecture" (Local servers, hardware setups, Base 1 / Base 2 tooling)
- "General_AI" (High-value foundation models, breakthrough tools, automation pipelines)

SCORING RULES:
- Return ONLY items scoring >= 7.
- Filter out empty hype, generic tutorials, reactions, corporate gossip.
- Set autoApprove to true if score >= 9.

OUTPUT FORMAT: Strict JSON array of objects.
[
  {
    "id": "videoId",
    "score": 7,
    "category": "Paperclip",
    "title": "Actionable Title",
    "channel": "Creator Name",
    "url": "https://...",
    "tacticalSummary": "Specific operational takeaway and architecture relevance.",
    "autoApprove": false
  }
]
If nothing meets the bar, return an empty array: []`
        },
        {
          role: 'user',
          content: JSON.stringify(itemsPayload)
        }
      ],
      temperature: 0.1
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
          const rawContent = parsed.choices[0].message.content.trim();
          const cleanJson = rawContent.replace(/^```json/, '').replace(/^```/, '').replace(/```$/, '').trim();
          resolve(JSON.parse(cleanJson));
        } catch (e) {
          reject(new Error(`Tess evaluation failed to return valid JSON: ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

function stageReviewItem(item) {
  const safeTitle = item.title.replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 40);
  const dateStr = new Date().toISOString().split('T')[0];
  const filename = `${dateStr}_${item.category}_${safeTitle}.md`;

  const mdContent = `---
id: "${item.id}"
title: "${item.title}"
channel: "${item.channel}"
category: "${item.category}"
score: ${item.score}
source_url: "${item.url}"
staged_at: "${new Date().toISOString()}"
status: "PENDING_REVIEW"
---

# ${item.title}
**Category:** ${item.category} | **Score:** ${item.score}/10 | **Source:** ${item.channel}
**Direct Link:** [Watch Video](${item.url})

## Tactical Value Assessment
${item.tacticalSummary}

## Pipeline Directives
- Pass to Tab 13 Docs: Moves directly to \`vault/Docs/${item.category}/${item.title.replace(/[^a-zA-Z0-9_-]/g, '_')}.md\`
`;

  if (!fs.existsSync(REVIEW_PENDING_DIR)) fs.mkdirSync(REVIEW_PENDING_DIR, { recursive: true });
  const pendingFilePath = path.join(REVIEW_PENDING_DIR, filename);
  fs.writeFileSync(pendingFilePath, mdContent, 'utf8');
  console.log(`[REVIEW STAGED] -> Tab 12: ${filename}`);

  if (item.autoApprove) {
    promoteToDocs(item, pendingFilePath);
  }
}

function promoteToDocs(item, pendingFilePath) {
  const targetCategoryDir = path.join(DOCS_DIR, item.category);
  if (!fs.existsSync(targetCategoryDir)) fs.mkdirSync(targetCategoryDir, { recursive: true });

  const safeTitle = item.title.replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 40);
  const docPath = path.join(targetCategoryDir, `${safeTitle}.md`);

  const docContent = `# ${item.title}
> **Category:** ${item.category} | **Channel:** ${item.channel} | **Score:** ${item.score}/10
> **Original Source:** [${item.url}](${item.url})
> **Ingested:** ${new Date().toISOString()}

## Operational Brief
${item.tacticalSummary}

## Architecture Integration
- Auto-promoted via Tess Gatekeeper.
- Target Project Workspace: \`${item.category}\`.
`;

  fs.writeFileSync(docPath, docContent, 'utf8');
  console.log(`[DOCS PROMOTED] -> Tab 13: vault/Docs/${item.category}/${safeTitle}.md`);

  if (fs.existsSync(pendingFilePath)) {
    const updated = fs.readFileSync(pendingFilePath, 'utf8').replace('status: "PENDING_REVIEW"', 'status: "PROMOTED_TO_DOCS"');
    fs.writeFileSync(pendingFilePath, updated, 'utf8');
  }
}

async function runAiRadarSync() {
  if (!fs.existsSync(SOURCES_PATH)) return;

  const { channels } = JSON.parse(fs.readFileSync(SOURCES_PATH, 'utf8'));
  let allRecentVideos = [];

  for (const chan of channels) {
    const feed = await resolveChannelFeed(chan);
    if (!feed) continue;

    try {
      const xml = await fetchHttps(feed);
      const videos = parseYouTubeRss(xml, chan.name);
      allRecentVideos.push(...videos);
    } catch (err) {
      console.error(`[RADAR] Error on ${chan.name}: ${err.message}`);
    }
  }

  if (allRecentVideos.length === 0) {
    console.log('[RADAR] No candidate uploads found in last 48 hours.');
    return;
  }

  console.log(`[RADAR] Evaluating ${allRecentVideos.length} videos through Tess Gatekeeper...`);
  const qualifiedItems = await callTessFilter(allRecentVideos);

  console.log(`[RADAR DEBUG] Tess qualified items:\n`, JSON.stringify(qualifiedItems, null, 2));
  console.log(`[RADAR] ${qualifiedItems.length} videos qualified (Score >= 7).`);

  for (const item of qualifiedItems) {
    stageReviewItem(item);
  }
}

if (require.main === module) {
  runAiRadarSync();
}

module.exports = { runAiRadarSync, promoteToDocs };