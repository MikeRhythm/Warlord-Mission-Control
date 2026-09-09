import React, { useState } from 'react';
import './Tab06Memory.css';

const CATEGORIES = [
    { id: 'all', label: 'ALL LOGS' },
    { id: 'system', label: 'DIRECTIVES & CORE' },
    { id: 'agents', label: 'AGENT CHECKPOINTS' },
    { id: 'rag', label: 'VECTOR / RAG INDEX' },
    { id: 'ephemeral', label: 'SESSION CACHE' }
];

export default function Tab06Memory({ ws }) {
    // ZERO-STATE INIT
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [memoryNodes, setMemoryNodes] = useState([]);

    const filteredNodes = memoryNodes.filter(node => {
        const matchesCategory = selectedCategory === 'all' || node.category === selectedCategory;
        const matchesSearch = node.content?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    return (
        <div className="view-section tab-06-container">
            {/* HEADER */}
            <div className="memory-header">
                <div className="memory-title-group">
                    <h2>06 MEMORY // PERSISTENT CONTEXT</h2>
                    <p>Director long-term recall, vector stores, and session states</p>
                </div>

                <div className="memory-stats-strip">
                    <div className="memory-stat-pill">
                        <span className="stat-label">NODES:</span>
                        <span className="stat-value">{memoryNodes.length}</span>
                    </div>
                    <div className="memory-stat-pill">
                        <span className="stat-label">STATUS:</span>
                        <span className="stat-value" style={{ color: '#00FF66' }}>SYNCED</span>
                    </div>
                </div>
            </div>

            {/* WORKSPACE */}
            <div className="memory-workspace-grid">
                {/* SIDEBAR FILTER */}
                <aside className="memory-sidebar">
                    <div className="memory-search-box">
                        <input
                            type="text"
                            placeholder="SEARCH RECALL..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="memory-categories">
                        {CATEGORIES.map(cat => (
                            <button
                                key={cat.id}
                                className={`memory-cat-btn ${selectedCategory === cat.id ? 'active' : ''}`}
                                onClick={() => setSelectedCategory(cat.id)}
                            >
                                <span>{cat.label}</span>
                                <span>0</span>
                            </button>
                        ))}
                    </div>
                </aside>

                {/* MAIN RECORD VIEW */}
                <main className="memory-main-pane">
                    <h3 className="memory-subhead">INDEXED NODES</h3>

                    {filteredNodes.length === 0 ? (
                        <div className="memory-empty-state">
                            ZERO-STATE // RECALL VECTOR STORE EMPTY (AWAITING DISPATCH)
                        </div>
                    ) : (
                        filteredNodes.map(node => (
                            <div key={node.id} className="memory-node-item">
                                <span>{node.title}</span>
                                <p>{node.content}</p>
                            </div>
                        ))
                    )}
                </main>
            </div>
        </div>
    );
}