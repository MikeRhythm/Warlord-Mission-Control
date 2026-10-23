import React, { useEffect, useRef, useState, useCallback } from 'react';
import './Tab11Galaxy.css';

const BASE1_PORT = 8081;
const PIPELINE_PORT = 8082;

// Standard Warlord Director Profiles
const DIRECTORS = [
    { name: 'MONTY // CHIEF OF STAFF', category: 'core', color: '#C88A35', size: 10 },
    { name: 'CHARLIE // DEV LEAD', category: 'agent', color: '#38BDF8', size: 7 },
    { name: 'TESS // QUANT', category: 'agent', color: '#2D5A3F', size: 6 },
    { name: 'JACK // BACKEND', category: 'agent', color: '#A855F7', size: 6 },
    { name: 'ROXY // UI ARTWORK', category: 'agent', color: '#F43F5E', size: 6 },
    { name: 'AMBER // COPYWRITER', category: 'agent', color: '#FB923C', size: 6 },
    { name: 'ATLAS // INFRASTRUCTURE', category: 'agent', color: '#10B981', size: 6 }
];

export default function Tab11Galaxy({ ws }) {
    const canvasRef = useRef(null);
    const containerRef = useRef(null);
    const [memoryNodes, setMemoryNodes] = useState([]);
    const [telemetry, setTelemetry] = useState({
        activeSynapses: '72 PACKETS/SEC',
        quantumEntropy: '0.0118',
        bridgeState: 'EARTH-HARMONIC // MESH ACTIVE'
    });

    // Ingest nodes from Base 1, Pipeline 8082, and Hermes Kanban tasks
    const fetchClusterNodes = useCallback(async () => {
        let assembled = [...DIRECTORS];

        // 1. Ingest Port 8082 Projects
        try {
            const pipeRes = await fetch(`http://localhost:${PIPELINE_PORT}/api/projects/disk`);
            if (pipeRes.ok) {
                const pipeData = await pipeRes.json();
                const projects = Array.isArray(pipeData) ? pipeData : (pipeData.projects || pipeData.data || []);
                projects.forEach(p => {
                    const pName = typeof p === 'string' ? p : (p.name || p.id);
                    assembled.push({
                        name: `PROJECT // ${pName.toUpperCase()}`,
                        category: 'project',
                        color: '#EAB308',
                        size: 8
                    });
                });
            }
        } catch (e) {
            // Pipeline offline, check localStorage cache
            try {
                const localProj = localStorage.getItem('MCNC_PROJECT_MANIFESTS');
                if (localProj) {
                    const parsed = JSON.parse(localProj);
                    if (Array.isArray(parsed)) {
                        parsed.forEach(p => {
                            assembled.push({
                                name: `PROJECT // ${(p.name || p).toUpperCase()}`,
                                category: 'project',
                                color: '#EAB308',
                                size: 8
                            });
                        });
                    }
                }
            } catch (err) {}
        }

        // 2. Ingest Active Tasks
        try {
            const localTasks = localStorage.getItem('MCNC_HERMES_KANBAN_TASKS');
            if (localTasks) {
                const tasks = JSON.parse(localTasks);
                if (Array.isArray(tasks)) {
                    tasks.slice(0, 8).forEach(t => {
                        assembled.push({
                            name: `TASK // ${t.id} [${t.stage || 'BUILD'}]`,
                            category: 'task',
                            color: t.stage === 'SHIPPED' ? '#10B981' : (t.stage === 'HUMAN GATE' ? '#FFB800' : '#38BDF8'),
                            size: 4
                        });
                    });
                }
            }
        } catch (err) {}

        // 3. Ingest Base 1 Memory (if available)
        try {
            const baseRes = await fetch(`http://localhost:${BASE1_PORT}/api/memory`);
            if (baseRes.ok) {
                const baseData = await baseRes.json();
                if (baseData.nodes && Array.isArray(baseData.nodes)) {
                    baseData.nodes.slice(0, 6).forEach(n => {
                        assembled.push({
                            name: n.title ? n.title.toUpperCase() : 'MEMORY CELL',
                            category: 'memory',
                            color: '#64748B',
                            size: 4
                        });
                    });
                }
            }
        } catch (err) {}

        setMemoryNodes(assembled);
        setTelemetry(prev => ({
            ...prev,
            activeSynapses: `${assembled.length * 4} PACKETS/SEC`
        }));
    }, []);

    useEffect(() => {
        fetchClusterNodes();
    }, [fetchClusterNodes]);

    useEffect(() => {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container) return;

        const ctx = canvas.getContext('2d');
        let animationFrameId;

        const updateDimensions = () => {
            const rect = container.getBoundingClientRect();
            if (rect.width > 0 && rect.height > 0) {
                canvas.width = rect.width;
                canvas.height = rect.height;
            }
        };

        updateDimensions();
        const resizeObserver = new ResizeObserver(() => updateDimensions());
        resizeObserver.observe(container);

        // Build 3D Orbital Hubs
        const totalNodes = memoryNodes.length > 0 ? memoryNodes.length : DIRECTORS.length;
        const activeNodesList = memoryNodes.length > 0 ? memoryNodes : DIRECTORS;

        const hubs = activeNodesList.map((node, i) => {
            const isCore = i === 0;
            const isProject = node.category === 'project';
            const isTask = node.category === 'task';

            let radius = 0;
            let elevation = 0;

            if (isCore) {
                radius = 0;
                elevation = 0;
            } else if (isProject) {
                radius = 160 + (i % 3) * 40;
                elevation = ((i % 2) === 0 ? 1 : -1) * 35;
            } else if (isTask) {
                radius = 320 + (i % 4) * 35;
                elevation = ((i % 3) - 1) * 60;
            } else {
                // Director nodes ring
                radius = 220 + (i % 3) * 30;
                elevation = ((i % 4) - 2) * 45;
            }

            const angle = (i / totalNodes) * Math.PI * 2;

            return {
                id: i,
                name: node.name,
                x: isCore ? 0 : Math.cos(angle) * radius,
                y: isCore ? 0 : Math.sin(angle) * (radius * 0.65),
                z: elevation,
                color: node.color,
                size: node.size,
                halo: isCore ? 'rgba(200, 138, 53, 0.35)' : `${node.color}25`,
                pulseSpeed: 0.008 + (i * 0.0004)
            };
        });

        // Ambient Background Dust Particles
        const subNodes = Array.from({ length: 90 }, (_, i) => {
            const r = Math.random() * 520 + 80;
            const theta = Math.random() * Math.PI * 2;
            const phi = (Math.random() - 0.5) * Math.PI;
            const palette = ['#8C6239', '#C88A35', '#2D5A3F', '#38BDF8', '#475569'];
            return {
                x: r * Math.cos(phi) * Math.cos(theta),
                y: r * Math.sin(phi),
                z: r * Math.cos(phi) * Math.sin(theta),
                size: Math.random() * 1.5 + 0.6,
                color: palette[i % palette.length]
            };
        });

        // Connect Mesh: Monty connects to all; Directors connect to nearest projects
        const connections = [];
        for (let i = 1; i < hubs.length; i++) {
            connections.push({ from: 0, to: i });
            if (i > 1 && i % 2 === 0) {
                connections.push({ from: i, to: i - 1 });
            }
            if (hubs[i].name.startsWith('TASK') && hubs.length > 7) {
                connections.push({ from: 1, to: i }); // Charlie link
            }
        }

        // Active Synapse Data Packets
        const packets = Array.from({ length: Math.min(connections.length * 2, 28) }, () => ({
            conn: connections[Math.floor(Math.random() * connections.length)],
            progress: Math.random(),
            speed: Math.random() * 0.003 + 0.0015,
            size: 1.8
        }));

        let rotY = 0;
        let rotX = 0.12;
        let isDragging = false;
        let lastX = 0;
        let lastY = 0;

        const onMouseDown = (e) => {
            isDragging = true;
            lastX = e.clientX;
            lastY = e.clientY;
        };

        const onMouseMove = (e) => {
            if (!isDragging) return;
            const dx = e.clientX - lastX;
            const dy = e.clientY - lastY;
            rotY += dx * 0.003;
            rotX += dy * 0.003;
            lastX = e.clientX;
            lastY = e.clientY;
        };

        const onMouseUp = () => { isDragging = false; };

        canvas.addEventListener('mousedown', onMouseDown);
        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);

        const project3D = (x, y, z, cx, cy) => {
            const cosY = Math.cos(rotY);
            const sinY = Math.sin(rotY);
            const x1 = x * cosY - z * sinY;
            const z1 = z * cosY + x * sinY;

            const cosX = Math.cos(rotX);
            const sinX = Math.sin(rotX);
            const y2 = y * cosX - z1 * sinX;
            const z2 = z1 * cosX + y * sinX;

            const fov = 700;
            const scale = fov / (fov + z2 + 250);

            return {
                px: cx + x1 * scale,
                py: cy + y2 * scale,
                scale: Math.max(0.1, scale)
            };
        };

        const render = () => {
            const width = canvas.width || container.clientWidth || 800;
            const height = canvas.height || container.clientHeight || 600;

            ctx.fillStyle = 'rgba(8, 10, 12, 0.4)';
            ctx.fillRect(0, 0, width, height);

            const cx = width / 2;
            const cy = height / 2;

            if (!isDragging) {
                rotY += 0.0006;
            }

            // Core Field Glow
            const corePulse = Math.sin(Date.now() * 0.0008) * 12;
            const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 200 + corePulse);
            coreGrad.addColorStop(0, 'rgba(200, 138, 53, 0.22)');
            coreGrad.addColorStop(0.35, 'rgba(56, 189, 248, 0.08)');
            coreGrad.addColorStop(0.7, 'rgba(45, 90, 63, 0.03)');
            coreGrad.addColorStop(1, 'rgba(8, 10, 12, 0)');

            ctx.fillStyle = coreGrad;
            ctx.beginPath();
            ctx.arc(cx, cy, 200 + corePulse, 0, Math.PI * 2);
            ctx.fill();

            // Render Ambient Dust
            subNodes.forEach(node => {
                const proj = project3D(node.x, node.y, node.z, cx, cy);
                ctx.fillStyle = `${node.color}50`;
                ctx.beginPath();
                ctx.arc(proj.px, proj.py, node.size * proj.scale, 0, Math.PI * 2);
                ctx.fill();
            });

            // Render Synapse Lines
            connections.forEach(conn => {
                const h1 = hubs[conn.from];
                const h2 = hubs[conn.to];
                if (!h1 || !h2) return;

                const p1 = project3D(h1.x, h1.y, h1.z, cx, cy);
                const p2 = project3D(h2.x, h2.y, h2.z, cx, cy);

                ctx.strokeStyle = 'rgba(140, 98, 57, 0.22)';
                ctx.lineWidth = 0.8;
                ctx.beginPath();
                ctx.moveTo(p1.px, p1.py);
                ctx.lineTo(p2.px, p2.py);
                ctx.stroke();
            });

            // Render Synapse Data Packets
            packets.forEach(p => {
                p.progress += p.speed;
                if (p.progress >= 1) p.progress = 0;

                const h1 = hubs[p.conn?.from];
                const h2 = hubs[p.conn?.to];
                if (!h1 || !h2) return;

                const curX = h1.x + (h2.x - h1.x) * p.progress;
                const curY = h1.y + (h2.y - h1.y) * p.progress;
                const curZ = h1.z + (h2.z - h1.z) * p.progress;

                const proj = project3D(curX, curY, curZ, cx, cy);

                ctx.fillStyle = '#F8FAFC';
                ctx.beginPath();
                ctx.arc(proj.px, proj.py, p.size * proj.scale, 0, Math.PI * 2);
                ctx.fill();
            });

            // Render Hub Nodes & Labels
            hubs.forEach(hub => {
                const proj = project3D(hub.x, hub.y, hub.z, cx, cy);
                const pulse = Math.sin(Date.now() * hub.pulseSpeed) * 2.5;

                // Outer Halo
                ctx.fillStyle = hub.halo;
                ctx.beginPath();
                ctx.arc(proj.px, proj.py, (hub.size + 8 + pulse) * proj.scale, 0, Math.PI * 2);
                ctx.fill();

                // Core Node Body
                ctx.fillStyle = hub.color;
                ctx.beginPath();
                ctx.arc(proj.px, proj.py, hub.size * proj.scale, 0, Math.PI * 2);
                ctx.fill();

                // Label
                ctx.fillStyle = '#E2E8F0';
                ctx.font = '9px monospace';
                ctx.fillText(hub.name, proj.px + 10 * proj.scale, proj.py + 3 * proj.scale);
            });

            animationFrameId = requestAnimationFrame(render);
        };

        render();

        return () => {
            cancelAnimationFrame(animationFrameId);
            resizeObserver.disconnect();
            canvas.removeEventListener('mousedown', onMouseDown);
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
        };
    }, [memoryNodes]);

    return (
        <div ref={containerRef} className="view-section tab-11-container" style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden', backgroundColor: '#080a0c' }}>
            <canvas ref={canvasRef} className="galaxy-canvas-layer" style={{ width: '100%', height: '100%' }} />

            <div className="galaxy-hud-overlay">
                <div className="hud-top">
                    <div className="hud-title">
                        <h2>11 GALAXY // TOPOLOGICAL CLUSTER FIELD</h2>
                        <span>AUTONOMOUS DIRECTIVE COUPLING &bull; MCNC MESH ({memoryNodes.length} NODES INDEXED)</span>
                    </div>

                    <div className="hud-readouts">
                        <div className="hud-pill">SYNAPSE TRAFFIC: <b>{telemetry.activeSynapses}</b></div>
                        <div className="hud-pill">CLUSTER STATE: <b>{telemetry.bridgeState}</b></div>
                    </div>
                </div>

                <div className="hud-bottom">
                    <div className="hud-reticle-box">
                        <div>// NAVIGATION: DRAG MOUSE TO ROTATE TOPOLOGY</div>
                        <div>// HARMONIC FIELD: STABILIZED (PORT 8081 &amp; 8082 SYNCHRONIZED)</div>
                    </div>

                    <div className="hud-bottom-stats">
                        ENTROPY INDEX: {telemetry.quantumEntropy} // MULTI-AGENT ORBITAL: ACTIVE
                    </div>
                </div>
            </div>
        </div>
    );
}