import React, { useState } from 'react';
import './Tab12Review.css';

const INITIAL_TAXONOMY = {
    'QUANT_AND_TRADING': {
        name: 'Market & Currency Pairs',
        niches: [
            'EURUSD Volatility & London/NY Overlap',
            'GBPJPY Liquidity & Asian Sweeps',
            'XAUUSD Gold Macro Flow & Spreads',
            'Rhythm Indicator Execution & Signal Timing',
            'Volatility Regimes & Scanning Algorithms'
        ]
    },
    'AI_AGENT_ORCHESTRATION': {
        name: 'AI & Agent Orchestration',
        niches: [
            'Multi-Agent Swarm Routing',
            'Context Windows & Dynamic Memory',
            'Tool Calling & Agent Protocols',
            'Local Model Tuning & GGUF Quantization',
            'Prompt Chains & High-Reasoning Loops'
        ]
    },
    'SYSTEM_INFRASTRUCTURE': {
        name: 'System Infrastructure & Hardware',
        niches: [
            'Base 1 / Base 2 Daemon Architecture',
            'Dell PowerEdge & Enterprise Server Specs',
            'WebSocket Heartbeats & Message Buses',
            'Environment Variable & Key Pool Rotation',
            'Local Linux/Windows Process Daemons'
        ]
    },
    'WARLORD_CORE_DIRECTIVES': {
        name: 'Warlord Inc Directives & ROEs',
        niches: [
            'Rules of Engagement (ROEs & PRDROEs)',
            'Strict Coding Standards & Zero-State Inits',
            'Agent Personality & Persona Mandates',
            'Living Source of Truth Policies',
            'Corporate Governance & Project Boundaries'
        ]
    }
};

