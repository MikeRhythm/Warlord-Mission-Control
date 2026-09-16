import React, { useEffect, useRef, useState } from 'react';
import './Tab11Galaxy.css';

export default function Tab11Galaxy({ ws }) {
    const canvasRef = useRef(null);
    const containerRef = useRef(null);
    const [memoryNodes, setMemoryNodes] = useState([]);
    const [telemetry, setTelemetry] = useState({
        activeSynapses: '48 PACKETS/SEC',
        quantumEntropy: '0.0124',
        bridgeState: 'EARTH-HARMONIC // ACTIVE'
    });

    useEffect(() => {
        const fetchGalaxyData = async () => {
            try {
                const res = await fetch('http://localhost:8081/api/memory');
                if (res.ok) {
                    const data = await res.json();
                    if (data.nodes && data.nodes.length > 0) {
                        setMemoryNodes(data.nodes);
                        setTelemetry(prev => ({
                            ...prev,
                            activeSynapses: `${data.nodes.length * 3} PACKETS/SEC`
                        }));
                    }
                }
            } catch (err) {
                console.error('[TAB 11 GALAXY FETCH ERROR]:', err);
            }
        };
        fetchGalaxyData();
    }, []);

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

        const cleanHubName = (rawTitle) => {
            if (!rawTitle) return 'NODE';
            let cleaned = rawTitle
                .replace(/^(DIRECTIVE|CORE DOCTRINE|RAG VECTOR|SESSION)\s*\/\/\s*/i, '')
                .replace(/^\d+\s+AGENT\s+PROTOCOL\s+/i, '')
                .replace(/^AGENT\s+PROTOCOL\s+/i, '')
                .replace(/_/g, ' ')
                .trim();
            return cleaned.toUpperCase();
        };

        let hubs = [];
        if (memoryNodes.length > 0) {
            // WIDER RADIUS SPRAWL: Expands across screen real estate
            const totalNodes = Math.min(memoryNodes.length, 24);
            hubs = memoryNodes.slice(0, totalNodes).map((node, i) => {
                const angle = (i / totalNodes) * Math.PI * 2;
                const isCore = node.title.includes('MONTY') || node.title.includes('WARLORD') || i === 0;
                
                // Expand radius based on screen size / index
                const radius = isCore ? 0 : 220 + (i % 4) * 75;
                
                return {
                    id: i,
                    name: cleanHubName(node.title),
                    x: isCore ? 0 : Math.cos(angle) * radius,
                    y: isCore ? 0 : Math.sin(angle) * (radius * 0.65),
                    z: isCore ? 0 : ((i % 5) - 2) * 50,
                    color: isCore ? '#C88A35' : (node.category === 'system' ? '#2D5A3F' : '#A05832'),
                    size: isCore ? 9 : 5,
                    halo: isCore ? 'rgba(200, 138, 53, 0.3)' : 'rgba(45, 90, 63, 0.15)',
                    pulseSpeed: 0.008 + (i * 0.0004)
                };
            });
        } else {
            hubs = [
                { id: 0, name: 'MONTY // CHIEF OF STAFF', x: 0, y: 0, z: 0, color: '#C88A35', size: 9, halo: 'rgba(200, 138, 53, 0.3)', pulseSpeed: 0.008 },
                { id: 1, name: 'TESS // QUANT', x: 220, y: -100, z: -50, color: '#2D5A3F', size: 5, halo: 'rgba(45, 90, 63, 0.18)', pulseSpeed: 0.010 }
            ];
        }

        const subNodes = Array.from({ length: 80 }, (_, i) => {
            const r = Math.random() * 450 + 80;
            const theta = Math.random() * Math.PI * 2;
            const phi = (Math.random() - 0.5) * Math.PI;
            const palette = ['#8C6239', '#C88A35', '#2D5A3F', '#6E523A', '#3C4D3E'];
            return {
                x: r * Math.cos(phi) * Math.cos(theta),
                y: r * Math.sin(phi),
                z: r * Math.cos(phi) * Math.sin(theta),
                size: Math.random() * 1.5 + 0.8,
                color: palette[i % palette.length]
            };
        });

        const connections = [];
        for (let i = 1; i < hubs.length; i++) {
            connections.push({ from: 0, to: i });
            if (i < hubs.length - 2 && i % 2 === 0) {
                connections.push({ from: i, to: i + 2 });
            }
        }

        const packets = Array.from({ length: 18 }, () => ({
            conn: connections[Math.floor(Math.random() * connections.length)],
            progress: Math.random(),
            speed: Math.random() * 0.002 + 0.001,
            size: 1.6
        }));

        let rotY = 0;
        let rotX = 0.15;
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

            const fov = 650;
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

            ctx.fillStyle = 'rgba(8, 7, 6, 0.35)';
            ctx.fillRect(0, 0, width, height);

            const cx = width / 2;
            const cy = height / 2;

            if (!isDragging) {
                rotY += 0.0005;
            }

            const corePulse = Math.sin(Date.now() * 0.0008) * 10;
            const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 180 + corePulse);
            coreGrad.addColorStop(0, 'rgba(200, 138, 53, 0.25)');
            coreGrad.addColorStop(0.4, 'rgba(160, 88, 50, 0.10)');
            coreGrad.addColorStop(0.8, 'rgba(45, 90, 63, 0.04)');
            coreGrad.addColorStop(1, 'rgba(8, 7, 6, 0)');

            ctx.fillStyle = coreGrad;
            ctx.beginPath();
            ctx.arc(cx, cy, 180 + corePulse, 0, Math.PI * 2);
            ctx.fill();

            subNodes.forEach(node => {
                const proj = project3D(node.x, node.y, node.z, cx, cy);
                ctx.fillStyle = `${node.color}55`;
                ctx.beginPath();
                ctx.arc(proj.px, proj.py, node.size * proj.scale, 0, Math.PI * 2);
                ctx.fill();
            });

            connections.forEach(conn => {
                const h1 = hubs[conn.from];
                const h2 = hubs[conn.to];
                if (!h1 || !h2) return;

                const p1 = project3D(h1.x, h1.y, h1.z, cx, cy);
                const p2 = project3D(h2.x, h2.y, h2.z, cx, cy);

                ctx.strokeStyle = 'rgba(140, 98, 57, 0.25)';
                ctx.lineWidth = 0.7;
                ctx.beginPath();
                ctx.moveTo(p1.px, p1.py);
                ctx.lineTo(p2.px, p2.py);
                ctx.stroke();
            });

            packets.forEach(p => {
                p.progress += p.speed;
                if (p.progress >= 1) p.progress = 0;

                const h1 = hubs[p.conn.from];
                const h2 = hubs[p.conn.to];
                if (!h1 || !h2) return;

                const curX = h1.x + (h2.x - h1.x) * p.progress;
                const curY = h1.y + (h2.y - h1.y) * p.progress;
                const curZ = h1.z + (h2.z - h1.z) * p.progress;

                const proj = project3D(curX, curY, curZ, cx, cy);

                ctx.fillStyle = '#E8D5B5';
                ctx.beginPath();
                ctx.arc(proj.px, proj.py, p.size * proj.scale, 0, Math.PI * 2);
                ctx.fill();
            });

            hubs.forEach(hub => {
                const proj = project3D(hub.x, hub.y, hub.z, cx, cy);
                const pulse = Math.sin(Date.now() * hub.pulseSpeed) * 2;

                ctx.fillStyle = hub.halo;
                ctx.beginPath();
                ctx.arc(proj.px, proj.py, (hub.size + 10 + pulse) * proj.scale, 0, Math.PI * 2);
                ctx.fill();

                ctx.fillStyle = hub.color;
                ctx.beginPath();
                ctx.arc(proj.px, proj.py, hub.size * proj.scale, 0, Math.PI * 2);
                ctx.fill();

                ctx.fillStyle = '#C5B59E';
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
        <div ref={containerRef} className="view-section tab-11-container" style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
            <canvas ref={canvasRef} className="galaxy-canvas-layer" style={{ width: '100%', height: '100%' }} />

            <div className="galaxy-hud-overlay">
                <div className="hud-top">
                    <div className="hud-title">
                        <h2>11 GALAXY // TOPOLOGICAL CLUSTER FIELD</h2>
                        <span>AUTONOMOUS DIRECTIVE COUPLING &bull; BASE 1 MESH ({memoryNodes.length} NODES INDEXED)</span>
                    </div>

                    <div className="hud-readouts">
                        <div className="hud-pill">SYNAPSE TRAFFIC: <b>{telemetry.activeSynapses}</b></div>
                        <div className="hud-pill">CLUSTER STATE: <b>{telemetry.bridgeState}</b></div>
                    </div>
                </div>

                <div className="hud-bottom">
                    <div className="hud-reticle-box">
                        <div>// NAVIGATION: DRAG MOUSE TO ROTATE TOPOLOGY</div>
                        <div>// HARMONIC FIELD: STABILIZED</div>
                    </div>

                    <div className="hud-bottom-stats">
                        ENTROPY INDEX: {telemetry.quantumEntropy} // COLD CORE DRIFT: NOMINAL
                    </div>
                </div>
            </div>
        </div>
    );
}