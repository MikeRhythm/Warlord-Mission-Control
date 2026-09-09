import React, { useEffect, useRef, useState } from 'react';
import './Tab11Galaxy.css';

export default function Tab11Galaxy() {
    const canvasRef = useRef(null);
    const containerRef = useRef(null);
    const [telemetry] = useState({
        activeSynapses: '48 PACKETS/SEC',
        quantumEntropy: '0.0124',
        bridgeState: 'EARTH-HARMONIC // ACTIVE'
    });

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

        const resizeObserver = new ResizeObserver(() => {
            updateDimensions();
        });
        resizeObserver.observe(container);

        // Minimalist Major Project Hubs (Earthy Tones, High Finance)
        const projectHubs = [
            { id: 0, name: 'WARLORD INC CORE',     x: -140, y: -90,  z: 70,  color: '#C88A35', size: 7, halo: 'rgba(200, 138, 53, 0.18)', pulseSpeed: 0.008 },
            { id: 1, name: 'RHYTHM ALGO ENGINE',   x: 150,  y: -70,  z: -50, color: '#2D5A3F', size: 6, halo: 'rgba(45, 90, 63, 0.22)',   pulseSpeed: 0.010 },
            { id: 2, name: 'WASP SWARM ORCHESTRA', x: -160, y: 100,  z: -30, color: '#A05832', size: 6.5, halo: 'rgba(160, 88, 50, 0.18)', pulseSpeed: 0.007 },
            { id: 3, name: 'BASE 1 TELEMETRY',     x: 120,  y: 90,   z: 80,  color: '#70543E', size: 6, halo: 'rgba(112, 84, 62, 0.20)',  pulseSpeed: 0.009 },
            { id: 4, name: 'QUANT VOLATILITY SCAN',x: 0,    y: -150, z: 20,  color: '#436B4F', size: 5.5, halo: 'rgba(67, 107, 79, 0.18)',pulseSpeed: 0.011 },
            { id: 5, name: 'OBSIDIAN VAULT NEXUS', x: -20,  y: 160,  z: -60, color: '#B3733B', size: 6, halo: 'rgba(179, 115, 59, 0.18)', pulseSpeed: 0.008 }
        ];

        // Background Sub-nodes
        const subNodes = Array.from({ length: 55 }, (_, i) => {
            const r = Math.random() * 320 + 50;
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

        const connections = [
            { from: 0, to: 1 },
            { from: 0, to: 2 },
            { from: 0, to: 3 },
            { from: 1, to: 4 },
            { from: 2, to: 3 },
            { from: 2, to: 5 },
            { from: 3, to: 5 }
        ];

        const packets = Array.from({ length: 14 }, () => ({
            conn: connections[Math.floor(Math.random() * connections.length)],
            progress: Math.random(),
            speed: Math.random() * 0.0025 + 0.0015,
            size: 1.8
        }));

        let rotY = 0;
        let rotX = 0.2;
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

            const fov = 550;
            const scale = fov / (fov + z2 + 200);

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
                rotY += 0.0008;
            }

            // Central Warm Singularity Glow
            const corePulse = Math.sin(Date.now() * 0.0008) * 8;
            const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 120 + corePulse);
            coreGrad.addColorStop(0, 'rgba(160, 88, 50, 0.25)');
            coreGrad.addColorStop(0.4, 'rgba(200, 138, 53, 0.10)');
            coreGrad.addColorStop(0.8, 'rgba(45, 90, 63, 0.05)');
            coreGrad.addColorStop(1, 'rgba(8, 7, 6, 0)');

            ctx.fillStyle = coreGrad;
            ctx.beginPath();
            ctx.arc(cx, cy, 130 + corePulse, 0, Math.PI * 2);
            ctx.fill();

            // Background Sub-nodes
            subNodes.forEach(node => {
                const proj = project3D(node.x, node.y, node.z, cx, cy);
                ctx.fillStyle = `${node.color}66`;
                ctx.beginPath();
                ctx.arc(proj.px, proj.py, node.size * proj.scale, 0, Math.PI * 2);
                ctx.fill();
            });

            // Synapse Lines
            connections.forEach(conn => {
                const h1 = project3D(projectHubs[conn.from].x, projectHubs[conn.from].y, projectHubs[conn.from].z, cx, cy);
                const h2 = project3D(projectHubs[conn.to].x, projectHubs[conn.to].y, projectHubs[conn.to].z, cx, cy);

                ctx.strokeStyle = 'rgba(140, 98, 57, 0.28)';
                ctx.lineWidth = 0.8;
                ctx.beginPath();
                ctx.moveTo(h1.px, h1.py);
                ctx.lineTo(h2.px, h2.py);
                ctx.stroke();
            });

            // Synapse Packets
            packets.forEach(p => {
                p.progress += p.speed;
                if (p.progress >= 1) p.progress = 0;

                const h1 = projectHubs[p.conn.from];
                const h2 = projectHubs[p.conn.to];

                const curX = h1.x + (h2.x - h1.x) * p.progress;
                const curY = h1.y + (h2.y - h1.y) * p.progress;
                const curZ = h1.z + (h2.z - h1.z) * p.progress;

                const proj = project3D(curX, curY, curZ, cx, cy);

                ctx.fillStyle = '#E8D5B5';
                ctx.beginPath();
                ctx.arc(proj.px, proj.py, p.size * proj.scale, 0, Math.PI * 2);
                ctx.fill();
            });

            // Project Hubs
            projectHubs.forEach(hub => {
                const proj = project3D(hub.x, hub.y, hub.z, cx, cy);
                const pulse = Math.sin(Date.now() * hub.pulseSpeed) * 2;

                ctx.fillStyle = hub.halo;
                ctx.beginPath();
                ctx.arc(proj.px, proj.py, (hub.size + 8 + pulse) * proj.scale, 0, Math.PI * 2);
                ctx.fill();

                ctx.fillStyle = hub.color;
                ctx.beginPath();
                ctx.arc(proj.px, proj.py, hub.size * proj.scale, 0, Math.PI * 2);
                ctx.fill();

                ctx.fillStyle = '#C5B59E';
                ctx.font = '10px monospace';
                ctx.fillText(hub.name, proj.px + 12 * proj.scale, proj.py + 4 * proj.scale);
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
    }, []);

    return (
        <div ref={containerRef} className="view-section tab-11-container" style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
            <canvas ref={canvasRef} className="galaxy-canvas-layer" style={{ width: '100%', height: '100%' }} />

            <div className="galaxy-hud-overlay">
                <div className="hud-top">
                    <div className="hud-title">
                        <h2>11 GALAXY // TOPOLOGICAL CLUSTER FIELD</h2>
                        <span>AUTONOMOUS DIRECTIVE COUPLING &bull; BASE 1 MESH</span>
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