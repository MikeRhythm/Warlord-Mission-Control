'use strict';

const crypto = require('crypto');
const path = require('path');
const fs = require('fs');

/**
 * SESSION ISOLATION GUARD
 * Enforces unique sessionStorage UUID fingerprinting per Chrome worker clone
 * and executes hard cookie/localStorage wipe on clone initialization before
 * any browser automation script execution.
 * 
 * CANONICAL LOCATION: C:\Warlord_Inc\Warlord_WASP\MCNC\Data\Projects\Bounty_Engine\session_isolation_guard.js
 * AUTHORITY: ROXY // UI/UX & SESSION MANAGEMENT
 * BOUND TOOL: browser_automation
 */

const CHROME_SESSION_MASTER = path.resolve('C:\\Warlord_Inc\\Warlord_WASP\\MCNC\\Data\\Chrome_Session');
const WORKER_CLONES_ROOT = path.resolve('C:\\Warlord_Inc\\Warlord_WASP\\MCNC\\Data\\Chrome_Worker_Clones');

if (!fs.existsSync(WORKER_CLONES_ROOT)) {
    fs.mkdirSync(WORKER_CLONES_ROOT, { recursive: true });
}

/**
 * Generate cryptographically unique session UUID for worker clone
 */
function generateSessionUUID() {
    return `WORKER_${crypto.randomBytes(16).toString('hex').toUpperCase()}`;
}

/**
 * Clone Chrome_Session_Master to isolated worker directory with unique UUID
 * @param {string} workerId - Optional custom worker identifier
 * @returns {Object} - { workerPath, sessionUUID, timestamp }
 */
function cloneIsolatedSession(workerId = null) {
    const sessionUUID = generateSessionUUID();
    const timestamp = Date.now();
    const workerDirName = workerId || `worker_${timestamp}_${sessionUUID.slice(-8)}`;
    const workerPath = path.join(WORKER_CLONES_ROOT, workerDirName);

    if (fs.existsSync(workerPath)) {
        fs.rmSync(workerPath, { recursive: true, force: true });
    }

    copyDirectoryRecursive(CHROME_SESSION_MASTER, workerPath);

    const isolationManifest = {
        sessionUUID,
        workerId: workerDirName,
        clonedFrom: CHROME_SESSION_MASTER,
        createdAt: new Date(timestamp).toISOString(),
        isolationStatus: 'ACTIVE'
    };

    fs.writeFileSync(
        path.join(workerPath, 'session_isolation_manifest.json'),
        JSON.stringify(isolationManifest, null, 2),
        'utf8'
    );

    return {
        workerPath,
        sessionUUID,
        workerId: workerDirName,
        timestamp
    };
}

/**
 * Recursive directory copy utility
 */
function copyDirectoryRecursive(src, dest) {
    if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
    }

    const entries = fs.readdirSync(src, { withFileTypes: true });
    for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);

        if (entry.isDirectory()) {
            copyDirectoryRecursive(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
}

/**
 * Execute hard wipe of cookies, localStorage, and sessionStorage
 * Injects cleanup script into Puppeteer page context before automation execution
 * @param {Object} page - Puppeteer page instance
 * @param {string} sessionUUID - Unique session identifier
 */
async function executeHardStorageWipe(page, sessionUUID) {
    await page.evaluateOnNewDocument((uuid) => {
        // Hard wipe localStorage
        if (window.localStorage) {
            window.localStorage.clear();
        }

        // Hard wipe sessionStorage and inject unique UUID fingerprint
        if (window.sessionStorage) {
            window.sessionStorage.clear();
            window.sessionStorage.setItem('MCNC_WORKER_UUID', uuid);
            window.sessionStorage.setItem('MCNC_ISOLATION_TIMESTAMP', Date.now().toString());
        }

        // Wipe all cookies via document.cookie manipulation
        document.cookie.split(';').forEach(cookie => {
            const eqPos = cookie.indexOf('=');
            const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
            document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
        });

        // Inject isolation guard flag into window object
        window.__MCNC_SESSION_ISOLATED__ = true;
        window.__MCNC_WORKER_UUID__ = uuid;
    }, sessionUUID);

    // Additional Puppeteer-level cookie wipe
    const client = await page.target().createCDPSession();
    await client.send('Network.clearBrowserCookies');
    await client.send('Network.clearBrowserCache');
}

/**
 * Validate session isolation integrity
 * @param {Object} page - Puppeteer page instance
 * @returns {Object} - { isolated, sessionUUID, timestamp }
 */
async function validateSessionIsolation(page) {
    const isolationState = await page.evaluate(() => {
        return {
            isolated: window.__MCNC_SESSION_ISOLATED__ === true,
            sessionUUID: window.sessionStorage.getItem('MCNC_WORKER_UUID'),
            timestamp: window.sessionStorage.getItem('MCNC_ISOLATION_TIMESTAMP'),
            localStorageEmpty: window.localStorage.length === 0,
            cookieCount: document.cookie.split(';').filter(c => c.trim()).length
        };
    });

    return isolationState;
}

/**
 * Purge worker clone directory after automation completion
 * @param {string} workerPath - Full path to worker clone directory
 */
function purgeWorkerClone(workerPath) {
    if (fs.existsSync(workerPath)) {
        try {
            fs.rmSync(workerPath, { recursive: true, force: true });
            return { success: true, purgedPath: workerPath };
        } catch (err) {
            return { success: false, error: err.message };
        }
    }
    return { success: false, error: 'Worker path does not exist' };
}

/**
 * List all active worker clones
 * @returns {Array} - Array of worker clone metadata objects
 */
function listActiveWorkerClones() {
    if (!fs.existsSync(WORKER_CLONES_ROOT)) {
        return [];
    }

    const workers = fs.readdirSync(WORKER_CLONES_ROOT, { withFileTypes: true })
        .filter(d => d.isDirectory())
        .map(d => {
            const manifestPath = path.join(WORKER_CLONES_ROOT, d.name, 'session_isolation_manifest.json');
            if (fs.existsSync(manifestPath)) {
                try {
                    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
                    return {
                        workerId: d.name,
                        sessionUUID: manifest.sessionUUID,
                        createdAt: manifest.createdAt,
                        path: path.join(WORKER_CLONES_ROOT, d.name)
                    };
                } catch (e) {
                    return null;
                }
            }
            return null;
        })
        .filter(Boolean);

    return workers;
}

module.exports = {
    cloneIsolatedSession,
    executeHardStorageWipe,
    validateSessionIsolation,
    purgeWorkerClone,
    listActiveWorkerClones,
    CHROME_SESSION_MASTER,
    WORKER_CLONES_ROOT
};