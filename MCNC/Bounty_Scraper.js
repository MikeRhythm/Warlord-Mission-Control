const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const path = require('path');
const fs = require('fs');

async function scrapeBounties() {
    const sessionPath = path.resolve('C:\\Warlord_Inc\\Warlord_WASP\\MCNC\\Data\\Chrome_Session');
    const debugFile = path.resolve('C:\\Warlord_Inc\\Warlord_WASP\\MCNC\\Data\\Projects\\BOUNTY_ENGINE\\last_scrape_debug.txt');

    const browser = await puppeteer.launch({ 
        headless: 'new',
        userDataDir: sessionPath,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-blink-features=AutomationControlled',
            '--window-size=1920,1080'
        ]
    });

    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36');
    await page.setViewport({ width: 1920, height: 1080 });

    let rawData = "";

    // 1. WHOP WORKFORCE
    try {
        await page.goto('https://whop.com/workforce/', { waitUntil: 'domcontentloaded', timeout: 30000 });
        await page.waitForFunction(() => document.body.innerText.includes('$'), { timeout: 10000 }).catch(() => {});
        await new Promise(r => setTimeout(r, 3000));
        const whopUrl = page.url();
        const whopText = await page.evaluate(() => document.body.innerText);
        rawData += `[WHOP URL]: ${whopUrl}\n[WHOP WORKFORCE BOUNTIES]:\n${whopText.replace(/\n{2,}/g, '\n').substring(0, 12000)}\n\n`;
    } catch (e) {
        rawData += `[WHOP ERROR]: ${e.message}\n\n`;
    }

    // 2. VYRO CAMPAIGNS
    try {
        await page.goto('https://app.vyro.com/campaigns', { waitUntil: 'domcontentloaded', timeout: 30000 });
        await page.waitForFunction(() => document.body.innerText.includes('PER 1M VIEWS') || document.body.innerText.includes('$'), { timeout: 10000 }).catch(() => {});
        await new Promise(r => setTimeout(r, 3000));
        const vyroUrl = page.url();
        const vyroText = await page.evaluate(() => document.body.innerText);
        rawData += `[VYRO URL]: ${vyroUrl}\n[VYRO ACTIVE CAMPAIGNS]:\n${vyroText.replace(/\n{2,}/g, '\n').substring(0, 12000)}\n`;
    } catch (e) {
        rawData += `[VYRO ERROR]: ${e.message}\n`;
    }

    await browser.close();
    fs.mkdirSync(path.dirname(debugFile), { recursive: true });
    fs.writeFileSync(debugFile, rawData, 'utf8');
    return rawData;
}

module.exports = { scrapeBounties };
