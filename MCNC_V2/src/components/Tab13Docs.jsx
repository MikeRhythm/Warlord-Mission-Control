import React, { useState, useEffect, useCallback } from 'react';
import './Tab13Docs.css';

export default function Tab13Docs({ ws }) {
    const [vaultDocs, setVaultDocs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('ALL');
    const [selectedNiche, setSelectedNiche] = useState('ALL');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedDocId, setSelectedDocId] = useState(null);
    const [saveStatus, setSaveStatus] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [isPruning, setIsPruning] = useState(false);

    // Fetch genuine filesystem vault dossiers from Base 1
    const fetchVaultDocs = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await fetch('http://127.0.0.1:8081/api/docs/list');
            const data = await res.json();
            if (data.status === 'SUCCESS' && Array.isArray(data.docs)) {
                setVaultDocs(data.docs);
                if (data.docs.length > 0 && !selectedDocId) {
                    setSelectedDocId(data.docs[0].id);
                }
            } else {
                setSaveStatus('[FETCH WARN] Empty vault returned.');
            }
        } catch (err) {
            setSaveStatus(`[DAEMON OFFLINE]: ${err.message}`);
        } finally {
            setIsLoading(false);
        }
    }, [selectedDocId]);

    useEffect(() => {
        fetchVaultDocs();
    }, [fetchVaultDocs]);

    // Handle incoming events from Tab 12
    useEffect(() => {
        const handlePushEvent = () => {
            fetchVaultDocs();
            setSaveStatus('NEW HARVEST DETECTED // REFRESHED FROM DISK');
            setTimeout(() => setSaveStatus(''), 4000);
        };

        window.addEventListener('MCNC_PUSH_TO_DOCS', handlePushEvent);
        window.addEventListener('push-to-docs', handlePushEvent);
        return () => {
            window.removeEventListener('MCNC_PUSH_TO_DOCS', handlePushEvent);
            window.removeEventListener('push-to-docs', handlePushEvent);
        };
    }, [fetchVaultDocs]);

    // Dynamic categories & niches directly from filesystem scan
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
            (d.content && d.content.toLowerCase().includes(q))
        );
        return matchesCat && matchesNiche && matchesSearch;
    });

    const activeDoc = vaultDocs.find(d => d.id === selectedDocId) || filteredDocs[0] || {};

    const handleContentEdit = (text) => {
        setVaultDocs(prev => prev.map(d => 
            d.id === activeDoc.id ? { ...d, content: text, updated: 'Edited just now' } : d
        ));
    };

    // Save edited content directly back to the physical .md file
    const handleSaveToObsidian = async () => {
        if (!activeDoc || !activeDoc.title) return;
        setIsSaving(true);
        setSaveStatus('WRITING TO OBSIDIAN VAULT...');

        try {
            const response = await fetch('http://127.0.0.1:8081/api/docs/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    domain: activeDoc.category,
                    specialization: activeDoc.niche,
                    filename: activeDoc.title,
                    content: activeDoc.content
                })
            });
            const data = await response.json();
            if (data.status === 'SUCCESS') {
                setSaveStatus(`COMMITTED // ${activeDoc.title}`);
                fetchVaultDocs();
            } else {
                setSaveStatus(`[WRITE ERROR]: ${data.error}`);
            }
        } catch (err) {
            setSaveStatus(`[NETWORK ERROR]: ${err.message}`);
        } finally {
            setIsSaving(false);
            setTimeout(() => setSaveStatus(''), 4000);
        }
    };

    // Distill document to core operational signal (strips fluff via LLM condensation)
    const handlePruneDossier = async () => {
        if (!activeDoc || !activeDoc.filePath || isPruning) return;
        
        setIsPruning(true);
        setSaveStatus('PRUNING FLUFF // DISTILLING OPERATIONAL SIGNAL...');

        try {
            const res = await fetch('http://127.0.0.1:8081/api/docs/prune', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ filePath: activeDoc.filePath })
            });
            const data = await res.json();
            if (data.status === 'SUCCESS') {
                setSaveStatus(`DISTILLED // ${activeDoc.title}`);
                setVaultDocs(prev => prev.map(d => 
                    d.id === activeDoc.id ? { ...d, content: data.content, updated: 'Pruned just now' } : d
                ));
            } else {
                setSaveStatus(`[PRUNE ERROR]: ${data.error}`);
            }
        } catch (err) {
            setSaveStatus(`[NETWORK ERROR]: ${err.message}`);
        } finally {
            setIsPruning(false);
            setTimeout(() => setSaveStatus(''), 4000);
        }
    };

    const handleAddNewDossier = () => {
        const domain = selectedCategory === 'ALL' ? 'GENERAL RESEARCH' : selectedCategory;
        const niche = selectedNiche === 'ALL' ? 'General' : selectedNiche;
        const filename = window.prompt('Enter Dossier Name (e.g. MQL5_Execution_Rules):');
        if (!filename || !filename.trim()) return;

        fetch('http://127.0.0.1:8081/api/docs/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                domain,
                specialization: niche,
                content: `# DOSSIER // ${filename}\nDomain: ${domain}\nNiche: ${niche}\nDate: 2026-09-11\n\n// Add verified vectors here.`
            })
        }).then(() => fetchVaultDocs());
    };

    return (
        <div className="view-section tab-13-container">
            {/* HEADER */}
            <div className="study-header">
                <div className="study-title-group">
                    <h2>13 DOCS // THE OBSIDIAN VAULT &amp; KNOWLEDGE STUDY</h2>
                    <p>Live Filesystem Telemetry &bull; Distilled Intelligence &bull; Active Base 1 Repositories</p>
                </div>

                <div className="study-stats">
                    <button 
                        onClick={fetchVaultDocs}
                        className="study-pill cursor-pointer hover:border-[#ffb800] transition-colors"
                        style={{ background: '#14171c', cursor: 'pointer' }}
                        title="Reload Vault from disk"
                    >
                        <span className="lbl">ACTION:</span>
                        <span className="val" style={{ color: '#ffb800' }}>REFRESH DISK</span>
                    </button>
                    <div className="study-pill">
                        <span className="lbl">ARCHIVE CAPACITY:</span>
                        <span className="val">{vaultDocs.length} LIVE DOSSIERS</span>
                    </div>
                    <div className="study-pill">
                        <span className="lbl">SYNC STATUS:</span>
                        <span className="val" style={{ color: '#10b981' }}>LIVE DISK LINKED</span>
                    </div>
                </div>
            </div>

            {/* CONTROL BAR */}
            <div className="study-control-bar">
                <div className="ctrl-group">
                    <div className="ctrl-label-row">
                        <label className="ctrl-label">1. Knowledge Domain</label>
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
                        placeholder="Search vectors, filenames, models, ROEs..."
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
                        <button className="btn-add-dossier" onClick={handleAddNewDossier} title="Create new blank file on disk">+ New Doc</button>
                    </div>

                    <div className="shelf-list">
                        {isLoading && (
                            <div style={{ padding: '20px', textAlign: 'center', color: '#5c6b7f', fontSize: '0.75rem', fontFamily: 'monospace' }}>
                                SCANNING BASE 1 VAULT DIRECTORIES...
                            </div>
                        )}
                        
                        {!isLoading && filteredDocs.map(doc => (
                            <div 
                                key={doc.id} 
                                className={`shelf-item ${doc.id === activeDoc.id ? 'active' : ''}`}
                                onClick={() => setSelectedDocId(doc.id)}
                            >
                                <div className="shelf-item-top">
                                    <span className="shelf-item-title">{doc.title}</span>
                                    <span className="shelf-item-badge">{doc.type}</span>
                                </div>
                                <span className="shelf-item-meta">{doc.category} &gt; {doc.niche}</span>
                            </div>
                        ))}

                        {!isLoading && filteredDocs.length === 0 && (
                            <div style={{ padding: '20px', textAlign: 'center', color: '#8A7E72', fontSize: '0.75rem', fontFamily: 'monospace' }}>
                                // No files found on disk matching criteria.
                            </div>
                        )}
                    </div>
                </div>

                {/* RIGHT: READING DESK */}
                <div className="desk-card">
                    <div className="desk-titlebar">
                        <h3>{activeDoc.title || 'Select a Dossier'}</h3>
                        <span style={{ fontSize: '0.72rem', color: saveStatus.includes('ERROR') ? '#ef4444' : '#10b981' }}>
                            {saveStatus || `MODIFIED: ${activeDoc.updated || 'N/A'}`}
                        </span>
                    </div>

                    <div className="desk-meta-bar">
                        <span>DOMAIN: <b>{activeDoc.category || '--'}</b></span>
                        <span>&bull;</span>
                        <span>NICHE: <b>{activeDoc.niche || '--'}</b></span>
                        <span>&bull;</span>
                        <span>STATUS: <b style={{ color: '#10b981' }}>AUTHENTIC FILE</b></span>
                        
                        {activeDoc.filePath && (
                            <button 
                                onClick={handlePruneDossier}
                                disabled={isPruning}
                                style={{
                                    marginLeft: 'auto',
                                    background: isPruning ? 'rgba(255, 184, 0, 0.3)' : 'rgba(255, 184, 0, 0.15)',
                                    color: '#ffb800',
                                    border: '1px solid rgba(255, 184, 0, 0.4)',
                                    padding: '2px 10px',
                                    borderRadius: '3px',
                                    fontSize: '0.68rem',
                                    cursor: isPruning ? 'wait' : 'pointer',
                                    fontWeight: 'bold',
                                    letterSpacing: '0.5px'
                                }}
                                title="Consolidate core operational signal and strip fluff via LLM"
                            >
                                {isPruning ? 'PRUNING...' : 'PRUNE'}
                            </button>
                        )}
                    </div>

                    <textarea 
                        className="desk-content-viewport"
                        value={activeDoc.content || ''}
                        onChange={(e) => handleContentEdit(e.target.value)}
                        placeholder="Select a dossier from the left shelf to inspect..."
                    />

                    <div className="desk-footer">
                        <span>Base 1 agents pull live context directly from these physical markdown files</span>
                        <button 
                            className="btn-desk-save"
                            onClick={handleSaveToObsidian}
                            disabled={isSaving || !activeDoc.title}
                        >
                            {isSaving ? 'COMMITTING TO DISK...' : 'SAVE CHANGES TO DISK'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
