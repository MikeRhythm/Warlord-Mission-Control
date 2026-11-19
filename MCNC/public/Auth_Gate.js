(function () {
    'use strict';

    const TOKEN_KEY = 'mcnc_jwt_token';
    const USER_KEY = 'mcnc_user_profile';
    const TARGET_TENANT_KEY = 'mcnc_target_tenant';

    // Collaborator allowed routes (blocks EXEC, WAR ROOM, MEMORY, PAPERCLIP, TOKENS, DOCS, etc.)
    const COLLABORATOR_ALLOWED_HREFS = ['/projects', '/taskboard', '/calendar', '/galaxy', '/review'];

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

    // Intercept all /api/ fetch calls to inject Bearer token & X-Target-Tenant automatically
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
                background: rgba(13, 15, 18, 0.92);
                backdrop-filter: blur(12px);
                border: 1px solid #1f242d;
                border-radius: 6px;
                box-shadow: 0 20px 50px rgba(0,0,0,0.85);
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
            .mcnc-hud-controls {
                display: flex; align-items: center; gap: 8px;
            }
            .mcnc-hud-badge {
                padding: 3px 8px; border-radius: 3px; font-size: 10px;
                font-weight: 700; letter-spacing: 0.6px; text-transform: uppercase;
                background: #14171c; color: #C5BD9F; border: 1px solid #1f242d;
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
            #mcnc-pwd-modal {
                position: fixed; inset: 0; z-index: 99998;
                background: rgba(8, 10, 12, 0.85);
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
                    sessionStorage.setItem(TOKEN_KEY, data.token);
                    sessionStorage.setItem(USER_KEY, JSON.stringify(data.user));
                    sessionStorage.setItem(TARGET_TENANT_KEY, data.user.tenantId);
                    overlay.remove();
                    applyAuthenticatedState(data.user);
                } catch (err) {
                    errEl.textContent = 'Connection error: ' + err.message;
                }
            });
        }
        if (errorMsg) {
            const errEl = document.getElementById('mcnc-login-err');
            if (errEl) errEl.textContent = errorMsg;
        }
    }

    function applyAuthenticatedState(user) {
        // 1. Enforce Role-Based Tab Visibility
        const navTabs = document.querySelectorAll('.mcnc-top-nav .nav-tab');
        if (user.role !== 'EXEC_ADMIN') {
            navTabs.forEach((tab) => {
                const href = tab.getAttribute('href') || '';
                if (!COLLABORATOR_ALLOWED_HREFS.includes(href)) {
                    tab.style.display = 'none';
                }
            });
            // Redirect collaborator if currently on a restricted route
            const currentPath = window.location.pathname;
            if (currentPath === '/' || !COLLABORATOR_ALLOWED_HREFS.includes(currentPath)) {
                window.location.replace('/galaxy');
                return;
            }
        }

        // 2. Render Top-Bar Operator HUD, Admin Switcher & Password Rotation
        const topBar = document.querySelector('.mcnc-top-bar');
        if (!topBar) return;

        let hud = document.getElementById('mcnc-hud-controls');
        if (!hud) {
            hud = document.createElement('div');
            hud.id = 'mcnc-hud-controls';
            hud.className = 'mcnc-hud-controls';
            topBar.appendChild(hud);
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
            <span class="mcnc-hud-badge ${isOverride ? 'admin-override' : ''}">
                ${isOverride ? 'ADMIN OVERRIDE: ' + activeTenant : 'OPERATOR: ' + user.username}
            </span>
            ${switcherHtml}
            <button id="mcnc-pwd-open-btn" class="mcnc-hud-btn" type="button">PASSWORD</button>
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

        ensurePasswordModal();
        document.getElementById('mcnc-pwd-open-btn').addEventListener('click', () => {
            document.getElementById('mcnc-pwd-modal').style.display = 'flex';
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
