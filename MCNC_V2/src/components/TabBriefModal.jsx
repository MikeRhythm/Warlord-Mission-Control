import React, { useEffect } from 'react';

const TAB_BRIEFINGS = {
  '01 EXEC': {
    code: 'TAB 01 // EXEC COMMAND',
    title: 'Multi-LLM Chat Workspace & Strategic Brainstorming',
    directors: 'MONTY (Chief of Staff) • ORION (Strategic Intel)',
    tagline: 'Chat naturally with Monty across your connected LLMs—brainstorm freely, or optionally push builds to the War Room.',
    overview:
      'Your personal, multi-model AI chat studio—just like ChatGPT or Claude, except you control the brain. Open dedicated project threads and chat naturally with Monty using Auto Router or any of the 15+ LLMs you connect across Kaggle, NVIDIA NIM, and OpenRouter (and we will guide you step-by-step on how to set up a strong, low-cost LLM team). Brainstorm a landing page, debate a trading strategy, or refine ideas freely with zero obligation to execute—and only push to the War Room when you are ready to build.',
    workflow: [
      'Open a new or existing project chat thread and pick Auto Router LLM or any model you have configured across Kaggle, NVIDIA NIM, or OpenRouter.',
      'Converse naturally with Monty—brainstorm trading strategies, draft copy, or explore ideas with zero pressure to trigger code.',
      'Optionally click CREATE PROMPT and PUSH TO WAR ROOM whenever you decide to turn a discussion into a live build.'
    ],
    flow: {
      input: 'Your Connected LLMs & Auto Router',
      tab: '01 EXEC // Monty Chat Studio',
      output: 'Ideas & Optional War Room Push'
    }
  },
  '02 WAR ROOM': {
    code: 'TAB 02 // WAR ROOM',
    title: '3-Tier LLM Exploratory Scoping & Project Initiation',
    directors: 'CHARLIE (Coding Lead) • TESS (Quant) • JUSTIN (Compliance)',
    tagline: 'Explore scope across three LLM analysis depths, then push to create your project with an auto-populated AI CEO.',
    overview:
      'The War Room puts your project scope under a microscope before production execution begins. Using the left menu, select from three distinct LLM analysis levels—each assigning different LLMs to evaluate complexity, dependencies, and risks. The first run is purely exploratory to uncover everything the project entails; once validated, click Push to Create Project to initiate the workspace with its AI CEO already populated and ready to cascade the PRD down to specialist agents.',
    workflow: [
      'Select one of the three LLM analysis tiers on the left menu—each routing through different LLMs tailored to that depth of scope analysis.',
      'Run the initial exploratory pass to map out full project requirements, edge cases, and architecture before committing.',
      'Click PUSH TO CREATE PROJECT to provision the isolated workspace—automatically populating your project AI CEO to cascade the PRD to executing agents.'
    ],
    flow: {
      input: '01 EXEC // Prompt + 3 LLM Tiers',
      tab: '02 WAR ROOM // Exploratory PRD',
      output: 'CREATE PROJECT // Auto-Populated AI CEO'
    }
  },
  '03 PROJECTS': {
    code: 'TAB 03 // PROJECTS',
    title: 'Sovereign Project Registry & Workspace Scaffolder',
    directors: 'SILAS (Database) • ATLAS (Infrastructure)',
    tagline: 'Isolated, auto-scaffolded project environments with zero cross-contamination.',
    overview:
      'Every venture, trading model, or client campaign lives inside its own strictly isolated project directory. Tab 03 provisions standardized folder trees, manifest ledgers, and deliverable vaults automatically so assets never collide.',
    workflow: [
      'Initialize a new project workspace or select an active venture from the registry.',
      'Inspect auto-scaffolded directories (PRDs, Finance, Brand Assets, Web & Social).',
      'Switch active project context across the entire MCNC dashboard with one click.'
    ],
    flow: {
      input: '02 WAR ROOM // Push to Create Project',
      tab: '03 PROJECTS // Isolated Vaults',
      output: '11 CAMPAIGNS & 13 DOCS'
    }
  },
  '04 TASK BOARD': {
    code: 'TAB 04 // TASK BOARD',
    title: 'Autonomous Super Kanban & Agent Dispatch',
    directors: 'MONTY (Orchestration) • JACK (Data Bridges)',
    tagline: 'Asynchronous multi-agent task queues with verified state handoffs.',
    overview:
      'Track every active build, audit, and pipeline job in real time. Tasks move asynchronously between Builder and Judge Directors with structured state snapshots—eliminating bottlenecks and preventing repeated errors.',
    workflow: [
      'Monitor queued, active, and verified tasks across your 16-Director matrix.',
      'Inspect structured handoff briefs and failure diagnostics on any ticket.',
      'Re-prioritize or dispatch queued jobs directly to local or cloud execution runners.'
    ],
    flow: {
      input: '02 WAR ROOM // Cascaded Tickets',
      tab: '04 TASK BOARD // Super Kanban',
      output: '07 CEO ENGINE & 14 PIPE-LINE'
    }
  },
  '05 CALENDAR': {
    code: 'TAB 05 // CALENDAR',
    title: '24/7 Cron Daemons & Autonomous Schedule',
    directors: 'ATLAS (Infrastructure) • TESS (Quant & Market Scans)',
    tagline: 'Set-and-forget automation running on deterministic schedules.',
    overview:
      'Your command center works while you sleep. Tab 05 governs continuous background cron jobs—from daily marketplace scans and pool audits to scheduled content dispatches and model registry syncs.',
    workflow: [
      'View always-running background daemons and their exact execution intervals.',
      'Inspect daily and weekly scheduled automation blocks across your timezone.',
      'Monitor live slot availability and automated governor triggers in real time.'
    ],
    flow: {
      input: 'Automated Cron Triggers',
      tab: '05 CALENDAR // Time Governor',
      output: '11 CAMPAIGNS // Auto-Execution'
    }
  },
  '06 LAUNCH-PAD': {
    code: 'TAB 06 // LAUNCH-PAD',
    title: 'Commercial Go-Live, Payment Rails & Unit Economics Cockpit',
    directors: 'VANCE (Finance & Treasury) • ATLAS (Infrastructure) • VALERIE (Member Gate)',
    tagline: 'Deploy external client access, configure PayPal/Stripe/PayFast rails, and model live break-even ROI.',
    overview:
      'Tab 06 is your commercial deployment and monetization command station. Across five dedicated modules, it walks you step-by-step through exposing MCNC securely via Cloudflare Tunnel, connecting PayPal, Stripe, and PayFast merchant rails, scaling VPS & Oracle Cloud infrastructure, routing prospects through your rhythmtradingco.com member gate, and calculating exact subscriber break-even and net profit margins.',
    workflow: [
      'Step through Go-Live & Tunnel (01) and Payment Rails (02) with interactive step-by-step setup guides for PayPal, Stripe, and PayFast.',
      'Configure VPS & Oracle Cloud Always-Free/PAYG infrastructure (03) and lock in your rhythmtradingco.com single-tier Member Gate (04).',
      'Model subscriber pricing, server overhead, and net monthly profit in real time inside Unit Economics (05).'
    ],
    flow: {
      input: 'Cloudflare Tunnel • Merchant Rails • VPS',
      tab: '06 LAUNCH-PAD // Commercial Cockpit',
      output: 'rhythmtradingco.com Members & Net ROI'
    }
  },
  '07 CEO ENGINE': {
    code: 'TAB 07 // CEO ENGINE',
    title: 'Project AI CEO Command, Autofire & Human-in-the-Loop Triage',
    directors: 'MONTY (Chief of Staff) • THE ASKARI (Security)',
    tagline: 'Select any project to activate its AI CEO—Autofire clears 90% of deliverables while isolating human decisions.',
    overview:
      'Every project gets its own dedicated AI CEO inside the CEO Engine. Select a project to inspect how your AI CEO breaks the blueprint into actionable deliverables, then engage Autofire to sweep through and execute all routine, deterministic tasks automatically—scaffolding files, staging assets, and locking checkpoints—while intelligently isolating only the few high-stakes items that require human sign-off.',
    workflow: [
      'Select an active project to inspect its assigned AI CEO and the cascaded deliverable queue.',
      'Trigger AUTOFIRE to automatically execute and clear all routine, machine-ready tasks with verified checkpoints.',
      'Step in only for the remaining flagged human-in-the-loop items—approve, supply credentials, or sign off to complete the build.'
    ],
    flow: {
      input: 'Project Selection // Assigned AI CEO',
      tab: '07 CEO ENGINE // Autofire + HITL',
      output: 'Cleared Tasks + Human Sign-Offs'
    }
  },
  '08 PALETTES': {
    code: 'TAB 08 // PALETTES',
    title: 'Signature Design Suites: High Finance, Africa & Custom Builds',
    directors: 'ROXY (Design & Visual Direction) • JAX (Artwork Omega)',
    tagline: 'Pre-loaded with flagship High Finance & Africa palettes—or build and save your own custom design suites.',
    overview:
      'Every workspace comes pre-equipped out of the box with our flagship High Finance and Africa palettes alongside institutional metallic suites—and you are completely free to build, customize, and save your own brand palettes. Tab 08 enforces visual discipline across dashboards, client portals, and trading charts so every project launches with executive polish.',
    workflow: [
      'Select from your pre-installed High Finance and Africa palettes, or build and save your own custom color suite.',
      'Copy verified hex codes and CSS tokens to apply signature branding across web apps and landing pages.',
      'Maintain strict visual separation between client web interfaces and algorithmic chart indicators.'
    ],
    flow: {
      input: 'Defaults + Your Custom Palettes',
      tab: '08 PALETTES // Roxy Studio',
      output: '09 PREVIEWS & Client Portals'
    }
  },
  '09 PREVIEWS': {
    code: 'TAB 09 // PREVIEWS',
    title: 'Live Artifact Sandbox & Visual Inspection',
    directors: 'SKYLA (Frontend / UI) • ROXY (Visual Direction)',
    tagline: 'Test and inspect generated web apps, landing pages, and UI builds live.',
    overview:
      'Before deploying any landing page, member portal, or dashboard update to clients, Tab 09 renders the physical artifact in a live preview viewport so you can verify layout, responsiveness, and polish immediately.',
    workflow: [
      'Select any generated HTML/React web artifact from your project vault.',
      'Inspect live rendering, typography scaling, and interactive elements.',
      'Approve builds for production deployment or send visual refinements back to Roxy.'
    ],
    flow: {
      input: '02 WAR ROOM // Compiled UI',
      tab: '09 PREVIEWS // Live Viewport',
      output: 'Production Client Portals'
    }
  },
  '10 TOKENS': {
    code: 'TAB 10 // TOKENS',
    title: 'Token Telemetry, Quota Meter & Free Compute Guide',
    directors: 'VANCE (Finance & Cost Control) • JACK (Backend Bridges)',
    tagline: 'Real-time credit tracking and zero-cost AI scaling with your own free API keys.',
    overview:
      'Monitor your live token burn, OpenRouter credit balance, and storage quota from a clean-slate telemetry meter. MCNC empowers you to run enterprise AI for free: spin up your own Oracle Cloud VM, harvest free API keys from NVIDIA NIM, Google Gemini, Groq, and Kaggle, and connect them in Tab 14 so you never pay inflated AI markups.',
    workflow: [
      'Track live OpenRouter balances, session token usage, and workspace storage quotas.',
      'Harvest your own free API tokens from NVIDIA NIM, Google AI Studio, Groq, and Kaggle.',
      'Head to Tab 14 (PIPE-LINE) to inject your keys and activate zero-cost multi-provider failover.'
    ],
    flow: {
      input: 'Free NIM / Google / Groq / Kaggle Keys',
      tab: '10 TOKENS // Telemetry & Quota',
      output: '14 PIPE-LINE // Key Injection'
    }
  },
  '11 CAMPAIGNS': {
    code: 'TAB 11 // CAMPAIGNS',
    title: 'Universal Automated Campaigns & Media Engine',
    directors: 'MAVERICK (Traffic) • VALERIE (Relations) • SKYLA (Media)',
    tagline: 'End-to-end automated campaign discovery, video clipping, and distribution.',
    overview:
      'Your automated growth and outreach engine. Tab 11 discovers live opportunities, extracts viral short-form clips with AI hooks, renders vertical media via FFmpeg, and manages multi-channel campaign ledgers—including humanitarian initiatives.',
    workflow: [
      'Scan live marketplaces or select an active automated campaign funnel.',
      'Feed a source URL to auto-extract viral hooks and batch-render vertical Shorts.',
      'Track daily post slots, clicks, and archive completed campaigns cleanly.'
    ],
    flow: {
      input: '05 CALENDAR & Source Media',
      tab: '11 CAMPAIGNS // Action Tab',
      output: 'Rendered Media & Live Funnels'
    }
  },
  '12 REVIEW': {
    code: 'TAB 12 // REVIEW',
    title: 'Intelligence Refinery & Research Harvester',
    directors: 'ORION (Strategic Intel) • MONTY (Triage Gatekeeper)',
    tagline: 'Distill videos, articles, and code dumps into pure engineering gold.',
    overview:
      'Stop wasting hours watching long tutorials or reading bloated docs. Drop a YouTube link or technical dump into Tab 12—the Refinery extracts only verified Core Nuggets, exact Code Implementations, and Superseded patterns straight into your vault.',
    workflow: [
      'Paste a YouTube URL or raw technical research dump and select a domain.',
      'Click Harvest to extract structured SOP-17 engineering nuggets automatically.',
      'Commit approved intelligence directly into your permanent Docs & Memory vaults.'
    ],
    flow: {
      input: 'External Videos & Research',
      tab: '12 REVIEW // AI Refinery',
      output: '13 DOCS // Knowledge Veins'
    }
  },
  '13 DOCS': {
    code: 'TAB 13 // DOCS',
    title: 'Living Governance, SOPs & Director Souls',
    directors: 'AMBER (Documentation) • MONTY (Chief of Staff)',
    tagline: 'Single source of truth that updates agent behavior in real time.',
    overview:
      'Tab 13 houses your Master Rules of Engagement, Standard Operating Procedures, Mission Statement, and Director Soul definitions. Editing a document here immediately re-anchors how your AI team operates on the next run.',
    workflow: [
      'Browse Core Documents, Director Souls, Project PRDs, and Master Chat Ledgers.',
      'Edit and save operational rules directly from the browser editor.',
      'Refresh vault indexes to synchronize updates across all active agents.'
    ],
    flow: {
      input: '12 REVIEW & Executive Rules',
      tab: '13 DOCS // Living Vault',
      output: 'Real-Time Agent Compliance'
    }
  },
  '14 PIPE-LINE': {
    code: 'TAB 14 // PIPE-LINE',
    title: 'API Key Injection Vault, Oracle VM & Kaggle GPU Bridges',
    directors: 'JACK (Backend Bridges) • ATLAS (Infrastructure)',
    tagline: 'Plug in your free NVIDIA NIM, Google, Groq, OpenRouter & Kaggle keys for unlimited power.',
    overview:
      'The sovereign compute engine of MCNC. Tab 14 is where you inject and pool your own API keys (NVIDIA NIM, Google Gemini, Groq, OpenRouter) and link your Oracle Cloud VM or Kaggle T4 GPU tunnel. Once loaded, every Director gains automatic, zero-downtime failover across all providers.',
    workflow: [
      'Paste and save your personal NVIDIA NIM, Google, Groq, and OpenRouter keys into the Cluster Vaults.',
      'Bind your Oracle Cloud VM and Kaggle GPU tunnel URL for free heavy-compute inference.',
      'Verify live WebSocket conduits, disk persistence gates, and multi-provider health.'
    ],
    flow: {
      input: 'NIM • Google • Groq • Kaggle • Oracle VM',
      tab: '14 PIPE-LINE // Sovereign Compute Hub',
      output: 'All 16 Directors (Zero-Downtime AI)'
    }
  }
};

