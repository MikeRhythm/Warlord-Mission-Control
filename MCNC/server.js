import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.post('/api/chat', async (req, res) => {
  try {
    const { prompt, attachments, model } = req.body;

    const content = [];

    // Attach Base64 images if present
    if (attachments && attachments.length > 0) {
      attachments.forEach((att) => {
        if (att.type === 'image') {
          content.push({
            type: 'image_url',
            image_url: { url: att.data }
          });
        }
      });
    }

    // Attach user prompt text
    content.push({ type: 'text', text: prompt || 'Analyze attached asset.' });

    // Clean model name (strip "nvidia/" or "openrouter/" prefix)
    let selectedModel = model || 'meta/llama-3.2-90b-vision-instruct';
    if (selectedModel.startsWith('nvidia/')) {
      selectedModel = selectedModel.replace('nvidia/', '');
    } else if (selectedModel.startsWith('openrouter/')) {
      selectedModel = selectedModel.replace('openrouter/', '');
    }

    const apiKey = process.env.NVIDIA_API_KEY || process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ 
        reply: '[ERROR]: Missing API key. Ensure NVIDIA_API_KEY is configured in your .env file.' 
      });
    }

    const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: selectedModel,
        messages: [
          {
            role: 'system',
            content: 'You are Monty, Chief of Staff on Base 1. You provide direct, high-level operational analysis, code execution plans, and multimodal visual breakdowns for Mike.'
          },
          {
            role: 'user',
            content: content
          }
        ],
        temperature: 0.2,
        max_tokens: 1024
      })
    });

    const rawText = await response.text();
    let data;
    try {
      data = JSON.parse(rawText);
    } catch {
      return res.json({ reply: `[UPSTREAM ERROR ${response.status}]: ${rawText}` });
    }

    if (!response.ok) {
      const errMsg = data.error?.message || data.detail || JSON.stringify(data);
      return res.json({ reply: `[API ERROR ${response.status}]: ${errMsg}` });
    }

    const replyText = data.choices?.[0]?.message?.content || 'Payload processed with empty response.';
    res.json({ reply: replyText });
  } catch (err) {
    console.error('Chat endpoint error:', err);
    res.json({ reply: `[SERVER EXCEPTION]: ${err.message}` });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ACTIVE', node: 'BASE_1', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`[MCNC BACKEND READY] Daemon listening on port ${PORT}`);
});