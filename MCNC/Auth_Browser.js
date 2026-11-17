const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
    const sessionPath = path.resolve('C:\\Warlord_Inc\\Warlord_WASP\\MCNC\\Data\\Chrome_Session');
    console.log("[WARLORD AUTH] Opening browser. Log into Whop and Vyro with mcnc.bounty.clipping@gmail.com.");
    console.log("[WARLORD AUTH] Close the browser window manually when finished to save the session.");
    
    const browser = await puppeteer.launch({ 
        headless: false, 
        userDataDir: sessionPath,
        defaultViewport: null 
    });
})();
