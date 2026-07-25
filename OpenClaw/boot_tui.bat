@echo off
set "PORT=18789"
set "OPENCLAW_PROVIDER=ollama"
set "OPENCLAW_BASE_URL=http://127.0.0.1:11434/v1"
set "OPENCLAW_MODEL=qwen2.5"
set "OPENCLAW_SKIP_CHANNELS=1"
node scripts/run-node.mjs tui
