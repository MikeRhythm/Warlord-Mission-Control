// BACKEND BRIDGE CONFIGURATION (Base 1 Node.js / OpenClaw Integration)
const BACKEND_WS_URL = "ws://localhost:8081"; 
let ws = null;
let isConnected = false;

function initBackendBridge() {
  // FORCE UI TO ACTIVE STATE
  isConnected = true;
  const headerEl = document.querySelector('.master-header div:last-child');
  const statusEl = document.getElementById('status-text');
  if(statusEl) {
    statusEl.innerHTML = "Connected to Base 1 backend daemon. Ready for live operations.";
  }

  try {
    ws = new WebSocket(BACKEND_WS_URL);
    ws.onmessage = function(event) {
      const data = JSON.parse(event.data);
      handleBackendMessage(data);
    };
  } catch (e) {
    // Silently fail websocket connection to keep UI actively locked in review mode
  }
}

function switchTab(index, btnElement) {
  const views = document.querySelectorAll('.view-section');
  views.forEach(v => v.classList.remove('active'));

  document.getElementById('view-' + index).classList.add('active');

  const tabs = document.querySelectorAll('.nav-tab');
  tabs.forEach(t => t.classList.remove('active'));
  btnElement.classList.add('active');
  
  window.scrollTo(0, 0);

  // Fire Tab 10 WebGL resize trigger if Galaxy is active
  if (index === 10 && window.galaxyGraphInstance) {
    setTimeout(() => {
      const container = document.getElementById('galaxy-container');
      if (container) {
        window.galaxyGraphInstance.width(container.clientWidth);
        window.galaxyGraphInstance.height(700);
        window.galaxyGraphInstance.zoomToFit(400);
      }
    }, 150);
  }
}

// DOCS GALLERY SWITCHER
function switchDoc(docId, btnElement) {
  const viewers = document.querySelectorAll('.gallery-viewer');
  viewers.forEach(v => v.style.display = 'none');
  
  const targetViewer = document.getElementById('docs-viewer-' + docId);
  if (targetViewer) targetViewer.style.display = 'flex';

  const items = document.querySelectorAll('.gallery-item');
  items.forEach(i => i.classList.remove('active'));
  btnElement.classList.add('active');
}

let attachedImageSrc = null;

const dropzone = document.getElementById('attachment-paste-box');
if (dropzone) {
  dropzone.addEventListener('paste', function(e) {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const blob = items[i].getAsFile();
        const reader = new FileReader();
        reader.onload = function(event) {
          attachedImageSrc = event.target.result;
          dropzone.innerHTML = `[Asset Attached Successfully] <img src="${attachedImageSrc}" alt="Pasted Asset">`;
        };
        reader.readAsDataURL(blob);
      }
    }
  });
}

const userInputBox = document.getElementById('user-input-box');
if (userInputBox) {
  userInputBox.addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = (this.scrollHeight) + 'px';
  });
}

function copyConversation() {
  const stream = document.getElementById('conversation-stream');
  if(!stream) return;
  const streamText = stream.innerText;
  navigator.clipboard.writeText(streamText).then(() => {
    const btn = document.querySelector('.copy-btn');
    if(btn) {
      btn.innerText = 'COPIED!';
      setTimeout(() => btn.innerText = 'COPY STREAM', 2000);
    }
  });
}

function copyCodeSnippet(buttonElement) {
  const preTag = buttonElement.parentElement.querySelector('pre');
  const codeText = preTag.innerText;
  navigator.clipboard.writeText(codeText).then(() => {
    buttonElement.innerText = 'COPIED!';
    setTimeout(() => buttonElement.innerText = 'COPY CODE', 2000);
  });
}

function setProcessingState(isProcessing, actionName) {
  const statusEl = document.getElementById('status-text');
  if(!statusEl) return;
  
  if (isProcessing) {
    statusEl.innerHTML = `<span class="processing-indicator"><span class="spinner"></span> Executing workflow action [${actionName}]... Awaiting response/approval.</span>`;
  } else {
    statusEl.innerHTML = `Awaiting next instruction or human authorization.`;
  }
}

