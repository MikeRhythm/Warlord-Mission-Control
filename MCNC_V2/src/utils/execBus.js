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