const fs = require('fs');
const path = 'C:/Warlord_Inc/Warlord_WASP/MCNC_V2/src/components/Tab12Review.jsx';

let code = fs.readFileSync(path, 'utf8');

// Target the success block where the event is dispatched
const oldDispatch = "window.dispatchEvent(new CustomEvent('MCNC_PUSH_TO_DOCS'));";
const newDispatch = `window.dispatchEvent(new CustomEvent('MCNC_PUSH_TO_DOCS'));
        // Trigger immediate navigation jump to 13 DOCS
        window.dispatchEvent(new CustomEvent('MCNC_SWITCH_TAB', { detail: { tab: '13 DOCS', tabId: 13, id: '13' } }));
        if (typeof window.setActiveTab === 'function') window.setActiveTab('13 DOCS');`;

if (code.includes(oldDispatch)) {
  code = code.replace(oldDispatch, newDispatch);
  fs.writeFileSync(path, code, 'utf8');
  console.log('[SUCCESS] Tab12Review updated: Auto-jump event dispatched on push.');
} else {
  console.log('[INFO] Target dispatch block not matched.');
}