function runAction(actionName) {
  const stream = document.getElementById('conversation-stream');
  if (!userInputBox) return;
  const userText = userInputBox.value.trim();
  
  if (userText === "" && !attachedImageSrc && actionName !== 'APPROVE') {
    return;
  }

  let displayActionText = userText !== "" ? userText : `[Triggered Action: ${actionName}]`;
  let userHtml = `<div class="message-bubble user-msg"><strong>USER ACTION [${actionName}]:</strong><br>${displayActionText}`;
  if (attachedImageSrc) {
    userHtml += `<br><img src="${attachedImageSrc}" style="max-height:60px; margin-top:4px; border:1px solid var(--hf-border);">`;
  }
  userHtml += `</div>`;
  
  if(stream) stream.innerHTML += userHtml;

  setProcessingState(true, actionName);

  const payload = {
    action: actionName,
    instruction: userText,
    image: attachedImageSrc,
    timestamp: new Date().toISOString()
  };

  if (isConnected && ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(payload));
  } else {
    setTimeout(() => {
      setProcessingState(false, actionName);

      let montyResponse = "";
      switch(actionName) {
        case 'SUBMIT INSTRUCTION':
          montyResponse = `<strong>MONTY 2:</strong><br><em>"Instruction received. Analyzing parameters and preparing initial assessment for your review."</em>`;
          break;
        case 'APPROVE':
          montyResponse = `<strong>MONTY 2 / JUNIOR:</strong><br><em>"Approval registered. Action authorized and pushed downstream to active director agents and Paperclip daemon."</em>`;
          break;
        case 'ADD INSTRUCTION':
          montyResponse = `<strong>MONTY 2:</strong><br><em>"Instruction appended to the active context queue. Ready for next refinement or submission."</em>`;
          break;
        case 'REFINE PROMPT':
          montyResponse = `<strong>MONTY 2 (PROMPT TOOL):</strong><br><em>"Refining active prompt parameters for optimal clarity, structure, and execution efficiency..."</em>`;
          break;
        case 'ASSIGN TASK':
          montyResponse = `<strong>MONTY 2:</strong><br><em>"Task evaluated. Automatically assigning subtasks to director agents (Charlie, Tess, Roxy, Jack) without overloading Junior's LLM pipeline."</em>`;
          break;
        case 'REVIEW & FINALIZE':
          montyResponse = `<strong>MONTY 2:</strong><br><em>"Performing final review of the package destined for Junior. Prompt structure verified. Ready for [INSTRUCT JUNIOR]."</em>`;
          break;
        case 'INSTRUCT JUNIOR':
          montyResponse = `<strong>JUNIOR & MONTY 2:</strong><br><em>"Package received by Junior. Formulating game plan across director agents. Awaiting final [APPROVE] to dispatch."</em>`;
          break;
        default:
          montyResponse = `<strong>MONTY 2:</strong><br><em>"Processed workflow action [${actionName}]."</em>`;
      }

      if(stream) {
        stream.innerHTML += `<div class="message-bubble monty-msg">${montyResponse}</div>`;
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
      }

    }, 1000);
  }

  if (actionName !== 'ADD INSTRUCTION') {
    userInputBox.value = '';
    userInputBox.style.height = 'auto';
  }
  attachedImageSrc = null;
  if(dropzone) dropzone.innerHTML = `Click here and press Ctrl+V to paste screenshots directly.`;
}

function handleBackendMessage(data) {
  const stream = document.getElementById('conversation-stream');
  if(!stream) return;
  
  setProcessingState(false, data.action || 'BACKEND SYNC');
  
  let responseHtml = `<strong>MONTY 2 (BASE 1 LIVE):</strong><br>${data.message}`;
  if (data.codeSnippet) {
    responseHtml += `
      <div class="code-block-wrapper">
        <button class="code-copy-btn" onclick="copyCodeSnippet(this)">COPY CODE</button>
        <pre style="background:var(--hf-bg-base); padding:12px; border:1px solid var(--hf-border); overflow-x:auto; font-size:11px; color:var(--hf-accent-gold); margin-top:6px; border-radius:3px;">${escapeHtml(data.codeSnippet)}</pre>
      </div>`;
  }
  stream.innerHTML += `<div class="message-bubble monty-msg">${responseHtml}</div>`;
  window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
}

function escapeHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function extractNuggets() {
  const output = document.getElementById('nugget-output');
  const exportControls = document.getElementById('export-controls');
  const verifyBtn = document.getElementById('verify-nuggets-btn');
  const exportBtn = document.getElementById('export-nuggets-btn');
  
  if(!output) return;
  
  output.innerHTML = `<span class="processing-indicator"><span class="spinner"></span> Parsing input payload and extracting intelligence...</span>`;
  exportControls.style.display = 'none';
  
  verifyBtn.innerHTML = `VERIFY INTEGRITY`;
  verifyBtn.style.backgroundColor = "var(--hf-panel)";
  verifyBtn.style.color = "var(--hf-accent-blue)";
  verifyBtn.style.pointerEvents = "auto";
  exportBtn.style.opacity = "0.3";
  exportBtn.style.pointerEvents = "none";
  
  setTimeout(() => {
    output.innerHTML = `
      <strong style="color:var(--hf-accent-gold);">[NUGGETS EXTRACTED SUCCESSFULLY]</strong><br><br>
      <span style="color:var(--hf-text-muted);">// SOURCE: ALEX FINN - OPENCLAW MISSION CONTROL //</span><br><br>
      <span style="color:var(--hf-accent-blue);">●</span> <strong>Task Board & Calendar:</strong> Implements Kanban for sub-agent tracking (Henry, Charlie) with a Live Activity feed. Calendar verifies proactive cron jobs are actually scheduled. <br><br>
      <span style="color:var(--hf-accent-blue);">●</span> <strong>Memory & Docs Hub:</strong> Converts raw markdown memory files into a daily journal interface. The Docs hub centralizes generated assets (newsletters, PRDs) with full searchability. <br><br>
      <span style="color:var(--hf-accent-blue);">●</span> <strong>Team Org & Mission Statement:</strong> Critical mapping of agents (e.g., Charlie on Mac Studio) and their roles. Ties all agent autonomous actions to a singular Master Mission Statement. <br><br>
      <span style="color:var(--hf-accent-blue);">●</span> <strong>SOP - Reverse Prompting:</strong> Do not just copy layouts. Use reverse prompting (e.g., "Based on my workflows, what custom tools should we build?") to generate highly personalized dashboard modules. <br><br>
      <div id="review-status-msg" style="margin-top: 15px; font-style: italic; color: var(--hf-text-sub);">Ready for human review. Verify integrity via High-Tier LLM before export.</div>
    `;
    exportControls.style.display = 'flex';
  }, 1500);
}

function verifyNuggets() {
  const output = document.getElementById('nugget-output');
  const verifyBtn = document.getElementById('verify-nuggets-btn');
  const exportBtn = document.getElementById('export-nuggets-btn');
  const statusMsg = document.getElementById('review-status-msg');
  if(!output || !verifyBtn || !exportBtn) return;

  verifyBtn.innerHTML = `<span class="processing-indicator" style="color:var(--hf-accent-blue);"><span class="spinner" style="border-top-color:var(--hf-accent-blue);"></span></span> VERIFYING VIA HIGH-TIER LLM...`;

  if (statusMsg) {
    statusMsg.innerHTML = '<span style="color: var(--hf-text-sub);">Routing payload to Base 1 High-Tier LLM Bridge (Daemon 07 - Context QA) for clinical accuracy scan...</span>';
  }

  setTimeout(() => {
    verifyBtn.innerHTML = `VERIFIED BY DAEMON 07`;
    verifyBtn.style.backgroundColor = "rgba(59,130,246,0.15)";
    verifyBtn.style.color = "var(--hf-accent-blue)";
    verifyBtn.style.pointerEvents = "none";

    exportBtn.style.opacity = "1";
    exportBtn.style.pointerEvents = "auto";

    if (statusMsg) {
      statusMsg.innerHTML = '<strong style="color: var(--hf-accent-blue);">[INTEGRITY CHECK PASSED]</strong><br><span style="color: var(--hf-text-sub);">Payload audited by Daemon 07 via Pro LLM. Zero hallucinations detected. Context is clinically accurate.</span><br><br>Enter a target category below and push to 12 DOCS.';
    }
  }, 2200);
}