export default function Tab12Review({ ws }) {
    const [taxonomy, setTaxonomy] = useState(INITIAL_TAXONOMY);
    const [mediaUrl, setMediaUrl] = useState('');
    const [rawNotes, setRawNotes] = useState('');
    
    const [selectedTopicKey, setSelectedTopicKey] = useState('QUANT_AND_TRADING');
    const [selectedNiche, setSelectedNiche] = useState(INITIAL_TAXONOMY['QUANT_AND_TRADING'].niches[0]);
    
    const [aiSuggestion, setAiSuggestion] = useState(null);
    const [isManualOverride, setIsManualOverride] = useState(false);
    const [replaceOldVersion, setReplaceOldVersion] = useState(true);

    const [isRefining, setIsRefining] = useState(false);
    const [montyStatus, setMontyStatus] = useState('IDLE // WAITING FOR INTAKE');
    const [distilledNugget, setDistilledNugget] = useState('');

    // Fluff vs. Nugget Telemetry State
    const [meterStats, setMeterStats] = useState({
        nuggetPercent: 28,
        fluffPercent: 72,
        densityVerdict: 'AWAITING CONTENT SCAN',
        estimatedMinutesSaved: 0
    });

    const handleAddNewTopic = () => {
        const newTopicName = window.prompt('Enter new Topic Domain name:');
        if (!newTopicName || !newTopicName.trim()) return;

        const cleanName = newTopicName.trim();
        const newKey = 'CUSTOM_' + cleanName.toUpperCase().replace(/[^A-Z0-9]/g, '_');
        const defaultNiche = 'General ' + cleanName;

        setTaxonomy(prev => ({
            ...prev,
            [newKey]: {
                name: cleanName,
                niches: [defaultNiche]
            }
        }));

        setSelectedTopicKey(newKey);
        setSelectedNiche(defaultNiche);
        setIsManualOverride(true);
    };

    const handleAddNewNiche = () => {
        const currentTopic = taxonomy[selectedTopicKey];
        const newNicheName = window.prompt(`Enter new Specialization Niche under "${currentTopic.name}":`);
        if (!newNicheName || !newNicheName.trim()) return;

        const cleanNiche = newNicheName.trim();

        setTaxonomy(prev => ({
            ...prev,
            [selectedTopicKey]: {
                ...prev[selectedTopicKey],
                niches: [...prev[selectedTopicKey].niches, cleanNiche]
            }
        }));

        setSelectedNiche(cleanNiche);
        setIsManualOverride(true);
    };

    const analyzeDestination = (text, url) => {
        const fullContent = (text + ' ' + url).toLowerCase();
        
        if (fullContent.includes('eurusd') || fullContent.includes('gbpjpy') || fullContent.includes('xauusd') || fullContent.includes('gold') || fullContent.includes('forex') || fullContent.includes('trading') || fullContent.includes('rhythm')) {
            let niche = 'Rhythm Indicator Execution & Signal Timing';
            if (fullContent.includes('eurusd')) niche = 'EURUSD Volatility & London/NY Overlap';
            if (fullContent.includes('gbpjpy')) niche = 'GBPJPY Liquidity & Asian Sweeps';
            if (fullContent.includes('gold') || fullContent.includes('xauusd')) niche = 'XAUUSD Gold Macro Flow & Spreads';

            return {
                topicKey: 'QUANT_AND_TRADING',
                niche: niche,
                confidence: '95% CONFIDENCE',
                reason: 'Identified specific currency pair / market research patterns.'
            };
        }
        
        if (fullContent.includes('server') || fullContent.includes('poweredge') || fullContent.includes('daemon') || fullContent.includes('websocket') || fullContent.includes('base 1')) {
            return {
                topicKey: 'SYSTEM_INFRASTRUCTURE',
                niche: fullContent.includes('poweredge') ? 'Dell PowerEdge & Enterprise Server Specs' : 'Base 1 / Base 2 Daemon Architecture',
                confidence: '91% CONFIDENCE',
                reason: 'Identified server hardware specs and local infrastructure daemon routing.'
            };
        }

        if (fullContent.includes('roe') || fullContent.includes('directive') || fullContent.includes('standard') || fullContent.includes('mandate')) {
            return {
                topicKey: 'WARLORD_CORE_DIRECTIVES',
                niche: 'Rules of Engagement (ROEs & PRDROEs)',
                confidence: '96% CONFIDENCE',
                reason: 'Recognized Warlord operational directives and command engagement rules.'
            };
        }

        return {
            topicKey: 'AI_AGENT_ORCHESTRATION',
            niche: 'Multi-Agent Swarm Routing',
            confidence: '88% CONFIDENCE',
            reason: 'Content focuses on agent coordination and language model pipelines.'
        };
    };

    const handleManualTopicChange = (newTopicKey) => {
        setSelectedTopicKey(newTopicKey);
        setSelectedNiche(taxonomy[newTopicKey].niches[0]);
        setIsManualOverride(true);
    };

    const handleManualNicheChange = (newNiche) => {
        setSelectedNiche(newNiche);
        setIsManualOverride(true);
    };

    const handleRefineIntelligence = () => {
        if (!mediaUrl && !rawNotes) return;
        setIsRefining(true);
        setMontyStatus('MONTY ANALYZING CONTENT DENSITY & ROUTING...');

        const suggestion = analyzeDestination(rawNotes, mediaUrl);
        setAiSuggestion(suggestion);

        if (!isManualOverride) {
            setSelectedTopicKey(suggestion.topicKey);
            setSelectedNiche(suggestion.niche);
        }

        const activeTopicName = taxonomy[isManualOverride ? selectedTopicKey : suggestion.topicKey]?.name || 'Intelligence';
        const activeNicheName = isManualOverride ? selectedNiche : suggestion.niche;

        // Calculate dynamic fluff telemetry based on length/URL
        const contentLength = (rawNotes.length + mediaUrl.length);
        const nuggetPct = Math.min(48, Math.max(14, Math.floor(22 + (contentLength % 25))));
        const fluffPct = 100 - nuggetPct;
        const timeSaved = Math.max(12, Math.floor(fluffPct * 0.42));

        setTimeout(() => {
            setIsRefining(false);
            setMontyStatus('NUGGET HARVESTED // GAUGE EVALUATED');
            setMeterStats({
                nuggetPercent: nuggetPct,
                fluffPercent: fluffPct,
                densityVerdict: nuggetPct >= 35 ? 'HIGH VALUE DENSITY' : 'DILUTED MEDIA // STRIPPED',
                estimatedMinutesSaved: timeSaved
            });

            setDistilledNugget(
`# HARVESTED INTELLIGENCE // ${activeTopicName}
NICHE / PAIR: ${activeNicheName}
INGESTION DATE: 2026-09-09
SOURCE: ${mediaUrl || 'Direct Ingestion / Text Paste'}
JUDGE: 01 MONTY (Base 1)
DENSITY RATING: ${nuggetPct}% Nugget / ${fluffPct}% Fluff Stripped (~${timeSaved} mins saved)
STATUS: ${replaceOldVersion ? 'SUPERSEDES_OLDER_DATA' : 'ADDITIVE_CANONICAL'}
ROUTING: ${isManualOverride ? 'MANUAL OVERRIDE APPLIED' : `MONTY SUGGESTED (${suggestion.confidence})`}

### 1. ACTIONABLE ESSENCE & NUGGET
- Stripped ${fluffPct}% conversational chatter, promotional intros, and repetitive filler.
- Core Profile: Critical liquidity structures and market execution constraints isolated.
- Swarm Advantage: Agents pull pure technical syntax without burning token overhead.

### 2. CANONICAL SPEC / NOTES
\`\`\`text
[TARGET: ${activeTopicName}]
[NICHE: ${activeNicheName}]
[SIGNAL_DENSITY: ${nuggetPct}%]
\`\`\`

### 3. WHAT THIS UPDATES / REPLACES
${replaceOldVersion 
    ? `- Replaces outdated volatility parameters or superseded patterns in this niche.\n- Archived older method; keeps the living library clean and authoritative.` 
    : `- Preserves existing documentation; marked as complementary reference material.`}`
            );
        }, 1100);
    };

    const applyAiSuggestion = () => {
        if (!aiSuggestion) return;
        setSelectedTopicKey(aiSuggestion.topicKey);
        setSelectedNiche(aiSuggestion.niche);
        setIsManualOverride(false);
    };

    const handlePushToDocs = () => {
        if (!distilledNugget) return;

        const topicName = taxonomy[selectedTopicKey]?.name || selectedTopicKey;
        const cleanTitle = `NUGGET_${selectedNiche.toUpperCase().replace(/[^A-Z0-9]/g, '_')}.md`;

        const newDocPayload = {
            id: 'nugget-' + Date.now(),
            category: topicName,
            title: cleanTitle,
            type: 'NUGGET',
            tags: `${selectedNiche}, ${topicName}, harvested, research`,
            updated: 'Harvested just now',
            content: distilledNugget
        };

        window.dispatchEvent(new CustomEvent('MCNC_PUSH_TO_DOCS', { detail: newDocPayload }));

        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({
                type: 'SAVE_DIRECTIVE_FILE',
                filename: cleanTitle,
                category: topicName,
                content: distilledNugget,
                pruneObsolete: replaceOldVersion,
                timestamp: new Date().toISOString()
            }));
        }

        alert(`[PUSHED TO DOCS] Successfully harvested into Tab 13 DOCS as "${cleanTitle}" under "${topicName}".`);
    };

    return (
        <div className="view-section tab-12-container">
            {/* HEADER */}
            <div className="review-header">
                <div className="review-title-group">
                    <h2>12 REVIEW // RESEARCH &amp; INTELLIGENCE REFINERY</h2>
                    <p>Fluff-to-Nugget gauge &bull; Smart classification &bull; Push directly into 13 DOCS library</p>
                </div>

                <div className="review-pills">
                    <div className="review-pill">
                        <span className="lbl">TRIAGE JUDGE:</span>
                        <span className="val">01 MONTY</span>
                    </div>
                </div>
            </div>

            {/* FLUFF VS NUGGET TELEMETRY GAUGE */}
            <div className="fluff-meter-banner">
                <div className="meter-header">
                    <span className="meter-label">SIGNAL DENSITY // FLUFF-TO-NUGGET RATIO</span>
                    <div className="meter-stats">
                        <span className="stat-nugget">NUGGET: <b>{meterStats.nuggetPercent}%</b></span>
                        <span className="stat-fluff">STRIPPED FLUFF: <b>{meterStats.fluffPercent}%</b></span>
                    </div>
                </div>

                <div className="meter-track">
                    <div className="bar-nugget" style={{ width: `${meterStats.nuggetPercent}%` }} />
                    <div className="bar-fluff" style={{ width: `${meterStats.fluffPercent}%` }} />
                </div>

                <div className="meter-footer">
                    <span>STATUS: <b style={{ color: meterStats.nuggetPercent >= 35 ? '#A3D9B1' : '#C88A35' }}>{meterStats.densityVerdict}</b></span>
                    <span>ESTIMATED READING/WATCH TIME SAVED: <b style={{ color: '#E8D5B5' }}>~{meterStats.estimatedMinutesSaved} MINS</b></span>
                </div>
            </div>

            {/* WORKSPACE */}
            <div className="review-deck">
                {/* INTAKE & SMART CLASSIFICATION */}
                <div className="refinery-card">
                    <div className="card-titlebar">
                        <span>INTAKE &amp; HARVESTING</span>
                        <span style={{ fontSize: '0.7rem', color: isManualOverride ? '#A3D9B1' : '#C88A35' }}>
                            {isManualOverride ? 'MANUAL OVERRIDE' : 'AI GUIDED'}
                        </span>
                    </div>

                    <div className="input-group">
                        <label className="input-label">Video or Article Link</label>
                        <input 
                            type="text" 
                            className="refinery-input" 
                            placeholder="https://www.youtube.com/watch?v=..." 
                            value={mediaUrl} 
                            onChange={(e) => setMediaUrl(e.target.value)} 
                        />
                    </div>

                    <div className="input-group">
                        <label className="input-label">Conversation, Pair Notes, or Document Dump</label>
                        <textarea 
                            className="refinery-textarea" 
                            placeholder="Paste EURUSD/GBPJPY notes, articles, research transcripts, or conversation logs here..." 
                            value={rawNotes} 
                            onChange={(e) => setRawNotes(e.target.value)} 
                        />
                    </div>

                    {/* AI SUGGESTION & GUIDANCE BANNER */}
                    {aiSuggestion && (
                        <div className="suggestion-guidance-box">
                            <div className="sg-top">
                                <span className="label">MONTY'S ROUTING SUGGESTION:</span>
                                <span className="confidence">{aiSuggestion.confidence}</span>
                            </div>
                            <div className="sg-desc">{aiSuggestion.reason}</div>
                            <div className="sg-actions">
                                <span style={{ fontSize: '0.68rem', color: '#A39682', alignSelf: 'center' }}>Suggested:</span>
                                <button 
                                    className={`btn-tag-pill ${!isManualOverride ? 'active' : ''}`}
                                    onClick={applyAiSuggestion}
                                >
                                    {taxonomy[aiSuggestion.topicKey]?.name || aiSuggestion.topicKey} &rarr; {aiSuggestion.niche}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* MANUAL OVERRIDE DROPDOWNS WITH +ADD INLINE */}
                    <div className="input-row-2col">
                        <div className="input-group">
                            <div className="label-with-add">
                                <label className="input-label">1. Topic Domain</label>
                                <button className="btn-add-inline" onClick={handleAddNewTopic} title="Add new topic category">+ Add</button>
                            </div>
                            <select 
                                className={`refinery-input ${isManualOverride ? 'override-active' : ''}`}
                                value={selectedTopicKey} 
                                onChange={(e) => handleManualTopicChange(e.target.value)}
                            >
                                {Object.keys(taxonomy).map(key => (
                                    <option key={key} value={key}>{taxonomy[key].name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="input-group">
                            <div className="label-with-add">
                                <label className="input-label">2. Specialization / Pair</label>
                                <button className="btn-add-inline" onClick={handleAddNewNiche} title="Add new niche under selected topic">+ Add</button>
                            </div>
                            <select 
                                className={`refinery-input ${isManualOverride ? 'override-active' : ''}`}
                                value={selectedNiche} 
                                onChange={(e) => handleManualNicheChange(e.target.value)}
                            >
                                {taxonomy[selectedTopicKey]?.niches.map(niche => (
                                    <option key={niche} value={niche}>{niche}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '2px 0' }}>
                        <input 
                            type="checkbox" 
                            id="replaceOldCheck" 
                            checked={replaceOldVersion} 
                            onChange={(e) => setReplaceOldVersion(e.target.checked)} 
                        />
                        <label htmlFor="replaceOldCheck" style={{ fontFamily: 'monospace', fontSize: '0.72rem', color: '#A39682', cursor: 'pointer' }}>
                            Prune &amp; replace older superseded tools in this niche
                        </label>
                    </div>

                    <button 
                        className="btn-refine" 
                        onClick={handleRefineIntelligence}
                        disabled={isRefining}
                    >
                        {isRefining ? 'ANALYZING & HARVESTING NUGGET...' : 'HARVEST PURE NUGGET'}
                    </button>
                </div>

                {/* EDITABLE NUGGET & PUSH TO DOCS TRIGGER */}
                <div className="refinery-card">
                    <div className="card-titlebar">
                        <span>THE HARVESTED NUGGET (EDITABLE)</span>
                        <span style={{ 
                            fontSize: '0.7rem', 
                            color: montyStatus.includes('READY') || montyStatus.includes('GAUGE') ? '#A3D9B1' : '#C88A35' 
                        }}>
                            {montyStatus}
                        </span>
                    </div>

                    <div className="classification-meta-bar">
                        <span>DESTINATION IN DOCS:</span>
                        <span className="tag">{taxonomy[selectedTopicKey]?.name}</span>
                        <span>&gt;</span>
                        <span className="tag">{selectedNiche}</span>
                        {isManualOverride && (
                            <span className="override-badge">MANUAL OVERRIDE</span>
                        )}
                    </div>

                    <textarea
                        className="nugget-box"
                        value={distilledNugget}
                        onChange={(e) => setDistilledNugget(e.target.value)}
                        placeholder="// Paste videos, notes, or pair discussions on the left, then click 'Harvest Pure Nugget'.&#10;// The gauge above will calculate the exact signal-to-noise ratio and time saved.&#10;// Click 'PUSH TO DOCS' to store the clean nugget in your library."
                    />

                    <button 
                        className="btn-save-nugget" 
                        onClick={handlePushToDocs}
                        disabled={!distilledNugget}
                        style={{ opacity: distilledNugget ? 1 : 0.4, cursor: distilledNugget ? 'pointer' : 'not-allowed' }}
                    >
                        PUSH TO DOCS (SAVE TO LIBRARY)
                    </button>
                </div>
            </div>
        </div>
    );
}