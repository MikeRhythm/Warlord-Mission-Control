const thermostats = require('../config/thermostats');

async function dispatchWarlordPayload(prompt, activeProject = 'DEFAULT') {
    const profile = thermostats[activeProject] || thermostats['DEFAULT'];
    console.log(`[DISPATCH] Route: ${activeProject} | Heat: ${profile.temp}`);
    
    try {
        // AI execution payload structure locked by the Thermostat.
        const payload = {
            model: "meta/llama-3.3-70b-instruct",
            temperature: profile.temp,
            messages: [
                { role: "system", content: profile.system },
                { role: "user", content: prompt }
            ]
        };

        // For now, this returns a simulated extraction validating the specific heat applied.
        // Once NIM/Ollama is reconnected, we swap this string with the actual fetch(URL, payload).
        let output = `### PURE HARVEST\n\n* **Thermostat Lock:** ${profile.temp}\n* **Project Context:** ${activeProject}\n\n* Intelligence distilled on Base 1.\n* Ready for push to 13 DOCS.`;
        
        return output;
    } catch (err) {
        console.error("[DISPATCH ERROR]", err);
        return "### ERROR\n\nDispatch failed on Base 1.";
    }
}

module.exports = { dispatchWarlordPayload };
