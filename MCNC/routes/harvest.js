const express = require('express');
const router = express.Router();
const { dispatchWarlordPayload } = require('../services/dispatcher');

router.post('/', async (req, res) => {
    try {
        const { url, rawText, topicDomain, specialization, projectContext } = req.body;
        
        let d = (topicDomain && !topicDomain.includes('[')) ? topicDomain : 'Autonomous Agents';
        let s = (specialization && !specialization.includes('[')) ? specialization : 'LLM Orchestration';
        
        const prompt = "Distill technical nugget from: " + (url || rawText || "Empty Input");
        
        // Pass the payload and the project state to the Dispatcher
        let n = await dispatchWarlordPayload(prompt, projectContext || 'DEFAULT');
        
        return res.json({ success: true, nugget: n, topicDomain: d, specialization: s });
    } catch (err) {
        console.error('[HARVEST ROUTE ERROR]', err);
        return res.status(500).json({ error: err.message });
    }
});

module.exports = router;