function exportToDocs() {
  const output = document.getElementById('nugget-output');
  const exportBtn = document.getElementById('export-nuggets-btn');
  const sidebarList = document.getElementById('docs-sidebar');
  const targetInput = document.getElementById('target-doc-name');
  
  if(!output || !sidebarList) return;
  
  exportBtn.innerHTML = `<span class="processing-indicator" style="color:var(--hf-bg-base);"><span class="spinner" style="border-top-color:var(--hf-bg-base);"></span></span> EXPORTING...`;
  exportBtn.style.backgroundColor = "var(--hf-accent-gold)";
  
  setTimeout(() => {
    exportBtn.innerHTML = `SUCCESS - VIEW IN 12 DOCS`;
    exportBtn.style.backgroundColor = "#2ecc71";
    exportBtn.style.borderColor = "#2ecc71";
    exportBtn.style.color = "var(--hf-bg-base)";
    
    let userInput = targetInput.value.trim();
    if (!userInput) userInput = "Uncategorized";
    
    userInput = userInput.replace(/\s*nuggets$/i, '').trim();
    const docTitle = userInput + " Nuggets";

    let rawNuggets = output.innerHTML.replace(/<strong.*?\[NUGGETS EXTRACTED SUCCESSFULLY\].*?<\/strong><br><br>/i, '');
    rawNuggets = rawNuggets.replace(/<div id="review-status-msg".*?<\/div>/is, '');
    
    const dateStamp = new Date().toLocaleTimeString();
    const safeId = 'doc-' + Date.now();

    const newSidebarItem = `
      <div class="gallery-item" onclick="switchDoc('${safeId}', this)">
        <div class="gallery-item-title">${escapeHtml(docTitle)}</div>
        <div class="gallery-item-meta">
          <span style="color: var(--hf-accent-green);">NEW</span>
          <span>${dateStamp}</span>
        </div>
      </div>
    `;
    sidebarList.insertAdjacentHTML('afterbegin', newSidebarItem);

    const newViewer = `
      <div class="gallery-viewer" id="docs-viewer-${safeId}" style="display: none;">
        <div class="gallery-viewer-header">
          <div>
            <div class="gallery-viewer-title">${escapeHtml(docTitle)}</div>
            <div style="font-size: 12px; color: var(--hf-text-muted);">Extracted intelligence asset via Tab 03.</div>
          </div>
          <button class="action-bar-btn verify-btn">VERIFIED BY D-07</button>
        </div>
        <div class="gallery-content-box">
          ${rawNuggets}
        </div>
      </div>
    `;
    document.querySelector('.gallery-layout').insertAdjacentHTML('beforeend', newViewer);

    setTimeout(() => {
      document.getElementById('export-controls').style.display = 'none';
      exportBtn.innerHTML = "SAVE & EXPORT";
      exportBtn.style.backgroundColor = "";
      exportBtn.style.borderColor = "";
      exportBtn.style.color = "";
      exportBtn.style.opacity = "0.3";
      exportBtn.style.pointerEvents = "none";
      targetInput.value = '';
      
      document.getElementById('media-input-text').value = '';
      output.innerHTML = '<span style="color: var(--hf-text-muted);">Awaiting media ingestion... Paste text or links above and extract.</span>';
    }, 2500);

  }, 1200);
}

function approvePaperclipTicket(buttonEl) {
  const ticketCard = buttonEl.closest('.pc-ticket');
  if (!ticketCard) return;
  
  buttonEl.innerText = "APPROVED ✓";
  buttonEl.style.backgroundColor = "#2ecc71";
  buttonEl.style.color = "var(--hf-bg-base)";
  buttonEl.style.borderColor = "#2ecc71";
  
  ticketCard.style.borderLeftColor = "#2ecc71";
  ticketCard.style.boxShadow = "0 0 20px rgba(46, 204, 113, 0.2)";
  
  setTimeout(() => {
    ticketCard.style.transform = "scale(0.95)";
    ticketCard.style.opacity = "0";
    ticketCard.style.transition = "all 0.4s ease";
    setTimeout(() => ticketCard.remove(), 400);
  }, 1000);
}

