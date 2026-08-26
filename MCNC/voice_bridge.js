/**
 * WARLORD WASP // BASE 1 LOCAL AUDIO BRIDGE
 * STACK: Node.js + Express + Piper TTS
 * PORT: 8080
 */

const express = require('express');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json());

// ===============================================================
// ZERO-STATE INIT
// ===============================================================
let isSpeaking = false;
const PORT = 8080;
const AUDIO_OUT = path.join(__dirname, 'hermes_out.wav');
// Ensure any old corrupted audio file is wiped on boot
if (fs.existsSync(AUDIO_OUT)) {
    fs.unlinkSync(AUDIO_OUT);
}

// ===============================================================
// AUDIO ROUTING & EXECUTION
// ===============================================================
app.post('/speak', (req, res) => {
    const rawText = req.body.text;

    if (!rawText) {
        return res.status(400).send({ error: 'NO PAYLOAD DETECTED' });
    }

    if (isSpeaking) {
        return res.status(429).send({ error: 'SYSTEM BUSY: HERMES IS ALREADY SPEAKING' });
    }

    isSpeaking = true;
    console.log('\x1b[38;2;255;140;0m%s\x1b[0m', `[WARLORD BRIDGE] Processing Audio Directive: "${rawText.substring(0, 30)}..."`); // OrangeRed log

    // 1. Clean the text of markdown and system artifacts
    const cleanText = rawText.replace(/[*#_`~]/g, '').replace(/\n/g, ' ');

    // 2. Command to execute Piper TTS locally
    const piperCommand = `echo "${cleanText}" | .\\tts\\piper.exe --model .\\tts\\deep_voice.onnx --output_file "${AUDIO_OUT}"`;

    exec(piperCommand, (ttsError) => {
        if (ttsError) {
            console.log('\x1b[31m%s\x1b[0m', `[WARLORD BRIDGE] TTS GENERATION FAILED: ${ttsError.message}`);
            isSpeaking = false;
            return res.status(500).send({ error: 'TTS PROCESS FAILED' });
        }

        // 3. Play the generated audio file silently through Windows PowerShell
        const playCommand = `powershell -c (New-Object Media.SoundPlayer '${AUDIO_OUT}').PlaySync()`;
        
        exec(playCommand, (playError) => {
            if (playError) {
                console.log('\x1b[31m%s\x1b[0m', `[WARLORD BRIDGE] AUDIO PLAYBACK FAILED: ${playError.message}`);
            } else {
                console.log('\x1b[38;2;218;165;32m%s\x1b[0m', '[WARLORD BRIDGE] AUDIO TRANSMISSION COMPLETE.'); // Goldenrod log
            }
            
            // Release the audio lock
            isSpeaking = false;
            res.status(200).send({ status: 'SUCCESS' });
        });
    });
});

// ===============================================================
// IGNITION
// ===============================================================
app.listen(PORT, () => {
    console.log('\x1b[38;2;218;165;32m%s\x1b[0m', `===============================================================`);
    console.log('\x1b[38;2;218;165;32m%s\x1b[0m', `WARLORD AUDIO BRIDGE ONLINE // LISTENING ON PORT ${PORT}`);
    console.log('\x1b[38;2;218;165;32m%s\x1b[0m', `STATUS: AWAITING VOICE DIRECTIVES`);
    console.log('\x1b[38;2;218;165;32m%s\x1b[0m', `===============================================================`);
});