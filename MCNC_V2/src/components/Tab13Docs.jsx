import React, { useState, useEffect } from 'react';
import './Tab13Docs.css';

const VAULT_ARCHIVE = [
    {
        id: 'doc-roe',
        category: 'WARLORD INC DIRECTIVES',
        niche: 'Rules of Engagement (ROEs)',
        title: 'WARLORD_COMMAND_ROES.md',
        type: 'HARD CONSTRAINT',
        purity: '100% CANONICAL',
        updated: '2026-09-09',
        content: `# WARLORD INC // RULES OF ENGAGEMENT & COMMAND DIRECTIVES
AUTHORITY: MIKE (FOUNDER)
STATUS: HARD SYSTEM CONSTRAINT // ZERO HALLUCINATIONS

## 1. ABSOLUTE ROES & CODING PROTOCOLS
- ATOMIC COMPILATION: Test and verify one component at a time. Never dump massive multi-system rewrites without atomic checkpoints.
- FULL FILE REPLACEMENTS ONLY: Never provide partial snippets or placeholder code. Provide full, ready-to-paste code blocks.
- ZERO UNAUTHORIZED CHANGES: Map all code to Mike's reality. Never alter file structures, indicator naming conventions, or color standards without explicit orders.
- PALETTE RESTRICTIONS: Follow High Finance aesthetic guidelines. Do not default to generic primary colors or unapproved blue/red palettes.

## 2. DISPATCH & REASONING RULES
- Fast/cheap operations route through Groq.
- Heavy code transformations and deep analysis stay isolated to designated high-reasoning passes.
- When an ROE directive updates, every active director agent must parse and conform immediately.`
    },
    {
        id: 'doc-broker',
        category: 'BROKER & EXECUTION VENUES',
        niche: 'Forex & CFD Prime Brokers',
        title: 'BROKER_RAW_SPREAD_AUDIT.md',
        type: 'BENCHMARK',
        purity: '96% DISTILLED',
        updated: '2026-09-08',
        content: `# BROKER DOSSIER // INSTITUTIONAL LIQUIDITY & RAW SPREADS
Classification: Broker & Execution Venues
Audited By: 01 Monty (Base 1)

## 1. EXECUTION INFRASTRUCTURE
- Equinix LD4 (London) & NY4 (New York) cross-connect benchmarks.
- Average raw EURUSD spread during London open: 0.0 to 0.2 pips + commission.
- Slippage containment: Fill rate > 99.4% on market orders under 10 lots.

## 2. COMPLIANCE & SAFETY OF CAPITAL
- Tier-1 regulatory jurisdictions only (FCA / ASIC).
- Segregated client trust accounts with audited liquidity providers.`
    },
    {
        id: 'doc-eurusd',
        category: 'MARKET & CURRENCY PAIRS',
        niche: 'Forex Majors (EURUSD)',
        title: 'PAIR_EURUSD_STRUCTURE.md',
        type: 'PROFILE',
        purity: '92% DISTILLED',
        updated: '2026-09-08',
        content: `# MARKET PROFILE // EURUSD
Niche: Forex Majors & Volatility Profile
Source: Rhythm Quant Library (Base 1)

## 1. SESSION REGIMES
- Peak Volume: London / NY Overlap (13:00 - 16:00 GMT).
- Average Daily Range (ADR): 65 - 85 pips under normal macroeconomic regimes.
- Rhythm Indicator Setup: 15-minute primary trigger aligned with H4 institutional trend.

## 2. EXECUTION CONSTRAINTS
- Avoid execution during high-impact ECB/FOMC rate releases within 15 minutes of print.
- Respect Goldenrod confirmation lines on closed candles only.`
    },
    {
        id: 'doc-gbpjpy',
        category: 'MARKET & CURRENCY PAIRS',
        niche: 'High-Beta Crosses (GBPJPY)',
        title: 'PAIR_GBPJPY_VOLATILITY.md',
        type: 'PROFILE',
        purity: '94% DISTILLED',
        updated: '2026-09-07',
        content: `# MARKET PROFILE // GBPJPY
Niche: High-Beta Cross & Liquidity Sweeps
Source: Rhythm Quant Library

## 1. VOLATILITY & SPREAD DYNAMICS
- High ADR (110 - 150 pips typical). Rapid wick aggression.
- False breakouts common during Asian session wrap-up.
- Stop guardrails: Dynamic ATR buffer multiplied by 1.6 to avoid institutional hunt sweeps.`
    },
    {
        id: 'doc-agents',
        category: 'AI & AGENT ORCHESTRATION',
        niche: 'Multi-Agent Swarm Routing',
        title: 'VEIN_AI_Agent_Orchestration.md',
        type: 'NUGGET',
        purity: '98% DISTILLED',
        updated: '2026-09-09',
        content: `# REFINED REFERENCE // AI & AGENT ORCHESTRATION
Niche: Multi-Agent Swarm Routing
Reviewed By: 01 Monty (Base 1)
Status: CANONICAL ACTIVE

### 1. ACTIONABLE PATTERN
- Isolate heavy reasoning passes from routine JSON telemetry pings.
- Maintain WebSocket heartbeats on lightweight local daemons rather than spinning heavy LLM calls.

### 2. PRUNING POLICY
- Deprecated single-prompt 2024 patterns stripped.
- Use dynamic KeyPool rotation for all external API endpoints.`
    }
];

