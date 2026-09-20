/**
 * WARLORD WASP // BASE 1 LOCAL AUDIO BRIDGE
 * STACK: Node.js + Express + Piper TTS (Stream Mode)
 * PORT: 8080
 */

const express = require('express');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const app = express();

// Simple CORS header injection without requiring third-party cors module
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    if (req.method === 'OPTIONS') return res.sendStatus(200);
    next();
});

app.use(express.json());

const PORT = 8080;
const AUDIO_OUT = path.join(__dirname, 'hermes_out.wav');

// ZERO-STATE INIT
if (fs.existsSync(AUDIO_OUT)) {
    try {
        fs.unlinkSync(AUDIO_OUT);
    } catch (e) {
        console.error('[WARLORD BRIDGE] Cleanup warning:', e.message);
    }
}

app.post('/speak', (req, res) => {
    const rawText = req.body.text;

    if (!rawText) {
        return res.status(400).json({ error: 'NO PAYLOAD DETECTED' });
    }

    console.log('\x1b[38;2;255;140;0m%s\x1b[0m', `[WARLORD BRIDGE] Generating TTS (1.2x): "${rawText.substring(0, 30)}..."`);

    // Clean text of markdown and system artifacts
    const cleanText = rawText.replace(/[*#_`~]/g, '').replace(/\n/g, ' ');

    // Piper TTS generation at 1.2x speed (--length_scale 0.833)
    const piperCommand = `echo "${cleanText}" | .\\tts\\piper.exe --model .\\tts\\deep_voice.onnx --length_scale 0.833 --output_file "${AUDIO_OUT}"`;

    exec(piperCommand, (ttsError) => {
        if (ttsError) {
            console.log('\x1b[31m%s\x1b[0m', `[WARLORD BRIDGE] TTS GENERATION FAILED: ${ttsError.message}`);
            return res.status(500).json({ error: 'TTS PROCESS FAILED' });
        }

        console.log('\x1b[38;2;218;165;32m%s\x1b[0m', '[WARLORD BRIDGE] AUDIO READY. STREAMING TO CLIENT.');
        res.setHeader('Content-Type', 'audio/wav');
        const stream = fs.createReadStream(AUDIO_OUT);
        stream.pipe(res);
    });
});

app.listen(PORT, () => {
    console.log('\x1b[38;2;218;165;32m%s\x1b[0m', `===============================================================`);
    console.log('\x1b[38;2;218;165;32m%s\x1b[0m', `WARLORD AUDIO BRIDGE ONLINE // STREAMING ON PORT ${PORT}`);
    console.log('\x1b[38;2;218;165;32m%s\x1b[0m', `STATUS: AWAITING VOICE DIRECTIVES`);
    console.log('\x1b[38;2;218;165;32m%s\x1b[0m', `===============================================================`);
});