import React, { useState, useEffect } from 'react';
import { RefreshCw, Search, Loader2, Database } from 'lucide-react';
import SpeakerBtn from './SpeakerBtn';
import './Tab06Memory.css';

const CATEGORIES = [
    { id: 'all', label: 'ALL LOGS' },
    { id: 'system', label: 'DIRECTIVES & CORE' },
    { id: 'agents', label: 'AGENT CHECKPOINTS' },
    { id: 'rag', label: 'VECTOR / RAG INDEX' },
    { id: 'ephemeral', label: 'SESSION CACHE' }
];

export default function Tab06Memory({ ws }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [memoryNodes, setMemoryNodes] = useState([]);
    const [selectedNode, setSelectedNode] = useState(null);
    const [loading, setLoading] = useState(false);

    const fetchMemory = async () => {
        setLoading(true);
        try {
            const res = await fetch('http://localhost:8081/api/memory');
            if (res.ok) {
                const data = await res.json();
                const nodes = data.nodes || [];
                setMemoryNodes(nodes);
                if (nodes.length > 0) {
                    setSelectedNode(nodes[0]);
                } else {
                    setSelectedNode(null);
                }
            }
        } catch (err) {
            console.error('[TAB 06 FETCH ERROR]:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMemory();
    }, []);

    // Filter across category and search term
    const filteredNodes = memoryNodes.filter(node => {
        const matchesCategory = selectedCategory === 'all' || node.category === selectedCategory;
        const query = searchQuery.trim().toLowerCase();
        const matchesSearch = !query || 
            (node.title && node.title.toLowerCase().includes(query)) ||
            (node.content && node.content.toLowerCase().includes(query));
        return matchesCategory && matchesSearch;
    });

    // Auto-sync selectedNode when filter changes
    useEffect(() => {
        if (filteredNodes.length > 0) {
            const currentStillValid = filteredNodes.some(n => selectedNode && n.id === selectedNode.id);
            if (!currentStillValid) {
                setSelectedNode(filteredNodes[0]);
            }
        } else {
            setSelectedNode(null);
        }
    }, [searchQuery, selectedCategory, memoryNodes]);

    const getCategoryCount = (catId) => {
        const query = searchQuery.trim().toLowerCase();
        return memoryNodes.filter(node => {
            const matchesCategory = catId === 'all' || node.category === catId;
            const matchesSearch = !query || 
                (node.title && node.title.toLowerCase().includes(query)) ||
                (node.content && node.content.toLowerCase().includes(query));
            return matchesCategory && matchesSearch;
        }).length;
    };

    return (
        <div className="view-section tab-06-container" style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%', padding: '14px', boxSizing: 'border-box', gap: '12px', backgroundColor: '#090b0e', color: '#e2e8f0', fontFamily: "'JetBrains Mono', monospace" }}>
            
            {/* HEADER */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #1f242d', paddingBottom: '10px' }}>
                <div>
                    <div style={{ color: 'var(--gold-core)', fontSize: '1rem', fontWeight: 'bold', letterSpacing: '1px' }}>
                        06 MEMORY // PERSISTENT CONTEXT
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#5c6b7f', marginTop: '2px' }}>
                        Director long-term recall, vector stores, and session states
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <button 
                        onClick={fetchMemory}
                        style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 10px', backgroundColor: '#14171c', border: '1px solid #232832', color: 'var(--gold-core)', borderRadius: '3px', fontSize: '0.7rem', fontWeight: 'bold', cursor: 'pointer' }}
                    >
                        <RefreshCw className={loading ? 'animate-spin' : ''} style={{ width: '12px', height: '12px' }} />
                        <span>SYNC</span>
                    </button>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 10px', backgroundColor: '#101318', border: '1px solid #1f242d', borderRadius: '3px', fontSize: '0.7rem' }}>
                        <span style={{ color: '#5c6b7f' }}>NODES:</span>
                        <span style={{ color: 'var(--gold-core)', fontWeight: 'bold' }}>{filteredNodes.length} / {memoryNodes.length}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 10px', backgroundColor: '#101318', border: '1px solid #1f242d', borderRadius: '3px', fontSize: '0.7rem' }}>
                        <span style={{ color: '#5c6b7f' }}>STATUS:</span>
                        <span style={{ color: 'var(--emerald-core)', fontWeight: 'bold' }}>SYNCED</span>
                    </div>
                </div>
            </div>

            {/* WORKSPACE */}
            <div style={{ display: 'grid', gridTemplateColumns: '260px 320px 1fr', gap: '12px', flex: 1, minHeight: 0 }}>
                
                {/* COLUMN 1: SIDEBAR FILTER */}
                <aside style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {/* SEARCH INPUT WITH ICON */}
                    <div style={{ position: 'relative', width: '100%' }}>
                        <Search style={{ position: 'absolute', left: '10px', top: '10px', width: '13px', height: '13px', color: '#5c6b7f' }} />
                        <input
                            type="text"
                            placeholder="SEARCH RECALL..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{ width: '100%', padding: '8px 10px 8px 30px', backgroundColor: '#101317', border: '1px solid #1f242d', color: '#e2e8f0', fontSize: '0.75rem', borderRadius: '3px', outline: 'none', boxSizing: 'border-box' }}
                        />
                    </div>

                    {/* CATEGORY BUTTONS */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {CATEGORIES.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => setSelectedCategory(cat.id)}
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '10px 12px',
                                    borderRadius: '3px',
                                    cursor: 'pointer',
                                    border: selectedCategory === cat.id ? '1px solid var(--gold-core)' : '1px solid #1a1e27',
                                    backgroundColor: selectedCategory === cat.id ? 'rgba(255, 184, 0, 0.08)' : '#101319',
                                    color: selectedCategory === cat.id ? 'var(--gold-core)' : '#8fa0b5',
                                    fontSize: '0.72rem',
                                    fontFamily: "'JetBrains Mono', monospace",
                                    fontWeight: selectedCategory === cat.id ? 'bold' : 'normal',
                                    transition: 'all 0.15s ease'
                                }}
                            >
                                <span>{cat.label}</span>
                                <span style={{ padding: '1px 6px', borderRadius: '2px', backgroundColor: '#141820', fontSize: '0.65rem' }}>
                                    {getCategoryCount(cat.id)}
                                </span>
                            </button>
                        ))}
                    </div>
                </aside>

                {/* COLUMN 2: INDEXED NODE LIST */}
                <div style={{ display: 'flex', flexDirection: 'column', backgroundColor: '#0d1015', border: '1px solid #1f242d', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ padding: '10px 12px', backgroundColor: '#11141a', borderBottom: '1px solid #1f242d', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.72rem', color: 'var(--gold-core)', fontWeight: 'bold' }}>
                            INDEXED NODES ({filteredNodes.length})
                        </span>
                        {loading && <Loader2 className="animate-spin" style={{ width: '12px', height: '12px', color: 'var(--gold-core)' }} />}
                    </div>

                    <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }} className="custom-scrollbar">
                        {filteredNodes.length === 0 ? (
                            <div style={{ fontSize: '0.7rem', color: '#5c6b7f', padding: '20px 10px', textAlign: 'center' }}>
                                ZERO-STATE // NO MATCHING NODES FOUND
                            </div>
                        ) : (
                            filteredNodes.map(node => {
                                const isSelected = selectedNode && selectedNode.id === node.id;
                                return (
                                    <div
                                        key={node.id}
                                        onClick={() => setSelectedNode(node)}
                                        style={{
                                            padding: '8px 10px',
                                            marginBottom: '6px',
                                            borderRadius: '3px',
                                            cursor: 'pointer',
                                            border: isSelected ? '1px solid #38bdf8' : '1px solid #161b24',
                                            backgroundColor: isSelected ? 'rgba(56, 189, 248, 0.08)' : '#101318',
                                            transition: 'all 0.15s ease'
                                        }}
                                    >
                                        <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: isSelected ? '#38bdf8' : '#cbd5e1', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {node.title}
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.62rem', color: '#5c6b7f', marginTop: '4px' }}>
                                            <span style={{ textTransform: 'uppercase' }}>{node.category}</span>
                                            <span>{node.updated}</span>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* COLUMN 3: NODE DETAIL RECORD VIEWER */}
                <div style={{ display: 'flex', flexDirection: 'column', backgroundColor: '#0d1015', border: '1px solid #1f242d', borderRadius: '3px', overflow: 'hidden' }}>
                    {selectedNode ? (
                        <>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', backgroundColor: '#11141a', borderBottom: '1px solid #1f242d' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                                    <Database style={{ width: '13px', height: '13px', color: 'var(--gold-core)', flexShrink: 0 }} />
                                    <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {selectedNode.title}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                                    <span style={{ fontSize: '0.65rem', color: '#5c6b7f', textTransform: 'uppercase' }}>
                                        TYPE: <span style={{ color: 'var(--gold-core)' }}>{selectedNode.category}</span>
                                    </span>
                                    <SpeakerBtn text={selectedNode.content} label="READ RECALL" />
                                </div>
                            </div>
                            <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }} className="custom-scrollbar">
                                <pre style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.74rem', color: '#cbd5e1', lineHeight: '1.6', whiteSpace: 'pre-wrap', wordBreak: 'break-word', margin: 0 }}>
                                    {selectedNode.content}
                                </pre>
                            </div>
                        </>
                    ) : (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#5c6b7f', fontSize: '0.75rem' }}>
                            ZERO-STATE // NO RECORD SELECTED
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}