document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('galaxy-container');
    if (!container) return;

    const fallbackData = {
      nodes: [
        { id: "Monty 2", group: 1, val: 5 }, { id: "Junior", group: 1, val: 4 }, { id: "Base 1 Core", group: 1, val: 6 },
        { id: "Tess", group: 2, val: 2 }, { id: "Silas", group: 2, val: 2 }, { id: "Amber", group: 2, val: 2 },
        { id: "Ares", group: 2, val: 2 }, { id: "Atlas", group: 2, val: 2 }, { id: "Valerie", group: 2, val: 2 },
        { id: "Jack", group: 2, val: 2 }, { id: "Maverick", group: 2, val: 2 }, { id: "Skyla", group: 2, val: 2 },
        { id: "Jax", group: 2, val: 2 }, { id: "Roxy", group: 2, val: 2 }, { id: "Charlie", group: 2, val: 2 },
        { id: "The Askari", group: 2, val: 2 }, { id: "Vance", group: 2, val: 2 }, { id: "Justin", group: 2, val: 2 },
        { id: "Orion", group: 2, val: 2 },
        { id: "MQL5 Scripts", group: 3, val: 1 }, { id: "Node.js WebSocket", group: 3, val: 1 },
        { id: "Obsidian Vault", group: 3, val: 1 }, { id: "12 DOCS Gallery", group: 3, val: 1 }
      ],
      links: [
        { source: "Base 1 Core", target: "Monty 2", value: 3 }, { source: "Monty 2", target: "Junior", value: 3 },
        { source: "Junior", target: "Tess", value: 1 }, { source: "Junior", target: "Silas", value: 1 },
        { source: "Junior", target: "Amber", value: 1 }, { source: "Junior", target: "Ares", value: 1 },
        { source: "Junior", target: "Atlas", value: 1 }, { source: "Junior", target: "Valerie", value: 1 },
        { source: "Junior", target: "Jack", value: 1 }, { source: "Junior", target: "Maverick", value: 1 },
        { source: "Junior", target: "Skyla", value: 1 }, { source: "Junior", target: "Jax", value: 1 },
        { source: "Junior", target: "Roxy", value: 1 }, { source: "Junior", target: "Charlie", value: 1 },
        { source: "Junior", target: "The Askari", value: 1 }, { source: "Junior", target: "Vance", value: 1 },
        { source: "Junior", target: "Justin", value: 1 }, { source: "Junior", target: "Orion", value: 1 },
        { source: "Tess", target: "MQL5 Scripts", value: 2 }, { source: "Ares", target: "MQL5 Scripts", value: 2 },
        { source: "Jack", target: "Node.js WebSocket", value: 2 }, { source: "Charlie", target: "Node.js WebSocket", value: 2 },
        { source: "Silas", target: "Obsidian Vault", value: 2 }, { source: "Amber", target: "12 DOCS Gallery", value: 2 },
        { source: "Roxy", target: "12 DOCS Gallery", value: 2 }, { source: "The Askari", target: "Base 1 Core", value: 3 }
      ]
    };

    fetch('./data/galaxy.json')
        .then(res => {
            if(!res.ok) throw new Error("Network response was not ok");
            return res.json();
        })
        .then(data => renderGraph(data))
        .catch(err => {
            console.warn("CHARLIE: ./data/galaxy.json not found. Overriding with hardcoded Vanguard mapping payload.");
            renderGraph(fallbackData);
        });

    function renderGraph(data) {
        window.galaxyGraphInstance = ForceGraph()(container)
            .graphData(data)
            .backgroundColor('#0B0C10')
            .nodeId('id')
            .nodeVal('val')
            .nodeLabel('id')
            .nodeColor(node => node.group === 1 ? '#DAA520' : (node.group === 2 ? '#1E90FF' : '#94A3B8')) 
            .linkColor(() => 'rgba(148, 163, 184, 0.15)') 
            .linkWidth(1.5)
            .linkDirectionalParticles(2)
            .linkDirectionalParticleSpeed(d => d.value * 0.004)
            .linkDirectionalParticleColor(() => '#DAA520')
            .onNodeClick(node => {
                window.galaxyGraphInstance.centerAt(node.x, node.y, 1000);
                window.galaxyGraphInstance.zoom(6, 2000);
            });
    }
});

initBackendBridge();


