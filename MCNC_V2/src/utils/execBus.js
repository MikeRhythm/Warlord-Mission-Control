// ========================================================
// WARLORD MCNC // GLOBAL TACTICAL EXECUTION INTERCEPTOR
// Automatically tracks active HTTP / daemon sequences app-wide
// ========================================================

let activeOperations = 0;

function notify() {
  const isBusy = activeOperations > 0;
  window.dispatchEvent(new CustomEvent('mcnc-busy-state', {
    detail: { isBusy, count: activeOperations }
  }));
}

export function initGlobalInterceptor() {
  if (typeof window === 'undefined' || window.__MCNC_INTERCEPTOR_ACTIVE) return;
  window.__MCNC_INTERCEPTOR_ACTIVE = true;

  const originalFetch = window.fetch;
  window.fetch = async (...args) => {
    const resource = args[0];
    const url = typeof resource === 'string' ? resource : (resource && resource.url ? resource.url : '');

    // Ignore read-only background polling and telemetry checks so console stays quiet
    const isTelemetryPoll = (
      url.includes('/api/status') ||
      url.includes('/api/cluster/') ||
      url.includes('/api/kaggle/') ||
      url.includes('11434') ||
      url.includes('trycloudflare.com')
    );

    if (isTelemetryPoll) {
      try {
        return await originalFetch(...args);
      } catch {
        // Silently return an empty 204 response so unhandled background checks never flood the console
        return new Response(JSON.stringify({ active: false, status: 'STANDBY' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    activeOperations++;
    notify();
    try {
      return await originalFetch(...args);
    } finally {
      activeOperations = Math.max(0, activeOperations - 1);
      notify();
    }
  };
}

export function setManualBusyState(isBusy) {
  if (isBusy) activeOperations++;
  else activeOperations = Math.max(0, activeOperations - 1);
  notify();
}