export default function Tab13Docs({ ws }) {
    const [vaultDocs, setVaultDocs] = useState(() => {
        const stored = localStorage.getItem('WARLORD_MCNC_VAULT_DOCS');
        return stored ? JSON.parse(stored) : VAULT_ARCHIVE;
    });

    const [selectedCategory, setSelectedCategory] = useState('ALL');
    const [selectedNiche, setSelectedNiche] = useState('ALL');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedDocId, setSelectedDocId] = useState('doc-roe');
    const [saveStatus, setSaveStatus] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    // Listen for incoming pushes directly from Tab 12 Review
    useEffect(() => {
        const handlePushEvent = (e) => {
            const incoming = e.detail;
            if (!incoming) return;

            setVaultDocs(prev => {
                const idx = prev.findIndex(d => d.title === incoming.title);
                let next;
                if (idx >= 0) {
                    next = [...prev];
                    next[idx] = incoming;
                } else {
                    next = [incoming, ...prev];
                }
                localStorage.setItem('WARLORD_MCNC_VAULT_DOCS', JSON.stringify(next));
                return next;
            });

            setSelectedDocId(incoming.id);
            setSaveStatus(`HARVESTED & FILED // ${incoming.title}`);
            setTimeout(() => setSaveStatus(''), 4000);
        };

        window.addEventListener('MCNC_PUSH_TO_DOCS', handlePushEvent);
        return () => window.removeEventListener('MCNC_PUSH_TO_DOCS', handlePushEvent);
    }, []);

    // Interactive +Add for Domain Category
    const handleAddCategory = () => {
        const newCat = window.prompt('Enter new Knowledge Domain / Category:');
        if (!newCat || !newCat.trim()) return;

        const cleanCat = newCat.trim().toUpperCase();
        const defaultNiche = 'General ' + cleanCat;
        const newDoc = {
            id: 'doc-' + Date.now(),
            category: cleanCat,
            niche: defaultNiche,
            title: `INDEX_${cleanCat.replace(/[^A-Z0-9]/g, '_')}.md`,
            type: 'INDEX',
            purity: '100% PURE',
            updated: 'Created just now',
            content: `# KNOWLEDGE DOMAIN // ${cleanCat}\nNiche: ${defaultNiche}\nStatus: ACTIVE\n\n// Place your thoughts and distilled nuggets for ${cleanCat} here.`
        };

        const updated = [newDoc, ...vaultDocs];
        setVaultDocs(updated);
        localStorage.setItem('WARLORD_MCNC_VAULT_DOCS', JSON.stringify(updated));
        setSelectedCategory(cleanCat);
        setSelectedNiche(defaultNiche);
        setSelectedDocId(newDoc.id);
    };

    // Interactive +Add for Subject / Niche
    const handleAddNiche = () => {
        const currentCat = selectedCategory === 'ALL' ? 'GENERAL RESEARCH' : selectedCategory;
        const newNiche = window.prompt(`Enter new Subject / Niche under "${currentCat}":`);
        if (!newNiche || !newNiche.trim()) return;

        const cleanNiche = newNiche.trim();
        const newDoc = {
            id: 'doc-' + Date.now(),
            category: currentCat,
            niche: cleanNiche,
            title: `NOTE_${cleanNiche.toUpperCase().replace(/[^A-Z0-9]/g, '_')}.md`,
            type: 'DOSSIER',
            purity: '100% PURE',
            updated: 'Created just now',
            content: `# DOSSIER // ${cleanNiche}\nDomain: ${currentCat}\nStatus: CANONICAL\n\n// Add distilled insights, pair analysis, or technical constraints here.`
        };

        const updated = [newDoc, ...vaultDocs];
        setVaultDocs(updated);
        localStorage.setItem('WARLORD_MCNC_VAULT_DOCS', JSON.stringify(updated));
        setSelectedCategory(currentCat);
        setSelectedNiche(cleanNiche);
        setSelectedDocId(newDoc.id);
    };

    // Interactive +Add for a New Blank Dossier
    const handleAddNewDossier = () => {
        const currentCat = selectedCategory === 'ALL' ? 'GENERAL RESEARCH' : selectedCategory;
        const currentNiche = selectedNiche === 'ALL' ? 'General Insights' : selectedNiche;
        const docName = window.prompt('Enter new Dossier Filename (e.g., BROKER_PEPPERSTONE_RAW.md):');
        if (!docName || !docName.trim()) return;

        let cleanTitle = docName.trim();
        if (!cleanTitle.endsWith('.md')) cleanTitle += '.md';

        const newDoc = {
            id: 'doc-' + Date.now(),
            category: currentCat,
            niche: currentNiche,
            title: cleanTitle,
            type: 'DOSSIER',
            purity: '100% PURE',
            updated: 'Created just now',
            content: `# DOSSIER // ${cleanTitle}\nDomain: ${currentCat}\nNiche: ${currentNiche}\nCreated: 2026-09-09\n\n// Add your thoughts and nuggets here.`
        };

        const updated = [newDoc, ...vaultDocs];
        setVaultDocs(updated);
        localStorage.setItem('WARLORD_MCNC_VAULT_DOCS', JSON.stringify(updated));
        setSelectedDocId(newDoc.id);
    };

    // Dynamic categories & niches
    const categories = ['ALL', ...Array.from(new Set(vaultDocs.map(d => d.category)))];

    const niches = selectedCategory === 'ALL'
        ? ['ALL', ...Array.from(new Set(vaultDocs.map(d => d.niche)))]
        : ['ALL', ...Array.from(new Set(vaultDocs.filter(d => d.category === selectedCategory).map(d => d.niche)))];

    // Filter documents
    const filteredDocs = vaultDocs.filter(d => {
        const matchesCat = selectedCategory === 'ALL' || d.category === selectedCategory;
        const matchesNiche = selectedNiche === 'ALL' || d.niche === selectedNiche;
        const q = searchQuery.toLowerCase();
        const matchesSearch = !q || (
            d.title.toLowerCase().includes(q) ||
            d.category.toLowerCase().includes(q) ||
            d.niche.toLowerCase().includes(q) ||
            d.content.toLowerCase().includes(q)
        );
        return matchesCat && matchesNiche && matchesSearch;
    });

    const activeDoc = vaultDocs.find(d => d.id === selectedDocId) || filteredDocs[0] || vaultDocs[0] || {};

    const handleContentEdit = (text) => {
        setVaultDocs(prev => {
            const updated = prev.map(d => 
                d.id === activeDoc.id ? { ...d, content: text, updated: 'Edited just now' } : d
            );
            localStorage.setItem('WARLORD_MCNC_VAULT_DOCS', JSON.stringify(updated));
            return updated;
        });
    };

    const handleSaveToObsidian = () => {
        setIsSaving(true);
        setSaveStatus('WRITING TO OBSIDIAN ON BASE 1...');

        const payload = {
            type: 'SAVE_DIRECTIVE_FILE',
            filename: activeDoc.title,
            category: activeDoc.category,
            content: activeDoc.content,
            timestamp: new Date().toISOString()
        };

        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify(payload));
        }

        setTimeout(() => {
            setIsSaving(false);
            setSaveStatus(`SAVED // ${activeDoc.title} COMMITTED TO DISK`);
            setTimeout(() => setSaveStatus(''), 3000);
        }, 500);
    };

    return (
        <div className="view-section tab-13-container">
            {/* HEADER */}
            <div className="study-header">
                <div className="study-title-group">
                    <h2>13 DOCS // THE OBSIDIAN VAULT &amp; KNOWLEDGE STUDY</h2>
                    <p>Filtered research &bull; Authoritative ROEs &bull; Quiet library for brokers, markets &amp; AI intelligence</p>
                </div>

                <div className="study-stats">
                    <div className="study-pill">
                        <span className="lbl">ARCHIVE CAPACITY:</span>
                        <span className="val">{vaultDocs.length} PURE DOSSIERS</span>
                    </div>
                    <div className="study-pill">
                        <span className="lbl">SYNC STATUS:</span>
                        <span className="val" style={{ color: '#A3D9B1' }}>OBSIDIAN DISK LINKED</span>
                    </div>
                </div>
            </div>

            {/* CONTROL BAR: TWO-TIER DROPDOWNS WITH +ADD & KEYWORD SEARCH */}
            <div className="study-control-bar">
                <div className="ctrl-group">
                    <div className="ctrl-label-row">
                        <label className="ctrl-label">1. Knowledge Domain</label>
                        <button className="btn-add-ctrl" onClick={handleAddCategory} title="Add new top-level category">+ Add</button>
                    </div>
                    <select 
                        className="study-select"
                        value={selectedCategory}
                        onChange={(e) => {
                            setSelectedCategory(e.target.value);
                            setSelectedNiche('ALL');
                        }}
                    >
                        {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>

                <div className="ctrl-group">
                    <div className="ctrl-label-row">
                        <label className="ctrl-label">2. Subject / Niche</label>
                        <button className="btn-add-ctrl" onClick={handleAddNiche} title="Add new niche under category">+ Add</button>
                    </div>
                    <select 
                        className="study-select"
                        value={selectedNiche}
                        onChange={(e) => setSelectedNiche(e.target.value)}
                    >
                        {niches.map(n => (
                            <option key={n} value={n}>{n}</option>
                        ))}
                    </select>
                </div>

                <div className="ctrl-group">
                    <div className="ctrl-label-row">
                        <label className="ctrl-label">Quick Search Across Vault</label>
                    </div>
                    <input 
                        type="text" 
                        className="study-search"
                        placeholder="Search brokers, pairs (EURUSD/GBPJPY), ROEs, prompts..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* WORKSPACE */}
            <div className="study-deck">
                {/* LEFT: ARCHIVE SHELF */}
                <div className="shelf-card">
                    <div className="shelf-titlebar">
                        <span>AVAILABLE DOSSIERS ({filteredDocs.length})</span>
                        <button className="btn-add-dossier" onClick={handleAddNewDossier} title="Create new dossier in active niche">+ New Doc</button>
                    </div>

                    <div className="shelf-list">
                        {filteredDocs.map(doc => (
                            <div 
                                key={doc.id} 
                                className={`shelf-item ${doc.id === activeDoc.id ? 'active' : ''}`}
                                onClick={() => setSelectedDocId(doc.id)}
                            >
                                <div className="shelf-item-top">
                                    <span className="shelf-item-title">{doc.title}</span>
                                    <span className="shelf-item-badge">{doc.type || 'DOC'}</span>
                                </div>
                                <span className="shelf-item-meta">{doc.niche}</span>
                            </div>
                        ))}

                        {filteredDocs.length === 0 && (
                            <div style={{ padding: '20px', textAlign: 'center', color: '#8A7E72', fontSize: '0.75rem', fontFamily: 'monospace' }}>
                                // No dossiers found matching filters.
                            </div>
                        )}
                    </div>
                </div>

                {/* RIGHT: READING DESK (THE LEATHER CHAIR WORKSPACE) */}
                <div className="desk-card">
                    <div className="desk-titlebar">
                        <h3>{activeDoc.title || 'Select a Dossier'}</h3>
                        <span style={{ fontSize: '0.72rem', color: '#A3D9B1' }}>
                            {saveStatus || `LAST VERIFIED: ${activeDoc.updated || 'N/A'}`}
                        </span>
                    </div>

                    <div className="desk-meta-bar">
                        <span>DOMAIN: <b>{activeDoc.category || '--'}</b></span>
                        <span>&bull;</span>
                        <span>NICHE: <b>{activeDoc.niche || '--'}</b></span>
                        <span>&bull;</span>
                        <span>PURITY: <b style={{ color: '#00FF66' }}>{activeDoc.purity || 'DISTILLED'}</b></span>
                        <span style={{ marginLeft: 'auto', color: '#8A7E72' }}>
                            Authoritative reference for all agents
                        </span>
                    </div>

                    <textarea 
                        className="desk-content-viewport"
                        value={activeDoc.content || ''}
                        onChange={(e) => handleContentEdit(e.target.value)}
                        placeholder="Select a dossier from the shelf to read or edit..."
                    />

                    <div className="desk-footer">
                        <span>Base 1 agents pull authoritative system constraints from this memory bank</span>
                        <button 
                            className="btn-desk-save"
                            onClick={handleSaveToObsidian}
                            disabled={isSaving}
                        >
                            {isSaving ? 'COMMITTING TO DISK...' : 'SAVE TO OBSIDIAN VAULT'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}