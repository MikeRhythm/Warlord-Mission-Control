(function () {
    'use strict';

    const TOKEN_KEY = 'mcnc_jwt_token';
    const USER_KEY = 'mcnc_user_profile';
    const TARGET_TENANT_KEY = 'mcnc_target_tenant';

    // Resolve API base: localhost:8081 when running on Vite dev port 5173, otherwise same origin
    const API_BASE = (window.location.port === '5173') ? '${API_BASE}' : '';

    // Allowed tab labels for Collaborators (Adine & Claire)
        // MCNC_CONTEXT_HELP_V3: Top-Bar Tab [i] Info Overviews + Exhaustive [?] Control Micro-Tooltips
    const TAB_OVERVIEW_DICTIONARY = {
        '01': {
            title: '01 EXEC // Executive Command & Brainstorming',
            what: 'Your main conversation hub with Monty (your AI Chief of Staff) and your specialist AI Directors.',
            when: 'Start here whenever you have a new idea, want to ask questions, polish a prompt, or plan a strategy.',
            next: 'Once your idea is clear, click "PUSH TO WAR ROOM" to turn it into a structured project asset.'
        },
        '02': {
            title: '02 WAR ROOM // Multi-Director Production Studio',
            what: 'An assembly line where your AI Directors collaborate in stages to build blueprints, copy, layouts, and code.',
            when: 'Use this tab after brainstorming in 01 EXEC when you are ready to generate real deliverables.',
            next: 'Run Stage 1 (Blueprint/PRD) first, then Stage 2 (Deliverable Build), and inspect results in 09 PREVIEWS or 12 REVIEW.'
        },
        '03': {
            title: '03 PROJECTS // Isolated Project Workspaces',
            what: 'Your master filing cabinet holding every separate venture, business idea, or client initiative.',
            when: 'Come here to create a new project folder (+ NEW PROJECT INTAKE) or inspect existing project files and pillars.',
            next: 'Select any project to see its organized subfolders, blueprints, and generated assets.'
        },
        '04': {
            title: '04 TASK BOARD // Action Tracker & Milestones',
            what: 'A visual task board tracking what is queued, in progress, and completed across your projects.',
            when: 'Use this to break big goals into step-by-step action items and track execution progress.',
            next: 'Add tasks or review items assigned by your AI Directors.'
        },
        '05': {
            title: '05 CALENDAR // Schedules & Automated Runs',
            what: 'Shows upcoming deadlines, scheduled content drops, and recurring automated workflows.',
            when: 'Check here to see what is scheduled today or plan upcoming project milestones.',
            next: 'Schedule a reminder or review automated timeline events.'
        },
        '06': {
            title: '06 MEMORY // Persistent Project Knowledge',
            what: 'Stores key facts, brand rules, preferences, and decisions your AI team should always remember.',
            when: 'Use this so you never have to repeat your background, brand voice, or core rules in new chats.',
            next: 'Add or review saved memory notes so every AI Director stays aligned with your vision.'
        },
        '07': {
            title: '07 HARVESTERS // Data & Lead Scanners',
            what: 'Automated research tools that gather market intelligence, trends, and source opportunities.',
            when: 'Admin / Operations tool for scanning external feeds and populating research data.',
            next: 'Review harvested findings before pushing insights into a project.'
        },
        '08': {
            title: '08 SYSTEM // Infrastructure & Engine Health',
            what: 'System diagnostics, background services, and core node health controls.',
            when: 'Admin control room for monitoring server status and connections.',
            next: 'Verify all engines and bridges show healthy status.'
        },
        '09': {
            title: '09 PREVIEWS // Live Visual Output Viewer',
            what: 'Renders generated web pages, dashboards, mockups, and visual deliverables right in your browser.',
            when: 'Open this after running a Stage 2 build in 02 WAR ROOM to see how your asset looks live.',
            next: 'Inspect the layout, then approve it in 12 REVIEW or request refinements.'
        },
        '10': {
            title: '10 VAULT // Secure Credentials & Keys',
            what: 'Encrypted storage for system API keys and protected configuration tokens.',
            when: 'Admin-only vault—collaborators never need to touch or configure API keys here.',
            next: 'Manage master platform keys safely.'
        },
        '11': {
            title: '11 CAMPAIGNS // Automated Clipping & Monetization Studio',
            what: 'Finds funded content-reward campaigns, locates viral hooks in long videos, and formats vertical Shorts.',
            when: 'Use this when you want to turn long-form videos into monetizable short-form clips.',
            next: 'Click DISCOVER to view active campaigns, paste a source link, and run FIND HOOKS or AUTO-EXECUTE.'
        },
        '12': {
            title: '12 REVIEW // Quality Control & Sign-Off Gate',
            what: 'Your final inspection desk where generated drafts, pages, and clips wait for your approval.',
            when: 'Check here before publishing or sharing any AI-generated deliverable externally.',
            next: 'Click APPROVE to finalize clean work or REJECT to send it back for revision.'
        },
        '13': {
            title: '13 DOCS // Knowledge Base & Project Blueprints',
            what: 'Houses all written guides, Stage 1 blueprints, SOPs, and reference documents for your workspace.',
            when: 'Open this anytime you want to read, download, or reference your structured project documents.',
            next: 'Click any document on the left to read its full formatted contents.'
        }
    };

    const HELP_DICTIONARY = {
        // --- 01 EXEC ---
        '+ NEW': {
            title: 'Create New Workspace Thread',
            what: 'Starts a fresh, blank conversation thread under your selected project.',
            why: 'Keeps each topic separate so your AI Chief remembers exact context without mixing ideas.'
        },
        '+ NEW CHAT': {
            title: 'Start New Conversation',
            what: 'Opens an active chat thread where you can type instructions or brainstorm.',
            why: 'Master Chat is a read-only summary ledger; all live work happens inside sub-chats.'
        },
        'SUBMIT': {
            title: 'Send Instruction to AI Team',
            what: 'Dispatches your typed message (and any attached screenshot/file) to your selected AI engine.',
            why: 'Generates an immediate structured response, plan, or draft right in your workspace.'
        },
        'AUTO-ROUTE': {
            title: 'Smart Engine Selector',
            what: 'Automatically picks the best AI engine for your message (Included Standard vs. Pro).',
            why: 'Protects your AI Compute Credits by using free engines for simple tasks and Pro models only when needed.'
        },
        'CREATE PROMPT': {
            title: 'AI Prompt Polisher',
            what: 'Rewrites a rough, everyday sentence into a clear, detailed instruction.',
            why: 'Gives you much better results without needing any prompt-writing experience.'
        },
        'PUSH TO WAR ROOM': {
            title: 'Send Idea to Production (02 War Room)',
            what: 'Transfers your brainstormed idea from 01 EXEC into 02 WAR ROOM.',
            why: 'Turns a casual chat idea into a structured project blueprint and deliverable asset.'
        },
        'REFINE': {
            title: 'Improve & Tighten Draft',
            what: 'Asks your AI Directors to review and upgrade the current output.',
            why: 'Polishes rough drafts into clean, client-ready material in one click.'
        },
        'COPY ALL': {
            title: 'Copy Full Output',
            what: 'Copies the entire conversation or generated deliverable to your clipboard.',
            why: 'Lets you paste your finished work straight into emails, docs, or social posts.'
        },
        'PRUNE CRAP': {
            title: 'Clean Up Noise',
            what: 'Strips out redundant filler and keeps only the essential, actionable points.',
            why: 'Saves reading time and keeps your project workspace crisp.'
        },
        'CLS': {
            title: 'Clear Screen View',
            what: 'Clears the visible terminal window without deleting your saved project files.',
            why: 'Gives you a clean visual slate when starting a fresh thought.'
        },
        'ALL STOP': {
            title: 'Emergency Stop',
            what: 'Immediately halts any active AI generation or background task.',
            why: 'Saves credits and lets you redirect the system right away if you change your mind.'
        },
        'VOICE BRIEF': {
            title: 'Listen to Audio Summary',
            what: 'Reads out an executive voice briefing of your current workspace status.',
            why: 'Lets you catch up hands-free instead of reading long blocks of text.'
        },
        'CHROME MIC': {
            title: 'Voice-to-Text Input',
            what: 'Turns on your microphone so you can speak your instructions instead of typing.',
            why: 'Fastest way to capture ideas naturally in plain speech.'
        },
        'ATTACH FILE': {
            title: 'Upload Reference File or Screenshot',
            what: 'Attaches an image, PDF, or document to your prompt.',
            why: 'Allows your AI team to inspect screenshots, briefs, or examples directly.'
        },
        'STANDARD ENGINE': {
            title: 'Included Standard AI Engine',
            what: 'Selects the fast, zero-credit local/standard AI model for everyday brainstorming and drafting.',
            why: 'Unlimited usage included with your workspace—great for drafting, organizing, and Q&A.'
        },
        'FAST CLOUD': {
            title: 'Included Fast Cloud AI Engine',
            what: 'Selects high-speed cloud clusters included at no extra credit cost.',
            why: 'Delivers fast responses for summaries, rewrites, and structured lists.'
        },
        'ELITE PRO': {
            title: 'Elite Pro Deep-Think Engine',
            what: 'Routes your request to top-tier reasoning models (uses a small amount of your Compute Credits).',
            why: 'Best for complex business architecture, legal/financial structuring, or heavy code builds.'
        },
        'TIER 1': {
            title: 'Tier 1: Local Ollama Engine',
            what: 'Runs on dedicated local hardware at zero API credit cost.',
            why: 'Fast, private, and completely free for routine prompts.'
        },
        'TIER 2': {
            title: 'Tier 2: Harvested Cloud Clusters',
            what: 'Routes through zero-cost cloud inference endpoints.',
            why: 'Great balance of speed and intelligence without consuming paid credits.'
        },
        'TIER 3': {
            title: 'Tier 3: OpenRouter Elite Models',
            what: 'Connects to flagship frontier models using your metered credit balance.',
            why: 'Maximum reasoning power for mission-critical blueprints and complex builds.'
        },

        // --- 02 WAR ROOM ---
        'STAGE 1': {
            title: 'Stage 1: Project Blueprint (PRD)',
            what: 'Switches the War Room to planning and strategy mode.',
            why: 'Defines what you are building, who it is for, and the exact steps before creating assets.'
        },
        'STAGE 2': {
            title: 'Stage 2: Deliverable Build',
            what: 'Switches the War Room to full asset and code generation mode.',
            why: 'Produces the actual working page, script, or campaign asset from your blueprint.'
        },
        'RUN SOLO': {
            title: 'Run Single Specialist Director',
            what: 'Runs only that specific AI specialist instead of the entire 4-step board.',
            why: 'Faster and uses fewer credits when you only need one quick review or tweak.'
        },
        'RUN ARTIFACT BUILD': {
            title: 'Build Full Project Deliverable',
            what: 'Runs your selected AI Directors in sequence to produce the complete asset.',
            why: 'Combines strategy, writing, refinement, and quality check into one finished output.'
        },
        'INITIATE DIR': {
            title: 'Assign Lead Director',
            what: 'Wakes up the specialist Director best suited for your active project.',
            why: 'Ensures the right persona (Creative, Strategy, or Technical) leads the task.'
        },
        'AUTHORIZED': {
            title: 'Execution Gate Status',
            what: 'Confirms your workspace is authorized and has sufficient credits/storage to run.',
            why: 'Prevents half-finished runs or unexpected account limits.'
        },

        // --- 03 PROJECTS ---
        '+ NEW PROJECT': {
            title: 'Create New Private Project',
            what: 'Creates a brand-new, isolated project workspace with organized subfolders.',
            why: 'Keeps all files, plans, and clips for each venture separated and easy to find.'
        },
        'VIEW PILLARS': {
            title: 'Inspect Project Structure',
            what: 'Opens the internal folders, pillars, and automated helpers attached to this project.',
            why: 'Shows you every asset created inside the project at a glance.'
        },
        'ALL': {
            title: 'Show All Projects',
            what: 'Displays both active and archived projects in your workspace.',
            why: 'Gives you a complete view of everything you have ever created.'
        },
        'ACTIVE': {
            title: 'Filter Active Projects',
            what: 'Shows only projects currently in progress.',
            why: 'Keeps your board focused on what you are working on right now.'
        },
        'ARCHIVED': {
            title: 'Filter Archived Projects',
            what: 'Shows completed or paused projects stored safely out of the way.',
            why: 'Declutters your main screen without permanently deleting past work.'
        },

        // --- 11 CAMPAIGNS & 12 REVIEW ---
        'DISCOVER': {
            title: 'Scan Live Bounty Campaigns',
            what: 'Searches supported clipping platforms for open, funded campaigns.',
            why: 'Shows payout rates ($ per 1,000 views) and rules before you start clipping.'
        },
        'FIND HOOKS': {
            title: 'AI Viral Hook Finder',
            what: 'Scans a long video or topic to pinpoint the highest-attention 30–60 second moments.',
            why: 'Finds the exact clips most likely to hit minimum view payouts.'
        },
        'AUTO-EXECUTE': {
            title: 'Automated Clipping Pipeline',
            what: 'Runs the end-to-end clipping workflow (hook detection, vertical crop, and captions).',
            why: 'Turns raw source video into ready-to-upload Shorts with minimal manual editing.'
        },
        'CLEAR LOGS': {
            title: 'Clear Activity Log',
            what: 'Resets the on-screen status log for your current campaign run.',
            why: 'Makes it easy to spot fresh status updates on your next run.'
        },
        'APPROVE': {
            title: 'Approve Deliverable',
            what: 'Marks this generated item as approved and ready for publishing or export.',
            why: 'Moves verified work forward in your pipeline.'
        },
        'REJECT': {
            title: 'Request Revision',
            what: 'Flags the item as needing changes so it is not published prematurely.',
            why: 'Keeps quality control tight before anything goes live.'
        }
    };

    const CLIENT_ENGINE_LABELS = {
        'TIER 1: OLLAMA (LOCAL)': 'STANDARD ENGINE // INCLUDED (FREE)',
        'TIER 2: HARVESTED CLUSTERS (FREE)': 'FAST CLOUD ENGINE // INCLUDED (FREE)',
        'TIER 3: OPENROUTER (ELITE)': 'ELITE PRO ENGINE // USES CREDITS',
        'TIER 4: KAGGLE T4 (CLOUD COMPUTE)': 'HEAVY MEDIA COMPUTE // STANDBY'
    };

    function getActiveTabPrefix() {
        const activeBtn = Array.from(document.querySelectorAll('button')).find((b) => {
            const txt = (b.textContent || '').trim();
            if (!/^\d{2}\s+/.test(txt)) return false;
            const style = window.getComputedStyle(b);
            return style.borderBottomColor === 'rgb(255, 184, 0)' || style.color === 'rgb(255, 184, 0)' || b.className.includes('active');
        });
        return activeBtn ? (activeBtn.textContent || '').trim().slice(0, 2) : '01';
    }

    function describeFormControl(el) {
        const tag = el.tagName.toLowerCase();
        const type = (el.type || '').toLowerCase();
        const placeholder = (el.placeholder || '').trim();
        const name = (el.name || el.id || '').trim();
        const aria = (el.getAttribute('aria-label') || el.title || '').trim();
        const parentText = (el.closest('label') ? el.closest('label').textContent : '').trim();
        const hint = (aria || placeholder || parentText || name || 'this field').replace(/\?/g, '').replace(/\s+/g, ' ').slice(0, 80);

        if (type === 'checkbox' || type === 'radio') {
            return {
                title: 'Option Toggle: ' + (hint || 'Selection'),
                what: `Checking or unchecking "${hint}" turns this setting ON or OFF before you run the next step.`,
                why: 'Lets you customize how your AI Directors process, filter, or format this action.'
            };
        }
        if (tag === 'select') {
            return {
                title: 'Dropdown Selector: ' + (hint || 'Choose Option'),
                what: `Pick one of the options from "${hint}" to choose the right project, AI engine, or workflow mode.`,
                why: 'Routes your instruction or generated deliverable to the exact destination you selected.'
            };
        }
        if (tag === 'textarea') {
            return {
                title: 'Instruction & Idea Box',
                what: placeholder
                    ? `Type or paste your instructions here (${placeholder}).`
                    : 'Describe your goal, idea, script, or revision notes in everyday plain English.',
                why: 'Your AI Chief and specialist Directors read everything here to build or refine your deliverable.'
            };
        }
        if (type === 'url' || /url|link|youtube|http/i.test(hint)) {
            return {
                title: 'Source Link / URL Box',
                what: 'Paste the full web link (for example, a YouTube video or campaign link) into this field.',
                why: 'Lets the system fetch, analyze, or clip the exact source content automatically.'
            };
        }
        if (type === 'number') {
            return {
                title: 'Number Setting: ' + hint,
                what: `Enter a numeric value for ${hint}.`,
                why: 'Sets limits, clip counts, durations, or targets for this specific task.'
            };
        }
        return {
            title: 'Input Box: ' + hint,
            what: placeholder
                ? `Type the requested detail here: "${placeholder}".`
                : `Enter the required name, keyword, or detail for ${hint}.`,
            why: 'Gives your AI Directors the exact title, search term, or parameter needed to complete this step.'
        };
    }

    function describeGenericButton(btn) {
        const tabCode = getActiveTabPrefix();
        const tabInfo = TAB_OVERVIEW_DICTIONARY[tabCode];
        const rawLabel = (btn.textContent || btn.getAttribute('aria-label') || btn.title || '').replace(/[?i]/g, '').trim();
        const label = rawLabel || 'Workspace Control';
        return {
            title: 'Control: ' + label,
            what: `Activates "${label}" inside ${tabInfo ? tabInfo.title.split('//')[0].trim() : 'your current workspace'}.`,
            why: tabInfo
                ? `Helps you complete tasks in this section (${tabInfo.when.replace(/^Use this\s*/i, '').replace(/\.$/, '')}).`
                : 'Executes this step immediately using your active project and selected settings.'
        };
    }

    function injectHelpStyles() {
        if (document.getElementById('mcnc-help-styles')) return;
        const s = document.createElement('style');
        s.id = 'mcnc-help-styles';
        s.textContent = `
            .mcnc-tab-info-badge {
                display: inline-flex; align-items: center; justify-content: center;
                width: 15px; height: 15px; min-width: 15px; margin-left: 6px;
                border-radius: 50%; border: 1px solid #38bdf8;
                background: rgba(56, 189, 248, 0.16); color: #38bdf8;
                font-family: 'JetBrains Mono', 'Consolas', monospace;
                font-size: 10px; font-weight: 800; line-height: 1;
                cursor: pointer; vertical-align: middle;
                transition: all 0.15s ease;
                user-select: none;
            }
            .mcnc-tab-info-badge:hover {
                background: #38bdf8; color: #080a0c; transform: scale(1.15);
            }
            .mcnc-q-badge {
                display: inline-flex; align-items: center; justify-content: center;
                width: 14px; height: 14px; min-width: 14px; margin-left: 5px;
                border-radius: 50%; border: 1px solid #DAA520;
                background: rgba(255, 184, 0, 0.16); color: #ffb800;
                font-family: 'JetBrains Mono', 'Consolas', monospace;
                font-size: 9px; font-weight: 800; line-height: 1;
                cursor: pointer; vertical-align: middle;
                transition: all 0.15s ease;
                user-select: none;
            }
            .mcnc-q-badge:hover {
                background: #ffb800; color: #080a0c; transform: scale(1.15);
            }
            #mcnc-q-popover {
                position: fixed; z-index: 99999; width: 345px; padding: 15px;
                background: rgba(13, 15, 18, 0.98);
                backdrop-filter: blur(12px);
                border: 1px solid #DAA520; border-radius: 6px;
                box-shadow: 0 16px 40px rgba(0,0,0,0.94);
                font-family: 'JetBrains Mono', 'Consolas', monospace;
                display: none;
            }
            .mcnc-q-pop-title {
                color: #ffb800; font-size: 11px; font-weight: 800;
                text-transform: uppercase; letter-spacing: 0.6px; margin-bottom: 9px;
                display: flex; justify-content: space-between; align-items: center; gap: 8px;
                border-bottom: 1px solid #1f242d; padding-bottom: 6px;
            }
            .mcnc-q-pop-row {
                font-size: 11px; color: #E2E8F0; line-height: 1.48; margin-bottom: 8px;
            }
            .mcnc-q-pop-tag {
                color: #38bdf8; font-weight: 700; text-transform: uppercase; font-size: 10px;
            }
            #mcnc-quickstart-bar {
                position: fixed; bottom: 10px; right: 14px; z-index: 99985;
                background: rgba(13, 15, 18, 0.95);
                border: 1px solid #1f242d; border-left: 3px solid #ffb800;
                border-radius: 5px; padding: 8px 12px;
                font-family: 'JetBrains Mono', 'Consolas', monospace;
                font-size: 10px; color: #C5BD9F;
                display: flex; align-items: center; gap: 10px;
                box-shadow: 0 8px 24px rgba(0,0,0,0.75);
            }
            .mcnc-qs-step { color: #E2E8F0; }
            .mcnc-qs-step b { color: #ffb800; }
        `;
        document.head.appendChild(s);
    }

    function createQBadge(getInfoFn) {
        const q = document.createElement('span');
        q.className = 'mcnc-q-badge';
        q.textContent = '?';
        q.title = 'Click to see what this control does and why it matters';
        q.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            showHelpPopover(q, getInfoFn(), false);
        });
        return q;
    }

    function createTabInfoBadge(tabCode) {
        const info = TAB_OVERVIEW_DICTIONARY[tabCode];
        if (!info) return null;
        const badge = document.createElement('span');
        badge.className = 'mcnc-tab-info-badge';
        badge.textContent = 'i';
        badge.title = 'Click for overview of what this tab does';
        badge.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            showHelpPopover(badge, info, true);
        });
        return badge;
    }

    function showHelpPopover(anchorEl, info, isTabOverview) {
        let pop = document.getElementById('mcnc-q-popover');
        if (!pop) {
            pop = document.createElement('div');
            pop.id = 'mcnc-q-popover';
            document.body.appendChild(pop);
            document.addEventListener('click', (e) => {
                if (!pop.contains(e.target) && !e.target.classList.contains('mcnc-q-badge') && !e.target.classList.contains('mcnc-tab-info-badge')) {
                    pop.style.display = 'none';
                }
            });
        }
        pop.style.borderColor = isTabOverview ? '#38bdf8' : '#DAA520';
        if (isTabOverview) {
            pop.innerHTML = `
                <div class="mcnc-q-pop-title" style="color:#38bdf8;">
                    <span>${info.title}</span>
                    <span style="cursor:pointer;color:#94A3B8;" onclick="document.getElementById('mcnc-q-popover').style.display='none'">[X]</span>
                </div>
                <div class="mcnc-q-pop-row"><span class="mcnc-q-pop-tag">What this tab is:</span> ${info.what}</div>
                <div class="mcnc-q-pop-row"><span class="mcnc-q-pop-tag">When to use it:</span> ${info.when}</div>
                <div class="mcnc-q-pop-row" style="margin-bottom:0;"><span class="mcnc-q-pop-tag" style="color:#ffb800;">Recommended next step:</span> ${info.next}</div>
            `;
        } else {
            pop.innerHTML = `
                <div class="mcnc-q-pop-title">
                    <span>${info.title}</span>
                    <span style="cursor:pointer;color:#94A3B8;" onclick="document.getElementById('mcnc-q-popover').style.display='none'">[X]</span>
                </div>
                <div class="mcnc-q-pop-row"><span class="mcnc-q-pop-tag">What happens / What to enter:</span> ${info.what}</div>
                <div class="mcnc-q-pop-row" style="margin-bottom:0;"><span class="mcnc-q-pop-tag">Why it matters:</span> ${info.why}</div>
            `;
        }
        const rect = anchorEl.getBoundingClientRect();
        const left = Math.min(window.innerWidth - 360, Math.max(12, rect.left));
        const top = (rect.bottom + 185 > window.innerHeight) ? Math.max(12, rect.top - 180) : (rect.bottom + 8);
        pop.style.left = left + 'px';
        pop.style.top = top + 'px';
        pop.style.display = 'block';
    }

    function applyContextualHelpAndClientLabels(user) {
        injectHelpStyles();
        const activeTenant = getTargetTenant();
        const isClientView = (user && (user.role !== 'EXEC_ADMIN' || activeTenant !== 'Mike'));

        // 1. Attach [i] Tab Overview Icons to Top Navigation Bar Tabs + [?] Badges to ALL Action Buttons
        document.querySelectorAll('button, [role="button"]').forEach((btn) => {
            if (btn.dataset.mcncHelpBound) return;
            if (btn.closest('#mcnc-floating-hud') || btn.closest('#mcnc-login-overlay') || btn.closest('#mcnc-usage-drawer') || btn.closest('#mcnc-invite-modal') || btn.closest('#mcnc-pwd-modal')) return;
            if (btn.offsetParent === null) return;

            const rawText = (btn.textContent || '').trim().toUpperCase();
            const ariaOrTitle = (btn.getAttribute('aria-label') || btn.title || '').trim().toUpperCase();
            const searchKey = rawText || ariaOrTitle;
            if (!searchKey) return;

            btn.dataset.mcncHelpBound = '1';

            // Top-bar numbered tabs (e.g., "01 EXEC", "02 WAR ROOM", "11 CAMPAIGNS") get a cyan [i] tab overview badge
            const tabMatch = rawText.match(/^(\d{2})\s+/);
            if (tabMatch) {
                const infoBadge = createTabInfoBadge(tabMatch[1]);
                if (infoBadge) btn.appendChild(infoBadge);
                return;
            }

            // Every other button gets a gold [?] micro-help badge
            const matchedKey = Object.keys(HELP_DICTIONARY).find((k) => searchKey === k || searchKey.includes(k));
            const q = createQBadge(() => matchedKey ? HELP_DICTIONARY[matchedKey] : describeGenericButton(btn));
            btn.appendChild(q);
        });

        // 2. Attach [?] micro-help badges to ALL visible form inputs, textareas, dropdowns & checkboxes
        document.querySelectorAll('input, textarea, select').forEach((field) => {
            if (field.dataset.mcncHelpBound) return;
            if (field.type === 'hidden' || field.type === 'file') return;
            if (field.closest('#mcnc-floating-hud') || field.closest('#mcnc-login-overlay') || field.closest('#mcnc-usage-drawer') || field.closest('#mcnc-invite-modal') || field.closest('#mcnc-pwd-modal')) return;
            if (field.offsetParent === null) return;

            field.dataset.mcncHelpBound = '1';
            const q = createQBadge(() => describeFormControl(field));
            const labelParent = field.closest('label');
            if (labelParent) {
                labelParent.appendChild(q);
            } else if (field.parentElement) {
                field.insertAdjacentElement('afterend', q);
            }
        });

        // 3. Plain-English Engine Labels & Quick-Start Guide Bar for Collaborators
        if (isClientView) {
            document.querySelectorAll('button, div, span').forEach((el) => {
                if (el.children.length === 0) {
                    const txt = (el.textContent || '').trim().toUpperCase();
                    if (CLIENT_ENGINE_LABELS[txt]) {
                        el.textContent = CLIENT_ENGINE_LABELS[txt];
                    }
                }
            });

            if (!sessionStorage.getItem('mcnc_hide_qs') && !document.getElementById('mcnc-quickstart-bar')) {
                const bar = document.createElement('div');
                bar.id = 'mcnc-quickstart-bar';
                bar.innerHTML = `
                    <span class="mcnc-qs-step">Click any tab's <b style="color:#38bdf8;">[i]</b> for what it does</span>
                    <span>•</span>
                    <span class="mcnc-qs-step">Click any <b style="color:#ffb800;">[?]</b> next to a button or box for instant help</span>
                    <button type="button" id="mcnc-qs-close" class="mcnc-hud-btn" style="padding:2px 6px;">HIDE</button>
                `;
                document.body.appendChild(bar);
                document.getElementById('mcnc-qs-close').addEventListener('click', () => {
                    sessionStorage.setItem('mcnc_hide_qs', '1');
                    bar.remove();
                });
            }
        }
    }

    const COLLABORATOR_ALLOWED_TABS = ['01 EXEC', '02 WAR ROOM', '03 PROJECTS', '04 TASK BOARD', '05 CALENDAR', '06 MEMORY', '11 CAMPAIGNS', '12 REVIEW'];

    function getToken() {
        return sessionStorage.getItem(TOKEN_KEY) || '';
    }

    function getUser() {
        try {
            return JSON.parse(sessionStorage.getItem(USER_KEY) || 'null');
        } catch (_) {
            return null;
        }
    }

    function getTargetTenant() {
        const user = getUser();
        if (!user) return '';
        if (user.role !== 'EXEC_ADMIN') return user.tenantId;
        return sessionStorage.getItem(TARGET_TENANT_KEY) || user.tenantId;
    }

    function clearSession() {
        sessionStorage.removeItem(TOKEN_KEY);
        sessionStorage.removeItem(USER_KEY);
        sessionStorage.removeItem(TARGET_TENANT_KEY);
    }

    // Intercept all /api/ fetch calls to inject Bearer token & X-Target-Tenant
    const originalFetch = window.fetch.bind(window);
    window.fetch = function (input, init) {
        const url = typeof input === 'string' ? input : (input && input.url) || '';
        const token = getToken();
        if (token && url.includes('/api/')) {
            const nextInit = Object.assign({}, init);
            const headers = new Headers(nextInit.headers || (typeof input !== 'string' && input.headers) || {});
            headers.set('Authorization', 'Bearer ' + token);
            const targetTenant = getTargetTenant();
            if (targetTenant) {
                headers.set('X-Target-Tenant', targetTenant);
            }
            nextInit.headers = headers;
            return originalFetch(input, nextInit);
        }
        return originalFetch(input, init);
    };

    function injectStyles() {
        if (document.getElementById('mcnc-auth-styles')) return;
        const style = document.createElement('style');
        style.id = 'mcnc-auth-styles';
        style.textContent = `
            #mcnc-login-overlay {
                position: fixed; inset: 0; z-index: 99999;
                background: #080a0c;
                display: flex; align-items: center; justify-content: center;
                font-family: 'JetBrains Mono', 'Consolas', monospace;
            }
            .mcnc-auth-card {
                width: 100%; max-width: 390px; padding: 28px;
                background: rgba(13, 15, 18, 0.96);
                backdrop-filter: blur(12px);
                border: 1px solid #1f242d;
                border-radius: 6px;
                box-shadow: 0 20px 50px rgba(0,0,0,0.9);
            }
            .mcnc-auth-title {
                color: #ffb800; font-size: 13px; font-weight: 700;
                letter-spacing: 1.2px; margin-bottom: 6px; text-transform: uppercase;
            }
            .mcnc-auth-sub {
                color: #94A3B8; font-size: 11px; margin-bottom: 20px;
            }
            .mcnc-auth-label {
                display: block; color: #C5BD9F; font-size: 11px;
                margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.6px;
            }
            .mcnc-auth-input {
                width: 100%; box-sizing: border-box; padding: 10px 12px;
                margin-bottom: 14px; background: #080a0c; color: #E2E8F0;
                border: 1px solid #1f242d; border-radius: 4px;
                font-family: inherit; font-size: 12px; outline: none;
            }
            .mcnc-auth-input:focus { border-color: #DAA520; }
            .mcnc-auth-btn {
                width: 100%; padding: 10px; background: #ffb800; color: #080a0c;
                border: none; border-radius: 4px; font-family: inherit;
                font-size: 12px; font-weight: 800; letter-spacing: 1px;
                cursor: pointer; text-transform: uppercase;
            }
            .mcnc-auth-btn:hover { background: #DAA520; }
            .mcnc-auth-err {
                color: #ef4444; font-size: 11px; margin-top: 10px; min-height: 15px;
            }
            #mcnc-floating-hud {
                position: fixed; top: 8px; right: 360px; z-index: 99990;
                display: flex; align-items: center; gap: 6px;
                font-family: 'JetBrains Mono', 'Consolas', monospace;
            }
            .mcnc-hud-badge {
                padding: 4px 8px; border-radius: 3px; font-size: 10px;
                font-weight: 700; letter-spacing: 0.6px; text-transform: uppercase;
                background: #14171c; color: #C5BD9F; border: 1px solid #1f242d;
            }
            .mcnc-hud-badge.admin-override {
                background: rgba(56, 189, 248, 0.14);
                color: #38bdf8; border-color: #38bdf8;
            }
            .mcnc-hud-select, .mcnc-hud-btn {
                background: #14171c; color: #C5BD9F; border: 1px solid #1f242d;
                border-radius: 3px; padding: 4px 8px; font-family: inherit;
                font-size: 10px; font-weight: 700; cursor: pointer; text-transform: uppercase;
            }
            .mcnc-hud-select:focus, .mcnc-hud-btn:hover {
                border-color: #ffb800; color: #ffb800;
            }
            #mcnc-pwd-modal {
                position: fixed; inset: 0; z-index: 99998;
                background: rgba(8, 10, 12, 0.88);
                display: none; align-items: center; justify-content: center;
                font-family: 'JetBrains Mono', 'Consolas', monospace;
            }
        `;
        document.head.appendChild(style);
    }

    function renderLoginOverlay(errorMsg = '') {
        let overlay = document.getElementById('mcnc-login-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'mcnc-login-overlay';
            overlay.innerHTML = `
                <div class="mcnc-auth-card">
                    <div class="mcnc-auth-title">MCNC // SOVEREIGN ACCESS GATE</div>
                    <div class="mcnc-auth-sub">Authenticate to initialize isolated tenant workspace.</div>
                    <form id="mcnc-login-form">
                        <label class="mcnc-auth-label" for="mcnc-user-in">Operator Username</label>
                        <input id="mcnc-user-in" class="mcnc-auth-input" type="text" autocomplete="username" required />
                        <label class="mcnc-auth-label" for="mcnc-pass-in">Access Key / Password</label>
                        <input id="mcnc-pass-in" class="mcnc-auth-input" type="password" autocomplete="current-password" required />
                        <button type="submit" class="mcnc-auth-btn">AUTHENTICATE</button>
                        <div id="mcnc-login-err" class="mcnc-auth-err"></div>
                    </form>
                </div>
            `;
            document.body.appendChild(overlay);

            document.getElementById('mcnc-login-form').addEventListener('submit', async (e) => {
                e.preventDefault();
                const errEl = document.getElementById('mcnc-login-err');
                errEl.textContent = '';
                const username = document.getElementById('mcnc-user-in').value.trim();
                const password = document.getElementById('mcnc-pass-in').value;

                try {
                    const res = await originalFetch(API_BASE + '/api/auth/login', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ username, password })
                    });
                    const data = await res.json();
                    if (!res.ok || !data.success) {
                        errEl.textContent = data.error || 'Authentication denied.';
                        return;
                    }
                    sessionStorage.setItem(TOKEN_KEY, data.token);
                    sessionStorage.setItem(USER_KEY, JSON.stringify(data.user));
                    sessionStorage.setItem(TARGET_TENANT_KEY, data.user.tenantId);
                    overlay.remove();
                    applyAuthenticatedState(data.user);
                } catch (err) {
                    errEl.textContent = 'Backend unreachable on 8081: ' + err.message;
                }
            });
        }
        if (errorMsg) {
            const errEl = document.getElementById('mcnc-login-err');
            if (errEl) errEl.textContent = errorMsg;
        }
    }

    function enforceCollaboratorTabs(user) {
        if (!user || user.role === 'EXEC_ADMIN') return;
        const buttons = document.querySelectorAll('button');
        let campaignsBtn = null;
        buttons.forEach((btn) => {
            const label = (btn.textContent || '').trim().toUpperCase();
            if (/^\d{2}\s+/.test(label)) {
                if (!COLLABORATOR_ALLOWED_TABS.includes(label)) {
                    btn.style.display = 'none';
                } else if (label === '11 CAMPAIGNS') {
                    campaignsBtn = btn;
                }
            }
        });
        // Auto-click 11 CAMPAIGNS if currently viewing restricted 01 EXEC
        if (campaignsBtn && !sessionStorage.getItem('mcnc_collab_routed')) {
            sessionStorage.setItem('mcnc_collab_routed', '1');
            campaignsBtn.click();
        }
    }

    function applyAuthenticatedState(user) {
        enforceCollaboratorTabs(user);
        setTimeout(() => { enforceCollaboratorTabs(user); applyContextualHelpAndClientLabels(user); }, 400);
        setInterval(() => applyContextualHelpAndClientLabels(user), 900);

        let hud = document.getElementById('mcnc-floating-hud');
        if (!hud) {
            hud = document.createElement('div');
            hud.id = 'mcnc-floating-hud';
            document.body.appendChild(hud);
        }

        const activeTenant = getTargetTenant();
        const isOverride = user.role === 'EXEC_ADMIN' && activeTenant !== user.tenantId;

        let switcherHtml = '';
        if (user.role === 'EXEC_ADMIN') {
            const options = (user.availableTenants || ['Mike', 'Adine', 'Claire'])
                .map((t) => `<option value="${t}" ${t === activeTenant ? 'selected' : ''}>VIEW: ${t.toUpperCase()}</option>`)
                .join('');
            switcherHtml = `<select id="mcnc-tenant-switcher" class="mcnc-hud-select" title="Switch Active Tenant Workspace">${options}</select>`;
        }

        hud.innerHTML = `
            <span id="mcnc-usage-trigger" class="mcnc-hud-badge ${isOverride ? 'admin-override' : ''}" style="cursor:pointer;" title="Click to open Usage & Billing HUD">
                ${isOverride ? 'ADMIN OVERRIDE: ' + activeTenant : 'OPERATOR: ' + user.username}
            </span>
            ${switcherHtml}
            ${user.role === "EXEC_ADMIN" ? `<button id="mcnc-invite-open-btn" class="mcnc-hud-btn" type="button" style="border-color:#DAA520;color:#ffb800;">+ INVITE</button>` : ""}<button id="mcnc-pwd-open-btn" class="mcnc-hud-btn" type="button">PASSWORD</button>
            <button id="mcnc-logout-btn" class="mcnc-hud-btn" type="button">LOGOUT</button>
        `;

        const switcher = document.getElementById('mcnc-tenant-switcher');
        if (switcher) {
            switcher.addEventListener('change', (e) => {
                sessionStorage.setItem(TARGET_TENANT_KEY, e.target.value);
                window.dispatchEvent(new CustomEvent('mcnc:tenant-changed', { detail: { tenant: e.target.value } }));
                applyAuthenticatedState(user);
            });
        }

        document.getElementById('mcnc-logout-btn').addEventListener('click', () => {
            clearSession();
            sessionStorage.removeItem('mcnc_collab_routed');
            window.location.reload();
        });

                const invBtn = document.getElementById('mcnc-invite-open-btn');
        if (invBtn) {
            ensureInviteModal();
            invBtn.addEventListener('click', () => {
                document.getElementById('mcnc-invite-modal').style.display = 'flex';
            });
        }
                const usageTrigger = document.getElementById('mcnc-usage-trigger');
        if (usageTrigger) {
            usageTrigger.addEventListener('click', () => openUsageDrawer(user));
        }
        ensurePasswordModal();
        document.getElementById('mcnc-pwd-open-btn').addEventListener('click', () => {
            document.getElementById('mcnc-pwd-modal').style.display = 'flex';
        });
    }

        async function openUsageDrawer(user) {
        let drawer = document.getElementById('mcnc-usage-drawer');
        if (!drawer) {
            drawer = document.createElement('div');
            drawer.id = 'mcnc-usage-drawer';
            drawer.style.cssText = 'position:fixed;inset:0;z-index:99998;background:rgba(8,10,12,0.88);display:flex;align-items:center;justify-content:center;font-family:"JetBrains Mono",Consolas,monospace;';
            document.body.appendChild(drawer);
        }
        drawer.style.display = 'flex';
        drawer.innerHTML = '<div class="mcnc-auth-card"><div class="mcnc-auth-title">LOADING TELEMETRY...</div></div>';

        try {
            const res = await window.fetch(API_BASE + '/api/auth/usage');
            const data = await res.json();
            if (!res.ok || !data.success) throw new Error(data.error || 'Failed to load usage');
            const u = data.usage;

            const diskPct = Math.min(100, Math.round((u.diskUsedMb / Math.max(1, u.diskQuotaMb)) * 100));
            const diskColor = diskPct >= 95 ? '#ef4444' : (diskPct >= 80 ? '#f59e0b' : '#10b981');
            const renderPct = Math.min(100, Math.round((u.rendersUsed / Math.max(1, u.rendersLimit)) * 100));
            const creditDisplay = u.role === 'EXEC_ADMIN' && u.tenantId === 'Mike' ? 'UNLIMITED (ADMIN)' : '$' + u.creditBalanceUsd.toFixed(2);

            const adminTopUpHtml = user.role === 'EXEC_ADMIN' ? `
                <div style="margin-top:16px;padding-top:14px;border-top:1px solid #1f242d;">
                    <div class="mcnc-auth-label" style="color:#38bdf8;">ADMIN QUICK TOP-UP (${u.tenantId.toUpperCase()})</div>
                    <div style="display:flex;gap:6px;margin-bottom:8px;">
                        <input id="mcnc-topup-usd" class="mcnc-auth-input" type="number" step="5" value="20" style="margin-bottom:0;" placeholder="Add $" />
                        <input id="mcnc-topup-mb" class="mcnc-auth-input" type="number" step="500" value="${u.diskQuotaMb}" style="margin-bottom:0;" placeholder="Quota MB" />
                    </div>
                    <button id="mcnc-topup-submit" type="button" class="mcnc-auth-btn" style="background:#38bdf8;">APPLY TOP-UP</button>
                    <div id="mcnc-topup-msg" class="mcnc-auth-err"></div>
                </div>
            ` : `
                <div style="margin-top:16px;padding-top:14px;border-top:1px solid #1f242d;">
                    <div style="color:#94A3B8;font-size:11px;margin-bottom:10px;">Need more storage, renders, or premium Claude/Grok compute credits?</div>
                    <button type="button" class="mcnc-auth-btn" onclick="alert('Contact Mike to top up your MCNC Credits or upgrade to Pro Tier.');">REQUEST CREDIT TOP-UP</button>
                </div>
            `;

            drawer.innerHTML = `
                <div class="mcnc-auth-card" style="max-width:430px;">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;">
                        <div class="mcnc-auth-title" style="margin:0;">USAGE & BILLING // ${u.tenantId.toUpperCase()}</div>
                        <span class="mcnc-hud-badge" style="color:#ffb800;border-color:#DAA520;">${u.planTier}</span>
                    </div>

                    <div style="margin-bottom:14px;">
                        <div style="display:flex;justify-content:space-between;font-size:11px;color:#C5BD9F;margin-bottom:4px;">
                            <span>DISK STORAGE</span>
                            <span>${u.diskUsedMb} MB / ${u.diskQuotaMb} MB (${diskPct}%)</span>
                        </div>
                        <div style="height:6px;background:#14171c;border-radius:3px;overflow:hidden;">
                            <div style="height:100%;width:${diskPct}%;background:${diskColor};"></div>
                        </div>
                    </div>

                    <div style="margin-bottom:14px;">
                        <div style="display:flex;justify-content:space-between;font-size:11px;color:#C5BD9F;margin-bottom:4px;">
                            <span>AI COMPUTE CREDITS</span>
                            <span style="color:#10b981;font-weight:700;">${creditDisplay}</span>
                        </div>
                        <div style="font-size:10px;color:#94A3B8;">Spent this cycle: $${u.creditsUsedUsd.toFixed(4)} | Tokens metered: ${u.totalTokensUsed.toLocaleString()}</div>
                    </div>

                    <div style="margin-bottom:14px;">
                        <div style="display:flex;justify-content:space-between;font-size:11px;color:#C5BD9F;margin-bottom:4px;">
                            <span>MEDIA RENDER QUOTA</span>
                            <span>${u.rendersUsed} / ${u.rendersLimit} CLIPS</span>
                        </div>
                        <div style="height:6px;background:#14171c;border-radius:3px;overflow:hidden;">
                            <div style="height:100%;width:${renderPct}%;background:#ffb800;"></div>
                        </div>
                    </div>

                    ${adminTopUpHtml}

                    <button id="mcnc-usage-close" type="button" class="mcnc-hud-btn" style="width:100%;margin-top:12px;padding:8px;">CLOSE</button>
                </div>
            `;

            document.getElementById('mcnc-usage-close').addEventListener('click', () => {
                drawer.style.display = 'none';
            });

            const topUpBtn = document.getElementById('mcnc-topup-submit');
            if (topUpBtn) {
                topUpBtn.addEventListener('click', async () => {
                    const msgEl = document.getElementById('mcnc-topup-msg');
                    const addUsd = Number(document.getElementById('mcnc-topup-usd').value || 0);
                    const newQuotaMb = Number(document.getElementById('mcnc-topup-mb').value || u.diskQuotaMb);
                    const r = await window.fetch(API_BASE + '/api/auth/topup', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ tenantId: u.tenantId, addUsd, newQuotaMb })
                    });
                    const d = await r.json();
                    if (r.ok && d.success) {
                        msgEl.style.color = '#10b981';
                        msgEl.textContent = 'Updated! Refreshing telemetry...';
                        setTimeout(() => openUsageDrawer(user), 700);
                    } else {
                        msgEl.textContent = d.error || 'Top-up failed';
                    }
                });
            }
        } catch (err) {
            drawer.innerHTML = `<div class="mcnc-auth-card"><div class="mcnc-auth-err">${err.message}</div><button type="button" class="mcnc-hud-btn" style="margin-top:10px;" onclick="document.getElementById('mcnc-usage-drawer').style.display='none'">CLOSE</button></div>`;
        }
    }

    function ensurePasswordModal() {
        if (document.getElementById('mcnc-pwd-modal')) return;
        const modal = document.createElement('div');
        modal.id = 'mcnc-pwd-modal';
        modal.innerHTML = `
            <div class="mcnc-auth-card">
                <div class="mcnc-auth-title">ROTATE ACCESS PASSWORD</div>
                <div class="mcnc-auth-sub">Minimum 8 characters required.</div>
                <form id="mcnc-pwd-form">
                    <label class="mcnc-auth-label" for="mcnc-cur-pwd">Current Password</label>
                    <input id="mcnc-cur-pwd" class="mcnc-auth-input" type="password" required />
                    <label class="mcnc-auth-label" for="mcnc-new-pwd">New Password</label>
                    <input id="mcnc-new-pwd" class="mcnc-auth-input" type="password" minlength="8" required />
                    <div style="display:flex; gap:8px;">
                        <button type="submit" class="mcnc-auth-btn">UPDATE KEY</button>
                        <button type="button" id="mcnc-pwd-cancel" class="mcnc-hud-btn" style="padding:10px 14px;">CANCEL</button>
                    </div>
                    <div id="mcnc-pwd-msg" class="mcnc-auth-err"></div>
                </form>
            </div>
        `;
        document.body.appendChild(modal);

        document.getElementById('mcnc-pwd-cancel').addEventListener('click', () => {
            modal.style.display = 'none';
            document.getElementById('mcnc-pwd-msg').textContent = '';
        });

        document.getElementById('mcnc-pwd-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const msgEl = document.getElementById('mcnc-pwd-msg');
            msgEl.style.color = '#ef4444';
            msgEl.textContent = '';

            const currentPassword = document.getElementById('mcnc-cur-pwd').value;
            const newPassword = document.getElementById('mcnc-new-pwd').value;

            try {
                const res = await window.fetch(API_BASE + '/api/auth/change-password', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ currentPassword, newPassword })
                });
                const data = await res.json();
                if (!res.ok || !data.success) {
                    msgEl.textContent = data.error || 'Failed to update password.';
                    return;
                }
                msgEl.style.color = '#10b981';
                msgEl.textContent = 'Password updated cleanly.';
                document.getElementById('mcnc-cur-pwd').value = '';
                document.getElementById('mcnc-new-pwd').value = '';
                setTimeout(() => { modal.style.display = 'none'; msgEl.textContent = ''; }, 1100);
            } catch (err) {
                msgEl.textContent = 'Error: ' + err.message;
            }
        });
    }

        function ensureInviteModal() {
        if (document.getElementById('mcnc-invite-modal')) return;
        const modal = document.createElement('div');
        modal.id = 'mcnc-invite-modal';
        modal.style.cssText = 'position:fixed;inset:0;z-index:99998;background:rgba(8,10,12,0.88);display:none;align-items:center;justify-content:center;font-family:"JetBrains Mono",Consolas,monospace;';
        modal.innerHTML = `
            <div class="mcnc-auth-card">
                <div class="mcnc-auth-title">GENERATE CLIENT INVITE LINK</div>
                <div class="mcnc-auth-sub">Creates a single-use onboarding link with a 100% clean-slate workspace.</div>
                <form id="mcnc-invite-form">
                    <label class="mcnc-auth-label" for="mcnc-inv-name">Client / Tenant Name (e.g. Adine)</label>
                    <input id="mcnc-inv-name" class="mcnc-auth-input" type="text" placeholder="Adine" required />
                    <label class="mcnc-auth-label" for="mcnc-inv-email">Client Email (Optional)</label>
                    <input id="mcnc-inv-email" class="mcnc-auth-input" type="email" placeholder="adine@example.com" />
                    <label class="mcnc-auth-label" for="mcnc-inv-quota">Storage Quota (MB)</label>
                    <input id="mcnc-inv-quota" class="mcnc-auth-input" type="number" value="500" min="100" required />
                    <div style="display:flex;gap:8px;">
                        <button type="submit" class="mcnc-auth-btn">GENERATE LINK</button>
                        <button type="button" id="mcnc-inv-cancel" class="mcnc-hud-btn" style="padding:10px 14px;">CLOSE</button>
                    </div>
                    <input id="mcnc-inv-output" class="mcnc-auth-input" type="text" readonly style="margin-top:12px;display:none;color:#10b981;border-color:#10b981;" />
                    <div id="mcnc-inv-msg" class="mcnc-auth-err"></div>
                </form>
            </div>
        `;
        document.body.appendChild(modal);

        document.getElementById('mcnc-inv-cancel').addEventListener('click', () => {
            modal.style.display = 'none';
        });

        document.getElementById('mcnc-invite-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const msgEl = document.getElementById('mcnc-inv-msg');
            const outEl = document.getElementById('mcnc-inv-output');
            msgEl.textContent = '';
            const tenantName = document.getElementById('mcnc-inv-name').value.trim();
            const email = document.getElementById('mcnc-inv-email').value.trim();
            const quotaMb = Number(document.getElementById('mcnc-inv-quota').value || 500);

            try {
                const res = await window.fetch(API_BASE + '/api/auth/invite', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ tenantName, email, quotaMb })
                });
                const data = await res.json();
                if (!res.ok || !data.success) {
                    msgEl.textContent = data.error || 'Failed to generate invite.';
                    return;
                }
                const inviteUrl = window.location.origin + '/?invite=' + encodeURIComponent(data.inviteToken);
                outEl.style.display = 'block';
                outEl.value = inviteUrl;
                outEl.select();
                if (navigator.clipboard) navigator.clipboard.writeText(inviteUrl).catch(() => {});
                msgEl.style.color = '#10b981';
                msgEl.textContent = 'Invite link generated & copied to clipboard!';
            } catch (err) {
                msgEl.textContent = 'Error: ' + err.message;
            }
        });
    }

    function renderInviteClaimOverlay(inviteToken) {
        clearSession();
        const overlay = document.createElement('div');
        overlay.id = 'mcnc-login-overlay';
        overlay.innerHTML = `
            <div class="mcnc-auth-card">
                <div class="mcnc-auth-title">WELCOME TO MCNC // CLAIM PROFILE</div>
                <div class="mcnc-auth-sub">Set up your private workspace credentials to begin.</div>
                <form id="mcnc-claim-form">
                    <label class="mcnc-auth-label" for="mcnc-claim-user">Choose Your Username</label>
                    <input id="mcnc-claim-user" class="mcnc-auth-input" type="text" placeholder="Adine" required />
                    <label class="mcnc-auth-label" for="mcnc-claim-pass">Create Password (Min 8 Chars)</label>
                    <input id="mcnc-claim-pass" class="mcnc-auth-input" type="password" minlength="8" required />
                    <label class="mcnc-auth-label" for="mcnc-claim-ai">Name Your Lead AI Chief (Optional)</label>
                    <input id="mcnc-claim-ai" class="mcnc-auth-input" type="text" placeholder="e.g. Monty, Nova, Atlas" />
                    <button type="submit" class="mcnc-auth-btn">ACTIVATE MY WORKSPACE</button>
                    <div id="mcnc-claim-err" class="mcnc-auth-err"></div>
                </form>
            </div>
        `;
        document.body.appendChild(overlay);

        document.getElementById('mcnc-claim-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const errEl = document.getElementById('mcnc-claim-err');
            errEl.textContent = '';
            const username = document.getElementById('mcnc-claim-user').value.trim();
            const password = document.getElementById('mcnc-claim-pass').value;
            const customDirectorName = document.getElementById('mcnc-claim-ai').value.trim();

            try {
                const res = await originalFetch(API_BASE + '/api/auth/accept-invite', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ inviteToken, username, password, customDirectorName })
                });
                const data = await res.json();
                if (!res.ok || !data.success) {
                    errEl.textContent = data.error || 'Could not claim invite.';
                    return;
                }
                window.history.replaceState({}, document.title, '/');
                sessionStorage.setItem(TOKEN_KEY, data.token);
                sessionStorage.setItem(USER_KEY, JSON.stringify(data.user));
                sessionStorage.setItem(TARGET_TENANT_KEY, data.user.tenantId);
                overlay.remove();
                applyAuthenticatedState(data.user);
            } catch (err) {
                errEl.textContent = 'Error: ' + err.message;
            }
        });
    }

    async function bootAuthGate() {
        injectStyles();
        const params = new URLSearchParams(window.location.search);
        const inviteParam = params.get('invite');
        if (inviteParam) { renderInviteClaimOverlay(inviteParam); return; }
        injectStyles();
        const token = getToken();
        const user = getUser();
        if (!token || !user) {
            renderLoginOverlay();
            return;
        }
        try {
            const res = await window.fetch(API_BASE + '/api/auth/me');
            if (!res.ok) {
                clearSession();
                renderLoginOverlay('Session expired. Re-authenticate.');
                return;
            }
            applyAuthenticatedState(user);
        } catch (_) {
            renderLoginOverlay();
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', bootAuthGate);
    } else {
        bootAuthGate();
    }
})();








