(function () {
    'use strict';

    const TOKEN_KEY = 'mcnc_jwt_token';
    const USER_KEY = 'mcnc_user_profile';
    const TARGET_TENANT_KEY = 'mcnc_target_tenant';

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

    function isGuestRole(user) {
        return Boolean(user && user.role === 'GUEST_OBSERVER');
    }

    function buildGenericInviteText(name) {
        const clean = String(name || 'there').trim() || 'there';
        return `Hi ${clean},\n\nYou've been invited to explore the Rhythm Holdings Mission Control Nerve Center (MCNC).\n\nYour Guest Observer pass lets you tour all 14 stations in Read-Only mode, open the OVERVIEW and TAB BRIEF guides on any screen, and chat directly with Chief of Staff Monty on Tab 01.`;
    }

    // Intercept /api/ fetch calls to inject Bearer token & X-Target-Tenant
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
                background: radial-gradient(circle at top, #121722 0%, #080a0c 70%);
                display: flex; align-items: center; justify-content: center;
                font-family: 'JetBrains Mono', 'Consolas', monospace;
            }
            .mcnc-auth-card {
                width: 100%; max-width: 440px; padding: 26px;
                background: rgba(13, 15, 18, 0.97);
                backdrop-filter: blur(12px);
                border: 1px solid #263042;
                border-radius: 6px;
                box-shadow: 0 24px 60px rgba(0,0,0,0.9), inset 0 1px 0 rgba(255,215,0,0.12);
            }
            .mcnc-auth-title {
                color: #ffb800; font-size: 13px; font-weight: 800;
                letter-spacing: 1.2px; margin-bottom: 6px; text-transform: uppercase;
            }
            .mcnc-auth-sub {
                color: #94A3B8; font-size: 11px; margin-bottom: 16px; line-height: 1.45;
            }
            .mcnc-auth-label {
                display: block; color: #C5BD9F; font-size: 10px; font-weight: 700;
                margin-bottom: 5px; text-transform: uppercase; letter-spacing: 0.7px;
            }
            .mcnc-auth-input, .mcnc-auth-textarea {
                width: 100%; box-sizing: border-box; padding: 9px 11px;
                margin-bottom: 12px; background: #080a0c; color: #F8FAFC;
                border: 1px solid #253042; border-radius: 4px;
                font-family: inherit; font-size: 12px; outline: none;
            }
            .mcnc-auth-textarea {
                min-height: 105px; resize: vertical; line-height: 1.45;
                font-family: 'Inter', 'Segoe UI', sans-serif;
            }
            .mcnc-auth-input:focus, .mcnc-auth-textarea:focus {
                border-color: #DAA520; box-shadow: 0 0 0 1px rgba(218,165,32,0.35);
            }
            .mcnc-auth-btn {
                width: 100%; padding: 11px;
                background: linear-gradient(180deg, #F7D154 0%, #DAA520 100%);
                color: #080a0c; border: none; border-radius: 4px; font-family: inherit;
                font-size: 11px; font-weight: 900; letter-spacing: 1px;
                cursor: pointer; text-transform: uppercase;
                box-shadow: 0 4px 12px rgba(218,165,32,0.28);
            }
            .mcnc-auth-btn:hover { filter: brightness(1.06); }
            .mcnc-mode-tabs {
                display: flex; gap: 6px; margin-bottom: 10px;
            }
            .mcnc-mode-tab {
                flex: 1; padding: 7px 10px; border-radius: 4px;
                font-family: inherit; font-size: 10px; font-weight: 800;
                letter-spacing: 0.8px; cursor: pointer; text-transform: uppercase;
                background: #0d1016; color: #94A3B8; border: 1px solid #253042;
                transition: all 0.15s ease;
            }
            .mcnc-mode-tab.active {
                background: rgba(218, 165, 32, 0.18);
                color: #ffb800; border-color: #DAA520;
                box-shadow: 0 0 10px rgba(218,165,32,0.2);
            }
            .mcnc-auth-link-row {
                display: flex; justify-content: space-between; align-items: center;
                margin-top: 12px; padding-top: 10px; border-top: 1px solid #1a212e;
            }
            .mcnc-link-btn {
                background: none; border: none; padding: 0;
                color: #DAA520; font-family: inherit; font-size: 10px;
                font-weight: 700; cursor: pointer; text-decoration: underline;
            }
            .mcnc-link-btn:hover { color: #FFE082; }
            .mcnc-auth-err {
                color: #ef4444; font-size: 11px; margin-top: 10px; min-height: 15px; line-height: 1.4;
            }
            .mcnc-hud-controls {
                display: flex; align-items: center; gap: 6px;
            }
            .mcnc-hud-badge {
                padding: 3px 8px; border-radius: 3px; font-size: 10px;
                font-weight: 700; letter-spacing: 0.6px; text-transform: uppercase;
                background: #14171c; color: #C5BD9F; border: 1px solid #1f242d;
            }
            .mcnc-hud-badge.guest-mode {
                background: rgba(218, 165, 32, 0.16);
                color: #FFE082; border-color: #DAA520;
            }
            .mcnc-hud-badge.admin-override {
                background: rgba(56, 189, 248, 0.14);
                color: #38bdf8; border-color: #38bdf8;
            }
            .mcnc-hud-select, .mcnc-hud-btn {
                background: #14171c; color: #C5BD9F; border: 1px solid #1f242d;
                border-radius: 3px; padding: 3px 8px; font-family: inherit;
                font-size: 10px; font-weight: 700; cursor: pointer; text-transform: uppercase;
            }
            .mcnc-hud-select:focus, .mcnc-hud-btn:hover {
                border-color: #ffb800; color: #ffb800;
            }
            #mcnc-pwd-modal, #mcnc-invite-modal {
                position: fixed; inset: 0; z-index: 99998;
                background: rgba(8, 10, 12, 0.88);
                display: none; align-items: center; justify-content: center;
                font-family: 'JetBrains Mono', 'Consolas', monospace;
            }
            #mcnc-guest-toast {
                position: fixed; bottom: 16px; right: 16px; z-index: 99997;
                background: linear-gradient(180deg, #241c0d 0%, #110d06 100%);
                border: 1px solid #DAA520; color: #FFE082;
                padding: 10px 14px; border-radius: 4px; font-size: 11px;
                font-family: 'JetBrains Mono', monospace;
                box-shadow: 0 10px 25px rgba(0,0,0,0.85);
                display: none; max-width: 380px;
            }
        `;
        document.head.appendChild(style);
    }

    function showGuestToast(msg) {
        let toast = document.getElementById('mcnc-guest-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'mcnc-guest-toast';
            document.body.appendChild(toast);
        }
        toast.textContent = msg;
        toast.style.display = 'block';
        clearTimeout(toast._timer);
        toast._timer = setTimeout(() => { toast.style.display = 'none'; }, 3200);
    }

    function renderLoginOverlay(errorMsg = '') {
        let overlay = document.getElementById('mcnc-login-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'mcnc-login-overlay';
            overlay.innerHTML = `
                <div class="mcnc-auth-card">
                    <div id="mcnc-auth-view-login">
                        <div class="mcnc-auth-title">MCNC // SOVEREIGN ACCESS GATE</div>
                        <div class="mcnc-auth-sub">Sign in with your Operator credentials (RoboForm &amp; Browser Autofill compatible) or enter as a Read-Only Guest.</div>
                        <form id="mcnc-login-form" action="/api/auth/login" method="post" autocomplete="on">
                            <label class="mcnc-auth-label" for="mcnc-user-in">Operator Username</label>
                            <input id="mcnc-user-in" name="username" class="mcnc-auth-input" type="text" autocomplete="username" placeholder="Mike" required />
                            <label class="mcnc-auth-label" for="mcnc-pass-in">Access Key / Password</label>
                            <input id="mcnc-pass-in" name="password" class="mcnc-auth-input" type="password" autocomplete="current-password" placeholder="••••••••" required />
                            <button type="submit" class="mcnc-auth-btn">AUTHENTICATE</button>
                            <div id="mcnc-login-err" class="mcnc-auth-err"></div>
                        </form>
                        <div class="mcnc-auth-link-row">
                            <button type="button" id="mcnc-forgot-open" class="mcnc-link-btn">FORGOT PASSWORD?</button>
                            <button type="button" id="mcnc-guest-enter" class="mcnc-link-btn">GUEST PREVIEW (READ + MONTY)</button>
                        </div>
                    </div>

                    <div id="mcnc-auth-view-forgot" style="display:none;">
                        <div class="mcnc-auth-title">MCNC // PASSWORD RECOVERY</div>
                        <div class="mcnc-auth-sub">Step 1: Request a 6-digit recovery code (logged to Base 1 terminal). Step 2: Enter code &amp; new password.</div>
                        <form id="mcnc-forgot-form">
                            <label class="mcnc-auth-label" for="mcnc-rec-user">Operator Username</label>
                            <div style="display:flex; gap:6px; margin-bottom:12px;">
                                <input id="mcnc-rec-user" class="mcnc-auth-input" style="margin-bottom:0;" type="text" placeholder="Mike" required />
                                <button type="button" id="mcnc-send-code-btn" class="mcnc-hud-btn" style="padding:0 12px; border-color:#DAA520; color:#DAA520;">SEND CODE</button>
                            </div>
                            <label class="mcnc-auth-label" for="mcnc-rec-code">6-Digit Recovery Code</label>
                            <input id="mcnc-rec-code" class="mcnc-auth-input" type="text" maxlength="6" placeholder="123456" required />
                            <label class="mcnc-auth-label" for="mcnc-rec-newpass">New Password (Min 8 Chars)</label>
                            <input id="mcnc-rec-newpass" class="mcnc-auth-input" type="password" minlength="8" autocomplete="new-password" required />
                            <button type="submit" class="mcnc-auth-btn">RESET &amp; SAVE PASSWORD</button>
                            <div id="mcnc-forgot-msg" class="mcnc-auth-err"></div>
                        </form>
                        <div class="mcnc-auth-link-row">
                            <button type="button" id="mcnc-forgot-back" class="mcnc-link-btn">&larr; BACK TO LOGIN</button>
                        </div>
                    </div>
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
                    const res = await originalFetch('/api/auth/login', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ username, password })
                    });
                    const data = await res.json();
                    if (!res.ok || !data.success) {
                        errEl.textContent = data.error || 'Authentication denied.';
                        return;
                    }
                    if (window.PasswordCredential && navigator.credentials) {
                        try {
                            const cred = new window.PasswordCredential({ id: username, password: password, name: username });
                            await navigator.credentials.store(cred);
                        } catch (_) {}
                    }
                    sessionStorage.setItem(TOKEN_KEY, data.token);
                    sessionStorage.setItem(USER_KEY, JSON.stringify(data.user));
                    sessionStorage.setItem(TARGET_TENANT_KEY, data.user.tenantId);
                    overlay.remove();
                    applyAuthenticatedState(data.user);
                } catch (err) {
                    errEl.textContent = 'Connection error: ' + err.message;
                }
            });

            document.getElementById('mcnc-forgot-open').addEventListener('click', () => {
                document.getElementById('mcnc-auth-view-login').style.display = 'none';
                document.getElementById('mcnc-auth-view-forgot').style.display = 'block';
                const u = document.getElementById('mcnc-user-in').value.trim();
                if (u) document.getElementById('mcnc-rec-user').value = u;
            });

            document.getElementById('mcnc-forgot-back').addEventListener('click', () => {
                document.getElementById('mcnc-auth-view-forgot').style.display = 'none';
                document.getElementById('mcnc-auth-view-login').style.display = 'block';
            });

            document.getElementById('mcnc-send-code-btn').addEventListener('click', async () => {
                const msgEl = document.getElementById('mcnc-forgot-msg');
                msgEl.style.color = '#ef4444';
                const username = document.getElementById('mcnc-rec-user').value.trim();
                if (!username) {
                    msgEl.textContent = 'Enter your username first.';
                    return;
                }
                try {
                    const res = await originalFetch('/api/auth/forgot-password', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ username })
                    });
                    const data = await res.json();
                    if (!res.ok || !data.success) {
                        msgEl.textContent = data.error || 'Could not generate recovery code.';
                        return;
                    }
                    msgEl.style.color = '#10b981';
                    msgEl.textContent = data.message;
                } catch (err) {
                    msgEl.textContent = 'Error: ' + err.message;
                }
            });

            document.getElementById('mcnc-forgot-form').addEventListener('submit', async (e) => {
                e.preventDefault();
                const msgEl = document.getElementById('mcnc-forgot-msg');
                msgEl.style.color = '#ef4444';
                const username = document.getElementById('mcnc-rec-user').value.trim();
                const code = document.getElementById('mcnc-rec-code').value.trim();
                const newPassword = document.getElementById('mcnc-rec-newpass').value;
                try {
                    const res = await originalFetch('/api/auth/reset-password', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ username, code, newPassword })
                    });
                    const data = await res.json();
                    if (!res.ok || !data.success) {
                        msgEl.textContent = data.error || 'Reset failed.';
                        return;
                    }
                    msgEl.style.color = '#10b981';
                    msgEl.textContent = data.message;
                    setTimeout(() => {
                        document.getElementById('mcnc-forgot-back').click();
                        document.getElementById('mcnc-user-in').value = username;
                        document.getElementById('mcnc-pass-in').value = newPassword;
                    }, 1100);
                } catch (err) {
                    msgEl.textContent = 'Error: ' + err.message;
                }
            });

            document.getElementById('mcnc-guest-enter').addEventListener('click', async () => {
                const guestName = window.prompt('Enter your name for Guest Read-Only + Monty Chat access:', 'Egmond');
                if (guestName === null) return;
                await startGuestSession({ guestName });
                overlay.remove();
            });
        }
        if (errorMsg) {
            const errEl = document.getElementById('mcnc-login-err');
            if (errEl) errEl.textContent = errorMsg;
        }
    }

    async function startGuestSession(payload) {
        const res = await originalFetch('/api/auth/guest-login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (res.ok && data.success) {
            sessionStorage.setItem(TOKEN_KEY, data.token);
            sessionStorage.setItem(USER_KEY, JSON.stringify(data.user));
            sessionStorage.setItem(TARGET_TENANT_KEY, data.user.tenantId);
            applyAuthenticatedState(data.user);
        } else {
            renderLoginOverlay(data.error || 'Guest pass invalid or expired.');
        }
    }

    function attachGuestClickGuard() {
        if (window.__mcncGuestGuardAttached) return;
        window.__mcncGuestGuardAttached = true;

        document.addEventListener('click', (e) => {
            const user = getUser();
            if (!isGuestRole(user)) return;

            const btn = e.target.closest('button');
            if (!btn) return;

            if (btn.closest('nav') || btn.closest('.mcnc-hud-controls')) return;
            const txt = (btn.innerText || btn.title || '').toUpperCase();
            const safeKeywords = ['TAB BRIEF', 'OVERVIEW', 'GOT IT', 'PREV', 'NEXT', 'ESC', 'ACKNOWLEDGE', 'BRIEF', 'SEND', 'ASK MONTY', 'CLEAR', 'COPY', '01 //', '02 //', '03 //', '04 //', '05 //', 'SETUP GUIDE'];
            if (safeKeywords.some((kw) => txt.includes(kw))) return;

            const restrictedKeywords = ['DISPATCH', 'AUTHORIZE', 'PUSH TO WAR ROOM', 'CREATE PROMPT', 'GO-LIVE', 'STATUS:', 'DELETE', 'SAVE', 'ADD', 'LAUNCH', 'EXECUTE', 'RUN', 'SYNC', 'PURGE', 'APPLY'];
            if (restrictedKeywords.some((kw) => txt.includes(kw))) {
                e.preventDefault();
                e.stopPropagation();
                showGuestToast('READ-ONLY GUEST MODE: Chat with Monty on Tab 01 or sign up at rhythmtradingco.com to unlock execution.');
            }
        }, true);
    }

    function applyAuthenticatedState(user) {
        window.mcncCurrentUser = user;
        window.dispatchEvent(new CustomEvent('mcnc:auth-ready', { detail: { user } }));

        if (isGuestRole(user)) {
            attachGuestClickGuard();
        }

        const headerRight = document.querySelector('.system-status') || document.querySelector('.mcnc-header');
        if (!headerRight) return;

        let hud = document.getElementById('mcnc-hud-controls');
        if (!hud) {
            hud = document.createElement('div');
            hud.id = 'mcnc-hud-controls';
            hud.className = 'mcnc-hud-controls';
            headerRight.prepend(hud);
        }

        const guestMode = isGuestRole(user);
        const activeTenant = getTargetTenant();
        const isOverride = user.role === 'EXEC_ADMIN' && activeTenant !== user.tenantId;

        let switcherHtml = '';
        if (user.role === 'EXEC_ADMIN') {
            const options = (user.availableTenants || ['Mike', 'Adine', 'Claire', 'Egmond'])
                .map((t) => `<option value="${t}" ${t === activeTenant ? 'selected' : ''}>VIEW: ${t.toUpperCase()}</option>`)
                .join('');
            switcherHtml = `<select id="mcnc-tenant-switcher" class="mcnc-hud-select" title="Switch Active Tenant Workspace">${options}</select>`;
        }

        hud.innerHTML = `
            <span class="mcnc-hud-badge ${guestMode ? 'guest-mode' : (isOverride ? 'admin-override' : '')}">
                ${guestMode ? 'GUEST (READ + MONTY): ' + user.username : (isOverride ? 'ADMIN OVERRIDE: ' + activeTenant : 'OPERATOR: ' + user.username)}
            </span>
            ${switcherHtml}
            ${user.role === 'EXEC_ADMIN' ? '<button id="mcnc-invite-open-btn" class="mcnc-hud-btn" type="button" style="border-color:#DAA520;color:#ffb800;">+ INVITE</button>' : ''}
            ${!guestMode ? '<button id="mcnc-pwd-open-btn" class="mcnc-hud-btn" type="button">PASSWORD</button>' : ''}
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
            window.location.reload();
        });

        if (user.role === 'EXEC_ADMIN') {
            ensureInviteModal();
            const invBtn = document.getElementById('mcnc-invite-open-btn');
            if (invBtn) invBtn.addEventListener('click', () => {
                const modal = document.getElementById('mcnc-invite-modal');
                const msgBox = document.getElementById('mcnc-inv-message');
                const nameVal = document.getElementById('mcnc-inv-name').value.trim();
                if (!msgBox.value.trim()) {
                    msgBox.value = buildGenericInviteText(nameVal);
                }
                modal.style.display = 'flex';
            });
        }

        if (!guestMode) {
            ensurePasswordModal();
            const pwdBtn = document.getElementById('mcnc-pwd-open-btn');
            if (pwdBtn) pwdBtn.addEventListener('click', () => {
                document.getElementById('mcnc-pwd-modal').style.display = 'flex';
            });
        }
    }

    function ensureInviteModal() {
        if (document.getElementById('mcnc-invite-modal')) return;
        const modal = document.createElement('div');
        modal.id = 'mcnc-invite-modal';
        modal.innerHTML = `
            <div class="mcnc-auth-card" style="max-width:480px;">
                <div class="mcnc-auth-title">+ INVITE CLIENT / PROSPECT TO MCNC</div>
                <div class="mcnc-auth-sub">Enter their email, pick Generic or Personal note, and dispatch a signed Guest Observer or Member invite.</div>
                <form id="mcnc-invite-form">
                    <div style="display:grid; grid-template-columns: 1fr 1.2fr; gap:8px;">
                        <div>
                            <label class="mcnc-auth-label" for="mcnc-inv-name">Visitor Name</label>
                            <input id="mcnc-inv-name" class="mcnc-auth-input" type="text" placeholder="Mike van E" required />
                        </div>
                        <div>
                            <label class="mcnc-auth-label" for="mcnc-inv-email">Email Address</label>
                            <input id="mcnc-inv-email" class="mcnc-auth-input" type="email" placeholder="mike@example.com" required />
                        </div>
                    </div>

                    <label class="mcnc-auth-label" for="mcnc-inv-role">Access Tier</label>
                    <select id="mcnc-inv-role" class="mcnc-auth-input">
                        <option value="GUEST_OBSERVER">GUEST OBSERVER (Read-Only All Tabs + Monty Chat)</option>
                        <option value="COLLABORATOR">FULL COLLABORATOR (Signed-Up Member)</option>
                    </select>

                    <label class="mcnc-auth-label">Invitation Message Mode</label>
                    <div class="mcnc-mode-tabs">
                        <button type="button" id="mcnc-inv-tab-generic" class="mcnc-mode-tab active">GENERIC TEMPLATE</button>
                        <button type="button" id="mcnc-inv-tab-personal" class="mcnc-mode-tab">PERSONAL NOTE</button>
                    </div>

                    <textarea id="mcnc-inv-message" class="mcnc-auth-textarea" placeholder="Type your personal message here..."></textarea>

                    <div style="display:flex; gap:8px;">
                        <button type="submit" id="mcnc-inv-submit-btn" class="mcnc-auth-btn">SEND INVITE &amp; COPY LINK</button>
                        <button type="button" id="mcnc-inv-cancel" class="mcnc-hud-btn" style="padding:10px 14px;">CLOSE</button>
                    </div>

                    <input id="mcnc-inv-link-out" class="mcnc-auth-input" style="margin-top:12px; margin-bottom:0; display:none; color:#10b981; font-size:11px;" type="text" readonly />
                    <div id="mcnc-inv-msg" class="mcnc-auth-err"></div>
                </form>
            </div>
        `;
        document.body.appendChild(modal);

        let currentMode = 'GENERIC';
        const nameInput = document.getElementById('mcnc-inv-name');
        const msgBox = document.getElementById('mcnc-inv-message');
        const btnGeneric = document.getElementById('mcnc-inv-tab-generic');
        const btnPersonal = document.getElementById('mcnc-inv-tab-personal');

        msgBox.value = buildGenericInviteText('');

        nameInput.addEventListener('input', () => {
            if (currentMode === 'GENERIC') {
                msgBox.value = buildGenericInviteText(nameInput.value);
            }
        });

        btnGeneric.addEventListener('click', () => {
            currentMode = 'GENERIC';
            btnGeneric.classList.add('active');
            btnPersonal.classList.remove('active');
            msgBox.value = buildGenericInviteText(nameInput.value);
        });

        btnPersonal.addEventListener('click', () => {
            currentMode = 'PERSONAL';
            btnPersonal.classList.add('active');
            btnGeneric.classList.remove('active');
            const firstName = (nameInput.value.trim().split(/\s+/)[0]) || 'mate';
            msgBox.value = `Hey ${firstName}, how's it? How are you doing?\n\n`;
            msgBox.focus();
            msgBox.setSelectionRange(msgBox.value.length, msgBox.value.length);
        });

        document.getElementById('mcnc-inv-cancel').addEventListener('click', () => {
            modal.style.display = 'none';
        });

        document.getElementById('mcnc-invite-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitBtn = document.getElementById('mcnc-inv-submit-btn');
            const msgEl = document.getElementById('mcnc-inv-msg');
            const outEl = document.getElementById('mcnc-inv-link-out');
            msgEl.style.color = '#ef4444';
            msgEl.textContent = '';
            submitBtn.disabled = true;
            submitBtn.textContent = 'DISPATCHING INVITE...';

            const tenantName = nameInput.value.trim();
            const email = document.getElementById('mcnc-inv-email').value.trim();
            const inviteRole = document.getElementById('mcnc-inv-role').value;
            const customMessage = msgBox.value.trim();

            try {
                const res = await window.fetch('/api/auth/invite', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        tenantName,
                        email,
                        inviteRole,
                        customMessage,
                        originUrl: window.location.origin
                    })
                });
                const data = await res.json();
                if (!res.ok || !data.success) {
                    msgEl.textContent = data.error || 'Failed to generate invite.';
                    return;
                }
                outEl.value = data.inviteUrl;
                outEl.style.display = 'block';
                outEl.select();
                navigator.clipboard.writeText(data.inviteUrl).catch(() => {});

                if (data.emailSent) {
                    msgEl.style.color = '#10b981';
                    msgEl.textContent = `Invite emailed to ${email} and link copied to clipboard!`;
                } else {
                    msgEl.style.color = '#f59e0b';
                    msgEl.textContent = `Link minted & copied to clipboard (SMTP notice: ${data.emailError || 'not sent'}).`;
                }
            } catch (err) {
                msgEl.textContent = 'Error: ' + err.message;
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = 'SEND INVITE & COPY LINK';
            }
        });
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
                    <input id="mcnc-cur-pwd" class="mcnc-auth-input" type="password" autocomplete="current-password" required />
                    <label class="mcnc-auth-label" for="mcnc-new-pwd">New Password</label>
                    <input id="mcnc-new-pwd" class="mcnc-auth-input" type="password" minlength="8" autocomplete="new-password" required />
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
                const res = await window.fetch('/api/auth/change-password', {
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

    async function bootAuthGate() {
        injectStyles();

        const params = new URLSearchParams(window.location.search);
        const guestToken = params.get('guest_token');
        const guestName = params.get('guest');
        if (guestToken || guestName) {
            window.history.replaceState({}, document.title, window.location.pathname);
            await startGuestSession(guestToken ? { guestToken } : { guestName });
            return;
        }

        const token = getToken();
        const user = getUser();
        if (!token || !user) {
            renderLoginOverlay();
            return;
        }
        try {
            const res = await window.fetch('/api/auth/me');
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