export default function TabBriefModal({ isOpen, onClose, activeTab, onSelectTab, allTabs = [] }) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight' && allTabs.length > 0 && onSelectTab) {
        const idx = allTabs.indexOf(activeTab);
        if (idx !== -1) onSelectTab(allTabs[(idx + 1) % allTabs.length]);
      }
      if (e.key === 'ArrowLeft' && allTabs.length > 0 && onSelectTab) {
        const idx = allTabs.indexOf(activeTab);
        if (idx !== -1) onSelectTab(allTabs[(idx - 1 + allTabs.length) % allTabs.length]);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, activeTab, allTabs, onClose, onSelectTab]);

  if (!isOpen) return null;

  const brief = TAB_BRIEFINGS[activeTab] || {
    code: `TAB // ${activeTab}`,
    title: 'MCNC Operational Tab',
    directors: 'MONTY (Chief of Staff)',
    tagline: 'Deterministic multi-agent command and execution module.',
    overview: 'This module operates as an integrated tab within the Mission Control Nerve Center.',
    workflow: ['Select your active project context.', 'Configure tab parameters.', 'Execute and verify telemetry output.'],
    flow: { input: 'Upstream Directive', tab: activeTab, output: 'Verified Output' }
  };

  const currentIdx = allTabs.indexOf(activeTab);
  const handlePrev = () => {
    if (currentIdx === -1 || !onSelectTab) return;
    onSelectTab(allTabs[(currentIdx - 1 + allTabs.length) % allTabs.length]);
  };
  const handleNext = () => {
    if (currentIdx === -1 || !onSelectTab) return;
    onSelectTab(allTabs[(currentIdx + 1) % allTabs.length]);
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(6, 8, 12, 0.22)',
        backdropFilter: 'none',
        WebkitBackdropFilter: 'none',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        boxSizing: 'border-box',
        fontFamily: "'JetBrains Mono', monospace"
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 'min(92vw, 940px)',
          maxHeight: '88vh',
          background: 'linear-gradient(165deg, rgba(11, 14, 20, 0.96) 0%, rgba(7, 9, 13, 0.98) 100%)',
          border: '1.5px solid #DAA520',
          borderRadius: '10px',
          boxShadow: '0 28px 80px rgba(0, 0, 0, 0.98), 0 0 0 1px rgba(218, 165, 32, 0.35), 0 0 36px rgba(218, 165, 32, 0.28)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* TOP EXECUTIVE BANNER */}
        <div
          style={{
            padding: '16px 26px',
            background: 'linear-gradient(90deg, rgba(218, 165, 32, 0.18) 0%, rgba(13, 16, 22, 0.96) 100%)',
            borderBottom: '1px solid #1f2633',
            display: 'flex',
            flexDirection: 'column',
            gap: '5px',
            flexShrink: 0
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span
                style={{
                  backgroundColor: 'rgba(218, 165, 32, 0.2)',
                  border: '1px solid #DAA520',
                  color: '#ffb800',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  padding: '3px 10px',
                  borderRadius: '4px',
                  letterSpacing: '1.2px'
                }}
              >
                {brief.code}
              </span>
              <span style={{ color: '#94A3B8', fontSize: '11px', letterSpacing: '1px' }}>
                MCNC EXECUTIVE BRIEFING
              </span>
            </div>

            <span
              role="button"
              tabIndex={0}
              onClick={onClose}
              style={{
                background: '#12161f',
                border: '1px solid #2b3545',
                color: '#94A3B8',
                borderRadius: '4px',
                padding: '4px 11px',
                fontSize: '11px',
                fontWeight: 'bold',
                cursor: 'pointer',
                userSelect: 'none'
              }}
            >
              [ ESC ]
            </span>
          </div>

          <h2 style={{ margin: 0, color: '#ffffff', fontSize: '19px', fontWeight: 'bold', letterSpacing: '0.4px' }}>
            {brief.title}
          </h2>
          <div style={{ color: '#C5BD9F', fontSize: '12.5px' }}>
            {brief.tagline}
          </div>
        </div>

        {/* BODY CONTENT */}
        <div style={{ padding: '18px 26px', display: 'flex', flexDirection: 'column', gap: '15px', overflowY: 'auto' }}>
          {/* LEAD DIRECTORS STRIP */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '8px 14px',
              backgroundColor: '#0b0e14',
              border: '1px solid #1b2230',
              borderRadius: '6px',
              fontSize: '11.5px'
            }}
          >
            <span style={{ color: '#64748b', fontWeight: 'bold', letterSpacing: '0.9px' }}>COMMANDING DIRECTORS:</span>
            <span style={{ color: '#ffb800', fontWeight: 'bold' }}>{brief.directors}</span>
          </div>

          {/* EXECUTIVE OVERVIEW */}
          <div>
            <div style={{ color: '#DAA520', fontSize: '11px', fontWeight: 'bold', letterSpacing: '1.2px', marginBottom: '6px' }}>
              01 // WHAT THIS TAB DOES
            </div>
            <p
              style={{
                margin: 0,
                color: '#e2e8f0',
                fontSize: '13.5px',
                lineHeight: '1.58',
                fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
              }}
            >
              {brief.overview}
            </p>
          </div>

          {/* OPERATOR WORKFLOW */}
          <div>
            <div style={{ color: '#DAA520', fontSize: '11px', fontWeight: 'bold', letterSpacing: '1.2px', marginBottom: '8px' }}>
              02 // HOW YOU OPERATE IT
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
              {brief.workflow.map((step, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                    padding: '8px 14px',
                    backgroundColor: 'rgba(13, 17, 24, 0.94)',
                    border: '1px solid #19202c',
                    borderRadius: '6px'
                  }}
                >
                  <span
                    style={{
                      color: '#080a0c',
                      backgroundColor: '#DAA520',
                      fontWeight: 'bold',
                      fontSize: '11px',
                      width: '20px',
                      height: '20px',
                      borderRadius: '4px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginTop: '1px'
                    }}
                  >
                    {idx + 1}
                  </span>
                  <span
                    style={{
                      color: '#cbd5e1',
                      fontSize: '13px',
                      lineHeight: '1.45',
                      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
                    }}
                  >
                    {step}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* SYSTEM PIPELINE BRIDGE */}
          <div>
            <div style={{ color: '#DAA520', fontSize: '11px', fontWeight: 'bold', letterSpacing: '1.2px', marginBottom: '8px' }}>
              03 // SYSTEM ARCHITECTURE FLOW
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr auto 1fr auto 1fr',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 14px',
                backgroundColor: '#07090d',
                border: '1px solid #1a2230',
                borderRadius: '6px',
                textAlign: 'center',
                fontSize: '11px'
              }}
            >
              <div style={{ padding: '7px 10px', backgroundColor: '#0e131b', border: '1px solid #1f2937', borderRadius: '5px', color: '#94A3B8' }}>
                <div style={{ fontSize: '9px', color: '#64748b', marginBottom: '2px', letterSpacing: '0.8px' }}>INPUT</div>
                <div style={{ fontWeight: 'bold', color: '#e2e8f0' }}>{brief.flow.input}</div>
              </div>
              <span style={{ color: '#DAA520', fontWeight: 'bold', fontSize: '16px' }}>→</span>
              <div style={{ padding: '7px 10px', backgroundColor: 'rgba(218, 165, 32, 0.14)', border: '1px solid #DAA520', borderRadius: '5px', color: '#ffb800' }}>
                <div style={{ fontSize: '9px', color: '#DAA520', marginBottom: '2px', letterSpacing: '0.8px' }}>ACTIVE TAB</div>
                <div style={{ fontWeight: 'bold' }}>{brief.flow.tab}</div>
              </div>
              <span style={{ color: '#10b981', fontWeight: 'bold', fontSize: '16px' }}>→</span>
              <div style={{ padding: '7px 10px', backgroundColor: '#0e131b', border: '1px solid #1f2937', borderRadius: '5px', color: '#10b981' }}>
                <div style={{ fontSize: '9px', color: '#64748b', marginBottom: '2px', letterSpacing: '0.8px' }}>DELIVERABLE</div>
                <div style={{ fontWeight: 'bold' }}>{brief.flow.output}</div>
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER TOUR NAVIGATION */}
        <div
          style={{
            padding: '12px 26px',
            backgroundColor: '#080a0f',
            borderTop: '1px solid #1f2633',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            flexShrink: 0
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span
              role="button"
              tabIndex={0}
              onClick={handlePrev}
              style={{
                backgroundColor: '#111620',
                border: '1px solid #283244',
                color: '#C5BD9F',
                padding: '7px 14px',
                borderRadius: '4px',
                fontSize: '11px',
                fontWeight: 'bold',
                cursor: 'pointer',
                userSelect: 'none'
              }}
            >
              ← PREV TAB
            </span>
            <span
              role="button"
              tabIndex={0}
              onClick={handleNext}
              style={{
                backgroundColor: '#111620',
                border: '1px solid #283244',
                color: '#C5BD9F',
                padding: '7px 14px',
                borderRadius: '4px',
                fontSize: '11px',
                fontWeight: 'bold',
                cursor: 'pointer',
                userSelect: 'none'
              }}
            >
              NEXT TAB →
            </span>
          </div>

          <span style={{ color: '#64748b', fontSize: '11px', letterSpacing: '0.8px' }}>
            {currentIdx >= 0 ? `TAB ${currentIdx + 1} OF ${allTabs.length}` : 'RHYTHM HOLDINGS // MCNC'}
          </span>

          <span
            role="button"
            tabIndex={0}
            onClick={onClose}
            style={{
              backgroundColor: '#DAA520',
              color: '#080a0c',
              padding: '7px 18px',
              borderRadius: '4px',
              fontSize: '11px',
              fontWeight: 'bold',
              letterSpacing: '1px',
              cursor: 'pointer',
              userSelect: 'none'
            }}
          >
            GOT IT
          </span>
        </div>
      </div>
    </div>
  );
}
