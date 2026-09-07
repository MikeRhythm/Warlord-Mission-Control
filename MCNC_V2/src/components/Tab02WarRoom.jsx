import React, { useState, useEffect } from 'react';
import './Tab02WarRoom.css';

const TOP_TIER_LLMS = ['GPT-4O FRONTIER', 'CLAUDE 3.5 SONNET', 'GEMINI 1.5 PRO', 'GROK 2'];
const DIRECTOR_BOARD = [
    'TESS // QUANT', 'SILAS // DATABASE', 'AMBER // COPYWRITER', 'ARES // EXECUTION',
    'ATLAS // INFRASTRUCTURE', 'VALERIE // RELATIONS', 'JACK // MARKETING', 'MAVERICK // SEO',
    'SKYLA // FRONTEND WEB', 'JAX // ARTWORK OMEGA', 'ROXY // ARTWORK ALPHA', 'CHARLIE // CODE',
    'THE ASKARI // SECURITY', 'VANCE // FINANCE', 'JUSTIN // RISK LEGAL', 'ORION // STRATEGIC INTEL'
];

export default function Tab02WarRoom({ ws }) {
    const [selectedLLM, setSelectedLLM] = useState(TOP_TIER_LLMS[0]);
    const [selectedAgent, setSelectedAgent] = useState('');
    const [inputBuffer, setInputBuffer] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [streamLog, setStreamLog] = useState([
        { id: 1, sender: 'SYSTEM // GATE KEEPER', text: 'War Room initialized. Secure WebSockets connected. Awaiting Warlord directives.', type: 'SYSTEM' }
    ]);

    // WebSocket Listener Logic (Future Expansion)
    useEffect(() => {
        if (!ws) return;
        const handleMessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                // Pipeline visualization hooks will process Base 1 responses here
                if (data.type === 'WAR_ROOM_RESPONSE') {
                    setIsProcessing(false);
                    setStreamLog(prev => [...prev, { id: Date.now(), sender: data.sender || 'AGENT', text: data.payload, type: data.msgType || 'CROSSTALK' }]);
                }
            } catch (err) {
                console.error("Failed to parse WS payload:", err);
            }
        };
        ws.addEventListener('message', handleMessage);
        return () => ws.removeEventListener('message', handleMessage);
    }, [ws]);

    const handleAction = (actionType) => {
        if (!inputBuffer.trim()) return;

        // Local state update for UI feedback
        setStreamLog(prev => [...prev, { 
            id: Date.now(), 
            sender: 'MONTY // COMMAND', 
            text: `[${actionType}] ${inputBuffer}`, 
            type: 'DELEGATION' 
        }]);

        if (actionType === 'INITIATE LLM ANALYSIS') setIsProcessing(true);

        // Dispatch to Base 1
        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({
                type: 'WAR_ROOM_ACTION',
                action: actionType,
                targetLLM: selectedLLM,
                targetAgent: selectedAgent || 'GLOBAL',
                payload: inputBuffer
            }));
        }
        setInputBuffer('');
    };

    return (
        <div className="warroom-grid">
            {/* LEFT NAVIGATION: DUAL PANEL */}
            <div className="left-panels">
                {/* PANEL A: TOP-TIER BOARDROOM */}
                <div className="glass-panel panel-a">
                    <h3 className="panel-header">TOP-TIER BOARDROOM // LLM</h3>
                    <hr className="dim-divider" />
                    <select 
                        className="mcnc-dropdown llm-select" 
                        value={selectedLLM} 
                        onChange={(e) => setSelectedLLM(e.target.value)}
                    >
                        {TOP_TIER_LLMS.map(llm => (
                            <option key={llm} value={llm}>{llm}</option>
                        ))}
                    </select>
                </div>

                {/* PANEL B: DIRECTOR BOARD */}
                <div className="glass-panel panel-b">
                    <h3 className="panel-header">DIRECTOR BOARD // ONLINE</h3>
                    <hr className="dim-divider" />
                    <div className="agent-list">
                        {DIRECTOR_BOARD.map(agent => (
                            <div 
                                key={agent} 
                                className={`agent-status ${selectedAgent === agent ? 'selected-agent' : ''}`}
                                onClick={() => setSelectedAgent(agent)}
                            >
                                <span className="agent-name">{agent}</span>
                                <span className="status-indicator">STANDBY</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* RIGHT PANEL: COMMS & INPUT */}
            <div className="main-panel">
                <div className="pipeline-header">THE WAR ROOM // LIVE COMMS & PIPELINE</div>
                
                <div className="stream-container glass-panel">
                    {streamLog.map(log => (
                        <div key={log.id} className={`log-entry ${log.type.toLowerCase()}`}>
                            <span className="log-speaker">{log.sender}</span>
                            <div className="log-text">{log.text}</div>
                        </div>
                    ))}
                    {isProcessing && (
                        <div className="log-entry processing-indicator">
                            <span className="log-speaker" style={{ color: 'var(--dodger-blue, #1E90FF)' }}>{selectedLLM} // PROCESSING</span>
                            <div className="pulsing-text">Analyzing Warlord PRD...</div>
                        </div>
                    )}
                </div>

                <div className="input-console glass-panel">
                    <textarea 
                        id="warroom-input" 
                        placeholder="Paste Product Requirements Document (PRD) or broadcast command..."
                        value={inputBuffer}
                        onChange={(e) => setInputBuffer(e.target.value)}
                    ></textarea>
                    
                    <div className="button-row">
                        <button className="btn-llm" onClick={() => handleAction('INITIATE LLM ANALYSIS')}>INITIATE LLM ANALYSIS</button>
                        <button className="btn-dispatch" onClick={() => handleAction('MONTY DISPATCH')}>MONTY DISPATCH</button>
                        <button className="btn-authorize" onClick={() => handleAction('AUTHORIZE ACTION')}>AUTHORIZE ACTION</button>
                    </div>
                </div>
            </div>
        </div>
    );
}